import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Fireflies() {

  const group = useRef();

  const points = useMemo(() => {

    return Array.from({
      length: 50
    }).map(() => ({
      x:
        (Math.random() - 0.5) * 40,

      y:
        Math.random() * 5 + 1,

      z:
        -Math.random() * 700,
    }));

  }, []);

  useFrame(({ clock }) => {

    if (!group.current) return;

    group.current.children.forEach(
      (child, i) => {

        child.position.y =
          points[i].y +
          Math.sin(
            clock.elapsedTime * 2 +
            i
          ) * 0.25;

      }
    );

  });

  return (

    <group ref={group}>

      {points.map((p, i) => (

        <group
          key={i}
          position={[
            p.x,
            p.y,
            p.z
          ]}
        >

          <mesh>
            <sphereGeometry
              args={[0.05, 8, 8]}
            />

            <meshBasicMaterial
              color="#fff6b7"
            />
          </mesh>

          <mesh>
            <sphereGeometry
              args={[0.18, 8, 8]}
            />

            <meshBasicMaterial
              color="#ffe9a8"
              transparent
              opacity={0.15}
            />
          </mesh>

        </group>

      ))}

    </group>

  );
}