import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiUsers, FiBriefcase, FiCalendar, FiClock,
  FiDollarSign, FiBell, FiLogOut, FiMoon, FiSun, FiMapPin, FiMenu, FiX
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBell from './NotificationBell';

const adminLinks = [
  { path: '/admin', icon: FiHome, label: 'Dashboard' },
  { path: '/admin/employees', icon: FiUsers, label: 'Employees' },
  { path: '/admin/departments', icon: FiBriefcase, label: 'Departments' },
  { path: '/admin/leaves', icon: FiCalendar, label: 'Leaves' },
  { path: '/admin/attendance', icon: FiClock, label: 'Attendance' },
  { path: '/admin/payroll', icon: FiDollarSign, label: 'Payroll' },
  { path: '/admin/announcements', icon: FiBell, label: 'Announcements' },
  { path: '/admin/company-location', icon: FiMapPin, label: 'Office Location' },
];

const employeeLinks = [
  { path: '/employee', icon: FiHome, label: 'Dashboard' },
  { path: '/employee/leaves', icon: FiCalendar, label: 'My Leaves' },
  { path: '/employee/attendance', icon: FiClock, label: 'Attendance' },
  { path: '/employee/payroll', icon: FiDollarSign, label: 'Payroll' },
  { path: '/employee/announcements', icon: FiBell, label: 'Announcements' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  const NavContent = () => (
    <>
      {/* Logo & User */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
              PayrollPro
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{user?.name}</p>
            <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
          {user?.role === 'admin' && <NotificationBell />}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="text-xl flex-shrink-0" />
                <span className="font-medium">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 rounded-full bg-white"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          <motion.div animate={{ rotate: darkMode ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {darkMode ? <FiSun className="text-xl text-yellow-500" /> : <FiMoon className="text-xl" />}
          </motion.div>
          <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <FiLogOut className="text-xl" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
      >
        <FiMenu className="text-2xl text-gray-700 dark:text-gray-300" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="lg:hidden fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiX className="text-xl" />
            </button>
            <NavContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="hidden lg:flex w-64 h-screen bg-white dark:bg-gray-800 shadow-xl fixed left-0 top-0 flex-col"
      >
        <NavContent />
      </motion.div>
    </>
  );
};

export default Sidebar;
