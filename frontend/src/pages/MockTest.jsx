import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../pages/MockTest.css';
import BACKEND_URL from '../config';

const MockTest = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const id = '6804a6a54bcf4a4370d68463';
  const [questions, setQuestions] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(location.state?.duration * 60 || 10800); // Default to 3 hours
  const [testStarted, setTestStarted] = useState(true);
  const [visitMarks, setVisitMarks] = useState({}); // Track visited questions
  const [dataFetched, setDataFetched] = useState(false);
  const testTitle = location.state?.testName || 'Mock Test';

  // Handler for option selection
  const handleOptionSelect = (option) => {
    const questionId = shuffledQuestions[currentIndex]?._id;
    if (questionId) {
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        if (newAnswers[questionId] === option) {
          delete newAnswers[questionId];
        } else {
          newAnswers[questionId] = option;
        }
        saveToLocalStorage();
        return newAnswers;
      });
    }
  };

  // Handler for toggling visit mark
  const toggleVisitMark = (questionId) => {
    setVisitMarks((prev) => {
      const newVisitMarks = { ...prev, [questionId]: !prev[questionId] };
      saveToLocalStorage();
      return newVisitMarks;
    });
  };

  // Handler for next button
  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(currentIndex + 1); // Update selected to match currentIndex
      saveToLocalStorage();
    }
  };

  // Handler for previous button
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelected(currentIndex - 1); // Update selected to match currentIndex
    }
  };



  // Save state to localStorage
  const saveToLocalStorage = () => {
    const state = { currentIndex, answers, visitMarks };
    localStorage.setItem(`mockTestState_${id}`, JSON.stringify(state));
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem(`mockTestState_${id}`);
  };

  const handleSubmit = () => {
    if (!submitted) {
      setSubmitted(true);
      const result = calculateResult();
      navigate('/result', { state: { userAnswers: answers, questions: shuffledQuestions, title: testTitle, id, ...result } });
      clearLocalStorage();
    }
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

  // ... (keep existing useEffect hooks and shuffleArray)

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
      if (shuffled.length > 0) {
        setCurrentIndex(0);
        console.log('First question:', shuffled[0]);
      } else {
        setError('No questions available for this test.');
      }
    }
  }, [questions, testStarted, currentIndex]);


  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, timeLeft]);


  return (
    <div className="bg-[#131419] text-white font-sans min-h-screen">
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Video */}
          <div className="lg:w-[75%] w-full">
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-2xl font-bold text-white">{testTitle}</h1>
    <div className="text-lg px-3 py-2 rounded">
      <span className="text-white">Time Left: </span>
      <span className="text-[#ff2d55]">
        {Math.floor(timeLeft / 3600)}h {Math.floor((timeLeft % 3600) / 60)}m {timeLeft % 60}s
      </span>
    </div>
  </div>
  <div className="bg-[#141313] p-4 rounded mb-4 border border-[#374151] overflow-y-auto lg:aspect-video sm:h-auto min-h-[300px] w-full max-w-full">
    {error && <p className="text-[#d1d5db] text-lg">{error}</p>}
    {shuffledQuestions.length > 0 && currentIndex >= 0 && shuffledQuestions[currentIndex] && (
      <div className="text-white">
        <p className="text-lg font-bold mb-4 lg:text-2xl sm:text-base">Question {currentIndex + 1}: {shuffledQuestions[currentIndex].question || 'No question text available'}</p>
        <div className="options w-full max-w-full">
          {shuffledQuestions[currentIndex].options.slice(0, 4).map((option, idx) => {
            const questionId = shuffledQuestions[currentIndex]?._id;
            const isSelected = answers[questionId] === option;
            return (
              <div
                key={idx}
                className={`block mb-4 p-2 border border-[#4b5563] w-full rounded cursor-pointer ${isSelected ? 'bg-[#006400] text-white' : ''} ${!isSelected ? 'hover:bg-[#3b3b3b]' : ''}`}
                onClick={() => handleOptionSelect(option)}
              >
                <span>{String.fromCharCode(65 + idx)}. {option || 'N/A'}</span>
              </div>
            );
          })}
        </div>
      </div>
    )}
    {shuffledQuestions.length === 0 && !error && <p className="text-[#d1d5db] text-lg">Loading questions...</p>}
  </div>
  {/* Control Buttons */}
  <div className="flex flex-wrap gap-2 justify-between mb-6">
    <div className="flex gap-2">
      <button
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className="bg-[#ff2d55] text-white px-2 py-1 rounded text-sm hover:bg-[#e6002b] transition sm:px-3 sm:py-1"
      >
        Previous
      </button>
      <button
        onClick={() => toggleVisitMark(shuffledQuestions[currentIndex]?._id)}
        className="bg-[#ff2d55] text-white px-2 py-1 rounded text-sm hover:bg-[#e6002b] transition sm:px-3 sm:py-1"
      >
        {visitMarks[shuffledQuestions[currentIndex]?._id] ? 'Unmark Visit' : 'Mark for Visit'}
      </button>
    </div>
    <div className="flex gap-2">
      <button
        onClick={handleNext}
        disabled={currentIndex === shuffledQuestions.length - 1}
        className="bg-[#ff2d55] text-white px-2 py-1 rounded text-sm hover:bg-[#e6002b] transition sm:px-3 sm:py-1"
      >
        Next
      </button>
      <button
        onClick={handleSubmit}
        className="bg-[#00ff00] text-white px-2 py-1 rounded text-sm hover:bg-[#00cc00] transition sm:px-3 sm:py-1"
        disabled={submitted}
      >
        Submit
      </button>
    </div>
  </div>
</div>
          {/* Right: Episodes Grid */}
          <aside className="lg:w-[25%] w-full">
  <div className="bg-[#202125] p-4 rounded-lg border border-[#374151]">
    <div className="episode-list max-h-[600px] overflow-y-auto pr-1">
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2">
        {Array.from({ length: shuffledQuestions.length }, (_, index) => {
          const subject = shuffledQuestions[index]?.subjects?.[0] || 'unknown';
          let borderColor;
          switch (subject) {
            case 'phy':
              borderColor = 'rgb(0, 0, 255)'; // Blue for Physics
              break;
            case 'chem':
              borderColor = 'rgb(255, 0, 0)'; // Red for Chemistry
              break;
            case 'maths':
              borderColor = 'rgb(255, 165, 0)'; // Orange for Maths
              break;
            default:
              borderColor = 'rgb(0, 0, 255)'; // Default to blue
          }
          const isSelected = selected === index; // Sync with currentIndex via handleNext/Previous
          const questionId = shuffledQuestions[index]?._id;
          const isVisited = visitMarks[questionId] || false;
          const isAnswered = answers[questionId] !== undefined;
          return (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setSelected(index); // Ensure selected matches currentIndex
              }}
              className={`episode-button p-2 text-sm font-medium rounded-md text-white hover:bg-opacity-80 flex items-center justify-center h-8 w-full`}
              style={{
                backgroundColor: isSelected ? '#00ff00' : isVisited ? '#ADD8E6' : isAnswered ? '#006400' : 'rgb(25 22 22)',
                border: isSelected ? '1px solid #00ff00' : `1px solid ${borderColor}`,
              }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  </div>
</aside>
        </div>
      </main>

   
    </div>
  );
};

export default MockTest;

