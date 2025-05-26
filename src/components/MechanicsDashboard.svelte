<script>
    import { onMount } from 'svelte';
    import TicketList from './TicketList.svelte';
    import TicketDetailEdit from './TicketDetailEdit.svelte';

  
    let tickets = [];
    let user = { name: 'Mecánico Asignado' }; // Simulación de usuario asignado, podría venir de un store o prop
    let selectedTicket = null;
    let currentView = 'list'; // 'list' or 'detail'
    let searchTerm = '';
  
    const ticketStatuses = [
      'Pendiente de Diagnóstico',
      'Diagnóstico en Proceso',
      'Esperando Aprobación Cliente',
      'Esperando Repuestos',
      'En Reparación',
      'Control de Calidad',
      'Listo para Entrega',
      'Entregado',
      'Facturado',
      'Cancelado'
    ];
  
    onMount(async () => {
      try {
        const apiHost = window.location.origin;
        const res = await fetch(`${apiHost}/api/ticket/list`);
        if (!res.ok) throw new Error('No se pudieron obtener los tickets');
        const data = await res.json();
        // Si la API devuelve { tickets: [...] }
        tickets = (data.tickets || []).map(({ticket, client, vehicle, user}) => ({
          id: ticket.id,
          name: client?.name || '',
          email: client?.email || '',
          phone: client?.phone || '',
          vehicleDetails: {
            type: vehicle?.type || '',
            brand: vehicle?.make || '',
            model: vehicle?.model || '',
            year: vehicle?.year || '',
            mileage: vehicle?.mileage || '',
            plate: vehicle?.plate || ''
          },
          issueType: ticket.short_description || '',
          issueDescription: ticket.description || '',
          submissionDate: ticket.createdAt || '',
          status: ticket.status || '',
          mechanicNotes: '', // No viene de la API, dejar vacío
          detailedDiagnosis: '', // No viene de la API, dejar vacío
          servicesPerformed: '', // No viene de la API, dejar vacío
          partsUsed: '', // No viene de la API, dejar vacío
          laborHours: 0, // No viene de la API, dejar en 0
          userAssignedTo: user || '', // Asignado al mecánico
        }));
      } catch (e) {
        tickets = [];
        alert('Error al cargar tickets: ' + e.message);
      }
    });
  
    function handleSelectTicket(ticket) {
      selectedTicket = { ...ticket }; // Clonar para evitar mutación directa en la lista
      currentView = 'detail';
    }
  
    function handleSaveTicket(updatedTicket) {
      // Simular guardado de ticket (en una app real, llamar a API PUT)
      const index = tickets.findIndex(t => t.id === updatedTicket.id);
      if (index !== -1) {
        tickets[index] = { ...updatedTicket };
        tickets = [...tickets]; // Forzar reactividad de Svelte
      }
      selectedTicket = null;
      currentView = 'list';
      searchTerm = ''; // Limpiar búsqueda para ver el ticket actualizado
      alert('Ticket actualizado exitosamente (simulado)');
    }
  
    function handleBackToList() {
      selectedTicket = null;
      currentView = 'list';
    }
  
    $: filteredTickets = tickets.filter(ticket => {
      const search = searchTerm.toLowerCase();
      return (
        (ticket.id && ticket.id.toLowerCase().includes(search)) ||
        (ticket.name && ticket.name.toLowerCase().includes(search)) ||
        (ticket.vehicleDetails.brand && ticket.vehicleDetails.brand.toLowerCase().includes(search)) ||
        (ticket.vehicleDetails.model && ticket.vehicleDetails.model.toLowerCase().includes(search)) ||
        (ticket.vehicleDetails.plate && ticket.vehicleDetails.plate.toLowerCase().includes(search))
      );
    });
  
  </script>
  
  <div class="mechanic-dashboard">
    {#if currentView === 'list'}
      <h1>Tickets Pendientes y en Progreso</h1>

      <TicketList
        tickets={filteredTickets}
        userAssignedTo={user}
        bind:searchTerm={searchTerm}
        on:selectTicket={(event) => handleSelectTicket(event.detail)}
      />
    {:else if currentView === 'detail' && selectedTicket}
      <TicketDetailEdit
        bind:ticket={selectedTicket}
        statuses={ticketStatuses}
        on:saveTicket={(event) => handleSaveTicket(event.detail)}
        on:cancel={handleBackToList}
      />
    {/if}
  </div>
  
  <style>
    .mechanic-dashboard {
      max-width: 900px;
      margin: 0 auto;
      padding: 15px;
      font-family: Arial, sans-serif;
      background-color: #f4f7f6; /* Un fondo ligeramente diferente para el dashboard */
      min-height: 100vh;
    }
  
    h1 {
      color: #2c3e50;
      text-align: center;
      margin-bottom: 20px;
    }
  
    /* Estilos generales para inputs y textareas podrían ir aquí o en un global.css */
    :global(input[type="text"]),
    :global(input[type="tel"]),
    :global(input[type="email"]),
    :global(input[type="number"]),
    :global(input[type="search"]),
    :global(select),
    :global(textarea) {
      width: 100%;
      padding: 12px 15px; /* Un poco más de padding para mobile */
      margin-bottom: 15px; /* Espacio entre campos */
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 1em;
      box-sizing: border-box; /* Importante para que el padding no aumente el ancho total */
      transition: border-color 0.3s;
    }
  
    :global(input:focus),
    :global(select:focus),
    :global(textarea:focus) {
      border-color: #3498db;
      outline: none;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
  
    :global(.large-button) {
      display: block;
      width: 100%;
      padding: 15px 20px;
      font-size: 1.15em; /* Ligeramente más grande */
      font-weight: bold;
      text-align: center;
      margin-top: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      transition: background-color 0.3s, transform 0.1s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    :global(.large-button:active) {
        transform: translateY(1px);
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
  
    :global(.button-primary) {
      background-color: #3498db; /* Azul primario */
      color: white;
    }
    :global(.button-primary:hover) {
      background-color: #2980b9;
    }
  
    :global(.button-secondary) {
      background-color: #ecf0f1; /* Gris claro */
      color: #2c3e50;
      border: 1px solid #bdc3c7;
    }
    :global(.button-secondary:hover) {
      background-color: #dde1e2;
    }
  
    :global(.button-danger) {
      background-color: #e74c3c; /* Rojo */
      color: white;
    }
    :global(.button-danger:hover) {
      background-color: #c0392b;
    }
  
  </style>