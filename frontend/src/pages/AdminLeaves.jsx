import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import { leaveAPI } from '../services/api';

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const fetchLeaves = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await leaveAPI.getAll(params);
      setLeaves(data.data);
    } catch (error) {
      toast.error('Failed to fetch leaves');
    }
  };

  const handleStatusUpdate = async (id, status, rejection_reason = '') => {
    try {
      await leaveAPI.updateStatus(id, { status, rejection_reason });
      toast.success(`Leave ${status} successfully`);
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to update leave status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Leave Management</h1>

        <div className="card mb-6">
          <div className="flex gap-4">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {leaves.map((leave, index) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{leave.users?.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {leave.leave_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{leave.users?.email}</p>
                  <p className="text-sm mb-2"><strong>Reason:</strong> {leave.reason}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Duration:</strong> {format(new Date(leave.start_date), 'MMM dd, yyyy')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                {leave.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(leave.id, 'approved')}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all"
                    >
                      <FiCheck size={20} />
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) handleStatusUpdate(leave.id, 'rejected', reason);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminLeaves;
