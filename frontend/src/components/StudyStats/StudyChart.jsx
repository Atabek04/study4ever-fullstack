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
      <Card sx={{ height: height + 100 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Skeleton 
            variant="rectangular" 
            height={height - 50} 
            sx={{ borderRadius: 1 }}
          />
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

  const hasData = data?.labels?.length > 0 && data?.datasets?.[0]?.data?.length > 0;

  if (!hasData) {
    return (
      <Card sx={{ height: height + 100 }}>
        <CardContent sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%'
        }}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No study data available for this time period.
            <br />
            Start studying to see your progress here!
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
