import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contractsRoot = join(root, 'app', 'contracts', 'v1');
const fixturePath = join(root, 'app', 'fixtures', 'v1', 'generated-object.bst.json');
const careerFixturePath = join(root, 'app', 'fixtures', 'v1', 'career-season.demo.json');
const worldExamFixturePath = join(root, 'app', 'fixtures', 'v1', 'world-exam.demo.json');
const rosterFixturePath = join(root, 'app', 'fixtures', 'v1', 'roster-lab.demo.json');
const mirrorFixturePath = join(root, 'app', 'fixtures', 'v1', 'academic-mirror.demo.json');
const performanceFixturePath = join(root, 'app', 'fixtures', 'v1', 'performance-center.demo.json');
const opportunityFixturePath = join(root, 'app', 'fixtures', 'v1', 'opportunity-market.demo.json');
const coachScoutingFixturePath = join(root, 'app', 'fixtures', 'v1', 'coach-scouting.demo.json');
const campusLifeFixturePath = join(root, 'app', 'fixtures', 'v1', 'campus-life.demo.json');
const campusPassFixturePath = join(root, 'app', 'fixtures', 'v1', 'campus-pass.demo.json');
const manifestPath = join(root, 'PROJECT-MANIFEST.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const schemas = readdirSync(contractsRoot)
  .filter((name) => name.endsWith('.schema.json'))
  .sort();

assert(schemas.length >= 4, 'Expected at least four versioned JSON Schemas.');
for (const schemaName of schemas) {
  const schema = readJson(join(contractsRoot, schemaName));
  assert(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', `${schemaName} must use JSON Schema 2020-12.`);
  assert(typeof schema.$id === 'string' && schema.$id.length > 0, `${schemaName} needs a stable $id.`);
}

const fixture = readJson(fixturePath);
assert(fixture.schema_version.startsWith('1.'), 'Golden fixture must use contract major version 1.');
assert(fixture.fixture === true, 'Golden fixture must remain explicitly labelled as fixture data.');
assert(fixture.generation_mode === 'fixture', 'Golden fixture must not impersonate model generation.');
assert(fixture.review_state === 'draft' && fixture.revision === 0, 'Golden fixture must begin at draft revision 0.');
assert(Array.isArray(fixture.source_ids) && fixture.source_ids.length > 0, 'Golden fixture needs source IDs.');
assert(Array.isArray(fixture.evidence) && fixture.evidence.length > 0, 'Golden fixture needs evidence.');
for (const item of fixture.evidence) {
  assert(fixture.source_ids.includes(item.source_fragment_id), `Evidence ${item.id} points outside source_ids.`);
}

const careerFixture = readJson(careerFixturePath);
assert(careerFixture.schema_version.startsWith('1.'), 'Career fixture must use contract major version 1.');
assert(careerFixture.data_mode === 'fixture', 'Career fixture must remain explicitly labelled as fixture data.');
assert(careerFixture.semester?.season_number === 4 && careerFixture.semester?.total_seasons === 8, 'Career fixture must expose the accepted 4/8 demo season.');
assert(Array.isArray(careerFixture.courses) && careerFixture.courses.length === 6, 'Career fixture must expose the six-course sanitized roster.');
assert(careerFixture.courses.some((course) => course.linked_published_id), 'Career fixture needs one F-001 published jump target.');
assert(careerFixture.courses.some((course) => course.linked_published_id === null), 'Career fixture needs an empty-content fallback state.');
assert(Array.isArray(careerFixture.deadlines) && careerFixture.deadlines.length >= 1, 'Career fixture needs at least one upcoming deadline.');

const worldExamFixture = readJson(worldExamFixturePath);
assert(worldExamFixture.schema_version.startsWith('1.'), 'World Exam fixture must use contract major version 1.');
assert(worldExamFixture.data_mode === 'fixture', 'World Exam fixture must remain explicitly labelled as fixture data.');
assert(worldExamFixture.event?.is_formal === false, 'World Exam public demo must not impersonate a formal exam.');
assert(Array.isArray(worldExamFixture.briefing?.sources) && worldExamFixture.briefing.sources.length >= 1, 'World Exam briefing needs source locators.');
assert(Array.isArray(worldExamFixture.playbook) && worldExamFixture.playbook.length >= 1, 'World Exam fixture needs a review playbook.');
assert(Array.isArray(worldExamFixture.match_questions) && worldExamFixture.match_questions.length >= 1, 'World Exam fixture needs Key Match questions.');
const declaredExamSources = new Set(worldExamFixture.briefing.sources.map((source) => source.source_id));
const examSourceIds = [
  ...worldExamFixture.warmup.source_ids,
  ...worldExamFixture.playbook.flatMap((section) => section.items.flatMap((item) => item.source_ids)),
  ...worldExamFixture.match_questions.flatMap((question) => [
    ...question.source_ids,
    ...question.ai_trace.map((claim) => claim.source_id),
  ]),
];
assert(examSourceIds.every((sourceId) => declaredExamSources.has(sourceId)), 'World Exam content must only use sources declared in the briefing.');
const examObjectIds = [
  worldExamFixture.warmup.object_id,
  ...worldExamFixture.playbook.flatMap((section) => section.items.map((item) => item.object_id)),
  ...worldExamFixture.match_questions.map((question) => question.object_id),
];
assert(examObjectIds.every((objectId) => objectId.startsWith('generated-sls-')), 'World Exam content must reuse the declared F-001 SLS object namespace.');
assert(worldExamFixture.match_questions.some((question) => question.ai_trace.some((claim) => claim.confidence === 'unsupported')), 'World Exam fixture needs an unsupported AI claim for evidence-challenge QA.');

const rosterFixture = readJson(rosterFixturePath);
assert(rosterFixture.schema_version.startsWith('1.'), 'Roster Lab fixture must use contract major version 1.');
assert(rosterFixture.data_mode === 'fixture', 'Roster Lab fixture must remain explicitly labelled as fixture data.');
assert(Array.isArray(rosterFixture.catalog) && rosterFixture.catalog.length >= 8 && rosterFixture.catalog.length <= 20, 'Roster Lab fixture must contain 8-20 courses.');
assert(Array.isArray(rosterFixture.plans) && rosterFixture.plans.length >= 3, 'Roster Lab fixture must expose at least three plans.');
assert(rosterFixture.plans.every((plan) => plan.hard_constraints_met === true), 'Roster Lab declared plans must satisfy hard constraints.');
assert(rosterFixture.plans.every((plan) => plan.is_formal_enrollment === false), 'Roster Lab plans must not impersonate formal enrollment.');
assert(rosterFixture.plans.every((plan) => Array.isArray(plan.tradeoffs) && plan.tradeoffs.length >= 1), 'Every Roster Lab plan needs an explicit tradeoff.');
assert(rosterFixture.pins.some((pin) => pin.id === 'pin-sls-section' && pin.active === true), 'Roster Lab fixture needs the active anchor pin.');
assert(Array.isArray(rosterFixture.unsat?.minimal_conflict_set) && rosterFixture.unsat.minimal_conflict_set.length >= 1, 'Roster Lab fixture needs a minimal conflict set.');
assert(Array.isArray(rosterFixture.unsat?.blocking_chain) && rosterFixture.unsat.blocking_chain.length >= 1, 'Roster Lab fixture needs a blocking chain.');
assert(Array.isArray(rosterFixture.unsat?.relaxable_items) && rosterFixture.unsat.relaxable_items.length >= 1, 'Roster Lab fixture needs relaxable items.');

const mirrorFixture = readJson(mirrorFixturePath);
assert(mirrorFixture.schema_version.startsWith('1.'), 'Academic Mirror fixture must use contract major version 1.');
assert(mirrorFixture.data_mode === 'fixture' && mirrorFixture.read_only === true, 'Academic Mirror fixture must remain explicitly read-only fixture data.');
assert(Array.isArray(mirrorFixture.sources) && mirrorFixture.sources.length >= 2, 'Academic Mirror fixture needs at least two sources.');
const mirrorAdapters = new Set(mirrorFixture.sources.map((source) => source.adapter_kind));
assert(mirrorAdapters.has('demo_fixture') && mirrorAdapters.has('file_import'), 'Academic Mirror fixture needs both adapters.');
assert(Array.isArray(mirrorFixture.authority_catalog) && mirrorFixture.authority_catalog.length === 6, 'Academic Mirror fixture needs six authority definitions.');
const mirrorAuthorityLevels = new Set(
  mirrorFixture.records.flatMap((record) =>
    Object.values(record.fields).map((field) => field.provenance.declared_authority),
  ),
);
assert(mirrorAuthorityLevels.size === 6, 'Academic Mirror fields must exercise all six declared authority levels.');
assert(
  mirrorFixture.records.every((record) =>
    Object.values(record.fields).every((field) => field.provenance.effective_authority === 'demo_fixture'),
  ),
  'Academic Mirror public records must remain effectively demo_fixture.',
);
assert(
  mirrorFixture.snapshots.every(
    (snapshot) => snapshot.immutable === true && /^sha256:[a-f0-9]{64}$/.test(snapshot.content_hash),
  ),
  'Academic Mirror snapshots need immutable SHA-256 receipts.',
);
assert(
  mirrorFixture.conflicts.every((conflict) => conflict.options.length >= 2),
  'Academic Mirror conflicts must preserve at least two competing values.',
);
assert(
  mirrorFixture.audit.every(
    (event, index, events) =>
      event.append_only === true &&
      (index === 0 ? event.previous_event_hash === null : event.previous_event_hash === events[index - 1].event_hash),
  ),
  'Academic Mirror audit events must form an append-only chain.',
);

const performanceFixture = readJson(performanceFixturePath);
assert(
  performanceFixture.schema_version.startsWith('1.'),
  'Performance Center fixture must use contract major version 1.',
);
assert(
  performanceFixture.data_mode === 'fixture' &&
    performanceFixture.private_by_default === true &&
    performanceFixture.comparison_mode === 'self_only',
  'Performance Center must remain private, self-only fixture data.',
);
assert(
  Array.isArray(performanceFixture.metrics) &&
    performanceFixture.metrics.length >= 4 &&
    performanceFixture.metrics.every(
      (metric) =>
        metric.comparison_mode === 'self_only' &&
        metric.definition &&
        metric.limitation &&
        metric.correction_route,
    ),
  'Performance Center metrics need definitions, limits, correction routes and self-only comparison.',
);
assert(
  JSON.stringify(performanceFixture).includes('"class_rank"') &&
    performanceFixture.forbidden_inputs.includes('class_rank'),
  'Performance Center must explicitly forbid class-rank input.',
);
assert(
  Array.isArray(performanceFixture.abilities) &&
    new Set(performanceFixture.abilities.map((ability) => ability.id)).size === 4 &&
    performanceFixture.abilities.some(
      (ability) =>
        ability.id === 'ability-collaboration' &&
        ability.confidence === 'insufficient',
    ),
  'Performance Center must keep four independent dimensions and expose insufficient collaboration evidence.',
);
assert(
  performanceFixture.load_signals.length >= 3 &&
    performanceFixture.support_actions.length >= 1,
  'Performance Center load signals must be paired with support actions.',
);
assert(
  performanceFixture.badges.every(
    (badge) =>
      badge.private === true &&
      badge.affects_rights === false &&
      badge.criteria.length > 0,
  ),
  'Performance Center badges must be private, transparent and rights-neutral.',
);
assert(
  performanceFixture.recommendations.every(
    (recommendation) =>
      recommendation.generation_mode === 'rule_fixture' &&
      recommendation.cost &&
      recommendation.expected_effect &&
      recommendation.alternative,
  ),
  'Performance Center recommendations must remain transparent rule fixtures.',
);
assert(
  performanceFixture.research_gate.status ===
    'deferred_pending_human_evidence' &&
    performanceFixture.research_gate.default_variant === 'c_dimensions' &&
    performanceFixture.research_gate.evidence_count === 0 &&
    new Set(
      performanceFixture.research_gate.variants.map((variant) => variant.id),
    ).size === 3,
  'Degree Fahrenheit must remain a deferred A/B/C study with the no-metaphor C default.',
);
assert(
  performanceFixture.audit.every(
    (event, index, events) =>
      event.sequence === index + 1 &&
      (index === 0
        ? event.previous_event_hash === null
        : event.previous_event_hash === events[index - 1].event_hash),
  ),
  'Performance Center audit events must form an append-only chain.',
);

const opportunityFixture = readJson(opportunityFixturePath);
assert(
  opportunityFixture.schema_version.startsWith('1.') &&
    opportunityFixture.data_mode === 'demo_fixture' &&
    opportunityFixture.profile_visibility === 'private',
  'Opportunity Market must remain an explicitly private demo fixture.',
);
assert(
  Array.isArray(opportunityFixture.opportunities) &&
    opportunityFixture.opportunities.length >= 5 &&
    opportunityFixture.opportunities.length <= 20 &&
    opportunityFixture.opportunities.some((item) => item.status === 'expired'),
  'Opportunity Market needs 5-20 transparent items and an explicit expired example.',
);
assert(
  opportunityFixture.opportunities.every(
    (item) =>
      item.source_url?.startsWith('https://') &&
      item.source_version &&
      item.correction_route &&
      item.benefits?.length &&
      item.obligations?.length &&
      item.risks?.length &&
      item.eligibility_rule_ids?.length &&
      item.paid_ranking_factor === 0 &&
      item.random_allocation === false &&
      item.auction_enabled === false,
  ),
  'Every opportunity needs transparent sources, rules, value/cost information, and zero manipulation.',
);
assert(
  Array.isArray(opportunityFixture.packs) &&
    opportunityFixture.packs.length >= 2 &&
    opportunityFixture.packs.every(
      (pack) => pack.transparent === true && pack.paid_random === false,
    ),
  'Opportunity packs must be complete, transparent, and non-random.',
);
assert(
  opportunityFixture.profile_fields.every(
    (field) => field.private === true && field.selectable === true,
  ) &&
    ['health', 'family', 'financial_account', 'campus_access_log', 'payment_history'].every(
      (field) => opportunityFixture.forbidden_profile_field_ids.includes(field),
    ) &&
    opportunityFixture.selected_profile_field_ids.every(
      (field) => !opportunityFixture.forbidden_profile_field_ids.includes(field),
    ),
  'Opportunity Profile must be private, selective, and exclude sensitive proxy inputs.',
);
assert(
  opportunityFixture.entitlements.every(
    (item) => item.purchasable_qualification === false,
  ) &&
    opportunityFixture.capacity.every(
      (item) => item.can_purchase_eligibility === false,
    ),
  'Entitlements and capacity must never purchase eligibility.',
);
assert(
  new Set(opportunityFixture.pathways.map((item) => item.pathway_type)).size === 3 &&
    opportunityFixture.pathways.every(
      (item) =>
        item.authoritative === false &&
        item.rollback_point &&
        item.approval_path?.length,
    ),
  'Opportunity Market needs reversible, non-authoritative A/B/C pathway scenarios.',
);
assert(
  opportunityFixture.portfolio_artifacts.every(
    (item) =>
      item.includes_original_material === false &&
      ['F-001', 'F-005'].includes(item.source_module),
  ),
  'Opportunity portfolio exports must preserve source references without original course material.',
);
assert(
  Object.values(opportunityFixture.invariants).every((value) => value === true),
  'Opportunity Market anti-manipulation invariants must all remain enabled.',
);
assert(
  opportunityFixture.audit.every(
    (event, index, events) =>
      event.sequence === index + 1 &&
      (index === 0
        ? event.previous_event_hash === null
        : event.previous_event_hash === events[index - 1].event_hash),
  ),
  'Opportunity Market audit events must form an append-only chain.',
);

const coachScoutingFixture = readJson(coachScoutingFixturePath);
assert(
  coachScoutingFixture.schema_version.startsWith('1.') &&
    coachScoutingFixture.data_mode === 'demo_fixture',
  'Coach & Scouting must remain an explicit demo fixture.',
);
assert(
  Array.isArray(coachScoutingFixture.sources) &&
    coachScoutingFixture.sources.length === 5 &&
    new Set(coachScoutingFixture.sources.map((source) => source.tier)).size === 5 &&
    coachScoutingFixture.sources.some(
      (source) => source.tier === 'system_inference' && source.verified === false,
    ),
  'Coach & Scouting needs five separated source tiers and honest inference labels.',
);
assert(
  coachScoutingFixture.course.course_id !==
    coachScoutingFixture.course.instructor_assignment_id &&
    coachScoutingFixture.teaching.offering_id ===
      coachScoutingFixture.course.offering_id,
  'Course, instructor assignment and offering identities must remain separate.',
);
assert(
  coachScoutingFixture.course.assessments.reduce(
    (total, item) => total + item.weight,
    0,
  ) === 100 &&
    coachScoutingFixture.teaching.activities.reduce(
      (total, item) => total + item.share,
      0,
    ) === 100,
  'Coach assessment and teaching structures must each total 100%.',
);
assert(
  coachScoutingFixture.office_hours.some((item) => item.status === 'active') &&
    coachScoutingFixture.office_hours.some((item) => item.status === 'expired'),
  'Coach Office Hours must show current and explicitly expired records.',
);
assert(
  coachScoutingFixture.workload.every(
    (item) =>
      (item.sample_size === null &&
        item.minimum_sample === null &&
        item.publishable === true) ||
      (Number.isInteger(item.sample_size) &&
        Number.isInteger(item.minimum_sample) &&
        item.publishable === (item.sample_size >= item.minimum_sample)),
  ) &&
    coachScoutingFixture.feedback_aggregates.every(
      (item) => item.published === (item.sample_size >= item.minimum_sample),
    ),
  'Coach workload and feedback aggregates must obey explicit sample thresholds.',
);
assert(
  ['prepared_for', 'challenges', 'actions', 'unknowns'].every(
    (quadrant) => coachScoutingFixture.scouting[quadrant]?.length > 0,
  ),
  'Scouting Report needs four evidence-bearing quadrants.',
);
assert(
  coachScoutingFixture.versions.length >= 2 &&
    coachScoutingFixture.versions.every(
      (version) => version.course_id === coachScoutingFixture.course.course_id,
    ),
  'Version Film must compare registered versions of one course.',
);
assert(
  coachScoutingFixture.team_fields.every(
    (field) =>
      field.private === true &&
      (field.kind !== 'sensitive' || field.selectable === false),
  ),
  'Coach team matching must keep every field private and every sensitive field disabled.',
);
assert(
  new Set(
    coachScoutingFixture.reminders.map((reminder) => reminder.reminder_type),
  ).size === 4,
  'Coach expectations need equipment, material, attendance and safety reminders.',
);
assert(
  Object.entries(coachScoutingFixture.invariants).every(
    ([key, value]) =>
      key === 'minimum_feedback_sample' ? value >= 5 : value === true,
  ),
  'Coach & Scouting fairness, truth and governance invariants must remain enabled.',
);
assert(
  coachScoutingFixture.audit.every(
    (event, index, events) =>
      event.sequence === index + 1 &&
      (index === 0
        ? event.previous_event_hash === null
        : event.previous_event_hash === events[index - 1].event_hash),
  ),
  'Coach & Scouting audit events must form an append-only chain.',
);

const campusLifeFixture = readJson(campusLifeFixturePath);
assert(
  campusLifeFixture.schema_version.startsWith('1.') &&
    campusLifeFixture.data_mode === 'demo_fixture',
  'Campus Life Hub must remain an explicit demo fixture.',
);
assert(
  Array.isArray(campusLifeFixture.sources) &&
    campusLifeFixture.sources.length >= 3 &&
    campusLifeFixture.sources.every(
      (source) =>
        source.official_url?.startsWith('https://') &&
        source.version &&
        source.correction_route,
    ),
  'Campus Life Hub needs versioned HTTPS sources and a correction route.',
);
assert(
  campusLifeFixture.resources.length >= 5 &&
    campusLifeFixture.resources.every(
      (resource) =>
        resource.official_action_url?.startsWith('https://') &&
        resource.service_boundary &&
        resource.source_id,
    ),
  'Campus services need official handoff URLs, source IDs, and explicit boundaries.',
);
assert(
  campusLifeFixture.events.length >= 4 &&
    campusLifeFixture.events.some((event) => event.status === 'expired'),
  'Campus Life Hub needs bounded events and an explicit expired-state example.',
);
assert(
  campusLifeFixture.routes.some((route) => route.accessible === true) &&
    campusLifeFixture.routes.every(
      (route) =>
        route.steps?.length &&
        Number.isInteger(route.estimated_minutes) &&
        route.source_id,
    ),
  'Campus Map needs at least one sourced accessible static route.',
);
assert(
  campusLifeFixture.escalation_routes.some(
    (route) =>
      route.emergency === true && route.official_url?.startsWith('https://'),
  ),
  'Campus Life Hub needs a direct official emergency route.',
);
assert(
  Object.values(campusLifeFixture.invariants).every((value) => value === true),
  'Campus Life Hub privacy, control, truth, and anti-scoring invariants must remain enabled.',
);

const campusPassFixture = readJson(campusPassFixturePath);
assert(
  campusPassFixture.schema_version.startsWith('1.') &&
    campusPassFixture.data_mode === 'demo_fixture',
  'Campus Pass must remain an explicit demo fixture.',
);
assert(
  campusPassFixture.sources.length >= 4 &&
    campusPassFixture.sources.every(
      (source) =>
        source.official_url?.startsWith('https://') &&
        source.version &&
        source.correction_route,
    ),
  'Campus Pass needs versioned HTTPS authority sources and correction routes.',
);
assert(
  campusPassFixture.identities.every(
    (identity) =>
      identity.source_password_stored === false &&
      identity.authority_source_id,
  ) &&
    campusPassFixture.credentials.length >= 3 &&
    campusPassFixture.credentials.every(
      (credential) =>
        credential.minimum_privilege === true &&
        credential.secret_material_stored === false &&
        credential.source_ids?.length,
    ),
  'Campus Pass identities and wallet items must preserve source, minimum-privilege and no-secret boundaries.',
);
assert(
  campusPassFixture.credentials.some((credential) =>
    credential.supported_carriers?.includes('dynamic_qr'),
  ) &&
    campusPassFixture.offline_policy.screenshot_is_credential === false,
  'Campus Pass must expose dynamic credential QA while refusing static screenshots.',
);
assert(
  campusPassFixture.zones.some((zone) => zone.requires_extra_approval) &&
    campusPassFixture.prerequisites.some(
      (prerequisite) => prerequisite.status !== 'fulfilled',
    ),
  'Campus Pass needs a sensitive-zone and unmet-prerequisite failure path.',
);
assert(
  campusPassFixture.self_access_records.every(
    (record) =>
      record.precise_location_retained === false &&
      record.retained_until &&
      record.correction_route,
  ) &&
    campusPassFixture.emergency_modes.every(
      (mode) => mode.experience_layer_can_execute === false,
    ) &&
    campusPassFixture.manual_fallbacks.some(
      (fallback) => fallback.accessible && fallback.requires_phone === false,
    ),
  'Campus Pass must avoid mobility profiling, keep emergency execution external and preserve a no-phone fallback.',
);
assert(
  Object.values(campusPassFixture.invariants).every((value) => value === true),
  'Campus Pass authority, privacy, accessibility and anti-impersonation invariants must remain enabled.',
);

const manifest = readJson(manifestPath);
assert(manifest.status?.phase === 'hacking', 'Manifest status must remain explicit during implementation.');

const openApi = readFileSync(join(contractsRoot, 'openapi.yaml'), 'utf8');
assert(openApi.startsWith('openapi: 3.1.0'), 'OpenAPI document must declare 3.1.0.');
assert(openApi.includes('/generated-objects/{object_id}/replay:'), 'OpenAPI document must expose the Phase 0 replay path.');
assert(openApi.includes('/generated-objects/{object_id}/interactions:'), 'OpenAPI document must expose the student interaction path.');
assert(openApi.includes('/career/current-semester:'), 'OpenAPI document must expose the current semester path.');
assert(openApi.includes('/career/course/{course_id}:'), 'OpenAPI document must expose the course detail path.');
assert(openApi.includes('/demo/semester:'), 'OpenAPI document must expose the F-002 fixture path.');
assert(openApi.includes('/exams/{exam_id}/attempts/complete:'), 'OpenAPI document must expose the F-005 completion path.');
assert(openApi.includes('/exams/{exam_id}/replay:'), 'OpenAPI document must expose the F-005 Replay path.');
assert(openApi.includes('/exams/{exam_id}/reflection:'), 'OpenAPI document must expose the private reflection path.');
assert(openApi.includes('/demo/world-exam:'), 'OpenAPI document must expose the F-005 fixture path.');
assert(openApi.includes('/roster/solve:'), 'OpenAPI document must expose the F-004 solve path.');
assert(openApi.includes('/roster/what-if:'), 'OpenAPI document must expose the F-004 What-if path.');
assert(openApi.includes('/roster/plans/{plan_id}/diff:'), 'OpenAPI document must expose the F-004 transaction diff path.');
assert(openApi.includes('/roster/plans/{plan_id}/lock:'), 'OpenAPI document must expose the F-004 replay lock path.');
assert(openApi.includes('/demo/roster:'), 'OpenAPI document must expose the F-004 fixture path.');
assert(openApi.includes('/mirror/sources:'), 'OpenAPI document must expose the F-003 source registry path.');
assert(openApi.includes('/mirror/sources/{source_id}/sync:'), 'OpenAPI document must expose the F-003 sync path.');
assert(openApi.includes('/mirror/records/{record_id}/provenance:'), 'OpenAPI document must expose field-level provenance.');
assert(openApi.includes('/mirror/conflicts/{conflict_id}/resolve:'), 'OpenAPI document must expose human conflict resolution.');
assert(openApi.includes('/mirror/consents:'), 'OpenAPI document must expose purpose-bound consent.');
assert(openApi.includes('/mirror/exports:'), 'OpenAPI document must expose portable mirror archives.');
assert(openApi.includes('/mirror/audit:'), 'OpenAPI document must expose append-only audit.');
assert(openApi.includes('/demo/mirror:'), 'OpenAPI document must expose the F-003 fixture path.');
assert(openApi.includes('/performance/dashboard:'), 'OpenAPI document must expose the F-006 dashboard.');
assert(openApi.includes('/performance/metrics:'), 'OpenAPI document must expose F-006 metric definitions.');
assert(openApi.includes('/performance/evidence/{evidence_id}:'), 'OpenAPI document must expose F-006 evidence lookup.');
assert(openApi.includes('/performance/recommendations/{recommendation_id}:'), 'OpenAPI document must expose student recommendation choice.');
assert(openApi.includes('/performance/climate:'), 'OpenAPI document must expose the bounded A/B/C research preview.');
assert(openApi.includes('/performance/shares:'), 'OpenAPI document must expose purpose-bound sharing.');
assert(openApi.includes('/performance/shares/{grant_id}:'), 'OpenAPI document must expose share revocation.');
assert(openApi.includes('/performance/corrections:'), 'OpenAPI document must expose versioned correction requests.');
assert(openApi.includes('/performance/harm-signals:'), 'OpenAPI document must expose the F-006 STOP gate.');
assert(openApi.includes('/performance/exports:'), 'OpenAPI document must expose readable untrusted private exports.');
assert(openApi.includes('/performance/replay:'), 'OpenAPI document must expose private append-only replay.');
assert(openApi.includes('/demo/performance:'), 'OpenAPI document must expose the F-006 fixture path.');
assert(openApi.includes('/opportunities/{opportunity_id}/eligibility:'), 'OpenAPI document must expose four-state opportunity eligibility.');
assert(openApi.includes('/opportunity-profile:'), 'OpenAPI document must expose selective private Profile fields.');
assert(openApi.includes('/opportunity-match:'), 'OpenAPI document must expose explainable matching.');
assert(openApi.includes('/opportunities/{opportunity_id}/disclosures:'), 'OpenAPI document must expose double-opt-in disclosure.');
assert(openApi.includes('/opportunity-disclosures/{grant_id}:'), 'OpenAPI document must expose disclosure revocation.');
assert(openApi.includes('/opportunities/{opportunity_id}/external-status:'), 'OpenAPI document must expose external-only application mirror status.');
assert(openApi.includes('/opportunities/{opportunity_id}/capacity-plans:'), 'OpenAPI document must expose bounded capacity What-if.');
assert(openApi.includes('/opportunity-pathways/{pathway_id}:'), 'OpenAPI document must expose reversible pathway scenarios.');
assert(openApi.includes('/opportunity-portfolio/exports:'), 'OpenAPI document must expose selected untrusted portfolio export.');
assert(openApi.includes('/opportunities/{opportunity_id}/reports:'), 'OpenAPI document must expose opportunity correction reports.');
assert(openApi.includes('/opportunity-fairness/run:'), 'OpenAPI document must expose anti-manipulation auditing.');
assert(openApi.includes('/opportunity-replay:'), 'OpenAPI document must expose append-only Opportunity Replay.');
assert(openApi.includes('/demo/opportunity-market:'), 'OpenAPI document must expose the F-009 fixture path.');
assert(openApi.includes('/coach-scouting/profile:'), 'OpenAPI document must expose the sourced Coach profile.');
assert(openApi.includes('/coach-scouting/versions/compare:'), 'OpenAPI document must expose Version Film comparison.');
assert(openApi.includes('/coach-scouting/corrections:'), 'OpenAPI document must expose teacher correction requests.');
assert(openApi.includes('/coach-scouting/feedback/aggregates:'), 'OpenAPI document must expose thresholded feedback.');
assert(openApi.includes('/coach-scouting/fairness/run:'), 'OpenAPI document must expose Coach fairness auditing.');
assert(openApi.includes('/coach-scouting/team-match:'), 'OpenAPI document must expose selective team matching.');
assert(openApi.includes('/coach-scouting/advisor-handoffs:'), 'OpenAPI document must expose truth-preserving Advisor Handoff.');
assert(openApi.includes('/coach-scouting/reports:'), 'OpenAPI document must expose governed reporting.');
assert(openApi.includes('/coach-scouting/replay:'), 'OpenAPI document must expose append-only Coach Replay.');
assert(openApi.includes('/demo/coach-scouting:'), 'OpenAPI document must expose the F-007 fixture path.');
assert(openApi.includes('/campus-life/search:'), 'OpenAPI document must expose Campus Life intent search.');
assert(openApi.includes('/campus-life/profile:'), 'OpenAPI document must expose optional Campus Life personalization.');
assert(openApi.includes('/campus-life/calendar:'), 'OpenAPI document must expose calendar mirror and conflict checks.');
assert(openApi.includes('/campus-life/routes:'), 'OpenAPI document must expose static accessible route planning.');
assert(openApi.includes('/campus-life/team-intents/{listing_id}:'), 'OpenAPI document must expose first-step team intent.');
assert(openApi.includes('/campus-life/team-intents/{listing_id}/counterparty:'), 'OpenAPI document must expose mutual-intent confirmation.');
assert(openApi.includes('/campus-life/mentor-handoffs:'), 'OpenAPI document must expose truth-preserving mentor handoff.');
assert(openApi.includes('/campus-life/notifications:'), 'OpenAPI document must separate emergency and marketing notifications.');
assert(openApi.includes('/campus-life/corrections:'), 'OpenAPI document must expose source correction.');
assert(openApi.includes('/campus-life/receipts:'), 'OpenAPI document must expose private non-scoring footprint receipts.');
assert(openApi.includes('/campus-life/mycourt/export:'), 'OpenAPI document must expose private untrusted MyCOURT export.');
assert(openApi.includes('/campus-life/replay:'), 'OpenAPI document must expose append-only Campus Replay.');
assert(openApi.includes('/demo/campus-life:'), 'OpenAPI document must expose the F-008 fixture path.');
assert(openApi.includes('/campus-pass/credentials/{credential_id}/present:'), 'OpenAPI document must expose the bounded credential test court.');
assert(openApi.includes('/campus-pass/access-requests:'), 'OpenAPI document must expose non-authoritative access requests.');
assert(openApi.includes('/campus-pass/access-requests/{request_id}/mirror:'), 'OpenAPI document must expose authority-mirror state updates.');
assert(openApi.includes('/campus-pass/guest-drafts:'), 'OpenAPI document must expose purpose-bound auto-expiring guest drafts.');
assert(openApi.includes('/campus-pass/loss-cases:'), 'OpenAPI document must expose official lost/freeze handoff preparation.');
assert(openApi.includes('/campus-pass/offline-checks:'), 'OpenAPI document must expose bounded offline checks.');
assert(openApi.includes('/campus-pass/access-log-corrections:'), 'OpenAPI document must expose append-only self-record correction.');
assert(openApi.includes('/campus-pass/manual-fallbacks:'), 'OpenAPI document must expose no-phone accessible fallback handoff.');
assert(openApi.includes('/campus-pass/replay:'), 'OpenAPI document must expose append-only Campus Pass Replay.');
assert(openApi.includes('/demo/campus-pass:'), 'OpenAPI document must expose the F-010 fixture path.');

console.log(`Verified ${schemas.length} schemas, ten golden fixtures, OpenAPI, and project manifest.`);
