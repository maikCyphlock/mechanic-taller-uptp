<script>
    import { date } from "drizzle-orm/mysql-core";

    export let tickets = [];
    let searchQuery = '';
    let selectedStatus = '';
    let filteredTickets = tickets;

    $: filteredTickets = tickets.filter(({ client: c, ticket: t }) => {
        const matchesQuery = c?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus ? t.status === selectedStatus : true;
        return matchesQuery && matchesStatus;
    });

    const statuses = ['ABIERTO', 'EN_PROCESO', 'CERRADO', 'CANCELADO'];

    const handleDeleteButton = async (id) => {
        const wannaDelete = confirm("¿realmente quieres eliminarlo?")
        if (wannaDelete === false) return;
        const POST = await fetch (`/api/ticket/${id}/delete`)
    }

    const convertTolocaleTime = (date) => {
        const modificatedDate = new Date(date)
        return modificatedDate.toLocaleDateString()
    }
</script>

<div class="mb-4 flex items-center space-x-4">
    <input
        type="text"
        placeholder="Buscar por cliente..."
        bind:value={searchQuery}
        class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
    />
    <select
        bind:value={selectedStatus}
        class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
    >
        <option value="">Todos los estados</option>
        {#each statuses as status}
            <option value={status}>{status}</option>
        {/each}
    </select>
</div>

<div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredTickets as { ticket: t, client: c, vehicle: v, user: u }}
             {#if t.delete_at !== null}
                  <tr class="hover:bg-gray-50 transition-colors duration-150">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{t.id.slice(0, 5)}
                    </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ticket Eliminado
                    </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       
                    </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                       
                    </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      
                    </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <small>eliminado el --></small>
                    </td>
                     <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      
                       {
                        convertTolocaleTime(t.delete_at)
                       }
                    </td>
                </tr>
            
            {:else}
                <tr class="hover:bg-gray-50 transition-colors duration-150">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{t.id.slice(0, 5)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{c?.name || 'N/A'}</div>
                        <div class="text-sm text-gray-500">{c?.phone || ''}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                            {v ? `${v.type}, ${v.model}, ${v.year}` : 'N/A'}
                        </div>
                        <div class="text-sm text-gray-500">{v?.licensePlate || ''}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm text-gray-900 max-w-xs truncate" title={t.description || 'Sin descripción'}>
                            {t.short_description || 'Sin descripción'}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
             
                                    ${t.status === 'ABIERTO' ? 'bg-green-100 text-green-800' : 
                                        t.status === 'EN_PROCESO' ? 'bg-blue-100 text-blue-800' : 
                                        t.status === 'CERRADO' ? 'bg-purple-100 text-purple-800' : 
                                        t.status === 'CANCELADO' ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'}`}>
                                        {t.status === 'completed' ? 'Completado' : 
                                         t.status === 'EN_PROCESO' ? 'Por Verificar Pago' : 
                                         t.status === 'CERRADO' ? 'Pago Verificado ✅' : 
                                         t.status === 'CANCELADO' ? 'Cancelado' : 'ABIERTO'}
                            </span>
                                
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u?.name || 'No asignado'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                        <a 
                            href={`/admin/tickets/${t.id}`} 
                            class="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Ver detalles"
                        >
                            Ver
                        </a>
                        <a 
                            href={`/admin/tickets/edit/${t.id}`} 
                            class="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Editar ticket"
                        >
                            Editar
                        </a>
                        <button on:click={handleDeleteButton(t.id)}>
                            Eliminar Ticket
                        </button>
                    </td>
                </tr>
          
                {/if}
            {/each}
        </tbody>
    </table>
</div>