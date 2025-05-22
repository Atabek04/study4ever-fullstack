import { Grid, Box, Typography, Button, Grow } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CourseItem from './CourseItem';
import NoResultsIllustration from './NoResultsIllustration';

const CourseList = ({ courses, searchTerm }) => {
  // If there are no courses to display
  if (courses.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          py: 8,
          textAlign: 'center'
        }}
      >
        <NoResultsIllustration />
        
        <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 1 }}>
          {searchTerm ? "No matching courses found" : "No courses available yet"}
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: 450 }}
        >
          {searchTerm 
            ? `We couldn't find any courses matching "${searchTerm}". Try a different search term or browse all courses.`
            : "We're working on adding new exciting courses to our catalog. Check back soon!"}
        </Typography>
        
        {searchTerm && (
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => window.location.reload()}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              py: 1,
              px: 3
            }}
          >
            View All Courses
          </Button>
        )}
      </Box>
    );
  }

  // Display the grid of courses with animation
  return (
    <Grid container spacing={3} justifyContent="center">
      {courses.map((course, index) => (
        <Grow
          in={true}
          key={course.id}
          style={{ transformOrigin: '0 0 0' }}
          timeout={(index % 4) * 150 + 300}
        >
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: { xs: '100%', sm: 340, md: 300, lg: 270, xl: 250 }, maxWidth: '100%' }}>
              <CourseItem course={course} />
            </Box>
          </Grid>
        </Grow>
      ))}
    </Grid>
  );
};

export default CourseList;
