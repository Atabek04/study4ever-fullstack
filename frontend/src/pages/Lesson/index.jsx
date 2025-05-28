import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Container, 
  Alert,
  useMediaQuery,
  useTheme,
  IconButton} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useCourseDetails } from '../../hooks/lessonHooks';
import { useEnrolledCourseIds } from '../../hooks/courseHooks';
import LessonSidebar from '../../components/Lesson/LessonSidebar';
import LessonContent from '../../components/Lesson/LessonContent';
import NotFoundPage from '../NotFound';

/**
 * Lesson page component providing a LinkedIn Learning-like experience
 * with a persistent sidebar for navigating course modules and lessons
 * Includes enrollment verification to prevent unauthorized access
 */
const LessonPage = () => {
  const { courseId, lessonId: initialLessonId } = useParams();
  const [currentLessonId, setCurrentLessonId] = useState(initialLessonId);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Check if user is enrolled in the course
  const { enrolledCourseIds, loading: enrollmentLoading, error: enrollmentError } = useEnrolledCourseIds();
  
  // Fetch the course structure with modules and lessons only if enrolled
  const shouldFetchCourse = enrolledCourseIds.includes(courseId);
  const { 
    courseDetails, 
    loading: courseLoading, 
    error: courseError
  } = useCourseDetails(shouldFetchCourse ? courseId : null);
  
  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Check enrollment status when courseId or enrolledCourseIds change
  const isEnrolled = enrolledCourseIds.length > 0 && enrolledCourseIds.includes(courseId);
  const enrollmentCheckComplete = !enrollmentLoading && enrolledCourseIds.length >= 0;

  // If enrollment check is complete and user is not enrolled, show 404
  if (enrollmentCheckComplete && !isEnrolled) {
    return (
      <NotFoundPage 
        title="Course Access Denied"
        message="You are not enrolled in this course. Please enroll in the course to access its lessons."
      />
    );
  }

  // If there's an enrollment error, show error
  if (enrollmentError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to verify course enrollment: {enrollmentError}
        </Alert>
      </Container>
    );
  }

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

  // Show loading if either enrollment check or course loading is in progress
  if (enrollmentLoading || courseLoading) {
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
          key={currentLessonId} // Add key to force re-render when lesson changes
          courseId={courseId} 
          lessonId={currentLessonId} 
        />
      </Box>
    </Box>
  );
};

export default LessonPage;
