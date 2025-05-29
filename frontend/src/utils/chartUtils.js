import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Format duration from minutes to human readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
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
 * Format duration from minutes to decimal hours
 * @param {number} minutes - Duration in minutes
 * @returns {number} Duration in decimal hours
 */
export const formatDurationToHours = (minutes) => {
  return minutes ? Math.round((minutes / 60) * 100) / 100 : 0;
};

/**
 * Convert daily stats data to chart format
 * @param {Array} dailyStats - Array of daily statistics
 * @returns {Object} Chart.js compatible data object
 */
export const formatDailyStatsForChart = (dailyStats) => {
  if (!dailyStats || dailyStats.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Study Time (hours)',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }]
    };
  }

  const sortedStats = [...dailyStats].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return {
    labels: sortedStats.map(stat => format(parseISO(stat.date), 'MMM dd')),
    datasets: [{
      label: 'Study Time (hours)',
      data: sortedStats.map(stat => formatDurationToHours(stat.totalStudyMinutes)),
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };
};

/**
 * Convert weekly stats data to chart format
 * @param {Array} weeklyStats - Array of weekly statistics
 * @returns {Object} Chart.js compatible data object
 */
export const formatWeeklyStatsForChart = (weeklyStats) => {
  if (!weeklyStats || weeklyStats.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Study Time (hours)',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }]
    };
  }

  const sortedStats = [...weeklyStats].sort((a, b) => a.year - b.year || a.week - b.week);
  
  return {
    labels: sortedStats.map(stat => `Week ${stat.week}, ${stat.year}`),
    datasets: [{
      label: 'Study Time (hours)',
      data: sortedStats.map(stat => formatDurationToHours(stat.totalStudyMinutes)),
      backgroundColor: 'rgba(75, 192, 192, 0.8)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };
};

/**
 * Convert monthly stats data to chart format
 * @param {Array} monthlyStats - Array of monthly statistics
 * @returns {Object} Chart.js compatible data object
 */
export const formatMonthlyStatsForChart = (monthlyStats) => {
  if (!monthlyStats || monthlyStats.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Study Time (hours)',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }]
    };
  }

  const sortedStats = [...monthlyStats].sort((a, b) => a.year - b.year || a.month - b.month);
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return {
    labels: sortedStats.map(stat => `${monthNames[stat.month - 1]} ${stat.year}`),
    datasets: [{
      label: 'Study Time (hours)',
      data: sortedStats.map(stat => formatDurationToHours(stat.totalStudyMinutes)),
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };
};

/**
 * Convert yearly stats data to chart format
 * @param {Array} yearlyStats - Array of yearly statistics
 * @returns {Object} Chart.js compatible data object
 */
export const formatYearlyStatsForChart = (yearlyStats) => {
  if (!yearlyStats || yearlyStats.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Study Time (hours)',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.8)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }]
    };
  }

  const sortedStats = [...yearlyStats].sort((a, b) => a.year - b.year);
  
  return {
    labels: sortedStats.map(stat => stat.year.toString()),
    datasets: [{
      label: 'Study Time (hours)',
      data: sortedStats.map(stat => formatDurationToHours(stat.totalStudyMinutes)),
      backgroundColor: 'rgba(153, 102, 255, 0.8)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };
};

/**
 * Get default chart options for study statistics
 * @param {string} title - Chart title
 * @returns {Object} Chart.js options object
 */
export const getDefaultChartOptions = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 16,
        weight: 'bold',
      },
      padding: {
        bottom: 20,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const hours = context.raw;
          const minutes = Math.round(hours * 60);
          return `${context.dataset.label}: ${formatDuration(minutes)}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Study Time (hours)',
        font: {
          size: 12,
          weight: 'bold',
        },
      },
      ticks: {
        callback: function(value) {
          return value + 'h';
        }
      }
    },
    x: {
      title: {
        display: true,
        text: 'Time Period',
        font: {
          size: 12,
          weight: 'bold',
        },
      },
    }
  },
  elements: {
    bar: {
      borderWidth: 2,
    }
  }
});

/**
 * Calculate summary statistics from stats data
 * @param {Array} statsData - Array of statistics data
 * @returns {Object} Summary statistics
 */
export const calculateSummaryStats = (statsData) => {
  if (!statsData || statsData.length === 0) {
    return {
      totalHours: 0,
      totalSessions: 0,
      averageSessionLength: 0,
      averageDaily: 0,
    };
  }

  const totalMinutes = statsData.reduce((sum, stat) => sum + (stat.totalStudyMinutes || 0), 0);
  const totalSessions = statsData.reduce((sum, stat) => sum + (stat.sessionCount || 0), 0);
  
  return {
    totalHours: formatDurationToHours(totalMinutes),
    totalSessions,
    averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
    averageDaily: statsData.length > 0 ? Math.round(totalMinutes / statsData.length) : 0,
  };
};
