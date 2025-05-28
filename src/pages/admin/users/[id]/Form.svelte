<script lang="ts">

    import { fade } from 'svelte/transition';
   
    export let user = {
      id: '',
      name: '',
      email: '',
      phone: '',
      role: 'user',
      banned: false
    };
  
    let success = false;
    let error = '';
    let loading = false;
  
    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      loading = true;
      error = '';
  
      try {
        const response = await fetch(`api/user/modify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            banned: user.banned
          })
        });
  
        const data = await response.json();
        console.log({data})
        if (!response.ok) {
          throw new Error(data.error || 'Error al actualizar el usuario');
        }
  
        success = true;
        // Update the user data with the response
        Object.assign(user, data);
  
        // Hide success message after 3 seconds
        setTimeout(() => {
          success = false;
        }, 3000);
      } catch (err) {
  
        console.error('Error updating user:', err);
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
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>
  
        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
          <span class="block text-sm font-medium text-gray-500">Estado</span>
          <div class="mt-1 sm:mt-0 sm:col-span-2">
            <div class="flex items-center">
              <input
                id="banned"
                type="checkbox"
                bind:checked={user.banned}
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="banned" class="ml-2 block text-sm text-gray-700">
                Usuario suspendido
              </label>
            </div>
          </div>
        </div>
  
        <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <a
            href="/admin/users"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </a>
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
      </div>
    </form>
  </div>
  