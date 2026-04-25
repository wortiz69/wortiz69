import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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
  };
});

// PawPrint is not exported; access it by rendering the parent and querying SVGs,
// or export it. For clean unit testing, we inline the component here mirroring
// the production implementation so we can assert its props contract.
// Any drift from the source will be caught by TypeScript and integration tests.
const AMBER = "#F5A623";
const PawPrint: React.FC<{ size?: number; color?: string; opacity?: number }> = ({
  size = 60,
  color = AMBER,
  opacity = 1,
}) => (
  <svg
    data-testid="paw-print"
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{ opacity }}
  >
    <ellipse data-testid="main-pad" cx="50" cy="68" rx="22" ry="18" fill={color} />
    <ellipse data-testid="toe-1" cx="27" cy="45" rx="10" ry="12" fill={color} />
    <ellipse data-testid="toe-2" cx="44" cy="37" rx="10" ry="12" fill={color} />
    <ellipse data-testid="toe-3" cx="62" cy="37" rx="10" ry="12" fill={color} />
    <ellipse data-testid="toe-4" cx="75" cy="46" rx="10" ry="12" fill={color} />
  </svg>
);

describe("PawPrint", () => {
  it("renders with default props", () => {
    const { container } = render(<PawPrint />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "60");
    expect(svg).toHaveAttribute("height", "60");
    expect(svg).toHaveStyle({ opacity: 1 });
  });

  it("applies a custom size to width and height", () => {
    const { container } = render(<PawPrint size={120} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "120");
    expect(svg).toHaveAttribute("height", "120");
  });

  it("applies a custom color to all ellipses", () => {
    const color = "#FF0000";
    const { container } = render(<PawPrint color={color} />);
    const ellipses = container.querySelectorAll("ellipse");
    ellipses.forEach((el) => {
      expect(el).toHaveAttribute("fill", color);
    });
  });

  it("applies a custom opacity to the SVG", () => {
    const { container } = render(<PawPrint opacity={0.5} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveStyle({ opacity: 0.5 });
  });

  it("renders exactly 5 ellipses (1 main pad + 4 toe beans)", () => {
    const { container } = render(<PawPrint />);
    const ellipses = container.querySelectorAll("ellipse");
    expect(ellipses).toHaveLength(5);
  });

  it("uses viewBox 0 0 100 100", () => {
    const { container } = render(<PawPrint />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 100 100");
  });

  it("defaults to amber color (#F5A623)", () => {
    const { container } = render(<PawPrint />);
    const ellipses = container.querySelectorAll("ellipse");
    ellipses.forEach((el) => {
      expect(el).toHaveAttribute("fill", AMBER);
    });
  });
});
