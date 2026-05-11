import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { departmentAPI, employeeAPI } from '../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDept, setCurrentDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

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
        await departmentAPI.update(currentDept.id, formData);
        toast.success('Department updated successfully');
      } else {
        await departmentAPI.create(formData);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentAPI.delete(id);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error('Failed to delete department');
      }
    }
  };

  const openEditModal = (dept) => {
    setCurrentDept(dept);
    setFormData({ name: dept.name, description: dept.description || '' });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditMode(false);
    setCurrentDept(null);
  };

  const [deptEmployees, setDeptEmployees] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);

  const openDeptEmployees = async (dept) => {
    setSelectedDept(dept);
    try {
      const { data } = await employeeAPI.getAll({ department: dept.id });
      setDeptEmployees(data.data);
    } catch {
      toast.error('Failed to fetch employees');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Departments</h1>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Department
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => openDeptEmployees(dept)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{dept.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{dept.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(dept); }} className="text-blue-600 hover:text-blue-800">
                    <FiEdit size={18} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(dept.id); }} className="text-red-600 hover:text-red-800">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Employees</span>
                <span className="text-2xl font-bold text-primary-600">{dept.employeeCount}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedDept && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-bold">{selectedDept.name}</h2>
                  <p className="text-sm text-gray-500">{deptEmployees.length} employee{deptEmployees.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setSelectedDept(null)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={22} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {deptEmployees.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No employees in this department</p>
                ) : (
                  deptEmployees.map((emp) => (
                    <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <FiUser className="text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{emp.status}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold mb-4">{editMode ? 'Edit Department' : 'Add Department'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input type="text" required className="input-field" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea className="input-field" rows="3" value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
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

export default Departments;
