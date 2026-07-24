import { describe, expect, it } from "vitest";
import {
  campusPassBoxScore,
  checkOffline,
  chooseManualFallback,
  correctAccessLog,
  createCampusPassState,
  createGuestDraft,
  createLossCase,
  presentCredential,
  requestAccess,
  selectCredential,
  setCarrier,
  updateRequestMirror,
} from "../src/features/campuspass/engine";

describe("Campus Pass fixture engine", () => {
  it("starts with an explicit non-authoritative wallet", () => {
    const state = createCampusPassState();
    const score = campusPassBoxScore(state);

    expect(state.fixture.data_mode).toBe("demo_fixture");
    expect(state.fixture.credentials).toHaveLength(3);
    expect(score.official_credentials_issued).toBe(0);
    expect(score.official_access_actions_executed).toBe(0);
    expect(score.source_passwords_stored).toBe(0);
    expect(score.precise_tracking_events).toBe(0);
  });

  it("rejects a static capture of a dynamic credential", () => {
    let state = createCampusPassState();
    state = setCarrier(state, "dynamic_qr");
    state = presentCredential(state, true);

    expect(state.presentations.at(-1)).toMatchObject({
      carrier: "dynamic_qr",
      static_capture: true,
      accepted_by_demo_reader: false,
      official_access_granted: false,
    });
    expect(state.audit.at(-1)?.action).toBe("present_credential");
  });

  it("keeps a normal reader drill local even when fixture rules accept it", () => {
    let state = createCampusPassState();
    state = setCarrier(state, "nfc");
    state = presentCredential(state, false);

    expect(state.presentations.at(-1)).toMatchObject({
      accepted_by_demo_reader: true,
      official_access_granted: false,
    });
    expect(campusPassBoxScore(state).official_access_actions_executed).toBe(
      0,
    );
  });

  it("explains blockers and only advances an eligible authority mirror", () => {
    let state = createCampusPassState();
    state = requestAccess(state, "zone-robotics-lab", "完成课程实验");
    const blocked = state.access_requests.at(-1);
    expect(blocked?.status).toBe("draft_blocked_prerequisites");
    expect(blocked?.missing_prerequisite_ids.length).toBeGreaterThan(1);
    expect(() =>
      updateRequestMirror(state, blocked?.id ?? "", "reviewing"),
    ).toThrow(/前置条件/);

    state = requestAccess(state, "zone-library", "完成晚间课程复习");
    const eligible = state.access_requests.at(-1);
    expect(eligible?.status).toBe("submitted");
    state = updateRequestMirror(state, eligible?.id ?? "", "reviewing");
    expect(state.access_requests.at(-1)).toMatchObject({
      status: "reviewing",
      authoritative: false,
      experience_executed_access: false,
    });
  });

  it("keeps guest, loss, offline, correction and no-phone flows bounded", () => {
    let state = createCampusPassState();
    state = createGuestDraft(
      state,
      "zone-library",
      "参加公开讲座",
      "NAN Fixture",
      2,
    );
    state = createLossCase(state, "freeze");
    state = checkOffline(
      state,
      "zone-robotics-lab",
      "physical_card",
    );
    state = correctAccessLog(
      state,
      "access-record-001",
      "本人当时没有进入该区域，请核对读卡器记录。",
    );
    state = chooseManualFallback(
      state,
      "fallback-access-desk",
      "手机没电，需要人工核验",
    );

    expect(state.guest_pass_drafts.at(-1)).toMatchObject({
      auto_expires: true,
      authoritative: false,
    });
    expect(state.loss_cases.at(-1)?.experience_executed_action).toBe(false);
    expect(state.offline_checks.at(-1)).toMatchObject({
      valid: false,
      cryptographically_verified: false,
      official_access_granted: false,
    });
    expect(state.log_corrections.at(-1)?.status).toBe("submitted");
    expect(
      state.manual_fallback_selections.at(-1)?.experience_executed_access,
    ).toBe(false);
  });

  it("does not allow an expired credential to pass the fixture reader", () => {
    let state = createCampusPassState();
    state = selectCredential(state, "credential-visitor-expired");
    state = setCarrier(state, "physical_card");
    state = presentCredential(state, false);

    expect(state.presentations.at(-1)).toMatchObject({
      accepted_by_demo_reader: false,
      official_access_granted: false,
    });
  });
});
