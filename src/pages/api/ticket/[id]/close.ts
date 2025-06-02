import type { APIRoute } from 'astro';  
  
export const POST: APIRoute = async ({ request, params, cookies }) => {  
  try {  
    // Verificar autenticación  
    const session = cookies.get('session')?.value;  
    if (!session) {  
      return new Response(JSON.stringify({ error: 'No autorizado' }), {  
        status: 401,  
        headers: { 'Content-Type': 'application/json' }  
      });  
    }  
  
    // Parsear el body JSON  
    const body = await request.json();  
    const {   
      finalCost,   
      workDuration,   
      paymentMethod,   
      workNotes,  
      toolsUsed   
    } = body;  
  
    // Validar datos requeridos  
    if (!finalCost || !workDuration || !paymentMethod) {  
      return new Response(JSON.stringify({   
        error: 'Faltan campos requeridos'   
      }), {  
        status: 400,  
        headers: { 'Content-Type': 'application/json' }  
      });  
    }  
  
    // Aquí harías la actualización en la base de datos  
    // usando Drizzle ORM con tu schema  
      
    return new Response(JSON.stringify({   
      success: true,  
      message: 'Ticket cerrado exitosamente'  
    }), {  
      status: 200,  
      headers: { 'Content-Type': 'application/json' }  
    });  
  
  } catch (error) {  
    return new Response(JSON.stringify({   
      error: 'Error interno del servidor'   
    }), {  
      status: 500,  
      headers: { 'Content-Type': 'application/json' }  
    });  
  }  
};