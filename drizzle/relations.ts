import { relations } from "drizzle-orm/relations";
import { user, session, account, client, ticket, role } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({one, many}) => ({
	sessions: many(session),
	accounts: many(account),
	tickets: many(ticket),
	role: one(role, {
		fields: [user.roleId],
		references: [role.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const ticketRelations = relations(ticket, ({one}) => ({
	client: one(client, {
		fields: [ticket.clientId],
		references: [client.id]
	}),
	user: one(user, {
		fields: [ticket.userId],
		references: [user.id]
	}),
}));

export const clientRelations = relations(client, ({many}) => ({
	tickets: many(ticket),
}));

export const roleRelations = relations(role, ({many}) => ({
	users: many(user),
}));