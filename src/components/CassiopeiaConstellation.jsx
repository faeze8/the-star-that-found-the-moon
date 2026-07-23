import { Line } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function CassiopeiaConstellation() {

  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const stars = [
    [0, 1.3, 0],
    [1.2, 0, 0],
    [2.4, 1.3, 0],
    [3.6, 0, 0],
    [4.8, 1.3, 0],
  ];

  return (
    <group
      position={[12, 2, 0]}
      onClick={() => navigate("/cassiopeia")}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >

      {stars.map((star, index) => (
        <group key={index}>

          <mesh position={star}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshBasicMaterial
              color={hovered ? "#ffffff" : "#f5e6ff"}
            />
          </mesh>

          <mesh position={star}>
            <sphereGeometry
              args={[
                hovered ? 0.65 : 0.35,
                16,
                16
              ]}
            />

            <meshBasicMaterial
              color="#a855f7"
              transparent
              opacity={hovered ? 0.25 : 0.12}
            />
          </mesh>

        </group>
      ))}

      <Line
        points={stars}
        color={hovered ? "#f3e8ff" : "#c084fc"}
        lineWidth={hovered ? 6 : 3}
      />

      {/* هاله اصلی */}
      {hovered && (
        <mesh position={[2.4, 0.7, -0.2]}>
          <sphereGeometry args={[3.2, 32, 32]} />

          <meshBasicMaterial
            color="#9333ea"
            transparent
            opacity={0.05}
          />
        </mesh>
      )}

      {/* تاج ملکه */}
      {hovered && (
        <group position={[2.4, 3.2, 0]}>

          <mesh position={[-0.5, 0, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>

          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>

          <mesh position={[0.5, 0, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color="#facc15" />
          </mesh>

          <Line
            points={[
              [-0.5, 0, 0],
              [0, 0.3, 0],
              [0.5, 0, 0],
            ]}
            color="#fde68a"
            lineWidth={2}
          />

        </group>
      )}

    </group>
  );
}