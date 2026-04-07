import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { events } from '../../db/schema';
import { eq, and, like, gte, lte, sql, desc } from 'drizzle-orm';
import { ApiResponse } from './types';

// Validation schemas
const createEventSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  location: z.string().min(1).max(500),
  eventTime: z.string().datetime(),
  duration: z.coerce.number().int().min(15).max(1440), // 15 min to 24 hours
  category: z.string().min(1).max(100),
  totalSeats: z.coerce.number().int().min(1).max(10000),
  organizerEmail: z.string().email().optional(), // Real user email from frontend
});

const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['published', 'cancelled', 'completed']).optional(),
});

const eventFiltersSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  organizer: z.string().optional(),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
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

export class EventsController {
  // GET /api/events - List events with filtering and pagination
  static async getAllEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = eventFiltersSchema.parse(req.query);
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;

      // Build query conditions
      const conditions = [];

      if (filters.category) {
        conditions.push(eq(events.category, filters.category));
      }

      if (filters.location) {
        conditions.push(like(events.location, `%${filters.location}%`));
      }

      if (filters.dateFrom) {
        conditions.push(gte(events.eventTime, new Date(filters.dateFrom)));
      }

      if (filters.dateTo) {
        conditions.push(lte(events.eventTime, new Date(filters.dateTo)));
      }

      if (filters.search) {
        conditions.push(
          sql`${events.name} ILIKE ${`%${filters.search}%`} OR ${events.description} ILIKE ${`%${filters.search}%`}`
        );
      }

      if (filters.organizer) {
        conditions.push(eq(events.organizerEmail, filters.organizer));
      }

      // Get events with conditions
      const eventResults = await db
        .select()
        .from(events)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(events.eventTime))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const totalResult = await db
        .select({ count: sql`count(*)::int` })
        .from(events)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult[0]?.count || 0;

      res.json(successResponse(eventResults, { total, page, limit }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(errorResponse('Invalid query parameters'));
        return;
      }
      next(error);
    }
  }

  // GET /api/events/:id - Get single event details
  static async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params['id'] as string);
      if (isNaN(eventId)) {
        res.status(400).json(errorResponse('Invalid event ID'));
        return;
      }

      const event = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (event.length === 0) {
        res.status(404).json(errorResponse('Event not found'));
        return;
      }

      res.json(successResponse(event[0]));
    } catch (error) {
      next(error);
    }
  }

  // POST /api/events - Create new event
  static async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userEmail = req.userEmail;

      if (!userEmail) {
        res.status(401).json(errorResponse('Authentication required'));
        return;
      }

      const eventData = createEventSchema.parse(req.body);

      // Validate that event time is in the future
      const eventTime = new Date(eventData.eventTime);
      if (eventTime <= new Date()) {
        res.status(400).json(errorResponse('Event time must be in the future'));
        return;
      }

      // Use organizer email from request if provided (real user email), otherwise fallback to derived email
      const organizerEmail = eventData.organizerEmail || userEmail;

      const newEvent = await db
        .insert(events)
        .values({
          ...eventData,
          organizerEmail, // Use real user email if provided
          eventTime,
          availableSeats: eventData.totalSeats,
        })
        .returning();

      res.status(201).json(successResponse(newEvent[0]));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        res.status(400).json(errorResponse(`Invalid event data: ${errorMessage}`));
        return;
      }
      next(error);
    }
  }

  // PUT /api/events/:id - Update event
  static async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params['id'] as string);
      if (isNaN(eventId)) {
        res.status(400).json(errorResponse('Invalid event ID'));
        return;
      }

      const eventData = updateEventSchema.parse(req.body);
      const userEmail = req.userEmail;

      if (!userEmail) {
        res.status(401).json(errorResponse('Authentication required'));
        return;
      }

      // Check if event exists and user is the organizer
      const existingEvent = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (existingEvent.length === 0) {
        res.status(404).json(errorResponse('Event not found'));
        return;
      }

      // Authorization check: Allow if emails match OR if user ID matches OR if real email matches
      const eventOrganizerEmail = existingEvent[0]!.organizerEmail;
      const userId = req.userId;
      const realUserEmail = eventData.organizerEmail; // Real email from frontend if provided

      console.log('🔒 Authorization check:');
      console.log('  Event organizer email:', eventOrganizerEmail);
      console.log('  Current user email (derived):', userEmail);
      console.log('  Real user email from frontend:', realUserEmail);
      console.log('  Current user ID:', userId);

      // Check if user can edit this event (multiple methods for compatibility)
      let isOrganizer = eventOrganizerEmail === userEmail ||  // Derived email match
                       eventOrganizerEmail === realUserEmail ||  // Real email match
                       (userId && eventOrganizerEmail.includes(userId.replace('user_', ''))); // User ID match

      // TEMPORARY: Allow all updates in development for testing
      if (!isOrganizer && process.env['NODE_ENV'] === 'development') {
        console.log('⚠️  DEVELOPMENT MODE: Allowing update for debugging');
        isOrganizer = true;
      }

      if (!isOrganizer) {
        console.log('❌ User not authorized to edit this event');
        res.status(403).json(errorResponse('Only the organizer can update this event'));
        return;
      }

      console.log('✅ User authorized to edit event');

      // Update event
      const updateData: any = { ...eventData, updatedAt: new Date() };
      if (eventData.eventTime) {
        updateData.eventTime = new Date(eventData.eventTime);
      }

      const updatedEvent = await db
        .update(events)
        .set(updateData)
        .where(eq(events.id, eventId))
        .returning();

      res.json(successResponse(updatedEvent[0]));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        res.status(400).json(errorResponse(`Invalid event data: ${errorMessage}`));
        return;
      }
      next(error);
    }
  }

  // DELETE /api/events/:id - Delete event
  static async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params['id'] as string);
      if (isNaN(eventId)) {
        res.status(400).json(errorResponse('Invalid event ID'));
        return;
      }

      const userEmail = req.userEmail;

      if (!userEmail) {
        res.status(401).json(errorResponse('Authentication required'));
        return;
      }

      // Check if event exists and user is the organizer
      const existingEvent = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (existingEvent.length === 0) {
        res.status(404).json(errorResponse('Event not found'));
        return;
      }

      // Authorization check: Allow if emails match OR if user ID matches
      const eventOrganizerEmail = existingEvent[0]!.organizerEmail;
      const userId = req.userId;

      console.log('🔒 Delete authorization check:');
      console.log('  Event organizer email:', eventOrganizerEmail);
      console.log('  Current user email:', userEmail);
      console.log('  Current user ID:', userId);

      // Check if user can delete this event
      let isOrganizer = eventOrganizerEmail === userEmail ||
                       (userId && eventOrganizerEmail.includes(userId.replace('user_', ''))) ||
                       (userEmail && eventOrganizerEmail === userEmail);

      // TEMPORARY: Allow all deletes in development for testing
      if (!isOrganizer && process.env['NODE_ENV'] === 'development') {
        console.log('⚠️  DEVELOPMENT MODE: Allowing delete for debugging');
        isOrganizer = true;
      }

      if (!isOrganizer) {
        console.log('❌ User not authorized to delete this event');
        res.status(403).json(errorResponse('Only the organizer can delete this event'));
        return;
      }

      console.log('✅ User authorized to delete event');

      await db.delete(events).where(eq(events.id, eventId));

      res.json(successResponse({ message: 'Event deleted successfully' }));
    } catch (error) {
      next(error);
    }
  }
}