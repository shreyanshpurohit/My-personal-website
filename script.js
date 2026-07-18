/* ============================================================
   Shreyansh Purohit — personal site
   Vanilla JS: hero zoom, custom cursor, typewriter,
   scroll reveals, project cards, FAQ accordion, mobile menu,
   constellation canvas.
   ============================================================ */

(() => {
  "use strict";

  // ─── Year stamp ────────────────────────────────────────────
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ─── Project data ──────────────────────────────────────────
  const PROJECTS = [
    {
      id: "01",
      title: "HackHive",
      mono: "HH",
      desc: "A Hack Club node for teenage builders at Adarsh Public School. Built with React, Vite, Tailwind. I run the room.",
      tags: ["React", "Tailwind", "Community"],
      image: "assets/hackhive.png",
      link: "https://hackhive.tech",
    },
    {
      id: "02",
      title: "Cash Sorter",
      mono: "$$",
      desc: "A program that sorts cash (mostly change) with a greedy algorithm.",
      tags: ["C"],
      image: "assets/Cash.png",
      link: "https://github.com/shreyanshpurohit/cash-sorter",
    },
    {
      id: "03",
      title: "SPOS",
      mono: "SP",
      desc: "A simple WebOS that I made.",
      tags: ["HTML"],
      image: "assets/SPOS.png",
      link: "https://github.com/shreyanshpurohit/SPOS",
    },
    {
      id: "04",
      title: "Nexus",
      mono: "NX",
      desc: "A weekend experiment that grew teeth. The kind of folder nobody asks for, now sitting in a repo.",
      tags: ["TypeScript", "Vite", "WIP"],
      image: "assets/nexus.png",
      link: "https://github.com/shreyanshpurohit/nexus",
    },
  ];

  // ─── Render project cards ──────────────────────────────────
  const grid = document.querySelector(".projects-grid");
  if (grid) {
    grid.innerHTML = PROJECTS.map(
      (p) => `
      <article class="project-card" data-link="${p.link}" tabindex="0" data-hover>
        <div class="project-card-inner">
          <div class="project-cover${p.image ? " has-image" : ""}">
            <div class="project-cover-bg"></div>
            ${p.image ? `<img class="project-cover-image" src="${p.image}" alt="${p.title} screenshot" loading="lazy" />` : ""}
            <div class="project-cover-mono">${p.mono}</div>
            <div class="project-sweep"></div>
          </div>
          <div>
            <div class="project-meta">
              <span class="project-id">[ ${p.id} ]</span>
              <div class="project-tags">
                ${p.tags.map((t) => `<span class="project-tag">${t}</span>`).join("")}
              </div>
            </div>
            <div class="project-bottom">
              <div>
                <h3 class="project-title">${p.title}</h3>
                <p class="project-desc">${p.desc}</p>
              </div>
              <div class="project-arrow" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </div>
            </div>
          </div>
        </div>
      </article>
    `
    ).join("");

    // 3D tilt on hover
    document.querySelectorAll(".project-card").forEach((card) => {
      const inner = card.querySelector(".project-card-inner");
      let raf = null;

      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          inner.style.transform = `rotateX(${(-py * 14).toFixed(2)}deg) rotateY(${(px * 14).toFixed(2)}deg)`;
        });
      };
      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        inner.style.transform = "";
      };
      const onClick = () => {
        const link = card.getAttribute("data-link");
        if (link && link !== "#") window.open(link, "_blank", "noopener,noreferrer");
      };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("click", onClick);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }
      });
    });
  }

  // ─── Custom cursor ────────────────────────────────────────
  const cursor = document.getElementById("cursor");
  const dot = cursor ? cursor.querySelector(".cursor-dot") : null;
  const ring = cursor ? cursor.querySelector(".cursor-ring") : null;

  if (cursor && dot && ring && window.matchMedia("(pointer: fine)").matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    const setHover = (yes) => cursor.classList.toggle("is-hover", yes);
    document.querySelectorAll("a, button, [data-hover], .project-card").forEach((el) => {
      el.addEventListener("mouseenter", () => setHover(true));
      el.addEventListener("mouseleave", () => setHover(false));
    });

    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
    });
  }

  // ─── Typewriter in hero ───────────────────────────────────
  const typeTarget = document.getElementById("typewriter");
  const TYPE_TEXT = "build · break · learn · ship · repeat";
  if (typeTarget) {
    let i = 0;
    const step = () => {
      if (i <= TYPE_TEXT.length) {
        typeTarget.textContent = TYPE_TEXT.slice(0, i);
        i++;
        setTimeout(step, 70 + Math.random() * 60);
      } else {
        // restart after a pause for a living feel
        setTimeout(() => {
          let j = TYPE_TEXT.length;
          const erase = () => {
            if (j >= 0) {
              typeTarget.textContent = TYPE_TEXT.slice(0, j);
              j--;
              setTimeout(erase, 25);
            } else {
              i = 0;
              setTimeout(step, 400);
            }
          };
          erase();
        }, 2200);
      }
    };
    setTimeout(step, 900);
  }

  // ─── Hero scroll zoom (HackHive-style) ────────────────────
  const hero = document.querySelector(".hero");
  const heroOverlay = document.querySelector(".hero-overlay");
  const heroSpacer = document.querySelector(".hero-spacer");

  if (hero && heroOverlay) {
    const scrollLimit = () => window.innerHeight * 1.5;

    const onScroll = () => {
      const y = window.scrollY;
      const limit = scrollLimit();
      const t = Math.min(1, y / (limit * 0.8));
      const scale = 1 + t * 24;          // zoom in
      const opacity = 1 - Math.max(0, (t - 0.3) / 0.7); // fade after 30%
      heroOverlay.style.transform = `scale(${scale.toFixed(3)})`;
      heroOverlay.style.opacity = opacity.toFixed(3);

      if (y > limit) {
        hero.style.display = "none";
      } else {
        hero.style.display = "";
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ─── Mobile menu ─────────────────────────────────────────
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      menuToggle.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        menuToggle.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  // ─── FAQ accordion ────────────────────────────────────────
  const faqs = document.querySelectorAll(".faq-item");
  if (faqs.length) {
    faqs[0].classList.add("open");
    faqs.forEach((item) => {
      const btn = item.querySelector(".faq-q");
      if (!btn) return;
      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        faqs.forEach((other) => other.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      });
    });
  }

  // ─── Scroll reveal (IntersectionObserver) ────────────────
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in-view"));
  }

  // ─── Parallax page shift on mouse ────────────────────────
  const pageShift = document.querySelector(".page-shift");
  if (pageShift && window.matchMedia("(pointer: fine)").matches) {
    let px = 0, py = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", (e) => {
      px = (e.clientX / window.innerWidth - 0.5) * 20;
      py = (e.clientY / window.innerHeight - 0.5) * 20;
    });
    const loop = () => {
      cx += (px - cx) * 0.06;
      cy += (py - cy) * 0.06;
      pageShift.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  // ─── Constellation canvas ─────────────────────────────────
  const canvas = document.getElementById("constellations");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    let particles = [];
    let raf = null;

    const COUNT = () => Math.min(90, Math.floor((w * h) / 18000));

    const resize = () => {
      w = canvas.clientWidth = window.innerWidth;
      h = canvas.clientHeight = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = new Array(COUNT()).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.4 + 0.4,
      }));
    };

    // Spatial hashing grid for fast neighbour lookup (O(N) instead of O(N²))
    const CELL = 90;
    const grid = new Map();
    const buildGrid = () => {
      grid.clear();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.floor(p.x / CELL);
        const cy = Math.floor(p.y / CELL);
        const key = cx + "," + cy;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(i);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      buildGrid();

      // Lines between nearby particles
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.floor(p.x / CELL);
        const cy = Math.floor(p.y / CELL);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const bucket = grid.get(cx + dx + "," + (cy + dy));
            if (!bucket) continue;
            for (const j of bucket) {
              if (j <= i) continue;
              const q = particles[j];
              const ax = q.x - p.x;
              const ay = q.y - p.y;
              const dist = Math.sqrt(ax * ax + ay * ay);
              if (dist < 120) {
                const a = (1 - dist / 120) * 0.22;
                ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    // Pause when tab hidden, to save CPU
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      } else if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    });

    window.addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(draw);
  }

  // ─── Smooth-scroll anchor handling for nav links ──────────
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
})();

