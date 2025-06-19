<script>
    import { createEventDispatcher } from 'svelte';
  
    export let tickets = [];
    export let userAssignedTo = null; // El usuario asignado, si aplica
    export let searchTerm = '';
  
    const dispatch = createEventDispatcher();
  
    function selectTicket(ticket) {
      dispatch('selectTicket', ticket);
    }
  
    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(navigator.language || 'es-ES', options);
    }
  </script>
  
  <div class="p-2 sm:p-4 bg-gray-100 rounded-lg max-w-lg mx-auto min-h-screen">
    <div class="mb-4">
      <input
        type="search"
        bind:value={searchTerm}
        placeholder="Buscar por ID, Cliente, Marca, Modelo..."
        aria-label="Buscar tickets"
        class="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      />
    </div>
  
    {#if tickets.length === 0 && searchTerm}
      <div class="flex flex-col items-center justify-center py-8">
        <svg class="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h3m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
        <p class="text-center text-gray-500 text-lg">No se encontraron tickets con "{searchTerm}".</p>
      </div>
    {:else if tickets.length === 0}
      <div class="flex flex-col items-center justify-center py-8">
        <svg class="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h3m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
        <p class="text-center text-gray-400 text-lg">No hay tickets para mostrar.</p>
      </div>
    {/if}
  
    <ul class="space-y-4">
      {#each tickets as ticket (ticket.id)}
        <li class="p-4 bg-white border border-gray-200 rounded-2xl shadow-lg flex flex-col gap-2">
          <div class="space-y-1">
            <p class="text-xl font-extrabold text-blue-700 tracking-tight">ID: {ticket.id}</p>
            <p class="text-base"><span class="font-semibold">Cliente:</span> {ticket.clients.name}</p>
            <p class="text-base"><span class="font-semibold">Teléfono:</span> {ticket.clients.phone}</p>
            <p class="text-base"><span class="font-semibold">Vehículo:</span> {ticket.vehicleDetails.brand} {ticket.vehicleDetails.model} <span class="text-gray-500">({ticket.vehicleDetails.type})</span></p>
            <div class="flex flex-wrap gap-2 items-center mt-1">
              <span class="px-2 py-1 text-xs font-bold rounded-full bg-blue-600 text-white">{ticket.status}</span>
              <span class="px-2 py-1 text-xs font-bold rounded-full {ticket.priority === 'ALTA' ? 'bg-red-600' : ticket.priority === 'MEDIA' ? 'bg-yellow-500' : 'bg-green-600'} text-white">{ticket.priority || 'N/A'}</span>
              <span class="px-2 py-1 text-xs font-bold rounded-full bg-gray-500 text-white">{ticket.users.userAssignedTo || 'Sin asignar'}</span>
            </div>
            <p class="text-sm text-gray-500"><span class="font-semibold">Fecha de Creación:</span> {formatDate(ticket.createdAt)}</p>
          </div>
          <button
            class="mt-3 w-full bg-blue-700 text-white text-lg font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 active:bg-blue-800 transition-all duration-150"
            on:click={() => selectTicket(ticket)}
          >
            <svg class="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Ver / Editar Detalles
          </button>
        </li>
      {/each}
    </ul>
  </div>