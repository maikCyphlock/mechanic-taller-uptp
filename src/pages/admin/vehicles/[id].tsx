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
import { Car, User, Ticket, Calendar, ArrowRight, Settings, ShieldCheck, Gauge } from "lucide-react";
import { useOdooCache } from "~/hooks/useOdooCache";

const AdminVehicleDetails: NextPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = router.query;

    const [vehicle, setVehicle] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const { vehicles: cachedVehicles, tickets: cachedTickets, isLoading: cacheLoading } = useOdooCache();
    const [isInternalLoading, setIsInternalLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user.role !== "admin") {
            router.push("/");
            return;
        }

        if (!cacheLoading && id) {
            const vId = Number(id);
            const foundVehicle = cachedVehicles.find(v => v.id === vId);
            if (foundVehicle) {
                setVehicle(foundVehicle);
                const vehicleTickets = cachedTickets.filter(t => {
                    const tVehicleId = Array.isArray(t.vehicle_id) ? t.vehicle_id[0] : t.vehicle_id;
                    return tVehicleId === vId;
                });
                setTickets(vehicleTickets);
                setIsInternalLoading(false);
            } else {
                // If not found in cache and not loading, maybe it doesn't exist or cache is empty
                setIsInternalLoading(false);
            }
        }
    }, [id, session, status, router, cachedVehicles, cachedTickets, cacheLoading]);

    if (status === "loading" || cacheLoading || isInternalLoading) return <div className="p-20 text-center text-slate-500">Cargando ficha técnica...</div>;
    if (!vehicle) return <div className="p-20 text-center text-slate-500">No se encontró el vehículo.</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Breadcrumbs
                items={[
                    { label: "Admin", href: "/" },
                    { label: "Vehículos", href: "/admin/vehicles" },
                    { label: vehicle.license_plate || "Sin Placa" }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lateral: Ficha Técnica */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-slate-200 overflow-hidden">
                        <div className="p-6 bg-slate-900 text-white">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-slate-800 text-blue-400">
                                    <Car className="h-8 w-8" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">
                                {vehicle.license_plate || "Sin Placa"}
                            </h1>
                            <p className="text-slate-400 font-bold mt-1 uppercase text-sm tracking-widest">
                                {vehicle.brand_name || vehicle.brand} {vehicle.model_name || vehicle.model}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] items-center gap-1 uppercase font-black text-slate-400 tracking-tighter flex mb-1">
                                        <Settings className="h-3 w-3" /> Especificaciones
                                    </p>
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 divide-y divide-slate-200/50">
                                        <div className="flex justify-between py-2">
                                            <span className="text-xs font-bold text-slate-500">Año</span>
                                            <span className="text-sm font-black text-slate-900">{vehicle.model_year || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-xs font-bold text-slate-500">Serial VIN</span>
                                            <span className="text-xs font-mono font-bold text-slate-700">{vehicle.vin_sn || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-xs font-bold text-slate-500">Transmisión</span>
                                            <span className="text-xs font-mono font-bold text-slate-700">{vehicle.transmission}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Propietario */}
                            {vehicle.owner ? (
                                <div className="space-y-2">
                                    <p className="text-[10px] items-center gap-1 uppercase font-black text-slate-400 tracking-tighter flex">
                                        <User className="h-3 w-3" /> Dueño Registrado
                                    </p>
                                    <Link href={`/admin/clients/${vehicle.owner.id}`} className="block group">
                                        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 hover:bg-blue-50 transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {vehicle.owner.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-900 truncate tracking-tight">{vehicle.owner.name}</p>
                                                    <p className="text-xs font-bold text-blue-600/70">Ver Perfil</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center gap-3 text-slate-400">
                                    <div className="h-10 w-10 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs italic font-medium">Sin dueño asignado</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4 bg-emerald-50 border-emerald-100 text-emerald-800">
                            <Gauge className="h-5 w-5 mb-2" />
                            <p className="text-xs font-black uppercase tracking-tighter opacity-70">Uso Total</p>
                            <p className="text-xl font-black">{vehicle.odometer} KM</p>
                        </Card>
                        <Card className="p-4 bg-blue-50 border-blue-100 text-blue-800">
                            <ShieldCheck className="h-5 w-5 mb-2" />
                            <p className="text-xs font-black uppercase tracking-tighter opacity-70">Estado</p>
                            <p className="text-xl font-black">Activo</p>
                        </Card>
                    </div>
                </div>

                {/* Principal: Historial de Servicios */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-slate-900">
                            <Ticket className="h-6 w-6 text-amber-500" /> Historial de Servicio
                        </h2>
                        <Badge variant="outline" className="font-bold border-slate-300 h-6">
                            {tickets.length} Incidencias
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {tickets.map((t, idx) => (
                            <Card key={t.id} className="p-0 border-slate-200 hover:shadow-md transition-all group overflow-hidden">
                                <div className="flex h-full">
                                    <div className="w-1.5 bg-amber-400 group-hover:w-3 transition-all"></div>
                                    <div className="p-5 flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{t.name}</h3>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <Calendar className="h-3 w-3" />
                                                {t.request_date}
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 leading-snug line-clamp-2" dangerouslySetInnerHTML={{ __html: t.description }}></p>
                                        <div className="flex items-center gap-2 pt-2">
                                            <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-bold text-[10px] tracking-wider py-0 px-2 h-5">
                                                {Array.isArray(t.stage_id) ? t.stage_id[1] : 'Pendiente'}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-slate-300">INCIDENTE #{t.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {tickets.length === 0 && (
                            <div className="py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Ticket className="h-8 w-8 text-slate-300" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Cero incidencias registradas</h3>
                                    <p className="text-sm text-slate-500 max-w-[240px] font-medium">Este vehículo no ha pasado por el taller desde nuestra integración con Odoo.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVehicleDetails;
