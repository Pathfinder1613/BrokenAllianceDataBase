from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

from .schemas import Unit, Credentials, Token
from .db import get_db, engine, Base
from . import models
from .auth import verify_password, create_token, SECRET_KEY, ALGORITHM

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        username = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@app.post("/login", response_model=Token)
def login(body: Credentials, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"access_token": create_token(user.username), "token_type": "bearer"}


@app.get("/me")
def me(user: models.User = Depends(get_current_user)):
    return {"username": user.username}


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
