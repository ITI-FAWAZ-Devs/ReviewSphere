import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

// Lazy-load the discovery page (it's the largest bundle)
const MentorDiscovery = lazy(() => import('@/pages/MentorDiscovery'));

function PageSpinner() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* ── Auth ──────────────────────────────────────────── */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ── Mentor Discovery (main landing page) ──────────── */}
          <Route path="/mentors"     element={<MentorDiscovery />} />
          <Route path="/mentors/:id" element={<MentorDiscovery />} />

          {/* ── Default redirect ──────────────────────────────── */}
          <Route path="*" element={<Navigate to="/mentors" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
