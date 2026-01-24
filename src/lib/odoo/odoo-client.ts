import type { OdooCredentials, OdooResponse, SyncResult } from './sync-types';
import { getOdooCredentials, getSyncConfig, ODOO_API_ROUTES } from './odoo.config';

/**
 * Cliente HTTP para comunicarse con la API de Odoo
 */
export class OdooClient {
    private credentials: OdooCredentials;
    private sessionId?: string;
    private config = getSyncConfig();

    constructor(credentials?: OdooCredentials) {
        this.credentials = credentials ?? getOdooCredentials();
    }

    /**
     * Health check: verificar si Odoo está disponible
     */
    async isAvailable(): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

            const response = await fetch(`${this.credentials.url}/web/database/selector`, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.warn('[OdooClient] Odoo no está disponible:', error);
            return false;
        }
    }

    /**
     * Autenticar en Odoo (obtener cookie de sesión)
     * Nota: Odoo usa auth='user' que requiere sesión web
     */
    private async authenticate(): Promise<void> {
        try {
            // Odoo requiere autenticación via sesión web
            // Los endpoints del controlador usan auth='user' que verifica la sesión
            const response = await fetch(`${this.credentials.url}/web/session/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    params: {
                        db: this.credentials.db,
                        login: this.credentials.username,
                        password: this.credentials.password,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(`Authentication error: ${data.error.message || 'Unknown error'}`);
            }

            // Guardar session_id de las cookies
            const cookies = response.headers.get('set-cookie');
            if (cookies) {
                const sessionMatch = cookies.match(/session_id=([^;]+)/);
                if (sessionMatch) {
                    this.sessionId = sessionMatch[1];
                }
            }

            console.log('[OdooClient] Autenticación exitosa');
        } catch (error) {
            console.error('[OdooClient] Error en autenticación:', error);
            throw error;
        }
    }

    /**
     * Hacer request HTTP a Odoo con retry logic
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<OdooResponse<T>> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
            try {
                // Autenticar si no tenemos sesión
                if (!this.sessionId) {
                    await this.authenticate();
                }

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

                const response = await fetch(`${this.credentials.url}${endpoint}`, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        Cookie: this.sessionId ? `session_id=${this.sessionId}` : '',
                        ...options.headers,
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    // Si es 401/403, reintentar autenticación
                    if (response.status === 401 || response.status === 403) {
                        this.sessionId = undefined;
                        continue;
                    }

                    // Intentar leer el cuerpo del error si existe
                    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        if (errorData && errorData.message) {
                            errorMessage += ` - ${errorData.message}`;
                        } else if (errorData && errorData.error) {
                            errorMessage += ` - ${JSON.stringify(errorData.error)}`;
                        }
                    } catch (e) {
                        // Ignorar si no es JSON válido
                    }

                    throw new Error(errorMessage);
                }

                const data = await response.json();

                // Debug logging para ver qué devuelve Odoo
                console.log('[OdooClient] Response from', endpoint, ':', JSON.stringify(data, null, 2));

                // Si la respuesta no tiene el formato esperado, intentar adaptarla
                if (data && typeof data === 'object') {
                    // Si es un array directo, envolverlo en el formato esperado
                    if (Array.isArray(data)) {
                        console.log('[OdooClient] Response is array, wrapping in expected format');
                        return { status: 'success', data: data } as OdooResponse<T>;
                    }
                    // Si tiene una propiedad 'result' (formato JSON-RPC de Odoo)
                    if ('result' in data) {
                        console.log('[OdooClient] Response has result property (JSON-RPC format)');
                        return { status: 'success', data: data.result } as OdooResponse<T>;
                    }
                    // Si tiene una propiedad 'error' (error de Odoo)
                    if ('error' in data && data.error) {
                        console.error('[OdooClient] Odoo returned error:', data.error);
                        return {
                            status: 'error',
                            error: typeof data.error === 'string'
                                ? data.error
                                : data.error.message || JSON.stringify(data.error)
                        } as OdooResponse<T>;
                    }
                }

                return data as OdooResponse<T>;
            } catch (error) {
                console.warn(`[OdooClient] Intento ${attempt + 1}/${this.config.retryAttempts} falló:`, error);
                lastError = error as Error;

                // Esperar antes de reintentar (exponential backoff)
                if (attempt < this.config.retryAttempts - 1) {
                    await this.sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }

        return {
            status: 'error',
            error: lastError?.message || 'Unknown error',
        };
    }

    /**
     * GET: Obtener recursos de Odoo
     */
    async get<T>(endpoint: string): Promise<OdooResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    /**
     * POST: Crear recurso en Odoo
     */
    async post<T>(endpoint: string, data: unknown): Promise<OdooResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT: Actualizar recurso en Odoo
     */
    async put<T>(endpoint: string, data: unknown): Promise<OdooResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE: Eliminar recurso en Odoo
     */
    async delete<T>(endpoint: string): Promise<OdooResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    /**
     * Helper: dormir por ms milisegundos
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * CRUD Helpers para endpoints específicos
     */

    // Inventario
    async getInventory() {
        return this.get<unknown[]>(ODOO_API_ROUTES.inventory);
    }

    async createInventoryItem(data: unknown) {
        return this.post(ODOO_API_ROUTES.inventory, data);
    }

    async updateInventoryItem(id: number, data: unknown) {
        return this.put(`${ODOO_API_ROUTES.inventory}/${id}`, data);
    }

    async deleteInventoryItem(id: number) {
        return this.delete(`${ODOO_API_ROUTES.inventory}/${id}`);
    }

    // Mantenimiento
    async getMaintenance() {
        return this.get<unknown[]>(ODOO_API_ROUTES.maintenance);
    }

    async createMaintenance(data: unknown) {
        return this.post(ODOO_API_ROUTES.maintenance, data);
    }

    async updateMaintenance(id: number, data: unknown) {
        return this.put(`${ODOO_API_ROUTES.maintenance}/${id}`, data);
    }

    async deleteMaintenance(id: number) {
        return this.delete(`${ODOO_API_ROUTES.maintenance}/${id}`);
    }

    // Vehículos
    async getVehicles() {
        return this.get<unknown[]>(ODOO_API_ROUTES.vehicle);
    }

    async createVehicle(data: unknown) {
        return this.post(ODOO_API_ROUTES.vehicle, data);
    }

    async updateVehicle(id: number, data: unknown) {
        return this.put(`${ODOO_API_ROUTES.vehicle}/${id}`, data);
    }

    async deleteVehicle(id: number) {
        return this.delete(`${ODOO_API_ROUTES.vehicle}/${id}`);
    }

    // Citas
    async getAppointments() {
        return this.get<unknown[]>(ODOO_API_ROUTES.appointment);
    }

    async createAppointment(data: unknown) {
        return this.post(ODOO_API_ROUTES.appointment, data);
    }

    async updateAppointment(id: number, data: unknown) {
        return this.put(`${ODOO_API_ROUTES.appointment}/${id}`, data);
    }

    async deleteAppointment(id: number) {
        return this.delete(`${ODOO_API_ROUTES.appointment}/${id}`);
    }
}

/**
 * Singleton instance del cliente Odoo
 */
let odooClientInstance: OdooClient | null = null;

export function getOdooClient(): OdooClient {
    if (!odooClientInstance) {
        odooClientInstance = new OdooClient();
    }
    return odooClientInstance;
}
