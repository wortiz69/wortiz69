import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const useFadeIn = (start: number, duration = 20): number => {
  const frame = useCurrentFrame();
  return interpolate(frame - start, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const useSlideUp = (start: number, fps: number): number => {
  const frame = useCurrentFrame();
  const progress = spring({
    frame: frame - start,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  return interpolate(progress, [0, 1], [60, 0]);
};

export interface PawProps {
  x: number;
  y: number;
  size: number;
  rotation: number;
  i: number;
}

export const computePawPositions = (count: number, frame: number): PawProps[] =>
  Array.from({ length: count }, (_, i) => {
    const x = (i * 137 + 20) % 100;
    const baseY = (i * 83 + 10) % 100;
    const y = (baseY + frame * (0.05 + i * 0.01)) % 100;
    const size = 30 + (i % 3) * 15;
    const rotation = (frame * (i % 2 === 0 ? 0.3 : -0.3) + i * 45) % 360;
    return { x, y, size, rotation, i };
  });
