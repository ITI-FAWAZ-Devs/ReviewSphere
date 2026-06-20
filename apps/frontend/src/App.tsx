import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import LandingPage from '@/pages/LandingPage';
import MentorProfilePage from '@/pages/MentorProfilePage';
import StudentDashboard from '@/pages/StudentDashboard';
import { Navigation, Footer } from '@/components/landing';

const MentorDiscovery = lazy(() => import('@/pages/MentorDiscovery'));
const ProfileEditPage = lazy(() => import('@/pages/ProfileEditPage'));

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-muted border-t-landing-primary rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSpinner />}>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/mentors" element={<MentorDiscovery />} />
              <Route path="/mentors/:id" element={<MentorProfilePage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
