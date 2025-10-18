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

const AdminRoles: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    description: "",
  });
  const [updateData, setUpdateData] = useState({
    name: "",
    description: "",
  });

  const { data: roles, isLoading, refetch } = api.role.getAll.useQuery();
  const createRoleMutation = api.role.create.useMutation({
    onSuccess: () => {
      toast.success("Rol creado exitosamente");
      refetch();
      setIsCreateDialogOpen(false);
      setCreateData({ name: "", description: "" });
    },
    onError: (error) => {
      toast.error("Error al crear el rol: " + error.message);
    },
  });
  const updateRoleMutation = api.role.update.useMutation({
    onSuccess: () => {
      toast.success("Rol actualizado exitosamente");
      refetch();
      setSelectedRole(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar el rol: " + error.message);
    },
  });
  const deleteRoleMutation = api.role.delete.useMutation({
    onSuccess: () => {
      toast.success("Rol eliminado exitosamente");
      refetch();
    },
    onError: (error) => {
      toast.error("Error al eliminar el rol: " + error.message);
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

  const filteredRoles = roles?.filter((role) => {
    const matchesSearch =
      !searchTerm ||
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleCreateRole = () => {
    createRoleMutation.mutate({
      name: createData.name,
      description: createData.description || undefined,
    });
  };

  const handleUpdateRole = () => {
    if (!selectedRole) return;

    const data: any = {};

    if (updateData.name) data.name = updateData.name;
    if (updateData.description !== undefined) data.description = updateData.description;

    updateRoleMutation.mutate({
      id: selectedRole.id,
      ...data,
    });
  };

  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el rol "${roleName}"?`)) {
      deleteRoleMutation.mutate({ id: roleId });
    }
  };

  const openEditDialog = (role: any) => {
    setSelectedRole(role);
    setUpdateData({
      name: role.name || "",
      description: role.description || "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">← Volver al inicio</Link>
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles</h1>
              <p className="text-gray-600 mt-2">Administra los roles del sistema</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Crear Nuevo Rol</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Rol</DialogTitle>
                  <DialogDescription>
                    Agrega un nuevo rol al sistema
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="createName">Nombre del Rol *</Label>
                    <Input
                      id="createName"
                      value={createData.name}
                      onChange={(e) => setCreateData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Supervisor, Técnico, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="createDescription">Descripción</Label>
                    <Textarea
                      id="createDescription"
                      value={createData.description}
                      onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe las responsabilidades del rol..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateRole} disabled={createRoleMutation.isPending} className="flex-1">
                      {createRoleMutation.isPending ? "Creando..." : "Crear Rol"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nombre o descripción del rol..."
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
                  Limpiar Búsqueda
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Cargando roles...</p>
          </div>
        ) : !filteredRoles || filteredRoles.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron roles</h3>
                <p className="text-gray-600 mb-6">
                  No hay roles que coincidan con la búsqueda.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>Crear Primer Rol</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <CardDescription>
                        ID: {role.id.slice(-8)} • Creado el {format(new Date(role.createdAt), "PPP", { locale: es })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Descripción</h4>
                    <p className="text-gray-600">
                      {role.description || "Sin descripción"}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(role)}>
                          Editar Rol
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Editar Rol: {role.name}</DialogTitle>
                          <DialogDescription>
                            Actualiza la información del rol
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="updateName">Nombre del Rol</Label>
                            <Input
                              id="updateName"
                              value={updateData.name}
                              onChange={(e) => setUpdateData(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="updateDescription">Descripción</Label>
                            <Textarea
                              id="updateDescription"
                              value={updateData.description}
                              onChange={(e) => setUpdateData(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleUpdateRole} disabled={updateRoleMutation.isPending}>
                              {updateRoleMutation.isPending ? "Actualizando..." : "Actualizar"}
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedRole(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      disabled={deleteRoleMutation.isPending}
                    >
                      Eliminar
                    </Button>
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

export default AdminRoles;
