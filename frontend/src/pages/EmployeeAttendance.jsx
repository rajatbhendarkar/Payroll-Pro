import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import FaceAttendance from '../components/FaceAttendance';
import { attendanceAPI } from '../services/api';

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const { data } = await attendanceAPI.getAll();
      setAttendance(data.data);
      const today = data.data.find((a) => {
        return new Date(a.date).toDateString() === new Date().toDateString();
      });
      setTodayAttendance(today);
    } catch {
      toast.error('Failed to fetch attendance');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold mb-2">My Attendance</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Use face recognition to clock in/out from the office location.
        </p>

        {/* Face Attendance Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card mb-6 border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                🤖 Face Recognition Attendance
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Your face + office location are verified automatically.
              </p>
              <div className="flex gap-3 flex-wrap">
                {!todayAttendance?.clock_in && (
                  <FaceAttendance type="clock-in" onSuccess={fetchAttendance} />
                )}
                {todayAttendance?.clock_in && !todayAttendance?.clock_out && (
                  <FaceAttendance type="clock-out" onSuccess={fetchAttendance} />
                )}
                {todayAttendance?.clock_in && todayAttendance?.clock_out && (
                  <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                    ✅ Attendance complete for today
                  </div>
                )}
              </div>
            </div>

            {/* Today status */}
            <div className="text-right text-sm">
              {todayAttendance?.clock_in && (
                <div className="text-green-600 font-medium">
                  In: {format(new Date(todayAttendance.clock_in), 'hh:mm:ss a')}
                </div>
              )}
              {todayAttendance?.clock_out && (
                <div className="text-red-500 font-medium">
                  Out: {format(new Date(todayAttendance.clock_out), 'hh:mm:ss a')}
                </div>
              )}
              {todayAttendance?.clock_in && todayAttendance?.clock_out && (() => {
                const hrs = (new Date(todayAttendance.clock_out) - new Date(todayAttendance.clock_in)) / (1000 * 60 * 60);
                return <div className="text-gray-500">Hours: {hrs.toFixed(2)}h</div>;
              })()}
            </div>
          </div>
        </motion.div>

        {/* Attendance History */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Attendance History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Clock In</th>
                  <th className="text-left p-4">Clock Out</th>
                  <th className="text-left p-4">Work Hours</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="border-b dark:border-gray-700">
                    <td className="p-4">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                    <td className="p-4">{record.clock_in ? format(new Date(record.clock_in), 'hh:mm:ss a') : '-'}</td>
                    <td className="p-4">{record.clock_out ? format(new Date(record.clock_out), 'hh:mm:ss a') : '-'}</td>
                    <td className="p-4">{record.clock_in && record.clock_out ? `${((new Date(record.clock_out) - new Date(record.clock_in)) / (1000 * 60 * 60)).toFixed(2)}h` : '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
