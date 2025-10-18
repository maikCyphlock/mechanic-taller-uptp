import { pgTable, text, timestamp, boolean, integer, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const statusTicketEnum = pgEnum("Status_Ticket", ["ABIERTO", "EN_PROCESO", "CERRADO", "CANCELADO", "APROBADO"]);
export const prioridadTicketEnum = pgEnum("Prioridad_Ticket", ["BAJA", "MEDIA", "ALTA"]);
export const roleEnum = pgEnum("Role", ["user", "admin", "CLIENTE", "GERENTE", "OTRO", "SUPERADMIN"]);
export const tipoVehiculoEnum = pgEnum("Tipo_Vehiculo", ["automovil", "camioneta", "camion", "motocicleta", "autobus", "otro"]);
export const paymentStatusEnum = pgEnum("Payment_Status", ["PENDIENTE", "COMPLETADO", "FALLIDO"]);
export const paymentMethodEnum = pgEnum("Payment_Method", ["EFECTIVO", "TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA_BANCARIA", "PAGO_MOVIL", "OTRO"]);

const TIMESTAMPS = {
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull().$onUpdateFn(() => new Date())
};

// NextAuth tables
export const accounts = pgTable("account", {
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

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const users = pgTable("user", {
  id: text('id').primaryKey(),
  cedula: text('cedula').unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  password: text('password'), // Added password field for credentials provider
  image: text('image'),
  phone: text('telefono'),
  role: roleEnum('role').notNull().default('user'),
  roleId: text('role_id').references(() => role.id, { onDelete: 'set null' }),
  banned: boolean('banned').default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  delete_at: timestamp('delete_at'),
  ...TIMESTAMPS
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const client = pgTable("client", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  cedula: text('cedula').unique(),
  delete_at: timestamp('delete_at'),
  ...TIMESTAMPS
});

export const role = pgTable("role", {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  ...TIMESTAMPS
});

export const vehicleIssue = pgTable("vehicle_issue", {
  id: text('id').primaryKey(),
  description: text('description'),
  severity: integer('severity').notNull(),
  status: text('status').notNull(),
  issueDescription: text('issue_descrption'),
  issueType: text('issueType'),
  delete_at: timestamp('delete_at'),
  vehicleId: text('vehicle_id').notNull().references(() => vehicle.id, { onDelete: 'set null' }),
  ...TIMESTAMPS
});

export const vehicle = pgTable("vehicle", {
  id: text('id').primaryKey(),
  plate: text('plate').unique(),
  make: text('make'),
  model: text('model'),
  year: integer('year'),
  color: text('color'),
  type: tipoVehiculoEnum('type').notNull().default('otro'),
  delete_at: timestamp('delete_at'),
  ownerId: text('owner_id').references(() => client.id, { onDelete: 'cascade' }),
  ...TIMESTAMPS
});

export const ticket = pgTable("ticket", {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').notNull().references(() => vehicle.id, { onDelete: 'cascade' }),
  short_description: text('short_description'),
  description: text('description'),
  closedAt: timestamp('closed_at'),
  status: statusTicketEnum('status').notNull().default('ABIERTO'),
  priority: prioridadTicketEnum('priority').notNull().default('MEDIA'),
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  estimatedCost: decimal('estimated_cost'),
  clientId: text('client_id').references(() => client.id, { onDelete: 'set null' }),
  approved_by: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approved_at: timestamp('approved_at'),
  payment_method: paymentMethodEnum('payment_method'),
  payment_status: text('payment_status'),
  payment_reference: text('payment_reference'),
  payment_currency: text('payment_currency'),
  payment_amount: decimal('payment_amount'),
  payment_date: timestamp('payment_date'),
  total_amount: decimal('total_amount'),
  time_spent: decimal('time_spent'),
  work_notes: text('work_notes'),
  tool_used: text('tool_used'),
  delete_at: timestamp('delete_at'),
  ...TIMESTAMPS
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