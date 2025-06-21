<script lang="ts">
  import { onMount } from 'svelte';

  export let userId: string;

  let user = {
    id: userId,
    name: '',
    email: '',
    phone: '',
    address: '',
    cedula: '',
    password: ''
  };

  let message = '';
  let messageType: 'success' | 'error' | '' = '';
  let isEditing = false;
  let isLoading = true;

  onMount(async () => {
    try {
      const response = await fetch(`/api/user/getbyId?id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        user = { ...user, ...data };
      } else {
        showToast('Error al cargar los datos del perfil', 'error');
      }
    } catch (error) {
      showToast('Error de conexión al cargar el perfil', 'error');
    } finally {
      isLoading = false;
    }
  });

  async function updateSettings() {
    isLoading = true;
    try {
      const response = await fetch('/api/user/modify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (response.ok) {
        showToast('Perfil actualizado exitosamente');
        isEditing = false;
        if (user.password) {
            user.password = ''; // Clear password field after update
        }
      } else {
        const errorData = await response.json();
        showToast(`Error al actualizar: ${errorData.error || 'error desconocido'}`, 'error');
      }
    } catch (error) {
      showToast('Error de conexión al actualizar el perfil', 'error');
    } finally {
      isLoading = false;
    }
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    message = msg;
    messageType = type;
    setTimeout(() => {
      message = '';
      messageType = '';
    }, 3000);
  }

  function toggleEdit() {
    isEditing = !isEditing;
  }
</script>

<div class="settings-page">
  {#if message}
    <div class="toast {messageType}">{message}</div>
  {/if}

  <div class="settings-card">
    <div class="card-header">
      <h2>Mi Perfil</h2>
      {#if !isEditing}
        <button on:click={toggleEdit} class="btn-edit">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
          </svg>
          Editar
        </button>
      {/if}
    </div>

    {#if isLoading && !isEditing}
      <div class="loading-state">Cargando tu perfil...</div>
    {:else if isEditing}
      <form on:submit|preventDefault={updateSettings} class="profile-form">
        <div class="grid">
            <div class="form-group">
              <label for="name">Nombre</label>
              <input id="name" type="text" bind:value={user.name} required />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" bind:value={user.email} required />
            </div>
            <div class="form-group">
              <label for="phone">Teléfono</label>
              <input id="phone" type="tel" bind:value={user.phone} />
            </div>
            <div class="form-group">
              <label for="cedula">Cédula</label>
              <input id="cedula" type="text" bind:value={user.cedula} />
            </div>
        </div>
        <div class="form-group">
            <label for="address">Dirección</label>
            <input id="address" type="text" bind:value={user.address} />
          </div>
        <div class="form-group password-field">
            <label for="password">Nueva Contraseña</label>
            <input id="password" type="password" bind:value={user.password} placeholder="Dejar en blanco para no cambiar" />
        </div>
        
        <div class="form-actions">
          <button type="button" on:click={toggleEdit} class="btn-cancel">Cancelar</button>
          <button type="submit" class="btn-save" disabled={isLoading}>
            {#if isLoading}
                <div class="spinner"></div> Guardando...
            {:else}
                Guardar Cambios
            {/if}
          </button>
        </div>
      </form>
    {:else}
      <div class="profile-view">
        <div class="field">
          <strong>Nombre:</strong>
          <span>{user.name || 'N/A'}</span>
        </div>
        <div class="field">
          <strong>Email:</strong>
          <span>{user.email || 'N/A'}</span>
        </div>
        <div class="field">
          <strong>Teléfono:</strong>
          <span>{user.phone || 'N/A'}</span>
        </div>
        <div class="field">
            <strong>Cédula:</strong>
            <span>{user.cedula || 'N/A'}</span>
        </div>
        <div class="field">
          <strong>Dirección:</strong>
          <span>{user.address || 'N/A'}</span>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .settings-page {
    max-width: 700px;
    margin: 2rem auto;
    font-family: 'Inter', sans-serif;
  }
  .settings-card {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    overflow: hidden;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  .card-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
  }
  .profile-form, .profile-view {
    padding: 1.5rem;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .form-group {
    margin-bottom: 1rem;
  }
  .form-group.password-field {
      margin-top: 1rem;
  }
  .form-group label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #374151;
    font-size: 0.875rem;
  }
  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
    margin-top: 1.5rem;
  }
  .btn-edit, .btn-save, .btn-cancel {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .btn-edit {
    background-color: transparent;
    color: #3b82f6;
    border: 1px solid #d1d5db;
  }
  .btn-edit:hover {
      background-color: #f9fafb;
  }
  .btn-save {
    background-color: #2563eb;
    color: white;
  }
  .btn-save:hover {
    background-color: #1d4ed8;
  }
   .btn-save:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  .btn-cancel {
    background-color: #ffffff;
    color: #374151;
    border: 1px solid #d1d5db;
  }
  .btn-cancel:hover {
    background-color: #f9fafb;
  }
  .profile-view .field {
    display: flex;
    justify-content: space-between;
    padding: 0.8rem 0;
    border-bottom: 1px solid #f3f4f6;
  }
  .profile-view .field:last-child {
      border-bottom: none;
  }
  .profile-view .field strong {
    color: #6b7280;
  }
  .profile-view .field span {
    color: #111827;
  }
  .loading-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
  }

  .toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem 1.5rem;
    border-radius: 6px;
    color: white;
    z-index: 1000;
    font-weight: 500;
  }
  .toast.success { background-color: #2563eb; }
  .toast.error { background-color: #dc2626; }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>