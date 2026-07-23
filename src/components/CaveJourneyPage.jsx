import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * CaveJourney
 * -----------
 * A scroll-driven 3D scene: a stylized traveler walks a winding snowy
 * mountain path into a glowing crystal cave. Scroll progress through the
 * component drives the character's position along a curve, the camera
 * follow, and an environment transition from cold daylight to warm/violet
 * cave light.
 *
 * Requires: npm install three   (tested against three ^0.160.0, but any
 * recent version works — no OrbitControls or addon imports are used).
 *
 * Usage:
 *   import CaveJourney from "./CaveJourney";
 *   export default function App(){ return <CaveJourney />; }
 *
 * The component owns its own scroll container (600vh tall) so it works
 * as a self-contained page section — drop it anywhere in your app.
 * For the display font used in the title, either self-host "Cinzel" or
 * add this to your index.html <head>:
 *   <link rel="stylesheet"
 *     href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Vazirmatn:wght@400;600&display=swap">
 */

const PALETTE = {
  ice: 0xcfe0ee,
  steel: 0x8fa3c4,
  indigo: 0x584f80,
  clay: 0xc98b5c,
  ember: 0xb04f2c,
  paper: 0xf4efe6,
  cyanCrystal: 0x6fd7e8,
  purpleCrystal: 0xa06fe8,
  pine: 0x2f4a3d,
  trunk: 0x4a3a2c,
  skyTop: 0xdcebf7,
  caveDeep: 0x140a24,
};

const CAVE_ENTER_T = 0.56;

export default function CaveJourney() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const titleRef = useRef(null);
  const hintRef = useRef(null);
  const progressBarRef = useRef(null);
  const arrivalRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    let width = stage.clientWidth;
    let height = stage.clientHeight;

    // ---------------------------------------------------------------
    // renderer / scene / camera
    // ---------------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PALETTE.skyTop);
    scene.fog = new THREE.FogExp2(PALETTE.skyTop, 0.012);

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 500);
    camera.position.set(0, 6, 65);

    const handleResize = () => {
      width = stage.clientWidth;
      height = stage.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // ---------------------------------------------------------------
    // lights
    // ---------------------------------------------------------------
    const hemi = new THREE.HemisphereLight(PALETTE.skyTop, PALETTE.steel, 0.9);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff6e0, 1.15);
    sun.position.set(30, 40, 20);
    scene.add(sun);

    const ambient = new THREE.AmbientLight(0x554a77, 0.0);
    scene.add(ambient);

    const caveLights = [];
    function addCaveLight(pos, color, intensity, distance) {
      const l = new THREE.PointLight(color, 0, distance);
      l.position.copy(pos);
      scene.add(l);
      caveLights.push({ light: l, baseIntensity: intensity });
    }

    // ---------------------------------------------------------------
    // glow sprites (cheap bloom substitute)
    // ---------------------------------------------------------------
    function makeGlowTexture(colorHex) {
      const size = 128;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      const col = new THREE.Color(colorHex);
      const r = Math.floor(col.r * 255), g = Math.floor(col.g * 255), b = Math.floor(col.b * 255);
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},0.4)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }
    const glowTexCyan = makeGlowTexture(PALETTE.cyanCrystal);
    const glowTexPurple = makeGlowTexture(PALETTE.purpleCrystal);
    const glowTexWarm = makeGlowTexture(0xffb066);

    const glowSprites = [];
    function addGlowSprite(pos, tex, scale, opacityBase) {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: opacityBase });
      const spr = new THREE.Sprite(mat);
      spr.position.copy(pos);
      spr.scale.set(scale, scale, 1);
      scene.add(spr);
      return spr;
    }

    // ---------------------------------------------------------------
    // path curve (S-curve outside -> straightens into the cave)
    // ---------------------------------------------------------------
    const controlPoints = [
      new THREE.Vector3(2, 0, 70),
      new THREE.Vector3(14, 0, 50),
      new THREE.Vector3(-12, 0, 30),
      new THREE.Vector3(10, 0, 10),
      new THREE.Vector3(-4, 0, -6),
      new THREE.Vector3(0, 0, -20), // cave threshold
      new THREE.Vector3(0, -0.4, -45),
      new THREE.Vector3(0, -0.6, -70),
      new THREE.Vector3(0, -0.8, -98), // deep cave terminus
    ];
    const curve = new THREE.CatmullRomCurve3(controlPoints, false, "catmullrom", 0.4);

    function buildPathRibbon() {
      const segments = 240;
      const width_ = 3.4;
      const positions = [];
      const uvs = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
        const left = p.clone().addScaledVector(side, width_ / 2);
        const right = p.clone().addScaledVector(side, -width_ / 2);
        left.y += 0.02; right.y += 0.02;
        positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
        uvs.push(0, t, 1, t);
      }
      const indices = [];
      for (let i = 0; i < segments; i++) {
        const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
        indices.push(a, b, c, b, d, c);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ color: PALETTE.ice, roughness: 0.9, flatShading: true });
      scene.add(new THREE.Mesh(geo, mat));
    }
    buildPathRibbon();

    // ---------------------------------------------------------------
    // terrain
    // ---------------------------------------------------------------
    function buildGround() {
      const geo = new THREE.PlaneGeometry(260, 260, 60, 60);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        const bump = Math.sin(x * 0.08) * Math.cos(z * 0.07) * 1.4 + (Math.random() - 0.5) * 0.5;
        pos.setY(i, bump);
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ color: PALETTE.ice, roughness: 1, flatShading: true });
      const ground = new THREE.Mesh(geo, mat);
      ground.position.z = -20;
      scene.add(ground);
    }
    buildGround();

    // ---------------------------------------------------------------
    // mountains
    // ---------------------------------------------------------------
    function buildMountains() {
      const colors = [PALETTE.steel, PALETTE.indigo];
      for (let i = 0; i < 26; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const dist = 30 + Math.random() * 55;
        const z = 80 - Math.random() * 190;
        const heightM = 22 + Math.random() * 38;
        const radius = heightM * 0.55;
        const geo = new THREE.ConeGeometry(radius, heightM, 6, 1);
        const col = colors[Math.floor(Math.random() * colors.length)];
        const mat = new THREE.MeshStandardMaterial({ color: col, flatShading: true, roughness: 1 });
        const cone = new THREE.Mesh(geo, mat);
        cone.position.set(side * dist, heightM / 2 - 2, z);
        cone.rotation.y = Math.random() * Math.PI;
        scene.add(cone);

        const capGeo = new THREE.ConeGeometry(radius * 0.42, heightM * 0.32, 6, 1);
        const capMat = new THREE.MeshStandardMaterial({ color: PALETTE.paper, flatShading: true, roughness: 0.8 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(cone.position.x, cone.position.y + heightM / 2 - heightM * 0.14, cone.position.z);
        cap.rotation.y = cone.rotation.y;
        scene.add(cap);
      }
    }
    buildMountains();

    // ---------------------------------------------------------------
    // pine trees (instanced)
    // ---------------------------------------------------------------
    function buildTrees() {
      const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 1.1, 5);
      const trunkMat = new THREE.MeshStandardMaterial({ color: PALETTE.trunk, flatShading: true });
      const leafGeo = new THREE.ConeGeometry(0.9, 2.4, 7);
      const leafMat = new THREE.MeshStandardMaterial({ color: PALETTE.pine, flatShading: true });

      const count = 140;
      const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
      const leafMesh = new THREE.InstancedMesh(leafGeo, leafMat, count);
      const dummy = new THREE.Object3D();

      let placed = 0, attempts = 0;
      while (placed < count && attempts < count * 8) {
        attempts++;
        const t = Math.random() * CAVE_ENTER_T * 0.92;
        const p = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
        const offset = (4 + Math.random() * 20) * (Math.random() < 0.5 ? -1 : 1);
        const pos = p.clone().addScaledVector(side, offset);
        const scale = 0.7 + Math.random() * 1.1;

        dummy.position.set(pos.x, 0.55 * scale - 2, pos.z);
        dummy.scale.setScalar(scale);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.updateMatrix();
        trunkMesh.setMatrixAt(placed, dummy.matrix);

        dummy.position.set(pos.x, 1.6 * scale - 2, pos.z);
        dummy.updateMatrix();
        leafMesh.setMatrixAt(placed, dummy.matrix);
        placed++;
      }
      scene.add(trunkMesh, leafMesh);
    }
    buildTrees();

    // ---------------------------------------------------------------
    // falling snow
    // ---------------------------------------------------------------
    function buildSnow() {
      const count = 900;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 120;
        positions[i * 3 + 1] = Math.random() * 50;
        positions[i * 3 + 2] = 70 - Math.random() * 160;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.85 });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      return points;
    }
    const snowParticles = buildSnow();

    // ---------------------------------------------------------------
    // cave arch + tunnel
    // ---------------------------------------------------------------
    function buildCaveArch() {
      const threshold = curve.getPointAt(CAVE_ENTER_T);
      const group = new THREE.Group();
      group.position.copy(threshold);

      const archGeo = new THREE.TorusGeometry(6.5, 2.3, 8, 16, Math.PI);
      const archMat = new THREE.MeshStandardMaterial({ color: PALETTE.steel, flatShading: true, roughness: 1 });
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.rotation.z = Math.PI;
      arch.position.y = 6.2;
      group.add(arch);

      for (let i = 0; i < 10; i++) {
        const s = 3 + Math.random() * 4;
        const geo = new THREE.IcosahedronGeometry(s, 0);
        const mat = new THREE.MeshStandardMaterial({ color: Math.random() < 0.5 ? PALETTE.indigo : PALETTE.steel, flatShading: true });
        const rock = new THREE.Mesh(geo, mat);
        const ang = (Math.random() - 0.5) * Math.PI * 0.9;
        rock.position.set(Math.sin(ang) * 8, 3 + Math.random() * 10, Math.cos(ang) * 3 - 1);
        group.add(rock);
      }
      scene.add(group);
    }
    buildCaveArch();

    function buildTunnel() {
      const tunnelCurve = new THREE.CatmullRomCurve3(controlPoints.slice(4), false, "catmullrom", 0.4);
      const geo = new THREE.TubeGeometry(tunnelCurve, 80, 7.5, 10, false);
      const mat = new THREE.MeshStandardMaterial({ color: PALETTE.indigo, side: THREE.BackSide, flatShading: true, roughness: 1 });
      scene.add(new THREE.Mesh(geo, mat));
    }
    buildTunnel();

    // ---------------------------------------------------------------
    // crystals + lantern glow
    // ---------------------------------------------------------------
    function buildCrystals() {
      const spots = [
        { t: CAVE_ENTER_T - 0.01, side: 1, color: PALETTE.cyanCrystal, tex: glowTexCyan },
        { t: CAVE_ENTER_T - 0.005, side: -1, color: PALETTE.cyanCrystal, tex: glowTexCyan },
        { t: CAVE_ENTER_T + 0.02, side: 1, color: PALETTE.purpleCrystal, tex: glowTexPurple },
        { t: CAVE_ENTER_T + 0.03, side: -1, color: PALETTE.cyanCrystal, tex: glowTexCyan },
        { t: 0.66, side: 1, color: PALETTE.purpleCrystal, tex: glowTexPurple },
        { t: 0.66, side: -1, color: PALETTE.cyanCrystal, tex: glowTexCyan },
        { t: 0.78, side: 1, color: PALETTE.cyanCrystal, tex: glowTexCyan },
        { t: 0.78, side: -1, color: PALETTE.purpleCrystal, tex: glowTexPurple },
        { t: 0.92, side: 1, color: PALETTE.purpleCrystal, tex: glowTexPurple },
        { t: 0.92, side: -1, color: PALETTE.purpleCrystal, tex: glowTexPurple },
      ];
      spots.forEach((spot) => {
        const tt = Math.min(spot.t, 0.999);
        const p = curve.getPointAt(tt);
        const tangent = curve.getTangentAt(tt).normalize();
        const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
        const base = p.clone().addScaledVector(side, spot.side * 4.2);

        const clusterGroup = new THREE.Group();
        const shardCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < shardCount; i++) {
          const h = 1.4 + Math.random() * 2.4;
          const geo = new THREE.ConeGeometry(0.35 + Math.random() * 0.25, h, 5);
          const mat = new THREE.MeshStandardMaterial({ color: spot.color, emissive: spot.color, emissiveIntensity: 0.9, flatShading: true, roughness: 0.3 });
          const shard = new THREE.Mesh(geo, mat);
          shard.position.set((Math.random() - 0.5) * 1.2, h / 2 - 2, (Math.random() - 0.5) * 1.2);
          shard.rotation.z = (Math.random() - 0.5) * 0.5;
          shard.rotation.y = Math.random() * Math.PI;
          clusterGroup.add(shard);
        }
        clusterGroup.position.copy(base);
        scene.add(clusterGroup);

        const spr = addGlowSprite(base.clone().setY(base.y - 0.5), spot.tex, 7, 0);
        glowSprites.push({ sprite: spr, worldPos: base.clone(), maxOpacity: 0.8 });
        addCaveLight(base.clone().setY(1), spot.color, 1.4, 14);
      });

      for (let t = CAVE_ENTER_T; t < 0.98; t += 0.07) {
        const p = curve.getPointAt(t);
        const spr = addGlowSprite(p.clone().setY(p.y - 0.3), glowTexWarm, 5, 0);
        glowSprites.push({ sprite: spr, worldPos: p.clone(), maxOpacity: 0.55 });
        addCaveLight(p.clone().setY(0.6), 0xffb066, 0.9, 10);
      }

      const endP = curve.getPointAt(0.985);
      const endSpr = addGlowSprite(endP, glowTexPurple, 16, 0);
      glowSprites.push({ sprite: endSpr, worldPos: endP.clone(), maxOpacity: 1 });
    }
    buildCrystals();

    // ---------------------------------------------------------------
    // character
    // ---------------------------------------------------------------
    function buildCharacter() {
      const group = new THREE.Group();

      const cloakGeo = new THREE.ConeGeometry(0.55, 1.7, 8);
      const cloakMat = new THREE.MeshStandardMaterial({ color: PALETTE.indigo, flatShading: true, roughness: 0.9 });
      const cloak = new THREE.Mesh(cloakGeo, cloakMat);
      cloak.position.y = 0.85;
      group.add(cloak);

      const headGeo = new THREE.SphereGeometry(0.32, 10, 8);
      const headMat = new THREE.MeshStandardMaterial({ color: PALETTE.paper, flatShading: true });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.85;
      group.add(head);

      const hoodGeo = new THREE.ConeGeometry(0.4, 0.55, 8);
      const hoodMat = new THREE.MeshStandardMaterial({ color: PALETTE.indigo, flatShading: true });
      const hood = new THREE.Mesh(hoodGeo, hoodMat);
      hood.position.y = 2.05;
      group.add(hood);

      scene.add(group);
      return group;
    }
    const character = buildCharacter();

    // ---------------------------------------------------------------
    // scroll -> progress (driven by this component's own container)
    // ---------------------------------------------------------------
    let progressRaw = 0;
    const handleScroll = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;
      progressRaw = maxScroll > 0 ? Math.min(Math.max(container.scrollTop / maxScroll, 0), 1) : 0;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // ---------------------------------------------------------------
    // animation loop
    // ---------------------------------------------------------------
    const clock = new THREE.Clock();
    const tmpUp = new THREE.Vector3(0, 1, 0);
    const camTargetPos = new THREE.Vector3();
    const camLookAt = new THREE.Vector3();
    const skyColorA = new THREE.Color(PALETTE.skyTop);
    const skyColorB = new THREE.Color(PALETTE.caveDeep);
    const fogColorTmp = new THREE.Color();
    const lerp = (a, b, tt) => a + (b - a) * tt;

    let progress = 0;
    let rafId;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      progress += (progressRaw - progress) * 0.07;
      const t = Math.min(Math.max(progress, 0.0001), 0.999);

      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      character.position.set(p.x, p.y, p.z);
      const lookTarget = p.clone().add(tangent);
      character.lookAt(lookTarget.x, character.position.y, lookTarget.z);
      const bob = Math.abs(Math.sin(elapsed * 6)) * 0.08;
      character.position.y = p.y + bob;

      const side = new THREE.Vector3().crossVectors(tangent, tmpUp).normalize();
      const followBack = 7.5;
      const followHeight = 3.2;
      camTargetPos.set(p.x - tangent.x * followBack + side.x * 0.6, p.y + followHeight, p.z - tangent.z * followBack);
      camera.position.lerp(camTargetPos, 1 - Math.pow(0.001, dt));
      camLookAt.set(p.x + tangent.x * 6, p.y + 1.6, p.z + tangent.z * 6);
      camera.lookAt(camLookAt);

      const caveMix = THREE.MathUtils.smoothstep(t, CAVE_ENTER_T - 0.06, CAVE_ENTER_T + 0.05);
      fogColorTmp.copy(skyColorA).lerp(skyColorB, caveMix);
      scene.fog.color.copy(fogColorTmp);
      scene.fog.density = lerp(0.012, 0.028, caveMix);
      scene.background.copy(fogColorTmp);

      sun.intensity = lerp(1.15, 0, caveMix);
      hemi.intensity = lerp(0.9, 0.05, caveMix);
      ambient.intensity = lerp(0.0, 0.35, caveMix);
      snowParticles.visible = caveMix < 0.9;

      glowSprites.forEach((g) => {
        const d = g.worldPos.distanceTo(p);
        const proximity = THREE.MathUtils.clamp(1 - d / 24, 0, 1);
        g.sprite.material.opacity = g.maxOpacity * proximity * Math.max(caveMix, 0.15);
      });
      caveLights.forEach((cl) => {
        const d = cl.light.position.distanceTo(p);
        const proximity = THREE.MathUtils.clamp(1 - d / 16, 0, 1);
        cl.light.intensity = cl.baseIntensity * proximity * caveMix;
      });

      if (titleRef.current) titleRef.current.style.opacity = t < 0.04 ? 1 : Math.max(0, 1 - (t - 0.04) * 14);
      if (hintRef.current) hintRef.current.style.opacity = t < 0.03 ? 1 : Math.max(0, 1 - (t - 0.03) * 20);
      if (progressBarRef.current) progressBarRef.current.style.height = (t * 100).toFixed(1) + "%";
      if (arrivalRef.current) arrivalRef.current.style.opacity = t > 0.93 ? Math.min((t - 0.93) * 14, 1) : 0;

      renderer.render(scene, camera);
    }
    animate();

    // ---------------------------------------------------------------
    // cleanup
    // ---------------------------------------------------------------
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("scroll", handleScroll);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      if (stage.contains(renderer.domElement)) stage.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflowY: "scroll",
        overflowX: "hidden",
        background: "#0a0812",
        fontFamily: "'Vazirmatn', sans-serif",
      }}
    >
      <div ref={stageRef} style={{ position: "sticky", top: 0, height: "100vh", width: "100%" }}>
        <div
          ref={titleRef}
          style={{
            position: "absolute",
            top: "6vh",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            color: "#f4efe6",
            transition: "opacity 1s ease",
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: "clamp(22px,4vw,40px)",
              letterSpacing: "0.06em",
              margin: "0 0 10px 0",
            }}
          >
            راه گذرگاه یخی
          </h1>
          <p style={{ fontSize: 14, letterSpacing: "0.02em", margin: 0, color: "#cfe0ee", opacity: 0.85 }}>
            مسیر کوهستان تا قلب غار کریستالی
          </p>
        </div>

        <div
          ref={hintRef}
          style={{
            position: "absolute",
            bottom: "6vh",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#f4efe6",
            fontSize: 13,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            transition: "opacity 0.8s ease",
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <span>برای حرکت در مسیر اسکرول کنید</span>
          <span
            style={{
              width: 10,
              height: 10,
              borderRight: "2px solid #f4efe6",
              borderBottom: "2px solid #f4efe6",
              transform: "rotate(45deg)",
              animation: "cavejourney-bob 1.6s ease-in-out infinite",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            right: 26,
            top: "50%",
            transform: "translateY(-50%)",
            width: 3,
            height: "38vh",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 3,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div
            ref={progressBarRef}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              background: "linear-gradient(180deg, #cfe0ee, #b04f2c)",
              borderRadius: 3,
              height: "0%",
            }}
          />
        </div>

        <div
          ref={arrivalRef}
          style={{
            position: "absolute",
            bottom: "9vh",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#f4efe6",
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(16px,2.6vw,24px)",
            letterSpacing: "0.08em",
            opacity: 0,
            transition: "opacity 1.2s ease",
            textShadow: "0 0 24px rgba(160,110,255,0.6)",
            zIndex: 10,
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          به قلب غار رسیدی
        </div>
      </div>

      {/* extra scroll length so the sticky stage has room to progress through */}
      <div style={{ height: "600vh" }} />

      <style>{`
        @keyframes cavejourney-bob {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(6px) rotate(45deg); }
        }
      `}</style>
    </div>
  );
}
