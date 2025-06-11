import { adminApi } from './axios';

/**
 * API functions for user management (students, instructors, general users)
 */

// Student Management
export const fetchAllStudents = async () => {
  try {
    const response = await adminApi.get('/api/v1/admin/students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const searchStudents = async (searchTerm) => {
  try {
    const response = await adminApi.get(`/api/v1/admin/students/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching students:', error);
    throw error;
  }
};

// Instructor Management (enhanced)
export const searchInstructors = async (searchTerm) => {
  try {
    const response = await adminApi.get(`/api/v1/admin/instructors/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching instructors:', error);
    throw error;
  }
};

// General User Management
export const fetchAllUsers = async () => {
  try {
    const response = await adminApi.get('/api/v1/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchUserById = async (userId) => {
  try {
    const response = await adminApi.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const searchUsers = async (searchTerm) => {
  try {
    const response = await adminApi.get(`/api/v1/admin/users/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Dashboard Summary
export const fetchUserSummary = async () => {
  try {
    const response = await adminApi.get('/api/v1/admin/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching user summary:', error);
    throw error;
  }
};