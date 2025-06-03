 import type { user } from '@/db/schema';
// <reference path="../.astro/types.d.ts" />
 
declare namespace App {
    // Note: 'import {} from ""' syntax does not work in .d.ts files.
    interface Locals {
        user: import("better-auth").User;
        session: import("better-auth").Session | null;
    }
}
