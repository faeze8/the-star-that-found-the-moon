import { useFrame, useThree } from "@react-three/fiber";

export default function CameraDrift() {
  const { camera } = useThree();

  useFrame(({ clock }) => {

    const t = clock.getElapsedTime();

    camera.position.x =
      Math.sin(t * 0.05) * 1.2;

    camera.position.y =
      6 + Math.sin(t * 0.08) * 0.4;

    camera.lookAt(0, 0, 0);

  });

  return null;
}