import { useState, useEffect } from 'react';
import './AdminDashboard.css';
import BACKEND_URL from '../config';

function AdminDashboard() {
  const [selectedTestId, setSelectedTestId] = useState('');
  const [mockTests, setMockTests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [individualMarks, setIndividualMarks] = useState(1);
  const [negativeMarking, setNegativeMarking] = useState(0);
  const [duration, setDuration] = useState(0);
  const [questionData, setQuestionData] = useState({
    testId: '',
    question: '',
    options: ['', '', '', ''],
    answer: '0',
    difficulty: 'easy',
    image: null,
    subjects: 'phy', // Default subject
  });
  const [csvFile, setCsvFile] = useState(null);
  const [csvSubject, setCsvSubject] = useState('phy'); // State for CSV subject
  const [activeSubTab, setActiveSubTab] = useState('');

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

  const handleTestSelect = (test) => {
    setSelectedTestId(test._id);
    setQuestionData((prevData) => ({
      ...prevData,
      testId: test._id,
    }));
    setCsvFile(null);
    setShowCreateForm(false);
    setActiveSubTab('');
  };

  const handleCreateTest = async () => {
    if (newTestName.trim() === '') return;

    const newTest = { name: newTestName, individualMarks, negativeMarking, duration };
    try {
      const response = await fetch(`${BACKEND_URL}/api/tests/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest),
      });
      const result = await response.json();
      if (response.ok) {
        setMockTests([...mockTests, { _id: result.testId, name: newTestName }]);
        setNewTestName('');
        setIndividualMarks(1);
        setNegativeMarking(0);
        setDuration(0);
        setShowCreateForm(false);
      } else {
        alert(result.error || 'Failed to create test');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating test');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOptionChange = (e, index) => {
    const newOptions = [...questionData.options];
    newOptions[index] = e.target.value;
    setQuestionData((prevData) => ({
      ...prevData,
      options: newOptions,
    }));
  };

  const handleImageChange = (e) => {
    setQuestionData((prevData) => ({
      ...prevData,
      image: e.target.files[0],
    }));
  };

  const handleRemoveImage = () => {
    setQuestionData((prevData) => ({
      ...prevData,
      image: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTestId) {
      alert('Please select a test first.');
      return;
    }
    if (questionData.options.length !== 4) {
      alert('There should be exactly 4 options.');
      return;
    }
    if (!questionData.question.trim()) {
      alert('Question text is required.');
      return;
    }
    if (!questionData.answer) {
      alert('Answer is required.');
      return;
    }
    if (!questionData.difficulty) {
      alert('Difficulty is required.');
      return;
    }

    const formData = new FormData();
    formData.append('testId', selectedTestId);
    formData.append('question', questionData.question);
    formData.append('options', JSON.stringify(questionData.options));
    formData.append('answer', questionData.answer);
    formData.append('difficulty', questionData.difficulty);
    formData.append('subjects', JSON.stringify([questionData.subjects])); // Send as array with single subject
    if (questionData.image) formData.append('image', questionData.image);

    try {
      const response = await fetch(`${BACKEND_URL}/api/questions/add`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert('Question added successfully!');
        setQuestionData({
          testId: selectedTestId,
          question: '',
          options: ['', '', '', ''],
          answer: '0',
          difficulty: 'easy',
          image: null,
          subjects: 'phy', // Reset to default
        });
      } else {
        alert(result.error || 'Failed to add question');
      }
    } catch (error) {
      console.error(error);
      alert('Error adding question');
    }
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleRemoveCsv = () => {
    setCsvFile(null);
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file to upload.');
      return;
    }
    if (!selectedTestId) {
      alert('Please select a test first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await fetch(`${BACKEND_URL}/api/questions/upload-csv/${csvSubject}?testId=${selectedTestId}`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert('Questions uploaded successfully!');
        setCsvFile(null);
      } else {
        alert(result.error || 'Failed to upload questions');
      }
    } catch (error) {
      console.error(error);
      alert('Error uploading questions');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">Admin Panel</div>
          <button className="create-button" onClick={() => setShowCreateForm(true)}>Create Test</button>
        </div>
      </header>

      <div className="main-content">
        <div className="navbar">
          <button
            className="nav-item active"
          >
            Available Mock Tests
          </button>
        </div>

        <section className="mock-tests-section">
          <div className="mock-tests-wrapper">
            <div className="mock-tests-grid">
              {mockTests.map((test) => (
                <div
                  key={test._id}
                  className={`mock-test-card ${selectedTestId === test._id ? 'selected' : ''}`}
                  onClick={() => handleTestSelect(test)}
                >
                  <h3 className="test-name">{test.name}</h3>
                  <p className="test-action">Click to manage</p>
                </div>
              ))}
              <div
                className="add-test-button"
                onClick={() => {
                  setShowCreateForm(true);
                  setSelectedTestId('');
                }}
              >
                <span className="plus-sign">+</span>
                <p className="add-test-text">Add New Test</p>
              </div>
            </div>
            {showCreateForm && (
              <div className="create-test-form">
                <h2 className="form-title">Create New Test</h2>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter Test Name"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    className="input-field"
                  />
                  <label className="label">
                    Individual Marks:
                    <input
                      type="number"
                      value={individualMarks}
                      onChange={(e) => setIndividualMarks(e.target.value)}
                      className="input-field"
                      min="1"
                    />
                  </label>
                  <label className="label">
                    Negative Marking:
                    <input
                      type="number"
                      value={negativeMarking}
                      onChange={(e) => setNegativeMarking(e.target.value)}
                      className="input-field"
                      min="0"
                    />
                  </label>
                  <label className="label">
                    Duration (minutes):
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="input-field"
                      min="1"
                    />
                  </label>
                  <div className="button-group">
                    <button onClick={handleCreateTest} className="btn-primary">
                      Create Test
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {selectedTestId && (
          <div>
            <div className="navbar sub-navbar">
              <button
                className={`nav-item ${activeSubTab === 'bulkUpload' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('bulkUpload')}
              >
                Bulk Upload Questions
              </button>
              <button
                className={`nav-item ${activeSubTab === 'addQuestion' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('addQuestion')}
              >
                Add One Question
              </button>
            </div>
            <section className={`question-section ${activeSubTab === 'bulkUpload' ? '' : 'hidden'}`}>
              <div className="csv-upload-section">
                <h3 className="section-subtitle">Bulk Upload Questions</h3>
                <label className="label">
                  Subject:
                  <select
                    value={csvSubject}
                    onChange={(e) => setCsvSubject(e.target.value)}
                    className="input-field"
                  >
                    <option value="phy">Physics</option>
                    <option value="chem">Chemistry</option>
                    <option value="maths">Maths</option>
                  </select>
                </label>
                <div className="file-input-group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  {csvFile && (
                    <button
                      onClick={handleRemoveCsv}
                      className="btn-secondary remove-btn"
                      style={{ marginLeft: '10px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <button
                  onClick={handleCSVUpload}
                  className="btn-secondary"
                  disabled={!csvFile}
                  style={{ marginTop: '10px' }}
                >
                  Upload CSV
                </button>
              </div>
            </section>
            <section className={`question-section ${activeSubTab === 'addQuestion' ? '' : 'hidden'}`}>
              <form onSubmit={handleSubmit} className="question-form">
                <h3 className="form-title">Add New Question</h3>
                <label className="label">
                  Question:
                  <textarea
                    name="question"
                    value={questionData.question}
                    onChange={handleInputChange}
                    required
                    className="textarea-field-large"
                  />
                </label>
                <label className="label">
                  Options:
                  {questionData.options.map((option, index) => (
                    <div key={index} className="option-group">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(e, index)}
                        placeholder={`Option ${String.fromCharCode(97 + index).toUpperCase()}`}
                        required
                        className="input-field"
                      />
                    </div>
                  ))}
                </label>
                <label className="label">
                  Image (Optional):
                  <div className="file-input-group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      name="image"
                      className="file-input"
                    />
                    {questionData.image && (
                      <button
                        onClick={handleRemoveImage}
                        className="btn-secondary remove-btn"
                        style={{ marginLeft: '10px' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </label>
                <label className="label">
                  Correct Answer:
                  <select
                    name="answer"
                    value={questionData.answer}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="0">A</option>
                    <option value="1">B</option>
                    <option value="2">C</option>
                    <option value="3">D</option>
                  </select>
                </label>
                <label className="label">
                  Difficulty:
                  <select
                    name="difficulty"
                    value={questionData.difficulty}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <label className="label">
                  Subject:
                  <select
                    name="subjects"
                    value={questionData.subjects}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="phy">Physics</option>
                    <option value="chem">Chemistry</option>
                    <option value="maths">Maths</option>
                  </select>
                </label>
                <button type="submit" className="btn-primary">
                  Add Question
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;