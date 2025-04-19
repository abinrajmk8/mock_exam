import express from 'express';
import MockTest from '../models/mock.js';
import Question from '../models/questions.js';

const router = express.Router();

// POST route to add a new mock test
router.post('/add', async (req, res) => {
  try {
    const { name, individualMarks, negativeMarking, duration } = req.body;
    const newTest = new MockTest({ name, individualMarks, negativeMarking, duration });

    await newTest.save();
    res.status(201).json({ message: 'Mock Test added successfully!', testId: newTest._id });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to add Mock Test.' });
  }
});

// GET route to list all mock tests
router.get('/', async (req, res) => {
  try {
    const mockTests = await MockTest.find();
    res.status(200).json(mockTests);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch mock tests.' });
  }
});

// GET route to fetch details of a specific mock test
router.get('/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const test = await MockTest.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Mock test not found.' });
    }
    res.status(200).json(test);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch mock test details.' });
  }
});

// GET route to fetch questions for a specific mock test
router.get('/:testId/questions', async (req, res) => {
  try {
    const { testId } = req.params;
    // Using .populate() for fetching questions associated with the mock test
    const questions = await Question.find({ testId }).populate('testId');

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found for this test.' });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch questions for the test.' });
  }
});

export default router;