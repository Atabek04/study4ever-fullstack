import api from '../api/axios';

/**
 * Fetch all instructors
 * @returns {Promise} Promise that resolves to an array of instructors
 */
export const fetchInstructors = async () => {
  try {
    const response = await api.get('/api/v1/admin/instructors');
    return response.data;
  } catch (error) {
    console.error('Error fetching instructors:', error);
    throw error;
  }
};

/**
 * Create a new instructor
 * @param {Object} instructorData The instructor data to create
 * @returns {Promise} Promise that resolves to the created instructor
 */
export const createInstructor = async (instructorData) => {
  try {
    const response = await api.post('/api/v1/admin/instructors', instructorData);
    return response.data;
  } catch (error) {
    console.error('Error creating instructor:', error);
    throw error;
  }
};

/**
 * Get instructor by ID
 * @param {string} instructorId The ID of the instructor
 * @returns {Promise} Promise that resolves to the instructor details
 */
export const getInstructorById = async (instructorId) => {
  try {
    const response = await api.get(`/api/v1/admin/instructors/${instructorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching instructor:', error);
    throw error;
  }
};

/**
 * Delete an instructor
 * @param {string} instructorId The ID of the instructor to delete
 * @returns {Promise} Promise that resolves when the instructor is deleted
 */
export const deleteInstructor = async (instructorId) => {
  try {
    await api.delete(`/api/v1/admin/instructors/${instructorId}`);
    return true;
  } catch (error) {
    console.error('Error deleting instructor:', error);
    throw error;
  }
};
