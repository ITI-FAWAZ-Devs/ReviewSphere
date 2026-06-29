import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navigation, Footer } from '@/components/landing';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const MentorDiscovery = lazy(() => import('@/pages/MentorDiscovery'));
const MentorProfilePage = lazy(() => import('@/pages/MentorProfilePage'));
const ProfileEditPage = lazy(() => import('@/pages/ProfileEditPage'));
const StudentDashboard = lazy(() => import('@/pages/StudentDashboard'));
const MentorDashboard = lazy(() => import('@/pages/MentorDashboard'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-muted border-t-rs-accent rounded-full animate-spin" />
    </div>
  );
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  if (user.role === 'MENTOR') return <Navigate to="/dashboard/mentor" replace />;
  return <Navigate to="/dashboard/student" replace />;
}

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* Pages with Navbar and Footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/mentors" element={<MentorDiscovery />} />
              <Route path="/mentors/:id" element={<MentorProfilePage />} />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <ProfileEditPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Standalone Pages without Navbar/Footer */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute roles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/mentor"
              element={
                <ProtectedRoute roles={['MENTOR']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/mentor/sessions"
              element={
                <ProtectedRoute roles={['MENTOR']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
