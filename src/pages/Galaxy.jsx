import { useNavigate } from "react-router-dom";
import { useState } from "react";

import TransitionOverlay from "../components/TransitionOverlay";
import CameraDrift from "../components/CameraDrift";

import NebulaCloud from "../components/NebulaCloud";

import OrionConstellation from "../components/OrionConstellation";
import CassiopeiaConstellation from "../components/CassiopeiaConstellation";
import LyraConstellation from "../components/LyraConstellation";
import DracoConstellation from "../components/DracoConstellation";

import ConstellationHub from "../components/ConstellationHub";
import BrightStars from "../components/BrightStars";

import { Canvas } from "@react-three/fiber";

import GalaxyCore from "../components/GalaxyCore";

import "../styles/galaxy.css";

export default function Galaxy() {

  const navigate = useNavigate();

  const [transitioning, setTransitioning] =
    useState(false);

  function handleConstellationSelect(route) {

    setTransitioning(true);

    setTimeout(() => {
      navigate(`/${route}`);
    }, 1500);

  }

  return (
    <div className="galaxy-page">

      <Canvas camera={{ position: [0, 6, 18] }}>

        <ambientLight intensity={2} />

        <CameraDrift />

        <GalaxyCore />

        {/* سحابی‌ها */}

        <NebulaCloud
          position={[8, 4, -5]}
          color="#4c1d95"
          size={4}
          opacity={0.05}
        />

        <NebulaCloud
          position={[-9, -3, -6]}
          color="#312e81"
          size={5}
          opacity={0.04}
        />

        <NebulaCloud
          position={[0, 8, -7]}
          color="#7c2d12"
          size={4}
          opacity={0.03}
        />

        <NebulaCloud
          position={[5, -8, -5]}
          color="#581c87"
          size={3}
          opacity={0.04}
        />

        {/* ستاره‌های پس‌زمینه */}

        <BrightStars />

        {/* صورت‌های فلکی */}

        <OrionConstellation
          onSelect={handleConstellationSelect}
        />

        <CassiopeiaConstellation onSelect={handleConstellationSelect}/>

        <LyraConstellation onSelect={handleConstellationSelect}/>

        <DracoConstellation onSelect={handleConstellationSelect} />

        <ConstellationHub />

        {/* هسته کهکشان */}

        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshBasicMaterial color="#fff4d6" />
        </mesh>

        <pointLight
          position={[0, 0, 0]}
          intensity={20}
          color="#ffe8b5"
        />

      </Canvas>

      <TransitionOverlay
        active={transitioning}
      />

    </div>
  );
}