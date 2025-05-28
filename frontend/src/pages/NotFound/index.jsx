import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Container
} from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

/**
 * Not Found page shown when a user tries to access a course they're not enrolled in
 * or a resource that doesn't exist
 */
const NotFoundPage = ({ title = "Course Not Found", message = "You're not enrolled in this course or it doesn't exist." }) => {
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
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <SearchOffIcon 
            sx={{ 
              fontSize: 80, 
              color: 'text.secondary',
              mb: 2
            }} 
          />
          
          <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
            {title}
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            Oops! We couldn't find what you're looking for.
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            {message}
          </Typography>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
            
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/courses')}
            >
              Browse Courses
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
