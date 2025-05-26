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
  
  <div class="ticket-list-container">
    <div class="search-bar">
      <input
        type="search"
        bind:value={searchTerm}
        placeholder="Buscar por ID, Cliente, Marca, Modelo..."
        aria-label="Buscar tickets"
      />
    </div>

  
  
    {#if tickets.length === 0 && searchTerm}
      <p class="no-results">No se encontraron tickets con "{searchTerm}".</p>
    {:else if tickets.length === 0}
      <p class="no-results">No hay tickets para mostrar.</p>
    {/if}
  
    <ul class="ticket-list">
      {#each tickets as ticket (ticket.id)}
        <li class="ticket-item">
          <div class="ticket-summary">
            <strong class="ticket-id">{ticket.id}</strong>
            <span class="ticket-customer">Cliente: {ticket.name}</span>
            <span class="ticket-vehicle">Vehículo: {ticket.vehicleDetails.brand} {ticket.vehicleDetails.model} ({ticket.vehicleDetails.type})</span>
            <span class="ticket-status">Estado: <span class="status-badge status-{ticket.status.toLowerCase().replace(/\s+/g, '-')}" >{ticket.status}</span></span>
            <span class="ticket-date">Recibido: {formatDate(ticket.submissionDate)}</span>
            <span class="ticket-priority">Prioridad: {ticket.priority || 'N/A'}</span>
            <span class="ticket-assigned">Asignado a: {ticket.userAssignedTo || 'N/A'}</span>
          </div>
          <button
            class="large-button button-primary view-details-button"
            on:click={() => selectTicket(ticket)}
          >
            📋 Ver / Editar Detalles
          </button>
        </li>
      {/each}
    </ul>
  </div>
  
  <style>
    .ticket-list-container {
      padding: 0; /* El dashboard ya tiene padding */
    }
    .search-bar {
      margin-bottom: 20px;
    }
    .search-bar input[type="search"] {
      padding: 15px; /* Botones de búsqueda más grandes */
      font-size: 1.05em;
    }
  
    .ticket-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
  
    .ticket-item {
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px; /* Buen padding para el item */
      margin-bottom: 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
  
    .ticket-summary {
      display: flex;
      flex-direction: column;
      gap: 8px; /* Espacio entre elementos de resumen */
      margin-bottom: 15px;
    }
    .ticket-id {
      font-size: 1.2em;
      color: #3498db;
      font-weight: bold;
    }
    .ticket-customer, .ticket-vehicle, .ticket-status, .ticket-date {
      font-size: 0.95em;
      color: #555;
    }
    .ticket-date {
      font-size: 0.85em;
      color: #777;
    }
  
    .status-badge {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.9em;
      color: white;
      text-transform: capitalize;
    }
    /* Define colores para diferentes estados */
    .status-pendiente-de-diagnóstico { background-color: #f39c12; /* Naranja */ }
    .status-en-reparación { background-color: #3498db; /* Azul */ }
    .status-listo-para-entrega { background-color: #2ecc71; /* Verde */ }
    .status-entregado { background-color: #95a5a6; /* Gris */ }
    .status-cancelado { background-color: #e74c3c; /* Rojo */ }
    /* Añadir más colores según los estados definidos */
    .status-diagnóstico-en-proceso { background-color: #1abc9c; /* Turquesa */ }
    .status-esperando-aprobación-cliente { background-color: #8e44ad; /* Morado */ }
    .status-esperando-repuestos { background-color: #d35400; /* Naranja Oscuro */ }
    .status-control-de-calidad { background-color: #2980b9; /* Azul Oscuro */ }
    .status-facturado { background-color: #27ae60; /* Verde Oscuro */ }
  
  
    .view-details-button {
      font-size: 1.1em; /* Ajustar si es necesario */
      /* Hereda .large-button y .button-primary de los estilos globales */
    }
    .no-results {
      text-align: center;
      color: #7f8c8d;
      padding: 20px;
      font-size: 1.1em;
    }
  </style>