<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    export let vehicleId;

    // Store para manejar el estado del formulario
    const vehicleStore = writable({
        id: '',
        plate: '',
        make: '',
        model: '',
        year: '',
        color: '',
        type: 'otro',
        ownerId: ''
    });

    // Estado local
    let errors = {};
    let isSubmitting = false;
    let showExtra = false;
    let successMessage = '';
    let errorMessage = '';
    let loading = true;

    // Tipos de vehículos disponibles
    const vehicleTypes = [
        { value: 'otro', label: 'Otro' },
        { value: 'sedan', label: 'Sedán' },
        { value: 'suv', label: 'SUV' },
        { value: 'pickup', label: 'Pickup' }
    ];

    // Cargar datos del vehículo
    onMount(async () => {
        try {
            const response = await fetch(`/api/vehiculo/${vehicleId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar el vehículo');
            
            const data = await response.json();
            vehicleStore.set(data);
        } catch (e) {
            errorMessage = e.message;
        } finally {
            loading = false;
        }
    });

    // Validación del formulario
    const validateForm = () => {
        errors = {};
        const vehicle = $vehicleStore;

        if (!vehicle.plate) errors.plate = 'La placa es requerida';
        if (!vehicle.make) errors.make = 'La marca es requerida';
        if (!vehicle.model) errors.model = 'El modelo es requerido';
        if (vehicle.year && (vehicle.year < 1900 || vehicle.year > new Date().getFullYear())) {
            errors.year = 'Año inválido';
        }

        return Object.keys(errors).length === 0;
    };

    // Manejo del envío del formulario
    const handleSubmit = async (event) => {
        event.preventDefault();
        successMessage = '';
        errorMessage = '';
        
        if (!validateForm()) return;
        
        isSubmitting = true;
        try {
            const response = await fetch(`/api/vehiculo/${$vehicleStore.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify($vehicleStore)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al actualizar el vehículo');
            }

            successMessage = 'Vehículo actualizado exitosamente';
            // Opcional: redirigir después de un tiempo
            setTimeout(() => {
                window.location.href = '/admin/vehiculo';
            }, 2000);
        } catch (error) {
            errorMessage = error.message;
        } finally {
            isSubmitting = false;
        }
    };
</script>

<div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Modificar Vehículo</h2>

    {#if loading}
        <div class="p-4 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
            <p class="mt-2 text-gray-600">Cargando vehículo...</p>
        </div>
    {:else if errorMessage}
        <div class="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
        </div>
    {:else}
        {#if successMessage}
            <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                {successMessage}
            </div>
        {/if}

        <form on:submit={handleSubmit} class="space-y-4">
            <!-- Campos principales -->
            <div class="space-y-4">
                <div>
                    <label for="plate" class="block text-sm font-medium text-gray-700">Placa</label>
                    <input
                        type="text"
                        id="plate"
                        bind:value={$vehicleStore.plate}
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                        placeholder="Placa del vehículo"
                    />
                    {#if errors.plate}
                        <p class="mt-1 text-sm text-red-600">{errors.plate}</p>
                    {/if}
                </div>

                <div>
                    <label for="make" class="block text-sm font-medium text-gray-700">Marca</label>
                    <input
                        type="text"
                        id="make"
                        bind:value={$vehicleStore.make}
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                        placeholder="Marca del vehículo"
                    />
                    {#if errors.make}
                        <p class="mt-1 text-sm text-red-600">{errors.make}</p>
                    {/if}
                </div>

                <div>
                    <label for="model" class="block text-sm font-medium text-gray-700">Modelo</label>
                    <input
                        type="text"
                        id="model"
                        bind:value={$vehicleStore.model}
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                        placeholder="Modelo del vehículo"
                    />
                    {#if errors.model}
                        <p class="mt-1 text-sm text-red-600">{errors.model}</p>
                    {/if}
                </div>
            </div>

            <!-- Botón para campos adicionales -->
            <button
                type="button"
                on:click={() => showExtra = !showExtra}
                class="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
                {showExtra ? 'Ocultar campos adicionales' : 'Mostrar campos adicionales'}
            </button>

            <!-- Campos adicionales -->
            {#if showExtra}
                <div class="space-y-4">
                    <div>
                        <label for="year" class="block text-sm font-medium text-gray-700">Año</label>
                        <input
                            type="number"
                            id="year"
                            bind:value={$vehicleStore.year}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                            placeholder="Año de fabricación"
                        />
                        {#if errors.year}
                            <p class="mt-1 text-sm text-red-600">{errors.year}</p>
                        {/if}
                    </div>

                    <div>
                        <label for="color" class="block text-sm font-medium text-gray-700">Color</label>
                        <input
                            type="text"
                            id="color"
                            bind:value={$vehicleStore.color}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                            placeholder="Color del vehículo"
                        />
                    </div>

                    <div>
                        <label for="type" class="block text-sm font-medium text-gray-700">Tipo</label>
                        <select
                            id="type"
                            bind:value={$vehicleStore.type}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                        >
                            {#each vehicleTypes as type}
                                <option value={type.value}>{type.label}</option>
                            {/each}
                        </select>
                    </div>

                    <div>
                        <label for="ownerId" class="block text-sm font-medium text-gray-700">ID del Propietario</label>
                        <input
                            type="text"
                            id="ownerId"
                            bind:value={$vehicleStore.ownerId}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                            placeholder="ID del propietario"
                        />
                    </div>
                </div>
            {/if}

            <button
                type="submit"
                disabled={isSubmitting}
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </form>
    {/if}
</div> 