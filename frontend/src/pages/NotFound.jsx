import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/instructions/6804a6a54bcf4a4370d68463');
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you’re looking for doesn’t exist.</p>
      <button onClick={handleRedirect} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Go to Instructions
      </button>
    </div>
  );
}

export default NotFound;
