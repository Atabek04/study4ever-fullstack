import React, { useState } from 'react';
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
  Stack,
  InputAdornment,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { createInstructor, deleteInstructor } from '../../hooks/instructorManagementHooks';
import { useInstructors } from '../../hooks/userManagementHooks';

const InstructorManagement = () => {
  // Use the new custom hook for enhanced search functionality
  const { instructors, searchTerm, setSearchTerm } = useInstructors();

  const [loading, setLoading] = useState(false);
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

  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

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
    validateField(name, value);
  };

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'username':
        if (!value.trim()) {
          error = 'Username is required';
        } else if (value.length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (value.length > 50) {
          error = 'Username cannot exceed 50 characters';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          error = 'Email should be valid';
        }
        break;

      case 'firstName':
        if (!value.trim()) {
          error = 'First name is required';
        } else if (value.length > 50) {
          error = 'First name cannot exceed 50 characters';
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          error = 'Last name is required';
        } else if (value.length > 50) {
          error = 'Last name cannot exceed 50 characters';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        }
        // Also check confirm password match if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setFormErrors(prev => ({
            ...prev,
            confirmPassword: 'Passwords do not match'
          }));
        } else if (formData.confirmPassword) {
          setFormErrors(prev => ({
            ...prev,
            confirmPassword: ''
          }));
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error; // Return true if valid, false if invalid
  };

  // Form validation
  const validateForm = () => {
    const isUsernameValid = validateField('username', formData.username);
    const isEmailValid = validateField('email', formData.email);
    const isFirstNameValid = validateField('firstName', formData.firstName);
    const isLastNameValid = validateField('lastName', formData.lastName);
    const isPasswordValid = validateField('password', formData.password);
    const isConfirmPasswordValid = validateField('confirmPassword', formData.confirmPassword);

    return isUsernameValid && isEmailValid && isFirstNameValid &&
        isLastNameValid && isPasswordValid && isConfirmPasswordValid;
  };

  // Handle form submissions
  const handleAddInstructor = async () => {
    try {
      // Validate the entire form before submission
      if (!validateForm()) {
        setError('Please correct the errors in the form.');
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
      handleCloseDialogs();
      setError(null); // Clear any previous errors on success
    } catch (err) {
      console.error('Error adding instructor:', err);

      // Handle validation errors from the backend
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to add instructor. Please check your form and try again.');
        }
      } else {
        setError('Failed to add instructor. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstructor = async () => {
    try {
      await deleteInstructor(currentInstructor.id);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error deleting instructor:', err);
      setError('Failed to delete instructor. Please try again.');
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

      {/* Search Field */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search instructors by name, username, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="instructor management table">
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && instructors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : instructors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No instructors found. {searchTerm ? 'Try adjusting your search criteria.' : 'Add your first instructor using the button above.'}
                  </TableCell>
                </TableRow>
              ) : (
                instructors
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((instructor) => (
                    <TableRow hover key={instructor.id}>
                      <TableCell>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {instructor.firstName?.[0]}{instructor.lastName?.[0]}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {instructor.firstName} {instructor.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{instructor.username}</TableCell>
                      <TableCell>{instructor.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={instructor.enabled ? 'Active' : 'Inactive'}
                          color={instructor.enabled ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
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
                error={!!formErrors.username}
                helperText={formErrors.username || 'Username must be between 3 and 50 characters'}
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
                error={!!formErrors.email}
                helperText={formErrors.email}
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
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
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
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
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
                error={!!formErrors.password}
                helperText={formErrors.password || 'Password must be at least 8 characters'}
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
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button
              onClick={handleAddInstructor}
              variant="contained"
              color="primary"
              disabled={loading || !formData.username || !formData.email || !formData.firstName ||
                  !formData.lastName || !formData.password || !formData.confirmPassword}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Instructor'}
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
