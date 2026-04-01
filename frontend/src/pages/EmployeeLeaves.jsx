import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import { leaveAPI } from '../services/api';

const EmployeeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'casual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await leaveAPI.getAll();
      setLeaves(data.data);
    } catch (error) {
      toast.error('Failed to fetch leaves');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.create(formData);
      toast.success('Leave request submitted successfully');
      setShowModal(false);
      setFormData({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Leaves</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Apply Leave
          </button>
        </div>

        <div className="space-y-4">
          {leaves.map((leave, index) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {leave.leave_type}
                    </span>
                  </div>
                  <p className="text-sm mb-2"><strong>Reason:</strong> {leave.reason}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Duration:</strong> {format(new Date(leave.start_date), 'MMM dd, yyyy')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                  </p>
                  {leave.rejection_reason && (
                    <p className="text-sm text-red-600 mt-2">
                      <strong>Rejection Reason:</strong> {leave.rejection_reason}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold mb-4">Apply for Leave</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Leave Type</label>
                  <select className="input-field" value={formData.leave_type}
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}>
                    <option value="casual">Casual</option>
                    <option value="sick">Sick</option>
                    <option value="annual">Annual</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input type="date" required className="input-field" value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input type="date" required className="input-field" value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <textarea required className="input-field" rows="3" value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
                </div>
                <div className="flex gap-4 justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLeaves;
