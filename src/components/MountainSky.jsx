export default function MountainSky({
  progress,
}) {

  const day = {
    r: 145,
    g: 205,
    b: 255,
  };

  const sunset = {
    r: 255,
    g: 170,
    b: 120,
  };

  const cave = {
    r: 25,
    g: 20,
    b: 45,
  };

  let target;

  if (progress < 0.8) {

    target = sunset;

  } else {

    target = cave;

  }

  const r =
    day.r +
    (target.r - day.r) *
      progress;

  const g =
    day.g +
    (target.g - day.g) *
      progress;

  const b =
    day.b +
    (target.b - day.b) *
      progress;

  return (
    <color
      attach="background"
      args={[
        `rgb(${r},${g},${b})`,
      ]}
    />
  );
}