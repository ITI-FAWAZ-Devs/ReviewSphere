import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/signup" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
