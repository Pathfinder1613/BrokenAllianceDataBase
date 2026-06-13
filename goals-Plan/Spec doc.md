# RTS Unit Database — Full Project Spec & Build Plan

> Last updated to reflect: buildings.json, leaders.json, units.json v3, and all schema decisions made during data modeling sessions.

---

## 1. Project Overview

A full-stack web app for browsing, managing, and editing game data (units, buildings, research, leaders) for a custom RTS game. Public users can browse and compare. Admins (logged-in) can create, edit, and delete entries. A one-time action PIN is required before any write operation is committed.

**Stack:**
- Frontend: React (Vite), React Router
- Backend: Python, FastAPI, SQLAlchemy 2.0
- Database: SQLite (dev) → PostgreSQL + pgAdmin (production)
- Auth: JWT tokens stored in httpOnly cookies
- Hosting: TBD

---

## 2. Seed Files

All seed files live in the project root alongside `README.md`.

| File | Status | Contents |
|---|---|---|
| `units.json` | Ready | 14 units across 5 factions (UDF, Sakupen, The Bog, The Storm, The Trogs) |
| `buildings.json` | Ready (UDF only) | 9 UDF buildings — economy, production, defense. Other factions are placeholder. | Have not done this yet
| `leaders.json` | Partial | 9 leaders across UDF, Sakupen, The Storm. The Bog and The Trogs need placeholder entries. | Have not done this yet
| `RTS_DB_SPEC.md` | This file | Full schema, routes, build plan |

**Before seeding:** Add placeholder leader entries for The Bog and The Trogs to `leaders.json` or the seed script will fail when it tries to link faction → leader.

---

## 3. Full Database Schema

### 3.1 Core lookup tables

```
faction
  id            INTEGER PK
  name          TEXT NOT NULL UNIQUE
  description   TEXT
  lore          TEXT
  color_hex     TEXT
  created_at    DATETIME DEFAULT now

unit_type
  id            INTEGER PK
  name          TEXT NOT NULL UNIQUE      -- infantry, engineer, MCU, vehicle, air
  description   TEXT

armor_type
  id            INTEGER PK
  name          TEXT NOT NULL UNIQUE      -- light, heavy, reinforced
  description   TEXT

attack_type
  id            INTEGER PK
  name          TEXT NOT NULL UNIQUE      -- kinetic, explosive, energy, biological
  description   TEXT

building_type
  id            INTEGER PK
  name          TEXT NOT NULL UNIQUE      -- economy, production, defense, support
  description   TEXT
```

---

### 3.2 Units

```
unit
  id                INTEGER PK
  faction_id        INTEGER FK → faction.id
  unit_type_id      INTEGER FK → unit_type.id
  armor_type_id     INTEGER FK → armor_type.id (nullable)
  name              TEXT NOT NULL
  description       TEXT
  lore              TEXT
  unit_icon         TEXT                  -- path or URL to image
  tier              INTEGER (nullable)    -- null for MCUs
  is_trainable      BOOLEAN DEFAULT true  -- false for MCUs (placed at game start)
  cost              INTEGER (nullable)    -- null for MCUs
  build_time        INTEGER DEFAULT 0     -- seconds
  population        INTEGER DEFAULT 0
  health            INTEGER
  armor             REAL (nullable)       -- damage reduction value
  vision_range      TEXT (nullable)       -- "Short", "Medium", "Large" until numeric
  is_placeholder    BOOLEAN DEFAULT false -- true for non-UDF placeholder units
  version           INTEGER DEFAULT 1
  created_at        DATETIME DEFAULT now
  updated_at        DATETIME DEFAULT now
  created_by        INTEGER FK → user.id (nullable)
  updated_by        INTEGER FK → user.id (nullable)

unit_tag
  id          INTEGER PK
  unit_id     INTEGER FK → unit.id
  tag         TEXT NOT NULL

unit_trait
  id          INTEGER PK
  unit_id     INTEGER FK → unit.id
  trait       TEXT NOT NULL
  sort_order  INTEGER DEFAULT 0

-- Weapons: shared between units and buildings (owner_type distinguishes)
weapon
  id                INTEGER PK
  owner_type        TEXT NOT NULL         -- 'unit' or 'building'
  owner_id          INTEGER NOT NULL      -- FK to unit.id or building.id
  name              TEXT (nullable)
  damage            REAL (nullable)
  fire_rate         REAL (nullable)       -- shots per second
  range             REAL (nullable)       -- meters
  attack_type_id    INTEGER FK → attack_type.id (nullable)
  accuracy          REAL (nullable)       -- 0.0 to 1.0
  projectile_speed  REAL (nullable)       -- meters per second
  notes             TEXT (nullable)
  sort_order        INTEGER DEFAULT 0

-- Abilities: shared between units and buildings (owner_type distinguishes)
ability
  id          INTEGER PK
  owner_type  TEXT NOT NULL               -- 'unit' or 'building'
  owner_id    INTEGER NOT NULL            -- FK to unit.id or building.id
  name        TEXT
  cooldown    INTEGER (nullable)          -- seconds
  description TEXT
  duration    INTEGER (nullable)          -- seconds
  radius      REAL (nullable)             -- meters
  notes       TEXT (nullable)
  sort_order  INTEGER DEFAULT 0

-- Skill upgrades: shared between units and buildings (owner_type distinguishes)
skill_upgrade
  id          INTEGER PK
  owner_type  TEXT NOT NULL               -- 'unit' or 'building'
  owner_id    INTEGER NOT NULL
  tier        INTEGER NOT NULL            -- 1–4
  name        TEXT (nullable)
  description TEXT (nullable)
  scope       TEXT DEFAULT 'unique'       -- 'shared' or 'unique'
  is_placeholder BOOLEAN DEFAULT false

veterancy_level
  id          INTEGER PK
  unit_id     INTEGER FK → unit.id
  level       INTEGER NOT NULL            -- 1–15
  health      REAL (nullable)             -- exact HP at this veterancy level

veterancy_weapon
  id                  INTEGER PK
  veterancy_level_id  INTEGER FK → veterancy_level.id
  weapon_id           INTEGER FK → weapon.id
  damage              REAL (nullable)
  fire_rate           REAL (nullable)
  range               REAL (nullable)
  accuracy            REAL (nullable)
  projectile_speed    REAL (nullable)

physics
  id            INTEGER PK
  unit_id       INTEGER FK → unit.id UNIQUE
  mass          REAL (nullable)           -- kg
  max_speed     REAL (nullable)           -- meters per second
  turn_rate     REAL (nullable)
  elevation     REAL (nullable)

wreckage
  id            INTEGER PK
  unit_id       INTEGER FK → unit.id UNIQUE
  health        REAL (nullable)
  mass          REAL (nullable)
  crash_damge REAL (nullable)
  -- Only for vehicles and aircraft do crash damge. MCU and infantry: wreckage = null. the MCu blow up

unit_economy
  id              INTEGER PK
  unit_id         INTEGER FK → unit.id UNIQUE
  build_rate      REAL (nullable)         -- for engineers only
  mass_storage    REAL (nullable) 
  energy_storage  REAL (nullable)
```

---

### 3.3 Buildings

```
building
  id                INTEGER PK
  faction_id        INTEGER FK → faction.id
  building_type_id  INTEGER FK → building_type.id
  armor_type_id     INTEGER FK → armor_type.id (nullable)
  name              TEXT NOT NULL
  description       TEXT
  lore              TEXT
  building_icon     TEXT                  -- path or URL to image
  tier              INTEGER (nullable)
  cost              INTEGER (nullable)
  build_time        INTEGER (nullable)    -- seconds
  population        INTEGER DEFAULT 0
  health            INTEGER
  armor             REAL (nullable)
  vision_range      TEXT (nullable)       -- "Short", "Medium", "Large"
  is_placeholder    BOOLEAN DEFAULT false
  version           INTEGER DEFAULT 1
  created_at        DATETIME DEFAULT now
  updated_at        DATETIME DEFAULT now
  created_by        INTEGER FK → user.id (nullable)
  updated_by        INTEGER FK → user.id (nullable)

building_tag
  id          INTEGER PK
  building_id INTEGER FK → building.id
  tag         TEXT NOT NULL

building_trait
  id          INTEGER PK
  building_id INTEGER FK → building.id
  trait       TEXT NOT NULL
  sort_order  INTEGER DEFAULT 0

building_economy
  id              INTEGER PK
  building_id     INTEGER FK → building.id UNIQUE
  mass_gain       REAL (nullable)         -- per second income
  power_gain      REAL (nullable)         -- per second income
  power_drain     REAL (nullable)         -- per second drain
  mass_drain      REAL (nullable)         -- per second drain
  mass_storage    REAL (nullable)         -- total storage capacity
  power_storage   REAL (nullable)         -- total storage capacity

-- weapons, abilities, skill_upgrades reuse the shared tables above
-- with owner_type = 'building' and owner_id = building.id
```

---

### 3.4 Research tree

```
research
  id              INTEGER PK
  faction_id      INTEGER FK → faction.id (nullable — null = cross-faction/shared)
  name            TEXT NOT NULL
  description     TEXT
  lore            TEXT
  tier            INTEGER
  cost            INTEGER (nullable)
  research_time   INTEGER (nullable)      -- seconds
  icon            TEXT
  scope           TEXT DEFAULT 'unique'   -- 'shared' or 'unique'
  is_placeholder  BOOLEAN DEFAULT false
  created_at      DATETIME DEFAULT now
  updated_at      DATETIME DEFAULT now
  created_by      INTEGER FK → user.id (nullable)
  updated_by      INTEGER FK → user.id (nullable)

research_prerequisite
  id                INTEGER PK
  research_id       INTEGER FK → research.id
  prerequisite_id   INTEGER FK → research.id
  -- Self-referencing: "research X requires research Y first"

research_effect
  id            INTEGER PK
  research_id   INTEGER FK → research.id
  target_type   TEXT NOT NULL             -- 'unit', 'building', 'faction'
  target_id     INTEGER (nullable)        -- id of the affected entity
  field         TEXT NOT NULL             -- e.g. 'health', 'damage', 'fire_rate'
  modifier      REAL NOT NULL             -- e.g. 1.2 = 20% increase
  modifier_type TEXT DEFAULT 'multiply'   -- 'multiply', 'add', 'set'
```

---

### 3.5 Leaders

Each faction has multiple leaders. Each leader has a tree type (Economy, Military, Technology, etc.), a quote, lore, an optional hero unit name, and 6 unlockable skills.

```
leader
  id            INTEGER PK
  faction_id    INTEGER FK → faction.id
  name          TEXT NOT NULL
  leader_type   TEXT                      -- e.g. "Political Leader", "Field Commander"
  tree_type     TEXT                      -- e.g. "Economy", "Military", "Technology"
  subheader     TEXT (nullable)           -- faction tagline shown on leader card
  quote         TEXT (nullable)           -- leader's signature quote
  hero_unit     TEXT (nullable)           -- name of the hero unit this leader deploys
  portrait      TEXT (nullable)           -- path or URL to portrait image
  lore          TEXT (nullable)
  is_placeholder BOOLEAN DEFAULT false
  created_at    DATETIME DEFAULT now
  updated_at    DATETIME DEFAULT now

leader_skill
  id            INTEGER PK
  leader_id     INTEGER FK → leader.id
  unlock        INTEGER NOT NULL          -- 1–6 (unlock order)
  branch        TEXT (nullable)           -- e.g. "Military", "Hero", "Economy", "Intel"
  name          TEXT (nullable)
  skill_type    TEXT (nullable)           -- 'Active' or 'Passive'
  cooldown      INTEGER (nullable)        -- seconds, null for passives
  duration      INTEGER (nullable)        -- seconds, null if instant/permanent
  description   TEXT (nullable)
  is_placeholder BOOLEAN DEFAULT false
  notes         TEXT (nullable)

leader_passive
  id            INTEGER PK
  leader_id     INTEGER FK → leader.id
  description   TEXT NOT NULL             -- human-readable passive bonus
  target_type   TEXT (nullable)           -- 'unit', 'building', null = global
  target_id     INTEGER (nullable)
  field         TEXT (nullable)           -- stat it affects
  modifier      REAL (nullable)
  modifier_type TEXT DEFAULT 'multiply'   -- 'multiply', 'add', 'set'
```

**Current leader roster:**

| Faction | Leader | Tree | Status |
|---|---|---|---|
| UDF | President Enhet | Economy | Skills are placeholders |
| UDF | Commander Hawk | Military | Complete |
| UDF | IQ (Iris Quantum) | Technology | Complete |
| Sakupen | Kizer | Melee Aggressive | Complete |
| Sakupen | E-11 | Control | Complete |
| Sakupen | 3C (Commander Class Chassis) | Economy | Complete |
| The Storm | Amalgam | Melee Swarm | Complete |
| The Storm | {placeholder} | Melee Swarm | Full placeholder |
| The Storm | Phantoms | Economy Control | Complete |
| The Bog | — | — | Needs placeholder entries |
| The Trogs | — | — | Needs placeholder entries |

---

### 3.6 Auth & changelog

```
user
  id              INTEGER PK
  username        TEXT NOT NULL UNIQUE
  email           TEXT NOT NULL UNIQUE
  password_hash   TEXT NOT NULL
  role            TEXT DEFAULT 'admin'    -- 'admin' or 'superadmin'
  is_active       BOOLEAN DEFAULT true
  created_at      DATETIME DEFAULT now
  last_login      DATETIME (nullable)

changelog
  id            INTEGER PK
  entity_type   TEXT NOT NULL             -- 'unit', 'building', 'research', 'leader'
  entity_id     INTEGER NOT NULL
  entity_name   TEXT NOT NULL             -- snapshot of name at time of change
  changed_by    INTEGER FK → user.id
  action        TEXT NOT NULL             -- 'create', 'update', 'delete'
  field_changed TEXT (nullable)           -- null for create/delete
  old_value     TEXT (nullable)
  new_value     TEXT (nullable)
  patch_version TEXT (nullable)
  changed_at    DATETIME DEFAULT now
```

---

## 4. API Routes

### Auth
```
POST   /api/auth/login            -- username + password → JWT cookie
POST   /api/auth/logout           -- clear cookie
GET    /api/auth/me               -- return current user info
POST   /api/auth/verify-pin       -- verify action PIN, returns short-lived PIN token
POST   /api/admin/users           -- superadmin only: create new admin
DELETE /api/admin/users/{id}      -- superadmin only: deactivate admin
```

### Units
```
GET    /api/units                 -- list all (filters: faction, type, tier, tag, search, is_placeholder)
GET    /api/units/{id}            -- full unit detail with all related data
POST   /api/units                 -- admin + PIN
PUT    /api/units/{id}            -- admin + PIN
DELETE /api/units/{id}            -- admin + PIN
GET    /api/units/compare?ids=1,2 -- two units side by side
```

### Buildings
```
GET    /api/buildings             -- list all (filters: faction, type, tier, tag, search)
GET    /api/buildings/{id}        -- full detail with economy, weapons, abilities, upgrades
POST   /api/buildings             -- admin + PIN
PUT    /api/buildings/{id}        -- admin + PIN
DELETE /api/buildings/{id}        -- admin + PIN
```

### Research
```
GET    /api/research              -- list all
GET    /api/research/{id}         -- detail with prerequisites + effects
POST   /api/research              -- admin + PIN
PUT    /api/research/{id}         -- admin + PIN
DELETE /api/research/{id}         -- admin + PIN
GET    /api/research/tree/{faction_id}  -- returns tree structure for visual render
```

### Leaders & Factions
```
GET    /api/factions              -- list all factions with leader count
GET    /api/factions/{id}         -- faction detail with all leaders
POST   /api/factions              -- admin + PIN
PUT    /api/factions/{id}         -- admin + PIN
GET    /api/leaders               -- list all leaders (filter by faction)
GET    /api/leaders/{id}          -- full leader detail with skills + passives
POST   /api/leaders               -- admin + PIN
PUT    /api/leaders/{id}          -- admin + PIN
DELETE /api/leaders/{id}          -- admin + PIN
```

### Changelog
```
GET    /api/changelog             -- admin only; filter by entity_type, entity_id, date range
```

### Seed
```
POST   /api/seed                  -- superadmin only: seed DB from all JSON files
```

---

## 5. Frontend Pages & Routes

```
/                           → Home: faction overview cards
/units                      → Unit browser: sidebar list + detail panel (spooky-db style)
/units/:id                  → Unit detail deep link
/units/compare              → Side-by-side stat comparison tool
/buildings                  → Building browser: same sidebar layout as units
/buildings/:id              → Building detail
/research                   → Research tree: visual node diagram, per-faction tab
/factions                   → All factions overview
/factions/:id               → Single faction: leaders, lore, color, unit count
/leaders/:id                → Single leader detail: portrait, quote, lore, skill tree
/admin                      → Admin dashboard: entity counts, recent changelog, quick links
/admin/units/new            → Create unit (long form)
/admin/units/:id/edit       → Edit unit
/admin/buildings/new        → Create building
/admin/buildings/:id/edit   → Edit building
/admin/research/new         → Create research item
/admin/research/:id/edit    → Edit research item
/admin/leaders/new          → Create leader
/admin/leaders/:id/edit     → Edit leader
/admin/changelog            → Full changelog viewer with filters
/admin/users                → Admin user management (superadmin only)
/login                      → Login page
```

---

## 6. Auth & PIN Flow

1. Admin navigates to any edit/create/delete action
2. If not logged in → redirect to `/login`
3. If logged in → edit/create/delete buttons are visible
4. Before any write is committed → modal appears: "Enter action PIN to confirm"
5. PIN stored in backend `.env` as `ACTION_PIN=your_secret` — change it manually anytime
6. `POST /api/auth/verify-pin` checks it server-side, returns a short-lived PIN token (5 min)
7. Write request sends both the JWT (who you are) and the PIN token (you just confirmed)
8. PIN token expires after 5 min → next write requires PIN again

---

## 7. Build Plan — Phases

### Phase 1 — Backend foundation
- FastAPI project structure (see folder layout below)
- SQLAlchemy models for all tables
- Alembic migrations (first migration = all tables)
- SQLite database (`rts.db`)
- Seed script that reads `units.json`, `buildings.json`, `leaders.json`
- Auth: JWT login, logout, `/me` endpoint
- PIN verification endpoint

**Ship:** Backend runs locally, DB seeded, auth works in Postman

---

### Phase 2 — Unit API + React unit browser
- All unit CRUD endpoints with full response schemas
- React (Vite) + React Router setup
- Unit browser: sidebar list + detail panel, spooky-db style
- Filters: faction, type, tier, tag, search bar
- Unit detail: stats, weapons, abilities, skill upgrades, veterancy, physics, wreckage
- Public read-only — no auth UI yet

**Ship:** You and your friend can browse all units in the browser

---

### Phase 3 — Admin auth UI + unit forms
- Login page + JWT cookie handling
- `ProtectedRoute` component (redirect if not logged in)
- Lock icon on unit detail → Edit button when logged in
- Create/edit unit form (one long form, all sections)
- PIN modal before every save/delete
- Changelog entry written on every mutation

**Ship:** Full admin CRUD on units with PIN protection and change history

---

### Phase 4 — Buildings
- Building models, seed from `buildings.json`
- Building CRUD endpoints
- Building browser page (same sidebar layout)
- Admin create/edit/delete building forms

**Ship:** Buildings browsable and fully editable

---

### Phase 5 — Research tree
- Research models + prerequisite self-reference
- Research CRUD endpoints + tree endpoint
- Visual tech tree page (React + `react-flow`)
- Per-faction tabs
- Admin: create research items, link prerequisites

**Ship:** Clickable visual research tree per faction

---

### Phase 6 — Leaders & factions
- Leader + leader_skill + leader_passive models
- Seed from `leaders.json`
- Leader CRUD endpoints
- Faction page: all leaders, lore, color
- Leader detail: portrait, quote, lore, 6-skill tree display
- Admin: create/edit leader forms

**Ship:** Full faction and leader pages

---

### Phase 7 — Polish & migrate
- Unit comparison tool (side-by-side stat view)
- Admin dashboard (changelog feed, entity counts per faction)
- Admin user management page (superadmin only)
- Migrate SQLite → PostgreSQL
- Test Alembic migration against Postgres
- Write README with setup instructions

**Ship:** Production-ready, move to hosting when ready

---

## 8. Project Folder Structure

```
rts-db/
├── units.json                    ← unit seed data
├── buildings.json                ← building seed data
├── leaders.json                  ← leader seed data
├── README.md
│
├── backend/
│   ├── main.py                   ← FastAPI app, router registration
│   ├── database.py               ← SQLAlchemy engine + session + Base
│   ├── models/
│   │   ├── __init__.py
│   │   ├── unit.py               ← Unit, UnitTag, UnitTrait, Physics, Wreckage, UnitEconomy
│   │   ├── shared.py             ← Weapon, Ability, SkillUpgrade (owner_type pattern)
│   │   ├── veterancy.py          ← VeterancyLevel, VeterancyWeapon
│   │   ├── building.py           ← Building, BuildingTag, BuildingTrait, BuildingEconomy
│   │   ├── research.py           ← Research, ResearchPrerequisite, ResearchEffect
│   │   ├── leader.py             ← Leader, LeaderSkill, LeaderPassive
│   │   ├── user.py               ← User
│   │   └── changelog.py          ← Changelog
│   ├── routers/
│   │   ├── auth.py               ← login, logout, me, verify-pin
│   │   ├── units.py
│   │   ├── buildings.py
│   │   ├── research.py
│   │   ├── leaders.py
│   │   ├── factions.py
│   │   └── changelog.py
│   ├── schemas/
│   │   ├── unit.py               ← Pydantic request/response models
│   │   ├── building.py
│   │   ├── research.py
│   │   ├── leader.py
│   │   └── user.py
│   ├── seed/
│   │   ├── seed.py               ← orchestrates all seed files
│   │   ├── seed_units.py
│   │   ├── seed_buildings.py
│   │   └── seed_leaders.py
│   ├── auth/
│   │   ├── jwt.py                ← token creation + verification
│   │   └── pin.py                ← PIN check + short-lived PIN token
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   ├── .env                      ← secrets (never commit this)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Units.jsx
    │   │   ├── UnitDetail.jsx
    │   │   ├── Compare.jsx
    │   │   ├── Buildings.jsx
    │   │   ├── BuildingDetail.jsx
    │   │   ├── Research.jsx
    │   │   ├── Factions.jsx
    │   │   ├── FactionDetail.jsx
    │   │   ├── LeaderDetail.jsx
    │   │   ├── Login.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx
    │   │       ├── UnitForm.jsx
    │   │       ├── BuildingForm.jsx
    │   │       ├── ResearchForm.jsx
    │   │       ├── LeaderForm.jsx
    │   │       ├── Changelog.jsx
    │   │       └── Users.jsx
    │   ├── components/
    │   │   ├── Sidebar.jsx           ← shared sidebar for units/buildings
    │   │   ├── DetailPanel.jsx       ← shared detail panel
    │   │   ├── StatBlock.jsx         ← reusable stat row component
    │   │   ├── WeaponCard.jsx
    │   │   ├── AbilityCard.jsx
    │   │   ├── SkillUpgradeList.jsx
    │   │   ├── VeterancyTable.jsx
    │   │   ├── LeaderSkillTree.jsx   ← 6-skill unlock display
    │   │   ├── ResearchTree.jsx      ← react-flow visual tree
    │   │   ├── PINModal.jsx
    │   │   ├── ComparePanel.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── api/
    │   │   └── client.js             ← axios instance with base URL + interceptors
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── vite.config.js
```

---

## 9. Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| DB (dev) | SQLite | Zero setup, file-based, easy to reset |
| DB (prod) | PostgreSQL | pgAdmin support, production-grade |
| ORM | SQLAlchemy 2.0 | Python standard, works with both DBs via same models |
| Migrations | Alembic | Pairs with SQLAlchemy, clean SQLite→Postgres path |
| Auth | JWT in httpOnly cookie | Secure, no localStorage needed |
| PIN storage | `.env` file | Simple, manually rotatable anytime |
| Weapon/Ability/SkillUpgrade | Shared tables with owner_type | Avoids duplicating identical tables for units and buildings |
| Frontend state | React Context + useState | No need for Redux at this scale |
| Graph library | react-flow | Best React lib for visual node trees |
| HTTP client | Axios | Interceptors make auth headers easy |
| CSS | Tailwind CSS | Fast to build, easy to customize |

---

## 10. .env Template

```
# Backend .env — never commit this file
DATABASE_URL=sqlite:///./rts.db
SECRET_KEY=your_jwt_secret_here
ACTION_PIN=your_action_pin_here
ACCESS_TOKEN_EXPIRE_MINUTES=60
PIN_TOKEN_EXPIRE_MINUTES=5
FIRST_SUPERADMIN_EMAIL=you@example.com
FIRST_SUPERADMIN_PASSWORD=your_password_here
```

---

## 11. Phase 1 Checklist — Start Here

```
[x] Verify frontend scaffold: React (Vite) app exists (src/, package.json, vite.config.js)
[ ] pip install backend dependencies: fastapi uvicorn sqlalchemy alembic python-jose passlib python-dotenv bcrypt
[ ] Create `backend/database.py` — SQLAlchemy engine, session factory, Base
[ ] Implement models:
  - `backend/models/unit.py` — Unit + UnitTag, UnitTrait, Physics, Wreckage, UnitEconomy
  - `backend/models/shared.py` — Weapon, Ability, SkillUpgrade (owner_type pattern)
  - `backend/models/veterancy.py` — VeterancyLevel, VeterancyWeapon
  - `backend/models/building.py` — Building + tags/traits/economy
  - `backend/models/leader.py` — Leader, LeaderSkill, LeaderPassive
  - `backend/models/user.py` — User model + password helpers
  - `backend/models/changelog.py` — Changelog schema
[ ] Initialize Alembic: `alembic init alembic` and configure `alembic/env.py` to import models
[ ] Create initial migration: `alembic revision --autogenerate -m "initial schema"`
[ ] Apply migrations: `alembic upgrade head` (verify sqlite `rts.db` created)
[ ] Write seed scripts:
  - `backend/seed/seed_units.py` — reads `units.json` and creates unit records
  - `backend/seed/seed_buildings.py` — reads `buildings.json`
  - `backend/seed/seed_leaders.py` — reads `leaders.json` (add Bog + Trogs placeholders first)
  - `backend/seed/seed.py` — orchestrates all seed scripts
[ ] Add placeholder leader entries for The Bog and The Trogs to `leaders.json` to prevent seed errors
[ ] Implement auth helpers:
  - `backend/auth/jwt.py` — JWT create/verify helpers
  - `backend/auth/pin.py` — ACTION_PIN verification + short-lived PIN token
[ ] Implement routers: `backend/routers/auth.py` (login, logout, me, verify-pin) and unit/building/research/leader routers
[ ] Add `POST /api/seed` (superadmin-only) to run the seed scripts safely
[ ] Test backend endpoints locally (Postman or `httpie`) and run seed against a fresh DB
[ ] Document backend setup and run steps in README (`backend/README.md` suggestion)
```