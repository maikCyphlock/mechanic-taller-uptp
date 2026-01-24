import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { SimpleAutocomplete } from "~/components/ui/simple-autocomplete";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { toast } from "sonner";
import { callOdooJsonRpc } from "~/lib/odoo/frontend-api";
import { useOdooCache } from "~/hooks/useOdooCache";
import { Breadcrumbs } from "~/components/layout/breadcrumbs";
import { User, Car, ArrowRight, Phone, Mail, MapPin, Calendar, Clock, Ticket } from "lucide-react";

const AdminVehicles: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const {
    vehicles: cachedVehicles,
    brands: cachedBrands,
    models: cachedModels,
    isLoading: cacheLoading,
    syncFromOdoo,
    searchBrands,
    searchModels
  } = useOdooCache();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [createData, setCreateData] = useState({
    plate: "",
    make: "",
    model: "",
    type: "automovil",
  });

  useEffect(() => {
    setVehicles(cachedVehicles);
  }, [cachedVehicles]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  const brandsList = searchBrands("");
  const currentModels = searchModels("", createData.make);

  const handleCreateVehicle = async () => {
    try {
      await callOdooJsonRpc('create_vehicle', createData);
      toast.success("Vehículo creado");
      setIsCreateDialogOpen(false);
      syncFromOdoo(true); // Force sync
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const term = searchTerm.toLowerCase();
    return !searchTerm ||
      v.license_plate?.toLowerCase().includes(term) ||
      v.brand?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term) ||
      v.owner?.name?.toLowerCase().includes(term);
  });

  if (status === "loading") return <div className="p-8 text-center">Cargando...</div>;
  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumbs items={[{ label: "Admin", href: "/" }, { label: "Vehículos" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Vehículos</h1>
          <p className="text-slate-500 mt-1">Gestión de la flota registrada en Odoo.</p>
        </div>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-md" onClick={() => setIsCreateDialogOpen(true)}>
          <Car className="mr-2 h-5 w-5" /> Nuevo Vehículo
        </Button>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Input
            className="pl-10 h-12 shadow-sm border-slate-200"
            placeholder="Buscar por placa, marca, modelo o dueño..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Vehículo</DialogTitle>
            <DialogDescription>Asegúrate de que la información coincida con la de Odoo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label>Placa / Matrícula</Label>
              <Input placeholder="ABC-123" value={createData.plate} onChange={e => setCreateData(d => ({ ...d, plate: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <SimpleAutocomplete options={brandsList} value={createData.make} onChange={val => setCreateData(d => ({ ...d, make: val }))} />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <SimpleAutocomplete options={currentModels} value={createData.model} onChange={val => setCreateData(d => ({ ...d, model: val }))} />
              </div>
            </div>
            <Button className="w-full h-12 text-lg bg-blue-600" onClick={handleCreateVehicle}>Crear Vehículo</Button>
          </div>
        </DialogContent>
      </Dialog>

      {cacheLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-slate-500 font-medium animate-pulse">Consultando Odoo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(v => (
            <Card key={v.id} className="hover:shadow-lg transition-all border-slate-200 group overflow-hidden">
              <CardHeader className="bg-slate-50/50 pb-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                      {v.license_plate || "Sin Placa"}
                    </CardTitle>
                    <CardDescription className="text-slate-600 font-medium">
                      {v.brand_name || v.brand} {v.model_name || v.model}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-mono">
                    #{v.id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5 pb-5">
                <div className="space-y-4">
                  {v.owner ? (
                    <Link href={`/admin/clients/${v.owner.id}`} className="block p-3 rounded-lg bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 transition-colors group/owner">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Propietario</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{v.owner.name}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-400 group-hover/owner:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-50 border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 italic">Sin propietario asignado</p>
                    </div>
                  )}

                  <Link href={`/admin/vehicles/${v.id}`}>
                    <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 hover:text-slate-900 group/btn">
                      Ver Ficha Técnica <ArrowRight className="ml-2 h-4 w-4 text-slate-400 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredVehicles.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="bg-slate-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Car className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No se encontraron vehículos</h3>
              <p className="text-slate-500">Intenta con otros términos de búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;
