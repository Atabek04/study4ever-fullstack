// Test utility to verify the Continue Learning feature works
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { notifyCourseProgressUpdated } from '../utils/progressUtils';

/**
 * Component to test the Continue Learning feature
 */
export const TestContinueLearning = ({ courseId }) => {
  const [result, setResult] = useState({ loading: false, data: null, error: null });
  
  const runTest = async () => {
    setResult({ loading: true, data: null, error: null });
    
    try {
      console.log(`Testing Continue Learning for course ${courseId}`);
      
      // Step 1: Call the endpoint to get the next lesson
      console.log("Step 1: Calling continue-learning endpoint...");
      const response = await api.get(`/api/v1/courses/${courseId}/continue-learning`);
      
      // Step 2: Verify the response format
      console.log("Step 2: Verifying response format...", response.data);
      const { lessonId, lessonTitle, moduleId, moduleTitle, courseCompletionPercentage } = response.data;
      
      if (!lessonId) {
        throw new Error("The API response doesn't include lessonId");
      }
      
      if (!moduleId) {
        throw new Error("The API response doesn't include moduleId");
      }
      
      // Step 3: Test the progress notification
      console.log("Step 3: Testing progress notification...");
      notifyCourseProgressUpdated({
        courseId,
        lessonId,
        moduleId,
        completionPercentage: courseCompletionPercentage 
      });
      
      // Success
      setResult({
        loading: false,
        data: response.data,
        error: null
      });
      
      console.log("Test completed successfully!");
      return response.data;
    } catch (err) {
      console.error("Test failed:", err);
      setResult({
        loading: false,
        data: null,
        error: err.response?.data?.message || err.message
      });
      return null;
    }
  };
  
  return { result, runTest };
};
