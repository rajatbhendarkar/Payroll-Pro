import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import { attendanceAPI, employeeAPI } from '../services/api';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    clockIn: '',
    clockOut: '',
    status: 'present'
  });

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  const fetchAttendance = async () => {
    try {
      const { data } = await attendanceAPI.getAll();
      setAttendance(data.data);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await employeeAPI.getAll();
      setEmployees(data.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create datetime strings without timezone conversion
      const clockInTime = formData.clockIn ? `${formData.date}T${formData.clockIn}:00` : null;
      const clockOutTime = formData.clockOut ? `${formData.date}T${formData.clockOut}:00` : null;
      
      let workHours = null;
      if (clockInTime && clockOutTime) {
        const diff = new Date(clockOutTime) - new Date(clockInTime);
        workHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
      }

      const submitData = {
        employee_id: formData.employee,
        date: formData.date,
        clock_in: clockInTime,
        clock_out: clockOutTime,
        work_hours: workHours,
        status: formData.status
      };
      
      await attendanceAPI.create(submitData);
      toast.success('Attendance record created successfully');
      setShowModal(false);
      setFormData({ employee: '', date: format(new Date(), 'yyyy-MM-dd'), clockIn: '', clockOut: '', status: 'present' });
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create attendance');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Attendance
          </button>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left p-4">Employee</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Clock In</th>
                <th className="text-left p-4">Clock Out</th>
                <th className="text-left p-4">Work Hours</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="p-4">{record.users?.name}</td>
                  <td className="p-4">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                  <td className="p-4">{record.clock_in ? format(new Date(record.clock_in), 'hh:mm a') : '-'}</td>
                  <td className="p-4">{record.clock_out ? format(new Date(record.clock_out), 'hh:mm a') : '-'}</td>
                  <td className="p-4">{record.work_hours ? `${record.work_hours}h` : '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold mb-4">Add Attendance Record</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Employee</label>
                  <select required className="input-field" value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input type="date" required className="input-field" value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Clock In Time</label>
                  <input type="time" className="input-field" value={formData.clockIn}
                    onChange={(e) => setFormData({ ...formData, clockIn: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Clock Out Time</label>
                  <input type="time" className="input-field" value={formData.clockOut}
                    onChange={(e) => setFormData({ ...formData, clockOut: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select className="input-field" value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="half-day">Half Day</option>
                    <option value="late">Late</option>
                  </select>
                </div>
                <div className="flex gap-4 justify-end">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create
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

export default AdminAttendance;
