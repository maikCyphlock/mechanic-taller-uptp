<script>

    import { createEventDispatcher, onMount } from 'svelte';
    export let adminId = ''
    export let vehicleId = '';
    export let short_description = '';
    export let description = '';
    export let status = 'ABIERTO';
    export let priority = 'MEDIA';
    export let assignedTo = '';
    export let estimatedCost = 0;
    export let clientId = '';
    export let payment_method = '';
    export let total_amount = 0;
    export let time_spent = 0;
    export let work_notes = '';
    export let tool_used = '';
    export let idTicket = '';
    export let payment_reference = '';
    export let payment_amount = 0;
    export let clientName ='';

    const dispatch = createEventDispatcher();
       const paymentMethods = [
        { value: 'EFECTIVO', label: 'Efectivo', icon: '💵' },
        { value: 'PAGO_MOVIL', label: 'Pago Móvil', icon: '📱' },
        { value: 'TARJETA_CREDITO', label: 'Tarjeta Crédito', icon: '💳' },
        { value: 'TARJETA_DEBITO', label: 'Tarjeta Débito', icon: '🪪' },
        { value: 'TRANSFERENCIA_BANCARIA', label: 'Transferencia', icon: '🏦' }
    ];

    onMount(async () => {
        try {
            const response = await fetch(`/api/ticket/${idTicket}/get`);
            if (response.ok) {
                const data = await response.json();

                console.log(data)
                if (data && data.length > 0) {
                    const ticketData = data[0].ticket;
                   
                    clientName = data[0].client.name || ''
                    vehicleId = ticketData.vehicleId || '';
                    short_description = ticketData.short_description || '';
                    description = ticketData.description || '';
                    status = ticketData.status || 'ABIERTO';
                    priority = ticketData.priority || 'MEDIA';
                    assignedTo = ticketData.assignedTo || '';
                    estimatedCost = ticketData.estimatedCost || 0;
                    clientId = ticketData.clientId || '';
                    payment_method = ticketData.payment_method || '';
                    total_amount = ticketData.total_amount || 0;
                    time_spent = ticketData.time_spent || 0;
                    work_notes = ticketData.work_notes || '';
                    tool_used = ticketData.tool_used || '';
                    payment_reference = ticketData.payment_reference || '';
                    payment_amount = ticketData.payment_amount || 0;
                }
               
            } else {
                console.error('Error fetching ticket data:', response.status);
            }
        } catch (error) {
            console.error('Error fetching ticket data:', error);
        }
    });

    const handleSubmit = async () => {
        const ticketData = {
            vehicleId,
            short_description,
            description,
            status,
            priority,
            assignedTo,
            estimatedCost,
            clientId,
            payment_method,
            total_amount,
            time_spent,
            work_notes,
            tool_used,
            payment_reference,
            payment_amount,
            approved_by: adminId
  
        };

        try {
            const response = await fetch(`/api/ticket/${idTicket}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketData)
            });
            console.log({ticketData})
            console.log({response})
            if (response.ok) {
                dispatch('create');
                // Optionally reset the form here
            } else {
                console.error('Error creating ticket:', response.status);
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
    };
</script>
<form on:submit|preventDefault={handleSubmit} class="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
    <h2 class="text-2xl font-bold text-sky-700">Aprobar Pago de Ticket</h2>

    <div>
        <label hidden for="vehicleId" class="block text-sm font-medium text-sky-700">ID del Vehículo</label>
        <input hidden type="text" id="vehicleId" bind:value={vehicleId} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>

    <div>
        <label for="short_description" class="block text-sm font-medium text-sky-700">Descripción Corta</label>
        <input type="text" id="short_description" bind:value={short_description} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>

    <div>
        <label for="description" class="block text-sm font-medium text-sky-700">Descripción</label>
        <textarea id="description" bind:value={description} rows="4" class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"></textarea>
    </div>

    <div>
        <label for="status" class="block text-sm font-medium text-sky-700">Estado</label>
        <select id="status" bind:value={status} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
           
            <option value="EN_PROCESO">EN PROCESO</option>
            <option value="CERRADO">APROBADO Y VERIFICADO EL PAGO</option>
            <option value="CANCELADO">CANCELADO</option>
        </select>
    </div>

    <div>
        <label for="priority" class="block text-sm font-medium text-sky-700">Prioridad</label>
        <select id="priority" bind:value={priority} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
            <option value="BAJA">BAJA</option>
            <option value="MEDIA">MEDIA</option>
            <option value="ALTA">ALTA</option>
        </select>
    </div>

    <div>
        <label for="assignedTo" class="block text-sm font-medium text-sky-700">Asignado A</label>
        <input type="text" id="assignedTo" bind:value={assignedTo} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>

    <div>
        <label for="estimatedCost" class="block text-sm font-medium text-sky-700">Costo Estimado</label>
        <input type="number" id="estimatedCost" bind:value={estimatedCost} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>

    <div>
        <label for="clientId" class="block text-sm font-medium text-sky-700">ID del Cliente</label>
        <input type="text" id="clientId" bind:value={clientName} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>

    <div>
        <label for="payment_method" class="block text-sm font-medium text-sky-700">Método de Pago</label>
        <select id="payment_method" bind:value={payment_method} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
            {#each paymentMethods as method}
                <option value={method.value}>{method.icon} {method.label}</option>
            {/each}
        </select>
    </div>
     <div>
        <label for="payment_amount" class="block text-sm font-medium text-sky-700">Monto de Pago</label>
        <input type="number" id="payment_amount" bind:value={payment_amount} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>

    <div>
        <label for="total_amount" class="block text-sm font-medium text-sky-700">Monto Total</label>
        <input type="number" id="total_amount" bind:value={total_amount} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>
    {#if payment_reference}
        <div>
            <label for="payment_reference" class="block text-sm font-medium text-sky-700">Referencia de Pago</label>
            <input type="text" id="payment_reference" bind:value={payment_reference} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
        </div>
    {/if}

    <div>
        <label for="time_spent" class="block text-sm font-medium text-sky-700">Tiempo Invertido (minutos)</label>
        <input type="number" id="time_spent" bind:value={time_spent} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>

    <div>
        <label for="work_notes" class="block text-sm font-medium text-sky-700">Notas de Trabajo</label>
        <textarea id="work_notes" bind:value={work_notes} rows="4" class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"></textarea>
    </div>

    <div>
        <label for="tool_used" class="block text-sm font-medium text-sky-700">Herramienta Utilizada</label>
        <input type="text" id="tool_used" bind:value={tool_used} class="mt-1 block w-full rounded-md border-sky-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
    </div>

    <button type="submit" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
        Aprobar Pago
    </button>
</form>