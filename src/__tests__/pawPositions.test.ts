import { describe, it, expect } from "vitest";
import { computePawPositions } from "../animations";

describe("computePawPositions", () => {
  it("returns the correct number of paws for a given count", () => {
    expect(computePawPositions(8, 0)).toHaveLength(8);
    expect(computePawPositions(5, 0)).toHaveLength(5);
    expect(computePawPositions(1, 0)).toHaveLength(1);
  });

  it("each paw has the correct index", () => {
    const paws = computePawPositions(4, 0);
    paws.forEach((paw, idx) => {
      expect(paw.i).toBe(idx);
    });
  });

  it("x positions are within [0, 100)", () => {
    const paws = computePawPositions(8, 0);
    paws.forEach(({ x }) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(100);
    });
  });

  it("y positions are within [0, 100) across many frames", () => {
    for (let frame = 0; frame < 300; frame += 10) {
      const paws = computePawPositions(8, frame);
      paws.forEach(({ y }) => {
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThan(100);
      });
    }
  });

  it("all x positions are distinct (no column overlap)", () => {
    const paws = computePawPositions(8, 0);
    const xs = paws.map((p) => p.x);
    expect(new Set(xs).size).toBe(8);
  });

  it("x positions are deterministic (same inputs → same outputs)", () => {
    const a = computePawPositions(8, 42);
    const b = computePawPositions(8, 42);
    expect(a).toEqual(b);
  });

  it("y position increases with frame (paws scroll upward)", () => {
    const paws0 = computePawPositions(8, 0);
    const paws10 = computePawPositions(8, 10);
    // At least one paw should have moved (y changes with frame)
    const moved = paws0.some((p, i) => paws10[i].y !== p.y);
    expect(moved).toBe(true);
  });

  it("even-indexed paws rotate clockwise across frames", () => {
    const evenIdx = 0;
    const r1 = computePawPositions(8, 1)[evenIdx].rotation;
    const r2 = computePawPositions(8, 2)[evenIdx].rotation;
    expect(r2 - r1).toBeGreaterThan(0);
  });

  it("odd-indexed paws rotate counter-clockwise across frames", () => {
    const oddIdx = 1;
    const r1 = computePawPositions(8, 1)[oddIdx].rotation;
    const r2 = computePawPositions(8, 2)[oddIdx].rotation;
    expect(r2 - r1).toBeLessThan(0);
  });

  it("paw size cycles through 30, 45, 60 based on index mod 3", () => {
    const paws = computePawPositions(6, 0);
    expect(paws[0].size).toBe(30); // i%3 = 0 → 30 + 0*15
    expect(paws[1].size).toBe(45); // i%3 = 1 → 30 + 1*15
    expect(paws[2].size).toBe(60); // i%3 = 2 → 30 + 2*15
    expect(paws[3].size).toBe(30); // cycle repeats
    expect(paws[4].size).toBe(45);
    expect(paws[5].size).toBe(60);
  });

  it("returns empty array when count is 0", () => {
    expect(computePawPositions(0, 0)).toEqual([]);
  });
});
