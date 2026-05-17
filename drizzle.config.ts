import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

// Migrations run over the DIRECT (session, port 5432) connection.
// The pooled 6543 transaction pooler can't run DDL reliably.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL_NON_POOLING!,
  },
  casing: "snake_case",
  strict: true,
  verbose: true,
});
