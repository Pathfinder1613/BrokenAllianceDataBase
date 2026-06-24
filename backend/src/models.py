from sqlalchemy import Column, String, JSON
from .db import Base


class UnitModel(Base):
    __tablename__ = "units"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=True)
    type = Column(String)
    tag = Column(JSON)
    tier = Column(JSON)
    faction = Column(String)
    lore = Column(String, nullable=True)
    stats = Column(JSON)
    abilities = Column(JSON)
    weapons = Column(JSON)
    wreckage = Column(JSON)
