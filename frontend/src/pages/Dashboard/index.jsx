import { Box, Typography, Grid, Paper, Card, CardContent, CardHeader, Avatar, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import CourseCard from '../../components/Dashboard/CourseCard';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

// Mock course data for development
const mockCourses = [
  {
    id: 1,
    title: 'React for Beginners',
    instructor: 'Jane Doe',
    progress: 72,
    thumbnail: 'https://picsum.photos/id/0/400/140', // Fixed image ID
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    instructor: 'John Smith',
    progress: 45,
    thumbnail: 'https://picsum.photos/id/1/400/140', // Fixed image ID
  },
  {
    id: 3,
    title: 'UI/UX Design Fundamentals',
    instructor: 'Emily Clark',
    progress: 90,
    thumbnail: 'https://picsum.photos/id/2/400/140', // Fixed image ID
  },
  {
    id: 4,
    title: 'Data Structures & Algorithms',
    instructor: 'Michael Lee',
    progress: 30,
    thumbnail: 'https://picsum.photos/id/3/400/140', // Fixed image ID
  },
];

const Dashboard = () => {
  // Auth context for logout functionality
  const { logout } = useAuth();

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
          Welcome to Study4Ever
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
          
          <Grid container spacing={3} sx={{ px: { xs: 0, sm: 1, md: 2 } }}>
            {mockCourses.map((course) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={course.id}
              >
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: '100%'
                }}>
                  <CourseCard course={course} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Dashboard Widgets */}
        <Grid container spacing={3}>
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
                    U
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>User</Typography>
                    <Typography variant="body2" color="text.secondary">Student</Typography>
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
