import React from "react";

function Mountain({ x, z, scale = 1 }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 35, 0]}>
        <coneGeometry args={[20, 70, 6]} />
        <meshStandardMaterial color="#7d8798" flatShading />
      </mesh>

      <mesh position={[0, 60, 0]}>
        <coneGeometry args={[7, 18, 6]} />
        <meshStandardMaterial color="#f5f7fb" flatShading />
      </mesh>
    </group>
  );
}

function Crystal({ x, z, color }) {
  return (
    <mesh position={[x, 2, z]}>
      <coneGeometry args={[1.2, 5, 5]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
      />
    </mesh>
  );
}

function Tree({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 4, 6]} />
        <meshStandardMaterial color="#4d3525" />
      </mesh>

      <mesh position={[0, 5.5, 0]}>
        <coneGeometry args={[2.2, 5, 8]} />
        <meshStandardMaterial color="#324d3b" />
      </mesh>
    </group>
  );
}

export default function CloudMountainWorld() {
  const mountains = [];
  const trees = [];

  for (let i = 0; i < 40; i++) {
    const z = -i * 120;

    mountains.push(
      <Mountain
        key={`ml${i}`}
        x={-40 - Math.random() * 30}
        z={z}
        scale={1 + Math.random()}
      />
    );

    mountains.push(
      <Mountain
        key={`mr${i}`}
        x={40 + Math.random() * 30}
        z={z}
        scale={1 + Math.random()}
      />
    );
  }

  for (let i = 0; i < 120; i++) {
    trees.push(
      <Tree
        key={i}
        x={(Math.random() - 0.5) * 90}
        z={-Math.random() * 3000}
      />
    );
  }

  return (
    <>
      {/* زمین برفی */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.2, -1500]}
      >
        <planeGeometry args={[250, 5000]} />
        <meshStandardMaterial color="#edf2f8" />
      </mesh>

      {/* مسیر */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, -1500]}
      >
        <planeGeometry args={[12, 5000]} />
        <meshStandardMaterial color="#d2c4b3" />
      </mesh>

      {mountains}
      {trees}

      {/* دهانه غار */}

      <mesh position={[0, 35, -4300]}>
        <cylinderGeometry args={[18, 26, 40, 32]} />
        <meshBasicMaterial color="black" />
      </mesh>

      {/* کریستال ها */}

      <Crystal x={8} z={-4250} color="#69d7ff" />
      <Crystal x={-8} z={-4255} color="#9b6cff" />
      <Crystal x={4} z={-4275} color="#69d7ff" />
      <Crystal x={-4} z={-4280} color="#9b6cff" />
    </>
  );
}