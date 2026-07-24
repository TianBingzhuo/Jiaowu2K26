export type FocusDirection = "up" | "down" | "left" | "right";

export type RectLike = Pick<
  DOMRect,
  "left" | "right" | "top" | "bottom" | "width" | "height"
>;

export const FOCUSABLE_SELECTOR = [
  '[data-focusable="true"]',
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[role="button"]:not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const center = (rect: RectLike) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const directionalMetrics = (
  current: RectLike,
  candidate: RectLike,
  direction: FocusDirection,
) => {
  const from = center(current);
  const to = center(candidate);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const horizontal = direction === "left" || direction === "right";
  const primary =
    direction === "left"
      ? -dx
      : direction === "right"
        ? dx
        : direction === "up"
          ? -dy
          : dy;
  const cross = Math.abs(horizontal ? dy : dx);

  return { primary, cross };
};

export function chooseSpatialIndex(
  current: RectLike,
  candidates: RectLike[],
  direction: FocusDirection,
): number {
  let bestIndex = -1;
  let bestScore = Number.POSITIVE_INFINITY;

  candidates.forEach((candidate, index) => {
    const { primary, cross } = directionalMetrics(
      current,
      candidate,
      direction,
    );
    if (primary <= 3) return;

    // Stay in the same visual row/column where possible, then prefer distance.
    // The angle penalty prevents a nearby diagonal control from beating a
    // clearly aligned target farther along the requested direction.
    const anglePenalty = (cross / Math.max(primary, 1)) * 180;
    const score = primary + cross * 1.45 + anglePenalty;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'input:not([type="button"]):not([type="submit"]), textarea, select, [contenteditable="true"]',
    ),
  );
}

export function getFocusableElements(
  scope: ParentNode = document,
): HTMLElement[] {
  return Array.from(
    scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if (
      element.matches(":disabled") ||
      element.getAttribute("aria-disabled") === "true" ||
      element.getAttribute("aria-hidden") === "true" ||
      element.closest("[inert]")
    ) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return (
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      element.getClientRects().length > 0
    );
  });
}

export function moveSpatialFocus(
  elements: HTMLElement[],
  direction: FocusDirection,
): boolean {
  if (!elements.length) return false;

  const active = document.activeElement as HTMLElement | null;
  const currentIndex = active ? elements.indexOf(active) : -1;
  let target: HTMLElement | undefined;

  if (currentIndex < 0) {
    target =
      elements.find((element) => element.dataset.defaultFocus === "true") ??
      elements[0];
  } else {
    const currentRect = elements[currentIndex].getBoundingClientRect();
    const candidates = elements.filter((_, index) => index !== currentIndex);
    const candidateIndex = chooseSpatialIndex(
      currentRect,
      candidates.map((candidate) => candidate.getBoundingClientRect()),
      direction,
    );

    if (candidateIndex >= 0) {
      target = candidates[candidateIndex];
    }
  }

  if (!target || target === active) return false;

  document
    .querySelectorAll<HTMLElement>("[data-spatial-focus]")
    .forEach((element) => delete element.dataset.spatialFocus);
  target.dataset.spatialFocus = "true";
  target.focus({ preventScroll: true });
  target.scrollIntoView({
    block: "nearest",
    inline: "nearest",
    behavior: "auto",
  });
  return true;
}

export function directionFromGamepad(gamepad: Gamepad): FocusDirection | null {
  const pressed = (index: number) => {
    const button = gamepad.buttons[index];
    return Boolean(button && (button.pressed || button.value >= 0.5));
  };

  // W3C Standard Gamepad mapping: 12/13/14/15 = up/down/left/right.
  if (pressed(12)) return "up";
  if (pressed(13)) return "down";
  if (pressed(14)) return "left";
  if (pressed(15)) return "right";

  const pairs =
    gamepad.mapping === "standard"
      ? [[0, 1]]
      : Array.from(
          { length: Math.floor(gamepad.axes.length / 2) },
          (_, pairIndex) => [pairIndex * 2, pairIndex * 2 + 1],
        );
  let strongest:
    | { direction: FocusDirection; magnitude: number }
    | undefined;

  for (const [xIndex, yIndex] of pairs) {
    const x = gamepad.axes[xIndex] ?? 0;
    const y = gamepad.axes[yIndex] ?? 0;
    const magnitude = Math.max(Math.abs(x), Math.abs(y));
    if (magnitude < 0.5 || (strongest && strongest.magnitude >= magnitude)) {
      continue;
    }
    strongest = {
      direction:
        Math.abs(x) > Math.abs(y)
          ? x < 0
            ? "left"
            : "right"
          : y < 0
            ? "up"
            : "down",
      magnitude,
    };
  }

  return strongest?.direction ?? null;
}
