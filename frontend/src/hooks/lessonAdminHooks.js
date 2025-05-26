import api from '../api/axios';

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
 * @param {Object} lessonData The lesson data to create
 * @returns {Promise} Promise that resolves to the created lesson
 */
export const createLesson = async (lessonData) => {
  const formattedData = {
    ...lessonData,
    moduleId: parseInt(lessonData.moduleId),
    position: parseInt(lessonData.position),
    duration: parseInt(lessonData.duration)
  };
  
  try {
    const response = await api.post('/api/v1/lessons', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

/**
 * Update an existing lesson
 * @param {number} lessonId The ID of the lesson to update
 * @param {Object} lessonData The updated lesson data
 * @returns {Promise} Promise that resolves to the updated lesson
 */
export const updateLesson = async (lessonId, lessonData) => {
  const formattedData = {
    ...lessonData,
    moduleId: parseInt(lessonData.moduleId),
    position: parseInt(lessonData.position),
    duration: parseInt(lessonData.duration)
  };
  
  try {
    const response = await api.put(`/api/v1/lessons/${lessonId}`, formattedData);
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
 * Fetch modules for use in lesson forms
 * @returns {Promise} Promise that resolves to an array of modules
 */
export const fetchModulesForLessons = async () => {
  try {
    const response = await api.get('/api/v1/modules');
    return response.data;
  } catch (error) {
    console.error('Error fetching modules for lessons:', error);
    throw error;
  }
};
