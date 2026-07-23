import React from "react";

export default function MountainFog() {

  const fogs = [];

  for (let i = 0; i < 40; i++) {

    fogs.push(

      <mesh
        key={i}
        position={[
          (Math.random() - 0.5) * 120,
          10 + Math.random() * 25,
          -Math.random() * 6500,
        ]}
      >
        <sphereGeometry
          args={[
            8 + Math.random() * 12,
            12,
            12,
          ]}
        />

        <meshBasicMaterial
          color="#dfeaf5"
          transparent
          opacity={0.08}
        />

      </mesh>

    );

  }

  return <>{fogs}</>;
}