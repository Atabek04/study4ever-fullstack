import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import { Refresh, TrendingUp } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { useAllStats } from '../../hooks/studyStatsHooks';
import {
  formatDailyStatsForChart,
  formatWeeklyStatsForChart,
  formatMonthlyStatsForChart,
  formatYearlyStatsForChart,
  getDefaultChartOptions,
  calculateSummaryStats,
} from '../../utils/chartUtils';
import StudyChart from './StudyChart';
import StudyStatsSummary from './StudyStatsSummary';

/**
 * TabPanel component for displaying tab content
 */
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`study-stats-tabpanel-${index}`}
    aria-labelledby={`study-stats-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

/**
 * StudyStatsDashboard component for displaying comprehensive study analytics
 * @returns {JSX.Element} StudyStatsDashboard component
 */
const StudyStatsDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const { user } = useContext(AuthContext);
  
  console.log('StudyStatsDashboard: Rendering with user:', user);
  
  const {
    dailyData,
    weeklyData,
    monthlyData,
    yearlyData,
    loading,
    error,
    refetchAll
  } = useAllStats(user?.id);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleRefresh = () => {
    refetchAll();
  };

  // Prepare chart data and options
  const dailyChartData = formatDailyStatsForChart(dailyData);
  const weeklyChartData = formatWeeklyStatsForChart(weeklyData);
  const monthlyChartData = formatMonthlyStatsForChart(monthlyData);
  const yearlyChartData = formatYearlyStatsForChart(yearlyData);

  const chartOptions = {
    daily: getDefaultChartOptions('Daily Study Progress'),
    weekly: getDefaultChartOptions('Weekly Study Progress'),
    monthly: getDefaultChartOptions('Monthly Study Progress'),
    yearly: getDefaultChartOptions('Yearly Study Progress'),
  };

  // Calculate summary statistics based on current tab
  const getSummaryData = () => {
    switch (currentTab) {
      case 0: return { data: dailyData, period: 'Last 30 Days' };
      case 1: return { data: weeklyData, period: 'Last 12 Weeks' };
      case 2: return { data: monthlyData, period: 'Last 12 Months' };
      case 3: return { data: yearlyData, period: 'Last 5 Years' };
      default: return { data: dailyData, period: 'Last 30 Days' };
    }
  };

  const { data: currentData, period } = getSummaryData();
  const summaryStats = calculateSummaryStats(currentData);

  if (!user) {
    return (
      <Box sx={{ width: '100%', py: 4, display: 'flex', justifyContent: 'center' }}>
        <Alert severity="warning" sx={{ maxWidth: 600 }}>
          Please log in to view your study statistics.
        </Alert>
      </Box>
    );
  }

  // Check if we have any data at all
  const hasAnyData = (dailyData && dailyData.length > 0) || 
                     (weeklyData && weeklyData.length > 0) || 
                     (monthlyData && monthlyData.length > 0) || 
                     (yearlyData && yearlyData.length > 0);

  console.log('StudyStatsDashboard: Data state:', {
    loading,
    error,
    hasAnyData,
    dataCounts: {
      daily: dailyData?.length || 0,
      weekly: weeklyData?.length || 0,
      monthly: monthlyData?.length || 0,
      yearly: yearlyData?.length || 0
    }
  });

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <TrendingUp sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Study Analytics Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* No Data State */}
      {!loading && !error && !hasAnyData && (
        <Paper sx={{ p: 6, textAlign: 'center', mb: 3 }}>
          <TrendingUp sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No Study Data Available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
            We couldn't find any study sessions in our records. Your learning analytics will appear here once you start studying.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            To get started, navigate to your courses and begin a study session. Your progress, time spent, and achievements will be tracked automatically.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary">
              Browse Courses
            </Button>
            <Button variant="outlined" onClick={handleRefresh}>
              Refresh Data
            </Button>
          </Box>
        </Paper>
      )}

      {/* Content - only show if we have data or are loading */}
      {(hasAnyData || loading) && (
        <>
          {/* Summary Statistics */}
          <StudyStatsSummary
            summaryStats={summaryStats}
            loading={loading}
            period={period}
          />

          {/* Time Period Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                aria-label="study statistics time periods"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Daily (30 days)" id="study-stats-tab-0" />
                <Tab label="Weekly (12 weeks)" id="study-stats-tab-1" />
                <Tab label="Monthly (12 months)" id="study-stats-tab-2" />
                <Tab label="Yearly (5 years)" id="study-stats-tab-3" />
              </Tabs>
            </Box>

            {/* Daily Stats Tab */}
            <TabPanel value={currentTab} index={0}>
              <StudyChart
                data={dailyChartData}
                options={chartOptions.daily}
                loading={loading}
                error={error}
                title="Daily Study Progress"
                height={400}
              />
            </TabPanel>

            {/* Weekly Stats Tab */}
            <TabPanel value={currentTab} index={1}>
              <StudyChart
                data={weeklyChartData}
                options={chartOptions.weekly}
                loading={loading}
                error={error}
                title="Weekly Study Progress"
                height={400}
              />
            </TabPanel>

            {/* Monthly Stats Tab */}
            <TabPanel value={currentTab} index={2}>
              <StudyChart
                data={monthlyChartData}
                options={chartOptions.monthly}
                loading={loading}
                error={error}
                title="Monthly Study Progress"
                height={400}
              />
            </TabPanel>

            {/* Yearly Stats Tab */}
            <TabPanel value={currentTab} index={3}>
              <StudyChart
                data={yearlyChartData}
                options={chartOptions.yearly}
                loading={loading}
                error={error}
                title="Yearly Study Progress"
                height={400}
              />
            </TabPanel>
          </Paper>

          {/* Study Insights and Goal Setting - Aligned with Chart Width */}
          <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
            <Paper 
              sx={{ 
                p: 3, 
                flex: 1,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.main">
                📊 Study Insights
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                Track your learning progress with detailed analytics. Monitor your study time,
                session patterns, and consistency across different time periods.
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.50', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'primary.200',
                  mt: 'auto'
                }}
              >
                <Typography variant="body2" color="primary.dark" fontWeight="medium">
                  💡 <strong>Pro Tip:</strong> Consistent daily study sessions, even for short periods,
                  often lead to better learning outcomes than occasional long sessions.
                </Typography>
              </Box>
            </Paper>
            
            <Paper 
              sx={{ 
                p: 3, 
                flex: 1,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold" color="success.main">
                🎯 Goal Setting
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                Use these analytics to set realistic study goals and track your progress
                towards achieving them.
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'success.50', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'success.200',
                  mt: 'auto'
                }}
              >
                <Typography variant="body2" color="success.dark" fontWeight="medium">
                  🚀 <strong>Suggestion:</strong> Aim for consistent daily study time rather
                  than maximizing total hours. Quality and consistency matter more than quantity.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
};

export default StudyStatsDashboard;
