import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";

// Tipos de roles permitidos
type UserRole = 'ADMIN' | 'SUPERADMIN' | 'user' | 'SUPERVISOR';

const updateTicketSchema = z.object({
  description: z.string().optional(),
  status: z.enum(["ABIERTO", "EN_PROCESO", "CERRADO", "CANCELADO", "APROBADO"]).optional(),
  priority: z.enum(["BAJA", "MEDIA", "ALTA"]).optional(),
  time_spent: z.number().or(z.string().transform(Number)).optional(),
  work_notes: z.string().optional(),
  tool_used: z.string().optional(),
  payment_method: z.enum(["EFECTIVO", "TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA_BANCARIA", "PAGO_MOVIL", "OTRO"]).optional(),
  total_amount: z.number().or(z.string().transform(Number)).optional(),
  payment_reference: z.string().optional(),
});

type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

// Función para transformar los valores null a undefined
const transformTicketData = (ticket: any): UpdateTicketInput => ({
  ...ticket,
  description: ticket.description ?? undefined,
  work_notes: ticket.work_notes ?? undefined,
  tool_used: ticket.tool_used ?? undefined,
  payment_reference: ticket.payment_reference ?? undefined,
  time_spent: ticket.time_spent ?? undefined,
  total_amount: ticket.total_amount ?? undefined,
});

const TicketPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const isReviewMode = router.query.review === 'true';
  const { data: session } = useSession();
  
  // Inicializar el formulario primero
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateTicketInput>({
    resolver: zodResolver(updateTicketSchema),
    defaultValues: {},
  });

  // Obtener datos del ticket
  const { data: ticket, isLoading } = api.ticket.getById.useQuery(
    { id: id as string },
    { 
      enabled: !!id,
      onSuccess: (data) => {
        if (data?.ticket) {
          reset(transformTicketData(data.ticket));
        }
      }
    }
  );

  // Configurar mutación para actualizar el ticket
  const { mutate } = api.ticket.update.useMutation({
    onSuccess: () => {
      void router.push(isReviewMode ? '/dashboard/review/tickets' : '/dashboard/tickets');
    },
  });

  // Verificar roles y permisos
  const userRole = session?.user?.role as UserRole;
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(userRole);
  const isSupervisor = isAdmin || userRole === 'SUPERVISOR';
  const isMechanic = userRole === 'user';
  const canReview = isAdmin || userRole === 'SUPERVISOR';

  // Esquema de validación dinámico basado en el rol
  const roleBasedSchema = updateTicketSchema.refine(
    (data) => {
      if (isAdmin) return true; // Los admins pueden cualquier cosa
      if (isReviewMode) {
        // En modo revisión, solo permitir cambiar a APROBADO o mantener CERRADO
        return data.status === 'APROBADO' || data.status === 'CERRADO';
      }
      if (isSupervisor && data.status === 'APROBADO') return true;
      if (isMechanic && data.status === 'CERRADO') return true;
      return !data.status || ['ABIERTO', 'EN_PROCESO'].includes(data.status);
    },
    {
      message: 'No tienes permiso para realizar esta acción',
      path: ['status']
    }
  );

  // Si estamos en modo revisión, forzar el estado a CERRADO si no está definido
  useEffect(() => {
    if (isReviewMode && ticket?.ticket?.status === 'CERRADO') {
      reset({ ...ticket.ticket, status: 'CERRADO' });
    }
  }, [isReviewMode, ticket, reset]);

  const onSubmit = (data: UpdateTicketInput) => {
    mutate({ id: id as string, ...data });
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!ticket) {
    return <div>Ticket no encontrado</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isReviewMode ? 'Revisar Ticket' : 'Editar Ticket'}
        </h1>
        {isReviewMode && (
          <Link href="/dashboard/review/tickets" className="text-blue-600 hover:underline">
            ← Volver a la lista de revisión
          </Link>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-2">Descripción</label>
          <input {...register("description")} className="border p-2 w-full rounded" />
        </div>
        <div>
          <label className="block mb-2">Estado</label>
          <select 
            {...register("status")} 
            className="border p-2 w-full rounded"
            disabled={!ticket?.ticket?.status} // Deshabilitar si no hay estado inicial
          >
            <option value="ABIERTO">Abierto</option>
            <option value="EN_PROCESO">En Proceso</option>
            {isMechanic && <option value="CERRADO">Cerrado</option>}
            {!isReviewMode && <option value="CANCELADO">Cancelado</option>}
            {(isSupervisor || isReviewMode) && (
              <option value="APROBADO">
                {isReviewMode ? 'Aprobar' : 'Aprobado'}
              </option>
            )}
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-2">Prioridad</label>
          <select {...register("priority")} className="border p-2 w-full rounded">
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Tiempo Invertido (minutos)</label>
          <input 
            type="number" 
            {...register("time_spent", { valueAsNumber: true })} 
            className="border p-2 w-full rounded" 
            min="0"
            step="1"
          />
        </div>
        <div>
          <label className="block mb-2">Notas de Trabajo</label>
          <textarea {...register("work_notes")} className="border p-2 w-full rounded" rows={4} />
        </div>
        <div>
          <label className="block mb-2">Herramienta Utilizada</label>
          <input {...register("tool_used")} className="border p-2 w-full rounded" />
        </div>
        <div>
          <label className="block mb-2">Método de Pago</label>
          <select {...register("payment_method")} className="border p-2 w-full rounded">
            <option value="">Seleccionar método de pago</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
            <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
            <option value="TRANSFERENCIA_BANCARIA">Transferencia Bancaria</option>
            <option value="PAGO_MOVIL">Pago Móvil</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Monto Total</label>
          <input 
            type="number" 
            step="0.01"
            {...register("total_amount")} 
            className="border p-2 w-full rounded" 
          />
        </div>
        <div>
          <label className="block mb-2">Referencia de Pago</label>
          <input {...register("payment_reference")} className="border p-2 w-full rounded" />
        </div>
        <div className="flex justify-between mt-6">
          <Link 
            href={isReviewMode ? '/dashboard/review/tickets' : '/dashboard/tickets'}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isReviewMode ? 'Confirmar Aprobación' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketPage;
