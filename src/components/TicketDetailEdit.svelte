<script>
    import { createEventDispatcher } from 'svelte';

    export let ticket; // El ticket seleccionado
    export let statuses = []; // Lista de estados posibles

    const dispatch = createEventDispatcher();

    function handleSubmit() {
      dispatch('saveTicket', ticket);
    }

    function handleCancel() {
      dispatch('cancel');
    }

    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(navigator.language || 'es-ES', options);
    }
</script>

<div class="bg-white p-6 rounded-lg shadow-md">
  <button class="bg-gray-200 text-gray-800 px-4 py-2 rounded mb-4" on:click={handleCancel}>
    ⬅️ Volver al Listado
  </button>

  <h2 class="text-2xl font-bold text-center text-blue-600 mb-6">Detalles del Ticket: {ticket.id}</h2>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Información Inicial del Cliente y Vehículo</h3>
      <p><strong>Cliente:</strong> {ticket.name}</p>
      <p><strong>Teléfono:</strong> {ticket.phone}</p>
      {#if ticket.email}<p><strong>Email:</strong> {ticket.email}</p>{/if}
      <p><strong>Vehículo:</strong> {ticket.vehicleDetails.type} - {ticket.vehicleDetails.brand} {ticket.vehicleDetails.model} ({ticket.vehicleDetails.year})</p>
      <p><strong>Fecha de Reporte:</strong> {formatDate(ticket.submissionDate)}</p>
      <p><strong>Tipo de Problema Reportado:</strong> {ticket.issueType}</p>
      <div class="bg-gray-100 border border-gray-300 p-4 rounded mt-4">
        <strong>Descripción Inicial del Problema:</strong>
        <p>{ticket.issueDescription}</p>
      </div>
    </div>

    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Actualización del Mecánico</h3>
      <div class="mb-4">
        <label for="status" class="block text-gray-600 font-medium mb-2">Estado del Ticket:</label>
        <select id="status" bind:value={ticket.status} required class="w-full border border-gray-300 rounded px-3 py-2">
          {#each statuses as statusOption}
            <option value={statusOption}>{statusOption}</option>
          {/each}
        </select>
      </div>
      <div class="mb-4">
        <label for="priority" class="block text-gray-600 font-medium mb-2">Prioridad:</label>
        <select id="priority" bind:value={ticket.priority} required class="w-full border border-gray-300 rounded px-3 py-2">
          <option value="BAJA">Baja</option>
          <option value="MEDIA">Media</option>
          <option value="ALTA">Alta</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="assignedTo" class="block text-gray-600 font-medium mb-2">Asignado a:</label>
        <input id="assignedTo" type="text" bind:value={ticket.assignedTo} class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>
    </div>

    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
      💾 Guardar Cambios
    </button>
  </form>
</div>

<style>
  /* Agregar estilos globales aquí si es necesario */
</style>