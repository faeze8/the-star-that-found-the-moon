import React from "react";

export default function FloatingMist() {

  const clouds = [];

  for (let i = 0; i < 120; i++) {

    clouds.push(
      <mesh
        key={i}
        position={[
          (Math.random() - 0.5) * 120,
          5 + Math.random() * 20,
          -Math.random() * 8000,
        ]}
      >
        <sphereGeometry
          args={[
            3 + Math.random() * 5,
            8,
            8,
          ]}
        />

        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.04}
        />
      </mesh>
    );
  }

  return <>{clouds}</>;
}