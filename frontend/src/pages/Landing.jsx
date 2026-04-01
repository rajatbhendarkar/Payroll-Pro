import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUserCheck, FiUsers } from 'react-icons/fi';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-purple-600 to-pink-500 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold text-white mb-4"
        >
          PayrollPro
        </motion.h1>
        <motion.p
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-white/90 mb-12"
        >
          Employee Payroll Management System
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Admin Card */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 cursor-pointer"
            onClick={() => navigate('/admin-auth')}
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUserCheck className="text-4xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Admin Portal</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage employees, departments, payroll, and more
            </p>
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all">
              Admin Login / Signup
            </button>
          </motion.div>

          {/* Employee Card */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 cursor-pointer"
            onClick={() => navigate('/employee-auth')}
          >
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUsers className="text-4xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Employee Portal</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              View attendance, apply leaves, check payroll
            </p>
            <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all">
              Employee Login
            </button>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/80 mt-8 text-sm"
        >
          Choose your portal to continue
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Landing;
