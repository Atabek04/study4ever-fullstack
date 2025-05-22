-- Modules for Course 2: Web Development with React
INSERT INTO module (id, title, sort_order, course_id)
VALUES
  (6, 'Introduction to React', 1, 2),
  (7, 'Components and Props', 2, 2),
  (8, 'State and Lifecycle', 3, 2),
  (9, 'Hooks in React', 4, 2),
  (10, 'Routing and State Management', 5, 2);

-- Update the sequence for module id to avoid conflicts with Hibernate auto-increment
SELECT setval('module_id_seq', 10, true);
