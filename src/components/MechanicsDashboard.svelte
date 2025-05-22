<script>
    import { onMount } from 'svelte';
    import TicketList from './TicketList.svelte';
    import TicketDetailEdit from './TicketDetailEdit.svelte';
  
    let tickets = [];
    let selectedTicket = null;
    let currentView = 'list'; // 'list' or 'detail'
    let searchTerm = '';
  
    // Datos simulados (en una app real, esto vendría de una API)
    const mockTickets = [
      {
        id: 'TKT-2025-001',
        name: 'Ana García',
        email: 'ana.garcia@email.com',
        phone: '04161234567',
        vehicleDetails: {
          type: 'Automóvil',
          brand: 'Chevrolet',
          model: 'Spark',
          year: '2015',
          mileage: '85000'
        },
        issueType: 'Problemas de motor',
        issueDescription: 'El carro no enciende por las mañanas, hay que darle varias veces.',
        submissionDate: new Date(2025, 4, 15, 9, 30).toISOString(), // Mes es 0-indexado
        status: 'Pendiente de Diagnóstico',
        mechanicNotes: '',
        detailedDiagnosis: '',
        servicesPerformed: '', // Simplificado a textarea
        partsUsed: '', // Simplificado a textarea
        laborHours: 0,
      },
      {
        id: 'TKT-2025-002',
        name: 'Carlos Rodríguez',
        email: '',
        phone: '04247654321',
        vehicleDetails: {
          type: 'Camioneta',
          brand: 'Toyota',
          model: 'Hilux',
          year: '2020',
          mileage: '40000'
        },
        issueType: 'Frenos defectuosos',
        issueDescription: 'Suena un chillido al frenar y el pedal se siente esponjoso.',
        submissionDate: new Date(2025, 4, 16, 11, 0).toISOString(),
        status: 'En Reparación',
        mechanicNotes: 'Pastillas de freno delanteras desgastadas. Se verificarán discos.',
        detailedDiagnosis: 'Desgaste severo de pastillas de freno delanteras. Discos rectificables.',
        servicesPerformed: 'Reemplazo de pastillas de freno delanteras.\nRectificación de discos delanteros.\nPurga de sistema de frenos.',
        partsUsed: '1 juego de pastillas de freno delanteras (Código: PF-TYH-01)\nLíquido de frenos DOT4 500ml',
        laborHours: 2.5,
      }
    ];
  
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
  
    onMount(() => {
      // Simular carga de tickets
      tickets = mockTickets;
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
        ticket.id.toLowerCase().includes(search) ||
        ticket.name.toLowerCase().includes(search) ||
        ticket.vehicleDetails.brand.toLowerCase().includes(search) ||
        ticket.vehicleDetails.model.toLowerCase().includes(search) ||
        (ticket.vehicleDetails.plate && ticket.vehicleDetails.plate.toLowerCase().includes(search)) // Si tuvieras placa
      );
    });
  
  </script>
  
  <div class="mechanic-dashboard">
    {#if currentView === 'list'}
      <h1>Tickets Pendientes y en Progreso</h1>
      <TicketList
        tickets={filteredTickets}
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