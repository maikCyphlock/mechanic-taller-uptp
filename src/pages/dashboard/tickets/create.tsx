import { type NextPage } from "next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";

const createTicketSchema = z.object({
  name: z.string().min(2, { message: "El nombre es requerido" }),
  phone: z.string().min(8, { message: "El teléfono es requerido" }),
  cedula: z.string().min(6, { message: "La cédula es requerida" }),
  vehicleDetails: z.object({
    type: z.enum(["automovil", "camioneta", "camion", "motocicleta", "autobus", "otro"], {
      required_error: "Por favor selecciona un tipo de vehículo",
    }),
    plate: z.string().optional(),
  }),
  issueType: z.string().min(2, { message: "El tipo de problema es requerido" }),
  issueDescription: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
});

type CreateTicketInput = z.infer<typeof createTicketSchema>;

const CreateTicketPage: NextPage = () => {
  const router = useRouter();
  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      vehicleDetails: {
        type: "automovil",
      },
    },
  });

  const { mutate, isPending: isLoading } = api.ticket.create.useMutation({
    onSuccess: (data) => {
      void router.push(`/dashboard/tickets/${data.ticketId}`);
    },
    onError: (error) => {
      console.error("Error al crear el ticket:", error);
    },
  });

  const onSubmit = (data: CreateTicketInput) => {
    mutate(data);
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nuevo Ticket</CardTitle>
          <CardDescription>
            Complete la información requerida para crear un nuevo ticket de servicio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Información del Cliente</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cedula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cédula</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de cédula" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de teléfono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <h2 className="text-xl font-semibold pt-4">Información del Vehículo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleDetails.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Vehículo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="automovil">Automóvil</SelectItem>
                            <SelectItem value="camioneta">Camioneta</SelectItem>
                            <SelectItem value="camion">Camión</SelectItem>
                            <SelectItem value="motocicleta">Motocicleta</SelectItem>
                            <SelectItem value="autobus">Autobús</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleDetails.plate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Placa del vehículo" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <h2 className="text-xl font-semibold pt-4">Información del Servicio</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="issueType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Problema</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Cambio de aceite, reparación de frenos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="issueDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción del Problema</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describa en detalle el problema o servicio requerido" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="mr-2">Creando...</span>
                    </>
                  ) : (
                    'Crear Ticket'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTicketPage;
