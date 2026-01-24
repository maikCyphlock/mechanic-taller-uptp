import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { SyncStatusBadge } from "~/components/sync/SyncStatus";
import {
  Ticket,
  LayoutDashboard,
  Users,
  Car,
  Shield,
  RefreshCw,
  PlusCircle,
  Wrench,
  ArrowRight
} from "lucide-react";

const Home: NextPage = () => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
              Taller UPTM
            </h1>
            <p className="text-lg text-slate-600">
              Sistema Integral de Gestión Mecánica
            </p>
          </div>
          <Card className="shadow-xl bg-white/50 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Bienvenido</CardTitle>
              <CardDescription>
                Inicia sesión para acceder a tu panel de control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full">
                <Link href="/auth/signin">Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!session.user.emailVerified) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Verificación Requerida</CardTitle>
              <CardDescription className="text-yellow-700">
                Tu cuenta está en proceso de verificación. Un administrador revisará tu solicitud pronto.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const adminCards = [
    {
      title: "Gestión de Tickets",
      description: "Administra reparaciones y servicios",
      icon: <Ticket className="h-6 w-6 text-indigo-600" />,
      href: "/admin/tickets",
      color: "bg-indigo-50",
      btnText: "Ver Tickets"
    },
    {
      title: "Usuarios",
      description: "Control de acceso y cuentas",
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      href: "/admin/users",
      color: "bg-emerald-50",
      btnText: "Gestionar Usuarios"
    },
    {
      title: "Clientes",
      description: "Base de datos de clientes",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      href: "/admin/clients",
      color: "bg-blue-50",
      btnText: "Ver Clientes"
    },
    {
      title: "Vehículos",
      description: "Flota y registro automotor",
      icon: <Car className="h-6 w-6 text-orange-600" />,
      href: "/admin/vehicles",
      color: "bg-orange-50",
      btnText: "Ver Vehículos"
    },
    {
      title: "Roles y Permisos",
      description: "Configuración de seguridad",
      icon: <Shield className="h-6 w-6 text-purple-600" />,
      href: "/admin/roles",
      color: "bg-purple-50",
      btnText: "Configurar Roles"
    },
    {
      title: "Sincronización Odoo",
      description: "Integración con ERP",
      icon: <RefreshCw className="h-6 w-6 text-slate-800" />,
      href: "/admin/sync",
      color: "bg-slate-100",
      btnText: "Panel Sync",
      highlight: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header Section */}
          <div className="space-y-4 text-center lg:text-left lg:flex lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Hola, {session.user.name?.split(' ')[0]}
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                ¿Qué deseas hacer hoy?
              </p>
            </div>
            {session.user.role === "admin" && (
              <div className="mt-4 lg:mt-0">
                <SyncStatusBadge />
              </div>
            )}
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-all border-slate-200 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Ticket className="w-24 h-24 text-blue-600" />
              </div>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Nuevo Ticket</CardTitle>
                <CardDescription>Crea una nueva solicitud de reparación o mantenimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 group-hover:translate-x-1 transition-all">
                  <Link href="/user/ticket" className="flex items-center justify-center gap-2">
                    Crear Ticket <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all border-slate-200 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutDashboard className="w-24 h-24 text-slate-600" />
              </div>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4 text-slate-600">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Mis Tickets</CardTitle>
                <CardDescription>Consulta el estado de tus solicitudes en curso</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full hover:bg-slate-50">
                  <Link href="/user/dashboard">Ver Historial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Admin Section */}
          {session.user.role === "admin" && (
            <div className="space-y-6 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-slate-500" />
                <h2 className="text-xl font-semibold text-slate-900">Panel de Administración</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminCards.map((card, index) => (
                  <Card key={index} className={`hover:shadow-md transition-shadow border-slate-200 ${card.highlight ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`}>
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        {card.icon}
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base font-medium leading-none">
                          {card.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500 mb-4 h-10">
                        {card.description}
                      </p>
                      <Button asChild variant="secondary" size="sm" className="w-full justify-between group">
                        <Link href={card.href}>
                          {card.btnText}
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;