import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Alert,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { EmojiEvents, Refresh, TrendingUp } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useLeaderboard, useUserRank } from '../../hooks/leaderboardHooks';
import LeaderboardList from './LeaderboardList';
import { getCurrentWeekStart, getCurrentMonthStart, getCurrentYearStart } from '../../utils/leaderboardUtils';

const LeaderboardDashboard = () => {
  const { user } = useAuth();
  const [activePeriod, setActivePeriod] = useState('weekly');
  const [limit, setLimit] = useState(10);
  
  // Hooks for different periods
  const dailyLeaderboard = useLeaderboard('daily', limit);
  const weeklyLeaderboard = useLeaderboard('weekly', limit);
  const monthlyLeaderboard = useLeaderboard('monthly', limit);
  const yearlyLeaderboard = useLeaderboard('yearly', limit);
  
  const { userRank, fetchUserRank } = useUserRank();

  // Get current leaderboard based on active period
  const getCurrentLeaderboard = () => {
    switch (activePeriod) {
      case 'daily':
        return dailyLeaderboard;
      case 'weekly':
        return weeklyLeaderboard;
      case 'monthly':
        return monthlyLeaderboard;
      case 'yearly':
        return yearlyLeaderboard;
      default:
        return weeklyLeaderboard;
    }
  };

  const currentLeaderboard = getCurrentLeaderboard();

  // Tab configuration
  const tabs = [
    { id: 'daily', label: 'Today', icon: '📅' },
    { id: 'weekly', label: 'This Week', icon: '📊' },
    { id: 'monthly', label: 'This Month', icon: '📈' },
    { id: 'yearly', label: 'This Year', icon: '🏆' }
  ];

  // Fetch user rank when period changes
  useEffect(() => {
    if (user?.userId && activePeriod) {
      let startDate, endDate;
      const today = new Date().toISOString().split('T')[0];
      
      switch (activePeriod) {
        case 'daily':
          startDate = endDate = today;
          break;
        case 'weekly':
          startDate = getCurrentWeekStart();
          endDate = today;
          break;
        case 'monthly':
          startDate = getCurrentMonthStart();
          endDate = today;
          break;
        case 'yearly':
          startDate = getCurrentYearStart();
          endDate = today;
          break;
        default:
          startDate = getCurrentWeekStart();
          endDate = today;
      }
      
      fetchUserRank(activePeriod.toUpperCase(), startDate, endDate);
    }
  }, [activePeriod, user?.userId, fetchUserRank]);

  const handleTabChange = (event, newValue) => {
    const periodId = tabs[newValue].id;
    setActivePeriod(periodId);
  };

  const handleRefresh = () => {
    currentLeaderboard.refetch();
  };

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  // Check if we have any leaderboard data
  const hasData = currentLeaderboard.leaderboard && currentLeaderboard.leaderboard.length > 0;

  if (!user) {
    return (
      <Box sx={{ width: '100%', py: 4, display: 'flex', justifyContent: 'center' }}>
        <Alert severity="warning" sx={{ maxWidth: 600 }}>
          Please log in to view the leaderboard.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <EmojiEvents sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Study Leaderboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={currentLeaderboard.loading}
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        See how you rank against other students and track your study progress
      </Typography>

      {/* Error Alert */}
      {currentLeaderboard.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {currentLeaderboard.error}
        </Alert>
      )}

      {/* No Data State */}
      {!currentLeaderboard.loading && !currentLeaderboard.error && !hasData && (
        <Paper sx={{ p: 6, textAlign: 'center', mb: 3 }}>
          <EmojiEvents sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No Leaderboard Data Available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            The leaderboard will appear here once students start studying. Be the first to begin your learning journey and claim the top spot!
          </Typography>
          <Button variant="contained" color="primary" sx={{ mr: 1 }}>
            Start Learning
          </Button>
          <Button variant="outlined" onClick={handleRefresh}>
            Refresh Data
          </Button>
        </Paper>
      )}

      {/* Content - only show if we have data or are loading */}
      {(hasData || currentLeaderboard.loading) && (
        <>
          {/* Period Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabs.findIndex(tab => tab.id === activePeriod)}
                onChange={handleTabChange}
                aria-label="leaderboard time periods"
                variant="scrollable"
                scrollButtons="auto"
              >
                {tabs.map((tab, index) => (
                  <Tab 
                    key={tab.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </Box>
                    }
                    id={`leaderboard-tab-${index}`}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Controls and User Rank */}
            <Box sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
              {/* Show Top Control */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Show Top</InputLabel>
                <Select
                  value={limit}
                  label="Show Top"
                  onChange={handleLimitChange}
                >
                  <MenuItem value={5}>5 students</MenuItem>
                  <MenuItem value={10}>10 students</MenuItem>
                  <MenuItem value={25}>25 students</MenuItem>
                  <MenuItem value={50}>50 students</MenuItem>
                </Select>
              </FormControl>

              {/* User's Current Rank */}
              {userRank && (
                <Card sx={{ bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="primary.600">
                      Your Current Rank
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.800">
                      #{userRank.rank} - {userRank.totalStudyMinutes}min studied
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>

            {/* Leaderboard List */}
            <LeaderboardList
              leaderboard={currentLeaderboard.leaderboard}
              loading={currentLeaderboard.loading}
              error={currentLeaderboard.error}
              currentUserId={user?.userId}
              onRefresh={handleRefresh}
              periodType={activePeriod}
              showProgress={true}
            />
          </Paper>

          {/* Additional Information */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Ranking Criteria
                  </Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Total study time (primary factor)"
                      secondary="The total minutes you've spent studying"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Number of completed sessions"
                      secondary="How many study sessions you've finished"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Consistency and streaks"
                      secondary="Regular daily study habits"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Session quality and completion rate"
                      secondary="How effectively you complete your studies"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEvents sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Achievement Levels
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="🔰 Starter" size="small" color="default" />
                    <Typography variant="body2" color="text.secondary">0-49 minutes</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="🌱 Beginner" size="small" color="success" />
                    <Typography variant="body2" color="text.secondary">50-199 minutes</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="📚 Intermediate" size="small" color="info" />
                    <Typography variant="body2" color="text.secondary">200-499 minutes</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="⭐ Advanced" size="small" color="warning" />
                    <Typography variant="body2" color="text.secondary">500-999 minutes</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="🎓 Expert" size="small" color="secondary" />
                    <Typography variant="body2" color="text.secondary">1000+ minutes</Typography>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>💡 Tip:</strong> Rankings are updated in real-time as you complete study sessions. 
                    Maintain consistent daily study habits to climb the leaderboard!
                  </Typography>
                </Alert>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default LeaderboardDashboard;
