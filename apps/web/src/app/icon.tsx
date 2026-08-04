import { ImageResponse } from "next/og";

// SuprO brand icon — Deepam flame on Annamalai hill silhouette
// Emerald green flame on dark navy rounded square
export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0f1e",
          borderRadius: 7,
        }}
      >
        {/* Deepam Flame + Hill SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Annamalai Hill silhouette */}
          <path
            d="M2 20 L8 11 L12 14 L16 9 L22 20 Z"
            fill="#1e293b"
          />
          {/* Lamp base / wick holder at hill peak */}
          <ellipse cx="14" cy="9.5" rx="1.8" ry="0.7" fill="#34d399" opacity="0.7" />
          {/* Deepam flame — outer glow */}
          <path
            d="M14 9 C14 9 11.5 6.5 12.5 4 C13 5.5 14.5 5 15 3.5 C15.5 5.5 17 6 16.5 8 C16 9.5 14 9 14 9Z"
            fill="url(#flameGrad)"
          />
          {/* Flame inner bright core */}
          <path
            d="M14 8.5 C14 8.5 13 7 13.5 5.5 C14 6.5 14.8 6 15 5 C15.2 6.5 16 7 15.5 8 C15.2 8.8 14 8.5 14 8.5Z"
            fill="#fbbf24"
            opacity="0.9"
          />
          {/* Glow halo */}
          <circle cx="14" cy="6.5" r="2.5" fill="#34d399" opacity="0.12" />
          <defs>
            <linearGradient id="flameGrad" x1="14" y1="9" x2="14" y2="3.5" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    { ...size },
  );
}
