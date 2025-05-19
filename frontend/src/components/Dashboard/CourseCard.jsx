import { Card, CardMedia, CardContent, CardActions, Typography, Button, LinearProgress, Box } from '@mui/material';

const CourseCard = ({ course }) => {
  // Fallback image if course thumbnail fails to load
  const fallbackImage = 'https://picsum.photos/400/140?blur=2';

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardMedia
        component="img"
        image={course.thumbnail || fallbackImage}
        alt={course.title}
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
          {course.title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          noWrap
          sx={{ mb: 2 }}
        >
          {course.instructor}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" color="primary" fontWeight={500}>
              {course.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={course.progress}
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
          sx={{ 
            borderRadius: 2, 
            fontWeight: 600, 
            textTransform: 'none', 
            flex: 1, 
            py: 0.5,
            mr: 1
          }}
        >
          Continue
        </Button>
        <Button 
          size="small" 
          color="secondary" 
          sx={{ textTransform: 'none', fontWeight: 500 }}
        >
          Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default CourseCard;
