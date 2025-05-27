import React from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';

// Session extension dialog that appears when token needs refreshing
const SessionExtensionDialog = ({ open, onExtend, onLogout, loading }) => {
  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      disableBackdropClick
      aria-labelledby="session-extension-dialog-title"
    >
      <DialogTitle id="session-extension-dialog-title">
        Your Session Is About to Expire
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          For security reasons, your session is about to expire due to inactivity.
          Would you like to extend your session and continue working?
        </DialogContentText>
        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onLogout} 
          color="secondary"
          disabled={loading}
        >
          Log Out
        </Button>
        <Button 
          onClick={onExtend} 
          color="primary" 
          variant="contained"
          disabled={loading}
          autoFocus
        >
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExtensionDialog;
