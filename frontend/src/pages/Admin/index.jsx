import React from 'react';
import { Box, Typography, Container, Tabs, Tab } from '@mui/material';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import CourseManagement from '../../components/Admin/CourseManagement';
import InstructorManagement from '../../components/Admin/InstructorManagement';
import TagManagement from '../../components/Admin/TagManagement';

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
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="admin panel tabs"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Courses" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
            <Tab label="Instructors" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
            <Tab label="Tags" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
          </Tabs>
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 0} id="admin-tabpanel-0" aria-labelledby="admin-tab-0">
          {activeTab === 0 && <CourseManagement />}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 1} id="admin-tabpanel-1" aria-labelledby="admin-tab-1">
          {activeTab === 1 && <InstructorManagement />}
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 2} id="admin-tabpanel-2" aria-labelledby="admin-tab-2">
          {activeTab === 2 && <TagManagement />}
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default AdminPage;
