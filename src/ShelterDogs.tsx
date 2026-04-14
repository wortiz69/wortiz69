import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

// ─── Palette ────────────────────────────────────────────────────────────────
const WARM_BROWN = "#8B4513";
const CREAM = "#FFF8EE";
const AMBER = "#F5A623";
const DARK = "#1A1A1A";
const WHITE = "#FFFFFF";
const SOFT_RED = "#E74C3C";

// ─── Helpers ────────────────────────────────────────────────────────────────
const useFadeIn = (start: number, duration = 20) => {
  const frame = useCurrentFrame();
  return interpolate(frame - start, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const useSlideUp = (start: number, fps: number) => {
  const frame = useCurrentFrame();
  const progress = spring({
    frame: frame - start,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  return interpolate(progress, [0, 1], [60, 0]);
};

// ─── Dog Paw SVG ─────────────────────────────────────────────────────────────
const PawPrint: React.FC<{ size?: number; color?: string; opacity?: number }> =
  ({ size = 60, color = AMBER, opacity = 1 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity }}>
      {/* Main pad */}
      <ellipse cx="50" cy="68" rx="22" ry="18" fill={color} />
      {/* Toe beans */}
      <ellipse cx="27" cy="45" rx="10" ry="12" fill={color} />
      <ellipse cx="44" cy="37" rx="10" ry="12" fill={color} />
      <ellipse cx="62" cy="37" rx="10" ry="12" fill={color} />
      <ellipse cx="75" cy="46" rx="10" ry="12" fill={color} />
    </svg>
  );

// ─── Floating Paws Background ────────────────────────────────────────────────
const FloatingPaws: React.FC<{ count?: number }> = ({ count = 8 }) => {
  const frame = useCurrentFrame();
  const paws = Array.from({ length: count }, (_, i) => {
    const x = (i * 137 + 20) % 100;
    const baseY = (i * 83 + 10) % 100;
    const y = ((baseY + frame * (0.05 + i * 0.01)) % 100);
    const size = 30 + (i % 3) * 15;
    const rotation = (frame * (i % 2 === 0 ? 0.3 : -0.3) + i * 45) % 360;
    return { x, y, size, rotation, i };
  });

  return (
    <>
      {paws.map(({ x, y, size, rotation, i }) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            transform: `rotate(${rotation}deg)`,
            opacity: 0.07,
          }}
        >
          <PawPrint size={size} color={WARM_BROWN} />
        </div>
      ))}
    </>
  );
};

// ─── Scene 1: Hook (0–90f) ────────────────────────────────────────────────────
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = useFadeIn(0, 25);
  const titleY = useSlideUp(0, fps);

  const subOpacity = useFadeIn(30, 20);
  const subY = useSlideUp(30, fps);

  const heartScale = spring({ frame, fps, config: { damping: 8, stiffness: 100 } });
  const heartPulse = 1 + Math.sin(frame * 0.15) * 0.05;

  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <FloatingPaws />

      {/* Big heart */}
      <div style={{
        position: "absolute",
        top: "12%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}>
        <div style={{ transform: `scale(${heartScale * heartPulse})` }}>
          <svg width="160" height="160" viewBox="0 0 100 100">
            <path
              d="M50 85 C50 85 10 55 10 30 A20 20 0 0 1 50 25 A20 20 0 0 1 90 30 C90 55 50 85 50 85Z"
              fill={SOFT_RED}
            />
          </svg>
        </div>
      </div>

      {/* "Every dog deserves" */}
      <div style={{
        position: "absolute",
        top: "42%",
        width: "100%",
        textAlign: "center",
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        padding: "0 60px",
      }}>
        <div style={{
          fontSize: 72,
          fontWeight: 900,
          color: DARK,
          lineHeight: 1.1,
          fontFamily: "Georgia, serif",
          textShadow: "2px 2px 0px rgba(0,0,0,0.08)",
        }}>
          Every dog
        </div>
        <div style={{
          fontSize: 72,
          fontWeight: 900,
          color: WARM_BROWN,
          lineHeight: 1.1,
          fontFamily: "Georgia, serif",
        }}>
          deserves
        </div>
        <div style={{
          fontSize: 72,
          fontWeight: 900,
          color: DARK,
          lineHeight: 1.1,
          fontFamily: "Georgia, serif",
        }}>
          a home.
        </div>
      </div>

      {/* Sub */}
      <div style={{
        position: "absolute",
        bottom: "12%",
        width: "100%",
        textAlign: "center",
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
        padding: "0 80px",
      }}>
        <div style={{
          fontSize: 38,
          color: WARM_BROWN,
          fontFamily: "sans-serif",
          fontWeight: 600,
        }}>
          Millions are waiting in shelters right now.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Stats (90–180f) ────────────────────────────────────────────────
const StatCard: React.FC<{
  number: string;
  label: string;
  delay: number;
  color: string;
}> = ({ number, label, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 60 } });
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{
      opacity,
      transform: `scale(${scale})`,
      background: WHITE,
      borderRadius: 28,
      padding: "40px 30px",
      textAlign: "center",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      borderLeft: `8px solid ${color}`,
      marginBottom: 30,
    }}>
      <div style={{ fontSize: 80, fontWeight: 900, color, fontFamily: "Georgia, serif" }}>
        {number}
      </div>
      <div style={{ fontSize: 34, color: DARK, fontFamily: "sans-serif", fontWeight: 500, marginTop: 8 }}>
        {label}
      </div>
    </div>
  );
};

const SceneStats: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = useFadeIn(0, 20);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${WARM_BROWN} 0%, #3D1A00 100%)` }}>
      <FloatingPaws count={6} />

      <div style={{
        padding: "80px 60px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{
          fontSize: 52,
          fontWeight: 900,
          color: AMBER,
          fontFamily: "Georgia, serif",
          textAlign: "center",
          marginBottom: 50,
          opacity: titleOpacity,
        }}>
          The numbers
        </div>

        <StatCard number="6.3M" label="dogs enter U.S. shelters yearly" delay={10} color={AMBER} />
        <StatCard number="3.1M" label="are adopted each year" delay={25} color="#5DADE2" />
        <StatCard number="390K" label="are still euthanized annually" delay={40} color={SOFT_RED} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: How to Help (180–270f) ─────────────────────────────────────────
const Step: React.FC<{ icon: string; text: string; delay: number }> = ({ icon, text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const x = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 70 } });
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(x, [0, 1], [-80, 0]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 28,
      marginBottom: 36,
      opacity,
      transform: `translateX(${translateX}px)`,
      background: "rgba(255,255,255,0.1)",
      borderRadius: 20,
      padding: "24px 30px",
    }}>
      <div style={{ fontSize: 64 }}>{icon}</div>
      <div style={{
        fontSize: 40,
        fontWeight: 700,
        color: WHITE,
        fontFamily: "sans-serif",
        lineHeight: 1.2,
      }}>
        {text}
      </div>
    </div>
  );
};

const SceneHelp: React.FC = () => {
  const titleOpacity = useFadeIn(0, 20);
  const { fps } = useVideoConfig();
  const titleY = useSlideUp(0, fps);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, #2C3E50 0%, #1A252F 100%)` }}>
      <FloatingPaws count={5} />

      <div style={{ padding: "80px 60px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          fontSize: 60,
          fontWeight: 900,
          color: AMBER,
          fontFamily: "Georgia, serif",
          textAlign: "center",
          marginBottom: 60,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}>
          How you can help
        </div>

        <Step icon="🏠" text="Adopt from your local shelter" delay={15} />
        <Step icon="🤝" text="Foster a dog temporarily" delay={30} />
        <Step icon="📢" text="Share adoptable dogs online" delay={45} />
        <Step icon="💛" text="Donate to rescue organizations" delay={60} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: CTA (270–360f) ─────────────────────────────────────────────────
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 10, stiffness: 60 } });
  const glow = Math.sin(frame * 0.2) * 0.5 + 0.5;

  return (
    <AbsoluteFill style={{ background: CREAM }}>
      <FloatingPaws count={10} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "0 60px",
        textAlign: "center",
      }}>
        {/* Paw cluster */}
        <div style={{
          display: "flex",
          gap: 10,
          transform: `scale(${scale})`,
        }}>
          {[0, 1, 2].map((i) => (
            <PawPrint
              key={i}
              size={70 - i * 10}
              color={WARM_BROWN}
              opacity={1 - i * 0.2}
            />
          ))}
        </div>

        <div style={{
          fontSize: 80,
          fontWeight: 900,
          color: DARK,
          fontFamily: "Georgia, serif",
          lineHeight: 1.1,
          transform: `scale(${scale})`,
        }}>
          Be their
          <br />
          <span style={{ color: WARM_BROWN }}>forever</span>
          <br />
          family.
        </div>

        {/* CTA button */}
        <div style={{
          background: AMBER,
          borderRadius: 50,
          padding: "30px 70px",
          transform: `scale(${scale})`,
          boxShadow: `0 0 ${20 + glow * 20}px ${AMBER}88`,
        }}>
          <div style={{
            fontSize: 44,
            fontWeight: 900,
            color: WHITE,
            fontFamily: "sans-serif",
            letterSpacing: 1,
          }}>
            Visit your local shelter
          </div>
        </div>

        <div style={{
          fontSize: 36,
          color: WARM_BROWN,
          fontFamily: "sans-serif",
          fontWeight: 600,
          opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          adoptapet.com • petfinder.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Root Composition ────────────────────────────────────────────────────────
export const ShelterDogs: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90}>
        <SceneHook />
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <SceneStats />
      </Sequence>
      <Sequence from={180} durationInFrames={90}>
        <SceneHelp />
      </Sequence>
      <Sequence from={270} durationInFrames={90}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
