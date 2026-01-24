/**
 * Client Autocomplete Component - Using IndexedDB Cache
 * 
 * This component reads client data from IndexedDB cache
 * and provides fast, offline-capable autocomplete functionality.
 * Works with any data provider (local or Odoo).
 */

import { useState, useEffect, useRef } from "react";
import { Input } from "~/components/ui/input";
import { useDataCache } from "~/hooks/useDataCache";

interface ClientAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelectClient: (client: any) => void;
    placeholder?: string;
    className?: string;
    id?: string;
}

export function ClientAutocomplete({
    value,
    onChange,
    onSelectClient,
    placeholder,
    className,
    id,
}: ClientAutocompleteProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Use IndexedDB cache hook
    const { searchClients, isLoading } = useDataCache();

    // Perform local search
    const filteredClients = searchClients(value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <Input
                id={id}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setShowSuggestions(true);
                }}
                onFocus={() => {
                    if (value.length > 1) setShowSuggestions(true);
                }}
                placeholder={placeholder}
                className={className}
                autoComplete="off"
            />

            {showSuggestions && value.length > 1 && (
                <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-slate-200 rounded-md shadow-lg py-1 text-sm left-0">
                    {isLoading ? (
                        <li className="px-4 py-2 text-slate-500 italic">Cargando clientes...</li>
                    ) : filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                            <li
                                key={client.id}
                                className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-slate-900 border-b last:border-0"
                                onClick={() => {
                                    onChange(client.vat || client.name || "");
                                    onSelectClient(client);
                                    setShowSuggestions(false);
                                }}
                            >
                                <div className="font-medium">{client.name}</div>
                                <div className="text-xs text-slate-500">
                                    {client.vat ? `RIF: ${client.vat}` : ''}
                                    {client.phone ? ` - ${client.phone}` : ''}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-slate-500">No se encontraron clientes</li>
                    )}
                </ul>
            )}
        </div>
    );
}
