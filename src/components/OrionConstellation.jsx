import { Line } from "@react-three/drei";
import { useState } from "react";

export default function OrionConstellation({ onSelect }) {

  const [hovered, setHovered] = useState(false);

  const stars = [
    [0, 2, 0],
    [-1, 1, 0],
    [1, 1, 0],

    [-0.3, 0, 0],
    [0, -0.2, 0],
    [0.3, 0, 0],

    [-1, -1.4, 0],
    [1, -1.4, 0],
  ];

  return (
    <group
      position={[0, -10, 0]}
      onClick={() => onSelect?.("orion")}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >

      {stars.map((star, index) => (
        <group key={index}>

          <mesh position={star}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial
              color={hovered ? "#ffffff" : "#dbeafe"}
            />
          </mesh>

          <mesh position={star}>
            <sphereGeometry
              args={[
                hovered ? 0.6 : 0.35,
                16,
                16,
              ]}
            />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={hovered ? 0.22 : 0.1}
            />
          </mesh>

        </group>
      ))}

      {/* بدن شکارچی */}
      <Line
        points={[
          stars[0],
          stars[1],
          stars[6],
        ]}
        color="#93c5fd"
        lineWidth={3}
      />

      <Line
        points={[
          stars[0],
          stars[2],
          stars[7],
        ]}
        color="#93c5fd"
        lineWidth={3}
      />

      {/* کمربند اوریون */}
      <Line
        points={[
          stars[3],
          stars[4],
          stars[5],
        ]}
        color="#fcd34d"
        lineWidth={4}
      />

      {/* کمان */}
      {hovered && (
        <>
          <Line
            points={[
              [1.4, 1.2, 0],
              [2.1, 0.3, 0],
              [1.4, -0.8, 0],
            ]}
            color="#fde68a"
            lineWidth={4}
          />

          <Line
            points={[
              [1.4, 1.2, 0],
              [1.4, -0.8, 0],
            ]}
            color="#fff7ed"
            lineWidth={2}
          />
        </>
      )}

      {/* تیر */}
      {hovered && (
        <Line
          points={[
            [1.8, 0.2, 0],
            [3.2, 0.2, 0],
          ]}
          color="#fef3c7"
          lineWidth={3}
        />
      )}

      {/* نوک تیر */}
      {hovered && (
        <mesh position={[3.25, 0.2, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}

      {/* هاله شکارچی */}
      {hovered && (
        <mesh position={[0, 0, -0.4]}>
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshBasicMaterial
            color="#1e3a8a"
            transparent
            opacity={0.04}
          />
        </mesh>
      )}

    </group>
  );
}