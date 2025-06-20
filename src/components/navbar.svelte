<script lang="ts">
    import { onMount } from 'svelte';
    import { authClient } from "@/lib/auth-client";
    
    const session = authClient.useSession();
    let isMenuOpen = false;
    let openDropdown: string | null = null;
    let isLoading = true;
    let isSigningOut = false;
    
    // Get current path from Astro's global
    let currentPath = '';
    
    // This will be set by Astro when the component is hydrated
    export let url: URL;
    
    const menuItems = [
        { 
            path: "/", 
            name: "Inicio", 
            icon: "🏠",
            children: []
        },
        { 
            path: "/admin", 
            name: "Admin", 
            icon: "👨‍💼",
            children: [
                { path: "/admin/tickets", name: "Tickets", icon: "🎫" },
                { path: "/admin/clients", name: "Clientes", icon: "👥" },
                { path: "/admin/users", name: "Usuarios", icon: "👥" },
                { path: "/admin/vehiculo", name: "vehiculos", icon: "👥" }
            ]
        },
        { 
            path: "/user", 
            name: "Usuario", 
            icon: "👤",
            children: [
                { path: "/user/dashboard", name: "mis trabajos", icon: "📊" },
                // { path: "/user/profile", name: "Perfil", icon: "👤" },
                
                { path: "/user/settings", name: "mi perfil", icon: "⚙️" }
            ]
        }
    ];
    
    // Set current path when component mounts
    onMount(() => {
        let timer: NodeJS.Timeout;
        
        if (typeof window !== 'undefined') {
            currentPath = window.location.pathname;
            document.addEventListener('click', handleClickOutside);
            // Simulate session loading (remove this in production if your auth handles it)
            timer = setTimeout(() => {
                isLoading = false;
            }, 500);
        }
        return () => {
            if (typeof window !== 'undefined') {
                document.removeEventListener('click', handleClickOutside);
                clearTimeout(timer);
            }
        };
    });
    
    // Toggle dropdown
    function toggleDropdown(menuName: string, e: Event) {
        e.stopPropagation();
        openDropdown = openDropdown === menuName ? null : menuName;
    }
    
    // Close menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const nav = document.querySelector('nav');
        const target = event.target as HTMLElement;
        if (nav && !nav.contains(target)) {
            isMenuOpen = false;
            openDropdown = null;
        }
    }
    
    // Close all dropdowns when clicking a link
    function closeAll() {
        isMenuOpen = false;
        openDropdown = null;
    }
    
    // Check if a route is active
    function isActive(path: string) {
        if (typeof window === 'undefined') return false;
        return currentPath === path || 
               (path !== '/' && currentPath.startsWith(path));
    }
    
    // Check if any child route is active
    function hasActiveChild(children: Array<{path: string}>) {
        return children.some(child => isActive(child.path));
    }
</script>

<nav class="navbar">
    <div class="navbar-container">
        <div class="navbar-brand">
            <a href="/" class="logo">Taller UPTM</a>
            <button 
                class="mobile-menu-btn"
                on:click|stopPropagation={() => isMenuOpen = !isMenuOpen}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
            >
                <div class="hamburger {isMenuOpen ? 'open' : ''}">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>
        </div>
        
        <div class="navbar-links {isMenuOpen ? 'active' : ''}" on:click|stopPropagation>
            <ul class="main-menu">
                {#each menuItems as item}
                    <li class:has-dropdown={item.children.length > 0} class:active={isActive(item.path) || (item.children.length > 0 && hasActiveChild(item.children))}>
                        {#if item.children.length > 0}
                            <button 
                                class="dropdown-toggle"
                                on:click|stopPropagation={(e) => toggleDropdown(item.path, e)}
                                aria-expanded={openDropdown === item.path}
                                aria-haspopup="true"
                            >
                                <span class="icon">{item.icon}</span>
                                <span class="text">{item.name}</span>
                                <span class="dropdown-arrow">▾</span>
                            </button>
                            <div class="dropdown-menu {openDropdown === item.path ? 'show' : ''}">
                                {#each item.children as child}
                                    <a 
                                        href={child.path} 
                                        class:active={isActive(child.path)}
                                        on:click|stopPropagation={closeAll}
                                    >
                                        <span class="icon">{child.icon}</span>
                                        <span class="text">{child.name}</span>
                                    </a>
                                {/each}
                            </div>
                        {:else}
                            <a 
                                href={item.path} 
                                class:active={isActive(item.path)}
                                on:click|stopPropagation={closeAll}
                            >
                                <span class="icon">{item.icon}</span>
                                <span class="text">{item.name}</span>
                            </a>
                        {/if}
                    </li>
                {/each}
            </ul>
            
            <div class="user-section">
                {#if isLoading}
                    <div class="loader"></div>
                {:else if $session?.data}
                    <div class="user-info">
                        <button 
                            class="user-dropdown-toggle"
                            on:click|stopPropagation={(e) => toggleDropdown('user', e)}
                            aria-expanded={openDropdown === 'user'}
                            aria-haspopup="true"
                            disabled={isSigningOut}
                        >
                            <span class="user-avatar">{$session.data.user?.name?.charAt(0) || 'U'}</span>
                            <span class="user-name">{$session.data.user?.name || 'Usuario'}</span>
                            <span class="dropdown-arrow">▾</span>
                        </button>
                        <div class="dropdown-menu user-dropdown {openDropdown === 'user' ? 'show' : ''}">
                            <a href="/user/settings" on:click|stopPropagation={closeAll}>
                                <span class="icon">⚙️</span> Configuración
                            </a>
                            <button 
                                class="signout-btn {isSigningOut ? 'loading' : ''}"
                                on:click|stopPropagation={async () => {
                                    if (isSigningOut) return;
                                    isSigningOut = true;
                                    try {
                                        await authClient.signOut();
                                        closeAll();
                                        window.location.href = '/';
                                    } catch (error) {
                                        console.error('Error signing out:', error);
                                        isSigningOut = false;
                                    }
                                }}
                                disabled={isSigningOut}
                            >
                                {#if isSigningOut}
                                    <span class="spinner"></span>
                                    <span class="btn-text">Saliendo...</span>
                                {:else}
                                    <span class="icon">🚪</span>
                                    <span class="btn-text">Cerrar Sesión</span>
                                {/if}
                            </button>
                        </div>
                    </div>
                {:else}
                    <a href="/signin" class="login-btn" on:click|stopPropagation={closeAll}>
                        Iniciar Sesión
                    </a>
                {/if}
            </div>
        </div>
    </div>
</nav>

<style>
  
    
    .navbar {
        background: #1a1a2e;
        color: #fff;
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .navbar-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }
    
    .navbar-brand {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
    }
    
    .logo {
        color: #fff;
        font-size: 1.5rem;
        font-weight: 700;
        text-decoration: none;
        letter-spacing: 1px;
        transition: color 0.3s ease;
    }
    
    .logo:hover {
        color: #4cc9f0;
    }
    
    .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
    }
    
    .hamburger {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 24px;
        height: 18px;
        position: relative;
    }
    
    .hamburger span {
        display: block;
        height: 2px;
        width: 100%;
        background: #fff;
        transition: all 0.3s ease;
    }
    
    .hamburger.open span:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }
    
    .hamburger.open span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.open span:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }
    
    .navbar-links {
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
    }
    
    .main-menu {
        display: flex;
        list-style: none;
        gap: 0.5rem;
        margin: 0;
        padding: 0;
    }
    
    .main-menu > li {
        position: relative;
    }
    
    .main-menu > li > a,
    .dropdown-toggle,
    .user-dropdown-toggle {
        color: #e6e6e6;
        text-decoration: none;
        font-weight: 500;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
        border-radius: 4px;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 1rem;
    }
    
    .dropdown-toggle,
    .user-dropdown-toggle {
        position: relative;
        padding-right: 1.75rem;
    }
    
    .dropdown-arrow {
        margin-left: 0.5rem;
        font-size: 0.8em;
        transition: transform 0.2s ease;
    }
    
    .dropdown-toggle[aria-expanded="true"] .dropdown-arrow,
    .user-dropdown-toggle[aria-expanded="true"] .dropdown-arrow {
        transform: rotate(180deg);
    }
    
    .main-menu > li > a:hover,
    .dropdown-toggle:hover,
    .user-dropdown-toggle:hover,
    .main-menu > li.active > a,
    .main-menu > li.active > .dropdown-toggle {
        background: rgba(76, 201, 240, 0.1);
        color: #4cc9f0;
    }
    
    .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: #252a41;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.2s ease;
        z-index: 100;
    }
    
    .dropdown-menu.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(5px);
    }
    
    .dropdown-menu a,
    .dropdown-menu .signout-btn {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        color: #e6e6e6;
        text-decoration: none;
        transition: all 0.2s ease;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        font-size: 0.95rem;
        cursor: pointer;
    }
    
    .dropdown-menu a:hover,
    .dropdown-menu .signout-btn:hover {
        background: rgba(76, 201, 240, 0.1);
        color: #4cc9f0;
    }
    
    .dropdown-menu .icon {
        margin-right: 0.75rem;
        width: 1.25rem;
        text-align: center;
    }
    
    .user-section {
        margin-left: 1rem;
        position: relative;
    }
    
    .user-dropdown-toggle {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #4cc9f0;
        color: #1a1a2e;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9;
    }

    .user-dropdown {
        right: 0;
        left: auto;
    }
    
    .signout-btn {
        color: #ff6b6b !important;
    }
    
    .signout-btn:hover {
        background: rgba(255, 107, 107, 0.1) !important;
    }
    
    .login-btn {
        background: #4cc9f0;
        color: #1a1a2e;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
    }
    
    .login-btn:hover {
        background: #3aa8d9;
        transform: translateY(-1px);
    }
    
    /* Estilos responsivos */
    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: block;
        }
        
        .navbar-links {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            bottom: 0;
            background: #1a1a2e;
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem 1.5rem;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            overflow-y: auto;
            z-index: 999;
        }
        
        .navbar-links.active {
            transform: translateX(0);
        }
        
        .main-menu {
            flex-direction: column;
            width: 100%;
            gap: 0;
        }
        
        .main-menu > li {
            width: 100%;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .main-menu > li > a,
        .dropdown-toggle {
            padding: 1rem 0;
            width: 100%;
            justify-content: space-between;
        }
        
        .dropdown-menu {
            position: static;
            display: none;
            box-shadow: none;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 0;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
        }
        
        .dropdown-menu.show {
            display: block;
            opacity: 1;
            visibility: visible;
            transform: none;
        }
        
        .user-section {
            margin: 1rem 0 2rem;
            width: 100%;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .user-dropdown {
            position: static;
            margin-top: 0.5rem;
        }
    }
    
    /* Animaciones */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .dropdown-menu {
        animation: fadeIn 0.2s ease forwards;
    }
    
    /* Mejoras de accesibilidad */
    [aria-expanded="true"] + .dropdown-menu {
        display: block;
    }
    
    /* Estilos para el modo de alto contraste */
    @media (prefers-contrast: more) {
        .navbar {
            border-bottom: 2px solid #fff;
        }
        
        .dropdown-menu {
            border: 2px solid #fff;
        }
    }
    
    /* Mejoras para navegación por teclado */
    a:focus,
    button:focus {
        outline: 2px solid #4cc9f0;
        outline-offset: 2px;
    }
    
    .loader,
    .spinner {
        display: inline-block;
        width: 1em;
        height: 1em;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
    }

    .btn-text {
        margin-left: 4px;
    }

    .signout-btn.loading {
        opacity: 0.8;
        cursor: wait;
    }

    .user-dropdown-toggle[disabled],
    .signout-btn[disabled] {
        cursor: not-allowed;
        opacity: 0.7;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
