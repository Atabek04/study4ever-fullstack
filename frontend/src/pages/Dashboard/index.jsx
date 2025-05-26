import { Box, Typography, Grid, Paper, Card, CardContent, CardHeader, Avatar, Button, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import CourseCard from '../../components/Dashboard/CourseCard';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { useEnrolledCourses } from '../../hooks/courseHooks';

const Dashboard = () => {
  // Auth context for user profile and logout functionality
  const { user, logout } = useAuth();
  
  // Fetch enrolled courses with progress data
  const { enrolledCourses, loading, error } = useEnrolledCourses();

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>
        {/* Welcome Header */}
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            color: 'text.primary', 
            fontWeight: 700, 
            mb: 4, 
            textAlign: 'center' 
          }}
        >
          Welcome to Study4Ever{user?.firstName ? `, ${user.firstName}` : ''}
        </Typography>
        
        {/* Course Grid - exactly 3 per row */}
        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: 'text.primary', 
              textAlign: 'center' 
            }}
          >
            Your Courses
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto', my: 3 }}>
              {error}
            </Alert>
          ) : enrolledCourses.length === 0 ? (
            <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto', my: 3 }}>
              You are not enrolled in any courses yet. Browse our course catalog to find courses that interest you.
            </Alert>
          ) : (
            <Grid container spacing={3} sx={{ px: { xs: 1, sm: 2, md: 4 }, justifyContent: 'center' }}>
              {enrolledCourses.map((course) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  key={course.id}
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    maxWidth: { xs: '100%', sm: '100%', md: '400px' } 
                  }}
                >
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        {/* Dashboard Widgets */}
        <Grid container spacing={3} sx={{ px: { xs: 1, sm: 2, md: 4 }, justifyContent: 'center' }}>
          {/* Main Content Area */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)'
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                Your Learning Journey
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                You have successfully logged in to the platform. This is a placeholder dashboard that will be implemented in future phases.
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                The authentication flow is now complete. You can log out using the button in the top-right corner.
              </Typography>
            </Paper>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(199, 0, 57, 0.12)'
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Recent Courses
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your recent courses will appear here.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ 
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(199, 0, 57, 0.12)'
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                      Upcoming Assignments
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your upcoming assignments will appear here.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              mb: 3
            }}>
              <CardHeader
                title="Your Profile"
                titleTypographyProps={{ 
                  variant: 'h6', 
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: 'primary.main',
                      color: 'background.paper',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {user?.firstName ? user.firstName.charAt(0) : 'U'}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.username || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email || 'Student'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    mt: 1,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'rgba(199, 0, 57, 0.04)'
                    }
                  }}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
            
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <CardHeader
                title="Quick Links"
                titleTypographyProps={{ 
                  variant: 'h6', 
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              />
              <CardContent>
                <Typography variant="body2" paragraph color="text.secondary">
                  Your quick links will appear here.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
