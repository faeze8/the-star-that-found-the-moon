import { Sphere } from "@react-three/drei";

export default function NebulaCloud({
  position,
  color,
  size = 3,
  opacity = 0.05,
}) {
  return (
    <mesh position={position}>

      <sphereGeometry
        args={[size, 32, 32]}
      />

      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />

    </mesh>
  );
}