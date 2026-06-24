import json
import os
from src.db import engine, Base, SessionLocal
from src.models import UnitModel

Base.metadata.create_all(bind=engine)

data_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'Units.json')

with open(data_path, 'r') as f:
    units = json.load(f)["units"]

db = SessionLocal()

for unit in units:
    existing = db.query(UnitModel).filter(UnitModel.id == unit["id"]).first()
    if not existing:
        db.add(UnitModel(**unit))

db.commit()
db.close()

print(f"Seeded {len(units)} units into the database.")
