// Production-facing seed script.
//
// Loads the real service catalogue, the demo login accounts, real client
// engagements pulled from the owner's actual monitoring sheet (see below),
// and ONE clearly-labeled synthetic "Demo —" trio kept specifically to
// showcase features the real data doesn't currently exercise: the won→
// project conversion, invoicing/payments, and temp-consultant RLS isolation.
//
// Safe to re-run: it clears prior business data (clients through documents)
// before reinserting, but never touches auth accounts.
//
//   node --env-file=.env.local scripts/seed.mjs
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (never expose this key to
// the browser — this script only ever runs on your machine).

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey || url.includes("placeholder") || serviceKey.includes("placeholder")) {
  console.error(
    "Set real NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before seeding."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const DEMO_PASSWORD = "Demo1234!";

const SERVICE_CATEGORIES = [
  { name: "Strategic Management and Planning", description: "Facilitated strategic plans for hospitals, cooperatives, and government agencies." },
  { name: "Organizational Development", description: "OD diagnostics and transformation for institutions and health systems." },
  { name: "Human Resource Management and Development", description: "HR systems design and development for public and private institutions." },
  { name: "Competency-Based HR Systems", description: "Competency manuals and frameworks for hospitals, cooperatives, and agencies." },
  { name: "Succession Planning", description: "Succession planning frameworks for institutional continuity." },
  { name: "Performance Management", description: "Performance management system design and implementation." },
  { name: "Leadership and Management Development", description: "Leadership programs for executives, boards, and municipal officials." },
  { name: "Training, Facilitation, Coaching, and Mentoring", description: "Facilitation and capacity-building across health, education, and government." },
  { name: "Research and Policy Studies", description: "Principal investigator / co-investigator on WHO, DOH, and NIH-funded studies." },
  { name: "Market Research", description: "Market research studies for institutional clients." },
  { name: "Feasibility Studies", description: "Feasibility studies for hospitals, wellness centers, and specialty facilities." },
  { name: "Healthcare and Hospital Management Consulting", description: "The core specialization — dozens of hospitals and health systems across PH, Africa, and Southeast Asia." },
  { name: "Quality Management and Process Improvement", description: "ISO 9001:2015, Six Sigma, and TQM implementation." },
  { name: "Workforce Planning and Organizational Design", description: "Workforce and organizational design for institutional restructuring." },
  { name: "Program and Project Planning", description: "Program design and planning for development and health initiatives." },
  { name: "Monitoring and Evaluation", description: "M&E frameworks and program evaluation for public health initiatives." },
  { name: "Business Process Review", description: "Business process and operations review for private and institutional clients." },
  { name: "Institutional and Governance Development", description: "Board governance advisory and institutional development." },
];

async function upsertDemoUser(email, fullName, role) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  let userId;
  if (createError) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list.users.find((u) => u.email === email);
    if (!existing) throw createError;
    userId = existing.id;
  } else {
    userId = created.user.id;
  }
  const { error: upsertError } = await supabase
    .from("app_users")
    .upsert({ id: userId, full_name: fullName, email, role, active: true }, { onConflict: "id" });
  if (upsertError) throw upsertError;
  return userId;
}

async function clearBusinessData() {
  // Dependency order matters — children before parents. Leaves app_users,
  // auth accounts, and the service catalogue untouched.
  const tables = [
    "payments",
    "documents",
    "invoices",
    "tasks",
    "milestones",
    "project_assignments",
    "projects",
    "opportunity_stage_history",
    "opportunities",
    "contacts",
    "clients",
    "consultants",
    "public_inquiries",
  ];
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().not("id", "is", null);
    if (error) throw new Error(`Clearing ${table}: ${error.message}`);
  }
}

async function main() {
  console.log("Seeding services…");
  await supabase.from("services").upsert(
    SERVICE_CATEGORIES.map((c) => ({ name: c.name, category: c.name, description: c.description })),
    { onConflict: "name" }
  );
  const { data: services } = await supabase.from("services").select("*");
  const serviceByName = Object.fromEntries(services.map((s) => [s.name, s]));

  console.log("Creating login accounts (password: %s)…", DEMO_PASSWORD);
  const ownerId = await upsertDemoUser("owner@strategnosis.demo", "Demo Owner", "owner");
  const coreId = await upsertDemoUser("core@strategnosis.demo", "Demo Core Team", "core_team");
  const tempId = await upsertDemoUser("consultant@strategnosis.demo", "Demo Temp Consultant", "temp_consultant");

  console.log("Clearing prior business data…");
  await clearBusinessData();

  const today = new Date();
  const inDays = (n) => new Date(today.getTime() + n * 86400000).toISOString().slice(0, 10);

  // ────────────────────────────────────────────────────────────────────
  // Real clients & projects, drawn from the owner's actual monitoring
  // sheet ("Monitoring Tool (8-6-2026).xlsx"). Milestone/task titles and
  // dates are the real logged activities, kept as-is.
  // ────────────────────────────────────────────────────────────────────
  const realEngagements = [
    {
      client: {
        org_name: "PVS GmbH",
        org_type: "Private company",
        sector: "Healthcare / Engineering",
        status: "active_client",
        source: "Direct engagement",
      },
      project: {
        name: "Hospital Wastewater Management Systems Feasibility Study",
        service: "Feasibility Studies",
        status: "in_progress",
        contract_amount: 12000000,
      },
      milestones: [
        { title: "Initial meeting with team and Sir Ricky", status: "completed", due_date: "2026-04-23" },
        { title: "Hospital Visit (RMC); approval to proceed", status: "completed", due_date: "2026-07-27" },
        { title: "Monitoring Tool for Data (per hospital)", status: "completed" },
        { title: "Write-shop (Manila/Tagaytay/Laguna, August 1st week)", status: "not_started", due_date: inDays(4) },
      ],
      tasks: [
        { title: "Ongoing coordination with hospital engineers (Engr. Frank, Sotolombo, Christine); follow-up with Dr. Molina on write-up", status: "in_progress", priority: "high", due_date: inDays(2) },
      ],
    },
    {
      client: {
        org_name: "Philippine Army Finance Center Producers Integrated Cooperative (PAFCPIC)",
        org_type: "Cooperative",
        sector: "Cooperative",
        status: "active_client",
        source: "Referral",
      },
      project: {
        name: "Competency-Based HR & Organizational Development Engagement",
        service: "Competency-Based HR Systems",
        status: "in_progress",
        contract_amount: 1000000,
      },
      milestones: [
        { title: "Proposal for Reskilling (OD)", status: "completed" },
        { title: "Next Phase for CBHRS — Policy Integration", status: "not_started", due_date: inDays(20) },
        { title: "WAVES program — next batch (on hold until 2027)", status: "deferred" },
      ],
      tasks: [
        { title: "Dates for Next Batch WAVES", status: "in_progress", priority: "medium" },
        { title: "Revise job descriptions", status: "completed" },
      ],
    },
    {
      client: {
        org_name: "Cooperative Development Authority (CDA)",
        org_type: "Government agency",
        sector: "Government",
        status: "active_client",
        source: "Direct engagement",
      },
      project: {
        name: "Strategic Performance Management System & Succession Planning",
        service: "Succession Planning",
        status: "in_progress",
      },
      milestones: [
        { title: "SPMS pre-workshop (Cebu engagement)", status: "completed", due_date: "2026-07-09" },
        { title: "Succession Planning sample output & presentation", status: "completed" },
        { title: "Continuation SPMS; finalize submissions", status: "in_progress", due_date: inDays(6) },
      ],
      tasks: [
        { title: "OPCR video tutorial", status: "completed" },
        { title: "IPCR video revision (more detail with example)", status: "completed" },
      ],
    },
    {
      client: {
        org_name: "Cardinal Santos Medical Center (CSMC)",
        org_type: "Hospital",
        sector: "Healthcare",
        status: "active_client",
        source: "Previous engagement",
      },
      project: {
        name: "Implementation Planning & Executive Coaching",
        service: "Leadership and Management Development",
        status: "in_progress",
      },
      milestones: [
        { title: "Executive coaching report and feedback", status: "completed", due_date: "2026-06-01" },
        { title: "Presentation materials — ethical decision making & wisdom/philosophy coaching", status: "not_started", due_date: inDays(10) },
      ],
      tasks: [
        { title: "Implementation website", status: "in_progress", priority: "medium" },
        { title: "Awaiting FGD/KII schedule for participants' expectations", status: "awaiting_client", priority: "medium" },
        { title: "Proposal on Labor Law/Code / Employee Relations", status: "in_progress", priority: "low" },
      ],
    },
    {
      client: {
        org_name: "Philippine Tax Academy (PTA)",
        org_type: "Government agency",
        sector: "Government / Education",
        status: "active_client",
        source: "Direct engagement",
      },
      project: {
        name: "Competency-Based HR Management Project",
        service: "Competency-Based HR Systems",
        status: "in_progress",
        contract_amount: 2000000,
      },
      milestones: [
        { title: "End of quarter report", status: "completed" },
        { title: "Recommendation on instructional designs", status: "completed" },
        { title: "Initial analysis of CNA 2025 results", status: "completed" },
      ],
      tasks: [
        { title: "Coaching and Mentoring presentation & workshops", status: "deferred", priority: "low" },
        { title: "Canva training", status: "deferred", priority: "low" },
      ],
    },
    {
      client: {
        org_name: "North Philippine Union Conference — Smoke-Free Program (NPUC)",
        org_type: "Faith-based institution",
        sector: "Faith-based",
        status: "active_client",
        source: "Grant program",
      },
      project: {
        name: "Smoke-Free Program Grant Management",
        service: "Program and Project Planning",
        status: "in_progress",
      },
      milestones: [
        { title: "Signature of contract", status: "completed" },
        { title: "Financial report", status: "completed" },
        { title: "Bay FCTC training with provincial/regional DOH and TCN (main resource person)", status: "not_started", due_date: inDays(25) },
      ],
      tasks: [
        { title: "Reimbursement request", status: "in_progress", priority: "medium" },
        { title: "Next round proposal — Calamba/Binan", status: "not_started", priority: "medium" },
      ],
    },
    {
      client: {
        org_name: "National Institutes for Health (DOH-NIH)",
        org_type: "Government agency",
        sector: "Government / Research",
        status: "active_client",
        source: "Research grant",
      },
      project: {
        name: "Dual Use of Conventional Tobacco and E-Cigarettes/Vapes/HTPs Research",
        service: "Research and Policy Studies",
        status: "in_progress",
      },
      milestones: [
        { title: "Close of project documents", status: "completed" },
        { title: "Debriefing session with HPP team", status: "completed" },
        { title: "Second manuscript structure (under review)", status: "in_progress", due_date: inDays(8) },
      ],
      tasks: [
        { title: "Encoding of student answers", status: "in_progress", priority: "medium" },
        { title: "Address feedback on technical report", status: "completed" },
      ],
    },
  ];

  console.log("Seeding real clients, projects, milestones, and tasks…");
  for (const engagement of realEngagements) {
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({ ...engagement.client, relationship_owner: ownerId, created_by: ownerId, updated_by: ownerId })
      .select()
      .single();
    if (clientError) throw clientError;

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: engagement.project.name,
        client_id: client.id,
        service_id: serviceByName[engagement.project.service]?.id ?? null,
        project_manager_id: ownerId,
        status: engagement.project.status,
        health_status: "green",
        contract_amount: engagement.project.contract_amount ?? null,
        created_by: ownerId,
        updated_by: ownerId,
      })
      .select()
      .single();
    if (projectError) throw projectError;

    for (const m of engagement.milestones) {
      await supabase.from("milestones").insert({
        project_id: project.id,
        title: m.title,
        status: m.status,
        due_date: m.due_date ?? null,
        completion_pct: m.status === "completed" ? 100 : m.status === "in_progress" ? 50 : 0,
        responsible_id: ownerId,
      });
    }

    for (const t of engagement.tasks) {
      await supabase.from("tasks").insert({
        project_id: project.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        due_date: t.due_date ?? null,
        assigned_to: ownerId,
        created_by: ownerId,
      });
    }
  }

  // ────────────────────────────────────────────────────────────────────
  // Real pipeline opportunities — from the sheet's own revenue-projection
  // table ("Target Projects/Organizations"), not yet won.
  // ────────────────────────────────────────────────────────────────────
  console.log("Seeding real pipeline opportunities…");
  const { data: hospitalClient } = await supabase
    .from("clients")
    .insert({
      org_name: "Prospective Hospitals & Clinics",
      org_type: "Hospital",
      sector: "Healthcare",
      status: "prospect",
      source: "Professional network",
      relationship_owner: ownerId,
      created_by: ownerId,
      updated_by: ownerId,
    })
    .select()
    .single();

  await supabase.from("opportunities").insert({
    title: "Hospitals & Clinics — Consulting Engagement",
    client_id: hospitalClient.id,
    service_id: serviceByName["Healthcare and Hospital Management Consulting"]?.id ?? null,
    stage: "qualification",
    estimated_value: 900000,
    probability_pct: 30,
    owner_id: ownerId,
    created_by: ownerId,
    updated_by: ownerId,
    next_action: "Scope specific hospital/clinic targets and initiate outreach",
    next_action_due: inDays(14),
    source: "Professional network",
  });

  const { data: onboardingClient } = await supabase
    .from("clients")
    .insert({
      org_name: "Onboarding Website/Software Client (TBD)",
      org_type: "Private company",
      sector: "Technology",
      status: "prospect",
      source: "Direct inquiry",
      relationship_owner: ownerId,
      created_by: ownerId,
      updated_by: ownerId,
    })
    .select()
    .single();

  await supabase.from("opportunities").insert({
    title: "Onboarding Website/Software Development",
    client_id: onboardingClient.id,
    service_id: serviceByName["Business Process Review"]?.id ?? null,
    stage: "qualification",
    estimated_value: 1000000,
    probability_pct: 30,
    owner_id: ownerId,
    created_by: ownerId,
    updated_by: ownerId,
    next_action: "Firm up scope and timeline with prospective client",
    next_action_due: inDays(14),
    source: "Direct inquiry",
  });

  // ────────────────────────────────────────────────────────────────────
  // ONE clearly-synthetic "Demo —" trio: showcases won→project conversion,
  // invoicing/payments, and temp-consultant RLS isolation — none of which
  // the real data above currently demonstrates.
  // ────────────────────────────────────────────────────────────────────
  console.log("Seeding the labeled demo showcase (won→project, billing, temp-consultant view)…");
  const { data: demoConsultant } = await supabase
    .from("consultants")
    .insert({
      full_name: "Demo Temp Consultant",
      title: "Research Associate",
      expertise: ["Research and Policy Studies", "Monitoring and Evaluation"],
      contact_email: "consultant@strategnosis.demo",
      rate: 5000,
      rate_currency: "PHP",
      availability: "Weekdays",
      location: "Metro Manila",
      travel_availability: true,
      linked_user_id: tempId,
      active: true,
    })
    .select()
    .single();

  const { data: demoClient } = await supabase
    .from("clients")
    .insert({
      org_name: "Demo — Sample Prospect Co.",
      org_type: "Private company",
      sector: "Demonstration",
      status: "prospect",
      source: "Demo",
      notes: "Synthetic example kept to demonstrate the won→project, billing, and temp-consultant features.",
      relationship_owner: ownerId,
      created_by: ownerId,
      updated_by: ownerId,
    })
    .select()
    .single();

  const { data: demoOpp } = await supabase
    .from("opportunities")
    .insert({
      title: "Demo — Sample Engagement",
      client_id: demoClient.id,
      stage: "negotiation",
      estimated_value: 500000,
      probability_pct: 80,
      owner_id: ownerId,
      created_by: ownerId,
      updated_by: ownerId,
      next_action: "Finalize terms",
      next_action_due: inDays(3),
      source: "Demo",
    })
    .select()
    .single();

  const { data: demoProjectId } = await supabase.rpc("convert_opportunity_to_project", {
    p_opportunity_id: demoOpp.id,
  });

  await supabase
    .from("projects")
    .update({
      name: "Demo — Sample Engagement",
      project_manager_id: coreId,
      status: "in_progress",
      health_status: "green",
      start_date: inDays(-5),
      end_date: inDays(60),
    })
    .eq("id", demoProjectId);

  const { data: demoMilestone } = await supabase
    .from("milestones")
    .insert({
      project_id: demoProjectId,
      title: "Demo — Discovery phase complete",
      responsible_id: coreId,
      due_date: inDays(7),
      status: "in_progress",
      completion_pct: 40,
      billing_trigger: true,
    })
    .select()
    .single();

  await supabase.from("tasks").insert({
    project_id: demoProjectId,
    milestone_id: demoMilestone.id,
    title: "Demo — Compile discovery notes (assigned to the temp consultant login)",
    assigned_to: tempId,
    priority: "high",
    due_date: inDays(-1),
    status: "in_progress",
    created_by: coreId,
  });

  await supabase.from("project_assignments").insert([
    { project_id: demoProjectId, user_id: coreId, role_on_project: "Project coordinator" },
    { project_id: demoProjectId, consultant_id: demoConsultant.id, role_on_project: "Research associate" },
  ]);

  const { data: demoInvoice } = await supabase
    .from("invoices")
    .insert({
      invoice_ref: "DEMO-INV-001",
      client_id: demoClient.id,
      project_id: demoProjectId,
      milestone_id: demoMilestone.id,
      due_date: inDays(15),
      amount: 250000,
      tax_note: "Demo — excluding tax, shouldered by client per contract.",
      status: "submitted",
      created_by: coreId,
    })
    .select()
    .single();

  await supabase.rpc("record_payment", {
    p_invoice_id: demoInvoice.id,
    p_amount: 100000,
    p_payment_date: inDays(-2),
    p_method: "Bank transfer",
    p_created_by: coreId,
  });

  console.log("\nDone. Login accounts (password: %s):", DEMO_PASSWORD);
  console.log("  owner@strategnosis.demo       (Owner)");
  console.log("  core@strategnosis.demo        (Core Team)");
  console.log("  consultant@strategnosis.demo  (Temporary Consultant)");
  console.log("\n7 real client engagements seeded from the monitoring sheet, plus 2 real");
  console.log("pipeline opportunities, plus one labeled 'Demo —' showcase trio.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
