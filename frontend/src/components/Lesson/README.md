# LinkedIn Learning-Inspired Lesson Page

This implementation provides a modern, responsive lesson viewing experience inspired by LinkedIn Learning. The page features a persistent sidebar for navigating course modules and lessons, with a main content area for viewing lesson materials including video and text content.

## Features

### Phase 1: Sidebar Structure & Lesson Navigation ✓
- Persistent left sidebar listing all modules and lessons
- Sidebar collapses on mobile for better space utilization
- Modules displayed as non-clickable section headers
- Lessons displayed as clickable menu items with title and duration
- Visual grouping of lessons under their respective modules
- Completed lessons show a checkmark/tick
- Each lesson has a bookmark icon for saving to a personal list
- Selected lesson is highlighted in the sidebar

### Phase 2: Main Content Area ✓
- Video player for lesson videos
- Markdown rendering for lesson notes and content
- Lesson navigation with previous/next buttons
- Actions to mark lessons as complete/incomplete
- Actions to bookmark/unbookmark lessons

### Upcoming Phases:
- Phase 3: Backend Integration ✓
  - Use correct API endpoints for progress tracking
  - Implement instructor information display
  - Handle bookmarks across sessions
  - Create Bookmarks page to view all saved lessons
- Phase 4: UI polish, accessibility improvements, and responsiveness refinements

## Installation

1. Install the required dependencies:
```bash
npm install
```

2. If you added the react-markdown dependency separately, install it:
```bash
npm install react-markdown --save
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Navigate to a course lesson page at:
```
/courses/:courseId/lessons/:lessonId
```

## API Endpoints

The implementation uses the following endpoints:

### Course Structure and Details
- `GET /api/v1/courses/:courseId/details` - Fetch course structure with modules and lessons
- `GET /api/v1/modules/:moduleId` - Fetch details about a specific module
- `GET /api/v1/lessons/:lessonId` - Fetch individual lesson details
- `GET /api/v1/courses/:courseId/completed` - Get all completed lessons for a course

### Progress Tracking
- `POST /api/v1/courses/:courseId/modules/:moduleId/progress?totalLessonsCount={count}` - Initialize module progress  
- `POST /api/v1/courses/:courseId/modules/:moduleId/lessons/:lessonId/progress` - Initialize lesson progress
- `PUT /api/v1/courses/:courseId/modules/:moduleId/lessons/:lessonId/progress/complete` - Mark a lesson as complete
- `GET /api/v1/courses/:courseId/modules/:moduleId/progress` - Get progress for a specific module

### Instructor Information
- `GET /api/v1/admin/instructors/:instructorId` - Get instructor details (requires admin token)

## Technical Implementation

- React hooks for state management
- Material UI for components and styling
- Responsive design that works on mobile, tablet, and desktop
- Local storage for bookmarks to persist user preferences
