import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "~/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    return (
        <nav className={cn("flex items-center space-x-1 text-sm text-slate-500 mb-6", className)} aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Inicio</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-slate-300 mx-1 flex-shrink-0" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-slate-900 transition-colors font-medium truncate max-w-[150px] sm:max-w-none shadow-sm px-2 py-0.5 rounded-md hover:bg-slate-100/50"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-none px-2 py-0.5">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
