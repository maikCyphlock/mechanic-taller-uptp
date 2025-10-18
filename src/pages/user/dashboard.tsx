import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/utils/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const UserDashboard: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: tickets, isLoading } = api.ticket.getMyTickets.useQuery();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ABIERTO: { variant: "secondary" as const, label: "Abierto" },
      EN_PROCESO: { variant: "default" as const, label: "En Proceso" },
      CERRADO: { variant: "outline" as const, label: "Cerrado" },
      CANCELADO: { variant: "destructive" as const, label: "Cancelado" },
      APROBADO: { variant: "default" as const, label: "Aprobado" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ABIERTO;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      BAJA: { variant: "outline" as const, label: "Baja" },
      MEDIA: { variant: "secondary" as const, label: "Media" },
      ALTA: { variant: "destructive" as const, label: "Alta" },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIA;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">← Volver al inicio</Link>
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Tickets</h1>
              <p className="text-gray-600 mt-2">Revisa el estado de tus solicitudes de servicio</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/user/settings">Configuración</Link>
              </Button>
              <Button asChild>
                <Link href="/user/ticket">Nuevo Ticket</Link>
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Cargando tickets...</p>
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes tickets</h3>
                <p className="text-gray-600 mb-6">
                  Aún no has creado ninguna solicitud de servicio. Crea tu primer ticket para comenzar.
                </p>
                <Button asChild>
                  <Link href="/user/ticket">Crear Primer Ticket</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {tickets.map((item) => (
              <Card key={item.ticket.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        Ticket #{item.ticket.id.slice(-8)}
                      </CardTitle>
                      <CardDescription>
                        Creado el {format(new Date(item.ticket.createdAt), "PPP", { locale: es })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(item.ticket.status)}
                      {getPriorityBadge(item.ticket.priority)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Cliente</h4>
                      {item.client && (
                        <div className="text-sm text-gray-600">
                          <p><strong>Nombre:</strong> {item.client.name}</p>
                          <p><strong>Cédula:</strong> {item.client.cedula}</p>
                          <p><strong>Teléfono:</strong> {item.client.phone}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Vehículo</h4>
                      {item.vehicle && (
                        <div className="text-sm text-gray-600">
                          <p><strong>Tipo:</strong> {item.vehicle.type}</p>
                          {item.vehicle.plate && <p><strong>Placa:</strong> {item.vehicle.plate}</p>}
                          {item.vehicle.make && <p><strong>Marca:</strong> {item.vehicle.make}</p>}
                          {item.vehicle.model && <p><strong>Modelo:</strong> {item.vehicle.model}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                    <p className="text-gray-600">{item.ticket.short_description || item.ticket.description}</p>
                  </div>

                  {item.ticket.estimatedCost && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Costo Estimado</h4>
                      <p className="text-lg font-semibold text-green-600">
                        ${item.ticket.estimatedCost}
                      </p>
                    </div>
                  )}

                  {item.ticket.work_notes && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Notas de Trabajo</h4>
                      <p className="text-gray-600">{item.ticket.work_notes}</p>
                    </div>
                  )}

                  {item.ticket.closedAt && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Fecha de Cierre</h4>
                      <p className="text-gray-600">
                        {format(new Date(item.ticket.closedAt), "PPP 'a las' p", { locale: es })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
