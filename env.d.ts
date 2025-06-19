/// <reference types="astro/client" />
import type { user } from '@/db/schema';

declare global {
    namespace App {
        interface Locals {
            user: import("better-auth").User;
            session: import("better-auth").Session | null;
        }
    }
}