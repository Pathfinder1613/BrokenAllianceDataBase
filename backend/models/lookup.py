# Column types used to define what kind of data each column holds
from sqlalchemy import Integer, String, Text

# Mapped and mapped_column are the modern SQLAlchemy 2.0 way to define columns using Python type hints
from sqlalchemy.orm import Mapped, mapped_column

# Base is the shared SQLAlchemy base class from database.py
# Every model inherits from it so SQLAlchemy knows to treat the class as a database table
from database import Base


# Each class below is one database table.
# These are "lookup" tables — small reference lists that other tables point to by ID.
# Instead of storing raw text like "infantry" on every unit row, the unit table stores
# a unit_type_id number that points to a row here. This keeps names consistent and avoids typos.


class Faction(Base):
    __tablename__ = "faction"  # the actual table name in the database

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # auto-incrementing unique ID for each row

    # Mapped[str] means required — this column can never be null
    # unique=True means no two factions can share the same name
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    # Mapped[str | None] means optional — this column is allowed to be null
    description: Mapped[str | None] = mapped_column(Text)
    lore: Mapped[str | None] = mapped_column(Text)
    color_hex: Mapped[str | None] = mapped_column(String)  # e.g. "#0000FF" for UDF blue


# The remaining four classes follow the same pattern as Faction but are simpler —
# just an id and a name. They act like dropdown lists for the rest of the database.


class UnitType(Base):
    # Stores unit categories: infantry, engineer, MCU, vehicle, air
    __tablename__ = "unit_type"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)


class ArmorType(Base):
    # Stores armor categories: light, heavy, reinforced
    __tablename__ = "armor_type"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)


class AttackType(Base):
    # Stores weapon damage types: kinetic, explosive, energy, biological
    __tablename__ = "attack_type"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)


class BuildingType(Base):
    # Stores building categories: economy, production, defense, support
    __tablename__ = "building_type"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
