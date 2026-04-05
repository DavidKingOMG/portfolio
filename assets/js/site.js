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

function setupTerminalForm() {
  const form = document.querySelector('[data-terminal-form]');

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const emailInput = form.querySelector('input[name="email"]');
  const replyToInput = form.querySelector('input[name="_replyto"]');
  const honeypotInput = form.querySelector('input[name="_honey"]');
  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[data-form-status]');

  if (
    !(emailInput instanceof HTMLInputElement) ||
    !(replyToInput instanceof HTMLInputElement) ||
    !(submitButton instanceof HTMLButtonElement) ||
    !(status instanceof HTMLElement)
  ) {
    return;
  }

  const defaultButtonLabel = submitButton.textContent?.trim() || 'Transmit';
  let isSubmitting = false;

  function syncReplyTo() {
    replyToInput.value = emailInput.value.trim();
  }

  function setStatusMessage(message, state) {
    status.textContent = message;
    status.dataset.state = state;
  }

  function resetButtonState() {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
    submitButton.textContent = defaultButtonLabel;
  }

  emailInput.addEventListener('input', syncReplyTo);
  syncReplyTo();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    syncReplyTo();

    if (honeypotInput instanceof HTMLInputElement && honeypotInput.value.trim() !== '') {
      setStatusMessage('Transmission blocked. Please refresh and try again.', 'error');
      resetButtonState();
      return;
    }

    isSubmitting = true;
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'Transmitting...';
    setStatusMessage('Sending inquiry...', 'sending');

    try {
      const response = await fetch('https://formsubmit.co/ajax/davidmoya1309@gmail.com', {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: new FormData(form)
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || payload?.success === 'false' || payload?.success === false) {
        throw new Error(payload?.message || 'Transmission failed.');
      }

      form.reset();
      syncReplyTo();
      setStatusMessage('Inquiry transmitted. Expect a response within 24-48 hours.', 'success');
      submitButton.removeAttribute('aria-busy');
      submitButton.disabled = false;
      submitButton.textContent = defaultButtonLabel;
    } catch (error) {
      setStatusMessage(
        error instanceof Error && error.message ? error.message : 'Transmission failed. Please try again.',
        'error'
      );
      resetButtonState();
    } finally {
      isSubmitting = false;
    }
  });
}

// Scene structure checklist:
// - keep environment setup isolated from animated objects
// - keep pillars, core, rings, capsules, particles, and panels independent
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
  scroll: 3.6,
  lookTarget: 1.5,
  position: 4.8,
  pointer: 2.4
};

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
    [-7, 0, -8], [7, 0, -8],
    [-10, 0, -2], [10, 0, -2],
    [-5, 0, -14], [5, 0, -14]
  ];

  pillarPositions.forEach(([x, y, z]) => {
    const geo = new THREE.BoxGeometry(0.6, 12, 0.6);
    const pillar = new THREE.Mesh(geo, pillarMat);
    pillar.position.set(x, y, z);
    scene.add(pillar);

    const stripGeo = new THREE.BoxGeometry(0.08, 8, 0.08);
    const stripMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.set(x + 0.25, y, z + 0.25);
    scene.add(strip);
  });
}

function createVaultRings(scene) {
  const rings = [];

  for (let index = 0; index < 3; index += 1) {
    const ringGeo = new THREE.TorusGeometry(2.5 + index * 1.2, 0.02, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: index === 0 ? 0x00d4ff : index === 1 ? 0x0055cc : 0x334466,
      transparent: true,
      opacity: 0.25 - index * 0.06
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, -0.5 + index * 0.5, -6);
    scene.add(ring);
    rings.push(ring);
  }

  return rings;
}

function createVaultParticles(scene) {
  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 2200;
  const positions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  for (let index = 0; index < particleCount; index += 1) {
    const offset = index * 3;
    positions[offset] = (Math.random() - 0.5) * 60;
    positions[offset + 1] = (Math.random() - 0.5) * 30;
    positions[offset + 2] = (Math.random() - 0.5) * 60;

    const tint = Math.random();
    if (tint < 0.6) {
      particleColors[offset] = 0.0;
      particleColors[offset + 1] = 0.75;
      particleColors[offset + 2] = 1.0;
    } else if (tint < 0.85) {
      particleColors[offset] = 0.1;
      particleColors[offset + 1] = 0.3;
      particleColors[offset + 2] = 0.85;
    } else {
      particleColors[offset] = 0.7;
      particleColors[offset + 1] = 0.75;
      particleColors[offset + 2] = 0.85;
    }
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particlesMat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);

  return particles;
}

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

function createEnergyCore(scene) {
  const coreGeo = new THREE.OctahedronGeometry(0.9, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x001428,
    metalness: 1.0,
    roughness: 0.05,
    emissive: 0x003366,
    emissiveIntensity: 0.3
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 1.5, -6);
  scene.add(core);

  const coreEdgeGeo = new THREE.EdgesGeometry(coreGeo);
  const coreEdgeMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.8 });
  const coreEdge = new THREE.LineSegments(coreEdgeGeo, coreEdgeMat);
  coreEdge.position.copy(core.position);
  scene.add(coreEdge);

  return { core, coreEdge };
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

function easeToward(currentValue, targetValue, easingStrength, deltaSeconds) {
  const easedStep = 1 - Math.exp(-easingStrength * deltaSeconds);

  return currentValue + ((targetValue - currentValue) * easedStep);
}

function getSceneScrollProgress(state) {
  const heroSection = document.getElementById('hero');
  const contactSection = document.getElementById('contact');

  if (!(heroSection instanceof HTMLElement) || !(contactSection instanceof HTMLElement)) {
    return 0;
  }

  const scrollStart = heroSection.offsetTop;
  const contactAnchor = contactSection.offsetTop + (contactSection.offsetHeight * 0.35);
  const scrollRange = Math.max(contactAnchor - scrollStart, 1);

  return THREE.MathUtils.clamp((state.scrollY - scrollStart) / scrollRange, 0, 1);
}

function updateCameraFromScroll(camera, state, deltaSeconds) {
  const scrollProgress = getSceneScrollProgress(state);

  state.cameraProgress = easeToward(state.cameraProgress, scrollProgress, CAMERA_EASING.scroll, deltaSeconds);

  const progress = state.cameraProgress;
  const targetX = state.targetX * 1.8;
  const targetY = THREE.MathUtils.lerp(CAMERA_LIMITS.startY, CAMERA_LIMITS.minY, progress);
  const targetZ = THREE.MathUtils.lerp(CAMERA_LIMITS.startZ, CAMERA_LIMITS.minZ, progress);
  const targetLookAtX = state.targetX * 0.28;
  const targetLookAtY = THREE.MathUtils.lerp(0, CAMERA_LIMITS.lookAtYFloor, progress);

  camera.position.x = easeToward(camera.position.x, targetX, CAMERA_EASING.position, deltaSeconds);
  camera.position.y = THREE.MathUtils.clamp(targetY + state.targetY * 0.1, CAMERA_LIMITS.minY, CAMERA_LIMITS.startY);
  camera.position.z = easeToward(camera.position.z, targetZ, CAMERA_EASING.position, deltaSeconds);

  state.lookAtX = easeToward(state.lookAtX, targetLookAtX, CAMERA_EASING.lookTarget, deltaSeconds);
  state.lookAtY = easeToward(state.lookAtY, targetLookAtY, CAMERA_EASING.lookTarget, deltaSeconds);

  camera.lookAt(state.lookAtX, state.lookAtY, 0);
}

function updateSceneAnimation(state, runtime, deltaSeconds) {
  state.time += deltaSeconds;

  state.targetX = easeToward(state.targetX, state.mouseX, CAMERA_EASING.pointer, deltaSeconds);
  state.targetY = easeToward(state.targetY, state.mouseY, CAMERA_EASING.pointer, deltaSeconds);

  updateCameraFromScroll(runtime.camera, state, deltaSeconds);

  runtime.core.rotation.y += 0.008;
  runtime.core.rotation.x += 0.004;
  runtime.coreEdge.rotation.copy(runtime.core.rotation);

  runtime.cyanLight.intensity = 2.0 + Math.sin(state.time * 2.5) * 0.8;
  runtime.cyanLight.position.x = Math.sin(state.time * 0.5) * 5;
  runtime.cyanLight.position.z = Math.cos(state.time * 0.5) * 3 - 3;

  runtime.capsules.forEach((capsule) => {
    capsule.position.y = capsule.userData.baseY + Math.sin(state.time + capsule.userData.phase) * 0.18;
    capsule.rotation.y = Math.sin(state.time * 0.4 + capsule.userData.phase) * 0.12;
  });

  runtime.rings.forEach((ring, index) => {
    ring.rotation.z += 0.002 * (index % 2 === 0 ? 1 : -1);
    ring.rotation.x = Math.PI / 2 + Math.sin(state.time * 0.3 + index) * 0.05;
  });

  runtime.particles.rotation.y += 0.0003;
  runtime.particles.rotation.x += 0.0001;
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
  const rings = createVaultRings(scene);
  const particles = createVaultParticles(scene);
  const capsules = createVaultCapsules(scene);
  const { core, coreEdge } = createEnergyCore(scene);
  createVaultPanels(scene);

  const state = {
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    lookAtX: 0,
    lookAtY: 0,
    cameraProgress: 0,
    scrollY: window.scrollY,
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
    core,
    coreEdge,
    capsules,
    rings,
    particles
  };

  let lastFrameTime = performance.now();

  function animate(frameTime) {
    const deltaSeconds = Math.min((frameTime - lastFrameTime) / 1000, 1 / 20);
    lastFrameTime = frameTime;

    requestAnimationFrame(animate);
    updateSceneAnimation(state, runtime, deltaSeconds);
    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

renderProfile();
animateVaultEyebrow();
setupFadeInObserver();
setupTerminalForm();
setupScene();
