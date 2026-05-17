import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";

/* ───────────────────────── enums ───────────────────────── */

export const programStatus = pgEnum("program_status", [
  "draft",
  "published",
  "archived",
]);

export const lessonType = pgEnum("lesson_type", [
  "video_embed",
  "video_mux", // reserved for forward-compat; not creatable in v1 (CLAUDE.md §5/§3)
  "pdf",
  "audio",
  "markdown",
]);

export const lessonStatus = pgEnum("lesson_status", ["draft", "published"]);

export const productType = pgEnum("product_type", [
  "free",
  "one_time",
  "subscription_monthly",
  "subscription_annual",
  "tier_basic",
  "tier_pro",
]);

export const entitlementSource = pgEnum("entitlement_source", [
  "purchase",
  "manual",
  "free",
]);

export const purchaseStatus = pgEnum("purchase_status", [
  "pending",
  "completed",
  "refunded",
  "failed",
]);

/* ───────────────────────── tables ───────────────────────── */

/**
 * Mirror of auth.users. The FK to auth.users(id) and the signup trigger
 * that populates this row live in the hand-written SQL migration
 * (Drizzle does not manage the auth schema).
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const programs = pgTable(
  "programs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    coverImageUrl: text("cover_image_url"),
    status: programStatus("status").notNull().default("draft"),
    // Set in app logic; left as a plain uuid to avoid a circular FK with lessons.
    startHereLessonId: uuid("start_here_lesson_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("programs_slug_unique").on(t.slug)],
);

export const modules = pgTable(
  "modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("modules_program_order_idx").on(t.programId, t.sortOrder)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: lessonType("type").notNull(),
    status: lessonStatus("status").notNull().default("draft"),
    embedUrl: text("embed_url"), // video_embed
    storagePath: text("storage_path"), // pdf / audio (Supabase Storage object path)
    markdownBody: text("markdown_body"), // markdown
    muxPlaybackId: text("mux_playback_id"), // reserved, null in v1
    durationSeconds: integer("duration_seconds"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("lessons_module_order_idx").on(t.moduleId, t.sortOrder)],
);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: productType("type").notNull(),
  // null program_id + allAccess=true => grants every program
  programId: uuid("program_id").references(() => programs.id, {
    onDelete: "set null",
  }),
  allAccess: boolean("all_access").notNull().default(false),
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default("usd"),
  stripePriceId: text("stripe_price_id"),
  stripeProductId: text("stripe_product_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Access source of truth. Only the Stripe webhook and manual admin grants
 * write here (CLAUDE.md §7). canAccessLesson reads this.
 */
export const entitlements = pgTable(
  "entitlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    source: entitlementSource("source").notNull(),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [
    unique("entitlements_user_program_unique").on(t.userId, t.programId),
    index("entitlements_user_idx").on(t.userId),
  ],
);

export const progress = pgTable(
  "progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastPositionSeconds: integer("last_position_seconds")
      .notNull()
      .default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("progress_user_lesson_unique").on(t.userId, t.lessonId),
    index("progress_user_idx").on(t.userId),
  ],
);

/** Stripe event audit log. Phase 4 populates this. */
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  amountCents: integer("amount_cents").notNull().default(0),
  currency: text("currency").notNull().default("usd"),
  status: purchaseStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
