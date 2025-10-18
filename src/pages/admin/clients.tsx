import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { api } from "~/utils/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const AdminClients: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [updateData, setUpdateData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    cedula: "",
  });

  const { data: clients, isLoading, refetch } = api.client.getAll.useQuery();
  const updateClientMutation = api.client.update.useMutation({
    onSuccess: () => {
      toast.success("Cliente actualizado exitosamente");
      refetch();
      setSelectedClient(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar el cliente: " + error.message);
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

  const filteredClients = clients?.filter((client) => {
    const matchesSearch =
      !searchTerm ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleUpdateClient = () => {
    if (!selectedClient) return;

    const data: any = {};

    if (updateData.name) data.name = updateData.name;
    if (updateData.email) data.email = updateData.email;
    if (updateData.phone) data.phone = updateData.phone;
    if (updateData.address) data.address = updateData.address;
    if (updateData.city) data.city = updateData.city;
    if (updateData.state) data.state = updateData.state;
    if (updateData.cedula) data.cedula = updateData.cedula;

    updateClientMutation.mutate({
      id: selectedClient.id,
      ...data,
    });
  };

  const openEditDialog = (client: any) => {
    setSelectedClient(client);
    setUpdateData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      cedula: client.cedula || "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">← Volver al inicio</Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-2">Administra todos los clientes del sistema</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nombre, email, cédula, teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="w-full"
                >
                  Limpiar Filtro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        ) : !filteredClients || filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron clientes</h3>
                <p className="text-gray-600">
                  No hay clientes que coincidan con el filtro de búsqueda.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription>
                        Cédula: {client.cedula} • Creado el {format(new Date(client.createdAt), "PPP", { locale: es })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Información de Contacto</h4>
                      <div className="text-sm text-gray-600">
                        {client.email && <p><strong>Email:</strong> {client.email}</p>}
                        {client.phone && <p><strong>Teléfono:</strong> {client.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Dirección</h4>
                      <div className="text-sm text-gray-600">
                        {client.address && <p>{client.address}</p>}
                        {(client.city || client.state) && (
                          <p>{[client.city, client.state].filter(Boolean).join(", ")}</p>
                        )}
                        {!client.address && !client.city && !client.state && (
                          <p className="text-gray-400">No especificada</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(client)}>
                          Editar Cliente
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Cliente: {client.name}</DialogTitle>
                          <DialogDescription>
                            Actualiza la información del cliente
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Nombre Completo</Label>
                              <Input
                                id="name"
                                value={updateData.name}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, name: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cedula">Cédula</Label>
                              <Input
                                id="cedula"
                                value={updateData.cedula}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, cedula: e.target.value }))}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={updateData.email}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, email: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Teléfono</Label>
                              <Input
                                id="phone"
                                value={updateData.phone}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="address">Dirección</Label>
                            <Textarea
                              id="address"
                              value={updateData.address}
                              onChange={(e) => setUpdateData(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Dirección completa..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">Ciudad</Label>
                              <Input
                                id="city"
                                value={updateData.city}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, city: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">Estado/Provincia</Label>
                              <Input
                                id="state"
                                value={updateData.state}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, state: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleUpdateClient} disabled={updateClientMutation.isPending}>
                              {updateClientMutation.isPending ? "Actualizando..." : "Actualizar Cliente"}
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedClient(null)}>
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

export default AdminClients;
