-- Lessons for Module 11: Introduction to Data Structures
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (31, 'What are Data Structures?', 'Overview and importance of data structures.', 'https://example.com/ds-intro', 10, 1, 11),
  (32, 'Abstract Data Types', 'Understanding abstract data types.', 'https://example.com/ds-adt', 12, 2, 11),
  (33, 'Choosing the Right Data Structure', 'How to select appropriate data structures.', 'https://example.com/ds-choose', 14, 3, 11);

-- Lessons for Module 12: Arrays and Linked Lists
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (34, 'Arrays in Depth', 'Working with arrays.', 'https://example.com/ds-arrays', 15, 1, 12),
  (35, 'Linked Lists Explained', 'Understanding linked lists.', 'https://example.com/ds-linkedlists', 18, 2, 12),
  (36, 'Array vs Linked List', 'Comparing arrays and linked lists.', 'https://example.com/ds-array-vs-ll', 13, 3, 12);

-- Lessons for Module 13: Stacks and Queues
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (37, 'Stacks: LIFO Structure', 'Introduction to stacks.', 'https://example.com/ds-stacks', 12, 1, 13),
  (38, 'Queues: FIFO Structure', 'Introduction to queues.', 'https://example.com/ds-queues', 14, 2, 13),
  (39, 'Applications of Stacks and Queues', 'Real-world uses.', 'https://example.com/ds-applications', 16, 3, 13);

-- Lessons for Module 14: Trees and Graphs
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (40, 'Tree Data Structures', 'Understanding trees.', 'https://example.com/ds-trees', 18, 1, 14),
  (41, 'Binary Trees and Traversals', 'Binary trees and traversal algorithms.', 'https://example.com/ds-binary-trees', 20, 2, 14),
  (42, 'Graphs and Their Representations', 'Introduction to graphs.', 'https://example.com/ds-graphs', 17, 3, 14);

-- Lessons for Module 15: Sorting and Searching Algorithms
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (43, 'Sorting Algorithms Overview', 'Common sorting algorithms.', 'https://example.com/ds-sorting', 15, 1, 15),
  (44, 'Searching Algorithms', 'Linear and binary search.', 'https://example.com/ds-searching', 13, 2, 15),
  (45, 'Algorithm Complexity', 'Time and space complexity.', 'https://example.com/ds-complexity', 16, 3, 15);

-- Update the sequence for lesson id to avoid conflicts with Hibernate auto-increment
SELECT setval('lesson_id_seq', 45, true);
