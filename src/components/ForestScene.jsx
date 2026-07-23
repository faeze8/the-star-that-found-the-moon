import ForestSky from "./ForestSky";
import FloatingMist from "./FloatingMist";
import Fireflies from "./Fireflies";
import ForestAudio from "./ForestAudio";
import FootstepAudio from "./FootstepAudio";
import WolfAudio from "./WolfAudio";
import ForestRocks from "./ForestRocks";
import StoryText from "./StoryText";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  useMemo,
  useState,
  useEffect,
} from "react";

function CameraRig() {

  const { camera } = useThree();

  useFrame(() => {

    const targetZ =
      8 - window.scrollY * 0.02;

    camera.position.z +=
      (targetZ - camera.position.z) * 0.08;

    camera.position.y = 2;

    camera.lookAt(
      0,
      1.5,
      -1000
    );

  });

  return null;
}

function Tree({ position }) {

  return (

    <group position={position}>

      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry
          args={[0.14, 0.2, 2.8, 8]}
        />
        <meshStandardMaterial
          color="#3d2314"
        />
      </mesh>

      <mesh position={[0, 3.3, 0]}>
        <coneGeometry
          args={[1.4, 3.2, 8]}
        />
        <meshStandardMaterial
          color="#163b26"
        />
      </mesh>

      <mesh position={[0, 4.8, 0]}>
        <coneGeometry
          args={[1.0, 2.3, 8]}
        />
        <meshStandardMaterial
          color="#215437"
        />
      </mesh>

    </group>

  );
}

function ForestWorld() {

  const trees = useMemo(() => {

    const arr = [];

    for (let i = 0; i < 180; i++) {

      arr.push({

        x:
          (Math.random() > 0.5 ? 1 : -1) *
          (5 + Math.random() * 14),

        z:
          -i * 4,

      });

    }

    return arr;

  }, []);

  const leaves = useMemo(() => {

    return Array.from({
      length: 300
    }).map(() => ({

      x:
        (Math.random() - 0.5) * 28,

      z:
        -Math.random() * 720,

      r:
        Math.random() * Math.PI,

    }));

  }, []);

  return (
    <>

      {/* زمین */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, -350]}
      >
        <planeGeometry
          args={[100, 900]}
        />

        <meshStandardMaterial
          color="#0d1710"
        />
      </mesh>

      {/* برگ ها */}

      {leaves.map((leaf, i) => (

        <mesh
          key={i}
          position={[
            leaf.x,
            0.02,
            leaf.z,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            leaf.r,
          ]}
        >
          <planeGeometry
            args={[0.18, 0.08]}
          />

          <meshBasicMaterial
            color="#8f5a2a"
          />

        </mesh>

      ))}

      {/* ماه */}

      <mesh position={[18, 16, -180]}>
        <sphereGeometry
          args={[3, 32, 32]}
        />

        <meshBasicMaterial
          color="#fff8de"
        />
      </mesh>

      {/* هاله ماه */}

      <mesh position={[18, 16, -180]}>
        <sphereGeometry
          args={[5, 32, 32]}
        />

        <meshBasicMaterial
          color="#fff8d6"
          transparent
          opacity={0.08}
        />
      </mesh>

      <pointLight
        position={[18, 16, -180]}
        intensity={7}
        color="#fff6cf"
      />

      <ForestRocks />

      {trees.map((tree, i) => (

        <Tree
          key={i}
          position={[
            tree.x,
            0,
            tree.z
          ]}
        />

      ))}

    </>
  );
}

export default function ForestScene() {

  const [scroll, setScroll] =
    useState(0);

  useEffect(() => {

    const handleScroll = () => {

      setScroll(
        window.scrollY
      );

    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, []);

  const progress =
    Math.min(
      scroll / 9000,
      1
    );

  return (
    <>

      <ForestAudio />
      <FootstepAudio />
      <WolfAudio />
      <div
        style={{
          height: "12000px"
        }}
      />

      <Canvas
        camera={{
          position: [0, 2, 8],
          fov: 60,
        }}
      >

        <ForestSky
          progress={progress}
        />

        <fog
          attach="fog"
          args={[
            "#0a0f16",
            20,
            140
          ]}
        />

        <ambientLight
          intensity={0.8}
        />

        <directionalLight
          position={[10, 15, 5]}
          intensity={1}
          color="#ffb066"
        />

        <CameraRig />

        <FloatingMist />

        <Fireflies />

        <ForestWorld />

      </Canvas>

      <StoryText
        visible={
          scroll > 500 &&
          scroll < 1500
        }
        text="I never feared getting lost. Not while I carried your light."
      />

      <StoryText
        visible={
          scroll > 2500 &&
          scroll < 3500
        }
        text="Some people don't chase away the darkness. They simply make it easier to walk through."
      />

      <StoryText
        visible={
          scroll > 4500 &&
          scroll < 5500
        }
        text="The stars were distant. You never felt that way."
      />

      <StoryText
        visible={
          scroll > 7000
        }
        text="You know where to find me. And I know where to look."
      />

    </>
  );
}