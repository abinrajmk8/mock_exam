import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Hardcoded credentials for now
  const adminCredentials = {
    username: 'admin',
    password: 'admin123'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === adminCredentials.username && password === adminCredentials.password) {
      navigate('/admin-dashboard'); // Redirect to Admin Dashboard
    } else {
      setError('Invalid credentials!');
    }
  };

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default AdminLogin;
