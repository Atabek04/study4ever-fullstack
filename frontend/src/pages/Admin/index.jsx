import React from 'react';
import { Box, Typography, Container, Tabs, Tab } from '@mui/material';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import CourseManagement from '../../components/Admin/CourseManagement';
import InstructorManagement from '../../components/Admin/InstructorManagement';
import StudentManagement from '../../components/Admin/StudentManagement';
import UserManagement from '../../components/Admin/UserManagement';
import TagManagement from '../../components/Admin/TagManagement';
import DashboardSummary from '../../components/Admin/DashboardSummary';

/**
 * Admin Panel page for managing courses, modules, lessons, and instructors
 */
const AdminPage = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Admin Panel
        </Typography>
        
        <DashboardSummary />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="admin panel tabs"
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Courses" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
            <Tab label="Instructors" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
            <Tab label="Students" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
            <Tab label="Users" id="admin-tab-3" aria-controls="admin-tabpanel-3" />
            <Tab label="Tags" id="admin-tab-4" aria-controls="admin-tabpanel-4" />
          </Tabs>
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 0} id="admin-tabpanel-0" aria-labelledby="admin-tab-0">
          {activeTab === 0 && <CourseManagement />}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 1} id="admin-tabpanel-1" aria-labelledby="admin-tab-1">
          {activeTab === 1 && <InstructorManagement />}
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 2} id="admin-tabpanel-2" aria-labelledby="admin-tab-2">
          {activeTab === 2 && <StudentManagement />}
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 3} id="admin-tabpanel-3" aria-labelledby="admin-tab-3">
          {activeTab === 3 && <UserManagement />}
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 4} id="admin-tabpanel-4" aria-labelledby="admin-tab-4">
          {activeTab === 4 && <TagManagement />}
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default AdminPage;
