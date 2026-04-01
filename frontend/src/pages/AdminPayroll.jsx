import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiDownload, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { payrollAPI, employeeAPI } from '../services/api';

const AdminPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    basic_salary: '', allowances: 0, deductions: 0, bonus: 0
  });

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const { data } = await payrollAPI.getAll();
      setPayrolls(data.data);
    } catch (error) {
      toast.error('Failed to fetch payrolls');
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
      const payrollData = {
        employee_id: formData.employee_id,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        basic_salary: parseFloat(formData.basic_salary),
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        bonus: parseFloat(formData.bonus) || 0
      };
      await payrollAPI.create(payrollData);
      toast.success('Payroll created successfully');
      setShowModal(false);
      setFormData({ employee_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), basic_salary: '', allowances: 0, deductions: 0, bonus: 0 });
      fetchPayrolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create payroll');
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await payrollAPI.markAsPaid(id, { payment_method: 'Bank Transfer' });
      toast.success('Payroll marked as paid');
      fetchPayrolls();
    } catch (error) {
      toast.error('Failed to mark as paid');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Create Payroll
          </button>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left p-4">Employee</th>
                <th className="text-left p-4">Month/Year</th>
                <th className="text-left p-4">Basic Salary</th>
                <th className="text-left p-4">Allowances</th>
                <th className="text-left p-4">Deductions</th>
                <th className="text-left p-4">Net Salary</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((payroll) => (
                <tr key={payroll.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-4">{payroll.users?.name}</td>
                  <td className="p-4">{payroll.month}/{payroll.year}</td>
                  <td className="p-4">₹{payroll.basic_salary}</td>
                  <td className="p-4">₹{payroll.allowances}</td>
                  <td className="p-4">₹{payroll.deductions}</td>
                  <td className="p-4 font-bold">₹{payroll.net_salary}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payroll.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payroll.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {payroll.status === 'pending' && (
                        <button onClick={() => handleMarkAsPaid(payroll.id)} className="text-green-600 hover:text-green-800">
                          <FiCheck size={18} />
                        </button>
                      )}
                      <button onClick={() => handleDownload(payroll.id)} className="text-blue-600 hover:text-blue-800">
                        <FiDownload size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
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
              <h2 className="text-2xl font-bold mb-4">Create Payroll</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Employee</label>
                  <select required className="input-field" value={formData.employee_id}
                    onChange={(e) => {
                      const selectedEmp = employees.find(emp => emp.id === e.target.value);
                      setFormData({ ...formData, employee_id: e.target.value, basic_salary: selectedEmp?.salary || '' });
                    }}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Month</label>
                    <input type="number" min="1" max="12" required className="input-field" value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Year</label>
                    <input type="number" required className="input-field" value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Basic Salary</label>
                  <input type="number" required className="input-field" value={formData.basic_salary}
                    onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Allowances</label>
                  <input type="number" className="input-field" value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deductions</label>
                  <input type="number" className="input-field" value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bonus</label>
                  <input type="number" className="input-field" value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })} />
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

export default AdminPayroll;
