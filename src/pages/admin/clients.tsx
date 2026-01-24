import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { toast } from "sonner";
import { callOdooJsonRpc } from "~/lib/odoo/frontend-api";
import { Breadcrumbs } from "~/components/layout/breadcrumbs";
import { User, Phone, ArrowRight, UserPlus } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { useOdooCache } from "~/hooks/useOdooCache";

const AdminClients: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [clients, setClients] = useState<any[]>([]);
  const { clients: cachedClients, isLoading: cacheLoading, syncFromOdoo } = useOdooCache();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [createData, setCreateData] = useState({
    name: "",
    cedula: "",
    phone: "",
  });

  useEffect(() => {
    setClients(cachedClients);
  }, [cachedClients]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  const handleCreateClient = async () => {
    try {
      await callOdooJsonRpc('create_client', createData);
      toast.success("Cliente creado");
      setIsCreateDialogOpen(false);
      syncFromOdoo(true); // Force sync
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return !searchTerm ||
      c.name?.toLowerCase().includes(term) ||
      c.vat?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term);
  });

  if (status === "loading") return <div className="p-8 text-center text-slate-500">Cargando...</div>;
  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Breadcrumbs items={[{ label: "Admin", href: "/" }, { label: "Clientes" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Clientes</h1>
          <p className="text-slate-500 mt-1">Gestión de clientes vinculados en Odoo.</p>
        </div>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-md" onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-5 w-5" /> Nuevo Cliente
        </Button>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Input
            className="pl-10 h-12 shadow-sm border-slate-200"
            placeholder="Buscar por nombre, cédula o teléfono..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
            <DialogDescription>Los datos se sincronizarán directamente con Odoo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input placeholder="Juan Pérez" value={createData.name} onChange={e => setCreateData(d => ({ ...d, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cédula / RIF</Label>
              <Input placeholder="V-12345678" value={createData.cedula} onChange={e => setCreateData(d => ({ ...d, cedula: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input placeholder="0412-1234567" value={createData.phone} onChange={e => setCreateData(d => ({ ...d, phone: e.target.value }))} />
            </div>
            <Button className="w-full h-11 bg-blue-600" onClick={handleCreateClient}>Crear Cliente</Button>
          </div>
        </DialogContent>
      </Dialog>

      {cacheLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-slate-500 font-medium animate-pulse">Consultando Odoo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(c => (
            <Link key={c.id} href={`/admin/clients/${c.id}`}>
              <Card className="hover:shadow-lg transition-all border-slate-200 group relative bg-white overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-slate-400 font-mono border-slate-100">
                      ID: {c.id}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 group-hover:text-blue-600 transition-colors text-lg">{c.name}</CardTitle>
                  <CardDescription className="font-bold text-slate-900">{c.vat || "Sin Cédula"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pb-6">
                  {c.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="h-3.5 w-3.5" /> {c.phone}
                    </div>
                  )}
                  <div className="pt-2 flex justify-end">
                    <div className="text-xs font-bold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver detalles <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {filteredClients.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <User className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No se encontraron clientes</h3>
              <p className="text-slate-500">Intenta con otros términos de búsqueda.</p>
            </div>
          )}
        </div>
      )
      }
    </div >
  );
};

export default AdminClients;
