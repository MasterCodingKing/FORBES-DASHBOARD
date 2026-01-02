import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import PermissionRoute from './PermissionRoute';
import { PERMISSIONS } from '../utils/permissions';
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
import Reports from '../pages/Reports';
import Services from '../pages/Services';
import MonthlyTargets from '../pages/MonthlyTargets';
import Users from '../pages/Users';
import UserCreate from '../pages/UserCreate';
import UserEdit from '../pages/UserEdit';
import UserPermissions from '../pages/UserPermissions';
import AuditTrail from '../pages/AuditTrail';
import NotFound from '../pages/NotFound';

// Report Pages
import {
  DashboardSummaryReport,
  MonthlyRevenueReport,
  MonthlyIncomeReport,
  MonthToMonthReport,
  YTDSalesReport,
  YTDIncomeReport,
  MonthlyProjectionReport
} from '../pages/reports/index';
import { MonthlyServiceBreakdownReport } from '../pages/reports/index';

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
          path="/monthly-targets" 
          element={<AdminRoute><MonthlyTargets /></AdminRoute>} 
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
          path="/users/:id/edit" 
          element={<AdminRoute><UserEdit /></AdminRoute>} 
        />
        <Route 
          path="/users/:id/permissions" 
          element={<AdminRoute><UserPermissions /></AdminRoute>} 
        />
        <Route 
          path="/audit" 
          element={<AdminRoute><AuditTrail /></AdminRoute>} 
        />

        {/* All Authenticated Users with Permission Checks */}
        <Route 
          path="/services/dashboard" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_DASHBOARD}>
              <ServicesDashboard />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/sales" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_SALES}>
              <Sales />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/sales/add" 
          element={
            <PermissionRoute permission={PERMISSIONS.CREATE_SALES}>
              <AddSales />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/expenses" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_EXPENSES}>
              <Expenses />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/report" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_REPORTS}>
              <Report />
            </PermissionRoute>
          } 
        />
        
        {/* Reports List and Individual Reports */}
        <Route 
          path="/reports" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_REPORTS}>
              <Reports />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/reports/dashboard-summary" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_REPORTS}>
              <DashboardSummaryReport />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/reports/monthly-revenue" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_REPORTS}>
              <MonthlyRevenueReport />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/reports/monthly-income" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_REPORTS}>
              <MonthlyIncomeReport />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/reports/month-to-month" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_REPORTS}>
              <MonthToMonthReport />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/reports/ytd-sales" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_REPORTS}>
              <YTDSalesReport />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/reports/ytd-income" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_REPORTS}>
              <YTDIncomeReport />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/reports/monthly-projection" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_REPORTS}>
              <MonthlyProjectionReport />
            </PermissionRoute>
          } 
        />
        <Route 
          path="/reports/monthly-service" 
          element={
            <PermissionRoute permission={PERMISSIONS.VIEW_REPORTS}>
              <MonthlyServiceBreakdownReport />
            </PermissionRoute>
          } 
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
