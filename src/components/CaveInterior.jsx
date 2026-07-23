import React from "react";

function Crystal({
  position,
  color,
  scale = 1,
}) {
  return (
    <mesh
      position={position}
      scale={scale}
    >
      <octahedronGeometry args={[2]} />

      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
      />
    </mesh>
  );
}

export default function CaveInterior() {

  return (
    <group>

      {/* کوه اصلی */}

      <mesh
        position={[0,120,-7200]}
      >
        <coneGeometry
          args={[180,260,4]}
        />

        <meshStandardMaterial
          color="#5d6678"
          flatShading
        />
      </mesh>

      {/* دهانه غار */}

      <mesh
        position={[0,70,-7120]}
      >
        <sphereGeometry
          args={[35,32,32]}
        />

        <meshBasicMaterial
          color="black"
        />
      </mesh>

      {/* نور کریستال */}

      <pointLight
        position={[0,70,-7200]}
        color="#7dd3fc"
        intensity={250}
        distance={250}
      />

      <pointLight
        position={[20,60,-7240]}
        color="#a78bfa"
        intensity={180}
        distance={200}
      />

      {/* کریستال مرکزی */}

      <Crystal
        position={[0,50,-7240]}
        color="#7dd3fc"
        scale={8}
      />

      {/* سمت چپ */}

      <Crystal
        position={[-25,35,-7210]}
        color="#60a5fa"
        scale={4}
      />

      <Crystal
        position={[-40,25,-7260]}
        color="#93c5fd"
        scale={3}
      />

      {/* سمت راست */}

      <Crystal
        position={[30,40,-7220]}
        color="#a78bfa"
        scale={4}
      />

      <Crystal
        position={[45,30,-7260]}
        color="#c084fc"
        scale={3}
      />

    </group>
  );
}