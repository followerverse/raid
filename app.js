// STORM AREA 51 · Raider ID (@followerverse). Self-contained: three.js + this file.
// Raider # = follow order (wave), job = fixed from the @ (same as tools/raid_job.py), gear/vehicle/look = fixed from the @.
import * as THREE from 'three';
const QS = new URLSearchParams(location.search);
const ACCOUNT = 'followerverse', IG_URL = 'https://www.instagram.com/' + ACCOUNT + '/';

// ================================================================= helpers
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const C = (c) => new THREE.Color(c), V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function h2(x, y) { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vn(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function fbm(x, y, o = 4) { let s = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += a * vn(x * f, y * f); n += a; f *= 2.03; a *= 0.5; } return s / n; }
const MC = {}; const M = (c, o = {}) => MC[c + JSON.stringify(o)] ||= new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...o });
const MS = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.4, ...o });
function mesh(geo, mat, parent, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }
function tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const FONT = '"Arial Rounded MT Bold","Nunito",system-ui,sans-serif';
function labelTex(text, { w = 512, h = 128, bg = '#ffffff', fg = '#2a2a33', border = null, font = FONT } = {}) { return tex(w, h, (g) => { g.fillStyle = bg; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, h * 0.3); g.fill();
  if (border) { g.lineWidth = 8; g.strokeStyle = border; g.stroke(); } let fs = h * 0.52; g.font = `${fs}px ${font}`; while (g.measureText(text).width > w - 50 && fs > 14) { fs -= 2; g.font = `${fs}px ${font}`; }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 2); }); }
const GLOW = tex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
function glow(color, size, parent, x = 0, y = 0, z = 0, op = 0.9) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(size); s.position.set(x, y, z); parent.add(s); return s; }

// ================================================================= the raid rules (match tools/raid_job.py and RAID_RULES.md)
const JOBS = [['Distraction', '🎺', 300, 'Make the guards look the other way'], ['Scout', '🔭', 250, 'Find the weak spot in the fence'], ['Getaway Driver', '🚐', 200, 'Get everyone out when the alarm goes off'],
  ['Hangar Hacker', '💻', 170, 'Crack the Hangar 9 keypad'], ['Alien Whisperer', '👽', 70, 'Talk to whatever is inside'], ['Area 51 Insider', '🕶️', 10, 'You already know what is inside…']];
const WAVES = [[100, 'Front Runner', '🏃'], [500, 'Fence Crew', '🧱'], [2000, 'Desert Army', '🏜️'], [1e9, 'Snack Duty', '🍿']];
function sha256js(bytes) { const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const l = bytes.length, n = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(n); m.set(bytes); m[l] = 0x80; const dv = new DataView(m.buffer); dv.setUint32(n - 4, l * 8); dv.setUint32(n - 8, Math.floor(l / 0x20000000));
  const w = new Uint32Array(64), r = (x, k) => (x >>> k) | (x << (32 - k));
  for (let o = 0; o < n; o += 64) { for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) { const s0 = r(w[i-15], 7) ^ r(w[i-15], 18) ^ (w[i-15] >>> 3), s1 = r(w[i-2], 17) ^ r(w[i-2], 19) ^ (w[i-2] >>> 10); w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0; }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) { const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0; }
    H = H.map((v, i) => (v + [a, b, c, d, e, f, g, h][i]) >>> 0); }
  return H.map(v => v.toString(16).padStart(8, '0')).join(''); }
const enc = (s) => new TextEncoder().encode(s);
function jobOf(h) { const n = Number(BigInt('0x' + sha256js(enc('raid51:' + h))) % 1000n); let acc = 0; for (const J of JOBS) { acc += J[2]; if (n < acc) return J; } return JOBS[JOBS.length - 1]; }
const waveOf = (pos) => WAVES.find(w => pos <= w[0]);
function cyrb(str) { let h1 = 0xdeadbeef, h2b = 0x41c6ce57; for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2b = Math.imul(h2b ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2b ^ (h2b >>> 13), 3266489909); h2b = Math.imul(h2b ^ (h2b >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return 4294967296 * (2097151 & h2b) + (h1 >>> 0); }
const pick = (h, salt, list) => list[cyrb('raider:' + salt + ':' + h) % list.length];
const SKIN = ['#e8b98f', '#c98f63', '#8d5a3b', '#f0c9a4', '#6b4430', '#dca57a'];
const SHIRTS = ['#c8553d', '#3f7cc4', '#e8b23a', '#6aa36f', '#8a6fc4', '#e07a5f', '#2a9d8f', '#f2f0ea'];
const SECOND = [['paintball', 'Paintball marker', 32], ['foam', 'Foam blaster', 26], ['chips', 'Bag of chips', 24], ['flashlight', 'Flashlight', 18]];
const RIDES = [['van', 'Getaway van'], ['monster', 'Monster truck'], ['buggy', 'Dune buggy'], ['pickup', 'Pickup truck']];
const cleanHandle = (s) => String(s || '').trim().replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 30);
function traits(h, pos) {
  const J = jobOf(h), W = pos ? waveOf(pos) : null;
  let sec = null; { const n = cyrb('raider:sec:' + h) % 100; let acc = 0; for (const s of SECOND) { acc += s[2]; if (n < acc) { sec = s; break; } } }
  if (W && W[1] === 'Snack Duty') sec = SECOND[2];                     // snack duty always brings chips
  const sp = SPECIAL[h] || SPECIAL['#' + sha256js(enc('raid51-req' + h)).slice(0, 16)] || null;   // public copy stores requests by scrambled handle
  if (sp && SECOND.some(x => x[0] === sp.held)) sec = SECOND.find(x => x[0] === sp.held);
  const JOB = sp && sp.fallen ? ['Sacrificer', '🫡', 0, 'Took every beam for all of us'] : J;
  return { h, pos, job: JOB, wave: W, sec, special: sp, ride: J[0] === 'Getaway Driver' ? pick(h, 'ride', RIDES) : null,
    skin: pick(h, 'skin', SKIN), shirt: W && W[1] === 'Front Runner' ? '#f5c542' : pick(h, 'shirt', SHIRTS), cap: pick(h, 'cap', SHIRTS), pants: pick(h, 'pants', ['#3b3f4a', '#4a4f3a', '#2f3b5a', '#5a4a3a']) };
}
let LIST = { salt: 'raid51-v1', hashes: [] };
try { LIST = await (await fetch('./raiders.json')).json(); } catch (e) { console.warn('no raider list'); }
async function raiderPos(h) { const code = sha256js(enc(LIST.salt + h)).slice(0, 16); const i = LIST.hashes.indexOf(code); return i >= 0 ? i + 1 : null; }

// ================================================================= renderer + golden-hour desert
const glc = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
const world = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 3000);
{ const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: C('#41629f') }, mid: { value: C('#e9a27a') }, hor: { value: C('#ffd9a6') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top, mid, hor; varying vec3 vP; void main(){ float y = max(vP.y, 0.0); vec3 c = mix(mix(hor, mid, smoothstep(0.0, 0.16, y)), top, smoothstep(0.16, 0.7, y)); gl_FragColor = vec4(c, 1.0); }' }));
  world.add(sky); }
world.fog = new THREE.Fog('#f2c59a', 40, 260);
world.add(new THREE.HemisphereLight('#ffd9b0', '#9a5a3a', 1.25));
const sun = new THREE.DirectionalLight('#ffb36e', 3.0); sun.position.set(-11, 6, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 50 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; world.add(sun);
world.add(new THREE.DirectionalLight('#8fa8ff', 0.5).translateX(8).translateY(6).translateZ(8));
{ const sunSpr = glow('#ffd28a', 160, world, -600, 180, -500, 0.85); }
// sand: gentle dunes, flat-shaded, vertex-coloured
{ const g = new THREE.PlaneGeometry(500, 500, 160, 160); g.rotateX(-Math.PI / 2); const p = g.attributes.position, cols = [], S = ['#d99a62', '#cf8c56', '#e3a86e', '#c8834e'].map(C);
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), d = Math.hypot(x, z * 0.8); const y = (fbm(x * 0.03 + 5, z * 0.03, 4) - 0.5) * 3.2 * Math.min(1, Math.max(0, (d - 9) / 25)); p.setY(i, y);
    const c = S[0].clone().lerp(S[1], fbm(x * 0.08, z * 0.08 + 3, 3)).lerp(S[2], Math.max(0, y) * 0.2); cols.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
  const ground = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })); ground.receiveShadow = true; world.add(ground); }
// red mesas on the horizon
{ const r = rng(51), cols = ['#9c4a3a', '#b0573f', '#87402f'];
  for (let i = 0; i < 16; i++) { const a = Math.PI * (1.05 + r() * 0.9), d = 90 + r() * 120, x = Math.cos(a) * d, z = Math.sin(a) * d, h = 14 + r() * 26, rad = 10 + r() * 22;
    const m = mesh(new THREE.CylinderGeometry(rad * 0.8, rad, h, 6 + ((r() * 3) | 0)), M(cols[i % 3]), world, x, h / 2 - 1, z); m.rotation.y = r() * 3; m.castShadow = false;
    mesh(new THREE.CylinderGeometry(rad * 0.82, rad * 0.8, 1.2, 7), M('#c06a4a'), world, x, h - 0.4, z).castShadow = false; } }
function saguaro(x, z, s = 1) { const c = new THREE.Group(); c.position.set(x, 0, z); c.scale.setScalar(s); world.add(c); const g = M('#6f9a52');
  mesh(new THREE.CylinderGeometry(0.45, 0.5, 4, 7), g, c, 0, 2, 0); mesh(new THREE.SphereGeometry(0.45, 7, 5), g, c, 0, 4, 0);
  for (const sd of [-1, 1]) { const arm = new THREE.Group(); arm.position.set(sd * 0.45, 1.6 + (sd > 0 ? 0.4 : 0), 0); c.add(arm); mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 6), g, arm, sd * 0.4, 0, 0).rotation.z = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.28, 0.3, 1.4, 6), g, arm, sd * 0.82, 0.65, 0); mesh(new THREE.SphereGeometry(0.28, 6, 4), g, arm, sd * 0.82, 1.35, 0); } }
{ const r = rng(7); for (let i = 0; i < 26; i++) { const a = Math.PI * (1.0 + r()), d = 14 + r() * 60; const x = Math.cos(a) * d * 1.3, z = Math.sin(a) * d - 4; if (Math.abs(x) < 7 && z > -12) continue; saguaro(x, z, 0.7 + r() * 0.7); }
  for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = 5 + r() * 30, x = Math.cos(a) * d, z = Math.sin(a) * d - 3; if (Math.abs(x) < 4 && Math.abs(z) < 4) continue;
    const b = mesh(new THREE.IcosahedronGeometry(0.4 + r() * 0.4, 0), M(r() < 0.5 ? '#8a8a52' : '#a09a5c'), world, x, 0.2, z); b.scale.y = 0.6; }
  for (let i = 0; i < 18; i++) { const x = (r() - 0.5) * 40, z = -4 - r() * 30; if (Math.abs(x) < 4 && z > -9) continue; mesh(new THREE.DodecahedronGeometry(0.3 + r() * 0.6, 0), M('#9a5a40'), world, x, 0.2, z); } }
// the fence, the sign, a guard tower and Hangar 9
{ const FZ = -9, post = M('#8a8f96'), linkT = tex(128, 128, (g, w, h) => { g.strokeStyle = 'rgba(200,205,215,0.9)'; g.lineWidth = 3; for (let i = -w; i < w * 2; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); } });
  linkT.wrapS = linkT.wrapT = THREE.RepeatWrapping; linkT.repeat.set(30, 1.2);
  mesh(new THREE.PlaneGeometry(60, 2.6), new THREE.MeshLambertMaterial({ map: linkT, transparent: true, side: THREE.DoubleSide, alphaTest: 0.2 }), world, 0, 1.3, FZ).castShadow = false;
  for (let x = -30; x <= 30; x += 3) { mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 6), post, world, x, 1.4, FZ); }
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 60, 4), post, world, 0, 2.7, FZ).rotation.z = Math.PI / 2;
  for (let k = 0; k < 2; k++) { const wire = mesh(new THREE.TorusGeometry(0.18, 0.02, 4, 10), post, null); }
  const sign = mesh(new THREE.PlaneGeometry(3.4, 1.5), new THREE.MeshLambertMaterial({ map: tex(512, 226, (g, w, h) => { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c0392b'; g.fillRect(0, 0, w, 70);
      g.fillStyle = '#fff'; g.font = `bold 50px ${FONT}`; g.textAlign = 'center'; g.fillText('WARNING', w / 2, 52); g.fillStyle = '#222'; g.font = `bold 40px ${FONT}`; g.fillText('RESTRICTED AREA', w / 2, 120); g.font = `bold 54px ${FONT}`; g.fillStyle = '#c0392b'; g.fillText('AREA 51', w / 2, 185); }) }), world, -4.2, 1.6, FZ + 0.05);
  sign.castShadow = false;
  // guard tower
  const tw = new THREE.Group(); tw.position.set(-9, 0, FZ - 2); world.add(tw); const wood = M('#8a6a4a');
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mesh(new THREE.CylinderGeometry(0.12, 0.14, 6, 6), wood, tw, x, 3, z);
  mesh(new THREE.BoxGeometry(2.8, 0.2, 2.8), wood, tw, 0, 6, 0); mesh(new THREE.BoxGeometry(2.8, 1.0, 0.1), wood, tw, 0, 6.6, 1.35); mesh(new THREE.ConeGeometry(2.3, 1.2, 4), M('#6d4a33'), tw, 0, 8.2, 0).rotation.y = Math.PI / 4;
  for (const [x, z] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 5), wood, tw, x, 7.0, z);
  const spot = mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.5, 10), M('#2b2d31'), tw, 0.8, 7.0, 1.2); spot.rotation.x = 1.1;
  // Hangar 9 (quonset)
  const hg = new THREE.Group(); hg.position.set(26, 0, -85); hg.rotation.y = -0.45; hg.scale.setScalar(0.8); world.add(hg);
  const shell = mesh(new THREE.CylinderGeometry(9, 9, 30, 20, 1, false, 0, Math.PI), M('#b9b5aa'), hg, 0, 0, 0); shell.rotation.set(Math.PI / 2, 0, Math.PI / 2); shell.rotation.order = 'ZXY'; shell.rotation.set(0, 0, 0); shell.rotation.x = Math.PI / 2; shell.rotation.z = -Math.PI / 2;
  const front = mesh(new THREE.CircleGeometry(9, 20, 0, Math.PI), M('#a9a59a'), hg, 0, 0, 15.01); front.castShadow = false;
  mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshLambertMaterial({ map: tex(256, 256, (g, w, h) => { g.fillStyle = '#7a7d82'; g.fillRect(0, 0, w, h); g.fillStyle = '#f5c542'; g.font = `bold 170px ${FONT}`; g.textAlign = 'center'; g.fillText('9', w / 2, 190); }) }), hg, 0, 3.5, 15.05).castShadow = false; }
// drifting dust
const DUST = []; { const r = rng(3); for (let i = 0; i < 40; i++) DUST.push({ s: glow('#ffe0b0', 0.12 + r() * 0.12, world, 0, 0, 0, 0.5), x: (r() - 0.5) * 16, y: 0.3 + r() * 3, z: -4 + r() * 10, ph: r() * 6 }); }

// ================================================================= the action raider (Area 51 bean style, geared up)
const DARK = '#2b2d31', OLIVE = '#4f5a3a';
function camoTex(base) { return tex(128, 128, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r = rng(9); for (const c of ['#3d4a2d', '#6b6b45', '#2e3524', '#8a7a55']) { g.fillStyle = c; for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(r() * w, r() * h, 6 + r() * 14, 4 + r() * 9, r() * 3, 0, 7); g.fill(); } } }); }
function raider(T, { holo = false } = {}) {
  const g = new THREE.Group(); const job = T.job[0], wave = T.wave ? T.wave[1] : 'Desert Army', insider = job === 'Area 51 Insider';
  const shirtCol = insider ? '#1d1e24' : T.shirt;
  const SH = !insider && T.wave && wave === 'Front Runner' ? new THREE.MeshLambertMaterial({ color: '#f5c542', emissive: '#6a4a00', flatShading: true }) : M(shirtCol);
  const cos = T.special && T.special.costume; const SK = M(cos === 'alien' || cos === 'alienDisguise' ? '#7ddc6a' : cos === 'monkey' ? '#6b4430' : T.skin), PA = M(insider ? '#1d1e24' : T.pants), BOOT = M(insider ? '#0f0f12' : '#4a3424'), GLOVE = M(insider ? T.skin : '#2b2d31');
  // legs + boots + knee pads
  const legs = [];
  for (const s of [-1, 1]) { const hip = new THREE.Group(); hip.position.set(0.22 * s, 0.9, 0); g.add(hip); legs.push(hip);
    mesh(new THREE.BoxGeometry(0.34, 0.8, 0.36), PA, hip, 0, -0.42, 0); mesh(new THREE.BoxGeometry(0.42, 0.24, 0.6), BOOT, hip, 0, -0.8, 0.07);
    if (!insider) mesh(new THREE.BoxGeometry(0.36, 0.18, 0.1), M(DARK), hip, 0, -0.45, 0.2); }
  // body + vest
  const body = mesh(new THREE.CapsuleGeometry(0.55, 0.7, 4, 12), SH, g, 0, 1.55, 0); body.scale.set(1, 1, 0.82);
  if (insider) { mesh(new THREE.BoxGeometry(0.34, 0.6, 0.05), M('#f2f2ee'), g, 0, 1.8, 0.45); mesh(new THREE.BoxGeometry(0.12, 0.5, 0.06), M('#c0392b'), g, 0, 1.78, 0.48); }
  else if (!NOVEST.includes(cos)) { const vestCol = job === 'Hangar Hacker' ? '#23314a' : wave === 'Fence Crew' ? '#ff8a1e' : OLIVE;
    const VM = wave === 'Desert Army' && job !== 'Hangar Hacker' ? new THREE.MeshLambertMaterial({ map: camoTex(OLIVE), flatShading: true }) : M(vestCol);
    mesh(new THREE.BoxGeometry(1.0, 0.78, 0.22), VM, g, 0, 1.62, 0.36);
    for (const [x, y] of [[-0.3, 1.42], [0, 1.42], [0.3, 1.42]]) mesh(new THREE.BoxGeometry(0.22, 0.2, 0.1), M(shade(vestCol, 0.75)), g, x, y, 0.5);
    if (wave === 'Fence Crew') for (const y of [1.55, 1.75]) mesh(new THREE.BoxGeometry(1.01, 0.05, 0.23), M('#f2f2ee', { emissive: '#555' }), g, 0, y, 0.36);
    const bp = mesh(new THREE.BoxGeometry(0.78, 0.86, 0.36), M(OLIVE), g, 0, 1.62, -0.6); mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.8, 8), M('#8a5a3a'), g, 0, 2.15, -0.6).rotation.z = Math.PI / 2;
    mesh(new THREE.TorusGeometry(0.56, 0.06, 6, 20), M('#5a3a24'), g, 0, 1.08, 0).rotation.x = Math.PI / 2; mesh(new THREE.BoxGeometry(0.16, 0.12, 0.06), MS('#d9b44a'), g, 0, 1.08, 0.56);
    mesh(new THREE.TorusGeometry(0.24, 0.07, 6, 14), M('#c0392b'), g, 0, 2.15, 0.02).rotation.x = Math.PI / 2; }        // bandana
  // name patch
  const patch = mesh(new THREE.PlaneGeometry(0.9, 0.24), new THREE.MeshBasicMaterial({ map: labelTex('@' + T.h, { w: 512, h: 136 }), transparent: true }), g, 0, 1.92, insider ? 0.5 : 0.48); patch.castShadow = false;
  if (wave === 'Front Runner') mesh(new THREE.CircleGeometry(0.11, 5), MS('#f5c542', { emissive: '#7a5a00' }), g, -0.32, 1.62, 0.49);
  // arms
  const arms = [];
  for (const s of [-1, 1]) { const sh = new THREE.Group(); sh.position.set(0.62 * s, 1.98, 0); g.add(sh); arms.push(sh);
    mesh(new THREE.CapsuleGeometry(0.15, 0.6, 3, 8), SH, sh, 0.02 * s, -0.38, 0); mesh(new THREE.SphereGeometry(0.17, 10, 8), GLOVE, sh, 0.03 * s, -0.82, 0);
    sh.rotation.z = 0.25 * s; }
  // head, face, cap / hair
  const head = new THREE.Group(); head.position.y = 2.62; g.add(head);
  mesh(new THREE.SphereGeometry(0.46, 18, 14), SK, head);
  for (const s of [-1, 1]) { mesh(new THREE.SphereGeometry(0.065, 8, 6), M('#1d1d24'), head, 0.15 * s, 0.04, 0.42); mesh(new THREE.BoxGeometry(0.14, 0.035, 0.04), M('#3a2416'), head, 0.15 * s, 0.15, 0.42).rotation.z = -0.15 * s; }
  const grin = mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 12, Math.PI), M('#4a1f22'), head, 0, -0.12, 0.43); grin.rotation.z = Math.PI;
  if (insider) { mesh(new THREE.BoxGeometry(0.66, 0.15, 0.1), MS('#0b0b0e', { metalness: 0.6, roughness: 0.15 }), head, 0, 0.05, 0.42); mesh(new THREE.SphereGeometry(0.47, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), M('#1a1210'), head, 0, 0.03, -0.02);
    mesh(new THREE.TorusGeometry(0.05, 0.015, 4, 8), M('#c9c9c9'), head, 0.45, -0.05, 0.05).rotation.y = Math.PI / 2; }
  else if (!cos || cos === 'villain' || cos === 'mod') { const capM = M(T.cap); mesh(new THREE.SphereGeometry(0.49, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), capM, head, 0, 0.08, 0); mesh(new THREE.BoxGeometry(0.62, 0.05, 0.46), capM, head, 0, 0.1, 0.5);
    if (job === 'Scout') { for (const s of [-1, 1]) { mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.2, 10), M(DARK), head, 0.13 * s, 0.42, 0.28).rotation.x = Math.PI / 2 - 0.4; mesh(new THREE.CircleGeometry(0.08, 10), new THREE.MeshBasicMaterial({ color: '#5bff8a' }), head, 0.13 * s, 0.38, 0.38).rotation.x = -0.4; } }
    else if (job === 'Alien Whisperer') { mesh(new THREE.TorusGeometry(0.47, 0.04, 6, 24), MS('#d9dde3', { metalness: 0.9, roughness: 0.2 }), head, 0, 0.3, 0).rotation.x = Math.PI / 2;
      for (const s of [-1, 1]) { mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 5), MS('#d9dde3'), head, 0.25 * s, 0.55, 0); mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: '#7dff9a' }), head, 0.25 * s, 0.8, 0); } }
    else { for (const s of [-1, 1]) { const gg = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 14), MS('#3a3a40'), head, 0.13 * s, 0.42, 0.33); gg.rotation.x = Math.PI / 2 - 0.9;
        const lens = mesh(new THREE.CircleGeometry(0.08, 14), MS('#ff9a3c', { metalness: 0.6, roughness: 0.05, emissive: '#5a2a00' }), head, 0.13 * s, 0.445, 0.36); lens.rotation.x = -0.9; } } }
  if (cos) costumeParts(cos, g, head, arms, T);
  g.userData = { arms, head, legs, body };
  if (holo) g.traverse(o => { if (o.isMesh) { o.material = HOLO; o.castShadow = false; } });
  return g;
}
function shade(hex, k) { return '#' + C(hex).multiplyScalar(k).getHexString(); }
const HOLO = new THREE.MeshBasicMaterial({ color: '#7ff3ff', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });

// ---------------------------------------------------------------- gear
function trumpet() { const t = new THREE.Group(), gold = MS('#e8b84a', { metalness: 0.85, roughness: 0.2 });
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), gold, t, 0, 0, 0).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.24, 0.04, 0.4, 16, 1, true), gold, t, 0, 0, 0.5).rotation.x = -Math.PI / 2;
  for (let k = 0; k < 3; k++) mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), gold, t, 0, 0.08, -0.1 + k * 0.08); return t; }
function boombox() { const b = new THREE.Group(); mesh(new THREE.BoxGeometry(0.95, 0.5, 0.32), M('#2b2d31'), b, 0, 0.25, 0);
  for (const s of [-1, 1]) { mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16), M('#55585f'), b, 0.28 * s, 0.25, 0.17).rotation.x = Math.PI / 2; mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10), M('#e8b23a'), b, 0.28 * s, 0.25, 0.18).rotation.x = Math.PI / 2; }
  mesh(new THREE.TorusGeometry(0.3, 0.03, 4, 12, Math.PI), M('#8a8f96'), b, 0, 0.5, 0); return b; }
function binoculars() { const b = new THREE.Group(); for (const s of [-1, 1]) { mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.32, 10), M(DARK), b, 0.1 * s, 0, 0).rotation.x = Math.PI / 2; mesh(new THREE.CircleGeometry(0.075, 10), MS('#4a7ab0', { metalness: 0.7, roughness: 0.1 }), b, 0.1 * s, 0, 0.165); }
  mesh(new THREE.BoxGeometry(0.1, 0.06, 0.1), M(DARK), b, 0, 0, 0); return b; }
function laptop() { const l = new THREE.Group(); mesh(new THREE.BoxGeometry(0.8, 0.04, 0.55), MS('#c9ccd3', { metalness: 0.7, roughness: 0.3 }), l, 0, 0, 0);
  const lid = new THREE.Group(); lid.position.set(0, 0.02, -0.27); lid.rotation.x = -1.85; l.add(lid); mesh(new THREE.BoxGeometry(0.8, 0.55, 0.03), MS('#c9ccd3', { metalness: 0.7, roughness: 0.3 }), lid, 0, 0.275, 0);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.46), new THREE.MeshBasicMaterial({ map: tex(256, 160, (g, w, h) => { g.fillStyle = '#04140a'; g.fillRect(0, 0, w, h); g.fillStyle = '#5bff8a'; g.font = '12px monospace'; const r = rng(4);
    for (let y = 14; y < h; y += 14) g.fillText(Array.from({ length: 34 }, () => '01{}<>/#$=ACCESS'[(r() * 16) | 0]).join(''), 6, y); g.fillStyle = '#5bff8a'; g.font = 'bold 22px monospace'; g.fillText('HANGAR 9 ▸ OPEN?', 20, h - 18); }) }));
  scr.position.set(0, 0.275, -0.02); scr.rotation.y = Math.PI; lid.add(scr); l.userData.screen = scr; return l; }
function keys() { const k = new THREE.Group(); mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 12), MS('#d9dde3'), k, 0, 0, 0); const key = mesh(new THREE.BoxGeometry(0.04, 0.18, 0.015), MS('#e8b84a'), k, 0, -0.14, 0); mesh(new THREE.BoxGeometry(0.1, 0.07, 0.03), M('#c0392b'), k, 0.05, -0.05, 0); return k; }
function alienBuddy() { const a = new THREE.Group(), G = M('#7ddc6a'); mesh(new THREE.CapsuleGeometry(0.2, 0.3, 4, 10), G, a, 0, 0.45, 0);
  for (const s of [-1, 1]) { mesh(new THREE.CapsuleGeometry(0.06, 0.25, 3, 6), G, a, 0.11 * s, 0.13, 0); mesh(new THREE.CapsuleGeometry(0.05, 0.3, 3, 6), G, a, 0.25 * s, 0.5, 0).rotation.z = 0.5 * s; }
  const hd = new THREE.Group(); hd.position.y = 0.98; a.add(hd); mesh(new THREE.SphereGeometry(0.36, 16, 12), G, hd).scale.set(1, 1.15, 0.95);
  for (const s of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.13, 12, 10), MS('#0a0a10', { metalness: 0.2, roughness: 0.05 }), hd, 0.15 * s, 0.02, 0.27); e.scale.set(0.8, 1.25, 0.5); e.rotation.z = -0.35 * s;
    mesh(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: '#fff' }), hd, 0.15 * s + 0.03, 0.08, 0.34); mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 4), G, hd, 0.12 * s, 0.45, 0).rotation.z = -0.4 * s; mesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshBasicMaterial({ color: '#d4ff7a' }), hd, 0.18 * s, 0.6, 0); }
  glow('#a8ff9a', 1.6, a, 0, 0.8, 0, 0.35); return a; }
function briefcase() { const b = new THREE.Group(); mesh(new THREE.BoxGeometry(0.62, 0.46, 0.14), M('#1a1a1f'), b, 0, 0, 0); mesh(new THREE.TorusGeometry(0.1, 0.025, 4, 10, Math.PI), M('#1a1a1f'), b, 0, 0.23, 0);
  mesh(new THREE.PlaneGeometry(0.3, 0.12), new THREE.MeshBasicMaterial({ map: labelTex('ACCESS: ALL', { bg: '#0c1a0f', fg: '#5bff8a', w: 256, h: 96 }) }), b, 0, 0.02, 0.075); return b; }
function blaster(kind) { const b = new THREE.Group(); const body = kind === 'paintball' ? '#2a7dd6' : '#ff8a1e', acc = kind === 'paintball' ? '#ffe14a' : '#2a7dd6';
  mesh(new THREE.BoxGeometry(0.16, 0.2, 0.55), M(body), b, 0, 0, 0.1); mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8), M(DARK), b, 0, 0.03, 0.55).rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(0.1, 0.26, 0.12), M(DARK), b, 0, -0.18, -0.02).rotation.x = 0.25;
  if (kind === 'paintball') { mesh(new THREE.SphereGeometry(0.15, 10, 8), MS(acc, { metalness: 0.1, roughness: 0.4, transparent: true, opacity: 0.85 }), b, 0, 0.2, 0.05).scale.y = 0.85; for (let i = 0; i < 4; i++) mesh(new THREE.SphereGeometry(0.035, 6, 4), M(['#ff4d6d', '#5bff8a', '#4da3ff', '#ffe14a'][i]), b, (i - 1.5) * 0.04, 0.22, 0.05); }
  else { mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), M('#ff8a1e'), b, 0, 0.03, 0.82).rotation.x = Math.PI / 2; mesh(new THREE.BoxGeometry(0.17, 0.08, 0.3), M(acc), b, 0, 0.12, 0.05); }
  return b; }
function chips() { const c = new THREE.Group(); const bag = mesh(new THREE.BoxGeometry(0.42, 0.55, 0.16), new THREE.MeshLambertMaterial({ map: tex(128, 160, (g, w, h) => { g.fillStyle = '#e8352a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23f';
  g.beginPath(); g.arc(w / 2, h / 2, 40, 0, 7); g.fill(); g.fillStyle = '#7a1a10'; g.font = `bold 26px ${FONT}`; g.textAlign = 'center'; g.fillText('CHIPS', w / 2, h / 2 + 9); g.fillStyle = '#fff'; g.font = `bold 14px ${FONT}`; g.fillText('SPICY!', w / 2, 30); }) }), c, 0, 0, 0);
  bag.scale.set(1, 1, 1); for (const y of [0.29, -0.29]) mesh(new THREE.BoxGeometry(0.44, 0.04, 0.06), M('#c22a20'), c, 0, y, 0); return c; }
function flashlight() { const f = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 10), M(DARK), f, 0, 0, 0).rotation.x = Math.PI / 2; mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.12, 10), M(DARK), f, 0, 0, 0.24).rotation.x = Math.PI / 2;
  glow('#fff1c0', 0.7, f, 0, 0, 0.32, 0.9); return f; }
function snackCrate() { const s = new THREE.Group(); mesh(new THREE.BoxGeometry(0.9, 0.55, 0.6), M('#a8784a'), s, 0, 0.28, 0); for (let i = 0; i < 4; i++) { const b = chips(); b.position.set(-0.3 + i * 0.2, 0.7, (i % 2) * 0.1); b.rotation.z = (i - 1.5) * 0.25; b.scale.setScalar(0.7); s.add(b); }
  mesh(new THREE.PlaneGeometry(0.7, 0.2), new THREE.MeshBasicMaterial({ map: labelTex('SNACK DUTY', { bg: '#f5c542', fg: '#3a2412', w: 256, h: 72 }) }), s, 0, 0.3, 0.31); return s; }
// ---------------------------------------------------------------- rides
function wheel(r = 0.4, w = 0.3) { const g = new THREE.Group(); mesh(new THREE.CylinderGeometry(r, r, w, 16), M('#1d1d22'), g).rotation.z = Math.PI / 2; mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w + 0.02, 10), MS('#b9bcc4'), g).rotation.z = Math.PI / 2; return g; }
function vehicle(kind, col) {
  const v = new THREE.Group(); const body = M(col), glass = MS('#2b3a52', { metalness: 0.3, roughness: 0.1 }), lightM = new THREE.MeshBasicMaterial({ color: '#fff4c0' });
  const wheels = (ws, r, w, y) => ws.forEach(([x, z]) => { const wh = wheel(r, w); wh.position.set(x, y, z); v.add(wh); });
  if (kind === 'van') { mesh(new THREE.BoxGeometry(2.0, 1.7, 4.2), body, v, 0, 1.35, 0); mesh(new THREE.BoxGeometry(1.9, 0.7, 0.05), glass, v, 0, 1.75, 2.11); for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.05, 0.6, 1.6), glass, v, s * 1.01, 1.75, 1.0);
    mesh(new THREE.BoxGeometry(2.02, 0.2, 4.22), M('#c0392b'), v, 0, 1.0, 0); mesh(new THREE.BoxGeometry(1.6, 0.08, 2.6), M(DARK), v, 0, 2.25, -0.4); wheels([[-1, 1.3], [1, 1.3], [-1, -1.3], [1, -1.3]], 0.45, 0.3, 0.45);
    for (const s of [-1, 1]) mesh(new THREE.CircleGeometry(0.14, 10), lightM, v, s * 0.7, 1.1, 2.12); }
  else if (kind === 'monster') { mesh(new THREE.BoxGeometry(2.0, 0.8, 3.4), body, v, 0, 2.0, 0); mesh(new THREE.BoxGeometry(1.8, 0.75, 1.5), body, v, 0, 2.75, -0.2); mesh(new THREE.BoxGeometry(1.7, 0.55, 0.05), glass, v, 0, 2.8, 0.56);
    mesh(new THREE.BoxGeometry(2.1, 0.12, 3.5), M('#ff8a1e'), v, 0, 1.62, 0); for (const s of [-1, 1]) for (const z of [-1.1, 1.1]) mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6), MS('#b9bcc4'), v, s * 0.8, 1.3, z);
    wheels([[-1.25, 1.3], [1.25, 1.3], [-1.25, -1.3], [1.25, -1.3]], 0.95, 0.75, 0.95); mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), M(DARK), v, 0, 3.2, 0.1); for (const x of [-0.6, -0.2, 0.2, 0.6]) mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 8), lightM, v, x, 3.28, 0.15).rotation.x = Math.PI / 2; }
  else if (kind === 'buggy') { const tube = MS('#2b2d31', { metalness: 0.6 }); mesh(new THREE.BoxGeometry(1.6, 0.35, 2.8), body, v, 0, 0.75, 0);
    for (const [a, b] of [[[-0.7, 0.9, 0.9], [-0.6, 2.0, 0.2]], [[0.7, 0.9, 0.9], [0.6, 2.0, 0.2]], [[-0.7, 0.9, -1.0], [-0.6, 2.0, -0.4]], [[0.7, 0.9, -1.0], [0.6, 2.0, -0.4]], [[-0.6, 2.0, 0.2], [0.6, 2.0, 0.2]], [[-0.6, 2.0, -0.4], [0.6, 2.0, -0.4]], [[-0.6, 2.0, 0.2], [-0.6, 2.0, -0.4]], [[0.6, 2.0, 0.2], [0.6, 2.0, -0.4]]]) {
      const A = V3(...a), B = V3(...b), d = B.clone().sub(A); const m = mesh(new THREE.CylinderGeometry(0.05, 0.05, d.length(), 6), tube, v); m.position.copy(A.clone().add(B).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); }
    mesh(new THREE.BoxGeometry(1.2, 0.5, 0.6), M(DARK), v, 0, 1.15, -0.2); wheels([[-0.95, 1.0], [0.95, 1.0]], 0.5, 0.35, 0.5); wheels([[-0.95, -1.0], [0.95, -1.0]], 0.65, 0.5, 0.65);
    for (const x of [-0.4, 0, 0.4]) mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), lightM, v, x, 2.08, 0.25).rotation.x = Math.PI / 2; }
  else { mesh(new THREE.BoxGeometry(1.9, 0.75, 4.4), body, v, 0, 0.95, 0); mesh(new THREE.BoxGeometry(1.8, 0.8, 1.6), body, v, 0, 1.7, 0.6); mesh(new THREE.BoxGeometry(1.7, 0.5, 0.05), glass, v, 0, 1.8, 1.41);
    mesh(new THREE.BoxGeometry(1.7, 0.2, 2.0), M(DARK), v, 0, 1.38, -1.2); wheels([[-0.95, 1.4], [0.95, 1.4], [-0.95, -1.4], [0.95, -1.4]], 0.5, 0.35, 0.5); for (const s of [-1, 1]) mesh(new THREE.CircleGeometry(0.13, 10), lightM, v, s * 0.7, 1.0, 2.21); }
  return v;
}

function bus() { const b = new THREE.Group(), Y = M('#f2b705'), glass = MS('#2b3a52', { metalness: 0.3, roughness: 0.1 });
  mesh(new THREE.BoxGeometry(2.4, 2.3, 7.2), Y, b, 0, 1.75, 0); mesh(new THREE.BoxGeometry(2.42, 0.25, 7.22), M(DARK), b, 0, 0.95, 0);
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) mesh(new THREE.BoxGeometry(0.05, 0.7, 0.85), glass, b, 1.21 * s, 2.3, -2.7 + i * 1.0);
  mesh(new THREE.BoxGeometry(2.1, 0.9, 0.05), glass, b, 0, 2.3, 3.61); mesh(new THREE.PlaneGeometry(1.7, 0.42), new THREE.MeshBasicMaterial({ map: labelTex('RAID BUS', { bg: '#1d1e24', fg: '#ffd84a', w: 300, h: 80 }) }), b, 0, 3.12, 3.62);
  for (const [x, z] of [[-1.15, 2.4], [1.15, 2.4], [-1.15, -2.3], [1.15, -2.3]]) { const w = wheel(0.55, 0.4); w.position.set(x, 0.55, z); b.add(w); }
  for (const s of [-1, 1]) mesh(new THREE.CircleGeometry(0.16, 10), new THREE.MeshBasicMaterial({ color: '#fff4c0' }), b, s * 0.85, 1.25, 3.61); return b; }
function foodTruck() { const t = new THREE.Group(), body = M('#e9e4d8'), red = M('#d6402b');
  mesh(new THREE.BoxGeometry(2.2, 2.3, 4.6), body, t, 0, 1.75, 0); mesh(new THREE.BoxGeometry(2.22, 0.3, 4.62), red, t, 0, 0.75, 0);
  mesh(new THREE.BoxGeometry(0.05, 0.9, 2.4), M('#3a2a1e'), t, 1.11, 2.0, -0.3); const aw = mesh(new THREE.BoxGeometry(0.7, 0.06, 2.6), red, t, 1.4, 2.6, -0.3); aw.rotation.z = -0.35;
  mesh(new THREE.BoxGeometry(0.4, 0.08, 2.4), M('#b9bcc4'), t, 1.3, 1.52, -0.3);
  mesh(new THREE.PlaneGeometry(2.0, 0.55), new THREE.MeshBasicMaterial({ map: labelTex('KEBAB', { bg: '#d6402b', fg: '#fff', w: 300, h: 90 }) }), t, 1.12, 3.15, -0.3).rotation.y = Math.PI / 2;
  const sk = new THREE.Group(); sk.position.set(0, 3.0, 0.4); t.add(sk); mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), M('#b9bcc4'), sk, 0, 0.6, 0);
  ['#a0522d', '#e8c27a', '#c8423a', '#6aa36f', '#a0522d', '#e8c27a'].forEach((c, i) => mesh(new THREE.SphereGeometry(0.22, 10, 8), M(c), sk, 0, 0.1 + i * 0.22, 0));
  mesh(new THREE.BoxGeometry(2.0, 0.6, 0.05), MS('#2b3a52', { metalness: 0.3, roughness: 0.1 }), t, 0, 2.25, 2.31);
  for (const [x, z] of [[-1.0, 1.5], [1.0, 1.5], [-1.0, -1.5], [1.0, -1.5]]) { const w = wheel(0.48, 0.34); w.position.set(x, 0.48, z); t.add(w); } return t; }
function ufo() { const u = new THREE.Group(); u.position.y = 0; const hull = MS('#c9ced6', { metalness: 0.7, roughness: 0.25 });
  const disc = mesh(new THREE.SphereGeometry(2.0, 28, 12), hull, u, 0, 3.4, 0); disc.scale.set(1, 0.24, 1);
  mesh(new THREE.SphereGeometry(0.9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#8ff7ff', transparent: true, opacity: 0.55, emissive: '#2a9db0', roughness: 0.05 }), u, 0, 3.75, 0);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? '#7dff9a' : '#ffe14a' }), u, Math.cos(a) * 1.75, 3.33, Math.sin(a) * 1.75); }
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.0, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#9dffb0', transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })); beam.position.y = 1.7; u.add(beam);
  return u; }
function sledgehammer(col) { const h = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 8), M('#8a5a34'), h, 0, 0.45, 0);
  mesh(new THREE.BoxGeometry(0.55, 0.32, 0.32), M(col), h, 0, 1.15, 0); mesh(new THREE.PlaneGeometry(0.4, 0.16), new THREE.MeshBasicMaterial({ map: labelTex('FOAM', { bg: col, fg: '#fff', w: 160, h: 64 }) }), h, 0, 1.15, 0.165); return h; }

// ================================================================= comment requests (from @followerverse comments, 20 Nov 2026): toy/cartoon versions
const SPECIAL = {
  '#aaedea8d4a558132': { ride: 'bulldozer', label: 'Bulldozer driver 🚜' },
  '#381e80a6476b5aec': { ride: 'jet', label: 'Brought a fighter jet ✈️' },
  '#b89a47c99bdba23d': { ride: 'tank', label: 'Tank driver' },
  '#b699ad0f1dbac048': { ride: 'tank', label: 'The tanker' },
  '#dc461b8accf7d794': { costume: 'knight', label: 'Knight armor, sword and shield ⚔️🛡️' },
  '#fe63ab4325f41d15': { costume: 'monkey', held: 'foam', label: 'Armored monkey with a foam blaster 🐒' },
  '#ab08155964352169': { costume: 'villain', held: 'sniper', label: 'Villain with a paintball sniper 🎯' },
  '#ed42c4852122d401': { costume: 'alienDisguise', label: 'An alien disguised as a human 👽🥸' },
  '#14f65aea4aa64485': { costume: 'alien', label: 'Snuck in dressed as an alien 👽' },
  '#b882d9762a372f4a': { costume: 'boxer', label: 'Boxer: dodges everything, hits hardest 🥊' },
  '#2c7ae24b2d4a8a0f': { mount: 'gorilla', label: 'Riding the gorilla 🦍' },
  '#a4869d6cdca870b6': { mount: 'lizard', label: 'Riding a giant desert lizard 🦖' },
  '#5b04a5f0960b4989': { companions: 'emus', label: 'Brought the emu squad 🐦' },
  '#de9cbd9488957c74': { held: 'minigun', label: 'The minigunner (foam darts)' },
  '#d5875f15061ba90a': { held: 'smoke', label: 'Purple smoke bomb 💜' },
  '#c804ad68bd066f9b': { costume: 'mod', label: 'The stinky chat mod (scares everyone away) 🦨' },
  '#8dec1ebe1d7b8f9c': { held: 'paintball', label: 'You asked for a blaster: here it is' },
  '#083849264d25331f': { held: 'paintball', label: 'You asked for a blaster: here it is 🔥' },
  '#99eae483eb998bb1': { ride: 'ufo', label: 'Stole a UFO 🛸' },
  '#7ac1f87c33ff890c': { costume: 'alienDisguise', label: 'A secret alien 👽🥸' },
  '#139bd72605aca4a6': { costume: 'alien', label: 'An alien, to be unique 👽' },
  '#98abcb8edb6ebcc9': { mount: 'gorilla', label: 'Gorilla squad 🦍' },
  '#c44ac975ec79f3b9': { held: 'hammers', label: 'Dual (foam) sledgehammers 🔨🔨' },
  '#0bf7c97a81194a00': { costume: 'medic', label: 'The medic who heals everyone 🩹' },
  '#8cd5859a4a4a088b': { ride: 'jet', label: 'Brought a fighter jet ✈️' },
  '#a52ee72fc5906741': { mount: 'lizard', label: "Riding Godzilla's little cousin 🦖" },
  '#549a97833401592e': { ride: 'foodtruck', label: 'Kebab truck (with a cherry on top) 🥙' },
  '#62db493d3de02d6d': { ride: 'monster', label: 'Monster truck 🛻' },
  '#2d46a960c9005d71': { ride: 'monster', held: 'foam', label: 'Monster truck + a blaster 🛻' },
  '#f8115b5d87f2114f': { ride: 'bus', label: 'Brought the big bus 🚌' },
  '#f785c271bc93b7de': { ride: 'bus', label: 'Raid bus driver (thank the driver!) 🚌' },
  '#707b3c3a209eac49': { costume: 'lion', label: 'The lion 🦁' },
  '#179eb5e6a9fde94e': { costume: 'hotdog', label: 'Hot dog suit 🌭' },
  '#dfd64c8bac2890ff': { held: 'chips', label: 'Never-ending snack pockets 🍿' },
  '#6e1d7f6f42a425ad': { fallen: true, label: 'The Sacrificer: took every beam (Episode 3) 🫡' },   // creator, 23 Nov: only his cap is left
};
const NOVEST = ['knight', 'boxer', 'alienDisguise', 'mod', 'villain', 'medic', 'hotdog'];
function costumeParts(cos, g, head, arms, T) {
  const steel = MS('#dfe4ea', { metalness: 0.25, roughness: 0.3, emissive: '#2a2e36' });
  if (cos === 'knight') {
    mesh(new THREE.SphereGeometry(0.5, 18, 12), steel, head, 0, 0.02, 0); mesh(new THREE.BoxGeometry(0.5, 0.06, 0.1), M('#1d1d24'), head, 0, 0.05, 0.47);
    mesh(new THREE.BoxGeometry(0.06, 0.3, 0.1), steel, head, 0, -0.1, 0.48); const plume = mesh(new THREE.CapsuleGeometry(0.08, 0.5, 4, 8), M('#c0392b'), head, 0, 0.55, -0.15); plume.rotation.x = -0.7;
    mesh(new THREE.CapsuleGeometry(0.58, 0.55, 4, 14), steel, g, 0, 1.6, 0).scale.set(1.02, 1, 0.86);
    for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), steel, g, 0.62 * s, 2.0, 0);
    mesh(new THREE.BoxGeometry(0.12, 0.3, 0.05), MS('#e8b84a', { metalness: 0.8 }), g, 0, 1.75, 0.5);
    const sword = new THREE.Group(); mesh(new THREE.BoxGeometry(0.1, 1.4, 0.03), steel, sword, 0, 0.8, 0); mesh(new THREE.BoxGeometry(0.42, 0.07, 0.08), MS('#e8b84a', { metalness: 0.8 }), sword, 0, 0.08, 0);
    mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.28, 8), M('#5a3a24'), sword, 0, -0.08, 0); arms[1].rotation.set(-0.9, 0, -0.2); sword.position.set(0.04, -0.88, 0.12); sword.rotation.x = -0.8; arms[1].add(sword);
    const sh = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 24), M('#2a4d8f'), sh).rotation.x = Math.PI / 2; mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 24), steel, sh);
    mesh(new THREE.BoxGeometry(0.1, 0.6, 0.04), MS('#e8b84a', { metalness: 0.8 }), sh, 0, 0, 0.05); mesh(new THREE.BoxGeometry(0.5, 0.1, 0.04), MS('#e8b84a', { metalness: 0.8 }), sh, 0, 0.12, 0.05);
    arms[0].rotation.set(-0.7, 0, 0.35); sh.position.set(-0.05, -0.75, 0.25); arms[0].add(sh);
  }
  if (cos === 'monkey') { const fur = M('#6b4430'), face = M('#d9a77a');
    mesh(new THREE.SphereGeometry(0.3, 14, 10), face, head, 0, -0.08, 0.26).scale.set(1, 0.8, 0.7); for (const s of [-1, 1]) { mesh(new THREE.SphereGeometry(0.15, 10, 8), fur, head, 0.47 * s, 0.05, 0); mesh(new THREE.SphereGeometry(0.09, 8, 6), face, head, 0.5 * s, 0.05, 0.05); }
    mesh(new THREE.SphereGeometry(0.49, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M('#7a8a5a'), head, 0, 0.12, -0.02);   // helmet
    for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.32, 0.26, 0.1), M('#7a8a5a'), g, 0.62 * s, 1.95, 0.05);
    const tail = mesh(new THREE.TorusGeometry(0.35, 0.06, 6, 16, Math.PI * 1.4), fur, g, 0, 1.2, -0.75); tail.rotation.y = Math.PI / 2; }
  if (cos === 'alien' || cos === 'alienDisguise') {
    for (const s of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.15, 12, 10), MS('#0a0a10', { metalness: 0.2, roughness: 0.05 }), head, 0.17 * s, 0.05, 0.36); e.scale.set(0.8, 1.2, 0.5); e.rotation.z = -0.35 * s; }
    if (cos === 'alien') for (const s of [-1, 1]) { mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 5), M('#7ddc6a'), head, 0.16 * s, 0.6, 0).rotation.z = -0.35 * s; mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#d4ff7a' }), head, 0.24 * s, 0.82, 0); }
    else { mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.25, 16), M('#3a3026'), head, 0, 0.42, 0); mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 20), M('#3a3026'), head, 0, 0.3, 0);   // fedora
      for (const s of [-1, 1]) mesh(new THREE.TorusGeometry(0.12, 0.022, 6, 14), M('#111'), head, 0.17 * s, 0.05, 0.47); mesh(new THREE.BoxGeometry(0.1, 0.03, 0.03), M('#111'), head, 0, 0.06, 0.5);
      mesh(new THREE.SphereGeometry(0.08, 8, 6), M('#7ddc6a'), head, 0, -0.06, 0.5).scale.set(0.8, 0.9, 1.2); mesh(new THREE.BoxGeometry(0.3, 0.06, 0.05), M('#2a1a10'), head, 0, -0.15, 0.47);   // nose + mustache
      mesh(new THREE.CylinderGeometry(0.62, 0.72, 1.6, 16), M('#c9a46a'), g, 0, 1.35, 0); mesh(new THREE.TorusGeometry(0.62, 0.06, 6, 20), M('#a8844a'), g, 0, 1.15, 0).rotation.x = Math.PI / 2; } }
  if (cos === 'boxer') { const red = MS('#d6252b', { metalness: 0.1, roughness: 0.3 });
    mesh(new THREE.SphereGeometry(0.5, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), red, head, 0, 0.0, -0.02); for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.12, 8, 6), red, head, 0.42 * s, -0.05, 0.1);
    arms.forEach((a, i) => { a.children[1].visible = false; mesh(new THREE.SphereGeometry(0.3, 14, 10), red, a, 0, -0.85, 0.08); a.rotation.set(-1.25, 0, (i ? -1 : 1) * 0.55); });
    mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.35, 16), M('#f2f2ee'), g, 0, 1.0, 0); mesh(new THREE.TorusGeometry(0.6, 0.06, 6, 20), M('#d6252b'), g, 0, 1.17, 0).rotation.x = Math.PI / 2; }
  if (cos === 'villain') { mesh(new THREE.BoxGeometry(0.6, 0.13, 0.08), M('#1d1d24'), head, 0, 0.05, 0.42);
    const cape = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 1.05, 2.0, 18, 1, true, Math.PI * 0.62, Math.PI * 0.76), new THREE.MeshLambertMaterial({ color: '#5a0f1f', side: THREE.DoubleSide, flatShading: true })); cape.position.set(0, 1.25, -0.05); cape.castShadow = true; g.add(cape);
    mesh(new THREE.TorusGeometry(0.45, 0.07, 6, 18), M('#5a0f1f'), g, 0, 2.18, 0).rotation.x = Math.PI / 2; }
  if (cos === 'mod') { mesh(new THREE.TorusGeometry(0.47, 0.05, 6, 20, Math.PI), M('#1d1d24'), head, 0, 0.05, 0).rotation.y = Math.PI / 2;
    for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12), M('#1d1d24'), head, 0.47 * s, 0.0, 0).rotation.z = Math.PI / 2;
    const mic = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 5), M('#1d1d24'), head, 0.38, -0.2, 0.25); mic.rotation.set(0.9, 0, 0.6);
    mesh(new THREE.PlaneGeometry(0.42, 0.18), new THREE.MeshBasicMaterial({ map: labelTex('MOD', { bg: '#5865f2', fg: '#fff', w: 256, h: 110 }) }), g, 0.25, 1.62, 0.47);
    mesh(new THREE.CapsuleGeometry(0.58, 0.6, 4, 14), M('#4a4f5a'), g, 0, 1.6, 0).scale.set(1.02, 1, 0.86); }
  if (cos === 'medic') { const W = M('#f4f6f8'), GR = M('#2fae5b');
    mesh(new THREE.CapsuleGeometry(0.58, 0.62, 4, 14), W, g, 0, 1.58, 0).scale.set(1.03, 1, 0.86); mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.55, 16, 1, true), W, g, 0, 0.98, 0);
    mesh(new THREE.BoxGeometry(0.34, 0.11, 0.05), GR, g, 0, 1.72, 0.5); mesh(new THREE.BoxGeometry(0.11, 0.34, 0.05), GR, g, 0, 1.72, 0.5);
    mesh(new THREE.TorusGeometry(0.47, 0.05, 6, 24), W, head, 0, 0.18, 0).rotation.x = Math.PI / 2; mesh(new THREE.BoxGeometry(0.16, 0.05, 0.03), GR, head, 0, 0.2, 0.48); mesh(new THREE.BoxGeometry(0.05, 0.16, 0.03), GR, head, 0, 0.2, 0.48);
    const bag = new THREE.Group(); mesh(new THREE.BoxGeometry(0.6, 0.42, 0.3), M('#d94b4b'), bag); mesh(new THREE.BoxGeometry(0.26, 0.08, 0.02), W, bag, 0, 0, 0.16); mesh(new THREE.BoxGeometry(0.08, 0.26, 0.02), W, bag, 0, 0, 0.16);
    mesh(new THREE.TorusGeometry(0.12, 0.025, 5, 12, Math.PI), M(DARK), bag, 0, 0.21, 0); bag.position.set(-0.85, 0.75, 0.25); bag.rotation.y = 0.3; g.add(bag); }
  if (cos === 'lion') { const MANE = M('#b8651f'), FUR = M('#e0a44a');
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; mesh(new THREE.SphereGeometry(0.22, 8, 6), MANE, head, Math.cos(a) * 0.5, 0.02 + Math.sin(a) * 0.5, -0.12); }
    for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.13, 8, 6), FUR, head, 0.34 * s, 0.5, 0.02);
    mesh(new THREE.SphereGeometry(0.16, 10, 8), FUR, head, 0, -0.12, 0.44).scale.set(1.3, 0.8, 0.7); mesh(new THREE.SphereGeometry(0.06, 8, 6), M('#3a2412'), head, 0, -0.06, 0.55);
    const tail = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), FUR, g, 0, 1.0, -0.6); tail.rotation.x = 0.9; mesh(new THREE.SphereGeometry(0.14, 8, 6), MANE, g, 0, 0.75, -1.0); }
  if (cos === 'hotdog') { const BUN = M('#e5a958'), DOG = M('#c4553a'), MUST = new THREE.MeshLambertMaterial({ color: '#ffd21f', emissive: '#4a3a00' });
    for (const s of [-1, 1]) mesh(new THREE.CapsuleGeometry(0.34, 1.9, 6, 12), BUN, g, 0.52 * s, 1.75, -0.12).scale.set(1, 1, 0.9);
    mesh(new THREE.CapsuleGeometry(0.44, 2.1, 6, 14), DOG, g, 0, 1.95, -0.32);
    for (let i = 0; i < 7; i++) { const z = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 6), MUST, g, (i % 2 ? 0.1 : -0.1), 2.65 + i * 0.13, -0.05 - i * 0.02); z.rotation.z = i % 2 ? 1.1 : -1.1; } }
}
// ---------------------------------------------------------------- request rides, mounts, companions, held items
function bulldozer() { const v = new THREE.Group(), Y = M('#f2b705'), D = M('#2b2d31');
  mesh(new THREE.BoxGeometry(2.2, 1.0, 3.0), Y, v, 0, 1.0, 0); mesh(new THREE.BoxGeometry(1.6, 1.3, 1.4), Y, v, 0, 2.15, -0.5); mesh(new THREE.BoxGeometry(1.5, 0.9, 1.3), MS('#2b3a52', { metalness: 0.3, roughness: 0.1 }), v, 0, 2.25, -0.5);
  for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(0.6, 0.8, 3.4), D, v, 1.2 * s, 0.4, 0); for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.62, 10), M('#555'), v, 1.2 * s, 0.4, -1.2 + i * 0.8).rotation.z = Math.PI / 2; }
  mesh(new THREE.BoxGeometry(3.0, 1.1, 0.25), Y, v, 0, 0.6, 2.1); for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.15, 0.15, 1.2), D, v, 0.8 * s, 0.9, 1.5);
  mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), D, v, 0.6, 2.9, 0.3); return v; }
function jet() { const j = new THREE.Group(), G = M('#8a95a3'), D = M('#4a525e');
  mesh(new THREE.CylinderGeometry(0.55, 0.7, 7, 14), G, j, 0, 1.6, 0).rotation.x = Math.PI / 2; mesh(new THREE.ConeGeometry(0.55, 2.0, 14), G, j, 0, 1.6, 4.5).rotation.x = Math.PI / 2;
  mesh(new THREE.SphereGeometry(0.5, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), MS('#ffb84a', { metalness: 0.6, roughness: 0.05, transparent: true, opacity: 0.8 }), j, 0, 2.05, 2.0).scale.set(0.9, 0.8, 2.0);
  const wing = new THREE.Shape([[0, 0], [4.2, -1.6], [4.2, -2.4], [0, -2.6]].map(p => new THREE.Vector2(...p))); for (const s of [-1, 1]) { const w = mesh(new THREE.ExtrudeGeometry(wing, { depth: 0.1, bevelEnabled: false }), G, j, 0.4 * s, 1.5, 1.4); w.rotation.set(Math.PI / 2, 0, s < 0 ? Math.PI : 0); if (s < 0) w.scale.x = 1; }
  for (const s of [-1, 1]) { const f = mesh(new THREE.BoxGeometry(0.08, 1.4, 1.2), D, j, 0.45 * s, 2.5, -3.0); f.rotation.z = 0.25 * s; mesh(new THREE.BoxGeometry(1.8, 0.06, 0.9), G, j, 1.0 * s, 1.7, -3.1); }
  glow('#ff8a3c', 1.4, j, 0, 1.6, -3.7, 0.9); for (const [x, z] of [[0, 3], [-1.3, -0.5], [1.3, -0.5]]) { mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 5), D, j, x, 0.6, z); const w = wheel(0.22, 0.15); w.position.set(x, 0.22, z); j.add(w); }
  mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ map: labelTex('51', { bg: '#c0392b', fg: '#fff', w: 128, h: 128 }), transparent: true }), j, -0.71, 1.8, -1.0).rotation.y = -Math.PI / 2;
  return j; }
function tank() { const t = new THREE.Group(), C1 = M('#b39b6b'), D = M('#2b2d31');
  mesh(new THREE.BoxGeometry(2.6, 0.9, 4.0), C1, t, 0, 1.0, 0); for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(0.7, 0.9, 4.3), D, t, 1.45 * s, 0.5, 0); for (let i = 0; i < 5; i++) mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.72, 12), M('#555'), t, 1.45 * s, 0.45, -1.6 + i * 0.8).rotation.z = Math.PI / 2; }
  const tur = new THREE.Group(); tur.position.y = 1.75; t.add(tur); mesh(new THREE.CylinderGeometry(1.0, 1.15, 0.7, 14), C1, tur); const b = mesh(new THREE.CylinderGeometry(0.13, 0.15, 2.8, 10), C1, tur, 0, 0.05, 1.8); b.rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10), D, tur, 0, 0.05, 3.2).rotation.x = Math.PI / 2; mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 10), C1, tur, 0.4, 0.45, -0.2);
  mesh(new THREE.PlaneGeometry(0.7, 0.5), new THREE.MeshBasicMaterial({ map: labelTex('RAID', { bg: '#f5c542', fg: '#3a2412', w: 200, h: 140 }), transparent: true }), tur, 0, 0.02, 1.16); t.userData.turret = tur; return t; }
function gorilla() { const g = new THREE.Group(), F = M('#2b2626'), S = M('#5a4a46');
  mesh(new THREE.SphereGeometry(1.2, 14, 10), F, g, 0, 2.4, 0).scale.set(1.15, 1.05, 0.9); mesh(new THREE.SphereGeometry(0.75, 12, 10), S, g, 0, 2.3, 0.65).scale.set(1, 1.1, 0.4);
  const hd = new THREE.Group(); hd.position.set(0, 3.6, 0.5); g.add(hd); mesh(new THREE.SphereGeometry(0.6, 14, 10), F, hd); mesh(new THREE.SphereGeometry(0.42, 12, 8), S, hd, 0, -0.12, 0.4).scale.set(1.1, 0.8, 0.6);
  for (const s of [-1, 1]) { mesh(new THREE.SphereGeometry(0.07, 8, 6), M('#111'), hd, 0.2 * s, 0.12, 0.5); const arm = mesh(new THREE.CapsuleGeometry(0.38, 1.6, 4, 10), F, g, 1.35 * s, 1.9, 0.3); arm.rotation.z = 0.25 * s; mesh(new THREE.SphereGeometry(0.45, 10, 8), S, g, 1.6 * s, 0.6, 0.45);
    mesh(new THREE.CapsuleGeometry(0.4, 0.6, 4, 10), F, g, 0.6 * s, 0.8, -0.2); }
  return g; }
function lizard() { const L = new THREE.Group(), G = M('#4f8a3a'), B = M('#c9b77a'), SP = M('#e0b84a');
  mesh(new THREE.CapsuleGeometry(1.2, 3.0, 6, 14), G, L, 0, 2.0, 0).rotation.x = Math.PI / 2; mesh(new THREE.CapsuleGeometry(0.9, 2.4, 6, 12), B, L, 0, 1.4, 0.2).rotation.x = Math.PI / 2;
  const nk = mesh(new THREE.CapsuleGeometry(0.7, 1.2, 4, 10), G, L, 0, 3.3, 2.2); nk.rotation.x = 0.7;
  const hd = new THREE.Group(); hd.position.set(0, 4.2, 3.0); L.add(hd); mesh(new THREE.BoxGeometry(1.1, 0.9, 1.6), G, hd); mesh(new THREE.BoxGeometry(1.0, 0.35, 1.2), B, hd, 0, -0.45, 0.25);
  for (const s of [-1, 1]) { mesh(new THREE.SphereGeometry(0.16, 10, 8), M('#ffd23f'), hd, 0.45 * s, 0.25, 0.5); mesh(new THREE.SphereGeometry(0.08, 8, 6), M('#111'), hd, 0.5 * s, 0.25, 0.6); }
  for (let i = 0; i < 6; i++) { const t = mesh(new THREE.ConeGeometry(0.08, 0.25, 4), M('#fff'), hd, -0.35 + i * 0.14, -0.38, 0.85); t.rotation.x = Math.PI; }
  const tail = mesh(new THREE.ConeGeometry(0.9, 4.5, 12), G, L, 0, 1.6, -3.6); tail.rotation.x = -Math.PI / 2 - 0.15;
  for (let i = 0; i < 9; i++) { const sp = mesh(new THREE.ConeGeometry(0.22, 0.6, 4), SP, L, 0, 3.15 - i * 0.12, 1.6 - i * 0.65); sp.rotation.x = -0.3; }
  for (const [x, z] of [[-1, 1.3], [1, 1.3], [-1, -1.2], [1, -1.2]]) { mesh(new THREE.CapsuleGeometry(0.42, 0.9, 4, 10), G, L, x, 0.75, z); for (let c = -1; c <= 1; c++) mesh(new THREE.ConeGeometry(0.07, 0.3, 4), M('#fff'), L, x + c * 0.15, 0.1, z + 0.45).rotation.x = Math.PI / 2; }
  mesh(new THREE.BoxGeometry(1.4, 0.2, 1.2), M('#8a3a2a'), L, 0, 3.25, 0.3); return L; }
function emu() { const e = new THREE.Group(), F = M('#8a7560'); mesh(new THREE.SphereGeometry(0.6, 12, 10), F, e, 0, 1.35, 0).scale.set(1, 0.85, 1.35); for (let i = 0; i < 8; i++) mesh(new THREE.ConeGeometry(0.12, 0.45, 5), M('#6e5c4a'), e, (i % 2 - 0.5) * 0.4, 1.1, -0.6 - (i >> 1) * 0.08).rotation.x = 2.4;
  const nk = mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.0, 8), M('#7a8aa0'), e, 0, 2.0, 0.45); nk.rotation.x = 0.25; mesh(new THREE.SphereGeometry(0.16, 10, 8), M('#4a3e36'), e, 0, 2.5, 0.6); mesh(new THREE.ConeGeometry(0.06, 0.2, 6), M('#2b2d31'), e, 0, 2.48, 0.8).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) { mesh(new THREE.SphereGeometry(0.03, 6, 4), M('#ff8a1e'), e, 0.1 * s, 2.55, 0.7); mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.95, 6), M('#5a5048'), e, 0.2 * s, 0.5, 0); mesh(new THREE.BoxGeometry(0.22, 0.05, 0.3), M('#5a5048'), e, 0.2 * s, 0.03, 0.08); } e.userData.neck = nk; return e; }
function minigun() { const m = new THREE.Group(); mesh(new THREE.BoxGeometry(0.4, 0.4, 0.6), M('#ff8a1e'), m, 0, 0, 0); const barrels = new THREE.Group(); barrels.position.z = 0.55; m.add(barrels);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), M('#2a7dd6'), barrels, Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0.3).rotation.x = Math.PI / 2; }
  mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 12), M('#2b2d31'), barrels, 0, 0, 0.6).rotation.x = Math.PI / 2; mesh(new THREE.BoxGeometry(0.1, 0.3, 0.1), M('#2b2d31'), m, 0, 0.3, -0.05); m.userData.barrels = barrels; return m; }
function sniper() { const s = new THREE.Group(); mesh(new THREE.BoxGeometry(0.14, 0.18, 1.1), M('#3f4a2d'), s, 0, 0, 0); mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), M('#2b2d31'), s, 0, 0.04, 0.95).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.45, 10), M('#1d1d22'), s, 0, 0.18, 0.15).rotation.x = Math.PI / 2; mesh(new THREE.SphereGeometry(0.13, 10, 8), MS('#ff4d6d', { transparent: true, opacity: 0.85 }), s, 0, 0.2, -0.25); return s; }
function smokeBomb() { const b = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.3, 10), M('#8a4dff'), b, 0, 0, 0); mesh(new THREE.TorusGeometry(0.05, 0.015, 6, 10), MS('#d9dde3'), b, 0, 0.18, 0); return b; }

// ================================================================= stage
const stage = new THREE.Group(); world.add(stage);
let ACT = null;
function clearStage() { while (stage.children.length) stage.remove(stage.children[0]); }
function attach(arm, obj, x, y, z) { obj.position.set(x, y, z); arm.add(obj); return obj; }
function buildStage(T) {
  clearStage(); const notYet = !T.pos; const job = T.job[0];
  const R = raider(T, { holo: notYet }); stage.add(R); ACT = { T, R, job, extra: {} };   // ?dressed = preview costumes for anyone (testing only)
  const sp0 = T.special || {};
  if (sp0.fallen) { R.visible = false; const cap = new THREE.Group(), red = M('#e53935');
    mesh(new THREE.SphereGeometry(0.62, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), red, cap, 0, 0, 0); const brim = mesh(new THREE.BoxGeometry(0.78, 0.07, 0.62), red, cap, 0, 0.03, 0.62);
    cap.position.set(0.1, 0.02, 0.35); cap.rotation.set(0.08, 0.7, 0.06); stage.add(cap); ACT.extra.cap = cap;
    const bitM = new THREE.MeshBasicMaterial({ color: '#ffb08a', transparent: true, opacity: 0.9, toneMapped: false });
    ACT.extra.embers = Array.from({ length: 26 }, (_, i) => { const b = mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), bitM.clone(), stage, 0, 0, 0); b.castShadow = false; return { b, a: i * 2.4, r: 0.25 + (i % 5) * 0.12, ph: (i * 0.137) % 1 }; });
    glow('#ff5a3c', 2.2, stage, 0.1, 0.25, 0.35, 0.35); return; }
  const [L, Rt] = R.userData.arms;
  const sp = T.special || {}; const handsBusy = ['minigun', 'sniper', 'smoke', 'hammers'].includes(sp.held) || ['knight', 'boxer', 'medic'].includes(sp.costume) || !!sp.mount;
  // job pose + gear
  if (job === 'Distraction') { if (!handsBusy) { const tr = trumpet(); tr.position.set(0.05, -0.14, 0.62); tr.rotation.x = -0.25; R.userData.head.add(tr); Rt.rotation.set(-1.4, 0, -0.1); L.rotation.set(-1.25, 0, 0.15); }
    const bb = boombox(); bb.position.set(-1.25, 0, 0.6); bb.rotation.y = 0.4; stage.add(bb); ACT.extra.bb = bb; }
  if (job === 'Scout' && !handsBusy) { const b = binoculars(); b.position.set(0, 0.03, 0.55); R.userData.head.add(b); L.rotation.set(-1.75, 0, 0.5); Rt.rotation.set(-1.75, 0, -0.5); ACT.extra.scan = true; }
  if (job === 'Hangar Hacker') { if (!handsBusy) { const lp = laptop(); lp.position.set(0, 1.3, 0.78); R.add(lp); L.rotation.set(-0.95, 0, 0.35); Rt.rotation.set(-0.95, 0, -0.35); ACT.extra.lp = lp; }
    const ant = mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 5), M('#8a8f96'), R, 0.25, 2.6, -0.65); const tip = mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff3b30' }), R, 0.25, 3.1, -0.65); ACT.extra.tip = tip; }
  if (job === 'Getaway Driver') { if (!handsBusy) { const k = keys(); attach(Rt, k, 0.05, -1.0, 0.05); Rt.rotation.set(-0.3, 0, -1.1); ACT.extra.keys = k; }
    if (!sp.ride && !sp.mount) { const v = vehicle(T.ride[0], pick(T.h, 'ridecol', ['#e8e4dc', '#c0392b', '#2a7dd6', '#f5c542', '#2f2f36', '#6aa36f'])); v.position.set(2.6, 0, -2.6); v.rotation.y = -0.55; stage.add(v); ACT.extra.ride = v; } }
  if (job === 'Alien Whisperer') { const a = alienBuddy(); a.position.set(1.15, 0, 0.55); a.rotation.y = -0.4; stage.add(a); ACT.extra.alien = a; if (!handsBusy) Rt.rotation.set(-0.2, 0, -0.55);
    const am = mesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshStandardMaterial({ color: '#c79bff', emissive: '#8a4dff', emissiveIntensity: 1.2 }), R, 0, 2.0, 0.5); ACT.extra.amulet = am; }
  if (job === 'Area 51 Insider') { if (!handsBusy) { const bc = briefcase(); attach(L, bc, -0.02, -1.08, 0.05); L.rotation.set(0, 0, 0.12); Rt.rotation.set(-2.2, 0, -0.65); ACT.extra.insider = true; }
    const badge = mesh(new THREE.PlaneGeometry(0.22, 0.3), new THREE.MeshBasicMaterial({ map: labelTex('51', { bg: '#0c1a0f', fg: '#5bff8a', w: 128, h: 160 }) }), R, 0.32, 1.72, 0.47); }
  // second item (left hand when free)
  const sec = T.sec && T.sec[0]; const leftFree = job === 'Getaway Driver' || job === 'Alien Whisperer' || job === 'Distraction';
  if (sec && job !== 'Area 51 Insider' && !handsBusy) {
    const item = sec === 'chips' ? chips() : sec === 'flashlight' ? flashlight() : blaster(sec);
    if (leftFree && job !== 'Distraction') { L.rotation.set(sec === 'chips' ? -0.6 : -1.1, 0, 0.25); attach(L, item, -0.03, -0.92, sec === 'chips' ? 0.18 : 0.12); if (sec !== 'chips') item.rotation.x = -0.4; }
    else if (job === 'Distraction' && sec === 'chips') { const c = chips(); c.position.set(-0.45, 1.0, 0.45); c.rotation.z = 0.4; R.add(c); }
    else { item.position.set(sec === 'chips' ? -0.62 : 0.5, sec === 'chips' ? 1.05 : 1.25, sec === 'chips' ? 0.25 : -0.62); item.rotation.set(0, sec === 'chips' ? 0.3 : Math.PI, sec === 'chips' ? 0.3 : 1.2); R.add(item); }   // holstered / tucked
  }
  // ---- comment requests
  if (sp.ride) { const v = sp.ride === 'bulldozer' ? bulldozer() : sp.ride === 'jet' ? jet() : sp.ride === 'tank' ? tank() : sp.ride === 'bus' ? bus() : sp.ride === 'foodtruck' ? foodTruck() : sp.ride === 'ufo' ? ufo() : vehicle(sp.ride, '#c0392b');
    const P = sp.ride === 'jet' ? [3.4, -4.6, -0.65, 0.75] : sp.ride === 'bus' ? [3.6, -4.4, -0.6, 0.8] : sp.ride === 'ufo' ? [2.5, -3.0, 0, 1.15] : sp.ride === 'foodtruck' ? [3.0, -3.0, -2.0, 1] : [2.9, -2.9, -0.55, 1];
    v.position.set(P[0], 0, P[1]); v.rotation.y = P[2]; v.scale.setScalar(P[3]); stage.add(v); ACT.extra.ride = v; ACT.extra.big = ['jet', 'bus', 'ufo'].includes(sp.ride); ACT.extra.turret = v.userData.turret; }
  if (sp.mount) { const m = sp.mount === 'gorilla' ? gorilla() : lizard(); m.position.set(0, 0, -0.4); stage.add(m); ACT.extra.mount = m; ACT.extra.big = true;
    const seat = sp.mount === 'gorilla' ? [0, 2.72, -0.6] : [0, 2.42, -0.15]; R.position.set(seat[0], seat[1], seat[2]); ACT.extra.baseY = seat[1];
    R.userData.legs.forEach(l => { l.rotation.x = -1.35; l.rotation.z = 0; }); R.userData.legs[0].rotation.z = 0.25; R.userData.legs[1].rotation.z = -0.25; Rt.rotation.set(-2.6, 0, -0.35); L.rotation.set(-0.6, 0, 0.5); }
  if (sp.companions === 'emus') { ACT.extra.emus = [[1.6, 0.6, -0.5], [-1.6, 0.3, 0.5], [2.4, -1.4, -0.9], [-2.3, -1.2, 0.8], [0.9, -2.6, -0.2], [-0.9, -2.8, 0.3]].map(([x, z, r]) => { const e = emu(); e.position.set(x, 0, z); e.rotation.y = r; stage.add(e); return e; }); }
  if (sp.held === 'minigun') { const mg = minigun(); mg.position.set(0.15, 1.35, 0.8); R.add(mg); L.rotation.set(-1.15, 0, 0.45); Rt.rotation.set(-1.1, 0, -0.5); ACT.extra.mg = mg;
    mesh(new THREE.BoxGeometry(0.7, 0.8, 0.4), M('#ff8a1e'), R, 0, 1.6, -0.62); }
  if (sp.held === 'sniper') { const sn = sniper(); sn.position.set(0.28, 1.95, 0.5); R.add(sn); Rt.rotation.set(-1.45, 0, -0.2); L.rotation.set(-1.55, 0, 0.75); }
  if (sp.held === 'smoke') { const sb = smokeBomb(); attach(Rt, sb, 0.04, -1.0, 0.1); Rt.rotation.set(-2.6, 0, -0.3);
    ACT.extra.puffs = Array.from({ length: 14 }, (_, i) => ({ s: glow(i % 2 ? '#b07cff' : '#8a4dff', 1, stage, 0, 0, 0, 0.5), a: i * 0.45, r: 0.6 + (i % 4) * 0.35, ph: i * 0.7 })); }
  if (sp.held === 'hammers') { [[-1, '#ff8a1e', L], [1, '#2a7dd6', Rt]].forEach(([sd, c, arm]) => { const hm = sledgehammer(c); hm.position.set(0.62 * sd, 0.72, 0.62); hm.rotation.set(0.15, 0, -0.55 * sd); R.add(hm); arm.rotation.set(-0.7, 0, -0.35 * sd); }); }
  if (sp.costume === 'mod') ACT.extra.stink = Array.from({ length: 10 }, (_, i) => ({ s: glow('#9acd32', 0.7, stage, 0, 0, 0, 0.45), a: i * 0.63, ph: i }));
  if (T.wave && T.wave[1] === 'Snack Duty') { const s = snackCrate(); s.position.set(-1.5, 0, -0.2); s.rotation.y = 0.5; stage.add(s); }
  if (notYet) { const pad = mesh(new THREE.RingGeometry(0.75, 0.9, 48), new THREE.MeshBasicMaterial({ color: '#7ff3ff', transparent: true, opacity: 0.8, side: THREE.DoubleSide }), stage, 0, 0.03, 0); pad.rotation.x = -Math.PI / 2; ACT.extra.pad = pad; }
}

// ================================================================= UI
const $ = (id) => document.getElementById(id);
const fmt = (n) => '#' + String(n).padStart(4, '0');
function gearText(T) { if (T.special && T.special.fallen) return 'Only his red cap was left on the road 🧢'; const job = T.job[0]; const main = { 'Distraction': 'Trumpet + boombox', 'Scout': 'Binoculars + night vision', 'Getaway Driver': 'Keys to the ' + (T.ride ? T.ride[1].toLowerCase() : 'van'),
  'Hangar Hacker': 'Laptop + antenna pack', 'Alien Whisperer': 'Tinfoil antenna + an alien buddy', 'Area 51 Insider': 'Shades + a briefcase (ACCESS: ALL)' }[job];
  const sp = T.special || {}; if (['minigun', 'sniper', 'smoke', 'hammers'].includes(sp.held) || ['knight', 'boxer', 'medic'].includes(sp.costume) || sp.mount) return 'Job kit packed in the backpack (' + main.toLowerCase() + ')';
  return main + (T.sec && job !== 'Area 51 Insider' ? ' · ' + T.sec[1] : ''); }
function showCard(T) {
  const J = T.job, c = $('card'); c.classList.toggle('notyet', !T.pos);
  $('cid').innerHTML = T.pos ? `RAIDER <b>${fmt(T.pos)}</b>` : 'NOT IN THE RAID YET';
  $('wave').textContent = T.wave ? `${T.wave[2]} ${T.wave[1].toUpperCase()}` : '⏳ NO WAVE'; $('wave').className = 'pill ' + (T.wave ? T.wave[1].replace(/\s/g, '') : 'none');
  $('handle').textContent = '@' + T.h;
  $('job').innerHTML = `${J[1]} ${J[0].toUpperCase()}` + (J[0] === 'Alien Whisperer' ? ' <span class="rare">RARE · 7%</span>' : J[0] === 'Area 51 Insider' ? ' <span class="legend">LEGENDARY · 1%</span>' : J[0] === 'Sacrificer' ? ' <span class="legend">FALLEN HERO · 1 OF 1</span>' : '');
  $('mission').textContent = 'Mission: ' + J[3];
  $('gear').textContent = '🎒 ' + gearText(T);
  $('req').textContent = T.special ? '⭐ Your request: ' + T.special.label : ''; $('req').hidden = !T.special || !!T.special.fallen;
  $('wait').textContent = `Your gear is packed. Follow @${ACCOUNT} to join the raid.`;
  c.hidden = false; $('actions').hidden = false; $('follow').hidden = !!T.pos; $('save').hidden = !T.pos;
}
async function find(raw) { const h = cleanHandle(raw); if (!h) return; $('who').value = h; history.replaceState(null, '', '?u=' + encodeURIComponent(h));
  const T = traits(h, await raiderPos(h)); buildStage(T); showCard(T); }
$('form').addEventListener('submit', (e) => { e.preventDefault(); find($('who').value); });
$('follow').href = IG_URL;

async function storyCard() {
  const T = ACT.T, out = document.createElement('canvas'); out.width = 1080; out.height = 1920; const g = out.getContext('2d');
  const prevPR = renderer.getPixelRatio(), prevSize = renderer.getSize(new THREE.Vector2());
  renderer.setPixelRatio(1); renderer.setSize(1080, 1350, false); cam.aspect = 1080 / 1350; cam.updateProjectionMatrix(); renderer.render(world, cam);
  g.fillStyle = '#2a1610'; g.fillRect(0, 0, 1080, 1920); g.drawImage(glc, 0, 0, 1080, 1350); renderer.setPixelRatio(prevPR); renderer.setSize(prevSize.x, prevSize.y, false); resize();
  const F = (px) => `${px}px ${FONT}`;
  g.fillStyle = '#c0392b'; g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.roundRect(170, 120, 740, 190, 24); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = F(92); g.fillText('STORM AREA 51', 540, 225); g.font = F(42); g.fillText('RAIDER ID', 540, 285);
  g.fillStyle = '#FFFDF7'; g.strokeStyle = '#3A2412'; g.lineWidth = 10; g.beginPath(); g.roundRect(60, 1250, 960, 560, 44); g.fill(); g.stroke();
  g.textAlign = 'left'; g.fillStyle = '#3A2412'; g.font = F(70); g.fillText('RAIDER', 110, 1355); g.fillStyle = '#E0A800'; g.fillText(fmt(T.pos), 410, 1355);
  g.fillStyle = '#c0392b'; g.font = F(56); g.fillText('@' + T.h, 110, 1440);
  g.fillStyle = '#3A2412'; g.font = F(50); g.fillText(`${T.job[1]}  ${T.job[0].toUpperCase()}`, 110, 1530);
  g.fillStyle = '#7A6656'; g.font = 'italic ' + F(36); g.fillText('Mission: ' + T.job[3], 110, 1595);
  g.fillStyle = '#3A2412'; g.font = F(36); const gt = '🎒 ' + gearText(T); g.fillText(gt.length > 44 ? gt.slice(0, 43) + '…' : gt, 110, 1665);
  g.fillStyle = '#5a4a3a'; g.font = F(40); g.fillText(`${T.wave[2]} ${T.wave[1]}`, 110, 1745);
  g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = F(42); g.fillText(`@${ACCOUNT} · find your raider`, 540, 1880);
  if (window.__previewCard) return out.toDataURL('image/jpeg', 0.85);
  const blob = await new Promise(r => out.toBlob(r, 'image/png')); const file = new File([blob], `raider-id-${T.h}.png`, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'My Raider ID' }); return; } catch (e) { } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
}
$('save').addEventListener('click', storyCard); window.storyCard = storyCard;

// ================================================================= loop
let lastW = 0, lastH = 0;
function resize() { const w = glc.clientWidth, h = glc.clientHeight; if (!w || !h) return; lastW = w; lastH = h; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
if (window.ResizeObserver) new ResizeObserver(() => resize()).observe(glc); addEventListener('resize', resize); resize();
const t0 = performance.now();
function frame() {
  if (glc.clientWidth !== lastW || glc.clientHeight !== lastH) resize();
  const t = (performance.now() - t0) / 1000, a = Math.sin(t * 0.22) * 0.32;
  const big = ACT && ACT.extra.big, hasRide = ACT && (ACT.extra.ride || ACT.extra.mount || ACT.extra.emus);
  const dist = big ? 13 : hasRide ? 9.4 : 6.6; cam.position.set((hasRide ? 1.0 : 0.3) + Math.sin(a) * dist, big ? 3.8 : hasRide ? 2.6 : 2.3, 1.0 + Math.cos(a) * dist); cam.lookAt(hasRide ? 0.9 : 0.1, big ? 2.7 : hasRide ? 1.75 : 1.55, -0.6);
  if (ACT) { const R = ACT.R, U = R.userData; R.position.y = (ACT.extra.baseY || 0) + Math.abs(Math.sin(t * 2)) * 0.03; U.body.scale.y = 1 + Math.sin(t * 2) * 0.01;
    if (ACT.job === 'Distraction') { U.head.rotation.x = Math.sin(t * 6) * 0.08; R.rotation.y = Math.sin(t * 3) * 0.12; if (ACT.extra.bb) ACT.extra.bb.scale.setScalar(1 + Math.max(0, Math.sin(t * 12)) * 0.04); }
    if (ACT.extra.scan) U.head.rotation.y = Math.sin(t * 0.8) * 0.5;
    if (ACT.extra.tip) ACT.extra.tip.material.color.set(Math.sin(t * 6) > 0 ? '#ff3b30' : '#5a1010');
    if (ACT.extra.keys) ACT.extra.keys.rotation.z = t * 9;
    if (ACT.extra.alien) { ACT.extra.alien.position.y = 0.08 + Math.sin(t * 2.5) * 0.08; ACT.extra.alien.rotation.y = -0.4 + Math.sin(t) * 0.2; }
    if (ACT.extra.amulet) ACT.extra.amulet.rotation.y = t * 2;
    if (ACT.extra.mg) ACT.extra.mg.userData.barrels.rotation.z = t * 25;
    if (ACT.extra.turret) ACT.extra.turret.rotation.y = Math.sin(t * 0.6) * 0.35;
    if (ACT.extra.mount) ACT.extra.mount.position.y = Math.abs(Math.sin(t * 1.5)) * 0.08;
    if (ACT.extra.emus) ACT.extra.emus.forEach((e, i) => { e.userData.neck.rotation.x = 0.25 + Math.sin(t * 4 + i) * 0.25; e.position.y = Math.abs(Math.sin(t * 3 + i)) * 0.05; });
    if (ACT.extra.puffs) ACT.extra.puffs.forEach(p => { const k = ((t * 0.35 + p.ph) % 1); p.s.position.set(Math.cos(p.a + t * 0.3) * p.r * (1 + k), 0.3 + k * 2.6, Math.sin(p.a + t * 0.3) * p.r * (1 + k) + 0.2); p.s.scale.setScalar(0.8 + k * 2.2); p.s.material.opacity = 0.55 * (1 - k); });
    if (ACT.extra.stink) ACT.extra.stink.forEach(p => { const k = ((t * 0.4 + p.ph * 0.1) % 1); p.s.position.set(Math.cos(p.a + t) * 0.9, 1.0 + k * 2.4, Math.sin(p.a + t) * 0.9); p.s.material.opacity = 0.5 * (1 - k); });
    if (ACT.extra.embers) ACT.extra.embers.forEach(e => { const k = (t * 0.28 + e.ph) % 1; e.b.position.set(0.1 + Math.cos(e.a + t * 0.4) * e.r * (1 + k), 0.35 + k * 3.0, 0.35 + Math.sin(e.a + t * 0.4) * e.r * (1 + k)); e.b.rotation.set(t * 2 + e.a, t * 3, 0); e.b.material.opacity = 0.9 * (1 - k); });
    if (ACT.extra.insider) { U.arms[1].rotation.x = -2.2 + Math.sin(t * 1.5) * 0.08; }
    if (ACT.extra.pad) { ACT.extra.pad.material.opacity = 0.5 + 0.35 * Math.sin(t * 3); HOLO.opacity = 0.28 + 0.12 * Math.sin(t * 3); } }
  DUST.forEach(d => d.s.position.set(d.x + Math.sin(t * 0.3 + d.ph) * 1.5, d.y + Math.sin(t * 0.7 + d.ph) * 0.3, d.z));
  renderer.render(world, cam); requestAnimationFrame(frame);
}
frame();
// start screen: a hologram raider, so the page is never empty
const DEMO_HOLO = new THREE.MeshBasicMaterial({ color: '#7fe8ff', transparent: true, opacity: 0.42, depthWrite: false, toneMapped: false });
function demoStage() { const T = traits('your_name', null); buildStage(T); stage.traverse(o => { if (o.isMesh && o !== ACT.extra.pad) { o.material = DEMO_HOLO; o.castShadow = false; } }); ACT.extra.tip = null;   // nothing may recolour the shared hologram
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex('THIS COULD BE YOU', { bg: '#14285a', fg: '#d9fbff', w: 640, h: 110 }), transparent: true, depthTest: false }));
  tag.scale.set(2.6, 0.45, 1); tag.position.set(0, 3.45, 0); stage.add(tag); }
if (QS.get('u')) find(QS.get('u')); else demoStage();
window.ready = true;
