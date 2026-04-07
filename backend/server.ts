// Load environment variables FIRST
import { config } from 'dotenv';
config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
// Import database setup AFTER env is loaded
import { connectDB, disconnectDB } from './db';

// Import feature routes
import eventsRoutes from './features/events/routes';
import registrationsRoutes from './features/registrations/routes';
import categoriesRoutes from './features/categories/routes';

const app = express();
const PORT = process.env['PORT'] || 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'], // Allow frontend origin
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/categories', categoriesRoutes);

// Additional route for event registrations (organizer view)
app.use('/api/events/:eventId/registrations', (req: Request, res: Response, next: NextFunction) => {
  // Import the controller here to avoid circular dependency issues
  import('./features/registrations/controller').then(({ RegistrationsController }) => {
    RegistrationsController.getEventRegistrations(req, res, next);
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env['NODE_ENV'] === 'development' ? err.message : 'Internal server error',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`🌍 Access server at: http://localhost:${PORT}`);

  // Connect to database
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to database on startup');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  try {
    await disconnectDB();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  try {
    await disconnectDB();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
  process.exit(0);
});