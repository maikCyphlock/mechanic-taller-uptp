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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { api } from "~/utils/api";
import { toast } from "sonner";

const CreateTicket: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    cedula: "",
    vehicleType: "" as "automovil" | "camioneta" | "camion" | "motocicleta" | "autobus" | "otro",
    plate: "",
    issueType: "",
    issueDescription: "",
  });

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  const createTicketMutation = api.ticket.create.useMutation({
    onSuccess: () => {
      toast.success("Ticket creado exitosamente");
      router.push("/user/dashboard");
    },
    onError: (error) => {
      toast.error("Error al crear el ticket: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicketMutation.mutate({
      name: formData.name,
      phone: formData.phone,
      cedula: formData.cedula,
      vehicleDetails: {
        type: formData.vehicleType,
        plate: formData.plate || undefined,
      },
      issueType: formData.issueType,
      issueDescription: formData.issueDescription,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">← Volver al inicio</Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Ticket</h1>
          <p className="text-gray-600 mt-2">Complete el formulario para crear una nueva solicitud de servicio</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente y Vehículo</CardTitle>
            <CardDescription>
              Proporcione los detalles del cliente y el vehículo que necesita servicio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
                    placeholder="Ingrese el nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula *</Label>
                  <Input
                    id="cedula"
                    type="text"
                    required
                    value={formData.cedula}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("cedula", e.target.value)}
                    placeholder="Ingrese la cédula"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("phone", e.target.value)}
                  placeholder="Ingrese el número de teléfono"
                />
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Vehículo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Tipo de Vehículo *</Label>
                    <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange("vehicleType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo" />
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
                  <div className="space-y-2">
                    <Label htmlFor="plate">Placa (Opcional)</Label>
                    <Input
                      id="plate"
                      type="text"
                      value={formData.plate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("plate", e.target.value)}
                      placeholder="Ingrese la placa del vehículo"
                    />
                  </div>
                </div>
              </div>

              {/* Issue Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información del Problema</h3>
                <div className="space-y-2">
                  <Label htmlFor="issueType">Tipo de Problema *</Label>
                  <Input
                    id="issueType"
                    type="text"
                    required
                    value={formData.issueType}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("issueType", e.target.value)}
                    placeholder="Ej: Motor, Frenos, Electricidad, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDescription">Descripción del Problema *</Label>
                  <Textarea
                    id="issueDescription"
                    required
                    value={formData.issueDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("issueDescription", e.target.value)}
                    placeholder="Describa detalladamente el problema que presenta el vehículo"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={createTicketMutation.isPending} className="flex-1">
                  {createTicketMutation.isPending ? "Creando..." : "Crear Ticket"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTicket;
