import React, { useState, useContext } from 'react';
import {
  Box,
  Container,
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to view your study statistics.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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

      {/* Additional Information */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Study Insights
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Track your learning progress with detailed analytics. Monitor your study time,
              session patterns, and consistency across different time periods.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Tip:</strong> Consistent daily study sessions, even for short periods,
              often lead to better learning outcomes than occasional long sessions.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Goal Setting
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Use these analytics to set realistic study goals and track your progress
              towards achieving them.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              🎯 <strong>Suggestion:</strong> Aim for consistent daily study time rather
              than maximizing total hours. Quality and consistency matter more than quantity.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudyStatsDashboard;
