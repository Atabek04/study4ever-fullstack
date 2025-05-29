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
} from '@mui/icons-material';
import { formatDuration } from '../../utils/chartUtils';

/**
 * StatCard component for displaying individual statistics
 * @param {Object} props - Component props
 * @param {string} props.title - Stat title
 * @param {string|number} props.value - Stat value
 * @param {JSX.Element} props.icon - Icon component
 * @param {string} props.color - Color theme
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} StatCard component
 */
const StatCard = ({ title, value, icon, color = 'primary', loading = false }) => {
  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
          <Skeleton variant="text" width="80%" height={32} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      height: '100%',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3,
      }
    }}>
      <CardContent>
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
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          {value}
        </Typography>
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
  } = summaryStats;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Study Summary
          </Typography>
          <Chip 
            label={period} 
            color="primary" 
            variant="outlined"
            size="small"
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Study Time"
              value={loading ? '...' : `${totalHours}h`}
              icon={<AccessTime />}
              color="primary"
              loading={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Study Sessions"
              value={loading ? '...' : totalSessions}
              icon={<PlayCircleOutline />}
              color="secondary"
              loading={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg. Session Length"
              value={loading ? '...' : formatDuration(averageSessionLength)}
              icon={<TrendingUp />}
              color="success"
              loading={loading}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Daily Average"
              value={loading ? '...' : formatDuration(averageDaily)}
              icon={<CalendarToday />}
              color="warning"
              loading={loading}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StudyStatsSummary;
