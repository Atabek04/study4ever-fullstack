import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Container, 
  Grid, 
  Alert,
  useMediaQuery,
  useTheme,
  IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useCourseDetails } from '../../hooks/lessonHooks';
import LessonSidebar from '../../components/Lesson/LessonSidebar';
import LessonContent from '../../components/Lesson/LessonContent';

/**
 * Lesson page component providing a LinkedIn Learning-like experience
 * with a persistent sidebar for navigating course modules and lessons
 */
const LessonPage = () => {
  const { courseId, lessonId: initialLessonId } = useParams();
  const [currentLessonId, setCurrentLessonId] = useState(initialLessonId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Fetch the course structure with modules and lessons
  const { 
    courseDetails, 
    loading: courseLoading, 
    error: courseError
  } = useCourseDetails(courseId);
  
  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Handle lesson selection
  const handleLessonSelect = (lessonId) => {
    setCurrentLessonId(lessonId);
    // Update URL for deep-linking without page reload
    navigate(`/courses/${courseId}/lessons/${lessonId}`, { replace: true });
    // On mobile, close the sidebar after selecting a lesson
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (courseLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (courseError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {courseError || 'Failed to load course. Please try again.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile sidebar toggle button */}
      {isMobile && (
        <IconButton
          color="primary"
          aria-label="open sidebar"
          edge="start"
          onClick={toggleSidebar}
          sx={{ 
            position: 'fixed', 
            left: 20, 
            top: 20, 
            zIndex: 1100,
            bgcolor: 'background.paper', 
            boxShadow: 2
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Course and Lesson Navigation Sidebar */}
      <LessonSidebar 
        course={courseDetails}
        currentLessonId={currentLessonId}
        onLessonSelect={handleLessonSelect}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Main Lesson Content Area */}
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${sidebarOpen ? '300px' : '0px'})` },
          ml: { xs: 0, md: sidebarOpen ? '300px' : 0 },
          transition: theme => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <LessonContent 
          courseId={courseId} 
          lessonId={currentLessonId} 
        />
      </Box>
    </Box>
  );
};

export default LessonPage;
