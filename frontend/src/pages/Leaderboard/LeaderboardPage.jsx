import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { LeaderboardDashboard } from '../../components/Leaderboard';

const LeaderboardPage = () => {
  return (
    <DashboardLayout>
      <LeaderboardDashboard />
    </DashboardLayout>
  );
};

export default LeaderboardPage;
