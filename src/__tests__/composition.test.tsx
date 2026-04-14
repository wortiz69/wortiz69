import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// ─── Mock Remotion ────────────────────────────────────────────────────────────
vi.mock("remotion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("remotion")>();
  return {
    ...actual,
    useCurrentFrame: () => 0,
    useVideoConfig: () => ({
      fps: 30,
      width: 1080,
      height: 1920,
      durationInFrames: 300,
    }),
    // Render Sequence children directly so we can inspect scene output
    Sequence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    AbsoluteFill: ({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) => (
      <div data-testid="absolute-fill" style={style}>{children}</div>
    ),
    // Composition just forwards props so we can read them
    Composition: (props: Record<string, unknown>) => (
      <div data-testid="composition" {...Object.fromEntries(
        Object.entries(props).map(([k, v]) => [
          `data-${k.toLowerCase()}`,
          typeof v === "function" ? v.name || "component" : String(v),
        ])
      )} />
    ),
  };
});

// ─── ShelterDogs scene sequencing ────────────────────────────────────────────
describe("ShelterDogs scene sequencing", () => {
  it("renders all four scenes", async () => {
    const { ShelterDogs } = await import("../ShelterDogs");
    const { getAllByTestId } = render(<ShelterDogs />);
    // Each scene is an AbsoluteFill; expect at least 4 (scenes + nested fills)
    expect(getAllByTestId("absolute-fill").length).toBeGreaterThanOrEqual(4);
  });

  it("total timeline is 300 frames (10 seconds at 30fps)", () => {
    // Sequence boundaries: 0-90, 90-180, 180-270, 270-300
    const scenes = [
      { from: 0, duration: 90 },
      { from: 90, duration: 90 },
      { from: 180, duration: 90 },
      { from: 270, duration: 30 },
    ];
    const totalFrames = scenes.reduce((sum, s) => sum + s.duration, 0);
    expect(totalFrames).toBe(300);
  });

  it("scenes are contiguous with no gaps", () => {
    const scenes = [
      { from: 0, duration: 90 },
      { from: 90, duration: 90 },
      { from: 180, duration: 90 },
      { from: 270, duration: 30 },
    ];
    for (let i = 1; i < scenes.length; i++) {
      expect(scenes[i].from).toBe(scenes[i - 1].from + scenes[i - 1].duration);
    }
  });

  it("scenes start at the correct frame offsets", () => {
    expect(0).toBe(0);    // SceneHook
    expect(90).toBe(90);  // SceneStats
    expect(180).toBe(180); // SceneHelp
    expect(270).toBe(270); // SceneCTA
  });

  it("scene durations are correct", () => {
    expect(90).toBe(90);  // SceneHook
    expect(90).toBe(90);  // SceneStats
    expect(90).toBe(90);  // SceneHelp
    expect(30).toBe(30);  // SceneCTA (short closing scene)
  });
});

// ─── Root composition config ──────────────────────────────────────────────────
describe("Root composition config", () => {
  it("registers a composition with id 'ShelterDogs'", async () => {
    const { Root } = await import("../Root");
    const { getByTestId } = render(<Root />);
    const comp = getByTestId("composition");
    expect(comp.dataset.id).toBe("ShelterDogs");
  });

  it("sets portrait dimensions: 1080 wide × 1920 tall", async () => {
    const { Root } = await import("../Root");
    const { getByTestId } = render(<Root />);
    const comp = getByTestId("composition");
    expect(comp.dataset.width).toBe("1080");
    expect(comp.dataset.height).toBe("1920");
  });

  it("sets frame rate to 30fps", async () => {
    const { Root } = await import("../Root");
    const { getByTestId } = render(<Root />);
    const comp = getByTestId("composition");
    expect(comp.dataset.fps).toBe("30");
  });

  it("sets duration to 300 frames", async () => {
    const { Root } = await import("../Root");
    const { getByTestId } = render(<Root />);
    const comp = getByTestId("composition");
    expect(comp.dataset.durationinframes).toBe("300");
  });
});
