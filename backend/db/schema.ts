import { pgTable, serial, varchar, timestamp, integer, text, unique } from 'drizzle-orm/pg-core';

// Users table schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  age: integer('age'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Events table schema
export const events = pgTable('events', {
  id: serial('event_id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 500 }).notNull(),
  eventTime: timestamp('event_time').notNull(),
  duration: integer('duration_minutes').notNull(), // Duration in minutes
  organizerEmail: varchar('organizer_email', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  availableSeats: integer('available_seats').notNull(),
  totalSeats: integer('total_seats').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('published'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Registrations table schema
export const registrations = pgTable('registrations', {
  id: serial('registration_id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  status: varchar('status', { length: 20 }).notNull().default('registered'),
}, (table) => ({
  // Ensure one registration per user per event
  uniqueUserEvent: unique().on(table.eventId, table.userEmail),
}));