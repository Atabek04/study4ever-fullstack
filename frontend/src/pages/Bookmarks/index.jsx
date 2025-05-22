import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Divider, 
  Stack, 
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useBookmarkedLessons } from '../../hooks/lessonHooks';

/**
 * BookmarksPage component - displays all bookmarked lessons across courses
 */
const BookmarksPage = () => {
  const navigate = useNavigate();
  const { 
    bookmarkedLessons, 
    loading, 
    error, 
    removeBookmark, 
    clearAllBookmarks 
  } = useBookmarkedLessons();
  
  // Group bookmarks by course
  const bookmarksByCourseThenModule = React.useMemo(() => {
    const grouped = {};
    
    bookmarkedLessons.forEach(lesson => {
      // Initialize course if not exists
      if (!grouped[lesson.courseId]) {
        grouped[lesson.courseId] = {
          id: lesson.courseId,
          title: lesson.courseTitle,
          modules: {}
        };
      }
      
      // Initialize module if not exists
      if (!grouped[lesson.courseId].modules[lesson.moduleId]) {
        grouped[lesson.courseId].modules[lesson.moduleId] = {
          id: lesson.moduleId,
          title: lesson.moduleTitle,
          lessons: []
        };
      }
      
      // Add lesson to module
      grouped[lesson.courseId].modules[lesson.moduleId].lessons.push(lesson);
    });
    
    return grouped;
  }, [bookmarkedLessons]);
  
  // Handle navigating to a lesson
  const handleGoToLesson = (courseId, lessonId) => {
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };
  
  // Handle removing a bookmark
  const handleRemoveBookmark = (lessonId, event) => {
    event.stopPropagation();
    removeBookmark(lessonId);
  };
  
  // Handle clearing all bookmarks
  const handleClearAll = () => {
    // Confirm before clearing
    if (window.confirm('Are you sure you want to remove all bookmarks?')) {
      clearAllBookmarks();
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          My Bookmarks
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {bookmarkedLessons.length} saved lessons across {Object.keys(bookmarksByCourseThenModule).length} courses
          </Typography>
          
          {bookmarkedLessons.length > 0 && (
            <Button 
              startIcon={<DeleteSweepIcon />}
              onClick={handleClearAll}
              variant="outlined" 
              color="error"
              size="small"
            >
              Clear All
            </Button>
          )}
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {bookmarkedLessons.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookmarked lessons yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add bookmarks while watching lessons to save them for later
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/courses')}
          >
            Browse Courses
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Render bookmarked lessons grouped by course and module */}
          {Object.values(bookmarksByCourseThenModule).map(course => (
            <Grid item xs={12} key={course.id}>
              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography 
                  variant="h5" 
                  sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}
                >
                  {course.title}
                </Typography>
                
                {Object.values(course.modules).map(module => (
                  <Box key={module.id} sx={{ mb: 3 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mb: 2, 
                        fontWeight: 600, 
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        p: 1,
                        borderRadius: 1
                      }}
                    >
                      {module.title}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {module.lessons.map(lesson => (
                        <Grid item xs={12} md={6} key={lesson.id}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3
                              }
                            }}
                            onClick={() => handleGoToLesson(lesson.courseId, lesson.id)}
                          >
                            <CardContent>
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start'
                              }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="h6" gutterBottom>{lesson.title}</Typography>
                                  
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <PlayCircleOutlineIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                      Resume Learning
                                    </Typography>
                                  </Stack>
                                  
                                  {lesson.duration && (
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                      <AccessTimeIcon fontSize="small" color="action" />
                                      <Typography variant="body2" color="text.secondary">
                                        {lesson.duration}
                                      </Typography>
                                    </Stack>
                                  )}
                                </Box>
                                
                                <IconButton 
                                  color="error" 
                                  size="small" 
                                  onClick={(e) => handleRemoveBookmark(lesson.id, e)}
                                  sx={{ ml: 1 }}
                                  aria-label="Remove bookmark"
                                >
                                  <BookmarkRemoveIcon />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default BookmarksPage;
