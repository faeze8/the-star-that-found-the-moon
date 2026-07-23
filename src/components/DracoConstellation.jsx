import { Line } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function DracoConstellation() {

  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const stars = [
    [0, 3, 0],
    [-1, 2, 0],
    [-1.8, 1, 0],
    [-1.2, 0, 0],
    [-0.2, -1, 0],
    [1, -2, 0],
    [2.2, -3, 0],
  ];

  return (
    <group
      position={[-13, 1, 0]}
      onClick={() => navigate("/draco")}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >

      {stars.map((star, index) => (
        <group key={index}>

          <mesh position={star}>
            <sphereGeometry args={[0.16, 20, 20]} />
            <meshBasicMaterial
              color={hovered ? "#ffffff" : "#d1fae5"}
            />
          </mesh>

          <mesh position={star}>
            <sphereGeometry
              args={[
                hovered ? 0.7 : 0.45,
                20,
                20
              ]}
            />
            <meshBasicMaterial
              color="#10b981"
              transparent
              opacity={hovered ? 0.25 : 0.08}
            />
          </mesh>

        </group>
      ))}

      <Line
        points={stars}
        color={hovered ? "#6ee7b7" : "#34d399"}
        lineWidth={hovered ? 6 : 3}
      />

      {/* سر اژدها */}
      {hovered && (
        <mesh position={[0, 3, -0.2]}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshBasicMaterial
            color="#064e3b"
            transparent
            opacity={0.12}
          />
        </mesh>
      )}

      {/* چشم چپ */}
      <mesh position={[-0.18, 3.12, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial
          color={hovered ? "#ff2222" : "#662222"}
        />
      </mesh>

      {/* چشم راست */}
      <mesh position={[0.18, 3.12, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial
          color={hovered ? "#ff2222" : "#662222"}
        />
      </mesh>

      {/* شاخ چپ */}
      {hovered && (
        <Line
          points={[
            [-0.3, 3.5, 0],
            [-0.7, 4.0, 0],
          ]}
          color="#6ee7b7"
          lineWidth={3}
        />
      )}

      {/* شاخ راست */}
      {hovered && (
        <Line
          points={[
            [0.3, 3.5, 0],
            [0.7, 4.0, 0],
          ]}
          color="#6ee7b7"
          lineWidth={3}
        />
      )}

      {/* هاله اژدها */}
      {hovered && (
        <mesh position={[0, 0, -0.5]}>
          <sphereGeometry args={[4.5, 32, 32]} />
          <meshBasicMaterial
            color="#065f46"
            transparent
            opacity={0.04}
          />
        </mesh>
      )}

    </group>
  );
}