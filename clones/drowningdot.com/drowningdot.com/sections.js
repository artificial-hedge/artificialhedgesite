/* drowningdot · section behaviour for /process/ and /contact/. Copies of the
   two IIFEs at the foot of index.html; see the note atop sections.css. */
/* ── process: which stacked panel is on top ────────────────────────────────
   Occlusion carries the hierarchy now, so this only marks the panel currently
   pinned so it can take the redline edge and the red numeral. Register stays
   positional, and being scroll-driven it needs no hover.                   */
(function(){
  var steps = [].slice.call(document.querySelectorAll('.step'));
  if (!steps.length) return;
  var PIN = 61;                        /* the sticky line, nav height + 1 */
  var active = -1, queued = false;

  function paint(){
    queued = false;
    var next = 0;
    for (var i = 0; i < steps.length; i++){
      if (steps[i].getBoundingClientRect().top <= PIN) next = i;
    }
    if (next !== active){
      if (active >= 0) steps[active].classList.remove('is-on');
      steps[next].classList.add('is-on');
      active = next;
    }
  }
  function onScroll(){
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  paint();
  /* rAF is frozen in a background tab, so guarantee a correct first state */
  setTimeout(paint, 900);
})();


/* ── contact ───────────────────────────────────────────────────────────────
   The CTA is a mailto in the markup and stays one until this runs. Everything
   below is the enhancement: intercept the press, open the form, post it as
   JSON to /api/contact. If the script never arrives the link still opens a
   mail client, which is why the href is real rather than a "#".

   The arrow relabels itself on init for the same reason. "Email →" is the
   truth about a mailto and a lie about a form, so the markup ships the first
   and this swaps in the second only once the form actually exists. */
(function(){
  var cta  = document.getElementById('cta-start');
  var wrap = document.getElementById('cform-wrap');
  var form = document.getElementById('cform');
  if (!cta || !wrap || !form) return;

  var status = document.getElementById('cf-status');
  var send   = form.querySelector('.cf-send');
  var open   = false, busy = false;

  [].slice.call(cta.querySelectorAll('.cta-arrow')).forEach(function(a){
    a.textContent = 'Write →';
  });

  function say(msg, state){
    status.textContent = msg || '';
    if (state) status.setAttribute('data-state', state);
    else status.removeAttribute('data-state');
  }

  function mark(fields){
    [].slice.call(form.querySelectorAll('.cf-row')).forEach(function(r){
      r.classList.remove('is-bad');
    });
    (fields || []).forEach(function(n){
      var el = form.elements[n];
      if (el && el.closest('.cf-row')) el.closest('.cf-row').classList.add('is-bad');
    });
  }

  function show(){
    if (open) return;
    open = true;
    wrap.classList.add('is-open');
    cta.setAttribute('aria-expanded', 'true');
    /* after the rows have height, or focus scrolls to a box of zero height and
       the page jumps to somewhere that is not the form */
    setTimeout(function(){ form.elements.name.focus({preventScroll:true}); }, 240);
  }

  cta.addEventListener('click', function(e){
    /* a modified click is someone deliberately asking their mail client for it,
       and cmd-click on a mailto is a real thing people do. Let it through. */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    show();
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (busy) return;

    var data = {
      name:    form.elements.name.value,
      email:   form.elements.email.value,
      message: form.elements.message.value,
      company: form.elements.company.value    /* honeypot, sent as found */
    };

    /* the same three checks the endpoint runs, so the common mistake costs a
       glance rather than a round trip. The server still runs them — this is
       courtesy, not validation. */
    var bad = [];
    if (!data.name.trim()) bad.push('name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) bad.push('email');
    if (!data.message.trim()) bad.push('message');
    if (bad.length){
      mark(bad);
      say(bad.length > 1 ? 'A few fields need filling in.' : 'That one field needs another look.', 'bad');
      var first = form.elements[bad[0]];
      if (first) first.focus();
      return;
    }

    mark([]);
    busy = true;
    send.disabled = true;
    say('Sending…');

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r){
      return r.json().catch(function(){ return {}; }).then(function(b){
        return { ok: r.ok, body: b };
      });
    }).then(function(res){
      if (res.ok){
        /* the form is replaced rather than cleared. A blank form under a
           "sent" line reads as an invitation to send it again. */
        form.innerHTML = '<div class="cf-foot"><p class="cf-status" data-state="ok">' +
          'Sent. I answer everything, usually within a day.</p></div>';
        return;
      }
      mark(res.body.fields);
      say(res.body.error || 'Could not send just now. Try again in a moment.', 'bad');
      busy = false;
      send.disabled = false;
    }).catch(function(){
      /* offline, DNS, a blocked request — nothing the reader can act on except
         trying again, so do not dress it up as their mistake */
      say('That did not reach me. Check your connection and try again.', 'bad');
      busy = false;
      send.disabled = false;
    });
  });
})();

