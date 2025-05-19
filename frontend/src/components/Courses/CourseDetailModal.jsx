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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { useState, useEffect } from 'react';
import { useEnrollment, useInstructor } from '../../hooks/courseHooks';
import api from '../../api/axios';

const CourseDetailModal = ({ course, open, onClose }) => {
  const { enrollInCourse, enrolling } = useEnrollment();
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Fetch instructor details
  const { instructor, loading: instructorLoading } = useInstructor(course.instructorId);

  // Fetch course details (modules/lessons)
  const [courseDetails, setCourseDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  useEffect(() => {
    if (!open || !course?.id) return;
    setDetailsLoading(true);
    setDetailsError('');
    setCourseDetails(null);
    console.log('[CourseDetailModal] Fetching course details for course id:', course.id);
    api.get(`/api/v1/courses/details/${course.id}`)
      .then(res => {
        console.log('[CourseDetailModal] Received response:', res);
        if (res.status !== 200) throw new Error('Failed to fetch course content');
        // Handle array response
        const courseObj = Array.isArray(res.data) ? res.data[0] : res.data;
        setCourseDetails(courseObj);
        console.log('[CourseDetailModal] Set courseDetails:', courseObj);
      })
      .catch(err => {
        setDetailsError(err.message || 'Failed to load course content');
        console.error('[CourseDetailModal] Error fetching course details:', err);
      })
      .finally(() => {
        setDetailsLoading(false);
        console.log('[CourseDetailModal] Finished loading course details.');
      });
  }, [open, course?.id]);

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
  console.log('[CourseDetailModal] Render', { course, courseDetails, detailsLoading, detailsError });
  
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
              {instructorLoading
                ? 'Loading instructor...'
                : instructor
                  ? `${instructor.firstName} ${instructor.lastName}`
                  : 'Unknown Instructor'}
            </Typography>
            {instructor && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95em' }}>
                {instructor.email}
              </Typography>
            )}
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

        <Divider sx={{ my: 2 }} />
        {/* Course Content Section (Phase 3: Udemy-style accordion) */}
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Course Content
          </Typography>
          {detailsLoading && (
            <Box>
              {[1,2,3].map(i => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Box sx={{ bgcolor: '#f3f6f9', height: 32, width: '60%', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ bgcolor: '#f3f6f9', height: 20, width: '80%', borderRadius: 1, mb: 0.5 }} />
                  <Box sx={{ bgcolor: '#f3f6f9', height: 20, width: '70%', borderRadius: 1 }} />
                </Box>
              ))}
            </Box>
          )}
          {detailsError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>{detailsError}</Typography>
          )}
          {!detailsLoading && !detailsError && courseDetails && Array.isArray(courseDetails.modules) && courseDetails.modules.length > 0 && (
            <Box>
              {courseDetails.modules
                .slice()
                .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
                .map((module, idx) => (
                  <Accordion 
                    key={module.id || idx} 
                    disableGutters 
                    sx={{ 
                      mb: 1, 
                      bgcolor: '#F9EFD6', 
                      borderRadius: 2, 
                      boxShadow: 'none', 
                      border: '1px solid #f3f6f9',
                      '&:hover': {
                        bgcolor: '#FFF8ED', // much lighter cream on hover for best contrast
                      },
                      '&.Mui-expanded': {
                        bgcolor: '#F9EFD6',
                      }
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 56 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <MenuBookIcon sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography fontWeight={600} sx={{ flex: 1, fontSize: '1.08rem', color: 'text.primary' }}>
                          {module.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                          Module {module.sortOrder ?? module.order ?? idx + 1}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                          {module.lessons?.length || 0} lesson{module.lessons?.length === 1 ? '' : 's'}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: '#FCF5E8', borderRadius: 2, p: 0 }}>
                      {Array.isArray(module.lessons) && module.lessons.length > 0 ? (
                        <List disablePadding>
                          {module.lessons
                            .slice()
                            .sort((a, b) => (a.sortOrder ?? a.order ?? 0) - (b.sortOrder ?? b.order ?? 0))
                            .map((lesson, lidx) => (
                              <ListItem key={lesson.id || lidx} divider sx={{ py: 1.2, px: 2, alignItems: 'flex-start', bgcolor: '#FCF5E8' }}>
                                <ListItemIcon sx={{ minWidth: 36, color: 'primary.main', mt: 0.2 }}>
                                  <Typography fontWeight={600} sx={{ fontSize: '1.1rem' }}>{lesson.sortOrder ?? lesson.order ?? lidx + 1}</Typography>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography fontWeight={500} sx={{ fontSize: '1.05rem', color: 'text.primary' }}>
                                      {lesson.title}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                      <AccessTimeIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {typeof lesson.durationMinutes === 'number' && lesson.durationMinutes > 0
                                          ? `${lesson.durationMinutes} min`
                                          : 'No duration'}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
                          No lessons in this module yet.
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
            </Box>
          )}
          {!detailsLoading && !detailsError && courseDetails && Array.isArray(courseDetails.modules) && courseDetails.modules.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No modules or lessons have been added to this course yet.
            </Typography>
          )}
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
