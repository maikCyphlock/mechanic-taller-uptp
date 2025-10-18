import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";
import { toast } from "sonner";

const UserSettings: NextPage = () => {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    phone: "",
    cedula: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle redirect to signin if no session
  useEffect(() => {
    if (session === null) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil actualizado exitosamente");
      // Refresh the session to get updated user data
      update();
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    },
    onError: (error) => {
      toast.error("Error al actualizar el perfil: " + error.message);
    },
  });

  if (!session) {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: any = {};

    if (formData.name !== session.user.name) {
      updateData.name = formData.name;
    }

    if (formData.phone) {
      updateData.phone = formData.phone;
    }

    if (formData.cedula) {
      updateData.cedula = formData.cedula;
    }

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Las contraseñas nuevas no coinciden");
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error("La nueva contraseña debe tener al menos 6 caracteres");
        return;
      }
      updateData.password = formData.newPassword;
    }

    // Only submit if there's something to update
    if (Object.keys(updateData).length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    updateProfileMutation.mutate(updateData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">← Volver al inicio</Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Perfil</h1>
          <p className="text-gray-600 mt-2">Actualiza tu información personal y configuración de cuenta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Actualiza tus datos personales y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Datos Personales</h3>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ingrese su nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula</Label>
                  <Input
                    id="cedula"
                    type="text"
                    value={formData.cedula}
                    onChange={(e) => handleInputChange("cedula", e.target.value)}
                    placeholder="Ingrese su número de cédula"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Ingrese su número de teléfono"
                  />
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de Cuenta</h3>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={session.user.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    El correo electrónico no puede ser cambiado. Contacta a un administrador si necesitas actualizarlo.
                  </p>
                </div>
              </div>

              {/* Password Change */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cambiar Contraseña</h3>
                <p className="text-sm text-gray-600">
                  Deja estos campos vacíos si no deseas cambiar tu contraseña
                </p>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={updateProfileMutation.isPending} className="flex-1">
                  {updateProfileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Rol:</span>
                <span>{session.user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estado:</span>
                <span className={session.user.emailVerified ? "text-green-600" : "text-red-600"}>
                  {session.user.emailVerified ? "Verificado" : "Pendiente de verificación"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">ID de Usuario:</span>
                <span className="font-mono text-xs">{session.user.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserSettings;
