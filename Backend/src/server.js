import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const port = process.env.PORT || 5000;

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error on startup:', error.message);
  }

  const server = app.listen(port, () => {
    console.log(`PrepTrack API running on http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. If nodemon is running, it will restart automatically.`);
    } else {
      console.error('Server error:', error.message);
    }
  });
}

startServer();



