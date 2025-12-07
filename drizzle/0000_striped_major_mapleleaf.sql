CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `client` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`address` text,
	`city` text,
	`state` text,
	`cedula` text,
	`delete_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `client_email_unique` ON `client` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `client_cedula_unique` ON `client` (`cedula`);--> statement-breakpoint
CREATE TABLE `role` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ticket` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`short_description` text,
	`description` text,
	`closed_at` integer,
	`status` text DEFAULT 'ABIERTO' NOT NULL,
	`priority` text DEFAULT 'MEDIA' NOT NULL,
	`assigned_to` text,
	`estimated_cost` text,
	`client_id` text,
	`approved_by` text,
	`approved_at` integer,
	`payment_method` text,
	`payment_status` text,
	`payment_reference` text,
	`payment_currency` text,
	`payment_amount` text,
	`payment_date` integer,
	`total_amount` text,
	`time_spent` text,
	`work_notes` text,
	`tool_used` text,
	`delete_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`client_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`approved_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`cedula` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text,
	`email_verified` integer,
	`image` text,
	`telefono` text,
	`role` text DEFAULT 'user' NOT NULL,
	`role_id` text,
	`banned` integer,
	`ban_reason` text,
	`ban_expires` integer,
	`delete_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_cedula_unique` ON `user` (`cedula`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `vehicle` (
	`id` text PRIMARY KEY NOT NULL,
	`plate` text,
	`make` text,
	`model` text,
	`year` integer,
	`color` text,
	`type` text DEFAULT 'otro' NOT NULL,
	`delete_at` integer,
	`owner_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `client`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vehicle_plate_unique` ON `vehicle` (`plate`);--> statement-breakpoint
CREATE TABLE `vehicle_issue` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text,
	`severity` integer NOT NULL,
	`status` text NOT NULL,
	`issue_descrption` text,
	`issueType` text,
	`delete_at` integer,
	`vehicle_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicle`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL
);
