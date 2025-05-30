// Utility functions for leaderboard data formatting and calculations

/**
 * Format duration from minutes to human readable format
 */
export const formatStudyDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

/**
 * Format rank with appropriate suffix (1st, 2nd, 3rd, etc.)
 */
export const formatRank = (rank) => {
  if (!rank) return '';
  
  const lastDigit = rank % 10;
  const lastTwoDigits = rank % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${rank}th`;
  }
  
  switch (lastDigit) {
    case 1:
      return `${rank}st`;
    case 2:
      return `${rank}nd`;
    case 3:
      return `${rank}rd`;
    default:
      return `${rank}th`;
  }
};

/**
 * Get medal emoji for top 3 positions
 */
export const getMedalEmoji = (rank) => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
};

/**
 * Get rank color class based on position
 */
export const getRankColorClass = (rank) => {
  if (rank === 1) return 'text-yellow-600 font-bold'; // Gold
  if (rank === 2) return 'text-gray-500 font-bold'; // Silver
  if (rank === 3) return 'text-orange-600 font-bold'; // Bronze
  if (rank <= 10) return 'text-blue-600 font-semibold'; // Top 10
  return 'text-gray-600'; // Others
};

/**
 * Get progress percentage for visual indicators
 */
export const getProgressPercentage = (currentMinutes, maxMinutes) => {
  if (!maxMinutes || maxMinutes === 0) return 0;
  return Math.min((currentMinutes / maxMinutes) * 100, 100);
};

/**
 * Calculate streak information
 */
export const calculateStreak = (entries) => {
  if (!entries || entries.length === 0) return 0;
  
  // Sort entries by date descending
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Format period display text
 */
export const formatPeriodDisplay = (periodType, date) => {
  const dateObj = new Date(date);
  
  switch (periodType) {
    case 'daily':
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'weekly':
      const weekEnd = new Date(dateObj);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    case 'monthly':
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    case 'yearly':
      return dateObj.getFullYear().toString();
    default:
      return date;
  }
};

/**
 * Get current week start date (Monday)
 */
export const getCurrentWeekStart = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return monday.toISOString().split('T')[0];
};

/**
 * Get current month start date
 */
export const getCurrentMonthStart = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
};

/**
 * Get current year start date
 */
export const getCurrentYearStart = () => {
  const today = new Date();
  return new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
};

/**
 * Format study time for charts
 */
export const formatChartDuration = (minutes) => {
  const hours = minutes / 60;
  if (hours < 1) {
    return `${minutes}m`;
  }
  return `${hours.toFixed(1)}h`;
};

/**
 * Get period type icon
 */
export const getPeriodTypeIcon = (periodType) => {
  switch (periodType) {
    case 'daily':
      return '📅';
    case 'weekly':
      return '📊';
    case 'monthly':
      return '📈';
    case 'yearly':
      return '🏆';
    default:
      return '📋';
  }
};

/**
 * Determine if user is in top performers
 */
export const isTopPerformer = (rank, totalParticipants) => {
  if (!rank || !totalParticipants) return false;
  
  const percentile = (rank / totalParticipants) * 100;
  return percentile <= 10; // Top 10%
};

/**
 * Get achievement level based on study minutes
 */
export const getAchievementLevel = (totalMinutes) => {
  if (totalMinutes >= 1000) return { level: 'Expert', color: 'text-purple-600', icon: '🎓' };
  if (totalMinutes >= 500) return { level: 'Advanced', color: 'text-blue-600', icon: '⭐' };
  if (totalMinutes >= 200) return { level: 'Intermediate', color: 'text-green-600', icon: '📚' };
  if (totalMinutes >= 50) return { level: 'Beginner', color: 'text-yellow-600', icon: '🌱' };
  return { level: 'Starter', color: 'text-gray-500', icon: '🔰' };
};
