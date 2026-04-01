import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import CompanyLocation from './pages/CompanyLocation';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import AdminLeaves from './pages/AdminLeaves';
import EmployeeLeaves from './pages/EmployeeLeaves';
import EmployeeAttendance from './pages/EmployeeAttendance';
import AdminAttendance from './pages/AdminAttendance';
import AdminPayroll from './pages/AdminPayroll';
import EmployeePayroll from './pages/EmployeePayroll';
import Announcements from './pages/Announcements';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/employees" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/admin/departments" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Departments />
              </ProtectedRoute>
            } />
            <Route path="/admin/leaves" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLeaves />
              </ProtectedRoute>
            } />
            <Route path="/admin/attendance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAttendance />
              </ProtectedRoute>
            } />
            <Route path="/admin/payroll" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPayroll />
              </ProtectedRoute>
            } />
            <Route path="/admin/announcements" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Announcements />
              </ProtectedRoute>
            } />
            <Route path="/admin/company-location" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CompanyLocation />
              </ProtectedRoute>
            } />

            {/* Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/leaves" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeLeaves />
              </ProtectedRoute>
            } />
            <Route path="/employee/attendance" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeAttendance />
              </ProtectedRoute>
            } />
            <Route path="/employee/payroll" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeePayroll />
              </ProtectedRoute>
            } />
            <Route path="/employee/announcements" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <Announcements />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
