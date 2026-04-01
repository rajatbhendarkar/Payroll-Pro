import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import { announcementAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'medium' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await announcementAPI.getAll();
      setAnnouncements(data.data);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await announcementAPI.update(currentAnnouncement._id, formData);
        toast.success('Announcement updated successfully');
      } else {
        await announcementAPI.create(formData);
        toast.success('Announcement created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementAPI.delete(id);
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      } catch (error) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  const openEditModal = (announcement) => {
    setCurrentAnnouncement(announcement);
    setFormData({ title: announcement.title, content: announcement.content, priority: announcement.priority });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', priority: 'medium' });
    setEditMode(false);
    setCurrentAnnouncement(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Announcements</h1>
          {user?.role === 'admin' && (
            <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
              <FiPlus /> Create Announcement
            </button>
          )}
        </div>

        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`card border-l-4 ${getPriorityColor(announcement.priority)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{announcement.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>By: {announcement.createdBy?.name}</span>
                    <span>•</span>
                    <span>{format(new Date(announcement.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(announcement)} className="text-blue-600 hover:text-blue-800">
                      <FiEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(announcement._id)} className="text-red-600 hover:text-red-800">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl"
            >
              <h2 className="text-2xl font-bold mb-4">{editMode ? 'Edit Announcement' : 'Create Announcement'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input type="text" required className="input-field" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea required className="input-field" rows="5" value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select className="input-field" value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
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

export default Announcements;
