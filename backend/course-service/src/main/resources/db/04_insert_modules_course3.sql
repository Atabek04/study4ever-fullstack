-- Modules for Course 3: Data Structures and Algorithms
INSERT INTO module (id, title, sort_order, course_id)
VALUES
  (11, 'Introduction to Data Structures', 1, 3),
  (12, 'Arrays and Linked Lists', 2, 3),
  (13, 'Stacks and Queues', 3, 3),
  (14, 'Trees and Graphs', 4, 3),
  (15, 'Sorting and Searching Algorithms', 5, 3);

-- Update the sequence for module id to avoid conflicts with Hibernate auto-increment
SELECT setval('module_id_seq', 15, true);
