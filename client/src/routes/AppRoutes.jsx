import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ServicesDashboard from '../pages/ServicesDashboard';
import Sales from '../pages/Sales';
import AddSales from '../pages/AddSales';
import Expenses from '../pages/Expenses';
import Report from '../pages/Report';
import Services from '../pages/Services';
import Users from '../pages/Users';
import UserCreate from '../pages/UserCreate';
import UserEdit from '../pages/UserEdit';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={
          isAuthenticated 
            ? <Navigate to={isAdmin ? '/dashboard' : '/services/dashboard'} replace /> 
            : <Login />
        } 
      />

      {/* Protected Routes with Layout */}
      <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        {/* Admin Only Routes */}
        <Route 
          path="/dashboard" 
          element={<AdminRoute><Dashboard /></AdminRoute>} 
        />
        <Route 
          path="/services" 
          element={<AdminRoute><Services /></AdminRoute>} 
        />
        <Route 
          path="/users" 
          element={<AdminRoute><Users /></AdminRoute>} 
        />
        <Route 
          path="/users/create" 
          element={<AdminRoute><UserCreate /></AdminRoute>} 
        />
        <Route 
          path="/users/edit/:id" 
          element={<AdminRoute><UserEdit /></AdminRoute>} 
        />

        {/* All Authenticated Users */}
        <Route path="/services/dashboard" element={<ServicesDashboard />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales/add" element={<AddSales />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/report" element={<Report />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
