import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    score: { type: Number, min: 0, max: 100 },
    feedback: [String],
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, required: true },
    round: { type: String, required: true },
    score: { type: Number, min: 0, max: 100, default: 0 },
    answers: [answerSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
