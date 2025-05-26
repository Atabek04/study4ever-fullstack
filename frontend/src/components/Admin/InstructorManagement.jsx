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
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { fetchInstructors, createInstructor, getInstructorById, deleteInstructor } from '../../hooks/instructorManagementHooks';

const InstructorManagement = () => {
  // State for instructors data
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentInstructor, setCurrentInstructor] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  // Initial data fetch
  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      const instructorsData = await fetchInstructors();
      setInstructors(instructorsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching instructors:', err);
      setError('Failed to load instructors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    // Reset form data
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: ''
    });
    setOpenAddDialog(true);
  };

  const handleOpenDeleteDialog = (instructor) => {
    setCurrentInstructor(instructor);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenDeleteDialog(false);
    setCurrentInstructor(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Form validation
  const validateForm = () => {
    return (
      formData.username &&
      formData.email &&
      formData.firstName &&
      formData.lastName &&
      formData.password &&
      formData.password === formData.confirmPassword
    );
  };

  // Handle form submissions
  const handleAddInstructor = async () => {
    try {
      if (!validateForm()) {
        setError('Please fill all fields and make sure passwords match.');
        return;
      }

      setLoading(true);
      
      // Prepare request data without confirmPassword
      const requestData = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password
      };
      
      await createInstructor(requestData);
      fetchInstructorData();
      handleCloseDialogs();
    } catch (err) {
      console.error('Error adding instructor:', err);
      setError('Failed to add instructor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstructor = async () => {
    try {
      setLoading(true);
      await deleteInstructor(currentInstructor.id);
      fetchInstructorData();
      handleCloseDialogs();
    } catch (err) {
      console.error('Error deleting instructor:', err);
      setError('Failed to delete instructor. Please try again.');
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Instructor Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Instructor
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="instructor management table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && instructors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : instructors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No instructors found. Add your first instructor using the button above.
                  </TableCell>
                </TableRow>
              ) : (
                instructors
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((instructor) => (
                    <TableRow hover key={instructor.id}>
                      <TableCell>{instructor.id}</TableCell>
                      <TableCell>{instructor.username}</TableCell>
                      <TableCell>{`${instructor.firstName} ${instructor.lastName}`}</TableCell>
                      <TableCell>{instructor.email}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton color="info" size="small">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Instructor">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleOpenDeleteDialog(instructor)}
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
          count={instructors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add Instructor Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Add New Instructor</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="username"
              label="Username"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="firstName"
              label="First Name"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="lastName"
              label="Last Name"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.password}
              onChange={handleInputChange}
              required
              error={formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0}
              helperText={formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0 ? 'Passwords do not match' : ''}
            />
            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              error={formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0}
              helperText={formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0 ? 'Passwords do not match' : ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleAddInstructor} 
            variant="contained" 
            color="primary"
            disabled={!validateForm()}
          >
            Add Instructor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the instructor "{currentInstructor?.firstName} {currentInstructor?.lastName}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleDeleteInstructor} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorManagement;
