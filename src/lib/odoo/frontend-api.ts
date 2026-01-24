export async function callOdooJsonRpc(action: string, data?: any): Promise<any> {
    const res = await fetch('/api/odoo/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
    });

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result.error || 'Failed to call Odoo JSON-RPC');
    }

    return result.id; // result.id contains the Odoo result in our proxy
}
