import mongoose from 'mongoose';

const mockTestSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Test name
  individualMarks: { type: Number, required: true },  // Marks for the test
  negativeMarking: { type: Number, default: 0 },  // Negative marking for the test
  duration: { type: Number, required: true },  // Duration of the test in minutes
}, { timestamps: true });

const MockTest = mongoose.model('MockTest', mockTestSchema);
export default MockTest;
