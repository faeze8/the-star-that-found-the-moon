export default function ForestRocks() {

  const rocks = [];

  for (let i = 0; i < 120; i++) {

    rocks.push(

      <mesh
        key={i}
        position={[
          (Math.random() - 0.5) * 24,
          -0.01,
          -Math.random() * 720,
        ]}
        rotation={[
          Math.random(),
          Math.random(),
          Math.random(),
        ]}
      >
        <dodecahedronGeometry
          args={[
            Math.random() * 0.25 + 0.1
          ]}
        />

        <meshStandardMaterial
          color="#4f4f4f"
        />

      </mesh>

    );

  }

  return <>{rocks}</>;

}