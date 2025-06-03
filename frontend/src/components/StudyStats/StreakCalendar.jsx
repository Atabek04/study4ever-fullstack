import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Whatshot,
  TrendingUp,
  CalendarToday,
  Timeline,
  EmojiEvents,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Professional StreakCalendar component for displaying streak history
 * Features: Modern UI/UX, streak visualization, statistics, responsive design
 * @param {Object} props - Component props
 * @param {Array} props.streakHistory - Array of streak history entries
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @returns {JSX.Element} StreakCalendar component
 */
const StreakCalendar = ({ streakHistory = [], loading = false, error = null }) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigation handlers
  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  // Generate calendar data with proper week layout
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Create streak map for quick lookup
    const streakMap = new Map();
    streakHistory.forEach(entry => {
      const dateKey = format(new Date(entry.date), 'yyyy-MM-dd');
      streakMap.set(dateKey, entry);
    });

    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const streakData = streakMap.get(dateKey);
      
      return {
        date: day,
        dateKey,
        streakLength: streakData?.streakLength || 0,
        hasStreak: streakData?.streakLength > 0,
        isToday: isToday(day),
        isCurrentMonth: isSameMonth(day, currentDate),
      };
    });
  }, [currentDate, streakHistory]);

  // Calculate comprehensive statistics
  const monthStats = useMemo(() => {
    const currentMonthData = calendarData.filter(day => day.isCurrentMonth);
    const streakDays = currentMonthData.filter(day => day.hasStreak).length;
    const totalDays = currentMonthData.length;
    const longestStreak = Math.max(...currentMonthData.map(day => day.streakLength), 0);
    const totalStreakValue = currentMonthData.reduce((sum, day) => sum + day.streakLength, 0);
    const averageStreak = streakDays > 0 ? totalStreakValue / streakDays : 0;

    return {
      streakDays,
      totalDays,
      consistency: Math.round((streakDays / totalDays) * 100),
      longestStreak,
      averageStreak: Math.round(averageStreak * 10) / 10,
      totalStreakValue,
    };
  }, [calendarData]);

  // Enhanced streak intensity and color system
  const getStreakIntensity = (streakLength) => {
    if (streakLength === 0) return { 
      level: 0, 
      color: alpha(theme.palette.grey[300], 0.3), 
      intensity: 'None',
      emoji: '⚪'
    };
    if (streakLength <= 3) return { 
      level: 1, 
      color: alpha(theme.palette.success.light, 0.4), 
      intensity: 'Getting Started',
      emoji: '🌱'
    };
    if (streakLength <= 7) return { 
      level: 2, 
      color: alpha(theme.palette.warning.light, 0.6), 
      intensity: 'Building Momentum',
      emoji: '🔥'
    };
    if (streakLength <= 14) return { 
      level: 3, 
      color: alpha(theme.palette.warning.main, 0.8), 
      intensity: 'On Fire',
      emoji: '🚀'
    };
    if (streakLength <= 30) return { 
      level: 4, 
      color: alpha(theme.palette.warning.dark, 0.9), 
      intensity: 'Unstoppable',
      emoji: '⭐'
    };
    return { 
      level: 5, 
      color: theme.palette.error.main, 
      intensity: 'Legendary',
      emoji: '👑'
    };
  };

  // Generate weeks for grid layout
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < calendarData.length; i += 7) {
      result.push(calendarData.slice(i, i + 7));
    }
    return result;
  }, [calendarData]);

  // Get achievement badge based on stats
  const getAchievementBadge = () => {
    if (monthStats.consistency >= 90) return { color: 'error', text: 'Perfect!', icon: '👑' };
    if (monthStats.consistency >= 70) return { color: 'warning', text: 'Excellent!', icon: '⭐' };
    if (monthStats.consistency >= 50) return { color: 'success', text: 'Good!', icon: '🔥' };
    if (monthStats.consistency >= 30) return { color: 'info', text: 'Getting There!', icon: '🌱' };
    return { color: 'default', text: 'Keep Going!', icon: '💪' };
  };

  // Professional loading state - optimized for space efficiency
  if (loading) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 1.5, sm: 2.5, md: 3 }, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box>
              <Skeleton variant="text" width={180} height={32} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={100} height={20} sx={{ borderRadius: 1 }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
        
        {/* Layout for Calendar and Stats */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 } }}>
          {/* Calendar Skeleton */}
          <Box sx={{ width: { xs: '100%', md: '60%' } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
              {[...Array(7)].map((_, index) => (
                <Skeleton key={index} variant="text" width="100%" height={20} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: 0.5, sm: 1 } }}>
              {[...Array(35)].map((_, index) => (
                <Skeleton 
                  key={index} 
                  variant="rectangular" 
                  width="100%" 
                  height={{ xs: 30, sm: 36 }} 
                  sx={{ borderRadius: 1, aspectRatio: '1' }} 
                />
              ))}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="text" width={120} height={24} sx={{ borderRadius: 1, mb: 1 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
                {[...Array(6)].map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Skeleton variant="rectangular" width={14} height={14} sx={{ borderRadius: 0.5 }} />
                    <Skeleton variant="text" width={50} height={16} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          
          {/* Stats Cards Skeleton */}
          <Box sx={{ 
            width: { xs: '100%', md: '40%' }, 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)', 
              sm: 'repeat(4, 1fr)',
              md: '1fr' 
            }, 
            gap: { xs: 1.5, sm: 2 }
          }}>
            {[...Array(4)].map((_, index) => (
              <Card key={index} sx={{ borderRadius: 2, overflow: 'hidden', height: { xs: '90px', md: '80px' } }}>
                <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, md: 1 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                    <Skeleton variant="circular" width={16} height={16} sx={{ mr: 1 }} />
                    <Skeleton variant="text" width={40} height={32} />
                  </Box>
                  <Skeleton variant="text" width={60} height={16} sx={{ mx: 'auto' }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Paper>
    );
  }

  // Enhanced error state - more compact
  if (error) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.03)} 0%, ${alpha(theme.palette.error.light, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`
        }}
      >
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            backgroundColor: 'transparent',
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            '& .MuiAlert-icon': { 
              fontSize: { xs: 24, sm: 28 },
              color: theme.palette.error.main
            },
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="subtitle1" gutterBottom fontWeight="600" color="error.main">
            Unable to Load Streak History
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, color: 'text.secondary' }}>
            {error || 'Something went wrong while loading your streak data. Please try again.'}
          </Typography>
        </Alert>
      </Paper>
    );
  }  const achievement = getAchievementBadge();

  return (
    <Paper 
      sx={{ 
        p: { xs: 1.5, sm: 2.5, md: 3 }, 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 6px 24px ${alpha(theme.palette.common.black, 0.06)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.warning.main})`,
        }
      }}
    >
      {/* Header Section - More compact */}
      <Fade in timeout={600}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box 
              sx={{ 
                p: 1.25, 
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.light, 0.1)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Whatshot sx={{ color: 'warning.main', fontSize: { xs: 24, sm: 28 } }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                fontWeight="700" 
                color="text.primary"
                sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  lineHeight: 1.2,
                  background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Streak Calendar
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight="500"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                {format(currentDate, 'MMMM yyyy')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 0.5,
                bgcolor: alpha(theme.palette.background.default, 0.7), 
                borderRadius: 1.5, 
                p: 0.3,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
              }}
            >
              <Tooltip title="Previous Month" arrow>
                <IconButton 
                  onClick={handlePrevMonth} 
                  size="small"
                  sx={{ 
                    borderRadius: 1.5,
                    p: { xs: 0.5, sm: 0.7 },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main'
                    } 
                  }}
                >
                  <ChevronLeft fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Next Month" arrow>
                <IconButton 
                  onClick={handleNextMonth} 
                  size="small"
                  sx={{ 
                    borderRadius: 1.5,
                    p: { xs: 0.5, sm: 0.7 },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main'
                    } 
                  }}
                >
                  <ChevronRight fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Fade>      {/* Main Content: Calendar on Left, Stats on Right - Optimized Layout */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 }, alignItems: { xs: 'stretch', md: 'flex-start' } }}>
        {/* Left Side: Calendar - Optimized for space efficiency */}
        <Box sx={{ width: { xs: '100%', md: '60%' }, display: 'flex', flexDirection: 'column' }}>
          <Fade in timeout={800}>
            <Box>
              {/* Weekday Headers - More compact */}
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: 0.5, 
                  mb: 1,
                  p: { xs: 1, sm: 1.5 },
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <Typography
                    key={day}
                    variant="subtitle2"
                    fontWeight="600"
                    textAlign="center"
                    color="text.primary"
                    sx={{ 
                      py: { xs: 0.25, sm: 0.5 },
                      fontSize: '0.7rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    {day}
                  </Typography>
                ))}
              </Box>

              {/* Calendar Grid - More compact with better sizing */}
              <Box 
                sx={{
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: { xs: 0.5, sm: 1 },
                  p: { xs: 1, sm: 1.5 },
                  bgcolor: alpha(theme.palette.background.paper, 0.3),
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                {weeks.flat().map((day, index) => {
                  const intensity = getStreakIntensity(day.streakLength);
                  return (
                    <Tooltip
                      key={day.dateKey}
                      title={
                        <Box sx={{ textAlign: 'center', p: 0.75 }}>
                          <Typography variant="subtitle2" fontWeight="600">
                            {format(day.date, 'MMM dd, yyyy')}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {day.hasStreak 
                              ? `${day.streakLength} day streak ${intensity.emoji}` 
                              : 'No streak'
                            }
                          </Typography>
                          {intensity.level > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {intensity.intensity}
                            </Typography>
                          )}
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <Box
                        sx={{
                          aspectRatio: '1',
                          minHeight: { xs: 28, sm: 32 },
                          maxHeight: { xs: 36, sm: 40 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 1.5,
                          backgroundColor: intensity.color,
                          border: day.isToday 
                            ? `2px solid ${theme.palette.primary.main}` 
                            : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          opacity: day.isCurrentMonth ? 1 : 0.4,
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: `0 4px 12px ${alpha(intensity.color === 'transparent' ? theme.palette.grey[400] : intensity.color, 0.3)}`,
                            zIndex: 2,
                          },
                          '&::before': day.isToday ? {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
                            borderRadius: 'inherit',
                          } : {},
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={day.isToday ? "700" : day.hasStreak ? "600" : "500"}
                          color={
                            day.isToday 
                              ? "primary.main"
                              : intensity.level > 2 
                                ? "common.white" 
                                : "text.primary"
                          }
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            zIndex: 1,
                            position: 'relative'
                          }}
                        >
                          {format(day.date, 'd')}
                        </Typography>
                        {day.hasStreak && intensity.level > 0 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 1,
                              right: 1,
                              fontSize: '0.5rem',
                              opacity: 0.8,
                            }}
                          >
                            {intensity.emoji}
                          </Box>
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>

              {/* Enhanced Legend - Compact version */}
              <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="body2" fontWeight="600" gutterBottom color="text.primary" textAlign="left">
                  Streak Intensity Legend
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 1, mt: 0.5 }}>
                  {[
                    { level: 0, label: 'No streak', color: alpha(theme.palette.grey[300], 0.3), emoji: '⚪' },
                    { level: 1, label: '1-3 days', color: alpha(theme.palette.success.light, 0.4), emoji: '🌱' },
                    { level: 2, label: '4-7 days', color: alpha(theme.palette.warning.light, 0.6), emoji: '🔥' },
                    { level: 3, label: '8-14 days', color: alpha(theme.palette.warning.main, 0.8), emoji: '🚀' },
                    { level: 4, label: '15-30 days', color: alpha(theme.palette.warning.dark, 0.9), emoji: '⭐' },
                    { level: 5, label: '30+ days', color: theme.palette.error.main, emoji: '👑' },
                  ].map((item) => (
                    <Box key={item.level} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box 
                        sx={{ 
                          width: 14, 
                          height: 14, 
                          bgcolor: item.color,
                          borderRadius: 0.5,
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.5rem'
                        }} 
                      >
                        {item.emoji}
                      </Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="500" noWrap>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Fade>
        </Box>

        {/* Right Side: Streak Stats Cards - Responsive Grid Layout */}
        <Box sx={{ 
          width: { xs: '100%', md: '40%' }, 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', 
            sm: 'repeat(4, 1fr)',
            md: '1fr' 
          }, 
          gap: { xs: 1.5, sm: 2 },
          height: 'fit-content'
        }}>
          {/* Streak Days Card */}
          <Zoom in timeout={400}>
            <Card sx={{ 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              height: { xs: '100px', md: '90px' },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
              }
            }}>
              <CardContent sx={{ 
                display: 'flex',
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: { xs: 1.5, md: 1 }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <CalendarToday sx={{ color: 'primary.main', mr: 1, fontSize: 16 }} />
                  <Typography variant="h4" fontWeight="800" color="primary.main">
                    {monthStats.streakDays}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  Streak Days
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
          
          {/* Consistency Card */}
          <Zoom in timeout={500}>
            <Card sx={{ 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              height: { xs: '100px', md: '90px' },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.25)}`,
              }
            }}>
              <CardContent sx={{ 
                display: 'flex',
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: { xs: 1.5, md: 1 }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <Timeline sx={{ color: 'success.main', mr: 1, fontSize: 16 }} />
                  <Typography variant="h4" fontWeight="800" color="success.main">
                    {monthStats.consistency}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  {achievement.text}
                </Typography>
              </CardContent>
            </Card>
          </Zoom>

          {/* Longest Streak Card */}
          <Zoom in timeout={600}>
            <Card sx={{ 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              height: { xs: '100px', md: '90px' },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.warning.main, 0.25)}`,
              }
            }}>
              <CardContent sx={{ 
                display: 'flex',
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: { xs: 1.5, md: 1 }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <TrendingUp sx={{ color: 'warning.main', mr: 1, fontSize: 16 }} />
                  <Typography variant="h4" fontWeight="800" color="warning.main">
                    {monthStats.longestStreak}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  Longest Streak
                </Typography>
              </CardContent>
            </Card>
          </Zoom>

          {/* Average Streak Card */}
          <Zoom in timeout={700}>
            <Card sx={{ 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              height: { xs: '100px', md: '90px' },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.25)}`,
              }
            }}>
              <CardContent sx={{ 
                display: 'flex',
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: { xs: 1.5, md: 1 }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <EmojiEvents sx={{ color: 'secondary.main', mr: 1, fontSize: 16 }} />
                  <Typography variant="h4" fontWeight="800" color="secondary.main">
                    {monthStats.averageStreak}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  Avg. Streak
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Box>
      </Box>
    </Paper>
  );
};

export default StreakCalendar;
