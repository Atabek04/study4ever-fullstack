-- Modules for Course 1: Introduction to Java Programming
INSERT INTO module (id, title, sort_order, course_id)
VALUES
  (1, 'Getting Started with Java', 1, 1),
  (2, 'Java Syntax and Basics', 2, 1),
  (3, 'Object-Oriented Programming in Java', 3, 1),
  (4, 'Java Collections Framework', 4, 1),
  (5, 'Exception Handling and File I/O', 5, 1);

-- Update the sequence for module id to avoid conflicts with Hibernate auto-increment
SELECT setval('module_id_seq', 5, true);
