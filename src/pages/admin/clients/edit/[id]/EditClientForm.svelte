<script>
    import { onMount } from 'svelte';
    import { clientStore, fetchClientById, updateClient } from '@/lib/stores/clientStore';
    import FormInput from '@/components/FormInput.svelte';

    export let id;
    let errors = {};
    let isSubmitting = false;

    onMount(async () => {
        try {
            await fetchClientById(id);
        } catch (error) {
            console.error('Error loading client:', error);
            // Aquí podrías mostrar un mensaje de error al usuario
        }
    });

    const validateForm = () => {
        errors = {};
        const client = $clientStore;

        if (!client.name) errors.name = 'El nombre es requerido';
        if (!client.email) errors.email = 'El email es requerido';
        if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
            errors.email = 'Email inválido';
        }
        if (!client.phone) errors.phone = 'El teléfono es requerido';
        if (!client.cedula) errors.cedula = 'La cédula es requerida';

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) return;
        
        isSubmitting = true;
        try {
            await updateClient($clientStore);
            window.location.href = '/admin/clients'; // Redirigir a la lista de clientes después de actualizar
        } catch (error) {
            console.error('Error updating client:', error);
            // Aquí podrías mostrar un mensaje de error al usuario
        } finally {
            isSubmitting = false;
        }
    };
</script>

<div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 class="mb-6 text-center text-3xl font-extrabold text-gray-900">Editar Cliente</h2>
        <form on:submit={handleSubmit} class="space-y-6">
            <FormInput
                label="Nombre"
                id="name"
                bind:value={$clientStore.name}
                error={errors.name}
            />

            <FormInput
                label="Email"
                type="email"
                id="email"
                bind:value={$clientStore.email}
                error={errors.email}
            />

            <FormInput
                label="Teléfono"
                type="tel"
                id="phone"
                bind:value={$clientStore.phone}
                error={errors.phone}
            />

            <FormInput
                label="Estado Residente"
                id="state"
                bind:value={$clientStore.state}
                error={errors.state}
            />

            <FormInput
                label="Cédula"
                id="cedula"
                bind:value={$clientStore.cedula}
                error={errors.cedula}
            />

            <FormInput
                label="Ciudad"
                id="city"
                bind:value={$clientStore.city}
                error={errors.city}
            />

            <FormInput
                label="Dirección"
                id="address"
                bind:value={$clientStore.address}
                error={errors.address}
            />

            <button 
                type="submit" 
                disabled={isSubmitting}
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                       text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
        </form>
    </div>
</div>
