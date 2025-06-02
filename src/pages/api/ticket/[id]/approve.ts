import { db, eq } from '@/lib/db';
import  { ticket} from '@/db/schema'

export const POST: APIRoute = async ({ params, request, locals }) => {  
  

  
  const ticketId = params.id;  
  const adminSession =  locals?.user?.id;
    
  if (!adminSession) {  
    return new Response(JSON.stringify({ error: 'Acceso denegado' }), {  
      status: 403,  
      headers: { 'Content-Type': 'application/json' }  
    });  
  }  
  
  const TicketDataToUpdate = await request.json();

  // Eliminar propiedades con valor null utilizando filter
  const filteredTicketData = Object.fromEntries(
    Object.entries(TicketDataToUpdate).filter(([key, value]) => value !== null && value !== '')
  );
  console.log({filteredTicketData})
  const Ticket = await db.update(ticket).set({ ...filteredTicketData }).where(eq(ticket.id, ticketId!)).returning()
  // Verificar que el ticket existe y está en estado CERRADO  
  // Actualizar a estado APROBADO  
  // Registrar quién aprobó y cuándo  
  console.log(Ticket)
  return new Response(JSON.stringify(Ticket), {  
    status: 200,  
    headers: { 'Content-Type': 'application/json' }  
  });  
};