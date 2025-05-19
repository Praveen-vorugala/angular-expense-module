import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ExpenseProvider, useExpense } from './store/ExpenseContext';
import Login from './components/Login';
import Layout from './components/Layout';
import ExpenseForm from './components/ExpenseForm';
import ExpenseApproval from './components/ExpenseApproval';
import PolicyManagement from './components/PolicyManagement';
import ExpenseReports from './components/ExpenseReports';
import ExpenseTypeManagement from './components/ExpenseTypeManagement';
import DropdownTypesPage from './pages/DropdownTypesPage';
import UserPropertiesPage from './pages/UserPropertiesPage';
import './App.css';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { currentUser } = useExpense();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useExpense();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<div>Welcome to Expense Management System</div>} />
        
        <Route
          path="/submit-expense"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER']}>
              <ExpenseForm />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/approve-expenses"
          element={
            <ProtectedRoute allowedRoles={['MANAGER']}>
              <ExpenseApproval />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-report"
          element={
            <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER']}>
              <ExpenseForm />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/policies"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PolicyManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense-types"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ExpenseTypeManagement />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'MANAGER']}>
              <ExpenseReports />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/dropdown-types"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DropdownTypesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/user-properties"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserPropertiesPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ExpenseProvider>
        <AppRoutes />
      </ExpenseProvider>
    </Router>
  );
};

export default App;
