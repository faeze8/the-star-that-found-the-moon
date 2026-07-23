import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";

import MountainSky from "./MountainSky";
import ValleyMountains from "./ValleyMountains";
import CaveInterior from "./CaveInterior";
import FloatingMist from "./FloatingMist";
import SnowParticles from "./SnowParticles";

function CameraRig() {
  useFrame(({ camera }) => {
    const progress = Math.min(
      window.scrollY / 18000,
      1
    );

    if (progress < 0.85) {
      camera.position.x =
        Math.sin(progress * 8) * 8;

      camera.position.z =
        40 - progress * 7600;

      camera.position.y =
        10 + progress * 18;

      camera.lookAt(
        Math.sin(progress * 4) * 20,
        25,
        camera.position.z - 250
      );
    } else {
      const caveProgress =
        (progress - 0.85) / 0.15;

      camera.position.x = 0;

      camera.position.z =
        -7100 -
        caveProgress * 180;

      camera.position.y =
        80;

      camera.lookAt(
        0,
        70,
        -7300
      );
    }
  });

  return null;
}

export default function CloudMountainScene() {
  const [scroll, setScroll] =
    useState(0);

  useEffect(() => {
    const handle = () =>
      setScroll(window.scrollY);

    window.addEventListener(
      "scroll",
      handle
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handle
      );
  }, []);

  return (
    <>
      <div
        style={{
          height: "20000px",
          width: "100%",
          position: "relative",
          zIndex: 10,
        }}
      />

      <Canvas
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
        }}
        camera={{
          position: [0, 8, 40],
          fov: 55,
        }}
      >
        <MountainSky
          progress={scroll / 18000}
        />

        <fog
          attach="fog"
          args={[
            "#dfe8f3",
            120,
            2200,
          ]}
        />

        <ambientLight
          intensity={1.4}
        />

        <directionalLight
          position={[
            50,
            80,
            20,
          ]}
          intensity={2.4}
        />

        <CameraRig />

        <FloatingMist />

        <SnowParticles />

        {/* دره */}

        <ValleyMountains />

        {/* زمین اصلی */}

        <mesh
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          position={[
            0,
            -0.2,
            -3500,
          ]}
        >
          <planeGeometry
            args={[
              350,
              9000,
            ]}
          />

          <meshStandardMaterial
            color="#eef4fa"
          />
        </mesh>

        {/* مسیر */}

        <mesh
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          position={[
            0,
            0.05,
            -3500,
          ]}
        >
          <planeGeometry
            args={[
              16,
              9000,
            ]}
          />

          <meshStandardMaterial
            color="#d6c7b2"
          />
        </mesh>

        {/* غار */}

        <CaveInterior />
      </Canvas>
    </>
  );
}