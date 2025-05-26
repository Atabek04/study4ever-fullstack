import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from '@mui/icons-material';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import api from '../../api/axios';
import { createLesson } from '../../hooks/lessonManagementHooks';

const ModuleLessons = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  
  const [lessons, setLessons] = useState([]);
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    durationMinutes: 0,
    sortOrder: 1
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchModuleDetails();
  }, [moduleId]);

  const fetchModuleDetails = async () => {
    try {
      setLoading(true);
      
      // Get course details for the breadcrumb
      const courseResponse = await api.get(`/api/v1/courses/${courseId}`);
      setCourse(courseResponse.data);
      
      // Get module details including lessons
      const moduleResponse = await api.get(`/api/v1/modules/${moduleId}/details`);
      setModule(moduleResponse.data);
      setLessons(moduleResponse.data.lessons || []);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching module details:', err);
      setError({ 
        severity: 'error', 
        message: `Failed to load module details: ${err.response?.data?.message || err.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleOpenCreateDialog = () => {
    // Calculate next sortOrder (max + 1) or 1 if no lessons exist
    const nextSortOrder = lessons.length > 0 
      ? Math.max(...lessons.map(lesson => lesson.sortOrder || 0)) + 1 
      : 1;
    
    setFormData({
      title: '',
      content: '',
      videoUrl: '',
      durationMinutes: 0,
      sortOrder: nextSortOrder
    });
    setFormError(null);
    setOpenCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCreateLesson = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setFormError('Lesson title is required');
        return;
      }
      
      if (!formData.content.trim()) {
        setFormError('Lesson content is required');
        return;
      }

      setFormError(null);
      setLoading(true);
      
      // Add the moduleId from the current module
      const lessonData = {
        title: formData.title,
        content: formData.content,
        videoUrl: formData.videoUrl || '',
        durationMinutes: parseInt(formData.durationMinutes) || 0,
        moduleId,
        // Only include sortOrder if the user didn't clear it
        ...(formData.sortOrder ? { sortOrder: formData.sortOrder } : {})
      };
      
      await createLesson(lessonData);
      await fetchModuleDetails(); // Refresh the lesson list
      handleCloseDialog();
      
      // Show success message
      setError({ severity: 'success', message: 'Lesson created successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error creating lesson:', err);
      
      // Special handling for 409 Conflict errors (sort order conflict)
      if (err.response?.status === 409) {
        setFormError(`Position conflict: ${err.response.data.message || err.response.data || 'A lesson with this position already exists in this module'}.\n\nPlease choose a different position or leave it blank for automatic assignment.`);
      } else {
        setFormError(`Failed to create lesson: ${err.response?.data?.message || err.response?.data || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link component="button" onClick={() => navigate('/admin')} underline="hover" color="inherit">
              Admin Panel
            </Link>
            <Link component="button" onClick={handleGoBack} underline="hover" color="inherit">
              {course?.title || 'Course'}
            </Link>
            <Typography color="text.secondary">Loading module...</Typography>
          </Breadcrumbs>

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              textAlign: 'center',
            }}
          >
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Loading module lessons
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we fetch the lesson information
            </Typography>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link component="button" onClick={() => navigate('/admin')} underline="hover" color="inherit">
              Admin Panel
            </Link>
            <Link component="button" onClick={handleGoBack} underline="hover" color="inherit">
              {course?.title || 'Course'}
            </Link>
            <Typography color="error">Error</Typography>
          </Breadcrumbs>

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              maxWidth: 600,
              mx: 'auto',
              mt: 4
            }}
          >
            <Alert 
              severity={error.severity} 
              variant="outlined"
              sx={{ mb: 2 }}
            >
              {error.message}
            </Alert>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleGoBack}
              variant="contained"
              sx={{ alignSelf: 'flex-start' }}
            >
              Back to Modules
            </Button>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component="button" onClick={() => navigate('/admin')} underline="hover" color="inherit">
            Admin Panel
          </Link>
          <Link component="button" onClick={handleGoBack} underline="hover" color="inherit">
            {course?.title || 'Course'}
          </Link>
          <Typography color="text.primary">{module?.title || 'Module Lessons'}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack} 
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            {module?.title || 'Module'} - Lessons
          </Typography>
          {/* Add sort order for clarity */}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Sort Order: {module?.sortOrder || 'N/A'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{ ml: 2 }}
          >
            Create Lesson
          </Button>
        </Box>

        {lessons.length === 0 ? (
          <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Alert 
              severity="info" 
              variant="outlined"
              sx={{
                borderRadius: 2,
                '& .MuiAlert-message': {
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 2
                }
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                No lessons found for this module
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This module currently has no lessons. Lessons can be added through the Lesson Management section.
              </Typography>
            </Alert>
          </Box>
        ) : (
          <TableContainer 
            component={Paper} 
            sx={{ 
              mt: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="50%">Title</TableCell>
                  <TableCell>Sort Order</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="center">Duration (min)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from(lessons)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((lesson) => (
                    <TableRow 
                      key={lesson.id} 
                      hover
                      sx={{
                        '&:last-child td': {
                          borderBottom: 0
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{lesson.title}</TableCell>
                      <TableCell>{lesson.sortOrder}</TableCell>
                      <TableCell>
                        {lesson.type || 'TEXT'}
                      </TableCell>
                      <TableCell align="center">{lesson.durationMinutes || 0}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create Lesson Dialog */}
        <Dialog open={openCreateDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Create New Lesson</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                name="title"
                label="Lesson Title"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.title}
                onChange={handleInputChange}
                required
                error={formError && formError.includes('title')}
              />

              <TextField
                name="content"
                label="Lesson Content (Markdown)"
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={10}
                value={formData.content}
                onChange={handleInputChange}
                required
                error={formError && formError.includes('content')}
                helperText="You can use Markdown formatting (e.g., # Heading, **bold**, *italic*, etc.)"
              />

              <TextField
                name="videoUrl"
                label="Video URL"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.videoUrl}
                onChange={handleInputChange}
                helperText="Optional: Add URL for lesson video content"
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  name="durationMinutes"
                  label="Duration (minutes)"
                  type="number"
                  InputProps={{ inputProps: { min: 0 } }}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                  required
                  helperText="Estimated time to complete this lesson"
                />

                <TextField
                  name="sortOrder"
                  label="Position (optional)"
                  type="number"
                  InputProps={{ inputProps: { min: 1 } }}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  helperText="Position determines the order of this lesson in the module. If left empty, the system will assign a position automatically."
                />
              </Box>

              {formError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 2,
                    '& .MuiAlert-message': { 
                      whiteSpace: 'pre-line' 
                    }
                  }}
                >
                  {formError}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleCreateLesson}
              variant="contained"
              color="primary"
              disabled={!formData.title.trim() || !formData.content.trim()}
            >
              Create Lesson
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default ModuleLessons;
