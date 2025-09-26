import { type NextPage } from "next";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Loader2 } from "lucide-react";

const updateProfileSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  phone: z.string().min(8, { message: "Ingrese un número de teléfono válido" }).optional(),
  cedula: z.string().min(6, { message: "Ingrese una cédula válida" }).optional(),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).optional().or(z.literal('')),
});

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.push('/auth/signin');
    },
  });

  const { data: user, isLoading, error } = api.user.getById.useQuery(
    { id: session?.user?.id ?? '' },
    { 
      enabled: status === 'authenticated' && !!session?.user?.id,
      retry: false,
   
    }
  );

  const { mutate: updateProfile, isPending: isUpdating } = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Perfil actualizado correctamente');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el perfil');
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      cedula: user?.cedula || '',
      password: '',
    },
  });

  // Update form when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        cedula: user.cedula || '',
        password: '',
      });
    }
  }, [user, reset]);

  const onSubmit = (data: UpdateProfileInput) => {
    // Only include password if it's not empty
    const updateData = data.password 
      ? data 
      : { ...data, password: undefined };
    
    updateProfile(updateData);
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-red-500">Error al cargar el perfil. Por favor intente de nuevo.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
          <CardDescription>
            Actualiza tu información personal y configuración de cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                Nombre Completo
              </label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Tu nombre completo"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Correo Electrónico
              </label>
              <Input
                id="email"
                value={user.email || ''}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">El correo electrónico no puede ser modificado</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium leading-none">
                Teléfono
              </label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Tu número de teléfono"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="cedula" className="text-sm font-medium leading-none">
                Cédula
              </label>
              <Input
                id="cedula"
                {...register("cedula")}
                placeholder="Tu número de cédula"
                className={errors.cedula ? 'border-red-500' : ''}
              />
              {errors.cedula && (
                <p className="text-sm text-red-500">{errors.cedula.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Nueva Contraseña
              </label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Dejar en blanco para no cambiar"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Mínimo 6 caracteres. Dejar en blanco para mantener la contraseña actual.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
