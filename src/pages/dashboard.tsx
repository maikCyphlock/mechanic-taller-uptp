
import { type NextPage } from "next";
import Link from "next/link";

const DashboardPage: NextPage = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/clients">
          <p className="bg-gray-200 p-4 rounded-lg text-center font-bold">Clients</p>
        </Link>
        <Link href="/dashboard/tickets">
          <p className="bg-gray-200 p-4 rounded-lg text-center font-bold">Tickets</p>
        </Link>
        <Link href="/dashboard/users">
          <p className="bg-gray-200 p-4 rounded-lg text-center font-bold">Users</p>
        </Link>
        <Link href="/dashboard/vehicles">
          <p className="bg-gray-200 p-4 rounded-lg text-center font-bold">Vehicles</p>
        </Link>
        <Link href="/dashboard/profile">
          <p className="bg-gray-200 p-4 rounded-lg text-center font-bold">Profile</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
