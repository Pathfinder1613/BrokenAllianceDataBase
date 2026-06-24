from pydantic import BaseModel, ConfigDict
from typing import Optional, Union


class UnitStats(BaseModel):
    mass: Optional[Union[int, str]]
    power: Optional[int]
    buildTimeSeconds: Optional[int]
    pop: Optional[int]
    hp: Optional[int]
    vision: Optional[str]


class UnitWreckage(BaseModel):
    mass: Optional[int]
    power: Optional[int]
    health: Optional[int]


class Unit(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: Optional[str]
    type: str
    tag: list[str]
    tier: Union[int, str]
    faction: str
    lore: Optional[str]
    stats: UnitStats
    abilities: list[str]
    weapons: list[str]
    wreckage: UnitWreckage
