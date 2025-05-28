<script lang="ts">
  import { onMount } from "svelte";
  import { authClient } from "@/lib/auth-client";
  let session: any = null;

  onMount(async () => {
    session = await authClient.admin.listUsers({
      query: {
        limit: 10000,
        offset: 0,
      }
    });
  });
</script>
    <div>
      <pre>
        {JSON.stringify(session, null, 2)}
      </pre>
    {#if session && session.data && session.data.users}
      <ul>
        {#each session.data.users as user}
          <li>
            <strong>{user.name}</strong> - {user.email} - {user.role}
          </li>
        {/each}
      </ul>
    {:else}
      <p>Loading...</p>
    {/if}
    </div>