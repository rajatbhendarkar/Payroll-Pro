import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import AdminFaceRegister from '../components/AdminFaceRegister';
import { employeeAPI, departmentAPI } from '../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department_id: '', position: '', salary: '', phone: '', address: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await employeeAPI.getAll({ search });
      setEmployees(data.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await departmentAPI.getAll();
      setDepartments(data.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await employeeAPI.update(currentEmployee.id, formData);
        toast.success('Employee updated successfully');
      } else {
        await employeeAPI.create(formData);
        toast.success('Employee created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(id);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await employeeAPI.approve(id);
      toast.success('Employee approved successfully');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to approve employee');
    }
  };

  const openEditModal = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '',
      department_id: employee.department_id || '',
      position: employee.position || '',
      salary: employee.salary || '',
      phone: employee.phone || '',
      address: employee.address || ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', department_id: '', position: '', salary: '', phone: '', address: '' });
    setEditMode(false);
    setCurrentEmployee(null);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Employees</h1>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Employee
          </button>
        </div>

        <div className="card mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={fetchEmployees}
            />
          </div>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Department</th>
                <th className="text-left p-4">Position</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="p-4">{emp.employee_id}</td>
                  <td className="p-4">{emp.name}</td>
                  <td className="p-4">{emp.email}</td>
                  <td className="p-4">{emp.departments?.name || 'N/A'}</td>
                  <td className="p-4">{emp.position || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      emp.status === 'active' ? 'bg-green-100 text-green-800' :
                      emp.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {emp.status === 'pending' && (
                        <button onClick={() => handleApprove(emp.id)} className="text-green-600 hover:text-green-800">
                          <FiCheck size={18} />
                        </button>
                      )}
                      <button onClick={() => openEditModal(emp)} className="text-blue-600 hover:text-blue-800">
                        <FiEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-800">
                        <FiTrash2 size={18} />
                      </button>
                      {emp.status === 'active' && (
                        <AdminFaceRegister employee={emp} onSuccess={fetchEmployees} />
                      )}
                    </div>
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
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-4">{editMode ? 'Edit Employee' : 'Add Employee'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input type="text" required className="input-field" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" required className="input-field" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  {!editMode && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <input type="password" required={!editMode} className="input-field" value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <select className="input-field" value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}>
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Position</label>
                    <input type="text" className="input-field" value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Salary</label>
                    <input type="number" className="input-field" value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input type="text" className="input-field" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <textarea className="input-field" rows="2" value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editMode ? 'Update' : 'Create'}
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

export default Employees;
