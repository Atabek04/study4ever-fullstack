import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  Drawer, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider, 
  Typography, 
  IconButton,
  ListItemButton,
  Collapse,
  ListSubheader,
  Avatar,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HomeIcon from '@mui/icons-material/Home';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useLessonCompletion } from '../../hooks/lessonHooks';
import { useBookmarkStatus } from '../../hooks/bookmarkHooks';

// Helper component for lesson duration display
const LessonDuration = ({ duration }) => {
  if (!duration) return null;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
      <AccessTimeIcon fontSize="small" sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
      <Typography variant="caption" color="text.secondary">
        {duration}
      </Typography>
    </Box>
  );
};

LessonDuration.propTypes = {
  duration: PropTypes.string
};

// Helper component for each individual lesson item
const LessonItem = ({ lesson, isSelected, courseId, moduleId, onSelect }) => {
  // Track lesson completion status
  const { 
    isCompleted, 
    loading, 
    toggleCompletion, 
    markAsComplete, // Include the markAsComplete function
    error: completionError 
  } = useLessonCompletion(lesson.id, courseId, moduleId);
  
  // Add local state to manage completion status in component
  const [localCompleted, setLocalCompleted] = React.useState(isCompleted);
  
  // Track bookmark status (read-only in sidebar) with local state for immediate updates
  const { isBookmarked } = useBookmarkStatus(lesson.id);
  const [localBookmarked, setLocalBookmarked] = React.useState(isBookmarked);

  // Update local bookmark state when hook state changes
  React.useEffect(() => {
    setLocalBookmarked(isBookmarked);
  }, [isBookmarked]);

  // Update local state when the hook's state changes
  React.useEffect(() => {
    // Avoid unnecessary logging to reduce console spam
    if (isCompleted !== localCompleted) {
      setLocalCompleted(isCompleted);
    }
  }, [lesson.id, isCompleted, loading, localCompleted]);

  // Snackbar state
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

  // Handle bookmark toggle without triggering lesson selection
  // Note: Bookmark toggling is disabled in sidebar - bookmarks are managed from lesson content page

  // Update localStorage when completion status changes
  React.useEffect(() => {
    if (isCompleted || localCompleted) {
      // Store the completion state in localStorage for our ModuleSection component to use
      localStorage.setItem(`lesson-${lesson.id}-completed`, 'true');
    }
  }, [isCompleted, localCompleted, lesson.id]);
  
  // Listen for custom lessonCompleted events to update UI immediately
  React.useEffect(() => {
    const handleLessonCompleted = (e) => {
      // If this is our lesson, update the completion status
      if (e.detail.lessonId === lesson.id) {
        console.log(`LessonItem: Received completion event for this lesson: ${lesson.id}`);
        setLocalCompleted(true);
        
        // Also update localStorage directly for immediate effect
        localStorage.setItem(`lesson-${lesson.id}-completed`, 'true');
      }
    };
    
    // Add event listener
    window.addEventListener('lessonCompleted', handleLessonCompleted);
    
    // Clean up
    return () => {
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
    };
  }, [lesson.id]);

  // Listen for custom bookmarkChanged events to update UI immediately
  React.useEffect(() => {
    const handleBookmarkChanged = (e) => {
      // If this is our lesson, update the bookmark status
      if (e.detail.lessonId === lesson.id) {
        console.log(`LessonItem: Received bookmark event for lesson: ${lesson.id}, isBookmarked: ${e.detail.isBookmarked}`);
        setLocalBookmarked(e.detail.isBookmarked);
      }
    };
    
    // Add event listener
    window.addEventListener('bookmarkChanged', handleBookmarkChanged);
    
    // Clean up
    return () => {
      window.removeEventListener('bookmarkChanged', handleBookmarkChanged);
    };
  }, [lesson.id]);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    <>
      <ListItem
        disablePadding
        selected={isSelected}
        secondaryAction={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Bookmark indicator (display only) */}
            {localBookmarked && (
              <Tooltip title="Bookmarked lesson">
                <BookmarkIcon 
                  fontSize="small" 
                  sx={{ 
                    color: 'secondary.main',
                    opacity: 0.8
                  }} 
                />
              </Tooltip>
            )}
          </Box>
        }
        sx={{ 
          mb: 0.5,
          '&.Mui-selected': {
            backgroundColor: 'rgba(199, 0, 57, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(199, 0, 57, 0.12)',
            }
          }
        }}
      >
        <ListItemButton 
          onClick={() => onSelect(lesson.id)}
          dense
          sx={{ 
            borderRadius: 1,
            py: 1,
            '&.Mui-selected': {
              backgroundColor: 'rgba(199, 0, 57, 0.08)',
            },
            '&:hover': {
              backgroundColor: 'rgba(199, 0, 57, 0.05)',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            {loading ? (
              <CircularProgress size={16} />
            ) : (
              isCompleted || localCompleted || localStorage.getItem(`lesson-${lesson.id}-completed`) === 'true' ? (
                <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
              ) : (
                <PlayCircleOutlineIcon fontSize="small" sx={{ color: 'action.active' }} />
              )
            )}
          </ListItemIcon>
          <ListItemText 
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? 'primary.main' : 
                           (isCompleted || localCompleted || localStorage.getItem(`lesson-${lesson.id}-completed`) === 'true') ? 
                           'text.secondary' : 'text.primary',
                    pr: 1, // Reduced right padding
                    display: 'flex',
                    alignItems: 'center',
                    // Add subtle visual indicator for completed lessons
                    ...((isCompleted || localCompleted || localStorage.getItem(`lesson-${lesson.id}-completed`) === 'true') && {
                      fontStyle: 'normal',
                      opacity: 0.85
                    })
                  }}
                >
                  {lesson.title}
                </Typography>
              </Box>
            }
            secondary={<LessonDuration duration={lesson.duration} />}
          />
        </ListItemButton>
      </ListItem>
      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

LessonItem.propTypes = {
  lesson: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    duration: PropTypes.string
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
  moduleId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired
};

/**
 * Module Collapsible Section Component
 * Represents a module with its lessons as a collapsible section
 */
const ModuleSection = ({ module, currentLessonId, courseId, onLessonSelect }) => {
  // Track if all lessons in the module are completed
  const [allLessonsCompleted, setAllLessonsCompleted] = React.useState(false);
  
  // Check if this module contains the current lesson to ensure we highlight it
  const containsCurrentLesson = module.lessons.some(lesson => lesson.id === currentLessonId);
  // Initialize open state based on module completion and if it contains current lesson
  const [open, setOpen] = React.useState(() => {
    // Check if module is already marked as completed in localStorage
    const isModuleCompleted = localStorage.getItem(`module-${module.id}-completed`) === 'true';
    
    // If module is completed, collapse it by default unless it contains the current lesson
    return !isModuleCompleted || containsCurrentLesson;
  });
  
  // Track completion status of all lessons in this module
  React.useEffect(() => {
    // Check if all lessons in this module are completed
    const checkModuleCompletion = () => {
      if (!module.lessons || module.lessons.length === 0) return false;
      
      // Check if every lesson is marked as completed
      const isModuleCompleted = module.lessons.every(lesson => {
        // Using localStorage to check completion status
        return localStorage.getItem(`lesson-${lesson.id}-completed`) === 'true';
      });
      
      // Only update state if there's been a change to reduce renders
      if (isModuleCompleted !== allLessonsCompleted) {
        console.log(`Module ${module.id} completion status changed: ${isModuleCompleted ? 'COMPLETED' : 'IN PROGRESS'}`);
        setAllLessonsCompleted(isModuleCompleted);
        
        // If module was just completed and doesn't contain current lesson, collapse it
        if (isModuleCompleted && !containsCurrentLesson) {
          setOpen(false);
        }
      }
      
      // Update localStorage with module completion status for other components
      if (isModuleCompleted) {
        localStorage.setItem(`module-${module.id}-completed`, 'true');
      } else {
        // If not completed, remove the flag from localStorage
        localStorage.removeItem(`module-${module.id}-completed`);
      }
    };
    
    // Check initially
    checkModuleCompletion();
    
    // Listen for changes to localStorage (when lessons are marked complete)
    const handleStorageChange = (e) => {
      // Only check if the changed key is relevant to our module's lessons
      if (e.key && e.key.startsWith('lesson-') && e.key.includes('-completed')) {
        console.log(`Storage change detected: ${e.key} = ${e.newValue}`);
        checkModuleCompletion();
      }
    };
    
    // Listen for custom lessonCompleted events
    const handleLessonCompleted = (e) => {
      // Check if this event is for a lesson in our module
      const { lessonId, moduleId: completedModuleId } = e.detail;
      if (completedModuleId === module.id || module.lessons.some(l => l.id === lessonId)) {
        console.log(`Lesson completion event detected for module ${module.id}, lesson ${lessonId}`);
        
        // Update localStorage immediately to ensure components have the latest status
        localStorage.setItem(`lesson-${lessonId}-completed`, 'true');
        
        // Check overall module completion
        checkModuleCompletion();
      }
    };
    
    // Set up event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('lessonCompleted', handleLessonCompleted);
    
    // No need to check completion on regular intervals anymore
    // This was causing excessive API calls
    // Force a check only once when the component mounts
    setTimeout(checkModuleCompletion, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('lessonCompleted', handleLessonCompleted);
      // No need to clear interval as we're not using it anymore
    };
  }, [module.lessons, module.id]);
  
  const handleToggle = () => {
    // Always allow the module to be opened
    if (!open) {
      setOpen(true);
      return;
    }
    
    // For closing the module:
    
    // If this module contains the current lesson, don't allow it to be closed
    if (containsCurrentLesson) {
      return;
    }
    
    // Only allow toggling closed if all lessons are completed or module is explicitly opened
    if (allLessonsCompleted || open) {
      setOpen(false);
    } else {
      // If not all lessons are completed, module must stay open by default
      setOpen(true);
    }
  };
  
  return (
    <>
      <ListItem 
        component="div" 
        sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          borderRadius: 1,
          mt: 1,
          mb: 0.5
        }}
      >
        <ListItemText 
          disableTypography
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography 
                variant="subtitle2" 
                fontWeight={600} 
                sx={{ color: 'text.primary', mr: 1 }}
              >
                {module.title}
              </Typography>
              {allLessonsCompleted && (
                <CheckCircleIcon 
                  fontSize="small" 
                  color="success"
                />
              )}
            </Box>
          }
        />
        <Tooltip title={
          containsCurrentLesson && open ? "This module contains your current lesson" :
          !allLessonsCompleted && !open ? "Expand module" : 
          !allLessonsCompleted && open ? "Complete all lessons to collapse this module" :
          open ? "Collapse module" : "Expand module"
        }>
          <span>
            <IconButton 
              edge="end" 
              onClick={handleToggle} 
              size="small"
              disabled={(containsCurrentLesson && open) || (!allLessonsCompleted && !open)}
              sx={{ 
                opacity: (containsCurrentLesson && open) || (!allLessonsCompleted && open) ? 0.5 : 1,
                cursor: (containsCurrentLesson && open) || (!allLessonsCompleted && open) ? 'not-allowed' : 'pointer'
              }}
            >
              {open ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </span>
        </Tooltip>
      </ListItem>
      
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding dense>
          {module.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isSelected={lesson.id === currentLessonId}
              courseId={courseId}
              moduleId={module.id}
              onSelect={onLessonSelect}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};

ModuleSection.propTypes = {
  module: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    lessons: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        duration: PropTypes.string
      })
    ).isRequired
  }).isRequired,
  currentLessonId: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  onLessonSelect: PropTypes.func.isRequired
};

/**
 * Course Header in the sidebar
 */
const CourseHeader = ({ course }) => {
  const navigate = useNavigate();
  
  if (!course) return null;
  
  return (
    <Box 
      sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography 
          variant="subtitle1" 
          fontWeight={700} 
          color="primary.main" 
          gutterBottom
          noWrap
          sx={{ flex: 1 }}
        >
          {course.title}
        </Typography>
        <Tooltip title="Back to Dashboard">
          <IconButton 
            color="primary" 
            size="small" 
            onClick={() => navigate('/dashboard')}
            sx={{ ml: 1 }}
          >
            <HomeIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {course.instructor && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Avatar 
            alt={course.instructor} 
            src={course.instructorAvatar || ''} 
            sx={{ width: 24, height: 24 }}
          />
          <Typography variant="body2" color="text.secondary">
            {course.instructor}
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

CourseHeader.propTypes = {
  course: PropTypes.shape({
    title: PropTypes.string.isRequired,
    instructor: PropTypes.string,
    instructorAvatar: PropTypes.string
  })
};

/**
 * The main LessonSidebar component
 * Displays a persistent sidebar with modules and lessons
 */
const LessonSidebar = ({ 
  course, 
  currentLessonId, 
  onLessonSelect,
  open,
  onClose,
  isMobile
}) => {
  // Calculate sidebar width
  const sidebarWidth = 300;
  
  // Create content for both permanent and temporary drawer variants
  const sidebarContent = (
    <>
      {/* Course header with title and instructor */}
      <CourseHeader course={course} />
      
      {/* Close button - only shown on mobile */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      {/* Module and lesson navigation */}
      <List
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          overflowY: 'auto',
          p: 2,
          height: '100%'
        }}
        component="nav"
        dense
      >
        {/* Render each module section with its lessons */}
        {course?.modules?.map((module) => (
          <ModuleSection
            key={module.id}
            module={module}
            currentLessonId={currentLessonId}
            courseId={course.id}
            onLessonSelect={onLessonSelect}
          />
        ))}
        
        {/* Show message if no modules exist */}
        {(!course?.modules || course.modules.length === 0) && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No modules available for this course.
          </Typography>
        )}
      </List>
    </>
  );

  // Render different drawer variants based on screen size
  return isMobile ? (
    // Temporary drawer for mobile
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { 
          boxSizing: 'border-box', 
          width: sidebarWidth,
          boxShadow: 3
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  ) : (
    // Permanent drawer for desktop
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': { 
          boxSizing: 'border-box', 
          width: sidebarWidth,
          borderRight: '1px solid rgba(0,0,0,0.12)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

LessonSidebar.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    instructor: PropTypes.string,
    modules: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        lessons: PropTypes.array.isRequired
      })
    )
  }),
  currentLessonId: PropTypes.string,
  onLessonSelect: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired
};

export default LessonSidebar;
