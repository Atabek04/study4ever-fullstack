import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on mount
    const accessToken = localStorage.getItem('accessToken');
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
                console.error('Profile loading error:', profileError);
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
          console.error('Token validation error:', error);
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
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid username or password'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/v1/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/auth');
  };

  const authContextValue = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
