import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";

import { toast } from "sonner";
import { callOdooJsonRpc } from "~/lib/odoo/frontend-api";
import { useOdooCache } from "~/hooks/useOdooCache";

const AdminTickets: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tickets, setTickets] = useState<any[]>([]);
  const { tickets: cachedTickets, isLoading: cacheLoading, syncFromOdoo } = useOdooCache();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [updateData, setUpdateData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    setTickets(cachedTickets);
  }, [cachedTickets]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    try {
      await callOdooJsonRpc('update_ticket', {
        id: selectedTicket.id,
        ...updateData
      });
      toast.success("Ticket actualizado");
      syncFromOdoo(true); // Force sync to update cache
      setSelectedTicket(null);
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const handleDeleteTicket = async (id: number) => {
    if (!confirm("¿Eliminar ticket?")) return;
    try {
      await callOdooJsonRpc('delete_ticket', { id });
      toast.success("Ticket eliminado");
      syncFromOdoo(true); // Force sync
    } catch (error: any) {
      toast.error("Error: " + error.message);
    }
  };

  const filteredTickets = tickets.filter(t =>
    !searchTerm ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toString().includes(searchTerm)
  );

  if (status === "loading") return <div className="p-8">Cargando...</div>;
  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tickets Admin (Odoo)</h1>
        <Link href="/">
          <Button variant="outline">← Inicio</Button>
        </Link>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Buscar por título o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {cacheLoading ? (
        <p>Cargando tickets de Odoo...</p>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map(ticket => (
            <Card key={ticket.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{ticket.name}</CardTitle>
                  <CardDescription>ID: {ticket.id} • Fecha: {ticket.request_date}</CardDescription>
                </div>
                <div className="space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedTicket(ticket);
                        setUpdateData({ title: ticket.name, description: ticket.description });
                      }}>Editar</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Ticket</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input value={updateData.title} onChange={e => setUpdateData(d => ({ ...d, title: e.target.value }))} placeholder="Título" />
                        <Textarea value={updateData.description} onChange={e => setUpdateData(d => ({ ...d, description: e.target.value }))} placeholder="Descripción" />
                        <Button onClick={handleUpdateTicket}>Guardar Cambios</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteTicket(ticket.id)}>Eliminar</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{ticket.description}</p>
                <div className="mt-2 flex gap-4 text-xs font-medium text-gray-500">
                  <span>Cliente: {Array.isArray(ticket.client_id) ? ticket.client_id[1] : 'N/A'}</span>
                  <span>Vehículo: {Array.isArray(ticket.vehicle_id) ? ticket.vehicle_id[1] : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
