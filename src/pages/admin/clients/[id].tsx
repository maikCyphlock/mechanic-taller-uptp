import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import { Breadcrumbs } from "~/components/layout/breadcrumbs";
import { User, Car, Ticket, Phone, Mail, MapPin, Calendar, ArrowRight, Info } from "lucide-react";
import { useOdooCache } from "~/hooks/useOdooCache";

const AdminClientDetails: NextPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = router.query;

    const [client, setClient] = useState<any>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const { clients: cachedClients, vehicles: cachedVehicles, tickets: cachedTickets, isLoading: cacheLoading } = useOdooCache();
    const [isInternalLoading, setIsInternalLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user.role !== "admin") {
            router.push("/");
            return;
        }

        if (!cacheLoading && id) {
            const cId = Number(id);
            const foundClient = cachedClients.find(c => c.id === cId);
            if (foundClient) {
                setClient(foundClient);
                setVehicles(cachedVehicles.filter(v =>
                    (Array.isArray(v.owner) ? v.owner[0] : v.owner?.id) === cId
                ));
                setTickets(cachedTickets.filter(t =>
                    (Array.isArray(t.client_id) ? t.client_id[0] : t.client_id) === cId
                ));
                setIsInternalLoading(false);
            } else {
                setIsInternalLoading(false);
            }
        }
    }, [id, session, status, router, cachedClients, cachedVehicles, cachedTickets, cacheLoading]);

    if (status === "loading" || cacheLoading || isInternalLoading) return <div className="p-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>Cargando datos del cliente...</div>;
    if (!client) return <div className="p-20 text-center text-slate-500">No se encontró el cliente.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Breadcrumbs
                items={[
                    { label: "Admin", href: "/" },
                    { label: "Clientes", href: "/admin/clients" },
                    { label: client.name }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lateral: Información General */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-blue-100 overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                        <div className="px-6 pb-6 -mt-12 text-center">
                            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white border-4 border-white shadow-md mb-4 overflow-hidden">
                                <User className="h-12 w-12 text-blue-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
                            <p className="text-slate-500 font-medium">#{client.id}</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1">
                                    Cliente Mecatec
                                </Badge>
                                {client.vat && (
                                    <Badge variant="outline" className="text-slate-500 border-slate-200">
                                        RIF: {client.vat}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="border-t border-slate-100 px-6 py-6 space-y-4 bg-slate-50/30">
                            {client.phone && (
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium">{client.phone}</span>
                                </div>
                            )}
                            {client.email && (
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium break-all">{client.email}</span>
                                </div>
                            )}
                            {client.street && (
                                <div className="flex items-start gap-3 text-slate-600">
                                    <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                                    <span className="text-sm font-medium">
                                        {client.street}, {client.city}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Card>

                    {client.comment && (
                        <Card className="border-amber-100 bg-amber-50/50 p-6">
                            <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                                <Info className="h-4 w-4" /> Notas internas
                            </div>
                            <p className="text-sm text-amber-900/80 leading-relaxed italic">
                                "{client.comment}"
                            </p>
                        </Card>
                    )}
                </div>

                {/* Principal: Vehículos y Tickets */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Vehículos */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                <Car className="h-5 w-5 text-emerald-600" /> Vehículos Registrados
                            </h2>
                            <span className="text-sm text-slate-500 font-medium">{vehicles.length} vehículos</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {vehicles.map(v => (
                                <Link key={v.id} href={`/admin/vehicles/${v.id}`}>
                                    <Card className="hover:border-emerald-200 hover:shadow-md transition-all group p-4 border-slate-200">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors uppercase">
                                                    {v.license_plate}
                                                </p>
                                                <p className="text-sm text-slate-500 font-medium">
                                                    {v.brand} {v.model}
                                                </p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                            {vehicles.length === 0 && (
                                <div className="col-span-full bg-slate-50 rounded-xl border border-dashed border-slate-200 py-8 text-center">
                                    <p className="text-slate-500 text-sm">No tiene vehículos registrados.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Historial de Tickets */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                <Ticket className="h-5 w-5 text-amber-600" /> Historial de Servicios
                            </h2>
                            <span className="text-sm text-slate-500 font-medium">{tickets.length} tickets</span>
                        </div>
                        <div className="space-y-4">
                            {tickets.map(t => (
                                <Card key={t.id} className="p-4 border-slate-200 hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-slate-900">{t.name}</h3>
                                            <p className="text-sm text-slate-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: t.description }}></p>
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Calendar className="h-3 w-3" />
                                                    {t.request_date}
                                                </div>
                                                <Badge className="text-[10px] uppercase font-bold tracking-wider px-2 py-0">
                                                    {Array.isArray(t.stage_id) ? t.stage_id[1] : 'Nuevo'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            Ver detalle
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                            {tickets.length === 0 && (
                                <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 py-8 text-center">
                                    <p className="text-slate-500 text-sm">No hay servicios registrados.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminClientDetails;
