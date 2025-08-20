// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import các trang chính
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashBoard';

// Import các trang chức năng
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import DepartmentPage from './pages/DepartmentPage';
import TimekeepingPage from './pages/TimekeepingPage';
import PayrollPage from './pages/PayrollPage';
import LeaveManagementPage from './pages/LeaveManagementPage';
import DisciplinePage from './pages/DisciplinePage';
import TrainingPage from './pages/TrainingPage';
import ReportsPage from './pages/ReportsPage';

// Import các trang cài đặt & bảo mật
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route mặc định & bảo mật */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Route Layout Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nhan-vien" element={<EmployeeManagementPage />} />
        <Route path="/phong-ban" element={<DepartmentPage />} />
        <Route path="/cham-cong" element={<TimekeepingPage />} />
        <Route path="/luong" element={<PayrollPage />} />
        <Route path="/nghi-phep" element={<LeaveManagementPage />} />
        <Route path="/khen-thuong" element={<DisciplinePage />} />
        <Route path="/dao-tao" element={<TrainingPage />} />
        <Route path="/bao-cao" element={<ReportsPage />} />

      </Routes>
    </Router>
  );
}

export default App;