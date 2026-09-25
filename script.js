// @ts-nocheck — plain JavaScript project: skip TS type-checking (no runtime effect)
// ============================================================
//  SNM PORTFOLIO — Premium Motion Engine
// ============================================================
(() => {
  'use strict';

  const isMobile = window.innerWidth < 768;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentLang = localStorage.getItem('lang') || 'en';

  /* ================= PRELOADER + SPLIT TEXT ================= */
  const preloader = document.getElementById('preloader');
  const preCounter = document.getElementById('preCounter');
  const preBar = document.getElementById('preBar');
  const heroTitle = document.querySelector('.hero-title');

  // Prepare split-text: wrap every word in a mask
  let splitWords = [];
  if (heroTitle && !reducedMotion) {
    const words = heroTitle.textContent.trim().split(/\s+/);
    heroTitle.innerHTML = words.map((w, i) =>
      `<span class="split-word"><span class="word-inner" style="--word-delay:${140 + i * 90}ms">${w}</span></span>`
    ).join(' ');
    splitWords = [...heroTitle.querySelectorAll('.split-word')];
  }

  function finishLoading() {
    if (preloader && preloader.classList.contains('done')) return;
    document.body.classList.remove('loading');
    if (preloader) preloader.classList.add('done');
    // Reveal split words right after the preloader starts fading.
    // rAF for smoothness + timeout fallback so it can never get stuck.
    const revealWords = () => heroTitle && heroTitle.classList.add('split-ready');
    requestAnimationFrame(() => requestAnimationFrame(revealWords));
    setTimeout(revealWords, 120);
    setTimeout(revealWords, 600); // absolute failsafe
  }

  (function runPreloader() {
    if (!preloader || reducedMotion) { finishLoading(); return; }
    // Failsafe: never trap the user behind the preloader
    const failSafe = setTimeout(finishLoading, 3500);
    const started = performance.now();
    const MIN_MS = 1300;
    let current = 0;
    let loaded = document.readyState === 'complete';

    window.addEventListener('load', () => { loaded = true; });

    function tick(now) {
      const elapsed = now - started;
      const target = loaded ? 100 : Math.min(88, (elapsed / MIN_MS) * 88);
      // ease current toward target
      current += (target - current) * 0.12;
      const shown = Math.min(100, Math.round(current));
      preCounter.textContent = shown;
      preBar.style.width = shown + '%';

      if (shown >= 100 && elapsed >= MIN_MS) {
        clearTimeout(failSafe);
        preCounter.textContent = 100;
        preBar.style.width = '100%';
        setTimeout(finishLoading, 220);
        return;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ================= CURSOR GLOW ================= */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && canHover) {
    let gx = 0, gy = 0, glowRaf = false;
    document.addEventListener('mousemove', e => {
      gx = e.clientX; gy = e.clientY;
      if (!glowRaf) {
        glowRaf = true;
        requestAnimationFrame(() => {
          cursorGlow.style.left = gx + 'px';
          cursorGlow.style.top = gy + 'px';
          glowRaf = false;
        });
      }
    }, { passive: true });
  }

  /* ================= PARTICLES (DPR-capped, visibility-aware) ================= */
  const canvas = document.getElementById('particles');
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let particles = [];
    let particleCount = isMobile ? 20 : 60;
    let W = 0, H = 0, particlesVisible = true;

    function resizeCanvas() {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) particles.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1
      });
    }
    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16,185,129,${p.alpha})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      }
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(16,185,129,${0.06 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      requestAnimationFrame(drawParticles);
    }
    resizeCanvas(); initParticles();
    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

    // Single guarded loop: only draws when visible & tab active
    let chainRunning = false;
    const startChain = () => {
      if (chainRunning) return;
      chainRunning = true;
      const loop = () => {
        if (particlesVisible && !document.hidden) { drawParticles(); chainRunning = false; return; }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => {
      particlesVisible = e.isIntersecting;
      if (e.isIntersecting) startChain();
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) startChain(); });
    startChain();
  }

  /* ================= TYPED EFFECT ================= */
  const subtitleEl = document.querySelector('.hero-subtitle .accent');
  if (subtitleEl && !reducedMotion) {
    const wordSets = {
      en: ['AI Engineer & Graphic Designer', 'AI Engineer & Web Developer', 'AI Engineer & Creative Innovator'],
      id: ['AI Engineer & Desainer Grafis', 'AI Engineer & Web Developer', 'AI Engineer & Innovator Kreatif']
    };
    let wi = 0, ci = 0, deleting = false;
    const cursor = document.createElement('span');
    cursor.className = 'typed-cursor';
    subtitleEl.after(cursor);
    subtitleEl.textContent = '';

    (function type() {
      const words = wordSets[currentLang] || wordSets.en;
      const word = words[wi % words.length];
      if (!deleting) {
        subtitleEl.textContent = word.slice(0, ++ci);
        if (ci >= word.length) { deleting = true; setTimeout(type, 1800); return; }
      } else {
        subtitleEl.textContent = word.slice(0, --ci);
        if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
      }
      setTimeout(type, deleting ? 50 : 90);
    })();
  } else if (subtitleEl) {
    subtitleEl.textContent = 'AI Engineer & Graphic Designer';
  }

  /* ================= COUNTER ANIMATION ================= */
  function animateCounter(el, target, suffix = '') {
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.textContent.includes('+')) {
        animateCounter(e.target, parseInt(e.target.textContent), '+');
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(el => counterObs.observe(el));

  /* ================= SCROLL REVEAL ================= */
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.getAttribute('data-delay') || 0);
        setTimeout(() => e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    const parent = el.parentElement;
    const siblings = parent ? [...parent.querySelectorAll(':scope > .reveal')] : [];
    if (siblings.length > 1 && !el.hasAttribute('data-delay'))
      el.setAttribute('data-delay', siblings.indexOf(el) * 100);
    revealObs.observe(el);
  });

  // Show elements already in viewport on load
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 50) {
        const delay = parseInt(el.getAttribute('data-delay') || 0);
        setTimeout(() => el.classList.add('visible'), delay);
      }
    });
  }, 300);

  /* ================= SKILL BARS ================= */
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skillbar-fill').forEach((bar, i) => {
          setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 120);
        });
        skillObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skillbars-col').forEach(col => skillObs.observe(col));

  /* ================= SPOTLIGHT CARDS ================= */
  if (canHover && !reducedMotion) {
    document.querySelectorAll('.spotlight-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* ================= MAGNETIC BUTTONS ================= */
  if (canHover && !reducedMotion) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        btn.style.transform = `translate(${x * 14}px, ${y * 10}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ================= CARD TILT (desktop) ================= */
  if (canHover && !isMobile && !reducedMotion) {
    document.querySelectorAll('.exp-card, .project-card, .skill-category').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ================= SCROLL PROGRESS + NAVBAR ================= */
  const progressBar = document.getElementById('scrollProgress');
  const navbar = document.querySelector('.navbar');
  let scrollScheduled = false;
  function onScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBar) progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 30);
      scrollScheduled = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ================= ACTIVE NAV LINK (IO-based) ================= */
  const navLinksList = document.querySelectorAll('.nav-links a');
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinksList.forEach(a =>
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)
        );
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));

  /* ================= HAMBURGER ================= */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  /* ================= I18N ================= */
  // currentLang is declared at the top of this module (needed earlier by typed effect)

  function applyLang(lang) {
    const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) || TRANSLATIONS.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key === 'hero.subtitle') return;
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const v = t[el.getAttribute('data-i18n-placeholder')];
      if (v !== undefined) el.setAttribute('placeholder', v);
    });
    document.documentElement.lang = lang;
    // Text-only toggle: label shows the language you can switch TO.
    const label = document.getElementById('langLabel');
    if (label) label.textContent = lang === 'en' ? 'ID' : 'EN';
  }

  applyLang(currentLang);

  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    localStorage.setItem('lang', currentLang);
    applyLang(currentLang);
  });

  /* ================= 3D COVERFLOW CAROUSEL ================= */
  try {
  document.querySelectorAll('[data-carousel]').forEach(root => {
    const stage = root.querySelector('.dc-stage');
    const track = root.querySelector('.dc-track');
    const cards = [...track.children];
    const dotsWrap = root.querySelector('.dc-dots');
    const prevBtn = root.querySelector('.dc-prev');
    const nextBtn = root.querySelector('.dc-next');
    if (!stage || !track || cards.length === 0 || !dotsWrap || !prevBtn || !nextBtn) return;

    let index = 0, pitch = 0, offset0 = 0, txBase = 0;
    let dragging = false, startX = 0, startTx = 0, moved = 0;

    cards.forEach((_, k) => {
      const d = document.createElement('button');
      d.className = 'dc-dot' + (k === 0 ? ' active' : '');
      d.setAttribute('aria-label', (k + 1) + ' / ' + cards.length);
      d.addEventListener('click', () => goTo(k));
      dotsWrap.appendChild(d);
    });
    const dots = [...dotsWrap.children];

    function measure() {
      cards.forEach(c => c.removeAttribute('data-rel'));
      track.classList.add('dragging');
      track.style.transform = 'translate3d(0,0,0)';
      const r0 = cards[0].getBoundingClientRect();
      const r1 = cards.length > 1 ? cards[1].getBoundingClientRect() : r0;
      pitch = (r1.left - r0.left) || r0.width * 1.14;
      const st = stage.getBoundingClientRect();
      offset0 = (r0.left + r0.width / 2) - (st.left + st.width / 2);
      txBase = -offset0;
      void track.offsetWidth;
      track.classList.remove('dragging');
    }

    function update(animate = true) {
      cards.forEach((c, k) => {
        const rel = k - index;
        if (Math.abs(rel) <= 3) c.setAttribute('data-rel', String(rel));
        else c.removeAttribute('data-rel');
        c.style.transform = '';
      });
      txBase = -offset0 - index * pitch;
      if (!animate) {
        track.classList.add('dragging');
        track.style.transform = 'translate3d(' + txBase + 'px,0,0)';
        void track.offsetWidth;
        track.classList.remove('dragging');
      } else {
        track.classList.remove('dragging');
        track.style.transform = 'translate3d(' + txBase + 'px,0,0)';
      }
      dots.forEach((d, k) => d.classList.toggle('active', k === index));
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === cards.length - 1;
    }

    function goTo(i) {
      index = Math.max(0, Math.min(cards.length - 1, i));
      update(true);
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));

    track.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      dragging = true; moved = 0;
      startX = e.clientX; startTx = txBase;
      track.classList.add('dragging');
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', e => {
      if (!dragging) return;
      moved = e.clientX - startX;
      track.style.transform = 'translate3d(' + (startTx + moved) + 'px,0,0)';
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      const step = Math.abs(moved) > 8
        ? Math.max(-2, Math.min(2, Math.round(-moved / (pitch * 0.5)) || (moved < 0 ? 1 : -1)))
        : 0;
      goTo(index + step);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    // suppress accidental clicks on buttons right after a drag
    track.addEventListener('click', e => {
      if (Math.abs(moved) > 8) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);

    stage.setAttribute('tabindex', '0');
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    });

    let rT;
    window.addEventListener('resize', () => {
      clearTimeout(rT);
      rT = setTimeout(() => { measure(); update(false); }, 150);
    });

    measure();
    update(false);
  });
  } catch (err) { console.warn('Carousel init skipped:', err); }

  /* ================= ABOUT PHOTO SLIDESHOW ================= */
  const aboutSlides = document.querySelectorAll('.about-slide');
  if (aboutSlides.length > 1) {
    let current = 0;
    setInterval(() => {
      aboutSlides[current].classList.remove('active');
      current = (current + 1) % aboutSlides.length;
      aboutSlides[current].classList.add('active');
    }, 3500);
  }

  /* ================= PROJECT MODAL ================= */
  function openProjectModal(url, title) {
    const modal = document.getElementById('projModal');
    const frame = document.getElementById('projModalFrame');
    document.getElementById('projModalTitle').textContent = title;
    document.getElementById('projModalOpen').href = url;
    document.getElementById('projModalFallbackLink').href = url;
    document.getElementById('projModalFallback').classList.remove('show');
    frame.src = url;
    frame._timer = setTimeout(() => {
      try { if (!frame.contentDocument) document.getElementById('projModalFallback').classList.add('show'); }
      catch { document.getElementById('projModalFallback').classList.add('show'); }
    }, 5000);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeProjectModal() {
    const frame = document.getElementById('projModalFrame');
    clearTimeout(frame._timer);
    frame.src = '';
    document.getElementById('projModal').classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('projModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeProjectModal();
  });

  /* ================= VIDEO MODAL ================= */
  function openVideoModal(url) {
    document.getElementById('videoFrame').src = url + '?autoplay=1';
    document.getElementById('videoModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeVideoModal() {
    document.getElementById('videoFrame').src = '';
    document.getElementById('videoModal').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ================= DESIGN FILTER ================= */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      document.querySelectorAll('.design-card').forEach(c =>
        c.classList.toggle('hidden', f !== 'all' && c.getAttribute('data-category') !== f)
      );
    });
  });

  /* ================= LIGHTBOX ================= */
  function openLightbox(btn) {
    const img = btn.closest('.design-img-wrap').querySelector('img');
    if (!img) return;
    document.getElementById('lightboxImg').src = img.src;
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeLightbox(); closeProjectModal(); closeVideoModal(); }
  });

  /* ================= CONTACT FORM ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[currentLang]) || TRANSLATIONS.en;

    btn.textContent = currentLang === 'id' ? 'Mengirim...' : 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        btn.textContent = currentLang === 'id' ? '✅ Pesan Terkirim!' : '✅ Message Sent!';
        btn.style.background = '#10b981';
        btn.style.opacity = '1';
        e.target.reset();
      } else throw new Error('Failed');
    } catch {
      btn.textContent = currentLang === 'id' ? '❌ Gagal, coba lagi' : '❌ Failed, try again';
      btn.style.background = '#ef4444';
      btn.style.opacity = '1';
    }
    setTimeout(() => {
      btn.innerHTML = t['contact.form.send'];
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }

  /* ================= ID CARD LANYARD (CANVAS PHYSICS) ================= */
  (function () {
    const card = document.getElementById('idCard');
    const scene = document.getElementById('lanyardScene');
    const lcanvas = document.getElementById('lanyardCanvas');
    const lcanvasFront = document.getElementById('lanyardCanvasFront');
    if (!card || !scene || !lcanvas || !lcanvasFront) return;

    const ctx = lcanvas.getContext('2d');
    const ctxF = lcanvasFront.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let W, H, CARD_W, CARD_H, REST_X, REST_Y, offX = 0, offY = 0;
    let cx = 0, cy = 0, vx = 0, vy = 0;
    let isDragging = false, dox = 0, doy = 0;
    let downX = 0, downY = 0;
    let lastTouchEnd = 0; // ignore emulated mouse events fired right after touch

    // ---- flip: JS-driven spring so the lanyard can follow the spin ----
    let flipped = false, spinY = 0, spinV = 0, spinRest = 0, spinActive = false;
    let glowActive = 0; // card glow boost while flipping

    function flipCard() {
      flipped = !flipped;
      spinRest += 180; // always roll forward; faces alternate 0/180/360...
      spinActive = true;
      glowActive = 1;
      spinV += 26; // flick impulse -> card overshoots into a full-ish spin
    }
    const STIFF = 0.009, DAMP = 0.75, BOUNCE = 1.4;

    function resize() {
      for (const cv of [lcanvas, lcanvasFront]) {
        cv.width = window.innerWidth * DPR;
        cv.height = window.innerHeight * DPR;
        cv.style.width = window.innerWidth + 'px';
        cv.style.height = window.innerHeight + 'px';
      }
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctxF.setTransform(DPR, 0, 0, DPR, 0, 0);
      CARD_W = card.offsetWidth || 220;
      CARD_H = card.offsetHeight || 390;
      // pendulum pivot: the slot hole (top-center of the card). CSS rotate
      // now spins the card around its strap attachment point
      card.style.transformOrigin = (CARD_W / 2) + 'px 18px';
      computeRest();
      if (cx === 0 && cy === 0) { cx = REST_X; cy = REST_Y; }
      placeAtRest();
    }

    // The card is position:fixed but lives inside .hero-left which carries a
    // CSS transform, making that box its containing block. All card coords
    // are therefore kept in .hero-left space (offX/offY = box origin in
    // viewport coords) so physics, drag and rendering stay consistent.
    function computeRest() {
      const r = scene.getBoundingClientRect();
      const box = card.closest('.hero-left') || scene.parentElement;
      const br = box.getBoundingClientRect();
      offX = br.left; offY = br.top;
      REST_X = (window.innerWidth < 768 ? window.innerWidth / 2 : r.left + r.width / 2) - offX;
      REST_Y = (r.top + r.height * 0.42) - offY;
    }

    function placeAtRest() {
      card.style.left = (cx - CARD_W / 2) + 'px';
      card.style.top = (cy - CARD_H / 2) + 'px';
    }

    // Crossed strap: LEFT leg behind the card, RIGHT leg in front — both
    // end inside the slot so they read as one strap through the hole.
    function drawStrapLeg(c, ax, ay2, ex, ey, sign) {
      // flip swing: anchor rocks sideways (bottom stays pinned to the slot)
      const swingA = Math.sin(spinY * Math.PI / 180) * 0.4;
      const axx = ax + Math.sin(swingA) * 34;
      // ...plus a whip bump that travels down while spinning
      const whip = Math.max(-1, Math.min(1, spinV / 26)) * 34;
      const dx = ex - axx, dy = ey - ay2;
      const len = Math.sqrt(dx * dx + dy * dy);
      const sag = len * 0.06 + 4; // taut strap
      const cpx = (axx + ex) / 2 + whip * sign;
      const cpy = (ay2 + ey) / 2 + sag;

      c.beginPath();
      c.moveTo(axx, ay2);
      c.quadraticCurveTo(cpx, cpy, ex, ey);
      const g = c.createLinearGradient(axx, ay2, ex, ey);
      g.addColorStop(0, '#042b18');
      g.addColorStop(0.3, '#10B981');
      g.addColorStop(0.5, '#34D399');
      g.addColorStop(0.7, '#10B981');
      g.addColorStop(1, '#042b18');
      c.strokeStyle = g;
      c.lineWidth = 13; c.lineCap = 'round'; c.stroke();

      c.beginPath();
      c.moveTo(axx, ay2);
      c.quadraticCurveTo(cpx, cpy, ex, ey);
      c.strokeStyle = 'rgba(255,255,255,0.16)';
      c.lineWidth = 3; c.stroke();
    }

    function drawLanyard() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctxF.clearRect(0, 0, window.innerWidth, window.innerHeight);
      // both legs pin to the card SLOT; the projected rect shrinks with
      // the 3D spin, so ends converge mid-plane mid-flip
      const holeRect = card.querySelector('.id-card-hole').getBoundingClientRect();
      const hw = holeRect.width * 0.22; // ends a hair apart inside the hole
      const hx = holeRect.left + holeRect.width / 2;
      const hy = holeRect.top + holeRect.height / 2;

      const r = scene.getBoundingClientRect();
      const midX = window.innerWidth < 768 ? window.innerWidth / 2 : r.left + r.width / 2;
      // wide anchors up top, tight ends at the slot: a real lanyard V
      const spL = 36, spR = 54, ay = 64;

      // left leg -> BEHIND the card, dives into the slot
      drawStrapLeg(ctx, midX - spL, ay, hx - hw, hy, -1);
      // right leg -> in FRONT of the card, crosses the face, into the slot
      drawStrapLeg(ctxF, midX + spR, ay, hx + hw, hy, 1);
    }

    function stepSpin() {
      if (glowActive > 0) glowActive = Math.max(0, glowActive - 0.006); // fade after flip
      if (!spinActive) return;
      const dist = spinRest - spinY;
      spinV += dist * 0.12;   // spring toward target face
      spinV *= 0.86;          // damping
      spinY += spinV;
      if (Math.abs(dist) < 0.4 && Math.abs(spinV) < 0.4) {
        spinY = spinRest; spinV = 0; spinActive = false;
        // renormalize both angles (visually identical) so the spin distance
        // never grows across flips
        const k = Math.floor(spinRest / 360) * 360;
        if (k) { spinY -= k; spinRest -= k; }
      }
    }

    function applyCard() {
      card.style.position = 'fixed';
      card.style.left = (cx - CARD_W / 2) + 'px';
      card.style.top = (cy - CARD_H / 2) + 'px';

      // pendulum swing: with the pivot at the slot, the card aligns along
      // the strap direction — pull right and the bottom trails right
      // (positive CSS rotation moves the bottom tip LEFT, hence the minus)
      const rotZ = Math.max(-16, Math.min(16, -(cx - REST_X) * 0.06));
      let tiltX = 0, tiltY = 0;
      if (isDragging) {
        tiltX = Math.max(-15, Math.min(15, -vy * 0.8));
        tiltY = Math.max(-15, Math.min(15, vx * 0.8));
      }
      // flip angle now lives on the card itself (faces are flat children)
      const spinRad = spinY * Math.PI / 180;
      card.style.transform = `rotate(${rotZ}deg) perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateY(${spinY}deg)`;
      card.style.zIndex = '990';
      card.style.setProperty('--shine-x', (50 + tiltY * 2) + '%');
      card.style.setProperty('--shine-y', (50 - tiltX * 2) + '%');
      // edge glow boost while spinning (strongest near 90deg edge-on)
      const edge = Math.abs(Math.sin(spinRad));
      card.style.setProperty('--card-glow', edge.toFixed(3));
      card.style.boxShadow = edge > 0.05
        ? `0 20px 60px rgba(0,0,0,0.6), 0 0 ${18 + edge * 44}px rgba(16,185,129,${0.28 * edge + glowActive * 0.25})`
        : (glowActive > 0.02
          ? `0 20px 60px rgba(0,0,0,0.6), 0 0 ${14 + glowActive * 26}px rgba(16,185,129,${0.3 * glowActive})`
          : '0 20px 60px rgba(0,0,0,0.6), 0 0 32px rgba(16,185,129,0.20), 0 0 90px rgba(16,185,129,0.10)');
    }

    function loop() {
      if (document.hidden) { requestAnimationFrame(loop); return; }
      if (!isDragging) {
        computeRest();
        const dx = REST_X - cx, dy = REST_Y - cy;
        if (Math.abs(vx) + Math.abs(vy) + Math.abs(dx) + Math.abs(dy) > 0.3) {
          vx = (vx + dx * STIFF) * DAMP;
          vy = (vy + dy * STIFF) * DAMP;
          cx += vx; cy += vy;
        } else { cx = REST_X; cy = REST_Y; vx = 0; vy = 0; }
      }
      const heroVisible = scene.getBoundingClientRect().bottom > 0 &&
                          scene.getBoundingClientRect().top < window.innerHeight;
      lcanvas.style.display = heroVisible ? '' : 'none';
      lcanvasFront.style.display = heroVisible ? '' : 'none';
      card.style.display = heroVisible ? '' : 'none';
      stepSpin();
      if (heroVisible) { drawLanyard(); applyCard(); }
      requestAnimationFrame(loop);
    }

    function getPos(e) {
      const s = e.touches ? e.touches[0] : e;
      return { x: s.clientX, y: s.clientY };
    }
    card.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      // ignore the emulated mouse events browsers fire right after a tap;
      // without this the flip runs twice on mobile and snaps back to the front
      if (performance.now() - lastTouchEnd < 600) return;
      e.preventDefault(); isDragging = true;
      downX = e.clientX; downY = e.clientY;
      card.style.cursor = 'grabbing';
      const p = getPos(e); dox = p.x - offX - cx; doy = p.y - offY - cy;
      vx = 0; vy = 0;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    card.addEventListener('touchstart', function (e) {
      isDragging = true;
      const p0 = getPos(e); downX = p0.x; downY = p0.y;
      const p = getPos(e); dox = p.x - offX - cx; doy = p.y - offY - cy;
      vx = 0; vy = 0;
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    }, { passive: true });

    function onMove(e) {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
      const p = getPos(e);
      // pointer is in viewport coords -> convert to .hero-left box coords
      const nx = p.x - offX - dox, ny = p.y - offY - doy;
      vx = (nx - cx) * 0.5; vy = (ny - cy) * 0.5;
      cx = Math.max(20 - offX, Math.min(window.innerWidth - 20 - offX, nx));
      cy = Math.max(80 - offY, Math.min(window.innerHeight - 20 - offY, ny));
    }
    function onUp(e) {
      isDragging = false; card.style.cursor = 'grab';
      if (e && e.changedTouches) lastTouchEnd = performance.now();
      // short press without movement = tap -> flip the card 3D-style
      let upX = downX, upY = downY;
      if (e) {
        const s = e.changedTouches ? e.changedTouches[0] : e;
        if (s && typeof s.clientX === 'number') { upX = s.clientX; upY = s.clientY; }
      }
      if (Math.hypot(upX - downX, upY - downY) < 8) flipCard();
      vx *= BOUNCE; vy *= BOUNCE;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }

    window.addEventListener('resize', resize);
    setTimeout(() => { resize(); loop(); }, 200);

    // NOTE: no hover-tilt here on purpose. Any hover handler that writes
    // card.style.transform fights the rAF loop (applyCard) which rewrites the
    // same property every frame -> transform flicker -> the clip bounces and
    // the canvas strap vibrates.
  })();

  /* ================= EXPOSE GLOBALS (inline onclick handlers) ================= */
  window.openProjectModal = openProjectModal;
  window.closeProjectModal = closeProjectModal;
  window.openVideoModal = openVideoModal;
  window.closeVideoModal = closeVideoModal;
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;
  window.handleSubmit = handleSubmit;
})();
