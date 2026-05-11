import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
};

export const employeeAPI = {
  getAll: (params) => API.get('/employees', { params }),
  getOne: (id) => API.get(`/employees/${id}`),
  create: (data) => API.post('/employees', data),
  update: (id, data) => API.put(`/employees/${id}`, data),
  delete: (id) => API.delete(`/employees/${id}`),
  approve: (id) => API.put(`/employees/${id}/approve`),
};

export const departmentAPI = {
  getAll: () => API.get('/departments'),
  getOne: (id) => API.get(`/departments/${id}`),
  create: (data) => API.post('/departments', data),
  update: (id, data) => API.put(`/departments/${id}`, data),
  delete: (id) => API.delete(`/departments/${id}`),
};

export const leaveAPI = {
  getAll: (params) => API.get('/leaves', { params }),
  getOne: (id) => API.get(`/leaves/${id}`),
  create: (data) => API.post('/leaves', data),
  updateStatus: (id, data) => API.put(`/leaves/${id}/status`, data),
  delete: (id) => API.delete(`/leaves/${id}`),
};

export const attendanceAPI = {
  getAll: (params) => API.get('/attendance', { params }),
  clockIn: () => API.post('/attendance/clock-in'),
  clockOut: () => API.post('/attendance/clock-out'),
  create: (data) => API.post('/attendance', data),
  update: (id, data) => API.put(`/attendance/${id}`, data),
};

export const payrollAPI = {
  getAll: (params) => API.get('/payroll', { params }),
  getOne: (id) => API.get(`/payroll/${id}`),
  create: (data) => API.post('/payroll', data),
  update: (id, data) => API.put(`/payroll/${id}`, data),
  markAsPaid: (id, data) => API.put(`/payroll/${id}/paid`, data),
  downloadPayslip: (id) => API.get(`/payroll/${id}/payslip`, { responseType: 'blob' }),
};

export const announcementAPI = {
  getAll: () => API.get('/announcements'),
  getOne: (id) => API.get(`/announcements/${id}`),
  create: (data) => API.post('/announcements', data),
  update: (id, data) => API.put(`/announcements/${id}`, data),
  delete: (id) => API.delete(`/announcements/${id}`),
};

export const faceAttendanceAPI = {
  registerFace: (employeeId, descriptor) => API.post(`/face-attendance/register-face/${employeeId}`, { descriptor }),
  getMyFace: () => API.get('/face-attendance/my-face'),
  clockIn: (data) => API.post('/face-attendance/clock-in', data),
  getCompanyLocation: () => API.get('/face-attendance/company-location'),
  setCompanyLocation: (data) => API.put('/face-attendance/company-location', data),
};

export const dashboardAPI = {
  getAdminStats: () => API.get('/dashboard/admin'),
  getAdminCharts: () => API.get('/dashboard/admin/charts'),
  getRecentActivity: () => API.get('/dashboard/admin/activity'),
  getAIInsights: () => API.get('/dashboard/admin/insights'),
  getEmployeeStats: () => API.get('/dashboard/employee'),
};

export default API;
