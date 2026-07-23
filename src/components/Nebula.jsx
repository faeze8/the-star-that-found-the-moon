import { Line, Text } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LyraConstellation() {

  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const stars = [
    [0, 2, 0],      // Vega
    [-1.2, 0.5, 0],
    [1.2, 0.5, 0],
    [-0.8, -1.2, 0],
    [0.8, -1.2, 0],
  ];

  return (
    <group
      position={[0, 10, 0]}
      onClick={() => navigate("/lyra")}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >

      {stars.map((star, index) => (
        <group key={index}>

          <mesh position={star}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshBasicMaterial
              color={hovered ? "#ffffff" : "#fef3c7"}
            />
          </mesh>

          <mesh position={star}>
            <sphereGeometry
              args={[
                hovered ? 0.55 : 0.35,
                16,
                16
              ]}
            />
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={hovered ? 0.22 : 0.1}
            />
          </mesh>

        </group>
      ))}

      <Line
        points={[
          stars[0],
          stars[1],
          stars[3],
          stars[4],
          stars[2],
          stars[0],
        ]}
        color={hovered ? "#fde68a" : "#fbbf24"}
        lineWidth={hovered ? 5 : 3}
      />

      {hovered && (
        <Text
          position={[0, 3.2, 0]}
          fontSize={0.55}
          color="#fff7ed"
          anchorX="center"
        >
          Lyra
        </Text>
      )}

    </group>
  );
}