export default function GalaxyStars() {
  const stars = [];

  const totalStars = 700;

  for (let i = 0; i < totalStars; i++) {
    const angle = i * 0.25;

    const radius =
      Math.sqrt(i / totalStars) * 45 +
      (Math.random() - 0.5) * 3;

    const x =
      50 +
      Math.cos(angle) * radius +
      (Math.random() - 0.5) * 2;

    const y =
      50 +
      Math.sin(angle) * radius * 0.55 +
      (Math.random() - 0.5) * 2;

    const size =
      Math.random() > 0.96
        ? 4
        : Math.random() > 0.8
        ? 2
        : 1;

    stars.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          background: "white",
          borderRadius: "50%",
          boxShadow: "0 0 8px white",
          opacity: 0.9,
        }}
      />
    );
  }

  return <>{stars}</>;
}