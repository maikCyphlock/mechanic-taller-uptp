import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Home,
  Briefcase,
  Ticket,
  Users,
  Car,
  Settings,
  LogOut,
  PieChart,
  UserCircle,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();

  const menuItems = [
    { path: "/", name: "Inicio", icon: <Home className="h-4 w-4 mr-2" />, allowedRoles: ["admin", "manager", "mechanic", "client", "user"] },
    {
      path: "/admin",
      name: "Admin",
      icon: <Briefcase className="h-4 w-4 mr-2" />,
      allowedRoles: ["admin", "manager"],
      children: [
        { path: "/admin/tickets", name: "Tickets", icon: <Ticket className="h-4 w-4 mr-2" /> },
        { path: "/admin/clients", name: "Clientes", icon: <Users className="h-4 w-4 mr-2" /> },
        { path: "/admin/users", name: "Usuarios", icon: <Users className="h-4 w-4 mr-2" /> },
        { path: "/admin/vehicles", name: "Vehículos", icon: <Car className="h-4 w-4 mr-2" /> },
        { path: "/admin/sync", name: "Sincronización", icon: <RefreshCw className="h-4 w-4 mr-2" /> },
      ],
    },
    {
      path: "/mechanic/dashboard",
      name: "Mecánico",
      icon: <Briefcase className="h-4 w-4 mr-2" />,
      allowedRoles: ["mechanic", "manager", "admin"],
      children: [
        { path: "/user/dashboard", name: "Mis Trabajos", icon: <Ticket className="h-4 w-4 mr-2" /> },
      ]
    },
    {
      path: "/user",
      name: "Usuario",
      icon: <UserCircle className="h-4 w-4 mr-2" />,
      allowedRoles: ["client", "user", "admin", "manager", "mechanic"],
      children: [
        { path: "/user/dashboard", name: "Mis trabajos", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
        { path: "/user/settings", name: "Mi perfil", icon: <Settings className="h-4 w-4 mr-2" /> },
      ],
    },
  ];

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold flex items-center gap-2">
              <Car className="h-6 w-6 text-blue-400" />
              Taller UPTM
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <div className="hidden md:flex space-x-4">
                  {menuItems.map((item, index) => {
                    const userRole = session.user.role as string || "user";
                    if (item.allowedRoles && !item.allowedRoles.includes(userRole)) {
                      return null;
                    }

                    if (item.children) {
                      return (
                        <DropdownMenu key={index}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="text-white hover:bg-slate-800 hover:text-white flex items-center">
                              {item.icon} {item.name}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white">
                            {item.children.map((child, cIndex) => (
                              <DropdownMenuItem key={cIndex} asChild className="cursor-pointer">
                                <Link href={child.path} className="flex items-center">
                                  {child.icon} {child.name}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    }

                    return (
                      <Link
                        key={index}
                        href={item.path}
                        className="flex items-center hover:bg-slate-800 px-3 py-2 rounded-md transition-colors"
                      >
                        {item.icon} {item.name}
                      </Link>
                    );
                  })}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-slate-700">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                        <AvatarFallback className="bg-slate-700 text-white">
                          {session.user.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user.name && (
                          <p className="font-medium">{session.user.name}</p>
                        )}
                        {session.user.email && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/user/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" /> Configuración
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void signOut()} className="text-red-600 cursor-pointer focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => void signIn()} variant="secondary">Iniciar Sesión</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}