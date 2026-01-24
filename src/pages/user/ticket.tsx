import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ClientAutocomplete } from "~/components/ticket/ClientAutocomplete";
import { BrandAutocomplete } from "~/components/ticket/BrandAutocomplete";
import { ModelAutocomplete } from "~/components/ticket/ModelAutocomplete";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { User, Car, Ticket as TicketIcon } from "lucide-react";

const CreateTicket: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    clientId: null as number | null,
    clientName: "",
    clientPhone: "",
    clientCedula: "",
    vehiclePlate: "",
    vehicleBrand: "",
    vehicleModel: "",
    issueTitle: "",
    issueDesc: "",
  });

  useEffect(() => {
    if (status !== "loading" && !session) router.push("/auth/signin");
  }, [session, status, router]);

  const callOdoo = async (action: string, data: any) => {
    const res = await fetch("/api/odoo/jsonrpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Error");
    return json.id;
  };

  const handleSelectClient = (client: any) => {
    setForm(f => ({
      ...f,
      clientId: client.id,
      clientName: client.name,
      clientCedula: client.vat || client.cedula || "",
      clientPhone: client.phone || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear/Obtener cliente
      const clientId = await callOdoo("create_client", {
        name: form.clientName,
        phone: form.clientPhone,
        cedula: form.clientCedula,
      });

      // 2. Crear vehículo
      const vehicleId = await callOdoo("create_vehicle", {
        plate: form.vehiclePlate,
        brand: form.vehicleBrand,
        model: form.vehicleModel,
        owner_id: clientId,
      });

      // 3. Crear ticket
      console.log("Creando ticket con IDs:", { clientId, vehicleId });
      const ticketId = await callOdoo("create_ticket", {
        title: form.issueTitle,
        description: form.issueDesc,
        date: new Date().toISOString().split("T")[0],
        client_id: clientId,
        vehicle_id: vehicleId,
      });

      toast.success(`Ticket creado con éxito!`);
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="p-8">Cargando...</div>;
  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Nueva Solicitud de Servicio
        </h1>
        <p className="mt-2 text-slate-600">
          Completa los datos del cliente, vehículo y el detalle del problema.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sección Cliente */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nombre y Apellido *</Label>
              <ClientAutocomplete
                id="clientName"
                value={form.clientName}
                onChange={(val) => setForm(f => ({ ...f, clientName: val, clientId: null }))}
                onSelectClient={handleSelectClient}
                placeholder="Busca o escribe el nombre..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cedula">Cédula / RIF *</Label>
                <Input
                  id="cedula"
                  placeholder="V-12345678"
                  required
                  value={form.clientCedula}
                  onChange={e => setForm(f => ({ ...f, clientCedula: e.target.value, clientId: null }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="0412-1234567"
                  value={form.clientPhone}
                  onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección Vehículo */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5 text-emerald-600" />
              Información del Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plate">Placa *</Label>
              <Input
                id="plate"
                placeholder="ABC-123"
                required
                className="uppercase"
                value={form.vehiclePlate}
                onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <BrandAutocomplete
                  id="brand"
                  value={form.vehicleBrand}
                  onChange={(val) => setForm(f => ({ ...f, vehicleBrand: val }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <ModelAutocomplete
                  id="model"
                  brandName={form.vehicleBrand}
                  value={form.vehicleModel}
                  onChange={(val) => setForm(f => ({ ...f, vehicleModel: val }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección Problema */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <TicketIcon className="h-5 w-5 text-amber-600" />
              Detalles del Servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Asunto / Título *</Label>
              <Input
                id="title"
                placeholder="Ej: Cambio de aceite, Ruido en frenos..."
                required
                value={form.issueTitle}
                onChange={e => setForm(f => ({ ...f, issueTitle: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descripción detallada *</Label>
              <Textarea
                id="desc"
                placeholder="Describe el problema o el servicio solicitado..."
                required
                rows={4}
                value={form.issueDesc}
                onChange={e => setForm(f => ({ ...f, issueDesc: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-lg shadow-md bg-blue-600 hover:bg-blue-700 transition-all font-bold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Procesando...
            </div>
          ) : "Registrar Ticket"}
        </Button>
      </form>
    </div>
  );
};

export default CreateTicket;
