// ---------- Nav: scroll style + mobile menu ----------
const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Constellation particle background ----------
(function constellation() {
  const canvas = document.getElementById('constellation');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles, mouse = { x: -9999, y: -9999 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(90, Math.floor(w * h / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4
    }));
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const accent = document.body.classList.contains('light') ? '37,99,235' : '91,140,255';
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accent},0.7)`;
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${accent},${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // link to mouse
      const dmx = particles[i].x - mouse.x, dmy = particles[i].y - mouse.y;
      const dm = Math.hypot(dmx, dmy);
      if (dm < 180) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(168,85,247,${0.25 * (1 - dm / 180)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ---------- Card spotlight follow ----------
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// ---------- Magnetic buttons ----------
if (!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
}

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  // scroll progress
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  document.getElementById('scrollProgress').style.width = scrolled + '%';
});

menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

// ---------- Theme toggle ----------
const themeBtn = document.getElementById('themeBtn');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') document.body.classList.add('light');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });
}

// ---------- Contact form ----------
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = document.getElementById('formNote');
    const btn = form.querySelector('button[type="submit"]');
    const key = form.querySelector('[name="access_key"]').value;

    // Fallback to email app if no Web3Forms key is set yet
    if (!key || key === 'YOUR_ACCESS_KEY_HERE') {
      const body = encodeURIComponent(`Name: ${form.name.value}\nEmail: ${form.email.value}\n\n${form.message.value}`);
      window.location.href = `mailto:manthrikarthik1209@gmail.com?subject=${encodeURIComponent('Portfolio message from ' + form.name.value)}&body=${body}`;
      note.style.color = '#22d3ee';
      note.textContent = 'Opening your email app… thanks for reaching out!';
      return;
    }

    const original = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    note.textContent = '';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      const data = await res.json();
      if (data.success) {
        note.style.color = '#22d3ee';
        note.textContent = 'Message sent! I\'ll get back to you soon. 🎉';
        form.reset();
      } else {
        throw new Error(data.message || 'Failed');
      }
    } catch (err) {
      note.style.color = '#f87171';
      note.textContent = 'Something went wrong. Please email me directly at manthrikarthik1209@gmail.com';
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });
}

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), (i % 4) * 90);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Typing effect ----------
const roles = ['C++ Developer', 'Java Developer', 'Problem Solver', 'Automotive HMI Engineer'];
const typedEl = document.getElementById('typed');
let ri = 0, ci = 0, deleting = false;

function type() {
  const word = roles[ri];
  typedEl.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
  let delay = deleting ? 45 : 90;
  if (!deleting && ci === word.length + 1) { deleting = true; delay = 1400; }
  else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 300; }
  setTimeout(type, delay);
}
if (typedEl) { typedEl.textContent = ''; type(); }

// ---------- Animated stat counters ----------
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const tick = () => {
      cur = Math.min(target, cur + step);
      el.textContent = cur + suffix;
      if (cur < target) requestAnimationFrame(tick);
    };
    tick();
    statObserver.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.num').forEach(el => statObserver.observe(el));

// ---------- Custom cursor ----------
const dot = document.getElementById('cursorDot');
if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  let mx = 0, my = 0, dx = 0, dy = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  const loop = () => {
    dx += (mx - dx) * 0.18; dy += (my - dy) * 0.18;
    dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.querySelectorAll('a,button,.skill,.card').forEach(el => {
    el.addEventListener('mouseenter', () => dot.style.transform += ' scale(1.8)');
  });
}

// ---------- Tilt effect on code card ----------
const tilt = document.querySelector('.tilt');
if (tilt && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  const wrap = tilt.parentElement;
  wrap.addEventListener('mousemove', e => {
    const r = wrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
  });
  wrap.addEventListener('mouseleave', () => tilt.style.transform = '');
}
