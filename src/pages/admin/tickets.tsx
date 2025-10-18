import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const AdminTickets: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [updateData, setUpdateData] = useState({
    description: "",
    status: "",
    priority: "",
    time_spent: "",
    work_notes: "",
    tool_used: "",
    payment_method: "",
    total_amount: "",
    payment_reference: "",
  });

  const { data: tickets, isLoading, refetch } = api.ticket.getAll.useQuery();
  const updateTicketMutation = api.ticket.update.useMutation({
    onSuccess: () => {
      toast.success("Ticket actualizado exitosamente");
      refetch();
      setSelectedTicket(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar el ticket: " + error.message);
    },
  });
  const approveTicketMutation = api.ticket.approve.useMutation({
    onSuccess: () => {
      toast.success("Ticket aprobado exitosamente");
      refetch();
    },
    onError: (error) => {
      toast.error("Error al aprobar el ticket: " + error.message);
    },
  });
  const deleteTicketMutation = api.ticket.delete.useMutation({
    onSuccess: () => {
      toast.success("Ticket eliminado exitosamente");
      refetch();
    },
    onError: (error) => {
      toast.error("Error al eliminar el ticket: " + error.message);
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

  const filteredTickets = tickets?.filter((item) => {
    const ticket = item.ticket;
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
    const matchesSearch =
      !searchTerm ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicle?.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.short_description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

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

  const handleUpdateTicket = () => {
    if (!selectedTicket) return;

    const data: any = {};

    if (updateData.description) data.description = updateData.description;
    if (updateData.status) data.status = updateData.status;
    if (updateData.priority) data.priority = updateData.priority;
    if (updateData.time_spent) data.time_spent = parseFloat(updateData.time_spent);
    if (updateData.work_notes) data.work_notes = updateData.work_notes;
    if (updateData.tool_used) data.tool_used = updateData.tool_used;
    if (updateData.payment_method) data.payment_method = updateData.payment_method;
    if (updateData.total_amount) data.total_amount = parseFloat(updateData.total_amount);
    if (updateData.payment_reference) data.payment_reference = updateData.payment_reference;

    updateTicketMutation.mutate({
      id: selectedTicket.id,
      ...data,
    });
  };

  const handleApproveTicket = (ticketId: string, status: "APROBADO" | "CERRADO") => {
    approveTicketMutation.mutate({ id: ticketId, status });
  };

  const handleDeleteTicket = (ticketId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este ticket?")) {
      deleteTicketMutation.mutate({ id: ticketId });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">← Volver al inicio</Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tickets</h1>
          <p className="text-gray-600 mt-2">Administra todos los tickets del sistema</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="ID, cliente, placa..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="ABIERTO">Abierto</SelectItem>
                    <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                    <SelectItem value="CERRADO">Cerrado</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    <SelectItem value="APROBADO">Aprobado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="BAJA">Baja</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("");
                    setPriorityFilter("");
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
            <p className="text-gray-600">Cargando tickets...</p>
          </div>
        ) : !filteredTickets || filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron tickets</h3>
                <p className="text-gray-600">
                  No hay tickets que coincidan con los filtros aplicados.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTickets.map((item) => (
              <Card key={item.ticket.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Cliente</h4>
                      {item.client && (
                        <div className="text-sm text-gray-600">
                          <p>{item.client.name}</p>
                          <p>Cédula: {item.client.cedula}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Vehículo</h4>
                      {item.vehicle && (
                        <div className="text-sm text-gray-600">
                          <p>Tipo: {item.vehicle.type}</p>
                          {item.vehicle.plate && <p>Placa: {item.vehicle.plate}</p>}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Asignado a</h4>
                      {item.user && (
                        <div className="text-sm text-gray-600">
                          <p>{item.user.name}</p>
                          <p>{item.user.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Descripción</h4>
                    <p className="text-sm text-gray-600">{item.ticket.short_description || item.ticket.description}</p>
                  </div>

                  {item.ticket.work_notes && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-1">Notas de Trabajo</h4>
                      <p className="text-sm text-gray-600">{item.ticket.work_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTicket(item)}>
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Ticket #{item.ticket.id.slice(-8)}</DialogTitle>
                          <DialogDescription>
                            Actualiza la información del ticket
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                              id="description"
                              value={updateData.description}
                              onChange={(e) => setUpdateData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Actualizar descripción..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="status">Estado</Label>
                              <Select value={updateData.status} onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ABIERTO">Abierto</SelectItem>
                                  <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                                  <SelectItem value="CERRADO">Cerrado</SelectItem>
                                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="priority">Prioridad</Label>
                              <Select value={updateData.priority} onValueChange={(value) => setUpdateData(prev => ({ ...prev, priority: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar prioridad" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="BAJA">Baja</SelectItem>
                                  <SelectItem value="MEDIA">Media</SelectItem>
                                  <SelectItem value="ALTA">Alta</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="time_spent">Tiempo Empleado (horas)</Label>
                              <Input
                                id="time_spent"
                                type="number"
                                step="0.5"
                                value={updateData.time_spent}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, time_spent: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="total_amount">Monto Total</Label>
                              <Input
                                id="total_amount"
                                type="number"
                                step="0.01"
                                value={updateData.total_amount}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, total_amount: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="work_notes">Notas de Trabajo</Label>
                            <Textarea
                              id="work_notes"
                              value={updateData.work_notes}
                              onChange={(e) => setUpdateData(prev => ({ ...prev, work_notes: e.target.value }))}
                              placeholder="Agregar notas del trabajo realizado..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="tool_used">Herramientas Utilizadas</Label>
                            <Input
                              id="tool_used"
                              value={updateData.tool_used}
                              onChange={(e) => setUpdateData(prev => ({ ...prev, tool_used: e.target.value }))}
                              placeholder="Herramientas utilizadas..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="payment_method">Método de Pago</Label>
                              <Select value={updateData.payment_method} onValueChange={(value) => setUpdateData(prev => ({ ...prev, payment_method: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                                  <SelectItem value="TARJETA_CREDITO">Tarjeta Crédito</SelectItem>
                                  <SelectItem value="TARJETA_DEBITO">Tarjeta Débito</SelectItem>
                                  <SelectItem value="TRANSFERENCIA_BANCARIA">Transferencia</SelectItem>
                                  <SelectItem value="PAGO_MOVIL">Pago Móvil</SelectItem>
                                  <SelectItem value="OTRO">Otro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="payment_reference">Referencia de Pago</Label>
                              <Input
                                id="payment_reference"
                                value={updateData.payment_reference}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, payment_reference: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleUpdateTicket} disabled={updateTicketMutation.isPending}>
                              {updateTicketMutation.isPending ? "Actualizando..." : "Actualizar"}
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {item.ticket.status === "CERRADO" && (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApproveTicket(item.ticket.id, "APROBADO")}
                          disabled={approveTicketMutation.isPending}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTicket(item.ticket.id)}
                          disabled={deleteTicketMutation.isPending}
                        >
                          Eliminar
                        </Button>
                      </div>
                    )}
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

export default AdminTickets;
