import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography, Card, CardContent, Skeleton } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * StudyChart component for displaying study statistics as bar charts
 * @param {Object} props - Component props
 * @param {Object} props.data - Chart data in Chart.js format
 * @param {Object} props.options - Chart options in Chart.js format
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height (default: 400)
 * @returns {JSX.Element} StudyChart component
 */
const StudyChart = ({ 
  data, 
  options, 
  loading = false, 
  error = null, 
  title = 'Study Statistics',
  height = 400 
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="rounded" width={80} height={24} />
          </Box>
          <Box sx={{ height: height, display: 'flex', flexDirection: 'column' }}>
            {/* Simulate chart bars */}
            <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-around', height: '80%', mb: 2 }}>
              {[...Array(7)].map((_, index) => (
                <Skeleton 
                  key={index}
                  variant="rounded" 
                  width={30} 
                  height={Math.random() * 100 + 50} 
                  sx={{ mx: 0.5 }}
                />
              ))}
            </Box>
            {/* Simulate x-axis labels */}
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              {[...Array(7)].map((_, index) => (
                <Skeleton key={index} variant="text" width={30} height={16} />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: height + 100 }}>
        <CardContent sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%'
        }}>
          <Typography variant="h6" gutterBottom color="error">
            Error Loading Chart
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const hasData = data && data.labels && data.labels.length > 0 && 
                  data.datasets && data.datasets.length > 0 && 
                  data.datasets[0].data && data.datasets[0].data.length > 0;

  if (!hasData) {
    return (
      <Card sx={{ height: height + 100 }}>
        <CardContent sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center'
        }}>
          <TrendingUp sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="text.secondary">
            No Data for This Period
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
            No study sessions were recorded during this time frame. 
            Start learning to see your progress here!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ height: height }}>
          <Bar data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudyChart;
