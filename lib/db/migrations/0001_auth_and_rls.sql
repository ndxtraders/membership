-- Auth integration + Row Level Security.
-- RLS here is DEFENSE IN DEPTH for the supabase-js/anon surface (the anon key
-- is public). The app's Drizzle path connects as the DB owner and bypasses
-- RLS; canAccessLesson + the /admin gate remain the authoritative boundary
-- (CLAUDE.md §4/§5). Posture: default-deny, then explicit narrow allows.

-- 1. Tie public.users to auth.users (cascade delete on account removal).
ALTER TABLE "users"
  ADD CONSTRAINT "users_id_auth_users_fk"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade;
--> statement-breakpoint

-- 2. Auto-create a public.users row on signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--> statement-breakpoint

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
--> statement-breakpoint

-- 3. Backfill anyone who signed up before the trigger existed.
INSERT INTO public.users (id, email, full_name)
SELECT id, email,
       COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
--> statement-breakpoint

-- 4. Access helper: does the current JWT user hold a valid entitlement
--    to this program? SECURITY DEFINER so it ignores RLS internally and
--    just returns a boolean (avoids policy recursion).
CREATE OR REPLACE FUNCTION public.has_program_access(p_program_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.entitlements e
    WHERE e.program_id = p_program_id
      AND e.user_id = auth.uid()
      AND e.revoked_at IS NULL
      AND (e.expires_at IS NULL OR e.expires_at > now())
  );
$$;
--> statement-breakpoint

-- 5. Enable RLS everywhere (no policy => deny for anon/authenticated).
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "programs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "modules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lessons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "entitlements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "purchases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- 6. Policies — narrow, member-scoped.

CREATE POLICY "users_select_own" ON "users"
  FOR SELECT TO authenticated USING (auth.uid() = id);--> statement-breakpoint
CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);--> statement-breakpoint

CREATE POLICY "programs_select_entitled" ON "programs"
  FOR SELECT TO authenticated USING (public.has_program_access(id));--> statement-breakpoint

CREATE POLICY "modules_select_entitled" ON "modules"
  FOR SELECT TO authenticated USING (public.has_program_access(program_id));--> statement-breakpoint

CREATE POLICY "lessons_select_entitled" ON "lessons"
  FOR SELECT TO authenticated USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.modules m
      WHERE m.id = lessons.module_id
        AND public.has_program_access(m.program_id)
    )
  );--> statement-breakpoint

CREATE POLICY "products_select_authenticated" ON "products"
  FOR SELECT TO authenticated USING (true);--> statement-breakpoint

CREATE POLICY "entitlements_select_own" ON "entitlements"
  FOR SELECT TO authenticated USING (auth.uid() = user_id);--> statement-breakpoint

CREATE POLICY "progress_select_own" ON "progress"
  FOR SELECT TO authenticated USING (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "progress_insert_own" ON "progress"
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "progress_update_own" ON "progress"
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);--> statement-breakpoint

CREATE POLICY "purchases_select_own" ON "purchases"
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
