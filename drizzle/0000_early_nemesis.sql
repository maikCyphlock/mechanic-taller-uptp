ALTER TABLE "user"
ALTER COLUMN "role_id" TYPE integer USING role_id::integer;

CREATE TABLE "Cargo" (
	"Cod_Cargo" integer PRIMARY KEY NOT NULL,
	"Desc_Cargo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Cliente" (
	"Id_Cliente_Sistema" text PRIMARY KEY NOT NULL,
	"Tipo_Cliente" text NOT NULL,
	"Cedula_Persona" text,
	"Nombre_Apellido_Persona" text,
	"Rif_Empresa" text,
	"Desc_Empresa" text,
	"Nombre_Para_Mostrar" text NOT NULL,
	"Correo_Principal" text,
	"Telefono_Principal" text,
	"Direccion_Principal" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Cliente_Cedula_Persona_unique" UNIQUE("Cedula_Persona"),
	CONSTRAINT "Cliente_Rif_Empresa_unique" UNIQUE("Rif_Empresa"),
	CONSTRAINT "Cliente_Correo_Principal_unique" UNIQUE("Correo_Principal")
);
--> statement-breakpoint
CREATE TABLE "Condicion_Pago" (
	"Cod_Condicion_Pago" integer PRIMARY KEY NOT NULL,
	"Desc_Pago" text NOT NULL,
	"Dias_Credito" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Cotizacion" (
	"Cod_Cotizacion" integer PRIMARY KEY NOT NULL,
	"Fecha_Cotizacion" timestamp NOT NULL,
	"Id_Cliente_Sistema" text NOT NULL,
	"Cod_Condicion_Pago" integer,
	"Validez_Oferta_Dias" integer DEFAULT 15,
	"Status_Cotizacion" text DEFAULT 'BORRADOR' NOT NULL,
	"Monto_Total_Cotizacion" numeric(12, 2),
	"Id_Servicio_Asociado" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Detalle_Cotizacion" (
	"Cod_Detalle_Cotizacion" integer PRIMARY KEY NOT NULL,
	"Cod_Cotizacion" integer NOT NULL,
	"Tipo_Item_DC" text NOT NULL,
	"Cod_Tipo_Servicio_DC" integer,
	"Id_Repuesto_DC" text,
	"Desc_DC" text NOT NULL,
	"Cantidad_DC" integer DEFAULT 1 NOT NULL,
	"Precio_DC" numeric(10, 2) NOT NULL,
	"Subtotal_DC" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Detalle_Ticket" (
	"Id_Detalle" integer PRIMARY KEY NOT NULL,
	"Id_Servicio" integer NOT NULL,
	"Tipo_Item" text NOT NULL,
	"Cod_Tipo_Servicio" integer,
	"Id_Repuesto" text,
	"Descripcion_Manual_Item" text,
	"Cantidad" integer DEFAULT 1 NOT NULL,
	"Precio_Unitario_Item" numeric(10, 2),
	"Subtotal_Item" numeric(12, 2),
	"Fecha_Recibido_Item" timestamp,
	"Fecha_Entrega_Item" timestamp,
	"Garantia_Servicio_Item" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Marca" (
	"Cod_Marca" integer PRIMARY KEY NOT NULL,
	"Desc_Marca" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Modelo" (
	"Cod_Modelo" integer PRIMARY KEY NOT NULL,
	"Desc_Modelo" text,
	"Cod_Marca" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Nota_Entrega" (
	"Cod_Nota" integer PRIMARY KEY NOT NULL,
	"Fecha_Nota" timestamp NOT NULL,
	"Id_Cliente_Sistema" text NOT NULL,
	"Id_Servicio_Asociado" integer NOT NULL,
	"Observaciones_Entrega" text,
	"Resumen_Items_Entregados" text,
	"Recibido_Conforme_Por" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Repuesto" (
	"Id_Repuesto" text PRIMARY KEY NOT NULL,
	"Codigo_Interno_Repuesto" text,
	"Nombre_Repuesto" text NOT NULL,
	"Descripcion_Repuesto" text,
	"Cod_Marca_Repuesto" integer,
	"Stock_Actual" integer DEFAULT 0 NOT NULL,
	"Precio_Compra" numeric(10, 2),
	"Precio_Venta_Base" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Repuesto_Codigo_Interno_Repuesto_unique" UNIQUE("Codigo_Interno_Repuesto")
);
--> statement-breakpoint
CREATE TABLE "Ticket" (
	"Id_Servicio" integer PRIMARY KEY NOT NULL,
	"Titulo" text NOT NULL,
	"Descripcion_Adicional" text,
	"Status_Ticket" text DEFAULT 'ABIERTO' NOT NULL,
	"Prioridad_Ticket" text DEFAULT 'BAJA' NOT NULL,
	"Fecha_Servicio" timestamp NOT NULL,
	"Id_Cliente_Sistema" text NOT NULL,
	"Serial_Motor_VIN_Vehiculo" text NOT NULL,
	"Cedula_Usuario_Asignado" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tipo_Servicio" (
	"Cod_Tipo_Servicio" integer PRIMARY KEY NOT NULL,
	"Desc_Tipo_Servicio" text,
	"Precio_Referencial" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tipo_Vehiculo" (
	"Id_Tipo_Vehiculo" text PRIMARY KEY NOT NULL,
	"Nombre_Tipo" text NOT NULL,
	"Descripcion_Tipo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Usuario" (
	"Cedula" text PRIMARY KEY NOT NULL,
	"Nombre_Apellido" text,
	"Telefono" text,
	"Correo" text,
	"password_hash" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"Cod_Cargo" integer,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Usuario_Correo_unique" UNIQUE("Correo")
);
--> statement-breakpoint
CREATE TABLE "Vehiculo" (
	"Serial_Motor_VIN" text PRIMARY KEY NOT NULL,
	"Descripcion_Vehiculo" text,
	"Ano_Motor" integer,
	"Observacion_Vehiculo" text,
	"Placa" text,
	"Color" text,
	"Cod_Modelo" integer NOT NULL,
	"Id_Tipo_Vehiculo" text,
	"Id_Cliente_Sistema" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Vehiculo_Placa_unique" UNIQUE("Placa")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"role_id" integer DEFAULT 0,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "Cotizacion" ADD CONSTRAINT "Cotizacion_Id_Cliente_Sistema_Cliente_Id_Cliente_Sistema_fk" FOREIGN KEY ("Id_Cliente_Sistema") REFERENCES "public"."Cliente"("Id_Cliente_Sistema") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cotizacion" ADD CONSTRAINT "Cotizacion_Cod_Condicion_Pago_Condicion_Pago_Cod_Condicion_Pago_fk" FOREIGN KEY ("Cod_Condicion_Pago") REFERENCES "public"."Condicion_Pago"("Cod_Condicion_Pago") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Cotizacion" ADD CONSTRAINT "Cotizacion_Id_Servicio_Asociado_Ticket_Id_Servicio_fk" FOREIGN KEY ("Id_Servicio_Asociado") REFERENCES "public"."Ticket"("Id_Servicio") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Detalle_Cotizacion" ADD CONSTRAINT "Detalle_Cotizacion_Cod_Cotizacion_Cotizacion_Cod_Cotizacion_fk" FOREIGN KEY ("Cod_Cotizacion") REFERENCES "public"."Cotizacion"("Cod_Cotizacion") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Detalle_Cotizacion" ADD CONSTRAINT "Detalle_Cotizacion_Cod_Tipo_Servicio_DC_Tipo_Servicio_Cod_Tipo_Servicio_fk" FOREIGN KEY ("Cod_Tipo_Servicio_DC") REFERENCES "public"."Tipo_Servicio"("Cod_Tipo_Servicio") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Detalle_Cotizacion" ADD CONSTRAINT "Detalle_Cotizacion_Id_Repuesto_DC_Repuesto_Id_Repuesto_fk" FOREIGN KEY ("Id_Repuesto_DC") REFERENCES "public"."Repuesto"("Id_Repuesto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Detalle_Ticket" ADD CONSTRAINT "Detalle_Ticket_Id_Servicio_Ticket_Id_Servicio_fk" FOREIGN KEY ("Id_Servicio") REFERENCES "public"."Ticket"("Id_Servicio") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Detalle_Ticket" ADD CONSTRAINT "Detalle_Ticket_Cod_Tipo_Servicio_Tipo_Servicio_Cod_Tipo_Servicio_fk" FOREIGN KEY ("Cod_Tipo_Servicio") REFERENCES "public"."Tipo_Servicio"("Cod_Tipo_Servicio") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Detalle_Ticket" ADD CONSTRAINT "Detalle_Ticket_Id_Repuesto_Repuesto_Id_Repuesto_fk" FOREIGN KEY ("Id_Repuesto") REFERENCES "public"."Repuesto"("Id_Repuesto") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Modelo" ADD CONSTRAINT "Modelo_Cod_Marca_Marca_Cod_Marca_fk" FOREIGN KEY ("Cod_Marca") REFERENCES "public"."Marca"("Cod_Marca") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Nota_Entrega" ADD CONSTRAINT "Nota_Entrega_Id_Cliente_Sistema_Cliente_Id_Cliente_Sistema_fk" FOREIGN KEY ("Id_Cliente_Sistema") REFERENCES "public"."Cliente"("Id_Cliente_Sistema") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Nota_Entrega" ADD CONSTRAINT "Nota_Entrega_Id_Servicio_Asociado_Ticket_Id_Servicio_fk" FOREIGN KEY ("Id_Servicio_Asociado") REFERENCES "public"."Ticket"("Id_Servicio") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Repuesto" ADD CONSTRAINT "Repuesto_Cod_Marca_Repuesto_Marca_Cod_Marca_fk" FOREIGN KEY ("Cod_Marca_Repuesto") REFERENCES "public"."Marca"("Cod_Marca") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_Id_Cliente_Sistema_Cliente_Id_Cliente_Sistema_fk" FOREIGN KEY ("Id_Cliente_Sistema") REFERENCES "public"."Cliente"("Id_Cliente_Sistema") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_Serial_Motor_VIN_Vehiculo_Vehiculo_Serial_Motor_VIN_fk" FOREIGN KEY ("Serial_Motor_VIN_Vehiculo") REFERENCES "public"."Vehiculo"("Serial_Motor_VIN") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_Cedula_Usuario_Asignado_Usuario_Cedula_fk" FOREIGN KEY ("Cedula_Usuario_Asignado") REFERENCES "public"."Usuario"("Cedula") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_Cod_Cargo_Cargo_Cod_Cargo_fk" FOREIGN KEY ("Cod_Cargo") REFERENCES "public"."Cargo"("Cod_Cargo") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_Cod_Modelo_Modelo_Cod_Modelo_fk" FOREIGN KEY ("Cod_Modelo") REFERENCES "public"."Modelo"("Cod_Modelo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_Id_Tipo_Vehiculo_Tipo_Vehiculo_Id_Tipo_Vehiculo_fk" FOREIGN KEY ("Id_Tipo_Vehiculo") REFERENCES "public"."Tipo_Vehiculo"("Id_Tipo_Vehiculo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_Id_Cliente_Sistema_Cliente_Id_Cliente_Sistema_fk" FOREIGN KEY ("Id_Cliente_Sistema") REFERENCES "public"."Cliente"("Id_Cliente_Sistema") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_Cargo_Cod_Cargo_fk" FOREIGN KEY ("role_id") REFERENCES "public"."Cargo"("Cod_Cargo") ON DELETE set null ON UPDATE no action;