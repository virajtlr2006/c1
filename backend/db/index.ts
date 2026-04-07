import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

// Debug: Check if DATABASE_URL is loaded
console.log('DATABASE_URL loaded:', !!process.env['DATABASE_URL']);
console.log('DATABASE_URL preview:', process.env['DATABASE_URL']?.substring(0, 50) + '...');

// Create PostgreSQL client using DATABASE_URL
export const client = new Client({
  connectionString: process.env['DATABASE_URL']!,
});

// Initialize Drizzle with the client and schema
export const db = drizzle({ client, schema });

// Function to connect to the database
export async function connectDB() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    throw error;
  }
}

// Function to disconnect from the database
export async function disconnectDB() {
  try {
    await client.end();
    console.log('✅ Disconnected from PostgreSQL database');
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
    throw error;
  }
}