import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ---------------------------------------------------------
   PALETTE
--------------------------------------------------------- */
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
  skyBottom: 0xaebedd,
  caveDeep: 0x140a24,
};

export default function CaveJourney() {
  const stageRef = useRef(null);
  const scrollSpaceRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const scrollSpace = scrollSpaceRef.current;
    const progressBar = progressBarRef.current;
    if (!stage || !scrollSpace) return;

    /* ---------------------------------------------------------
       RENDERER / SCENE / CAMERA
    --------------------------------------------------------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PALETTE.skyTop);
    scene.fog = new THREE.FogExp2(PALETTE.skyTop, 0.012);

    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 6, 65);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    /* ---------------------------------------------------------
       LIGHTS
    --------------------------------------------------------- */
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

    /* ---------------------------------------------------------
       GLOW SPRITES (cheap bloom substitute)
    --------------------------------------------------------- */
    function makeGlowTexture(colorHex) {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      const col = new THREE.Color(colorHex);
      const r = Math.floor(col.r * 255), g = Math.floor(col.g * 255), b = Math.floor(col.b * 255);
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},0.4)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      return tex;
    }
    const glowTexCyan = makeGlowTexture(PALETTE.cyanCrystal);
    const glowTexPurple = makeGlowTexture(PALETTE.purpleCrystal);
    const glowTexWarm = makeGlowTexture(0xffb066);

    function addGlowSprite(pos, tex, scale, opacityBase) {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: opacityBase });
      const spr = new THREE.Sprite(mat);
      spr.position.copy(pos);
      spr.scale.set(scale, scale, 1);
      scene.add(spr);
      return spr;
    }
    const glowSprites = [];

    /* ---------------------------------------------------------
       PATH CURVE (S-curve outside -> straightens into cave)
    --------------------------------------------------------- */
    const controlPoints = [
      new THREE.Vector3(2, 0, 70),
      new THREE.Vector3(14, 0, 50),
      new THREE.Vector3(-12, 0, 30),
      new THREE.Vector3(10, 0, 10),
      new THREE.Vector3(-4, 0, -6),
      new THREE.Vector3(0, 0, -20),
      new THREE.Vector3(0, -0.4, -45),
      new THREE.Vector3(0, -0.6, -70),
      new THREE.Vector3(0, -0.8, -98),
    ];
    const curve = new THREE.CatmullRomCurve3(controlPoints, false, 'catmullrom', 0.4);
    const CAVE_ENTER_T = 0.56;

    /* ground path ribbon (outdoor + cave floor) */
    function buildPathRibbon() {
      const segments = 240;
      const width = 3.4;
      const positions = [];
      const uvs = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const p = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
        const left = p.clone().addScaledVector(side, width / 2);
        const right = p.clone().addScaledVector(side, -width / 2);
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
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ color: PALETTE.ice, roughness: 0.9, flatShading: true });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
    }
    buildPathRibbon();

    /* ---------------------------------------------------------
       TERRAIN (snow ground, outside only)
    --------------------------------------------------------- */
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

    /* ---------------------------------------------------------
       MOUNTAINS (flat-shaded cones, framing the valley)
    --------------------------------------------------------- */
    function buildMountains() {
      const colors = [PALETTE.steel, PALETTE.indigo];
      for (let i = 0; i < 26; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const dist = 30 + Math.random() * 55;
        const z = 80 - Math.random() * 190;
        const height = 22 + Math.random() * 38;
        const radius = height * 0.55;
        const geo = new THREE.ConeGeometry(radius, height, 6, 1);
        const col = colors[Math.floor(Math.random() * colors.length)];
        const mat = new THREE.MeshStandardMaterial({ color: col, flatShading: true, roughness: 1 });
        const cone = new THREE.Mesh(geo, mat);
        cone.position.set(side * dist, height / 2 - 2, z);
        cone.rotation.y = Math.random() * Math.PI;
        scene.add(cone);

        const capGeo = new THREE.ConeGeometry(radius * 0.42, height * 0.32, 6, 1);
        const capMat = new THREE.MeshStandardMaterial({ color: PALETTE.paper, flatShading: true, roughness: 0.8 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(cone.position.x, cone.position.y + height / 2 - height * 0.14, cone.position.z);
        cap.rotation.y = cone.rotation.y;
        scene.add(cap);
      }
    }
    buildMountains();

    /* ---------------------------------------------------------
       PINE TREES (instanced, corridor along the outdoor path)
    --------------------------------------------------------- */
    function buildTrees() {
      const trunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 1.1, 5);
      const trunkMat = new THREE.MeshStandardMaterial({ color: PALETTE.trunk, flatShading: true });
      const leafGeo = new THREE.ConeGeometry(0.9, 2.4, 7);
      const leafMat = new THREE.MeshStandardMaterial({ color: PALETTE.pine, flatShading: true });

      const count = 140;
      const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
      const leafMesh = new THREE.InstancedMesh(leafGeo, leafMat, count);
      const dummy = new THREE.Object3D();

      let placed = 0;
      let attempts = 0;
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

    /* ---------------------------------------------------------
       FALLING SNOW (outdoor particles)
    --------------------------------------------------------- */
    function buildSnow() {
      const count = 900;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 120;
        positions[i * 3 + 1] = Math.random() * 50;
        positions[i * 3 + 2] = 70 - Math.random() * 160;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.85 });
      const points = new THREE.Points(geo, mat);
      scene.add(points);
      return points;
    }
    const snowParticles = buildSnow();

    /* ---------------------------------------------------------
       CAVE ARCH + TUNNEL
    --------------------------------------------------------- */
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
      const tunnelCurve = new THREE.CatmullRomCurve3(controlPoints.slice(4), false, 'catmullrom', 0.4);
      const geo = new THREE.TubeGeometry(tunnelCurve, 80, 7.5, 10, false);
      const mat = new THREE.MeshStandardMaterial({
        color: PALETTE.indigo, side: THREE.BackSide, flatShading: true, roughness: 1,
      });
      const tunnel = new THREE.Mesh(geo, mat);
      scene.add(tunnel);
    }
    buildTunnel();

    /* crystal clusters inside / at the mouth of the cave */
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
        const p = curve.getPointAt(Math.min(spot.t, 0.999));
        const tangent = curve.getTangentAt(Math.min(spot.t, 0.999)).normalize();
        const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
        const base = p.clone().addScaledVector(side, spot.side * 4.2);

        const clusterGroup = new THREE.Group();
        const shardCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < shardCount; i++) {
          const h = 1.4 + Math.random() * 2.4;
          const geo = new THREE.ConeGeometry(0.35 + Math.random() * 0.25, h, 5);
          const mat = new THREE.MeshStandardMaterial({
            color: spot.color, emissive: spot.color, emissiveIntensity: 0.9,
            flatShading: true, roughness: 0.3,
          });
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

    /* ---------------------------------------------------------
       CAVE PAINTINGS — friendly prehistoric-style rock art
       drawn on canvases and mapped onto the tunnel walls
    --------------------------------------------------------- */
    function roughLine(ctx, x1, y1, x2, y2) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 8;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 8;
      ctx.quadraticCurveTo(midX, midY, x2, y2);
      ctx.stroke();
    }

    function drawAnimal(ctx, cx, cy, scale, flip, color) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(flip ? -scale : scale, scale);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-40, 0);
      ctx.quadraticCurveTo(-10, -30, 30, -18);
      ctx.quadraticCurveTo(45, -14, 50, -4);
      ctx.stroke();
      roughLine(ctx, -30, 0, -34, 22);
      roughLine(ctx, -15, -2, -18, 24);
      roughLine(ctx, 15, -10, 12, 20);
      roughLine(ctx, 35, -8, 38, 20);
      ctx.beginPath();
      ctx.moveTo(50, -4);
      ctx.quadraticCurveTo(60, -14, 58, -24);
      ctx.stroke();
      roughLine(ctx, 58, -24, 66, -34);
      roughLine(ctx, 58, -24, 50, -36);
      roughLine(ctx, -40, 0, -52, -8);
      ctx.restore();
    }

    function drawHandStencil(ctx, cx, cy, scale, color) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 10, 14, 20, 0, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI / 2 + (i - 2) * 0.28;
        const fx = Math.cos(ang) * 26;
        const fy = Math.sin(ang) * 26 - 6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 12, Math.sin(ang) * 12 - 6);
        ctx.lineTo(fx, fy);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawHunter(ctx, cx, cy, scale, color) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      roughLine(ctx, 0, 10, -8, 34);
      roughLine(ctx, 0, 10, 8, 32);
      roughLine(ctx, 0, 10, 0, -14);
      roughLine(ctx, 0, -8, -16, 2);
      roughLine(ctx, 0, -8, 18, -14);
      ctx.beginPath();
      ctx.arc(0, -20, 6, 0, Math.PI * 2);
      ctx.stroke();
      roughLine(ctx, 18, -14, 40, -30);
      ctx.restore();
    }

    function drawCoupleFigures(ctx, cx, cy, scale, color) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';

      // left figure — curly hair, slightly shorter
      roughLine(ctx, -18, 14, -26, 40);
      roughLine(ctx, -18, 14, -10, 38);
      roughLine(ctx, -18, 14, -18, -12);
      roughLine(ctx, -18, -10, -6, -2);
      ctx.beginPath();
      ctx.arc(-18, -22, 7, 0, Math.PI * 2);
      ctx.stroke();
      // curly-hair scribble
      for (let i = 0; i < 6; i++) {
        const ang = Math.random() * Math.PI * 2;
        const rr = 6 + Math.random() * 4;
        ctx.beginPath();
        ctx.arc(-18 + Math.cos(ang) * 4, -26 + Math.sin(ang) * 4, rr * 0.4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // right figure — taller, arm around the other
      roughLine(ctx, 12, 12, 4, 40);
      roughLine(ctx, 12, 12, 20, 38);
      roughLine(ctx, 12, 12, 12, -16);
      roughLine(ctx, 12, -10, -6, -2);
      ctx.beginPath();
      ctx.arc(12, -26, 7, 0, Math.PI * 2);
      ctx.stroke();

      // joined hands / closeness mark
      roughLine(ctx, -6, -2, -6, 2);

      ctx.restore();
    }

    function drawSunMoonRelic(ctx, cx, cy, scale, color, colorAlt) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.lineCap = 'round';

      // sun — concentric rings + long rays
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(-30, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-30, 0, 9, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const inner = 17;
        const outer = i % 2 === 0 ? 34 : 26;
        roughLine(
          ctx,
          -30 + Math.cos(ang) * inner, Math.sin(ang) * inner,
          -30 + Math.cos(ang) * outer, Math.sin(ang) * outer
        );
      }
      // small dots ringing the sun, like weathered pigment dabs
      ctx.fillStyle = color;
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 + 0.2;
        const dx = -30 + Math.cos(ang) * 22;
        const dy = Math.sin(ang) * 22;
        ctx.beginPath();
        ctx.arc(dx, dy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // moon — crescent carved from two overlapping arcs
      ctx.strokeStyle = colorAlt;
      ctx.lineWidth = 2.6;
      ctx.save();
      ctx.beginPath();
      ctx.arc(32, 0, 17, Math.PI * 0.35, Math.PI * 1.65);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(40, 0, 15, Math.PI * 0.55, Math.PI * 1.45);
      ctx.stroke();
      ctx.restore();
      // dots trailing from the moon, like a night sky
      for (let i = 0; i < 6; i++) {
        const dx = 55 + Math.random() * 22;
        const dy = -22 + Math.random() * 44;
        ctx.beginPath();
        ctx.arc(dx, dy, 1.2 + Math.random(), 0, Math.PI * 2);
        ctx.fillStyle = colorAlt;
        ctx.fill();
      }

      // a joining arc beneath, linking sun and moon as one old sky-sign
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-30, 40);
      ctx.quadraticCurveTo(0, 56, 32, 40);
      ctx.stroke();

      ctx.restore();
    }

    function drawSun(ctx, cx, cy, r, color) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        roughLine(ctx, cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, cx + Math.cos(ang) * (r + 10), cy + Math.sin(ang) * (r + 10));
      }
      ctx.restore();
    }

    function makeCavePaintingTexture(variant) {
      const w = 512, h = 320;
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      const ochre = '#b0602c';
      const rust = '#8a3f22';

      if (variant === 0) {
        drawAnimal(ctx, w * 0.28, h * 0.55, 1.5, false, ochre);
        drawAnimal(ctx, w * 0.62, h * 0.6, 1.1, true, ochre);
        drawHandStencil(ctx, w * 0.85, h * 0.3, 1.3, rust);
        drawSun(ctx, w * 0.1, h * 0.2, 18, rust);
      } else if (variant === 1) {
        drawHunter(ctx, w * 0.25, h * 0.55, 1.6, ochre);
        drawHunter(ctx, w * 0.4, h * 0.5, 1.4, ochre);
        drawAnimal(ctx, w * 0.7, h * 0.55, 1.6, true, ochre);
        drawHandStencil(ctx, w * 0.15, h * 0.75, 1.1, rust);
      } else if (variant === 2) {
        drawHandStencil(ctx, w * 0.2, h * 0.4, 1.4, rust);
        drawHandStencil(ctx, w * 0.35, h * 0.55, 1.2, rust);
        drawHandStencil(ctx, w * 0.55, h * 0.35, 1.5, rust);
        drawSun(ctx, w * 0.8, h * 0.5, 22, rust);
        drawAnimal(ctx, w * 0.75, h * 0.7, 1, false, ochre);
      } else if (variant === 4) {
        drawCoupleFigures(ctx, w * 0.5, h * 0.62, 2.6, ochre);
        drawSun(ctx, w * 0.18, h * 0.22, 20, rust);
        drawSun(ctx, w * 0.82, h * 0.22, 14, rust);
      } else if (variant === 5) {
        drawSunMoonRelic(ctx, w * 0.5, h * 0.5, 2.4, '#8a3f22', '#c98b5c');
      } else {
        drawAnimal(ctx, w * 0.3, h * 0.5, 1.8, false, ochre);
        drawHunter(ctx, w * 0.62, h * 0.6, 1.5, ochre);
        drawSun(ctx, w * 0.85, h * 0.25, 16, rust);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }

    function buildCavePaintings() {
      const spots = [
        { t: CAVE_ENTER_T + 0.05, side: 1, variant: 0 },
        { t: CAVE_ENTER_T + 0.08, side: -1, variant: 1 },
        { t: 0.7, side: 1, variant: 2 },
        { t: 0.72, side: -1, variant: 3 },
        { t: 0.82, side: 1, variant: 1 },
        { t: 0.85, side: -1, variant: 0 },
        { t: 0.93, side: 1, variant: 2 },
      ];
      spots.forEach((spot) => {
        const tt = Math.min(spot.t, 0.995);
        const p = curve.getPointAt(tt);
        const tangent = curve.getTangentAt(tt).normalize();
        const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
        const wallPos = p.clone().addScaledVector(side, spot.side * 7.1);
        wallPos.y += 1.5 + Math.random() * 1.5;

        const tex = makeCavePaintingTexture(spot.variant);
        const mat = new THREE.MeshStandardMaterial({
          map: tex, transparent: true, alphaTest: 0.05,
          roughness: 1, side: THREE.DoubleSide, color: 0xffffff,
        });
        const geo = new THREE.PlaneGeometry(6.5, 4);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(wallPos);
        mesh.lookAt(p.x, wallPos.y, p.z);
        mesh.rotateY(Math.PI);
        scene.add(mesh);
      });

      // the heart of the cave — a larger painting on the end wall,
      // facing the traveler as they arrive at the deepest point
      const heartT = 0.97;
      const hp = curve.getPointAt(heartT);
      const hTangent = curve.getTangentAt(heartT).normalize();
      const heartTex = makeCavePaintingTexture(4);
      const heartMat = new THREE.MeshStandardMaterial({
        map: heartTex, transparent: true, alphaTest: 0.05,
        roughness: 1, side: THREE.DoubleSide, color: 0xffffff,
      });
      const heartGeo = new THREE.PlaneGeometry(9, 5.6);
      const heartMesh = new THREE.Mesh(heartGeo, heartMat);
      const heartPos = hp.clone().addScaledVector(hTangent, 3);
      heartPos.y += 2.2;
      heartMesh.position.copy(heartPos);
      heartMesh.lookAt(hp.x + hTangent.x * 10, heartPos.y, hp.z + hTangent.z * 10);
      scene.add(heartMesh);

      addCaveLight(hp.clone().setY(2), 0xffb066, 1.6, 16);

      // an old, striking sun-and-moon relic carving at the very back of the cave —
      // the last thing the traveler sees as they arrive
      const relicT = 0.99;
      const rp = curve.getPointAt(relicT);
      const rTangent = curve.getTangentAt(relicT).normalize();
      const relicTex = makeCavePaintingTexture(5);
      const relicMat = new THREE.MeshStandardMaterial({
        map: relicTex, transparent: true, alphaTest: 0.05,
        roughness: 0.9, side: THREE.DoubleSide, color: 0xffffff,
        emissive: 0xb04f2c, emissiveMap: relicTex, emissiveIntensity: 0.35,
      });
      const relicGeo = new THREE.PlaneGeometry(10, 6.2);
      const relicMesh = new THREE.Mesh(relicGeo, relicMat);
      const relicPos = rp.clone().addScaledVector(rTangent, 4);
      relicPos.y += 2.4;
      relicMesh.position.copy(relicPos);
      relicMesh.lookAt(rp.x + rTangent.x * 10, relicPos.y, rp.z + rTangent.z * 10);
      scene.add(relicMesh);

      addCaveLight(rp.clone().setY(2.4), 0xd8b98a, 2.2, 20);
      const relicGlow = addGlowSprite(relicPos.clone(), glowTexPurple, 12, 0);
      glowSprites.push({ sprite: relicGlow, worldPos: relicPos.clone(), maxOpacity: 0.6 });
    }
    buildCavePaintings();

    /* ---------------------------------------------------------
       CHARACTER (simple stylized low-poly traveler)
    --------------------------------------------------------- */
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

    /* ---------------------------------------------------------
       SCROLL -> PROGRESS
    --------------------------------------------------------- */
    let progressRaw = 0;
    let progress = 0;

    function updateScrollProgress() {
      const maxScroll = scrollSpace.offsetHeight - window.innerHeight;
      const y = window.scrollY;
      progressRaw = maxScroll > 0 ? Math.min(Math.max(y / maxScroll, 0), 1) : 0;
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    /* ---------------------------------------------------------
       ANIMATION LOOP
    --------------------------------------------------------- */
    const clock = new THREE.Clock();
    const tmpUp = new THREE.Vector3(0, 1, 0);
    const camTargetPos = new THREE.Vector3();
    const camLookAt = new THREE.Vector3();

    function lerp(a, b, t) { return a + (b - a) * t; }

    const skyColorA = new THREE.Color(PALETTE.skyTop);
    const skyColorB = new THREE.Color(PALETTE.caveDeep);
    const fogColorTmp = new THREE.Color();

    let animationId;
    function animate() {
      animationId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      progress += (progressRaw - progress) * 0.07;
      const t = Math.min(Math.max(progress, 0.0001), 0.999);

      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      character.position.set(p.x, p.y + 0, p.z);
      const lookTarget = p.clone().add(tangent);
      character.lookAt(lookTarget.x, character.position.y, lookTarget.z);
      const bob = Math.abs(Math.sin(elapsed * 6)) * 0.08 * Math.min(progressRaw > 0 ? 1 : 0, 1);
      character.position.y = p.y + bob;

      const side = new THREE.Vector3().crossVectors(tangent, tmpUp).normalize();
      const followBack = 7.5;
      const followHeight = 3.2;
      camTargetPos.set(
        p.x - tangent.x * followBack + side.x * 0.6,
        p.y + followHeight,
        p.z - tangent.z * followBack
      );
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

      if (progressBar) progressBar.style.height = (t * 100).toFixed(1) + '%';

      renderer.render(scene, camera);
    }
    animate();

    /* ---------------------------------------------------------
       CLEANUP
    --------------------------------------------------------- */
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', updateScrollProgress);
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
      if (stage.contains(renderer.domElement)) {
        stage.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ margin: 0, padding: 0, background: '#0a0812' }}>
      <style>{`
        #cave-journey-root { position: relative; }
        #cave-stage { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; }
        #cave-stage canvas { display: block; }
        #cave-progress-wrap {
          position: fixed; right: 26px; top: 50%; transform: translateY(-50%);
          width: 3px; height: 38vh; background: rgba(255,255,255,0.15);
          border-radius: 3px; z-index: 10; pointer-events: none;
        }
        #cave-progress-bar {
          position: absolute; bottom: 0; left: 0; width: 100%;
          background: linear-gradient(180deg, #cfe0ee, #b04f2c);
          border-radius: 3px; height: 0%;
        }
        #cave-scroll-space { height: 600vh; width: 100%; position: relative; }
      `}</style>
      <div id="cave-journey-root">
        <div id="cave-stage" ref={stageRef} />
        <div id="cave-progress-wrap">
          <div id="cave-progress-bar" ref={progressBarRef} />
        </div>
        <div id="cave-scroll-space" ref={scrollSpaceRef} />
      </div>
    </div>
  );
}
