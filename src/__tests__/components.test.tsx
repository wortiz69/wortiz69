import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// ─── Mock Remotion ────────────────────────────────────────────────────────────
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

const { StatCard, Step } = await import("../ShelterDogs");

// ─── StatCard ─────────────────────────────────────────────────────────────────
describe("StatCard", () => {
  it("renders the number text", () => {
    const { getByText } = render(
      <StatCard number="6.3M" label="dogs enter shelters" delay={0} color="#F5A623" />
    );
    expect(getByText("6.3M")).toBeInTheDocument();
  });

  it("renders the label text", () => {
    const { getByText } = render(
      <StatCard number="6.3M" label="dogs enter shelters" delay={0} color="#F5A623" />
    );
    expect(getByText("dogs enter shelters")).toBeInTheDocument();
  });

  it("applies the color to the number element", () => {
    const color = "#E74C3C";
    const { getByText } = render(
      <StatCard number="390K" label="euthanized annually" delay={0} color={color} />
    );
    const numberEl = getByText("390K");
    expect(numberEl).toHaveStyle({ color });
  });

  it("applies the color to the left border of the card", () => {
    const color = "#5DADE2";
    const { getByText } = render(
      <StatCard number="3.1M" label="adopted each year" delay={0} color={color} />
    );
    const card = getByText("3.1M").parentElement!;
    expect(card).toHaveStyle({ borderLeft: `8px solid ${color}` });
  });

  it("starts with opacity 0 at delay=0 and frame=0", () => {
    mockFrame = 0;
    const { getByText } = render(
      <StatCard number="6.3M" label="dogs enter shelters" delay={0} color="#F5A623" />
    );
    const card = getByText("6.3M").parentElement!;
    // opacity should be 0 at frame 0 (interpolate clamps to 0)
    expect(Number(card.style.opacity)).toBeCloseTo(0, 1);
  });

  it("reaches opacity 1 after the animation completes (frame >= delay+15)", () => {
    mockFrame = 15;
    const { getByText } = render(
      <StatCard number="6.3M" label="dogs enter shelters" delay={0} color="#F5A623" />
    );
    const card = getByText("6.3M").parentElement!;
    expect(Number(card.style.opacity)).toBeCloseTo(1, 1);
  });

  it("respects delay: stays at opacity 0 when frame < delay", () => {
    mockFrame = 5;
    const { getByText } = render(
      <StatCard number="6.3M" label="dogs enter shelters" delay={20} color="#F5A623" />
    );
    const card = getByText("6.3M").parentElement!;
    expect(Number(card.style.opacity)).toBeCloseTo(0, 1);
  });
});

// ─── Step ─────────────────────────────────────────────────────────────────────
describe("Step", () => {
  it("renders the icon", () => {
    const { getByText } = render(<Step icon="🏠" text="Adopt from a shelter" delay={0} />);
    expect(getByText("🏠")).toBeInTheDocument();
  });

  it("renders the text", () => {
    const { getByText } = render(<Step icon="🏠" text="Adopt from a shelter" delay={0} />);
    expect(getByText("Adopt from a shelter")).toBeInTheDocument();
  });

  it("starts with opacity 0 at frame=0 and delay=0", () => {
    mockFrame = 0;
    const { container } = render(<Step icon="🏠" text="Adopt from a shelter" delay={0} />);
    const step = container.firstElementChild as HTMLElement;
    expect(Number(step.style.opacity)).toBeCloseTo(0, 1);
  });

  it("reaches opacity 1 after the animation completes", () => {
    mockFrame = 20;
    const { container } = render(<Step icon="🏠" text="Adopt from a shelter" delay={0} />);
    const step = container.firstElementChild as HTMLElement;
    expect(Number(step.style.opacity)).toBeCloseTo(1, 1);
  });

  it("starts translated off-screen to the left (translateX near -80)", () => {
    mockFrame = 0;
    const { container } = render(<Step icon="🤝" text="Foster a dog" delay={0} />);
    const step = container.firstElementChild as HTMLElement;
    // Spring starts at 0, interpolate(0, [0,1], [-80, 0]) = -80
    expect(step.style.transform).toContain("translateX(-80px)");
  });

  it("slides to translateX(0px) once spring has settled", () => {
    mockFrame = 90;
    const { container } = render(<Step icon="🤝" text="Foster a dog" delay={0} />);
    const step = container.firstElementChild as HTMLElement;
    const match = step.style.transform.match(/translateX\((.+?)px\)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeCloseTo(0, 0);
  });

  it("respects delay: starts offscreen when frame < delay", () => {
    mockFrame = 10;
    const { container } = render(<Step icon="📢" text="Share adoptable dogs" delay={30} />);
    const step = container.firstElementChild as HTMLElement;
    expect(step.style.transform).toContain("translateX(-80px)");
  });
});
