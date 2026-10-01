(() => {
  "use strict";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const PROJECTS = [
    {
      title: "HackHive",
      desc: "A Hack Club node for teenage builders at Adarsh Public School. Built with React, Vite, Tailwind. I run the room.",
      tags: ["React", "Tailwind", "Community"],
      image: "assets/hackhive.png",
      link: "https://hackhive.tech",
    },
    {
      title: "Astronomy APOD",
      desc: "A browser start page with NASA’s Astronomy Picture of the Day, a greeting, search, and shortcuts to your favorite sites.",
      tags: ["JavaScript", "Vite", "NASA API"],
      image: "assets/astronomy-apod.webp",
      link: "https://github.com/shreyanshpurohit/astronomy-apod",
    },
    {
      title: "SPOS",
      desc: "A simple WebOS that I made.",
      tags: ["HTML"],
      image: "assets/SPOS.png",
      link: "https://github.com/shreyanshpurohit/SPOS",
    },
    {
      title: "Blade",
      desc: "A desktop web browser with a glass interface, native Chromium tabs, and SQLite storage for history and bookmarks.",
      tags: ["Electron", "React", "SQLite"],
      image: "assets/blade.webp",
      link: "https://github.com/shreyanshpurohit/blade",
    },
  ];

  const grid = document.querySelector(".projects-grid");
  if (grid) {
    grid.innerHTML = PROJECTS.map((p) => `
      <a class="project-card" href="${p.link}" target="_blank" rel="noopener noreferrer" aria-label="${p.title} — open project in a new tab">
        <div class="project-card-inner">
          <div class="project-cover"><img class="project-cover-image" src="${p.image}" alt="${p.title} screenshot" width="960" height="600" loading="lazy" /></div>
          <div class="project-meta"><div class="project-tags">${p.tags.map((t) => `<span class="project-tag">${t}</span>`).join("")}</div></div>
          <div class="project-bottom">
            <div><h3 class="project-title">${p.title}</h3><p class="project-desc">${p.desc}</p></div>
            <span class="project-arrow" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17 17 7M7 7h10v10" /></svg></span>
          </div>
        </div>
      </a>`).join("");
  }

  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuToggle && mobileMenu) {
    const setMenu = (open) => {
      mobileMenu.classList.toggle("open", open);
      mobileMenu.inert = !open;
      document.querySelectorAll(".hero, main, .nav-logo").forEach((element) => { element.inert = open; });
      menuToggle.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
    };
    menuToggle.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileMenu.classList.contains("open")) { setMenu(false); menuToggle.focus(); }
    });
    window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => { if (event.matches) setMenu(false); });
  }

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ease = "cubic-bezier(.16, 1, .3, 1)";
  const faqs = [...document.querySelectorAll(".faq-item")];
  const setFaq = (item, open) => {
    item.classList.toggle("open", open);
    item.querySelector(".faq-q").setAttribute("aria-expanded", String(open));
    const answer = item.querySelector(".faq-a");
    const wasHidden = answer.hidden;
    answer.getAnimations().forEach((animation) => animation.cancel());
    answer.inert = !open;
    if (motionPreference.matches) { answer.hidden = !open; return; }
    if (!open && wasHidden) return;
    answer.hidden = false;
    const frames = [
      { opacity: 0, transform: "translateY(-8px)", clipPath: "inset(0 0 100%)" },
      { opacity: 1, transform: "translateY(0)", clipPath: "inset(0)" },
    ];
    const animation = answer.animate(open ? frames : frames.reverse(), { duration: open ? 350 : 180, easing: ease });
    animation.finished.then(() => { if (!item.classList.contains("open")) answer.hidden = true; }).catch(() => {});
  };
  faqs.forEach((item, index) => {
    const button = item.querySelector(".faq-q");
    const answer = item.querySelector(".faq-a");
    button.id = `question-${index}`;
    answer.id = `answer-${index}`;
    button.setAttribute("aria-controls", answer.id);
    answer.setAttribute("aria-labelledby", button.id);
    setFaq(item, index === 0);
    button.addEventListener("click", () => {
      const open = !item.classList.contains("open");
      faqs.forEach((other) => setFaq(other, other === item && open));
    });
  });
  const hero = document.querySelector(".hero");
  const heroOverlay = document.querySelector(".hero-overlay");
  const heroSpacer = document.querySelector(".hero-spacer");

  if (hero && heroOverlay) {
    const scrollLimit = () => window.innerHeight * 1.5;

    const onScroll = () => {
      const y = window.scrollY;
      const limit = scrollLimit();
      const t = Math.min(1, y / (limit * 0.8));
      const scale = 1 + t * 24;
      const opacity = 1 - Math.max(0, (t - 0.3) / 0.7);
      heroOverlay.style.transform = `scale(${scale.toFixed(3)})`;
      heroOverlay.style.opacity = opacity.toFixed(3);

      if (y > limit) {
        hero.style.visibility = "hidden";
      } else {
        hero.style.visibility = "";
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const name = document.querySelector(".hero-name");
  const nav = document.querySelector(".nav");
  name.setAttribute("aria-label", "Shreyansh Purohit");
  [...name.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const line = document.createElement("span");
      line.textContent = node.textContent.trim();
      node.replaceWith(line);
    }
  });
  name.querySelectorAll("span").forEach((line) => {
    const text = line.textContent;
    line.setAttribute("aria-hidden", "true");
    line.textContent = "";
    [...text].forEach((letter) => {
      const span = document.createElement("span");
      span.className = "hero-letter";
      span.textContent = letter;
      line.append(span);
    });
  });
  if (!motionPreference.matches) {
    name.querySelectorAll(".hero-letter").forEach((letter, index) => {
      letter.animate([
        { transform: "translateY(50px) rotateX(-45deg)", opacity: 0, filter: "blur(5px)" },
        { transform: "translateY(0) rotateX(0)", opacity: 1, filter: "blur(0)" },
      ], { duration: 850, delay: index * 28, easing: ease, fill: "backwards" });
    });
    document.querySelector(".hero-divider").animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 800, delay: 350, easing: ease, fill: "backwards" }
    );
  }

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        revealObserver.unobserve(target);
        if (motionPreference.matches) return;
        const card = target.classList.contains("project-card");
        target.animate([
          { opacity: .15, transform: `translateY(${card ? 40 : 24}px)`, filter: "blur(3px)" },
          { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
        ], { duration: card ? 750 : 600, delay: card ? [...grid.children].indexOf(target) % 2 * 90 : 0, easing: ease });
      });
    }, { threshold: .12 });
    document.querySelectorAll("main .reveal, .project-card, .stack-group").forEach((target) => revealObserver.observe(target));
  }

  let scrollFrame = 0;
  const updateNav = () => {
    scrollFrame = 0;
    const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
    nav.style.setProperty("--scroll-progress", progress);
    nav.classList.toggle("scrolled", window.scrollY > 24);
  };
  const scheduleNav = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateNav); };
  window.addEventListener("scroll", scheduleNav, { passive: true });
  window.addEventListener("resize", scheduleNav);
  updateNav();

  document.querySelectorAll(".project-card").forEach((card) => {
    let frame = 0;
    card.addEventListener("pointermove", (event) => {
      if (motionPreference.matches || event.pointerType !== "mouse") return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.setProperty("--tilt-x", `${-y * 10}deg`);
        card.style.setProperty("--tilt-y", `${x * 12}deg`);
      });
    });
    card.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });

  let heroVisible = true;
  const textTarget = document.getElementById("typewriter");
  const fullText = "build · break · learn · ship · repeat";
  let typingTimer;
  let letterIndex = 0;
  let deleting = false;
  const canRun = () => !motionPreference.matches && heroVisible && !document.hidden;
  const type = () => {
    clearTimeout(typingTimer);
    if (!canRun()) return;
    letterIndex += deleting ? -1 : 1;
    textTarget.textContent = fullText.slice(0, letterIndex);
    let delay = deleting ? 35 : 85;
    if (letterIndex === fullText.length) { deleting = true; delay = 2800; }
    if (letterIndex === 0) { deleting = false; delay = 500; }
    typingTimer = setTimeout(type, delay);
  };

  const canvas = document.getElementById("constellations");
  const context = canvas.getContext("2d");
  let canvasFrame = 0;
  let previousTime = 0;
  let width = 0, height = 0;
  let particles = [];
  const resizeCanvas = () => {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(45, Math.floor(width * height / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
    }));
  };
  const draw = (time) => {
    canvasFrame = 0;
    if (!canRun() || !context) return;
    const delta = Math.min((time - previousTime) / 16.67 || 1, 2);
    previousTime = time;
    context.clearRect(0, 0, width, height);
    particles.forEach((p, index) => {
      p.x += p.vx * delta; p.y += p.vy * delta;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      context.fillStyle = "rgba(60,81,65,.3)";
      context.beginPath(); context.arc(p.x, p.y, 1.5, 0, Math.PI * 2); context.fill();
      for (let j = index + 1; j < particles.length; j++) {
        const q = particles[j];
        const distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (distance > 130) continue;
        context.strokeStyle = `rgba(60,81,65,${(1 - distance / 130) * .15})`;
        context.beginPath(); context.moveTo(p.x, p.y); context.lineTo(q.x, q.y); context.stroke();
      }
    });
    canvasFrame = requestAnimationFrame(draw);
  };
  const syncMotion = () => {
    clearTimeout(typingTimer);
    cancelAnimationFrame(canvasFrame);
    canvasFrame = 0;
    hero.classList.toggle("motion-paused", !canRun());
    if (motionPreference.matches) {
      textTarget.textContent = fullText;
      document.getAnimations().forEach((animation) => animation.cancel());
      faqs.forEach((item) => { item.querySelector(".faq-a").hidden = !item.classList.contains("open"); });
    } else if (canRun()) {
      typingTimer = setTimeout(type, 250);
      if (context) canvasFrame = requestAnimationFrame(draw);
    }
  };
  if (context) {
    resizeCanvas();
    new ResizeObserver(resizeCanvas).observe(hero);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncMotion(); }).observe(hero);
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (entry.isIntersecting) {
          document.querySelectorAll(".nav-links a").forEach((item) => item.removeAttribute("aria-current"));
          link?.setAttribute("aria-current", "location");
        } else { link?.removeAttribute("aria-current"); }
      });
    }, { rootMargin: "-15% 0px -55% 0px" });
    document.querySelectorAll("#about, #projects, #stack").forEach((section) => sectionObserver.observe(section));
  }
  document.addEventListener("visibilitychange", syncMotion);
  motionPreference.addEventListener("change", syncMotion);
  syncMotion();

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
