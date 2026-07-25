import { describe, expect, it } from "vitest";
import {
  buildMentorHandoff,
  campusBoxScore,
  campusRecommendations,
  confirmTeamCounterparty,
  createCampusLifeState,
  expressTeamIntent,
  planCampusRoute,
  recordCampusReceipt,
  reportCampusSource,
  saveEventToCalendar,
  saveToMyCourt,
  searchCampusLife,
  setCampusOffline,
  updateCampusJourney,
  updateCampusNotifications,
  updateCampusProfile,
} from "../src/features/campuslife/engine";

describe("F-008 Campus Life Hub engine", () => {
  it("keeps services, events, sources, expiry, accessibility and emergency coverage", () => {
    const state = createCampusLifeState();
    expect(state.fixture.resources.length).toBeGreaterThanOrEqual(5);
    expect(state.fixture.events.some((item) => item.status === "expired")).toBe(
      true,
    );
    expect(state.fixture.routes.some((item) => item.accessible)).toBe(true);
    expect(
      state.fixture.escalation_routes.some((item) => item.emergency),
    ).toBe(true);
  });

  it("supports explainable search and falls back cleanly when profiling is disabled", () => {
    let state = updateCampusProfile(createCampusLifeState(), false, []);
    state = searchCampusLife(state, {
      text: "实验",
      category: null,
      location_id: null,
      delivery_mode: null,
      accessibility_required: true,
      include_expired: false,
    });
    expect(state.search_result.fallback_used).toBe(true);
    expect(state.search_result.event_ids).toContain("event-film-room");
    expect(state.search_result.explanation).toMatch(/画像已关闭/);
  });

  it("saves privately without creating registration or application state", () => {
    const state = saveToMyCourt(
      createCampusLifeState(),
      "service-library-access",
      "service",
    );
    expect(state.saved_items).toHaveLength(1);
    expect(state.audit.at(-1)?.detail).toMatch(/privately/);
  });

  it("mirrors calendar conflicts but never registers the student", () => {
    const state = saveEventToCalendar(
      createCampusLifeState(),
      "event-film-room",
    );
    expect(state.calendar_entries[0].registration_performed).toBe(false);
    expect(state.calendar_entries[0].conflict_labels).toHaveLength(1);
  });

  it("plans a static accessible route with zero location tracking", () => {
    const state = planCampusRoute(
      createCampusLifeState(),
      "loc-dorm",
      "loc-library",
      true,
    );
    expect(state.selected_route?.accessible).toBe(true);
    expect(campusBoxScore(state).location_tracking_events).toBe(0);
  });

  it("keeps the personal service journey explicitly non-authoritative", () => {
    const state = updateCampusJourney(
      createCampusLifeState(),
      "service-library-access",
      "waiting_external",
      "等待学校正式系统反馈。",
    );
    expect(state.journey_mirrors[0].authoritative).toBe(false);
    expect(state.journey_mirrors[0].status).toBe("waiting_external");
  });

  it("requires mutual intent before releasing minimum team fields", () => {
    let state = expressTeamIntent(
      createCampusLifeState(),
      "team-signal-story",
    );
    expect(state.team_intents[0].disclosed_fields).toEqual([]);
    state = confirmTeamCounterparty(state, "team-signal-story");
    expect(state.team_intents[0].disclosure_status).toBe("mutual_intent");
    expect(state.team_intents[0].disclosed_fields).toHaveLength(2);
  });

  it("builds a mentor handoff without fabricating a response", () => {
    const state = buildMentorHandoff(
      createCampusLifeState(),
      "mentor-senior-fixture",
      "这个服务的正式办理入口和时间边界在哪里？",
    );
    expect(state.mentor_handoffs[0].status).toBe("ready_for_student");
    expect(state.mentor_handoffs[0].mentor_response).toBeNull();
  });

  it("keeps emergency alerts separate from marketing preferences", () => {
    const state = updateCampusNotifications(
      createCampusLifeState(),
      "weekly",
      true,
    );
    expect(state.notification_settings.emergency_enabled).toBe(true);
    expect(state.notification_settings.marketing_enabled).toBe(true);
  });

  it("creates versioned source corrections without overwriting the fixture", () => {
    const state = reportCampusSource(
      createCampusLifeState(),
      "service-library-access",
      "开放时间需要人工核对新的来源版本。",
    );
    expect(state.corrections[0].status).toBe("submitted");
    expect(
      state.fixture.resources.find(
        (item) => item.id === "service-library-access",
      )?.status,
    ).toBe("active");
  });

  it("keeps optional footprints private and outside student-value scoring", () => {
    const state = recordCampusReceipt(
      createCampusLifeState(),
      "event-maker-night",
      "attended",
      "只记录本人的学习收获。",
    );
    expect(state.receipts[0]).toMatchObject({
      private: true,
      affects_student_value: false,
    });
    expect(campusBoxScore(state).participation_value_scores).toBe(0);
  });

  it("uses only active events for recommendations and explains both modes", () => {
    const profiled = createCampusLifeState();
    expect(campusRecommendations(profiled).every((item) => item.explanation))
      .toBe(true);
    const fallback = updateCampusProfile(profiled, false, []);
    expect(campusRecommendations(fallback)[0].explanation).toMatch(
      /画像关闭/,
    );
  });

  it("rebuilds the action cards from the user's visible intent filters", () => {
    const searched = searchCampusLife(createCampusLifeState(), {
      text: "Research",
      category: null,
      location_id: null,
      delivery_mode: null,
      accessibility_required: false,
      include_expired: false,
    });
    const recommendations = campusRecommendations(searched);

    expect(recommendations.map((item) => item.id)).toEqual([
      "event-writing-sprint",
    ]);
    expect(recommendations[0].explanation).toMatch(
      /匹配可见筛选（目标：Research）/,
    );
  });

  it("blocks writes offline and reports zero official-result claims", () => {
    const offline = setCampusOffline(createCampusLifeState(), true);
    expect(() =>
      saveToMyCourt(offline, "event-maker-night", "event"),
    ).toThrow(/离线/);
    expect(campusBoxScore(offline)).toMatchObject({
      official_results_claimed: 0,
      location_tracking_events: 0,
      participation_value_scores: 0,
    });
  });
});
