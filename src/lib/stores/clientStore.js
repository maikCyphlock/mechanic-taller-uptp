import { writable } from 'svelte/store';

export const clientStore = writable({
    id: '',
    name: '',
    email: '',
    phone: '',
    state: '',
    cedula: '',
    address: '',
    city: '',
});

export const fetchClientById = async (id) => {
    try {
        const res = await fetch("/api/client/getbyId", {
            method: "POST",
            body: JSON.stringify({ id })
        });
        const data = await res.json();
        clientStore.set(data[0]);
        return data[0];
    } catch (error) {
        console.error('Error fetching client:', error);
        throw error;
    }
};

export const updateClient = async (clientData) => {
    try {
        const res = await fetch('/api/client/modify', {
            body: JSON.stringify(clientData),
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to update client');
        return await res.json();
    } catch (error) {
        console.error('Error updating client:', error);
        throw error;
    }
}; 