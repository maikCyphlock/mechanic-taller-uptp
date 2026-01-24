import { useEffect } from 'react';
import { useDataCache } from '~/hooks/useDataCache';

export function SyncInitializer() {
    const { lastSynced, isLoading, providerName } = useDataCache();

    useEffect(() => {
        if (lastSynced && !isLoading) {
            const providerLabel = providerName === 'odoo' ? 'Odoo' : 'Local DB';
            console.log(`[SyncInitializer] ${providerLabel} cache synced at ${lastSynced.toLocaleTimeString()}`);
        }
    }, [lastSynced, isLoading, providerName]);

    return null; // This component doesn't render anything
}

