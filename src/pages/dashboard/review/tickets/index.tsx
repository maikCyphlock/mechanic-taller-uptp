import { type NextPage } from "next";
import { api } from "~/utils/api";
import { DataTable } from "~/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type ticket, type client, type vehicle, type users } from "~/server/db/schema";

interface TicketData {
  ticket: typeof ticket.$inferSelect;
  client: typeof client.$inferSelect | null;
  vehicle: typeof vehicle.$inferSelect | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

const columns: ColumnDef<TicketData>[] = [
  {
    accessorKey: "ticket.short_description",
    header: "Descripción",
  },
  {
    accessorKey: "client.name",
    header: "Cliente",
  },
  {
    accessorKey: "vehicle.plate",
    header: "Vehículo",
  },
  {
    accessorKey: "user.name",
    header: "Mecánico",
  },
  {
    accessorKey: "ticket.status",
    header: "Estado",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <Link href={`/dashboard/tickets/${ticket.ticket.id}?review=true`}>
          <Button variant="outline" size="sm">Revisar</Button>
        </Link>
      );
    },
  },
];

const ReviewTicketsPage: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificar permisos
  const userRole = session?.user?.role;
  const isAuthorized = ['ADMIN', 'SUPERADMIN', 'SUPERVISOR'].includes(userRole ?? '');

  const { data: tickets, isLoading } = api.ticket.getClosedTickets.useQuery(
    undefined,
    { enabled: isAuthorized }
  );

  // Redirigir si no está autorizado
  if (status === 'unauthenticated') {
    void router.push('/auth/signin');
    return null;
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Acceso no autorizado</h2>
        <p>No tienes permiso para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Revisión de Tickets</h1>
      </div>
      
      {tickets && tickets.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable columns={columns} data={tickets} />
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600">No hay tickets pendientes de revisión</p>
        </div>
      )}
    </div>
  );
};

export default ReviewTicketsPage;
