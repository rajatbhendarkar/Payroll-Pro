import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { payrollAPI } from '../services/api';

const EmployeePayroll = () => {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const { data } = await payrollAPI.getAll();
      setPayrolls(data.data);
    } catch (error) {
      toast.error('Failed to fetch payrolls');
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await payrollAPI.downloadPayslip(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Payslip downloaded');
    } catch (error) {
      toast.error('Failed to download payslip');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">My Payroll</h1>

        <div className="space-y-4">
          {payrolls.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No payroll records found</p>
            </div>
          ) : (
            payrolls.map((payroll, index) => (
            <motion.div
              key={payroll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold">
                      {new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      payroll.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payroll.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Basic Salary</p>
                      <p className="text-lg font-bold">₹{payroll.basic_salary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Allowances</p>
                      <p className="text-lg font-bold text-green-600">₹{payroll.allowances}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Deductions</p>
                      <p className="text-lg font-bold text-red-600">₹{payroll.deductions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Net Salary</p>
                      <p className="text-2xl font-bold text-primary-600">₹{payroll.net_salary}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(payroll.id)}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiDownload /> Download
                </button>
              </div>
            </motion.div>
          ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePayroll;
