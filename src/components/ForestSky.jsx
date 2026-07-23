export default function ForestSky({ progress }) {

  const start = {
    r: 255,
    g: 146,
    b: 79,
  };

  const end = {
    r: 10,
    g: 18,
    b: 38,
  };

  const r =
    start.r +
    (end.r - start.r) * progress;

  const g =
    start.g +
    (end.g - start.g) * progress;

  const b =
    start.b +
    (end.b - start.b) * progress;

  const color = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;

  return (
    <color
      attach="background"
      args={[color]}
    />
  );
}