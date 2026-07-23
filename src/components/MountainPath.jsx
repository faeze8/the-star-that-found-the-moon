import React from "react";

function Mountain({
  x,
  z,
  h,
  color,
}) {
  return (
    <mesh
      position={[
        x,
        h / 2,
        z,
      ]}
    >
      <coneGeometry
        args={[
          h * 0.7,
          h,
          6,
        ]}
      />

      <meshStandardMaterial
        color={color}
      />
    </mesh>
  );
}

export default function MountainPath() {

  const mountains = [];

  for (
    let i = 0;
    i < 80;
    i++
  ) {

    const z = -i * 90;

    mountains.push(
      <Mountain
        key={`l-${i}`}
        x={
          -60 -
          Math.random() * 25
        }
        z={z}
        h={
          60 +
          Math.random() * 90
        }
        color="#8391a8"
      />
    );

    mountains.push(
      <Mountain
        key={`r-${i}`}
        x={
          60 +
          Math.random() * 25
        }
        z={z}
        h={
          60 +
          Math.random() * 90
        }
        color="#76849b"
      />
    );

  }

  return (
    <>
      {/* زمین */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        position={[
          0,
          -0.2,
          -3500,
        ]}
      >
        <planeGeometry
          args={[
            400,
            8000,
          ]}
        />

        <meshStandardMaterial
          color="#edf3fa"
        />
      </mesh>

      {/* جاده */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        position={[
          0,
          0.03,
          -3500,
        ]}
      >
        <planeGeometry
          args={[
            18,
            8000,
          ]}
        />

        <meshStandardMaterial
          color="#d7c4ae"
        />
      </mesh>

      {mountains}
    </>
  );
}