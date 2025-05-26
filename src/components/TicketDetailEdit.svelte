<script>
    import { createEventDispatcher } from 'svelte';
  
    export let ticket; // El ticket seleccionado
    export let statuses = []; // Lista de estados posibles
  
    const dispatch = createEventDispatcher();
  
    // Crear una copia local para la edición para no modificar el original directamente
    // hasta que se guarde. Esto se maneja mejor en MechanicDashboard con el {...ticket}
    // pero es una buena práctica si el componente fuera más independiente.
    // let localTicket = { ...ticket }; // Ya se hace en el padre al pasar el prop
  
    function handleSubmit() {
      // Validación básica podría ir aquí
      dispatch('saveTicket', ticket);
    }
  
    function handleCancel() {
      dispatch('cancel');
    }
    
    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      // Formato más completo para la vista de detalle
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(navigator.language || 'es-ES', options);
    }
  
  </script>
  
  <div class="ticket-detail-edit-container">
    <button class="large-button button-secondary back-button" on:click={handleCancel}>
      ⬅️ Volver al Listado
    </button>
  
    <h2>Detalles del Ticket: {ticket.id}</h2>
  
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-section initial-info">
        <h3>Información Inicial del Cliente y Vehículo</h3>
        <p><strong>Cliente:</strong> {ticket.name}</p>
        <p><strong>Teléfono:</strong> {ticket.phone}</p>
        {#if ticket.email}<p><strong>Email:</strong> {ticket.email}</p>{/if}
        <p><strong>Vehículo:</strong> {ticket.vehicleDetails.type} - {ticket.vehicleDetails.brand} {ticket.vehicleDetails.model} ({ticket.vehicleDetails.year})</p>
        <p><strong>Fecha de Reporte:</strong> {formatDate(ticket.submissionDate)}</p>
        <p><strong>Tipo de Problema Reportado:</strong> {ticket.issueType}</p>
        <div class="issue-description-box">
          <strong>Descripción Inicial del Problema:</strong>
          <p>{ticket.issueDescription}</p>
        </div>
      </div>

      <div class="form-section mechanic-fields">
        <h3>Actualización del Mecánico</h3>
        <div class="form-group">
          <label for="status">Estado del Ticket:</label>
          <select id="status" bind:value={ticket.status} required>
            {#each statuses as statusOption}
              <option value={statusOption}>{statusOption}</option>
            {/each}
          </select>
        </div>
      </div>
  
      <button type="submit" class="large-button button-primary save-button">
        💾 Guardar Cambios
      </button>
    </form>
  </div>
  
  <style>
    .ticket-detail-edit-container {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
  
    h2 {
      color: #3498db;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .back-button {
      margin-bottom: 25px !important; /* Prioridad para que se separe bien */
    }
  
    .form-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .form-section:last-of-type {
      border-bottom: none;
      margin-bottom: 0; /* Ajustar si el botón de guardar queda muy pegado */
    }
  
    .form-section h3 {
      color: #2c3e50;
      font-size: 1.3em;
      margin-bottom: 15px;
      border-bottom: 2px solid #3498db;
      padding-bottom: 5px;
    }
  
    .initial-info p {
      margin-bottom: 8px;
      font-size: 1em;
      line-height: 1.6;
    }
    .initial-info strong {
      color: #333;
    }
    .issue-description-box {
      background-color: #f9f9f9;
      border: 1px solid #e0e0e0;
      padding: 10px 15px;
      border-radius: 4px;
      margin-top: 10px;
    }
    .issue-description-box strong {
      display: block;
      margin-bottom: 5px;
    }
  
  
    .form-group {
      margin-bottom: 20px; /* Más espacio entre grupos de campos */
    }
  
    .form-group label {
      display: block;
      margin-bottom: 8px; /* Más espacio para la etiqueta */
      font-weight: bold;
      color: #333;
      font-size: 1.05em;
    }
  
    textarea {
      min-height: 100px; /* Altura mínima para textareas */
      resize: vertical;
    }
    
    .field-hint {
      font-size: 0.85em;
      color: #7f8c8d;
      display: block;
      margin-top: 5px;
    }
  
    .save-button {
      margin-top: 25px !important; /* Espacio antes del botón de guardar */
      /* Hereda .large-button y .button-primary de los estilos globales */
    }
  </style>