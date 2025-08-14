<script>
  // --- State Variables ---
  // Form fields
  let name = '';
  let phone = '';
  let cedula = '';
  // vehicleType will now be bound to the value of the selected radio button
  let vehicleType = '';

  let issueType = '';
  let issueDescription = '';

  // UI State
  let currentStep = 1; // Start at step 1
  let submissionStatus = '';
  let submissionError = '';
  let isLoading = false;

  // --- Predefined Options ---
  const vehicleOptions = [
    { value: 'automovil', icon: '🚗' },
    { value: 'camioneta', icon: '🚚' },
    { value: 'camion', icon: '🚛' },
    { value: 'motocicleta', icon: '🏍️' },
    { value: 'otro', icon: '❓' }
  ];

  const commonIssues = [
    '', // Keep empty option for select default
    'Problemas de motor',
    'Frenos defectuosos',
    'Problemas eléctricos',
    'Sistema de suspensión',
    'Problemas de transmisión',
    'Fugas de aceite',
    'Sistema de escape',
    'Aire acondicionado',
    'Otro problema'
  ];

  // --- Step Navigation & Validation Logic ---

  // Function to validate the current step
  const validateCurrentStep = () => {
    submissionError = ''; // Clear previous errors before validating

    if (currentStep === 1) {
      if (!name || !phone) {
        submissionError = 'Por favor complete los campos obligatorios (*) en Datos del Cliente.';
        return false;
      }
    } else if (currentStep === 2) {
      if (!vehicleType) {
        submissionError = 'Por favor seleccione el Tipo de Vehículo (*).';
        return false;
      }
    } else if (currentStep === 3) {
      if (!issueType || !issueDescription) {
         submissionError = 'Por favor complete los campos obligatorios (*) en Datos del Problema.';
        return false;
      }
    }
    // If validation passes for the current step
    return true;
  };

  // Function to move to the next step
  const nextStep = () => {
    if (validateCurrentStep()) {
      submissionError = ''; // Clear errors if validation passed
      currentStep += 1;
    }
  };

  // Function to move to the previous step
  const prevStep = () => {
    if (currentStep > 1) {
      submissionStatus = ''; // Clear success status if going back
      submissionError = ''; // Clear errors
      currentStep -= 1;
    }
  };

  // --- Form Submission Logic ---
  const submitTicket = async () => {
    // Final validation before submitting (should pass if step validation worked)
    if (!validateCurrentStep()) {
       // This should ideally not happen if "Next" is always used, but is a safeguard.
       // The error message will be set by validateCurrentStep.
      return;
    }

    isLoading = true; // Start loading state
    submissionStatus = ''; // Clear previous messages
    submissionError = '';

    try {
        const apiHost = window.location.origin;
      const response = await fetch(`${apiHost}/api/ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          cedula,
          phone,
          vehicleDetails: {
            type: vehicleType,
          },
          issueType,
          issueDescription,
          submissionDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Handle successful submission
        submissionStatus = '¡Ticket abierto exitosamente!';

        // Reset ALL form fields and go back to step 1
        name = phone = vehicleType = issueType = issueDescription = '';
        currentStep = 1; // Reset to the first step

      } else {
         // Handle server-side errors
         submissionError = `Error al abrir el ticket (${response.status}). Por favor intente de nuevo. errror: ${response.statusText}`;
      }
    } catch (error) {
      // Handle network errors
      console.error('Error opening ticket:', error);
      submissionError = 'Error de conexión. Por favor verifique su conexión e intente de nuevo.';
    } finally {
      isLoading = false; // End loading state
    }
  };
</script>

<div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
  <h2 class="text-2xl font-bold text-center text-gray-800 mb-4">Abrir Ticket Rápido</h2>
  <p class="text-center text-gray-600 mb-6">Paso {currentStep} de 3</p>

  <form on:submit|preventDefault={submitTicket}>
    {#if currentStep === 1}
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Datos del Cliente</h3>
        <div class="mb-4">
          <label for="name" class="block text-gray-600 font-medium mb-2">Nombre Completo <span class="text-red-500">*</span></label>
          <input type="text" id="name" bind:value={name} placeholder="Ej: Juan Pérez" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="mb-4">
          <label for="phone" class="block text-gray-600 font-medium mb-2">Teléfono <span class="text-red-500">*</span></label>
          <input type="tel" id="phone" bind:value={phone} placeholder="Ej: 04121234567" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="mb-4">
          <label for="cedula" class="block text-gray-600 font-medium mb-2">Cédula <span class="text-red-500">*</span></label>
          <input type="number" id="cedula" bind:value={cedula} placeholder="Ej: 30054144" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
    {/if}

    {#if currentStep === 2}
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Tipo de Vehículo</h3>
        <div class="flex flex-wrap gap-4 justify-center">
          {#each vehicleOptions as option}
            <button 
              type="button" 
              on:click={() => vehicleType = option.value}
              class="flex flex-col items-center justify-center w-32 h-20 border-2 rounded-lg text-2xl 
                     transition-colors duration-200
                     {vehicleType === option.value ? 'bg-blue-300 border-blue-500' : 'bg-white border-gray-300 hover:bg-blue-100'}">
              <span>{option.icon}</span>
              <span class="text-base text-gray-700 capitalize mt-1">{option.value}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}

    {#if currentStep === 3}
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Datos del Problema</h3>
        <div class="mb-4">
          <label for="issueType" class="block text-gray-600 font-medium mb-2">Tipo de Problema <span class="text-red-500">*</span></label>
          <select id="issueType" bind:value={issueType} required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {#each commonIssues as issue}
              <option value={issue}>{issue || 'Seleccione...'}</option>
            {/each}
          </select>
        </div>
        <div class="mb-4">
          <label for="issueDescription" class="block text-gray-600 font-medium mb-2">Descripción Detallada <span class="text-red-500">*</span></label>
          <textarea id="issueDescription" bind:value={issueDescription} placeholder="Describa el problema (sonidos, cuándo ocurre, etc.)" rows="4" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          <p class="text-sm text-gray-500 mt-2">Este campo es clave para el diagnóstico inicial.</p>
        </div>
      </div>
    {/if}

    <div class="flex justify-between items-center">
      {#if currentStep > 1}
        <button type="button" on:click={prevStep} class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Atrás</button>
      {/if}
      {#if currentStep < 3}
        <button type="button" on:click={nextStep} class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Siguiente</button>
      {/if}
      {#if currentStep === 3}
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Abrir Ticket</button>
      {/if}
    </div>

    {#if submissionStatus}
      <p class="mt-4 text-green-600 font-medium">{submissionStatus}</p>
    {/if}
    {#if submissionError}
      <p class="mt-4 text-red-600 font-medium">{submissionError}</p>
    {/if}
  </form>
</div>