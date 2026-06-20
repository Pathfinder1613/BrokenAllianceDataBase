from fastapi import FastAPI, HTTPException
from src.schemas import Unit
import json
import os

app = FastAPI()

data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'Units.json')

with open(data_path, 'r') as file:
    Units = json.load(file)["units"]

@app.get("/units")
def get_all_units():
    return Units

@app.get("/unit/{id}")
def get_units(id: str):
    unit = next((unit for unit in Units if unit["id"] == id), None)
    if unit is None:
        raise HTTPException(status_code=404, detail=f"Unit '{id}' not found")
    return unit

@app.post("/units", response_model=Unit, status_code=201)
def create_unit(post: Unit):
    Units.append(post.model_dump())
    with open(data_path, 'w') as file:
        json.dump({"units": Units}, file, indent=4)
    return post

@app.delete("/units/{id}", status_code=200)
def delete_unit(id: str):
    unit = next((unit for unit in Units if unit["id"] == id), None)
    if unit is None:
        raise HTTPException(status_code=404, detail=f"Unit '{id}' not found")
    Units.remove(unit)
    with open(data_path, 'w') as file:
        json.dump({"units": Units}, file, indent=4)
    return {"deleted": id}

@app.put("/units/{id}", response_model=Unit, status_code=200)
def edit_unit(id: str, updated: Unit):
    index = next((i for i, u in enumerate(Units) if u["id"] == id), None)
    if index is None:
        raise HTTPException(status_code=404, detail=f"Unit '{id}' not found")
    Units[index] = updated.model_dump()
    with open(data_path, 'w') as file:
        json.dump({"units": Units}, file, indent=4)
    return updated