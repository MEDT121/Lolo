document.addEventListener('DOMContentLoaded', () => {

  // 1. NAVBAR scroll
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 2. HAMBURGER
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    }));
  }

  // 3. HERO SLIDESHOW + PARALLAX
  const heroSlideshow = document.getElementById('heroSlideshow');
  const heroSlides = heroSlideshow ? Array.from(heroSlideshow.querySelectorAll('.hero-slide')) : [];
  const heroDotEls = Array.from(document.querySelectorAll('#heroDots .hero-dot'));
  let activeSlide = 0;
  let slideshowTimer;

  const switchToSlide = (n) => {
    heroSlides[activeSlide]?.classList.remove('active');
    heroDotEls[activeSlide]?.classList.remove('active');
    activeSlide = (n + heroSlides.length) % heroSlides.length;
    heroSlides[activeSlide]?.classList.add('active');
    heroDotEls[activeSlide]?.classList.add('active');
  };

  if (heroSlides.length > 1) {
    slideshowTimer = setInterval(() => switchToSlide(activeSlide + 1), 5500);
    heroDotEls.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(slideshowTimer);
        switchToSlide(i);
        slideshowTimer = setInterval(() => switchToSlide(activeSlide + 1), 5500);
      });
    });
  }

  if (heroSlideshow) {
    window.addEventListener('scroll', () => {
      heroSlideshow.style.transform = `translateY(${window.scrollY * 0.35}px)`;
    }, { passive: true });
  }

  // 4. FADE-UP
  const fadeObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || '0', 10);
        setTimeout(() => e.target.classList.add('visible'), delay);
        fadeObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

  // 5. COUNTER ANIMATION
  const ease = t => 1 - Math.pow(1 - t, 4);
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1800, 1);
      el.textContent = prefix + Math.round(ease(p) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    };
    requestAnimationFrame(step);
  };
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.counter, .stat-number[data-target]').forEach(el => counterObs.observe(el));

  // 6. ACCORDION
  const items = document.querySelectorAll('.accordion-item');
  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;
    header.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // 7. TICKER pause on hover
  const ticker = document.getElementById('ticker');
  if (ticker) {
    const wrap = ticker.closest('.ticker-wrap');
    if (wrap) {
      wrap.addEventListener('mouseenter', () => ticker.style.animationPlayState = 'paused');
      wrap.addEventListener('mouseleave', () => ticker.style.animationPlayState = 'running');
    }
  }

  // 8. STAGGER grids
  const staggerObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        Array.from(e.target.children).forEach((child, i) => {
          if (!child.classList.contains('fade-up')) {
            child.style.opacity = '0';
            child.style.transform = 'translateY(24px)';
            child.style.transition = `opacity 0.55s ease ${i*80}ms, transform 0.55s ease ${i*80}ms`;
            requestAnimationFrame(() => requestAnimationFrame(() => {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            }));
          }
        });
        staggerObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.10 });
  document.querySelectorAll('.innov-grid, .clients-grid, .avantages-grid, .about-pillars')
    .forEach(c => staggerObs.observe(c));

  // 9. SMOOTH SCROLL
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (navbar ? navbar.offsetHeight : 0) - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // 10. CONTACT FORM
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      if (!btn) return;
      const orig = btn.innerHTML;
      btn.innerHTML = 'Message envoyé ✓';
      btn.style.background = '#2d6a4f';
      btn.disabled = true;
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; form.reset(); }, 3500);
    });
  }

  // 11. ACTIVE NAV on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.getAttribute('id');
        navLinks.forEach(l => l.style.color = l.getAttribute('href') === `#${id}` ? 'var(--gold)' : 'rgba(255,255,255,0.80)');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => sectionObs.observe(s));

  // 12. FLOATING CTA + BACK TO TOP
  const floatCta = document.getElementById('floatCta');
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    const pastHero = window.scrollY > window.innerHeight * 0.65;
    if (floatCta) floatCta.classList.toggle('visible', pastHero);
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // 13. GALLERY STAGGER on scroll
  const galleryObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        Array.from(e.target.querySelectorAll('.gallery-item')).forEach((item, i) => {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95) translateY(20px)';
          item.style.transition = `opacity 0.6s ease ${i*60}ms, transform 0.6s ease ${i*60}ms`;
          requestAnimationFrame(() => requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1) translateY(0)';
          }));
        });
        galleryObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05 });
  const galleryGrid = document.querySelector('.gallery-grid');
  if (galleryGrid) galleryObs.observe(galleryGrid);

});
