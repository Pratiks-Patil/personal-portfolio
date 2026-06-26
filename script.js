/* ═══════════════════════════════════════════════════════════
   PRATIK'S PORTFOLIO — SCRIPT.JS
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Utilities ─────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══════════════════════════════════════════════════════════
   1. BACKGROUND CANVAS — Particles + blobs
   ═══════════════════════════════════════════════════════════ */
(function initBgCanvas() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, blobs, animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticles() {
    particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.4 + 0.05,
    }));
  }

  function makeBlobs() {
    blobs = [
      { x: W * 0.15, y: H * 0.25, r: 320, color: 'rgba(0,245,255,0.025)',  vx: 0.12, vy: 0.08 },
      { x: W * 0.80, y: H * 0.60, r: 260, color: 'rgba(124,58,237,0.03)',  vx: -0.10, vy: 0.10 },
      { x: W * 0.50, y: H * 0.80, r: 200, color: 'rgba(236,72,153,0.02)', vx: 0.08,  vy: -0.12 },
    ];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Grid texture
    ctx.save();
    ctx.strokeStyle = 'rgba(0,245,255,0.025)';
    ctx.lineWidth = 0.5;
    const gridSize = 80;
    for (let x = 0; x < W; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    // Blobs
    blobs.forEach(b => {
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.r || b.x > W + b.r) b.vx *= -1;
      if (b.y < -b.r || b.y > H + b.r) b.vy *= -1;
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, b.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#00f5ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    makeParticles();
    makeBlobs();
    if (!prefersReducedMotion()) draw();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    makeParticles();
    makeBlobs();
    if (!prefersReducedMotion()) draw();
  });

  init();
})();

/* ═══════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════ */
(function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const cursor    = $('#cursor');
  const cursorDot = $('#cursor-dot');
  if (!cursor || !cursorDot) return;

  let mx = -100, my = -100;
  let cx = -100, cy = -100;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    cx = lerp(cx, mx, 0.14);
    cy = lerp(cy, my, 0.14);
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    raf = requestAnimationFrame(loop);
  }

  if (!prefersReducedMotion()) loop();
  else {
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
    });
  }
})();

/* ═══════════════════════════════════════════════════════════
   3. NAVBAR — scroll state + mobile menu
   ═══════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#nav-hamburger');
  const navLinks = $('#nav-links');
  if (!navbar) return;

  // Scroll state
  function onScroll() {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    navLinks?.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
      navLinks?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active section highlight
  const sections = $$('section[id]');
  const navItems = $$('.nav-link[data-section]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(item => {
          item.classList.toggle('active', item.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ═══════════════════════════════════════════════════════════
   4. TYPING EFFECT
   ═══════════════════════════════════════════════════════════ */
(function initTyping() {
  const el = $('#typing-text');
  if (!el) return;

  const words = [
  
  "Cloud Solutions☁️",
  "on AWS 🚀",
  "DevOps Pipelines ⚙️",
  "Python Applications 🐍",
  "Linux Automation 🐧",
  "Scalable Systems💡"

  ];

  let wordIdx = 0, charIdx = 0, deleting = false;
  const typeSpeed = 80, deleteSpeed = 45, pauseAfter = 1800, pauseBefore = 400;

  function tick() {
    const word = words[wordIdx];

    if (!deleting) {
      el.textContent = word.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === word.length) {
        deleting = true;
        setTimeout(tick, pauseAfter);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      el.textContent = word.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        setTimeout(tick, pauseBefore);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }

  setTimeout(tick, 800);
})();

/* ═══════════════════════════════════════════════════════════
   5. SCROLL REVEAL
   ═══════════════════════════════════════════════════════════ */
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  if (prefersReducedMotion()) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children within same parent
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, Number(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // Add stagger delays to sibling reveals
  const groups = {};
  els.forEach(el => {
    const parent = el.parentElement;
    const key = parent ? parent.className : 'root';
    if (!groups[key]) groups[key] = [];
    groups[key].push(el);
  });

  Object.values(groups).forEach(group => {
    group.forEach((el, i) => {
      el.dataset.delay = i * 100;
      observer.observe(el);
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   6. ORBIT TECH STACK
   ═══════════════════════════════════════════════════════════ */
(function initOrbit() {
  const container = $('#orbit-logos');
  const tooltip   = $('#tech-tooltip');
  const system    = $('#orbit-system');
  if (!container || !system) return;

  // Tech data — emoji icons for zero-dependency logo display
  // Replace emoji with <img src="assets/logos/..."> once you have SVGs
  const techs = [
  // Ring 1 - Cloud & DevOps
  { name: "AWS",        icon: "assets/logos/aws.png",        ring: 1, angle: 0 },
  { name: "Jenkins",      icon: "assets/logos/jenkins.png",      ring: 1, angle: 72 },
  { name: "Docker",     icon: "assets/logos/docker.png",     ring: 1, angle: 144 },
  { name: "Kubernetes", icon: "assets/logos/kubernetes.png", ring: 1, angle: 216 },
  { name: "Linux",      icon: "assets/logos/linux.png",      ring: 1, angle: 288 },

  // Ring 2 - Languages & Frameworks
  { name: "Python", icon: "assets/logos/python.png", ring: 2, angle: 0 },
  { name: "C++",    icon: "assets/logos/cpp.png",    ring: 2, angle: 72 },
  { name: "HTML5",  icon: "assets/logos/html5.png",   ring: 2, angle: 144 },
  { name: "CSS3",   icon: "assets/logos/css3.png",    ring: 2, angle: 216 },
  { name: "Django",  icon: "assets/logos/django.png",  ring: 2, angle: 288 },

  // Ring 3 - Tools & Databases
  { name: "Git",        icon: "assets/logos/git.png",        ring: 3, angle: 0 },
  { name: "GitHub",     icon: "assets/logos/github.png",     ring: 3, angle: 51.5 },
  { name: "Oracle",     icon: "assets/logos/oracle.png",     ring: 3, angle: 103 },
  { name: "SQLite",      icon: "assets/logos/sqlite.png",      ring: 3, angle: 154.5 },
  { name: "VS Code",    icon: "assets/logos/vscode.png",     ring: 3, angle: 206 },
  { name: "Colab",  icon: "assets/logos/colab.png",  ring: 3, angle: 257.5 },
  { name: "Mongodb",  icon: "assets/logos/mongodb.png",  ring: 3, angle: 309 }
];

  // Ring config: radius as fraction of container width, angular speed (deg/s)
  const rings = {
  1: { radiusFrac: 0.22, speed: 12 },
  2: { radiusFrac: 0.33, speed: 8 },
  3: { radiusFrac: 0.44, speed: 5 },
};

  // Build DOM elements
  const logoEls = techs.map(tech => {
    const el = document.createElement('div');
    el.className = 'orbit-logo';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', tech.name);

    const inner = document.createElement('div');
    inner.className = "orbit-logo-inner";

const img = document.createElement("img");
img.src = tech.icon;
img.alt = tech.name;
img.draggable = false;
img.loading = "lazy";

inner.appendChild(img);

    el.appendChild(inner);
    container.appendChild(el);

    // Hover events
    el.addEventListener('mouseenter', e => {
      showTooltip(e, tech.name);
      el._paused = true;
    });
    el.addEventListener('mouseleave', () => {
      hideTooltip();
      el._paused = false;
    });
    el.addEventListener('mousemove', e => {
      moveTooltip(e);
    });

    return { el, tech, angle: tech.angle };
  });

  // Tooltip helpers
  function showTooltip(e, text) {
    if (!tooltip) return;
    tooltip.textContent = text;
    tooltip.classList.add('visible');
    tooltip.removeAttribute('aria-hidden');
    moveTooltip(e);
  }
  function hideTooltip() {
    if (!tooltip) return;
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
  }
  function moveTooltip(e) {
    if (!tooltip) return;
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top  = (e.clientY - 28) + 'px';
  }

  // Animation
  let last = null;
  let systemSize = system.offsetWidth;
  let paused = false;

  function getRadius(ring) {
    return systemSize * rings[ring].radiusFrac;
  }

  function recomputeSize() {
    systemSize = system.offsetWidth;
  }

  window.addEventListener('resize', recomputeSize);

  function animate(ts) {
    if (!last) last = ts;
    const dt = (ts - last) / 1000; // seconds
    last = ts;

    logoEls.forEach(item => {
      if (!item.el._paused) {
        const spd = rings[item.tech.ring].speed;
        item.angle += spd * dt;
      }

      const rad = getRadius(item.tech.ring);
      const a   = (item.angle * Math.PI) / 180;
      const cx  = systemSize / 2;
      const cy  = systemSize / 2;
      const x   = cx + rad * Math.cos(a);
      const y   = cy + rad * Math.sin(a);

      item.el.style.left = `${x - 26}px`;
item.el.style.top  = `${y - 26}px`;
    });

    requestAnimationFrame(animate);
  }

  if (!prefersReducedMotion()) {
    requestAnimationFrame(animate);
  } else {
    // Static layout in reduced motion
    logoEls.forEach(item => {
      const rad = getRadius(item.tech.ring);
      const a   = (item.angle * Math.PI) / 180;
      const cx  = systemSize / 2;
      const cy  = systemSize / 2;
      item.el.style.left = `${cx + rad * Math.cos(a) - 26}px`;
item.el.style.top  = `${cy + rad * Math.sin(a) - 26}px`;
    });
  }
})();

/* ═══════════════════════════════════════════════════════════
   7. CONTACT FORM
   ═══════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form   = $('#contact-form');
  const status = $('#form-status');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');

    // Basic client validation
    const name    = $('#cf-name', form).value.trim();
    const email   = $('#cf-email', form).value.trim();
    const message = $('#cf-message', form).value.trim();

    if (!name || !email || !message) {
      setStatus('Please fill in all fields.', true);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Please enter a valid email.', true);
      return;
    }

    // Simulate send (replace with real endpoint)
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    await new Promise(r => setTimeout(r, 1400));

    setStatus('Message sent! I\'ll get back to you soon. ✓');
    form.reset();
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Send Message';
  });

  function setStatus(msg, isError = false) {
    if (!status) return;
    status.textContent = msg;
    status.className = 'form-status' + (isError ? ' error' : '');
    if (!isError) setTimeout(() => { status.textContent = ''; }, 5000);
  }
})();

/* ═══════════════════════════════════════════════════════════
   8. STAGGER HERO ELEMENTS ON LOAD
   ═══════════════════════════════════════════════════════════ */
(function initHeroEntrance() {
  if (prefersReducedMotion()) return;

  const items = [
    '.hero-greeting',
    '.hero-name',
    '.hero-role',
    '.hero-intro',
    '.hero-cta',
    '.hero-social',
    '.hero-avatar-wrap',
  ];

  items.forEach((sel, i) => {
    const el = $(sel);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      el.style.opacity = '';
      el.style.transform = '';
    }, 200 + i * 110);
  });
})();

/* ═══════════════════════════════════════════════════════════
   9. SMOOTH ACTIVE NAV ON CLICK
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id  = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
/* ===========================
   Dark / Light Mode
=========================== */

const themeBtn = document.getElementById("theme-toggle");
const themeIcon = document.querySelector(".theme-icon");

// Restore saved preference
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light-mode");
  themeIcon.textContent = "☀️";
}

themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("light-mode");

  const light = document.body.classList.contains("light-mode");

  themeIcon.textContent = light ? "☀️" : "🌙";

  localStorage.setItem(
    "theme",
    light ? "light" : "dark"
  );
});