import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

/**
 * Forbidden page shown when a user tries to access a restricted route
 */
const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            borderRadius: 3,
            textAlign: 'center',
            maxWidth: 600,
            boxShadow: '0 10px 30px rgba(199, 0, 57, 0.1)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <BlockIcon 
            sx={{ 
              fontSize: 80, 
              color: 'error.main',
              mb: 2
            }} 
          />
          
          <Typography variant="h4" gutterBottom fontWeight="bold" color="error.main">
            Access Denied
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            You don't have permission to access this page.
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            This area is restricted to administrators only. If you believe you should have access, please contact the system administrator.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForbiddenPage;
