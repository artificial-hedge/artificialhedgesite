/* ═══════════════════════════════════════════════════════════════════════════
   drowningdot · the pool

   A band of red closing the page, with the wordmark submerged in it. Moving a
   pointer through the surface parts the red and slowly uncovers the name, then
   it closes over again.

   Two fields, deliberately separate. The earlier version conflated them and got
   both jobs wrong: a real height-field wave simulation looked organic and messy
   rather than designed, and because the same field drove concealment the red
   never properly covered the logo.

     WAVE     stylised, not simulated. A few long sine terms summed and then
              QUANTISED into flat bands with a Bayer-dithered edge, so it reads
              as motion graphics. It only affects the red's shade, never its
              opacity, so it can never uncover anything.
     COVER    a separate field, opaque everywhere at rest so the name is fully
              hidden. Only the pointer erodes it, and it heals slowly.

   Guards: runs only while on screen, never under prefers-reduced-motion, and
   touch gets an automatic sweep since it has no hover to discover this with.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var band = document.querySelector('.pool');
  if (!band) return;
  var cv = band.querySelector('canvas');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');

  var INK = '#0D0D0C';
  var SHEET = 'rgb(234,232,225)';
  var RED = [186, 58, 36];

  var CELL = 7;
  var BANDS = 5;             /* flat steps in the wave: the graphic look */
  /* the brush is narrower than the letters are tall, so one pass only clears a
     stripe. A slower heal lets successive passes accumulate and actually
     uncover the name, which is the "slowly revealing" part of the idea. */
  var HEAL = 0.9979;         /* how slowly the red closes back over */
  var BRUSH = 8;             /* cells */
  var WAVE_EVERY = 3;        /* wave frames are slow, so no need for 60fps */

  /* 4x4 Bayer matrix, normalised. Dithers the band edges so the transitions
     stipple instead of showing hard contour lines. */
  var BAYER = [0,8,2,10, 12,4,14,6, 3,11,1,9, 15,7,13,5].map(function (v) {
    return (v + 0.5) / 16 - 0.5;
  });

  var W = 0, H = 0, dpr = 1, gw = 0, gh = 0;
  var shade, cover, warp;
  var WARP_DECAY = 0.972, WARP_AMT = 1.35;
  var warpLive = 0;
  var off, offCtx, offImg;
  var textCv, textCtx;
  var running = false, visible = false, raf = 0, tick = 0;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    /* commit the measurement only once it is known good. Embedded browsers and
       mid-rotation phones can report 0x0 here; assigning W first left W=0 next
       to buffers sized for the old width, and paint() read offImg before any
       layout had ever succeeded. A failed pass now changes nothing. */
    var w = band.clientWidth, h = band.clientHeight;
    if (!w || !h) return;
    W = w; H = h;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    gw = Math.max(8, Math.ceil(W / CELL));
    gh = Math.max(8, Math.ceil(H / CELL));
    shade = new Float32Array(gw * gh);
    cover = new Float32Array(gw * gh);
    warp  = new Float32Array(gw * gh);
    for (var i = 0; i < cover.length; i++) cover[i] = 1;   /* fully opaque */

    off = off || document.createElement('canvas');
    off.width = gw; off.height = gh;
    offCtx = off.getContext('2d');
    offImg = offCtx.createImageData(gw, gh);

    buildText();
    computeWave(0);
  }

  function buildText() {
    textCv = textCv || document.createElement('canvas');
    textCv.width = Math.round(W * dpr);
    textCv.height = Math.round(H * dpr);
    textCtx = textCv.getContext('2d');
    textCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    textCtx.clearRect(0, 0, W, H);
    var size = Math.max(40, Math.min(168, W * 0.112));
    textCtx.font = '500 ' + size + 'px \'Instrument Sans\', system-ui, sans-serif';
    textCtx.fillStyle = SHEET;
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    /* sits above centre, because the detail ledger occupies the lower band */
    textCtx.fillText('drowningdot', W / 2, H * 0.42);
  }

  /* ── the wave: long sines, flattened into bands, dithered at the edges ──── */
  function computeWave(t) {
    for (var y = 0; y < gh; y++) {
      var ny = y / gh;
      for (var x = 0; x < gw; x++) {
        var nx = x / gw;
        var v = Math.sin(nx * 3.0 + t * 0.00024)
              + Math.sin(nx * 1.6 - ny * 2.4 + t * 0.00033) * 0.7
              + Math.sin(ny * 4.4 + nx * 0.8 - t * 0.00019) * 0.5;
        v = (v + 2.2) / 4.4;                            /* -> 0..1 */
        /* the pointer bends the bands themselves, so the halftone visibly
           answers the cursor instead of only a hole being punched in the red */
        var i = y * gw + x;
        v += warp[i] * WARP_AMT;
        var dith = BAYER[(y & 3) * 4 + (x & 3)] * (1 / BANDS);
        var q = Math.round((v + dith) * (BANDS - 1)) / (BANDS - 1);
        shade[i] = q < 0 ? 0 : q > 1 ? 1 : q;
      }
    }
  }

  function paint() {
    if (!offImg) return;               /* no successful layout yet */
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, W, H);
    if (textCv) ctx.drawImage(textCv, 0, 0, W, H);

    var d = offImg.data;
    for (var i = 0, p = 0; i < cover.length; i++, p += 4) {
      /* bands run from a deep maroon to a bright red. Shade never touches
         alpha, so the wave cannot reveal the name on its own. */
      var s = 0.62 + shade[i] * 0.62;
      var r = RED[0] * s, g = RED[1] * s, b = RED[2] * s;
      d[p] = r > 255 ? 255 : r;
      d[p + 1] = g > 255 ? 255 : g;
      d[p + 2] = b > 255 ? 255 : b;
      d[p + 3] = cover[i] * 255;
    }
    offCtx.putImageData(offImg, 0, 0);
    ctx.drawImage(off, 0, 0, gw, gh, 0, 0, W, H);
  }

  function frame(now) {
    if (!visible) { running = false; return; }
    if (!offImg) { running = false; return; }
    /* while the pointer's bend is still live the wave has to be recomputed every
       frame, or the halftone answers the cursor at 20fps and reads as lag */
    if (warpLive > 0.002 || tick % WAVE_EVERY === 0) computeWave(now);
    tick++;
    warpLive = 0;

    /* hold still and the opening keeps growing */
    if (holding && holdX >= 0) {
      if (dwell < DWELL_MAX) dwell += 0.028;
      part(holdX, holdY, 0.14, BRUSH * (1 + dwell));
    }
    for (var i = 0; i < cover.length; i++) {
      if (cover[i] < 1) {
        cover[i] = 1 - (1 - cover[i]) * HEAL;
        if (cover[i] > 0.999) cover[i] = 1;
      }
      if (warp[i] !== 0) {
        warp[i] *= WARP_DECAY;
        var a = warp[i] < 0 ? -warp[i] : warp[i];
        if (a < 0.002) warp[i] = 0; else if (a > warpLive) warpLive = a;
      }
    }
    paint();
    raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (!running && visible) { running = true; raf = requestAnimationFrame(frame); }
  }

  function paintStatic() {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, W, H);
    if (textCv) ctx.drawImage(textCv, 0, 0, W, H);
    ctx.fillStyle = 'rgba(186,58,36,0.45)';
    ctx.fillRect(0, 0, W, H);
  }

  /* ── input: a soft brush that erodes the cover ─────────────────────────── */
  function part(gx, gy, strength, radius) {
    var R = radius || BRUSH;
    var r0 = Math.floor(gy - R), r1 = Math.ceil(gy + R);
    var c0 = Math.floor(gx - R), c1 = Math.ceil(gx + R);
    for (var y = r0; y <= r1; y++) {
      if (y < 0 || y >= gh) continue;
      for (var x = c0; x <= c1; x++) {
        if (x < 0 || x >= gw) continue;
        var dx = x - gx, dy = y - gy;
        var d = Math.sqrt(dx * dx + dy * dy) / R;
        if (d > 1) continue;
        var fall = (1 - d) * (1 - d);                 /* smooth edge */
        var i = y * gw + x;
        var v = cover[i] - fall * strength;
        /* 0.02, not 0.06: at the higher floor enough red stayed over the letters
           that the revealed word read as a pink haze rather than the name */
        cover[i] = v < 0.02 ? 0.02 : v;
        /* and bend the bands outward around the same point */
        var wv = warp[i] + fall * strength * 1.6;
        warp[i] = wv > 1.1 ? 1.1 : wv;
        if (wv > warpLive) warpLive = wv;
      }
    }
  }

  /* dwell: holding the pointer still keeps opening the same spot, with the
     cleared radius growing, so patience is rewarded rather than only movement */
  var holdX = -1, holdY = -1, holding = false, dwell = 0;
  var DWELL_MAX = 2.6;          /* multiples of BRUSH the opening can reach */

  var lx = -1, ly = -1;
  function toGrid(e) {
    var b = cv.getBoundingClientRect();
    return { x: (e.clientX - b.left) / b.width * gw,
             y: (e.clientY - b.top) / b.height * gh };
  }
  cv.addEventListener('pointermove', function (e) {
    if (reduce || !gw) return;
    var g = toGrid(e);
    if (lx >= 0) {
      /* step along the path so a fast sweep leaves a continuous channel */
      var n = Math.min(14, Math.ceil(Math.hypot(g.x - lx, g.y - ly) / 2));
      for (var s = 1; s <= n; s++) {
        part(lx + (g.x - lx) * (s / n), ly + (g.y - ly) * (s / n), 0.42);
      }
    } else {
      part(g.x, g.y, 0.34);
    }
    /* moving resets the dwell; staying put lets it build */
    if (holdX >= 0 && Math.hypot(g.x - holdX, g.y - holdY) > 1.2) dwell = 0;
    holdX = g.x; holdY = g.y; holding = true;
    lx = g.x; ly = g.y;
    kick();
  }, { passive: true });
  cv.addEventListener('pointerleave', function () {
    lx = ly = -1; holding = false; dwell = 0; holdX = holdY = -1;
  });
  cv.addEventListener('pointerdown', function (e) {
    if (reduce || !gw) return;
    var g = toGrid(e);
    part(g.x, g.y, 0.85);
    kick();
  }, { passive: true });

  layout();
  if (reduce) paintStatic(); else paint();

  window.addEventListener('resize', function () {
    layout();
    if (reduce) paintStatic(); else { paint(); kick(); }
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible = e.isIntersecting;
        if (!visible) { cancelAnimationFrame(raf); running = false; return; }
        /* if the load-time measurement came back 0x0, the band certainly has a
           box by the time it scrolls into view — build it now */
        if (!offImg) { layout(); if (reduce && offImg) paintStatic(); }
        if (reduce) return;
        if (!window.matchMedia('(hover:hover)').matches) {
          /* touch has no hover to find this with, so open a channel for them */
          for (var k = 0; k <= 26; k++) {
            part(gw * (k / 26), gh * (0.42 + Math.sin(k * 0.45) * 0.08), 0.34);
          }
        }
        kick();
      });
    }, { threshold: 0.12 }).observe(band);
  } else {
    visible = true; kick();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      buildText();
      if (reduce) paintStatic();
    });
  }
})();
