import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* ===========================================================
   MUSEUM JOURNEY
   -----------------------------------------------------------
   Drop this file into your React + Three.js project.
   It needs an `artworks` folder sitting NEXT TO this file
   (same directory), containing:
       heart-of-the-andes.jpg
       the-two-fridas.jpg
       green-wheat-fields.jpg
       the-hay-wain.jpg
   (these were prepared and delivered together with this file)

   Everything else — geometry, lighting, music — is generated
   in code, so once the images are in place this component
   works with zero extra setup. Just import and render it,
   e.g. in App.jsx:

       import MuseumJourney from './MuseumJourney';
       <Route path="/museum" element={<MuseumJourney />} />
=========================================================== */

import artHeartOfTheAndes from './artworks/heart-of-the-andes.jpg';
import artTwoFridas from './artworks/the-two-fridas.jpg';
import artGreenWheatFields from './artworks/green-wheat-fields.jpg';
import artHayWain from './artworks/the-hay-wain.jpg';

const PALETTE = {
  wallCream: 0xece2cd,
  wallCreamDark: 0xdccdaa,
  wainscot: 0x5a3a26,
  floorLight: 0xcbb488,
  floorDark: 0x6f4f31,
  carpet: 0x6e1f24,
  carpetTrim: 0xcaa04a,
  gold: 0xd4af6a,
  goldBright: 0xf1d78c,
  columnStone: 0xe9e1cf,
  ceiling: 0xf3ead6,
  skyWarm: 0xe9d8ad,
  fogWarm: 0xe4d3ac,
};

const ARTWORKS = [
  { tex: artHeartOfTheAndes, title: 'Heart of the Andes', artist: 'Frederic Edwin Church', year: '1859', ratio: 1098 / 1102 },
  { tex: artTwoFridas, title: 'The Two Fridas', artist: 'Frida Kahlo', year: '1939', ratio: 1400 / 770 },
  { tex: artGreenWheatFields, title: 'Green Wheat Fields, Auvers', artist: 'Vincent van Gogh', year: '1890', ratio: 1400 / 1098 },
  { tex: artHayWain, title: 'The Hay Wain', artist: 'John Constable', year: '1821', ratio: 800 / 551 },
];

export default function MuseumJourney() {
  const stageRef = useRef(null);
  const scrollSpaceRef = useRef(null);
  const progressBarRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const audioRef = useRef(null);

  /* ---------------------------------------------------------
     GENERATIVE AMBIENT MUSIC (soft piano + violin pad)
     Fully synthesized with Web Audio API — no external files.
  --------------------------------------------------------- */
  function startAmbientMusic() {
    if (audioRef.current) return audioRef.current;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2.5);

    // gentle feedback-delay "hall" reverb substitute
    const delay = ctx.createDelay(2.0);
    delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.34;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 1600;
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);

    const dry = ctx.createGain();
    dry.gain.value = 0.8;
    dry.connect(master);
    dry.connect(delay);

    let stopped = false;

    // ---- soft piano note ----
    function pianoNote(freq, time, dur, vol) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      const shimmer = ctx.createOscillator();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(freq * 2.005, time);
      const g = ctx.createGain();
      const gs = ctx.createGain();
      gs.gain.value = 0.12;
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 2600;
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(vol, time + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      osc.connect(filt);
      shimmer.connect(gs);
      gs.connect(filt);
      filt.connect(g);
      g.connect(dry);
      osc.start(time); osc.stop(time + dur + 0.05);
      shimmer.start(time); shimmer.stop(time + dur + 0.05);
    }

    // ---- soft violin-like swell (used for the melody line) ----
    function violinSwell(freq, time, dur, vol) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.value = freq;
      osc2.frequency.value = freq * 1.004;
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.value = 4.4;
      vibratoGain.gain.value = 2.2;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc1.frequency);
      vibratoGain.connect(osc2.frequency);

      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 1400;
      filt.Q.value = 0.6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(vol, time + dur * 0.4);
      g.gain.linearRampToValueAtTime(vol * 0.8, time + dur * 0.75);
      g.gain.linearRampToValueAtTime(0.0001, time + dur);

      osc1.connect(filt); osc2.connect(filt); filt.connect(g); g.connect(dry);
      osc1.start(time); osc2.start(time); vibrato.start(time);
      osc1.stop(time + dur + 0.1); osc2.stop(time + dur + 0.1); vibrato.stop(time + dur + 0.1);
    }

    // ---- long, soft sustained bass tone (sustain-pedal feel) ----
    function bassNote(freq, time, dur, vol) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(vol, time + 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      osc.connect(filt); filt.connect(g); g.connect(dry);
      osc.start(time); osc.stop(time + dur + 0.1);
    }

    /* ---------------------------------------------------------
       "Moonlight Sonata" (Beethoven, 1801 — public domain)
       1st-movement inspired arrangement: a continuous triplet
       arpeggio ostinato over a slow-moving bass, with the
       famous melodic line held softly on top.
       Frequencies are equal-tempered, A4 = 440Hz.
    --------------------------------------------------------- */
    const MOONLIGHT_MEASURES = [
      { bass: 69.30, arp: [207.65, 277.18, 329.63], melody: 415.30 },  // i   (C#m)
      { bass: 69.30, arp: [207.65, 277.18, 329.63], melody: 415.30 },  // i
      { bass: 92.50, arp: [185.00, 220.00, 277.18], melody: 369.99 },  // iv  (F#m)
      { bass: 103.83, arp: [207.65, 246.94, 311.13], melody: 369.99 }, // V7
      { bass: 69.30, arp: [207.65, 277.18, 329.63], melody: 415.30 },  // i
      { bass: 110.00, arp: [220.00, 277.18, 329.63], melody: 415.30 }, // VI  (A maj)
      { bass: 77.78, arp: [155.56, 185.00, 220.00], melody: 369.99 },  // ii° (D#dim)
      { bass: 103.83, arp: [207.65, 246.94, 311.13], melody: 329.63 }, // V7 -> resolves back to i
    ];
    const BEAT = 60 / 54;          // adagio sostenuto, ~54bpm
    const TRIPLET = BEAT / 3;
    let measureIdx = 0;
    let tripletIdx = 0;

    function scheduleLoop() {
      if (stopped) return;
      const now = ctx.currentTime;
      const measure = MOONLIGHT_MEASURES[measureIdx % MOONLIGHT_MEASURES.length];
      const arpNote = measure.arp[tripletIdx % measure.arp.length];
      pianoNote(arpNote, now + 0.01, TRIPLET * 1.35, 0.085);

      if (tripletIdx === 0) {
        bassNote(measure.bass, now + 0.01, BEAT * 4 * 0.95, 0.11);
        violinSwell(measure.melody, now + 0.05, BEAT * 4 * 1.05, 0.075);
      }

      tripletIdx++;
      if (tripletIdx >= 12) { tripletIdx = 0; measureIdx++; }
      audioRef.current.timeoutId = setTimeout(scheduleLoop, TRIPLET * 1000);
    }

    audioRef.current = { ctx, master, stop: () => { stopped = true; clearTimeout(audioRef.current.timeoutId); } };
    scheduleLoop();
    return audioRef.current;
  }

  function toggleMusic() {
    const a = audioRef.current;
    if (!a) return;
    if (musicOn) {
      a.master.gain.linearRampToValueAtTime(0.0001, a.ctx.currentTime + 0.8);
    } else {
      a.master.gain.linearRampToValueAtTime(0.55, a.ctx.currentTime + 0.8);
    }
    setMusicOn(!musicOn);
  }

  useEffect(() => {
    // Browsers block audio until a user gesture, so we start it
    // immediately, and also resume it silently on the very first
    // interaction, without showing any gate screen.
    const a = startAmbientMusic();
    const resume = () => {
      if (a.ctx.state === 'suspended') a.ctx.resume();
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
      window.removeEventListener('scroll', resume);
      window.removeEventListener('touchstart', resume);
    };
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
    window.addEventListener('scroll', resume);
    window.addEventListener('touchstart', resume);
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
      window.removeEventListener('scroll', resume);
      window.removeEventListener('touchstart', resume);
      if (audioRef.current) audioRef.current.stop();
    };
  }, []);

  /* ---------------------------------------------------------
     THREE.JS SCENE
  --------------------------------------------------------- */
  useEffect(() => {
    const stage = stageRef.current;
    const scrollSpace = scrollSpaceRef.current;
    const progressBar = progressBarRef.current;
    if (!stage || !scrollSpace) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PALETTE.fogWarm);
    scene.fog = new THREE.Fog(PALETTE.fogWarm, 18, 70);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 3.2, 24);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    /* ---------------- LIGHTS ---------------- */
    const hemi = new THREE.HemisphereLight(PALETTE.skyWarm, PALETTE.wainscot, 0.75);
    scene.add(hemi);
    const ambient = new THREE.AmbientLight(0xfff2d6, 0.45);
    scene.add(ambient);

    const spotLights = [];

    /* ---------------- GLOW / STAR SPRITE TEXTURES ---------------- */
    function makeGlowTexture(colorHex, hard) {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx2 = c.getContext('2d');
      const col = new THREE.Color(colorHex);
      const r = Math.floor(col.r * 255), g = Math.floor(col.g * 255), b = Math.floor(col.b * 255);
      const grad = ctx2.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
      grad.addColorStop(hard ? 0.15 : 0.35, `rgba(${r},${g},${b},0.65)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx2.fillStyle = grad;
      ctx2.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }
    const glowGold = makeGlowTexture(PALETTE.goldBright, false);
    const starTex = makeGlowTexture(0xfff6d8, true);

    function addGlowSprite(pos, tex, scale, opacity) {
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity });
      const spr = new THREE.Sprite(mat);
      spr.position.copy(pos);
      spr.scale.set(scale, scale, 1);
      scene.add(spr);
      return spr;
    }

    /* ---------------- PATH CURVE (gallery hall) ---------------- */
    const controlPoints = [
      new THREE.Vector3(0, 0, 26),
      new THREE.Vector3(0.5, 0, 12),
      new THREE.Vector3(-0.5, 0, -2),
      new THREE.Vector3(0.4, 0, -16),
      new THREE.Vector3(-0.3, 0, -30),
      new THREE.Vector3(0.3, 0, -44),
      new THREE.Vector3(0, 0, -58),
      new THREE.Vector3(0, 0, -74),
    ];
    const curve = new THREE.CatmullRomCurve3(controlPoints, false, 'catmullrom', 0.25);
    const HALL_WIDTH = 15;
    const HALL_HEIGHT = 8.4;
    const HALL_MIN_Z = -78;
    const HALL_MAX_Z = 30;
    const HALL_LEN = HALL_MAX_Z - HALL_MIN_Z;

    /* positions of every artwork along the hall — declared early so
       columns, medallions, etc. can all check against it and avoid
       overlapping a painting */
    const paintingSpots = [
      { z: 6, side: -1 },
      { z: -12, side: 1 },
      { z: -32, side: -1 },
      { z: -52, side: 1 },
    ];
    const PAINTING_CLEARANCE = 3.4; // min distance (in z) a column must keep from a painting's center
    const columnZPositions = []; // filled in by buildColumns(), read by buildMedallions()

    /* ---------------- FLOOR: checkerboard marble ---------------- */
    function makeMarbleCheckerTexture() {
      const size = 512;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx2 = c.getContext('2d');
      const tiles = 8;
      const tileSize = size / tiles;
      for (let y = 0; y < tiles; y++) {
        for (let x = 0; x < tiles; x++) {
          const light = (x + y) % 2 === 0;
          ctx2.fillStyle = light ? '#e9dcc0' : '#c9a86b';
          ctx2.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          ctx2.strokeStyle = 'rgba(120,95,55,0.25)';
          ctx2.lineWidth = 1;
          for (let i = 0; i < 4; i++) {
            ctx2.beginPath();
            ctx2.moveTo(x * tileSize + Math.random() * tileSize, y * tileSize);
            ctx2.lineTo(x * tileSize + Math.random() * tileSize, (y + 1) * tileSize);
            ctx2.globalAlpha = 0.15;
            ctx2.stroke();
          }
          ctx2.globalAlpha = 1;
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(HALL_WIDTH / 3, HALL_LEN / 3);
      return tex;
    }
    function buildFloor() {
      const geo = new THREE.PlaneGeometry(HALL_WIDTH, HALL_LEN);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({ map: makeMarbleCheckerTexture(), roughness: 0.35, metalness: 0.05 });
      const floor = new THREE.Mesh(geo, mat);
      floor.position.set(0, 0, (HALL_MAX_Z + HALL_MIN_Z) / 2);
      scene.add(floor);

      // red carpet runner with gold trim
      const carpetGeo = new THREE.PlaneGeometry(3.6, HALL_LEN);
      carpetGeo.rotateX(-Math.PI / 2);
      const carpetMat = new THREE.MeshStandardMaterial({ color: PALETTE.carpet, roughness: 0.9 });
      const carpet = new THREE.Mesh(carpetGeo, carpetMat);
      carpet.position.set(0, 0.02, (HALL_MAX_Z + HALL_MIN_Z) / 2);
      scene.add(carpet);
      [1, -1].forEach((side) => {
        const trimGeo = new THREE.PlaneGeometry(0.14, HALL_LEN);
        trimGeo.rotateX(-Math.PI / 2);
        const trimMat = new THREE.MeshStandardMaterial({ color: PALETTE.carpetTrim, roughness: 0.5, metalness: 0.3 });
        const trim = new THREE.Mesh(trimGeo, trimMat);
        trim.position.set(side * 1.87, 0.03, (HALL_MAX_Z + HALL_MIN_Z) / 2);
        scene.add(trim);
      });
    }
    buildFloor();

    /* ---------------- CEILING (coffered) ---------------- */
    function buildCeiling() {
      const geo = new THREE.PlaneGeometry(HALL_WIDTH, HALL_LEN);
      geo.rotateX(Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({ color: PALETTE.ceiling, roughness: 0.9 });
      const ceiling = new THREE.Mesh(geo, mat);
      ceiling.position.set(0, HALL_HEIGHT, (HALL_MAX_Z + HALL_MIN_Z) / 2);
      scene.add(ceiling);

      const beamMat = new THREE.MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.5, metalness: 0.4 });
      for (let z = HALL_MAX_Z; z > HALL_MIN_Z; z -= 6) {
        const beamGeo = new THREE.BoxGeometry(HALL_WIDTH - 0.4, 0.16, 0.28);
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(0, HALL_HEIGHT - 0.05, z);
        scene.add(beam);
      }
    }
    buildCeiling();

    /* ---------------- WALLS ---------------- */
    function buildWalls() {
      const wallMat = new THREE.MeshStandardMaterial({ color: PALETTE.wallCream, roughness: 0.85 });
      const wainscotMat = new THREE.MeshStandardMaterial({ color: PALETTE.wainscot, roughness: 0.7 });
      const trimMat = new THREE.MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.4, metalness: 0.5 });
      [1, -1].forEach((side) => {
        const wallGeo = new THREE.PlaneGeometry(HALL_LEN, HALL_HEIGHT);
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(side * (HALL_WIDTH / 2), HALL_HEIGHT / 2, (HALL_MAX_Z + HALL_MIN_Z) / 2);
        wall.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        scene.add(wall);

        const wainscotGeo = new THREE.BoxGeometry(0.15, 1.1, HALL_LEN);
        const wainscot = new THREE.Mesh(wainscotGeo, wainscotMat);
        wainscot.position.set(side * (HALL_WIDTH / 2 - 0.05), 0.55, (HALL_MAX_Z + HALL_MIN_Z) / 2);
        scene.add(wainscot);

        const trimGeo = new THREE.BoxGeometry(0.08, 0.08, HALL_LEN);
        const trim = new THREE.Mesh(trimGeo, trimMat);
        trim.position.set(side * (HALL_WIDTH / 2 - 0.05), 1.13, (HALL_MAX_Z + HALL_MIN_Z) / 2);
        scene.add(trim);
      });
    }
    buildWalls();

    /* ---------------- WALL DECOR: meander frieze + medallions ---------------- */
    function makeMeanderTexture() {
      const unit = 32;
      const repeats = 8;
      const w = unit * repeats, h = unit;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx2 = c.getContext('2d');
      ctx2.fillStyle = '#6e1f24';
      ctx2.fillRect(0, 0, w, h);
      ctx2.strokeStyle = '#d4af6a';
      ctx2.lineWidth = 4;
      ctx2.lineCap = 'square';
      for (let i = 0; i < repeats; i++) {
        const ox = i * unit;
        ctx2.beginPath();
        ctx2.moveTo(ox + 2, h - 4);
        ctx2.lineTo(ox + 2, 6);
        ctx2.lineTo(ox + unit * 0.62, 6);
        ctx2.lineTo(ox + unit * 0.62, h * 0.5);
        ctx2.lineTo(ox + unit * 0.3, h * 0.5);
        ctx2.lineTo(ox + unit * 0.3, h - 4);
        ctx2.lineTo(ox + unit - 2, h - 4);
        ctx2.lineTo(ox + unit - 2, h * 0.42);
        ctx2.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(HALL_LEN / (unit * repeats) * 6, 1);
      return tex;
    }
    function buildMeanderFrieze() {
      const tex = makeMeanderTexture();
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.15 });
      [1, -1].forEach((side) => {
        const geo = new THREE.PlaneGeometry(HALL_LEN, 0.42);
        const band = new THREE.Mesh(geo, mat);
        band.position.set(side * (HALL_WIDTH / 2 - 0.04), HALL_HEIGHT - 1.5, (HALL_MAX_Z + HALL_MIN_Z) / 2);
        band.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        scene.add(band);
      });
    }
    buildMeanderFrieze();

    function makeMedallionTexture(kind, seed) {
      const s = 320;
      const c = document.createElement('canvas');
      c.width = c.height = s;
      const ctx2 = c.getContext('2d');
      ctx2.clearRect(0, 0, s, s);
      const cx = s / 2, cy = s / 2;
      // a tiny deterministic-ish PRNG so each poster ages a little differently
      let rs = (seed || 1) * 9301 + 49297;
      const rnd = () => { rs = (rs * 9301 + 49297) % 233280; return rs / 233280; };

      // worn, faintly irregular paper disc instead of a perfect vector circle
      ctx2.save();
      ctx2.beginPath();
      const edgePts = 28;
      for (let i = 0; i <= edgePts; i++) {
        const a = (i / edgePts) * Math.PI * 2;
        const wobble = 1 + (rnd() - 0.5) * 0.035;
        const r = s * 0.47 * wobble;
        const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        if (i === 0) ctx2.moveTo(px, py); else ctx2.lineTo(px, py);
      }
      ctx2.closePath();
      ctx2.clip();
      const paperGrad = ctx2.createRadialGradient(cx, cy, s * 0.05, cx, cy, s * 0.5);
      const sepiaShift = 6 + rnd() * 10;
      paperGrad.addColorStop(0, `hsl(${34 + sepiaShift}, 34%, 21%)`);
      paperGrad.addColorStop(0.75, `hsl(${30 + sepiaShift}, 40%, 15%)`);
      paperGrad.addColorStop(1, `hsl(${26 + sepiaShift}, 44%, 10%)`);
      ctx2.fillStyle = paperGrad;
      ctx2.fillRect(0, 0, s, s);
      // faint aged-paper grain
      for (let i = 0; i < 140; i++) {
        const gx = rnd() * s, gy = rnd() * s;
        ctx2.globalAlpha = 0.03 + rnd() * 0.05;
        ctx2.fillStyle = rnd() > 0.5 ? '#000000' : '#f1d78c';
        ctx2.fillRect(gx, gy, 1.4, 1.4);
      }
      // a few soft foxing spots, like old museum plaques
      for (let i = 0; i < 5; i++) {
        const fx = cx + (rnd() - 0.5) * s * 0.75;
        const fy = cy + (rnd() - 0.5) * s * 0.75;
        const fr = 6 + rnd() * 14;
        const foxGrad = ctx2.createRadialGradient(fx, fy, 0, fx, fy, fr);
        foxGrad.addColorStop(0, 'rgba(60,38,14,0.22)');
        foxGrad.addColorStop(1, 'rgba(60,38,14,0)');
        ctx2.globalAlpha = 1;
        ctx2.fillStyle = foxGrad;
        ctx2.beginPath();
        ctx2.arc(fx, fy, fr, 0, Math.PI * 2);
        ctx2.fill();
      }
      ctx2.globalAlpha = 1;
      ctx2.restore();

      ctx2.lineWidth = 5 + rnd() * 2;
      ctx2.strokeStyle = '#d4af6a';
      ctx2.beginPath();
      ctx2.arc(cx, cy, s * 0.47, 0, Math.PI * 2);
      ctx2.stroke();
      ctx2.beginPath();
      ctx2.arc(cx, cy, s * 0.4, 0, Math.PI * 2);
      ctx2.lineWidth = 2;
      ctx2.strokeStyle = '#f1d78c';
      ctx2.stroke();

      ctx2.strokeStyle = '#d4af6a';
      ctx2.fillStyle = '#d4af6a';

      if (kind === 'wreath') {
        for (let side = -1; side <= 1; side += 2) {
          for (let i = 0; i < 7; i++) {
            const a = Math.PI * 0.5 + side * (0.25 + i * 0.32);
            const r = s * 0.3;
            const lx = cx + Math.cos(a) * r, ly = cy + Math.sin(a) * r;
            ctx2.save();
            ctx2.translate(lx, ly);
            ctx2.rotate(a + side * Math.PI * 0.5);
            ctx2.beginPath();
            ctx2.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
            ctx2.fill();
            ctx2.restore();
          }
        }
        ctx2.font = 'italic 40px Georgia, serif';
        ctx2.fillStyle = '#f1d78c';
        ctx2.textAlign = 'center';
        ctx2.textBaseline = 'middle';
        ctx2.fillText('MVSEVM', cx, cy);
      } else if (kind === 'urn') {
        ctx2.beginPath();
        ctx2.moveTo(cx - 26, cy + 70);
        ctx2.quadraticCurveTo(cx - 46, cy + 10, cx - 18, cy - 20);
        ctx2.lineTo(cx - 24, cy - 50);
        ctx2.quadraticCurveTo(cx, cy - 66, cx + 24, cy - 50);
        ctx2.lineTo(cx + 18, cy - 20);
        ctx2.quadraticCurveTo(cx + 46, cy + 10, cx + 26, cy + 70);
        ctx2.closePath();
        ctx2.fill();
        ctx2.beginPath();
        ctx2.moveTo(cx - 24, cy - 44); ctx2.quadraticCurveTo(cx - 44, cy - 30, cx - 26, cy - 4);
        ctx2.moveTo(cx + 24, cy - 44); ctx2.quadraticCurveTo(cx + 44, cy - 30, cx + 26, cy - 4);
        ctx2.lineWidth = 8;
        ctx2.stroke();
      } else if (kind === 'rosette') {
        // rosette / sunburst
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          ctx2.save();
          ctx2.translate(cx, cy);
          ctx2.rotate(a);
          ctx2.beginPath();
          ctx2.moveTo(0, -14);
          ctx2.quadraticCurveTo(10, -55, 0, -95);
          ctx2.quadraticCurveTo(-10, -55, 0, -14);
          ctx2.fill();
          ctx2.restore();
        }
        ctx2.beginPath();
        ctx2.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx2.fillStyle = '#3a2a17';
        ctx2.fill();
        ctx2.lineWidth = 3;
        ctx2.strokeStyle = '#f1d78c';
        ctx2.stroke();
      } else {
        // laurel branch framing a small star — a fourth, distinct motif
        for (let side = -1; side <= 1; side += 2) {
          ctx2.save();
          ctx2.translate(cx, cy);
          for (let i = 0; i < 6; i++) {
            const t2 = i / 5;
            const a = side * (Math.PI * 0.32 + t2 * Math.PI * 0.55);
            const r = 26 + t2 * 62;
            const lx = Math.cos(a - Math.PI / 2) * r;
            const ly = Math.sin(a - Math.PI / 2) * r;
            ctx2.save();
            ctx2.translate(lx, ly);
            ctx2.rotate(a + side * 0.5);
            ctx2.beginPath();
            ctx2.ellipse(0, 0, 13 - t2 * 4, 6 - t2 * 1.5, 0, 0, Math.PI * 2);
            ctx2.fill();
            ctx2.restore();
          }
          ctx2.restore();
        }
        ctx2.save();
        ctx2.translate(cx, cy - 6);
        ctx2.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
          const ar = 16;
          const px = Math.cos(a) * ar, py = Math.sin(a) * ar;
          if (i === 0) ctx2.moveTo(px, py); else ctx2.lineTo(px, py);
          const a2 = a + Math.PI / 5;
          ctx2.lineTo(Math.cos(a2) * ar * 0.42, Math.sin(a2) * ar * 0.42);
        }
        ctx2.closePath();
        ctx2.fillStyle = '#f1d78c';
        ctx2.fill();
        ctx2.restore();
      }
      return new THREE.CanvasTexture(c);
    }
    function pseudoRandom(seed) {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    }
    function buildMedallions() {
      const kinds = ['wreath', 'urn', 'rosette', 'laurel'];
      const colStep = 6; // a bit tighter than the columns so a few more posters dot the walls
      const colStart = HALL_MAX_Z - 4;
      const colEnd = HALL_MIN_Z + 2;
      let seed = 1;
      let lastKind = -1;
      for (let z = colStart; z > colEnd + colStep; z -= colStep) {
        [1, -1].forEach((side) => {
          const nearPainting = paintingSpots.some((sp) => sp.side === side && Math.abs(sp.z - z) < 4.4);
          const nearColumn = columnZPositions.some((cp) => cp.side === side && Math.abs(cp.z - z) < 1.3);
          if (nearPainting || nearColumn) return;
          seed++;
          // pick a motif that isn't the same as the last one, so neighbors don't repeat
          let kindIdx = Math.floor(pseudoRandom(seed) * kinds.length);
          if (kindIdx === lastKind) kindIdx = (kindIdx + 1) % kinds.length;
          lastKind = kindIdx;

          const tex = makeMedallionTexture(kinds[kindIdx], seed);
          const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
          // slight size variation and a small hand-hung tilt keep them from
          // reading as one stamped-out, machine-perfect pattern
          const scale = 0.78 + pseudoRandom(seed * 3.1) * 0.22;
          const geo = new THREE.CircleGeometry(scale, 32);
          const disc = new THREE.Mesh(geo, mat);
          const jitterZ = (pseudoRandom(seed * 5.7) - 0.5) * 1.6;
          const jitterY = (pseudoRandom(seed * 2.3) - 0.5) * 0.3;
          disc.position.set(side * (HALL_WIDTH / 2 - 0.03), 2.6 + jitterY, z + jitterZ);
          disc.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
          disc.rotation.z = (pseudoRandom(seed * 7.9) - 0.5) * 0.07;
          scene.add(disc);
        });
      }
    }

    /* ---------------- COLUMNS (Greek Doric order) ---------------- */
    function makeFluteTexture() {
      const flutes = 20;
      const fluteW = 16;
      const w = flutes * fluteW, h = 16;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx2 = c.getContext('2d');
      for (let i = 0; i < flutes; i++) {
        const ox = i * fluteW;
        const grad = ctx2.createLinearGradient(ox, 0, ox + fluteW, 0);
        grad.addColorStop(0, '#fdf8ea');
        grad.addColorStop(0.5, '#a89877');
        grad.addColorStop(1, '#fdf8ea');
        ctx2.fillStyle = grad;
        ctx2.fillRect(ox, 0, fluteW, h);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }
    function buildColumns() {
      const fluteTex = makeFluteTexture();
      const shaftMat = new THREE.MeshStandardMaterial({ map: fluteTex, color: PALETTE.columnStone, roughness: 0.65 });
      const goldMat = new THREE.MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.4, metalness: 0.5 });
      const stoneMat = new THREE.MeshStandardMaterial({ color: PALETTE.columnStone, roughness: 0.55 });
      const shaftHeight = HALL_HEIGHT - 1.75;
      for (let z = HALL_MAX_Z - 4; z > HALL_MIN_Z + 2; z -= 8) {
        [1, -1].forEach((side) => {
          // don't plant a column right in front of a painting on this wall
          const blocksPainting = paintingSpots.some(
            (sp) => sp.side === side && Math.abs(sp.z - z) < PAINTING_CLEARANCE
          );
          if (blocksPainting) return;
          columnZPositions.push({ z, side });

          const cx = side * (HALL_WIDTH / 2 - 0.6);
          const group = new THREE.Group();
          group.position.set(cx, 0, z);
          scene.add(group);

          // plinth + base drum (Attic base)
          const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.2, 1.05), stoneMat);
          plinth.position.y = 0.1;
          group.add(plinth);
          const baseTorus1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.52, 0.16, 20), stoneMat);
          baseTorus1.position.y = 0.28;
          group.add(baseTorus1);
          const baseTorus2 = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.5, 0.14, 20), stoneMat);
          baseTorus2.position.y = 0.42;
          group.add(baseTorus2);

          // fluted shaft, slight taper (entasis)
          const shaftGeo = new THREE.CylinderGeometry(0.4, 0.46, shaftHeight, 24, 1, false);
          const shaft = new THREE.Mesh(shaftGeo, shaftMat);
          shaft.position.y = 0.5 + shaftHeight / 2;
          group.add(shaft);
          const shaftTopY = 0.5 + shaftHeight;

          // Doric capital: necking, echinus, abacus
          const necking = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 20), stoneMat);
          necking.position.y = shaftTopY + 0.05;
          group.add(necking);
          const echinus = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.4, 0.3, 20), goldMat);
          echinus.position.y = shaftTopY + 0.25;
          group.add(echinus);
          const abacus = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.22, 1.15), goldMat);
          abacus.position.y = shaftTopY + 0.51;
          group.add(abacus);
        });
      }
    }
    buildColumns();

    /* ---------------- CHANDELIERS ---------------- */
    function buildChandeliers() {
      const ringMat = new THREE.MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.3, metalness: 0.7, emissive: 0x664a1a, emissiveIntensity: 0.3 });
      for (let z = HALL_MAX_Z - 10; z > HALL_MIN_Z + 4; z -= 14) {
        const group = new THREE.Group();
        const ringGeo = new THREE.TorusGeometry(0.9, 0.07, 8, 20);
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        const rodGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6);
        const rod = new THREE.Mesh(rodGeo, ringMat);
        rod.position.y = 0.5;
        group.add(rod);
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2;
          const bulb = addGlowSprite(new THREE.Vector3(Math.cos(ang) * 0.9, -0.05, Math.sin(ang) * 0.9), glowGold, 0.9, 0.9);
          group.add(bulb);
        }
        group.position.set(0, HALL_HEIGHT - 0.9, z);
        scene.add(group);
        const light = new THREE.PointLight(0xffdca3, 1.1, 14, 2);
        light.position.set(0, HALL_HEIGHT - 1.0, z);
        scene.add(light);
      }
    }
    buildChandeliers();

    /* ---------------- ENTRANCE ARCH & FINALE GLOW ---------------- */
    function buildEntrance() {
      const archMat = new THREE.MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.35, metalness: 0.5 });
      const archGeo = new THREE.TorusGeometry(4.6, 0.35, 10, 24, Math.PI);
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.set(0, 4.4, HALL_MAX_Z - 2);
      scene.add(arch);
    }
    buildEntrance();

    function buildFinaleWall() {
      const wallMat = new THREE.MeshStandardMaterial({ color: PALETTE.wallCreamDark, roughness: 0.8 });
      const wallGeo = new THREE.PlaneGeometry(HALL_WIDTH, HALL_HEIGHT);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, HALL_HEIGHT / 2, HALL_MIN_Z);
      scene.add(wall);
      const light = new THREE.PointLight(0xffe6b0, 1.4, 20, 2);
      light.position.set(0, 4, HALL_MIN_Z + 4);
      scene.add(light);
    }
    buildFinaleWall();

    /* ---------------- ORNATE FRAME BUILDER ---------------- */
    function buildFrame(width, height, borderColor) {
      const group = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: borderColor, roughness: 0.3, metalness: 0.55 });
      const t = 0.22;
      const pieces = [
        { w: width + t * 2, h: t, x: 0, y: height / 2 + t / 2 },
        { w: width + t * 2, h: t, x: 0, y: -height / 2 - t / 2 },
        { w: t, h: height + t * 2, x: width / 2 + t / 2, y: 0 },
        { w: t, h: height + t * 2, x: -width / 2 - t / 2, y: 0 },
      ];
      pieces.forEach((p) => {
        const geo = new THREE.BoxGeometry(p.w, p.h, 0.16);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(p.x, p.y, 0.02);
        group.add(mesh);
      });
      return group;
    }

    /* ---------------- LABEL PLAQUE TEXTURE ---------------- */
    function makePlaqueTexture(title, artist, year) {
      const w = 512, h = 160;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx2 = c.getContext('2d');
      ctx2.fillStyle = '#2c2115';
      ctx2.fillRect(0, 0, w, h);
      ctx2.strokeStyle = '#d4af6a';
      ctx2.lineWidth = 4;
      ctx2.strokeRect(6, 6, w - 12, h - 12);
      ctx2.fillStyle = '#f1d78c';
      ctx2.textAlign = 'center';
      ctx2.font = 'italic 34px Georgia, "Times New Roman", serif';
      ctx2.fillText(title, w / 2, 62);
      ctx2.font = '24px Georgia, "Times New Roman", serif';
      ctx2.fillStyle = '#e6d8b8';
      ctx2.fillText(`${artist}, ${year}`, w / 2, 104);
      const tex = new THREE.CanvasTexture(c);
      return tex;
    }

    /* ---------------- STAR SPARKLE CLUSTER PER PAINTING ---------------- */
    const starClusters = [];
    function buildStarCluster(centerPos, frameW, frameH) {
      const count = 60;
      const sprites = [];
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = (0.55 + Math.random() * 0.55) * Math.max(frameW, frameH) * 0.5;
        const localX = Math.cos(ang) * rad * (frameW / Math.max(frameW, frameH));
        const localY = Math.sin(ang) * rad * (frameH / Math.max(frameW, frameH));
        const mat = new THREE.SpriteMaterial({
          map: starTex, transparent: true, depthWrite: false,
          blending: THREE.AdditiveBlending, opacity: 0,
        });
        const spr = new THREE.Sprite(mat);
        const scale = 0.06 + Math.random() * 0.09;
        spr.scale.set(scale, scale, 1);
        spr.userData.localOffset = new THREE.Vector2(localX, localY);
        spr.userData.phase = Math.random() * Math.PI * 2;
        spr.userData.speed = 2.2 + Math.random() * 3.2;
        spr.userData.maxOpacity = 0.55 + Math.random() * 0.45;
        scene.add(spr);
        sprites.push(spr);
      }
      starClusters.push({ sprites, centerPos, normalRight: null, normalUp: new THREE.Vector3(0, 1, 0) });
      return sprites;
    }

    /* ---------------- BUILD PAINTINGS ALONG THE HALL ---------------- */
    const paintingWorldPositions = [];
    const loader = new THREE.TextureLoader();

    function placePainting(spotIdx) {
      const spot = paintingSpots[spotIdx];
      const art = ARTWORKS[spotIdx];
      const height = 4.4;
      const width = height * art.ratio;
      const x = spot.side * (HALL_WIDTH / 2 - 0.55);
      const y = 3.4;
      const z = spot.z;

      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.rotation.y = spot.side > 0 ? -Math.PI / 2 : Math.PI / 2;
      scene.add(group);

      // placeholder canvas plane while real texture streams in
      const placeholderMat = new THREE.MeshStandardMaterial({ color: 0xcabf9e, roughness: 0.9 });
      const planeGeo = new THREE.PlaneGeometry(width, height);
      const plane = new THREE.Mesh(planeGeo, placeholderMat);
      plane.position.z = 0.01;
      group.add(plane);

      loader.load(art.tex, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        plane.material.map = tex;
        plane.material.color.set(0xffffff);
        plane.material.needsUpdate = true;
      });

      const frame = buildFrame(width, height, PALETTE.gold);
      group.add(frame);

      // small accent spotlight raking down onto the painting
      const spot1 = new THREE.SpotLight(0xfff2d0, 1.4, 12, Math.PI / 6, 0.5, 1.2);
      spot1.position.set(x - spot.side * 1.4, HALL_HEIGHT - 0.6, z + 1.4);
      spot1.target.position.set(x, y, z);
      scene.add(spot1); scene.add(spot1.target);
      spotLights.push(spot1);

      // plaque
      const plaqueTex = makePlaqueTexture(art.title, art.artist, art.year);
      const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTex, transparent: true });
      const plaqueGeo = new THREE.PlaneGeometry(1.7, 0.53);
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      plaque.position.set(0, -height / 2 - 0.5, 0.03);
      group.add(plaque);

      // world position of the frame center, for proximity fade
      const worldPos = new THREE.Vector3(x, y, z);
      paintingWorldPositions.push(worldPos);

      buildStarCluster(worldPos, width, height);
      // orient star offsets along the wall's local right vector
      const right = new THREE.Vector3(Math.cos(group.rotation.y), 0, -Math.sin(group.rotation.y));
      starClusters[starClusters.length - 1].normalRight = right;
      starClusters[starClusters.length - 1].normalUp = new THREE.Vector3(0, 1, 0);
    }
    ARTWORKS.forEach((_, i) => placePainting(i));
    buildMedallions();

    /* ---------------- BENCH near midpoint (nice classical touch) ---------------- */
    function buildBench(z) {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x3b2a1c, roughness: 0.6 });
      const seatGeo = new THREE.BoxGeometry(2.4, 0.15, 0.6);
      const seat = new THREE.Mesh(seatGeo, woodMat);
      seat.position.set(0, 0.5, z);
      scene.add(seat);
      [1, -1].forEach((s) => {
        [1, -1].forEach((e) => {
          const legGeo = new THREE.BoxGeometry(0.1, 0.5, 0.1);
          const leg = new THREE.Mesh(legGeo, woodMat);
          leg.position.set(s * 1.05, 0.25, z + e * 0.22);
          scene.add(leg);
        });
      });
    }
    buildBench(-22);
    buildBench(-42);

    /* ---------------- SCROLL -> PROGRESS ---------------- */
    let progressRaw = 0;
    let progress = 0;
    let lastScrollTime = performance.now();
    function updateScrollProgress() {
      const maxScroll = scrollSpace.offsetHeight - window.innerHeight;
      const y = window.scrollY;
      progressRaw = maxScroll > 0 ? Math.min(Math.max(y / maxScroll, 0), 1) : 0;
      lastScrollTime = performance.now();
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    /* ---------------- MOUSE-DRAG LOOK (desktop) ---------------- */
    let dragYaw = 0, dragPitch = 0;
    let isDragging = false, lastPX = 0, lastPY = 0;
    function onPointerDown(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      isDragging = true; lastPX = e.clientX; lastPY = e.clientY;
    }
    function onPointerMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - lastPX;
      const dy = e.clientY - lastPY;
      lastPX = e.clientX; lastPY = e.clientY;
      dragYaw -= dx * 0.0032;
      dragPitch = THREE.MathUtils.clamp(dragPitch - dy * 0.0028, -0.9, 0.9);
      dragYaw = THREE.MathUtils.clamp(dragYaw, -2.1, 2.1);
    }
    function onPointerUp() { isDragging = false; }
    stage.style.cursor = 'grab';
    stage.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    /* ---------------- ANIMATION LOOP ---------------- */
    const clock = new THREE.Clock();
    const camLookAt = new THREE.Vector3();
    let animationId;
    let autoYaw = 0;

    function animate() {
      animationId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      progress += (progressRaw - progress) * 0.06;
      const t = Math.min(Math.max(progress, 0.0002), 0.9995);

      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const bob = Math.sin(elapsed * 1.6) * 0.05;
      const sway = Math.sin(elapsed * 0.9) * 0.06;

      camera.position.set(p.x + sway, p.y + 3.15 + bob, p.z);

      // find the nearest painting and how strongly it should pull our gaze
      const baseHeading = Math.atan2(tangent.x, tangent.z);
      let bestWeight = 0, bestRelYaw = 0;
      paintingWorldPositions.forEach((pos) => {
        const toPaint = new THREE.Vector3().subVectors(pos, camera.position);
        const dist = toPaint.length();
        // saturates to a full 1 once the visitor is reasonably close,
        // instead of only ever reaching a fraction of the way there
        const weight = THREE.MathUtils.clamp(1 - (dist - 2.2) / 5, 0, 1);
        if (weight > bestWeight) {
          const paintHeading = Math.atan2(toPaint.x, toPaint.z);
          let rel = paintHeading - baseHeading;
          while (rel > Math.PI) rel -= Math.PI * 2;
          while (rel < -Math.PI) rel += Math.PI * 2;
          bestWeight = weight;
          bestRelYaw = rel;
        }
      });

      // "settled" = how long it's been since the visitor last scrolled.
      // 0 while actively walking, ramps to 1 shortly after they stop.
      const stillnessMs = performance.now() - lastScrollTime;
      const settleFactor = THREE.MathUtils.clamp((stillnessMs - 120) / 260, 0, 1);

      // fully face the artwork once stopped in front of it; while still
      // walking, the target is straight ahead again, approached slowly
      const autoYawTarget =
      bestRelYaw *
    Math.pow(bestWeight, 1.7) *
    settleFactor;
      const yawEase =
      settleFactor > 0.5
      ? 0.22
      : 0.03;
      autoYaw += (autoYawTarget - autoYaw) * yawEase;

      const finalYaw = autoYaw + dragYaw;
      const cosY = Math.cos(finalYaw), sinY = Math.sin(finalYaw);
      const lookDir = new THREE.Vector3(
        tangent.x * cosY + tangent.z * sinY,
        0,
        -tangent.x * sinY + tangent.z * cosY
      );
      camLookAt.set(
        camera.position.x + lookDir.x * 8,
        camera.position.y + dragPitch * 6,
        camera.position.z + lookDir.z * 8
      );
      camera.lookAt(camLookAt);

      // painting proximity -> star sparkle + spotlight emphasis
      starClusters.forEach((cluster, idx) => {
        const d = cluster.centerPos.distanceTo(camera.position);
        const proximity = THREE.MathUtils.clamp(1 - (d - 3) / 11, 0, 1);
        const right = cluster.normalRight;
        cluster.sprites.forEach((spr) => {
          const twinkle = 0.5 + 0.5 * Math.sin(elapsed * spr.userData.speed + spr.userData.phase);
          spr.material.opacity = proximity * spr.userData.maxOpacity * twinkle;
          if (proximity > 0.01) {
            const off = spr.userData.localOffset;
            spr.position.set(
              cluster.centerPos.x + right.x * off.x,
              cluster.centerPos.y + off.y,
              cluster.centerPos.z + right.z * off.x
            );
          }
        });
        if (spotLights[idx]) {
          spotLights[idx].intensity = 1.0 + proximity * 1.0;
        }
      });

      if (progressBar) progressBar.style.height = (t * 100).toFixed(1) + '%';
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', updateScrollProgress);
      stage.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
        }
      });
      renderer.dispose();
      if (stage.contains(renderer.domElement)) stage.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ margin: 0, padding: 0, background: '#241a10' }}>
      <style>{`
        #museum-root { position: relative; font-family: Georgia, 'Times New Roman', serif; }
        #museum-stage { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; }
        #museum-stage canvas { display: block; }
        #museum-progress-wrap {
          position: fixed; right: 26px; top: 50%; transform: translateY(-50%);
          width: 3px; height: 38vh; background: rgba(255,255,255,0.18);
          border-radius: 3px; z-index: 10; pointer-events: none;
        }
        #museum-progress-bar {
          position: absolute; bottom: 0; left: 0; width: 100%;
          background: linear-gradient(180deg, #f1d78c, #6e1f24);
          border-radius: 3px; height: 0%;
        }
        #museum-scroll-space { height: 650vh; width: 100%; position: relative; }
        #museum-music-toggle {
          position: fixed; top: 24px; right: 24px; z-index: 15;
          background: rgba(36,26,16,0.55); color: #f1d78c; border: 1px solid rgba(212,175,106,0.6);
          border-radius: 20px; padding: 8px 16px; font-size: 0.8rem; letter-spacing: 0.05em;
          cursor: pointer; font-family: Georgia, serif; backdrop-filter: blur(4px);
        }
      `}</style>
      <div id="museum-root">
        <button id="museum-music-toggle" onClick={toggleMusic}>{musicOn ? '♪ موسیقی روشن' : '♪ موسیقی خاموش'}</button>
        <div id="museum-stage" ref={stageRef} />
        <div id="museum-progress-wrap"><div id="museum-progress-bar" ref={progressBarRef} /></div>
        <div id="museum-scroll-space" ref={scrollSpaceRef} />
      </div>
    </div>
  );
}
