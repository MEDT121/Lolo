// SALUBRA-KIN — Script

// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

// Fade-in on scroll — exclude .target-item (many are above-fold, would flash invisible)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });

document.querySelectorAll('.pillar-card, .sub-card, .process-step, .cible-card, .dim-card, .marche-stat, .stat-card, .tarif-card').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Revenue Chart
function drawChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  if (rect.width === 0) return;

  const ctx = canvas.getContext('2d');

  const months = ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12','M13','M14','M15','M16','M17','M18'];
  const revenues = [3000,7000,11238,18000,20578,22000,26000,28000,30000,32000,33000,35000,38000,40000,42000,44000,44508,44508];

  canvas.width = rect.width * dpr;
  canvas.height = 280 * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = '280px';
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = 280;
  const padL = 60, padR = 24, padT = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = 50000;

  const x = i => padL + (i / (months.length - 1)) * chartW;
  const y = v => padT + chartH - (v / maxVal) * chartH;

  // Grid
  ctx.strokeStyle = 'rgba(28,43,94,0.08)';
  ctx.lineWidth = 1;
  [0, 10000, 20000, 30000, 40000, 50000].forEach(v => {
    ctx.beginPath(); ctx.moveTo(padL, y(v)); ctx.lineTo(padL + chartW, y(v)); ctx.stroke();
    ctx.fillStyle = 'rgba(90,99,128,0.7)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('$' + (v/1000) + 'K', padL - 6, y(v) + 4);
  });

  // Month labels
  ctx.fillStyle = 'rgba(90,99,128,0.7)';
  ctx.font = '9px Inter, sans-serif';
  ctx.textAlign = 'center';
  months.forEach((m, i) => { if (i % 3 === 0 || i === months.length - 1) ctx.fillText(m, x(i), H - padB + 14); });

  // Breakeven line
  ctx.strokeStyle = 'rgba(201,162,39,0.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(padL, y(8650)); ctx.lineTo(padL + chartW, y(8650)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(201,162,39,0.8)';
  ctx.font = '9px Inter';
  ctx.textAlign = 'left';
  ctx.fillText('Seuil', padL + 4, y(8650) - 4);

  // Revenue area fill
  const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  grad.addColorStop(0, 'rgba(28,43,94,0.25)');
  grad.addColorStop(1, 'rgba(28,43,94,0.02)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x(0), y(revenues[0]));
  revenues.forEach((v, i) => ctx.lineTo(x(i), y(v)));
  ctx.lineTo(x(revenues.length-1), y(0));
  ctx.lineTo(x(0), y(0));
  ctx.closePath();
  ctx.fill();

  // Revenue line
  ctx.strokeStyle = '#1C2B5E';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  revenues.forEach((v, i) => i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v)));
  ctx.stroke();

  // Data points
  revenues.forEach((v, i) => {
    ctx.beginPath();
    ctx.arc(x(i), y(v), 3.5, 0, Math.PI * 2);
    ctx.fillStyle = i === 2 ? '#C9A227' : '#1C2B5E';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Highlight M3
  ctx.beginPath();
  ctx.arc(x(2), y(revenues[2]), 7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(201,162,39,0.2)';
  ctx.fill();
  ctx.strokeStyle = '#C9A227';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // M3 label
  ctx.fillStyle = '#C9A227';
  ctx.font = 'bold 9px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('M3 ✓', x(2), y(revenues[2]) - 12);
}

window.addEventListener('load', drawChart);
window.addEventListener('resize', drawChart);

// Contact form — use CSS class for state so background restoration is reliable
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.textContent = 'Demande envoyée ✓';
    btn.classList.add('btn-submit--success');
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Envoyer ma demande';
      btn.classList.remove('btn-submit--success');
      btn.disabled = false;
      form.reset();
    }, 4000);
  });
}

// Smooth scroll offset for fixed nav — guard against bare href="#" (querySelector('#') throws SyntaxError)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});
