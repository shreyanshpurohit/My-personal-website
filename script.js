const nameHeading = document.querySelector('.landing h1');
const landing = document.querySelector('.landing');

function fitName() {
  nameHeading.style.fontSize = '100px';
  const widestLine = Math.max(...Array.from(nameHeading.children, line => line.getBoundingClientRect().width));
  const heroStyle = getComputedStyle(landing);
  const innerStyle = getComputedStyle(nameHeading.parentElement);
  const availableHeight = landing.clientHeight
    - parseFloat(heroStyle.paddingTop) - parseFloat(heroStyle.paddingBottom)
    - parseFloat(innerStyle.paddingTop) - parseFloat(innerStyle.paddingBottom);
  const scale = Math.min(
    nameHeading.clientWidth / widestLine,
    availableHeight / nameHeading.getBoundingClientRect().height
  );
  nameHeading.style.fontSize = `${100 * scale * 0.98}px`;

  const portrait = document.querySelector('.hero-portrait');
  const inner = nameHeading.parentElement.getBoundingClientRect();
  const surname = nameHeading.lastElementChild.getBoundingClientRect();
  const space = inner.right - surname.right;
  portrait.style.width = `${Math.min(space * 0.75, surname.height * 0.8)}px`;
  portrait.style.left = `${surname.right - inner.left + space / 2}px`;
  portrait.style.top = `${surname.top - inner.top + surname.height / 2}px`;
}

new ResizeObserver(fitName).observe(landing);
document.fonts.ready.then(fitName);

const canvas = document.querySelector('#hover-dots');
const ctx = canvas.getContext('2d');

const spacing = 25;
const reach = 115;
const baseSize = 0.6;
const expandedSize = 3.6;
const motionOff = matchMedia('(prefers-reduced-motion: reduce)').matches;

const pointer = { x: 0, y: 0, inside: false };
const dots = new Map();
let screenWidth;
let screenHeight;
let queued = false;

function requestDraw() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(drawDots);
}

function fitCanvas() {
  const pixelRatio = Math.min(devicePixelRatio || 1, 2);
  screenWidth = innerWidth;
  screenHeight = innerHeight;
  canvas.width = Math.round(screenWidth * pixelRatio);
  canvas.height = Math.round(screenHeight * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  dots.clear();
  requestDraw();
}

function drawDots() {
  queued = false;
  ctx.clearRect(0, 0, screenWidth, screenHeight);

  const pageX = pointer.x + scrollX;
  const pageY = pointer.y + scrollY;

  if (pointer.inside) {
    const firstColumn = Math.max(0, Math.floor((pageX - reach) / spacing));
    const lastColumn = Math.ceil((pageX + reach) / spacing);
    const firstRow = Math.max(0, Math.floor((pageY - reach) / spacing));
    const lastRow = Math.ceil((pageY + reach) / spacing);

    for (let row = firstRow; row <= lastRow; row++) {
      for (let column = firstColumn; column <= lastColumn; column++) {
        const x = column * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;
        if (Math.hypot(x - pageX, y - pageY) > reach) continue;

        const id = `${column}:${row}`;
        if (!dots.has(id)) dots.set(id, { x, y, radius: baseSize });
      }
    }
  }

  let settling = false;
  ctx.fillStyle = '#fff';

  for (const [id, dot] of dots) {
    const distance = pointer.inside ? Math.hypot(dot.x - pageX, dot.y - pageY) : reach;
    const proximity = Math.max(0, 1 - distance / reach);
    const smooth = proximity * proximity * (3 - 2 * proximity);
    const target = baseSize + (expandedSize - baseSize) * smooth;

    dot.radius = motionOff ? target : dot.radius + (target - dot.radius) * 0.19;

    if (Math.abs(dot.radius - target) > 0.015) {
      settling = true;
    } else if (target === baseSize) {
      dots.delete(id);
      continue;
    }

    const x = dot.x - scrollX;
    const y = dot.y - scrollY;
    if (x < 0 || y < 0 || x > screenWidth || y > screenHeight) continue;

    ctx.beginPath();
    ctx.arc(x, y, dot.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (settling) requestDraw();
}

window.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.inside = true;
  requestDraw();
}, { passive: true });

window.addEventListener('pointerout', event => {
  if (event.relatedTarget) return;
  clearPointer();
});

function followTouch(event) {
  pointer.inside = event.touches.length === 1;
  if (pointer.inside) {
    pointer.x = event.touches[0].clientX;
    pointer.y = event.touches[0].clientY;
  }
  requestDraw();
}

function clearPointer() {
  pointer.inside = false;
  requestDraw();
}

// Passive listeners let the page scroll while the dots follow the finger.
window.addEventListener('touchstart', followTouch, { passive: true });
window.addEventListener('touchmove', followTouch, { passive: true });

window.addEventListener('touchend', event => {
  if (event.touches.length === 0) clearPointer();
}, { passive: true });

window.addEventListener('touchcancel', clearPointer, { passive: true });
window.addEventListener('blur', clearPointer);

window.addEventListener('scroll', requestDraw, { passive: true });
window.addEventListener('resize', fitCanvas);
fitCanvas();

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
