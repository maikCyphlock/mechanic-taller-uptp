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

export function Navbar() {
  const { data: session, status } = useSession();

  const menuItems = [
    { path: "/", name: "Inicio", icon: "🏠" },
    {
      path: "/admin",
      name: "Admin",
      icon: "👨‍💼",
      adminOnly: true,
      children: [
        { path: "/admin/tickets", name: "Tickets", icon: "🎫" },
        { path: "/admin/clients", name: "Clientes", icon: "👥" },
        { path: "/admin/users", name: "Usuarios", icon: "👥" },
        { path: "/admin/vehicles", name: "Vehículos", icon: "🚗" },
      ],
    },
    {
      path: "/user",
      name: "Usuario",
      icon: "👤",
      children: [
        { path: "/user/dashboard", name: "Mis trabajos", icon: "📊" },
        { path: "/user/settings", name: "Mi perfil", icon: "⚙️" },
      ],
    },
  ];

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Taller UPTM
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <div className="hidden md:flex space-x-4">
                  {menuItems.map((item) => {
                    if (item.adminOnly && session.user.role !== "admin") {
                      return null;
                    }

                    if (item.children) {
                      return (
                        <DropdownMenu key={item.path}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="text-white">
                              {item.icon} {item.name}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {item.children.map((child) => (
                              <DropdownMenuItem key={child.path} asChild>
                                <Link href={child.path}>
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
                        key={item.path}
                        href={item.path}
                        className="hover:text-blue-300 transition-colors"
                      >
                        {item.icon} {item.name}
                      </Link>
                    );
                  })}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? ""} />
                        <AvatarFallback>
                          {session.user.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/user/settings">⚙️ Configuración</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void signOut()}>
                      🚪 Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => void signIn()}>Iniciar Sesión</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}