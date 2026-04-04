import * as THREE from 'three';
import { profile } from '../data/profile.js';
import { createVaultIdHex, formatVaultEyebrow, scrambleHex, scrambleText } from './vault-id.mjs';

function getCurrentYear() {
  return new Date().getFullYear();
}

function calculateYearsActive(startYear) {
  const currentYear = getCurrentYear();
  return Math.max(currentYear - startYear, 1);
}

function getRuntimeProfile(sourceProfile) {
  const yearsActive = `${calculateYearsActive(2022)}+`;
  const runtimeProfile = structuredClone(sourceProfile);
  const vaultHex = createVaultIdHex();

  runtimeProfile.identity.vaultHex = vaultHex;
  runtimeProfile.identity.eyebrow = formatVaultEyebrow(vaultHex);
  runtimeProfile.stats = asArray(runtimeProfile.stats).map((stat) => {
    const statData = asObject(stat);

    if (statData.dynamic === 'yearsActive') {
      return { ...statData, value: yearsActive };
    }

    return statData;
  });

  runtimeProfile.experience = asArray(runtimeProfile.experience).map((entry) => {
    const entryData = asObject(entry);
    const startYear = Number(entryData.startYear);
    const resolvedEndYear = entryData.endYear == null ? getCurrentYear() : Number(entryData.endYear);

    if (!Number.isFinite(startYear)) {
      return entryData;
    }

    const totalYears = Math.max(resolvedEndYear - startYear, 1);

    return {
      ...entryData,
      duration: `${totalYears} yr${totalYears === 1 ? '' : 's'}`
    };
  });

  return runtimeProfile;
}

function getValueByPath(source, path) {
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
  return normalizedPath.split('.').reduce((value, segment) => {
    if (value == null || segment === '') {
      return undefined;
    }

    return value[segment];
  }, source);
}

function formatSplitName(name) {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return { lead: String(name ?? ''), accent: '' };
  }

  return {
    lead: `${parts.slice(0, -1).join(' ')}`,
    accent: parts[parts.length - 1]
  };
}

function formatTitleWithPrefix(title) {
  const parts = String(title ?? '').trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return { lead: String(title ?? ''), accent: '' };
  }

  return {
    lead: parts.slice(0, -1).join(' '),
    accent: parts[parts.length - 1]
  };
}

function replaceWithStrongAccent(element, parts) {
  const lead = String(parts?.lead ?? '');
  const accent = String(parts?.accent ?? '');

  element.replaceChildren();
  element.append(document.createTextNode(lead));

  if (!accent) {
    return;
  }

  const strong = document.createElement('strong');
  strong.textContent = accent;

  if (lead) {
    element.append(document.createTextNode(' '));
  }

  element.append(strong);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function hasMeaningfulHref(value) {
  const href = String(value ?? '').trim();

  return href !== '' && href !== '#';
}

function applyValueToElement(element, value) {
  if (value == null) {
    return;
  }

  const display = element.dataset.display;
  const prefix = element.dataset.prefix ?? '';
  const attribute = element.dataset.attr;
  const renderedValue = `${prefix}${value}`;

  if (attribute) {
    element.setAttribute(attribute, renderedValue);
  }

  if (display === 'split-name') {
    replaceWithStrongAccent(element, formatSplitName(value));
    return;
  }

  if (display === 'title-with-prefix') {
    replaceWithStrongAccent(element, formatTitleWithPrefix(value));
    return;
  }

  element.textContent = renderedValue;
}

function bindDataFields(root, data) {
  root.querySelectorAll('[data-field]').forEach((element) => {
    const value = getValueByPath(data, element.dataset.field);
    applyValueToElement(element, value);
  });
}

function cloneTemplate(templateId) {
  const template = document.getElementById(templateId);

  if (!(template instanceof HTMLTemplateElement)) {
    return null;
  }

  return template.content.firstElementChild?.cloneNode(true) ?? null;
}

function renderAboutParagraphs() {
  const container = document.querySelector('[data-render-target="about.paragraphs"]');

  if (!container) {
    return;
  }

  const templateId = container.dataset.template;
  container.replaceChildren();

  const paragraphs = asArray(runtimeProfile?.about?.paragraphs);
  paragraphs.forEach((paragraph) => {
    const item = cloneTemplate(templateId);

    if (!item) {
      return;
    }

    item.textContent = String(paragraph ?? '');
    container.append(item);
  });
}

function renderStats() {
  const container = document.querySelector('[data-render-target="stats"]');

  if (!container) {
    return;
  }

  const templateId = container.dataset.template;
  container.replaceChildren();

  const stats = asArray(runtimeProfile?.stats);
  stats.forEach((stat) => {
    const statData = asObject(stat);
    const item = cloneTemplate(templateId);

    if (!item) {
      return;
    }

    item.querySelector('.stat-value')?.replaceChildren(document.createTextNode(String(statData.value ?? '')));
    item.querySelector('.stat-label')?.replaceChildren(document.createTextNode(String(statData.label ?? '')));
    container.append(item);
  });
}

function renderProjects() {
  const container = document.querySelector('[data-render-target="projects"]');

  if (!container) {
    return;
  }

  const templateId = container.dataset.template;
  container.replaceChildren();

  const projects = asArray(runtimeProfile?.projects);
  projects.forEach((project) => {
    const projectData = asObject(project);
    const item = cloneTemplate(templateId);

    if (!item) {
      return;
    }

    const classified = item.querySelector('.pod-classified');
    const tagContainer = item.querySelector('.pod-tags');
    const link = item.querySelector('.pod-link');

    if (classified) {
      classified.hidden = !projectData.featured;
    }

    item.querySelector('.pod-index')?.replaceChildren(document.createTextNode(`POD - ${String(projectData.id ?? '')}`));
    item.querySelector('.pod-title')?.replaceChildren(document.createTextNode(String(projectData.title ?? '')));
    item.querySelector('.pod-desc')?.replaceChildren(document.createTextNode(String(projectData.description ?? '')));

    if (tagContainer) {
      tagContainer.replaceChildren();

      asArray(projectData.tags).forEach((tag) => {
        const tagItem = cloneTemplate('project-tag-template');

        if (!tagItem) {
          return;
        }

        tagItem.textContent = String(tag ?? '');
        tagContainer.append(tagItem);
      });
    }

    if (link instanceof HTMLAnchorElement) {
      const href = String(projectData.href ?? '').trim();
      const isInteractive = hasMeaningfulHref(href);

      if (isInteractive) {
        link.href = href;
        link.removeAttribute('aria-disabled');
        link.removeAttribute('tabindex');
        link.classList.remove('pod-link-disabled');
        link.textContent = 'Access Record';
      } else {
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        link.setAttribute('tabindex', '-1');
        link.classList.add('pod-link-disabled');
        link.textContent = 'Record Pending';
      }
    }

    container.append(item);
  });
}

function renderSkills() {
  const container = document.querySelector('[data-render-target="skills"]');

  if (!container) {
    return;
  }

  const templateId = container.dataset.template;
  container.replaceChildren();

  const skills = asArray(runtimeProfile?.skills);
  skills.forEach((skillGroup) => {
    const skillGroupData = asObject(skillGroup);
    const item = cloneTemplate(templateId);

    if (!item) {
      return;
    }

    const list = item.querySelector('.skill-list');
    item.querySelector('.skill-cat-label')?.replaceChildren(document.createTextNode(String(skillGroupData.category ?? '')));

    if (list) {
      list.replaceChildren();

      asArray(skillGroupData.items).forEach((skill) => {
        const skillItem = cloneTemplate('skill-item-template');

        if (!skillItem) {
          return;
        }

        skillItem.textContent = String(skill ?? '');
        list.append(skillItem);
      });
    }

    container.append(item);
  });
}

function renderExperience() {
  const container = document.querySelector('[data-render-target="experience"]');

  if (!container) {
    return;
  }

  const templateId = container.dataset.template;
  container.replaceChildren();

  const experience = asArray(runtimeProfile?.experience);
  experience.forEach((entry) => {
    const entryData = asObject(entry);
    const item = cloneTemplate(templateId);

    if (!item) {
      return;
    }

    item.querySelector('.record-dates')?.replaceChildren(document.createTextNode(String(entryData.dates ?? '')));
    item.querySelector('.record-duration')?.replaceChildren(document.createTextNode(String(entryData.duration ?? '')));
    item.querySelector('.record-role')?.replaceChildren(document.createTextNode(String(entryData.role ?? '')));
    item.querySelector('.record-company')?.replaceChildren(document.createTextNode(String(entryData.company ?? '')));
    item.querySelector('.record-desc')?.replaceChildren(document.createTextNode(String(entryData.description ?? '')));
    item.querySelector('.badge')?.replaceChildren(document.createTextNode(String(entryData.badge ?? '')));

    container.append(item);
  });
}

function getContactDisplay(key, value) {
  if (key === 'email') {
    return value.replace(/^mailto:/, '');
  }

  if (key === 'linkedin' || key === 'github') {
    return value.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  return value;
}

function getContactHref(key, value) {
  if (key === 'email') {
    return value.startsWith('mailto:') ? value : `mailto:${value}`;
  }

  return value;
}

function renderLinks() {
  const container = document.querySelector('[data-render-target="links"]');

  if (!container) {
    return;
  }

  const templateId = container.dataset.template;
  const iconMap = {
    email: '@',
    linkedin: 'in',
    github: 'gh'
  };

  container.replaceChildren();

  const links = asObject(runtimeProfile?.links);
  Object.entries(links).forEach(([key, value]) => {
    const item = cloneTemplate(templateId);

    if (!(item instanceof HTMLAnchorElement)) {
      return;
    }

    const normalizedValue = String(value ?? '');
    item.href = getContactHref(key, normalizedValue);
    item.dataset.linkKey = key;
    item.querySelector('.contact-icon')?.replaceChildren(document.createTextNode(iconMap[key] ?? '?'));
    item.querySelector('span')?.replaceChildren(document.createTextNode(getContactDisplay(key, normalizedValue)));

    container.append(item);
  });
}

function renderProfile() {
  bindDataFields(document, runtimeProfile);
  renderAboutParagraphs();
  renderStats();
  renderProjects();
  renderSkills();
  renderExperience();
  renderLinks();
}

const runtimeProfile = getRuntimeProfile(profile);

function animateVaultEyebrow() {
  const eyebrow = document.querySelector('.hero-eyebrow');
  const finalHex = runtimeProfile?.identity?.vaultHex;
  const finalStatus = 'VERIFIED // AUTHORIZED';

  if (!(eyebrow instanceof HTMLElement) || !finalHex) {
    return;
  }

  let textTarget = eyebrow.querySelector('.hero-eyebrow-text');

  if (!(textTarget instanceof HTMLElement)) {
    textTarget = document.createElement('span');
    textTarget.className = 'hero-eyebrow-text';
    textTarget.textContent = eyebrow.textContent?.trim() ?? '';
    eyebrow.replaceChildren(textTarget);
  }

  const durationMs = 2000;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / durationMs, 1);
    const scrambledHex = scrambleHex(finalHex, progress);
    const scrambledStatus = scrambleText(finalStatus, progress);
    textTarget.textContent = `VAULT ID: 0x${scrambledHex} - ${scrambledStatus}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  textTarget.textContent = formatVaultEyebrow(scrambleHex(finalHex, 0));
  requestAnimationFrame(tick);
}

function setupFadeInObserver() {
  const fadeEls = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach((element) => observer.observe(element));
}

// Scene structure checklist:
// - keep environment setup isolated from animated objects
// - keep pillars, capsules, the energy core, and panels independent
// - keep camera motion driven only by scroll and pointer state
// - keep the animation loop as a thin orchestrator

const CAMERA_LIMITS = {
  startY: 3.6,
  minY: 0.85,
  startZ: 15.5,
  minZ: 11.8,
  lookAtYFloor: -0.35
};

const CAMERA_EASING = {
  scroll: 0.06,
  lookTarget: 0.025
};

const PILLAR_SPEC = {
  width: 1.35,
  height: 22,
  depth: 1.35,
  stripWidth: 0.14,
  stripHeight: 16
};

const PILLAR_BASE_Y = -3;
const PILLAR_STRIP_GAP = 0.06;

function createSceneRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  return renderer;
}

function createSceneCamera() {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, CAMERA_LIMITS.startY, CAMERA_LIMITS.startZ);
  camera.lookAt(0, 0, 0);

  return camera;
}

function createSceneEnvironment(scene) {
  scene.fog = new THREE.FogExp2(0x04060f, 0.035);

  const ambientLight = new THREE.AmbientLight(0x0a1020, 1.0);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.6);
  sunLight.position.set(5, 8, 5);
  scene.add(sunLight);

  const cyanLight = new THREE.PointLight(0x00d4ff, 2.5, 25);
  cyanLight.position.set(-4, 3, 0);
  scene.add(cyanLight);

  const blueLight = new THREE.PointLight(0x0044cc, 1.8, 30);
  blueLight.position.set(6, -2, -5);
  scene.add(blueLight);

  const silverLight = new THREE.PointLight(0xaabbdd, 0.8, 20);
  silverLight.position.set(0, 6, 4);
  scene.add(silverLight);

  const floorGeo = new THREE.PlaneGeometry(80, 80, 1, 1);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x050810,
    metalness: 0.85,
    roughness: 0.3,
    envMapIntensity: 0.5
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3;
  scene.add(floor);

  const gridHelper = new THREE.GridHelper(80, 80, 0x00d4ff, 0x0a1428);
  gridHelper.position.y = -2.99;
  gridHelper.material.opacity = 0.25;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  return { cyanLight };
}

function createVaultPillars(scene) {
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x080e1e,
    metalness: 0.9,
    roughness: 0.2
  });

  const pillarPositions = [
    [-7.25, 0, -8.25], [7.25, 0, -8.25],
    [-10.5, 0, -2.1], [10.5, 0, -2.1],
    [-5.75, 0, -14.25], [5.75, 0, -14.25]
  ];

  pillarPositions.forEach(([x, y, z]) => {
    const geo = new THREE.BoxGeometry(PILLAR_SPEC.width, PILLAR_SPEC.height, PILLAR_SPEC.depth);
    const pillar = new THREE.Mesh(geo, pillarMat);
    pillar.position.set(x, PILLAR_BASE_Y + PILLAR_SPEC.height / 2, z);
    scene.add(pillar);

    const stripGeo = new THREE.BoxGeometry(PILLAR_SPEC.stripWidth, PILLAR_SPEC.stripHeight, PILLAR_SPEC.stripWidth);
    const stripMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set(
      x + (PILLAR_SPEC.width / 2) + (PILLAR_SPEC.stripWidth / 2) + PILLAR_STRIP_GAP,
      PILLAR_BASE_Y + PILLAR_SPEC.stripHeight / 2,
      z + (PILLAR_SPEC.depth / 2) - (PILLAR_SPEC.stripWidth / 2)
    );
    scene.add(strip);
  });
}

const CORE_PARTICLE_COUNT = 1800;
const CORE_RADIUS = 1.7;

function createVaultCapsules(scene) {
  const capsules = [];
  const capsuleData = [
    { x: -5, z: -3 }, { x: 0, z: -4 }, { x: 5, z: -3 },
    { x: -3, z: -7 }, { x: 3, z: -7 }, { x: 0, z: -9 }
  ];

  capsuleData.forEach((capsule, index) => {
    const group = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(1.6, 0.4, 0.9);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x080e22,
      metalness: 0.9,
      roughness: 0.15,
      transparent: true,
      opacity: 0.85
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    const edgeGeo = new THREE.EdgesGeometry(bodyGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.5 });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(edges);

    group.position.set(capsule.x, 0.5 + Math.sin(index * 1.3) * 0.3, capsule.z);
    group.userData.baseY = group.position.y;
    group.userData.phase = index * 1.1;

    scene.add(group);
    capsules.push(group);
  });

  return capsules;
}

function createControlledEnergyCore(scene) {
  const coreGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(CORE_PARTICLE_COUNT * 3);
  const colors = new Float32Array(CORE_PARTICLE_COUNT * 3);
  const basePositions = new Float32Array(CORE_PARTICLE_COUNT * 3);
  const tangentA = new Float32Array(CORE_PARTICLE_COUNT * 3);
  const tangentB = new Float32Array(CORE_PARTICLE_COUNT * 3);
  const orbitOffsets = new Float32Array(CORE_PARTICLE_COUNT);
  const orbitAmplitudes = new Float32Array(CORE_PARTICLE_COUNT);
  const pulseOffsets = new Float32Array(CORE_PARTICLE_COUNT);

  for (let index = 0; index < CORE_PARTICLE_COUNT; index += 1) {
    const offset = index * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    const radialBias = Math.pow(Math.random(), 0.72);
    const radius = THREE.MathUtils.lerp(CORE_RADIUS * 0.18, CORE_RADIUS, radialBias);
    const sinPhi = Math.sin(phi);
    const x = Math.cos(theta) * sinPhi;
    const y = Math.cos(phi);
    const z = Math.sin(theta) * sinPhi;
    const tangentReferenceX = Math.abs(y) > 0.82 ? 1 : 0;
    const tangentReferenceY = Math.abs(y) > 0.82 ? 0 : 1;
    const tangentOneX = tangentReferenceY * z - 0 * y;
    const tangentOneY = 0 * x - tangentReferenceX * z;
    const tangentOneZ = tangentReferenceX * y - tangentReferenceY * x;
    const tangentOneLength = Math.hypot(tangentOneX, tangentOneY, tangentOneZ) || 1;
    const normalizedTangentOneX = tangentOneX / tangentOneLength;
    const normalizedTangentOneY = tangentOneY / tangentOneLength;
    const normalizedTangentOneZ = tangentOneZ / tangentOneLength;
    const tangentTwoX = y * normalizedTangentOneZ - z * normalizedTangentOneY;
    const tangentTwoY = z * normalizedTangentOneX - x * normalizedTangentOneZ;
    const tangentTwoZ = x * normalizedTangentOneY - y * normalizedTangentOneX;

    basePositions[offset] = x * radius;
    basePositions[offset + 1] = y * radius;
    basePositions[offset + 2] = z * radius;

    positions[offset] = basePositions[offset];
    positions[offset + 1] = basePositions[offset + 1];
    positions[offset + 2] = basePositions[offset + 2];

    tangentA[offset] = normalizedTangentOneX;
    tangentA[offset + 1] = normalizedTangentOneY;
    tangentA[offset + 2] = normalizedTangentOneZ;
    tangentB[offset] = tangentTwoX;
    tangentB[offset + 1] = tangentTwoY;
    tangentB[offset + 2] = tangentTwoZ;

    orbitOffsets[index] = Math.random() * Math.PI * 2;
    orbitAmplitudes[index] = THREE.MathUtils.lerp(0.015, 0.075, Math.random());
    pulseOffsets[index] = Math.random() * Math.PI * 2;

    const tintMix = Math.random();
    const color = new THREE.Color().setRGB(
      THREE.MathUtils.lerp(0.08, 0.62, tintMix),
      THREE.MathUtils.lerp(0.75, 0.95, 1 - tintMix * 0.55),
      1
    );

    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }

  coreGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  coreGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const coreMaterial = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const core = new THREE.Points(coreGeometry, coreMaterial);
  core.position.set(0, 1.5, -6);
  scene.add(core);

  return {
    core,
    coreGeometry,
    coreMaterial,
    positions,
    basePositions,
    tangentA,
    tangentB,
    orbitOffsets,
    orbitAmplitudes,
    pulseOffsets
  };
}

function createVaultPanels(scene) {
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x060b18,
    metalness: 0.8,
    roughness: 0.3,
    side: THREE.DoubleSide
  });

  for (let index = -3; index <= 3; index += 1) {
    const panelGeo = new THREE.PlaneGeometry(2.8, 7);
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(index * 3.2, 0.5, -16);
    scene.add(panel);

    const seamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.4, 0, 0),
      new THREE.Vector3(1.4, 0, 0)
    ]);
    const seamMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.15 });
    const seam = new THREE.Line(seamGeo, seamMat);
    seam.position.set(index * 3.2, 2.5, -15.98);
    scene.add(seam);
  }
}

function updateCameraFromScroll(camera, state) {
  const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const scrollProgress = THREE.MathUtils.clamp(state.scrollY / scrollRange, 0, 1);

  state.cameraProgress += (scrollProgress - state.cameraProgress) * CAMERA_EASING.scroll;

  const progress = state.cameraProgress;
  const targetX = state.targetX * 1.8;
  const targetY = THREE.MathUtils.lerp(CAMERA_LIMITS.startY, CAMERA_LIMITS.minY, progress);
  const targetZ = THREE.MathUtils.lerp(CAMERA_LIMITS.startZ, CAMERA_LIMITS.minZ, progress);
  const targetLookAtX = state.targetX * 0.28;
  const targetLookAtY = THREE.MathUtils.lerp(0, CAMERA_LIMITS.lookAtYFloor, progress);

  camera.position.x += (targetX - camera.position.x) * 0.08;
  camera.position.y = THREE.MathUtils.clamp(targetY + state.targetY * 0.1, CAMERA_LIMITS.minY, CAMERA_LIMITS.startY);
  camera.position.z += (targetZ - camera.position.z) * 0.08;

  state.lookAtX += (targetLookAtX - state.lookAtX) * CAMERA_EASING.lookTarget;
  state.lookAtY += (targetLookAtY - state.lookAtY) * CAMERA_EASING.lookTarget;

  camera.lookAt(state.lookAtX, state.lookAtY, 0);
}

function updateSceneAnimation(state, runtime) {
  state.time += 0.008;

  state.targetX += (state.mouseX - state.targetX) * 0.04;
  state.targetY += (state.mouseY - state.targetY) * 0.04;

  updateCameraFromScroll(runtime.camera, state);

  const corePulse = 1 + Math.sin(state.time * 1.6) * 0.035;
  const corePositionAttr = runtime.coreGeometry.attributes.position;

  for (let index = 0; index < CORE_PARTICLE_COUNT; index += 1) {
    const offset = index * 3;
    const orbitAngle = state.time * 0.45 + runtime.orbitOffsets[index];
    const orbitRadius = runtime.orbitAmplitudes[index];
    const orbitX = runtime.tangentA[offset] * Math.cos(orbitAngle) * orbitRadius;
    const orbitY = runtime.tangentA[offset + 1] * Math.cos(orbitAngle) * orbitRadius;
    const orbitZ = runtime.tangentA[offset + 2] * Math.cos(orbitAngle) * orbitRadius;
    const driftAngle = orbitAngle * 1.17 + runtime.pulseOffsets[index];
    const driftX = runtime.tangentB[offset] * Math.sin(driftAngle) * orbitRadius * 0.55;
    const driftY = runtime.tangentB[offset + 1] * Math.sin(driftAngle) * orbitRadius * 0.55;
    const driftZ = runtime.tangentB[offset + 2] * Math.sin(driftAngle) * orbitRadius * 0.55;
    const particlePulse = 1 + Math.sin(state.time * 1.1 + runtime.pulseOffsets[index]) * 0.018;
    const radiusScale = corePulse * particlePulse;

    runtime.positions[offset] = runtime.basePositions[offset] * radiusScale + orbitX + driftX;
    runtime.positions[offset + 1] = runtime.basePositions[offset + 1] * radiusScale + orbitY + driftY;
    runtime.positions[offset + 2] = runtime.basePositions[offset + 2] * radiusScale + orbitZ + driftZ;
  }

  corePositionAttr.needsUpdate = true;

  runtime.core.rotation.y += 0.0018;
  runtime.coreMaterial.opacity = 0.68 + Math.sin(state.time * 1.4) * 0.04;

  runtime.cyanLight.intensity = 2.15 + Math.sin(state.time * 1.4) * 0.18;
  runtime.cyanLight.position.x = -3.5 + Math.sin(state.time * 0.4) * 0.5;
  runtime.cyanLight.position.z = -1.1 + Math.cos(state.time * 0.4) * 0.45;

  runtime.capsules.forEach((capsule) => {
    capsule.position.y = capsule.userData.baseY + Math.sin(state.time + capsule.userData.phase) * 0.18;
    capsule.rotation.y = Math.sin(state.time * 0.4 + capsule.userData.phase) * 0.12;
  });
}

function setupScene() {
  const canvas = document.getElementById('vault-canvas');

  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const renderer = createSceneRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = createSceneCamera();
  const { cyanLight } = createSceneEnvironment(scene);
  createVaultPillars(scene);
  const capsules = createVaultCapsules(scene);
  const energyCore = createControlledEnergyCore(scene);
  createVaultPanels(scene);

  const state = {
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    lookAtX: 0,
    lookAtY: 0,
    cameraProgress: 0,
    scrollY: 0,
    time: 0
  };

  document.addEventListener('mousemove', (event) => {
    state.mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    state.mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('scroll', () => {
    state.scrollY = window.scrollY;
  });

  const runtime = {
    camera,
    cyanLight,
    capsules,
    ...energyCore
  };

  function animate() {
    requestAnimationFrame(animate);
    updateSceneAnimation(state, runtime);
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

renderProfile();
animateVaultEyebrow();
setupFadeInObserver();
setupScene();
