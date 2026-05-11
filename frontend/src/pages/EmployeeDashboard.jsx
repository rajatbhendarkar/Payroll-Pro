import { useState, useEffect, Component } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiDollarSign, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import AttendanceCalendar from '../components/AttendanceCalendar';
import { dashboardAPI, attendanceAPI, leaveAPI } from '../services/api';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="card flex items-center gap-3 text-red-500 mt-6">
          <FiAlertCircle size={20} />
          <span className="text-sm">Component error: {this.state.error.message}</span>
        </div>
      );
    }
    return this.props.children;
  }
}

const PageShell = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar />
    {/* On mobile: full width with top padding for hamburger.
        On desktop: offset by sidebar width */}
    <div className="lg:ml-64">
      <div className="p-4 pt-16 lg:pt-6 lg:p-8">
        {children}
      </div>
    </div>
  </div>
);

const EmployeeDashboard = () => {
  const [stats, setStats]           = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, attRes, leaveRes] = await Promise.all([
          dashboardAPI.getEmployeeStats(),
          attendanceAPI.getAll(),
          leaveAPI.getAll(),
        ]);
        setStats(statsRes.data.data);
        setAttendance(attRes.data.data || []);
        setLeaves(leaveRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Loading dashboard...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="card text-center max-w-md w-full">
            <FiAlertCircle className="text-red-500 text-4xl mx-auto mb-3" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base">
          Track your attendance, leaves, and payroll.
        </p>
      </motion.div>

      {/* 2×2 on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
        <StatCard
          icon={FiCalendar}
          title="Pending Leaves"
          value={stats?.pendingLeaves ?? 0}
          color="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
          delay={0.1}
        />
        <StatCard
          icon={FiCheckCircle}
          title="Approved Leaves"
          value={stats?.approvedLeaves ?? 0}
          color="bg-gradient-to-br from-green-500 to-green-600 text-white"
          delay={0.2}
        />
        <StatCard
          icon={FiClock}
          title="Attendance Days"
          value={stats?.attendanceCount ?? 0}
          color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          delay={0.3}
        />
        <StatCard
          icon={FiDollarSign}
          title="Latest Salary"
          value={`₹${stats?.latestSalary ?? 0}`}
          color="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
          delay={0.4}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <ErrorBoundary>
          <AttendanceCalendar attendance={attendance} leaves={leaves} />
        </ErrorBoundary>
      </motion.div>
    </PageShell>
  );
};

export default EmployeeDashboard;
