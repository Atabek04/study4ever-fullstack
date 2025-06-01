import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  AccessTime,
  PlayCircleOutline,
  TrendingUp,
  CalendarToday,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import { formatDuration, formatPercentageChange } from '../../utils/chartUtils';

/**
 * StatCard component for displaying individual statistics
 * @param {Object} props - Component props
 * @param {string} props.title - Stat title
 * @param {string|number} props.value - Stat value
 * @param {JSX.Element} props.icon - Icon component
 * @param {string} props.color - Color theme
 * @param {boolean} props.loading - Loading state
 * @param {number} props.percentageChange - Percentage change value
 * @returns {JSX.Element} StatCard component
 */
const StatCard = ({ title, value, icon, color = 'primary', loading = false, percentageChange }) => {
  if (loading) {
    return (
      <Card sx={{ height: 140, minHeight: 140 }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
          <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={16} sx={{ mt: 'auto' }} />
        </CardContent>
      </Card>
    );
  }

  const percentageData = formatPercentageChange(percentageChange);
  
  const getPercentageIcon = () => {
    switch (percentageData.icon) {
      case 'trending_up': return <TrendingUp sx={{ fontSize: 16 }} />;
      case 'trending_down': return <TrendingDown sx={{ fontSize: 16 }} />;
      default: return <TrendingFlat sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <Card sx={{ 
      height: 140,
      minHeight: 140,
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3,
      }
    }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {percentageChange !== undefined && percentageChange !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
            <Box sx={{ color: percentageData.color, display: 'flex', alignItems: 'center' }}>
              {getPercentageIcon()}
              <Typography 
                variant="body2" 
                sx={{ ml: 0.5, fontWeight: 'medium', color: percentageData.color }}
              >
                {percentageData.display}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              vs previous period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * StudyStatsSummary component for displaying summary statistics
 * @param {Object} props - Component props
 * @param {Object} props.summaryStats - Summary statistics object
 * @param {boolean} props.loading - Loading state
 * @param {string} props.period - Time period for the stats
 * @returns {JSX.Element} StudyStatsSummary component
 */
const StudyStatsSummary = ({ 
  summaryStats = {}, 
  loading = false, 
  period = 'Last 30 Days' 
}) => {
  const {
    totalHours = 0,
    totalSessions = 0,
    averageSessionLength = 0,
    averageDaily = 0,
    percentageChange = 0,
  } = summaryStats;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Study Summary
          </Typography>
          <Chip 
            label={loading ? 'Loading...' : period} 
            color="primary" 
            variant="outlined"
            size="small"
          />
        </Box>
        
        {/* Use flexbox instead of Grid for consistent sizing */}
        <Box 
          sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            minHeight: 140,
            '& > *': {
              flex: {
                xs: '1 1 100%',
                sm: '1 1 calc(50% - 12px)',
                md: '1 1 calc(25% - 18px)'
              },
              minWidth: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(25% - 18px)'
              }
            }
          }}
        >
          <StatCard
            title="Total Study Time"
            value={loading ? '...' : `${totalHours}h`}
            icon={<AccessTime />}
            color="primary"
            loading={loading}
            percentageChange={percentageChange}
          />
          
          <StatCard
            title="Study Sessions"
            value={loading ? '...' : totalSessions}
            icon={<PlayCircleOutline />}
            color="secondary"
            loading={loading}
          />
          
          <StatCard
            title="Avg. Session Length"
            value={loading ? '...' : formatDuration(averageSessionLength)}
            icon={<TrendingUp />}
            color="success"
            loading={loading}
          />
          
          <StatCard
            title="Daily Average"
            value={loading ? '...' : formatDuration(averageDaily)}
            icon={<CalendarToday />}
            color="warning"
            loading={loading}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudyStatsSummary;
