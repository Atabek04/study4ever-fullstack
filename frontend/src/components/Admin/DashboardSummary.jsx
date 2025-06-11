import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import { useUserSummary } from '../../hooks/userManagementHooks';

/**
 * Dashboard summary cards showing user statistics
 */
const DashboardSummary = () => {
  const { summary, loading, error } = useUserSummary();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Failed to load dashboard summary: {error}
      </Alert>
    );
  }

  const summaryCards = [
    {
      title: 'Total Students',
      value: summary?.totalStudents || 0,
      icon: <SchoolIcon />,
      color: '#2196F3', // Blue
      bgColor: '#E3F2FD'
    },
    {
      title: 'Total Instructors',
      value: summary?.totalInstructors || 0,
      icon: <PersonIcon />,
      color: '#FF9800', // Orange
      bgColor: '#FFF3E0'
    },
    {
      title: 'Total Users',
      value: summary?.totalUsers || 0,
      icon: <PeopleIcon />,
      color: '#4CAF50', // Green
      bgColor: '#E8F5E8'
    },
    {
      title: 'Active Users',
      value: summary?.activeUsers || 0,
      icon: <ActiveIcon />,
      color: '#4CAF50', // Green
      bgColor: '#E8F5E8'
    },
    {
      title: 'Inactive Users',
      value: summary?.inactiveUsers || 0,
      icon: <InactiveIcon />,
      color: '#F44336', // Red
      bgColor: '#FFEBEE'
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${card.bgColor} 0%, ${card.bgColor}CC 100%)`,
                border: `1px solid ${card.color}20`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${card.color}30`
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: card.color,
                      width: 48,
                      height: 48,
                      mr: 2
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        color: card.color,
                        lineHeight: 1
                      }}
                    >
                      {card.value.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardSummary;
