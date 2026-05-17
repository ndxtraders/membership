import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Runtime DB client over the Supavisor TRANSACTION pooler (port 6543).
 * `prepare: false` is required — the transaction pooler does not support
 * prepared statements.
 *
 * This connects as the database owner role, so RLS does NOT apply to these
 * queries. Authorization is enforced in app code (canAccessLesson, the
 * /admin gate). RLS is defense-in-depth for the supabase-js/anon surface.
 */
const connectionString = process.env.POSTGRES_URL!;

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema, casing: "snake_case" });

export * as schema from "./schema";
