// Suite of functions forming an interface to the RPG's location database
// (Postgres), ie, the datastore indicating which character is where.
package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kirkiano/rpg-char-place-service-golang/exn"
)

type PG struct {
	inner *pgxpool.Pool
	ctxt  context.Context
}

func GetPG(s Settings) PG {
	ctxt := context.Background()
	inner, err := pgxpool.New(ctxt, os.Getenv("DATABASE_URL"))
	if err != nil {
		exn.Bail(1, "main", "Unable to create connection pool: %v\n", err)
	}
	defer inner.Close()
	return PG{inner, ctxt}
}

func (s Settings) PostgresURI() string {
	return fmt.Sprintf("postgresql://%s:%s@%s", s.user, s.pw, s.address)
}

func (db PG) AllPids() ([]int32, error) {
	query := "select id from world_place"
	rows, _ := db.inner.Query(db.ctxt, query)
	cids, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (int32, error) {
		var n int32
		err := row.Scan(&n)
		return n, err
	})
	return cids, err
}

func (db PG) CidsAtPid(pid int32) ([]int32, error) {
	query := "select id from world_character where place_id = $1"
	rows, _ := db.inner.Query(db.ctxt, query, pid)
	cids, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (int32, error) {
		var n int32
		err := row.Scan(&n)
		return n, err
	})
	return cids, err
}

func (db PG) PidOfCid(cid int32) (int32, error) {
	if err := db.assert_valid_cid(cid); err != nil {
		return 0, err
	}
	query := "select place_id from world_character where id = $1"
	var pid int32
	if err := db.inner.QueryRow(db.ctxt, query, cid).Scan(&pid); err == nil {
		return pid, nil
	} else {
		return 0, exn.Err{exn.InternalDbError}
	}
}

func (db PG) Move(cid int32, pid int32) error {
	if err := db.assert_valid_cid_and_pid(cid, pid); err != nil {
		return err
	}
	query := "update world_character set place_id = $1 where id = $2"
	if db.inner.QueryRow(db.ctxt, query, cid).Scan(&pid) != nil {
		return exn.Err{exn.InvalidPid}
	}
	return nil
}

///////////////////////////////////////////////////////////

func (db PG) assert_valid_pid(pid int32) error {
	query := "select id from world_place where id = $1"
	var dummy int32
	if db.inner.QueryRow(db.ctxt, query, pid).Scan(&dummy) != nil {
		return exn.Err{exn.InvalidPid}
	}
	return nil
}

func (db PG) assert_valid_cid(cid int32) error {
	query := "select id from world_character where id = $1"
	var dummy int32
	if db.inner.QueryRow(db.ctxt, query, cid).Scan(&dummy) != nil {
		return exn.Err{exn.InvalidCid}
	}
	return nil
}

func (db PG) assert_valid_cid_and_pid(cid int32, pid int32) error {
	if err := db.assert_valid_cid(cid); err != nil {
		return err
	}
	if err := db.assert_valid_pid(pid); err != nil {
		return err
	}
	return nil
}
