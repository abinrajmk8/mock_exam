import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MockTest from './pages/MockTest';
import Result from './pages/Result';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Instructions from './pages/Instructions';

function App() {
  const location = useLocation();

  // Show alert on initial load or reload to unmatched routes
  if (location.pathname !== '/' && location.pathname !== '/instructions/6804a6a54bcf4a4370d68463') {
    alert('Page not found. Redirecting to Instructions page.');
  }

  return (
    <Routes>
      <Route path="/" element={<Instructions />} />
      <Route
        path="/instructions/6804a6a54bcf4a4370d68463"
        element={<Instructions />}
      />
      <Route
        path="/instructions/:id"
        element={
          <Navigate
            to="/instructions/6804a6a54bcf4a4370d68463"
            replace
          />
        }
      />
      <Route
        path="/test/6804a6a54bcf4a4370d68463"
        element={<MockTest />}
      />
      <Route
        path="/test/:id"
        element={
          <Navigate
            to="/instructions/6804a6a54bcf4a4370d68463"
            replace
          />
        }
      />
      <Route path="/result" element={<Result />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route
        path="*"
        element={<Navigate to="/instructions/6804a6a54bcf4a4370d68463" replace />}
      />
    </Routes>
  );
}

export default App;