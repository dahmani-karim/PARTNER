import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './stores/authStore';
import usePartnerStore from './stores/partnerStore';
import ScrollToTop from './components/ScrollToTop';

// Layouts
import Layout from './components/Layout/Layout';

// Public pages
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';

// Partner pages
import Dashboard from './pages/Dashboard/Dashboard';
import Apply from './pages/Apply/Apply';
import VideoSubmit from './pages/Videos/VideoSubmit';
import VideoHistory from './pages/Videos/VideoHistory';
import Profile from './pages/Profile/Profile';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ApplicationReview from './pages/Admin/ApplicationReview';
import VideoValidation from './pages/Admin/VideoValidation';
import PartnerManagement from './pages/Admin/PartnerManagement';
import PushNotifications from './pages/Admin/PushNotifications';
import UserList from './pages/Admin/UserList';
import UserDetail from './pages/Admin/UserDetail';

// 404
import NotFound from './pages/NotFound/NotFound';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);

  if (Number(user?.id) !== 1) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const loadMyData = usePartnerStore((s) => s.loadMyData);
  const loadConfigs = usePartnerStore((s) => s.loadConfigs);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
      loadMyData();
      loadConfigs();
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* Routes protégées avec Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/videos/submit" element={<VideoSubmit />} />
          <Route path="/videos" element={<VideoHistory />} />
          <Route path="/profile" element={<Profile />} />

          {/* Routes admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/applications" element={<AdminRoute><ApplicationReview /></AdminRoute>} />
          <Route path="/admin/videos" element={<AdminRoute><VideoValidation /></AdminRoute>} />
          <Route path="/admin/partners" element={<AdminRoute><PartnerManagement /></AdminRoute>} />
            <Route path="/admin/notifications" element={<AdminRoute><PushNotifications /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserList /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
