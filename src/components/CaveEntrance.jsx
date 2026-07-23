export default function CaveEntrance() {

  return (
    <group
      position={[
        0,
        18,
        -450
      ]}
    >

      <mesh>
        <sphereGeometry
          args={[
            20,
            32,
            32
          ]}
        />

        <meshStandardMaterial
          color="#3a3a3a"
        />
      </mesh>

      <mesh
        position={[
          0,
          -5,
          15
        ]}
      >
        <sphereGeometry
          args={[
            8,
            32,
            32
          ]}
        />

        <meshBasicMaterial
          color="black"
        />
      </mesh>

    </group>
  );
}