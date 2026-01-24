import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { SyncStatusBadge, SyncPanel } from "~/components/sync/SyncStatus";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const AdminSync: NextPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const { data: queueItems, refetch: refetchQueue } = api.sync.getSyncQueue.useQuery({
        status: 'failed',
        limit: 10,
    });

    const clearQueueMutation = api.sync.clearCompletedQueue.useMutation({
        onSuccess: () => {
            toast.success("Cola limpiada exitosamente");
            void refetchQueue();
        },
        onError: (error) => {
            toast.error("Error al limpiar cola: " + error.message);
        },
    });

    const retryMutation = api.sync.retrySyncItem.useMutation({
        onSuccess: () => {
            toast.success("Item reintentado exitosamente");
            void refetchQueue();
        },
        onError: (error) => {
            toast.error("Error al reintentar: " + error.message);
        },
    });

    useEffect(() => {
        if (status === "loading") return;
        if (!session || (session.user.role !== "admin" && session.user.role !== "GERENTE" && session.user.role !== "SUPERADMIN")) {
            router.push("/");
        }
    }, [session, status, router]);

    if (status === "loading") {
        return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
    }

    if (!session || (session.user.role !== "admin" && session.user.role !== "GERENTE" && session.user.role !== "SUPERADMIN")) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Button variant="outline" asChild className="mb-4">
                        <Link href="/">← Volver al inicio</Link>
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Sincronización con Odoo</h1>
                            <p className="text-gray-600 mt-2">Gestiona la sincronización de datos entre la aplicación y Odoo ERP</p>
                        </div>
                        <SyncStatusBadge />
                    </div>
                </div>

                {/* Panel principal de sincronización */}
                <div className="mb-6">
                    <SyncPanel />
                </div>

                {/* Cola de sincronización fallida */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Cola de Sincronización - Items Fallidos</CardTitle>
                                <CardDescription>
                                    Operaciones que fallaron y requieren atención manual
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => clearQueueMutation.mutate()}
                                disabled={clearQueueMutation.isPending}
                            >
                                {clearQueueMutation.isPending ? "Limpiando..." : "Limpiar Completados"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!queueItems || queueItems.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="flex justify-center mb-4">
                                    <CheckCircle className="h-16 w-16 text-green-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No hay items fallidos
                                </h3>
                                <p className="text-gray-600">
                                    Todas las operaciones de sincronización se han completado exitosamente.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {queueItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start justify-between p-4 border rounded-lg bg-red-50"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                                                    {item.entityType}
                                                </span>
                                                <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                                                    {item.operation}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    {item.attempts} intentos
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-900 font-medium">
                                                Entity ID: {item.entityId}
                                            </p>
                                            {item.error && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    <strong>Error:</strong> {item.error}
                                                </p>
                                            )}
                                            {item.lastAttempt && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Último intento: {new Date(item.lastAttempt).toLocaleString('es-VE')}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => retryMutation.mutate({ itemId: item.id })}
                                            disabled={retryMutation.isPending}
                                        >
                                            Reintentar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Información adicional */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Información de Configuración</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Estados de Sincronización</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li><span className="font-medium">not_synced:</span> Nunca sincronizado con Odoo</li>
                                    <li><span className="font-medium">synced:</span> Sincronizado exitosamente</li>
                                    <li><span className="font-medium">pending:</span> Esperando sincronización</li>
                                    <li><span className="font-medium">error:</span> Falló la sincronización</li>
                                    <li><span className="font-medium">conflict:</span> Conflicto detectado</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Entidades Sincronizables</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> <span className="font-medium">Vehículos:</span> fleet.vehicle (Odoo)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> <span className="font-medium">Tickets:</span> maintenance.request (Odoo)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> <span className="font-medium">Inventario:</span> product.template (Odoo)</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> <span className="font-medium">Citas:</span> mecatec.appointment (Odoo)</li>
                                </ul>
                                <p className="text-xs text-green-600 mt-2 font-medium">
                                    Todos los conectores están activos y funcionando.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminSync;
