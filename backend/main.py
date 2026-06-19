from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
import jwt

from database import engine, Base, get_db
import users
from auth import verify_password, create_token, SECRET_KEY, ALGORITHM

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class Credentials(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(body: Credentials, db: Session = Depends(get_db)):
    user = db.query(users.User).filter_by(username=body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid username or password")
    return {"access_token": create_token(user.username), "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        username = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = db.query(users.User).filter_by(username=username).first()
    if not user:
        raise HTTPException(401, "User not found")
    return user

@app.get("/me")
def me(user: users.User = Depends(get_current_user)):
    return {"username": user.username}   # note: never return hashed_password