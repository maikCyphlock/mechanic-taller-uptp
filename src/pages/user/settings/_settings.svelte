<script>
  export let userId;
  export let Context;
  import { onMount } from 'svelte';

  let user = {
    name: '',
    email: '',
    phone: '',
    address: '',
    cedula: ''
  };

  let message = '';

  // Fetch current user settings
  onMount(async () => {
    try {
      

      const response = await fetch('/api/user/getbyId?id='+
      userId); // Reemplaza USER_ID con el ID del usuario
      if (response.ok) {
        user = await response.json();
      } else {
        message = 'Error fetching user settings';
      }
    } catch (error) {
      message = 'Failed to load user settings';
    }
  });

  // Update user settings
  async function updateUserSettings() {
    try {
      
      const response = await fetch('/api/user/update/id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId, // Asegúrate de enviar el ID del usuario
          userData: user // Envía los datos del usuario
        })
      });

      if (response.ok) {
        message = 'Settings updated successfully';
      } else {
        message = 'Failed to update settings';
      }
    } catch (error) {
      message = 'Error updating settings';
    }
  }
</script>

<div class="settings-container">
  <h1>Configuración del Perfil</h1>
 
  {#if message}
    <p class="message">{message}</p>
  {/if}

  <form on:submit|preventDefault={updateUserSettings}>
    <div class="form-group">
      <label for="name">nombre:</label>
      <input id="name" type="text" bind:value={user.name} />
    </div>

    <div class="form-group">
      <label for="email">Correo electrónico (email):</label>
      <input id="email" type="email" bind:value={user.email} />
    </div>

    <div class="form-group">
      <label for="phone">teléfono:</label>
      <input id="phone" type="tel" bind:value={user.phone} />
    </div>

    <div class="form-group">
      <label for="address">Dirreción residencial:</label>
      <input id="address" type="text" bind:value={user.address} />
    </div>
     <div class="form-group">
      <label for="cedula">número de cedula de identidad</label>
      <input id="cedula" type="text" bind:value={user.cedula} />
    </div>

    <button type="submit" class="save-button">Save Changes</button>
  </form>
</div>

<style>
  .settings-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  .save-button {
    display: block;
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  .save-button:hover {
    background-color: #0056b3;
  }

  .message {
    text-align: center;
    color: red;
    margin-bottom: 20px;
  }
</style>