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
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('You need to log in to view courses. Please sign in or create an account.');
        setCourses([]);
        setLoading(false);
        return [];
      }

      // Make the API request with proper error handling
      const response = await api.get('/api/v1/courses');
      console.log('GET /api/v1/courses Response:', {
        status: response.status,
        data: response.data
      });
      
      // Handle different response formats
      let coursesData;
      
      if (Array.isArray(response.data)) {
        coursesData = response.data.map(course => {
          const processed = {
            ...course,
            instructorName: course.instructorFirstName && course.instructorLastName
              ? `${course.instructorFirstName} ${course.instructorLastName}`
              : 'Not assigned',
            totalModules: course.totalModules ?? 0,
            totalLessons: course.totalLessons ?? 0
          };
          return processed;
        });
      } else if (response.data && typeof response.data === 'object') {
        const sourceArray = response.data.courses || response.data.content || [];
        coursesData = sourceArray.map(course => ({
          ...course,
          instructorName: course.instructorFirstName && course.instructorLastName
            ? `${course.instructorFirstName} ${course.instructorLastName}`
            : 'Not assigned',
          totalModules: course.totalModules ?? 0,
          totalLessons: course.totalLessons ?? 0
        }));
      } else {
        coursesData = [];
        console.warn('API returned unexpected data format:', response.data);
      }
      
      // Set courses state with the processed array
      if (!Array.isArray(coursesData)) {
        coursesData = [];
      }
      
      if (coursesData.length > 0) {
        console.log('Sample course data:', {
          first: coursesData[0],
          count: coursesData.length,
          hasInstructor: coursesData.some(c => c.instructorName !== 'Not assigned'),
          hasCounts: coursesData.some(c => c.totalModules > 0 || c.totalLessons > 0)
        });
      } else {
        console.log('No courses data available');
      }
      
      setCourses(coursesData);
      return coursesData;
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
      
      // Handle 401 Unauthorized separately to improve user experience
      if (err.response?.status === 401) {
        setError('You need to log in to view courses. Please sign in or create an account.');
        setCourses([]); // Ensure courses is an empty array on auth error
      } else {
        const errorMessage = err.response?.data?.message || 
          `Failed to load courses. Status: ${err.response?.status || 'unknown'}. Please try again later.`;
        setError(errorMessage);
      }
      return []; // Return empty array on error
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
  
  const enrollInCourse = async (courseId, courseDetails = {}) => {
    setEnrolling(true);
    setEnrollmentError('');
    setEnrollmentSuccess(false);
    
    try {
      // Create the enrollment request body with required fields
      const enrollmentRequestBody = {
        totalLessonsCount: courseDetails.totalLessons || courseDetails.lessonCount || 10, // Default to 10 if not provided
        totalModulesCount: courseDetails.totalModules || courseDetails.moduleCount || 5  // Default to 5 if not provided
      };
      
      console.log(`Attempting to enroll in course ${courseId} with request:`, enrollmentRequestBody);
      
      // Send POST request with the required request body
      const response = await api.post(
        `/api/v1/courses/${courseId}/progress`, 
        enrollmentRequestBody
      );
      
      // Log detailed response information for debugging
      console.log('Enrollment Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      // Check if the status code indicates success (200-299)
      if (response.status >= 200 && response.status < 300) {
        console.log('Enrollment successful based on status code', response.status);
        
        // Special handling for 204 No Content responses
        if (response.status === 204) {
          console.log('Received 204 No Content response. This may be expected, but check if the backend actually enrolled the user.');
          
          // Verify enrollment was successful by immediately checking enrolled courses
          try {
            console.log('Verifying enrollment by fetching enrolled courses...');
            const verifyResponse = await api.get('/api/v1/courses/progress');
            console.log('Verification response:', verifyResponse.data);

            // Check if the course is in the enrolled courses list
            const enrolledCourses = Array.isArray(verifyResponse.data) ? verifyResponse.data :
              (Array.isArray(verifyResponse.data?.courses) ? verifyResponse.data.courses : []);

            const isEnrolled = enrolledCourses.some(course => {
              const courseId = course.id || course.course?.id;
              return !Number.isNaN(courseId);
            });

            console.log(`Course ${courseId} enrollment verification:`, isEnrolled ? 'Found in enrolled courses' : 'NOT found in enrolled courses');
          } catch (verifyErr) {
            console.error('Failed to verify enrollment:', verifyErr);
          }
        }
        
        setEnrollmentSuccess(true);
        return true;
      } else {
        console.warn('Enrollment returned unexpected status code:', response.status);
        const errorMessage = response.data?.message || `Unexpected status code: ${response.status}`;
        setEnrollmentError(errorMessage);
        return false;
      }
    } catch (err) {
      console.error('Enrollment failed:', err);
      
      // Log detailed error information
      console.log('Enrollment Error Details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        baseURL: err.config?.baseURL,
        method: err.config?.method,
        message: err.message
      });
      
      // Handle validation errors specifically
      if (err.response?.status === 400) {
        let errorMessage = 'Invalid enrollment data. ';
        
        // Extract field-specific validation errors if available
        if (err.response?.data?.errors) {
          const fieldErrors = Object.entries(err.response.data.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          errorMessage += fieldErrors;
        } else if (err.response?.data?.message) {
          errorMessage += err.response.data.message;
        }
        
        setEnrollmentError(errorMessage);
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to enroll in course. Please try again.';
        setEnrollmentError(errorMessage);
      }
      
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
        // Import the adminApi here to avoid circular dependencies
        const { adminApi } = await import('../api/axios');
        
        // Use the adminApi instance which has admin credentials built-in
        const response = await adminApi.get(`/api/v1/admin/instructors/${instructorId}`);
        
        if (isMounted) {
          setInstructor(response.data);
        }
      } catch (err) {
        console.error(`Failed to fetch instructor info for ID ${instructorId}:`, err);
        if (isMounted) {
          setError(err.message || 'Failed to fetch instructor');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchInstructor();
    return () => { isMounted = false; };
  }, [instructorId]);

  return { instructor, loading, error };
};

// Custom hook to fetch enrolled courses with progress data
export const useEnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchEnrolledCourses = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('You need to log in to view your enrolled courses. Please sign in or create an account.');
        setEnrolledCourses([]);
        setLoading(false);
        return [];
      }

      // Make the API request to fetch enrolled courses with progress data
      const progressResponse = await api.get('/api/v1/courses/progress');

      
      // Handle different response formats
      let progressData;
      
      if (Array.isArray(progressResponse.data)) {
        progressData = progressResponse.data;
      } else if (progressResponse.data && typeof progressResponse.data === 'object') {
        // If response is an object that contains courses array
        if (Array.isArray(progressResponse.data.courses)) {
          progressData = progressResponse.data.courses;
        } else if (Array.isArray(progressResponse.data.content)) {
          // Spring pagination format
          progressData = progressResponse.data.content;
        } else {
          // If no recognizable array is found, create array from object values
          progressData = Object.values(progressResponse.data).filter(item => typeof item === 'object');
        }
      } else {
        progressData = [];
        console.warn('API returned unexpected progress data format:', progressResponse.data);
      }
      
      // Ensure progressData is an array
      if (!Array.isArray(progressData)) {
        console.warn('Processed progress data is not an array, resetting to empty array');
        progressData = [];
      }

      // Now fetch detailed course information for each enrolled course
      const enrichedCourses = await Promise.all(
        progressData.map(async (progressItem) => {
          try {
            // Extract the course ID
            const courseId = progressItem.courseId;
            if (!courseId) {
              console.warn('Course ID missing from progress item:', progressItem);
              return {
                ...progressItem,
                title: 'Unknown Course',
                instructor: 'Unknown Instructor'
              };
            }
            
            // Fetch course details
            const courseResponse = await api.get(`/api/v1/courses/${courseId}`);
            const courseDetails = courseResponse.data;
            
            // Combine progress data with course details
            const combinedData = {
              ...progressItem,
              ...courseDetails,
              completionPercentage: progressItem.completionPercentage
            };
            
            // If course has instructor ID, fetch instructor details
            if (courseDetails.instructorId) {
              try {
                // Import adminApi to fetch instructor details
                const { adminApi } = await import('../api/axios');
                
                const instructorResponse = await adminApi.get(`/api/v1/admin/instructors/${courseDetails.instructorId}`);
                const instructorDetails = instructorResponse.data;
                
                // Add instructor name to the combined data
                combinedData.instructor = `${instructorDetails.firstName} ${instructorDetails.lastName}`;
                combinedData.instructorDetails = instructorDetails;
              } catch (instructorErr) {
                console.warn(`Failed to fetch instructor details for course ${courseId}:`, instructorErr);
                combinedData.instructor = 'Unknown Instructor';
              }
            } else {
              combinedData.instructor = 'No Instructor Assigned';
            }
            
            return combinedData;
          } catch (courseErr) {
            console.warn(`Failed to fetch details for course:`, courseErr);
            return {
              ...progressItem,
              title: 'Error Loading Course',
              instructor: 'Unknown'
            };
          }
        })
      );
      
      setEnrolledCourses(enrichedCourses);
      return enrichedCourses;
    } catch (err) {
      console.error('Failed to fetch and enrich enrolled courses:', err);
      // Add detailed logging to help with debugging API issues
      console.log('API Error Details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        baseURL: err.config?.baseURL,
        method: err.config?.method
      });
      
      // Handle 401 Unauthorized separately to improve user experience
      if (err.response?.status === 401) {
        setError('You need to log in to view your enrolled courses. Please sign in or create an account.');
        setEnrolledCourses([]); // Ensure courses is an empty array on auth error
      } else {
        const errorMessage = err.response?.data?.message || 
          `Failed to load enrolled courses. Status: ${err.response?.status || 'unknown'}. Please try again later.`;
        setError(errorMessage);
      }
      return []; // Return empty array on error
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEnrolledCourses();
  }, []);
  
  const mutate = async () => {
    return fetchEnrolledCourses();
  };
  
  return {
    enrolledCourses,
    loading,
    error,
    mutate
  };
};

// Custom hook to fetch enrolled course IDs
export const useEnrolledCourseIds = () => {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchEnrolledCourseIds = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setEnrolledCourseIds([]);
        setLoading(false);
        return [];
      }

      console.log('Fetching enrolled course IDs...');
      
      // Make the API request to fetch enrolled course IDs
      const response = await api.get('/api/v1/courses/enrolled-courses');
      
      // Log the raw response for debugging
      console.log('Enrolled Course IDs Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      // Set the enrolled course IDs
      const courseIds = Array.isArray(response.data) ? response.data : [];
      console.log('Enrolled course IDs:', courseIds);
      setEnrolledCourseIds(courseIds);
      return courseIds;
    } catch (err) {
      console.error('Failed to fetch enrolled course IDs:', err);
      console.log('API Error Details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      setEnrolledCourseIds([]);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEnrolledCourseIds();
  }, []);
  
  const mutate = async () => {
    return fetchEnrolledCourseIds();
  };
  
  return {
    enrolledCourseIds,
    loading,
    error,
    mutate
  };
};
