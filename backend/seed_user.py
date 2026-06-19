from database import SessionLocal, engine, Base
import users
from auth import hash_password

Base.metadata.create_all(bind=engine)   # makes the users table if it doesn't exist

USERS = [
    {"username": "admin",  "password": "190185993"},
    {"username": "editor", "password": "190185993"},
]

db = SessionLocal()
for u in USERS:
    if db.query(users.User).filter_by(username=u["username"]).first():
        print(f"skip '{u['username']}' (already exists)")
        continue
    db.add(users.User(
        username=u["username"],
        hashed_password=hash_password(u["password"]),   # hashed, never plain
    ))
    print(f"created '{u['username']}'")

db.commit()
db.close()