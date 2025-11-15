import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ProjectsList from './pages/projects/ProjectsList';
import ProjectDetail from './pages/projects/ProjectDetail';
import ProjectCreate from './pages/projects/ProjectCreate';
import VendorsList from './pages/vendors/VendorsList';
import AdvancedAnalytics from './pages/analytics/AdvancedAnalytics';
import PurchaseOrdersList from './pages/purchase-orders/PurchaseOrdersList';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/projects/new" element={<ProjectCreate />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/vendors" element={<VendorsList />} />
              <Route path="/purchase-orders" element={<PurchaseOrdersList />} />
              <Route path="/analytics" element={<AdvancedAnalytics />} />
            </Route>
          </Route>
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
