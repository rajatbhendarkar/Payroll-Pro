import axios from 'axios';
import { CapacitorHttp } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

// Use Capacitor HTTP for mobile, axios for web
const isNative = Capacitor.isNativePlatform();

const baseURL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Wrapper function to handle both native and web requests
const makeRequest = async (config) => {
  if (isNative) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    const options = {
      url: `${baseURL}${config.url}`,
      headers,
      method: config.method?.toUpperCase() || 'GET',
    };

    if (config.data) {
      options.data = config.data;
    }

    if (config.params) {
      const searchParams = new URLSearchParams(config.params);
      options.url += `?${searchParams.toString()}`;
    }

    try {
      const response = await CapacitorHttp.request(options);
      return { data: response.data };
    } catch (error) {
      throw {
        response: {
          data: error.data || { message: 'Network error' },
          status: error.status || 500
        }
      };
    }
  } else {
    return API(config);
  }
};

export const authAPI = {
  login: (data) => makeRequest({ method: 'post', url: '/auth/login', data }),
  register: (data) => makeRequest({ method: 'post', url: '/auth/register', data }),
  getMe: () => makeRequest({ method: 'get', url: '/auth/me' }),
  forgotPassword: (data) => makeRequest({ method: 'post', url: '/auth/forgot-password', data }),
  resetPassword: (data) => makeRequest({ method: 'post', url: '/auth/reset-password', data }),
};

export const employeeAPI = {
  getAll: (params) => makeRequest({ method: 'get', url: '/employees', params }),
  getOne: (id) => makeRequest({ method: 'get', url: `/employees/${id}` }),
  create: (data) => makeRequest({ method: 'post', url: '/employees', data }),
  update: (id, data) => makeRequest({ method: 'put', url: `/employees/${id}`, data }),
  delete: (id) => makeRequest({ method: 'delete', url: `/employees/${id}` }),
  approve: (id) => makeRequest({ method: 'put', url: `/employees/${id}/approve` }),
};

export const departmentAPI = {
  getAll: () => makeRequest({ method: 'get', url: '/departments' }),
  getOne: (id) => makeRequest({ method: 'get', url: `/departments/${id}` }),
  create: (data) => makeRequest({ method: 'post', url: '/departments', data }),
  update: (id, data) => makeRequest({ method: 'put', url: `/departments/${id}`, data }),
  delete: (id) => makeRequest({ method: 'delete', url: `/departments/${id}` }),
};

export const leaveAPI = {
  getAll: (params) => makeRequest({ method: 'get', url: '/leaves', params }),
  getOne: (id) => makeRequest({ method: 'get', url: `/leaves/${id}` }),
  create: (data) => makeRequest({ method: 'post', url: '/leaves', data }),
  updateStatus: (id, data) => makeRequest({ method: 'put', url: `/leaves/${id}/status`, data }),
  delete: (id) => makeRequest({ method: 'delete', url: `/leaves/${id}` }),
};

export const attendanceAPI = {
  getAll: (params) => makeRequest({ method: 'get', url: '/attendance', params }),
  clockIn: () => makeRequest({ method: 'post', url: '/attendance/clock-in' }),
  clockOut: () => makeRequest({ method: 'post', url: '/attendance/clock-out' }),
  create: (data) => makeRequest({ method: 'post', url: '/attendance', data }),
  update: (id, data) => makeRequest({ method: 'put', url: `/attendance/${id}`, data }),
};

export const payrollAPI = {
  getAll: (params) => makeRequest({ method: 'get', url: '/payroll', params }),
  getOne: (id) => makeRequest({ method: 'get', url: `/payroll/${id}` }),
  create: (data) => makeRequest({ method: 'post', url: '/payroll', data }),
  update: (id, data) => makeRequest({ method: 'put', url: `/payroll/${id}`, data }),
  markAsPaid: (id, data) => makeRequest({ method: 'put', url: `/payroll/${id}/paid`, data }),
  downloadPayslip: (id) => makeRequest({ method: 'get', url: `/payroll/${id}/payslip`, responseType: 'blob' }),
};

export const announcementAPI = {
  getAll: () => makeRequest({ method: 'get', url: '/announcements' }),
  getOne: (id) => makeRequest({ method: 'get', url: `/announcements/${id}` }),
  create: (data) => makeRequest({ method: 'post', url: '/announcements', data }),
  update: (id, data) => makeRequest({ method: 'put', url: `/announcements/${id}`, data }),
  delete: (id) => makeRequest({ method: 'delete', url: `/announcements/${id}` }),
};

export const faceAttendanceAPI = {
  registerFace: (employeeId, descriptor) => makeRequest({ method: 'post', url: `/face-attendance/register-face/${employeeId}`, data: { descriptor } }),
  getMyFace: () => makeRequest({ method: 'get', url: '/face-attendance/my-face' }),
  clockIn: (data) => makeRequest({ method: 'post', url: '/face-attendance/clock-in', data }),
  getCompanyLocation: () => makeRequest({ method: 'get', url: '/face-attendance/company-location' }),
  setCompanyLocation: (data) => makeRequest({ method: 'put', url: '/face-attendance/company-location', data }),
};

export const dashboardAPI = {
  getAdminStats: () => makeRequest({ method: 'get', url: '/dashboard/admin' }),
  getAdminCharts: () => makeRequest({ method: 'get', url: '/dashboard/admin/charts' }),
  getRecentActivity: () => makeRequest({ method: 'get', url: '/dashboard/admin/activity' }),
  getAIInsights: () => makeRequest({ method: 'get', url: '/dashboard/admin/insights' }),
  getEmployeeStats: () => makeRequest({ method: 'get', url: '/dashboard/employee' }),
};

export default API;
