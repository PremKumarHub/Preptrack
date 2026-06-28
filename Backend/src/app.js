import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'preptrack-api', message: 'API is running' });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'preptrack-api' });
});

app.get('/api', (_req, res) => {
  res.json({ 
    ok: true, 
    service: 'preptrack-api',
    availableEndpoints: {
      auth: ['/api/auth/register', '/api/auth/login', '/api/auth/me'],
      interview: ['/api/interview/feedback', '/api/interview/session/save', '/api/interview/sessions/:userId'],
      questions: ['/api/questions/:role'],
      progress: ['/api/progress/:userId'],
      companies: ['/api/companies', '/api/companies/:id', '/api/companies/:id/questions'],
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/companies', companyRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
