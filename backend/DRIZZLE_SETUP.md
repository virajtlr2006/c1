# Drizzle ORM Setup

This backend project includes Drizzle ORM configured for PostgreSQL with a minimal setup.

## 📦 Installed Packages

- `drizzle-orm` - The core ORM library
- `pg` - PostgreSQL driver (node-postgres)
- `@types/pg` - TypeScript types for pg
- `drizzle-kit` - Development tools for schema management

## 📁 Project Structure

```
backend/
├── db/
│   ├── index.ts           # Database connection and client setup
│   └── schema.ts          # Database schema (users table only)
├── drizzle.config.ts      # Drizzle Kit configuration
├── migrations/            # Generated migration files (if needed)
└── server.ts              # Main server with DB integration
```

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_dFP9Ck5zJZnO@ep-steep-poetry-a1v18zrp-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 📊 Database Schema

### Users Table (Only Table)
- `id` (serial, primary key)
- `name` (varchar, not null)
- `email` (varchar, not null, unique)
- `age` (integer, optional)
- `created_at` (timestamp, default now)
- `updated_at` (timestamp, default now)

## 🚀 Available Scripts

- `pnpm run db:push` - Push schema changes directly to database
- `pnpm run db:generate` - Generate migration files from schema
- `pnpm run db:migrate` - Apply migrations to database
- `pnpm run db:studio` - Open Drizzle Studio (database GUI)

## ✅ Status

- ✅ Connected to Neon PostgreSQL database
- ✅ Users table created and pushed to database
- ✅ TypeScript types working correctly
- ✅ Server integrates with database connection
- ✅ Minimal and clean setup