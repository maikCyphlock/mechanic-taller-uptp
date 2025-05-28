// src/pages/api/client/all.ts
import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { user } from '@/db/schema';

export const allusers: APIRoute = async () => {
  try {
    const users = await db.select().from(user);

    return new Response(JSON.stringify({ users }), {
      status: 200
    
    });
  } catch (error) {
    console.error('Error fetching   users:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
      
      }
    );
  }
};

// Handle OPTIONS for CORS preflight
export const OPTIONS: APIRoute = () => {
  return new Response(null, {
    status: 200
    
}
    )}