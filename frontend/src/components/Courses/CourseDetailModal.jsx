import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Button, 
  Box, 
  Divider, 
  IconButton,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { useEnrollment } from '../../hooks/courseHooks';

const CourseDetailModal = ({ course, open, onClose }) => {
  const { enrollInCourse, enrolling } = useEnrollment();
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Fallback image if course thumbnail fails to load
  const fallbackImage = 'https://picsum.photos/800/400?blur=2';
  
  // Generate a random image based on course id for demo purposes
  const courseImage = `https://picsum.photos/id/${(course?.id % 30) + 10}/800/400`;
  
  const handleEnroll = async () => {
    setEnrollmentError('');
    try {
      const success = await enrollInCourse(course.id);
      if (success) {
        setEnrollmentSuccess(true);
      } else {
        setEnrollmentError('Failed to enroll in this course. Please try again.');
      }
    } catch (error) {
      setEnrollmentError('An unexpected error occurred. Please try again later.');
    }
  };
  
  if (!course) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      scroll="paper"
      aria-labelledby="course-detail-title"
      PaperProps={{
        elevation: 5,
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        id="course-detail-title"
        sx={{ 
          px: { xs: 2, sm: 3 }, 
          pt: { xs: 2, sm: 3 },
          pb: 0
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography 
            variant="h5" 
            component="h2" 
            fontWeight={700}
            sx={{ 
              color: 'text.primary',
              pr: 4
            }}
          >
            {course.title}
          </Typography>
          <IconButton 
            aria-label="close" 
            onClick={onClose} 
            sx={{ mt: -1, mr: -1 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent 
        dividers 
        sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <Box 
          component="img"
          src={course.thumbnail || courseImage}
          alt={course.title}
          sx={{
            width: '100%',
            height: { xs: 200, sm: 280 },
            objectFit: 'cover',
            borderRadius: 2,
            mb: 2
          }}
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = fallbackImage;
          }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            alt="Instructor"
            sx={{ 
              bgcolor: 'primary.main',
              width: 48,
              height: 48
            }}
          >
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Instructor</Typography>
            <Typography variant="body2" color="text.secondary">
              {course.instructorId ? `ID: ${course.instructorId}` : 'Unknown Instructor'}
            </Typography>
          </Box>
        </Box>
        
        <Divider />
        
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Course Description
          </Typography>
          <Typography variant="body1" paragraph>
            {course.description || 'No description available for this course.'}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {enrollmentSuccess ? (
          <Box sx={{ mb: 2, width: '100%', textAlign: 'center' }}>
            <Chip 
              label="Successfully enrolled in this course!" 
              color="success" 
              variant="filled" 
              sx={{ px: 2, fontWeight: 500 }}
            />
          </Box>
        ) : enrollmentError ? (
          <Box sx={{ mb: 2, width: '100%', textAlign: 'center' }}>
            <Chip 
              label={enrollmentError} 
              color="error" 
              variant="filled" 
              sx={{ px: 2, fontWeight: 500 }}
            />
          </Box>
        ) : null}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
          <Button 
            onClick={onClose} 
            color="inherit" 
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              fontWeight: 600, 
              textTransform: 'none',
              flex: 1
            }}
          >
            Close
          </Button>
          <Button 
            onClick={handleEnroll} 
            color="secondary" 
            variant="contained" 
            disabled={enrolling || enrollmentSuccess}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 600, 
              textTransform: 'none',
              py: 1.2,
              flex: 2,
              boxShadow: '0 4px 12px rgba(255, 105, 105, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(255, 105, 105, 0.4)',
              }
            }}
          >
            {enrolling ? 'Enrolling...' : enrollmentSuccess ? 'Enrolled' : 'Enroll Now'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CourseDetailModal;
