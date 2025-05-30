<script>
    import { onMount } from 'svelte';

    export let id;
    let clientFound;
    let client = {
        id,
        name: "",
        email: "",
        phone: "",
        state: "",
        cedula: "",
        address: "",
        city: "",
    };

    onMount(async () => {
        let res = await fetch("/api/client/getbyId", {
            method: "POST",
            body: JSON.stringify({ id })
        });
        clientFound = await res.json();
        clientFound = clientFound[0];
        client = { ...client, ...clientFound };
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        await fetch('/api/client/modify', {
            body: JSON.stringify(client),
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
    };
</script>

<div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 class="mb-6 text-center text-3xl font-extrabold text-gray-900">Editar Cliente</h2>
        <form on:submit={handleSubmit} class="space-y-6">
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" id="name" name="name" bind:value={client.name} 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                 placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" name="email" bind:value={client.email} 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                 placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>

            <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="tel" id="phone" name="phone" bind:value={client.phone} 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                 placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>

            <div>
                <label for="state" class="block text-sm font-medium text-gray-700">Estado Residente</label>
                <input type="text" id="state" name="state" bind:value={client.state} 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                 placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>

            <div>
                <label for="cedula" class="block text-sm font-medium text-gray-700">Cédula</label>
                <input type="text" id="cedula" name="cedula" bind:value={client.cedula} 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                 placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>

            <div>
                <label for="city" class="block text-sm font-medium text-gray-700">Ciudad</label>
                <input type="text" id="city" name="city" bind:value={client.city} 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                 placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>

            <div>
                <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
                <input type="text" id="address" name="address" bind:value={client.address} 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                 placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
            </div>

            <button type="submit" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                             text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 
                             focus:ring-offset-2 focus:ring-sky-500">
                Enviar
            </button>
        </form>
    </div>
</div>
