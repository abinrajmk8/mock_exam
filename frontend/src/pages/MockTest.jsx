import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './MockTest.css';
import BACKEND_URL from '../config';

const MockTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = '6804a6a54bcf4a4370d68463'; // Hardcoded ID
  const [questions, setQuestions] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(location.state?.duration * 60 || 1800); // Default to 30 minutes if no duration
  const [testStarted, setTestStarted] = useState(true);
  const [visitMarks, setVisitMarks] = useState({});
  const [dataFetched, setDataFetched] = useState(false);
  const testTitle = location.state?.testName || 'Mock Test';

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted && (currentIndex >= 0 || Object.keys(answers).length > 0)) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentIndex, answers, submitted]);

  useEffect(() => {
    if (!dataFetched) {
      const fetchTestData = async () => {
        try {
          const questionsResponse = await axios.get(`${BACKEND_URL}/api/questions/${id}`);
          if (Array.isArray(questionsResponse.data)) {
            const formattedQuestions = questionsResponse.data.map(q => ({
              ...q,
              options: Array.isArray(q.options) ? q.options : [],
            }));
            setQuestions(formattedQuestions);
          } else {
            setQuestions([]);
            setError('Invalid data format received from server.');
          }
          setError('');
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching test data:', error.message);
          setError('Questions not found or server error. Please try again or contact support.');
          setDataFetched(true);
        }
      };
      fetchTestData();
    }
  }, [id, dataFetched]);

  useEffect(() => {
    if (questions.length > 0 && testStarted && currentIndex === -1) {
      const groupBySubject = (questions) => {
        const groups = { phy: [], chem: [], maths: [] };
        questions.forEach((q) => {
          const subject = q.subjects && q.subjects.length > 0 ? q.subjects[0] : null;
          if (subject === 'phy') groups.phy.push(q);
          else if (subject === 'chem') groups.chem.push(q);
          else if (subject === 'maths') groups.maths.push(q);
        });
        return {
          phy: shuffleArray(groups.phy),
          chem: shuffleArray(groups.chem),
          maths: shuffleArray(groups.maths),
        };
      };
      const subjectGroups = groupBySubject(questions);
      const shuffled = [...subjectGroups.phy, ...subjectGroups.chem, ...subjectGroups.maths];
      setShuffledQuestions(shuffled);
      if (shuffled.length > 0) setCurrentIndex(0);
      else setError('No questions available for this test.');
    }
  }, [questions, testStarted, currentIndex]);

  useEffect(() => {
    let timer;
    if (testStarted && timeLeft > 0 && !submitted && shuffledQuestions.length > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [timeLeft, testStarted, submitted, shuffledQuestions]);

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      if (newAnswers[questionId] === selectedOption) {
        delete newAnswers[questionId];
      } else {
        newAnswers[questionId] = selectedOption;
      }
      saveToLocalStorage();
      return newAnswers;
    });
  };

  const clearResponse = (questionId) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      saveToLocalStorage();
      return newAnswers;
    });
  };

  const calculateResult = () => {
    let correct = 0;
    const answeredQuestions = shuffledQuestions.filter(q => answers[q._id] !== undefined);
    answeredQuestions.forEach((q) => {
      const correctOption = q.options[q.answer];
      if (answers[q._id] === correctOption) correct++;
    });
    return {
      correct,
      total: answeredQuestions.length,
      unattempted: shuffledQuestions.length - answeredQuestions.length,
    };
  };

  const handleSubmit = () => {
    if (!submitted) {
      setSubmitted(true);
      const result = calculateResult();
      navigate('/result', { state: { userAnswers: answers, questions: shuffledQuestions, title: testTitle, id, ...result } });
      clearLocalStorage();
    }
  };

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      saveToLocalStorage();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    if (testStarted && index >= 0 && index < shuffledQuestions.length) {
      setCurrentIndex(index);
      saveToLocalStorage();
    }
  };

  const toggleVisitMark = (questionId) => {
    setVisitMarks((prev) => {
      const newVisitMarks = { ...prev, [questionId]: !prev[questionId] };
      saveToLocalStorage();
      return newVisitMarks;
    });
  };

  const currentQuestion = shuffledQuestions[currentIndex] || {};
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const groupBySubject = (questions) => {
    const groups = { phy: [], chem: [], maths: [] };
    questions.forEach((q, index) => {
      const subject = q.subjects && q.subjects.length > 0 ? q.subjects[0] : null;
      if (subject === 'phy') groups.phy.push({ q, index });
      else if (subject === 'chem') groups.chem.push({ q, index });
      else if (subject === 'maths') groups.maths.push({ q, index });
    });
    return groups;
  };

  const subjectGroups = groupBySubject(shuffledQuestions);

  const saveToLocalStorage = () => {
    const state = { currentIndex, answers, visitMarks };
    localStorage.setItem(`mockTestState_${id}`, JSON.stringify(state));
  };

  const clearLocalStorage = () => {
    localStorage.removeItem(`mockTestState_${id}`);
  };

  return (
    <div className="mock-test-container">
      <h2>{testTitle}</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="test-content">
        <div className="question-nav-container">
          <div className="question-nav">
            <div className="nav-row">
              {shuffledQuestions.map((q, index) => {
                const subject = q.subjects && q.subjects.length > 0 ? q.subjects[0] : null;
                let borderColor = '#ddd';
                if (subject === 'phy') borderColor = '#00BCD4';
                else if (subject === 'chem') borderColor = '#FF5722';
                else if (subject === 'maths') borderColor = '#4CAF50';
                let className = `question-circle ${currentIndex === index ? 'current' : ''}`;
                if (visitMarks[q._id]) {
                  className += ' visit';
                } else if (answers[q._id]) {
                  className += ' attended';
                }
                return (
                  <div
                    key={index}
                    className={className}
                    style={{ borderColor }}
                    onClick={() => handleJumpToQuestion(index)}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, gap: '20px' }}>
          <div className="question-panel">
            {testStarted && (
              <div className="timer">Time Left: {formatTime(timeLeft)}</div>
            )}
            {shuffledQuestions.length > 0 && currentIndex >= 0 && currentQuestion && Object.keys(currentQuestion).length > 0 && (
              <div className="question-content">
                <div className="subject-section">
                  {currentQuestion.subjects && currentQuestion.subjects[0] === 'phy' && <h3>Physics</h3>}
                  {currentQuestion.subjects && currentQuestion.subjects[0] === 'chem' && <h3>Chemistry</h3>}
                  {currentQuestion.subjects && currentQuestion.subjects[0] === 'maths' && <h3>Maths</h3>}
                  <div className="current-question">
                    <p>Question {currentIndex + 1}: {currentQuestion.question || 'No question text available'}</p>
                    {currentQuestion.imageUrl && (
                      <div className="question-image">
                        <img
                          src={`${BACKEND_URL}${currentQuestion.imageUrl}`}
                          alt="Question"
                          className="question-img"
                          onError={(e) => console.log('Image load error:', e.target.src)}
                        />
                      </div>
                    )}
                    <div className="options">
                      {currentQuestion.options && currentQuestion.options.length > 0 ? (
                        currentQuestion.options.map((option, idx) => (
                          <label key={idx} className="option-label">
                            <input
                              type="radio"
                              name={`question-${currentIndex}`}
                              value={option}
                              checked={answers[currentQuestion._id] === option}
                              onChange={() => handleOptionChange(currentQuestion._id, option)}
                            />
                            <span>{String.fromCharCode(65 + idx)}. {option || 'N/A'}</span>
                          </label>
                        ))
                      ) : (
                        <p>No options available for this question.</p>
                      )}
                    </div>
                    <button onClick={() => toggleVisitMark(currentQuestion._id)} className="btn-visit">
                      {visitMarks[currentQuestion._id] ? 'Unmark Visit' : 'Mark for Visit'}
                    </button>
                    <button onClick={() => clearResponse(currentQuestion._id)} className="btn-clear">
                      Clear Response
                    </button>
                  </div>
                </div>
                <div className="controls">
                  <button onClick={handlePrevious} disabled={currentIndex === 0} className="btn-nav">
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === shuffledQuestions.length - 1}
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
            {shuffledQuestions.length === 0 && !submitted && <p className="no-questions">No questions available for this test.</p>}
            {submitted && (
              <div className="result-summary">
                <h3>Test Submitted!</h3>
                <p>Redirecting to results...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTest;