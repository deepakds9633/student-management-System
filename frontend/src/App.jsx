import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy loading components for performance optimization
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const StaffDashboard = lazy(() => import('./components/StaffDashboard'));
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const ListStudentComponent = lazy(() => import('./components/ListStudentComponent'));
const StudentComponent = lazy(() => import('./components/StudentComponent'));
const StudentProfile = lazy(() => import('./components/StudentProfile'));
const LoginComponent = lazy(() => import('./components/LoginComponent'));
const AttendanceComponent = lazy(() => import('./components/AttendanceComponent'));
const MarkComponent = lazy(() => import('./components/MarkComponent'));
const ReportsComponent = lazy(() => import('./components/ReportsComponent'));
const UserManagementSystem = lazy(() => import('./components/UserManagementSystem'));
const LeaveManagement = lazy(() => import('./components/LeaveManagement'));
const NoticeBoard = lazy(() => import('./components/NoticeBoard'));
const NoticeDetail = lazy(() => import('./components/NoticeDetail'));
const AssignmentPage = lazy(() => import('./components/AssignmentPage'));
const ExportReports = lazy(() => import('./components/ExportReports'));
const AcademicCalendar = lazy(() => import('./components/AcademicCalendar'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-mc-primary/20 border-t-mc-primary rounded-full animate-spin"></div>
      <p className="text-mc-text-muted text-sm font-medium">Loading Page...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MainLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path='/login' element={<LoginComponent />} />
              <Route path='/admin-dashboard' element={<AdminDashboard />} />
              <Route path='/staff-dashboard' element={<StaffDashboard />} />
              <Route path='/student-dashboard' element={<StudentDashboard />} />
              <Route path='/attendance' element={<AttendanceComponent />} />
              <Route path='/marks' element={<MarkComponent />} />
              <Route path='/reports' element={<ReportsComponent />} />
              <Route path='/user-management' element={<UserManagementSystem />} />
              <Route path='/leaves' element={<LeaveManagement />} />
              <Route path='/notices' element={<NoticeBoard />} />
              <Route path='/notices/:id' element={<NoticeDetail />} />
              <Route path='/assignments' element={<AssignmentPage />} />
              <Route path='/export' element={<ExportReports />} />
              <Route path='/calendar' element={<AcademicCalendar />} />
              <Route path='/settings' element={<SettingsPage />} />
              <Route path='/students' element={<ListStudentComponent />} />
              <Route path='/add-student' element={<StudentComponent />} />
              <Route path='/edit-student/:id' element={<StudentComponent />} />
              <Route path='/students/:id' element={<StudentProfile />} />
              <Route path='/' element={<LoginComponent />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
