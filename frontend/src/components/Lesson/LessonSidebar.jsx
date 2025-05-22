import React from 'react';
import PropTypes from 'prop-types';
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
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useLessonBookmark, useLessonCompletion } from '../../hooks/lessonHooks';

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
  const { isCompleted, toggleCompletion } = useLessonCompletion(lesson.id, courseId, moduleId);
  // Track bookmark status
  const { isBookmarked, toggleBookmark } = useLessonBookmark(lesson.id);

  // Snackbar state
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

  // Handle bookmark toggle without triggering lesson selection
  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    toggleBookmark();
  };

  // Handle completion toggle
  const handleCompletionClick = async (e) => {
    e.stopPropagation();
    try {
      const result = await toggleCompletion();
      if (result?.success || result === true) {
        setSnackbar({ open: true, message: isCompleted ? 'Lesson marked as incomplete.' : 'Lesson marked as completed!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Error occurred. Please try again.', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Error occurred. Please try again.', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    <>
      <ListItem
        disablePadding
        selected={isSelected}
        secondaryAction={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}>
              <IconButton
                edge="end"
                size="small"
                onClick={handleCompletionClick}
                sx={{ color: isCompleted ? 'success.main' : 'text.secondary' }}
              >
                {isCompleted ? <CheckCircleIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={isBookmarked ? "Remove bookmark" : "Add bookmark"}>
              <IconButton 
                edge="end" 
                size="small" 
                onClick={handleBookmarkClick}
                sx={{ color: isBookmarked ? 'secondary.main' : 'text.secondary' }}
              >
                {isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
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
            {isCompleted ? (
              <CheckCircleIcon color="success" fontSize="small" />
            ) : (
              <PlayCircleOutlineIcon fontSize="small" sx={{ color: isCompleted ? 'success.main' : 'action.active' }} />
            )}
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'primary.main' : isCompleted ? 'text.secondary' : 'text.primary',
                  pr: 3, // Make room for the bookmark icon
                  textDecoration: isCompleted ? 'none' : 'none',
                }}
              >
                {lesson.title}
              </Typography>
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
  // Check if this module contains the current lesson to auto-expand it
  const containsCurrentLesson = module.lessons.some(lesson => lesson.id === currentLessonId);
  const [open, setOpen] = React.useState(containsCurrentLesson);
  
  const handleToggle = () => {
    setOpen(!open);
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
            <Typography 
              variant="subtitle2" 
              fontWeight={600} 
              sx={{ color: 'text.primary' }}
            >
              {module.title}
            </Typography>
          }
        />
        <IconButton edge="end" onClick={handleToggle} size="small">
          {open ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
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
  if (!course) return null;
  
  return (
    <Box 
      sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: 'background.paper'
      }}
    >
      <Typography 
        variant="subtitle1" 
        fontWeight={700} 
        color="primary.main" 
        gutterBottom
        noWrap
      >
        {course.title}
      </Typography>
      
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
