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
  Delete as DeleteIcon
} from '@mui/icons-material';
import { fetchAllTags, createTag, deleteTag } from '../../hooks/tagManagementHooks';

const TagManagement = () => {
  // State
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentTag, setCurrentTag] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: ''
  });

  // Initial data fetch
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const tagsData = await fetchAllTags();
      setTags(tagsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError({ 
        severity: 'error', 
        message: `Failed to load tags: ${err.response?.data?.message || err.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    setFormData({ name: '' });
    setOpenAddDialog(true);
  };

  const handleOpenDeleteDialog = (tag) => {
    setCurrentTag(tag);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenDeleteDialog(false);
    setCurrentTag(null);
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
  const handleAddTag = async () => {
    try {
      setLoading(true);
      await createTag(formData);
      fetchTags();
      handleCloseDialogs();
      setError({ severity: 'success', message: 'Tag added successfully!' });
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error adding tag:', err);
      setError({ severity: 'error', message: `Failed to add tag: ${err.response?.data?.message || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async () => {
    try {
      setLoading(true);
      await deleteTag(currentTag.id);
      fetchTags();
      handleCloseDialogs();
      setError({ severity: 'success', message: 'Tag deleted successfully!' });
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError({ severity: 'error', message: `Failed to delete tag: ${err.response?.data?.message || err.message}` });
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
    setPage(0);
  };

  // Filter tags based on search term
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Tag Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Tag
        </Button>
      </Box>

      {error && (
        <Alert severity={error.severity || 'error'} sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message || error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search Tags"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ minWidth: '300px' }}
          placeholder="Search by name"
        />
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="tag management table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <CircularProgress size={24} sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ) : filteredTags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    {tags.length === 0 
                      ? 'No tags found. Add your first tag using the button above.'
                      : 'No tags match your search criteria.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTags
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tag) => (
                    <TableRow hover key={tag.id}>
                      <TableCell>{tag.name}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Delete Tag">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleOpenDeleteDialog(tag)}
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
          count={filteredTags.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Add Tag Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Tag</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Tag Name"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button 
            onClick={handleAddTag} 
            variant="contained" 
            color="primary"
            disabled={!formData.name}
          >
            Add Tag
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the tag "{currentTag?.name}"? 
            This action cannot be undone and will remove this tag from all courses that use it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleDeleteTag} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TagManagement;