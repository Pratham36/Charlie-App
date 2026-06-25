import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DailyLogPage from './pages/DailyLogPage.jsx';
import TrainingPage from './pages/TrainingPage.jsx';
import HealthPage from './pages/HealthPage.jsx';
import PhotosPage from './pages/PhotosPage.jsx';
import MilestonesPage from './pages/MilestonesPage.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-charlie-ink flex items-center justify-center">
      <div className="text-charlie-amber font-mono animate-pulse">Loading...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/log" element={<ProtectedRoute><DailyLogPage /></ProtectedRoute>} />
      <Route path="/log/:id" element={<ProtectedRoute><DailyLogPage /></ProtectedRoute>} />
      <Route path="/training" element={<ProtectedRoute><TrainingPage /></ProtectedRoute>} />
      <Route path="/health" element={<ProtectedRoute><HealthPage /></ProtectedRoute>} />
      <Route path="/photos" element={<ProtectedRoute><PhotosPage /></ProtectedRoute>} />
      <Route path="/milestones" element={<ProtectedRoute><MilestonesPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
