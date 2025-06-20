<script>
   
    export let paymentMethods = []
    export let ticket; // El ticket seleccionado
    export let statuses = []; // Lista de estados posibles

    let isLoading = false;
    let showSuccess = false;
    let showError = false;
    let errorMessage = '';
    let touched = {};
    let firstErrorField = null;

    function focusFirstError() {
      if (firstErrorField) {
        const el = document.getElementById(firstErrorField);
        if (el) el.focus();
      }
    }

    function validate() {
      let valid = true;
      firstErrorField = null;
      touched = {};
      // Required fields
      const requiredFields = [
        { key: 'description', label: 'Descripción detallada' },
        { key: 'time_spent', label: 'Tiempo Dedicado' },
        { key: 'status', label: 'Estado del Ticket' },
        { key: 'priority', label: 'Prioridad' },
        { key: 'userAssignedTo', label: 'Asignado a', path: 'users.userAssignedTo' },
        { key: 'payment_method', label: 'Método de Pago' },
        { key: 'payment_currency', label: 'Moneda de Pago' },
        { key: 'total_amount', label: 'Monto Total' }
      ];
      for (const field of requiredFields) {
        let value;
        if (field.path === 'users.userAssignedTo') {
          value = ticket.users?.userAssignedTo;
        } else {
          value = ticket[field.key];
        }
        if (!value) {
          touched[field.key] = true;
          if (!firstErrorField) firstErrorField = field.key;
          valid = false;
        }
      }
      return valid;
    }

    function handleCancel() {
      window.history.back();
    }

    async function handleSubmit() {
      showSuccess = false;
      showError = false;
      errorMessage = '';
      if (!ticket) {
        showError = true;
        errorMessage = 'No hay datos del ticket.';
        return;
      }
      if (!validate()) {
        showError = true;
        errorMessage = 'Por favor, completa todos los campos requeridos.';
        focusFirstError();
        return;
      }
      isLoading = true;
      try {
        const data = await fetch(`/api/ticket/${ticket.id}/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ticket)
        });
        const response = await data.json();
        if (data.ok) {
          showSuccess = true;
          setTimeout(() => showSuccess = false, 2000);
        } else {
          showError = true;
          errorMessage = response?.message || 'Error al actualizar el ticket.';
        }
      } catch (e) {
        showError = true;
        errorMessage = 'Error de red o del servidor.';
      } finally {
        isLoading = false;
      }
    }

    function handleInput(e, key) {
      touched[key] = false;
    }

    function handleNumberFocus(e) {
      e.target.select();
    }

    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(navigator.language || 'es-ES', options);
    }
</script>

<div class="bg-white p-2 sm:p-6 rounded-lg shadow-md max-w-lg mx-auto min-h-screen flex flex-col relative">
  <button class="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl mb-4 text-lg w-full shadow-sm active:bg-gray-300" on:click={handleCancel} aria-label="Volver al Listado">
    ⬅️ Volver al Listado
  </button>

  <h2 class="text-2xl sm:text-3xl font-extrabold text-center text-blue-700 mb-4 tracking-tight">Detalles del Ticket: {ticket.id}</h2>
  <div class="mb-4 sm:mb-6 border-b border-gray-200 pb-4">
      <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Cliente y Vehículo</h3>
      <p class="text-base"><strong>Cliente:</strong> {ticket.clients.name}</p>
      <p class="text-base"><strong>Teléfono:</strong> {ticket.clients.phone}</p>
      {#if ticket.clients.email}<p class="text-base"><strong>Email:</strong> {ticket.clients.email}</p>{/if}
      <p class="text-base"><strong>Vehículo:</strong> {ticket.vehicleDetails.type} - {ticket.vehicleDetails.brand} {ticket.vehicleDetails.model} ({ticket.vehicleDetails.year})</p>
      <p class="text-base"><strong>Fecha de Reporte:</strong> {formatDate(ticket.createdAt)}</p>
      <p class="text-base"><strong>Tipo de Problema:</strong> {ticket.issueType}</p>
      <div class="bg-gray-100 border border-gray-300 p-3 rounded mt-3 text-sm">
        <strong>Descripción Inicial:</strong>
        <p>{ticket.short_description}</p>
      </div>
    </div>

  {#if showSuccess}
    <div class="flex items-center justify-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-3 text-center gap-2" role="alert">
      <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      <span>Cambios guardados correctamente.</span>
    </div>
  {/if}
  {#if showError}
    <div class="flex items-center justify-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-3 text-center gap-2" role="alert">
      <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      <span>{errorMessage}</span>
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} aria-label="Formulario de edición de ticket" class="flex-1 flex flex-col gap-2 pb-32">
    <div class="mb-2">
      <label for="description" class="block text-gray-700 font-medium mb-1 text-base">Descripción detallada:<span class="text-red-500">*</span></label>
      <textarea id="description" bind:value={ticket.description} class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm {touched.description ? 'border-red-500' : ''}" placeholder="Describe el trabajo realizado..." aria-required="true" aria-invalid={touched.description} on:input={(e) => handleInput(e, 'description')} rows="3"></textarea>
      {#if touched.description}
        <span class="text-red-500 text-sm">Este campo es requerido.</span>
      {/if}
    </div>
    <div class="mb-2">
      <label for="time_spent" class="block text-gray-700 font-medium mb-1 text-base">Tiempo Dedicado (minutos):<span class="text-red-500">*</span></label>
      <input type="number" id="time_spent" bind:value={ticket.time_spent} class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm {touched.time_spent ? 'border-red-500' : ''}" placeholder="Ej: 60" aria-required="true" aria-invalid={touched.time_spent} on:input={(e) => handleInput(e, 'time_spent')} on:focus={handleNumberFocus} min="0">
      {#if touched.time_spent}
        <span class="text-red-500 text-sm">Este campo es requerido.</span>
      {/if}
    </div>
    <div class="mb-2">
      <label for="work_notes" class="block text-gray-700 font-medium mb-1 text-base">Notas de Trabajo:</label>
      <textarea id="work_notes" bind:value={ticket.work_notes} class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm" placeholder="Notas adicionales..." rows="2"></textarea>
    </div>
    <div class="mb-2">
      <label for="tool_used" class="block text-gray-700 font-medium mb-1 text-base">Herramientas Utilizadas:</label>
      <input type="text" id="tool_used" bind:value={ticket.tool_used} class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm" placeholder="Ej: Llave inglesa, multímetro...">
    </div>
    <div class="mb-2">
      <label for="status" class="block text-gray-700 font-medium mb-1 text-base">Estado del Ticket:<span class="text-red-500">*</span></label>
      <select id="status" bind:value={ticket.status} required class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm {touched.status ? 'border-red-500' : ''}" aria-required="true" aria-invalid={touched.status} on:input={(e) => handleInput(e, 'status')}>
        {#each statuses as statusOption}
          {#if statusOption === 'EN_PROCESO'}
            <option value={statusOption}>APROBAR ✅</option>
          {:else}
            <option value={statusOption}>{statusOption}</option>
          {/if}
        {/each}
      </select>
      {#if touched.status}
        <span class="text-red-500 text-sm">Este campo es requerido.</span>
      {/if}
    </div>
    <div class="mb-2">
      <label for="priority" class="block text-gray-700 font-medium mb-1 text-base">Prioridad:<span class="text-red-500">*</span></label>
      <select id="priority" bind:value={ticket.priority} required class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm {touched.priority ? 'border-red-500' : ''}" aria-required="true" aria-invalid={touched.priority} on:input={(e) => handleInput(e, 'priority')}>
        <option value="BAJA">Baja</option>
        <option value="MEDIA">Media</option>
        <option value="ALTA">Alta</option>
      </select>
      {#if touched.priority}
        <span class="text-red-500 text-sm">Este campo es requerido.</span>
      {/if}
    </div>
    <div class="mb-2">
      <label for="assignedTo" class="block text-gray-700 font-medium mb-1 text-base">Asignado a:<span class="text-red-500">*</span></label>
      <input id="assignedTo" type="text" bind:value={ticket.users.userAssignedTo} class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm {touched.userAssignedTo ? 'border-red-500' : ''}" placeholder="Nombre del mecánico" aria-required="true" aria-invalid={touched.userAssignedTo} on:input={(e) => handleInput(e, 'userAssignedTo')} />
      {#if touched.userAssignedTo}
        <span class="text-red-500 text-sm">Este campo es requerido.</span>
      {/if}
    </div>
    <div class="mb-2">
      <label for="payment_method" class="block text-gray-700 font-medium mb-1 text-base">Método de Pago:<span class="text-red-500">*</span></label>
      <select id="payment_method" bind:value={ticket.payment_method} required class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm {touched.payment_method ? 'border-red-500' : ''}" aria-required="true" aria-invalid={touched.payment_method} on:input={(e) => handleInput(e, 'payment_method')}>
        {#each paymentMethods as method}
          <option value={method.value}>{method.label}</option>
        {/each}
      </select>
      {#if touched.payment_method}
        <span class="text-red-500 text-sm">Este campo es requerido.</span>
      {/if}
    </div>
    {#if ticket.payment_method === 'TRANSFERENCIA_BANCARIA'}
      <div class="mb-2">
        <label for="payment_reference" class="block text-gray-700 font-medium mb-1 text-base">Detalles de Transferencia:</label>
        <textarea id="payment_reference" bind:value={ticket.payment_reference} class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm" placeholder="Referencia bancaria..." rows="2"></textarea>
      </div>
    {/if}
    {#if ticket.payment_method === 'EFECTIVO' || ticket.payment_method === 'PAGO_MOVIL'}
      <div class="mb-2">
        <label for="payment_reference" class="block text-gray-700 font-medium mb-1 text-base">Detalles de Pago:</label>
        <textarea id="payment_reference" bind:value={ticket.payment_reference} class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm" placeholder="Referencia o detalles..." rows="2"></textarea>
      </div>
    {/if}
    <div class="mb-2">
      <label for="estimatedCost" class="block text-gray-700 font-medium mb-1 text-base">Costo Estimado al principio del trabajo:</label>
      <input type="number" id="estimatedCost" bind:value={ticket.estimatedCost} class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm" placeholder="Ej: 100" on:focus={handleNumberFocus} min="0">
    </div>
    <div class="mb-2">
      <label for="payment_currency" class="block text-gray-700 font-medium mb-1 text-base">Moneda de Pago:<span class="text-red-500">*</span></label>
      <select id="payment_currency" bind:value={ticket.payment_currency} required class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm {touched.payment_currency ? 'border-red-500' : ''}" aria-required="true" aria-invalid={touched.payment_currency} on:input={(e) => handleInput(e, 'payment_currency')}>
        <option value="VES">Bolívares (VES)</option>
        <option value="USD">Dólares (USD)</option>
        <option value="EUR">Euros (EUR)</option>
      </select>
      {#if touched.payment_currency}
        <span class="text-red-500 text-sm">Este campo es requerido.</span>
      {/if}
    </div>
    <div class="mb-2">
      <label for="total_amount" class="block text-gray-700 font-medium mb-1 text-base">Monto Total <span class="text-red-500">*</span></label>
      <input type="number" id="total_amount" bind:value={ticket.total_amount} class="w-full border border-gray-300 rounded-xl px-3 py-3 text-lg shadow-sm {touched.total_amount ? 'border-red-500' : ''}" placeholder="Ej: 150" aria-required="true" aria-invalid={touched.total_amount} on:input={(e) => handleInput(e, 'total_amount')} on:focus={handleNumberFocus} min="0">
      {#if touched.total_amount}
        <span class="text-red-500 text-sm">Este campo es requerido.</span>
      {/if}
    </div>
  </form>
  <div class="fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-gray-200 shadow-lg p-2 flex justify-center">
    <button type="button" on:click={handleSubmit} class="w-full max-w-lg bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 active:bg-blue-800 transition-all duration-150" disabled={isLoading} aria-busy={isLoading} aria-label="Guardar Cambios">
      {#if isLoading}
        <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        Guardando...
      {:else}
        💾 Guardar Cambios
      {/if}
    </button>
  </div>
</div>
<style>
  .border-red-500 { border-color: #f87171 !important; }
  textarea, input, select { outline: none; }
</style>