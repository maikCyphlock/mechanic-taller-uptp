import { pgTable, text, timestamp, boolean, integer, decimal,pgEnum } from "drizzle-orm/pg-core";

export const statusTicketEnum = pgEnum("Status_Ticket", ["ABIERTO", "EN_PROCESO", "CERRADO", "CANCELADO","APROBADO"]);
export const prioridadTicketEnum = pgEnum("Prioridad_Ticket", ["BAJA", "MEDIA", "ALTA"]);
export const roleEnum = pgEnum("Role", ["user", "admin", "CLIENTE", "GERENTE", "OTRO","SUPERADMIN"]);
export const tipoVehiculoEnum = pgEnum("Tipo_Vehiculo", ["automovil", "camioneta", "camion", "motocicleta",  "otro"]);
export const paymentStatusEnum = pgEnum("Payment_Status", ["PENDIENTE", "COMPLETADO", "FALLIDO"]);
export const paymentMethodEnum = pgEnum("Payment_Method", ["EFECTIVO", "TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA_BANCARIA","PAGO_MOVIL", "OTRO"]);
const TIMESTAMPS ={
    createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(), // Fecha de creación del cliente
    updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull().$onUpdateFn(() => new Date()) // Fecha de actualización del cliente
}

//-------------- START USER AUTHENTICATION TABLES DONOT MODIFY --------------

// user refers to mechanic
export const user = pgTable("user", {
    id: text('id').primaryKey(),
    cedula: text('cedula').unique(), // Añadido de Usuario
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
    image: text('image'),
    phone: text('telefono'), // Añadido de Usuario
    role: roleEnum('role').notNull().default('user'), // Cambiado a roleEnum
    roleId: text('role_id').references(() => role.id, { onDelete: 'set null' }), // Cambiado a text
    banned: boolean('banned'),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
    delete_at: timestamp('delete_at'), // Añadido de Usuario
    ...TIMESTAMPS
});

export const session = pgTable("session", {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
    ...TIMESTAMPS
});

export const account = pgTable("account", {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    ...TIMESTAMPS
});

export const verification = pgTable("verification", {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ...TIMESTAMPS
});
//-------------- END USER AUTHENTICATION TABLES DONOT MODIFY --------------

export const client = pgTable("client", {
    id: text('id').primaryKey(), // ID único del cliente
    name: text('name').notNull(), // Nombre del cliente
    email: text('email').unique(), // Correo electrónico del cliente
    phone: text('phone'), // Teléfono del cliente
    address: text('address'), // Dirección del cliente
    city: text('city'), // Ciudad del cliente
    state: text('state'), // Estado del cliente
    cedula: text('cedula').unique(),
    delete_at: timestamp('delete_at'), // Cédula del cliente
    ...TIMESTAMPS
})

// Tabla para los roles de los usuarios (ej. 'Técnico', 'Administrador')
export const role = pgTable("role", {
    id: text('id').primaryKey(), // ID único del rol
    name: text('name').notNull(), // Nombre del rol
    description: text('description'), // Descripción del rol
    ...TIMESTAMPS
});

export const vehicleIssue = pgTable("vehicle_issue", {
    id: text('id').primaryKey(), // ID único del problema del vehículo
    description: text('description'), // Descripción del problema
    severity: integer('severity').notNull(), // Severidad del problema (1-5)
    status: text('status').notNull(), // Estado del problema (abierto, cerrado, en proceso)
    issueDescription: text('issue_descrption'),
    issueType: text('issueType'),
    delete_at: timestamp('delete_at'),
    vehicleId: text('vehicle_id').notNull().references(() => vehicle.id, { onDelete: 'set null' }),
    ...TIMESTAMPS // ID del vehículo asociado al problema
})
// Tabla para los vehículos
export const vehicle = pgTable("vehicle", {
    id: text('id').primaryKey(), // ID único del vehículo
    plate: text('plate').unique(), // Placa del vehículo (clave primaria)
    make: text('make'), // Marca del vehículo
    model: text('model'), // Modelo del vehículo
    year: integer('year'), // Año de fabricación del vehículo
    color: text('color'), // Color del vehículo
    type: tipoVehiculoEnum('type').notNull().default('otro'),
    delete_at: timestamp('delete_at'),
    ownerId: text('owner_id').references(() => client.id, { onDelete: 'cascade' }),
    ...TIMESTAMPS // ID del usuario propietario del vehículo
});

// Tabla para los tickets de servicio
export const ticket = pgTable("ticket", {
    id: text('id').primaryKey(), // ID único del ticket (clave primaria)
    vehicleId: text('vehicle_id').notNull().references(() => vehicle.id, { onDelete: 'cascade' }),
    short_description: text('short_description'), // Placa del vehículo asociado al ticket
    description: text('description'), // Descripción del problema o servicio
    closedAt: timestamp('closed_at'), // Fecha y hora de cierre del ticket (puede ser nulo si está abierto)
    status: statusTicketEnum('status').notNull().default('ABIERTO'), // Estado actual del ticket (ABIERTO, EN_PROCESO, CERRADO, CANCELADO)
    priority: prioridadTicketEnum('priority').notNull().default('MEDIA'), // Prioridad del ticket (BAJA, MEDIA, ALTA)
    assignedTo: text('assigned_to').references(() => user.id, { onDelete: 'set null' }), // ID del técnico o empleado asignado al ticket
    estimatedCost: decimal('estimated_cost'), // Costo estimado del servicio (puede ser nulo)
    clientId: text('client_id').references(() => client.id, { onDelete: 'set null' }), // ID del cliente asociado al ticket
    approved_by:text('approved_by').references(() => user.id, { onDelete: 'set null' }), // ID del usuario que aprobó el ticket
    approved_at: timestamp('approved_at'), // Fecha y hora de aprobación del ticket
    payment_method: paymentMethodEnum('payment_method'), // Método de pago utilizado para el ticket
    payment_status: text('payment_status'), // Estado del pago (pendiente, completado, fallido)
    payment_reference: text('payment_reference'), // Referencia del pago (puede ser nulo)
    payment_currency: text('payment_currency'), // Moneda del pago (puede ser nulo)
    payment_amount: decimal('payment_amount'), // Monto del pago (puede ser nulo)
    payment_date: timestamp('payment_date'), // Fecha del pago (puede ser nulo)
    total_amount: decimal('total_amount'), // Monto total del ticket
    time_spent: decimal('time_spent'), // Tiempo total dedicado al ticket en minutos
    work_notes : text('work_notes'), // Notas de trabajo realizadas en el ticket
    tool_used: text('tool_used'),
    delete_at: timestamp('delete_at'), // Herramientas utilizadas en el ticket
    ...TIMESTAMPS
});
