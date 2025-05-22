-- Modules for Course 5: Machine Learning Fundamentals
INSERT INTO module (id, title, sort_order, course_id)
VALUES
  (21, 'Introduction to Machine Learning', 1, 5),
  (22, 'Supervised Learning', 2, 5),
  (23, 'Unsupervised Learning', 3, 5),
  (24, 'Model Evaluation and Selection', 4, 5),
  (25, 'Machine Learning with Python', 5, 5);

-- Update the sequence for module id to avoid conflicts with Hibernate auto-increment
SELECT setval('module_id_seq', 25, true);
