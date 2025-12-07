/* script.js — cleaned & consolidated version
   Keeps same behavior as your original file but reduces duplication,
   improves marquee sizing reliability and hardens some edge cases.
*/
(function () {
  'use strict';

  /* ---------- NAV / MOBILE MENU ---------- */
  (function navMobile() {
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (!menuBtn || !navLinks) return;

    let mobileMenu = document.querySelector('.mobile-menu');
    if (!mobileMenu) {
      mobileMenu = document.createElement('div');
      mobileMenu.className = 'mobile-menu';
      const cloned = navLinks.cloneNode(true);
      cloned.removeAttribute('id');
      mobileMenu.appendChild(cloned);
      document.body.appendChild(mobileMenu);

      mobileMenu.addEventListener('click', (ev) => {
        if (ev.target.tagName === 'A') {
          mobileMenu.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  })();


  /* ---------- NAV: hide on scroll ---------- */
  (function navHideOnScroll() {
    const navWrap = document.querySelector('.nav-wrap');
    if (!navWrap) return;
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY + 10 && y > 80) navWrap.classList.add('nav-hidden');
        else if (y < lastY - 10) navWrap.classList.remove('nav-hidden');
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
  })();
 
  /* About Section */

   /* ============================
   ABOUT METRIC COUNTERS
============================ */
(function () {
  const metrics = document.querySelectorAll(".metric-value[data-count-target]");
  if (!metrics.length || !("IntersectionObserver" in window)) return;

  const easeOutQuad = t => t * (2 - t);

  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-count-target"), 10) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1600;
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.countAnimated === "true") return;
        el.dataset.countAnimated = "true";
        animateCounter(el);
      });
    },
    { threshold: 0.4 }
  );

  metrics.forEach(m => io.observe(m));
})();



 /*service section */

(function () {
  const section = document.querySelector("#services");
  const cards = Array.from(document.querySelectorAll(".services-right .service-card"));
  if (!section || !cards.length) return;

  // same palette logic you were using
  const palette = [
    { color: "#ff7a3d", gradient: "0", shadow:"0" },
  ];

  let activeIndex = 0;
  let ticking = false;

  function applyActive(index) {
    activeIndex = index;

    cards.forEach((card, i) => {
      const isActive = i === index;
      card.classList.toggle("active", isActive);

      if (isActive) {
        const { color, gradient, shadow } = palette[i % palette.length];
        card.style.setProperty("--hover-color", color);
       // card.style.setProperty("--hover-gradient", gradient);
        //card.style.setProperty("--hover-shadow", shadow);
      }
    });
  }

  // initial state
  applyActive(0);

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;

      // agar section screen pe hi nahi to kuch mat karo
      if (rect.bottom < 0 || rect.top > viewH) {
        ticking = false;
        return;
      }

      const viewportCenter = viewH / 2;
      let closestIndex = activeIndex;
      let closestDelta = Infinity;

      // jis card ka center viewport ke center ke sab se qareeb hai usko active karo
      cards.forEach((card, i) => {
        const cr = card.getBoundingClientRect();
        const cardCenter = cr.top + cr.height / 2;
        const delta = Math.abs(cardCenter - viewportCenter);

        if (delta < closestDelta) {
          closestDelta = delta;
          closestIndex = i;
        }
      });

      if (closestIndex !== activeIndex) {
        applyActive(closestIndex);
      }

      ticking = false;
    });
  }

  // smooth, throttled scroll listener
  window.addEventListener("scroll", onScroll, { passive: true });

  // 🖱 pointer / hover per bhi card active ho jaye
  cards.forEach((card, index) => {
    card.addEventListener("mouseenter", () => {
      applyActive(index);
    });
  });
})();

  /* ---------- PRICING TOGGLE ---------- */
  (function pricingToggle() {
    const priceToggleSwitch = document.getElementById('priceToggle');
    const pillBtns = Array.from(document.querySelectorAll('.toggle-option'));
    const prices = Array.from(document.querySelectorAll('.price-amt'));

    function setPricingMode(yearly) {
      prices.forEach(p => {
        const m = p.getAttribute('data-month') ?? p.textContent.trim();
        const y = p.getAttribute('data-year') ?? p.textContent.trim();
        p.textContent = yearly ? y : m;
      });
      if (priceToggleSwitch) priceToggleSwitch.setAttribute('aria-checked', yearly ? 'true' : 'false');
      pillBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === (yearly ? 'year' : 'month')));
    }

    if (priceToggleSwitch) {
      priceToggleSwitch.addEventListener('click', () => {
        const cur = priceToggleSwitch.getAttribute('aria-checked') === 'true';
        setPricingMode(!cur);
      });
      priceToggleSwitch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); priceToggleSwitch.click(); }
      });
    }

    if (pillBtns.length) {
      pillBtns.forEach(btn => {
        btn.addEventListener('click', () => setPricingMode(btn.dataset.mode === 'year'));
        btn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        });
      });
    }

    setPricingMode(false);

    // Watch for external changes to aria-checked if present
    if (priceToggleSwitch && 'MutationObserver' in window) {
      const mo = new MutationObserver(() => {
        const yearly = priceToggleSwitch.getAttribute('aria-checked') === 'true';
        setPricingMode(yearly);
      });
      mo.observe(priceToggleSwitch, { attributes: true, attributeFilter: ['aria-checked'] });
    }
  })();


  /* ---------- MARQUEE (ww-track, features, clients) ---------- */
  (function marqueesInit() {
    // helper to duplicate track contents only once
    function ensureDuplication(track) {
      if (!track || track.dataset.duplicated) return;
      try {
        track.insertAdjacentHTML('beforeend', track.innerHTML);
        track.dataset.duplicated = 'true';
      } catch (e) { /* noop */ }
    }

    // ww-track
    const wwTrack = document.querySelector('.ww-track');
    const wwMar = document.querySelector('.ww-marquee');
    if (wwTrack && wwMar) {
      ensureDuplication(wwTrack);
      // compute duration based on width (after images are loaded)
      const computeWWDuration = () => {
        const w = wwTrack.scrollWidth || wwTrack.getBoundingClientRect().width || 1200;
        const pxPerSecond = 180;
        const seconds = Math.max(12, Math.round(w / pxPerSecond));
        wwTrack.style.animationDuration = `${seconds}s`;
      };
      // wait for images to load
      const imgs = wwTrack.querySelectorAll('img');
      let imagesLoaded = 0;
      if (!imgs.length) computeWWDuration();
      imgs.forEach(img => {
        if (img.complete) imagesLoaded++;
        else img.addEventListener('load', () => { imagesLoaded++; if (imagesLoaded === imgs.length) computeWWDuration(); });
        img.addEventListener('error', () => { imagesLoaded++; if (imagesLoaded === imgs.length) computeWWDuration(); });
      });
      setTimeout(computeWWDuration, 350); // fallback
      // pause/resume
      wwMar.addEventListener('mouseenter', () => wwTrack.style.animationPlayState = 'paused');
      wwMar.addEventListener('mouseleave', () => wwTrack.style.animationPlayState = 'running');
    }

    // features marquees (.features-marquee .track or .features-track)
    const featureTracks = Array.from(document.querySelectorAll('.features-marquee .track, .features-track'));
    featureTracks.forEach(track => {
      ensureDuplication(track);
      const compute = () => {
        const w = track.scrollWidth || track.getBoundingClientRect().width || 1000;
        const pxPerSecond = 160;
        const seconds = Math.max(12, Math.round(w / pxPerSecond));
        track.style.animationDuration = `${seconds}s`;
      };
      // small delay to allow layout
      setTimeout(compute, 250);
      // pause/resume on container
      const parent = track.closest('.features-marquee') || track.parentElement;
      if (parent) {
        parent.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
        parent.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
      }
    });

    // clients marquee: specialized initialization to ensure inner wrapper (clients-track__inner)
    (function clientsMarqueeInit() {
      const track = document.getElementById('clientsTrack');
      if (!track) return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        track.style.overflowX = 'auto';
        return;
      }
      if (track.dataset.ready) return;
      const originalCards = Array.from(track.children);
      if (!originalCards.length) return;

      const inner = document.createElement('div');
      inner.className = 'clients-track__inner';
      // append clones of originals
      originalCards.forEach(card => inner.appendChild(card.cloneNode(true)));
      track.innerHTML = '';
      track.appendChild(inner);

      // fill more until inner width >= 2x container width (or up to reasonable loops)
      function fillWidth() {
        const containerWidth = track.clientWidth || track.getBoundingClientRect().width || 1000;
        let totalWidth = inner.scrollWidth;
        if (totalWidth === 0) return false;
        let loops = 0;
        while (totalWidth < containerWidth * 2 && loops < 10) {
          originalCards.forEach(card => inner.appendChild(card.cloneNode(true)));
          totalWidth = inner.scrollWidth;
          loops++;
        }
        return true;
      }

      function setDuration() {
        const pixels = inner.scrollWidth || inner.getBoundingClientRect().width || 1600;
        const pxPerSec = 130;
        const seconds = Math.max(10, Math.round(pixels / pxPerSec));
        inner.style.setProperty('--marquee-duration', `${seconds}s`);
      }

      // try to fill after images/layout settle
      let tries = 0;
      function tryStart() {
        const ok = fillWidth();
        tries++;
        if (!ok && tries < 10) {
          setTimeout(tryStart, 150);
          return;
        }
        setDuration();
        track.dataset.ready = '1';
      }
      tryStart();

      // pause/resume on hover
      track.addEventListener('mouseenter', () => inner.style.animationPlayState = 'paused');
      track.addEventListener('mouseleave', () => inner.style.animationPlayState = 'running');

      // recalc on resize (debounced)
      let rTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(rTimer);
        rTimer = setTimeout(() => {
          fillWidth();
          setDuration();
        }, 180);
      });
    })();

    // fallback: if CSS animations aren't running for some tracks, optionally fallback to JS (lightweight)
    (function marqueeFallbackIfNeeded() {
      const checkTrack = document.querySelector('.ww-track');
      if (!checkTrack) return;
      const computed = window.getComputedStyle(checkTrack);
      const animName = computed.getPropertyValue('animation-name') || computed.animationName;
      const animPlayState = computed.getPropertyValue('animation-play-state') || computed.animationPlayState;
      const useJS = !animName || animName === 'none' || animPlayState === 'paused';
      if (!useJS) return;
      // simple fallback for .ww-track
      const wwTrack = checkTrack;
      const parent = document.querySelector('.ww-marquee');
      if (!wwTrack || !parent) return;
      let pos = 0;
      const speed = 0.35; // px per frame approx
      let paused = false;
      parent.addEventListener('mouseenter', () => paused = true);
      parent.addEventListener('mouseleave', () => paused = false);
      function step() {
        if (!paused) {
          pos -= speed;
          const limit = wwTrack.scrollWidth / 2 || 1000;
          if (Math.abs(pos) >= limit) pos = pos + limit;
          wwTrack.style.transform = `translateX(${pos}px)`;
        }
        requestAnimationFrame(step);
      }
      wwTrack.style.animation = 'none';
      wwTrack.style.transform = 'translateX(0)';
      requestAnimationFrame(step);
    })();

  })();


  /* ---------- BOOK FORM ---------- */
  (function bookFormHandler() {
    const form = document.getElementById('bookForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name') || '').trim();
      const email = (fd.get('email') || '').trim();
      const company = (fd.get('company') || '').trim();
      const datetime = (fd.get('datetime') || '').trim();
      const message = (fd.get('message') || '').trim();
      if (!name || !email) { alert('Please enter your name and email.'); return; }
      const subject = encodeURIComponent('Book a call: ' + name);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCompany/Role: ${company}\nPreferred time: ${datetime}\n\nMessage:\n${message}`);
      // keep your original mailto target (you used sales@yourdomain.com previously)
      window.location.href = `mailto:sales@yourdomain.com?subject=${subject}&body=${body}`;
      form.reset();
      if (navigator.vibrate) navigator.vibrate(20);
      setTimeout(()=> alert('Thanks — your message is ready in your mail client. You can send it to complete booking.'), 300);
    });
  })();


  /* ---------- REVEAL ON SCROLL ---------- */
  (function revealObserver() {
    const selectors = '.reveal-card, .price-card-aithor, .feat-card, .service-card';
    const els = document.querySelectorAll(selectors);
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible', 'is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  })();


  /* ---------- NAV HIGHLIGHT ON SCROLL ---------- */
  (function navHighlightOnScroll() {
    const items = Array.from(document.querySelectorAll('.nav-links a.nav-item'));
    if (!items.length || !('IntersectionObserver' in window)) return;
    const sections = items.map(a => {
      const href = a.getAttribute('href') || '#';
      const id = href.startsWith('#') ? href.slice(1) : null;
      return id ? document.getElementById(id) : null;
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const idx = sections.indexOf(entry.target);
        if (idx === -1) return;
        items.forEach(it => it.classList.remove('active'));
        if (entry.isIntersecting) items[idx].classList.add('active');
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    sections.forEach(s => s && io.observe(s));

    // smooth scroll on click + close mobile menu if open
    items.forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('href').slice(1);
        const sec = document.getElementById(id);
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const mob = document.querySelector('.mobile-menu.open');
        if (mob) { mob.classList.remove('open'); document.getElementById('menu-btn')?.setAttribute('aria-expanded','false'); }
      });
    });
  })();


  /* ---------- FOOTER YEAR ---------- */
  (function footerYear() {
    const el = document.getElementById('footer-year') || document.getElementById('year');
    if (el && !el.textContent.trim()) el.textContent = String(new Date().getFullYear());
  })();


  /* ---------- FAQ ACCORDION (single init) ---------- */
  (function faqAccordion() {
    const btns = document.querySelectorAll('.faq-q');
    if (!btns.length) return;
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btns.forEach(b => {
          if (b !== btn) { b.setAttribute('aria-expanded', 'false'); b.closest('.faq-item')?.classList.remove('open'); }
        });
        btn.setAttribute('aria-expanded', String(!expanded));
        btn.closest('.faq-item')?.classList.toggle('open', !expanded);
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      });
    });
  })();

})();

//hero section


//pointer or cursor 
/* ---------------------------------------------------
   MODERN POINTER TRACER – Glow Ring + Dot
--------------------------------------------------- */
(function () {
  if ('ontouchstart' in window) return; // Disable on mobile

  // Avoid duplicate injection
  if (document.body.dataset.pointerInstalled) return;
  document.body.dataset.pointerInstalled = "1";

  // Create pointer elements
  const wrap = document.createElement("div");
  wrap.className = "pointer-wrap";

  const dot = document.createElement("div");
  dot.className = "pointer-dot";

  const ring = document.createElement("div");
  ring.className = "pointer-ring";

  wrap.appendChild(dot);
  wrap.appendChild(ring);
  document.body.appendChild(wrap);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;

  let currentX = targetX;
  let currentY = targetY;

  const smooth = 0.15; // Smoothness (lower = smoother)
  let lastMove = Date.now();

  function animate() {
    currentX += (targetX - currentX) * smooth;
    currentY += (targetY - currentY) * smooth;

    dot.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

    // Hide when idle
    if (Date.now() - lastMove > 1600) {
      dot.classList.add("pointer-hidden");
      ring.classList.add("pointer-hidden");
    } else {
      dot.classList.remove("pointer-hidden");
      ring.classList.remove("pointer-hidden");
    }

    requestAnimationFrame(animate);
  }
  animate();

  // Move listener
  window.addEventListener("mousemove", e => {
    lastMove = Date.now();
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Click ripple
  window.addEventListener("mousedown", e => {
    const pulse = document.createElement("div");
    pulse.className = "pointer-click";
    pulse.style.left = e.clientX + "px";
    pulse.style.top = e.clientY + "px";
    document.body.appendChild(pulse);
    setTimeout(() => pulse.remove(), 500);
  });
})();


//hero section 

// HERO ALBERT – duplicate band text for smooth infinite scroll
(function () {
  const band = document.getElementById("heroBand");
  if (!band) return;
  const original = band.innerHTML;
  band.innerHTML = original + original;
})();
