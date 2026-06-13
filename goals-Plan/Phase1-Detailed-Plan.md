# Phase 1 — Backend Foundation: Detailed Build Plan

> Goal: Backend runs locally, DB seeded from real JSON files, auth works in Postman.
> Project folder: `BrokenAllianceDataBase/` (not `rts-db` — the spec uses a different name)

---

## Actual project layout (what exists right now)

```
BrokenAllianceDataBase/
├── src/
│   ├── services/
│   │   ├── Units.json       ← unit seed data (wrapped: { "meta":{}, "units":[...] })
│   │   ├── Building.json    ← building seed data (wrapped: { "meta":{}, "buildings":[...] })
│   │   ├── Leaders.json     ← leader seed data (plain array [...])
│   │   └── Factions.json    ← faction list (plain array [...])
│   └── ... (React app — already scaffolded)
├── goals-Plan/
│   ├── Spec doc.md
│   └── Phase1-Detailed-Plan.md  ← this file
└── (no backend yet — you're building it)
```

The backend folder doesn't exist yet. You'll create it from scratch.

---

## Step 0 — Fix JSON data issues before touching any backend code

Two problems in the JSON files will break the seed scripts if not fixed first.

### 0.1 Factions.json is missing "The Bog" and has a name mismatch

Current `src/services/Factions.json`:
```json
[
    { "name": "UDF",       "color": "#0000FF" },
    { "name": "Sakupen",   "color": "#FF0000" },
    { "name": "The Storm", "color": "#50148c" },
    { "name": "Trogs",     "color": "#00AA00" }
]
```

Problems:
- `"Trogs"` → should be `"The Trogs"` to match the spec and future leaders data
- `"The Bog"` is completely missing

Updated `src/services/Factions.json`:
```json
[
    { "name": "UDF",       "color": "#0000FF" },
    { "name": "Sakupen",   "color": "#FF0000" },
    { "name": "The Storm", "color": "#50148c" },
    { "name": "The Bog",   "color": "#4a7c59" },
    { "name": "The Trogs", "color": "#00AA00" }
]
```

### 0.2 Leaders.json needs placeholder entries for The Bog and The Trogs

Open `src/services/Leaders.json` and add two entries at the bottom of the array:

```json
  {
    "id": "BogPlaceholder",
    "faction": "The Bog",
    "name": "Unknown Commander",
    "leader_type": "Unknown",
    "tree_type": "Unknown",
    "portrait": null,
    "subheader": null,
    "quote": null,
    "hero_unit": null,
    "is_placeholder": true,
    "lore": null,
    "passives": [],
    "skills": []
  },
  {
    "id": "TrogsPlaceholder",
    "faction": "The Trogs",
    "name": "Unknown Commander",
    "leader_type": "Unknown",
    "tree_type": "Unknown",
    "portrait": null,
    "subheader": null,
    "quote": null,
    "hero_unit": null,
    "is_placeholder": true,
    "lore": null,
    "passives": [],
    "skills": []
  }
```

---

## Step 1 — Create the backend folder structure

```
BrokenAllianceDataBase/
└── backend/
    ├── models/
    ├── routers/
    ├── schemas/
    ├── seed/
    ├── auth/
    └── alembic/
```

Create this manually or:
```bash
mkdir -p backend/models backend/routers backend/schemas backend/seed backend/auth backend/alembic
```

---

## Step 2 — Python virtual environment + dependencies

```bash
cd BrokenAllianceDataBase/backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install fastapi uvicorn sqlalchemy alembic "python-jose[cryptography]" "passlib[bcrypt]" python-dotenv bcrypt
pip freeze > requirements.txt
```

---

## Step 3 — `.env` file

Create `backend/.env` — never commit this:

```
DATABASE_URL=sqlite:///./rts.db
SECRET_KEY=replace_with_a_long_random_string
ACTION_PIN=1234
ACCESS_TOKEN_EXPIRE_MINUTES=60
PIN_TOKEN_EXPIRE_MINUTES=5
FIRST_SUPERADMIN_EMAIL=you@example.com
FIRST_SUPERADMIN_PASSWORD=yourpassword
```

Generate a real SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Step 4 — `backend/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rts.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite only — remove for Postgres
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Step 5 — Models

Write these files in order. Each imports `Base` from `database`. Do NOT cross-import between model files (causes circular imports) — SQLAlchemy resolves FK references by string name.

---

### 5.1 `backend/models/lookup.py` — faction + type tables

```python
from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class Faction(Base):
    __tablename__ = "faction"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    lore: Mapped[str | None] = mapped_column(Text)
    color_hex: Mapped[str | None] = mapped_column(String)

class UnitType(Base):
    __tablename__ = "unit_type"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)

class ArmorType(Base):
    __tablename__ = "armor_type"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)

class AttackType(Base):
    __tablename__ = "attack_type"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)

class BuildingType(Base):
    __tablename__ = "building_type"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
```

---

### 5.2 `backend/models/user.py`

```python
from sqlalchemy import Integer, String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, default="admin")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    def verify_password(self, plain: str) -> bool:
        return pwd_context.verify(plain, self.password_hash)
```

---

### 5.3 `backend/models/shared.py` — weapon, ability, skill_upgrade

These three tables are shared between units AND buildings using `owner_type` + `owner_id`.
There is no real FK — `owner_id` is just an integer. SQLAlchemy can't enforce a polymorphic FK,
so the seed scripts are responsible for passing the correct id.

```python
from sqlalchemy import Integer, String, Float, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class Weapon(Base):
    __tablename__ = "weapon"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_type: Mapped[str] = mapped_column(String, nullable=False)   # 'unit' or 'building'
    owner_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str | None] = mapped_column(String)
    damage: Mapped[float | None] = mapped_column(Float)
    fire_rate: Mapped[float | None] = mapped_column(Float)
    range: Mapped[float | None] = mapped_column(Float)
    attack_type_id: Mapped[int | None] = mapped_column(Integer)       # FK to attack_type.id
    accuracy: Mapped[float | None] = mapped_column(Float)
    projectile_speed: Mapped[float | None] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

class Ability(Base):
    __tablename__ = "ability"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_type: Mapped[str] = mapped_column(String, nullable=False)
    owner_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str | None] = mapped_column(String)
    cooldown: Mapped[int | None] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)
    duration: Mapped[int | None] = mapped_column(Integer)
    radius: Mapped[float | None] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

class SkillUpgrade(Base):
    __tablename__ = "skill_upgrade"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_type: Mapped[str] = mapped_column(String, nullable=False)
    owner_id: Mapped[int] = mapped_column(Integer, nullable=False)
    tier: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str | None] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(Text)
    scope: Mapped[str] = mapped_column(String, default="unique")
    is_placeholder: Mapped[bool] = mapped_column(Integer, default=False)
```

---

### 5.4 `backend/models/unit.py`

```python
from sqlalchemy import Integer, String, Float, Boolean, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from datetime import datetime

class Unit(Base):
    __tablename__ = "unit"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    faction_id: Mapped[int] = mapped_column(Integer, ForeignKey("faction.id"), nullable=False)
    unit_type_id: Mapped[int] = mapped_column(Integer, ForeignKey("unit_type.id"), nullable=False)
    armor_type_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("armor_type.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    lore: Mapped[str | None] = mapped_column(Text)
    unit_icon: Mapped[str | None] = mapped_column(String)
    tier: Mapped[int | None] = mapped_column(Integer)
    is_trainable: Mapped[bool] = mapped_column(Boolean, default=True)
    cost: Mapped[int | None] = mapped_column(Integer)
    build_time: Mapped[int] = mapped_column(Integer, default=0)
    population: Mapped[int] = mapped_column(Integer, default=0)
    health: Mapped[int | None] = mapped_column(Integer)
    armor: Mapped[float | None] = mapped_column(Float)
    vision_range: Mapped[str | None] = mapped_column(String)
    is_placeholder: Mapped[bool] = mapped_column(Boolean, default=False)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("user.id"))
    updated_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("user.id"))

    tags = relationship("UnitTag", back_populates="unit", cascade="all, delete-orphan")
    traits = relationship("UnitTrait", back_populates="unit", cascade="all, delete-orphan")
    physics = relationship("Physics", back_populates="unit", uselist=False, cascade="all, delete-orphan")
    wreckage = relationship("Wreckage", back_populates="unit", uselist=False, cascade="all, delete-orphan")
    economy = relationship("UnitEconomy", back_populates="unit", uselist=False, cascade="all, delete-orphan")
    veterancy_levels = relationship("VeterancyLevel", back_populates="unit", cascade="all, delete-orphan")

class UnitTag(Base):
    __tablename__ = "unit_tag"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("unit.id"), nullable=False)
    tag: Mapped[str] = mapped_column(String, nullable=False)
    unit = relationship("Unit", back_populates="tags")

class UnitTrait(Base):
    __tablename__ = "unit_trait"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("unit.id"), nullable=False)
    trait: Mapped[str] = mapped_column(String, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    unit = relationship("Unit", back_populates="traits")

class Physics(Base):
    __tablename__ = "physics"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("unit.id"), unique=True, nullable=False)
    mass: Mapped[float | None] = mapped_column(Float)
    max_speed: Mapped[float | None] = mapped_column(Float)
    turn_rate: Mapped[float | None] = mapped_column(Float)
    elevation: Mapped[float | None] = mapped_column(Float)
    unit = relationship("Unit", back_populates="physics")

class Wreckage(Base):
    __tablename__ = "wreckage"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("unit.id"), unique=True, nullable=False)
    health: Mapped[float | None] = mapped_column(Float)
    mass: Mapped[float | None] = mapped_column(Float)
    crash_damage: Mapped[float | None] = mapped_column(Float)
    unit = relationship("Unit", back_populates="wreckage")

class UnitEconomy(Base):
    __tablename__ = "unit_economy"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("unit.id"), unique=True, nullable=False)
    build_rate: Mapped[float | None] = mapped_column(Float)
    mass_storage: Mapped[float | None] = mapped_column(Float)
    energy_storage: Mapped[float | None] = mapped_column(Float)
    unit = relationship("Unit", back_populates="economy")
```

---

### 5.5 `backend/models/veterancy.py`

```python
from sqlalchemy import Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base

class VeterancyLevel(Base):
    __tablename__ = "veterancy_level"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("unit.id"), nullable=False)
    level: Mapped[int] = mapped_column(Integer, nullable=False)
    health: Mapped[float | None] = mapped_column(Float)
    unit = relationship("Unit", back_populates="veterancy_levels")
    weapon_stats = relationship("VeterancyWeapon", back_populates="veterancy_level", cascade="all, delete-orphan")

class VeterancyWeapon(Base):
    __tablename__ = "veterancy_weapon"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    veterancy_level_id: Mapped[int] = mapped_column(Integer, ForeignKey("veterancy_level.id"), nullable=False)
    weapon_id: Mapped[int] = mapped_column(Integer, ForeignKey("weapon.id"), nullable=False)
    damage: Mapped[float | None] = mapped_column(Float)
    fire_rate: Mapped[float | None] = mapped_column(Float)
    range: Mapped[float | None] = mapped_column(Float)
    accuracy: Mapped[float | None] = mapped_column(Float)
    projectile_speed: Mapped[float | None] = mapped_column(Float)
    veterancy_level = relationship("VeterancyLevel", back_populates="weapon_stats")
```

---

### 5.6 `backend/models/building.py`

```python
from sqlalchemy import Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from datetime import datetime

class Building(Base):
    __tablename__ = "building"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    faction_id: Mapped[int] = mapped_column(Integer, ForeignKey("faction.id"), nullable=False)
    building_type_id: Mapped[int] = mapped_column(Integer, ForeignKey("building_type.id"), nullable=False)
    armor_type_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("armor_type.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    lore: Mapped[str | None] = mapped_column(Text)
    building_icon: Mapped[str | None] = mapped_column(String)
    tier: Mapped[int | None] = mapped_column(Integer)
    cost: Mapped[int | None] = mapped_column(Integer)
    build_time: Mapped[int | None] = mapped_column(Integer)
    population: Mapped[int] = mapped_column(Integer, default=0)
    health: Mapped[int | None] = mapped_column(Integer)
    armor: Mapped[float | None] = mapped_column(Float)
    vision_range: Mapped[str | None] = mapped_column(String)
    is_placeholder: Mapped[bool] = mapped_column(Boolean, default=False)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("user.id"))
    updated_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("user.id"))

    tags = relationship("BuildingTag", back_populates="building", cascade="all, delete-orphan")
    traits = relationship("BuildingTrait", back_populates="building", cascade="all, delete-orphan")
    economy = relationship("BuildingEconomy", back_populates="building", uselist=False, cascade="all, delete-orphan")

class BuildingTag(Base):
    __tablename__ = "building_tag"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    building_id: Mapped[int] = mapped_column(Integer, ForeignKey("building.id"), nullable=False)
    tag: Mapped[str] = mapped_column(String, nullable=False)
    building = relationship("Building", back_populates="tags")

class BuildingTrait(Base):
    __tablename__ = "building_trait"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    building_id: Mapped[int] = mapped_column(Integer, ForeignKey("building.id"), nullable=False)
    trait: Mapped[str] = mapped_column(String, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    building = relationship("Building", back_populates="traits")

class BuildingEconomy(Base):
    __tablename__ = "building_economy"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    building_id: Mapped[int] = mapped_column(Integer, ForeignKey("building.id"), unique=True, nullable=False)
    mass_gain: Mapped[float | None] = mapped_column(Float)
    power_gain: Mapped[float | None] = mapped_column(Float)
    power_drain: Mapped[float | None] = mapped_column(Float)
    mass_drain: Mapped[float | None] = mapped_column(Float)
    mass_storage: Mapped[float | None] = mapped_column(Float)
    power_storage: Mapped[float | None] = mapped_column(Float)
    building = relationship("Building", back_populates="economy")
```

---

### 5.7 `backend/models/research.py`

```python
from sqlalchemy import Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
from datetime import datetime

class Research(Base):
    __tablename__ = "research"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    faction_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("faction.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    lore: Mapped[str | None] = mapped_column(Text)
    tier: Mapped[int | None] = mapped_column(Integer)
    cost: Mapped[int | None] = mapped_column(Integer)
    research_time: Mapped[int | None] = mapped_column(Integer)
    icon: Mapped[str | None] = mapped_column(String)
    scope: Mapped[str] = mapped_column(String, default="unique")
    is_placeholder: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class ResearchPrerequisite(Base):
    __tablename__ = "research_prerequisite"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    research_id: Mapped[int] = mapped_column(Integer, ForeignKey("research.id"), nullable=False)
    prerequisite_id: Mapped[int] = mapped_column(Integer, ForeignKey("research.id"), nullable=False)

class ResearchEffect(Base):
    __tablename__ = "research_effect"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    research_id: Mapped[int] = mapped_column(Integer, ForeignKey("research.id"), nullable=False)
    target_type: Mapped[str] = mapped_column(String, nullable=False)
    target_id: Mapped[int | None] = mapped_column(Integer)
    field: Mapped[str] = mapped_column(String, nullable=False)
    modifier: Mapped[float] = mapped_column(Float, nullable=False)
    modifier_type: Mapped[str] = mapped_column(String, default="multiply")
```

---

### 5.8 `backend/models/leader.py`

```python
from sqlalchemy import Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from datetime import datetime

class Leader(Base):
    __tablename__ = "leader"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    faction_id: Mapped[int] = mapped_column(Integer, ForeignKey("faction.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    leader_type: Mapped[str | None] = mapped_column(String)
    tree_type: Mapped[str | None] = mapped_column(String)
    subheader: Mapped[str | None] = mapped_column(String)
    quote: Mapped[str | None] = mapped_column(Text)
    hero_unit: Mapped[str | None] = mapped_column(String)
    portrait: Mapped[str | None] = mapped_column(String)
    lore: Mapped[str | None] = mapped_column(Text)
    is_placeholder: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    skills = relationship("LeaderSkill", back_populates="leader", cascade="all, delete-orphan")
    passives = relationship("LeaderPassive", back_populates="leader", cascade="all, delete-orphan")

class LeaderSkill(Base):
    __tablename__ = "leader_skill"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    leader_id: Mapped[int] = mapped_column(Integer, ForeignKey("leader.id"), nullable=False)
    unlock: Mapped[int] = mapped_column(Integer, nullable=False)
    branch: Mapped[str | None] = mapped_column(String)
    name: Mapped[str | None] = mapped_column(String)
    skill_type: Mapped[str | None] = mapped_column(String)    # 'Active' or 'Passive'
    cooldown: Mapped[int | None] = mapped_column(Integer)
    duration: Mapped[int | None] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)
    is_placeholder: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text)
    leader = relationship("Leader", back_populates="skills")

class LeaderPassive(Base):
    __tablename__ = "leader_passive"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    leader_id: Mapped[int] = mapped_column(Integer, ForeignKey("leader.id"), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    target_type: Mapped[str | None] = mapped_column(String)
    target_id: Mapped[int | None] = mapped_column(Integer)
    field: Mapped[str | None] = mapped_column(String)
    modifier: Mapped[float | None] = mapped_column(Float)
    modifier_type: Mapped[str] = mapped_column(String, default="multiply")
    leader = relationship("Leader", back_populates="passives")
```

---

### 5.9 `backend/models/changelog.py`

```python
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
from datetime import datetime

class Changelog(Base):
    __tablename__ = "changelog"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    entity_type: Mapped[str] = mapped_column(String, nullable=False)
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    entity_name: Mapped[str] = mapped_column(String, nullable=False)
    changed_by: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)
    field_changed: Mapped[str | None] = mapped_column(String)
    old_value: Mapped[str | None] = mapped_column(Text)
    new_value: Mapped[str | None] = mapped_column(Text)
    patch_version: Mapped[str | None] = mapped_column(String)
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

---

### 5.10 `backend/models/__init__.py`

Import every model so Alembic can see them all:

```python
from .lookup import Faction, UnitType, ArmorType, AttackType, BuildingType
from .user import User
from .shared import Weapon, Ability, SkillUpgrade
from .unit import Unit, UnitTag, UnitTrait, Physics, Wreckage, UnitEconomy
from .veterancy import VeterancyLevel, VeterancyWeapon
from .building import Building, BuildingTag, BuildingTrait, BuildingEconomy
from .research import Research, ResearchPrerequisite, ResearchEffect
from .leader import Leader, LeaderSkill, LeaderPassive
from .changelog import Changelog
```

**Verify:** `python -c "from models import Unit, Leader, Building; print('OK')"` — no errors.

---

## Step 6 — Alembic migrations

### 6.1 Initialize

```bash
# from backend/
alembic init alembic
```

### 6.2 Configure `alembic/env.py`

Near the top, add:
```python
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

from database import Base
from models import *  # registers all tables with Base.metadata
```

Find the `target_metadata` line and replace it:
```python
target_metadata = Base.metadata
```

Find where `sqlalchemy.url` is set and replace it:
```python
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))
```

### 6.3 Generate and apply

```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

**Verify:** `rts.db` exists. Open it in DB Browser for SQLite — confirm all tables are present (should be 20+ tables).

---

## Step 7 — Seed scripts

> JSON files live at `../src/services/` relative to the `backend/` folder.
> Important: the building file is named `Building.json` (singular), not `buildings.json`.

### 7.1 `backend/seed/seed_lookup.py` — seed the hardcoded lookup tables

The lookup tables aren't in any JSON file — seed them from hardcoded values.

```python
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal
from models.lookup import Faction, UnitType, ArmorType, AttackType, BuildingType

import json

def seed_lookup(db):
    # Factions — read from Factions.json so color is included
    factions_path = os.path.join(os.path.dirname(__file__), "../../src/services/Factions.json")
    with open(factions_path) as f:
        factions_data = json.load(f)
    for fac in factions_data:
        if not db.query(Faction).filter_by(name=fac["name"]).first():
            db.add(Faction(name=fac["name"], color_hex=fac.get("color")))

    # Unit types
    for name in ["MCU", "infantry", "engineer", "vehicle", "air"]:
        if not db.query(UnitType).filter_by(name=name).first():
            db.add(UnitType(name=name))

    # Armor types
    for name in ["light", "heavy", "reinforced"]:
        if not db.query(ArmorType).filter_by(name=name).first():
            db.add(ArmorType(name=name))

    # Attack types
    for name in ["kinetic", "explosive", "energy", "biological"]:
        if not db.query(AttackType).filter_by(name=name).first():
            db.add(AttackType(name=name))

    # Building types
    for name in ["economy", "production", "defense", "support"]:
        if not db.query(BuildingType).filter_by(name=name).first():
            db.add(BuildingType(name=name))

    db.commit()
    print("Lookup tables seeded.")
```

---

### 7.2 `backend/seed/seed_units.py`

**Critical data shape notes for Units.json:**
- The file is `{ "meta": {...}, "units": [...] }` — access with `data["units"]`, not `data`
- `unit["type"]` → look up `UnitType` by name → `unit_type_id`
- `unit["armor_type"]` may be `null` → skip lookup if null
- `weapon["attack_type"]` may be `null` → skip lookup if null
- `unit["is_placeholder"]` is **missing** from MCU units — use `.get("is_placeholder", False)`
- `unit["economy"]` is **missing** from MCU units — use `.get("economy")`
- `unit["skill_upgrades"]` is **missing** from MCU units — use `.get("skill_upgrades", [])`
- `unit["wreckage"]` is `null` for infantry/engineers, but is `{"health": null, "mass": null}` for MCUs — both must be handled
- `weapon["notes"]` is not always present — use `.get("notes")`
- The JSON has no `crash_damage` in wreckage — leave that column null

```python
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal
from models.lookup import Faction, UnitType, ArmorType, AttackType
from models.unit import Unit, UnitTag, UnitTrait, Physics, Wreckage, UnitEconomy
from models.shared import Weapon, Ability, SkillUpgrade
from models.veterancy import VeterancyLevel

UNITS_PATH = os.path.join(os.path.dirname(__file__), "../../src/services/Units.json")

def seed_units(db):
    with open(UNITS_PATH) as f:
        data = json.load(f)

    units_data = data["units"]   # ← must use data["units"], not data directly

    for u in units_data:
        try:
            faction = db.query(Faction).filter_by(name=u["faction"]).first()
            if not faction:
                raise ValueError(f"Unknown faction: {u['faction']}")

            unit_type = db.query(UnitType).filter_by(name=u["type"]).first()
            if not unit_type:
                raise ValueError(f"Unknown unit type: {u['type']}")

            armor_type = None
            if u.get("armor_type"):
                armor_type = db.query(ArmorType).filter_by(name=u["armor_type"]).first()

            unit = Unit(
                faction_id=faction.id,
                unit_type_id=unit_type.id,
                armor_type_id=armor_type.id if armor_type else None,
                name=u["name"],
                unit_icon=u.get("unit_icon"),
                tier=u.get("tier"),
                is_trainable=u.get("is_trainable", True),
                cost=u.get("cost"),
                build_time=u.get("build_time", 0),
                population=u.get("population", 0),
                health=u.get("health"),
                armor=u.get("armor"),
                vision_range=u.get("vision_range"),
                lore=u.get("lore"),
                is_placeholder=u.get("is_placeholder", False),   # ← .get() because MCUs omit this
            )
            db.add(unit)
            db.flush()  # get unit.id before creating children

            # Tags
            for tag in u.get("tags", []):
                db.add(UnitTag(unit_id=unit.id, tag=tag))

            # Traits
            for i, trait in enumerate(u.get("traits", [])):
                db.add(UnitTrait(unit_id=unit.id, trait=trait, sort_order=i))

            # Weapons
            weapon_ids = []
            for i, w in enumerate(u.get("weapons", [])):
                attack_type = None
                if w.get("attack_type"):
                    attack_type = db.query(AttackType).filter_by(name=w["attack_type"]).first()
                weapon = Weapon(
                    owner_type="unit",
                    owner_id=unit.id,
                    name=w.get("name"),
                    damage=w.get("damage"),
                    fire_rate=w.get("fire_rate"),
                    range=w.get("range"),
                    attack_type_id=attack_type.id if attack_type else None,
                    accuracy=w.get("accuracy"),
                    projectile_speed=w.get("projectile_speed"),
                    notes=w.get("notes"),
                    sort_order=i,
                )
                db.add(weapon)
                db.flush()
                weapon_ids.append(weapon.id)

            # Abilities
            for i, a in enumerate(u.get("abilities", [])):
                db.add(Ability(
                    owner_type="unit", owner_id=unit.id,
                    name=a.get("name"), cooldown=a.get("cooldown"),
                    description=a.get("description"), duration=a.get("duration"),
                    radius=a.get("radius"), notes=a.get("notes"), sort_order=i,
                ))

            # Skill upgrades — use .get() because MCU units omit this key
            for su in u.get("skill_upgrades", []):
                db.add(SkillUpgrade(
                    owner_type="unit", owner_id=unit.id,
                    tier=su["tier"], name=su.get("name"),
                    description=su.get("description"),
                    scope=su.get("scope", "unique"),
                    is_placeholder=su.get("is_placeholder", False),
                ))

            # Physics — always present (may have all-null values)
            p = u.get("physics")
            if p:
                db.add(Physics(
                    unit_id=unit.id,
                    mass=p.get("mass"), max_speed=p.get("max_speed"),
                    turn_rate=p.get("turn_rate"), elevation=p.get("elevation"),
                ))

            # Wreckage — null for infantry/engineers, dict for MCUs (may have all-null values)
            # JSON has no crash_damage field — leave it null
            w_data = u.get("wreckage")
            if w_data is not None:   # ← only create row if wreckage key exists AND isn't null
                db.add(Wreckage(
                    unit_id=unit.id,
                    health=w_data.get("health"),
                    mass=w_data.get("mass"),
                    crash_damage=None,
                ))

            # Economy — use .get() because MCU units omit this key
            eco = u.get("economy")
            if eco:
                db.add(UnitEconomy(
                    unit_id=unit.id,
                    build_rate=eco.get("build_rate"),
                    mass_storage=eco.get("mass_storage"),
                    energy_storage=eco.get("energy_storage"),
                ))

            # Veterancy — 15 levels per unit
            for vet in u.get("veterancy", []):
                db.add(VeterancyLevel(
                    unit_id=unit.id,
                    level=vet["level"],
                    health=vet.get("health"),
                ))
                # VeterancyWeapon rows can be added here later when vet data is filled in

            print(f"  Seeded unit: {u['name']} ({u['faction']})")

        except Exception as e:
            print(f"  ERROR seeding unit '{u.get('name', '?')}': {e}")
            raise

    db.commit()
    print(f"Units seeded: {len(units_data)} records.")
```

---

### 7.3 `backend/seed/seed_buildings.py`

**Critical data shape notes for Building.json:**
- File name is `Building.json` (singular) — not `buildings.json`
- The file is `{ "meta": {...}, "buildings": [...] }` — access with `data["buildings"]`
- `building["type"]` → look up `BuildingType` by name → `building_type_id`
- Buildings have no `skill_upgrades` in the JSON yet — use `.get("skill_upgrades", [])`
- Every building has an `economy` object (even if all null values) — always create a `BuildingEconomy` row

```python
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal
from models.lookup import Faction, BuildingType, ArmorType, AttackType
from models.building import Building, BuildingTag, BuildingTrait, BuildingEconomy
from models.shared import Weapon, Ability, SkillUpgrade

BUILDINGS_PATH = os.path.join(os.path.dirname(__file__), "../../src/services/Building.json")
#                                                                              ↑ singular — matches actual filename

def seed_buildings(db):
    with open(BUILDINGS_PATH) as f:
        data = json.load(f)

    buildings_data = data["buildings"]   # ← must use data["buildings"]

    for b in buildings_data:
        try:
            faction = db.query(Faction).filter_by(name=b["faction"]).first()
            if not faction:
                raise ValueError(f"Unknown faction: {b['faction']}")

            building_type = db.query(BuildingType).filter_by(name=b["type"]).first()
            if not building_type:
                raise ValueError(f"Unknown building type: {b['type']}")

            armor_type = None
            if b.get("armor_type"):
                armor_type = db.query(ArmorType).filter_by(name=b["armor_type"]).first()

            building = Building(
                faction_id=faction.id,
                building_type_id=building_type.id,
                armor_type_id=armor_type.id if armor_type else None,
                name=b["name"],
                building_icon=b.get("building_icon"),
                tier=b.get("tier"),
                cost=b.get("cost"),
                build_time=b.get("build_time"),
                population=b.get("population", 0),
                health=b.get("health"),
                armor=b.get("armor"),
                vision_range=b.get("vision_range"),
                lore=b.get("lore"),
                is_placeholder=b.get("is_placeholder", False),
            )
            db.add(building)
            db.flush()

            for tag in b.get("tags", []):
                db.add(BuildingTag(building_id=building.id, tag=tag))

            for i, trait in enumerate(b.get("traits", [])):
                db.add(BuildingTrait(building_id=building.id, trait=trait, sort_order=i))

            # Economy — always present in current JSON (even if all nulls)
            eco = b.get("economy", {})
            db.add(BuildingEconomy(
                building_id=building.id,
                mass_gain=eco.get("mass_gain"),
                power_gain=eco.get("power_gain"),
                power_drain=eco.get("power_drain"),
                mass_drain=eco.get("mass_drain"),
                mass_storage=eco.get("mass_storage"),
                power_storage=eco.get("power_storage"),
            ))

            for i, w in enumerate(b.get("weapons", [])):
                attack_type = None
                if w.get("attack_type"):
                    attack_type = db.query(AttackType).filter_by(name=w["attack_type"]).first()
                db.add(Weapon(
                    owner_type="building", owner_id=building.id,
                    name=w.get("name"), damage=w.get("damage"),
                    fire_rate=w.get("fire_rate"), range=w.get("range"),
                    attack_type_id=attack_type.id if attack_type else None,
                    accuracy=w.get("accuracy"), projectile_speed=w.get("projectile_speed"),
                    notes=w.get("notes"), sort_order=i,
                ))

            for i, a in enumerate(b.get("abilities", [])):
                db.add(Ability(
                    owner_type="building", owner_id=building.id,
                    name=a.get("name"), cooldown=a.get("cooldown"),
                    description=a.get("description"), duration=a.get("duration"),
                    radius=a.get("radius"), notes=a.get("notes"), sort_order=i,
                ))

            print(f"  Seeded building: {b['name']} ({b['faction']})")

        except Exception as e:
            print(f"  ERROR seeding building '{b.get('name', '?')}': {e}")
            raise

    db.commit()
    print(f"Buildings seeded: {len(buildings_data)} records.")
```

---

### 7.4 `backend/seed/seed_leaders.py`

**Critical data shape notes for Leaders.json:**
- The file is a **plain array** `[...]` — use `data` directly, no `data["leaders"]`
- `leader["skills"]` → `LeaderSkill` rows — the JSON key is `"skills"`, not `"skill_upgrades"`
- `skill["type"]` → maps to `skill_type` column — rename on read
- `leader["passives"]` → `LeaderPassive` rows — currently `[]` for all leaders but handle it
- The `id` field in the JSON (e.g., `"PresidentEnhet"`) is a string slug — don't store it as-is; it's just for human reference in the JSON

```python
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal
from models.lookup import Faction
from models.leader import Leader, LeaderSkill, LeaderPassive

LEADERS_PATH = os.path.join(os.path.dirname(__file__), "../../src/services/Leaders.json")

def seed_leaders(db):
    with open(LEADERS_PATH) as f:
        leaders_data = json.load(f)   # ← plain array, no wrapping key

    for l in leaders_data:
        try:
            faction = db.query(Faction).filter_by(name=l["faction"]).first()
            if not faction:
                raise ValueError(f"Unknown faction: {l['faction']} — did you add placeholder factions?")

            leader = Leader(
                faction_id=faction.id,
                name=l["name"],
                leader_type=l.get("leader_type"),
                tree_type=l.get("tree_type"),
                subheader=l.get("subheader"),
                quote=l.get("quote"),
                hero_unit=l.get("hero_unit"),
                portrait=l.get("portrait"),
                lore=l.get("lore"),
                is_placeholder=l.get("is_placeholder", False),
            )
            db.add(leader)
            db.flush()

            # Skills — JSON key is "skills" (not "skill_upgrades")
            # JSON uses "type" for what the model calls "skill_type"
            for skill in l.get("skills", []):
                db.add(LeaderSkill(
                    leader_id=leader.id,
                    unlock=skill["unlock"],
                    branch=skill.get("branch"),
                    name=skill.get("name"),
                    skill_type=skill.get("type"),       # ← JSON "type" → model "skill_type"
                    cooldown=skill.get("cooldown"),
                    duration=skill.get("duration"),
                    description=skill.get("description"),
                    is_placeholder=skill.get("is_placeholder", False),
                    notes=skill.get("notes"),
                ))

            # Passives — currently [] for all leaders, but handle it
            for passive in l.get("passives", []):
                db.add(LeaderPassive(
                    leader_id=leader.id,
                    description=passive.get("description", ""),
                    target_type=passive.get("target_type"),
                    target_id=passive.get("target_id"),
                    field=passive.get("field"),
                    modifier=passive.get("modifier"),
                    modifier_type=passive.get("modifier_type", "multiply"),
                ))

            print(f"  Seeded leader: {l['name']} ({l['faction']})")

        except Exception as e:
            print(f"  ERROR seeding leader '{l.get('name', '?')}': {e}")
            raise

    db.commit()
    print(f"Leaders seeded: {len(leaders_data)} records.")
```

---

### 7.5 `backend/seed/seed.py` — orchestrator

```python
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal
from models.unit import Unit
from seed.seed_lookup import seed_lookup
from seed.seed_units import seed_units
from seed.seed_buildings import seed_buildings
from seed.seed_leaders import seed_leaders

def run_seed():
    db = SessionLocal()
    try:
        if db.query(Unit).first():
            print("DB already seeded — skipping. Drop rts.db and re-run to reseed.")
            return

        print("Seeding lookup tables...")
        seed_lookup(db)

        print("Seeding units...")
        seed_units(db)

        print("Seeding buildings...")
        seed_buildings(db)

        print("Seeding leaders...")
        seed_leaders(db)

        print("Done.")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
```

**Run it directly to test:**
```bash
# from backend/
python seed/seed.py
```

---

## Step 8 — Auth helpers

### 8.1 `backend/auth/jwt.py`

```python
from jose import jwt, JWTError
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_minutes: int) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=expires_minutes)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

### 8.2 `backend/auth/pin.py`

```python
import os
from auth.jwt import create_access_token, decode_token
from dotenv import load_dotenv

load_dotenv()

def verify_pin(submitted_pin: str) -> bool:
    return submitted_pin == os.getenv("ACTION_PIN")

def create_pin_token() -> str:
    expire = int(os.getenv("PIN_TOKEN_EXPIRE_MINUTES", 5))
    return create_access_token({"type": "pin"}, expire)

def validate_pin_token(token: str) -> bool:
    try:
        payload = decode_token(token)
        return payload.get("type") == "pin"
    except Exception:
        return False
```

### 8.3 `backend/auth/dependencies.py`

```python
from fastapi import Depends, HTTPException, Cookie
from auth.jwt import decode_token
from models.user import User
from database import get_db
from sqlalchemy.orm import Session

def get_current_user(access_token: str = Cookie(None), db: Session = Depends(get_db)) -> User:
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(access_token)
        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin required")
    return user

def require_superadmin(user: User = Depends(get_current_user)) -> User:
    if user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin required")
    return user
```

---

## Step 9 — Auth router

### `backend/routers/auth.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from auth.jwt import create_access_token, decode_token
from auth.pin import verify_pin, create_pin_token
from auth.dependencies import get_current_user
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()
router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class PinRequest(BaseModel):
    pin: str

@router.post("/login")
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not user.verify_password(body.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account inactive")

    user.last_login = datetime.utcnow()
    db.commit()

    token = create_access_token(
        {"sub": str(user.id)},
        expires_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
    )
    response.set_cookie("access_token", token, httponly=True, samesite="lax")
    return {"message": "logged in", "role": user.role}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "logged out"}

@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "username": user.username, "role": user.role}

@router.post("/verify-pin")
def verify_pin_endpoint(body: PinRequest, response: Response, user: User = Depends(get_current_user)):
    if not verify_pin(body.pin):
        raise HTTPException(status_code=401, detail="Invalid PIN")
    pin_token = create_pin_token()
    response.set_cookie("pin_token", pin_token, httponly=True, samesite="lax")
    return {"message": "PIN verified"}
```

---

## Step 10 — Seed router

### `backend/routers/seed_router.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from auth.dependencies import require_superadmin
from seed.seed import run_seed
from models.unit import Unit

router = APIRouter()

@router.post("/seed")
def seed_db(db: Session = Depends(get_db), user: User = Depends(require_superadmin)):
    if db.query(Unit).first():
        raise HTTPException(status_code=400, detail="DB already seeded")
    run_seed()
    return {"message": "DB seeded successfully"}
```

---

## Step 11 — `backend/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, seed_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="RTS Unit Database API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(seed_router.router, prefix="/api", tags=["seed"])
```

---

## Step 12 — Bootstrap the superadmin (one-time script)

Create `backend/create_superadmin.py`:

```python
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
from models.user import User
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"])
db = SessionLocal()

email = os.getenv("FIRST_SUPERADMIN_EMAIL")
password = os.getenv("FIRST_SUPERADMIN_PASSWORD")

if db.query(User).filter_by(email=email).first():
    print("Superadmin already exists.")
else:
    db.add(User(
        username="superadmin",
        email=email,
        password_hash=pwd_context.hash(password),
        role="superadmin",
    ))
    db.commit()
    print(f"Superadmin created: {email}")
db.close()
```

```bash
python create_superadmin.py
```

---

## Step 13 — Run and verify

### Start the server

```bash
# from backend/
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` — Swagger UI should load and show all routes.

### Verification checklist

```
[ ] GET  http://localhost:8000/docs                      → Swagger UI loads
[ ] POST /api/auth/login  {username, password}           → 200 + cookie set
[ ] GET  /api/auth/me     (with cookie)                  → 200 + {username, role}
[ ] GET  /api/auth/me     (no cookie)                    → 401
[ ] POST /api/auth/logout                                → 200 + cookie cleared
[ ] POST /api/auth/verify-pin  {"pin": "correct"}        → 200 + pin_token cookie
[ ] POST /api/auth/verify-pin  {"pin": "wrong"}          → 401
[ ] POST /api/seed  (as superadmin)                      → 200 + seeded
[ ] POST /api/seed  (run again)                          → 400 "already seeded"
```

### Check the DB with DB Browser for SQLite

```
[ ] faction table: 5 rows (UDF, Sakupen, The Storm, The Bog, The Trogs)
[ ] unit table: 14 rows across 5 factions
[ ] building table: 9 rows (all UDF)
[ ] leader table: 11+ rows (including placeholders for The Bog and The Trogs)
[ ] leader_skill table: has rows for every non-placeholder leader (6 skills each)
[ ] weapon table: has rows with owner_type = 'unit' and owner_type = 'building'
[ ] veterancy_level table: 15 rows per unit (= ~210 rows total)
```

---

## Phase 1 done — handoff to Phase 2

At this point:
- Full schema in SQLite, migrated via Alembic
- All seed data loaded from the real JSON files
- JWT auth + PIN verification working
- FastAPI Swagger docs available at `/docs`

**Next:** Phase 2 — Unit CRUD endpoints + React unit browser.
