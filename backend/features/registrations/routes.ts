import { Router } from 'express';
import { RegistrationsController } from './controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// GET /api/registrations - Get user's registrations (auth required)
router.get('/', requireAuth, RegistrationsController.getUserRegistrations);

// POST /api/registrations - Register for event (auth required)
router.post('/', requireAuth, RegistrationsController.createRegistration);

// DELETE /api/registrations/:id - Cancel registration (auth required)
router.delete('/:id', requireAuth, RegistrationsController.cancelRegistration);

export default router;