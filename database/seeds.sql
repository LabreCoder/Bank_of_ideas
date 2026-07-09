-- ============================================================
-- OWNERS
-- ============================================================
INSERT INTO owner (name) VALUES
    ('João Vitor'),
    ('Maria Souza');

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO category (name, description) VALUES
    ('Cibersegurança', 'Conteúdos sobre hacking ético, pentest e boas práticas de segurança'),
    ('Desenvolvimento Backend', 'Conteúdos sobre Python, FastAPI e arquitetura de sistemas'),
    ('Desenvolvimento Frontend', 'Conteúdos sobre React, UI e experiência do usuário');

-- ============================================================
-- IDEAS
-- (category_id and owner_id below assume the inserts above ran
-- in order and got ids 1, 2, 3 / 1, 2 respectively)
-- ============================================================
INSERT INTO idea (name, description, category_id, owner_id, created_by) VALUES
    ('5 dicas de segurança para APIs REST', 'Post curto com boas práticas de hardening', 1, 1, 1),
    ('Como estruturar um projeto FastAPI em camadas', 'Explicar a separação entre schemas, models e services', 2, 1, 1),
    ('Bastidores do Content Planner', 'Mostrar como o projeto está sendo construído, dev-log style', 3, 2, 2);

-- ============================================================
-- PLANNING
-- Linking idea #1 to a planning row is what makes it show up as
-- "In Planning" — ideas #2 and #3 stay "Free" since nothing
-- references them here.
-- ============================================================
INSERT INTO planning (idea_id, details, start_date, due_date, status) VALUES
    (1, 'Detalhar os 5 pontos principais e revisar antes de publicar', '2026-07-10', '2026-07-15', 'In Development');

-- ============================================================
-- PLANNING CHECKLIST ITEMS
-- (planning_id below assumes the insert above got id 1)
-- ============================================================
INSERT INTO planning_checklist_item (planning_id, description, is_done, position) VALUES
    (1, 'Escrever rascunho do texto', TRUE, 0),
    (1, 'Revisar gramática e clareza', FALSE, 1),
    (1, 'Criar imagem de capa', FALSE, 2);