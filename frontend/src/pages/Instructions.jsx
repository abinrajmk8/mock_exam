import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './Instructions.css';
import instructionsImage from '../public/instructions.jpg';

const Instructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const testName = location.state?.testName || 'KEAM 2025 MOCK TEST';

  const startTest = () => {
    localStorage.removeItem(`mockTestState_${id}`);
    navigate(`/test/${id}`, {
      state: {
        testName: testName,
        duration: location.state?.duration || 0,
        individualMarks: location.state?.individualMarks || 1,
        negativeMarks: location.state?.negativeMarks || 0
      }
    });
  };

  return (
    <div className="mock-test-container">
      <div className="instruction-container">
        <div className="instruction-image">
          <img src={instructionsImage} alt="Instructions" className="instruction-img" />
        </div>
        <button onClick={startTest} className="btn-start">Start Test</button>
      </div>
    </div>
  );
};

export default Instructions;