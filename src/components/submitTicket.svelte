<script>
  // --- State Variables ---
  // Form fields
  let name = '';
  let phone = '';

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
    { value: 'Automóvil', icon: '🚗' },
    { value: 'Camioneta', icon: '🚚' },
    { value: 'Camión', icon: '🚛' },
    { value: 'Motocicleta', icon: '🏍️' },
    { value: 'Otro', icon: '❓' }
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
      const response = await fetch(`${apiHost}/api/ticket/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
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

<div class="ticket-container">
  <h2>Abrir Ticket Rápido</h2>
  <p class="subtitle">Paso {currentStep} de 3</p>

  <form on:submit|preventDefault={submitTicket}>

    {#if currentStep === 1}
      <div class="form-section">
        <h3>Datos del Cliente</h3>
        <div class="form-group">
          <label for="name">Nombre Completo <span class="required">*</span></label>
          <input type="text" id="name" bind:value={name} placeholder="Ej: Juan Pérez" required aria-required="true" />
        </div>

        <div class="form-group">
          <label for="phone">Teléfono <span class="required">*</span></label>
          <input type="tel" id="phone" bind:value={phone} placeholder="Ej: 04121234567" required aria-required="true" />
        </div>
      </div>
    {/if}

    {#if currentStep === 2}
      <div class="form-section">
        <h3>Tipo de Vehículo</h3>
        <div class="form-group">
          <label>Seleccione el tipo de vehículo <span class="required">*</span></label>
          <div class="vehicle-type-selector" role="radiogroup" aria-required="true" aria-label="Tipo de Vehículo">
            {#each vehicleOptions as option}
              <label class="vehicle-option">
                <input
                  type="radio"
                  name="vehicleType"
                  value={option.value}
                  bind:group={vehicleType}
                  aria-label={option.value}
                />
                <div class="icon">{option.icon}</div>
                <div class="text">{option.value}</div>
              </label>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    {#if currentStep === 3}
      <div class="form-section">
        <h3>Datos del Problema</h3>
        <div class="form-group">
          <label for="issueType">Tipo de Problema <span class="required">*</span></label>
          <select id="issueType" bind:value={issueType} required aria-required="true">
            {#each commonIssues as issue}
              <option value={issue}>{issue || 'Seleccione...'}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="issueDescription">Descripción Detallada <span class="required">*</span></label>
          <textarea
            id="issueDescription"
            bind:value={issueDescription}
            placeholder="Describa el problema (sonidos, cuándo ocurre, etc.)"
            rows="4"
            required
            aria-required="true"
          ></textarea>
          <p class="hint">Este campo es clave para el diagnóstico inicial.</p>
        </div>
      </div>
    {/if}

    <div class="form-actions">
      {#if currentStep > 1 && currentStep < 4}
        <button type="button" on:click={prevStep} disabled={isLoading}>
          Atrás
        </button>
      {/if}

      {#if currentStep < 3}
        <button type="button" on:click={nextStep} disabled={isLoading}>
          Siguiente
        </button>
      {/if}

      {#if currentStep === 3}
        <button type="submit" disabled={isLoading}>
          {#if isLoading}
            Abriendo Ticket...
          {:else}
            <i class="icon">📋</i> Abrir Ticket
          {/if}
        </button>
      {/if}

       {#if submissionStatus}
        <div class="status status-success" aria-live="polite">
          {submissionStatus}
        </div>
      {/if}
      {#if submissionError}
        <div class="status status-error" aria-live="assertive">
          {submissionError}
        </div>
      {/if}
    </div>
  </form>
</div>

<style>
  /* Keep all previous styles (General, Form Structure, Icon Selector) */

  /* Add specific styles for multi-step layout if needed */

    /* Style for the step indicator */
    .subtitle {
        color: #7f8c8d;
        margin-top: 0;
        margin-bottom: 25px;
        font-size: 1.1em;
        text-align: center;
        font-weight: bold; /* Make step indicator bold */
    }

    /* Adjust form-actions layout for multiple buttons */
    .form-actions {
        display: flex; /* Use flexbox */
        justify-content: center; /* Center buttons horizontally */
        gap: 15px; /* Space between buttons */
        margin-top: 20px;
        flex-wrap: wrap; /* Allow buttons to wrap */
    }

    .form-actions button {
        /* Remove the text-align: center from the main .form-actions rule if it conflicts */
        /* Ensure button styles work with flexbox */
        flex-shrink: 0; /* Prevent buttons from shrinking too much */
    }

   /* Responsive adjustments */
   @media (max-width: 768px) {
       /* ... previous responsive styles ... */
       .form-actions {
           flex-direction: column; /* Stack buttons vertically on small screens */
           gap: 10px; /* Adjust gap */
       }
        .form-actions button {
            width: 100%; /* Full width buttons */
            justify-content: center;
        }
   }

   /* General styles remain (copy from previous code) */
    .ticket-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    h2 {
        color: #2c3e50;
        margin-bottom: 5px;
        text-align: center;
    }

    .form-section {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 15px 20px;
        margin-bottom: 20px;
        border: 1px solid #e0e0e0;
    }

    h3 {
        color: #3498db;
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 1.2em;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-section > .form-group:last-child {
            margin-bottom: 0;
    }
    .form-section > .form-group:only-child {
        margin-bottom: 0;
    }

    label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #333;
    }

    .required {
        color: #e74c3c;
        margin-left: 3px;
        font-weight: normal;
    }

    input[type="text"],
    input[type="tel"],
    select,
    textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1em;
        transition: border-color 0.3s, box-shadow 0.3s;
        box-sizing: border-box;
    }

    select {
        appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 10px center;
        background-size: 1em;
        padding-right: 30px;
        cursor: pointer;
    }

    input:focus,
    select:focus,
    textarea:focus {
        border-color: #3498db;
        outline: none;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    textarea {
        resize: vertical;
        min-height: 80px;
    }

    .hint {
        font-size: 0.85em;
        color: #7f8c8d;
        margin-top: 5px;
        font-style: italic;
    }


    button {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 12px 25px;
        font-size: 1.1em;
        border-radius: 4px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.3s, opacity 0.3s;
        font-weight: bold;
    }

    button:hover:not(:disabled) {
        background-color: #2980b9;
    }

    button:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
        opacity: 0.8;
    }

    .status {
        margin-top: 15px;
        padding: 10px;
        border-radius: 4px;
        text-align: center;
        font-weight: bold;
        word-break: break-word;
        /* Ensure status messages don't mess up flex layout */
        flex-basis: 100%;
    }

    .status-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .status-error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }


    /* --- Styles for Icon Vehicle Type Selector --- */
    .vehicle-type-selector {
        display: flex; /* Use flexbox to arrange options in a row */
        flex-wrap: wrap; /* Allow wrapping on smaller screens */
        gap: 10px; /* Space between options */
        margin-top: 5px; /* Space below the label */
    }

    .vehicle-option {
        display: flex; /* Flex inside label to stack icon and text */
        flex-direction: column; /* Stack icon and text vertically */
        align-items: center; /* Center items horizontally */
        justify-content: center;
        padding: 15px 10px; /* Padding inside each option */
        border: 1px solid #ccc;
        border-radius: 8px;
        cursor: pointer;
        transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
        min-width: 80px; /* Minimum width for each option */
        text-align: center;
        user-select: none; /* Prevent text selection on click */
        background-color: #fff; /* White background for options */
        flex: 1; /* Allow options to grow and shrink */
        box-sizing: border-box; /* Include padding/border in size */
    }

    /* Hide the actual radio button */
    .vehicle-option input[type="radio"] {
        position: absolute;
        opacity: 0;
        pointer-events: none;
        margin: 0;
        width: 0;
        height: 0;
    }

    .vehicle-option .icon {
        font-size: 2em;
        margin-bottom: 5px;
        line-height: 1;
    }

    .vehicle-option .text {
        font-size: 0.9em;
        color: #555;
        font-weight: normal;
    }

     /* Style for the entire option block when selected using :has() */
     .vehicle-option:has(input[type="radio"]:checked) {
        border-color: #3498db;
        background-color: #e8f4f8;
        box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
     }
     /* Style for inner elements when selected (fallback/complement) */
      .vehicle-option input[type="radio"]:checked + .icon {
         color: #3498db; /* Blue color for icon */
     }
      .vehicle-option input[type="radio"]:checked + .icon + .text {
         color: #3498db; /* Blue color for text */
         font-weight: bold;
     }

      /* Hover state */
      .vehicle-option:hover:has(input[type="radio"]:not(:checked)) {
           border-color: #a0c8e0; /* Lighter blue on hover for non-selected */
      }


   /* Responsive adjustments */
   @media (max-width: 768px) {
       .vehicle-type-selector {
           gap: 8px;
       }
       .vehicle-option {
          flex-basis: calc(50% - 5px);
          min-width: 120px;
          padding: 10px 5px;
       }

       .form-group {
           width: 100%;
           flex-basis: auto;
       }

       .ticket-container {
          padding: 15px;
       }

       .form-actions {
           flex-direction: column;
           gap: 10px;
       }
        .form-actions button {
            width: 100%;
            justify-content: center;
        }
   }

    @media (max-width: 480px) {
        .vehicle-type-selector {
            gap: 5px;
        }
        .vehicle-option {
            flex-basis: calc(50% - 2.5px);
            min-width: unset;
             padding: 10px 5px;
        }
         .vehicle-option .icon {
             font-size: 1.8em;
         }
          .vehicle-option .text {
             font-size: 0.85em;
          }
    }

</style> 