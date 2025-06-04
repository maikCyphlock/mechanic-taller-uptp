import { db, eq } from '@/lib/db';
import  { ticket} from '@/db/schema'
import type { APIRoute } from 'astro';

export const PUT: APIRoute = async ({ params, request, locals }) => {  
  

  
  const ticketId = params.id;  
  const user =  locals?.user?.id;
    
  if (!user) {  
    return new Response(JSON.stringify({ error: 'Acceso denegado' }), {  
      status: 403,  
      headers: { 'Content-Type': 'application/json' }  
    });  
  }  
  
  const TicketDataToUpdate = await request.json();

  // Eliminar propiedades con valor null utilizando filter
  const filteredTicketData = Object.fromEntries(
    Object.entries(TicketDataToUpdate)
      .filter(([key, value]) => value !== null && value !== '')
      .filter(([key]) => !['clients', 'users', 'vehicleDetails','createdAt','updatedAt','delete_at'].includes(key))
  );
  

   const Ticket = await db.update(ticket).set({...filteredTicketData}).where(eq(ticket.id, ticketId!)).returning()
  // Verificar que el ticket existe y está en estado CERRADO  
  // Actualizar a estado APROBADO  
  // Registrar quién aprobó y cuándo  
  console.log(filteredTicketData)
  return new Response(JSON.stringify(filteredTicketData), {  
    status: 200,  
    headers: { 'Content-Type': 'application/json' }  
  });  
};