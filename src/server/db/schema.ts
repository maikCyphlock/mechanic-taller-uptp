import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Note: SQLite doesn't support enums, so we use text with type constraints
export const statusTicketValues = ["ABIERTO", "EN_PROCESO", "CERRADO", "CANCELADO", "APROBADO"] as const;
export const prioridadTicketValues = ["BAJA", "MEDIA", "ALTA"] as const;
export const roleValues = ["user", "admin", "CLIENTE", "GERENTE", "OTRO", "SUPERADMIN"] as const;
export const tipoVehiculoValues = ["automovil", "camioneta", "camion", "motocicleta", "autobus", "otro"] as const;
export const paymentStatusValues = ["PENDIENTE", "COMPLETADO", "FALLIDO"] as const;
export const paymentMethodValues = ["EFECTIVO", "TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA_BANCARIA", "PAGO_MOVIL", "OTRO"] as const;

// NextAuth tables
export const accounts = sqliteTable("account", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const users = sqliteTable("user", {
  id: text('id').primaryKey(),
  cedula: text('cedula').unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text('image'),
  phone: text('telefono'),
  role: text('role', { enum: roleValues }).notNull().default('user'),
  roleId: text('role_id').references(() => role.id, { onDelete: 'set null' }),
  banned: integer('banned', { mode: 'boolean' }),
  banReason: text('ban_reason'),
  banExpires: integer('ban_expires', { mode: 'timestamp' }),
  delete_at: integer('delete_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
});

export const verificationTokens = sqliteTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const client = sqliteTable("client", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  cedula: text('cedula').unique(),
  delete_at: integer('delete_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
});

export const role = sqliteTable("role", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
});

export const vehicleIssue = sqliteTable("vehicle_issue", {
  id: text('id').primaryKey(),
  description: text('description'),
  severity: integer('severity').notNull(),
  status: text('status').notNull(),
  issueDescription: text('issue_descrption'),
  issueType: text('issueType'),
  delete_at: integer('delete_at', { mode: 'timestamp' }),
  vehicleId: text('vehicle_id').notNull().references(() => vehicle.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
});

export const vehicle = sqliteTable("vehicle", {
  id: text('id').primaryKey(),
  plate: text('plate').unique(),
  make: text('make'),
  model: text('model'),
  year: integer('year'),
  color: text('color'),
  type: text('type', { enum: tipoVehiculoValues }).notNull().default('otro'),
  delete_at: integer('delete_at', { mode: 'timestamp' }),
  ownerId: text('owner_id').references(() => client.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
});

export const ticket = sqliteTable("ticket", {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull().references(() => vehicle.id, { onDelete: 'cascade' }),
  short_description: text('short_description'),
  description: text('description'),
  closedAt: integer('closed_at', { mode: 'timestamp' }),
  status: text('status', { enum: statusTicketValues }).notNull().default('ABIERTO'),
  priority: text('priority', { enum: prioridadTicketValues }).notNull().default('MEDIA'),
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  estimatedCost: text('estimated_cost'), // Using text for decimal values in SQLite
  clientId: text('client_id').references(() => client.id, { onDelete: 'set null' }),
  approved_by: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approved_at: integer('approved_at', { mode: 'timestamp' }),
  payment_method: text('payment_method', { enum: paymentMethodValues }),
  payment_status: text('payment_status'),
  payment_reference: text('payment_reference'),
  payment_currency: text('payment_currency'),
  payment_amount: text('payment_amount'), // Using text for decimal values in SQLite
  payment_date: integer('payment_date', { mode: 'timestamp' }),
  total_amount: text('total_amount'), // Using text for decimal values in SQLite
  time_spent: text('time_spent'), // Using text for decimal values in SQLite
  work_notes: text('work_notes'),
  tool_used: text('tool_used'),
  delete_at: integer('delete_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  assignedTickets: many(ticket, { relationName: "assignedTo" }),
  approvedTickets: many(ticket, { relationName: "approvedBy" }),
  role: one(role, {
    fields: [users.roleId],
    references: [role.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const clientRelations = relations(client, ({ many }) => ({
  vehicles: many(vehicle),
  tickets: many(ticket),
}));

export const vehicleRelations = relations(vehicle, ({ one, many }) => ({
  owner: one(client, {
    fields: [vehicle.ownerId],
    references: [client.id],
  }),
  tickets: many(ticket),
  issues: many(vehicleIssue),
}));

export const ticketRelations = relations(ticket, ({ one }) => ({
  client: one(client, {
    fields: [ticket.clientId],
    references: [client.id],
  }),
  vehicle: one(vehicle, {
    fields: [ticket.vehicleId],
    references: [vehicle.id],
  }),
  assignedUser: one(users, {
    fields: [ticket.assignedTo],
    references: [users.id],
    relationName: "assignedTo",
  }),
  approvedBy: one(users, {
    fields: [ticket.approved_by],
    references: [users.id],
    relationName: "approvedBy",
  }),
}));

export const vehicleIssueRelations = relations(vehicleIssue, ({ one }) => ({
  vehicle: one(vehicle, {
    fields: [vehicleIssue.vehicleId],
    references: [vehicle.id],
  }),
}));

export const roleRelations = relations(role, ({ many }) => ({
  users: many(users),
}));