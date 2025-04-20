import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './Instructions.css';

const Instructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const testName = location.state?.testName || 'KEAM 2025 MOCK TEST';

  const startTest = () => {
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
        <div className="instruction-header">SFI GCEK</div>
        <h2>{testName}</h2>
        <div className="instruction-box">
          <h3>General Instructions</h3>
          <ul>
            <li>Read instructions carefully.</li>
            <li>This is a mock test by <strong>SFI Govt. College of Engineering Kannur</strong>.</li>
            <li>Test available for a <strong>specific time</strong>.</li>
            <li>After test ends, redirected to <strong>statistics screen</strong>.</li>
            <li>Timer on top right shows <strong>time left</strong>.</li>
            <li>Questions shown one by one.</li>
            <li>Use <strong>"Save & Next"</strong> or <strong>"Save & Previous"</strong> to navigate.</li>
            <li>Select answers by clicking option boxes.</li>
            <li>Save response with <strong>"Save & Next"</strong> or <strong>"Save & Previous"</strong>.</li>
            <li>Clear response with <strong>"Clear Response"</strong> button.</li>
            <li>Mark for review with <strong>"Mark for Review"</strong> button; yellow for review, violet if answered. Clear by reselecting.</li>
            <li><strong>"Answered and Marked for Review"</strong> counted in evaluation.</li>
            <li>Use question palette to jump to any question.</li>
            <li>Answered questions highlighted <strong>green</strong> in palette.</li>
            <li>Top left shows total and answered questions.</li>
            <li>Timer at zero redirects to <strong>statistics page</strong>.</li>
            <li className="asterisk-note">**Trial run for online exam.</li>
            <li>This will not consider any other priority for any time.</li>
            <li>Ensure a stable internet connection for uninterrupted experience.</li>
            <li>Do not refresh the page during the test to avoid data loss.</li>
            <li>Review all answers before submitting to ensure accuracy.</li>
            <li>Contact support if technical issues arise during the test.</li>
          </ul>
          <p className="declaration">
           ALl the Best :)
          </p>
          <button onClick={startTest} className="btn-start">
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;