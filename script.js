// ===== SCROLL PROGRESS BAR =====
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = pct + '%';
}, { passive: true });

// ===== CUSTOM CURSOR =====
const cursorGlow = document.getElementById('cursorGlow');
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursorGlow) { cursorGlow.style.left = e.clientX + 'px'; cursorGlow.style.top = e.clientY + 'px'; }
  if (cursorDot) { cursorDot.style.left = e.clientX + 'px'; cursorDot.style.top = e.clientY + 'px'; }
  if (cursorRing) { cursorRing.style.left = e.clientX + 'px'; cursorRing.style.top = e.clientY + 'px'; }
});

// Hover effect on interactive elements
const hoverEls = 'a, button, .exp-card, .project-card, .hobby-card, .design-card, .skill-category, .tag';
document.querySelectorAll(hoverEls).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// ===== NAVBAR SCROLL =====
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  const scrollY = window.scrollY + 120;
  document.querySelectorAll('section[id]').forEach(section => {
    const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
    if (link) {
      const active = scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight;
      link.classList.toggle('active-nav', active);
    }
  });
}, { passive: true });

// ===== PARTICLES =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
const isMobile = window.innerWidth < 768;
const particleCount = isMobile ? 18 : 55;

function resizeCanvas() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

for (let i = 0; i < particleCount; i++) {
  particles.push({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.4,
    dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35,
    alpha: Math.random() * 0.4 + 0.1
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(16,185,129,${p.alpha})`; ctx.fill();
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
      if (d < 110) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(16,185,129,${0.07 * (1 - d / 110)})`;
        ctx.lineWidth = 0.5; ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ===== TYPED EFFECT =====
const subtitleEl = document.querySelector('.hero-subtitle .accent');
if (subtitleEl) {
  const wordSets = {
    en: ['AI Engineer & Graphic Designer', 'AI Engineer & Web Developer', 'AI Engineer & Creative Innovator'],
    id: ['AI Engineer & Desainer Grafis', 'AI Engineer & Web Developer', 'AI Engineer & Inovator Kreatif']
  };
  let wi = 0, ci = 0, deleting = false;
  const cursor = document.createElement('span');
  cursor.className = 'typed-cursor';
  subtitleEl.after(cursor);
  subtitleEl.textContent = '';
  function type() {
    const words = wordSets[currentLang] || wordSets.en;
    const word = words[wi % words.length];
    if (!deleting) {
      subtitleEl.textContent = word.slice(0, ++ci);
      if (ci >= word.length) { deleting = true; setTimeout(type, 2000); return; }
    } else {
      subtitleEl.textContent = word.slice(0, --ci);
      if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(type, deleting ? 45 : 90);
  }
  setTimeout(type, 400);
}

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / 1600, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
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

// ===== CARD TILT =====
if (!isMobile) {
  document.querySelectorAll('.exp-card, .project-card, .skill-category').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ===== I18N =====
let currentLang = localStorage.getItem('lang') || 'en';

function applyLang(lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
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
  const label = document.querySelector('.lang-label');
  if (label) label.textContent = lang === 'en' ? 'ID' : 'EN';
}
applyLang(currentLang);

document.getElementById('langToggle').addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'id' : 'en';
  localStorage.setItem('lang', currentLang);
  applyLang(currentLang);
});

// ===== ABOUT PHOTO SLIDESHOW =====
const aboutSlides = document.querySelectorAll('.about-slide');
if (aboutSlides.length > 1) {
  let current = 0;
  setInterval(() => {
    aboutSlides[current].classList.remove('active');
    current = (current + 1) % aboutSlides.length;
    aboutSlides[current].classList.add('active');
  }, 3800);
}

// ===== SCROLL REVEAL =====
const revealObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.getAttribute('data-delay') || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  const parent = el.parentElement;
  const siblings = parent ? [...parent.querySelectorAll(':scope > .reveal')] : [];
  if (siblings.length > 1 && !el.hasAttribute('data-delay')) {
    el.setAttribute('data-delay', siblings.indexOf(el) * 100);
  }
  revealObs.observe(el);
});

// Show elements already in viewport on load
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 30) {
      const delay = parseInt(el.getAttribute('data-delay') || 0);
      setTimeout(() => el.classList.add('visible'), delay);
    }
  });
}, 80);

// Fallback
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
}, 1200);

// ===== SKILL BARS =====
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skillbar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-width') + '%';
      });
      entry.target.classList.add('in-view');
      skillObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
const skillSection = document.querySelector('.skillbars-section');
if (skillSection) skillObs.observe(skillSection);

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

// ===== PROJECT MODAL =====
function openProjectModal(url, title) {
  const modal = document.getElementById('projModal');
  const frame = document.getElementById('projModalFrame');
  document.getElementById('projModalTitle').textContent = title;
  document.getElementById('projModalOpen').href = url;
  document.getElementById('projModalFallbackLink').href = url;
  document.getElementById('projModalFallback').classList.remove('show');
  frame.src = url;
  frame._timer = setTimeout(() => {
    try {
      if (!frame.contentDocument) document.getElementById('projModalFallback').classList.add('show');
    } catch { document.getElementById('projModalFallback').classList.add('show'); }
  }, 4000);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeProjectModal() {
  const frame = document.getElementById('projModalFrame');
  clearTimeout(frame._timer); frame.src = '';
  document.getElementById('projModal').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('projModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeProjectModal();
});

// ===== VIDEO MODAL =====
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

// ===== DESIGN FILTER =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.getAttribute('data-filter');
    document.querySelectorAll('.design-card').forEach(c => {
      c.classList.toggle('hidden', f !== 'all' && c.getAttribute('data-category') !== f);
    });
  });
});

// ===== LIGHTBOX =====
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

// ===== CONTACT FORM =====
async function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  btn.textContent = currentLang === 'id' ? 'Mengirim...' : 'Sending...';
  btn.disabled = true; btn.style.opacity = '0.7';
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
      btn.textContent = currentLang === 'id' ? '✓ Pesan Terkirim!' : '✓ Message Sent!';
      btn.style.background = 'linear-gradient(135deg,#10b981,#34d399)';
      btn.style.opacity = '1';
      e.target.reset();
      setTimeout(() => {
        btn.innerHTML = t['contact.form.send'];
        btn.style.background = ''; btn.disabled = false;
      }, 3000);
    } else { throw new Error('Failed'); }
  } catch {
    btn.textContent = currentLang === 'id' ? '✗ Gagal, coba lagi' : '✗ Failed, try again';
    btn.style.background = '#ef4444'; btn.style.opacity = '1';
    setTimeout(() => {
      btn.innerHTML = t['contact.form.send'];
      btn.style.background = ''; btn.disabled = false;
    }, 3000);
  }
}

// ===== SMOOTH SECTION ENTRANCE WITH STAGGER =====
// Extra stagger for grid children
document.querySelectorAll('.exp-grid, .projects-grid, .skills-grid, .hobbies-grid, .design-grid').forEach(grid => {
  const children = grid.querySelectorAll('.reveal, .exp-card.reveal, .project-card.reveal, .skill-category.reveal, .hobby-card.reveal, .design-card.reveal');
  children.forEach((child, i) => {
    if (!child.hasAttribute('data-delay')) child.setAttribute('data-delay', i * 90);
  });
});
