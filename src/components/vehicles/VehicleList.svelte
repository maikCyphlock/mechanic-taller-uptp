<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    const vehicles = writable([]);
    let loading = true;
    let error = null;

    onMount(async () => {
        try {
            const response = await fetch('/api/vehiculo/getAll');
            if (!response.ok) throw new Error('Error al cargar los vehículos');
            const data = await response.json();
            vehicles.set(data);
        } catch (e) {
            error = e.message;
        } finally {
            loading = false;
        }
    });
</script>

<div class="bg-white shadow-md rounded-lg overflow-hidden">
    <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Lista de Vehículos</h3>
    </div>

    {#if loading}
        <div class="p-4 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
            <p class="mt-2 text-gray-600">Cargando vehículos...</p>
        </div>
    {:else if error}
        <div class="p-4 bg-red-50 text-red-700">
            <p>{error}</p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each $vehicles as vehicle}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.plate}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.make}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.model}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.year}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.type}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a 
                                    href="/admin/vehiculo/{vehicle.id}" 
                                    class="text-sky-600 hover:text-sky-900 mr-4"
                                >
                                    Editar
                                </a>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div> 