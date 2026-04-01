import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiBriefcase, FiClock, FiDollarSign, FiUserCheck, FiBell, FiTrendingUp, FiAlertCircle, FiActivity } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { dashboardAPI, employeeAPI, leaveAPI } from '../services/api';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [insights, setInsights] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, chartsRes, activityRes, insightsRes, employeesRes] = await Promise.all([
        dashboardAPI.getAdminStats(),
        dashboardAPI.getAdminCharts(),
        dashboardAPI.getRecentActivity(),
        dashboardAPI.getAIInsights(),
        employeeAPI.getAll({ status: 'active' }),
      ]);

      setStats(statsRes.data.data);
      setCharts(chartsRes.data.data);
      setActivities(activityRes.data.data);
      setInsights(insightsRes.data.data);
      setRecentEmployees(employeesRes.data.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="lg:ml-64 flex-1 p-4 md:p-8 overflow-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={FiUsers}
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            delay={0.1}
            trend={stats?.trends?.employees}
          />
          <StatCard
            icon={FiUserCheck}
            title="Pending Approvals"
            value={stats?.pendingEmployees || 0}
            color="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
            delay={0.2}
            subtitle="Awaiting review"
          />
          <StatCard
            icon={FiBriefcase}
            title="Departments"
            value={stats?.totalDepartments || 0}
            color="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
            delay={0.3}
          />
          <StatCard
            icon={FiCalendar}
            title="Pending Leaves"
            value={stats?.pendingLeaves || 0}
            color="bg-gradient-to-br from-green-500 to-green-600 text-white"
            delay={0.4}
            subtitle="Needs approval"
          />
          <StatCard
            icon={FiClock}
            title="On Leave Today"
            value={stats?.employeesOnLeave || 0}
            color="bg-gradient-to-br from-red-500 to-red-600 text-white"
            delay={0.5}
          />
          <StatCard
            icon={FiDollarSign}
            title="Pending Payrolls"
            value={stats?.pendingPayrolls || 0}
            color="bg-gradient-to-br from-teal-500 to-teal-600 text-white"
            delay={0.6}
            subtitle="To be processed"
          />
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-primary-600" />
              AI-Powered Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  whileHover={{ scale: 1.02 }}
                  className={`card border-l-4 ${
                    insight.type === 'warning' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' :
                    insight.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' :
                    'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className={`text-2xl mt-1 ${
                      insight.type === 'warning' ? 'text-orange-600' :
                      insight.type === 'success' ? 'text-green-600' :
                      'text-blue-600'
                    }`} />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{insight.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Payroll Expense */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Monthly Payroll Expense</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts?.payrollData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="amount" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Employee Growth */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Employee Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts?.growthData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="employees" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Department Salary Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="card"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Department-wise Salary</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={charts?.deptSalary || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(charts?.deptSalary || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Leave Trends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="card"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Leave Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={charts?.leaveTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Area type="monotone" dataKey="approved" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Bottom Section: Recent Activity, Calendar, Employee Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="card lg:col-span-2"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiActivity />
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'leave' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                    activity.type === 'employee' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                    'bg-green-100 dark:bg-green-900/30 text-green-600'
                  }`}>
                    {activity.type === 'leave' ? <FiCalendar /> : activity.type === 'employee' ? <FiUsers /> : <FiDollarSign />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(activity.time), 'MMM dd, yyyy hh:mm a')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    activity.status === 'approved' || activity.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Employee Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="card"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recently Joined</h3>
            <div className="space-y-3">
              {recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                    {emp.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{emp.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{emp.position || 'Employee'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
