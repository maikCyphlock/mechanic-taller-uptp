
import { type NextPage } from "next";
import Link from "next/link";
import { useSession } from "next-auth/react";

const DashboardPage: NextPage = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN';
  const isSupervisor = isAdmin || session?.user?.role === 'SUPERVISOR';

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel de Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/dashboard/clients" className="block hover:scale-105 transition-transform">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Clientes</h2>
            <p className="text-gray-600 text-sm text-center mt-2">Administrar información de clientes</p>
          </div>
        </Link>

        <Link href="/dashboard/tickets" className="block hover:scale-105 transition-transform">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Tickets</h2>
            <p className="text-gray-600 text-sm text-center mt-2">Gestionar órdenes de servicio</p>
          </div>
        </Link>

        {(isAdmin || isSupervisor) && (
          <Link href="/dashboard/review/tickets" className="block hover:scale-105 transition-transform">
            <div className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg border border-blue-100">
              <h2 className="text-xl font-semibold text-blue-800 text-center">Revisión</h2>
              <p className="text-blue-600 text-sm text-center mt-2">Revisar tickets pendientes</p>
            </div>
          </Link>
        )}

        {isAdmin && (
          <>
            <Link href="/dashboard/users" className="block hover:scale-105 transition-transform">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 text-center">Usuarios</h2>
                <p className="text-gray-600 text-sm text-center mt-2">Administrar cuentas de usuario</p>
              </div>
            </Link>

            <Link href="/dashboard/vehicles" className="block hover:scale-105 transition-transform">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 text-center">Vehículos</h2>
                <p className="text-gray-600 text-sm text-center mt-2">Gestionar inventario de vehículos</p>
              </div>
            </Link>
          </>
        )}

        <Link href="/dashboard/profile" className="block hover:scale-105 transition-transform">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Mi Perfil</h2>
            <p className="text-gray-600 text-sm text-center mt-2">Ver y editar mi información</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
