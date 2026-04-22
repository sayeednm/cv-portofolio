// ===== CURSOR GLOW =====
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', e => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

// ===== PARTICLES =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
const isMobile = window.innerWidth < 768;
const particleCount = isMobile ? 20 : 60;

function resizeCanvas() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

for (let i = 0; i < particleCount; i++) particles.push({
  x: Math.random() * canvas.width, y: Math.random() * canvas.height,
  r: Math.random() * 2 + 0.5,
  dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
  alpha: Math.random() * 0.5 + 0.1
});

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(16,185,129,${p.alpha})`; ctx.fill();
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  for (let i = 0; i < particles.length; i++)
    for (let j = i + 1; j < particles.length; j++) {
      const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
      if (d < 100) {
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(16,185,129,${0.06 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
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
      if (ci >= word.length) { deleting = true; setTimeout(type, 1800); return; }
    } else {
      subtitleEl.textContent = word.slice(0, --ci);
      if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(type, deleting ? 55 : 95);
  }
  setTimeout(type, 300);
}

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / 1500, 1);
    el.textContent = Math.floor(p * target) + suffix;
    if (p < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
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
      card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
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

// ===== SCROLL REVEAL =====
const revealObs = new IntersectionObserver((entries, obs) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.getAttribute('data-delay') || 0);
      setTimeout(() => e.target.classList.add('visible'), delay);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  // auto stagger delay for grid children
  const parent = el.parentElement;
  const siblings = parent ? [...parent.querySelectorAll(':scope > .reveal')] : [];
  if (siblings.length > 1 && !el.hasAttribute('data-delay')) {
    el.setAttribute('data-delay', siblings.indexOf(el) * 120);
  }
  revealObs.observe(el);
});

window.addEventListener('load', () => {
  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      const delay = parseInt(el.getAttribute('data-delay') || 0);
      setTimeout(() => el.classList.add('visible'), delay);
    }
  });
});

// Fallback: show all reveal elements after 1s regardless
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
}, 1000);
// ===== SKILL BARS =====
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skillbar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-width') + '%';
      });
      skillObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
const skillSection = document.querySelector('.skillbars-section');
if (skillSection) skillObs.observe(skillSection);

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 20 ? '0 4px 24px rgba(0,0,0,0.08)' : 'none';
  const scrollY = window.scrollY + 100;
  document.querySelectorAll('section[id]').forEach(section => {
    const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
    if (link) link.style.color = scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight ? 'var(--cyan)' : '';
  });
});

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
  frame._timer = setTimeout(() => { try { if (!frame.contentDocument) document.getElementById('projModalFallback').classList.add('show'); } catch { document.getElementById('projModalFallback').classList.add('show'); } }, 4000);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeProjectModal() {
  const frame = document.getElementById('projModalFrame');
  clearTimeout(frame._timer); frame.src = '';
  document.getElementById('projModal').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('projModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeProjectModal(); });

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
    document.querySelectorAll('.design-card').forEach(c => c.classList.toggle('hidden', f !== 'all' && c.getAttribute('data-category') !== f));
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
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLightbox(); closeProjectModal(); closeVideoModal(); } });

// ===== CONTACT FORM =====
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  btn.textContent = currentLang === 'id' ? 'Pesan Terkirim!' : 'Message Sent!';
  btn.style.background = '#10b981';
  setTimeout(() => { btn.innerHTML = t['contact.form.send']; btn.style.background = ''; e.target.reset(); }, 3000);
}
