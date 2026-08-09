# SPEC.md — Strategnosis Growth and Delivery Hub

Status: **Draft v1 — pending owner sign-off on the scope cuts in §4 before Phase 3/4 begin.**
Working name: Strategnosis Growth and Delivery Hub (subject to change).

---

## 1. Executive Summary

Strategnosis Solutions OPC is a Philippine one-person corporation delivering management,
HR/OD, healthcare-management, research/policy, and strategic-planning consultancy. In
practice ~2 people run the entire business — business development, delivery, admin — and
bring in temporary consultants per engagement. Today that runs on memory, chat apps, and
spreadsheets.

This system's job is not to be a full ERP. It is to make sure **nothing important is
forgotten**, give the owner **one place to see what's overdue**, and make the business
**operable by someone other than the owner's memory**. Everything in scope is chosen against
that test.

## 2. Business Problem

See prior discovery turn for the full breakdown (weak marketing conversion, scattered lead
tracking, no single project-risk view, thin financial visibility, fragmented documents). The
root cause behind all of them is the same: **no shared system of record**. The MVP fixes the
root cause for the highest-value slice of the workflow — pipeline → project → billing — before
expanding into marketing production, resource-marketplace, and full financial reporting.

## 3. Principal Consultant Profile (source: CV, validated 2026-08-09)

Richard S. Javier, MBA, PhD (Organization Development). Confirmed, CV-supported service
categories — **all 18** proposed in the original brief are validated by direct engagement
history, with **healthcare/hospital management consulting** as the clear specialization
(dozens of hospitals, health systems, and Ministries of Health across PH, Africa, and
Southeast Asia):

Strategic Management & Planning · Organizational Development · HR Management & Development ·
Competency-Based HR Systems · Succession Planning · Performance Management · Leadership &
Management Development · Training/Facilitation/Coaching/Mentoring · Research & Policy Studies ·
Market Research · Feasibility Studies · Healthcare & Hospital Management Consulting · Quality
Management & Process Improvement (ISO 9001:2015, Six Sigma, TQM) · Workforce Planning & Org
Design · Program & Project Planning · Monitoring & Evaluation · Business Process Review ·
Institutional & Governance Development.

Sectors confirmed by CV: government (DOH, DILG, NEDA, PH Coast Guard, LGUs), hospitals/
healthcare (extensive), universities (UP System, Adamson, Solusi University, Universidad de
Zamboanga, AUP, WVSU), cooperatives (CDA, PAFCPIC, AMOSUP), international/development
orgs (WHO, USAID, UNOPS, Colombo Plan), faith-based institutions (Seventh-Day Adventist —
multiple divisions/countries), private companies, professional associations.

**Privacy handling:** the full CV (including residential address, personal mobile/email, and
named personal references) is stored **internally only**, attached to the Consultant record for
the owner. The public site (§9) will show only: professional title, degrees, a curated summary
of qualifications, service categories, sectors served in general terms, and any specific
projects/clients the owner explicitly flags as approved for public use. **No client name goes
public by default.**

## 4. Scope — confirmed vs. proposed cut (needs owner sign-off)

The original brief specified 10 full modules plus a public site, notifications engine, and a
full report catalogue. Building all of it as "MVP" contradicts the brief's own instruction to
keep this maintainable for a 2-person team. The cuts below were proposed in discovery and not
explicitly contested — they are **assumptions**, not confirmed decisions. Flag anything you
want reinstated.

### 4.1 In MVP (build now)

| # | Capability | Notes |
|---|---|---|
| 1 | Client & Contact management | Full module as specced |
| 2 | Opportunity/Lead pipeline | Full module; proposal tracking **folded in** as fields on Opportunity (title, file link, status, submission/decision dates, won/lost reason) rather than a standalone Proposal module with versioning |
| 3 | Project delivery monitoring | Milestones, tasks, team assignment, status/risk flags |
| 4 | Task & workload view | Per-person task list, overdue/due-soon counts |
| 5 | Consultant pool — simple table | Name, expertise tags, contact, rate (restricted field), availability note, assignment history. No search/marketplace UI yet — a handful of people doesn't need one |
| 6 | Lightweight billing | Invoice + Payment records tied to a project/milestone, outstanding balance, overdue flag. Optional PH withholding-tax note field (most clients shoulder tax per your contracts, so it's informational, not computed) |
| 7 | Executive dashboard | Pulls from 1–6: overdue items, pipeline value, upcoming deadlines, outstanding receivables |
| 8 | Document links | URL + label + category, attachable to any entity; **in-app upload to Supabase Storage** with an option to paste a Google Drive link instead |
| 9 | Public landing page | Single page: overview, service categories, principal profile (public-safe subset), inquiry form → writes directly into the Opportunity pipeline at "New Inquiry" stage |
| 10 | Auth & roles | Google OAuth (primary) + email/password (fallback), 3 roles: Owner, Core Team, Temporary Consultant |
| 11 | Basic accountability | `created_by`/`updated_by`/timestamps on key tables + an Opportunity stage-change history log |

### 4.2 Phase 2 backlog (useful, not urgent)

- Standalone Proposal module: versioning, reusable content-block library, contributor workflow
- Marketing content calendar + campaign tracking
- Searchable consultant marketplace (filters by expertise/location/rate/availability)
- Full financial monitoring: receivables aging, project contribution margin, cash-flow-by-month
- ~~Notification engine (email digests)~~ — built post-MVP; see README.md §5. Currently one
  shared daily digest to all owner/core-team recipients; per-person filtering is still Phase 2.
- Expanded report catalogue with filters + CSV export across all tables
- Structured Risk / Issue / Decision logs per project (MVP covers this with a project Notes field)
- Formal audit-log module beyond the basic accountability fields in MVP
- Meetings as a first-class entity (MVP: meetings are just tasks/notes with a date)

### 4.3 Not yet (explicitly out — per your own brief §14, and I agree)

Full accounting/tax/payroll, procurement integration, AI proposal generation, ERP, client
portal, video conferencing, social-publishing automation, email-marketing automation,
biometric attendance, native mobile apps.

## 5. User Personas

- **Owner (Richard)** — principal consultant, full-time employed at UP System, runs
  Strategnosis on the side/in parallel. Needs the system to cost him zero admin overhead and
  surface only what needs his attention.
- **Core Team Member** — the second consistent person; handles coordination, proposals,
  document prep, client comms. Comfortable with basic system admin (confirmed).
- **Temporary Consultant** — engaged per project; sees only their assignments.

## 6. Roles & Permissions

| Area | Owner | Core Team | Temp Consultant |
|---|---|---|---|
| Clients / Opportunities / Projects | Full CRUD | Full CRUD | No access (unless assigned to project → read-only project view) |
| Financial data (invoices, payments, consultant rates) | Full | Full (both confirmed comfortable — no restriction needed at 2-person scale; owner can later flip a per-user toggle) | No access |
| Consultant pool | Full | Full | Own profile only, read-only |
| User management / settings | Full | No | No |
| Assigned project tasks/deliverables | Full | Full | Read/update own tasks only |
| Public site content | Full | Edit (owner approves publish) | No access |

Enforced via Supabase Row-Level Security, not just UI hiding.

## 7. Non-Scope (v1)

Everything in §4.2 and §4.3, plus: multi-currency conversion (PHP default, other currency is a
free-text/label field only, no FX conversion), multi-tenant support (single organization),
offline mode.

## 8. Core User Journey (acceptance-test shape)

Log in → create Client → add Contact → create Opportunity (service, value, source, next
action, deadline) → move through pipeline stages → attach proposal file link, mark
submitted/revised → mark Won → convert to Project (client/contact data carries over, no
re-entry) → add Milestones/Deliverables → assign Tasks to core/temp people → dashboard shows
overdue items → record billing milestone → create Invoice → record payment (full or partial) →
see updated outstanding balance → mark Project complete → capture closeout notes/lessons/
follow-on potential → dashboard reflects the full cycle.

## 9. Business Rules

1. Every active Opportunity must have an owner and a next action with a due date.
2. Opportunities with no activity for a configurable window (default 14 days) are flagged.
3. Lost Opportunities require a reason.
4. Won → Project conversion never re-asks for client/contact info already on file.
5. Project completion % derives from milestone completion, not manual entry.
6. Invoices track amount, amount paid, and balance; overdue = past due date and balance > 0.
7. Temp Consultants are scoped to their own ProjectAssignment rows only — enforced at the
   database level (RLS), not just hidden in the UI.
8. Every Opportunity stage change is logged with who/when.

## 10. Data Model (v1 entities)

`User, Client, Contact, Service (static catalogue seeded from §3), Opportunity,
OpportunityStageHistory, Project, Milestone, Task, Consultant, ProjectAssignment, Invoice,
Payment, Document, PublicInquiry (writes into Opportunity)`.

Deferred entities (Phase 2): `ProposalVersion, MarketingCampaign, ContentItem, Risk, Issue,
Decision, Notification, AuditLog (formal), ConsultantExpertise (as a separate searchable
table)`.

Full column-level schema and ER diagram are produced in Phase 3 (Technical Design).

## 11. Reporting (v1)

Dashboard only — no separate reports module yet: pipeline value (total + weighted), opportunities
by stage, active/at-risk projects, overdue tasks, overdue invoices, outstanding receivables
total, upcoming deadlines (7/30-day). CSV export deferred to Phase 2 per §4.2.

## 12. Security Requirements

Supabase Auth (Google OAuth + email/password) · Row-Level Security per role · no hard-coded
secrets, `.env` only · restricted fields (consultant rates, invoice amounts) gated by RLS, not
just UI · basic accountability fields (§4.1 #11) · manual export capability for backup (owner
can trigger a data export) · session expiry on inactivity.

## 13. Acceptance Criteria

As listed in the original brief §18, scoped to the §4.1 module set. Demo/seed data included.
Temp consultant cannot see unrelated projects/financials (verified via RLS test, not just UI
test). Works on desktop and mobile viewport. Major tables searchable/filterable.

## 14. Open Items Requiring Your Confirmation

- Sign off on the §4 scope cut (or tell me which Phase 2 items you actually want in v1).
- Confirm public landing page should launch with **no named clients**, sectors/categories only,
  until you explicitly approve specific ones for publication.
