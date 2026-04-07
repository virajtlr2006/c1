# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Event Management Website - Implementation Checklist

### Core Pages & Features
- [ ] Homepage with featured events and search
- [ ] Event Discovery/Browse page with filtering
- [ ] Individual Event pages with registration
- [ ] User authentication (login/register)
- [ ] User profile and dashboard
- [ ] Create Event page for organizers
- [ ] My Events page (attendee view)
- [ ] My Organized Events page (organizer view)
- [ ] Search Results page
- [ ] Category pages
- [ ] About/Help pages

### Database Schema
- [ ] Events table (event_id, name, desc, place, time, duration, email, category, available_seats, clerk_user_id, status)
- [ ] Registrations table (registration_id, event_id, clerk_user_id, registered_at)

### Key Functionality
- [ ] Event registration system (account required)
- [ ] Event creation and management
- [ ] Search and filtering (category, date, text search)
- [ ] Capacity management (available seats tracking)
- [ ] Auto-publish events (no moderation)
- [ ] Basic organizer tools (view attendees, edit events)

### Technical Implementation
- [ ] Responsive web design
- [ ] User authentication and authorization
- [ ] Event CRUD operations
- [ ] Registration management
- [ ] Search functionality
- [ ] Frontend (Next.js recommended)
- [ ] Backend API
- [ ] Database setup

## Current Project Architecture

This is a full-stack TypeScript application with a clear separation between frontend and backend:

- **Frontend**: Next.js 16 with App Router, Clerk authentication, Tailwind CSS
- **Backend**: Express.js server with Drizzle ORM and PostgreSQL database
- **Package Manager**: pnpm is used throughout both projects

### Key Architectural Decisions

1. **Next.js 16**: This project uses Next.js 16 with breaking changes from previous versions. Always check `node_modules/next/dist/docs/` before writing Next.js code, as APIs and conventions differ from training data.

2. **Authentication Flow**: Clerk handles all authentication with `ClerkProvider` wrapping the app, middleware in `proxy.ts`, and conditional rendering using Clerk's `Show` component.

3. **Database Layer**: Drizzle ORM with PostgreSQL (Neon) provides type-safe database operations. Schema is defined in `backend/db/schema.ts` with a single `users` table.

4. **Frontend State**: Custom hook `useCurrentUser()` centralizes Clerk user data extraction for consistent access across components.

## Development Commands

### Frontend (Next.js 16)
```bash
cd frontend
pnpm dev          # Development server on http://localhost:3000
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint
```

### Backend (Express.js)
```bash
cd backend
pnpm dev          # Development server with nodemon on http://localhost:3000
pnpm build        # TypeScript compilation
pnpm start        # Production server
pnpm type-check   # TypeScript type checking
pnpm clean        # Remove dist directory
pnpm rebuild      # Clean and build

# Database operations
pnpm db:push      # Push schema changes to database
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio GUI
```

### Running Tests
- Tests are not currently implemented in either project
- Follow the established TDD patterns when adding test suites

## Code Architecture Details

### Backend Structure
- `server.ts`: Main Express server with middleware, error handling, and graceful shutdown
- `db/index.ts`: Database connection management with connect/disconnect functions  
- `db/schema.ts`: Drizzle schema definitions (currently only users table)
- `drizzle.config.ts`: Drizzle Kit configuration for migrations

### Frontend Structure
- `app/layout.tsx`: Root layout with ClerkProvider and auth UI (Sign In/Up buttons, UserButton)
- `app/page.tsx`: Home page with conditional content based on auth state
- `hooks/UseUser.ts`: Custom hook that wraps Clerk's useUser for consistent data access
- `proxy.ts`: Clerk middleware configuration for authentication

### Database Schema
The current database has a single `users` table:
- `id` (serial primary key)
- `name` (varchar, required)
- `email` (varchar, required, unique) 
- `age` (integer, optional)
- `created_at`, `updated_at` (timestamps)

### Authentication State Management
- Clerk `Show` component handles conditional rendering based on auth state
- Custom `useCurrentUser` hook provides: `{ username, fullName, imageUrl, email, isLoaded }`
- Middleware in `proxy.ts` protects routes automatically

## Environment Setup

### Backend (.env)
```
DATABASE_URL=postgresql://[connection_string]
PORT=3000
NODE_ENV=development
```

### Frontend (.env.local)  
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Important Notes

1. **Next.js 16 Breaking Changes**: Always consult Next.js 16 documentation before implementing features, as this version has significant changes from prior versions.

2. **Database Connection**: Backend handles database connection/disconnection in server startup and graceful shutdown handlers.

3. **TypeScript**: Both projects use strict TypeScript with proper type definitions throughout.

4. **CORS**: Backend has CORS enabled for cross-origin requests from the frontend.

5. **Error Handling**: Backend includes comprehensive error handling with development/production error message differentiation.