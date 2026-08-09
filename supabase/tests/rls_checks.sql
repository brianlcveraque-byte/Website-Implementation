-- Manual RLS verification script.
--
-- Why this isn't a JS/Vitest test: the access-control boundary that matters
-- most (temp consultants can't see other clients' data or financials) lives
-- entirely in Postgres RLS policies, which only run against a real database
-- with real auth sessions — there was no live Supabase project available
-- while building this, so this couldn't be automated end-to-end here.
--
-- Run this in the Supabase SQL editor (or `supabase db execute`) AFTER
-- applying migrations and running `npm run seed`. It impersonates the demo
-- users by setting the same JWT claims Supabase Auth would set, so the RLS
-- policies evaluate exactly as they would for a real logged-in request.
--
-- Every block should print the row(s) noted in the comment. If a "should
-- see nothing" block returns rows, the RLS policy has a hole — fix it before
-- shipping.

-- ── Look up the demo user ids seeded by scripts/seed.mjs ──
select id, email, role from app_users where email like '%@strategnosis.demo' order by role;

-- Copy the temp_consultant id from the query above into :temp_id below,
-- and the core_team id into :core_id, then run each block.

-- ══════════════════════════════════════════════════════════════
-- AS TEMP CONSULTANT
-- ══════════════════════════════════════════════════════════════
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :'temp_id')::text, true);

-- Should see ONLY tasks assigned to this consultant (not the core team member's task).
select id, title, assigned_to from tasks;

-- Should see ONLY the project(s) they're assigned to.
select id, name from projects;

-- Should see NOTHING — opportunities are core-team-and-owner only.
select id, title from opportunities;

-- Should see NOTHING — invoices are core-team-and-owner only.
select id, invoice_ref, amount from invoices;

-- Should see ONLY their own consultant profile (their own rate is fine —
-- they can't see anyone else's).
select id, full_name, rate from consultants;

-- Should FAIL with a permission/RLS error — can't self-promote.
-- (Run this as a separate statement so it doesn't abort the rest of the script.)
-- update app_users set role = 'owner' where id = :'temp_id';

reset role;

-- ══════════════════════════════════════════════════════════════
-- AS CORE TEAM
-- ══════════════════════════════════════════════════════════════
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :'core_id')::text, true);

-- Should see ALL clients, opportunities, projects, invoices.
select count(*) as client_count from clients;
select count(*) as opportunity_count from opportunities;
select count(*) as invoice_count from invoices;

-- Should FAIL — core team cannot change roles (owner-only).
-- update app_users set role = 'owner' where id = :'core_id';

reset role;

-- ══════════════════════════════════════════════════════════════
-- AS ANONYMOUS (the public landing page)
-- ══════════════════════════════════════════════════════════════
set local role anon;

-- Should succeed — the inquiry form is allowed to insert.
insert into public_inquiries (name, email, message)
values ('RLS Test', 'rls-test@example.com', 'Verifying anonymous insert works.');

-- Should see NOTHING — anon has no select policy on public_inquiries.
select * from public_inquiries;

-- Should see NOTHING on any core table.
select * from clients;
select * from opportunities;

reset role;
