import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { StudyStatsDashboard } from '../../components/StudyStats';

/**
 * StudyStatsPage component - Page wrapper for the study statistics dashboard
 * @returns {JSX.Element} StudyStatsPage component
 */
const StudyStatsPage = () => {
  return (
    <DashboardLayout>
      <StudyStatsDashboard />
    </DashboardLayout>
  );
};

export default StudyStatsPage;
