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

  const hasData = data && data.labels && data.labels.length > 0 && 
                  data.datasets && data.datasets.length > 0 && 
                  data.datasets[0].data && data.datasets[0].data.length > 0;

  console.log('StudyChart: Checking data availability for', title, {
    hasLabels: data?.labels?.length > 0,
    hasDatasets: data?.datasets?.length > 0,
    hasChartData: data?.datasets?.[0]?.data?.length > 0,
    finalHasData: hasData
  });

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
