import { sql } from './lib/db.mjs';

export default async (req, context) => {
    if (!sql) {
        return new Response(JSON.stringify({ error: 'Database not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const result = await sql`SELECT NOW() as current_time, 
            (SELECT COUNT(*) FROM units) as units_count,
            (SELECT COUNT(*) FROM submissions) as submissions_count`;

        return new Response(JSON.stringify({
            success: true,
            data: result[0]
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const config = {
    path: '/api/db-test'
};
