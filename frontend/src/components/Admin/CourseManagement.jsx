import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Autocomplete,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { fetchAllCourses, createCourse, updateCourse, deleteCourse } from '../../hooks/contentManagementHooks';
import { fetchAllTags } from '../../hooks/tagManagementHooks';
import { fetchInstructors } from '../../hooks/instructorManagementHooks';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  
  // State for dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  
  const [tags, setTags] = useState([]);
  const [instructors, setInstructors] = useState([]);

  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructorId: '',
    tagIds: []
  });

  // Initial data fetch
  useEffect(() => {
    fetchCourses();
    fetchTagsAndInstructors();
  }, []);

  const fetchTagsAndInstructors = async () => {
    try {
      const [tagsData, instructorsData] = await Promise.all([
        fetchAllTags(),
        fetchInstructors()
      ]);
      setTags(tagsData);
      setInstructors(instructorsData);
    } catch (err) {
      console.error('Error fetching tags and instructors:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await fetchAllCourses();
      // Ensure we set an empty array if the data is invalid
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError({ 
        severity: 'error', 
        message: `Failed to load courses: ${err.response?.data?.message || err.message}` 
      });
      // Set courses to empty array on error
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    // Reset form data
    setFormData({
      title: '',
      description: '',
      instructorId: '',
      tagIds: []
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (course) => {
    setCurrentCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      instructorId: course.instructorId || '',
      tagIds: course.tagIds || []
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (course) => {
    setCurrentCourse(course);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setCurrentCourse(null);
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
  const handleAddCourse = async () => {
    try {
      setLoading(true);
      await createCourse(formData);
      fetchCourses();
      handleCloseDialogs();
      // Show success feedback
      setError({ severity: 'success', message: 'Course added successfully!' });
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error adding course:', err);
      setError({ severity: 'error', message: `Failed to add course: ${err.response?.data?.message || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      setLoading(true);
      await updateCourse(currentCourse.id, formData);
      fetchCourses();
      handleCloseDialogs();
      // Show success feedback
      setError({ severity: 'success', message: 'Course updated successfully!' });
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error updating course:', err);
      setError({ severity: 'error', message: `Failed to update course: ${err.response?.data?.message || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      setLoading(true);
      await deleteCourse(currentCourse.id);
      fetchCourses();
      handleCloseDialogs();
      // Show success feedback
      setError({ severity: 'success', message: 'Course deleted successfully!' });
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError({ severity: 'error', message: `Failed to delete course: ${err.response?.data?.message || err.message}` });
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

  // Handle level filter


  // Filter courses based on search term and filters
  const filteredCourses = courses.filter(course => {
    return searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Course Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Course
        </Button>
      </Box>

      {error && (
        <Alert severity={error.severity || 'error'} sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message || error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search Courses"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          placeholder="Search by title or description"
        />

      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="course management table">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell align="center">Modules</TableCell>
                <TableCell align="center">Lessons</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {courses.length === 0 
                      ? 'No courses found. Add your first course using the button above.'
                      : 'No courses match your search criteria. Try adjusting your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((course) => (
                    <TableRow hover key={course.id}>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>
                        {course.instructorFirstName && course.instructorLastName ? `${course.instructorFirstName} ${course.instructorLastName}` : 'Not assigned'}
                      </TableCell>
                      <TableCell align="center">{course.totalModules || 0}</TableCell>
                      <TableCell align="center">{course.totalLessons || 0}</TableCell>
                      <TableCell>
                        {course.tagIds?.map(tagId => {
                          const tag = tags.find(t => t.id === tagId);
                          return tag ? (
                            <Chip 
                              key={tag.id} 
                              label={tag.name} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ) : null;
                        })}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="View Modules">
                            <IconButton 
                              color="info" 
                              size="small"
                              onClick={() => navigate(`/admin/courses/${course.id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Course">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => handleOpenEditDialog(course)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Course">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleOpenDeleteDialog(course)}
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
          count={filteredCourses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Add Course Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="title"
              label="Course Title"
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
            />
            <TextField
              name="instructorId"
              select
              label="Instructor"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.instructorId}
              onChange={handleInputChange}
              required
            >
              {instructors.map((instructor) => (
                <MenuItem key={instructor.id} value={instructor.id}>
                  {`${instructor.firstName} ${instructor.lastName}`}
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option) => option.name}
              value={tags.filter(tag => formData.tagIds.includes(tag.id))}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  tagIds: newValue.map(tag => tag.id)
                });
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Tags" 
                  placeholder="Select tags" 
                  variant="outlined" 
                  margin="normal"
                  fullWidth
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const props = getTagProps({ index });
                  const { key } = props;
                  delete props.key;
                  return (
                    <Chip
                      key={key}
                      variant="outlined" 
                      label={option.name}
                      {...props}
                    />
                  );
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleAddCourse} 
            variant="contained" 
            color="primary"
            disabled={!formData.title || !formData.instructorId}
          >
            Add Course
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="title"
              label="Course Title"
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
            />
            <TextField
              name="instructorId"
              select
              label="Instructor"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.instructorId}
              onChange={handleInputChange}
              required
            >
              {instructors.map((instructor) => (
                <MenuItem key={instructor.id} value={instructor.id}>
                  {`${instructor.firstName} ${instructor.lastName}`}
                </MenuItem>
              ))}
            </TextField>
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option) => option.name}
              value={tags.filter(tag => formData.tagIds.includes(tag.id))}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  tagIds: newValue.map(tag => tag.id)
                });
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Tags" 
                  placeholder="Select tags" 
                  variant="outlined" 
                  margin="normal"
                  fullWidth
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const props = getTagProps({ index });
                  const { key } = props;
                  delete props.key;
                  return (
                    <Chip
                      key={key}
                      variant="outlined" 
                      label={option.name}
                      {...props}
                    />
                  );
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleUpdateCourse} 
            variant="contained" 
            color="primary"
            disabled={!formData.title || !formData.instructorId}
          >
            Update Course
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the course "{currentCourse?.title}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleDeleteCourse} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseManagement;
