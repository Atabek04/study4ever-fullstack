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
import { 
  fetchAllLessons, 
  createLesson, 
  updateLesson, 
  deleteLesson, 
  fetchModulesForLessons 
} from '../../hooks/lessonManagementHooks';

const LessonManagement = () => {
  // State for lessons data
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModuleId, setFilterModuleId] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    moduleId: '',
    position: 1,
    videoUrl: '',
    duration: 0,
    type: 'VIDEO'
  });

  // Initial data fetch
  useEffect(() => {
    fetchLessons();
    fetchModules();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const lessonsData = await fetchAllLessons();
      setLessons(lessonsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setError({ 
        severity: 'error', 
        message: `Failed to load lessons: ${err.response?.data?.message || err.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const modulesData = await fetchModulesForLessons();
      setModules(modulesData);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError({ 
        severity: 'error', 
        message: `Failed to load modules: ${err.response?.data?.message || err.message}` 
      });
    }
  };

  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    // Reset form data
    setFormData({
      title: '',
      content: '',
      moduleId: '',
      position: 1,
      videoUrl: '',
      duration: 0,
      type: 'VIDEO'
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (lesson) => {
    setCurrentLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content || '',
      moduleId: lesson.moduleId?.toString() || '',
      position: lesson.position || 1,
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || 0,
      type: lesson.type || 'VIDEO'
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (lesson) => {
    setCurrentLesson(lesson);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setCurrentLesson(null);
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
  const handleAddLesson = async () => {
    try {
      setLoading(true);
      await createLesson(formData);
      fetchLessons();
      handleCloseDialogs();
      // Show success feedback
      setError({ severity: 'success', message: 'Lesson added successfully!' });
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error adding lesson:', err);
      setError({ severity: 'error', message: `Failed to add lesson: ${err.response?.data?.message || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async () => {
    try {
      setLoading(true);
      await updateLesson(currentLesson.id, formData);
      fetchLessons();
      handleCloseDialogs();
      // Show success feedback
      setError({ severity: 'success', message: 'Lesson updated successfully!' });
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error updating lesson:', err);
      setError({ severity: 'error', message: `Failed to update lesson: ${err.response?.data?.message || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async () => {
    try {
      setLoading(true);
      await deleteLesson(currentLesson.id);
      fetchLessons();
      handleCloseDialogs();
      // Show success feedback
      setError({ severity: 'success', message: 'Lesson deleted successfully!' });
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error deleting lesson:', err);
      setError({ severity: 'error', message: `Failed to delete lesson: ${err.response?.data?.message || err.message}` });
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

  // Handle module filter
  const handleModuleFilterChange = (event) => {
    setFilterModuleId(event.target.value);
    setPage(0); // Reset to first page on filter change
  };

  // Handle type filter
  const handleTypeFilterChange = (event) => {
    setFilterType(event.target.value);
    setPage(0); // Reset to first page on filter change
  };

  // Filter lessons based on search term and filters
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = searchTerm === '' || 
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lesson.content && lesson.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesModule = filterModuleId === '' || lesson.moduleId.toString() === filterModuleId;
    const matchesType = filterType === '' || lesson.type === filterType;
    
    return matchesSearch && matchesModule && matchesType;
  });

  // Find module title by ID
  const getModuleTitle = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.title : 'Unknown Module';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Lesson Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Lesson
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
          label="Search Lessons"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          placeholder="Search by title or content"
        />
        <TextField
          select
          label="Module"
          value={filterModuleId}
          onChange={handleModuleFilterChange}
          variant="outlined"
          size="small"
          sx={{ minWidth: '200px' }}
        >
          <MenuItem value="">All Modules</MenuItem>
          {modules.map((module) => (
            <MenuItem key={module.id} value={module.id.toString()}>
              {module.title}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Type"
          value={filterType}
          onChange={handleTypeFilterChange}
          variant="outlined"
          size="small"
          sx={{ minWidth: '150px' }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="VIDEO">Video</MenuItem>
          <MenuItem value="TEXT">Text</MenuItem>
          <MenuItem value="QUIZ">Quiz</MenuItem>
        </TextField>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="lesson management table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Duration (min)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && lessons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : filteredLessons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {lessons.length === 0 
                      ? 'No lessons found. Add your first lesson using the button above.'
                      : 'No lessons match your search criteria. Try adjusting your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLessons
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((lesson) => (
                    <TableRow hover key={lesson.id}>
                      <TableCell>{lesson.id}</TableCell>
                      <TableCell>{lesson.title}</TableCell>
                      <TableCell>{getModuleTitle(lesson.moduleId)}</TableCell>
                      <TableCell>{lesson.type}</TableCell>
                      <TableCell>{lesson.position}</TableCell>
                      <TableCell>{lesson.duration}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton color="info" size="small">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Lesson">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => handleOpenEditDialog(lesson)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Lesson">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleOpenDeleteDialog(lesson)}
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
          count={filteredLessons.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add Lesson Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Add New Lesson</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="title"
              label="Lesson Title"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="type-select-label">Lesson Type</InputLabel>
              <Select
                labelId="type-select-label"
                name="type"
                value={formData.type}
                label="Lesson Type"
                onChange={handleInputChange}
              >
                <MenuItem value="VIDEO">Video</MenuItem>
                <MenuItem value="TEXT">Text</MenuItem>
                <MenuItem value="QUIZ">Quiz</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="module-select-label">Module</InputLabel>
              <Select
                labelId="module-select-label"
                name="moduleId"
                value={formData.moduleId}
                label="Module"
                onChange={handleInputChange}
              >
                {modules.map((module) => (
                  <MenuItem key={module.id} value={module.id.toString()}>
                    {module.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="content"
              label="Content"
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={6}
              value={formData.content}
              onChange={handleInputChange}
              required
            />
            {formData.type === 'VIDEO' && (
              <TextField
                name="videoUrl"
                label="Video URL"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.videoUrl}
                onChange={handleInputChange}
              />
            )}
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
            <TextField
              name="duration"
              label="Duration (minutes)"
              fullWidth
              margin="normal"
              variant="outlined"
              type="number"
              inputProps={{ min: 0 }}
              value={formData.duration}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleAddLesson} 
            variant="contained" 
            color="primary"
            disabled={!formData.title || !formData.content || !formData.moduleId}
          >
            Add Lesson
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Edit Lesson</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="title"
              label="Lesson Title"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="type-select-label-edit">Lesson Type</InputLabel>
              <Select
                labelId="type-select-label-edit"
                name="type"
                value={formData.type}
                label="Lesson Type"
                onChange={handleInputChange}
              >
                <MenuItem value="VIDEO">Video</MenuItem>
                <MenuItem value="TEXT">Text</MenuItem>
                <MenuItem value="QUIZ">Quiz</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="module-select-label-edit">Module</InputLabel>
              <Select
                labelId="module-select-label-edit"
                name="moduleId"
                value={formData.moduleId}
                label="Module"
                onChange={handleInputChange}
              >
                {modules.map((module) => (
                  <MenuItem key={module.id} value={module.id.toString()}>
                    {module.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="content"
              label="Content"
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={6}
              value={formData.content}
              onChange={handleInputChange}
              required
            />
            {formData.type === 'VIDEO' && (
              <TextField
                name="videoUrl"
                label="Video URL"
                fullWidth
                margin="normal"
                variant="outlined"
                value={formData.videoUrl}
                onChange={handleInputChange}
              />
            )}
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
            <TextField
              name="duration"
              label="Duration (minutes)"
              fullWidth
              margin="normal"
              variant="outlined"
              type="number"
              inputProps={{ min: 0 }}
              value={formData.duration}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleUpdateLesson} 
            variant="contained" 
            color="primary"
            disabled={!formData.title || !formData.content || !formData.moduleId}
          >
            Update Lesson
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the lesson "{currentLesson?.title}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleDeleteLesson} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LessonManagement;
