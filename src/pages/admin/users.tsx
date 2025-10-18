import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/utils/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const AdminUsers: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [updateData, setUpdateData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    banned: false,
    banReason: "",
    banExpires: "",
    emailVerified: false,
    cedula: "",
    password: "",
  });

  const { data: users, isLoading, refetch } = api.user.getAll.useQuery();
  const updateUserMutation = api.user.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Usuario actualizado exitosamente");
      refetch();
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar el usuario: " + error.message);
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

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cedula?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      user: { variant: "outline" as const, label: "Usuario" },
      admin: { variant: "default" as const, label: "Admin" },
      CLIENTE: { variant: "secondary" as const, label: "Cliente" },
      GERENTE: { variant: "default" as const, label: "Gerente" },
      OTRO: { variant: "outline" as const, label: "Otro" },
      SUPERADMIN: { variant: "destructive" as const, label: "Super Admin" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    const data: any = {};

    if (updateData.name) data.name = updateData.name;
    if (updateData.email) data.email = updateData.email;
    if (updateData.phone) data.phone = updateData.phone;
    if (updateData.role) data.role = updateData.role;
    if (updateData.banned !== undefined) data.banned = updateData.banned;
    if (updateData.banReason) data.banReason = updateData.banReason;
    if (updateData.banExpires) data.banExpires = new Date(updateData.banExpires);
    if (updateData.emailVerified !== undefined) data.emailVerified = updateData.emailVerified;
    if (updateData.cedula) data.cedula = updateData.cedula;
    if (updateData.password) data.password = updateData.password;

    updateUserMutation.mutate({
      id: selectedUser.id,
      ...data,
    });
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setUpdateData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
      banned: user.banned || false,
      banReason: user.banReason || "",
      banExpires: user.banExpires ? format(new Date(user.banExpires), "yyyy-MM-dd") : "",
      emailVerified: !!user.emailVerified,
      cedula: user.cedula || "",
      password: "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">← Volver al inicio</Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra todos los usuarios del sistema</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nombre, email, cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="CLIENTE">Cliente</SelectItem>
                    <SelectItem value="GERENTE">Gerente</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                    <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRoleFilter("");
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
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : !filteredUsers || filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-600">
                  No hay usuarios que coincidan con los filtros aplicados.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>
                        {user.email} • Creado el {format(new Date(user.createdAt), "PPP", { locale: es })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getRoleBadge(user.role)}
                      {user.banned && <Badge variant="destructive">Baneado</Badge>}
                      {!user.emailVerified && <Badge variant="outline">Sin Verificar</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Información Personal</h4>
                      <div className="text-sm text-gray-600">
                        {user.cedula && <p>Cédula: {user.cedula}</p>}
                        {user.phone && <p>Teléfono: {user.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Estado de la Cuenta</h4>
                      <div className="text-sm text-gray-600">
                        <p>Verificado: {user.emailVerified ? "Sí" : "No"}</p>
                        {user.banned && (
                          <>
                            <p>Baneado: Sí</p>
                            {user.banReason && <p>Razón: {user.banReason}</p>}
                            {user.banExpires && (
                              <p>Hasta: {format(new Date(user.banExpires), "PPP", { locale: es })}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Última Actualización</h4>
                      <div className="text-sm text-gray-600">
                        <p>{format(new Date(user.updatedAt), "PPP", { locale: es })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                          Editar Usuario
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Usuario: {user.name}</DialogTitle>
                          <DialogDescription>
                            Actualiza la información del usuario
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Nombre</Label>
                              <Input
                                id="name"
                                value={updateData.name}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={updateData.email}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, email: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="phone">Teléfono</Label>
                              <Input
                                id="phone"
                                value={updateData.phone}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="cedula">Cédula</Label>
                              <Input
                                id="cedula"
                                value={updateData.cedula}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, cedula: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="role">Rol</Label>
                              <Select value={updateData.role} onValueChange={(value) => setUpdateData(prev => ({ ...prev, role: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Usuario</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="CLIENTE">Cliente</SelectItem>
                                  <SelectItem value="GERENTE">Gerente</SelectItem>
                                  <SelectItem value="OTRO">Otro</SelectItem>
                                  <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
                              <Input
                                id="password"
                                type="password"
                                value={updateData.password}
                                onChange={(e) => setUpdateData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Dejar vacío para mantener la actual"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="emailVerified"
                              checked={updateData.emailVerified}
                              onCheckedChange={(checked: boolean) => setUpdateData(prev => ({ ...prev, emailVerified: !!checked }))}
                            />
                            <Label htmlFor="emailVerified">Email verificado</Label>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="banned"
                                checked={updateData.banned}
                                onCheckedChange={(checked: boolean) => setUpdateData(prev => ({ ...prev, banned: !!checked }))}
                              />
                              <Label htmlFor="banned">Usuario baneado</Label>
                            </div>
                            {updateData.banned && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="banReason">Razón del baneo</Label>
                                  <Input
                                    id="banReason"
                                    value={updateData.banReason}
                                    onChange={(e) => setUpdateData(prev => ({ ...prev, banReason: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="banExpires">Fecha de expiración</Label>
                                  <Input
                                    id="banExpires"
                                    type="date"
                                    value={updateData.banExpires}
                                    onChange={(e) => setUpdateData(prev => ({ ...prev, banExpires: e.target.value }))}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
                              {updateUserMutation.isPending ? "Actualizando..." : "Actualizar Usuario"}
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedUser(null)}>
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

export default AdminUsers;
