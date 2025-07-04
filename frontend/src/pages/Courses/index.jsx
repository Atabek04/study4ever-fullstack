import { useState, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
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
    // Ensure courses is an array before filtering
    if (!Array.isArray(courses)) {
      console.warn('Courses is not an array:', courses);
      return [];
    }
    
    // First filter courses - handle potential missing properties safely
    let result = courses.filter(course => {
      const title = course.title?.toLowerCase() || '';
      const description = course.description?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      
      return title.includes(term) || description.includes(term);
    });
    
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
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            return order === 'asc' 
              ? titleA.localeCompare(titleB)
              : titleB.localeCompare(titleA);
          } else if (field === 'id') {
            return order === 'asc'
              ? (a.id || 0) - (b.id || 0)
              : (b.id || 0) - (a.id || 0);
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

  const handleDiagnostics = async () => {
    try {
      const { testApiEndpoint } = await import('../../utils/apiDiagnostics.js');
      const result = await testApiEndpoint('/api/v1/courses');
      console.log('API Diagnostics Results:', result);
      
      setError(prev => {
        const details = `Diagnostics: ${result.success ? 'Connected' : 'Failed'} to ${result.fullUrl}`;
        return prev + ` (${details})`;
      });
    } catch (e) {
      console.error('Error running diagnostics:', e);
    }
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
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} sx={{ display: 'flex', justifyContent: 'center' }} key={index}>
          <Box sx={{ width: { xs: '100%', sm: 340, md: 300, lg: 270, xl: 250 }, maxWidth: '100%' }}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                maxWidth: 380,
                minWidth: 260,
                margin: '0 auto',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                backgroundColor: '#F9EFD6', // Match CourseItem background
              }}
            >
              <Skeleton variant="rectangular" height={120} animation="wave" />
              <Box sx={{ flexGrow: 1, pt: 2.5, pb: 1, px: 3 }}>
                <Skeleton variant="text" height={28} width="85%" animation="wave" sx={{ mb: 1.5 }} />
                <Skeleton variant="text" height={20} width="60%" animation="wave" sx={{ mb: 2 }} />
                <Skeleton variant="text" height={50} animation="wave" sx={{ mb: 0 }} />
              </Box>
              <Box sx={{ p: 3, pt: 1, pb: 2.5 }}>
                <Skeleton 
                  variant="rectangular" 
                  height={48} 
                  animation="wave" 
                  sx={{ borderRadius: 2 }} 
                />
              </Box>
            </Paper>
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 2 }}>
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
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button color="inherit" size="small" onClick={handleDiagnostics}>
                      DIAGNOSE
                    </Button>
                    <Button color="inherit" size="small" onClick={handleRetry}>
                      RETRY
                    </Button>
                  </Box>
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
