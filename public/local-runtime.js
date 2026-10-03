/* Local delivery adapter. Loaded synchronously before captured Framer modules. */
(() => {
  'use strict';
  if (window.__HYDRA_LOCAL_RUNTIME__) return;
  window.__HYDRA_LOCAL_RUNTIME__ = true;

  const mapping = window.__HYDRA_ASSET_MAP__ || {};
  const exact = new Map();
  const byPath = new Map();
  const byName = new Map();
  const reverse = new Map();
  const ambiguousNames = new Set();
  const locationOrigin = window.location.origin;

  function parseURL(value) {
    try { return new URL(String(value).replaceAll('&amp;', '&'), locationOrigin); }
    catch { return null; }
  }

  function pathValue(value) {
    return typeof value === 'string' ? value : value?.url || value?.local_url || value?.local_path;
  }

  for (const [source, value] of Object.entries(mapping)) {
    const path = pathValue(value);
    if (!path) continue;
    const original = parseURL(source);
    const local = parseURL(path);
    if (!original || !local) continue;
    exact.set(original.href, local.href);
    const key = original.origin + original.pathname;
    if (!byPath.has(key) || !original.search) byPath.set(key, local.href);
    const name = original.pathname.split('/').pop();
    if (name) {
      if (byName.has(name) && byName.get(name) !== local.href) ambiguousNames.add(name);
      else byName.set(name, local.href);
    }
    if (!reverse.has(local.pathname)) reverse.set(local.pathname, original.href);
  }

  function sourceURL(value) {
    const parsed = parseURL(value);
    if (!parsed) return null;
    if (parsed.origin === locationOrigin && reverse.has(parsed.pathname)) {
      return parseURL(reverse.get(parsed.pathname));
    }
    return parsed;
  }

  function localAssetURL(value) {
    const original = parseURL(value);
    if (!original || !/^https?:$/.test(original.protocol)) return value;
    if (original.hostname === 'hydradb.com' || original.hostname === 'www.hydradb.com') {
      return locationOrigin + original.pathname + original.search + original.hash;
    }
    if (original.origin === locationOrigin) return original.href;
    let mapped = exact.get(original.href);
    const withoutRange = new URL(original);
    withoutRange.searchParams.delete('range');
    if (!mapped) mapped = exact.get(withoutRange.href);
    if (!mapped) mapped = byPath.get(original.origin + original.pathname);
    const name = original.pathname.split('/').pop();
    if (!mapped && !ambiguousNames.has(name)) mapped = byName.get(name);
    if (!mapped) return value;
    const result = new URL(mapped, locationOrigin);
    if (original.searchParams.has('range')) result.searchParams.set('range', original.searchParams.get('range'));
    result.hash = original.hash;
    return result.href;
  }

  function localizeString(value) {
    if (!value.includes('http')) return value;
    let result = value.replace(/https?:\/\/[^\s<>"'`\\)\]]+/g, url => localAssetURL(url));
    // Some richtext records contain a nested JSON string with escaped slashes.
    result = result.replace(/https?:\\\/\\\/[^\s<>"'`]+/g, escaped => {
      const url = escaped.replace(/\\\//g, '/');
      const mapped = localAssetURL(url);
      return mapped === url ? escaped : String(mapped).replaceAll('/', '\\/');
    });
    return result;
  }

  function localizeValue(value, seen = new WeakMap()) {
    if (typeof value === 'string') return localizeString(value);
    if (!value || typeof value !== 'object') return value;
    if (seen.has(value)) return seen.get(value);
    if (Array.isArray(value)) {
      const result = [];
      seen.set(value, result);
      value.forEach(item => result.push(localizeValue(item, seen)));
      return result;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return value;
    const result = Object.create(prototype);
    seen.set(value, result);
    for (const key of Object.keys(value)) result[key] = localizeValue(value[key], seen);
    return result;
  }

  window.__hydraLocalAssetURL = localAssetURL;
  window.__hydraLocalizeValue = localizeValue;

  function blockedURL(value) {
    const url = sourceURL(value);
    if (!url) return false;
    return /(^|\.)(googletagmanager\.com|google-analytics\.com|posthog\.com|intercom\.io|intercomcdn\.com|reo\.dev)$/.test(url.hostname)
      || url.hostname === 'events.framer.com'
      || (url.hostname === 'framer.com' && url.pathname.startsWith('/edit/'));
  }

  function isChat(value) {
    const url = sourceURL(value);
    return url?.hostname === 'soft-shadow-7711.donaldtton.workers.dev'
      || (url?.origin === locationOrigin && url.pathname === '/__mirror/preview/chat');
  }

  function isContact(value) {
    const url = sourceURL(value);
    return (url?.hostname === 'formspree.io' && url.pathname === '/f/maqzgaew')
      || (url?.origin === locationOrigin && url.pathname === '/__mirror/preview/contact');
  }

  function isNewsletter(value) {
    const url = sourceURL(value);
    return (url?.hostname === 'api.framer.com' && url.pathname.startsWith('/forms/'))
      || (url?.origin === locationOrigin && url.pathname === '/__mirror/preview/newsletter');
  }

  let newsletterForm;
  document.addEventListener('submit', event => {
    const form = event.target;
    if (form instanceof HTMLFormElement && form.querySelector('input[type="email"][name="Email"]')) {
      newsletterForm = form;
    }
  }, true);

  function newsletterStatus(message) {
    requestAnimationFrame(() => {
      const form = newsletterForm?.isConnected ? newsletterForm : null;
      if (!form) return;
      let status = form.parentElement.querySelector('[data-hydra-local-newsletter-status]');
      if (!status) {
        status = document.createElement('p');
        status.dataset.hydraLocalNewsletterStatus = 'true';
        status.setAttribute('role', 'status');
        status.style.cssText = 'margin:0;color:#b3b3b3;font:12px/1.5 "JetBrains Mono",monospace;max-width:548px';
        form.insertAdjacentElement('afterend', status);
      }
      status.textContent = message;
    });
  }

  function saveDraft(key, fields) {
    const previous = JSON.parse(localStorage.getItem(key) || '[]');
    const drafts = Array.isArray(previous) ? previous : [];
    drafts.push({ ...fields, savedAt: new Date().toISOString(), preview: true });
    localStorage.setItem(key, JSON.stringify(drafts.slice(-25)));
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function localFetch(input, init) {
    const url = input instanceof Request ? input.url : String(input);
    if (isChat(url)) {
      return new Response(JSON.stringify({
        reply: 'This is a local artificial hedge preview. Your message has not been sent. Explore fx-1 and its evaluations, or open the contact page to save a local draft.'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (isContact(url)) {
      try {
        const body = init?.body ?? (input instanceof Request ? await input.clone().text() : '{}');
        const fields = typeof body === 'string' ? JSON.parse(body) : {};
        saveDraft('hydra-local-contact-drafts', fields);
        return new Response(JSON.stringify({ ok: true, preview: true, savedLocally: true }), {
          status: 200, headers: { 'Content-Type': 'application/json' }
        });
      } catch {
        return new Response(JSON.stringify({ error: 'The local preview could not save this draft.' }), {
          status: 507, headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    if (isNewsletter(url)) {
      try {
        const body = init?.body ?? (input instanceof Request ? await input.clone().formData() : null);
        const fields = {};
        if (body instanceof FormData || body instanceof URLSearchParams) {
          for (const [name, value] of body.entries()) {
            if (typeof value === 'string' && value.trim()) fields[name] = value;
          }
        }
        saveDraft('hydra-local-newsletter-drafts', fields);
        newsletterStatus('saved locally in this browser. no newsletter subscription was sent.');
        return new Response(JSON.stringify({ ok: true, preview: true, savedLocally: true }), {
          status: 200, headers: { 'Content-Type': 'application/json' }
        });
      } catch {
        newsletterStatus('this local preview could not save the draft. no subscription was sent.');
        return new Response(JSON.stringify({ error: { message: 'The local preview could not save this draft.' } }), {
          status: 507, headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    if (blockedURL(url)) return new Response(null, { status: 204 });
    const mapped = localAssetURL(url);
    if (mapped === url) return nativeFetch(input, init);
    const request = input instanceof Request ? new Request(mapped, input) : mapped;
    return nativeFetch(request, init);
  };

  // Dynamic SDK scripts and records can produce URLs after HTML localization.
  // Rewrite their setters before the browser starts the resource request.
  function patchSourceSetter(prototype, property) {
    if (!prototype) return;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
    if (!descriptor?.set || !descriptor.configurable) return;
    Object.defineProperty(prototype, property, {
      ...descriptor,
      set(value) {
        if (this instanceof HTMLScriptElement && blockedURL(value)) return;
        const identity = sourceURL(value);
        if (this instanceof HTMLScriptElement && identity?.pathname.endsWith('/unicornStudio.umd.js')) {
          this.dataset.hydraUnicornSdk = 'true';
        }
        const rewritten = property === 'srcset' ? localizeString(String(value)) : localAssetURL(value);
        descriptor.set.call(this, rewritten);
      }
    });
  }

  patchSourceSetter(window.HTMLScriptElement?.prototype, 'src');
  patchSourceSetter(window.HTMLImageElement?.prototype, 'src');
  patchSourceSetter(window.HTMLImageElement?.prototype, 'srcset');
  patchSourceSetter(window.HTMLSourceElement?.prototype, 'src');
  patchSourceSetter(window.HTMLSourceElement?.prototype, 'srcset');
  patchSourceSetter(window.HTMLMediaElement?.prototype, 'src');
  patchSourceSetter(window.HTMLVideoElement?.prototype, 'poster');
  patchSourceSetter(window.HTMLLinkElement?.prototype, 'href');

  const nativeSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function localSetAttribute(name, value) {
    const attribute = String(name).toLowerCase();
    if (this instanceof HTMLScriptElement && attribute === 'src' && blockedURL(value)) return;
    if (['src', 'href', 'poster'].includes(attribute)) value = localAssetURL(value);
    else if (['srcset', 'style'].includes(attribute)) value = localizeString(String(value));
    return nativeSetAttribute.call(this, name, value);
  };

  if (typeof navigator.sendBeacon === 'function') {
    const nativeBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, data) => {
      if (blockedURL(url) || isChat(url) || isContact(url) || isNewsletter(url)) return false;
      return nativeBeacon(localAssetURL(url), data);
    };
  }
})();
