// Seed / demo data for local setup and evaluation.
// Run once against a fresh Supabase project, after applying /supabase/migrations:
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
    // Already exists — look it up instead of failing the whole seed run.
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

async function main() {
  console.log("Seeding services…");
  await supabase.from("services").upsert(
    SERVICE_CATEGORIES.map((c) => ({ name: c.name, category: c.name, description: c.description })),
    { onConflict: "name" }
  );
  const { data: services } = await supabase.from("services").select("*");
  const serviceByName = Object.fromEntries(services.map((s) => [s.name, s]));

  console.log("Creating demo users (password: %s)…", DEMO_PASSWORD);
  const ownerId = await upsertDemoUser("owner@strategnosis.demo", "Demo Owner", "owner");
  const coreId = await upsertDemoUser("core@strategnosis.demo", "Demo Core Team", "core_team");
  const tempId = await upsertDemoUser("consultant@strategnosis.demo", "Demo Temp Consultant", "temp_consultant");

  console.log("Seeding clients & contacts…");
  const clientsData = [
    { org_name: "Sample General Hospital", org_type: "Hospital", sector: "Healthcare", status: "active_client", source: "Referral" },
    { org_name: "Metro Cooperative Development Council", org_type: "Cooperative", sector: "Cooperative", status: "prospect", source: "Speaking engagement" },
    { org_name: "Provincial Health Office", org_type: "Government", sector: "Government", status: "prospect", source: "Procurement invitation" },
    { org_name: "St. Luke Faith Academy", org_type: "Educational institution", sector: "Education", status: "previous_client", source: "Direct inquiry" },
    { org_name: "Community Health Alliance", org_type: "NGO", sector: "Development", status: "dormant", source: "Professional network" },
  ];
  const clientIds = {};
  for (const c of clientsData) {
    const { data, error } = await supabase
      .from("clients")
      .insert({ ...c, relationship_owner: ownerId, created_by: ownerId, updated_by: ownerId })
      .select()
      .single();
    if (error) throw error;
    clientIds[c.org_name] = data.id;
    await supabase.from("contacts").insert({
      client_id: data.id,
      name: `Contact Person, ${c.org_name}`,
      position: "Administrator",
      email: `contact@${c.org_name.toLowerCase().replace(/[^a-z]+/g, "")}.demo`,
      is_primary: true,
    });
  }

  console.log("Seeding opportunities…");
  const today = new Date();
  const inDays = (n) => new Date(today.getTime() + n * 86400000).toISOString().slice(0, 10);

  const opportunitiesData = [
    {
      title: "Strategic Plan Refresh 2027-2031",
      client_id: clientIds["Sample General Hospital"],
      service: "Strategic Management and Planning",
      stage: "won",
      estimated_value: 850000,
      probability_pct: 100,
      next_action: "Kickoff meeting",
      next_action_due: inDays(3),
      source: "Referral",
    },
    {
      title: "Competency-Based HR Framework",
      client_id: clientIds["Metro Cooperative Development Council"],
      service: "Competency-Based HR Systems",
      stage: "proposal_submitted",
      estimated_value: 420000,
      probability_pct: 50,
      next_action: "Follow up on proposal decision",
      next_action_due: inDays(5),
      source: "Speaking engagement",
    },
    {
      title: "Hospital Feasibility Study",
      client_id: clientIds["Provincial Health Office"],
      service: "Feasibility Studies",
      stage: "negotiation",
      estimated_value: 1200000,
      probability_pct: 60,
      next_action: "Revise budget per client comments",
      next_action_due: inDays(-2),
      source: "Procurement invitation",
    },
    {
      title: "Leadership Development Series",
      client_id: clientIds["St. Luke Faith Academy"],
      service: "Leadership and Management Development",
      stage: "qualification",
      estimated_value: 300000,
      probability_pct: 30,
      next_action: "Discovery call",
      next_action_due: inDays(10),
      source: "Direct inquiry",
    },
    {
      title: "M&E Framework for Health Program",
      client_id: clientIds["Community Health Alliance"],
      service: "Monitoring and Evaluation",
      stage: "lost",
      estimated_value: 200000,
      probability_pct: 0,
      next_action: "N/A",
      next_action_due: inDays(-30),
      source: "Professional network",
      reason_lost: "Client secured internal funding instead.",
    },
  ];

  const oppIds = {};
  for (const o of opportunitiesData) {
    const { service, ...rest } = o;
    const { data, error } = await supabase
      .from("opportunities")
      .insert({
        ...rest,
        service_id: serviceByName[service]?.id,
        owner_id: ownerId,
        created_by: ownerId,
        updated_by: ownerId,
      })
      .select()
      .single();
    if (error) throw error;
    oppIds[o.title] = data.id;
  }

  console.log("Converting the won opportunity into a project…");
  const { data: projectId, error: convertError } = await supabase.rpc("convert_opportunity_to_project", {
    p_opportunity_id: oppIds["Strategic Plan Refresh 2027-2031"],
  });
  if (convertError) throw convertError;

  await supabase
    .from("projects")
    .update({
      project_manager_id: coreId,
      status: "in_progress",
      health_status: "green",
      start_date: inDays(-10),
      end_date: inDays(120),
      contract_reference: "SGH-2027-001",
    })
    .eq("id", projectId);

  console.log("Seeding consultants…");
  const { data: consultant1 } = await supabase
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

  await supabase.from("consultants").insert({
    full_name: "Sample Facilitator",
    title: "Leadership Facilitator",
    expertise: ["Leadership and Management Development", "Training, Facilitation, Coaching, and Mentoring"],
    rate: 8000,
    rate_currency: "PHP",
    availability: "By engagement",
    location: "Cavite",
    travel_availability: true,
    active: true,
  });

  console.log("Seeding milestones, tasks, team, documents…");
  const { data: milestone1 } = await supabase
    .from("milestones")
    .insert({
      project_id: projectId,
      title: "Discovery workshops complete",
      responsible_id: coreId,
      due_date: inDays(14),
      status: "in_progress",
      completion_pct: 40,
      billing_trigger: true,
    })
    .select()
    .single();

  await supabase.from("milestones").insert({
    project_id: projectId,
    title: "Draft strategic plan submitted",
    responsible_id: ownerId,
    due_date: inDays(45),
    status: "not_started",
    completion_pct: 0,
    billing_trigger: true,
    client_acceptance_required: true,
  });

  await supabase.from("tasks").insert([
    {
      project_id: projectId,
      milestone_id: milestone1.id,
      title: "Compile stakeholder interview notes",
      assigned_to: tempId,
      priority: "high",
      due_date: inDays(-1),
      status: "in_progress",
      created_by: coreId,
    },
    {
      project_id: projectId,
      milestone_id: milestone1.id,
      title: "Draft SWOT summary",
      assigned_to: coreId,
      priority: "medium",
      due_date: inDays(4),
      status: "not_started",
      created_by: coreId,
    },
  ]);

  await supabase.from("project_assignments").insert([
    { project_id: projectId, user_id: coreId, role_on_project: "Project coordinator" },
    { project_id: projectId, consultant_id: consultant1.id, role_on_project: "Research associate" },
  ]);

  await supabase.from("documents").insert([
    {
      label: "Signed engagement contract",
      category: "Contract",
      external_link: "https://drive.google.com/example-contract",
      linked_entity_type: "project",
      linked_entity_id: projectId,
      uploaded_by: ownerId,
    },
  ]);

  console.log("Seeding an invoice with a partial payment…");
  const { data: invoice } = await supabase
    .from("invoices")
    .insert({
      invoice_ref: "INV-DEMO-001",
      client_id: clientIds["Sample General Hospital"],
      project_id: projectId,
      milestone_id: milestone1.id,
      due_date: inDays(15),
      amount: 300000,
      tax_note: "Excluding tax — shouldered by client per contract.",
      status: "submitted",
      created_by: coreId,
    })
    .select()
    .single();

  await supabase.rpc("record_payment", {
    p_invoice_id: invoice.id,
    p_amount: 150000,
    p_payment_date: inDays(-2),
    p_method: "Bank transfer",
    p_created_by: coreId,
  });

  console.log("Seeding a public inquiry…");
  await supabase.from("public_inquiries").insert({
    name: "Prospective Client",
    organization: "Sample Rural Health Unit",
    email: "inquiry@example.com",
    message: "We're interested in a workforce planning engagement for our regional office.",
    service_interest: "Workforce Planning and Organizational Design",
  });

  console.log("\nDone. Demo logins (password: %s):", DEMO_PASSWORD);
  console.log("  owner@strategnosis.demo       (Owner)");
  console.log("  core@strategnosis.demo        (Core Team)");
  console.log("  consultant@strategnosis.demo  (Temporary Consultant)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
