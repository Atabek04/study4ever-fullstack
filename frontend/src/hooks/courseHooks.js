import { useState, useEffect } from 'react';
import api from '../api/axios';

// Custom hook to fetch courses with caching and revalidation capabilities
export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/api/v1/courses/');
      setCourses(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load courses. Please try again later.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCourses();
  }, []);
  
  const mutate = async () => {
    return fetchCourses();
  };
  
  return {
    courses,
    loading,
    error,
    mutate
  };
};

// Custom hook to enroll in a course
export const useEnrollment = () => {
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  
  const enrollInCourse = async (courseId) => {
    setEnrolling(true);
    setEnrollmentError('');
    setEnrollmentSuccess(false);
    
    try {
      await api.post(`/api/v1/enrollments/`, { courseId });
      setEnrollmentSuccess(true);
      return true;
    } catch (err) {
      console.error('Enrollment failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to enroll in course. Please try again.';
      setEnrollmentError(errorMessage);
      return false;
    } finally {
      setEnrolling(false);
    }
  };
  
  return {
    enrollInCourse,
    enrolling,
    enrollmentError,
    enrollmentSuccess
  };
};
