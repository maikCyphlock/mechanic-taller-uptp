import { type NextPage } from "next";
import { api } from "~/utils/api";
import { DataTable } from "~/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { type ticket, type client, type vehicle, type users } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";

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
    header: "Asignado a",
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
        <Link href={`/dashboard/tickets/${ticket.ticket.id}`}>
          <Button variant="ghost" size="sm">Ver</Button>
        </Link>
      );
    },
  },
];

const TicketsPage: NextPage = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN';
  
  const { data, isLoading } = api.ticket.getAll.useQuery(
    { userId: isAdmin ? undefined : session?.user?.id },
    { enabled: !!session?.user?.id }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
        <Link href="/dashboard/tickets/create">
          <Button>
            Crear Ticket
          </Button>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default TicketsPage;
