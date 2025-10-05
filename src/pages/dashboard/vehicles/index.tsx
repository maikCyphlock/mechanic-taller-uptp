
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { type vehicle } from "~/server/db/schema";
import { DataTable } from "~/components/ui/data-table";

const columns: ColumnDef<typeof vehicle.$inferSelect>[] = [
  {
    accessorKey: "plate",
    header: "Plate",
  },
  {
    accessorKey: "make",
    header: "Make",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const vehicle = row.original;
      return (
        <Link href={`/dashboard/vehicles/${vehicle.id}`}>
          <p className="text-blue-500">View</p>
        </Link>
      );
    },
  },
];

const VehiclesPage: NextPage = () => {
  const { data, isLoading } = api.vehicle.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Vehicles</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default VehiclesPage;
