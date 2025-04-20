import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import MockTest from './pages/MockTest';
import Result from './pages/Result';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Instructions from './pages/Instructions';

function App() {
  const location = useLocation();

  // Detect page refresh using sessionStorage with timestamp
  useEffect(() => {
    const lastLoad = sessionStorage.getItem('lastLoad');
    const currentTime = Date.now();
    if (lastLoad) {
      const timeDiff = currentTime - parseInt(lastLoad, 10);
      // If reloaded within a short interval (e.g., < 1000ms), assume refresh
      if (timeDiff < 1000) {
        window.location.href = 'https://sfigcek-keammocktest.onrender.com/';
      }
    }
    sessionStorage.setItem('lastLoad', currentTime.toString());
    // Cleanup on unmount
    return () => {
      sessionStorage.removeItem('lastLoad');
    };
  }, []);

  // Show alert only for unmatched routes, not on initial load
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/instructions/6804a6a54bcf4a4370d68463') {
      alert('Page not found. Redirecting to Instructions page.');
    }
  }, [location.pathname]); // Only trigger on route change, not initial mount

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
