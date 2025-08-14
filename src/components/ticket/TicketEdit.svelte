<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	// @ts-ignore
	import { toast } from 'svelte-sonner';

	export let idTicket: string;

	let ticket = {
		vehicleId: '',
		short_description: '',
		description: '',
		status: 'ABIERTO',
		priority: 'MEDIA',
		assignedTo: '',
		estimatedCost: 0,
		clientId: '',
		payment_method: '',
		total_amount: 0,
		time_spent: 0,
		work_notes: '',
		tool_used: ''
	};
	let userName = '';

	let loading = true;
	let submitting = false;

	const dispatch = createEventDispatcher();

	const paymentMethods = [
		{ value: 'EFECTIVO', label: 'Efectivo', icon: '💵' },
		{ value: 'PAGO_MOVIL', label: 'Pago Móvil', icon: '📱' },
		{ value: 'TARJETA_CREDITO', label: 'Tarjeta Crédito', icon: '💳' },
		{ value: 'TARJETA_DEBITO', label: 'Tarjeta Débito', icon: '🪪' },
		{ value: 'TRANSFERENCIA_BANCARIA', label: 'Transferencia', icon: '🏦' }
	];

	onMount(async () => {
		try {
			const response = await fetch(`/api/ticket/${idTicket}`);
			if (!response.ok) throw new Error('Failed to fetch ticket data');
			const data = await response.json();

			if (data) {
				const ticketData = data.ticket;
				userName = data.user || 'No asignado';
				ticket = { ...ticket, ...ticketData };
			} else {
				throw new Error('Ticket not found');
			}
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : 'Ticket no encontrado');
		} finally {
			loading = false;
		}
	});

	const handleSubmit = async () => {
		submitting = true;
		try {
			const response = await fetch(`/api/ticket/${idTicket}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(ticket)
			});

			if (response.ok) {
				toast.success('Ticket actualizado con éxito');
				dispatch('updated');
			} else {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Error al actualizar el ticket');
			}
		} catch (error: unknown) {
			toast.error(error instanceof Error ? error.message : 'Error al actualizar el ticket');
		} finally {
			submitting = false;
		}
	};
</script>

<div class="form-container">
	{#if loading}
		<div class="skeleton-wrapper">
			<div class="skeleton-line title"></div>
			<div class="skeleton-grid">
				<div class="skeleton-line"></div>
				<div class="skeleton-line"></div>
				<div class="skeleton-line long"></div>
				<div class="skeleton-line"></div>
				<div class="skeleton-line"></div>
			</div>
		</div>
	{:else}
		<form on:submit|preventDefault={handleSubmit} class="ticket-form">
			<h2 class="form-title">Editar Ticket</h2>

			<section>
				<h3 class="section-title">Detalles del Ticket</h3>
				<div class="grid-layout">
					<div class="form-group">
						<label for="short_description">Descripción Corta</label>
						<input id="short_description" type="text" bind:value={ticket.short_description} required />
					</div>
					<div class="form-group full-width">
						<label for="description">Descripción Detallada</label>
						<textarea id="description" bind:value={ticket.description} rows="4"></textarea>
					</div>
					<div class="form-group">
						<label for="status">Estado</label>
						<select id="status" bind:value={ticket.status}>
							<option value="ABIERTO">Abierto</option>
							<option value="EN_PROCESO">En Proceso</option>
							<option value="CERRADO">Cerrado</option>
							<option value="CANCELADO">Cancelado</option>
						</select>
					</div>
					<div class="form-group">
						<label for="priority">Prioridad</label>
						<select id="priority" bind:value={ticket.priority}>
							<option value="BAJA">Baja</option>
							<option value="MEDIA">Media</option>
							<option value="ALTA">Alta</option>
						</select>
					</div>
				</div>
			</section>

			<section>
				<h3 class="section-title">Costos y Asignación</h3>
				<div class="grid-layout">
					<div class="form-group">
						<label for="assignedTo">Asignado A</label>
						<input id="assignedTo" type="text" readonly bind:value={userName} />
					</div>
					<div class="form-group">
						<label for="estimatedCost">Costo Estimado ($)</label>
						<input
							id="estimatedCost"
							type="number"
							step="0.01"
							bind:value={ticket.estimatedCost}
						/>
					</div>
				</div>
			</section>

			<section>
				<h3 class="section-title">Registro de Trabajo</h3>
				<div class="grid-layout">
					<div class="form-group">
						<label for="time_spent">Tiempo Invertido (minutos)</label>
						<input id="time_spent" type="number" bind:value={ticket.time_spent} />
					</div>
					<div class="form-group">
						<label for="tool_used">Herramientas Utilizadas</label>
						<input id="tool_used" type="text" bind:value={ticket.tool_used} />
					</div>
					<div class="form-group full-width">
						<label for="work_notes">Notas de Trabajo</label>
						<textarea id="work_notes" bind:value={ticket.work_notes} rows="4"></textarea>
					</div>
				</div>
			</section>

			<section>
				<h3 class="section-title">Información de Pago</h3>
				<div class="grid-layout">
					<div class="form-group">
						<label for="payment_method">Método de Pago</label>
						<select id="payment_method" bind:value={ticket.payment_method}>
							<option value="" disabled>Seleccione un método</option>
							{#each paymentMethods as method}
								<option value={method.value}>{method.icon} {method.label}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label for="total_amount">Monto Total ($)</label>
						<input id="total_amount" type="number" step="0.01" bind:value={ticket.total_amount} />
					</div>
					<div class="form-group">
						<label for="clientId">ID del Cliente</label>
						<input id="clientId" type="text" readonly bind:value={ticket.clientId} />
					</div>
					<div class="form-group">
						<label for="vehicleId">ID del Vehículo</label>
						<input id="vehicleId" type="text" readonly bind:value={ticket.vehicleId} />
					</div>
				</div>
			</section>

			<div class="form-footer">
				<button type="submit" class="btn btn-primary" disabled={submitting}>
					{#if submitting}
						<div class="spinner"></div>
						Actualizando...
					{:else}
						Guardar Cambios
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.form-container {
		max-width: 800px;
		margin: 2rem auto;
		font-family: 'Inter', sans-serif;
	}
	.ticket-form {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}
	.form-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid #e5e7eb;
	}
	section {
		padding: 1rem 2rem;
	}
	.section-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 1.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
	}
	.grid-layout {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}
	.form-group {
		display: flex;
		flex-direction: column;
	}
	.form-group.full-width {
		grid-column: 1 / -1;
	}
	.form-group label {
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: #374151;
		font-size: 0.875rem;
	}
	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
	}
	input:read-only {
		background-color: #f3f4f6;
		color: #6b7280;
		cursor: not-allowed;
	}
	.form-footer {
		background-color: #f9fafb;
		padding: 1rem 2rem;
		text-align: right;
		border-top: 1px solid #e5e7eb;
		margin-top: 1rem;
	}
	.btn {
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
	.btn-primary {
		background-color: #2563eb;
		color: white;
	}
	.btn-primary:hover {
		background-color: #1d4ed8;
	}
	.btn-primary:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}
	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.skeleton-wrapper {
		background: white;
		border-radius: 12px;
		padding: 2rem;
	}
	.skeleton-line {
		height: 1rem;
		background-color: #e5e7eb;
		border-radius: 4px;
		margin-bottom: 1rem;
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
	.skeleton-line.title {
		width: 40%;
		height: 1.75rem;
		margin-bottom: 2rem;
	}
	.skeleton-line.long {
		width: 100%;
		grid-column: 1 / -1;
	}
	.skeleton-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}
	@keyframes pulse {
		50% {
			opacity: 0.5;
		}
	}
</style>