// ==========================================================================
// JMS Nextech — Shared JS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav.site-nav');

  // 1. Sticky nav shadow on scroll
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  // 2. Mobile hamburger toggle
  const hamburger = document.querySelector('.nav-hamburger');
  const overlay = document.querySelector('.mobile-overlay');
  const backdrop = document.querySelector('.nav-backdrop');
  const overlayClose = document.querySelector('.mobile-overlay-close');

  const openOverlay = () => {
    overlay?.classList.add('open');
    backdrop?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeOverlay = () => {
    overlay?.classList.remove('open');
    backdrop?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger?.addEventListener('click', () => {
    overlay?.classList.contains('open') ? closeOverlay() : openOverlay();
  });
  overlayClose?.addEventListener('click', closeOverlay);
  backdrop?.addEventListener('click', closeOverlay);
  overlay?.querySelectorAll('.mobile-overlay-links > a').forEach(link => {
    link.addEventListener('click', closeOverlay);
  });

  // Mobile services accordion
  const mobileServicesToggle = document.querySelector('.mobile-services-toggle');
  const mobileServicesPanel = document.querySelector('.mobile-services-panel');
  mobileServicesToggle?.addEventListener('click', () => {
    const isOpen = mobileServicesPanel?.classList.toggle('open');
    mobileServicesToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // 3. Services dropdown (hover desktop, click/focus for keyboard, close on outside/Escape)
  const dropdownWrap = document.querySelector('.nav-item-dropdown');
  const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
  const megaDropdown = document.querySelector('.mega-dropdown');

  dropdownToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
    dropdownToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    megaDropdown?.classList.toggle('open', !expanded);
  });

  document.addEventListener('click', (e) => {
    if (dropdownWrap && !dropdownWrap.contains(e.target)) {
      dropdownToggle?.setAttribute('aria-expanded', 'false');
      megaDropdown?.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownToggle?.setAttribute('aria-expanded', 'false');
      megaDropdown?.classList.remove('open');
      closeOverlay();
    }
  });

  // 4. Smooth scroll for #anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 5. IntersectionObserver: fade-in-up on scroll, staggered in grids
  const animatedEls = document.querySelectorAll('.animate-on-scroll');
  if ('IntersectionObserver' in window && animatedEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const grid = entry.target.closest('[data-stagger]');
          if (grid) {
            const children = Array.from(grid.querySelectorAll('.animate-on-scroll'));
            const index = children.indexOf(entry.target);
            entry.target.style.transitionDelay = `${index * 0.1}s`;
          }
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    animatedEls.forEach(el => io.observe(el));
  } else {
    animatedEls.forEach(el => el.classList.add('visible'));
  }

  // 6. Counter animation for stats section
  const counters = document.querySelectorAll('[data-counter]');
  const easeOutQuad = t => t * (2 - t);
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutQuad(progress);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const counterIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => counterIo.observe(el));
  }

  // 7. Contact form: client-side validation, loading state, success/error
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const successBox = document.getElementById('formSuccess');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Sending...';

      try {
        const formData = new FormData(contactForm);
        const res = await fetch(contactForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        const result = await res.json();

        if (result.success) {
          contactForm.style.display = 'none';
          successBox?.classList.add('show');
        } else {
          throw new Error(result.message || 'Something went wrong');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert('There was an error sending your message. Please try again or call us directly.');
      }
    });
  }

  // 8. Hero carousel (homepage): autoplay, dots/arrows, mouse-parallax float
  const heroCarousel = document.getElementById('heroCarousel');
  if (heroCarousel) {
    const texts = heroCarousel.querySelectorAll('.hero-slide-text');
    const images = heroCarousel.querySelectorAll('.hero-visual-img');
    const dots = heroCarousel.querySelectorAll('.hero-dot');
    const arrows = heroCarousel.querySelectorAll('.hero-arrow');
    const total = texts.length;
    let current = 0;
    let autoplayTimer = null;

    // Cinematic load-in reveal for hero text + floating visual
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroCarousel.querySelector('.hero-content')?.classList.add('loaded');
        heroCarousel.querySelector('.hero-visual-wrap')?.classList.add('loaded');
      });
    });

    const goTo = (index) => {
      current = (index + total) % total;
      texts.forEach(el => el.classList.toggle('active', Number(el.dataset.slide) === current));
      images.forEach(el => el.classList.toggle('active', Number(el.dataset.slide) === current));
      dots.forEach(el => {
        const isActive = Number(el.dataset.slide) === current;
        el.classList.toggle('active', isActive);
        el.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    const stopAutoplay = () => clearInterval(autoplayTimer);
    const startAutoplay = () => {
      stopAutoplay();
      autoplayTimer = setInterval(() => goTo(current + 1), 5500);
    };

    dots.forEach(dot => {
      dot.addEventListener('click', () => { goTo(Number(dot.dataset.slide)); startAutoplay(); });
    });
    arrows.forEach(arrow => {
      arrow.addEventListener('click', () => { goTo(current + Number(arrow.dataset.dir)); startAutoplay(); });
    });

    heroCarousel.addEventListener('mouseenter', stopAutoplay);
    heroCarousel.addEventListener('mouseleave', startAutoplay);
    heroCarousel.addEventListener('focusin', stopAutoplay);
    heroCarousel.addEventListener('focusout', startAutoplay);
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stopAutoplay() : startAutoplay();
    });

    startAutoplay();

    // Mouse-parallax tilt on the floating visual card
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const visualCard = document.getElementById('heroVisualCard');
    const visualWrap = heroCarousel.querySelector('.hero-visual-wrap');
    if (visualCard && visualWrap && !reduceMotion) {
      visualWrap.addEventListener('mousemove', (e) => {
        const rect = visualCard.getBoundingClientRect();
        const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1) - 0.5;
        const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1) - 0.5;
        visualCard.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
      });
      visualWrap.addEventListener('mouseleave', () => {
        visualCard.style.transform = '';
      });
    }
  }

  // 9. Active nav link: compare window.location.pathname to each href
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-overlay-links > a').forEach(link => {
    const linkPath = link.getAttribute('href')?.split('/').pop();
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  // 10. Service card hover-arrow badge: navigates using the card's own "Learn more" link
  document.querySelectorAll('.service-card').forEach(card => {
    const arrow = card.querySelector('.card-hover-arrow');
    const link = card.querySelector('.card-link');
    if (arrow && link) {
      arrow.addEventListener('click', () => { window.location.href = link.href; });
    }
  });
});
