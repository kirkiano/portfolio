"""
Functions that manipulation data for the RPG's space microservice.
"""
from sqlalchemy.orm import Session

from graph import Place, Node, PlaceType
import schemas

###########################################################


def get_place(db: Session, place_id: int):
    return db.query(Place).filter(Place.id == place_id).first()


def get_place_by_name(db: Session, name: str, typ: str):
    return db.query(Place) \
             .filter(Place.name == name, Place.typ == typ) \
             .first()


def get_places(db: Session):
    return db.query(Place).all()


def create_place(db: Session, place: schemas.PlaceCreate):
    db_place = Place(name=place.name, typ=place.typ)
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place

###########################################################


def get_node(db: Session, node_id: int):
    return db.query(Node).filter(Node.id == node_id).first()


def get_nodes(db: Session):
    return db.query(Node).all()


def create_node(db: Session, node: schemas.NodeCreate):
    db_node = Node(description=node.description)
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node
