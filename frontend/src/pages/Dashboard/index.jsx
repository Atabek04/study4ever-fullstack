import { Box, Typography, Button, AppBar, Toolbar, Container } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Study4Ever Dashboard
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Study4Ever
        </Typography>
        <Typography variant="body1" paragraph>
          You have successfully logged in to the platform. This is a placeholder dashboard that will be implemented in future phases.
        </Typography>
        <Typography variant="body1" paragraph>
          The authentication flow is now complete. You can log out using the button in the top-right corner.
        </Typography>
      </Container>
    </Box>
  );
};

export default Dashboard;
