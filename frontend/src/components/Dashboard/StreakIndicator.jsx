import React from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useUserStreak } from '../../hooks/streakHooks';

/**
 * StreakIndicator component for displaying current study streak in header
 * Shows fire icon with streak number
 */
const StreakIndicator = () => {
  const { streak, loading, error } = useUserStreak();

  // Don't show anything if loading or error
  if (loading || error || !streak) {
    return null;
  }

  const currentStreak = streak.currentStreakDays || 0;
  const longestStreak = streak.longestStreakDays || 0;

  // Color scheme based on streak length
  const getStreakColor = (days) => {
    if (days === 0) return '#9e9e9e'; // Gray for no streak
    if (days < 3) return '#ff9800'; // Orange for short streak
    if (days < 7) return '#ff5722'; // Red-orange for medium streak
    if (days < 14) return '#f44336'; // Red for good streak
    if (days < 30) return '#e91e63'; // Pink for great streak
    return '#9c27b0'; // Purple for legendary streak
  };

  const streakColor = getStreakColor(currentStreak);

  const tooltipText = currentStreak === 0 
    ? 'Start studying to begin your streak!' 
    : `🔥 ${currentStreak} day streak! Your longest: ${longestStreak} days`;

  return (
    <Tooltip title={tooltipText} arrow>
      <IconButton
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <LocalFireDepartmentIcon 
          sx={{ 
            color: streakColor,
            fontSize: 28,
            filter: currentStreak > 0 ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none',
            animation: currentStreak > 0 ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(1)',
              },
              '50%': {
                transform: 'scale(1.1)',
              },
              '100%': {
                transform: 'scale(1)',
              },
            },
          }} 
        />
        <Typography
          variant="h6"
          sx={{
            color: 'inherit',
            fontWeight: 700,
            fontSize: '1.1rem',
            textShadow: currentStreak > 0 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {currentStreak}
        </Typography>
      </IconButton>
    </Tooltip>
  );
};

export default StreakIndicator;
