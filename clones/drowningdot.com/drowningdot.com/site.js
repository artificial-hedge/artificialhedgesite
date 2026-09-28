/* ═══════════════════════════════════════════════════════════════════════════
   drowningdot · shared behaviour
   Reveals, the dual-trigger media state, and nav inversion. Page-specific
   sparks stay inline on their own page.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  /* ── reveals ──────────────────────────────────────────────────────────────
     IntersectionObserver where available, plus an unconditional setTimeout
     floor. A backgrounded tab freezes rAF, and without the floor a reader who
     opens the page in a background tab can return to a blank document.      */
  /* stagger groups ride the same observer and the same .shown class; the only
     extra work is numbering the children so CSS can space their delays. The
     index is capped so a long grid cannot push its last item most of a second
     behind its first. */
  [].slice.call(document.querySelectorAll('[data-stagger]')).forEach(function (g) {
    for (var i = 0; i < g.children.length; i++) {
      g.children[i].style.setProperty('--i', Math.min(i, 9));
    }
  });

  var reveals = [].slice.call(
    document.querySelectorAll('[data-reveal],[data-stagger]'));
  function showAll() {
    reveals.forEach(function (el) { el.classList.add('shown'); });
  }
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('shown'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    showAll();
  }
  setTimeout(showAll, 2600);

  /* ── deferred preview images ──────────────────────────────────────────────
     Sixteen background images across the contact sheet and the work index, all
     of them at least 2,000px down the page, were fetched and decoded on load:
     410KB of JPEG and 6.3 megapixels, finishing at 2.0s while nine of them also
     carried a blur filter. A reader who reloads and immediately scrolls is
     competing with that decode, which is exactly what a cold measurement here
     showed — the process section fell to 47fps and 17% dropped frames on a
     first run, then held 60fps and 4% once warm on the same build.

     The URL lives in a --bg custom property because a var() value is inert
     until something uses it, so the markup keeps the path and the browser
     skips the fetch. 700px of rootMargin means each one is decoded before it
     can be seen rather than as it arrives.

     That was measured on sixteen. The sheet now carries twenty-three, because
     the rotation keeps six frames benched at display:none and swaps them in over
     time. Anything with no box is skipped everywhere below — a benched frame is
     not near the viewport, it is nowhere — so the extra seven cost nothing until
     the rotation calls one, and the rotation decodes it itself before revealing
     it. Without that guard every path here would treat a zero rect as a hit and
     load the entire bench, which is the whole saving. */
  (function () {
    var deferred = [].slice.call(document.querySelectorAll('[data-bg]'));
    if (!deferred.length) return;
    function load(el) {
      el.style.backgroundImage = 'var(--bg)';
      el.removeAttribute('data-bg');
    }
    /* a benched frame is display:none, so its rect is four zeros. Every
       proximity test below would read that as "at the top of the viewport". */
    function boxed(el) {
      var r = el.getBoundingClientRect();
      return !!(r.width || r.height);
    }
    if (!('IntersectionObserver' in window)) {
      deferred.forEach(function (el) { if (boxed(el)) load(el); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { load(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '700px 0px 700px 0px' });
    deferred.forEach(function (el) { io.observe(el); });

    /* A backgrounded tab fires no observer, and its timers are throttled — the
       8s floor below was measured still pending at 138 seconds, with the whole
       contact sheet sitting empty across three viewport-heights. Empty grid is
       indistinguishable from broken, and it was the centre of the page.

       visibilitychange is the signal that actually arrives. On the way back in
       it does the observer's job by hand for anything already near the
       viewport, using the same 700px margin, so the sheet is there when the
       tab is looked at. It stays a sweep rather than a blanket load, or a
       reader who tabs away at the top would come back having paid for all
       twenty-three — which is the cost the deferral exists to avoid. */
    function sweep() {
      var vh = window.innerHeight;
      deferred.forEach(function (el) {
        if (!el.hasAttribute('data-bg') || !boxed(el)) return;
        var r = el.getBoundingClientRect();
        if (r.bottom > -700 && r.top < vh + 700) { load(el); io.unobserve(el); }
      });
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) sweep();
    });
    /* the floor: if no observer ever fires, everything on the page still
       arrives. Benched frames are excluded — they are not on the page, and the
       rotation decodes each one itself on the way in. */
    setTimeout(function () {
      deferred.forEach(function (el) { if (boxed(el)) load(el); });
    }, 8000);
  })();

  /* ── media state: one visual state, two input models ──────────────────────
     STEAL, Monolog: hover drives it on pointer devices, a centre-of-viewport
     ScrollTrigger drives it on touch. No duplicated markup, and nothing is
     hover-only.                                                             */
  var media = [].slice.call(document.querySelectorAll('.cell, .take'));
  if (media.length) {
    if (window.matchMedia('(hover:hover)').matches) {
      media.forEach(function (el) {
        if (el.tagName !== 'BUTTON' && el.tagName !== 'A') { el.tabIndex = 0; }
        el.addEventListener('mouseenter', function () { el.classList.add('is-on'); });
        el.addEventListener('mouseleave', function () { el.classList.remove('is-on'); });
        el.addEventListener('focus', function () { el.classList.add('is-on'); });
        el.addEventListener('blur', function () { el.classList.remove('is-on'); });
      });
    } else if ('IntersectionObserver' in window) {
      var mo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          e.target.classList.toggle('is-on', e.isIntersecting);
        });
      }, { rootMargin: '-38% 0px -38% 0px' });
      media.forEach(function (el) { mo.observe(el); });
    } else {
      media.forEach(function (el) { el.classList.add('is-on'); });
    }
  }

  /* ── inertial scroll ──────────────────────────────────────────────────────
     Wheel events are intercepted and eased, but REAL scroll position is what
     gets written, via window.scrollTo. That distinction matters: the virtual
     scroll deck where scrollHeight === innerHeight was Artem Shcherbakov's
     reject because it destroys the scrollbar, deep links, find-in-page and
     keyboard paging. Here only the wheel is smoothed. Keyboard, spacebar,
     Home/End, anchor jumps and find-in-page all still use native scroll, and
     a scroll listener resyncs the target so they never fight.
     Touch is left alone entirely: native momentum beats anything re-implemented.
  */
  (function () {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if (!window.matchMedia('(hover:hover)').matches) return;   /* pointer only */

    var target = window.scrollY, current = target, running = false;
    /* .085 closes 8.5% of the remaining gap per frame, which measured 433ms to
       reach 90% of one wheel tick and 785ms to settle. The page was holding a
       steady 60fps throughout — nothing was dropping frames — but scroll that
       keeps drifting for three quarters of a second after your hand stops does
       not read as smooth, it reads as lag. The smoothing is worth keeping; this
       much of it was not. .19 lands 90% in about 175ms, which still eases the
       step without breaking the link to the input. */
    var EASE = 0.19;

    function limit() {
      return Math.max(0, (document.scrollingElement || document.body).scrollHeight
        - window.innerHeight);
    }

    function tick() {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.4) { current = target; running = false; }
      window.scrollTo(0, current);
      if (running) requestAnimationFrame(tick);
    }

    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey) return;            /* pinch-zoom is not scroll */
      if (e.deltaMode !== 0) return;                 /* page/line mode: leave it */
      e.preventDefault();
      target = Math.min(limit(), Math.max(0, target + e.deltaY));
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: false });

    /* anything that scrolls natively wins: resync so the next wheel does not
       yank the page back to a stale target */
    window.addEventListener('scroll', function () {
      if (!running) { target = current = window.scrollY; }
    }, { passive: true });

    window.addEventListener('resize', function () {
      target = current = window.scrollY;
    }, { passive: true });
  })();

  /* ── invert reveal: a circle grown from the cursor ────────────────────────
     Generic over every [data-invert], so the nav link and the big contact row
     share it. Each is a link that works on its own, so the reveal is decoration
     and is skipped on touch and under reduced motion without costing anyone
     the action.                                                             */
  (function () {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if (!window.matchMedia('(hover:hover)').matches) return;

    [].slice.call(document.querySelectorAll('[data-invert]')).forEach(function (host) {
      var top = host.querySelector('.inv-top');
      if (!top) return;
      var cx = 0, cy = 0, cur = 0, target = 0, running = false;
      /* the dotted fringe layer is injected rather than authored into every
         button, so the markup stays two faces and nothing else */
      var dots = host.querySelector('.inv-dots');
      if (!dots) {
        dots = document.createElement('span');
        dots.className = 'inv-dots';
        dots.setAttribute('aria-hidden', 'true');
        host.insertBefore(dots, top);
      }

      function furthest() {
        var b = host.getBoundingClientRect();
        var dx = Math.max(cx, b.width - cx);
        var dy = Math.max(cy, b.height - cy);
        return Math.sqrt(dx * dx + dy * dy);
      }
      function at(e) {
        var b = host.getBoundingClientRect();
        cx = e.clientX - b.left;
        cy = e.clientY - b.top;
      }
      function paint() {
        /* 0.09, not 0.19: at the faster rate the circle reached 70% of its
           radius in 90ms, too quick to read as extending from the cursor */
        cur += (target - cur) * 0.09;
        if (Math.abs(target - cur) < 0.4) { cur = target; running = false; }
        var s = host.style;
        s.setProperty('--cx', cx.toFixed(1) + 'px');
        s.setProperty('--cy', cy.toFixed(1) + 'px');
        s.setProperty('--ri', cur.toFixed(1) + 'px');
        /* the fringe runs ahead of the core, so the dots arrive first and the
           solid panel catches up through them */
        s.setProperty('--ro', (cur > 0.5 ? cur * 1.18 + 30 : 0).toFixed(1) + 'px');
        if (running) requestAnimationFrame(paint);
      }
      function kick() { if (!running) { running = true; requestAnimationFrame(paint); } }

      host.addEventListener('pointerenter', function (e) {
        at(e); target = furthest(); kick();
      });
      host.addEventListener('pointermove', function (e) {
        at(e);
        /* recentre while open so the reveal tracks the cursor rather than
           staying where it first landed */
        if (target > 0) target = furthest();
        kick();
      });
      host.addEventListener('pointerleave', function () { target = 0; kick(); });
    });
  })();

  /* ── scroll-speed grain ───────────────────────────────────────────────────
     Scroll fast and the film grain coarsens; slow down and it resolves. The
     grain changes SIZE rather than opacity, so symmetric noise coarsens without
     shifting average luminance — speed cannot cost text contrast at all, rather
     than costing a little and being tuned until it looks acceptable.

     This used to drive --dot as well, and the dot screen over the imagery moved
     with it. That is gone: animating background-size on a gradient repaints the
     tile for every cell on every frame, and across nine cells with blurred
     plates beneath them it was the thing making the page feel heavy. The screen
     is a fixed 3px now. One layer still answers scroll speed rather than two,
     and it is the cheap one — a single fixed element, not nine repainting.

     If the moving screen is ever wanted back, the cost is in the repaint, not
     the arithmetic: it needs a transform or opacity channel, not background-size. */
  (function () {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

    var GRAIN_REST = 128, GRAIN_MAX = 224;
    var FAST = 58;                   /* px per frame counted as flat out */

    var lastY = window.scrollY, smooth = 0, spinning = false, lastT = -1;

    function apply(t) {
      var q = Math.round(t * 20) / 20;             /* quantise: fewer writes */
      if (q === lastT) return;
      lastT = q;
      root.style.setProperty('--grain-scale',
        Math.round(GRAIN_REST + (GRAIN_MAX - GRAIN_REST) * q) + 'px');
    }

    function loop() {
      var y = window.scrollY;
      var v = Math.abs(y - lastY);
      lastY = y;
      /* asymmetric easing: coarsen quickly, resolve slowly, so the settling
         back into focus is the part you actually notice */
      smooth += (v - smooth) * (v > smooth ? 0.4 : 0.08);
      apply(Math.min(1, smooth / FAST));
      if (smooth > 0.3) {
        requestAnimationFrame(loop);
      } else {
        spinning = false;
        apply(0);
      }
    }

    window.addEventListener('scroll', function () {
      if (!spinning) { spinning = true; requestAnimationFrame(loop); }
    }, { passive: true });
  })();

  /* ── moiré band cursor lens ───────────────────────────────────────────────
     Position is written straight to transform inside a rAF, so a burst of
     pointermove events collapses into one write per frame rather than one per
     event. Nothing here touches layout or paint — the lens is a fixed circle
     that only ever moves. */
  (function () {
    var band = document.querySelector('.moire');
    if (!band) return;
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if (!window.matchMedia('(hover:hover)').matches) return;

    var lens = band.querySelector('.lens');
    if (!lens) return;
    var x = 0, y = 0, queued = false;

    function paint() {
      queued = false;
      lens.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    }
    band.addEventListener('pointermove', function (e) {
      var r = band.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    }, { passive: true });
    band.addEventListener('pointerenter', function () { band.classList.add('lit'); });
    band.addEventListener('pointerleave', function () { band.classList.remove('lit'); });
  })();

  /* ── nav scrim, off over the pleat ─────────────────────────────────────── */
  (function () {
    var on = false;
    function tick() {
      var want = window.scrollY > window.innerHeight * 0.6;
      if (want === on) return;                 /* class writes only on the edge */
      on = want;
      document.body.classList.toggle('nav-scrim', on);
    }
    window.addEventListener('scroll', tick, { passive: true });
    tick();                                    /* a reload mid-page starts right */
  })();

  /* ── nav ink over the page's single light band ─────────────────────────── */
  var light = document.querySelector('[data-light-band]');
  if ('IntersectionObserver' in window && light) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        document.body.classList.toggle('nav-ink', e.isIntersecting);
      });
    }, { rootMargin: '-60px 0px -85% 0px' }).observe(light);
  }
})();
