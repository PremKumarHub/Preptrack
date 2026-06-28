import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Question from '../models/Question.js';
import { questions } from './questions.js';

dotenv.config();

await connectDB();
await Question.deleteMany({});
await Question.insertMany(questions);

console.log(`Seeded ${questions.length} questions`);
process.exit(0);
