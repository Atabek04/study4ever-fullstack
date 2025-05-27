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
  IconButton,
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
  Tooltip,
  Stack,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import api from '../../api/axios';
import { createModule, updateModule, deleteModule } from '../../hooks/moduleManagementHooks';

const CourseModules = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [modules, setModules] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    sortOrder: 1
  });
  const [formError, setFormError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/courses/${courseId}/details`);
      setCourse(response.data);
      setModules(response.data.modules || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError({ 
        severity: 'error', 
        message: `Failed to load course details: ${err.response?.data?.message || err.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToModuleLessons = (moduleId) => {
    navigate(`/admin/courses/${courseId}/modules/${moduleId}`);
  };

  const handleGoBack = () => {
    navigate('/admin');
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      title: '',
      sortOrder: ''  // Empty string to make it truly optional
    });
    setFormError(null);
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (module) => {
    setSelectedModule(module);
    setFormData({
      title: module.title,
      sortOrder: module.sortOrder || ''
    });
    setFormError(null);
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (module) => {
    setSelectedModule(module);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setSelectedModule(null);
    setFormError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCreateModule = async () => {
    try {
      if (!formData.title.trim()) {
        setFormError('Module title is required');
        return;
      }

      setFormError(null);
      setLoading(true);
      
      const moduleData = {
        title: formData.title,
        courseId
        // Not passing sortOrder - let backend handle it automatically
      };
      
      await createModule(moduleData);
      await fetchCourseDetails(); // Refresh the module list
      setSnackbar({ open: true, message: 'Module created successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (err) {
      console.error('Error creating module:', err);
      
      // Special handling for 409 Conflict errors (sort order conflict)
      if (err.response?.status === 409) {
        setFormError(`Position conflict: ${err.response.data.message || err.response.data || 'A module with this position already exists'}.\n\nPlease choose a different position or leave it blank for automatic assignment.`);
      } else {
        setFormError(`Failed to create module: ${err.response?.data?.message || err.response?.data || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedModule(null);
  };

  const handleEditModule = async () => {
    try {
      if (!formData.title.trim()) {
        setFormError('Module title is required');
        return;
      }

      setFormError(null);
      setLoading(true);
      
      const moduleData = {
        title: formData.title,
        courseId,
        // Only include sortOrder if it has a value
        ...(formData.sortOrder ? { sortOrder: formData.sortOrder } : {})
      };
      
      await updateModule(selectedModule.id, moduleData);
      await fetchCourseDetails(); // Refresh the module list
      handleCloseDialog();
      
      // Show success message
      setSnackbar({ open: true, message: 'Module updated successfully!', severity: 'success' });
    } catch (err) {
      console.error('Error updating module:', err);
      
      // Special handling for 409 Conflict errors (sort order conflict)
      if (err.response?.status === 409) {
        setFormError(`Position conflict: ${err.response.data.message || err.response.data || 'A module with this position already exists'}.\n\nPlease choose a different position or leave it blank for automatic assignment.`);
      } else {
        setFormError(`Failed to update module: ${err.response?.data?.message || err.response?.data || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedModule(null);
  };

  const handleDeleteModule = async () => {
    try {
      setLoading(true);
      await deleteModule(selectedModule.id);
      await fetchCourseDetails(); // Refresh the module list
      handleCloseDialog();
      
      // Show success message
      setSnackbar({ open: true, message: 'Module deleted successfully!', severity: 'success' });
    } catch (err) {
      console.error('Error deleting module:', err);
      setError({ 
        severity: 'error', 
        message: `Failed to delete module: ${err.response?.data?.message || err.message}` 
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
            <Link component="button" onClick={handleGoBack} underline="hover" color="inherit">
              Admin Panel
            </Link>
            <Typography color="text.secondary">Loading course...</Typography>
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
              Loading course modules
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we fetch the course information
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
          <Alert severity={error.severity}>{error.message}</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack} sx={{ mt: 2 }}>
            Back to Course List
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component="button" onClick={handleGoBack} underline="hover" color="inherit">
            Admin Panel
          </Link>
          <Typography color="text.primary">{course?.title}</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack} sx={{ mr: 2 }}>
            Back
          </Button>
          <Box sx={{ flexGrow: 1 }}></Box> {/* Empty flex space */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Module
          </Button>
        </Box>

        {modules.length === 0 ? (
          <Alert severity="info">No modules found for this course.</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Sort Order</TableCell>
                  <TableCell align="center">Lessons Count</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from(modules)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((module) => (
                    <TableRow key={module.id} hover>
                      <TableCell>{module.title}</TableCell>
                      <TableCell>{module.sortOrder}</TableCell>
                      <TableCell align="center">{module.lessons?.length || 0}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="view lessons"
                          color="primary"
                          onClick={() => handleNavigateToModuleLessons(module.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          aria-label="edit module"
                          color="secondary"
                          onClick={() => handleOpenEditDialog(module)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label="delete module"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(module)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create Module Dialog */}
        <Dialog open={openCreateDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Create New Module</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                name="title"
                label="Module Title"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.title}
                onChange={handleInputChange}
                required
                error={formError && formError.includes('title')}
              />

              <TextField
                name="sortOrder"
                label="Position (optional)"
                fullWidth
                margin="normal"
                variant="outlined"
                type="number"
                inputProps={{ min: 1 }}
                value={formData.sortOrder}
                onChange={handleInputChange}
                helperText="Position determines the order of this module in the course. If left empty, the system will assign a position automatically."
              />

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
              onClick={handleCreateModule}
              variant="contained"
              color="primary"
              disabled={!formData.title.trim()}
            >
              Create Module
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Module Dialog */}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
          <DialogTitle>Edit Module</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                name="title"
                label="Module Title"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.title}
                onChange={handleInputChange}
                required
                error={formError && formError.includes('title')}
              />

              <TextField
                name="sortOrder"
                label="Position (optional)"
                fullWidth
                margin="normal"
                variant="outlined"
                type="number"
                inputProps={{ min: 1 }}
                value={formData.sortOrder}
                onChange={handleInputChange}
                helperText="Position determines the order of this module in the course. If left empty, the system will assign a position automatically."
              />

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
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button 
              onClick={handleEditModule}
              variant="contained"
              color="primary"
              disabled={!formData.title.trim()}
            >
              Update Module
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Module Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Module Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete the module "{selectedModule?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button 
              onClick={handleDeleteModule}
              variant="contained"
              color="error"
            >
              Delete Module
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for success/error messages */}
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

export default CourseModules;
