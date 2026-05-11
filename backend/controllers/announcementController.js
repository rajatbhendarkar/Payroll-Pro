const Announcement = require('../models/Announcement');

exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll();
    const formattedData = announcements.map(a => ({
      _id: a.id,
      title: a.title,
      content: a.content,
      priority: a.priority,
      createdBy: a.users ? { _id: a.users.id, name: a.users.name } : null,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    }));
    res.json({ success: true, count: formattedData.length, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    const formattedData = {
      _id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      createdBy: announcement.users ? { _id: announcement.users.id, name: announcement.users.name } : null,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at
    };
    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, created_by: req.user.id });
    const formattedData = {
      _id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      createdAt: announcement.created_at
    };
    res.status(201).json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.update(req.params.id, req.body);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    const formattedData = {
      _id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      updatedAt: announcement.updated_at
    };
    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.delete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
