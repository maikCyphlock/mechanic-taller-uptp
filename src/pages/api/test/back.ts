import type { APIRoute } from 'astro';


export const POST: APIRoute = async ({ request, locals }) => {
  
    const body = await request.json();
    console.log('Datos recibidos:', body);
    console.log("headers", request.headers);
    
    return new Response(
        JSON.stringify({ ...body}),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

}