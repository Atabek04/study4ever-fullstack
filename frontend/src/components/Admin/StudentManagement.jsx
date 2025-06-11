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
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment,
  Chip,
  Avatar
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useStudents } from '../../hooks/userManagementHooks';

const StudentManagement = () => {
  // Use custom hook for students data
  const { students, loading, error, refetch, searchStudents } = useStudents();
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // State for user details dialog
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearchTimeout(setTimeout(() => {
      if (searchTerm.trim()) {
        searchStudents(searchTerm);
      } else {
        refetch();
      }
    }, 300));

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedUser(null);
  };

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Calculate displayed students for current page
  const displayedStudents = students.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Format user roles for display
  const formatRoles = (roles) => {
    if (!roles || !Array.isArray(roles)) return [];
    return roles.filter(role => role !== 'ROLE_STUDENT');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon color="primary" />
          Student Management
        </Typography>
        
        {/* Search Field */}
        <TextField
          placeholder="Search students..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label="students table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading students...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : displayedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'No students found matching your search.' : 'No students found.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayedStudents.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                          {student.firstName ? student.firstName.charAt(0) : student.username.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {student.firstName && student.lastName 
                              ? `${student.firstName} ${student.lastName}` 
                              : student.username}
                          </Typography>
                          {formatRoles(student.roles).length > 0 && (
                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                              {formatRoles(student.roles).map((role) => (
                                <Chip 
                                  key={role}
                                  label={role.replace('ROLE_', '')}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                />
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.username}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{student.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={student.enabled ? 'Active' : 'Inactive'}
                        color={student.enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(student.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={() => handleViewUser(student)}
                          size="small"
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={students.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* User Details Dialog */}
      <Dialog 
        open={openDetailsDialog} 
        onClose={handleCloseDetailsDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {selectedUser?.firstName ? selectedUser.firstName.charAt(0) : selectedUser?.username?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">Student Details</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser?.firstName && selectedUser?.lastName 
                  ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                  : selectedUser?.username}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Username</Typography>
                <Typography variant="body1">{selectedUser.username}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography variant="body1">
                  {selectedUser.firstName && selectedUser.lastName 
                    ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                    : 'Not provided'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Roles</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  {selectedUser.roles?.map((role) => (
                    <Chip 
                      key={role}
                      label={role.replace('ROLE_', '')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  label={selectedUser.enabled ? 'Active' : 'Inactive'}
                  color={selectedUser.enabled ? 'success' : 'default'}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Created Date</Typography>
                <Typography variant="body1">{formatDate(selectedUser.createdAt)}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManagement;
