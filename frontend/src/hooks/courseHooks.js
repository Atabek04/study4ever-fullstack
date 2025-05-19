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
      // Remove trailing slash to match the backend endpoint exactly as tested in Postman
      const response = await api.get('/api/v1/courses');
      setCourses(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      // Add detailed logging to help with debugging API issues
      console.log('API Error Details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        baseURL: err.config?.baseURL,
        method: err.config?.method
      });
      const errorMessage = err.response?.data?.message || 
        `Failed to load courses. Status: ${err.response?.status || 'unknown'}. Please try again later.`;
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
      await api.post(`/api/v1/enrollments`, { courseId });
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

// Custom hook to fetch instructor details by ID (admin API)
export const useInstructor = (instructorId) => {
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(!!instructorId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!instructorId) return;
    let isMounted = true;
    const fetchInstructor = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Get admin JWT
        const loginRes = await fetch('http://localhost:8095/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'ibnmalik', password: 'Admin@123' })
        });
        if (!loginRes.ok) throw new Error('Failed to login as admin');
        const { accessToken } = await loginRes.json();
        // 2. Fetch instructor info
        const instRes = await fetch(`http://localhost:8095/api/v1/admin/instructors/${instructorId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!instRes.ok) throw new Error('Failed to fetch instructor info');
        const data = await instRes.json();
        if (isMounted) setInstructor(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch instructor');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchInstructor();
    return () => { isMounted = false; };
  }, [instructorId]);

  return { instructor, loading, error };
};
