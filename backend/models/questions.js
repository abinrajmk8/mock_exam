import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true },
  question: { type: String, required: true },
  options: {
    type: [String],
    validate: {
      validator: function (v) {
        return v.length === 4;
      },
      message: 'There should be exactly 4 options.'
    },
    required: true
  },
  answer: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  imageUrl: { type: String, default: null }, // Optional imageUrl with default null
  subjects: { type: [String], default: [] } // Added subjects as an array of strings with default empty array
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
export default Question;