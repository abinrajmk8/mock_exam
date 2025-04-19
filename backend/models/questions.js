import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true }, // Referring to MockTest model
  question: { type: String, required: true }, // The question itself
  options: {
    type: [String], // Array of options for the question
    validate: {
      validator: function (v) {
        return v.length === 4; // Ensure there are exactly 4 options
      },
      message: "There should be exactly 4 options."
    },
    required: true
  },
  answer: { type: Number, required: true }, // The index (0-3) of the correct answer
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true }, // Difficulty level of the question
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
export default Question;
