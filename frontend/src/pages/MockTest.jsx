import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './MockTest.css';
import BACKEND_URL from '../config';

const MockTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // Start at -1 until "Start" is clicked
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(location.state?.duration * 60 || 0); // Convert minutes to seconds
  const [testStarted, setTestStarted] = useState(false);
  const [visitMarks, setVisitMarks] = useState({});
  const testTitle = location.state?.testName || 'Mock Test';

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        console.log('Test ID:', id); // Debug log
        const questionsResponse = await axios.get(`${BACKEND_URL}/api/tests/${id}/questions`);
        console.log('Questions data:', questionsResponse.data);
        setQuestions(questionsResponse.data);
        setError(''); // Clear error on success
      } catch (error) {
        console.error('Error fetching test data:', error.message);
        setError('Questions not found or server error. Please try again or contact support.');
      }
    };
    fetchTestData();
  }, [id]);

  useEffect(() => {
    let timer;
    if (testStarted && timeLeft > 0 && !submitted) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [timeLeft, testStarted, submitted]);

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      if (newAnswers[questionId] === selectedOption) {
        delete newAnswers[questionId]; // Uncheck if the same option is selected again
      } else {
        newAnswers[questionId] = selectedOption;
      }
      return newAnswers;
    });
  };

  const calculateResult = () => {
    let correct = 0;
    const answeredQuestions = questions.filter(q => answers[q._id] !== undefined);
    answeredQuestions.forEach((q) => {
      const correctOption = q.options[q.answer];
      if (answers[q._id] === correctOption) correct++;
    });
    return {
      correct,
      total: answeredQuestions.length,
      unattempted: questions.length - answeredQuestions.length
    };
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const result = calculateResult();
    navigate('/result', { state: { userAnswers: answers, questions, title: testTitle, id, ...result } });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    if (testStarted && index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  const toggleVisitMark = (questionId) => {
    setVisitMarks((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const currentQuestion = questions[currentIndex] || {};
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startTest = () => {
    setTestStarted(true);
    setCurrentIndex(0); // Start with the first question
  };

  return (
    <div className="mock-test-container">
      <h2>{testTitle}</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="question-nav">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`question-circle ${currentIndex === index ? 'current' : ''} ${answers[questions[index]?._id] ? 'attended' : ''} ${visitMarks[questions[index]?._id] ? 'visit' : ''}`}
            onClick={() => handleJumpToQuestion(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <div className="test-content">
        <div className="question-box">
          {!testStarted ? (
            <div className="start-container">
              <button onClick={startTest} className="btn-start">
                Start Test
              </button>
            </div>
          ) : (
            <>
              <div className="timer">Time Left: {formatTime(timeLeft)}</div>
              {questions.length > 0 && currentIndex >= 0 && (
                <div className="question-content">
                  <p>
                    {currentIndex + 1}. {currentQuestion.question}
                  </p>
                  <div className="options">
                    {currentQuestion.options.map((option, idx) => (
                      <label key={idx} className="option-label">
                        <input
                          type="radio"
                          name={`question-${currentIndex}`}
                          value={option}
                          checked={answers[currentQuestion._id] === option}
                          onChange={() => handleOptionChange(currentQuestion._id, option)}
                        />
                        <span>{String.fromCharCode(65 + idx)}. {option}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => toggleVisitMark(currentQuestion._id)}
                    className="btn-visit"
                  >
                    {visitMarks[currentQuestion._id] ? 'Unmark Visit' : 'Mark for Visit'}
                  </button>
                  <div className="controls">
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="btn-nav"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentIndex === questions.length - 1}
                      className="btn-nav"
                    >
                      Next
                    </button>
                    <button onClick={handleSubmit} className="btn-submit">
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {submitted && (
            <div className="result-summary">
              <h3>Test Submitted!</h3>
              <p>Redirecting to results...</p>
            </div>
          )}
          {questions.length === 0 && !submitted && !error && <p>Loading questions...</p>}
        </div>
      </div>
    </div>
  );
};

export default MockTest;