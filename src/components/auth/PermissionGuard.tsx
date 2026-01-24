import { useSession } from "next-auth/react";
import { ReactNode } from "react";

type Rol = "admin" | "manager" | "mechanic" | "client" | "user";

interface PermissionGuardProps {
    children: ReactNode;
    allowedRoles: Rol[];
    fallback?: ReactNode;
}

export const PermissionGuard = ({
    children,
    allowedRoles,
    fallback = null
}: PermissionGuardProps) => {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return null; // O un spinner si prefieres
    }

    if (!session || !session.user) {
        return <>{fallback}</>;
    }

    const userRole = session.user.role as Rol;

    if (allowedRoles.includes(userRole)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
