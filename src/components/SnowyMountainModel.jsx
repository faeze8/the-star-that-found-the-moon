import { useGLTF } from "@react-three/drei";

export default function SnowyMountainModel() {
  const { scene } = useGLTF("/snowy_mountain_scene_02.glb");

  return (
    <primitive
      object={scene}
      scale={20}
      position={[0, -5, -100]}
    />
  );
}

useGLTF.preload("/snowy_mountain_scene_02.glb");