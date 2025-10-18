import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { api } from "~/utils/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const AdminVehicles: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [updateData, setUpdateData] = useState({
    plate: "",
    make: "",
    model: "",
    year: "",
    color: "",
    type: "",
  });

  const { data: vehicles, isLoading, refetch } = api.vehicle.getAll.useQuery();
  const updateVehicleMutation = api.vehicle.update.useMutation({
    onSuccess: () => {
      toast.success("Vehículo actualizado exitosamente");
      refetch();
      setSelectedVehicle(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar el vehículo: " + error.message);
    },
  });

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session || session.user.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  if (!session || session.user.role !== "admin") {
    return null; // Will redirect via useEffect
  }

  const filteredVehicles = vehicles?.filter((vehicle) => {
    const matchesSearch =
      !searchTerm ||
      vehicle.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.color?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !typeFilter || vehicle.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getVehicleTypeLabel = (type: string) => {
    const typeLabels = {
      automovil: "Automóvil",
      camioneta: "Camioneta",
      camion: "Camión",
      motocicleta: "Motocicleta",
      autobus: "Autobús",
      otro: "Otro",
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const handleUpdateVehicle = () => {
    if (!selectedVehicle) return;

    const data: any = {};

    if (updateData.plate) data.plate = updateData.plate;
    if (updateData.make) data.make = updateData.make;
    if (updateData.model) data.model = updateData.model;
    if (updateData.year) data.year = parseInt(updateData.year);
    if (updateData.color) data.color = updateData.color;
    if (updateData.type) data.type = updateData.type;

    updateVehicleMutation.mutate({
      id: selectedVehicle.id,
      ...data,
    });
  };

  const openEditDialog = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setUpdateData({
      plate: vehicle.plate || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year?.toString() || "",
      color: vehicle.color || "",
      type: vehicle.type || "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">← Volver al inicio</Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Vehículos</h1>
          <p className="text-gray-600 mt-2">Administra todos los vehículos del sistema</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Placa, marca, modelo, color..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="automovil">Automóvil</SelectItem>
                    <SelectItem value="camioneta">Camioneta</SelectItem>
                    <SelectItem value="camion">Camión</SelectItem>
                    <SelectItem value="motocicleta">Motocicleta</SelectItem>
                    <SelectItem value="autobus">Autobús</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTypeFilter("");
                    setSearchTerm("");
                  }}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Cargando vehículos...</p>
          </div>
        ) : !filteredVehicles || filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron vehículos</h3>
                <p className="text-gray-600">
                  No hay vehículos que coincidan con los filtros aplicados.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {vehicle.plate ? `Placa: ${vehicle.plate}` : `Vehículo ${vehicle.id.slice(-8)}`}
                      </CardTitle>
                      <CardDescription>
                        {getVehicleTypeLabel(vehicle.type)} • Creado el {format(new Date(vehicle.createdAt), "PPP", { locale: es })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Información del Vehículo</h4>
                      <div className="text-sm text-gray-600">
                        {vehicle.make && <p><strong>Marca:</strong> {vehicle.make}</p>}
                        {vehicle.model && <p><strong>Modelo:</strong> {vehicle.model}</p>}
                        {vehicle.year && <p><strong>Año:</strong> {vehicle.year}</p>}
                        {vehicle.color && <p><strong>Color:</strong> {vehicle.color}</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Información Adicional</h4>
                      <div className="text-sm text-gray-600">
                        <p><strong>Tipo:</strong> {getVehicleTypeLabel(vehicle.type)}</p>
                        {vehicle.plate && <p><strong>Placa:</strong> {vehicle.plate}</p>}
                        <p><strong>ID:</strong> {vehicle.id.slice(-8)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(vehicle)}>
                          Editar Vehículo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Vehículo: {vehicle.plate || vehicle.id.slice(-8)}</DialogTitle>
                          <DialogDescription>
                            Actualiza la información del vehículo
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="plate">Placa</Label>
                              <Input
                                id="plate"
                                value={updateData.plate}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, plate: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="type">Tipo de Vehículo</Label>
                              <Select value={updateData.type} onValueChange={(value) => setUpdateData(prev => ({ ...prev, type: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="automovil">Automóvil</SelectItem>
                                  <SelectItem value="camioneta">Camioneta</SelectItem>
                                  <SelectItem value="camion">Camión</SelectItem>
                                  <SelectItem value="motocicleta">Motocicleta</SelectItem>
                                  <SelectItem value="autobus">Autobús</SelectItem>
                                  <SelectItem value="otro">Otro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="make">Marca</Label>
                              <Input
                                id="make"
                                value={updateData.make}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, make: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="model">Modelo</Label>
                              <Input
                                id="model"
                                value={updateData.model}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, model: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="year">Año</Label>
                              <Input
                                id="year"
                                type="number"
                                value={updateData.year}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, year: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="color">Color</Label>
                            <Input
                              id="color"
                              value={updateData.color}
                              onChange={(e) => setUpdateData(prev => ({ ...prev, color: e.target.value }))}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleUpdateVehicle} disabled={updateVehicleMutation.isPending}>
                              {updateVehicleMutation.isPending ? "Actualizando..." : "Actualizar Vehículo"}
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedVehicle(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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

export default AdminVehicles;
