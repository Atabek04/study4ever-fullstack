import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack,
  Button,
  IconButton,
  useTheme,
  alpha,
  Paper,
  Grid,
  useMediaQuery
} from '@mui/material';
import {
  BookmarkBorder as BookmarkBorderIcon,
  DateRange as DateIcon,
  School as CourseIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBookmarks, useBookmarkToggle } from '../../hooks/bookmarkHooks';
import { useCourses } from '../../hooks/courseHooks';
import { format } from 'date-fns';
import api from '../../api/axios';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const BookmarksPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { bookmarks, loading, error, refetch } = useBookmarks();
  const { courses, loading: coursesLoading } = useCourses();
  
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  // Better drawer state detection: Check if we're on desktop and estimate based on common patterns
  // On desktop, drawer is usually open by default, on mobile it's closed
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // Update drawer state when screen size changes (mimicking DashboardLayout behavior)
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Debug logging
  useEffect(() => {
    console.log('BookmarksPage: Drawer state and breakpoints:', {
      isMobile,
      isTablet,
      drawerOpen,
      screenWidth: window.innerWidth
    });
  }, [isMobile, isTablet, drawerOpen]);

  // Create a map of courseId to course title
  const courseMap = useMemo(() => {
    const map = {};
    courses.forEach(course => {
      map[course.id] = course.title;
    });
    console.log('BookmarksPage: Course map created:', map);
    return map;
  }, [courses]);

  // Enrich bookmarks with lesson titles, module titles, and course titles
  const [enrichedBookmarks, setEnrichedBookmarks] = useState([]);
  const [isEnriching, setIsEnriching] = useState(false);

  // Function to enrich bookmarks with lesson and module details
  const enrichBookmarksWithDetails = useCallback(async (bookmarksToEnrich) => {
    if (!bookmarksToEnrich || bookmarksToEnrich.length === 0) {
      setEnrichedBookmarks([]);
      return [];
    }

    setIsEnriching(true);
    
    try {
      // Enrich each bookmark with lesson and module details
      const enrichedPromises = bookmarksToEnrich.map(async (bookmark) => {
        try {
          // Fetch lesson details
          const lessonResponse = await api.get(`/api/v1/lessons/${bookmark.lessonId}`);
          const lessonData = lessonResponse.data;
          
          // Fetch course details to get module information
          const courseResponse = await api.get(`/api/v1/courses/${bookmark.courseId}/details`);
          const courseData = courseResponse.data;
          
          // Find the module containing this lesson
          let moduleTitle = 'Unknown Module';
          courseData.modules?.forEach(module => {
            const foundLesson = module.lessons?.find(lesson => String(lesson.id) === String(bookmark.lessonId));
            if (foundLesson) {
              moduleTitle = module.title;
            }
          });

          return {
            ...bookmark,
            lessonTitle: lessonData.title || `Lesson ${bookmark.lessonId}`,
            moduleTitle: moduleTitle,
            courseTitle: courseMap[bookmark.courseId] || courseData.title || `Course ${bookmark.courseId}`,
            lessonDuration: lessonData.durationMinutes || 0
          };
        } catch (error) {
          console.error(`Failed to enrich bookmark for lesson ${bookmark.lessonId}:`, error);
          // Return with fallback values if enrichment fails
          return {
            ...bookmark,
            lessonTitle: `Lesson ${bookmark.lessonId}`,
            moduleTitle: 'Unknown Module',
            courseTitle: courseMap[bookmark.courseId] || `Course ${bookmark.courseId}`,
            lessonDuration: 0
          };
        }
      });

      const enriched = await Promise.all(enrichedPromises);
      console.log('BookmarksPage: Enriched bookmarks with lesson details:', enriched);
      setEnrichedBookmarks(enriched);
      return enriched;
    } catch (error) {
      console.error('Error enriching bookmarks:', error);
      // Fallback to basic enrichment with course titles only
      const basicEnriched = bookmarksToEnrich.map(bookmark => ({
        ...bookmark,
        lessonTitle: `Lesson ${bookmark.lessonId}`,
        moduleTitle: 'Unknown Module',
        courseTitle: courseMap[bookmark.courseId] || `Course ${bookmark.courseId}`,
        lessonDuration: 0
      }));
      setEnrichedBookmarks(basicEnriched);
      return basicEnriched;
    } finally {
      setIsEnriching(false);
    }
  }, [courseMap]);

  // Enrich bookmarks when bookmarks or courses change
  useEffect(() => {
    enrichBookmarksWithDetails(bookmarks);
  }, [bookmarks, enrichBookmarksWithDetails]);

  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = enrichedBookmarks;

    console.log('BookmarksPage: Starting filtering process');
    console.log('- Selected course:', selectedCourse);
    console.log('- Available courses:', courses.map(c => ({ id: c.id, title: c.title })));
    console.log('- Enriched bookmarks:', enrichedBookmarks.map(b => ({ 
      courseId: b.courseId, 
      courseTitle: b.courseTitle,
      lessonTitle: b.lessonTitle 
    })));

    // Filter by course - compare courseId not title
    if (selectedCourse !== 'all') {
      console.log(`BookmarksPage: Filtering by course ID: ${selectedCourse} (type: ${typeof selectedCourse})`);
      filtered = filtered.filter(bookmark => {
        const bookmarkCourseId = bookmark.courseId;
        const selectedCourseId = selectedCourse;
        
        // Handle potential type mismatches (string vs number)
        const matches = String(bookmarkCourseId) === String(selectedCourseId);
        console.log(`- Bookmark courseId: ${bookmarkCourseId} (type: ${typeof bookmarkCourseId}), selectedCourse: ${selectedCourseId} (type: ${typeof selectedCourseId}), matches: ${matches}`);
        return matches;
      });
      console.log('BookmarksPage: Filtered bookmarks after course filter:', filtered);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(bookmark => 
        bookmark.lessonTitle?.toLowerCase().includes(term) ||
        bookmark.courseTitle?.toLowerCase().includes(term) ||
        bookmark.moduleTitle?.toLowerCase().includes(term)
      );
    }

    // Sort bookmarks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'course':
          return (a.courseTitle || '').localeCompare(b.courseTitle || '');
        default:
          return 0;
      }
    });

    console.log('BookmarksPage: Final filtered and sorted bookmarks:', filtered);
    return filtered;
  }, [enrichedBookmarks, selectedCourse, searchTerm, sortBy]);

  const handleGoToLesson = (courseId, lessonId) => {
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleRemoveBookmark = async (lessonId) => {
    try {
      // Find the bookmark to get courseId and moduleId for removal
      const bookmark = enrichedBookmarks.find(b => b.lessonId === lessonId);
      if (bookmark) {
        // Use the api instance to remove bookmark
        await api.delete(`/api/v1/lessons/${lessonId}/bookmark`);
        
        // Dispatch event for real-time updates
        window.dispatchEvent(new CustomEvent('bookmarkChanged', {
          detail: { lessonId, isBookmarked: false }
        }));
        // Refresh bookmarks list
        await refetch();
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  if (loading || coursesLoading || isEnriching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 3, sm: 3 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            My Bookmarks
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {filteredAndSortedBookmarks.length} saved lessons
            {selectedCourse !== 'all' && courses.length > 0 && 
              ` in ${courses.find(c => c.id === selectedCourse)?.title || 'selected course'}`
            }
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {enrichedBookmarks.length > 0 && (
          <Paper sx={{ 
            p: 3, 
            mb: 3,
            mx: { xs: 0, sm: 0.25 } // Match the Grid container's effective margin
          }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flex: 1, minWidth: 250 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Course</InputLabel>
                <Select
                  value={selectedCourse}
                  label="Course"
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <MenuItem value="all">All Courses</MenuItem>
                  {courses.map(course => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="course">Course</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        )}

        {filteredAndSortedBookmarks.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <BookmarkBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {enrichedBookmarks.length === 0 ? 'No bookmarked lessons yet' : 'No bookmarks match your search'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {enrichedBookmarks.length === 0 
                ? 'Add bookmarks while watching lessons to save them for later'
                : 'Try adjusting your search or filter criteria'
              }
            </Typography>
            {enrichedBookmarks.length === 0 && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/courses')}
                sx={{ borderRadius: 2 }}
              >
                Browse Courses
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={2.5} sx={{ mx: -0.25 }}>
            {filteredAndSortedBookmarks.map((bookmark) => {
              return (
                <Grid 
                  item 
                  xs={12}
                  sm={6} 
                  md={4}
                  lg={3}
                  key={bookmark.id}
                  sx={{ px: 0.25 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                    onClick={() => handleGoToLesson(bookmark.courseId, bookmark.lessonId)}
                  >
                    <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Header with delete button */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        mb: 1
                      }}>
                        <Box sx={{ flexGrow: 1, mr: 1 }}>
                          {/* Lesson Title */}
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600,
                              color: 'text.primary',
                              mb: 0.5,
                              fontSize: '0.95rem',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {bookmark.lessonTitle || `Lesson ${bookmark.lessonId}`}
                          </Typography>
                          
                          {/* Module and Lesson Numbers */}
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: '0.75rem',
                              display: 'block',
                              mb: 1
                            }}
                          >
                            {bookmark.moduleTitle || `Module ${bookmark.moduleId}`} • Lesson {bookmark.lessonId}
                          </Typography>
                        </Box>

                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(bookmark.lessonId);
                          }}
                          size="small"
                          sx={{
                            color: 'text.secondary',
                            p: 0.5,
                            '&:hover': {
                              color: 'error.main',
                              backgroundColor: alpha(theme.palette.error.main, 0.1)
                            }
                          }}
                          aria-label="Remove bookmark"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Course and Date Info */}
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                        <Chip
                          icon={<CourseIcon />}
                          label={bookmark.courseTitle || `Course ${bookmark.courseId}`}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 24,
                            '& .MuiChip-icon': { fontSize: '0.9rem' }
                          }}
                        />
                        <Chip
                          icon={<DateIcon />}
                          label={format(new Date(bookmark.createdAt), 'MMM dd')}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 24,
                            '& .MuiChip-icon': { fontSize: '0.9rem' }
                          }}
                        />
                      </Box>

                      {/* Continue Button */}
                      <Box sx={{ mt: 'auto' }}>
                        <Button
                          variant="contained"
                          startIcon={<PlayIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoToLesson(bookmark.courseId, bookmark.lessonId);
                          }}
                          size="small"
                          fullWidth
                          sx={{
                            borderRadius: 1.5,
                            fontSize: '0.8rem',
                            py: 0.5,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.8)
                            }
                          }}
                        >
                          Continue
                        </Button>
                      </Box>
                    </CardContent>
                </Card>
              </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default BookmarksPage;
