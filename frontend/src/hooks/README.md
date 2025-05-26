# Content Management Hooks

This directory contains hooks for managing the educational platform content. The hooks provide functions for CRUD operations on various entities.

## Available Hook Files

- `contentManagementHooks.js` - Central file containing hooks for all content types
- `moduleManagementHooks.js` - Hooks for module management
- `lessonManagementHooks.js` - Hooks for lesson management
- `instructorManagementHooks.js` - Hooks for instructor management
- `tagManagementHooks.js` - Hooks for tag management

## Migration from adminHooks.js

The `adminHooks.js` file has been deprecated and replaced with more specific hook files to improve code organization and readability.

### Mapping

- `fetchAdminCourses` -> `fetchAllCourses` (in contentManagementHooks.js)
- Course CRUD operations -> contentManagementHooks.js
- Instructor operations -> instructorManagementHooks.js
- Module operations -> moduleManagementHooks.js
- Lesson operations -> lessonManagementHooks.js
- Tag operations -> tagManagementHooks.js

## Usage Examples

```javascript
// For course management
import { 
  fetchAllCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse 
} from '../hooks/contentManagementHooks';

// For module management
import { 
  fetchAllModules, 
  createModule, 
  updateModule, 
  deleteModule 
} from '../hooks/moduleManagementHooks';

// For lesson management
import { 
  fetchAllLessons, 
  createLesson, 
  updateLesson, 
  deleteLesson 
} from '../hooks/lessonManagementHooks';

// For instructor management
import { 
  fetchInstructors, 
  createInstructor, 
  getInstructorById, 
  deleteInstructor 
} from '../hooks/instructorManagementHooks';

// For tag management
import { 
  fetchAllTags, 
  createTag, 
  getTagById, 
  deleteTag 
} from '../hooks/tagManagementHooks';
```
