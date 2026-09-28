const stage = document.querySelector('[data-house-scene]');
const canvas = stage?.querySelector('[data-house-canvas]');
if (!stage || !canvas) throw new Error('Construction scene mount point was not found.');

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js';

function makeTexture(THREE, kind, seed = 91) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  let state = seed >>> 0;
  const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  if (kind === 'brick') {
    ctx.fillStyle = '#ddd8ce'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1500; i++) {
      const dark = rand() > .54;
      ctx.fillStyle = dark ? `rgba(92,65,49,${rand() * .13})` : `rgba(255,242,222,${rand() * .18})`;
      ctx.fillRect(rand() * 512, rand() * 512, 1 + rand() * 12, 1 + rand() * 5);
    }
    for (let i = 0; i < 70; i++) {
      const y = rand() * 512;
      ctx.strokeStyle = `rgba(80,54,41,${rand() * .10})`; ctx.lineWidth = .5 + rand() * 1.5;
      ctx.beginPath(); ctx.moveTo(rand() * 512, y); ctx.lineTo(rand() * 512 + 35, y + rand() * 3); ctx.stroke();
    }
  } else if (kind === 'concrete') {
    ctx.fillStyle = '#a9a8a0'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 2600; i++) {
      const v = Math.floor(100 + rand() * 100);
      ctx.fillStyle = `rgba(${v},${v},${v - 3},${rand() * .14})`;
      ctx.fillRect(rand() * 512, rand() * 512, 1 + rand() * 5, 1 + rand() * 4);
    }
    for (let i = 0; i < 45; i++) {
      ctx.strokeStyle = `rgba(69,68,63,${rand() * .08})`; ctx.lineWidth = 1 + rand() * 3;
      ctx.beginPath(); ctx.moveTo(rand() * 512, rand() * 512); ctx.lineTo(rand() * 512, rand() * 512); ctx.stroke();
    }
  } else if (kind === 'wood') {
    ctx.fillStyle = '#795a3a'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 170; i++) {
      const y = rand() * 512;
      ctx.strokeStyle = `rgba(${rand() > .5 ? 218 : 30},${rand() > .5 ? 175 : 37},${rand() > .5 ? 119 : 27},${rand() * .13})`;
      ctx.lineWidth = .5 + rand() * 2; ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) ctx.lineTo(x, y + Math.sin(x * .035 + i) * (1 + rand() * 3)); ctx.stroke();
    }
  } else if (kind === 'ground') {
    ctx.fillStyle = '#827968'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = `rgba(${rand() > .5 ? 211 : 33},${rand() > .5 ? 194 : 42},${rand() > .5 ? 158 : 35},${rand() * .15})`;
      ctx.fillRect(rand() * 512, rand() * 512, 1 + rand() * 7, 1 + rand() * 3);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function startScene(THREE) {
  const compactDevice = window.matchMedia('(max-width: 700px)').matches || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !compactDevice, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactDevice ? 1.2 : 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3.9, 3.9, 3.9, -3.9, .1, 50);
  camera.position.set(7.8, 6.2, 11.5);
  camera.lookAt(0, 2.1, 0);

  const hemi = new THREE.HemisphereLight(0xe7f1ff, 0x786048, 2.15);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe4bd, 3.1);
  sun.position.set(-4.5, 8.5, 6.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(compactDevice ? 512 : 1024, compactDevice ? 512 : 1024);
  sun.shadow.camera.left = -6; sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -4;
  sun.shadow.bias = -.00025;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd5e4ff, 1.15);
  fill.position.set(5, 4, -4); scene.add(fill);

  const brickTexture = makeTexture(THREE, 'brick', 101);
  const concreteTexture = makeTexture(THREE, 'concrete', 202);
  const groundTexture = makeTexture(THREE, 'ground', 303);
  const woodTexture = makeTexture(THREE, 'wood', 404);
  brickTexture.repeat.set(1.2, 1.2);
  concreteTexture.repeat.set(1.1, 1.1);
  groundTexture.repeat.set(5, 5);
  const brickMats = ['#b56e4d', '#a96143', '#bd7957', '#a9674b', '#c07b58'].map((color, i) => new THREE.MeshStandardMaterial({
    color, map: brickTexture, roughness: .91, metalness: 0, bumpMap: concreteTexture, bumpScale: .018
  }));
  const mortar = new THREE.MeshStandardMaterial({ color: '#c7b9a4', map: concreteTexture, roughness: .98, bumpMap: concreteTexture, bumpScale: .07 });
  const concrete = new THREE.MeshStandardMaterial({ color: '#c0bdb3', map: concreteTexture, roughness: .9, bumpMap: concreteTexture, bumpScale: .055 });
  const darkConcrete = new THREE.MeshStandardMaterial({ color: '#77786f', map: concreteTexture, roughness: .93, bumpMap: concreteTexture, bumpScale: .04 });
  const steel = new THREE.MeshStandardMaterial({ color: '#65716d', metalness: .72, roughness: .38 });
  const timber = new THREE.MeshStandardMaterial({ color: '#d0b38c', roughness: .82, map: woodTexture, bumpMap: woodTexture, bumpScale: .018 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#9cc4d7', roughness: .13, metalness: .15, transmission: .15, transparent: true, opacity: .63 });

  const mat = (color, roughness = .75, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const m = {
    navy: mat('#183344', .86), navyDark: mat('#102633', .88), vest: mat('#eb8d21', .68), hiVis: mat('#f7cc37', .62),
    helmet: mat('#f3c533', .48), skin: mat('#bd805f', .85), glove: mat('#4b514d', .82), boot: mat('#323b3c', .9),
    black: mat('#252b2b', .7), white: mat('#e7e4d8', .7), glass, steel, timber, concrete, brick: brickMats[1]
  };

  function box(parent, size, position, material, opts = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.castShadow = opts.cast ?? true;
    mesh.receiveShadow = opts.receive ?? true;
    parent.add(mesh); return mesh;
  }
  function cylinder(parent, rTop, rBottom, height, position, material, sides = 12) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, height, sides), material);
    mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function beamBetween(parent, a, b, radius, material, sides = 8) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), delta = vb.clone().sub(va);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), sides), material);
    mesh.position.copy(va.add(vb).multiplyScalar(.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function sphere(parent, radius, position, material, segments = 12) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, Math.max(8, segments - 2)), material);
    mesh.position.set(...position); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), new THREE.MeshStandardMaterial({ map: groundTexture, roughness: 1, color: '#bbb09b' }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.035; ground.receiveShadow = true; scene.add(ground);
  // Foundation, damp course and an exposed concrete edge.
  box(scene, [4.42, .2, 1.05], [0, .1, -.12], darkConcrete);
  box(scene, [4.3, .11, .91], [0, .255, -.08], concrete);
  box(scene, [4.2, .055, .04], [0, .337, .42], mortar, { cast: false });

  // Masonry walls with proper openings left clear for a glazed window and unfinished doorway.
  const wallW = 4.05, wallFront = .38, rowH = .235, brickL = .47, brickH = .205, brickD = .28;
  const wallHeight = 3.9, wallBottom = .35;
  const placedTopBricks = [];
  const rowCount = Math.floor(wallHeight / rowH);
  for (let row = 0; row < rowCount; row++) {
    const cy = wallBottom + row * rowH + brickH / 2;
    const offset = row % 2 ? -brickL / 2 : 0;
    for (let x = -wallW / 2 + brickL / 2 + offset; x <= wallW / 2 - brickL / 2 + .001; x += brickL) {
      const door = Math.abs(x - .45) < .66 && cy < 2.38;
      const window = Math.abs(x + 1.15) < .58 && cy > 2.04 && cy < 3.32;
      if (door || window) continue;
      const material = brickMats[Math.floor(Math.abs(x * 13 + row * 7)) % brickMats.length];
      const mesh = box(scene, [brickL - .025, brickH, brickD], [x, cy, wallFront], material);
      mesh.rotation.y = (row % 2 ? .012 : -.008);
    }
  }
  // New top course appears brick-by-brick while the mason works.
  for (let i = 0; i < 6; i++) {
    const x = 1.82 - i * .46;
    const b = box(scene, [.455, brickH, brickD], [x, 4.12, wallFront], brickMats[(i + 2) % brickMats.length]);
    b.visible = false; b.userData.placeIndex = i; b.userData.target = b.position.clone(); placedTopBricks.push(b);
  }

  // Concrete lintels, piers, sills and a partly cast roof edge.
  box(scene, [.98, .15, .36], [-1.15, 3.35, .39], concrete);
  box(scene, [1.08, .12, .36], [-1.15, 2.0, .39], concrete);
  box(scene, [1.4, .18, .4], [.45, 2.42, .39], concrete);
  box(scene, [.18, 1.85, .37], [-.22, 1.3, .39], concrete);
  box(scene, [.18, 1.85, .37], [1.13, 1.3, .39], concrete);
  // Window frame and reflective panes sit just inside the rough brick opening.
  for (const x of [-1.66, -.64]) box(scene, [.085, 1.24, .09], [x, 2.68, .23], darkConcrete);
  for (const y of [2.06, 3.30]) box(scene, [1.1, .085, .09], [-1.15, y, .23], concrete);
  box(scene, [.43, 1.08, .025], [-1.39, 2.68, .1], glass, { cast: false });
  box(scene, [.43, 1.08, .025], [-.91, 2.68, .1], glass, { cast: false });
  box(scene, [.035, 1.08, .04], [-1.15, 2.68, .17], steel);
  box(scene, [.9, .035, .04], [-1.15, 2.68, .17], steel);
  // Door jamb and a temporary wood form frame.
  for (const x of [-.24, 1.14]) box(scene, [.08, 2.03, .10], [x, 1.32, .25], timber);
  box(scene, [1.45, .10, .12], [.45, 2.36, .25], timber);
  box(scene, [.04, 1.84, .04], [.45, 1.31, .12], steel);
  box(scene, [1.15, .045, .04], [.45, 1.28, .12], steel);

  // Cast edge beams and open rebar cage at the unfinished level.
  box(scene, [4.28, .18, .5], [0, 4.02, -.02], concrete);
  box(scene, [1.85, .18, .48], [-1.2, 4.18, -.02], concrete);
  for (const x of [-1.92, -.28, 1.36, 1.92]) {
    for (const z of [-.23, .38]) cylinder(scene, .028, .028, .72, [x, 4.48, z], steel, 8);
  }
  for (let z = -.23; z <= .39; z += .31) beamBetween(scene, [-1.98, 4.8, z], [1.98, 4.8, z], .018, steel, 8);

  // Scaffold frames, diagonal braces, boards and access ladder.
  for (const x of [-2.34, 2.32]) {
    for (const z of [-.24, .68]) cylinder(scene, .035, .04, 4.45, [x, 2.2, z], steel, 10);
    for (const y of [.65, 2.15, 3.65, 4.15]) beamBetween(scene, [x, y, -.24], [x, y, .68], .026, steel, 8);
    beamBetween(scene, [x, .42, .68], [x, 2.1, -.24], .025, steel, 8);
  }
  for (const y of [.75, 2.25, 3.75]) beamBetween(scene, [-2.34, y, .68], [2.32, y, .68], .035, timber, 8);
  for (let i = 0; i < 7; i++) {
    const y = .43 + i * .34;
    beamBetween(scene, [2.55, y, .95], [2.55, y, 1.42], .018, steel, 8);
  }
  beamBetween(scene, [2.55, .4, .95], [2.55, 2.65, .95], .028, steel, 8);
  beamBetween(scene, [2.55, .4, 1.42], [2.55, 2.65, 1.42], .028, steel, 8);

  // A broad working deck gives the mason safe access to the unfinished upper course.
  box(scene, [5.45, .12, .92], [0, 2.18, 1.08], timber);

  // Brick pallet and a pair of practical site props.
  const pallet = new THREE.Group(); scene.add(pallet); pallet.position.set(2.62, 2.31, .93);
  for (let i = 0; i < 3; i++) box(pallet, [.82, .055, .18], [0, .06, -.24 + i * .24], timber);
  for (const z of [-.22, .22]) box(pallet, [.78, .08, .1], [0, -.015, z], timber);
  for (let row = 0; row < 2; row++) for (let i = 0; i < 3; i++) {
    const b = box(pallet, [.4, .18, .28], [-.2 + i * .2, .18 + row * .19, row ? -.09 : .09], brickMats[(i + row) % brickMats.length]);
    b.rotation.y = row ? .04 : -.03;
  }
  const bucket = new THREE.Group(); scene.add(bucket); bucket.position.set(-2.75, .42, 1.0);
  cylinder(bucket, .2, .15, .38, [0, 0, 0], mat('#626d6d', .62, .12), 20);
  cylinder(bucket, .2, .2, .045, [0, .2, 0], steel, 20);
  beamBetween(bucket, [-.16, .22, 0], [.16, .22, 0], .012, steel, 8);

  // Worker: layered PPE and articulated limbs, with an identifiable MAK site vest.
  const worker = new THREE.Group(); scene.add(worker);
  worker.position.set(2.12, 2.22, 1.42);
  worker.rotation.y = Math.PI + .28; // turned toward the wall, slightly toward the viewer
  const body = new THREE.Group(); worker.add(body);
  // Boots, trousers, pelvis and torso.
  box(body, [.32, .15, .43], [-.17, .09, .09], m.boot);
  box(body, [.32, .15, .43], [.18, .09, .09], m.boot);
  const legL = new THREE.Group(); legL.position.set(-.14, .84, 0); body.add(legL);
  const legR = new THREE.Group(); legR.position.set(.14, .84, 0); body.add(legR);
  function limbSegment(parent, length, radiusTop, radiusBottom, material, y = -0.02) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 10), material);
    s.position.y = y - length / 2; s.castShadow = true; s.receiveShadow = true; parent.add(s); return s;
  }
  limbSegment(legL, .57, .105, .13, m.navy, -.02);
  limbSegment(legR, .57, .105, .13, m.navy, -.02);
  sphere(legL, .105, [0, -.59, 0], m.navy, 10);
  sphere(legR, .105, [0, -.59, 0], m.navy, 10);
  box(body, [.47, .22, .3], [0, .77, 0], m.navyDark);
  box(body, [.53, .64, .34], [0, 1.22, 0], m.vest);
  box(body, [.57, .1, .37], [0, 1.48, .005], m.hiVis);
  box(body, [.55, .1, .37], [0, 1.03, .005], m.hiVis);
  box(body, [.075, .68, .36], [-.2, 1.22, .008], m.navy);
  box(body, [.075, .68, .36], [.2, 1.22, .008], m.navy);
  box(body, [.31, .14, .018], [0, 1.23, -.176], m.navyDark);
  // Tiny badge on the back panel.
  const markCanvas = document.createElement('canvas'); markCanvas.width = 256; markCanvas.height = 96;
  const markCtx = markCanvas.getContext('2d'); markCtx.fillStyle = '#f5f2e9'; markCtx.fillRect(0, 0, 256, 96);
  markCtx.fillStyle = '#17643d'; markCtx.font = 'bold 58px Arial'; markCtx.textAlign = 'center'; markCtx.fillText('MAK', 128, 66);
  const markTexture = new THREE.CanvasTexture(markCanvas); markTexture.colorSpace = THREE.SRGBColorSpace;
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(.3, .11), new THREE.MeshBasicMaterial({ map: markTexture, side: THREE.DoubleSide }));
  mark.position.set(0, 1.25, -.202); body.add(mark);
  // Neck, head and hardhat.
  cylinder(body, .095, .105, .16, [0, 1.65, 0], m.skin, 12);
  sphere(body, .19, [0, 1.85, 0], m.skin, 16);
  const hardhat = new THREE.Mesh(new THREE.SphereGeometry(.235, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), m.helmet);
  hardhat.position.set(0, 1.99, 0); hardhat.castShadow = true; body.add(hardhat);
  cylinder(body, .255, .255, .045, [0, 1.99, 0], m.helmet, 16);
  box(body, [.025, .06, .025], [0, 1.77, .18], m.skin);

  function makeArm(side) {
    const shoulder = new THREE.Group(); shoulder.position.set(side * .29, 1.49, 0); body.add(shoulder);
    sphere(shoulder, .12, [0, 0, 0], m.vest, 10);
    limbSegment(shoulder, .39, .085, .1, m.navy, .015);
    const elbow = new THREE.Group(); elbow.position.set(0, -.37, 0); shoulder.add(elbow);
    sphere(elbow, .085, [0, 0, 0], m.vest, 10);
    limbSegment(elbow, .34, .065, .075, m.vest, -.01);
    box(elbow, [.16, .045, .09], [0, -.28, .01], m.hiVis);
    sphere(elbow, .09, [0, -.39, .03], m.glove, 10);
    return { shoulder, elbow };
  }
  const leftArm = makeArm(-1), rightArm = makeArm(1);
  // The carried brick is held in front of the torso in the worker's hands.
  const carried = box(body, [.48, .19, .27], [.05, 1.1, .42], brickMats[2]);
  carried.castShadow = true;

  // Slowly reveal bricks in the new course; movement repeats and keeps the scene alive.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = true, lastTime = 0, elapsed = 0, placed = 0;
  const cycleSeconds = 7.2;
  const resize = () => {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    const frustumH = 6.65;
    camera.left = -frustumH * (w / h) / 2; camera.right = frustumH * (w / h) / 2;
    camera.top = frustumH / 2; camera.bottom = -frustumH / 2;
    camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
  };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage); resize();
  const visibility = new IntersectionObserver(entries => { active = entries[0]?.isIntersecting ?? true; });
  visibility.observe(stage);
  const animate = (now) => {
    requestAnimationFrame(animate);
    if (document.hidden || !active) return;
    if (now - lastTime < 30) return;
    const dt = Math.min(.05, (now - (lastTime || now)) / 1000); lastTime = now;
    if (!reducedMotion) elapsed += dt;
    const t = reducedMotion ? 0 : elapsed % cycleSeconds;
    const phase = t / cycleSeconds;
    const walkingIn = phase < .31;
    const reaching = phase >= .31 && phase < .58;
    const walkingOut = phase >= .66;
    const buildIndex = Math.min(Math.floor(elapsed / cycleSeconds), placedTopBricks.length - 1);
    const buildX = 1.36 - buildIndex * .46;
    const x = phase < .31 ? THREE.MathUtils.lerp(2.12, buildX, phase / .31)
      : phase < .66 ? buildX
      : THREE.MathUtils.lerp(buildX, 2.12, (phase - .66) / .34);
    worker.position.x = x;
    const walk = walkingIn || walkingOut;
    body.position.y = walk ? Math.abs(Math.sin(t * 5.3)) * .045 : (reaching ? .12 : 0);
    legL.rotation.x = walk ? Math.sin(t * 5.3) * .38 : (reaching ? -.08 : 0);
    legR.rotation.x = walk ? -Math.sin(t * 5.3) * .38 : (reaching ? .08 : 0);
    leftArm.shoulder.rotation.x = reaching ? -1.78 : (walk ? Math.sin(t * 5.3) * .28 : -.28);
    rightArm.shoulder.rotation.x = reaching ? -1.82 : (walk ? -Math.sin(t * 5.3) * .28 : -.3);
    leftArm.elbow.rotation.x = reaching ? -.12 : -.14;
    rightArm.elbow.rotation.x = reaching ? -.12 : -.12;
    carried.visible = phase < .58 || phase > .83;
    // At each completed placing motion, reveal one brick in the upper course.
    const cycleCount = Math.floor(elapsed / cycleSeconds);
    const coursePhase = (elapsed % cycleSeconds) / cycleSeconds;
    const nextBrick = placedTopBricks[placed];
    if (nextBrick && placed === cycleCount && coursePhase >= .49 && coursePhase < .58) {
      nextBrick.visible = true;
      const start = new THREE.Vector3(worker.position.x - .05, 3.32, .98);
      const target = nextBrick.userData.target;
      const lift = THREE.MathUtils.clamp((coursePhase - .49) / .09, 0, 1);
      const eased = lift * lift * (3 - 2 * lift);
      nextBrick.position.lerpVectors(start, target, eased);
    }
    const placementCount = Math.min(placedTopBricks.length, cycleCount + (coursePhase >= .58 ? 1 : 0));
    if (placementCount > placed) {
      for (let i = placed; i < placementCount; i++) {
        placedTopBricks[i].visible = true;
        placedTopBricks[i].position.copy(placedTopBricks[i].userData.target);
      }
      placed = placementCount;
    }
    renderer.render(scene, camera);
  };
  requestAnimationFrame(animate);
  window.addEventListener('resize', resize, { passive: true });
  return () => { visibility.disconnect(); resizeObserver.disconnect(); renderer.dispose(); };
}

function renderSceneFallback() {
  stage.classList.add('scene-unavailable');
  const art = document.createElement('div');
  art.className = 'scene-fallback-art';
  art.setAttribute('aria-hidden', 'true');
  art.innerHTML = `
    <div class="scene-fallback-sky"></div>
    <div class="scene-fallback-ground"></div>
    <div class="scene-fallback-scaffold scaffold-left"></div>
    <div class="scene-fallback-scaffold scaffold-right"></div>
    <div class="scene-fallback-wall"><span></span><span></span><span></span><span></span><span></span><span></span></div>
    <div class="scene-fallback-plank"></div>
    <div class="scene-fallback-worker"><i class="worker-helmet"></i><i class="worker-head"></i><i class="worker-body"></i><i class="worker-arm"></i><i class="worker-leg"></i><i class="worker-brick"></i></div>
    <div class="scene-fallback-bucket"></div>`;
  stage.append(art);
}

// Keep the 3D renderer off narrow mobile screens, where WebGL has been unreliable.
// The desktop and laptop scene remains unchanged.
if (!window.matchMedia('(max-width: 700px)').matches) {
  import(THREE_URL).then(startScene).catch((error) => {
    console.warn('3D scene unavailable; showing the lightweight construction animation.', error);
    renderSceneFallback();
  });
}












