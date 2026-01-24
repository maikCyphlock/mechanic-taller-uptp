import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { callOdooJsonRpc } from "~/lib/odoo/frontend-api";
import { toast } from "sonner";
import { useOdooCache } from "~/hooks/useOdooCache";

const UserDashboard: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const { tickets: cachedTickets, isLoading: cacheLoading } = useOdooCache();

  useEffect(() => {
    setTickets(cachedTickets);
  }, [cachedTickets]);

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") return <div className="p-8 text-center">Cargando...</div>;
  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">← Volver al inicio</Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Tickets</h1>
              <p className="text-gray-600 mt-2">Estado de tus solicitudes en Odoo</p>
            </div>
            <div className="flex gap-2">
              <Link href="/user/ticket">
                <Button>Nuevo Ticket</Button>
              </Link>
            </div>
          </div>
        </div>

        {cacheLoading ? (
          <div className="text-center py-8"><p>Cargando tickets...</p></div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold mb-2">No tienes tickets</h3>
              <p className="text-gray-600 mb-6">Crea una solicitud para verla aquí.</p>
              <Link href="/user/ticket"><Button>Crear Primer Ticket</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {tickets.map((t) => (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-xl">#{t.id} - {t.name}</CardTitle>
                      <CardDescription>ID: {t.id} • {t.request_date}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4" dangerouslySetInnerHTML={{ __html: t.description }}></p>
                  <div className="flex gap-4 text-sm font-medium">
                    <span>Cliente: {Array.isArray(t.client_id) ? t.client_id[1] : 'N/A'}</span>
                    <span>Vehículo: {Array.isArray(t.vehicle_id) ? t.vehicle_id[1] : 'N/A'}</span>
                  </div>
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
