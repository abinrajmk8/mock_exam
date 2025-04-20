import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import MockTest from './pages/MockTest';
import Result from './pages/Result';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Instructions from './pages/Instructions';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect page refresh using sessionStorage
  useEffect(() => {
    const isReloaded = sessionStorage.getItem('isReloaded');
    if (!isReloaded) {
      sessionStorage.setItem('isReloaded', 'true');
      // Redirect to the root URL on initial load or refresh
      window.location.href = 'https://sfigcek-keammocktest.onrender.com/';
    } else {
      // Clear the flag on subsequent navigation to avoid infinite redirects
      sessionStorage.setItem('isReloaded', 'true');
    }
    // Cleanup on unmount
    return () => {
      sessionStorage.removeItem('isReloaded');
    };
  }, [navigate]);

  // Show alert on unmatched routes
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
    </Routes>
  );
}

export default App;
