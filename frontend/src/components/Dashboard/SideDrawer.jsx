import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const drawerWidth = 240;

const SideDrawer = ({ open, onClose, variant = "persistent" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user has admin or instructor role (case-insensitive)
  const isAdminOrInstructor = user?.roles?.some(role => {
    const normalizedRole = role.toUpperCase();
    return normalizedRole === 'ROLE_ADMIN' || 
           normalizedRole === 'ADMIN' || 
           normalizedRole === 'ROLE_INSTRUCTOR' || 
           normalizedRole === 'INSTRUCTOR';
  });
  
  // Log user information for debugging
  console.log('SideDrawer - Current user:', {
    username: user?.username,
    roles: user?.roles,
    isAdminOrInstructor,
    originalRoles: JSON.stringify(user?.roles)
  });
  
  // Navigation items
  const mainNavItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'My Courses', icon: <SchoolIcon />, path: '/courses' },
    { text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments' },
    { text: 'Schedule', icon: <CalendarTodayIcon />, path: '/schedule' },
    { text: 'Saved', icon: <BookmarkIcon />, path: '/saved' },
  ];

  // Show admin link only for users with appropriate roles
  const adminNavItems = isAdminOrInstructor ? [
    { text: 'Admin Panel', icon: <AdminPanelSettingsIcon />, path: '/admin' },
  ] : [];

  const secondaryNavItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawerContent = (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2,
      }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            color: 'primary.main',
            fontWeight: 700,
            letterSpacing: '-0.5px'
          }}
        >
          Study4Ever
        </Typography>
      </Box>
      <Divider />
      <List>
        {mainNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{ 
                borderRadius: '0 20px 20px 0',
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(199, 0, 57, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(199, 0, 57, 0.12)',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(199, 0, 57, 0.04)',
                }
              }}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon 
                sx={{ 
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary' 
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary'
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Show admin section only if user has admin/instructor role */}
      {adminNavItems.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <List>
            {adminNavItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  sx={{ 
                    borderRadius: '0 20px 20px 0',
                    mx: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(199, 0, 57, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(199, 0, 57, 0.12)',
                      }
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(199, 0, 57, 0.04)',
                    }
                  }}
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary' 
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      
      <Divider sx={{ my: 2 }} />
      <List>
        {secondaryNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              sx={{ 
                borderRadius: '0 20px 20px 0',
                mx: 1
              }}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  color: location.pathname === item.path ? 'primary.main' : 'text.primary'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant={variant}
          open={open}
          sx={{
            width: open ? drawerWidth : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              height: 'calc(100% - 72px)',
              top: 72,
              paddingTop: 0,
              transform: open ? 'none' : 'translateX(-100%)',
              visibility: open ? 'visible' : 'hidden',
              transition: theme.transitions.create(['transform', 'visibility'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default SideDrawer;
