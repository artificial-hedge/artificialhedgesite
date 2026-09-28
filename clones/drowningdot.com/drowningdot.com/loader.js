/* ═══════════════════════════════════════════════════════════════════════════
   drowningdot · the loader

   Logo and dot, nothing else. The dot spins in from the right, unwinding to
   upright so it settles as the favicon and as the dot in "drowningdot", then
   flies to the nav icon's measured position and size. About one second.

   FAIL-SAFE FIRST. Three of the four reference sites' rejects were loaders that
   gated first paint; Locomotive's ran past 40s and never painted. So:
     · the overlay exists only when JS runs, so no-JS sees the page immediately
     · a hard timeout tears it down no matter what the animation is doing
     · click, tap or any key skips it
     · prefers-reduced-motion skips it entirely
     · it runs once per tab, so navigating back does not replay it
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var host = document.getElementById('loader');
  if (!host) return;

  var root = document.documentElement;
  var HARD_KILL = 2400;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var seen = false;
  try { seen = sessionStorage.getItem('dd.loaded') === '1'; } catch (e) {}

  function teardown() {
    if (host.dataset.done) return;
    host.dataset.done = '1';
    try { sessionStorage.setItem('dd.loaded', '1'); } catch (e) {}
    root.classList.remove('loading');
    host.classList.add('done');
    setTimeout(function () { if (host.parentNode) host.parentNode.removeChild(host); }, 460);
  }

  if (reduce || seen) { teardown(); return; }

  root.classList.add('loading');
  setTimeout(teardown, HARD_KILL);
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, teardown, { capture: true, once: true });
  });

  var cv = host.querySelector('canvas');
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, dpr = 1;

  var INK = '#0D0D0C', SHEET = '#EAE8E1', RED = '#C33F27';

  /* ── timeline, ms. the whole thing is about a second ───────────────────── */
  var SPIN = 620;                    /* the dot arrives and unwinds */
  var MARK_IN = 120, MARK_DUR = 380;
  var FLY_AT = SPIN + 130;
  var FLY_DUR = 330;
  var END = FLY_AT + FLY_DUR;        /* 1080 */
  var TURNS = 2.25;

  function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function inOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function c01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  var markCv = document.createElement('canvas');
  var markW = 0, markH = 0, r = 0, markX = 0, markY = 0, restX = 0, restY = 0;

  /* where the real nav icon sits. Measured, never hardcoded: the dot has to
     land on it exactly or the handoff shows a jump. */
  var navCx = 34, navCy = 30, navR = 7.5;
  function measureNav() {
    var el = document.querySelector('.nav .mark svg');
    if (!el) return;
    var b = el.getBoundingClientRect();
    if (!b.width) return;
    navCx = b.left + b.width / 2;
    navCy = b.top + b.height / 2;
    navR = b.width / 2;
  }

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = host.clientWidth; H = host.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    var size = Math.max(28, Math.min(76, W * 0.05));
    r = size * 0.36;

    var m = markCv.getContext('2d');
    var font = '500 ' + size + 'px \'Instrument Sans\', system-ui, sans-serif';
    m.font = font;
    markW = Math.ceil(m.measureText('drowningdot').width) + 4;
    markH = Math.ceil(size * 1.3);
    markCv.width = Math.round(markW * dpr);
    markCv.height = Math.round(markH * dpr);
    m = markCv.getContext('2d');
    m.setTransform(dpr, 0, 0, dpr, 0, 0);
    m.font = font;
    m.fillStyle = SHEET;
    m.textBaseline = 'middle';
    m.fillText('drowningdot', 2, markH / 2);

    /* centre the pair, so the dot reads as the dot in the word */
    var gap = r * 0.55;
    var total = markW + gap + r * 2;
    markX = Math.round((W - total) / 2);
    markY = Math.round(H / 2 - markH / 2);
    restX = markX + markW + gap + r;
    restY = Math.round(H / 2);
  }

  /* lower half redline, so the spin is legible and the rest state is the mark */
  function dot(x, y, rad, rot) {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = SHEET; ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.rect(-rad, 0, rad * 2, rad); ctx.clip();
    ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fillStyle = RED; ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  function draw(el) {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, W, H);

    var spin = c01(el / SPIN);
    var e = outCubic(spin);
    var fly = c01((el - FLY_AT) / FLY_DUR);
    var f = inOutCubic(fly);

    /* in from the right, so its path never crosses the type. The start is a
       short hop, not off-screen: covering a full viewport width in 620ms with an
       ease-out puts the dot 96% of the way there in the first two thirds, and
       the spin never reads. */
    var startX = restX + W * 0.26;
    var sx = startX + (restX - startX) * e;
    /* unwinds to exactly 0, so it comes to rest as the favicon */
    var rot = TURNS * Math.PI * 2 * (1 - e);

    var bx = sx + (navCx - sx) * f;
    var by = restY + (navCy - restY) * f;
    var br = r + (navR - r) * f;

    var markA = c01((el - MARK_IN) / MARK_DUR) * (1 - fly);
    if (markW && markA > 0) {
      ctx.globalAlpha = markA;
      ctx.drawImage(markCv, markX, markY, markW, markH);
      ctx.globalAlpha = 1;
    }

    dot(bx, by, br, fly > 0 ? 0 : rot);
  }

  layout();
  window.addEventListener('resize', function () {
    layout(); build(); measureNav();
  }, { passive: true });

  function start() {
    build();
    measureNav();
    var t0 = performance.now(), raf = 0;

    function frame(now) {
      if (host.dataset.done) { cancelAnimationFrame(raf); return; }
      var el = now - t0;
      draw(el);
      if (el >= END) { teardown(); return; }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  /* Waiting 500ms on fonts before starting put the on-screen time at ~1.6s with
     half a second of blank black first. Cap the wait at 130ms and rebuild the
     mark if the font lands later, so the metrics correct themselves instead of
     the animation being held hostage to them. */
  if (document.fonts && document.fonts.ready) {
    var went = false;
    var go = function () { if (!went) { went = true; start(); } };
    document.fonts.ready.then(function () {
      if (went) { build(); } else { go(); }
    });
    setTimeout(go, 130);
  } else {
    start();
  }
})();
