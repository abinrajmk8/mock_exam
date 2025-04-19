import express from 'express';
import multer from 'multer';
import csv from 'csvtojson';
import Question from '../models/questions.js';

const router = express.Router();

// Multer config to handle file upload in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route to add a new question
router.post('/add', async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res.status(201).json({ message: 'Question added successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to add question.' });
  }
});

// POST route to bulk upload questions via CSV
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    const { testId } = req.query;
    if (!testId) {
      return res.status(400).json({ error: 'Test ID is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const csvString = req.file.buffer.toString('utf-8');
    const questionsArray = await csv().fromString(csvString);

    const formattedQuestions = questionsArray.map(q => {
      // Use individual option columns
      const options = [
        q.option1 || 'N/A',
        q.option2 || 'N/A',
        q.option3 || 'N/A',
        q.option4 || 'N/A'
      ];

      let answerIndex = parseInt(q.answer, 10);
      if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
        answerIndex = 0; // Default to 0 if invalid
      }

      return {
        testId,
        question: q.question,
        options: options,
        answer: answerIndex,
        difficulty: q.difficulty || 'easy',
        createdAt: new Date(q.createdAt) || new Date(),
        updatedAt: new Date(q.updatedAt) || new Date(),
        __v: parseInt(q.__v, 10) || 0
      };
    });

    await Question.insertMany(formattedQuestions);
    res.status(201).json({ message: 'Questions uploaded successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to upload questions.' });
  }
});

// POST route to bulk upload questions via JSON
router.post('/upload-json', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const jsonString = req.file.buffer.toString('utf-8');
    const questionsArray = JSON.parse(jsonString);

    if (!Array.isArray(questionsArray)) {
      return res.status(400).json({ error: 'Invalid JSON format. Expected an array of questions.' });
    }

    const formattedQuestions = questionsArray.map(q => ({
      testId: q.testId,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      answer: parseInt(q.answer, 10),
      difficulty: q.difficulty || 'easy',
      createdAt: new Date(q.createdAt) || new Date(),
      updatedAt: new Date(q.updatedAt) || new Date(),
      __v: parseInt(q.__v, 10) || 0
    }));

    await Question.insertMany(formattedQuestions);
    res.status(201).json({ message: 'Questions uploaded successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to upload questions.' });
  }
});

// GET route to fetch all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
});

// GET route to fetch questions for a specific test by testId
router.get('/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const questions = await Question.find({ testId });

    if (!questions.length) {
      return res.status(404).json({ error: 'No questions found for this test.' });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch questions for the test.' });
  }
});

export default router;