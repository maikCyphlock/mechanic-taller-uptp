import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

// USER AUTHENTICATION TABLES
export const user = pgTable("user", {
					id: text('id').primaryKey(),
					name: text('name').notNull(),
 email: text('email').notNull().unique(),
 emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
 image: text('image'),
 createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
 updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
 role: text('role'),
 roleId: text('role_id').references(() => role.id, { onDelete: 'set null' }),
 banned: boolean('banned'),
 banReason: text('ban_reason'),
 banExpires: timestamp('ban_expires')
				});

export const session = pgTable("session", {
					id: text('id').primaryKey(),
					expiresAt: timestamp('expires_at').notNull(),
 token: text('token').notNull().unique(),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull(),
 ipAddress: text('ip_address'),
 userAgent: text('user_agent'),
 userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
 impersonatedBy: text('impersonated_by')
				});

export const account = pgTable("account", {
					id: text('id').primaryKey(),
					accountId: text('account_id').notNull(),
 providerId: text('provider_id').notNull(),
 userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
 accessToken: text('access_token'),
 refreshToken: text('refresh_token'),
 idToken: text('id_token'),
 accessTokenExpiresAt: timestamp('access_token_expires_at'),
 refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
 scope: text('scope'),
 password: text('password'),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull()
				});

export const verification = pgTable("verification", {
					id: text('id').primaryKey(),
					identifier: text('identifier').notNull(),
 value: text('value').notNull(),
 expiresAt: timestamp('expires_at').notNull(),
 createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
 updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
				});


// ROLE cod_role, role_name, role_description, user_id
export const role = pgTable("role", {
					id: text('id').primaryKey(),
					name: text('name').notNull(),
 description: text('description'),
 createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
 updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
				});

// client tables

export const client = pgTable("client", {
					id: text('id').primaryKey(),
					name: text('name').notNull(),
 email: text('email').notNull().unique(),
 phone: text('phone'),
 address: text('address'),
 createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
 updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
				});

// VEHICLE TYPES TABLES
export const vehicleType = pgTable("vehicle_type", {
					id: text('id').primaryKey(),
					name: text('name').notNull(),
 description: text('description'),
 createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
 updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
				});






// TICKET SYSTEM TABLES

export const ticket = pgTable("ticket", {
					id: text('id').primaryKey(),
					title: text('title').notNull(),
 description: text('description'),
 status: text('status').$defaultFn(() => 'open').notNull(),
 priority: text('priority').$defaultFn(() => 'low').notNull(),
 createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
 updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
 clientId: text('client_id').references(() => client.id, { onDelete: 'set null' }),
 userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
 // Campos adicionales para el formulario de ticket
 name: text('name'),
 phone: text('phone'),
 vehicleType: text('vehicle_type'),
 vehicleDetails: text('vehicle_details'), // Puede ser un JSON.stringify
 issueType: text('issue_type'),
 issueDescription: text('issue_description'),
 submissionDate: timestamp('submission_date'),
				});
