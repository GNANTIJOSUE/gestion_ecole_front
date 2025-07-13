import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import StudentNavbar from './components/StudentNavbar';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import StudentPaymentPage from './pages/StudentPaymentPage';
import Registration from './pages/Registration';
import Login from './pages/Login';
import SecretaryLogin from './pages/SecretaryLogin';
import SecretaryDashboard from './pages/SecretaryDashboard';
import Students from './pages/secretary/Students';
import Classes from './pages/secretary/Classes';
import Teachers from './pages/secretary/Teachers';
import Payments from './pages/secretary/Payments';
import Settings from './pages/secretary/Settings';
import StudentDetails from './pages/secretary/StudentDetails';
import Subjects from './pages/secretary/Subjects';
import TeacherDashboard from './pages/TeacherDashboard';
import GestionEleves from './pages/GestionEleves';
import EventsPage from './pages/secretary/EventsPage';
import PublicEventPage from './pages/secretary/PublicEventPage';
import ClassEventSelectionPage from './pages/secretary/ClassEventSelectionPage';
import ClassEventCreationPage from './pages/secretary/ClassEventCreationPage';
import PrivateEventPage from './pages/secretary/PrivateEventPage';
import TimetableSelectionPage from './pages/secretary/TimetableSelectionPage';
import ClassTimetablePage from './pages/secretary/ClassTimetablePage';
import { Box, Container, Paper } from '@mui/material';
import { purple, blue } from '@mui/material/colors';
import StudentTimetablePage from './pages/StudentTimetablePage';
import StudentSchedule from './pages/StudentSchedule';
import StudentPaymentReturn from './pages/StudentPaymentReturn';
import ReportCardsClasses from './pages/ReportCardsClasses';
import ReportCardsStudents from './pages/ReportCardsStudents';
import StudentReportCard from './pages/StudentReportCard';
import MyReportCard from './pages/MyReportCard';
import ChooseTrimester from './pages/ChooseTrimester';
import ParentDashboard from './pages/ParentDashboard';
import ParentChildProfile from './pages/ParentChildProfile';
import RolesManagement from './pages/secretary/RolesManagement';
import Discounts from './pages/secretary/Discounts';
import InscrptionPre from './pages/InscrptionPre';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const RegistrationWrapper = () => {
  const navigate = useNavigate();
  // Fournit une fonction onClose simple qui redirige l'utilisateur.
  return <Registration onClose={() => navigate('/login')} />;
};

function AppContent() {
  const location = useLocation();
  const hideNavbarOn = ['/teacher/dashboard', '/student/dashboard', '/student/payment', '/student/report-card', '/student/report-card/:trimester', '/student/choose-trimester', '/parent/dashboard'];

  // Masquer la navbar aussi sur la page emploi du temps étudiant et parent
  const hideNavbar =
    hideNavbarOn.includes(location.pathname) ||
    location.pathname.startsWith('/secretary/') ||
    location.pathname.startsWith('/student/schedule/') ||
    location.pathname.startsWith('/student/report-card/') ||
    location.pathname.startsWith('/parent/child/');

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<RegistrationWrapper />} />
        <Route path="/secretary-login" element={<SecretaryLogin />} />

        {/* Routes Étudiant */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/payment" element={<StudentPaymentPage />} />
        <Route path="/student/payment-return" element={<StudentPaymentReturn />} />
        <Route path="/student/timetable" element={<StudentTimetablePage />} />
        <Route path="/student/schedule/:studentId" element={<StudentSchedule />} />
        <Route path="/student/choose-trimester" element={<ChooseTrimester />} />
        <Route path="/student/report-card/:trimester" element={<MyReportCard />} />
        <Route path="/student/report-card" element={<MyReportCard />} />
        <Route path="/student/report-card/:studentId/:classId" element={<StudentReportCard />} />

        {/* Routes Secrétaire */}
        <Route path="/secretary/dashboard" element={<SecretaryDashboard />} />
        <Route path="/secretary/students" element={<Students />} />
        <Route path="/secretary/students/:id" element={<StudentDetails />} />
        <Route path="/secretary/classes" element={<Classes />} />
        <Route path="/secretary/teachers" element={<Teachers />} />
        <Route path="/secretary/payments" element={<Payments />} />
        <Route path="/secretary/settings" element={<Settings />} />
        <Route path="/secretary/subjects" element={<Subjects />} />
        <Route path="/secretary/gestion-eleves" element={<GestionEleves />} />
        <Route path="/secretary/events" element={<EventsPage />} />
        <Route path="/secretary/events/public" element={<PublicEventPage />} />
        <Route path="/secretary/events/class" element={<ClassEventSelectionPage />} />
        <Route path="/secretary/events/class/:classId" element={<ClassEventCreationPage />} />
        <Route path="/secretary/events/private" element={<PrivateEventPage />} />
        <Route path="/secretary/timetables" element={<TimetableSelectionPage />} />
        <Route path="/secretary/timetables/:classId" element={<ClassTimetablePage />} />
        <Route path="/secretary/report-cards" element={<ReportCardsClasses />} />
        <Route path="/secretary/report-cards/:classId" element={<ReportCardsStudents />} />
        <Route path="/secretary/report-cards/:classId/:studentId" element={<StudentReportCard />} />
        <Route path="/secretary/discounts" element={<Discounts />} />
        <Route path="/secretary/payments" element={<p>payments</p>} />
        <Route path="/secretary/settings" element={<p>settings</p>} />
        <Route path="/secretary/roles" element={<RolesManagement />} />
        <Route path="/secretary/inscription-pre" element={<InscrptionPre onClose={() => window.history.length > 1 ? window.history.back() : window.location.replace('/secretary/dashboard')} />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/parent/child/:childId" element={<ParentChildProfile />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
