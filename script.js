/* ═══════════════════════════════════════════════════════════
   SALUBRA-KIN — script.js
   Curevo-inspired interactions: navbar, accordion, counters,
   fade-in, parallax hero, ticker
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────────
     1. NAVBAR — transparent → solid on scroll
  ───────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  const handleNavbarScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run once on load

  /* ─────────────────────────────────────────────
     2. HAMBURGER / MOBILE MENU
  ───────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ─────────────────────────────────────────────
     3. PARALLAX HERO background on scroll
  ───────────────────────────────────────────── */
  const heroBg = document.getElementById('heroBg');

  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const offset = scrollY * 0.35;
      heroBg.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     4. SCROLL FADE-IN (IntersectionObserver)
        .fade-up elements slide up + fade in
        Respects data-delay attribute (ms)
  ───────────────────────────────────────────── */
  const fadeElements = document.querySelectorAll('.fade-up');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => {
          el.classList.add('visible');
        }, delay);
        fadeObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  fadeElements.forEach(el => fadeObserver.observe(el));

  /* ─────────────────────────────────────────────
     5. COUNTER ANIMATION
        Counts up from 0 to data-target value
        when element enters viewport
        data-prefix / data-suffix supported
  ───────────────────────────────────────────── */
  const counters = document.querySelectorAll('.counter, .stat-number[data-target]');

  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  const animateCounter = (el) => {
    const target  = parseInt(el.dataset.target, 10);
    const prefix  = el.dataset.prefix  || '';
    const suffix  = el.dataset.suffix  || '';
    const duration = 1800; // ms
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.round(easedProgress * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target + suffix;
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => counterObserver.observe(el));

  /* ─────────────────────────────────────────────
     6. ACCORDION — sticky process steps
        One open at a time
  ───────────────────────────────────────────── */
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      accordionItems.forEach(i => {
        i.classList.remove('open');
      });

      // If it wasn't open, open it
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  /* ─────────────────────────────────────────────
     7. TICKER — duplicate content for seamless loop
        The HTML already has items doubled;
        this ensures the animation is correct.
  ───────────────────────────────────────────── */
  // The ticker CSS handles the animation via @keyframes.
  // Pause on hover for accessibility.
  const tickerInner = document.getElementById('ticker');
  if (tickerInner) {
    const tickerWrap = tickerInner.closest('.ticker-wrap');
    if (tickerWrap) {
      tickerWrap.addEventListener('mouseenter', () => {
        tickerInner.style.animationPlayState = 'paused';
      });
      tickerWrap.addEventListener('mouseleave', () => {
        tickerInner.style.animationPlayState = 'running';
      });
    }
  }

  /* ─────────────────────────────────────────────
     8. STAGGERED CARD REVEAL
        Cards within grids appear with stagger
        when their container enters viewport
  ───────────────────────────────────────────── */
  const staggeredContainers = document.querySelectorAll(
    '.services-grid, .avantages-grid, .tarifs-grid, .marche-grid, .about-pillars'
  );

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.children;
        Array.from(children).forEach((child, index) => {
          // Only animate children that don't already have fade-up (avoid double)
          if (!child.classList.contains('fade-up')) {
            child.style.opacity = '0';
            child.style.transform = 'translateY(24px)';
            child.style.transition = `opacity 0.55s ease ${index * 80}ms, transform 0.55s ease ${index * 80}ms`;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              });
            });
          }
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  staggeredContainers.forEach(container => staggerObserver.observe(container));

  /* ─────────────────────────────────────────────
     9. SMOOTH SCROLL for anchor links
  ───────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight - 12;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────────
     10. CONTACT FORM — prevent default + feedback
  ───────────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.form-submit');
      if (!submitBtn) return;

      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Message envoyé ✓';
      submitBtn.style.background = '#2d6a4f';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        contactForm.reset();
      }, 3500);
    });
  }

  /* ─────────────────────────────────────────────
     11. ACTIVE NAV LINK on scroll
         Highlights the nav link for the
         currently visible section
  ───────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--gold)'
            : 'rgba(255,255,255,0.80)';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => sectionObserver.observe(section));

});
