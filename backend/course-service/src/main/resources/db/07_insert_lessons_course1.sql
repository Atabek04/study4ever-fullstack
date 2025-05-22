-- Lessons for Module 1: Getting Started with Java
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (1, 'Introduction to Java', 'Overview of Java and its history.', 'https://www.youtube.com/watch?v=mG4NLNZ37y4&pp=ygUUSW50cm9kdWN0aW9uIHRvIEphdmHSBwkJjQkBhyohjO8%3D', 10, 1, 1),
  (2, 'Setting Up Java Development Environment', 'How to install JDK and set up your IDE.', 'https://example.com/java-setup', 15, 2, 1),
  (3, 'Writing Your First Java Program', 'Step-by-step guide to writing and running Hello World.', 'https://example.com/java-hello-world', 20, 3, 1);

-- Lessons for Module 2: Java Syntax and Basics
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (4, 'Java Syntax Overview', 'Basic syntax rules in Java.', 'https://example.com/java-syntax', 12, 1, 2),
  (5, 'Variables and Data Types', 'Understanding variables and data types.', 'https://example.com/java-variables', 18, 2, 2),
  (6, 'Operators and Expressions', 'Using operators and expressions in Java.', 'https://example.com/java-operators', 15, 3, 2);

-- Lessons for Module 3: Object-Oriented Programming in Java
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (7, 'Classes and Objects', 'Introduction to classes and objects.', 'https://example.com/java-classes', 20, 1, 3),
  (8, 'Inheritance and Polymorphism', 'Understanding inheritance and polymorphism.', 'https://example.com/java-inheritance', 22, 2, 3),
  (9, 'Encapsulation and Abstraction', 'Exploring encapsulation and abstraction.', 'https://example.com/java-encapsulation', 18, 3, 3);

-- Lessons for Module 4: Java Collections Framework
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (10, 'Introduction to Collections', 'Overview of Java Collections Framework.', 'https://example.com/java-collections', 15, 1, 4),
  (11, 'List, Set, and Map Interfaces', 'Working with List, Set, and Map.', 'https://example.com/java-list-set-map', 20, 2, 4),
  (12, 'Iterators and Streams', 'Using iterators and streams in Java.', 'https://example.com/java-iterators', 17, 3, 4);

-- Lessons for Module 5: Exception Handling and File I/O
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (13, 'Exception Handling Basics', 'How to handle exceptions in Java.', 'https://example.com/java-exceptions', 16, 1, 5),
  (14, 'Try-Catch and Finally', 'Using try-catch-finally blocks.', 'https://example.com/java-try-catch', 14, 2, 5),
  (15, 'File Input and Output', 'Reading and writing files in Java.', 'https://example.com/java-file-io', 19, 3, 5);

-- Update the sequence for lesson id to avoid conflicts with Hibernate auto-increment
SELECT setval('lesson_id_seq', 15, true);
