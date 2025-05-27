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
  MenuItem,
  Tooltip,
  IconButton,
  Snackbar
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import api from '../../api/axios';
import { createLesson, updateLesson, deleteLesson } from '../../hooks/lessonManagementHooks';

const ModuleLessons = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  
  const [lessons, setLessons] = useState([]);
  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    durationMinutes: 0,
    sortOrder: 1
  });
  const [formError, setFormError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchModuleDetails();
  }, [moduleId]);

  const fetchModuleDetails = async () => {
    try {
      setLoading(true);
      
      // Get course details for the breadcrumb
      const courseResponse = await api.get(`/api/v1/courses/${courseId}`);
      setCourse(courseResponse.data);
      console.log('Course data:', courseResponse.data);
      
      // Get module details including lessons
      const moduleResponse = await api.get(`/api/v1/modules/${moduleId}/details`);
      console.log('Module data from API:', moduleResponse.data);
      console.log('Lessons data from API:', moduleResponse.data.lessons);
      
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
    setFormData({
      title: '',
      content: '',
      videoUrl: '',
      durationMinutes: 0,
      sortOrder: ''  // Empty string to make it truly optional
    });
    setFormError(null);
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = async (lesson) => {
    console.log('Opening edit dialog with lesson data from list:', lesson);
    setSelectedLesson(lesson);
    
    try {
      // Fetch the full lesson details directly from API to ensure we have all data
      console.log(`Fetching complete lesson details for ID: ${lesson.id}`);
      const lessonDetailResponse = await api.get(`/api/v1/lessons/${lesson.id}`);
      console.log('Detailed lesson data from API:', lessonDetailResponse.data);
      
      // If the API call succeeds, use this data
      const lessonDetail = lessonDetailResponse.data;
      
      const formDataToSet = {
        title: lessonDetail.title || lesson.title,
        content: lessonDetail.content || lesson.content || '',
        videoUrl: lessonDetail.videoUrl || lesson.videoUrl || '',
        durationMinutes: lessonDetail.durationMinutes || lesson.durationMinutes || 0,
        sortOrder: lessonDetail.sortOrder || lesson.sortOrder || ''
      };
      
      console.log('Setting form data to:', formDataToSet);
      setFormData(formDataToSet);
      
    } catch (err) {
      console.error('Error fetching lesson details:', err);
      
      // Fallback to using the data we already have
      const formDataToSet = {
        title: lesson.title,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        durationMinutes: lesson.durationMinutes || 0,
        sortOrder: lesson.sortOrder || ''
      };
      console.log('FALLBACK: Setting form data to:', formDataToSet);
      setFormData(formDataToSet);
    }
    
    setFormError(null);
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (lesson) => {
    setSelectedLesson(lesson);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedLesson(null);
    setFormError(null);
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
      
      if (!formData.videoUrl.trim()) {
        setFormError('Video URL is required');
        return;
      }

      setFormError(null);
      setLoading(true);
      
      // Add the moduleId from the current module
      const lessonData = {
        title: formData.title,
        content: formData.content,
        videoUrl: formData.videoUrl,
        durationMinutes: parseInt(formData.durationMinutes) || 0,
        moduleId
        // Not passing sortOrder - let backend handle it automatically
      };
      
      await createLesson(lessonData);
      await fetchModuleDetails(); // Refresh the lesson list
      setSnackbar({ open: true, message: 'Lesson created successfully!', severity: 'success' });
      handleCloseDialog();
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

  const handleEditLesson = async () => {
    try {
      console.log('Current form data before validation:', formData);
      
      // Validate required fields
      if (!formData.title.trim()) {
        setFormError('Lesson title is required');
        return;
      }
      
      if (!formData.content.trim()) {
        setFormError('Lesson content is required');
        return;
      }
      
      if (!formData.videoUrl.trim()) {
        setFormError('Video URL is required');
        return;
      }

      setFormError(null);
      setLoading(true);
      
      const lessonData = {
        title: formData.title,
        content: formData.content,
        videoUrl: formData.videoUrl,
        durationMinutes: parseInt(formData.durationMinutes) || 0,
        moduleId
        // Not passing sortOrder - let backend handle it automatically
      };
      
      console.log('Sending update lesson data to API:', lessonData);
      console.log('For lesson ID:', selectedLesson.id);
      
      const updatedLesson = await updateLesson(selectedLesson.id, lessonData);
      console.log('Lesson updated successfully, response:', updatedLesson);
      
      await fetchModuleDetails(); // Refresh the lesson list
      handleCloseDialog();
      
      // Show success message
      setSnackbar({ open: true, message: 'Lesson updated successfully!', severity: 'success' });
    } catch (err) {
      console.error('Error updating lesson:', err);
      
      // Special handling for 409 Conflict errors (sort order conflict)
      if (err.response?.status === 409) {
        setFormError(`Position conflict: ${err.response.data.message || err.response.data || 'A lesson with this position already exists in this module'}.\n\nPlease choose a different position or leave it blank for automatic assignment.`);
      } else {
        setFormError(`Failed to update lesson: ${err.response?.data?.message || err.response?.data || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async () => {
    try {
      setLoading(true);
      await deleteLesson(selectedLesson.id);
      await fetchModuleDetails(); // Refresh the module list
      handleCloseDialog();
      
      // Show success message using Snackbar
      setSnackbar({ open: true, message: 'Lesson deleted successfully!', severity: 'success' });
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setSnackbar({ 
        open: true,
        severity: 'error', 
        message: `Failed to delete lesson: ${err.response?.data?.message || err.message}` 
      });
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
            <Typography color="text.secondary">Loading...</Typography>
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
          <Typography color="text.primary">{module?.title}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack} 
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Box sx={{ flexGrow: 1 }}></Box> {/* Empty flex space */}
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
                  <TableCell align="center">Duration (min)</TableCell>
                  <TableCell align="center" width="120px">Actions</TableCell>
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
                      <TableCell align="center">{lesson.durationMinutes || 0}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenEditDialog(lesson)}
                            color="primary"
                            title="Edit Lesson"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDeleteDialog(lesson)}
                            color="error"
                            title="Delete Lesson"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
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
                required
                error={formError && formError.includes('videoUrl')}
                helperText="YouTube or other video platform URL"
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
              disabled={!formData.title.trim() || !formData.content.trim() || !formData.videoUrl.trim()}
            >
              Create Lesson
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Lesson Dialog */}
        <Dialog open={openEditDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Edit Lesson</DialogTitle>
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
                required
                error={formError && formError.includes('videoUrl')}
                helperText="YouTube or other video platform URL"
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
              onClick={handleEditLesson}
              variant="contained"
              color="primary"
              disabled={!formData.title.trim() || !formData.content.trim() || !formData.videoUrl.trim()}
            >
              Update Lesson
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Lesson Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
          <DialogTitle>Delete Lesson</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete the lesson "<strong>{selectedLesson?.title}</strong>"?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleDeleteLesson}
              variant="contained"
              color="error"
            >
              Delete Lesson
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for success messages */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default ModuleLessons;
