import { ImageResponse } from "next/og";
import { site } from "@/site.config";

// The social card, rendered at build time into the static export (Next
// writes /opengraph-image.png and the og:image / twitter:image tags). Same
// instrument look as the page: mono display, square, amber for state only.
// Numbers come from site.config — the card cannot say something the site
// does not.

export const dynamic = "force-static";
export const alt = `${site.name} — a control you cannot verify is not a control`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori needs font bytes (TTF/OTF/WOFF, not WOFF2). Google serves TTF to a
// pre-woff2 user agent; these are the same faces next/font loads for the page.
async function font(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:5.0)" },
  }).then((r) => r.text());
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`no TTF for ${family} ${weight}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const [mono, monoMedium, sans] = await Promise.all([font("Geist+Mono", 400), font("Geist+Mono", 500), font("Geist", 400)]);
  const { decisions, invariants, rebuilds } = site.stats;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0b0d10",
          color: "#e8e8e8",
          padding: "56px 64px",
          fontFamily: "Geist Mono",
        }}
      >
        {/* header row: mark + name, and the strip on the right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="30" height="39" viewBox="0 0 52 68">
              <path d="M10 6 L40 34 L10 62" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontSize: 34, fontWeight: 500, letterSpacing: -0.5 }}>invariant</span>
              <span style={{ fontSize: 16, letterSpacing: 4, color: "#6b7280" }}>PLATFORM</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 17, color: "#9ca3af" }}>
            <div style={{ width: 10, height: 10, backgroundColor: "#f59e0b", display: "flex" }} />
            <span>posture-check</span>
            <span style={{ color: "#4b5563" }}>·</span>
            <span>
              <span style={{ color: "#e8e8e8" }}>{`${invariants}\u00a0`}</span>
              {`of ${invariants} invariants hold`}
            </span>
            <span style={{ color: "#4b5563" }}>·</span>
            <span>nightly</span>
          </div>
        </div>

        {/* thesis */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 66, fontWeight: 500, lineHeight: 1.12, letterSpacing: -1.5 }}>
            <span>A control you cannot</span>
            <span>
              <span style={{ color: "#f59e0b" }}>verify&nbsp;</span>is not a control.
            </span>
          </div>
          <div style={{ fontFamily: "Geist", fontSize: 24, lineHeight: 1.45, color: "#9ca3af", maxWidth: 900 }}>
            A small, security-first Kubernetes platform that re-asserts its own posture every night, from outside
            itself. Every property it claims is one it checks.
          </div>
        </div>

        {/* footer: the counts and the hostname, ruled */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #1f2937",
            paddingTop: 22,
            fontSize: 19,
            color: "#9ca3af",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            <span>
              <span style={{ color: "#e8e8e8" }}>{`${decisions}\u00a0`}</span>
              decisions
            </span>
            <span style={{ color: "#4b5563" }}>·</span>
            <span>
              <span style={{ color: "#e8e8e8" }}>{`${invariants}\u00a0`}</span>
              invariants
            </span>
            <span style={{ color: "#4b5563" }}>·</span>
            <span>
              <span style={{ color: "#e8e8e8" }}>{`${rebuilds}\u00a0`}</span>
              rebuilds
            </span>
          </div>
          <span>invariant-platform.io</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
        { name: "Geist Mono", data: monoMedium, weight: 500, style: "normal" },
        { name: "Geist", data: sans, weight: 400, style: "normal" },
      ],
    },
  );
}
