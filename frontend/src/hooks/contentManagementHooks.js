import api from '../api/axios';

/**
 * Fetch all courses
 * @returns {Promise<Array>} Promise that resolves to an array of courses
 */
export const fetchAllCourses = async () => {
  try {
    const response = await api.get('/api/v1/courses');
    
    // Handle different response formats and ensure we always return an array
    let coursesData;
    if (Array.isArray(response.data)) {
      coursesData = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // If response is an object that contains courses array
      if (Array.isArray(response.data.courses)) {
        coursesData = response.data.courses;
      } else if (Array.isArray(response.data.content)) {
        // Spring pagination format
        coursesData = response.data.content;
      } else {
        // If no recognizable array is found, create array from object values
        coursesData = Object.values(response.data).filter(item => typeof item === 'object');
      }
    } else {
      coursesData = [];
    }

    // Final safety check to ensure we return an array
    return Array.isArray(coursesData) ? coursesData : [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

/**
 * Create a new course
 * @param {{title: string, description: string, instructorId: UUID, tagIds: number[]}} courseData
 * @returns {Promise<Object>} Promise that resolves to the created course
 */
export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/api/v1/courses', {
      title: courseData.title,
      description: courseData.description,
      instructorId: courseData.instructorId,
      tagIds: courseData.tagIds
    });
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

/**
 * Update an existing course
 * @param {number} id Course ID
 * @param {{title: string, description: string, instructorId: UUID, tagIds: number[]}} courseData
 * @returns {Promise<Object>} Promise that resolves to the updated course
 */
export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/api/v1/courses/${id}`, {
      title: courseData.title,
      description: courseData.description,
      instructorId: courseData.instructorId,
      tagIds: courseData.tagIds
    });
    return response.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

/**
 * Delete a course
 * @param {number} id Course ID
 * @returns {Promise<void>}
 */
export const deleteCourse = async (id) => {
  try {
    await api.delete(`/api/v1/courses/${id}`);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

/**
 * Fetch all modules with details
 * @returns {Promise} Promise that resolves to an array of modules with details
 */
export const fetchAllModulesWithDetails = async () => {
  try {
    const response = await api.get('/api/v1/modules/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching modules with details:', error);
    throw error;
  }
};

/**
 * Create a new module
 * @param {Object} moduleData The module data to create (title, description, courseId, position)
 * @returns {Promise} Promise that resolves to the created module
 */
export const createModule = async (moduleData) => {
  try {
    const response = await api.post('/api/v1/modules', moduleData);
    return response.data;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
};

/**
 * Update an existing module
 * @param {number} moduleId The ID of the module to update
 * @param {Object} moduleData The updated module data (title, description, courseId, position)
 * @returns {Promise} Promise that resolves to the updated module
 */
export const updateModule = async (moduleId, moduleData) => {
  try {
    const response = await api.put(`/api/v1/modules/${moduleId}`, moduleData);
    return response.data;
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
};

/**
 * Delete a module
 * @param {number} moduleId The ID of the module to delete
 * @returns {Promise} Promise that resolves when the module is deleted
 */
export const deleteModule = async (moduleId) => {
  try {
    await api.delete(`/api/v1/modules/${moduleId}`);
    return true;
  } catch (error) {
    console.error('Error deleting module:', error);
    throw error;
  }
};

/**
 * Fetch all lessons
 * @returns {Promise} Promise that resolves to an array of lessons
 */
export const fetchAllLessons = async () => {
  try {
    const response = await api.get('/api/v1/lessons');
    return response.data;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

/**
 * Create a new lesson
 * @param {Object} lessonData The lesson data to create (title, content, moduleId, position, videoUrl, duration, type)
 * @returns {Promise} Promise that resolves to the created lesson
 */
export const createLesson = async (lessonData) => {
  try {
    const response = await api.post('/api/v1/lessons', lessonData);
    return response.data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

/**
 * Update an existing lesson
 * @param {number} lessonId The ID of the lesson to update
 * @param {Object} lessonData The updated lesson data (title, content, moduleId, position, videoUrl, duration, type)
 * @returns {Promise} Promise that resolves to the updated lesson
 */
export const updateLesson = async (lessonId, lessonData) => {
  try {
    const response = await api.put(`/api/v1/lessons/${lessonId}`, lessonData);
    return response.data;
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

/**
 * Delete a lesson
 * @param {number} lessonId The ID of the lesson to delete
 * @returns {Promise} Promise that resolves when the lesson is deleted
 */
export const deleteLesson = async (lessonId) => {
  try {
    await api.delete(`/api/v1/lessons/${lessonId}`);
    return true;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

/**
 * Fetch all tags
 * @returns {Promise} Promise that resolves to an array of tags
 */
export const fetchAllTags = async () => {
  try {
    const response = await api.get('/api/v1/tags');
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

/**
 * Create a new tag
 * @param {Object} tagData The tag data to create (name)
 * @returns {Promise} Promise that resolves to the created tag
 */
export const createTag = async (tagData) => {
  try {
    const response = await api.post('/api/v1/tags', tagData);
    return response.data;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

/**
 * Delete a tag
 * @param {number} tagId The ID of the tag to delete
 * @returns {Promise} Promise that resolves when the tag is deleted
 */
export const deleteTag = async (tagId) => {
  try {
    await api.delete(`/api/v1/tags/${tagId}`);
    return true;
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};
