
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { DataTable } from "~/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { type users } from "~/server/db/schema";

const columns: ColumnDef<typeof users.$inferSelect>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Link href={`/dashboard/users/${user.id}`}>
          <p className="text-blue-500">View</p>
        </Link>
      );
    },
  },
];

const UsersPage: NextPage = () => {
  const { data, isLoading } = api.user.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Users</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default UsersPage;
