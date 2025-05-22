-- Lessons for Module 21: Introduction to Machine Learning
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (61, 'What is Machine Learning?', 'Definition and history of machine learning.', 'https://example.com/ml-intro', 10, 1, 21),
  (62, 'Types of Machine Learning', 'Supervised, unsupervised, and reinforcement learning.', 'https://example.com/ml-types', 12, 2, 21),
  (63, 'Applications of ML', 'Real-world applications of machine learning.', 'https://example.com/ml-applications', 14, 3, 21);

-- Lessons for Module 22: Supervised Learning
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (64, 'Regression Algorithms', 'Introduction to regression.', 'https://example.com/ml-regression', 15, 1, 22),
  (65, 'Classification Algorithms', 'Introduction to classification.', 'https://example.com/ml-classification', 18, 2, 22),
  (66, 'Model Evaluation Metrics', 'Metrics for evaluating supervised models.', 'https://example.com/ml-metrics', 13, 3, 22);

-- Lessons for Module 23: Unsupervised Learning
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (67, 'Clustering Algorithms', 'Introduction to clustering.', 'https://example.com/ml-clustering', 14, 1, 23),
  (68, 'Dimensionality Reduction', 'Techniques for reducing dimensions.', 'https://example.com/ml-dim-reduction', 16, 2, 23),
  (69, 'Association Rule Learning', 'Finding associations in data.', 'https://example.com/ml-association', 12, 3, 23);

-- Lessons for Module 24: Model Evaluation and Selection
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (70, 'Cross-Validation', 'How to use cross-validation.', 'https://example.com/ml-crossval', 15, 1, 24),
  (71, 'Bias-Variance Tradeoff', 'Understanding bias and variance.', 'https://example.com/ml-bias-variance', 13, 2, 24),
  (72, 'Model Selection Techniques', 'Choosing the best model.', 'https://example.com/ml-model-selection', 17, 3, 24);

-- Lessons for Module 25: Machine Learning with Python
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (73, 'Python for ML', 'Setting up Python for machine learning.', 'https://example.com/ml-python-setup', 14, 1, 25),
  (74, 'Using scikit-learn', 'Introduction to scikit-learn.', 'https://example.com/ml-scikit', 18, 2, 25),
  (75, 'Building a Simple ML Project', 'End-to-end ML project example.', 'https://example.com/ml-project', 20, 3, 25);

-- Update the sequence for lesson id to avoid conflicts with Hibernate auto-increment
SELECT setval('lesson_id_seq', 75, true);
