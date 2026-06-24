from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from .schemas import Unit
from .db import get_db, engine, Base
from . import models

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/units")
def get_all_units(db: Session = Depends(get_db)):
    return db.query(models.UnitModel).all()


@app.get("/units/{unit_id}", response_model=Unit)
def get_unit(unit_id: str, db: Session = Depends(get_db)):
    unit = db.query(models.UnitModel).filter(models.UnitModel.id == unit_id).first()
    if unit is None:
        raise HTTPException(status_code=404, detail=f"Unit '{unit_id}' not found")
    return unit


@app.post("/units", response_model=Unit, status_code=201)
def create_unit(post: Unit, db: Session = Depends(get_db)):
    db_unit = models.UnitModel(**post.model_dump())
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit


@app.delete("/units/{unit_id}", status_code=200)
def delete_unit(unit_id: str, db: Session = Depends(get_db)):
    unit = db.query(models.UnitModel).filter(models.UnitModel.id == unit_id).first()
    if unit is None:
        raise HTTPException(status_code=404, detail=f"Unit '{unit_id}' not found")
    db.delete(unit)
    db.commit()
    return {"deleted": unit_id}


@app.put("/units/{unit_id}", response_model=Unit, status_code=200)
def edit_unit(unit_id: str, updated: Unit, db: Session = Depends(get_db)):
    unit = db.query(models.UnitModel).filter(models.UnitModel.id == unit_id).first()
    if unit is None:
        raise HTTPException(status_code=404, detail=f"Unit '{unit_id}' not found")
    for key, value in updated.model_dump().items():
        setattr(unit, key, value)
    db.commit()
    db.refresh(unit)
    return unit
