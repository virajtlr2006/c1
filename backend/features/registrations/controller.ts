import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { registrations, events } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ApiResponse } from './types';

// Validation schemas
const createRegistrationSchema = z.object({
  eventId: z.number().int().positive(),
  userEmail: z.string().email(),
});

// Response utilities
const successResponse = <T>(data: T, meta?: any): ApiResponse<T> => ({
  success: true,
  data,
  meta,
});

const errorResponse = (error: string): ApiResponse<never> => ({
  success: false,
  error,
});

export class RegistrationsController {
  // GET /api/registrations - Get user's registrations
  static async getUserRegistrations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userEmail = req.userEmail;

      if (!userEmail) {
        res.status(401).json(errorResponse('Authentication required'));
        return;
      }

      const userRegistrations = await db
        .select({
          id: registrations.id,
          eventId: registrations.eventId,
          userEmail: registrations.userEmail,
          registeredAt: registrations.registeredAt,
          status: registrations.status,
          eventName: events.name,
          eventTime: events.eventTime,
          eventLocation: events.location,
        })
        .from(registrations)
        .innerJoin(events, eq(registrations.eventId, events.id))
        .where(eq(registrations.userEmail, userEmail))
        .orderBy(events.eventTime);

      res.json(successResponse(userRegistrations));
    } catch (error) {
      next(error);
    }
  }

  // POST /api/registrations - Register for event
  static async createRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userEmail = req.userEmail;

      if (!userEmail) {
        res.status(401).json(errorResponse('Authentication required'));
        return;
      }

      const registrationData = createRegistrationSchema.parse({
        ...req.body,
        userEmail,
      });

      // Check if event exists and has available seats
      const event = await db
        .select()
        .from(events)
        .where(eq(events.id, registrationData.eventId))
        .limit(1);

      if (event.length === 0) {
        res.status(404).json(errorResponse('Event not found'));
        return;
      }

      const eventData = event[0]!;

      // Prevent organizer from registering for their own event
      if (eventData.organizerEmail === userEmail) {
        res.status(400).json(errorResponse('Organizers cannot register for their own events'));
        return;
      }

      // Check if event is in the future
      if (eventData.eventTime <= new Date()) {
        res.status(400).json(errorResponse('Cannot register for past events'));
        return;
      }

      // Check available seats
      if (eventData.availableSeats <= 0) {
        res.status(400).json(errorResponse('Event is full'));
        return;
      }

      // Check for existing registration first
      const existingRegistration = await db
        .select()
        .from(registrations)
        .where(and(
          eq(registrations.eventId, registrationData.eventId),
          eq(registrations.userEmail, userEmail)
        ))
        .limit(1);

      if (existingRegistration.length > 0) {
        res.status(400).json(errorResponse('Already registered for this event'));
        return;
      }

      // Use transaction to ensure consistency
      await db.transaction(async (tx) => {
        // Create registration
        await tx
          .insert(registrations)
          .values(registrationData)
          .returning();

        // Decrement available seats
        await tx
          .update(events)
          .set({
            availableSeats: sql`${events.availableSeats} - 1`,
            updatedAt: new Date(),
          })
          .where(eq(events.id, registrationData.eventId));
      });

      // Fetch the created registration with event details
      const registrationWithEvent = await db
        .select({
          id: registrations.id,
          eventId: registrations.eventId,
          userEmail: registrations.userEmail,
          registeredAt: registrations.registeredAt,
          status: registrations.status,
          eventName: events.name,
          eventTime: events.eventTime,
          eventLocation: events.location,
        })
        .from(registrations)
        .innerJoin(events, eq(registrations.eventId, events.id))
        .where(and(
          eq(registrations.eventId, registrationData.eventId),
          eq(registrations.userEmail, userEmail)
        ))
        .limit(1);

      res.status(201).json(successResponse(registrationWithEvent[0]!));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(errorResponse('Invalid registration data'));
        return;
      }
      // Handle unique constraint violation (duplicate registration)
      if ((error as any)?.code === '23505' || (error as any)?.message?.includes('duplicate key')) {
        res.status(400).json(errorResponse('Already registered for this event'));
        return;
      }
      console.error('Registration error:', error);
      next(error);
    }
  }

  // DELETE /api/registrations/:id - Cancel registration
  static async cancelRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registrationId = parseInt(req.params['id'] as string);
      if (isNaN(registrationId)) {
        res.status(400).json(errorResponse('Invalid registration ID'));
        return;
      }

      const userEmail = req.userEmail;

      if (!userEmail) {
        res.status(401).json(errorResponse('Authentication required'));
        return;
      }

      // Check if registration exists and belongs to user
      const registration = await db
        .select()
        .from(registrations)
        .where(eq(registrations.id, registrationId))
        .limit(1);

      if (registration.length === 0) {
        res.status(404).json(errorResponse('Registration not found'));
        return;
      }

      if (registration[0]!.userEmail !== userEmail) {
        res.status(403).json(errorResponse('Can only cancel your own registrations'));
        return;
      }

      // Use transaction to ensure consistency
      await db.transaction(async (tx) => {
        // Delete registration
        await tx.delete(registrations).where(eq(registrations.id, registrationId));

        // Increment available seats
        await tx
          .update(events)
          .set({
            availableSeats: sql`${events.availableSeats} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(events.id, registration[0]!.eventId));
      });

      res.json(successResponse({ message: 'Registration cancelled successfully' }));
    } catch (error) {
      next(error);
    }
  }

  // GET /api/events/:eventId/registrations - Get event registrations (organizer only)
  static async getEventRegistrations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params['eventId'] as string);
      if (isNaN(eventId)) {
        res.status(400).json(errorResponse('Invalid event ID'));
        return;
      }

      const userEmail = req.userEmail;

      if (!userEmail) {
        res.status(401).json(errorResponse('Authentication required'));
        return;
      }

      // Check if user is the organizer
      const event = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (event.length === 0) {
        res.status(404).json(errorResponse('Event not found'));
        return;
      }

      if (event[0]!.organizerEmail !== userEmail) {
        res.status(403).json(errorResponse('Only the organizer can view registrations'));
        return;
      }

      // Get all registrations for the event
      const eventRegistrations = await db
        .select()
        .from(registrations)
        .where(eq(registrations.eventId, eventId))
        .orderBy(registrations.registeredAt);

      res.json(successResponse(eventRegistrations));
    } catch (error) {
      next(error);
    }
  }
}