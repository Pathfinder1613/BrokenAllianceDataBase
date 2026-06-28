from fastapi import FastAPI, Response, Request, Cookie, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

from .schemas import Unit, Credentials, Token
from .db import get_db, engine, Base
from . import models
from .auth import verify_password, create_token, SECRET_KEY, ALGORITHM
from dotenv import load_dotenv
import os

Base.metadata.create_all(bind=engine)

load_dotenv()
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if not access_token:
        raise HTTPException(401, "Not authenticated")
    try:
        username = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])["sub"]
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")
    user = db.query(models.User).filter_by(username=username).first()
    if not user:
        raise HTTPException(401, "User not found")
    return user

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@app.post("/login")
def login(body: Credentials, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_token(user.username)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=12 * 3600,  
        path="/",
    )

    return {"ok": True}

@app.get("/me")
def me(user=Depends(get_current_user)):
    return {
        "username": user.username
    }


@app.get("/units")
def get_all_units(db: Session = Depends(get_db), _user=Depends(get_current_user)):
    return db.query(models.UnitModel).all()


@app.get("/units/{unit_id}", response_model=Unit)
def get_unit(unit_id: str, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    unit = db.query(models.UnitModel).filter(models.UnitModel.id == unit_id).first()
    if unit is None:
        raise HTTPException(status_code=404, detail=f"Unit '{unit_id}' not found")
    return unit


@app.post("/units", response_model=Unit, status_code=201)
def create_unit(post: Unit, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    db_unit = models.UnitModel(**post.model_dump())
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit


@app.delete("/units/{unit_id}", status_code=200)
def delete_unit(unit_id: str, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    unit = db.query(models.UnitModel).filter(models.UnitModel.id == unit_id).first()
    if unit is None:
        raise HTTPException(status_code=404, detail=f"Unit '{unit_id}' not found")
    db.delete(unit)
    db.commit()
    return {"deleted": unit_id}


@app.put("/units/{unit_id}", response_model=Unit, status_code=200)
def edit_unit(unit_id: str, updated: Unit, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    unit = db.query(models.UnitModel).filter(models.UnitModel.id == unit_id).first()
    if unit is None:
        raise HTTPException(status_code=404, detail=f"Unit '{unit_id}' not found")
    for key, value in updated.model_dump().items():
        setattr(unit, key, value)
    db.commit()
    db.refresh(unit)
    return unit
