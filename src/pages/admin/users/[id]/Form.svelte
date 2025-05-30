<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    export let id;
    let userFound=[];
    let success = false;
    let error = '';
    let loading = false;

    let user = {
        id,
        cedula: "",
        name: "",
        email: "",
        emailVerified: false,
        image: "",
        phone: "",
        role: "",
        roleId: "",
        banned: false,
        banReason: "",
        banExpires: null,
    };

    // Fetch user data on mount
    onMount(async () => {
        try {
            const res = await fetch("/api/user/getbyId", {
                method: "POST",
                body: JSON.stringify({ id }),
               
            });

            if (!res.ok) {
                throw new Error("Error al obtener los datos del user");
            }

            userFound = await res.json();
       
          
            user = { ...user, ...userFound };
        } catch (err) {
            console.error(err);
            error = "No se pudo cargar la información del usere.";
        }
    });

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        loading = true;
        error = '';
        success = false;

        try {
            const res = await fetch('/api/user/modify', {
                method: 'PUT',
                body: JSON.stringify(user),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al actualizar el usere');
            }

            success = true;

            // Hide success message after 3 seconds
            setTimeout(() => {
                success = false;
            }, 3000);
        } catch (err) {
            console.error(err);
            error = "Error al actualizar el user.";
        } finally {
            loading = false;
        }
    };
</script>

<div class="max-w-4xl mx-auto py-8 px-4">
    {#if success}
        <div class="mb-4 bg-green-50 border-l-4 border-green-400 p-4" transition:fade>
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-green-700">¡Usuario actualizado correctamente!</p>
                </div>
            </div>
        </div>
    {/if}

    {#if error}
        <div class="mb-4 bg-red-50 border-l-4 border-red-400 p-4" transition:fade>
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-red-700">{error}</p>
                </div>
            </div>
        </div>
    {/if}

    <form on:submit={handleSubmit} class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
                Información del Usuario
            </h3>
        </div>
        <div class="border-t border-gray-200">
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <label for="name" class="block text-sm font-medium text-gray-500">Nombre completo</label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                        type="text"
                        id="name"
                        bind:value={user.name}
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                    />
                </div>
            </div>

            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                <label for="email" class="block text-sm font-medium text-gray-500">Correo electrónico</label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                        type="email"
                        id="email"
                        bind:value={user.email}
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                    />
                </div>
            </div>

            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                <label for="phone" class="block text-sm font-medium text-gray-500">Teléfono</label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                        type="tel"
                        id="phone"
                        bind:value={user.phone}
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
            </div>

            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
              <label for="role" class="block text-sm font-medium text-gray-500">Rol</label>
              <div class="mt-1 sm:mt-0 sm:col-span-2">
                <select
                  id="role"
                  bind:value={user.role}
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="user">Mecánico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                <label for="emailVerified" class="block text-sm font-medium text-gray-500">usuario verificado</label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                        type="checkbox"
                        id="emailVerified"
                        bind:checked={user.emailVerified}
                        
                    />
                </div>
            </div>

            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                <label for="banned" class="block text-sm font-medium text-gray-500">¿Está baneado?</label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                        type="checkbox"
                        id="banned"
                        bind:checked={user.banned}
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
            </div>

            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                <label for="banReason" class="block text-sm font-medium text-gray-500">Razón del Ban</label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                        type="text"
                        id="banReason"
                        bind:value={user.banReason}
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
            </div>

            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                <label for="banExpires" class="block text-sm font-medium text-gray-500">Expiración del Ban</label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                        type="datetime-local"
                        id="banExpires"
                        bind:value={user.banExpires}
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
            </div>

            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                <label for="image" class="block text-sm font-medium text-gray-500">Imagen</label>
                <div class="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                        type="text"
                        id="image"
                        bind:value={user.image}
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
            </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <button
                type="submit"
                class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
            >
                {#if loading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                {:else}
                    Guardar cambios
                {/if}
            </button>
        </div>
    </form>
</div>