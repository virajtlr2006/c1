import { Router } from 'express';
import { EventsController } from './controller';
import { requireAuth, optionalAuth } from '../../middleware/auth';

const router = Router();

// GET /api/events - List events with filtering and pagination (no auth required)
router.get('/', optionalAuth, EventsController.getAllEvents);

// GET /api/events/:id - Get single event details (no auth required)
router.get('/:id', optionalAuth, EventsController.getEventById);

// POST /api/events - Create new event (auth required)
router.post('/', requireAuth, EventsController.createEvent);

// PUT /api/events/:id - Update event (auth required, organizer only)
router.put('/:id', requireAuth, EventsController.updateEvent);

// DELETE /api/events/:id - Delete event (auth required, organizer only)
router.delete('/:id', requireAuth, EventsController.deleteEvent);

export default router;