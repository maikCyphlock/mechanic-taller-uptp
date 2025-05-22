<script lang="ts">
    import { authClient } from "@/lib/auth-client";
    const session = authClient.useSession();
</script>

<nav class="navbar">
    <div class="navbar-content">
        <div class="navbar-brand">
            <a href="/">MyApp</a>
        </div>
        <div class="navbar-actions">
            {#if $session.data}
                <div class="user-info">
                    <span class="user-name">{$session?.data?.user.name}</span>
                    <button
                        class="signout-btn"
                        on:click={async () => {
                            await authClient.signOut();
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            {:else}
                <a
                    class="github-btn"
                   href="/signin"
                >
                    inicia sesión
            </a>
            {/if}
        </div>
    </div>
</nav>

<style>
    .navbar {
        background: #24292f;
        color: #fff;
        padding: 0.5rem 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .navbar-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 900px;
        margin: 0 auto;
    }
    .navbar-brand a {
        color: #fff;
        font-weight: bold;
        font-size: 1.3rem;
        text-decoration: none;
        letter-spacing: 1px;
    }
    .navbar-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .user-name {
        font-weight: 500;
        font-size: 1rem;
    }
    .signout-btn,
    .github-btn {
        background: #2ea44f;
        color: #fff;
        border: none;
        padding: 0.45rem 1.1rem;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.2s;
    }
    .signout-btn {
        background: #d73a49;
    }
    .signout-btn:hover,
    .github-btn:hover {
        background: #22863a;
    }
    .signout-btn:hover {
        background: #b31d28;
    }
</style>