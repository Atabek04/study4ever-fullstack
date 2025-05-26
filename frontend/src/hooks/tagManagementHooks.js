import api from '../api/axios';

/**
 * Fetch all tags
 * @returns {Promise<Array>} Promise that resolves to an array of tags
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
 * @param {{name: string}} tagData The tag data containing only the name field
 * @returns {Promise<Object>} Promise that resolves to the created tag
 */
export const createTag = async (tagData) => {
  try {
    const response = await api.post('/api/v1/tags', {
      name: tagData.name
    });
    return response.data;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

/**
 * Get tag by ID
 * @param {number} tagId The ID of the tag to fetch
 * @returns {Promise<Object>} Promise that resolves to the tag details
 */
export const getTagById = async (tagId) => {
  try {
    const response = await api.get(`/api/v1/tags/${tagId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tag:', error);
    throw error;
  }
};

/**
 * Delete a tag by ID
 * @param {number} tagId The ID of the tag to delete
 * @returns {Promise<void>} Promise that resolves when tag is deleted
 */
export const deleteTag = async (tagId) => {
  try {
    await api.delete(`/api/v1/tags/${tagId}`);
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};
