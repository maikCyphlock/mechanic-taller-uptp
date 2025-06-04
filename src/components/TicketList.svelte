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
  
  <div class="p-4 bg-gray-100 rounded-lg">
    <div class="mb-4">
      <input
        type="search"
        bind:value={searchTerm}
        placeholder="Buscar por ID, Cliente, Marca, Modelo..."
        aria-label="Buscar tickets"
        class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  
    {#if tickets.length === 0 && searchTerm}
      <p class="text-center text-gray-500">No se encontraron tickets con "{searchTerm}".</p>
    {:else if tickets.length === 0}
      <p class="text-center text-gray-500">No hay tickets para mostrar.</p>
    {/if}
  
    <ul class="space-y-4">
      {#each tickets as ticket (ticket.id)}
        <li class="p-4 bg-white border border-gray-300 rounded-lg shadow">
          <div class="space-y-2">
            <p class="text-lg font-bold text-blue-600">ID: {ticket.id}</p>
            <p><strong>Cliente:</strong> {ticket.clients.name}</p>
            <p><strong>Teléfono:</strong> {ticket.clients.phone}</p>
            <p><strong>Vehículo:</strong> {ticket.vehicleDetails.brand} {ticket.vehicleDetails.model} ({ticket.vehicleDetails.type})</p>
            <p><strong>Estado:</strong> <span class="px-2 py-1 text-white rounded bg-blue-500">{ticket.status}</span></p>
            <p><strong>Prioridad:</strong> {ticket.priority || 'N/A'}</p>
            <p><strong>Asignado a:</strong> {ticket.users.userAssignedTo || 'N/A'}</p>
            <p><strong>Fecha de Creación:</strong> {formatDate(ticket.createdAt)}</p>
          </div>
          <button
            class="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            on:click={() => selectTicket(ticket)}
          >
            📋 Ver / Editar Detalles
          </button>
        </li>
      {/each}
    </ul>
  </div>