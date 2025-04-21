import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Instructions.css';
import instructionsImage from '../public/instructions.jpg';
import i2Image from '../public/i2.jpg';

const Instructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const testName = location.state?.testName || 'KEAM 2025 MOCK TEST';
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startTest = () => {
    localStorage.removeItem(`mockTestState_6804a6a54bcf4a4370d68463`);
    navigate('/test/6804a6a54bcf4a4370d68463', {
      state: {
        testName: testName,
        duration: location.state?.duration || 0,
        individualMarks: location.state?.individualMarks || 1,
        negativeMarks: location.state?.negativeMarks || 0
      }
    });
  };

  const isSmallScreen = windowWidth <= 768;

  return (
    <div
      className="instruction-page-container relative h-screen"
      style={{ backgroundImage: `url(${isSmallScreen ? i2Image : instructionsImage})` }}
    >
      <div className="instruction-container absolute inset-0 flex items-end justify-center">
        <button
          onClick={startTest}
          className="btn-start absolute bottom-4 z-10 bg-opacity-90"
        >
          Start Test
        </button>
      </div>
      <div className="footer bg-white w-full"></div>
    </div>
  );
};

export default Instructions;