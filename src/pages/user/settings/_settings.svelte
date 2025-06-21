<script>
  export let userId;
  export let Context;
  import { onMount } from 'svelte';

  let user = {
    name: '',
    email: '',
    phone: '',
    address: '',
    cedula: '',
    password:''
  };

  let message = '';
  let isEditing = false;
  let isLoading = true;

  // Obtener configuración actual del usuario
  onMount(async () => {
    try {
      const response = await fetch('/api/user/getbyId?id=' + userId);
      if (response.ok) {
        user = await response.json();
      } else {
        message = 'Error al cargar la configuración del usuario';
      }
    } catch (error) {
      message = 'Error al cargar la configuración';
    } finally {
      isLoading = false;
    }
  });

  // Actualizar configuración del usuario
  async function actualizarConfiguracion() {
    try {
      const response = await fetch('/api/user/update/id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userData: user
        })
      });

      if (response.ok) {
        message = 'Configuración actualizada exitosamente';
        isEditing = false;
      } else {
        message = 'Error al actualizar la configuración';
      }
    } catch (error) {
      message = 'Error al actualizar la configuración';
    }
  }

  function toggleEdit() {
    isEditing = !isEditing;
  }
</script>

<div class="settings-container">
  <div class="header">
    <h1>Configuración del Perfil</h1>
    {#if !isEditing}
      <button on:click={toggleEdit} class="edit-button">Editar Perfil</button>
    {/if}
  </div>
 
  {#if message}
    <p class:success={!message.includes('Error')} class:error={message.includes('Error')}>
      {message}
    </p>
  {/if}

  {#if isLoading}
    <div class="loading">Cargando datos del perfil...</div>
  {:else if isEditing}
    <form on:submit|preventDefault={actualizarConfiguracion}>
      <div class="form-group">
        <label for="name">Nombre completo:</label>
        <input id="name" type="text" bind:value={user.name} required />
      </div>

      <div class="form-group">
        <label for="email">Correo electrónico:</label>
        <input id="email" type="email" bind:value={user.email} required />
      </div>

      <div class="form-group">
        <label for="phone">Teléfono:</label>
        <input id="phone" type="tel" bind:value={user.phone} />
      </div>

      <div class="form-group">
        <label for="address">Dirección residencial:</label>
        <input id="address" type="text" bind:value={user.address} />
      </div>

      <div class="form-group">
        <label for="cedula">Número de cédula de identidad:</label>
        <input id="cedula" type="text" bind:value={user.cedula}  />
      </div>

      <div class="form-actions">
        <button type="button" on:click={toggleEdit} class="cancel-button">Cancelar</button>
        <button type="submit" class="save-button">Guardar Cambios</button>
      </div>
    </form>
  {:else}
    <div class="profile-view">
      <div class="profile-field">
        <span class="label">Nombre completo:</span>
        <span class="value">{user.name || 'No especificado'}</span>
      </div>

      <div class="profile-field">
        <span class="label">Correo electrónico:</span>
        <span class="value">{user.email || 'No especificado'}</span>
      </div>

      <div class="profile-field">
        <span class="label">Teléfono:</span>
        <span class="value">{user.phone || 'No especificado'}</span>
      </div>

      <div class="profile-field">
        <span class="label">Dirección:</span>
        <span class="value">{user.address || 'No especificada'}</span>
      </div>

      <div class="profile-field">
        <span class="label">Cédula de identidad:</span>
        <span class="value">{user.cedula || 'No especificada'}</span>
      </div>
      
    </div>
  {/if}
</div>

<style>
  .settings-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
  }

  h1 {
    margin: 0;
    color: #2c3e50;
  }

  .edit-button, .save-button, .cancel-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .edit-button {
    background-color: #3498db;
    color: white;
  }

  .edit-button:hover {
    background-color: #2980b9;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #2c3e50;
  }

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 30px;
  }

  .save-button {
    background-color: #2ecc71;
    color: white;
  }

  .save-button:hover {
    background-color: #27ae60;
  }

  .cancel-button {
    background-color: #95a5a6;
    color: white;
  }

  .cancel-button:hover {
    background-color: #7f8c8d;
  }

  .profile-view {
    background: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .profile-field {
    padding: 12px 0;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
  }

  .profile-field:last-child {
    border-bottom: none;
  }

  .profile-field .label {
    font-weight: 600;
    color: #7f8c8d;
  }

  .message {
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 4px;
    text-align: center;
  }

  .success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .loading {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
  }
</style>