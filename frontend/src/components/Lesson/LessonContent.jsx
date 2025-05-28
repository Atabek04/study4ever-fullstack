import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Alert, 
  Container,
  Divider,
  Button,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { 
  useLesson, 
  useLessonCompletion, 
  useLessonBookmark,
  useCourseDetails} from '../../hooks/lessonHooks';

/**
 * Helper function to get YouTube embed URL
 */
const getYouTubeEmbedUrl = (url) => {
  // Match standard YouTube URLs and extract the video ID
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

/**
 * VideoPlayer component for rendering lesson videos
 */
const VideoPlayer = ({ videoUrl, title }) => {
  if (!videoUrl) return null;

  // Try to convert YouTube links to embed format
  const youTubeEmbed = getYouTubeEmbedUrl(videoUrl);
  const canEmbed = youTubeEmbed !== null;

  return (
    <Box 
      sx={{ 
        width: '100%',
        position: 'relative',
        paddingTop: '56.25%' // 16:9 aspect ratio
      }}
    >
      {canEmbed ? (
        <iframe
          src={youTubeEmbed}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      ) : (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white',
          background: 'rgba(0,0,0,0.7)'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Video cannot be embedded
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            href={videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Watch on original site
          </Button>
        </Box>
      )}
    </Box>
  );
};

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string,
  title: PropTypes.string
};

/**
 * MarkdownContent component for rendering lesson notes with markdown
 */
const MarkdownContent = ({ content }) => {
  if (!content) return null;
  
  // Basic styling for markdown content
  const markdownStyles = {
    img: { 
      maxWidth: '100%', 
      borderRadius: '4px', 
      margin: '16px 0' 
    },
    pre: { 
      backgroundColor: 'rgba(0,0,0,0.03)', 
      padding: '16px', 
      borderRadius: '4px',
      overflowX: 'auto' 
    },
    code: { 
      backgroundColor: 'rgba(0,0,0,0.03)', 
      padding: '2px 4px', 
      borderRadius: '4px', 
      fontFamily: 'monospace' 
    },
    blockquote: { 
      borderLeft: '4px solid rgba(0,0,0,0.1)', 
      paddingLeft: '16px', 
      marginLeft: 0,
      fontStyle: 'italic'
    },
    a: { 
      color: '#C70039', 
      textDecoration: 'none' 
    }
  };
  
  return (
    <Box 
      sx={{ 
        '& a': markdownStyles.a,
        '& img': markdownStyles.img,
        '& pre': markdownStyles.pre,
        '& code': markdownStyles.code,
        '& blockquote': markdownStyles.blockquote,
        lineHeight: 1.7
      }}
    >
      <ReactMarkdown 
        rehypePlugins={[rehypeRaw]} // Enable raw HTML support
        components={{
          img: ({ node, ...props }) => {
            // Enhanced image rendering with support for HTML attributes
            return <img 
              style={{ 
                maxWidth: '100%', 
                height: props.height || 'auto',
                width: props.width || 'auto',
                borderRadius: '4px', 
                margin: '16px 0' 
              }} 
              {...props}
            />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

MarkdownContent.propTypes = {
  content: PropTypes.string
};

/**
 * LessonContent component - displays the selected lesson content
 * Enhanced with video player and markdown content support
 */
const LessonContent = ({ courseId, lessonId }) => {
  const theme = useTheme();
  
  // Fetch lesson details when lessonId changes
  const { lesson, loading, error } = useLesson(lessonId);
  
  // Fetch course details to get navigation context
  const { courseDetails } = useCourseDetails(courseId);
  
  // State to store moduleId, initialized with lesson.moduleId if available
  const [moduleId, setModuleId] = useState(lesson?.moduleId);
  
  // Find moduleId from course structure if not available from lesson data
  React.useEffect(() => {
    // If we already have moduleId from lesson, keep it
    if (lesson?.moduleId) {
      setModuleId(lesson.moduleId);
      return;
    }
    
    // If we have courseDetails but no moduleId, try to find it
    if (courseDetails?.modules && lessonId) {
      // Search for the lesson in all modules to find its moduleId
      for (const module of courseDetails.modules) {
        const foundLesson = module.lessons?.find(l => String(l.id) === String(lessonId));
        if (foundLesson) {
          console.log(`Found moduleId ${module.id} for lesson ${lessonId}`);
          setModuleId(module.id);
          break;
        }
      }
    }
  }, [lesson, courseDetails, lessonId]);
  
  // Track lesson completion status
  const { 
    isCompleted, 
    loading: completionLoading,
    toggleCompletion, 
    markAsComplete 
  } = useLessonCompletion(
    lessonId, 
    courseId, 
    moduleId // Use our tracked moduleId instead of lesson?.moduleId
  );
  
  // Debug log to track completion status changes and update localStorage
  React.useEffect(() => {
    console.log(`LessonContent: Lesson ${lessonId} - isCompleted: ${isCompleted}, loading: ${completionLoading}`);
    
    // Update localStorage when completion status changes
    if (isCompleted && lessonId) {
      localStorage.setItem(`lesson-${lessonId}-completed`, 'true');
    }
  }, [lessonId, isCompleted, completionLoading]);
  
  // Double-check completion status from localStorage on mount and whenever lessonId changes
  React.useEffect(() => {
    if (!lessonId) return;
    
    // Check localStorage immediately for better UX
    const localStorageCompleted = localStorage.getItem(`lesson-${lessonId}-completed`) === 'true';
    
    if (localStorageCompleted) {
      console.log(`LessonContent: Found completed status in localStorage for lesson ${lessonId}`);
      // We can't use setIsCompleted directly since it's from the hook
      // This will be handled by the useLessonCompletion hook
    }
    
    // No need for interval checking - this was causing excessive API calls
    // and potential memory leaks. Instead, rely on events and normal completion status
  }, [lessonId, isCompleted]);
  
  // Track bookmark status
  const { isBookmarked, toggleBookmark } = useLessonBookmark(lessonId);
  
  // State for storing previous and next lesson IDs
  const [navLessons, setNavLessons] = useState({
    prevLessonId: null,
    nextLessonId: null
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Custom handler for completion with feedback - only allows marking as complete
  const handleCompletion = async () => {
    // Don't do anything if already completed
    if (isCompleted) {
      return;
    }
    
    // Check if we have all the required IDs first
    if (!moduleId) {
      console.warn('Missing moduleId - waiting for course data to load');
      setSnackbar({ 
        open: true, 
        message: 'Loading course structure... Please try again in a moment.', 
        severity: 'warning' 
      });
      return;
    }
    
    // Show feedback that we're processing the request
    setSnackbar({
      open: true,
      message: 'Marking lesson as complete...',
      severity: 'info'
    });
    
    try {
      // Call the markAsComplete function that makes the API request and updates state
      const result = await markAsComplete();
      if (result) {
        setSnackbar({ open: true, message: 'Lesson marked as completed!', severity: 'success' });
      } else {
        // The error message will be set in the markAsComplete function
        setSnackbar({ 
          open: true, 
          message: 'Failed to mark lesson as completed. Please try again in a moment.',
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Error handling completion:', error);
      
      // Determine if this is a 404 error (module progress initialization needed)
      const is404 = error.response?.status === 404;
      const errorMessage = is404 
        ? 'Module progress needs to be initialized. Please try again.' 
        : 'Failed to mark lesson as completed. Please try again.';
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    }
  };
  
  // Find adjacent lessons when course or lesson data changes
  React.useEffect(() => {
    if (!courseDetails || !lessonId) return;
    
    let prevId = null;
    let nextId = null;
    let foundCurrent = false;
    
    // Flatten modules and lessons to create a sequential list
    const allLessons = [];
    courseDetails.modules?.forEach(module => {
      module.lessons?.forEach(lesson => {
        allLessons.push(lesson);
      });
    });
    
    // Find previous and next lessons
    for (let i = 0; i < allLessons.length; i++) {
      if (allLessons[i].id === lessonId) {
        foundCurrent = true;
        if (i > 0) prevId = allLessons[i-1].id;
        if (i < allLessons.length - 1) nextId = allLessons[i+1].id;
        break;
      }
    }
    
    setNavLessons({
      prevLessonId: prevId,
      nextLessonId: nextId
    });
  }, [courseDetails, lessonId]);
  
  // Automatically initialize module progress when lesson loads
  React.useEffect(() => {
    // Only initialize if we have all needed IDs
    if (lessonId && courseId && moduleId) {
      // Function to initialize module progress
      const initializeModuleProgress = async () => {
        const cacheKey = `module-${moduleId}-initialized`;
        
        try {
          // Check localStorage first to avoid redundant API calls
          if (localStorage.getItem(cacheKey) === 'true') {
            console.log(`[LessonContent] Module ${moduleId} was previously initialized (cached)`);
            return;
          }

          console.log(`[LessonContent] Checking if module progress exists for module ${moduleId}`);
          
          try {
            // First check if module progress already exists on the server
            const progressResponse = await api.get(`/api/v1/courses/${courseId}/modules/${moduleId}/progress`);
            if (progressResponse.status >= 200 && progressResponse.status < 300) {
              console.log(`[LessonContent] Module progress already exists for module ${moduleId}`);
              localStorage.setItem(cacheKey, 'true'); // Cache that this module is initialized
              return; // Module progress already exists, no need to initialize
            }
          } catch (checkError) {
            // If 404, module progress doesn't exist and we should create it
            if (checkError.response?.status !== 404) {
              console.warn(`[LessonContent] Error checking module progress: ${checkError}`);
            } else {
              console.log(`[LessonContent] Module progress doesn't exist yet for module ${moduleId}, will create it`);
            }
          }
          
          // Get module details to know the total lesson count
          console.log(`[LessonContent] Getting module details for module ${moduleId}`);
          const moduleResponse = await api.get(`/api/v1/modules/${moduleId}`);
          const { lessonCount } = moduleResponse.data;
          
          // Initialize module progress
          console.log(`[LessonContent] Initializing module progress for module ${moduleId} with ${lessonCount} lessons`);
          await api.post(`/api/v1/courses/${courseId}/modules/${moduleId}/progress?totalLessonsCount=${lessonCount}`);
          console.log(`[LessonContent] Successfully initialized module progress for module ${moduleId}`);
          
          // Cache successful initialization
          localStorage.setItem(cacheKey, 'true');
          
          // Update UI with success message
          setSnackbar({
            open: true,
            message: 'Module progress initialized successfully',
            severity: 'success'
          });
          
        } catch (error) {
          console.error('[LessonContent] Error initializing module progress:', error);
          
          // Show user-friendly error message
          if (error.response?.status === 400) {
            // 400 usually means it's already initialized
            localStorage.setItem(cacheKey, 'true'); // Cache it as initialized
          } else {
            // Other errors - show to user but don't block
            setSnackbar({
              open: true,
              message: 'There was an issue with module initialization. You can still view the lesson.',
              severity: 'warning'
            });
          }
        }
      };
      
      // Call the initialization function
      initializeModuleProgress();
    }
  }, [lessonId, courseId, moduleId]);
  
  // Show loading state while fetching lesson data, but only if we don't have 
  // lesson data yet - this prevents flickering for completed lessons
  if (loading && !lesson) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state if lesson fetch failed and we have an error message
  if (error && !lesson) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error || 'Failed to load lesson. Please try again.'}
        </Alert>
      </Container>
    );
  }

  // Show error if course details are missing (API failure or not found)
  if (!courseDetails) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {'Failed to load course details. Please try again or contact support.'}
        </Alert>
      </Container>
    );
  }

  // Show placeholder if no lesson is selected or lesson data is missing
  if (!lessonId || !lesson) {
    return (
      <Container sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '60vh'
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {lessonId ? 'Lesson data not found or failed to load.' : 'Select a lesson from the sidebar'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {lessonId ? 'Please try refreshing the page or contact support.' : 'Choose a lesson to start learning'}
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Render the lesson content
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Lesson header with title and actions */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          mb: 4, 
          backgroundColor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary'
            }}
          >
            {lesson.title}
          </Typography>
          
          {/* Lesson actions: bookmark and mark complete */}
          <Stack direction="row" spacing={1}>
            <Tooltip title={isBookmarked ? "Remove bookmark" : "Add bookmark"}>
              <IconButton 
                onClick={toggleBookmark}
                color={isBookmarked ? "secondary" : "default"}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="View all bookmarks">
              <Button
                onClick={() => window.location.href = '/bookmarks'}
                color="primary"
                variant="text"
                size="small"
                sx={{ ml: 1 }}
                aria-label="View all bookmarks"
              >
                My Bookmarks
              </Button>
            </Tooltip>
            
            <Tooltip title={isCompleted 
              ? "Lesson completed" 
              : "Mark lesson as complete"}>
              <span>
                <IconButton 
                  onClick={handleCompletion}
                  disabled={isCompleted || completionLoading}
                  color={isCompleted ? "success" : "default"}
                  aria-label={isCompleted ? "Lesson completed" : "Mark lesson as complete"}
                  sx={{ 
                    opacity: (completionLoading || isCompleted) ? 0.7 : 1,
                    cursor: isCompleted ? 'default' : 'pointer'
                  }}
                >
                  {isCompleted ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
        
        {/* Lesson metadata */}
        {lesson.duration && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {lesson.duration}
            </Typography>
          </Box>
        )}
        
        {/* Video player */}
        {lesson.videoUrl && (
          <VideoPlayer videoUrl={lesson.videoUrl} title={lesson.title} />
        )}
        
        {/* Lesson content as markdown */}
        <Box sx={{ mb: 4 }}>
          <MarkdownContent content={lesson.content} />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Lesson navigation */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mt: 4
          }}
        >
          {/* Previous lesson button */}
          <Button 
            startIcon={<NavigateBeforeIcon />}
            disabled={!navLessons.prevLessonId}
            onClick={() => window.location.href = `/courses/${courseId}/lessons/${navLessons.prevLessonId}`}
            variant="outlined"
            sx={{ 
              visibility: navLessons.prevLessonId ? 'visible' : 'hidden',
              borderRadius: theme.spacing(1)
            }}
          >
            Previous Lesson
          </Button>
          
          {/* Next lesson button */}
          <Button 
            endIcon={<NavigateNextIcon />}
            disabled={!navLessons.nextLessonId}
            onClick={() => window.location.href = `/courses/${courseId}/lessons/${navLessons.nextLessonId}`}
            variant="contained"
            color="primary"
            sx={{ 
              visibility: navLessons.nextLessonId ? 'visible' : 'hidden',
              borderRadius: theme.spacing(1)
            }}
          >
            Next Lesson
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

LessonContent.propTypes = {
  courseId: PropTypes.string.isRequired,
  lessonId: PropTypes.string
};

export default LessonContent;
