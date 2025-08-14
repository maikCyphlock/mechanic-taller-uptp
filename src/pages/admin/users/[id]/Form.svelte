<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	export let id: string;

	let user = {
		id,
		cedula: '',
		name: '',
		email: '',
		password: '', // For password change
		emailVerified: false,
		image: '',
		phone: '',
		role: 'user',
		banned: false,
		banReason: '',
		banExpires: null as string | null
	};

	let message = '';
	let messageType: 'success' | 'error' = 'success';
	let loading = true;
	let submitting = false;

	function formatDateForInput(dateString: string | null) {
		if (!dateString) return null;
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return null;
		// Format to "yyyy-MM-ddThh:mm"
		const pad = (num: number) => num.toString().padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
			date.getHours()
		)}:${pad(date.getMinutes())}`;
	}

	onMount(async () => {
		try {
			const res = await fetch(`/api/user/${id}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!res.ok) {
				throw new Error('Error al obtener los datos del usuario');
			}

			const userData = await res.json();
			user = {
				...user,
				...userData,
				banExpires: formatDateForInput(userData.banExpires)
			};
		} catch (err) {
			showToast('No se pudo cargar la información del usuario.', 'error');
		} finally {
			loading = false;
		}
	});

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();
		submitting = true;

		try {
			const payload = { ...user };
			if (payload.password === '') {
				delete (payload as any).password;
			}

			const res = await fetch(`/api/user/${user.id}`, {
				method: 'PUT',
				body: JSON.stringify(payload),
				headers: { 'Content-Type': 'application/json' }
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Error al actualizar el usuario');
			}
			if (user.password) {
				user.password = '';
			}
			showToast('¡Usuario actualizado correctamente!');
		} catch (err: any) {
			showToast(err.message || 'Error al actualizar el usuario.', 'error');
		} finally {
			submitting = false;
		}
	};

	function showToast(msg: string, type: 'success' | 'error' = 'success') {
		message = msg;
		messageType = type;
		setTimeout(() => {
			message = '';
		}, 3000);
	}
</script>

{#if message}
	<div class="toast {messageType}" transition:fade>
		{message}
	</div>
{/if}

<div class="page-container">
	<h1 class="page-title">Editar Usuario</h1>
	{#if loading}
		<div class="card">
			<div class="card-body">
				<div class="skeleton-line title"></div>
				<div class="skeleton-line"></div>
				<div class="skeleton-line"></div>
				<div class="skeleton-line short"></div>
			</div>
		</div>
	{:else}
		<form on:submit={handleSubmit} class="card">
			<div class="card-body">
				<div class="grid-layout">
					<!-- Personal Information -->
					<div class="form-group">
						<label for="name">Nombre completo</label>
						<input id="name" type="text" bind:value={user.name} required />
					</div>
					<div class="form-group">
						<label for="email">Correo electrónico</label>
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
					<div class="form-group">
						<label for="role">Rol</label>
						<select id="role" bind:value={user.role}>
							<option value="user">Mecánico</option>
							<option value="admin">Administrador</option>
							<option value="SUPERADMIN">Super Admin</option>
							<option value="CLIENTE">Cliente</option>
						</select>
					</div>
					<div class="form-group">
						<label for="password">Nueva Contraseña</label>
						<input
							id="password"
							type="password"
							bind:value={user.password}
							placeholder="Dejar en blanco para no cambiar"
						/>
					</div>
					<div class="form-group full-width">
						<label for="image">URL de la Imagen</label>
						<input id="image" type="text" bind:value={user.image} />
					</div>
					<div class="form-group checkbox-group">
						<input id="emailVerified" type="checkbox" bind:checked={user.emailVerified} />
						<label for="emailVerified">Email Verificado</label>
					</div>
				</div>

				<!-- Ban Information -->
				<h2 class="section-title">Control de Acceso</h2>
				<div class="grid-layout">
					<div class="form-group checkbox-group">
						<input id="banned" type="checkbox" bind:checked={user.banned} />
						<label for="banned">Usuario Baneado</label>
					</div>
					<div class="form-group">
						<label for="banReason">Razón del Ban</label>
						<input id="banReason" type="text" bind:value={user.banReason} disabled={!user.banned} />
					</div>
					<div class="form-group">
						<label for="banExpires">Expiración del Ban</label>
						<input
							id="banExpires"
							type="datetime-local"
							bind:value={user.banExpires}
							disabled={!user.banned}
						/>
					</div>
				</div>
			</div>
			<div class="card-footer">
				<button type="submit" class="btn btn-primary" disabled={submitting}>
					{#if submitting}
						<div class="spinner"></div>
						Guardando...
					{:else}
						Guardar Cambios
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.page-container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 0 1rem;
		font-family: 'Inter', sans-serif;
	}
	.page-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 1.5rem;
	}
	.card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}
	.card-body {
		padding: 1.5rem 2rem;
	}
	.card-footer {
		background-color: #f9fafb;
		padding: 1rem 2rem;
		text-align: right;
		border-top: 1px solid #e5e7eb;
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
	.form-group select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s, box-shadow 0.2s;
	}
	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
	}
	.checkbox-group {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}
	.checkbox-group input {
		width: auto;
		height: 1rem;
		width: 1rem;
	}
	.checkbox-group label {
		margin-bottom: 0;
	}
	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin-top: 2rem;
		margin-bottom: 1.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
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
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	.toast.success {
		background-color: #2563eb;
	}
	.toast.error {
		background-color: #dc2626;
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

	.skeleton-line {
		height: 1rem;
		background-color: #e5e7eb;
		border-radius: 4px;
		margin-bottom: 1rem;
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
	.skeleton-line.title {
		width: 40%;
		height: 1.5rem;
		margin-bottom: 1.5rem;
	}
	.skeleton-line.short {
		width: 60%;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>