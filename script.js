/* =====================================================================
   UNIVAC.ERP — INTERACCIONES
   Todo el código está comentado por bloque funcional para que se pueda
   editar o extender sin tocar el resto del sitio.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------------------
     1. AÑO DINÁMICO EN EL FOOTER
  ------------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------------------------------------------------------
     3. NAVBAR: cambia de estilo al hacer scroll
  ------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (window.scrollY > 40) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* -------------------------------------------------------------------
     4. MENÚ MOBILE
  ------------------------------------------------------------------- */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burgerBtn.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
    });
  });

  /* -------------------------------------------------------------------
     5. REVEAL AL SCROLL (Intersection Observer)
     Aplica fade-in + slide-up a todos los elementos ".reveal-up"
     usando el atributo data-delay para escalonar la animación.
  ------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal-up');

  revealEls.forEach(el => {
    const delay = el.getAttribute('data-delay') || 0;
    el.style.setProperty('--delay', delay);
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* -------------------------------------------------------------------
     6. CONTADORES ANIMADOS
     Se activan cuando el elemento ".counter" entra en pantalla.
  ------------------------------------------------------------------- */
  const counters = document.querySelectorAll('.counter');

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 1600;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutExpo para una desaceleración suave
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const value = Math.floor(eased * target);
      el.textContent = prefix + value.toLocaleString('es-AR');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toLocaleString('es-AR');
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => counterObserver.observe(el));

  /* -------------------------------------------------------------------
     7. SLIDER DE TESTIMONIOS (automático)
  ------------------------------------------------------------------- */
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.getElementById('testimonialDots');
  let currentSlide = 0;
  let slideTimer = null;

  if (slides.length && dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ver testimonio ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('button');

    function goToSlide(index) {
      slides[currentSlide].classList.remove('is-active');
      dots[currentSlide].classList.remove('is-active');
      currentSlide = index;
      slides[currentSlide].classList.add('is-active');
      dots[currentSlide].classList.add('is-active');
      resetAutoplay();
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) % slides.length);
    }

    function resetAutoplay() {
      clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, 5500);
    }

    slides[0].classList.add('is-active');
    dots[0].classList.add('is-active');
    resetAutoplay();
  }

  /* -------------------------------------------------------------------
     8. FORMULARIO DE CONTACTO
     Envío real vía Web3Forms (https://web3forms.com). Los datos viajan
     directo desde el navegador al servicio de Web3Forms, que reenvía
     el mensaje por email a la casilla configurada con el access_key.
  ------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitBtnLabel = submitBtn?.querySelector('span');
    const originalBtnText = submitBtnLabel ? submitBtnLabel.textContent : '';

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);

      if (submitBtn) submitBtn.disabled = true;
      if (submitBtnLabel) submitBtnLabel.textContent = 'Enviando...';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        const data = await response.json();

        if (data.success) {
          formSuccess.textContent = '¡Gracias! Te contactaremos a la brevedad.';
          formSuccess.classList.remove('form-error');
          formSuccess.classList.add('is-visible');
          contactForm.reset();
        } else {
          formSuccess.textContent = 'Hubo un problema al enviar. Probá de nuevo o escribinos por WhatsApp.';
          formSuccess.classList.add('is-visible', 'form-error');
        }
      } catch (error) {
        formSuccess.textContent = 'Hubo un problema al enviar. Probá de nuevo o escribinos por WhatsApp.';
        formSuccess.classList.add('is-visible', 'form-error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtnLabel) submitBtnLabel.textContent = originalBtnText;
        setTimeout(() => formSuccess.classList.remove('is-visible', 'form-error'), 5000);
      }
    });
  }

  /* -------------------------------------------------------------------
     9. SCROLL SUAVE PARA ENLACES INTERNOS
     (Complementa scroll-behavior:smooth del CSS para navegadores
     que necesitan el offset del navbar fijo)
  ------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const offset = 80;
          const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  /* -------------------------------------------------------------------
     10. PARTÍCULAS DE FONDO (Canvas)
     Red de puntos conectados que reacciona sutilmente al mouse,
     evocando la dispersión de cuadrados del isotipo de la marca.
  ------------------------------------------------------------------- */
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && ctx && !prefersReducedMotion) {
    let particles = [];
    let width, height;
    const mouse = { x: null, y: null };
    const colors = ['#3b6fe8', '#4fd8f0', '#7c5cfa', '#ff5c4d'];

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      const count = Math.min(70, Math.floor((width * height) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Atracción leve hacia el cursor
        if (mouse.x !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            p.x -= dx * 0.0025;
            p.y -= dy * 0.0025;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.72;
        ctx.fill();
      });

      // Líneas entre partículas cercanas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(79,216,240,0.2)';
            ctx.globalAlpha = 1 - dist / 120;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    resizeCanvas();
    createParticles();
    draw();
  }

});

/* -------------------------------------------------------------------
   7.5. FAQ: APERTURA ANIMADA
------------------------------------------------------------------- */
document.querySelectorAll('.faq-item').forEach(item => {
  const summary = item.querySelector('summary');
  const answer = item.querySelector('.faq-item__answer');

  summary.addEventListener('click', (e) => {
    e.preventDefault();

    const isOpen = item.hasAttribute('open');

    if (isOpen) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
      requestAnimationFrame(() => {
        answer.style.maxHeight = '0px';
        answer.style.opacity = '0';
      });
      setTimeout(() => item.removeAttribute('open'), 350);
    } else {
      item.setAttribute('open', '');
      answer.style.maxHeight = '0px';
      answer.style.opacity = '0';
      requestAnimationFrame(() => {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity = '1';
      });
    }
  });
});