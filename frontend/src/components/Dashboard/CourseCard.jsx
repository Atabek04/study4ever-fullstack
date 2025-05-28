import { Card, CardMedia, CardContent, CardActions, Typography, Button, LinearProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useFirstLesson } from '../../hooks/navigationHooks';
import { useContinueLearning } from '../../hooks/useContinueLearning';

const CourseCard = ({ course }) => {
  // Fallback image if course thumbnail fails to load
  const fallbackImage = 'https://picsum.photos/400/140?blur=2';
  const navigate = useNavigate();
  
  // Log course data structure for debugging if needed
  // console.log('CourseCard received course data:', course);
  
  // Handle invalid or empty course data
  if (!course) {
    console.warn('CourseCard received null or undefined course data');
    return null;
  }
  
  // Extract course data, handling different API response formats
  // The progress API might return nested course object with progress information
  // or flat structure with course data and progress information
  const courseData = course.course || course;
  
  // Extract title from the enriched course data
  const courseTitle = courseData.title || 'Untitled Course';
  
  // Extract instructor information - now directly available from the enriched data
  const instructorName = courseData.instructor || 'Instructor';
  
  // Extract progress percentage - should be in completionPercentage from progress data
  const courseProgress = course.completionPercentage || course.progress || 0;
  
  // Extract course thumbnail/image with fallback
  const courseThumbnail = courseData.thumbnail || courseData.imageUrl || fallbackImage;
  
  // Extract course ID for navigation
  const courseId = courseData.id || courseData.courseId;
  
  // Use our custom hooks to get the first lesson ID and continue-learning data
  const { firstLessonId, loading: firstLessonLoading } = useFirstLesson(courseId);
  const { nextLesson, loading: nextLessonLoading, error: nextLessonError } = useContinueLearning(courseId);
  
  // Track loading states for the button
  const isLoading = firstLessonLoading || nextLessonLoading;
  
  // For debugging
  if (nextLessonError) {
    console.warn(`Continue learning error for course ${courseId}:`, nextLessonError);
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        maxWidth: 380,
        minWidth: 260,
        margin: '0 auto',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardMedia
        component="img"
        image={courseThumbnail || fallbackImage}
        alt={courseTitle}
        sx={{
          height: { xs: 120, sm: 140 },
          objectFit: 'cover',
          objectPosition: 'center',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          background: '#f3f6f9',
        }}
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = fallbackImage;
        }}
      />
      <CardContent sx={{ flexGrow: 1, pt: 1.5, pb: 1, px: 2 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          fontWeight={700} 
          component="div" 
          noWrap
          sx={{ fontSize: '1.1rem', mb: 0.5, pt: 0.5 }}
        >
          {courseTitle}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          noWrap
          sx={{ mb: 2 }}
        >
          {instructorName}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" color="primary" fontWeight={500}>
              {courseProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            // Ensure progress is a valid value between 0-100
            value={Math.min(Math.max(parseFloat(courseProgress) || 0, 0), 100)}
            sx={{ 
              height: 8, 
              borderRadius: 5, 
              background: '#f3f6f9' 
            }}
            color="primary"
          />
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => {
            // If we have next lesson data from continue-learning endpoint, use it
            if (courseId && nextLesson && nextLesson.lessonId) {
              console.log(`Navigating to continue learning: /courses/${courseId}/lessons/${nextLesson.lessonId}`);
              navigate(`/courses/${courseId}/lessons/${nextLesson.lessonId}`);
            }
            // Fallback to first lesson if continue-learning didn't return data
            else if (courseId && firstLessonId) {
              console.log(`Navigating to first lesson: /courses/${courseId}/lessons/${firstLessonId}`);
              navigate(`/courses/${courseId}/lessons/${firstLessonId}`);
            }
            // Last resort is course details page if no lesson data is available
            else if (courseId) {
              console.log(`No lesson ID available, navigating to course page: /courses/${courseId}`);
              navigate(`/courses/${courseId}`);
            }
          }}
          disabled={!courseId || isLoading}
          sx={{ 
            borderRadius: 2, 
            fontWeight: 600, 
            textTransform: 'none', 
            flex: 1, 
            py: 0.5,
            mr: 1
          }}
        >
          {isLoading ? 'Loading...' : 
            (nextLesson && nextLesson.lessonId) || firstLessonId ? 'Continue Learning' : 'View Course'}
        </Button>
        <Button 
          size="small" 
          color="secondary"
          onClick={() => courseId && navigate(`/courses/${courseId}/details`)}
          disabled={!courseId}
          sx={{ textTransform: 'none', fontWeight: 500 }}
        >
          Details
        </Button>
      </CardActions>
    </Card>
  );
};

// Add PropTypes validation for better developer experience
CourseCard.propTypes = {
  course: PropTypes.shape({
    // Progress information from /api/v1/courses/progress
    courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    completionPercentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    progress: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    completed: PropTypes.bool,
    
    // Course details from /api/v1/courses/{courseId}
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    instructorId: PropTypes.string,
    totalModules: PropTypes.number,
    totalLessons: PropTypes.number,
    thumbnail: PropTypes.string,
    imageUrl: PropTypes.string,
    
    // Instructor details added by our hook
    instructor: PropTypes.string,
    instructorDetails: PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      username: PropTypes.string,
      roles: PropTypes.arrayOf(PropTypes.string)
    }),
    
    // Next lesson information from continue-learning endpoint
    nextLesson: PropTypes.shape({
      lessonId: PropTypes.string,
      lessonTitle: PropTypes.string,
      moduleId: PropTypes.string,
      moduleTitle: PropTypes.string,
      courseCompletionPercentage: PropTypes.number
    }),
    
    // Legacy support for nested course data
    course: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      instructor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      thumbnail: PropTypes.string,
      imageUrl: PropTypes.string
    })
  }).isRequired
};

export default CourseCard;
