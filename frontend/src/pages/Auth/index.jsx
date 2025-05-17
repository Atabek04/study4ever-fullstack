import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import LoginForm from '../../components/Auth/LoginForm';
import RegisterForm from '../../components/Auth/RegisterForm';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user?.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Check if there's a tab specified in the URL (e.g., /auth?tab=register)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'register') {
      setActiveTab(1);
    }
  }, [location]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRegisterSuccess = () => {
    // Switch to the login tab after successful registration
    setActiveTab(0);
  };

  return (
    <Container component="main" maxWidth="sm">
      <div className="auth-background"></div>
      <div className="auth-pattern"></div>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >      <Paper
        elevation={3}
        sx={{
          width: '100%',
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        />
        
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
            Study4Ever
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Join our educational platform to enhance your learning journey
          </Typography>
        </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant={isMobile ? "fullWidth" : "standard"}
              centered
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: 48,
                  py: 1,
                  '&.Mui-selected': {
                    fontWeight: 700,
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Tab label="Login" id="login-tab" aria-controls="login-panel" />
              <Tab label="Register" id="register-tab" aria-controls="register-panel" />
            </Tabs>
          </Box>

          <Box role="tabpanel" hidden={activeTab !== 0} id="login-panel">
            {activeTab === 0 && (
              <LoginForm onSwitchToRegister={() => setActiveTab(1)} />
            )}
          </Box>
          
          <Box role="tabpanel" hidden={activeTab !== 1} id="register-panel">
            {activeTab === 1 && (
              <RegisterForm 
                onSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setActiveTab(0)}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthPage;
