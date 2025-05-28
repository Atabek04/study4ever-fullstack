import React, { useState, useMemo } from 'react';
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
  alpha
} from '@mui/material';
import {
  BookmarkBorder as BookmarkBorderIcon,
  DateRange as DateIcon,
  School as CourseIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useBookmarks } from '../hooks/bookmarkHooks';
import { useCourses } from '../hooks/courseHooks';
import { format } from 'date-fns';
import api from '../api/axios';

const BookmarksPage = () => {
  const theme = useTheme();
  const { bookmarks, loading, error, refetch } = useBookmarks();
  const { courses } = useCourses();
  
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = bookmarks;

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(bookmark => bookmark.courseId === selectedCourse);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bookmark =>
        bookmark.lessonTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
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

    return filtered;
  }, [bookmarks, selectedCourse, sortBy, searchTerm]);

  const handleRemoveBookmark = async (lessonId) => {
    try {
      await api.delete(`/api/v1/lessons/${lessonId}/bookmark`);
      refetch();
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const handleGoToLesson = (courseId, lessonId) => {
    window.location.href = `/courses/${courseId}/lessons/${lessonId}`;
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          My Bookmarks
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Keep track of your favorite lessons and return to them anytime
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <TextField
            label="Search bookmarks"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Course</InputLabel>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              label="Filter by Course"
            >
              <MenuItem value="all">All Courses</MenuItem>
              {courses.map(course => (
                <MenuItem key={course.id} value={course.id}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort by"
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="course">By Course</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Bookmarks Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          {filteredAndSortedBookmarks.length} bookmark{filteredAndSortedBookmarks.length !== 1 ? 's' : ''} found
        </Typography>
      </Box>

      {/* Bookmarks List */}
      {filteredAndSortedBookmarks.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <BookmarkBorderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {bookmarks.length === 0 ? 'No bookmarks yet' : 'No bookmarks match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {bookmarks.length === 0 
              ? 'Start bookmarking lessons you want to return to later'
              : 'Try adjusting your search or filter criteria'
            }
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {filteredAndSortedBookmarks.map((bookmark) => (
            <Card 
              key={bookmark.id} 
              sx={{ 
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {bookmark.lessonTitle || `Lesson ${bookmark.lessonId}`}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Chip
                        icon={<CourseIcon />}
                        label={bookmark.courseTitle || `Course ${bookmark.courseId}`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<DateIcon />}
                        label={format(new Date(bookmark.createdAt), 'MMM dd, yyyy')}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<PlayIcon />}
                        onClick={() => handleGoToLesson(bookmark.courseId, bookmark.lessonId)}
                        sx={{
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.8)
                          }
                        }}
                      >
                        Continue Learning
                      </Button>
                    </Box>
                  </Box>

                  <IconButton
                    onClick={() => handleRemoveBookmark(bookmark.lessonId)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'error.main',
                        backgroundColor: alpha(theme.palette.error.main, 0.1)
                      }
                    }}
                    aria-label="Remove bookmark"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default BookmarksPage;
