export default function GalaxySvg() {
  return (
    <svg
      viewBox="0 0 1000 700"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
      }}
    >
      <defs>
        <radialGradient id="core">
          <stop offset="0%" stopColor="#fff8ff" />
          <stop offset="40%" stopColor="#d9b8ff" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        <filter id="blur">
          <feGaussianBlur stdDeviation="35" />
        </filter>
      </defs>

      {/* هسته */}
      <ellipse
        cx="500"
        cy="350"
        rx="130"
        ry="90"
        fill="url(#core)"
      />

      {/* بازوی اول */}
      <path
        d="
          M500 350
          C620 260, 760 250, 850 330
          C930 400, 900 500, 790 560
          C660 630, 500 610, 390 530
        "
        stroke="#c39cff"
        strokeWidth="50"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
        filter="url(#blur)"
      />

      {/* بازوی دوم */}
      <path
        d="
          M500 350
          C380 260, 240 250, 150 330
          C70 400, 100 500, 210 560
          C340 630, 500 610, 610 530
        "
        stroke="#8d6bff"
        strokeWidth="50"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
        filter="url(#blur)"
      />

      {/* هسته روشن */}
      <circle
        cx="500"
        cy="350"
        r="35"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}