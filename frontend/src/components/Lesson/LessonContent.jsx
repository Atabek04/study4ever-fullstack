import React, { useState, useEffect } from 'react';
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
  Avatar,
  Chip,
  LinearProgress,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import ReactMarkdown from 'react-markdown';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import BarChartIcon from '@mui/icons-material/BarChart';
import { 
  useLesson, 
  useLessonCompletion, 
  useLessonBookmark,
  useCourseDetails,
  useModuleProgress
} from '../../hooks/lessonHooks';

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
        paddingTop: '56.25%', // 16:9 aspect ratio
        marginBottom: 4,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'black'
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
      <ReactMarkdown>
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
  
  // Track lesson completion status
  const { 
    isCompleted, 
    loading: completionLoading,
    toggleCompletion, 
    markAsComplete 
  } = useLessonCompletion(
    lessonId, 
    courseId, 
    lesson?.moduleId // Use moduleId from the lesson data
  );
  
  // Debug log to track completion status changes
  React.useEffect(() => {
    console.log(`LessonContent: Lesson ${lessonId} - isCompleted: ${isCompleted}, loading: ${completionLoading}`);
  }, [lessonId, isCompleted, completionLoading]);
  
  // Track bookmark status
  const { isBookmarked, toggleBookmark } = useLessonBookmark(lessonId);
  
  // State for storing previous and next lesson IDs
  const [navLessons, setNavLessons] = useState({
    prevLessonId: null,
    nextLessonId: null
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Custom handler for completion with feedback
  const handleCompletion = async () => {
    const prevState = isCompleted;
    
    try {
      if (!prevState) {
        // Marking as complete - make API call
        const result = await markAsComplete();
        if (result) {
          setSnackbar({ open: true, message: 'Lesson marked as completed!', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: 'Error occurred. Please try again.', severity: 'error' });
        }
      } else {
        // Marking as incomplete - just UI update, no API call
        setSnackbar({ open: true, message: 'Lesson marked as incomplete (UI only)', severity: 'info' });
        toggleCompletion();
      }
    } catch (error) {
      console.error('Error handling completion:', error);
      setSnackbar({ open: true, message: 'Error occurred. Please try again.', severity: 'error' });
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
  
  // Show loading state while fetching lesson data
  if (loading) {
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
  
  // Show error state if lesson fetch failed
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error || 'Failed to load lesson. Please try again.'}
        </Alert>
      </Container>
    );
  }
  
  // Show placeholder if no lesson is selected
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
            Select a lesson from the sidebar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose a lesson to start learning
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
            
            <Tooltip title={isBookmarked ? "View all bookmarks" : "View all bookmarks"}>
              <IconButton
                onClick={() => window.location.href = '/bookmarks'}
                color="primary"
                aria-label="View all bookmarks"
              >
                <Button
                  variant="text"
                  size="small"
                  sx={{ ml: -1 }}
                >
                  My Bookmarks
                </Button>
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isCompleted ? "Mark as incomplete" : "Mark as complete"}>
              <IconButton 
                onClick={handleCompletion}
                disabled={completionLoading}
                color={isCompleted ? "success" : "default"}
                aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                sx={{ opacity: completionLoading ? 0.5 : 1 }}
              >
                {isCompleted ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
              </IconButton>
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
