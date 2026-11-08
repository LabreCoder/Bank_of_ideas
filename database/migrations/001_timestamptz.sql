-- ============================================================
-- 001 — idea.created_at e planning.created_at passam a TIMESTAMPTZ
--
-- Antes: TIMESTAMP (sem fuso) no banco, DateTime(timezone=True) nos models.
-- A API devolvia datas "ingênuas" e o navegador as lia como hora local.
--
-- Os valores existentes foram gravados com NOW() num servidor em UTC
-- (SHOW timezone; -> UTC no container db), então são interpretados como UTC.
--
-- Aplicar (uma vez, em bancos criados antes desta mudança):
--   Get-Content database/migrations/001_timestamptz.sql | docker compose exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
-- Bancos novos já nascem com TIMESTAMPTZ pelo schema.sql.
-- ============================================================
BEGIN;

ALTER TABLE idea
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE planning
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN created_at SET DEFAULT NOW();

COMMIT;
