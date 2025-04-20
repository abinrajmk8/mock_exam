import { useLocation, useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './Result.css';
import BACKEND_URL from '../config';

function Result() {
  const { state } = useLocation();
  const { userAnswers, questions, title, id, individualMarks = 1, negativeMarks = 0, unattempted: initialUnattempted } = state || {};
  const navigate = useNavigate();
  const questionRefs = useRef([]);
  const [testDetails, setTestDetails] = useState({
    testName: title,
    individualMarks: individualMarks,
    negativeMarks: negativeMarks,
    duration: 0
  });

  useEffect(() => {
    if (id) {
      axios.get(`${BACKEND_URL}/api/tests/${id}`)
        .then(response => {
          const details = response.data;
          setTestDetails({
            testName: details.name || title,
            individualMarks: details.individualMarks || individualMarks,
            negativeMarks: details.negativeMarking || negativeMarks,
            duration: details.duration || 0
          });
        })
        .catch(error => {
          console.error('Error fetching test details:', error.message);
        });
    }
  }, [id, title, individualMarks, negativeMarks]);

  if (!state) {
    return <div className="result-page"><p>Error: No result data available. <button onClick={() => navigate('/')} className="btn-back">Back to Home</button></p></div>;
  }

  const recalculateResults = () => {
    let correctCount = 0;
    let wrongCount = 0;
    let totalScore = 0;
    const attemptedQuestions = [];

    questions.forEach((q) => {
      const userAnswer = userAnswers && userAnswers[q._id] !== undefined ? userAnswers[q._id] : null;
      const correctOption = q.options && q.answer !== undefined ? q.options[q.answer] : null;
      if (userAnswer !== null) {
        attemptedQuestions.push(q);
        if (userAnswer === correctOption) {
          correctCount++;
          totalScore += testDetails.individualMarks;
        } else {
          wrongCount++;
          totalScore += testDetails.negativeMarks;
        }
      }
    });
    const skipped = questions.length - attemptedQuestions.length;
    const maxScore = questions.length * testDetails.individualMarks;

    return {
      attempted: attemptedQuestions.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      skipped: skipped,
      obtainedScore: totalScore,
      totalScore: maxScore
    };
  };

  const { attempted, correctAnswers, wrongAnswers, skipped, obtainedScore, totalScore } = recalculateResults();
  const percentage = totalScore > 0 ? ((obtainedScore / totalScore) * 100).toFixed(2) : 0;

  const handleJumpToQuestion = (index) => {
    if (questionRefs.current[index]) {
      questionRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (questionRefs.current[0]) {
      questionRefs.current[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="result-page">
      <div className="navigation-bar">
        <button onClick={() => navigate('/')} className="btn-back">Back to Menu</button>
        <button onClick={() => navigate('/')} className="btn-again">Take Again</button>
      </div>
      <h1 className="test-title">{testDetails.testName}</h1>
      <div className="performance-summary">
        <h2>Results Overview</h2>
        <div className="status-container">
          <div className="status-cards">
            <div className="status-card">
              <div className="status-value" style={{ color: '#007bff' }}>{attempted}</div>
              <div className="status-label">Attempted</div>
            </div>
            <div className="status-card">
              <div className="status-value" style={{ color: '#28a745' }}>{correctAnswers}</div>
              <div className="status-label">Correct Answers</div>
            </div>
            <div className="status-card">
              <div className="status-value" style={{ color: '#dc3545' }}>{wrongAnswers}</div>
              <div className="status-label">Wrong Answers</div>
            </div>
            <div className="status-card">
              <div className="status-value" style={{ color: '#ffc107' }}>{skipped}</div>
              <div className="status-label">Skipped</div>
            </div>
            <div className="status-card">
              <div className="status-value" style={{ color: '#007bff' }}>{obtainedScore.toFixed(2)}</div>
              <div className="status-label">Obtained Score</div>
            </div>
            <div className="status-card">
              <div className="status-value" style={{ color: '#007bff' }}>{totalScore.toFixed(2)}</div>
              <div className="status-label">Total Score</div>
            </div>
            <div className="status-card">
              <div className="status-value" style={{ color: '#007bff' }}>{percentage}%</div>
              <div className="status-label">Percentage</div>
            </div>
          </div>
          <div className="status-details">
            <p><strong style={{ color: '#000' }}>Duration: {testDetails.duration} min</strong></p>
            <p><strong style={{ color: '#000' }}>Individual Marks: {testDetails.individualMarks}</strong></p>
            <p><strong style={{ color: '#000' }}>Negative Marks: {testDetails.negativeMarks}</strong></p>
          </div>
        </div>
      </div>
      <div className="question-nav">
        {questions && questions.map((q, index) => {
          const userAnswer = userAnswers && userAnswers[q._id] !== undefined ? userAnswers[q._id] : null;
          const correctOption = q.options && q.answer !== undefined ? q.options[q.answer] : null;
          const isCorrect = userAnswer === correctOption;
          const isWrong = userAnswer !== null && !isCorrect;
          const isSkipped = !userAnswer && index < questions.length - 1;
          const isCurrent = index === 0; // Assuming the first question is current on load
          return (
            <div
              key={index}
              className={`question-circle ${isCurrent ? 'current' : ''} ${isCorrect ? 'attended' : ''} ${isWrong ? 'wrong' : ''} ${isSkipped ? 'skipped' : ''}`}
              onClick={() => handleJumpToQuestion(index)}
              title={`Jump to Question ${index + 1}`}
            >
              {index + 1}
            </div>
          );
        })}
      </div>
      <div className="questions-review">
        <h3>Question Review</h3>
        {questions && questions.length > 0 ? (
          questions.map((q, index) => {
            const userAnswer = userAnswers && userAnswers[q._id] !== undefined ? userAnswers[q._id] : null;
            const correctOption = q.options && q.answer !== undefined ? q.options[q.answer] : null;
            const isCorrect = userAnswer === correctOption;
            const userChoiceIndex = userAnswer !== null ? q.options.indexOf(userAnswer) : -1;
            return (
              <div key={index} ref={el => questionRefs.current[index] = el} className={`question-card ${!userAnswer ? 'unattempted' : isCorrect ? 'correct' : 'incorrect'}`}>
                <h4>Question {index + 1}</h4>
                <p className="question-text">{q.question}</p>
                {q.imageUrl && (
                  <div className="question-image">
                    <img
                      src={`${BACKEND_URL}${q.imageUrl}`}
                      alt={`Question ${index + 1}`}
                      className="question-img"
                      onError={(e) => console.log('Image load error for question', index + 1, ':', e.target.src)}
                    />
                  </div>
                )}
                <div className="options-list">
                  {q.options && q.options.map((opt, i) => {
                    const isCorrectAnswer = i === q.answer;
                    const isUserSelected = i === userChoiceIndex && userChoiceIndex !== -1;
                    return (
                      <div key={i} className="option-row">
                        <span className="option-label">{String.fromCharCode(65 + i)}:</span>
                        <span
                          className={`option-value ${isCorrectAnswer ? 'correct-answer' : ''} ${isUserSelected ? (isCorrect ? 'selected-correct' : 'selected-incorrect') : ''}`}
                        >
                          {opt || 'N/A'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className={`result-status ${!userAnswer ? 'unattempted' : isCorrect ? 'correct' : 'incorrect'}`}>
                  {userAnswer === null ? '❓ Skipped' : isCorrect ? '✅ Correct' : `❌ Wrong (Correct: ${correctOption || 'undefined'})`}
                </p>
                <p><strong>Your Answer:</strong> {userChoiceIndex !== -1 ? `${String.fromCharCode(65 + userChoiceIndex)}. ${userAnswer}` : 'Not answered'}</p>
                <p><strong>Score Impact:</strong> {userAnswer === null ? '0' : isCorrect ? `+${testDetails.individualMarks}` : `${testDetails.negativeMarks}`}</p>
              </div>
            );
          })
        ) : (
          <p>No questions to review.</p>
        )}
      </div>
    </div>
  );
}

export default Result;