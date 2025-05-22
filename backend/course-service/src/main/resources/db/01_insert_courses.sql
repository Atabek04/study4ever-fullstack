-- Insert 5 courses (skipping tags)
INSERT INTO course (id, title, description, instructor_id, created_date, last_updated_date)
VALUES
  (1, 'Introduction to Java Programming', 'Learn the basics of Java programming including syntax, OOP, and core libraries.', '95170acc-e1f8-4382-8f9e-f83d314a1978', NOW(), NOW()),
  (2, 'Web Development with React', 'Build modern web applications using React, hooks, and state management.', '3fb83571-6452-4bf9-8bd7-028e0f7e37db', NOW(), NOW()),
  (3, 'Data Structures and Algorithms', 'Master essential data structures and algorithms for technical interviews.', 'e5fa689c-c878-48a8-98a6-b18fc24f25f2', NOW(), NOW()),
  (4, 'Database Design with PostgreSQL', 'Design and implement relational databases using PostgreSQL.', 'ecb57808-2ceb-4f79-82ab-d12fddcb0289', NOW(), NOW()),
  (5, 'Machine Learning Fundamentals', 'An introduction to machine learning concepts, models, and Python libraries.', '51c28af9-eade-44b1-a735-6a748d9d40c0', NOW(), NOW());

-- Update the sequence for course id to avoid conflicts with Hibernate auto-increment
SELECT setval('course_id_seq', 5, true);
