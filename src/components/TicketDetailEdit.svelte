<script>
   
    export let paymentMethods = []
    export let ticket; // El ticket seleccionado
    export let statuses = []; // Lista de estados posibles


    async function handleSubmit() {
      if (!ticket) {
        console.error('No ticket data available');
        return;
      }

      // Validar campos requeridos
      // if (!ticket.description || !ticket.time_spent || !ticket.status || !ticket.priority || !ticket.users.userAssignedTo) {
      //   alert('Por favor, completa todos los campos requeridos.');
      //   return;
      // }

      // Enviar datos al servidor
 
     const data = await fetch(`/api/ticket/${ticket.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticket)
      })
      const response = await data.json();

      console.log('Ticket updated:', response);
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
  <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Información Inicial del Cliente y Vehículo</h3>
      <p><strong>Cliente:</strong> {ticket.clients.name}</p>
      <p><strong>Teléfono:</strong> {ticket.clients.phone}</p>
      {#if ticket.clients.email}<p><strong>Email:</strong> {ticket.clients.email}</p>{/if}
      <p><strong>Vehículo:</strong> {ticket.vehicleDetails.type} - {ticket.vehicleDetails.brand} {ticket.vehicleDetails.model} ({ticket.vehicleDetails.year})</p>
      <p><strong>Fecha de Reporte:</strong> {formatDate(ticket.createdAt)}</p>

      <p><strong>Tipo de Problema Reportado:</strong> {ticket.issueType}</p>
      <div class="bg-gray-100 border border-gray-300 p-4 rounded mt-4">
        <strong>Descripción Inicial del Problema:</strong>
        <p>{ticket.short_description}</p>
      </div>
    </div>
  <form on:submit|preventDefault={handleSubmit}>
  

    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Actualización del Mecánico</h3>
      

       <div class="mb-4">
        <label for="description" class="block text-gray-600 font-medium mb-2">Descripción detallada:</label>
        <textarea id="description" bind:value={ticket.description} class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
      </div>
      
      
     
      <div class="mb-4">
        <label for="time_spent" class="block text-gray-600 font-medium mb-2">Tiempo Dedicado (minutos):</label>
        <input type="number" id="time_spent" bind:value={ticket.time_spent} class="w-full border border-gray-300 rounded px-3 py-2">
      </div>
      
      <div class="mb-4">
        <label for="work_notes" class="block text-gray-600 font-medium mb-2">Notas de Trabajo:</label>
        <textarea id="work_notes" bind:value={ticket.work_notes} class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
      </div>
      
      <div class="mb-4">
        <label for="tool_used" class="block text-gray-600 font-medium mb-2">Herramientas Utilizadas:</label>
        <input type="text" id="tool_used" bind:value={ticket.tool_used} class="w-full border border-gray-300 rounded px-3 py-2">
      </div>

      <div class="mb-4">
        <label for="status" class="block text-gray-600 font-medium mb-2">Estado del Ticket:</label>
        <select id="status" bind:value={ticket.status} required class="w-full border border-gray-300 rounded px-3 py-2">
          {#each statuses as statusOption}
            {#if statusOption === 'EN_PROCESO'}
              <option value={statusOption}>APROBAR ✅</option>
         
            {:else}
              <option value={statusOption}>{statusOption}</option>
            {/if}
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
        <input id="assignedTo" type="text" bind:value={ticket.users.userAssignedTo} class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>
      <div>
        <label for="payment_method" class="block text-gray-600 font-medium mb-2">Método de Pago:</label>
         <select id="status" bind:value={ticket.payment_method} required class="w-full border border-gray-300 rounded px-3 py-2">
           {#each paymentMethods as method}
      
              <option value={method.value}>{method.label}</option>
            
          {/each}
          </select>
      </div>
      {#if ticket.payment_method === 'TRANSFERENCIA_BANCARIA'}
        <div class="mt-4">
          <label for="payment_reference" class="block text-gray-600 font-medium mb-2">Detalles de Transferencia:</label>
          <textarea id="payment_reference" bind:value={ticket.payment_reference} class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
        </div>
      {/if}
      {#if ticket.payment_method === 'EFECTIVO' || ticket.payment_method === 'PAGO_MOVIL'}
        <div class="mt-4">
          <label for="payment_reference" class="block text-gray-600 font-medium mb-2">Detalles de Pago:</label>
          <textarea id="payment_reference" bind:value={ticket.payment_reference} class="w-full border border-gray-300 rounded px-3 py-2"></textarea>
        </div>
      {/if}
      
    </div>
     <div class="mb-4">
        <label for="estimatedCost" class="block text-gray-600 font-medium mb-2">Costo Estimado al princio del trabajo:</label>
        <input type="number" id="estimatedCost" bind:value={ticket.estimatedCost} class="w-full border border-gray-300 rounded px-3 py-2">
      </div>
       <div class="mb-4">
        <label for="payment_currency" class="block text-gray-600 font-medium mb-2">Moneda de Pago:</label>
        <select id="payment_currency" bind:value={ticket.payment_currency} required class="w-full border border-gray-300 rounded px-3 py-2">
          <option value="VES">Bolívares (VES)</option>
          <option value="USD">Dólares (USD)</option>
          <option value="EUR">Euros (EUR)</option>
        </select> 
      </div>
      
      <div class="mb-4">
        <label for="total_amount" class="block text-gray-600 font-medium mb-2">Monto Total </label>
        <input type="number" id="total_amount" bind:value={ticket.total_amount} class="w-full border border-gray-300 rounded px-3 py-2">
      </div>

    <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
      💾 Guardar Cambios
    </button>
  </form>
</div>
<style>
  /* Agregar estilos globales aquí si es necesario */
</style>