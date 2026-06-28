import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    role: { type: String, required: true, lowercase: true, trim: true, index: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    hint: { type: String, default: '' },
    answer: { type: String, default: '' },
    practiceUrl: { type: String, default: '' },
    companies: { type: [String], default: [], lowercase: true, trim: true },
  },
  { timestamps: true }
);

questionSchema.index({ role: 1, topic: 1 });
questionSchema.index({ companies: 1, role: 1 });

export default mongoose.model('Question', questionSchema);
