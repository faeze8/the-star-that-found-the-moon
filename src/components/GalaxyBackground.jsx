export default function GalaxyBackground() {

  const stars = Array.from({ length: 300 });

  return (
    <>
      {stars.map((_, i) => {

        const size = Math.random() * 3 + 1;

        return (
          <div
            key={i}
            className="sky-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
            }}
          />
        );
      })}
    </>
  );
}