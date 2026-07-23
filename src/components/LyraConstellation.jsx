import { Line, Text } from "@react-three/drei";
import { useState } from "react";

export default function LyraConstellation({
  onSelect,
}) {
  const [hovered, setHovered] =
    useState(false);

  const stars = [
    [0, 2, 0],
    [-1.2, 0.5, 0],
    [1.2, 0.5, 0],
    [-0.8, -1.2, 0],
    [0.8, -1.2, 0],
  ];

  return (
    <group
      position={[0, 10, 0]}
      onClick={() =>
        onSelect("lyra")
      }
      onPointerOver={() =>
        setHovered(true)
      }
      onPointerOut={() =>
        setHovered(false)
      }
    >
      {/* ستاره‌ها */}
      {stars.map((star, index) => (
        <group key={index}>
          <mesh position={star}>
            <sphereGeometry
              args={[0.16, 20, 20]}
            />

            <meshBasicMaterial
              color={
                hovered
                  ? "#ffffff"
                  : "#fff7cc"
              }
            />
          </mesh>

          <mesh position={star}>
            <sphereGeometry
              args={[
                hovered
                  ? 0.65
                  : 0.4,
                20,
                20,
              ]}
            />

            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={
                hovered
                  ? 0.25
                  : 0.1
              }
            />
          </mesh>
        </group>
      ))}

      {/* قاب چنگ */}
      <Line
        points={[
          stars[0],
          stars[1],
          stars[3],
          stars[4],
          stars[2],
          stars[0],
        ]}
        color={
          hovered
            ? "#fde68a"
            : "#fbbf24"
        }
        lineWidth={
          hovered ? 5 : 3
        }
      />

      {/* سیم‌ها */}
      <Line
        points={[
          [-0.55, 1.1, 0],
          [-0.25, -0.6, 0],
        ]}
        color="#fff4c2"
        lineWidth={1}
      />

      <Line
        points={[
          [0, 1.2, 0],
          [0, -0.8, 0],
        ]}
        color="#fff4c2"
        lineWidth={1}
      />

      <Line
        points={[
          [0.55, 1.1, 0],
          [0.25, -0.6, 0],
        ]}
        color="#fff4c2"
        lineWidth={1}
      />

      {/* هاله */}
      <mesh
        position={[
          0,
          0.3,
          -0.05,
        ]}
      >
        <sphereGeometry
          args={[2.4, 24, 24]}
        />

        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={
            hovered
              ? 0.05
              : 0.02
          }
        />
      </mesh>

      {hovered && (
        <>
          <Text
            position={[
              0,
              3.2,
              0,
            ]}
            fontSize={0.55}
            color="#fff7ed"
            anchorX="center"
          >
            Lyra
          </Text>

          <Text
            position={[
              0,
              2.5,
              0,
            ]}
            fontSize={0.22}
            color="#fde68a"
            anchorX="center"
          >
            Celestial Harp
          </Text>
        </>
      )}
    </group>
  );
}