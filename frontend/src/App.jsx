import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { createTheme, ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/Courses';
import LessonPage from './pages/Lesson';
import BookmarksPage from './pages/Bookmarks';
import AdminPage from './pages/Admin';
import ForbiddenPage from './pages/Forbidden';
import RoleBasedRoute from './components/Auth/RoleBasedRoute';
import './App.css';

// Create protected route component
const ProtectedRoute = ({ children }) => {
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
  
  if (!user?.isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  return children;
};

// Create a custom theme with educational design color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#C70039', // Rich crimson for key actions and attention elements
      light: '#d93a66',
      dark: '#a10030',
      contrastText: '#FFF5E0',
    },
    secondary: {
      main: '#FF6969', // Coral-pink for highlights and secondary elements
      light: '#ff8a8a',
      dark: '#e54e4e',
      contrastText: '#FFF5E0',
    },
    background: {
      default: '#FFF5E0', // Cream/off-white for main background
      paper: '#F9EFD6', // Slightly darker cream for forms, cards and containers - creates visual hierarchy
    },
    text: {
      primary: '#141E46', // Deep navy for title text and important content
      secondary: '#38456C', // Lighter navy for secondary text with good readability
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      color: '#141E46',
      fontWeight: 700,
    },
    h2: {
      color: '#141E46',
      fontWeight: 700,
    },
    h3: {
      color: '#141E46',
      fontWeight: 600,
    },
    h4: {
      color: '#141E46',
      fontWeight: 600,
    },
    h5: {
      color: '#141E46',
      fontWeight: 600,
    },
    h6: {
      color: '#141E46',
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#C70039', // Rich crimson for app bars
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#FF6969', // Coral-pink for chips
          color: '#FFF5E0',
          fontWeight: 500,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#FF6969', // Coral-pink for active tab indicators
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&:hover': {
            color: '#FFF5E0', // Light cream text on hover for better contrast
          },
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 105, 105, 0.2)', // Light coral for progress background
          borderRadius: 4,
        },
        bar: {
          backgroundColor: '#FF6969', // Coral-pink for progress bars
          borderRadius: 4,
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          color: '#141E46', // Deep navy for icons
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#F9EFD6', // Ensure paper elements use the paper background color
        },
      },
    },
  },
});

// App component with routing
function AppWithRouting() {
  // Lazy loading for admin page components
  const CourseModules = lazy(() => import('./pages/Admin/CourseModules'));
  const ModuleLessons = lazy(() => import('./pages/Admin/ModuleLessons'));
  
  const renderWithSuspense = (Component) => (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    }>
      <Component />
    </Suspense>
  );

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/courses" element={
        <ProtectedRoute>
          <CoursesPage />
        </ProtectedRoute>
      } />
      <Route path="/courses/:courseId/lessons/:lessonId" element={
        <ProtectedRoute>
          <LessonPage />
        </ProtectedRoute>
      } />
      <Route path="/bookmarks" element={
        <ProtectedRoute>
          <BookmarksPage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <RoleBasedRoute allowedRoles={['ROLE_ADMIN', 'ADMIN', 'ROLE_INSTRUCTOR', 'INSTRUCTOR']}>
          <AdminPage />
        </RoleBasedRoute>
      } />
      <Route path="/admin/courses/:courseId" element={
        <RoleBasedRoute allowedRoles={['ROLE_ADMIN', 'ADMIN', 'ROLE_INSTRUCTOR', 'INSTRUCTOR']}>
          {renderWithSuspense(CourseModules)}
        </RoleBasedRoute>
      } />
      <Route path="/admin/courses/:courseId/modules/:moduleId" element={
        <RoleBasedRoute allowedRoles={['ROLE_ADMIN', 'ADMIN', 'ROLE_INSTRUCTOR', 'INSTRUCTOR']}>
          {renderWithSuspense(ModuleLessons)}
        </RoleBasedRoute>
      } />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}

// Main App component with providers
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppWithRouting />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
