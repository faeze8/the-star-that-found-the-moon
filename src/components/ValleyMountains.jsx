import React from "react";

function Mountain({
  x,
  z,
  scale = 1,
  color = "#718096",
}) {
  return (
    <mesh
      position={[x, 0, z]}
      scale={scale}
    >
      <coneGeometry
        args={[35, 90, 4]}
      />

      <meshStandardMaterial
        color={color}
        flatShading
      />
    </mesh>
  );
}

export default function ValleyMountains() {
  const items = [];

  for (let i = 0; i < 35; i++) {
    const z = -i * 250;

    items.push(
      <Mountain
        key={`l-${i}`}
        x={-90 - Math.random() * 50}
        z={z}
        scale={1 + Math.random()}
      />
    );

    items.push(
      <Mountain
        key={`r-${i}`}
        x={90 + Math.random() * 50}
        z={z}
        scale={1 + Math.random()}
      />
    );
  }

  return <>{items}</>;
}