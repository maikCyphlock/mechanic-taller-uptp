'use client';

import { useState, useEffect } from 'react';
import { api } from '~/utils/api';
import { CheckCircle, XCircle, RefreshCw, Smartphone, Database } from 'lucide-react';

// Client-side helper to get provider mode
function useDataProviderMode(): 'local' | 'odoo' {
    const [mode, setMode] = useState<'local' | 'odoo'>('local');

    useEffect(() => {
        // Check the public env var on client side
        const envMode = process.env.NEXT_PUBLIC_DATA_PROVIDER;
        if (envMode === 'odoo') {
            setMode('odoo');
        }
    }, []);

    return mode;
}

/**
 * Badge indicador de estado de conexión con el proveedor de datos
 */
export function SyncStatusBadge() {
    const mode = useDataProviderMode();
    const { data: healthCheck, isLoading } = api.sync.odooHealthCheck.useQuery(undefined, {
        refetchInterval: 30000,
        enabled: mode === 'odoo', // Only query when in Odoo mode
    });

    // Local mode - always show as connected
    if (mode === 'local') {
        return (
            <div className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-1.5 text-sm border border-blue-200">
                <Database className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-blue-800 font-medium">Modo Local</span>
            </div>
        );
    }

    // Odoo mode - show connection status
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
                <span className="text-gray-600 font-medium">Odoo...</span>
            </div>
        );
    }

    if (!healthCheck?.available) {
        return (
            <div className="flex items-center gap-2 rounded-md bg-red-100 px-3 py-1.5 text-sm border border-red-200" title={healthCheck?.message}>
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-red-800 font-medium">Odoo Offline</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 rounded-md bg-green-100 px-3 py-1.5 text-sm border border-green-200">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-green-800 font-medium">Odoo Online</span>
        </div>
    );
}

/**
 * Panel de información del proveedor de datos para Admin
 */
export function SyncPanel() {
    const mode = useDataProviderMode();

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    {mode === 'odoo' ? (
                        <>
                            <Smartphone className="h-5 w-5 text-blue-500" />
                            Conectado a Odoo Backend
                        </>
                    ) : (
                        <>
                            <Database className="h-5 w-5 text-blue-500" />
                            Base de Datos Local
                        </>
                    )}
                </h3>
                <SyncStatusBadge />
            </div>
            <p className="mt-4 text-sm text-gray-600">
                {mode === 'odoo' ? (
                    <>
                        La aplicación está configurada en modo ODOO. Todos los datos (Clientes, Vehículos, Tickets)
                        se leen y escriben directamente en Odoo ERP en tiempo real.
                    </>
                ) : (
                    <>
                        La aplicación está configurada en modo LOCAL. Los datos se almacenan en la base de datos
                        local y no requieren conexión con Odoo.
                    </>
                )}
            </p>
        </div>
    );
}

/**
 * Indicador simplificado para mostrar el ID del registro
 * En modo Odoo muestra el Odoo ID, en modo local muestra el ID local
 */
export function OdooIndicator({ odooId }: { odooId?: number | null, status?: string }) {
    const mode = useDataProviderMode();

    if (!odooId) return null;

    // In local mode, don't show Odoo-specific indicator
    if (mode === 'local') {
        return null;
    }

    return (
        <div className="flex items-center gap-1 text-xs font-medium text-blue-600" title={`Odoo ID: ${odooId}`}>
            <CheckCircle className="h-3 w-3" />
            <span>Odoo #{odooId}</span>
        </div>
    );
}

/**
 * Indicador genérico de ID de registro (funciona en ambos modos)
 */
export function RecordIdIndicator({ id, label = 'ID' }: { id?: string | number | null, label?: string }) {
    if (!id) return null;

    return (
        <div className="flex items-center gap-1 text-xs font-medium text-slate-500" title={`${label}: ${id}`}>
            <span className="font-mono">#{String(id).slice(-8)}</span>
        </div>
    );
}

