import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

const Home: NextPage = () => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Taller
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Inicia sesión para acceder al sistema
          </p>
          <Button asChild>
            <Link href="/auth/signin">Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!session.user.emailVerified) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Verificación Requerida </CardTitle>
              <CardDescription>
                Tu cuenta está en proceso de verificación. Un administrador
                revisará tu solicitud y te notificará cuando tu cuenta haya sido
                activada.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido, {session.user.name}
            
          </h1>
          <p className="text-lg text-gray-600">
            Selecciona una opción para continuar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎫 Abrir Nuevo Ticket
              </CardTitle>
              <CardDescription>
                Crea una nueva solicitud de soporte o reporte un problema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/tickets/create">Crear Ticket</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Ver Mis Tickets
              </CardTitle>
              <CardDescription>
                Revisa el estado de tus tickets existentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/tickets">Ver Mis Tickets</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {session.user.role === "admin" && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Panel de Administración
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎫 Gestionar Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/tickets">Ver Tickets</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    👥 Gestionar Usuarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/admin/users">Ver Usuarios</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    👥 Gestionar Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/admin/clients">Ver Clientes</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;