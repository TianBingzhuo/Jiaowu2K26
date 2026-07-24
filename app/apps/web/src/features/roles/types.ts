export const ROLE_IDS = [
  "student",
  "teacher",
  "advisor",
  "program_lead",
  "undergraduate_office",
] as const;

export type RoleId = (typeof ROLE_IDS)[number];

export type RoleExperience =
  | "smartcourse"
  | "worldexam"
  | "rosterlab"
  | "academicmirror"
  | "performancecenter"
  | "opportunitymarket"
  | "coachscouting"
  | "campuslife"
  | "campuspass";

export type RoleSmartCourseEntry =
  | "authoring"
  | "review"
  | "publish"
  | "student"
  | "replay";

export type InstitutionalWorkspaceView =
  | "case_desk"
  | "course_studio"
  | "curriculum_lab"
  | "governance_desk";

export type RoleDestination =
  | { type: "home" }
  | { type: "panel"; panel: "courses" | "evidence" }
  | { type: "workspace"; view: InstitutionalWorkspaceView }
  | {
      type: "module";
      experience: RoleExperience;
      smartCourseEntry?: RoleSmartCourseEntry;
    }
  | { type: "planned"; label: string };

export type RoleIconKey =
  | "home"
  | "course"
  | "mirror"
  | "roster"
  | "exam"
  | "performance"
  | "opportunity"
  | "scouting"
  | "campus"
  | "pass"
  | "evidence"
  | "people"
  | "policy"
  | "action";

export type RoleNavigationItem = {
  id: string;
  label: string;
  icon: RoleIconKey;
  destination: RoleDestination;
};

export type RolePriority = {
  id: string;
  kicker: string;
  title: string;
  detail: string;
  status: string;
  sourceLabel: string;
  icon: RoleIconKey;
  destination: RoleDestination;
};

export type RoleMetric = {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "orange" | "green" | "violet";
};

export type RoleProfile = {
  id: RoleId;
  formalRole: string;
  gameMode: string;
  shortLabel: string;
  displayName: string;
  organization: string;
  identityLine: string;
  roleSummary: string;
  periodLabel: string;
  headline: string;
  briefing: string;
  coachNote: string;
  primaryActionLabel: string;
  primaryDestination: RoleDestination;
  accent: "orange" | "blue" | "teal" | "gold" | "violet";
  authority: "demo_fixture";
  requiresProductionSso: true;
  navigation: RoleNavigationItem[];
  priorities: RolePriority[];
  metrics: RoleMetric[];
  visibleScope: string[];
  prohibitedScope: string[];
};

export type RoleFixture = {
  schemaVersion: "1.0.0";
  generatedAt: string;
  authority: "demo_fixture";
  productionAuthentication: "external_sso_required";
  productionAuthorization: "server_enforced_required";
  workflow: [
    "Briefing",
    "Choose",
    "Execute",
    "Replay",
    "Next Move",
  ];
  profiles: RoleProfile[];
};
