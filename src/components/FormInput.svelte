<script>
    export let label;
    export let type = 'text';
    export let id;
    export let value;
    export let error = '';
</script>

<div>
    <label for={id} class="block text-sm font-medium text-gray-700">{label}</label>
    <input 
        {type}
        {id}
        bind:value
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
               placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500
               {error ? 'border-red-500' : ''}"
    />
    {#if error}
        <p class="mt-1 text-sm text-red-600">{error}</p>
    {/if}
</div> 