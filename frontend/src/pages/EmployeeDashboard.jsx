import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { dashboardAPI } from '../services/api';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await dashboardAPI.getEmployeeStats();
      setStats(data.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your attendance, leaves, and payroll.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FiCalendar}
            title="Pending Leaves"
            value={stats?.pendingLeaves || 0}
            color="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
            delay={0.1}
          />
          <StatCard
            icon={FiCheckCircle}
            title="Approved Leaves"
            value={stats?.approvedLeaves || 0}
            color="bg-gradient-to-br from-green-500 to-green-600 text-white"
            delay={0.2}
          />
          <StatCard
            icon={FiClock}
            title="Attendance Days"
            value={stats?.attendanceCount || 0}
            color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            delay={0.3}
          />
          <StatCard
            icon={FiDollarSign}
            title="Latest Salary"
            value={`₹${stats?.latestSalary || 0}`}
            color="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
            delay={0.4}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
