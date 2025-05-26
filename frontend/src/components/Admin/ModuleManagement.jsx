import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { fetchAllModules, createModule, updateModule, deleteModule, fetchCoursesForModules } from '../../hooks/moduleManagementHooks';

const ModuleManagement = () => {
  // State for modules data
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourseId, setFilterCourseId] = useState('');
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    position: 1
  });

  // Initial data fetch
  useEffect(() => {
    fetchModules();
    fetchCourses();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const modulesData = await fetchAllModules();
      setModules(modulesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError({ 
        severity: 'error', 
        message: `Failed to load modules: ${err.response?.data?.message || err.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const coursesData = await fetchCoursesForModules();
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError({ 
        severity: 'error', 
        message: `Failed to load courses: ${err.response?.data?.message || err.message}` 
      });
    }
  };

  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    // Reset form data
    setFormData({
      title: '',
      description: '',
      courseId: '',
      position: 1
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (module) => {
    setCurrentModule(module);
    setFormData({
      title: module.title,
      description: module.description || '',
      courseId: module.courseId?.toString() || '',
      position: module.position || 1
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (module) => {
    setCurrentModule(module);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setCurrentModule(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submissions
  const handleAddModule = async () => {
    try {
      setLoading(true);
      await createModule(formData);
      fetchModules();
      handleCloseDialogs();
      // Show success feedback
      setError({ severity: 'success', message: 'Module added successfully!' });
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error adding module:', err);
      setError({ severity: 'error', message: `Failed to add module: ${err.response?.data?.message || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModule = async () => {
    try {
      setLoading(true);
      await updateModule(currentModule.id, formData);
      fetchModules();
      handleCloseDialogs();
      // Show success feedback
      setError({ severity: 'success', message: 'Module updated successfully!' });
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error updating module:', err);
      setError({ severity: 'error', message: `Failed to update module: ${err.response?.data?.message || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async () => {
    try {
      setLoading(true);
      await deleteModule(currentModule.id);
      fetchModules();
      handleCloseDialogs();
      // Show success feedback
      setError({ severity: 'success', message: 'Module deleted successfully!' });
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error deleting module:', err);
      setError({ severity: 'error', message: `Failed to delete module: ${err.response?.data?.message || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  };

  // Handle course filter
  const handleCourseFilterChange = (event) => {
    setFilterCourseId(event.target.value);
    setPage(0); // Reset to first page on filter change
  };

  // Filter modules based on search term and filter
  const filteredModules = modules.filter(module => {
    const matchesSearch = searchTerm === '' || 
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCourse = filterCourseId === '' || module.courseId.toString() === filterCourseId;
    
    return matchesSearch && matchesCourse;
  });

  // Find course title by ID
  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Module Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Module
        </Button>
      </Box>

      {error && (
        <Alert severity={error.severity || 'error'} sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message || error}
        </Alert>
      )}

      {/* Search and Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search Modules"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          placeholder="Search by title or description"
        />
        <TextField
          select
          label="Course"
          value={filterCourseId}
          onChange={handleCourseFilterChange}
          variant="outlined"
          size="small"
          sx={{ minWidth: '200px' }}
        >
          <MenuItem value="">All Courses</MenuItem>
          {courses.map((course) => (
            <MenuItem key={course.id} value={course.id.toString()}>
              {course.title}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="module management table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Lessons</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && modules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : filteredModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {modules.length === 0 
                      ? 'No modules found. Add your first module using the button above.'
                      : 'No modules match your search criteria. Try adjusting your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredModules
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((module) => (
                    <TableRow hover key={module.id}>
                      <TableCell>{module.id}</TableCell>
                      <TableCell>{module.title}</TableCell>
                      <TableCell>{getCourseTitle(module.courseId)}</TableCell>
                      <TableCell>{module.position}</TableCell>
                      <TableCell>{module.lessons?.length || 0}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="View Module Lessons">
                            <IconButton 
                              color="info" 
                              size="small"
                              onClick={() => navigate(`/admin/courses/${module.courseId}/modules/${module.id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Module">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => handleOpenEditDialog(module)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Module">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleOpenDeleteDialog(module)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredModules.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add Module Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Add New Module</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="title"
              label="Module Title"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="course-select-label">Course</InputLabel>
              <Select
                labelId="course-select-label"
                name="courseId"
                value={formData.courseId}
                label="Course"
                onChange={handleInputChange}
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="position"
              label="Position"
              fullWidth
              margin="normal"
              variant="outlined"
              type="number"
              inputProps={{ min: 1 }}
              value={formData.position}
              onChange={handleInputChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleAddModule} 
            variant="contained" 
            color="primary"
            disabled={!formData.title || !formData.description || !formData.courseId}
          >
            Add Module
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Edit Module</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="title"
              label="Module Title"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="course-select-label-edit">Course</InputLabel>
              <Select
                labelId="course-select-label-edit"
                name="courseId"
                value={formData.courseId}
                label="Course"
                onChange={handleInputChange}
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="position"
              label="Position"
              fullWidth
              margin="normal"
              variant="outlined"
              type="number"
              inputProps={{ min: 1 }}
              value={formData.position}
              onChange={handleInputChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleUpdateModule} 
            variant="contained" 
            color="primary"
            disabled={!formData.title || !formData.description || !formData.courseId}
          >
            Update Module
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the module "{currentModule?.title}"? 
            This will also delete all lessons in this module. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleDeleteModule} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModuleManagement;
