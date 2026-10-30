const NAV_HEIGHT = 66;
const landing = document.querySelector('.landing');

// Moon background and stars
const canvas = document.querySelector('#star-field');
const ctx = canvas.getContext('2d');
const moonPlate = document.querySelector('.moon-plate');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const pointer = { x: 0, y: 0, inside: false };
const stars = [];
const moonViews = [
  { x: 0, y: 0, zoom: 1, roll: 0, sky: 0.36 },
  { x: 0, y: 0, zoom: 1, roll: 0, sky: 0.36 },
  { x: -0.27, y: 0.04, zoom: 1.12, roll: -3, sky: 0.34 },
  { x: -0.18, y: 1.22, zoom: 0.9, roll: 0, sky: 1 },
  { x: -0.18, y: 1.22, zoom: 0.9, roll: 0, sky: 1 }
];
const camera = { ...moonViews[0] };
let stopCameraTravel;
let screenWidth;
let screenHeight;
let moonFrame;
let queued = false;

function requestDraw() {
  if (queued || document.hidden) return;
  queued = true;
  requestAnimationFrame(drawStars);
}

function fitCanvas() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  screenWidth = innerWidth;
  screenHeight = innerHeight - NAV_HEIGHT;
  canvas.width = screenWidth * ratio;
  canvas.height = screenHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  // A closer view of the same screen, focused on the lunar horizon.
  const aspect = 1672 / 941;
  const width = Math.max(screenWidth, screenHeight * aspect) * 1.6;
  const height = width / aspect;
  moonFrame = {
    width,
    height,
    left: (screenWidth - width) / 2,
    top: screenHeight / 2 - height * 0.60
  };
  Object.assign(moonPlate.style, {
    width: `${width}px`,
    height: `${height}px`,
    left: `${moonFrame.left}px`,
    top: `${moonFrame.top}px`
  });

  applyCamera();

  let seed = 73;
  function random() {
    seed = seed * 16807 % 2147483647;
    return (seed - 1) / 2147483646;
  }
  stars.length = 0;
  const count = Math.max(60, Math.min(240, Math.round(screenWidth * screenHeight / 6500)));
  for (let i = 0; i < count; i++) {
    stars.push({
      u: random(),
      v: random(),
      x: 0,
      y: 0,
      radius: 0.4 + random() * 0.8,
      brightness: 0.18 + random() * 0.35,
      phase: random() * Math.PI * 2,
      glow: 0
    });
  }
  requestDraw();
}

function drawStars(time) {
  queued = false;
  ctx.clearRect(0, 0, screenWidth, screenHeight);
  let moving = false;
  for (const star of stars) {
    star.x = ((star.u * screenWidth + camera.x * screenWidth * 0.16) % screenWidth + screenWidth) % screenWidth;
    star.y = ((star.v * screenHeight + camera.y * screenHeight * 0.35) % screenHeight + screenHeight) % screenHeight;
    if (star.y > screenHeight * camera.sky) {
      star.glow = 0;
      continue;
    }
    const distance = pointer.inside ? Math.hypot(star.x - pointer.x, star.y - pointer.y) : 100;
    const target = Math.max(0, 1 - distance / 90);
    star.glow = motionPreference.matches ? target : star.glow + (target - star.glow) * 0.12;
    const shimmer = motionPreference.matches ? 1 : 0.75 + 0.25 * Math.sin(time * 0.004 + star.phase);
    const light = star.glow * shimmer;
    if (light > 0.01) {
      const radius = star.radius + light * 6;
      const halo = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, radius);
      halo.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.globalAlpha = light;
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = Math.min(1, star.brightness + light);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius + light, 0, Math.PI * 2);
    ctx.fill();
    if (!motionPreference.matches && (target > 0.01 || Math.abs(star.glow - target) > 0.005)) {
      moving = true;
    }
  }
  ctx.globalAlpha = 1;
  if (moving) requestDraw();
}

function applyCamera() {
  moonPlate.style.transform = `translate(${camera.x * screenWidth}px, ${camera.y * screenHeight}px) rotate(${camera.roll}deg) scale(${camera.zoom})`;
  requestDraw();
}

function setCamera(index) {
  Object.assign(camera, moonViews[index]);
  applyCamera();
}

function travelMoon(index, duration) {
  const from = { ...camera };
  const to = moonViews[index];
  const orbit = from.sky < 0.9 && to.sky < 0.9;
  const direction = Math.sign(to.x - from.x);
  let frame;
  let start;

  return new Promise(resolve => {
    stopCameraTravel = () => {
      cancelAnimationFrame(frame);
      resolve();
    };

    function step(now) {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const t = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      for (const key of Object.keys(to)) {
        camera[key] = from[key] + (to[key] - from[key]) * t;
      }
      if (orbit) camera.roll += Math.sin(t * Math.PI) * direction * 5;
      applyCamera();
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        stopCameraTravel = null;
        resolve();
      }
    }

    frame = requestAnimationFrame(step);
  });
}

window.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  pointer.x = event.clientX;
  pointer.y = event.clientY - NAV_HEIGHT;
  pointer.inside = !landing.classList.contains('page-active') && event.clientY > NAV_HEIGHT;
  requestDraw();
}, { passive: true });
window.addEventListener('pointerout', event => {
  if (event.relatedTarget) return;
  pointer.inside = false;
  requestDraw();
});
window.addEventListener('blur', () => {
  pointer.inside = false;
  requestDraw();
});
window.addEventListener('resize', fitCanvas);
document.addEventListener('visibilitychange', requestDraw);
motionPreference.addEventListener('change', requestDraw);
fitCanvas();

// Mobile navigation
const menuToggle = document.querySelector('#menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileNav.classList.toggle('open', open);
  mobileNav.inert = !open;
}

menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});

window.addEventListener('resize', () => {
  if (innerWidth > 780) setMenu(false);
});

// Wheel, swipe, and keyboard gestures change one page at a time.
const pages = [...document.querySelectorAll('.landing, main > section')];
const secretGif = document.querySelector('#secret-gif');
let activePage = Math.max(0, pages.findIndex(page => `#${page.id}` === location.hash));
let transitionLayer;
let transitionAnimations = [];
let changingPage = false;
const pageLinks = document.querySelectorAll('a[href^="#"]');

document.documentElement.classList.add('paged-site');

function startSecretGif() {
  if (!secretGif.hasAttribute('src')) secretGif.src = 'assets/rickroll.gif';
}

function updateSecretGifMotion() {
  if (!secretGif.hasAttribute('src')) return;
  if (!motionPreference.matches && secretGif.src.startsWith('data:')) {
    secretGif.src = 'assets/rickroll.gif';
  } else if (motionPreference.matches && !secretGif.src.startsWith('data:') && secretGif.complete && secretGif.naturalWidth) {
    const still = document.createElement('canvas');
    still.width = secretGif.naturalWidth;
    still.height = secretGif.naturalHeight;
    still.getContext('2d').drawImage(secretGif, 0, 0);
    secretGif.src = still.toDataURL();
  }
}

secretGif.addEventListener('load', updateSecretGifMotion);
motionPreference.addEventListener('change', updateSecretGifMotion);

function showPage(index) {
  pages.forEach((page, i) => {
    page.classList.toggle('page-active', i === index);
    page.inert = i !== index;
    page.setAttribute('aria-hidden', String(i !== index));
    page.tabIndex = -1;
  });

  pageLinks.forEach(link => {
    if (link.hash === `#${pages[index].id}`) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  activePage = index;
  if (!changingPage) setCamera(index);
  if (pages[index].id !== 'secret') {
    secretGif.removeAttribute('src');
  } else if (!changingPage) {
    startSecretGif();
  }
  pointer.inside = false;
  requestDraw();
}
showPage(activePage);

function finishTransition() {
  transitionLayer?.remove();
  transitionLayer = null;
  transitionAnimations.forEach(animation => animation.cancel());
  transitionAnimations = [];
  stopCameraTravel?.();
  stopCameraTravel = null;
  changingPage = false;
  setCamera(activePage);
  document.documentElement.classList.remove('changing-page');
  if (pages[activePage].id === 'secret') startSecretGif();
}

function travelToPage(previous, index) {
  const ascent = previous === 3 || index === 3;
  const direction = Math.sign(index - previous);
  const duration = ascent ? 2800 : 2600;
  const layer = document.createElement('div');
  layer.className = 'scene-travel';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  const copy = pages[previous].cloneNode(true);
  copy.removeAttribute('id');
  copy.querySelector('#secret-gif')?.remove();
  copy.classList.add('page-copy');
  Object.assign(copy.style, { position: 'absolute', inset: '0', margin: '0' });
  layer.append(copy);
  document.body.append(layer);
  copy.scrollTop = pages[previous].scrollTop;
  transitionLayer = layer;

  const exit = ascent
    ? `translateY(${direction * 160}px)`
    : `translateX(${-direction * screenWidth * 0.3}px) rotateY(${-direction * 10}deg)`;
  const entry = ascent
    ? `translateY(${-direction * 100}px)`
    : `translateX(${direction * screenWidth * 0.22}px) rotateY(${direction * 8}deg)`;
  const settings = {
    duration,
    easing: 'cubic-bezier(0.65, 0, 0.2, 1)',
    fill: 'forwards'
  };

  transitionAnimations = [
    copy.animate([
      { transform: 'none', opacity: 1 },
      { transform: exit, opacity: 0, offset: 0.45 },
      { transform: exit, opacity: 0 }
    ], settings),
    pages[index].animate([
      { transform: entry, opacity: 0 },
      { transform: entry, opacity: 0, offset: 0.35 },
      { transform: 'none', opacity: 1 }
    ], settings)
  ];

  Promise.all([...transitionAnimations.map(animation => animation.finished), travelMoon(index, duration)])
    .then(() => {
      if (transitionLayer === layer) finishTransition();
    })
    .catch(() => {});
}

function zoomToMoon(reverse = false) {
  const layer = document.createElement('div');
  layer.className = 'moon-flight';
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  const copy = landing.cloneNode(true);
  copy.removeAttribute('id');
  copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  copy.classList.add('page-copy');
  Object.assign(copy.style, { position: 'absolute', inset: '0', margin: '0' });
  layer.append(copy);
  document.body.append(layer);

  if (reverse) {
    // Keep the current page visible while the zoomed screen fades over it.
    const underlay = document.createElement('div');
    Object.assign(underlay.style, { position: 'absolute', inset: '0' });
    const backdrop = document.querySelector('.moon-backdrop').cloneNode(true);
    Object.assign(backdrop.style, { position: 'absolute', inset: '0' });
    const sky = document.createElement('img');
    sky.className = 'scene-stars';
    sky.src = canvas.toDataURL();
    sky.alt = '';
    const content = pages[activePage].cloneNode(true);
    content.removeAttribute('id');
    content.querySelector('#secret-gif')?.remove();
    content.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    content.classList.add('page-copy');
    Object.assign(content.style, { position: 'absolute', inset: '0', margin: '0' });
    underlay.append(backdrop, sky, content);
    layer.insertBefore(underlay, copy);
    copy.style.zIndex = '2';
  }

  // Match the image's final crop to the persistent moon backdrop.
  const screen = tvDisplay.getBoundingClientRect();
  const object = tv.getBoundingClientRect();
  const origin = { x: object.left + object.width / 2, y: object.top + object.height / 2 };
  const scale = moonFrame.width / screen.width;
  const x = moonFrame.left + moonFrame.width / 2 - origin.x - scale * (screen.left + screen.width / 2 - origin.x);
  const y = NAV_HEIGHT + moonFrame.top + moonFrame.height / 2 - origin.y - scale * (screen.top + screen.height / 2 - origin.y);
  const closeUp = `translate(${x}px, ${y}px) scale(${scale})`;
  const normal = getComputedStyle(tv).transform;
  const settings = { duration: 2400, easing: 'cubic-bezier(0.65, 0, 0.2, 1)', fill: 'forwards' };
  const picture = copy.querySelector('.tv-set');
  picture.style.transition = 'none';
  const name = copy.querySelector('h1');
  transitionLayer = layer;
  transitionAnimations = [
    picture.animate([{ transform: reverse ? closeUp : normal }, { transform: reverse ? normal : closeUp }], settings),
    name.animate(reverse
      ? [{ opacity: 0 }, { opacity: 0, offset: 0.68 }, { opacity: 1 }]
      : [{ opacity: 1 }, { opacity: 0, offset: 0.28 }, { opacity: 0 }], { ...settings, easing: 'linear' }),
    (reverse ? copy : layer).animate(reverse
      ? [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1 }]
      : [{ opacity: 1 }, { opacity: 1, offset: 0.72 }, { opacity: 0 }], { ...settings, easing: 'linear' })
  ];
  Promise.all(transitionAnimations.map(animation => animation.finished))
    .then(() => {
      if (transitionLayer === layer) finishTransition();
    })
    .catch(() => {});
}

function changePage(index, updateHash = true) {
  if (changingPage || index === activePage || index < 0 || index >= pages.length) return;
  const previous = activePage;
  setMenu(false);
  if (!motionPreference.matches) {
    changingPage = true;
    document.documentElement.classList.add('changing-page');
    if (previous === 0 || index === 0) {
      if (previous === 0) setCamera(index);
      zoomToMoon(index === 0);
    } else {
      travelToPage(previous, index);
    }
  }
  pages[index].scrollTop = 0;
  showPage(index);
  pages[index].focus({ preventScroll: true });
  if (updateHash) history.pushState(null, '', `#${pages[index].id}`);
}

function canScrollContent(direction) {
  const page = pages[activePage];
  if (page === landing) return false;
  return direction > 0
    ? page.scrollTop + page.clientHeight < page.scrollHeight - 2
    : page.scrollTop > 2;
}

function navigationBlocked() {
  return mobileNav.classList.contains('open');
}

// Wheel, touch and keyboard controls
let wheelTotal = 0;
let wheelReady = true;
let wheelTimer;
window.addEventListener('wheel', event => {
  if (event.ctrlKey || navigationBlocked()) return;
  const direction = Math.sign(event.deltaY);
  if (!direction || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    wheelReady = true;
    wheelTotal = 0;
  }, 180);
  if (!changingPage && canScrollContent(direction)) {
    wheelReady = false;
    return;
  }
  event.preventDefault();
  if (changingPage || !wheelReady) return;
  const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
  wheelTotal = Math.sign(wheelTotal) === direction ? wheelTotal + delta : delta;
  if (Math.abs(wheelTotal) < 45) return;
  wheelReady = false;
  wheelTotal = 0;
  changePage(activePage + direction);
}, { passive: false });

let touchStart;
let touchCanScroll;
window.addEventListener('touchstart', event => {
  if (event.touches.length !== 1 || navigationBlocked()) {
    touchStart = null;
    return;
  }
  touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  touchCanScroll = { up: canScrollContent(-1), down: canScrollContent(1) };
}, { passive: true });
window.addEventListener('touchmove', event => {
  if (!touchStart || navigationBlocked()) return;
  const delta = touchStart.y - event.touches[0].clientY;
  if (changingPage || !(delta > 0 ? touchCanScroll.down : touchCanScroll.up)) event.preventDefault();
}, { passive: false });
window.addEventListener('touchend', event => {
  if (!touchStart) return;
  const delta = touchStart.y - event.changedTouches[0].clientY;
  const horizontal = Math.abs(touchStart.x - event.changedTouches[0].clientX);
  touchStart = null;
  if (navigationBlocked() || Math.abs(delta) < 60 || Math.abs(delta) < horizontal) return;
  if (delta > 0 ? touchCanScroll.down : touchCanScroll.up) return;
  changePage(activePage + Math.sign(delta));
}, { passive: true });
window.addEventListener('touchcancel', () => {
  touchStart = null;
}, { passive: true });

document.addEventListener('keydown', event => {
  if (navigationBlocked() || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;
  const direction = ['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey) ? 1
    : ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 0;
  if (direction) {
    if (!changingPage && canScrollContent(direction)) return;
    event.preventDefault();
    if (!event.repeat) changePage(activePage + direction);
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    changePage(event.key === 'Home' ? 0 : pages.length - 1);
  }
});

pageLinks.forEach(link => {
  link.addEventListener('click', event => {
    const index = pages.findIndex(page => `#${page.id}` === link.hash);
    if (index < 0) return;
    event.preventDefault();
    changePage(index);
  });
});
window.addEventListener('popstate', () => {
  finishTransition();
  changePage(Math.max(0, pages.findIndex(page => `#${page.id}` === location.hash)), false);
});
window.addEventListener('resize', finishTransition);
motionPreference.addEventListener('change', finishTransition);

// Landing TV
const tv = document.querySelector('.tv-set');
const tvScene = document.querySelector('.tv-scene');
const tvDisplay = document.querySelector('.tv-display');
const tvName = tvDisplay.querySelector('h1');

function fitTvName() {
  // Fit the complete product into the viewport, including its feet.
  tv.style.width = `${Math.floor(Math.min(tvScene.clientWidth, tvScene.clientHeight * 1.5, 1280))}px`;
  tvName.style.fontSize = '100px';
  const widest = Math.max(...[...tvName.children].map(line => line.offsetWidth));
  const width = tvDisplay.clientWidth * 0.88 / widest;
  const height = tvDisplay.clientHeight * 0.48 / tvName.offsetHeight;
  tvName.style.fontSize = `${Math.floor(100 * Math.min(width, height))}px`;
}

new ResizeObserver(fitTvName).observe(tvScene);
document.fonts.ready.then(fitTvName);

landing.addEventListener('pointermove', event => {
  if (motionPreference.matches || event.pointerType === 'touch' || changingPage) return;
  const bounds = landing.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  tv.style.setProperty('--tv-x', `${(0.5 - y) * 4}deg`);
  tv.style.setProperty('--tv-y', `${(x - 0.5) * 6}deg`);
  tv.style.setProperty('--light-x', `${x * 100}%`);
  tv.style.setProperty('--light-y', `${y * 100}%`);
});

landing.addEventListener('pointerleave', () => {
  ['--tv-x', '--tv-y', '--light-x', '--light-y'].forEach(property => tv.style.removeProperty(property));
});
