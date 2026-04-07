# Event Management Website - Project Specification

## Platform Overview
- **Purpose**: Public events platform (concerts, festivals, community events)
- **Target Users**: Event organizers and attendees
- **Business Model**: Free platform, no monetization
- **Platform Type**: Web-only (responsive design)
- **Event Types**: Free events only

## Core Features & Pages

### Public Pages (No Login Required)

#### 1. Homepage
- Featured/trending events
- Quick search bar
- Browse by categories
- Recent events feed

#### 2. Event Discovery/Browse Page
- List/grid view of all events
- **Filtering Options**:
  - Category/genre filtering
  - Date/time filtering (today, this week, this month)
  - Text search (keyword, title, description)
- Sort options (date, popularity, recently added)

#### 3. Individual Event Pages
- Basic event information:
  - Event name
  - Description
  - Place/location
  - Date and time
  - Duration
  - Category
  - Available seats
  - Organizer contact (email)
- Registration button/form

#### 4. Authentication Pages
- User account creation
- Login form
- Password reset

### User Dashboard (Account Required)

#### 5. User Profile Page
- Basic user information (name, email, contact)
- Account settings and preferences

#### 6. My Events Page (for attendees)
- Events user has registered for
- Past events attended

### Organizer Features

#### 7. Create Event Page
Simple form with the following fields:
- Event name
- Description
- Place/location
- Date and time
- Duration
- Organizer email
- Category selection
- Available seats (capacity)
- Auto-publish functionality

#### 8. My Organized Events Page
- List of events user has created
- Basic attendee management (view registered users)
- Edit/delete events
- Simple status management (published/draft)

### System Pages

#### 9. Search Results Page
- Display search results with filtering options
- No results state with suggestions

#### 10. Category Pages
- Events filtered by specific categories
- Category-specific browsing

#### 11. About/Help Pages
- How to use the platform
- Guidelines for event creation
- Contact information

## Key Functionality

### Event Registration System
- **Account Required**: Users must create accounts to register for events
- Simple RSVP process
- Capacity management (available seats tracking)
- Registration confirmation

### Event Management
- **Auto-publish**: No moderation needed
- Simple event creation workflow
- Basic organizer tools
- Draft/published status only

### User Management
- Account creation and authentication
- Basic user profiles
- No complex features (no following, recommendations, etc.)

### Content Structure
- Uses existing data fields (no additions needed)
- Category-based organization
- Simple, clean event information display

## Database Schema

### Events Table
```
- event_id (Primary Key)
- name
- desc (description)
- place
- time
- duration
- email (organizer email)
- category
- available_seats
- clerk_user_id (Clerk User ID for organizer)
- status (published/draft)
- created_at
- updated_at
```

### Registrations Table
```
- registration_id (Primary Key)
- event_id (Foreign Key)
- clerk_user_id (Clerk User ID for attendee)
- registered_at
```

**Note**: User authentication and profiles are handled by Clerk. No separate users table is needed.

## Features NOT Included

### Deliberately Excluded Features
- No payment processing
- No advanced notifications/communications
- No mobile apps
- No admin dashboard
- No content moderation
- No advanced user profiles
- No internal messaging systems
- No map-based discovery
- No recurring events
- No waiting lists
- No social features (following, recommendations)

## User Roles & Permissions

### Event Attendees
- Browse and search events
- Register for events
- View their registered events
- Basic profile management

### Event Organizers
- All attendee permissions
- Create and manage events
- View attendee lists for their events
- Edit/delete their own events

### System
- Auto-publish events (no admin approval needed)
- Basic capacity management
- Simple status tracking (published/draft)

## Technical Requirements

### Frontend
- Responsive web design
- Works on desktop, tablet, and mobile browsers
- Clean, intuitive user interface
- Fast loading and search functionality

### Backend
- User authentication and authorization
- Event CRUD operations
- Registration management
- Search and filtering capabilities
- Basic analytics (registration counts)

### Performance Considerations
- Efficient event search and filtering
- Optimized database queries for event discovery
- Fast page load times
- Scalable architecture for growing event listings

## Success Metrics

### For Organizers
- Easy event creation process
- Clear attendee management
- Simple event editing capabilities

### For Attendees
- Quick event discovery
- Simple registration process
- Clear event information display

### Platform Goals
- High event discovery rate
- Low registration abandonment
- Active organizer engagement
- Growing event listings