import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  MenuItem, 
  Avatar,  
  Divider, 
  useMediaQuery, 
  Container, 
  Tooltip,
  CssBaseline
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import SideDrawer from './SideDrawer';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';

// Drawer width - for main content positioning calculation
const drawerWidth = 240;

const DashboardLayout = ({ children }) => {
  const { logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for drawer
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // State for user menu
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  // Update drawer state when screen size changes
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);
  
  // For smoother transition of container width when drawer opens/closes
  const [mainContentStyle, setMainContentStyle] = useState({
    marginLeft: isMobile ? 0 : drawerOpen ? `${drawerWidth}px` : 0,
    width: isMobile ? '100%' : drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%'
  });
  
  useEffect(() => {
    setMainContentStyle({
      marginLeft: isMobile ? 0 : drawerOpen ? `${drawerWidth}px` : 0,
      width: isMobile ? '100%' : drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%'
    });
  }, [drawerOpen, isMobile]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          width: '100%',
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(90deg, #C70039 0%, #FF6969 100%)',
          color: 'primary.contrastText',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ height: 72, px: { xs: 1, sm: 2 } }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{ 
                flexGrow: 1,
                fontWeight: 800,
                letterSpacing: '-1px',
                textShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              Study4Ever
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Notifications">
                <IconButton onClick={handleOpenNotificationsMenu} color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-notifications"
                anchorEl={anchorElNotifications}
                open={Boolean(anchorElNotifications)}
                onClose={handleCloseNotificationsMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 1 }}
              >
                <MenuItem onClick={handleCloseNotificationsMenu}>
                  <Typography>No new notifications</Typography>
                </MenuItem>
              </Menu>
              
              <Tooltip title="Account settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'secondary.main',
                      border: '2px solid',
                      borderColor: 'background.paper',
                      width: 40, 
                      height: 40,
                      fontWeight: 700,
                      fontSize: 20,
                    }}
                  >
                    U
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 1 }}
              >
                <MenuItem onClick={handleCloseUserMenu}>
                  <Typography>Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseUserMenu}>
                  <Typography>Account</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                  <Typography>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* SideDrawer */}
      <SideDrawer 
        open={drawerOpen} 
        onClose={handleDrawerToggle} 
        variant={isMobile ? "temporary" : "persistent"}
      />
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '72px',
          height: '100vh',
          overflow: 'auto',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ...mainContentStyle
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: 1,
            px: { xs: 1, sm: 1.5, md: 2 },
            height: '100%'
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
