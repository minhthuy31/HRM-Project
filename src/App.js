import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/DashBoard";
import EmployeeManagementPage from "./pages/EmployeeManagementPage";
import DepartmentPage from "./pages/DepartmentPage";
import TimekeepingPage from "./pages/TimekeepingPage";
import PayrollPage from "./pages/PayrollPage";
import LeaveManagementPage from "./pages/LeaveManagementPage";
import DisciplinePage from "./pages/DisciplinePage";
import TrainingPage from "./pages/TrainingPage";
import ReportsPage from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import EmployeeEditPage from "./pages/EmployeeEditPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nhan-vien" element={<EmployeeManagementPage />} />
        <Route path="/phong-ban" element={<DepartmentPage />} />
        <Route path="/cham-cong" element={<TimekeepingPage />} />
        <Route path="/luong" element={<PayrollPage />} />
        <Route path="/nghi-phep" element={<LeaveManagementPage />} />
        <Route path="/khen-thuong" element={<DisciplinePage />} />
        <Route path="/dao-tao" element={<TrainingPage />} />
        <Route path="/bao-cao" element={<ReportsPage />} />
        <Route path="/nhan-vien/:employeeId" element={<EmployeeDetailPage />} />
        <Route
          path="/nhan-vien/:employeeId/edit"
          element={<EmployeeEditPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
