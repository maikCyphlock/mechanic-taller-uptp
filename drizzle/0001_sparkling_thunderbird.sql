CREATE TABLE `appointment` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`client_id` text,
	`vehicle_id` text,
	`reason` text,
	`notes` text,
	`status` text DEFAULT 'PENDIENTE' NOT NULL,
	`odoo_id` integer,
	`sync_status` text DEFAULT 'not_synced' NOT NULL,
	`synced_at` integer,
	`sync_error` text,
	`delete_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`serial_number` text,
	`quantity` integer DEFAULT 0 NOT NULL,
	`price` text,
	`category` text,
	`location` text,
	`min_stock` integer DEFAULT 0,
	`max_stock` integer,
	`odoo_id` integer,
	`sync_status` text DEFAULT 'not_synced' NOT NULL,
	`synced_at` integer,
	`sync_error` text,
	`delete_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`operation` text NOT NULL,
	`data` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_attempt` integer,
	`error` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `ticket` ADD `odoo_id` integer;--> statement-breakpoint
ALTER TABLE `ticket` ADD `sync_status` text DEFAULT 'not_synced' NOT NULL;--> statement-breakpoint
ALTER TABLE `ticket` ADD `synced_at` integer;--> statement-breakpoint
ALTER TABLE `ticket` ADD `sync_error` text;--> statement-breakpoint
ALTER TABLE `vehicle` ADD `odoo_id` integer;--> statement-breakpoint
ALTER TABLE `vehicle` ADD `sync_status` text DEFAULT 'not_synced' NOT NULL;--> statement-breakpoint
ALTER TABLE `vehicle` ADD `synced_at` integer;--> statement-breakpoint
ALTER TABLE `vehicle` ADD `sync_error` text;