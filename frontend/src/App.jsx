import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { createTheme, ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import AuthPage from './pages/Auth';
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

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // Blue as the primary color
    },
    secondary: {
      main: '#ff9800', // Orange as the secondary color
    },
    background: {
      default: '#f5f5f5', // Light grey background
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
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
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
  },
});

// App component with routing
function AppWithRouting() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div>Dashboard Coming Soon</div>
        </ProtectedRoute>
      } />
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
