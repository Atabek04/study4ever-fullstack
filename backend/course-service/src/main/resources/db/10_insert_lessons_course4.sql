-- Lessons for Module 16: Introduction to Databases
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (46, 'What is a Database?', 'Definition and types of databases.', 'https://example.com/db-intro', 10, 1, 16),
  (47, 'Database Management Systems', 'Overview of DBMS.', 'https://example.com/dbms', 12, 2, 16),
  (48, 'Relational vs Non-Relational', 'Comparing database models.', 'https://example.com/db-rel-vs-nonrel', 14, 3, 16);

-- Lessons for Module 17: Relational Model and SQL Basics
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (49, 'Relational Model Concepts', 'Understanding the relational model.', 'https://example.com/db-relational', 15, 1, 17),
  (50, 'SQL Basics', 'Introduction to SQL syntax.', 'https://example.com/db-sql-basics', 18, 2, 17),
  (51, 'CRUD Operations', 'Performing CRUD with SQL.', 'https://example.com/db-crud', 13, 3, 17);

-- Lessons for Module 18: Database Normalization
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (52, 'What is Normalization?', 'Purpose and process of normalization.', 'https://example.com/db-normalization', 12, 1, 18),
  (53, 'Normal Forms', '1NF, 2NF, 3NF explained.', 'https://example.com/db-normal-forms', 16, 2, 18),
  (54, 'Denormalization', 'When and why to denormalize.', 'https://example.com/db-denormalization', 14, 3, 18);

-- Lessons for Module 19: Advanced SQL and Indexing
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (55, 'Advanced SQL Queries', 'Joins, subqueries, and more.', 'https://example.com/db-advanced-sql', 18, 1, 19),
  (56, 'Indexes in PostgreSQL', 'How and why to use indexes.', 'https://example.com/db-indexes', 15, 2, 19),
  (57, 'Query Optimization', 'Tips for optimizing queries.', 'https://example.com/db-optimization', 17, 3, 19);

-- Lessons for Module 20: PostgreSQL Administration
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (58, 'User and Role Management', 'Managing users and roles.', 'https://example.com/db-users', 14, 1, 20),
  (59, 'Backup and Restore', 'How to backup and restore databases.', 'https://example.com/db-backup', 16, 2, 20),
  (60, 'Monitoring and Security', 'Monitoring and securing PostgreSQL.', 'https://example.com/db-security', 15, 3, 20);

-- Update the sequence for lesson id to avoid conflicts with Hibernate auto-increment
SELECT setval('lesson_id_seq', 60, true);
