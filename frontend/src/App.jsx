import './App.css'
import FooterComponent from './components/FooterComponent'
import HeaderComponent from './components/HeaderComponent'
import ListStudentComponent from './components/ListStudentComponent'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StudentComponent from './components/StudentComponent'
import LoginComponent from './components/LoginComponent'
import StaffDashboard from './components/StaffDashboard'
import StudentDashboard from './components/StudentDashboard'
import AttendanceComponent from './components/AttendanceComponent'
import MarkComponent from './components/MarkComponent'
import ReportsComponent from './components/ReportsComponent'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import LeaveManagement from './components/LeaveManagement'
import NoticeBoard from './components/NoticeBoard'
import NoticeDetail from './components/NoticeDetail'
import AssignmentPage from './components/AssignmentPage'
import ExportReports from './components/ExportReports'
import AdminDashboard from './components/AdminDashboard'
import AcademicCalendar from './components/AcademicCalendar'

import { ThemeProvider } from './contexts/ThemeContext';

function App() {

  return (
    <ThemeProvider>
      <BrowserRouter>
        <HeaderComponent />
        <Routes>
          <Route path='/login' element={<LoginComponent />}></Route>
          <Route path='/admin-dashboard' element={<AdminDashboard />}></Route>
          <Route path='/staff-dashboard' element={<StaffDashboard />}></Route>
          <Route path='/student-dashboard' element={<StudentDashboard />}></Route>
          <Route path='/attendance' element={<AttendanceComponent />}></Route>
          <Route path='/marks' element={<MarkComponent />}></Route>
          <Route path='/reports' element={<ReportsComponent />}></Route>
          <Route path='/analytics' element={<AnalyticsDashboard />}></Route>
          <Route path='/leaves' element={<LeaveManagement />}></Route>
          <Route path='/notices' element={<NoticeBoard />}></Route>
          <Route path='/notices/:id' element={<NoticeDetail />}></Route>
          <Route path='/assignments' element={<AssignmentPage />}></Route>
          <Route path='/export' element={<ExportReports />}></Route>
          <Route path='/calendar' element={<AcademicCalendar />}></Route>
          <Route path='/' element={<LoginComponent />}></Route>
          <Route path='/students' element={<ListStudentComponent />}></Route>
          <Route path='/add-student' element={<StudentComponent />}></Route>
          <Route path='/edit-student/:id' element={<StudentComponent />}></Route>
        </Routes>
        <FooterComponent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
