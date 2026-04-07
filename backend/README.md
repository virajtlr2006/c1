# Backend Server

A production-ready Express.js backend server built with TypeScript, featuring input validation with Zod, CORS support, and environment configuration.

## Features

- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe development
- **Zod** - Runtime type validation and parsing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **nodemon** - Auto-restart during development

## Project Structure

```
backend/
├── dist/                  # Compiled JavaScript (generated)
├── server.ts              # Main server file
├── .env                   # Environment variables
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── nodemon.json           # Nodemon configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Installation

1. Clone the repository and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   pnpm run dev
   ```

The server will start on `http://localhost:3000` by default.

## Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run type-check` - Check TypeScript types
- `pnpm run clean` - Remove build directory
- `pnpm run rebuild` - Clean and build

## API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Root
- **GET** `/` - Basic server information

### Users API
- **GET** `/api/users` - Get all users with pagination
  - Query parameters: `limit`, `offset`
- **POST** `/api/users` - Create a new user
  - Body: `{ name: string, email: string, age?: number }`

## Validation

The server uses Zod for input validation:

- **User Schema**: Validates name (required), email (valid format), and optional age (positive number)
- **Query Schema**: Validates pagination parameters with limits and offsets

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Add other environment variables as needed
```

## Error Handling

The server includes comprehensive error handling:

- **Validation Errors**: Returns detailed validation messages with 400 status
- **404 Errors**: Returns structured error for unknown routes
- **500 Errors**: Returns generic error message (detailed in development)

## Development

The development setup includes:

- **Hot Reload**: Automatic restart on file changes
- **TypeScript**: Full type checking and compilation
- **Request Logging**: All requests are logged with timestamp and method
- **CORS**: Enabled for all origins in development

## Production

For production deployment:

1. Build the application:
   ```bash
   pnpm run build
   ```

2. Start the production server:
   ```bash
   pnpm run start
   ```

3. Configure environment variables appropriately for production.

## License

ISC