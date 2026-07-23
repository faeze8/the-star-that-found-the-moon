import React from "react";

export default function SnowParticles() {

  const particles = [];

  for (let i = 0; i < 1200; i++) {

    particles.push(

      <mesh
        key={i}
        position={[
          (Math.random() - 0.5) * 300,
          Math.random() * 120,
          -Math.random() * 6500,
        ]}
      >
        <sphereGeometry
          args={[
            0.15,
            6,
            6,
          ]}
        />

        <meshBasicMaterial
          color="white"
        />

      </mesh>

    );

  }

  return <>{particles}</>;
}