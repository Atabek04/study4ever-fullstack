import api from '../api/axios';

/**
 * Fetch all modules
 * @returns {Promise} Promise that resolves to an array of modules
 */
export const fetchAllModules = async () => {
  try {
    const response = await api.get('/api/v1/modules/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
};

/**
 * Create a new module
 * @param {Object} moduleData The module data to create
 * @returns {Promise} Promise that resolves to the created module
 */
export const createModule = async (moduleData) => {
  const formattedData = {
    ...moduleData,
    courseId: parseInt(moduleData.courseId),
    position: parseInt(moduleData.position)
  };
  
  try {
    const response = await api.post('/api/v1/modules', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
};

/**
 * Update an existing module
 * @param {number} moduleId The ID of the module to update
 * @param {Object} moduleData The updated module data
 * @returns {Promise} Promise that resolves to the updated module
 */
export const updateModule = async (moduleId, moduleData) => {
  const formattedData = {
    ...moduleData,
    courseId: parseInt(moduleData.courseId),
    position: parseInt(moduleData.position)
  };
  
  try {
    const response = await api.put(`/api/v1/modules/${moduleId}`, formattedData);
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
 * Fetch courses for use in module forms
 * @returns {Promise} Promise that resolves to an array of courses
 */
export const fetchCoursesForModules = async () => {
  try {
    const response = await api.get('/api/v1/courses');
    return response.data;
  } catch (error) {
    console.error('Error fetching courses for modules:', error);
    throw error;
  }
};
