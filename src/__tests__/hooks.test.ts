import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Remotion frame context ─────────────────────────────────────────────
let mockFrame = 0;

vi.mock("remotion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("remotion")>();
  return {
    ...actual,
    useCurrentFrame: () => mockFrame,
    useVideoConfig: () => ({
      fps: 30,
      width: 1080,
      height: 1920,
      durationInFrames: 300,
    }),
  };
});

const { useFadeIn, useSlideUp } = await import("../animations");

// ─── useFadeIn ────────────────────────────────────────────────────────────────
describe("useFadeIn", () => {
  beforeEach(() => {
    mockFrame = 0;
  });

  it("returns 0 before the start frame", () => {
    mockFrame = 0;
    expect(useFadeIn(10)).toBe(0);
  });

  it("returns 0 at exactly the start frame", () => {
    mockFrame = 10;
    expect(useFadeIn(10)).toBe(0);
  });

  it("returns 1 at start + duration (default duration=20)", () => {
    mockFrame = 30; // start=10, frame=10+20=30
    expect(useFadeIn(10)).toBe(1);
  });

  it("clamps to 1 well past start + duration", () => {
    mockFrame = 200;
    expect(useFadeIn(10)).toBe(1);
  });

  it("returns ~0.5 at the midpoint of the animation", () => {
    mockFrame = 20; // start=10, duration=20 → midpoint at frame 20
    expect(useFadeIn(10, 20)).toBeCloseTo(0.5, 1);
  });

  it("respects a custom duration", () => {
    mockFrame = 40; // start=0, duration=40 → end
    expect(useFadeIn(0, 40)).toBe(1);

    mockFrame = 20; // halfway through
    expect(useFadeIn(0, 40)).toBeCloseTo(0.5, 1);
  });

  it("output is always within [0, 1]", () => {
    for (const frame of [-10, 0, 5, 10, 15, 20, 100]) {
      mockFrame = frame;
      const val = useFadeIn(5, 10);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });
});

// ─── useSlideUp ───────────────────────────────────────────────────────────────
describe("useSlideUp", () => {
  const FPS = 30;

  beforeEach(() => {
    mockFrame = 0;
  });

  it("starts at 60 (off-screen position) at the start frame", () => {
    mockFrame = 0;
    expect(useSlideUp(0, FPS)).toBeCloseTo(60, 0);
  });

  it("approaches 0 as the spring settles after many frames", () => {
    mockFrame = 90;
    expect(useSlideUp(0, FPS)).toBeCloseTo(0, 0);
  });

  it("returns 60 when frame is before start (spring hasn't begun)", () => {
    mockFrame = 5;
    expect(useSlideUp(20, FPS)).toBeCloseTo(60, 0);
  });

  it("decreases overall from 60 toward 0 (allowing spring overshoot)", () => {
    // Springs can overshoot slightly before settling, so we only assert the
    // overall trend: early frames are higher than late frames.
    const early: number[] = [0, 5, 10].map((f) => { mockFrame = f; return useSlideUp(0, FPS); });
    const late: number[] = [60, 90].map((f) => { mockFrame = f; return useSlideUp(0, FPS); });
    const avgEarly = early.reduce((a, b) => a + b, 0) / early.length;
    const avgLate = late.reduce((a, b) => a + b, 0) / late.length;
    expect(avgEarly).toBeGreaterThan(avgLate);
  });

  it("output is never below 0", () => {
    for (const frame of [0, 10, 30, 60, 200]) {
      mockFrame = frame;
      expect(useSlideUp(0, FPS)).toBeGreaterThanOrEqual(0);
    }
  });
});
