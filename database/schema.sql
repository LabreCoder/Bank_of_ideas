-- ============================================================
-- OWNER: people who can be assigned as an idea's "dono"
-- ============================================================
CREATE TABLE owner (
    id SERIAL PRIMARY KEY,          -- SERIAL = auto-incrementing, matches "Automático pelo sistema"
    name VARCHAR NOT NULL
);

-- ============================================================
-- CATEGORY: dropdown options for ideas, extensible on the fly
-- ============================================================
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR(200)
);

-- ============================================================
-- IDEA
-- Notes on design decisions vs. the original schema:
--   - "status" (Waiting/Doing/Done) was REMOVED. The new
--     "Status de Execução" (Livre / Em Planejamento) is NOT
--     stored here — it's derived by checking whether a row
--     exists in `planning` for this idea (see query pattern below).
--   - "is_active" added for the Ativa/Inativa toggle.
--   - "created_at" / "created_by" added, both filled automatically.
--     NOTE: since there's no authentication system yet, created_by
--     references `owner` as a placeholder for "the current user".
--     Once auth exists, this should point to a proper users table.
-- ============================================================
CREATE TABLE idea (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description VARCHAR(200),
    category_id INTEGER REFERENCES category(id),
    owner_id INTEGER NOT NULL REFERENCES owner(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES owner(id)
);

-- ============================================================
-- PLANNING
-- One planning record per idea (UNIQUE on idea_id) for the MVP.
-- If later you need to re-plan an idea multiple times, drop the
-- UNIQUE constraint and adjust the "Livre" check accordingly.
-- ============================================================
CREATE TABLE planning (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER NOT NULL UNIQUE REFERENCES idea(id),
    details TEXT,                       -- "Detalhamento"
    start_date DATE,                    -- "Data de Início"
    due_date DATE,                      -- "Data de Entrega"
    status VARCHAR NOT NULL DEFAULT 'Not Started',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PLANNING CHECKLIST ITEMS
-- One-to-many: each planning row can have several checklist tasks.
-- ============================================================
CREATE TABLE planning_checklist_item (
    id SERIAL PRIMARY KEY,
    planning_id INTEGER NOT NULL REFERENCES planning(id) ON DELETE CASCADE,
    description VARCHAR NOT NULL,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    position INTEGER NOT NULL DEFAULT 0   -- controls display order in the checklist
);

-- ============================================================
-- Example query: how "Status de Execução" gets derived
-- (this is what the Ideas listing endpoint will use)
-- ============================================================
-- SELECT
--     idea.*,
--     CASE WHEN planning.id IS NULL THEN 'Livre' ELSE 'Em Planejamento' END AS execution_status
-- FROM idea
-- LEFT JOIN planning ON planning.idea_id = idea.id;