
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { DataTable } from "~/components/ui/data-table";
import { client } from "~/server/db/schema";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

const columns: ColumnDef<typeof client.$inferSelect>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <Link href={`/dashboard/clients/${client.id}`}>
          <p className="text-blue-500">View</p>
        </Link>
      );
    },
  },
];

const ClientsPage: NextPage = () => {
  const { data, isLoading } = api.client.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Clients</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default ClientsPage;
