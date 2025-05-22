-- Modules for Course 4: Database Design with PostgreSQL
INSERT INTO module (id, title, sort_order, course_id)
VALUES
  (16, 'Introduction to Databases', 1, 4),
  (17, 'Relational Model and SQL Basics', 2, 4),
  (18, 'Database Normalization', 3, 4),
  (19, 'Advanced SQL and Indexing', 4, 4),
  (20, 'PostgreSQL Administration', 5, 4);

-- Update the sequence for module id to avoid conflicts with Hibernate auto-increment
SELECT setval('module_id_seq', 20, true);
