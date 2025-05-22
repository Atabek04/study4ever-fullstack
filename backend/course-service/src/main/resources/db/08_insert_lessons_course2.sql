-- Lessons for Module 6: Introduction to React
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (16, 'What is React?', 'Overview and history of React.', 'https://example.com/react-intro', 10, 1, 6),
  (17, 'Setting Up React Environment', 'How to set up a React project.', 'https://example.com/react-setup', 15, 2, 6),
  (18, 'JSX Basics', 'Introduction to JSX syntax.', 'https://example.com/react-jsx', 12, 3, 6);

-- Lessons for Module 7: Components and Props
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (19, 'Creating Components', 'How to create functional and class components.', 'https://example.com/react-components', 18, 1, 7),
  (20, 'Props in React', 'Passing data with props.', 'https://example.com/react-props', 14, 2, 7),
  (21, 'Component Composition', 'Composing components together.', 'https://example.com/react-composition', 16, 3, 7);

-- Lessons for Module 8: State and Lifecycle
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (22, 'State in React', 'Managing state in components.', 'https://example.com/react-state', 15, 1, 8),
  (23, 'Lifecycle Methods', 'Understanding lifecycle methods.', 'https://example.com/react-lifecycle', 17, 2, 8),
  (24, 'State Lifting', 'Lifting state up in React.', 'https://example.com/react-state-lifting', 13, 3, 8);

-- Lessons for Module 9: Hooks in React
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (25, 'Introduction to Hooks', 'What are hooks and why use them?', 'https://example.com/react-hooks', 12, 1, 9),
  (26, 'useState and useEffect', 'Using useState and useEffect hooks.', 'https://example.com/react-usestate-useeffect', 18, 2, 9),
  (27, 'Custom Hooks', 'Creating your own hooks.', 'https://example.com/react-custom-hooks', 16, 3, 9);

-- Lessons for Module 10: Routing and State Management
INSERT INTO lesson (id, title, content, video_url, duration_minutes, sort_order, module_id)
VALUES
  (28, 'React Router Basics', 'Setting up routing in React.', 'https://example.com/react-router', 14, 1, 10),
  (29, 'State Management Overview', 'Different approaches to state management.', 'https://example.com/react-state-management', 15, 2, 10),
  (30, 'Redux Introduction', 'Getting started with Redux.', 'https://example.com/react-redux', 20, 3, 10);

-- Update the sequence for lesson id to avoid conflicts with Hibernate auto-increment
SELECT setval('lesson_id_seq', 30, true);
