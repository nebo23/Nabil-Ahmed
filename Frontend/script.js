document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Navbar scroll style ───────────────────────────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  
    // ── 2. Mobile hamburger ──────────────────────────────────────
    const hamburger = document.querySelector('.hamburger');
    const navLinks  = document.querySelector('.nav-links');
  
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('nav-active');
      hamburger.classList.toggle('toggle');
    });
  
    document.querySelectorAll('.nav-links li a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-active');
        hamburger.classList.remove('toggle');
      });
    });
  
    // ── 3. Scroll-reveal ─────────────────────────────────────────
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal, .reveal-right').forEach(el => io.observe(el));
  
    // ── 3b. Home hero — live typing code under social icons ─────────
    (function initHeroCodeTyping() {
      const home = document.getElementById('home');
      const out = document.getElementById('hero-code-output');
      if (!home || !out) return;

      const PHRASES = [
        'Full-Stack Builder',
        'Machine Learning',
        'Scalable Systems',
        'Creative Develoepr',
        'AI Automation',
      ];

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        out.textContent = PHRASES.join(' · ');
        return;
      }

      let wi = 0;
      let i = 0;
      let phase = 'type';
      let running = false;
      let t = null;

      const clearT = () => {
        if (t) {
          clearTimeout(t);
          t = null;
        }
      };

      const schedule = (fn, ms) => {
        clearT();
        t = setTimeout(fn, ms);
      };

      const tick = () => {
        if (!running) return;
        const full = PHRASES[wi % PHRASES.length];

        if (phase === 'type') {
          if (i < full.length) {
            const ch = full[i];
            i += 1;
            out.textContent = full.slice(0, i);
            const delay =
              ch === ' '
                ? 55 + Math.random() * 45
                : ch === '-' || ch === '/'
                  ? 40 + Math.random() * 35
                  : 32 + Math.random() * 38;
            schedule(tick, delay);
          } else {
            phase = 'pause';
            schedule(tick, 1500 + Math.random() * 500);
          }
        } else if (phase === 'pause') {
          phase = 'delete';
          tick();
        } else {
          if (i > 0) {
            i = Math.max(0, i - 3);
            out.textContent = full.slice(0, i);
            schedule(tick, 14 + Math.random() * 10);
          } else {
            out.textContent = '';
            wi = (wi + 1) % PHRASES.length;
            phase = 'type';
            schedule(tick, 400 + Math.random() * 200);
          }
        }
      };

      const ioHome = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (!running) {
                running = true;
                wi = 0;
                i = 0;
                phase = 'type';
                tick();
              }
            } else {
              running = false;
              clearT();
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px' }
      );

      ioHome.observe(home);
    })();

    // ── 4. card-3d mouse-parallax ─────────────────────────────────
    // Only on fine-pointer (mouse/trackpad) devices.
    // On touch screens the CSS default tilt already looks great.
    const visualArea = document.getElementById('hero-visual-area');
    const card3d     = document.getElementById('card-3d');
  
    if (visualArea && card3d && window.matchMedia('(pointer: fine)').matches) {
  
      const MAX_ROT = 15;   // max degrees of rotation in each axis
  
      let mouseX = 0.5;     // normalised -1…1 (default: slight right)
      let mouseY = -0.3;    // normalised -1…1 (default: slight up)
      let tX = mouseX;
      let tY = mouseY;
  
      // Track mouse position relative to the visual container
      visualArea.addEventListener('mousemove', e => {
        const r = visualArea.getBoundingClientRect();
        mouseX = ((e.clientX - r.left)  / r.width)  * 2 - 1;
        mouseY = ((e.clientY - r.top)   / r.height) * 2 - 1;
      });
  
      // Snap back to tasteful resting angle on mouse leave
      visualArea.addEventListener('mouseleave', () => {
        mouseX = 0.5;
        mouseY = -0.3;
      });
  
      // Smooth interpolation loop
      (function animate() {
        tX += (mouseX - tX) * 0.1;
        tY += (mouseY - tY) * 0.1;
  
        const rX = tY * -MAX_ROT;   // invert Y for natural tilt
        const rY = tX *  MAX_ROT;
  
        card3d.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
        requestAnimationFrame(animate);
      })();
    }

    // ── 4b. About section — scroll-driven portrait reveal + copy ───
    (function initAboutShowcaseScroll() {
      const about = document.getElementById('about');
      if (!about || !about.classList.contains('about-showcase')) return;

      const clamp01 = (v) => Math.min(1, Math.max(0, v));

      const setVars = (p, t, ts) => {
        about.style.setProperty('--about-p', p.toFixed(4));
        about.style.setProperty('--about-t', t.toFixed(4));
        about.style.setProperty('--about-ts', ts.toFixed(4));
      };

      const compute = () => {
        const rect = about.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.9;
        const end = vh * 0.18;
        const track = Math.max(1, start - end);
        const raw = (start - rect.top) / track;
        const p = clamp01(raw);
        const t = clamp01((raw - 0.22) / 0.55);
        const ts = clamp01((raw - 0.42) / 0.5);
        setVars(p, t, ts);
      };

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        about.classList.add('about-showcase--static');
        return;
      }

      let rafId = 0;
      const onScrollOrResize = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          compute();
        });
      };

      window.addEventListener('scroll', onScrollOrResize, { passive: true });
      window.addEventListener('resize', onScrollOrResize);
      compute();
    })();

    // ── 4c. Work / Projects — scroll lift (lower → upper), staggered ─
    (function initProjectsScrollLift() {
      const section = document.getElementById('projects');
      if (!section || !section.classList.contains('projects-scroll')) return;

      const title = section.querySelector('.projects-section-title');
      const cards = Array.from(section.querySelectorAll('.project-card'));
      if (!cards.length) return;

      const clamp01 = (v) => Math.min(1, Math.max(0, v));

      const compute = () => {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const enterTop = vh * 0.92;
        const enterEnd = vh * 0.2;
        const p = clamp01((enterTop - rect.top) / Math.max(1, enterTop - enterEnd));

        if (title) {
          const ut = clamp01(p / 0.38);
          title.style.setProperty('--work-u', ut.toFixed(4));
        }

        const n = cards.length;
        cards.forEach((card, i) => {
          const start = 0.08 + (i / Math.max(1, n)) * 0.48;
          const u = clamp01((p - start) / 0.44);
          card.style.setProperty('--work-u', u.toFixed(4));
        });
      };

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        section.classList.add('projects-scroll--static');
        return;
      }

      let rafId = 0;
      const tick = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          compute();
        });
      };

      window.addEventListener('scroll', tick, { passive: true });
      window.addEventListener('resize', tick);
      compute();
    })();

    // ── 4d. Section spotlight — apply to all non-home sections ──────
    (function initSectionSpotlights() {
      const hosts = Array.from(document.querySelectorAll('.section-spotlight-host'));
      if (!hosts.length) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const fine = window.matchMedia('(pointer: fine)').matches;
      const mobile = window.matchMedia('(max-width: 768px)').matches;

      hosts.forEach(host => {
        const layer = host.querySelector('.section-spotlight-layer');
        if (!layer) return;

        const setPct = (x, y) => {
          layer.style.setProperty('--spot-x', `${x}%`);
          layer.style.setProperty('--spot-y', `${y}%`);
        };

        if (reduced || !fine || mobile) {
          host.classList.add('section-spotlight--off');
          return;
        }

        let targetX = 50;
        let targetY = 45;
        let curX = 50;
        let curY = 45;
        let rafId = 0;
        let animating = false;

        const tick = () => {
          if (!animating) {
            rafId = 0;
            return;
          }
          curX += (targetX - curX) * 0.15;
          curY += (targetY - curY) * 0.15;
          setPct(curX, curY);
          if (Math.abs(targetX - curX) < 0.08 && Math.abs(targetY - curY) < 0.08) {
            setPct(targetX, targetY);
            curX = targetX;
            curY = targetY;
            animating = false;
            rafId = 0;
            return;
          }
          rafId = requestAnimationFrame(tick);
        };

        const queue = () => {
          if (!animating) {
            animating = true;
            rafId = requestAnimationFrame(tick);
          }
        };

        host.addEventListener('mousemove', e => {
          const r = host.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) return;
          targetX = ((e.clientX - r.left) / r.width) * 100;
          targetY = ((e.clientY - r.top) / r.height) * 100;
          queue();
        });

        host.addEventListener('mouseleave', () => {
          targetX = 50;
          targetY = 45;
          queue();
        });

        const io = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (!entry.isIntersecting) {
                animating = false;
                if (rafId) cancelAnimationFrame(rafId);
                rafId = 0;
              }
            });
          },
          { threshold: 0 }
        );
        io.observe(host);

        setPct(50, 45);
      });
    })();

    // ── 4e. Contact — one-time fade-in-up reveal ────────────────────
    (function initContactFadeInUp() {
      const section = document.getElementById('contact');
      if (!section || !section.classList.contains('contact-fade')) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        section.classList.add('is-visible');
        return;
      }

      const ioContact = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              section.classList.add('is-visible');
              ioContact.disconnect();
            }
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
      );

      ioContact.observe(section);
    })();

    // ── 4f. Stats — one-time count up when visible ─────────────────
    (function initStatsCountUp() {
      const section = document.getElementById('stats');
      if (!section) return;

      const counters = Array.from(section.querySelectorAll('.stat-number[data-target]'));
      if (!counters.length) return;

      const animateCounter = (el) => {
        const target = Number.parseInt(el.dataset.target || '0', 10);
        if (!Number.isFinite(target) || target < 0) {
          el.textContent = '0';
          return;
        }

        const duration = 1500;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(target * eased);
          el.textContent = String(value);
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      };

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        section.classList.add('is-visible');
        counters.forEach(el => {
          el.textContent = String(Number.parseInt(el.dataset.target || '0', 10));
        });
        return;
      }

      let hasRun = false;
      const ioStats = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !hasRun) {
              hasRun = true;
              section.classList.add('is-visible');
              counters.forEach(animateCounter);
              ioStats.disconnect();
            }
          });
        },
        { threshold: 0.3, rootMargin: '0px 0px -8% 0px' }
      );

      ioStats.observe(section);
    })();
  
    // ── 5. Contact form → FastAPI ────────────────────────────────
    const form = document.querySelector('.contact-form');
    if (form) {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn  = form.querySelector('.submit-btn');
        const orig = btn.innerText;
  
        const payload = {
          name:    document.getElementById('name').value,
          email:   document.getElementById('email').value,
          message: document.getElementById('message').value,
        };
  
        try {
          const res = await fetch('http://127.0.0.1:8000/post_message', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
          });
  
          if (res.ok) {
            btn.innerText = 'Transmission Sent ✓';
            btn.style.cssText = 'background:var(--gold);color:var(--bg);border-color:var(--gold)';
            form.reset();
          } else {
            btn.innerText = 'Error — Try Again';
            btn.style.cssText = 'background:#c0392b;color:#fff;border-color:#c0392b';
          }
        } catch {
          btn.innerText = 'Server Offline';
          btn.style.cssText = 'background:#c0392b;color:#fff;border-color:#c0392b';
        }
  
        setTimeout(() => {
          btn.innerText = orig;
          btn.style.cssText = '';
        }, 3500);
      });
    }
  
  });