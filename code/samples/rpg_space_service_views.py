"""
Views of the FastAPI microservice serving the RPG's world-spaces.
"""
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from db import SessionLocal
import crud
import schemas
import graph


app = FastAPI()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/place/", response_model=schemas.Place)
def create_place(place: schemas.PlaceCreate, db: Session = Depends(get_db)):
    try:
        _ = graph.PlaceType[place.typ.upper()]
    except LookupError as e:
        raise HTTPException(status_code=400, detail=f'{e}')
    db_place = crud.get_place_by_name(db, name=place.name, typ=place.typ)
    if db_place:
        raise HTTPException(status_code=400, detail='Place already exists')
    return crud.create_place(db=db, place=place)


@app.get("/place/", response_model=list[schemas.Place])
def read_places(db: Session = Depends(get_db)):
    return crud.get_places(db)


@app.get("/place/{place_id}", response_model=schemas.Place)
def read_place(place_id: int, db: Session = Depends(get_db)):
    db_place = crud.get_place(db, place_id=place_id)
    if db_place is None:
        raise HTTPException(status_code=404, detail='Place not found')
    return db_place
