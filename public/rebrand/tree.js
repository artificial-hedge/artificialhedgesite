const SDK_PATH = '/assets/bbea608d6831d46b-unicornStudio-umd.js';
const SCENE_PATH = '/assets/01a808b47c4a76b7-oUvrbeOq0WuFIWyfR7ZD.mjs';
const instances = new WeakMap();
let sdkPromise;

function loadSDK() {
  if (window.UnicornStudio?.addScene && window.UnicornStudio.version === '2.1.11') {
    return Promise.resolve(window.UnicornStudio);
  }
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = [...document.scripts].find(script =>
      script.src && new URL(script.src, window.location.href).pathname === SDK_PATH,
    );
    const script = existing || document.createElement('script');
    let timeout;
    const finish = error => {
      window.clearTimeout(timeout);
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      if (error) {
        if (!existing) script.remove();
        reject(error);
      } else {
        resolve(window.UnicornStudio);
      }
    };
    const onLoad = () => {
      if (typeof window.UnicornStudio?.addScene !== 'function') {
        finish(new Error('the pixel tree sdk did not initialize'));
        return;
      }
      finish();
    };
    const onError = () => finish(new Error('the pixel tree sdk could not load'));
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    timeout = window.setTimeout(onError, 15000);
    if (!existing) {
      script.src = SDK_PATH;
      script.async = true;
      document.head.appendChild(script);
    }
  }).catch(error => {
    sdkPromise = undefined;
    throw error;
  });
  return sdkPromise;
}

function isVisible(element) {
  const box = element.getBoundingClientRect();
  return box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0
    && box.top < window.innerHeight && box.left < window.innerWidth;
}

async function createTree(element) {
  const sdk = await loadSDK();
  if (!element.isConnected) return null;
  sdk.scenes?.find(scene => scene.element === element)?.destroy();

  // These options match the original Framer embed. filePath also accepts JSON
  // fetched from a URL; this .mjs filename contains the original scene JSON.
  const scene = await sdk.addScene({
    element,
    filePath: SCENE_PATH,
    dpi: 1.5,
    scale: 1,
    fps: 60,
    lazyLoad: false,
    fixed: false,
    altText: 'orange pixel tree',
    ariaLabel: 'orange pixel tree',
  });
  if (!element.isConnected || !scene.curtain?.gl) {
    scene.destroy();
    throw new Error('the pixel tree renderer is unavailable');
  }

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videoRecords = new Map();
  const observedPlanes = new WeakSet();
  let visible = isVisible(element);
  let suspended = false;
  let destroyed = false;
  let frame = 0;
  let readinessTimer = 0;
  const readyDeadline = performance.now() + 20000;

  const shouldPause = () => destroyed || suspended || document.hidden || !visible || motion.matches;

  function updatePlayback() {
    // v2.1.11's render loop reads this scene property; it has no pause() API.
    scene.paused = shouldPause();
    for (const video of videoRecords.keys()) {
      if (scene.paused) {
        video.pause();
      } else if (video.paused) {
        video.play()?.catch(() => {});
      }
    }
  }

  function renderStill() {
    if (frame || destroyed || suspended || document.hidden || !visible) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      if (destroyed || suspended || document.hidden || !visible || !scene.initialized) return;
      discoverVideos();
      updatePlayback();
      // Keep the actual shader-rendered frame for reduced motion. The original
      // media thumbnail does not include the pixel/glyph effects.
      scene.renderFrame();
    });
  }

  function discoverVideos() {
    const videos = new Set(Object.values(scene.local?.preloadedVideos || {}));
    for (const plane of scene.getPlanes() || []) {
      for (const video of plane.videos || []) videos.add(video);
    }
    let changed = false;
    for (const video of videos) {
      if (videoRecords.has(video)) continue;
      const ownPlay = Object.getOwnPropertyDescriptor(video, 'play');
      const originalPlay = video.play;
      // The SDK resumes videos on document visibility changes. Guard this
      // scene's videos so reduced motion and offscreen pauses remain in force.
      const guardedPlay = function () {
        if (shouldPause()) {
          video.pause();
          return Promise.resolve();
        }
        return originalPlay.call(video);
      };
      const onMediaReady = () => {
        updatePlayback();
        if (motion.matches) renderStill();
      };
      video.play = guardedPlay;
      video.addEventListener('loadeddata', onMediaReady);
      video.addEventListener('seeked', onMediaReady);
      videoRecords.set(video, { ownPlay, guardedPlay, onMediaReady });
      changed = true;
    }
    return changed;
  }

  function observePlanes() {
    for (const plane of scene.getPlanes() || []) {
      if (observedPlanes.has(plane)) continue;
      observedPlanes.add(plane);
      // onAfterRender() is part of this downloaded SDK's plane API. It catches
      // videos attached asynchronously after their first decoded frame.
      plane.onAfterRender(() => {
        if (destroyed) return;
        const changed = discoverVideos();
        if (changed) {
          updatePlayback();
          if (motion.matches) renderStill();
        }
      });
    }
    discoverVideos();
    updatePlayback();
    if (scene.initialized) {
      element.dataset.treeState = 'ready';
      renderStill();
    } else if (!destroyed && performance.now() < readyDeadline) {
      readinessTimer = window.setTimeout(observePlanes, 100);
    }
  }

  function updateVisibility() {
    visible = isVisible(element);
    updatePlayback();
    if (motion.matches) renderStill();
  }

  function updateMotion() {
    scene.setInteractiveParams({ interactivity: { mouse: { disabled: motion.matches } } });
    updatePlayback();
    renderStill();
  }

  const intersection = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
      updatePlayback();
      if (motion.matches) renderStill();
    })
    : null;
  intersection?.observe(element);
  const resize = typeof ResizeObserver === 'function'
    ? new ResizeObserver(() => {
      if (destroyed) return;
      scene.resize();
      updateVisibility();
      renderStill();
    })
    : null;
  resize?.observe(element);

  const onVisibility = () => {
    updatePlayback();
    if (motion.matches) renderStill();
  };
  const onPageHide = () => { suspended = true; updatePlayback(); };
  const onPageShow = () => { suspended = false; updateVisibility(); renderStill(); };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('resize', updateVisibility, { passive: true });
  if (!intersection) window.addEventListener('scroll', updateVisibility, { passive: true });
  if (motion.addEventListener) motion.addEventListener('change', updateMotion);
  else motion.addListener(updateMotion);
  updateMotion();
  observePlanes();

  return {
    scene,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(readinessTimer);
      intersection?.disconnect();
      resize?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('resize', updateVisibility);
      window.removeEventListener('scroll', updateVisibility);
      if (motion.removeEventListener) motion.removeEventListener('change', updateMotion);
      else motion.removeListener(updateMotion);
      for (const [video, record] of videoRecords) {
        video.pause();
        video.removeEventListener('loadeddata', record.onMediaReady);
        video.removeEventListener('seeked', record.onMediaReady);
        if (video.play === record.guardedPlay) {
          if (record.ownPlay) Object.defineProperty(video, 'play', record.ownPlay);
          else delete video.play;
        }
      }
      videoRecords.clear();
      scene.destroy();
      instances.delete(element);
      delete element.dataset.treeState;
    },
  };
}

/**
 * Initialize the original scene in #ah-tree after /local-runtime.js and the
 * global asset map have loaded. Returns a promise for { scene, destroy } or null.
 * The caller controls the container's dimensions.
 */
export function initTree() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(null);
  }
  const element = document.getElementById('ah-tree');
  if (!element) return Promise.resolve(null);
  if (instances.has(element)) return instances.get(element);
  element.dataset.treeState = 'loading';
  const instance = createTree(element).catch(error => {
    element.dataset.treeState = 'unavailable';
    instances.delete(element);
    console.error('could not initialize the pixel tree', error);
    return null;
  });
  instances.set(element, instance);
  return instance;
}

export default initTree;
