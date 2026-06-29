import json
import os
from src.db import engine, Base, SessionLocal
from src.models import UnitModel, User
from src.auth import hash_password
from dotenv import load_dotenv

load_dotenv()
Base.metadata.create_all(bind=engine)

data_path = os.path.join(os.path.dirname(__file__), 'data', 'Units.json')

with open(data_path, 'r') as f:
    units = json.load(f)["units"]

db = SessionLocal()

for unit in units:
    existing = db.query(UnitModel).filter(UnitModel.id == unit["id"]).first()
    if not existing:
        db.add(UnitModel(**unit))

seed_username = os.getenv("SEED_USERNAME")
seed_password = os.getenv("SEED_PASSWORD")
if seed_username and seed_password:
    existing_user = db.query(User).filter(User.username == seed_username).first()
    if not existing_user:
        db.add(User(username=seed_username, hashed_password=hash_password(seed_password)))
        print(f"Created user '{seed_username}'.")
    else:
        print(f"User '{seed_username}' already exists, skipping.")
else:
    print("SEED_USERNAME/SEED_PASSWORD not set, skipping user creation.")

db.commit()
db.close()

print(f"Seeded {len(units)} units into the database.")
