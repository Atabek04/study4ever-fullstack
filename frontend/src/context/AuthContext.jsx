import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api, { setAuthContext } from '../api/axios';
import SessionExtensionDialog from '../components/Auth/SessionExtensionDialog';
import { willTokenExpireSoon } from '../utils/tokenUtils';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionExtensionLoading, setSessionExtensionLoading] = useState(false);
  const pendingRequestsRef = useRef([]);
  const navigate = useNavigate();

  // Effect to provide auth context to axios
  useEffect(() => {
    // Make auth functions available to axios interceptors
    const contextValue = {
      setSessionDialogOpen,
      pendingRequestsRef,
      extendSession: async () => {
        setSessionExtensionLoading(true);
        const result = await refreshToken();
        setSessionExtensionLoading(false);
        setSessionDialogOpen(false);
        return result.success;
      }
    };
    
    setAuthContext(contextValue);
  }, []);
  
  useEffect(() => {
    // Check if user is logged in on mount
    const accessToken = localStorage.getItem('accessToken');
    console.log('Checking for existing access token on app start:', accessToken ? 'Found' : 'Not found');
    
    if (accessToken) {
      // Validate token
      api.get('/api/v1/auth/validate')
        .then(response => {
          if (response.data.valid) {
            // Get user profile with roles directly from the profile endpoint
            api.get('/api/v1/auth/profile')
              .then(profileResponse => {
                const profile = profileResponse.data;
                
                // Log user authentication details
                console.log('User profile loaded:', profile);
                
                setUser({ 
                  isAuthenticated: true,
                  username: profile.username || '',
                  firstName: profile.firstName || '',
                  lastName: profile.lastName || '',
                  email: profile.email || '',
                  roles: profile.roles || [],
                  hasRole: (role) => (profile.roles || []).includes(role)
                });
              })
              .catch(profileError => {
                if (!profileError.response || profileError.response.status >= 500) {
                  console.error('Server error during profile loading:', profileError);
                  // For server errors, we might want to retry later or show a notification
                } else {
                  console.error('Profile loading error:', profileError);
                }
                logout();
              })
              .finally(() => {
                setLoading(false);
              });
          } else {
            // Invalid token, clear storage
            logout();
            setLoading(false);
          }
        })
        .catch((error) => {
          if (!error.response || error.response.status >= 500) {
            console.error('Server error during token validation:', error);
            // We might want to retry later or show a notification, but for now just log out
          } else {
            console.error('Token validation error:', error);
          }
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/api/v1/auth/login', credentials);
      const { accessToken, refreshToken } = response.data;
      if (response.status === 200 && accessToken && refreshToken) {
        console.log('Login successful, storing access and refresh tokens');
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        try {
          // Fetch user profile to get user details including roles
          const profileResponse = await api.get('/api/v1/auth/profile');
          const profile = profileResponse.data;
          
          // Log user login details
          console.log('User logged in, profile data:', profile);
          
          // Log the raw profile data
          console.log('Raw profile data:', profile);
          
          const userRoles = profile.roles || [];
          console.log('User roles from profile:', userRoles);
          
          setUser({ 
            isAuthenticated: true,
            username: profile.username || '',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            roles: userRoles,
            hasRole: (role) => {
              const normalizedRole = role.toUpperCase().replace('ROLE_', '');
              return userRoles.some(userRole => 
                userRole.toUpperCase().replace('ROLE_', '') === normalizedRole
              );
            }
          });
          
          navigate('/dashboard');
          return { success: true };
        } catch (profileError) {
          console.error('Error fetching profile after login:', profileError);
          // Continue with login but without full profile data
          // Handle login with missing profile data
          console.error('Profile fetch failed but login succeeded. Using minimal user data.');
          const minimalUser = { 
            isAuthenticated: true,
            username: '',
            roles: [],
            hasRole: () => false
          };
          console.log('Setting minimal user state:', minimalUser);
          setUser(minimalUser);
          navigate('/dashboard');
          return { success: true };
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        return {
          success: false,
          error: 'Invalid credentials or missing tokens.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      
      // Handle different types of errors
      if (!error.response) {
        // Network error or server not responding
        return {
          success: false,
          error: 'Server unavailable. Please check your connection or try again later.'
        };
      } else if (error.response.status >= 500) {
        // Server error (5xx)
        return {
          success: false, 
          error: 'The server encountered an error. Please try again later.'
        };
      } else if (error.response.status === 401 || error.response.status === 403) {
        // Authentication error (401 Unauthorized or 403 Forbidden)
        return {
          success: false,
          error: error.response?.data?.message || 'Invalid username or password'
        };
      } else {
        // Other client errors (4xx)
        return {
          success: false,
          error: error.response?.data?.message || 'Login failed. Please try again.'
        };
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/v1/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Handle different types of errors
      if (!error.response) {
        // Network error or server not responding
        return {
          success: false,
          error: 'Server unavailable. Please check your connection or try again later.'
        };
      } else if (error.response.status >= 500) {
        // Server error (5xx)
        return {
          success: false, 
          error: 'The server encountered an error. Please try again later.'
        };
      } else if (error.response.status === 409) {
        // Conflict - typically username already exists
        return {
          success: false,
          error: error.response?.data?.message || 'Username or email already exists'
        };
      } else {
        // Other client errors (4xx)
        return {
          success: false, 
          error: error.response?.data?.message || 'Registration failed. Please check your information.'
        };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/auth');
  };

  // Method to refresh the token without user interaction
  const refreshToken = async () => {
    // Get refresh token from storage
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    // If no token, we can't refresh
    if (!refreshTokenValue) {
      console.log('No refresh token found in localStorage, cannot refresh session');
      return { success: false, reason: 'no_refresh_token' };
    }
    
    try {
      console.log('Attempting to refresh access token using refresh token');
      // Use raw axios instance to avoid interceptors causing an infinite loop
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8095'}/api/v1/auth/refresh`,
        { refreshToken: refreshTokenValue },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Extract tokens from response
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      if (accessToken && newRefreshToken) {
        console.log('Token refresh successful, storing new tokens', {
          accessTokenReceived: !!accessToken,
          refreshTokenReceived: !!newRefreshToken
        });
        
        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        return { 
          success: true, 
          accessToken,
          refreshToken: newRefreshToken
        };
      } else {
        console.error('Token refresh response missing expected tokens', {
          receivedAccessToken: !!accessToken,
          receivedRefreshToken: !!newRefreshToken
        });
        return { 
          success: false, 
          reason: 'incomplete_response'
        };
      }
    } catch (error) {
      if (!error.response) {
        console.error('Network error during token refresh, server may be unavailable', error);
        return { success: false, reason: 'network_error', error };
      } else if (error.response.status >= 500) {
        console.error(`Server error (${error.response.status}) during token refresh`, error.response.data);
        return { success: false, reason: 'server_error', status: error.response.status, error };
      } else if (error.response.status === 401 || error.response.status === 403) {
        console.error('Refresh token invalid or expired', error.response.data);
        return { success: false, reason: 'invalid_token', error };
      } else {
        console.error(`Unexpected error (${error.response?.status}) during token refresh:`, error);
        return { success: false, reason: 'unknown_error', error };
      }
    }
  };
  
  // Method to extend session when user clicks "Stay Logged In"
  const extendSession = async () => {
    try {
      console.log('Starting session extension process');
      setSessionExtensionLoading(true);
      
      const result = await refreshToken();
      
      if (result.success) {
        console.log('Session extended successfully');
        setSessionDialogOpen(false);
        
        // Process any pending requests that were waiting for token refresh
        const pendingRequests = [...pendingRequestsRef.current];
        pendingRequestsRef.current = [];
        
        console.log(`Processing ${pendingRequests.length} pending requests`);
        
        // For each pending request, update the auth header and retry
        for (const { config, resolve, reject } of pendingRequests) {
          try {
            config.headers.Authorization = `Bearer ${result.accessToken}`;
            const response = await api(config);
            resolve(response);
          } catch (error) {
            console.error('Error replaying request after token refresh:', error);
            reject(error);
          }
        }
        
        return true;
      } else {
        console.warn(`Failed to extend session: ${result.reason}`);
        handleSessionLogout();
        return false;
      }
    } catch (error) {
      console.error('Unexpected error during session extension:', error);
      handleSessionLogout();
      return false;
    } finally {
      setSessionExtensionLoading(false);
    }
  };
  
  // Method to handle logout from session dialog
  const handleSessionLogout = () => {
    console.log('User chose to end session');
    setSessionDialogOpen(false);
    
    // Reject any pending requests
    if (pendingRequestsRef.current.length > 0) {
      console.log(`Rejecting ${pendingRequestsRef.current.length} pending requests due to session logout`);
      pendingRequestsRef.current.forEach(({ reject }) => {
        reject(new Error('Session expired, user logged out'));
      });
      pendingRequestsRef.current = [];
    }
    
    // Perform logout
    console.log('Removing tokens and redirecting to login page');
    logout();
  };

  const authContextValue = {
    user,
    login,
    register,
    logout,
    refreshToken,
    extendSession,
    handleSessionLogout,
    sessionDialogOpen,
    setSessionDialogOpen,
    pendingRequestsRef,
    sessionExtensionLoading,
    loading
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
      {/* Session Extension Dialog */}
      <SessionExtensionDialog
        open={sessionDialogOpen}
        onExtend={extendSession}
        onLogout={handleSessionLogout}
        loading={sessionExtensionLoading}
      />
    </AuthContext.Provider>
  );
};

export default AuthContext;
