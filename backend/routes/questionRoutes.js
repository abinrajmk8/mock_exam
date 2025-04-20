import express from 'express';
import multer from 'multer';
import csv from 'csvtojson';
import path from 'path';
import fs from 'fs';
import Question from '../models/questions.js';

const router = express.Router();

// Multer config to handle file upload in memory for bulk uploads and disk storage for images
const memoryStorage = multer.memoryStorage();
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/questions';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directory created: ${dir}`);
    } else {
      console.log(`Directory exists: ${dir}`);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    console.log(`Saving file as: ${uniqueFilename}`);
    cb(null, uniqueFilename);
  },
});
const uploadMemory = multer({ storage: memoryStorage });
const uploadDisk = multer({ storage: diskStorage });

// POST route to add a new question with optional image
router.post('/add', uploadDisk.single('image'), async (req, res) => {
  try {
    let testId, question, options, answer, difficulty;

    // Handle data from FormData or JSON
    if (req.body.testId) {
      testId = req.body.testId;
      question = req.body.question;
      options = req.body.options;
      answer = req.body.answer;
      difficulty = req.body.difficulty;
    } else {
      testId = req.body.testId;
      question = req.body.question;
      options = req.body.options;
      answer = req.body.answer;
      difficulty = req.body.difficulty;
    }

    // Validate required fields
    if (!testId || !question || !answer || !difficulty) {
      return res.status(400).json({ error: 'testId, question, answer, and difficulty are required.' });
    }

    // Validate and parse options
    let parsedOptions;
    try {
      parsedOptions = JSON.parse(options);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid options format. Must be a JSON array.' });
    }
    if (!Array.isArray(parsedOptions) || parsedOptions.length !== 4) {
      return res.status(400).json({ error: 'There should be exactly 4 options.' });
    }

    // Validate answer
    const answerIndex = parseInt(answer, 10);
    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      return res.status(400).json({ error: 'Answer must be a number between 0 and 3.' });
    }

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Difficulty must be easy, medium, or hard.' });
    }

    // Create new question with optional image
    const questionData = {
      testId,
      question,
      options: parsedOptions,
      answer: answerIndex,
      difficulty,
    };
    if (req.file) {
      questionData.imageUrl = `/uploads/questions/${req.file.filename}`;
      console.log(`Image saved at: ${path.join('./uploads/questions', req.file.filename)}`);
    } else {
      console.log('No image uploaded');
    }

    const newQuestion = new Question(questionData);
    await newQuestion.save();
    res.status(201).json({ message: 'Question added successfully!', questionId: newQuestion._id });
  } catch (error) {
    console.error('Error in /add:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to add question.' });
  }
});

// POST route to bulk upload questions via CSV
router.post('/upload-csv', uploadMemory.single('file'), async (req, res) => {
  try {
    const { testId } = req.query;
    if (!testId) {
      return res.status(400).json({ error: 'Test ID is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Process CSV in memory
    const csvString = req.file.buffer.toString('utf-8');
    const questionsArray = await csv().fromString(csvString);

    const formattedQuestions = questionsArray.map(q => {
      const options = [
        q.option1 || 'N/A',
        q.option2 || 'N/A',
        q.option3 || 'N/A',
        q.option4 || 'N/A'
      ];

      let answerIndex = parseInt(q.answer, 10);
      if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
        answerIndex = 0;
      }

      return {
        testId,
        question: q.question,
        options,
        answer: answerIndex,
        difficulty: q.difficulty || 'easy',
        createdAt: new Date(q.createdAt) || new Date(),
        updatedAt: new Date(q.updatedAt) || new Date(),
        __v: parseInt(q.__v, 10) || 0
      };
    });

    await Question.insertMany(formattedQuestions);
    console.log('CSV processed and discarded, no file saved to disk');
    res.status(201).json({ message: 'Questions uploaded successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to upload questions.' });
  }
});

// POST route to bulk upload questions via JSON
router.post('/upload-json', uploadMemory.single('file'), async (req, res) => {
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
    console.log('JSON processed and discarded, no file saved to disk');
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