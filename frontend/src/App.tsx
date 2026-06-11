import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumesPage from './pages/ResumesPage';
import JobsPage from './pages/JobsPage';
import AnalyzePage from './pages/AnalyzePage';
import HistoryPage from './pages/HistoryPage';
import AnalysisDetailPage from './pages/AnalysisDetailPage';
import ProfilePage from './pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/resumes" element={<ProtectedRoute><ResumesPage /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
                <Route path="/analyze" element={<ProtectedRoute><AnalyzePage /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/analyses/:id" element={<ProtectedRoute><AnalysisDetailPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
