import { describe, expect, it } from "vitest";
import {
  chooseSpatialIndex,
  directionFromGamepad,
  type RectLike,
} from "../src/lib/spatialNavigation";

const rect = (left: number, top: number, width = 100, height = 48): RectLike => ({
  left,
  right: left + width,
  top,
  bottom: top + height,
  width,
  height,
});

const gamepad = ({
  axes = [0, 0],
  pressed = [],
  mapping = "standard",
}: {
  axes?: number[];
  pressed?: number[];
  mapping?: GamepadMappingType;
}) =>
  ({
    axes,
    buttons: Array.from({ length: 18 }, (_, index) => ({
      pressed: pressed.includes(index),
      touched: pressed.includes(index),
      value: pressed.includes(index) ? 1 : 0,
    })),
    mapping,
  }) as unknown as Gamepad;

describe("spatial focus geometry", () => {
  it("chooses the aligned target in each requested direction", () => {
    const current = rect(200, 200);
    const candidates = [
      rect(200, 90),
      rect(200, 320),
      rect(40, 200),
      rect(380, 200),
      rect(330, 80),
    ];

    expect(chooseSpatialIndex(current, candidates, "up")).toBe(0);
    expect(chooseSpatialIndex(current, candidates, "down")).toBe(1);
    expect(chooseSpatialIndex(current, candidates, "left")).toBe(2);
    expect(chooseSpatialIndex(current, candidates, "right")).toBe(3);
  });

  it("returns no target when no control exists in that direction", () => {
    expect(
      chooseSpatialIndex(rect(100, 100), [rect(100, 200)], "up"),
    ).toBe(-1);
  });
});

describe("gamepad direction normalization", () => {
  it("maps the W3C D-pad buttons independently", () => {
    expect(directionFromGamepad(gamepad({ pressed: [12] }))).toBe("up");
    expect(directionFromGamepad(gamepad({ pressed: [13] }))).toBe("down");
    expect(directionFromGamepad(gamepad({ pressed: [14] }))).toBe("left");
    expect(directionFromGamepad(gamepad({ pressed: [15] }))).toBe("right");
  });

  it("applies a deadzone and reads the standard left stick", () => {
    expect(directionFromGamepad(gamepad({ axes: [0.2, -0.3] }))).toBeNull();
    expect(directionFromGamepad(gamepad({ axes: [-0.9, 0.1] }))).toBe("left");
    expect(directionFromGamepad(gamepad({ axes: [0.1, 0.85] }))).toBe("down");
  });

  it("falls back to common non-standard axis pairs", () => {
    expect(
      directionFromGamepad(
        gamepad({
          axes: [0, 0, 0, 0, 0, 0, 0.8, 0],
          mapping: "",
        }),
      ),
    ).toBe("right");
  });

  it("scans additional paired axes exposed by raw Windows controllers", () => {
    expect(
      directionFromGamepad(
        gamepad({
          axes: [0, 0, 0, 0, 0, 0, 0, 0, -0.82, 0.06],
          mapping: "",
        }),
      ),
    ).toBe("left");
  });
});
