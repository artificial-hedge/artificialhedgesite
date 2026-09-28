/* ═══════════════════════════════════════════════════════════════════════════
   drowningdot · the landing

   Derived from Issey Miyake's pleating: a flat plane holds a folding logic that
   only releases into dimension once something moves through it. The wordmark is
   drawn complete underneath, then a pleated red sheet is laid over it. Each
   lifted pleat SLIDES aside rather than fading, so it reads as cloth pulled
   back. The name is never assembled — it was always there, and you are only
   moving what covers it.

   Survived the Step 5 critique with four revisions:
     · touch  — scroll alone reached 0% reveal, so the spark was hover-only on a
                phone. Without a pointer, scroll now drives a travelling reveal
                band across the folds, so scrolling itself wipes the sheet.
     · mobile — statement and name stacked instead of sharing a centre.
     · remove — a meaningless hem hairline at 50% height.
     · cheap  — pleat widths vary and each fold carries a gradient, because
                uniform flat bands read as a CSS demo rather than cloth.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var band = document.querySelector('.pleat');
  if (!band) return;
  var cv = band.querySelector('canvas');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');

  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine = matchMedia('(hover:hover)').matches;

  var N = 34;
  var W = 0, H = 0, dpr = 1, narrow = false;
  var mark = document.createElement('canvas'), MW = 0, MH = 0;
  var bx = [], bw = [], lift = null;
  var open = 0, scroll = 0, phase = 0, cursorX = -1;
  var visible = false, running = false, raf = 0;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    /* commit the measurement only once it is known good. A 0x0 report (embedded
       browsers, mid-rotation) used to set W=0 while bx/bw kept the old widths,
       and the next loop() divided by that zero into a non-finite gradient. */
    var w = band.clientWidth, h = band.clientHeight;
    if (!w || !h) return;
    W = w; H = h;
    narrow = W <= 820;
    /* What reads as cloth is the width of a pleat, not the number of them. A
       fixed 34 folds is a 42px pleat at 1440 and an 11px pinstripe at 375 —
       the same code drawing corduroy on a phone. So hold the pleat near 42px
       and let the count fall out of the viewport: 34 across a desktop, nine
       across a phone, which is the fold the fabric actually has. Clamped at
       the top so an ultrawide does not pay for eighty gradients a frame. */
    N = Math.max(8, Math.min(40, Math.round(W / 42)));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lift = new Float32Array(N);

    /* irregular pleat widths: uniform bands read as a gradient, not fabric */
    bx = []; bw = [];
    var raw = [], sum = 0, i;
    for (i = 0; i < N; i++) {
      var v = 0.68 + 0.62 * Math.abs(Math.sin(i * 1.73 + 0.4));
      raw.push(v); sum += v;
    }
    var x = 0;
    for (i = 0; i < N; i++) {
      var w = raw[i] / sum * W;
      bx.push(x); bw.push(w); x += w;
    }

    /* desktop was W*0.15 (216px at 1440), which measured 1318px wide and left
       no room once the statement went to 11vw. The name is meant to be found
       under the cloth, not to headline — so it shrinks and drops below the
       statement's band rather than sharing its centre line. */
    var size = narrow ? Math.min(W * 0.215, H * 0.15) : Math.min(W * 0.085, H * 0.22);
    var m = mark.getContext('2d');
    m.font = '600 ' + size + 'px \'Instrument Sans\', system-ui, sans-serif';
    MW = Math.ceil(m.measureText('drowningdot').width) + 8;
    MH = Math.ceil(size * 1.24);
    mark.width = Math.round(MW * dpr); mark.height = Math.round(MH * dpr);
    m = mark.getContext('2d');
    m.setTransform(dpr, 0, 0, dpr, 0, 0);
    m.font = '600 ' + size + 'px \'Instrument Sans\', system-ui, sans-serif';
    m.fillStyle = '#EAE8E1';
    m.textBaseline = 'middle';
    m.fillText('drowningdot', 4, MH / 2);
  }

  function draw() {
    ctx.fillStyle = '#0D0D0C';
    ctx.fillRect(0, 0, W, H);
    if (!MW) return;

    var spread = 0.40 + 0.60 * open;
    var sw = MW / N, dw = sw * spread, totalW = dw * N;
    /* narrow: centred and low, clear of the statement above it */
    var x0 = narrow ? (W - totalW) / 2 : W * 0.985 - totalW;
    var y0 = narrow ? H * 0.60 - MH / 2 : H * 0.82 - MH / 2;
    var i;

    for (i = 0; i < N; i++) {
      var dx = x0 + i * dw;
      ctx.save();
      ctx.beginPath(); ctx.rect(dx, 0, Math.ceil(dw) + 1, H); ctx.clip();
      ctx.drawImage(mark, Math.round(i * sw * dpr), 0,
                    Math.round(sw * dpr), mark.height, dx, y0, dw + 1, MH);
      ctx.restore();
    }

    for (i = 0; i < N; i++) {
      var facing = 0.5 + 0.5 * Math.sin(i * 0.8 + phase);
      var l = lift[i];
      var a = 0.97 - 0.92 * l;
      if (a <= 0.012) continue;
      var slide = l * bw[i] * 0.62;
      var px = bx[i] + slide, pwid = bw[i] - slide + 1;
      if (pwid <= 0) continue;
      /* each fold is rounded by its own gradient rather than flat filled */
      var s1 = 0.50 + 0.58 * facing, s2 = s1 * 1.16, s3 = s1 * 0.86;
      var g = ctx.createLinearGradient(px, 0, px + pwid, 0);
      g.addColorStop(0, 'rgba(' + (196 * s1 | 0) + ',' + (62 * s1 | 0) + ',' + (38 * s1 | 0) + ',' + a.toFixed(3) + ')');
      g.addColorStop(0.62, 'rgba(' + (196 * s2 | 0) + ',' + (62 * s2 | 0) + ',' + (38 * s2 | 0) + ',' + a.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + (196 * s3 | 0) + ',' + (62 * s3 | 0) + ',' + (38 * s3 | 0) + ',' + a.toFixed(3) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(px, 0, pwid, H);
      ctx.fillStyle = 'rgba(13,13,12,' + (0.26 * (1 - l)).toFixed(3) + ')';
      ctx.fillRect(px, 0, 1, H);
    }
  }

  function loop() {
    if (!visible) { running = false; return; }
    if (!lift) { running = false; return; } /* no successful build yet */
    open += (scroll - open) * 0.07;
    phase += 0.005 + 0.010 * open;

    /* without a pointer, scroll drives a travelling reveal band, so scrolling
       itself wipes the sheet. With a pointer it tracks the cursor. */
    var sweepX = fine ? cursorX : (scroll * 1.25 - 0.12);
    var base = fine ? scroll * 0.34 : 0;

    for (var i = 0; i < N; i++) {
      var c = (bx[i] + bw[i] / 2) / W;
      var want = base;
      if (sweepX >= 0) {
        var d = Math.abs(c - sweepX);
        want = Math.min(1, want + Math.max(0, 0.98 - d * (fine ? 4.6 : 3.1)));
      }
      lift[i] += (want - lift[i]) * (want > lift[i] ? 0.16 : 0.045);
    }
    draw();
    raf = requestAnimationFrame(loop);
  }
  function kick() {
    if (!running && visible) { running = true; raf = requestAnimationFrame(loop); }
  }

  function onScroll() {
    var b = band.getBoundingClientRect();
    if (!b.height) return;              /* a 0-height box would make this NaN */
    scroll = Math.max(0, Math.min(1, (-b.top) / (b.height * 0.72)));
    kick();
  }

  band.addEventListener('pointermove', function (e) {
    if (reduce || !fine) return;
    var b = band.getBoundingClientRect();
    cursorX = (e.clientX - b.left) / b.width;
    kick();
  }, { passive: true });
  band.addEventListener('pointerleave', function () { cursorX = -1; });

  build();

  /* static equivalent that preserves the idea: the cloth is part-lifted and the
     name is legible underneath. It has to be re-applied after any build(),
     because build() reallocates lift to zeros — which silently wiped this and
     left the reduced-motion landing fully covered. */
  function setStatic() {
    if (!lift) return;
    open = 0.8; phase = 0.5;
    for (var q = 0; q < N; q++) lift[q] = 0.66;
    draw();
  }

  if (reduce) {
    setStatic();
  } else {
    draw();
    window.addEventListener('scroll', onScroll, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          visible = e.isIntersecting;
          if (!visible) { cancelAnimationFrame(raf); running = false; }
          else {
            /* a 0x0 load-time measurement has a real box by now */
            if (!lift) { build(); draw(); }
            kick();
          }
        });
      }, { threshold: 0 }).observe(band);
    } else { visible = true; }
    onScroll();
  }

  window.addEventListener('resize', function () {
    build();
    if (reduce) { setStatic(); } else { draw(); kick(); }
  }, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      build();
      if (reduce) { setStatic(); } else { draw(); kick(); }
    });
  }
})();
