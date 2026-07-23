import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/* ===========================================================
   CABIN JOURNEY
   -----------------------------------------------------------
   Drop this file into your React + Three.js project and import
   it like any other component:

       import CabinJourney from './CabinJourney';
       <Route path="/cabin" element={<CabinJourney />} />

   Everything you see — wood, fire, moonlight, the cat, the
   gramophone, even the 11 album covers — is generated in code
   with <canvas>, so there is ZERO image setup required.

   THE ONLY THING YOU NEED TO ADD: your 11 mp3 files.
   Put them in your `public` folder like this:

       public/
         music/
           track01.mp3   -> The Last Waltz — King Raam & Eendo
           track02.mp3   -> The Darkness — he and his friends
           track03.mp3   -> Élan — Nightwish
           track04.mp3   -> Dreaming of You — Cigarettes After Sex
           track05.mp3   -> Echoes — Warning
           track06.mp3   -> While We Sleep — Insomnium
           track07.mp3   -> Stars in the Rain — Aimer
           track08.mp3   -> La Cura — Franco Battiato
           track09.mp3   -> Bloom — The Paper Kites
           track10.mp3   -> Nandemonaiya — Radwimps
           track11.mp3   -> カタオモイ — Aimer

   (Using plain string paths instead of imports means the app
   will build and run fine even before you add the files — the
   player will just wait patiently for them.)

   OPTIONAL: REAL ALBUM COVERS
   -----------------------------------------------------------
   I can't embed the actual released cover art myself (it's
   copyrighted), so each track ships with a generated vintage
   "painting" cover instead. If you'd like the real artwork,
   just add your own image files to:

       public/covers/track01.jpg  ... track11.jpg

   (same numbering as the music files above). The player checks
   for a real cover first and only falls back to the generated
   painting if the file isn't there — so this is completely
   optional.

   HOW IT WORKS
   -----------------------------------------------------------
   Scroll down: you slowly step in from the cabin door toward
   the table where the gramophone sits. An owl hoots, a wolf
   howls far off in the trees, and the moon sits quietly in the
   window. A cat is asleep by the fire. When you get close
   enough to the gramophone a small "اینجا ضربه بزن" button
   fades in — tap it to open the record-sleeve playlist.
=========================================================== */

const PALETTE = {
  logDark: 0x4a3420,
  logMid: 0x6b4a2d,
  logLight: 0x8a6238,
  beam: 0x2e2011,
  ember: 0xff8c42,
  moonGlow: 0xd8e4ff,
  brass: 0xc0925a,
  brassBright: 0xf0c078,
  tableWood: 0x5c3d24,
  catFur: 0x362a20,
  catFurLight: 0x54402e,
  frameWood: 0x3a2818,
  curtain: 0x8a4a4a,
};

const TRACKS = [
  { id: 'track01', title: 'The Last Waltz', artist: 'King Raam & Eendo' },
  { id: 'track02', title: 'The Darkness', artist: 'he and his friends' },
  { id: 'track03', title: 'Élan', artist: 'Nightwish' },
  { id: 'track04', title: 'Dreaming of You', artist: 'Cigarettes After Sex' },
  { id: 'track05', title: 'Echoes', artist: 'Warning' },
  { id: 'track06', title: 'While We Sleep', artist: 'Insomnium' },
  { id: 'track07', title: 'Stars in the Rain', artist: 'Aimer' },
  { id: 'track08', title: 'La Cura', artist: 'Franco Battiato' },
  { id: 'track09', title: 'Bloom', artist: 'The Paper Kites' },
  { id: 'track10', title: 'Nandemonaiya', artist: 'Radwimps' },
  { id: 'track11', title: 'カタオモイ', artist: 'Aimer' },
];

// warm, cozy "I'm here with you" palettes — one per cover, painterly not literal
const COVER_PALETTES = [
  ['#1b2a4a', '#3a5a8c', '#f3e6c4'],
  ['#2a1830', '#6a2f55', '#f0c9d8'],
  ['#12241c', '#2d5a3f', '#e8e0b0'],
  ['#3a1414', '#8a3a2a', '#f2c98a'],
  ['#101820', '#2c4858', '#cfe8e0'],
  ['#241018', '#5a2438', '#e8b0a0'],
  ['#182018', '#3a4a2a', '#d8e0a8'],
  ['#0c1428', '#243a6a', '#a8c4e8'],
  ['#281c10', '#6a4a28', '#f0d8a0'],
  ['#1c1024', '#4a2a5a', '#d0a8e0'],
  ['#141414', '#3a3a3a', '#e8d8b8'],
];
const COVER_MOTIFS = ['moon', 'wolf', 'cabin', 'owl', 'tree', 'heart', 'lantern', 'river', 'campfire', 'stars', 'road'];
const EMBER_HEX = '#ff7a2e';

function seededRandom(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* generates one vintage-painting, heavy-metal-cover-esque album
   sleeve entirely from canvas — no external images needed */
function generateCoverDataURL(index) {
  const s = 320;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const rnd = seededRandom(index + 7);
  const [c1, c2, c3] = COVER_PALETTES[index % COVER_PALETTES.length];
  const motif = COVER_MOTIFS[index % COVER_MOTIFS.length];

  const sky = ctx.createLinearGradient(0, 0, 0, s);
  sky.addColorStop(0, c1);
  sky.addColorStop(1, c2);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, s, s);

  const gx = s * (0.35 + rnd() * 0.3), gy = s * (0.28 + rnd() * 0.12);
  const glow = ctx.createRadialGradient(gx, gy, 2, gx, gy, s * 0.22);
  glow.addColorStop(0, c3);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(gx, gy, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c3;
  ctx.beginPath();
  ctx.arc(gx, gy, s * 0.075, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.25 + rnd() * 0.55;
    ctx.fillStyle = c3;
    const r = rnd() * 1.4 + 0.3;
    ctx.beginPath();
    ctx.arc(rnd() * s, rnd() * s * 0.55, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (let layer = 0; layer < 3; layer++) {
    const baseY = s * (0.58 + layer * 0.13);
    ctx.fillStyle = layer === 2 ? '#0a0a0a' : `rgba(0,0,0,${0.35 + layer * 0.25})`;
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.lineTo(0, baseY);
    let x = 0;
    while (x < s) {
      const w = 14 + rnd() * 22;
      const h = 10 + rnd() * (26 - layer * 6);
      ctx.lineTo(x + w * 0.5, baseY - h);
      ctx.lineTo(x + w, baseY);
      x += w;
    }
    ctx.lineTo(s, s);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#080808';
  const fx = s * 0.5, fy = s * 0.86;
  ctx.save();
  ctx.translate(fx, fy);
  if (motif === 'cabin') {
    ctx.fillRect(-26, -22, 52, 26);
    ctx.beginPath(); ctx.moveTo(-32, -22); ctx.lineTo(0, -44); ctx.lineTo(32, -22); ctx.closePath(); ctx.fill();
  } else if (motif === 'tree') {
    ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(-22, -6); ctx.lineTo(22, -6); ctx.closePath(); ctx.fill();
    ctx.fillRect(-4, -6, 8, 14);
  } else if (motif === 'wolf' || motif === 'owl') {
    ctx.beginPath();
    ctx.ellipse(0, -8, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(motif === 'owl' ? 0 : 18, motif === 'owl' ? -22 : -14, motif === 'owl' ? 13 : 8, 0, Math.PI * 2);
    ctx.fill();
    if (motif === 'wolf') { ctx.beginPath(); ctx.moveTo(24, -14); ctx.lineTo(38, -10); ctx.lineTo(24, -4); ctx.fill(); }
  } else if (motif === 'heart') {
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(-26, -20, -26, -42, 0, -30);
    ctx.bezierCurveTo(26, -42, 26, -20, 0, 4);
    ctx.fill();
  } else if (motif === 'lantern') {
    ctx.fillRect(-10, -30, 20, 30);
    ctx.fillRect(-3, -40, 6, 10);
    ctx.fillStyle = c3;
    ctx.fillRect(-6, -22, 12, 14);
  } else if (motif === 'river') {
    ctx.fillStyle = c3;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(-60, -4, 120, 20);
    ctx.globalAlpha = 1;
  } else if (motif === 'campfire') {
    ctx.fillStyle = EMBER_HEX;
    ctx.beginPath();
    ctx.moveTo(0, -34); ctx.quadraticCurveTo(14, -14, 4, 2); ctx.quadraticCurveTo(-2, -10, -8, 0);
    ctx.quadraticCurveTo(-14, -20, 0, -34);
    ctx.fill();
  } else if (motif === 'road') {
    ctx.fillStyle = c3;
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(6, 6); ctx.lineTo(30, -40); ctx.lineTo(18, -40); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  for (let i = 0; i < 260; i++) {
    ctx.globalAlpha = 0.02 + rnd() * 0.05;
    ctx.fillStyle = rnd() > 0.5 ? '#000000' : c3;
    ctx.fillRect(rnd() * s, rnd() * s, 1.3, 1.3);
  }
  ctx.globalAlpha = 1;
  const vign = ctx.createRadialGradient(s / 2, s / 2, s * 0.3, s / 2, s / 2, s * 0.72);
  vign.addColorStop(0, 'rgba(0,0,0,0)');
  vign.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, s, s);

  ctx.strokeStyle = c3;
  ctx.lineWidth = 6;
  ctx.strokeRect(9, 9, s - 18, s - 18);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(18, 18, s - 36, s - 36);

  return c.toDataURL('image/png');
}

function makeCanvasTexture(draw, w, h, repeatX, repeatY) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  if (repeatX || repeatY) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX || 1, repeatY || 1);
  }
  return tex;
}

export default function CabinJourney() {
  const stageRef = useRef(null);
  const scrollSpaceRef = useRef(null);
  const progressBarRef = useRef(null);

  const [ambientOn, setAmbientOn] = useState(true);
  const [tapVisible, setTapVisible] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [covers] = useState(() => TRACKS.map((_, i) => generateCoverDataURL(i)));

  const ambientRef = useRef(null);
  const trackAudioRef = useRef({});
  const gramophoneDiscRef = useRef(null);
  const playingIdRef = useRef(null);

  /* ---------------------------------------------------------
     AMBIENT FOREST NIGHT AUDIO — wind bed + owl + wolf,
     fully synthesized with Web Audio API, no external files.
  --------------------------------------------------------- */
  function startAmbient() {
    if (ambientRef.current) return ambientRef.current;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);

    const delay = ctx.createDelay(3.0);
    delay.delayTime.value = 0.55;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.3;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 1400;
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);

    const dry = ctx.createGain();
    dry.gain.value = 0.9;
    dry.connect(master);
    dry.connect(delay);

    let stopped = false;
    let gustTimeout = null;
    let owlTimeout = null;
    let wolfTimeout = null;

    // ---- continuous wind bed (filtered noise, slow gusts) ----
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 380;
    windFilter.Q.value = 0.6;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;
    noise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(dry);
    noise.start();
    function gustLoop() {
      if (stopped) return;
      const g = 0.03 + Math.random() * 0.05;
      const t = ctx.currentTime;
      windGain.gain.linearRampToValueAtTime(g, t + 3 + Math.random() * 2);
      windFilter.frequency.linearRampToValueAtTime(280 + Math.random() * 260, t + 3);
      gustTimeout = setTimeout(gustLoop, 4000 + Math.random() * 3000);
    }
    gustLoop();

    // ---- owl hoot: two soft descending tones ----
    function playOwl() {
      const t = ctx.currentTime;
      [{ f: 620, d: 0.001 }, { f: 520, d: 0.42 }].forEach(({ f, d }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + d);
        osc.frequency.exponentialRampToValueAtTime(f * 0.82, t + d + 0.28);
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.value = 900;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t + d);
        g.gain.linearRampToValueAtTime(0.11, t + d + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.32);
        osc.connect(filt); filt.connect(g); g.connect(dry);
        osc.start(t + d); osc.stop(t + d + 0.4);
      });
    }
    function scheduleOwl() {
      if (stopped) return;
      owlTimeout = setTimeout(() => {
        playOwl();
        scheduleOwl();
      }, 13000 + Math.random() * 15000);
    }
    scheduleOwl();

    // ---- wolf howl: rising then slowly falling pitch, distant & filtered ----
    function playWolf() {
      const t = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      const start = 180, peak = 340, end = 240;
      osc1.frequency.setValueAtTime(start, t);
      osc1.frequency.linearRampToValueAtTime(peak, t + 0.9);
      osc1.frequency.exponentialRampToValueAtTime(end, t + 3.2);
      osc2.frequency.setValueAtTime(start * 2, t);
      osc2.frequency.linearRampToValueAtTime(peak * 2, t + 0.9);
      osc2.frequency.exponentialRampToValueAtTime(end * 2, t + 3.2);
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.value = 5.2;
      vibratoGain.gain.value = 5;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc1.frequency);
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 1100;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.09, t + 0.5);
      g.gain.linearRampToValueAtTime(0.07, t + 2.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
      osc1.connect(filt); osc2.connect(filt); filt.connect(g); g.connect(dry);
      osc1.start(t); osc2.start(t); vibrato.start(t);
      osc1.stop(t + 3.6); osc2.stop(t + 3.6); vibrato.stop(t + 3.6);
    }
    function scheduleWolf() {
      if (stopped) return;
      wolfTimeout = setTimeout(() => {
        playWolf();
        scheduleWolf();
      }, 22000 + Math.random() * 26000);
    }
    scheduleWolf();

    ambientRef.current = {
      ctx, master,
      stop: () => {
        stopped = true;
        clearTimeout(owlTimeout);
        clearTimeout(wolfTimeout);
        clearTimeout(gustTimeout);
      },
    };
    return ambientRef.current;
  }

  function toggleAmbient() {
    const a = ambientRef.current;
    if (!a) return;
    if (ambientOn) {
      a.master.gain.linearRampToValueAtTime(0.0001, a.ctx.currentTime + 0.8);
    } else {
      a.master.gain.linearRampToValueAtTime(playingIdRef.current ? 0.18 : 0.5, a.ctx.currentTime + 0.8);
    }
    setAmbientOn(!ambientOn);
  }

  function duckAmbient(down) {
    const a = ambientRef.current;
    if (!a || !ambientOn) return;
    a.master.gain.linearRampToValueAtTime(down ? 0.16 : 0.5, a.ctx.currentTime + 1.2);
  }

  useEffect(() => {
    const a = startAmbient();
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
      if (ambientRef.current) ambientRef.current.stop();
      Object.values(trackAudioRef.current).forEach((audio) => audio.pause());
    };
  }, []);

  /* ---------------------------------------------------------
     TRACK PLAYBACK
  --------------------------------------------------------- */
  function togglePlay(track) {
    let audio = trackAudioRef.current[track.id];
    if (!audio) {
      audio = new Audio(`${import.meta.env.BASE_URL}music/${track.id}.mp3`);
      audio.preload = 'none';
      audio.addEventListener('ended', () => {
        setPlayingId((cur) => (cur === track.id ? null : cur));
        playingIdRef.current = null;
        duckAmbient(false);
      });
      trackAudioRef.current[track.id] = audio;
    }

    if (playingIdRef.current === track.id) {
      audio.pause();
      setPlayingId(null);
      playingIdRef.current = null;
      duckAmbient(false);
      return;
    }

    Object.entries(trackAudioRef.current).forEach(([id, a]) => {
      if (id !== track.id) a.pause();
    });

    audio.play().catch(() => { /* file not added yet — fails silently */ });
    setPlayingId(track.id);
    playingIdRef.current = track.id;
    duckAmbient(true);
  }

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x140d08);

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    /* ---------------- ROOM DIMENSIONS ---------------- */
    const ROOM_W = 11;
    const ROOM_D = 13;
    const ROOM_H = 4.6;
    const ROOM_Z0 = 6;         // door / entrance edge (camera starts here)
    const ROOM_Z1 = ROOM_Z0 - ROOM_D;

    /* ---------------- LIGHTS ---------------- */
    const ambientLight = new THREE.AmbientLight(0xfff1de, 0.42);
    scene.add(ambientLight);
    const hemi = new THREE.HemisphereLight(0x8fa8d8, 0x3a2a18, 0.55);
    scene.add(hemi);

    const fireLight = new THREE.PointLight(PALETTE.ember, 3.6, 13, 2);
    fireLight.position.set(0, 1.1, ROOM_Z1 + 1.1);
    scene.add(fireLight);
    const fireFill = new THREE.PointLight(0xffb066, 1.1, 9, 2);
    fireFill.position.set(0, 1.8, ROOM_Z1 + 2.6);
    scene.add(fireFill);

    const moonLight = new THREE.DirectionalLight(PALETTE.moonGlow, 0.8);
    moonLight.position.set(-ROOM_W / 2 + 0.5, 3, ROOM_Z0 - ROOM_D * 0.35);
    scene.add(moonLight);

    const tableX = ROOM_W / 2 - 1.5;
    const tableZ = ROOM_Z1 + 5.3;

    const lanternLight = new THREE.PointLight(0xffc98a, 1.4, 7, 2);
    lanternLight.position.set(tableX, 2.2, tableZ);
    scene.add(lanternLight);

    /* ---------------- TEXTURES ---------------- */
    const floorTex = makeCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#5a3c22';
      ctx.fillRect(0, 0, w, h);
      const plankH = h / 7;
      for (let i = 0; i < 7; i++) {
        const shade = i % 2 === 0 ? '#6b4a2a' : '#5c3f22';
        ctx.fillStyle = shade;
        ctx.fillRect(0, i * plankH, w, plankH - 2);
        // soft varnish highlight along the plank
        const sheen = ctx.createLinearGradient(0, i * plankH, 0, i * plankH + plankH);
        sheen.addColorStop(0, 'rgba(255,220,170,0.10)');
        sheen.addColorStop(0.5, 'rgba(255,220,170,0)');
        sheen.addColorStop(1, 'rgba(0,0,0,0.12)');
        ctx.fillStyle = sheen;
        ctx.fillRect(0, i * plankH, w, plankH - 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, i * plankH, w, plankH - 2);
        for (let g = 0; g < 6; g++) {
          ctx.strokeStyle = `rgba(40,20,8,${0.06 + Math.random() * 0.08})`;
          ctx.beginPath();
          ctx.moveTo(0, i * plankH + Math.random() * plankH);
          ctx.bezierCurveTo(w * 0.3, i * plankH + Math.random() * plankH, w * 0.7, i * plankH + Math.random() * plankH, w, i * plankH + Math.random() * plankH);
          ctx.stroke();
        }
      }
    }, 256, 256, ROOM_W / 1.6, ROOM_D / 1.6);

    const wallTex = makeCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#5c4028';
      ctx.fillRect(0, 0, w, h);
      const logH = h / 8;
      for (let i = 0; i < 8; i++) {
        const y = i * logH;
        const grad = ctx.createLinearGradient(0, y, 0, y + logH);
        const base = i % 2 === 0 ? '#6e4c2c' : '#63432a';
        grad.addColorStop(0, '#3a2a18');
        grad.addColorStop(0.12, '#e0b988');
        grad.addColorStop(0.28, base);
        grad.addColorStop(0.85, base);
        grad.addColorStop(1, '#2e2013');
        ctx.fillStyle = grad;
        ctx.fillRect(0, y, w, logH - 3);
        for (let k = 0; k < 3; k++) {
          ctx.strokeStyle = `rgba(30,16,6,${0.08 + Math.random() * 0.1})`;
          ctx.beginPath();
          ctx.moveTo(0, y + logH * 0.5 + (Math.random() - 0.5) * logH * 0.5);
          ctx.lineTo(w, y + logH * 0.5 + (Math.random() - 0.5) * logH * 0.5);
          ctx.stroke();
        }
      }
    }, 256, 256, ROOM_D / 3, ROOM_H / 2);

    const stoneTex = makeCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#3a352c';
      ctx.fillRect(0, 0, w, h);
      const rows = 8, cols = 6;
      for (let r = 0; r < rows; r++) {
        const offset = r % 2 === 0 ? 0 : (w / cols) / 2;
        for (let cIdx = -1; cIdx < cols; cIdx++) {
          const x = cIdx * (w / cols) + offset + (Math.random() - 0.5) * 4;
          const y = r * (h / rows) + (Math.random() - 0.5) * 4;
          const sw = w / cols - 4, sh = h / rows - 4;
          const shade = 118 + Math.random() * 55;
          ctx.fillStyle = `rgb(${shade},${shade - 12},${shade - 24})`;
          ctx.fillRect(x, y, sw, sh);
        }
      }
    }, 256, 256, 1, 1);

    const rugTex = makeCanvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#a8563a';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#f0dcb0';
      for (let i = 1; i < 6; i++) {
        ctx.lineWidth = i % 2 === 0 ? 6 : 2;
        ctx.strokeRect(i * 10, i * 10, w - i * 20, h - i * 20);
      }
      // simple boho diamond motif in the center
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.strokeStyle = '#3a2418';
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const r = 20 + i * 16;
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = '#3a2013';
      ctx.lineWidth = 10;
      ctx.strokeRect(4, 4, w - 8, h - 8);
    }, 256, 256, 1, 1);

    /* ---------------- NIGHT SKY (window view) ---------------- */
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512; skyCanvas.height = 512;
    const skyCtx = skyCanvas.getContext('2d');
    (function drawSky() {
      const g = skyCtx.createLinearGradient(0, 0, 0, 512);
      g.addColorStop(0, '#060b18');
      g.addColorStop(1, '#1c2c46');
      skyCtx.fillStyle = g;
      skyCtx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 180; i++) {
        skyCtx.globalAlpha = 0.2 + Math.random() * 0.7;
        skyCtx.fillStyle = '#e8f0ff';
        const r = Math.random() * 1.3 + 0.2;
        skyCtx.beginPath();
        skyCtx.arc(Math.random() * 512, Math.random() * 400, r, 0, Math.PI * 2);
        skyCtx.fill();
      }
      skyCtx.globalAlpha = 1;
      const mx = 340, my = 150, mr = 62;
      const moonGlowGrad = skyCtx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 3);
      moonGlowGrad.addColorStop(0, 'rgba(224,232,255,0.35)');
      moonGlowGrad.addColorStop(1, 'rgba(224,232,255,0)');
      skyCtx.fillStyle = moonGlowGrad;
      skyCtx.fillRect(0, 0, 512, 512);
      skyCtx.fillStyle = '#eef2ff';
      skyCtx.beginPath();
      skyCtx.arc(mx, my, mr, 0, Math.PI * 2);
      skyCtx.fill();
      skyCtx.fillStyle = 'rgba(180,190,220,0.35)';
      for (let i = 0; i < 6; i++) {
        skyCtx.beginPath();
        skyCtx.arc(mx + (Math.random() - 0.5) * mr, my + (Math.random() - 0.5) * mr, mr * (0.08 + Math.random() * 0.1), 0, Math.PI * 2);
        skyCtx.fill();
      }
      skyCtx.fillStyle = '#050a10';
      let x = 0;
      while (x < 512) {
        const treeH = 60 + Math.random() * 90;
        skyCtx.beginPath();
        skyCtx.moveTo(x, 512);
        skyCtx.lineTo(x + 22, 512 - treeH);
        skyCtx.lineTo(x + 44, 512);
        skyCtx.closePath();
        skyCtx.fill();
        x += 26 + Math.random() * 20;
      }
    })();
    const skyTex = new THREE.CanvasTexture(skyCanvas);

    /* ---------------- FLOOR / WALLS / CEILING ---------------- */
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, (ROOM_Z0 + ROOM_Z1) / 2);
    scene.add(floor);

    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x2a1d10, roughness: 0.9 });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, ROOM_H, (ROOM_Z0 + ROOM_Z1) / 2);
    scene.add(ceiling);

    const beamMat = new THREE.MeshStandardMaterial({ color: PALETTE.beam, roughness: 0.85 });
    for (let z = ROOM_Z0 - 1; z > ROOM_Z1 + 1; z -= 2.4) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W - 0.3, 0.22, 0.32), beamMat);
      beam.position.set(0, ROOM_H - 0.1, z);
      scene.add(beam);
    }

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.75 });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_H), wallMat);
    backWall.position.set(0, ROOM_H / 2, ROOM_Z1);
    scene.add(backWall);
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D, ROOM_H), wallMat);
    leftWall.position.set(-ROOM_W / 2, ROOM_H / 2, (ROOM_Z0 + ROOM_Z1) / 2);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D, ROOM_H), wallMat);
    rightWall.position.set(ROOM_W / 2, ROOM_H / 2, (ROOM_Z0 + ROOM_Z1) / 2);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);
    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_H), wallMat);
    frontWall.position.set(0, ROOM_H / 2, ROOM_Z0);
    frontWall.rotation.y = Math.PI;
    scene.add(frontWall);

    /* ---------------- FIREPLACE ---------------- */
    function buildFireplace() {
      const group = new THREE.Group();
      const stoveX = 0.15, stoveZ = ROOM_Z1 + 1.5;
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.45, metalness: 0.55 });
      const ironMatFlat = new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.6, metalness: 0.4 });

      // stove body — squat black cylinder, classic wood-burner silhouette
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.62, 20), ironMat);
      body.position.set(stoveX, 0.55, stoveZ);
      group.add(body);
      const domeTop = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), ironMat);
      domeTop.position.set(stoveX, 0.86, stoveZ);
      group.add(domeTop);

      // small stubby legs
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 8), ironMatFlat);
        leg.position.set(stoveX + Math.cos(a) * 0.32, 0.15, stoveZ + Math.sin(a) * 0.32);
        group.add(leg);
      }

      // door with glowing glass window (the flame reads through this)
      const door = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.02, 20, 1, false, -0.5, 1.0), ironMatFlat);
      door.rotation.x = Math.PI / 2;
      door.position.set(stoveX, 0.55, stoveZ + 0.44);
      group.add(door);
      const doorRim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 20), new THREE.MeshStandardMaterial({ color: PALETTE.brass, roughness: 0.35, metalness: 0.7 }));
      doorRim.position.set(stoveX, 0.55, stoveZ + 0.45);
      group.add(doorRim);

      // stovepipe rising straight up through the ceiling
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, ROOM_H - 0.75, 16), ironMat);
      pipe.position.set(stoveX, 0.86 + (ROOM_H - 0.75) / 2, stoveZ);
      group.add(pipe);
      const pipeCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.1, 16), new THREE.MeshStandardMaterial({ color: PALETTE.brass, roughness: 0.4, metalness: 0.6 }));
      pipeCollar.position.set(stoveX, 1.0, stoveZ);
      group.add(pipeCollar);

      // firewood basket beside the stove
      const basketMat = new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 0.85 });
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.3, 12, 1, true), basketMat);
      basket.position.set(stoveX + 0.72, 0.16, stoveZ + 0.1);
      group.add(basket);
      const logMat = new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 1 });
      for (let i = 0; i < 5; i++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.28, 8), logMat);
        log.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        log.position.set(stoveX + 0.72 + (Math.random() - 0.5) * 0.14, 0.28 + i * 0.02, stoveZ + 0.1 + (Math.random() - 0.5) * 0.1);
        group.add(log);
      }

      // small wall shelf behind the stove with a couple of framed photos, cabin-mantel style
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.22), new THREE.MeshStandardMaterial({ color: PALETTE.beam, roughness: 0.7 }));
      shelf.position.set(-1.6, 1.15, ROOM_Z1 + 0.14);
      group.add(shelf);
      [0x2a1c10, 0x3a2818].forEach((c, i) => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.02), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }));
        frame.position.set(-1.9 + i * 0.32, 1.32, ROOM_Z1 + 0.16);
        frame.rotation.x = -0.15;
        group.add(frame);
      });

      // flame glow through the stove door
      const flameTex = makeCanvasTexture((ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h * 0.75, 4, w / 2, h * 0.75, h * 0.7);
        g.addColorStop(0, 'rgba(255,220,150,0.95)');
        g.addColorStop(0.4, 'rgba(255,130,40,0.8)');
        g.addColorStop(1, 'rgba(255,60,10,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }, 64, 64);
      const flameMat = new THREE.SpriteMaterial({ map: flameTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      const flame = new THREE.Sprite(flameMat);
      flame.position.set(stoveX, 0.5, stoveZ + 0.47);
      flame.scale.set(0.55, 0.55, 1);
      group.add(flame);

      scene.add(group);
      fireLight.position.set(stoveX, 0.75, stoveZ + 0.3);
      fireFill.position.set(stoveX, 1.6, stoveZ + 1.4);
      return { flame, light: fireLight, fill: fireFill };
    }
    const fireplace = buildFireplace();

    /* ---------------- RUG ---------------- */
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.2), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.01, ROOM_Z1 + 2.4);
    scene.add(rug);

    /* ---------------- SLEEPING CAT ---------------- */
    function buildCat() {
      const group = new THREE.Group();
      const furMat = new THREE.MeshStandardMaterial({ color: PALETTE.catFur, roughness: 0.85 });
      const furMatLight = new THREE.MeshStandardMaterial({ color: PALETTE.catFurLight, roughness: 0.85 });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), furMat);
      body.scale.set(1.5, 0.85, 1.05);
      body.position.set(0, 0.16, 0);
      group.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), furMat);
      head.position.set(0.32, 0.2, 0.02);
      group.add(head);
      [-1, 1].forEach((sx) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 8), furMat);
        ear.position.set(0.36, 0.32, sx * 0.06);
        ear.rotation.x = -0.3;
        group.add(ear);
      });
      const tail = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 20, Math.PI * 1.3), furMatLight);
      tail.position.set(-0.28, 0.18, 0);
      tail.rotation.set(Math.PI / 2, 0.4, 0);
      group.add(tail);
      group.position.set(0.75, 0, ROOM_Z1 + 2.35);
      group.rotation.y = -0.5;
      scene.add(group);
      return { group, body };
    }
    const cat = buildCat();

    /* ---------------- WINDOW ---------------- */
    function buildWindow() {
      const wx = -ROOM_W / 2 + 0.02;
      const wz = ROOM_Z0 - ROOM_D * 0.32;
      const wy = 2.15;
      const wWidth = 1.9, wHeight = 1.9;

      const sky = new THREE.Mesh(new THREE.PlaneGeometry(wWidth, wHeight), new THREE.MeshBasicMaterial({ map: skyTex }));
      sky.position.set(wx - 0.05, wy, wz);
      sky.rotation.y = Math.PI / 2;
      scene.add(sky);

      const frameMat = new THREE.MeshStandardMaterial({ color: PALETTE.frameWood, roughness: 0.7 });
      const frameGroup = new THREE.Group();
      [wHeight / 2, -wHeight / 2].forEach((yOff) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, wWidth + 0.22, 0.16), frameMat);
        bar.rotation.y = Math.PI / 2;
        bar.position.set(wx, wy + yOff, wz);
        frameGroup.add(bar);
      });
      [-wWidth / 2, wWidth / 2].forEach((xOff) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, wHeight + 0.22, 0.16), frameMat);
        bar.position.set(wx, wy, wz + xOff);
        frameGroup.add(bar);
      });
      // 6-pane grid mullions (2 columns x 3 rows), classic cabin-window look
      [-wWidth / 6, wWidth / 6].forEach((off) => {
        const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.05, wHeight, 0.09), frameMat);
        vBar.position.set(wx, wy, wz + off);
        frameGroup.add(vBar);
      });
      [-wHeight / 6, wHeight / 6].forEach((off) => {
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.05, wWidth, 0.09), frameMat);
        hBar.rotation.x = Math.PI / 2;
        hBar.position.set(wx, wy + off, wz);
        frameGroup.add(hBar);
      });
      scene.add(frameGroup);

      const curtainMat = new THREE.MeshStandardMaterial({ color: PALETTE.curtain, roughness: 0.9, side: THREE.DoubleSide });
      [-1, 1].forEach((side) => {
        const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.5, wHeight + 0.4), curtainMat);
        curtain.position.set(wx + 0.12, wy, wz + side * (wWidth / 2 + 0.32));
        curtain.rotation.y = Math.PI / 2;
        scene.add(curtain);
      });

      const beamTex = makeCanvasTexture((ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, 'rgba(210,225,255,0.28)');
        g.addColorStop(1, 'rgba(210,225,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }, 64, 8);
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.4), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      beam.position.set(wx + 2.1, 1.1, wz);
      beam.rotation.y = Math.PI / 2;
      beam.rotation.z = -0.15;
      scene.add(beam);

      const moteTex = makeCanvasTexture((ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, 'rgba(255,255,255,0.9)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }, 16, 16);
      const motes = [];
      for (let i = 0; i < 18; i++) {
        const mat = new THREE.SpriteMaterial({ map: moteTex, transparent: true, opacity: 0.25 + Math.random() * 0.35, depthWrite: false });
        const spr = new THREE.Sprite(mat);
        spr.scale.set(0.03, 0.03, 1);
        spr.position.set(wx + 0.5 + Math.random() * 3, 0.4 + Math.random() * 1.8, wz + (Math.random() - 0.5) * 2.6);
        spr.userData = { speed: 0.1 + Math.random() * 0.15, phase: Math.random() * 10 };
        scene.add(spr);
        motes.push(spr);
      }
      return { motes };
    }
    const windowScene = buildWindow();

    /* ---------------- GRAMOPHONE TABLE ---------------- */
    function buildTableAndGramophone() {
      const group = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: PALETTE.tableWood, roughness: 0.6 });

      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 24), woodMat);
      top.position.set(tableX, 0.78, tableZ);
      group.add(top);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.76, 8), woodMat);
        leg.position.set(tableX + Math.cos(a) * 0.42, 0.39, tableZ + Math.sin(a) * 0.42);
        group.add(leg);
      }

      const brassMat = new THREE.MeshStandardMaterial({ color: PALETTE.brass, roughness: 0.35, metalness: 0.75 });
      const brassBrightMat = new THREE.MeshStandardMaterial({ color: PALETTE.brassBright, roughness: 0.25, metalness: 0.8 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.36), new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 0.6 }));
      base.position.set(tableX - 0.05, 0.88, tableZ);
      group.add(base);

      const discGroup = new THREE.Group();
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.015, 32), new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.4 }));
      discGroup.position.set(tableX - 0.05, 0.955, tableZ);
      discGroup.add(disc);
      const label = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.017, 20), new THREE.MeshStandardMaterial({ color: 0x7a2626, roughness: 0.5 }));
      discGroup.add(label);
      group.add(discGroup);
      gramophoneDiscRef.current = discGroup;

      const hornPoints = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        hornPoints.push(new THREE.Vector2(0.03 + Math.pow(t, 1.6) * 0.32, t * 0.5));
      }
      const hornGeo = new THREE.LatheGeometry(hornPoints, 24);
      const horn = new THREE.Mesh(hornGeo, brassMat);
      horn.position.set(tableX - 0.05, 0.95, tableZ);
      horn.rotation.z = Math.PI * 0.62;
      horn.rotation.y = 0.3;
      group.add(horn);
      const hornRim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.015, 8, 24), brassBrightMat);
      hornRim.position.set(tableX - 0.05 + Math.sin(horn.rotation.z) * 0.42, 0.95 + Math.cos(horn.rotation.z) * 0.42, tableZ);
      hornRim.rotation.copy(horn.rotation);
      group.add(hornRim);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), brassMat);
      arm.position.set(tableX + 0.06, 1.0, tableZ + 0.05);
      arm.rotation.z = Math.PI / 2.4;
      group.add(arm);

      for (let i = 0; i < 3; i++) {
        const cover = new THREE.Mesh(
          new THREE.BoxGeometry(0.34, 0.34, 0.012),
          new THREE.MeshStandardMaterial({ color: [0x3a2a1a, 0x2a1830, 0x1a2438][i], roughness: 0.6 })
        );
        cover.position.set(tableX + 0.32 - i * 0.05, 0.17, tableZ + 0.5 - i * 0.06);
        cover.rotation.y = 0.3;
        cover.rotation.z = 1.35;
        group.add(cover);
      }

      const flatCover = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), new THREE.MeshStandardMaterial({ color: 0x8a6238, roughness: 0.7 }));
      flatCover.rotation.x = -Math.PI / 2;
      flatCover.position.set(tableX - 0.35, 0.815, tableZ - 0.15);
      group.add(flatCover);

      scene.add(group);
      return { position: new THREE.Vector3(tableX, 1, tableZ) };
    }
    const gramophone = buildTableAndGramophone();

    (function buildLantern() {
      const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x1a1006 }));
      hook.position.set(tableX, ROOM_H - 0.2, tableZ);
      scene.add(hook);
      const lanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 8), new THREE.MeshStandardMaterial({ color: PALETTE.brassBright, roughness: 0.3, metalness: 0.6, emissive: 0x553311, emissiveIntensity: 0.6 }));
      lanternBody.position.set(tableX, ROOM_H - 0.42, tableZ);
      scene.add(lanternBody);
    })();

    (function buildBench() {
      const woodMat = new THREE.MeshStandardMaterial({ color: PALETTE.tableWood, roughness: 0.7 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.4), woodMat);
      seat.position.set(-1.6, 0.42, ROOM_Z1 + 3.6);
      scene.add(seat);
      [[-0.48, -0.15], [0.48, -0.15], [-0.48, 0.15], [0.48, 0.15]].forEach(([dx, dz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.06), woodMat);
        leg.position.set(-1.6 + dx, 0.21, ROOM_Z1 + 3.6 + dz);
        scene.add(leg);
      });
      // folded knit blanket, draped over one end
      const blanketMat = new THREE.MeshStandardMaterial({ color: 0xa8593a, roughness: 0.95 });
      const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.36), blanketMat);
      blanket.position.set(-1.98, 0.51, ROOM_Z1 + 3.6);
      blanket.rotation.y = 0.12;
      scene.add(blanket);
      for (let i = 0; i < 4; i++) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.012, 0.37), new THREE.MeshStandardMaterial({ color: 0xe8d4a8, roughness: 0.9 }));
        stripe.position.set(-1.98, 0.475 + i * 0.021, ROOM_Z1 + 3.6);
        stripe.rotation.y = 0.12;
        scene.add(stripe);
      }
      // round cream pillow
      const pillow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshStandardMaterial({ color: 0xe8d8b0, roughness: 0.9 }));
      pillow.scale.set(1, 0.6, 1);
      pillow.position.set(-1.15, 0.5, ROOM_Z1 + 3.6);
      scene.add(pillow);

      // hanging cone-shade pendant lamp over the reading nook
      const cordMat = new THREE.MeshStandardMaterial({ color: 0x1a1006, roughness: 0.6 });
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.5, 6), cordMat);
      cord.position.set(-1.6, ROOM_H - 0.75, ROOM_Z1 + 3.6);
      scene.add(cord);
      const shadeMat = new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 0.6, side: THREE.DoubleSide, emissive: 0x3a2410, emissiveIntensity: 0.3 });
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.22, 16, 1, true), shadeMat);
      shade.position.set(-1.6, ROOM_H - 1.55, ROOM_Z1 + 3.6);
      scene.add(shade);
      const bulbGlow = new THREE.PointLight(0xffc98a, 1.1, 5, 2);
      bulbGlow.position.set(-1.6, ROOM_H - 1.65, ROOM_Z1 + 3.6);
      scene.add(bulbGlow);
    })();

    // potted plant beside the window — soft greenery, very Pinterest
    (function buildPlant() {
      const px = -ROOM_W / 2 + 0.7, pz = ROOM_Z0 - ROOM_D * 0.32 + 1.15;
      const potMat = new THREE.MeshStandardMaterial({ color: 0xb56a3a, roughness: 0.85 });
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.22, 12), potMat);
      pot.position.set(px, 0.11, pz);
      scene.add(pot);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x3d6b3a, roughness: 0.75 });
      const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x4f8248, roughness: 0.75 });
      for (let i = 0; i < 7; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.4 + Math.random() * 0.22, 6), i % 2 ? leafMat : leafMat2);
        const a = (i / 7) * Math.PI * 2;
        leaf.position.set(px + Math.cos(a) * 0.06, 0.4 + Math.random() * 0.08, pz + Math.sin(a) * 0.06);
        leaf.rotation.z = Math.cos(a) * 0.5;
        leaf.rotation.x = Math.sin(a) * 0.5 + Math.PI;
        scene.add(leaf);
      }
    })();

    // warm string / fairy lights strung along the beam nearest the gramophone table
    (function buildFairyLights() {
      const bulbGeo = new THREE.SphereGeometry(0.018, 8, 8);
      const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffdca0, emissive: 0xffb050, emissiveIntensity: 1.4, roughness: 0.4 });
      const count = 22;
      const z0 = ROOM_Z0 - 0.4, z1 = ROOM_Z1 + 1.2;
      for (let i = 0; i < count; i++) {
        const tt = i / (count - 1);
        const z = z0 + (z1 - z0) * tt;
        const sag = Math.sin(tt * Math.PI) * 0.22;
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(ROOM_W / 2 - 0.35, ROOM_H - 0.35 - sag, z);
        scene.add(bulb);
      }
    })();

    // leaning bookshelf, stuffed with colorful spines — the lived-in cabin touch
    (function buildBookshelf() {
      const shelfZ = ROOM_Z0 - 2.1;   // center position along the wall
      const shelfW = 0.9;              // length along the wall (Z)
      const shelfH = 1.5;              // height
      const shelfD = 0.28;             // how far it sticks out from the wall (X)
      const shelfInnerX = ROOM_W / 2 - shelfD / 2 - 0.02; // center of the shelf carcass

      const shelfMat = new THREE.MeshStandardMaterial({ color: PALETTE.beam, roughness: 0.75 });
      const sideGeo = new THREE.BoxGeometry(shelfD, shelfH, 0.04);
      [-shelfW / 2, shelfW / 2].forEach((sz) => {
        const side = new THREE.Mesh(sideGeo, shelfMat);
        side.position.set(shelfInnerX, shelfH / 2, shelfZ + sz);
        scene.add(side);
      });

      const shelfCount = 4;
      const bookColors = [0x7a2626, 0x3a5a3a, 0x2a3a6a, 0x8a6238, 0x5a2a4a, 0x6a4a1e, 0x264a4a];
      for (let s = 0; s <= shelfCount; s++) {
        const y = Math.min(s * (shelfH / shelfCount), shelfH - 0.02);
        const plank = new THREE.Mesh(new THREE.BoxGeometry(shelfD, 0.04, shelfW), shelfMat);
        plank.position.set(shelfInnerX, y, shelfZ);
        scene.add(plank);

        if (s < shelfCount) {
          let bz = -shelfW / 2 + 0.06;
          while (bz < shelfW / 2 - 0.06) {
            const bw = 0.03 + Math.random() * 0.035;
            const bh = shelfH / shelfCount - (0.08 + Math.random() * 0.1);
            const book = new THREE.Mesh(
              new THREE.BoxGeometry(shelfD * 0.82, bh, bw),
              new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)], roughness: 0.8 })
            );
            book.position.set(shelfInnerX, y + bh / 2 + 0.03, shelfZ - shelfW / 2 + bz + bw / 2);
            book.rotation.y = (Math.random() - 0.5) * 0.06;
            scene.add(book);
            bz += bw + 0.006;
          }
        }
      }
    })();

    /* ---------------- CAMERA PATH: door -> gramophone table ---------------- */
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, ROOM_Z0 - 0.5),
      new THREE.Vector3(0.4, 0, ROOM_Z0 - ROOM_D * 0.4),
      new THREE.Vector3(tableX - 0.9, 0, tableZ + 0.6),
      new THREE.Vector3(tableX - 1.3, 0, tableZ),
    ], false, 'catmullrom', 0.3);

    const targetPos = gramophone.position;

    /* ---------------- SCROLL -> PROGRESS ---------------- */
    let progressRaw = 0, progress = 0;
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
      const dx = e.clientX - lastPX, dy = e.clientY - lastPY;
      lastPX = e.clientX; lastPY = e.clientY;
      dragYaw -= dx * 0.003;
      dragPitch = THREE.MathUtils.clamp(dragPitch - dy * 0.0026, -0.7, 0.7);
      dragYaw = THREE.MathUtils.clamp(dragYaw, -2.0, 2.0);
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
    let lastTapState = false;

    function animate() {
      animationId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      progress += (progressRaw - progress) * 0.06;
      const t = Math.min(Math.max(progress, 0.0002), 0.9995);

      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const bob = Math.sin(elapsed * 1.5) * 0.035;
      const sway = Math.sin(elapsed * 0.8) * 0.04;
      camera.position.set(p.x + sway, 1.62 + bob, p.z);

      const baseHeading = Math.atan2(tangent.x, tangent.z);
      const toTarget = new THREE.Vector3().subVectors(targetPos, camera.position);
      const dist = toTarget.length();
      const weight = THREE.MathUtils.clamp(1 - (dist - 1.6) / 4.5, 0, 1);
      const targetHeading = Math.atan2(toTarget.x, toTarget.z);
      let relYaw = targetHeading - baseHeading;
      while (relYaw > Math.PI) relYaw -= Math.PI * 2;
      while (relYaw < -Math.PI) relYaw += Math.PI * 2;

      const stillnessMs = performance.now() - lastScrollTime;
      const settleFactor = THREE.MathUtils.clamp((stillnessMs - 120) / 260, 0, 1);
      const autoYawTarget = relYaw * Math.pow(weight, 1.6) * settleFactor;
      const yawEase = settleFactor > 0.5 ? 0.2 : 0.03;
      autoYaw += (autoYawTarget - autoYaw) * yawEase;

      const finalYaw = autoYaw + dragYaw;
      const cosY = Math.cos(finalYaw), sinY = Math.sin(finalYaw);
      const lookDir = new THREE.Vector3(tangent.x * cosY + tangent.z * sinY, 0, -tangent.x * sinY + tangent.z * cosY);
      camLookAt.set(camera.position.x + lookDir.x * 8, camera.position.y + dragPitch * 5, camera.position.z + lookDir.z * 8);
      camera.lookAt(camLookAt);

      const flicker = 0.85 + Math.sin(elapsed * 9) * 0.08 + Math.sin(elapsed * 23) * 0.05 + (Math.random() - 0.5) * 0.06;
      fireplace.light.intensity = 3.3 * flicker;
      fireplace.fill.intensity = 1.1 * flicker;
      fireplace.flame.material.opacity = Math.min(1, 0.85 * flicker);
      fireplace.flame.scale.set(1.2 + Math.sin(elapsed * 11) * 0.08, 1.45 + Math.sin(elapsed * 7) * 0.1, 1);

      const breath = 1 + Math.sin(elapsed * 1.1) * 0.03;
      cat.body.scale.set(1.5, 0.85 * breath, 1.05);

      windowScene.motes.forEach((m) => {
        m.position.y += Math.sin(elapsed * m.userData.speed + m.userData.phase) * 0.0006;
        m.position.x += Math.cos(elapsed * m.userData.speed * 0.6 + m.userData.phase) * 0.0004;
      });

      if (gramophoneDiscRef.current && playingIdRef.current) {
        gramophoneDiscRef.current.rotation.y += dt * 3.2;
      }

      const showTap = weight > 0.82 && settleFactor > 0.6;
      if (showTap !== lastTapState) {
        lastTapState = showTap;
        setTapVisible(showTap);
      }

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
    <div style={{ margin: 0, padding: 0, background: '#0a0705' }}>
      <style>{`
        #cabin-root { position: relative; font-family: Georgia, 'Vazirmatn', 'Times New Roman', serif; direction: rtl; }
        #cabin-stage { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; }
        #cabin-stage canvas { display: block; }
        #cabin-progress-wrap {
          position: fixed; left: 22px; top: 50%; transform: translateY(-50%);
          width: 3px; height: 32vh; background: rgba(255,255,255,0.14);
          border-radius: 3px; z-index: 10; pointer-events: none;
        }
        #cabin-progress-bar {
          position: absolute; bottom: 0; left: 0; width: 100%;
          background: linear-gradient(180deg, #e0b464, #7a2626);
          border-radius: 3px; height: 0%;
        }
        #cabin-scroll-space { height: 260vh; width: 100%; position: relative; }
        #cabin-ambient-toggle {
          position: fixed; top: 22px; left: 22px; z-index: 15;
          background: rgba(20,14,8,0.6); color: #e0b464; border: 1px solid rgba(181,136,58,0.6);
          border-radius: 20px; padding: 8px 16px; font-size: 0.8rem; letter-spacing: 0.02em;
          cursor: pointer; font-family: inherit; backdrop-filter: blur(4px);
        }
        #cabin-tap-btn {
          position: fixed; left: 50%; bottom: 11%; transform: translateX(-50%);
          z-index: 15; background: linear-gradient(180deg, #6a4a28, #3a2a17);
          color: #f0d8a0; border: 2px solid #b5883a; border-radius: 10px;
          padding: 14px 26px; font-size: 1rem; font-family: inherit;
          cursor: pointer; box-shadow: 0 0 24px rgba(224,180,100,0.5), inset 0 0 12px rgba(0,0,0,0.4);
          animation: cabin-pulse 2s ease-in-out infinite;
        }
        @keyframes cabin-pulse {
          0%, 100% { box-shadow: 0 0 18px rgba(224,180,100,0.4), inset 0 0 12px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 32px rgba(224,180,100,0.75), inset 0 0 12px rgba(0,0,0,0.4); }
        }
        #cabin-playlist-overlay {
          position: fixed; inset: 0; z-index: 20; display: flex; align-items: center; justify-content: center;
          background: rgba(10,7,5,0.72); backdrop-filter: blur(3px);
        }
        #cabin-playlist-panel {
          width: min(92vw, 720px); max-height: 82vh; overflow-y: auto;
          background: linear-gradient(180deg, #241a10, #1a120a);
          border: 2px solid #6a4a28; border-radius: 14px; padding: 22px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        #cabin-playlist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        #cabin-playlist-header h2 { color: #e0b464; margin: 0; font-size: 1.25rem; }
        #cabin-close-btn {
          background: none; border: 1px solid #6a4a28; color: #e0b464; border-radius: 8px;
          width: 34px; height: 34px; cursor: pointer; font-size: 1rem; font-family: inherit;
        }
        #cabin-track-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }
        .cabin-track-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(181,136,58,0.35);
          border-radius: 10px; padding: 10px; text-align: center;
        }
        .cabin-track-card img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 6px; margin-bottom: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.5); }
        .cabin-track-title { color: #f0d8a0; font-size: 0.88rem; margin: 0 0 2px; }
        .cabin-track-artist { color: #b09a78; font-size: 0.74rem; margin: 0 0 8px; }
        .cabin-play-btn {
          background: linear-gradient(180deg, #b5883a, #7a5628); border: none; color: #1a120a;
          border-radius: 20px; padding: 6px 18px; font-size: 0.82rem; cursor: pointer; font-family: inherit;
          font-weight: bold;
        }
        .cabin-play-btn.playing { background: linear-gradient(180deg, #7a2626, #4a1616); color: #f0d8a0; }
      `}</style>
      <div id="cabin-root">
        <button id="cabin-ambient-toggle" onClick={toggleAmbient}>
          {ambientOn ? '🌲 صدای جنگل: روشن' : '🌲 صدای جنگل: خاموش'}
        </button>

        <div id="cabin-stage" ref={stageRef} />
        <div id="cabin-progress-wrap"><div id="cabin-progress-bar" ref={progressBarRef} /></div>
        <div id="cabin-scroll-space" ref={scrollSpaceRef} />

        {tapVisible && !playlistOpen && (
          <button id="cabin-tap-btn" onClick={() => setPlaylistOpen(true)}>
            🎶 اینجا ضربه بزن
          </button>
        )}

        {playlistOpen && (
          <div id="cabin-playlist-overlay" onClick={(e) => { if (e.target.id === 'cabin-playlist-overlay') setPlaylistOpen(false); }}>
            <div id="cabin-playlist-panel">
              <div id="cabin-playlist-header">
                <h2>پلی‌لیست</h2>
                <button id="cabin-close-btn" onClick={() => setPlaylistOpen(false)}>×</button>
              </div>
              <div id="cabin-track-grid">
                {TRACKS.map((track, i) => (
                  <div className="cabin-track-card" key={track.id}>
                    <img
                      src={`${import.meta.env.BASE_URL}covers/${track.id}.jpg`}
                      alt={track.title}
                      onError={(e) => {
                        if (!e.target.dataset.fallback) {
                          e.target.dataset.fallback = '1';
                          e.target.src = covers[i];
                        }
                      }}
                    />
                    <p className="cabin-track-title">{track.title}</p>
                    <p className="cabin-track-artist">{track.artist}</p>
                    <button
                      className={`cabin-play-btn${playingId === track.id ? ' playing' : ''}`}
                      onClick={() => togglePlay(track)}
                    >
                      {playingId === track.id ? '⏸ توقف' : '▶ پخش'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
