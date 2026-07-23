import { useMemo } from "react";

export default function BrightStars() {

  const stars = useMemo(() => {

    const colors = [
      "#ffffff",
      "#b8d8ff",
      "#d8b8ff",
      "#ffd6a5",
      "#ffb3b3",
    ];

    return Array.from({ length: 120 }, () => ({

      position: [
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 60,
      ],

      size:
        Math.random() < 0.03
          ? Math.random() * 0.12 + 0.08
          : Math.random() * 0.025 + 0.008,

      color:
        colors[
          Math.floor(
            Math.random() * colors.length
          )
        ]

    }));

  }, []);

  return (
    <>
      {stars.map((star, index) => (

        <mesh
          key={index}
          position={star.position}
        >

          <sphereGeometry
            args={[star.size, 8, 8]}
          />

          <meshBasicMaterial
            color={star.color}
            transparent
            opacity={0.7}
          />

        </mesh>

      ))}
    </>
  );
}