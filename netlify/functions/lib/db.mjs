import postgres from 'postgres';

// Get the connection string from Netlify's auto-injected environment variable
const connectionString = process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
    console.error('NETLIFY_DATABASE_URL not set');
}

// Create a single postgres instance for connection pooling
export const sql = connectionString ? postgres(connectionString) : null;
