import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * A route wrapper that only allows users with specific roles to access
 * @param {Object} props Component props
 * @param {string[]} props.allowedRoles Array of role names that can access this route
 * @param {React.ReactNode} props.children The child components to render if authorized
 * @param {string} [props.redirectTo=/forbidden] Where to redirect if not authorized
 */
const RoleBasedRoute = ({ allowedRoles = [], children, redirectTo = '/forbidden' }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  
  // First check if the user is authenticated
  if (!user?.isAuthenticated) {
    console.log('RoleBasedRoute - User not authenticated, redirecting to /auth');
    return <Navigate to="/auth" />;
  }
  
  // Check if user exists and has roles
  if (!user?.roles) {
    console.error('RoleBasedRoute - User has no roles defined:', user);
    return <Navigate to="/auth" />;
  }
  
  // If no roles are required, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    console.log('RoleBasedRoute - No roles required, allowing access');
    return children;
  }
  
  // Check if user has at least one of the required roles (case insensitive)
  const hasRequiredRole = allowedRoles.some(allowedRole => {
    // Normalize the allowed role (removing ROLE_ prefix if needed)
    const normalizedAllowedRole = allowedRole.toUpperCase().replace('ROLE_', '');
    
    // Debug role comparison
    console.log('Checking role:', {
      normalizedAllowedRole,
      userRoles: user.roles,
      allowedRole,
    });
    
    const hasRole = user.roles?.some(userRole => {
      // Normalize the user role (removing ROLE_ prefix if needed)
      const normalizedUserRole = userRole.toUpperCase().replace('ROLE_', '');
      const matches = normalizedUserRole === normalizedAllowedRole;
      
      // Debug individual role comparison
      console.log('Role comparison:', {
        normalizedUserRole,
        normalizedAllowedRole,
        matches
      });
      
      return matches;
    });
    
    return hasRole;
  });
  
  // Log role checking for debugging
  console.log('RoleBasedRoute - Access check:', {
    route: window.location.pathname,
    userRoles: user.roles,
    normalizedUserRoles: user.roles?.map(r => r.toUpperCase().replace('ROLE_', '')),
    allowedRoles,
    normalizedAllowedRoles: allowedRoles.map(r => r.toUpperCase().replace('ROLE_', '')),
    hasRequiredRole
  });
  
  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} />;
  }
  
  return children;
};

export default RoleBasedRoute;
