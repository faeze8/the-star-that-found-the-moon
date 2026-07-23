import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function GalaxyCore() {

  const galaxyRef = useRef();

  const { positions, colors } = useMemo(() => {

    const count = 12000;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {

      const radius = Math.random() * 12;

      const branchAngle =
        ((i % 4) / 4) * Math.PI * 2;

      const spinAngle = radius * 0.8;

      const randomX =
        (Math.random() - 0.5) *
        (12 - radius) *
        0.25;

      const randomY =
        (Math.random() - 0.5) *
        0.5;

      const randomZ =
        (Math.random() - 0.5) *
        (12 - radius) *
        0.25;

      const x =
        Math.cos(branchAngle + spinAngle) *
        radius +
        randomX;

      const y = randomY;

      const z =
        Math.sin(branchAngle + spinAngle) *
        radius +
        randomZ;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // رنگ‌بندی کهکشان

      const t = radius / 12;

      const centerColor =
        new THREE.Color("#fff4d6"); // طلایی روشن

      const purpleColor =
        new THREE.Color("#8b5cf6"); // بنفش

      const blueColor =
        new THREE.Color("#4f7cff"); // آبی

      const redColor =
        new THREE.Color("#8b1e3f"); // شرابی

      const color = centerColor.clone();

      if (t < 0.3) {

        color.lerp(
          purpleColor,
          t / 0.3
        );

      } else if (t < 0.7) {

        color.copy(purpleColor);

        color.lerp(
          blueColor,
          (t - 0.3) / 0.4
        );

      } else {

        color.copy(blueColor);

        color.lerp(
          redColor,
          (t - 0.7) / 0.3
        );
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return {
      positions,
      colors
    };

  }, []);

  useFrame(() => {

    if (galaxyRef.current) {

      galaxyRef.current.rotation.y += 0.0008;

    }

  });

  return (
    <points ref={galaxyRef}>

      <bufferGeometry>

        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />

        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />

      </bufferGeometry>

      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        depthWrite={false}
      />

    </points>
  );
}