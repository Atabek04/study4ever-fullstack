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
  // Format data for API request
  const formattedData = {
    title: lessonData.title,
    content: lessonData.content,
    videoUrl: lessonData.videoUrl,
    durationMinutes: parseInt(lessonData.durationMinutes) || 0,
    moduleId: parseInt(lessonData.moduleId)
  };
  
  // Only include sortOrder if it's provided
  if (lessonData.sortOrder) {
    formattedData.sortOrder = parseInt(lessonData.sortOrder);
  }
  
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
  console.log('updateLesson called with ID:', lessonId, 'and data:', lessonData);
  
  // Format data for API request
  const formattedData = {
    title: lessonData.title,
    content: lessonData.content,
    videoUrl: lessonData.videoUrl,
    durationMinutes: parseInt(lessonData.durationMinutes) || 0,
    moduleId: parseInt(lessonData.moduleId)
  };
  
  // Only include sortOrder if it's provided
  if (lessonData.sortOrder) {
    formattedData.sortOrder = parseInt(lessonData.sortOrder);
  }
  
  console.log('Formatted data for API:', formattedData);
  
  try {
    console.log(`Making API request to: /api/v1/lessons/${lessonId}`);
    const response = await api.put(`/api/v1/lessons/${lessonId}`, formattedData);
    console.log('API response for update lesson:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating lesson:', error);
    console.error('Error response:', error.response?.data);
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
