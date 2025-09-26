CREATE TYPE "public"."Payment_Method" AS ENUM('EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA_BANCARIA', 'PAGO_MOVIL', 'OTRO');--> statement-breakpoint
CREATE TYPE "public"."Payment_Status" AS ENUM('PENDIENTE', 'COMPLETADO', 'FALLIDO');--> statement-breakpoint
CREATE TYPE "public"."Prioridad_Ticket" AS ENUM('BAJA', 'MEDIA', 'ALTA');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('user', 'admin', 'CLIENTE', 'GERENTE', 'OTRO', 'SUPERADMIN');--> statement-breakpoint
CREATE TYPE "public"."Status_Ticket" AS ENUM('ABIERTO', 'EN_PROCESO', 'CERRADO', 'CANCELADO', 'APROBADO');--> statement-breakpoint
CREATE TYPE "public"."Tipo_Vehiculo" AS ENUM('automovil', 'camioneta', 'camion', 'motocicleta', 'autobus', 'otro');--> statement-breakpoint
CREATE TABLE "client" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"cedula" text,
	"delete_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "client_email_unique" UNIQUE("email"),
	CONSTRAINT "client_cedula_unique" UNIQUE("cedula")
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"short_description" text,
	"description" text,
	"closed_at" timestamp,
	"status" "Status_Ticket" DEFAULT 'ABIERTO' NOT NULL,
	"priority" "Prioridad_Ticket" DEFAULT 'MEDIA' NOT NULL,
	"assigned_to" text,
	"estimated_cost" numeric,
	"client_id" text,
	"approved_by" text,
	"approved_at" timestamp,
	"payment_method" "Payment_Method",
	"payment_status" text,
	"payment_reference" text,
	"payment_currency" text,
	"payment_amount" numeric,
	"payment_date" timestamp,
	"total_amount" numeric,
	"time_spent" numeric,
	"work_notes" text,
	"tool_used" text,
	"delete_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle" (
	"id" text PRIMARY KEY NOT NULL,
	"plate" text,
	"make" text,
	"model" text,
	"year" integer,
	"color" text,
	"type" "Tipo_Vehiculo" DEFAULT 'otro' NOT NULL,
	"delete_at" timestamp,
	"owner_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "vehicle_plate_unique" UNIQUE("plate")
);
--> statement-breakpoint
CREATE TABLE "vehicle_issue" (
	"id" text PRIMARY KEY NOT NULL,
	"description" text,
	"severity" integer NOT NULL,
	"status" text NOT NULL,
	"issue_descrption" text,
	"issueType" text,
	"delete_at" timestamp,
	"vehicle_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Cargo" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Cliente" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Condicion_Pago" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Cotizacion" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Detalle_Cotizacion" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Detalle_Ticket" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Marca" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Modelo" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Nota_Entrega" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Repuesto" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Ticket" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Tipo_Servicio" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Tipo_Vehiculo" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Usuario" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "Vehiculo" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "Cargo" CASCADE;--> statement-breakpoint
DROP TABLE "Cliente" CASCADE;--> statement-breakpoint
DROP TABLE "Condicion_Pago" CASCADE;--> statement-breakpoint
DROP TABLE "Cotizacion" CASCADE;--> statement-breakpoint
DROP TABLE "Detalle_Cotizacion" CASCADE;--> statement-breakpoint
DROP TABLE "Detalle_Ticket" CASCADE;--> statement-breakpoint
DROP TABLE "Marca" CASCADE;--> statement-breakpoint
DROP TABLE "Modelo" CASCADE;--> statement-breakpoint
DROP TABLE "Nota_Entrega" CASCADE;--> statement-breakpoint
DROP TABLE "Repuesto" CASCADE;--> statement-breakpoint
DROP TABLE "Ticket" CASCADE;--> statement-breakpoint
DROP TABLE "Tipo_Servicio" CASCADE;--> statement-breakpoint
DROP TABLE "Tipo_Vehiculo" CASCADE;--> statement-breakpoint
DROP TABLE "Usuario" CASCADE;--> statement-breakpoint
DROP TABLE "Vehiculo" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_token_unique";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_role_id_Cargo_Cod_Cargo_fk";
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."Role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."Role" USING "role"::"public"."Role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "banned" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "userId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "provider" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "providerAccountId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "expires_at" integer;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "token_type" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "session_state" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "sessionToken" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "userId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "expires" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "cedula" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "emailVerified" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "telefono" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "delete_at" timestamp;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_owner_id_client_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_issue" ADD CONSTRAINT "vehicle_issue_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "account_id";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "provider_id";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "access_token_expires_at";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "refresh_token_expires_at";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "ip_address";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "user_agent";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "impersonated_by";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "email_verified";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_cedula_unique" UNIQUE("cedula");