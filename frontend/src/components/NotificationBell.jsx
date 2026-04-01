import { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { leaveAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [count, setCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchPendingLeaves();
    const interval = setInterval(fetchPendingLeaves, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const { data } = await leaveAPI.getAll({ status: 'pending' });
      setCount(data.count || 0);
      setNotifications(data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleNotificationClick = () => {
    setShowDropdown(false);
    navigate('/admin/leaves');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
      >
        <FiBell className="text-xl text-gray-700 dark:text-gray-300" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
          >
            {count}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Leave Requests ({count})
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((leave) => (
                  <div
                    key={leave.id}
                    onClick={handleNotificationClick}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {leave.users?.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {leave.leave_type} leave request
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No pending requests
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
