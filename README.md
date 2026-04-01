# Employee Payroll Management System

A modern, full-stack Employee Payroll Management System built with **React.js**, **Node.js**, **Express**, and **MongoDB**.

## 🚀 Features

### Admin Features
- **Dashboard**: Real-time statistics and analytics
- **Employee Management**: Full CRUD operations, approve/reject registrations
- **Department Management**: Create and manage departments
- **Leave Management**: Approve/reject employee leave requests
- **Attendance Management**: View and manage employee attendance
- **Payroll Management**: Create payroll, process payments, generate PDF payslips
- **Announcements**: Create and manage company-wide announcements

### Employee Features
- **Dashboard**: Personal statistics overview
- **Leave Management**: Apply for leaves and track status
- **Attendance**: Clock in/out and view attendance history
- **Payroll**: View salary details and download payslips
- **Announcements**: View company announcements

## 🛠️ Technology Stack

### Frontend
- React.js 18
- Tailwind CSS
- Framer Motion (animations)
- React Router DOM
- Axios
- React Toastify
- Recharts
- Date-fns

### Backend
- Node.js
- Express.js
- Supabase (PostgreSQL)
- JWT Authentication
- Bcrypt.js
- PDFKit (payslip generation)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- Supabase account (free tier works)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the backend directory:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

**Get Supabase credentials:**
- Go to [Supabase Dashboard](https://supabase.com)
- Create a new project
- Go to Settings → API
- Copy Project URL, anon key, and service_role key

4. Create database tables:
- In Supabase dashboard, go to SQL Editor
- Run the SQL from `backend/config/schema.sql`

5. Seed the database:
```bash
npm run seed
```

6. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔐 Default Credentials

After setting up, create an admin user manually in MongoDB or use the register endpoint with role: 'admin'.

Example Admin:
- Email: admin@example.com
- Password: password123

## 📁 Project Structure

```
MinorProject/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── departmentController.js
│   │   ├── leaveController.js
│   │   ├── attendanceController.js
│   │   ├── payrollController.js
│   │   ├── announcementController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── Leave.js
│   │   ├── Attendance.js
│   │   ├── Payroll.js
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── payrollRoutes.js
│   │   ├── announcementRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── StatCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── contexts/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── EmployeeDashboard.jsx
    │   │   ├── Employees.jsx
    │   │   ├── Departments.jsx
    │   │   ├── AdminLeaves.jsx
    │   │   ├── EmployeeLeaves.jsx
    │   │   ├── EmployeeAttendance.jsx
    │   │   ├── AdminPayroll.jsx
    │   │   ├── EmployeePayroll.jsx
    │   │   └── Announcements.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🎨 Features Highlights

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/Employee)
- Protected routes
- Session persistence

### Modern UI/UX
- Responsive design (mobile + desktop)
- Dark/Light mode toggle
- Smooth animations with Framer Motion
- Toast notifications
- Loading states
- Confirmation modals

### API Endpoints

#### Auth
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

#### Employees
- GET `/api/employees` - Get all employees
- GET `/api/employees/:id` - Get employee by ID
- POST `/api/employees` - Create employee
- PUT `/api/employees/:id` - Update employee
- DELETE `/api/employees/:id` - Delete employee
- PUT `/api/employees/:id/approve` - Approve employee

#### Departments
- GET `/api/departments` - Get all departments
- POST `/api/departments` - Create department
- PUT `/api/departments/:id` - Update department
- DELETE `/api/departments/:id` - Delete department

#### Leaves
- GET `/api/leaves` - Get all leaves
- POST `/api/leaves` - Create leave request
- PUT `/api/leaves/:id/status` - Update leave status

#### Attendance
- GET `/api/attendance` - Get attendance records
- POST `/api/attendance/clock-in` - Clock in
- POST `/api/attendance/clock-out` - Clock out

#### Payroll
- GET `/api/payroll` - Get all payrolls
- POST `/api/payroll` - Create payroll
- PUT `/api/payroll/:id/paid` - Mark as paid
- GET `/api/payroll/:id/payslip` - Download payslip PDF

#### Announcements
- GET `/api/announcements` - Get all announcements
- POST `/api/announcements` - Create announcement
- PUT `/api/announcements/:id` - Update announcement
- DELETE `/api/announcements/:id` - Delete announcement

#### Dashboard
- GET `/api/dashboard/admin` - Get admin statistics
- GET `/api/dashboard/employee` - Get employee statistics

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Role-based authorization
- Input validation
- Error handling middleware

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎯 Future Enhancements

- Email notifications
- Advanced reporting and analytics
- Employee performance tracking
- Multi-language support
- File upload for documents
- Calendar integration
- Real-time notifications with WebSocket

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

Built with ❤️ for modern enterprise payroll management.
