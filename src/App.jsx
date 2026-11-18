import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import useAuthStore from './stores/authStore';
import usePartnerStore from './stores/partnerStore';
import { useTranslation } from './i18n';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout/Layout';
import PublicLayout from './components/PublicLayout/PublicLayout';
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import PwaExperience from './pwa/PwaExperience';

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Apply = lazy(() => import('./pages/Apply/Apply'));
const VideoSubmit = lazy(() => import('./pages/Videos/VideoSubmit'));
const VideoHistory = lazy(() => import('./pages/Videos/VideoHistory'));
const Partnership = lazy(() => import('./pages/Profile/Profile'));
const Profile = lazy(() => import('./pages/Account/Profile'));
const Settings = lazy(() => import('./pages/Account/Settings'));
const Security = lazy(() => import('./pages/Account/Security'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const ApplicationReview = lazy(() => import('./pages/Admin/ApplicationReview'));
const VideoValidation = lazy(() => import('./pages/Admin/VideoValidation'));
const PartnerManagement = lazy(() => import('./pages/Admin/PartnerManagement'));
const PushNotifications = lazy(() => import('./pages/Admin/PushNotifications'));
const UserList = lazy(() => import('./pages/Admin/UserAdministration'));
const UserDetail = lazy(() => import('./pages/Admin/UserAdministration').then(module => ({ default: module.UserDetail })));
const QuotaSettings = lazy(() => import('./pages/Admin/QuotaSettings'));
const About = lazy(() => import('./pages/About/About'));
const Guide = lazy(() => import('./pages/About/Guide'));
const Legal = lazy(() => import('./pages/About/Legal'));
const Terms = lazy(() => import('./pages/About/Terms'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

function ProtectedRoute({ children }) {
  const connected = useAuthStore(s => s.isAuthenticated);
  const location = useLocation();
  return connected ? children : <Navigate to="/login" state={{ from: location }} replace />;
}
function AdminRoute({ children }) {
  const user = useAuthStore(s => s.user);
  return <ProtectedRoute>{Number(user?.id) === 1 ? children : <Navigate to="/dashboard" replace />}</ProtectedRoute>;
}
function AdaptiveLayout({ children }) {
  const connected = useAuthStore(s => s.isAuthenticated);
  return connected ? <Layout>{children}</Layout> : <PublicLayout>{children}</PublicLayout>;
}
export default function App() {
  const { t, language } = useTranslation();
  const connected = useAuthStore(s => s.isAuthenticated);
  const token = useAuthStore(s => s.token);
  useEffect(() => {
    const expire = event => {
      if (event.detail.token === useAuthStore.getState().token) useAuthStore.getState().logout();
    };
    window.addEventListener('partner-session-expired', expire);
    return () => window.removeEventListener('partner-session-expired', expire);
  }, []);
  useEffect(() => {
    if (!token) return;
    useAuthStore.getState().refreshUser();
    usePartnerStore.getState().loadMyData();
    usePartnerStore.getState().loadConfigs();
  }, [token]);
  return <Router><ScrollToTop /><PwaExperience language={language} />
    <Suspense fallback={<p role="status">{t('Chargement...')}</p>}><Routes>
      <Route path="/" element={<PublicLayout home><Landing /></PublicLayout>} />
      <Route path="/login" element={connected ? <Navigate to="/dashboard" replace /> : <PublicLayout><Login /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><Login key="recovery" recovery /></PublicLayout>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/videos/submit" element={<VideoSubmit />} />
        <Route path="/videos" element={<VideoHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/advanced" element={<Partnership />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/security" element={<Security />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/applications" element={<AdminRoute><ApplicationReview /></AdminRoute>} />
        <Route path="/admin/videos" element={<AdminRoute><VideoValidation /></AdminRoute>} />
        <Route path="/admin/partners" element={<AdminRoute><PartnerManagement /></AdminRoute>} />
        <Route path="/admin/notifications" element={<AdminRoute><PushNotifications /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UserList /></AdminRoute>} />
        <Route path="/admin/users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
        <Route path="/admin/quotas" element={<AdminRoute><QuotaSettings /></AdminRoute>} />
      </Route>
      {[['/about', About], ['/about/guide', Guide], ['/legal', Legal], ['/about/terms', Terms]].map(([path, Component]) =>
        <Route key={path} path={path} element={<AdaptiveLayout><Component /></AdaptiveLayout>} />)}
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes></Suspense>
  </Router>;
}
