import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import BACKEND_URL from '../config';

function Home() {
  const navigate = useNavigate();
  const [mockTests, setMockTests] = useState([]);

  useEffect(() => {
    const fetchMockTests = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/tests`);
        const data = await response.json();
        setMockTests(data);
      } catch (error) {
        console.error('Error fetching mock tests:', error);
      }
    };
    fetchMockTests();
  }, []);

  const handleTestClick = (test) => {
    navigate(`/test/${test._id}`, {
      state: {
        testName: test.name,
        duration: test.duration,
        individualMarks: test.individualMarks || 1, // Default to 1 if not provided
        negativeMarks: test.negativeMarks || 0 // Default to 0 if not provided
      }
    });
  };

  return (
    <div className="home">
      <div className="admin-login-btn">
        <button onClick={() => navigate('/admin-login')}>Admin Login</button>
      </div>

      <h1>🎯 KEAM Mock Test Series</h1>
      <p>Select a mock test below to begin your practice:</p>

      <div className="test-grid">
        {mockTests.length > 0 ? (
          mockTests.map((test) => (
            <div key={test._id} className="test-card">
              <h2>{test.name}</h2>
              <p>{test.description || 'No description available.'}</p>
              <p><strong>Duration:</strong> {test.duration || 'Not specified'}</p>
              <button onClick={() => handleTestClick(test)}>Attempt</button>
            </div>
          ))
        ) : (
          <p>Loading mock tests...</p>
        )}
      </div>
    </div>
  );
}

export default Home;