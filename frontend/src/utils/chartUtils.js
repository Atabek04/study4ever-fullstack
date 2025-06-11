import { format, parseISO } from 'date-fns';

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
    console.log('formatDailyStatsForChart: No data, returning empty chart structure');
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

  // Filter out any null/undefined stats and ensure they have required properties
  const validStats = dailyStats.filter(stat => 
    stat && 
    typeof stat.date !== 'undefined' && 
    typeof stat.durationMinutes !== 'undefined'
  );

  if (validStats.length === 0) {
    console.log('formatDailyStatsForChart: No valid stats, returning empty chart structure');
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

  const sortedStats = [...validStats].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const chartData = {
    labels: sortedStats.map(stat => format(parseISO(stat.date), 'MMM dd')),
    datasets: [{
      label: 'Study Time (hours)',
      data: sortedStats.map(stat => formatDurationToHours(stat.durationMinutes)),
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };
  
  return chartData;
};

/**
 * Convert weekly stats data to chart format
 * @param {Array} weeklyStats - Array of weekly statistics
 * @returns {Object} Chart.js compatible data object
 */
export const formatWeeklyStatsForChart = (weeklyStats) => {
  if (!weeklyStats || weeklyStats.length === 0) {
    console.log('formatWeeklyStatsForChart: No data, returning empty chart structure');
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

  // Filter out any null/undefined stats and ensure they have required properties
  const validStats = weeklyStats.filter(stat => 
    stat && 
    typeof stat.weekLabel !== 'undefined' && 
    typeof stat.totalDurationMinutes !== 'undefined'
  );

  if (validStats.length === 0) {
    console.log('formatWeeklyStatsForChart: No valid stats, returning empty chart structure');
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

  const sortedStats = [...validStats].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  const chartData = {
    labels: sortedStats.map(stat => stat.weekLabel),
    datasets: [{
      label: 'Study Time (hours)',
      data: sortedStats.map(stat => formatDurationToHours(stat.totalDurationMinutes)),
      backgroundColor: 'rgba(75, 192, 192, 0.8)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };
  
  return chartData;
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

  // Filter out any null/undefined stats and ensure they have required properties
  const validStats = monthlyStats.filter(stat => 
    stat && 
    typeof stat.year !== 'undefined' && 
    typeof stat.monthNumber !== 'undefined' && 
    typeof stat.durationMinutes !== 'undefined'
  );

  if (validStats.length === 0) {
    console.log('formatMonthlyStatsForChart: No valid stats, returning empty chart structure');
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

  const sortedStats = [...validStats].sort((a, b) => a.year - b.year || a.monthNumber - b.monthNumber);
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const chartData = {
    labels: sortedStats.map(stat => `${monthNames[stat.monthNumber - 1]} ${stat.year}`),
    datasets: [{
      label: 'Study Time (hours)',
      data: sortedStats.map(stat => formatDurationToHours(stat.durationMinutes)),
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };
  
  return chartData;
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

  // Filter out any null/undefined stats and ensure they have required properties
  const validStats = yearlyStats.filter(stat => 
    stat && 
    typeof stat.year !== 'undefined' && 
    typeof stat.totalDurationMinutes !== 'undefined'
  );

  if (validStats.length === 0) {
    console.log('formatYearlyStatsForChart: No valid stats, returning empty chart structure');
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

  const sortedStats = [...validStats].sort((a, b) => a.year - b.year);
  
  const chartData = {
    labels: sortedStats.map(stat => stat.year.toString()),
    datasets: [{
      label: 'Study Time (hours)',
      data: sortedStats.map(stat => formatDurationToHours(stat.totalDurationMinutes)),
      backgroundColor: 'rgba(153, 102, 255, 0.8)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };
  
  return chartData;
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
      percentageChange: 0,
    };
  }

  // Handle different data structures based on the type of stats
  const totalMinutes = statsData.reduce((sum, stat) => {
    // For daily stats: use durationMinutes
    // For weekly/yearly stats: use totalDurationMinutes  
    // For monthly stats (when fixed): use durationMinutes
    const minutes = stat.durationMinutes || stat.totalDurationMinutes || 0;
    return sum + minutes;
  }, 0);
  
  const totalSessions = statsData.reduce((sum, stat) => {
    // Handle different session count field names
    const sessions = stat.sessionCount || stat.totalSessionCount || 0;
    return sum + sessions;
  }, 0);
  
  // Calculate average percentage change from the latest available data
  const latestData = statsData[statsData.length - 1];
  const percentageChange = latestData?.percentageChange || 0;

  return {
    totalHours: formatDurationToHours(totalMinutes),
    totalSessions,
    averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
    averageDaily: statsData.length > 0 ? Math.round(totalMinutes / statsData.length) : 0,
    percentageChange: Math.round((percentageChange || 0) * 100) / 100, // Round to 2 decimal places
  };
};

/**
 * Format percentage change for display
 * @param {number} percentage - Percentage change value
 * @returns {Object} Formatted percentage with styling info
 */
export const formatPercentageChange = (percentage) => {
  if (percentage === null || percentage === undefined) {
    return {
      display: '0%',
      color: 'text.secondary',
      icon: null,
      isPositive: false,
      isNegative: false,
    };
  }
  
  const rounded = Math.round(percentage * 100) / 100;
  const isPositive = rounded > 0;
  const isNegative = rounded < 0;
  
  return {
    display: `${isPositive ? '+' : ''}${rounded}%`,
    color: isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.secondary',
    icon: isPositive ? 'trending_up' : isNegative ? 'trending_down' : 'trending_flat',
    isPositive,
    isNegative,
  };
};
