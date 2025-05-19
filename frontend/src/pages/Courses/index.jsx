import { useState, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  Alert, 
  TextField,
  InputAdornment,
  Paper,
  Breadcrumbs,
  Link,
  Skeleton,
  Fade,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import { useCourses } from '../../hooks/courseHooks';
import CourseList from '../../components/Courses/CourseList';
import CourseFilters from '../../components/Courses/CourseFilters';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const CoursesPage = () => {
  const { courses, loading, error, mutate } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSort, setActiveSort] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    // First filter courses
    let result = courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Then sort courses
    if (activeSort) {
      const [field, order] = activeSort === 'titleAsc' ? ['title', 'asc'] :
                            activeSort === 'titleDesc' ? ['title', 'desc'] :
                            activeSort === 'newest' ? ['id', 'desc'] :
                            activeSort === 'oldest' ? ['id', 'asc'] : 
                            [null, null];
                            
      if (field && order) {
        result = [...result].sort((a, b) => {
          if (field === 'title') {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            return order === 'asc' 
              ? titleA.localeCompare(titleB)
              : titleB.localeCompare(titleA);
          } else if (field === 'id') {
            return order === 'asc'
              ? a.id - b.id
              : b.id - a.id;
          }
          return 0;
        });
      }
    }
    
    return result;
  }, [courses, searchTerm, activeSort]);

  const handleRetry = () => {
    mutate();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  const handleSort = (sortId) => {
    setActiveSort(sortId);
  };
  
  const handleClearSort = () => {
    setActiveSort('');
  };

  const renderSkeletonLoaders = () => (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Paper
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              height: '350px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Skeleton variant="rectangular" height={160} animation="wave" />
            <Box sx={{ p: 2 }}>
              <Skeleton variant="text" height={32} width="80%" animation="wave" />
              <Skeleton variant="text" height={20} width="60%" animation="wave" sx={{ mt: 1 }} />
              <Skeleton variant="text" height={60} animation="wave" sx={{ mt: 1 }} />
              <Skeleton 
                variant="rectangular" 
                height={40} 
                animation="wave" 
                sx={{ mt: 2, borderRadius: 2 }} 
              />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 2 }}
          >
            <Link 
              color="inherit" 
              href="/dashboard" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography 
              color="text.primary" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <MenuBookIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Course Catalog
            </Typography>
          </Breadcrumbs>
          
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight={700} 
            sx={{ mb: 1 }}
          >
            Course Catalog
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
          >
            Browse our complete selection of educational courses
          </Typography>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: 4, 
            bgcolor: 'background.paper', 
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            mb: 3,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      onClick={handleClearSearch}
                      size="small" 
                      aria-label="clear search"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 2, 
                  bgcolor: 'white',
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 2px rgba(199, 0, 57, 0.2)'
                  }
                }
              }}
            />

            <Tooltip title="Refresh courses">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                sx={{ 
                  height: isMobile ? 'auto' : 56,
                  borderRadius: 2,
                  whiteSpace: 'nowrap',
                  minWidth: isMobile ? '100%' : '120px'
                }}
              >
                Refresh
              </Button>
            </Tooltip>
          </Box>
          
          <CourseFilters 
            onSort={handleSort} 
            activeSort={activeSort}
            onClear={handleClearSort}
          />
          
          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                action={
                  <Button color="inherit" size="small" onClick={handleRetry}>
                    RETRY
                  </Button>
                }
              >
                {error}
              </Alert>
            </Fade>
          )}
          
          {!error && filteredAndSortedCourses.length > 0 && (
            <Box sx={{ my: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {`Showing ${filteredAndSortedCourses.length} ${filteredAndSortedCourses.length === 1 ? 'course' : 'courses'}`}
                {searchTerm && ` for "${searchTerm}"`}
              </Typography>
              
              {(searchTerm || activeSort) && (
                <Button 
                  variant="text" 
                  size="small" 
                  color="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveSort('');
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </Box>
          )}
          
          {loading ? (
            renderSkeletonLoaders()
          ) : (
            <CourseList 
              courses={filteredAndSortedCourses} 
              searchTerm={searchTerm}
            />
          )}
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

export default CoursesPage;
