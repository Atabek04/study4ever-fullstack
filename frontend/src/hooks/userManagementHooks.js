import { useState, useEffect, useCallback } from 'react';
import { 
  fetchAllStudents, 
  searchStudents, 
  searchInstructors, 
  fetchAllUsers, 
  fetchUserById, 
  searchUsers, 
  fetchUserSummary 
} from '../api/userManagementApi';

/**
 * Custom hooks for user management functionality
 */

// Hook for managing students
export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllStudents();
      setStudents(data);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students. Please try again.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchStudentsData = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchStudents(searchTerm);
      setStudents(data);
    } catch (err) {
      console.error('Error searching students:', err);
      setError('Failed to search students. Please try again.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return {
    students,
    loading,
    error,
    refetch: loadStudents,
    searchStudents: searchStudentsData
  };
};

// Hook for managing instructors (enhanced)
export const useInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // This would use the existing fetchInstructors function
  const loadInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Assuming fetchInstructors is available from existing hooks
      const { fetchInstructors } = await import('./instructorManagementHooks');
      const data = await fetchInstructors();
      setInstructors(data);
    } catch (err) {
      console.error('Error loading instructors:', err);
      setError('Failed to load instructors. Please try again.');
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchInstructorsData = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchInstructors(searchTerm);
      setInstructors(data);
    } catch (err) {
      console.error('Error searching instructors:', err);
      setError('Failed to search instructors. Please try again.');
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstructors();
  }, [loadInstructors]);

  return {
    instructors,
    loading,
    error,
    refetch: loadInstructors,
    searchInstructors: searchInstructorsData
  };
};

// Hook for managing all users
export const useAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsersData = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchUsers(searchTerm);
      setUsers(data);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    refetch: loadUsers,
    searchUsers: searchUsersData
  };
};

// Hook for user details
export const useUserDetails = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserById(userId);
      setUser(data);
    } catch (err) {
      console.error('Error loading user details:', err);
      setError('Failed to load user details. Please try again.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    refetch: loadUser
  };
};

// Hook for dashboard summary
export const useUserSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error loading user summary:', err);
      setError('Failed to load summary data. Please try again.');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    summary,
    loading,
    error,
    refetch: loadSummary
  };
};

// Combined hook for dashboard that loads all user management data
export const useUserManagementDashboard = () => {
  const { summary, loading: summaryLoading, error: summaryError } = useUserSummary();
  const { students, loading: studentsLoading } = useStudents();
  const { instructors, loading: instructorsLoading } = useInstructors();
  const { users, loading: usersLoading } = useAllUsers();

  const loading = summaryLoading || studentsLoading || instructorsLoading || usersLoading;
  const error = summaryError;

  return {
    summary,
    students,
    instructors,
    users,
    loading,
    error
  };
};
