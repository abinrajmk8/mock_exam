import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs'; // Added for file system checks
import questionRoutes from './routes/questionRoutes.js';
import mockTestRoutes from './routes/mockTestRoutes.js';  
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Debug: Log the current module URL and directory
const moduleUrl = import.meta.url;
console.log('Module URL:', moduleUrl);
const dirPath = path.dirname(new URL(import.meta.url).pathname).replace(/\//g, '\\'); // Normalize to backslashes for Windows
console.log('Resolved Directory Path:', dirPath);

// Dynamically determine uploads path
const defaultUploadsPath = path.join(process.cwd(), 'uploads').replace(/\//g, '\\'); // Relative to project root
const uploadsPath = process.env.UPLOADS_PATH || defaultUploadsPath;
console.log('Environment UPLOADS_PATH:', process.env.UPLOADS_PATH);
console.log('Calculated Uploads Path:', uploadsPath);

// Debug: Check if the uploads directory exists
if (fs.existsSync(uploadsPath)) {
  console.log('Uploads directory exists at:', uploadsPath);
  const questionsPath = path.join(uploadsPath, 'questions').replace(/\//g, '\\');
  if (fs.existsSync(questionsPath)) {
    console.log('Questions subdirectory exists at:', questionsPath);
    const sampleImage = path.join(questionsPath, '1745132255250-sqlmap.jpg').replace(/\//g, '\\');
    if (fs.existsSync(sampleImage)) {
      console.log('Sample image found at:', sampleImage);
    } else {
      console.log('Sample image 1745132255250-sqlmap.jpg not found in:', questionsPath);
    }
  } else {
    console.log('Questions subdirectory not found in:', uploadsPath);
  }
} else {
  console.log('Uploads directory not found at:', uploadsPath);
  console.warn('Falling back to default path or ensure UPLOADS_PATH is set correctly in deployment.');
}

app.use('/uploads', express.static(uploadsPath));

// Debug: Log when static middleware is accessed
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  next();
});

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Routes
app.use('/api/questions', questionRoutes);
app.use('/api/tests', mockTestRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});