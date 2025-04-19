import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MockTest from './pages/MockTest';
import Result from './pages/Result';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/test/:id" element={<MockTest />} />
      <Route path="/result" element={<Result />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
