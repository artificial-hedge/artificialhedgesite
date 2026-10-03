import { createReadStream } from 'node:fs';
import { copyFile, mkdir, readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.apng': 'image/apng',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
  '.wasm': 'application/wasm', '.pdf': 'application/pdf',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
  '.frag': 'text/plain; charset=utf-8', '.vert': 'text/plain; charset=utf-8',
  '.glsl': 'text/plain; charset=utf-8', '.framercms': 'application/octet-stream',
};

function inside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function safeFile(root, relative) {
  if (typeof relative !== 'string' || relative.includes('\0')) return null;
  const base = path.resolve(root);
  const candidate = path.resolve(base, relative);
  if (!inside(base, candidate)) return null;
  try {
    // Checking real paths also prevents a symlink beneath the mirror escaping it.
    const [realBase, realFile] = await Promise.all([realpath(base), realpath(candidate)]);
    if (!inside(realBase, realFile)) return null;
    const info = await stat(realFile);
    return info.isFile() ? { filename: realFile, info } : null;
  } catch (error) {
    if (['ENOENT', 'ENOTDIR', 'EACCES', 'ELOOP'].includes(error.code)) return null;
    throw error;
  }
}

function integer(value) {
  if (!/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

function explicitRanges(input, size) {
  if (typeof input !== 'string' || !input.trim()) return null;
  const parts = input.split(',');
  if (parts.length > 128) return null;
  const ranges = [];
  for (const part of parts) {
    const match = /^\s*(\d+)-(\d+)\s*$/.exec(part);
    if (!match) return null;
    const start = integer(match[1]);
    const end = integer(match[2]);
    if (start === null || end === null || start > end || start >= size) return null;
    ranges.push({ start, end: Math.min(end, size - 1) });
  }
  return ranges;
}

function httpRanges(header, size) {
  if (typeof header !== 'string' || !/^bytes=/i.test(header)) return undefined;
  const parts = header.slice(header.indexOf('=') + 1).split(',');
  if (!parts.length || parts.length > 16) return null;
  const ranges = [];
  for (const part of parts) {
    const match = /^\s*(\d*)-(\d*)\s*$/.exec(part);
    if (!match || (!match[1] && !match[2])) return null;
    let start;
    let end;
    if (!match[1]) {
      const suffix = integer(match[2]);
      if (suffix === null || suffix === 0 || size === 0) continue;
      start = Math.max(0, size - suffix);
      end = size - 1;
    } else {
      start = integer(match[1]);
      end = match[2] ? integer(match[2]) : size - 1;
      if (start === null || end === null || start > end) return null;
      if (start >= size) continue;
      end = Math.min(end, size - 1);
    }
    ranges.push({ start, end });
  }
  return ranges.length ? ranges : null;
}

function textResponse(req, res, status, text) {
  const bytes = Buffer.from(text);
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': bytes.length,
    'Cache-Control': 'no-store',
  });
  res.end(req.method === 'HEAD' ? undefined : bytes);
}

function pipeFile(req, res, file, range) {
  if (req.method === 'HEAD') { res.end(); return; }
  const stream = createReadStream(file.filename, range);
  stream.on('error', error => res.destroy(error));
  res.on('close', () => stream.destroy());
  stream.pipe(res);
}

async function assetResponse(req, res, file, url) {
  const mime = TYPES[path.extname(file.filename).toLowerCase()] || 'application/octet-stream';
  const size = file.info.size;
  const common = { 'Content-Type': mime, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };

  // Framer CMS ranges use an inclusive query protocol, distinct from HTTP 206.
  // Binary files stay untouched: only the requested byte slices are concatenated.
  if (path.extname(file.filename).toLowerCase() === '.framercms' && url.searchParams.has('range')) {
    const ranges = explicitRanges(url.searchParams.get('range'), size);
    if (!ranges) {
      res.setHeader('Content-Range', `bytes */${size}`);
      textResponse(req, res, 416, 'invalid CMS byte range');
      return;
    }
    const length = ranges.reduce((total, range) => total + range.end - range.start + 1, 0);
    res.writeHead(200, { ...common, 'Content-Length': length });
    if (req.method === 'HEAD') { res.end(); return; }
    const data = await readFile(file.filename);
    res.end(Buffer.concat(ranges.map(range => data.subarray(range.start, range.end + 1)), length));
    return;
  }

  const ranges = httpRanges(req.headers.range, size);
  if (ranges === null) {
    res.setHeader('Content-Range', `bytes */${size}`);
    textResponse(req, res, 416, 'requested byte range is not satisfiable');
    return;
  }
  if (ranges?.length === 1) {
    const range = ranges[0];
    res.writeHead(206, {
      ...common, 'Content-Length': range.end - range.start + 1,
      'Content-Range': `bytes ${range.start}-${range.end}/${size}`,
    });
    pipeFile(req, res, file, range);
    return;
  }
  if (ranges?.length > 1) {
    const boundary = `hydra-${randomBytes(12).toString('hex')}`;
    const pieces = ranges.map(range => ({
      range,
      header: Buffer.from(`--${boundary}\r\nContent-Type: ${mime}\r\nContent-Range: bytes ${range.start}-${range.end}/${size}\r\n\r\n`),
    }));
    const ending = Buffer.from(`--${boundary}--\r\n`);
    const length = ending.length + pieces.reduce((total, piece) => total + piece.header.length + piece.range.end - piece.range.start + 1 + 2, 0);
    res.writeHead(206, { ...common, 'Content-Type': `multipart/byteranges; boundary=${boundary}`, 'Content-Length': length });
    if (req.method === 'HEAD') { res.end(); return; }
    for (const piece of pieces) {
      if (res.destroyed) return;
      res.write(piece.header);
      const stream = createReadStream(file.filename, piece.range);
      const onClose = () => stream.destroy();
      res.once('close', onClose);
      try {
        for await (const chunk of stream) {
          if (res.destroyed) return;
          if (!res.write(chunk)) {
            await new Promise(resolve => {
              const finish = () => { res.off('drain', finish); res.off('close', finish); resolve(); };
              res.once('drain', finish); res.once('close', finish);
            });
          }
        }
      } finally { res.off('close', onClose); stream.destroy(); }
      res.write('\r\n');
    }
    res.end(ending);
    return;
  }
  res.writeHead(200, { ...common, 'Content-Length': size });
  pipeFile(req, res, file);
}

function routeReader(siteRoot) {
  let cache;
  let signature;
  return async () => {
    const filename = path.join(siteRoot, 'route-map.json');
    try {
      const info = await stat(filename);
      const current = `${info.mtimeMs}:${info.size}`;
      if (cache && signature === current) return cache;
      const data = JSON.parse(await readFile(filename, 'utf8'));
      cache = { routes: data.routes || {}, redirects: data.redirects || {} };
      signature = current;
      return cache;
    } catch (error) {
      if (error.code === 'ENOENT') return { routes: {}, redirects: {} };
      throw error;
    }
  };
}

function queryKey(search, isCms = false) {
  const parameters = new URLSearchParams(search);
  if (isCms) parameters.delete('range');
  parameters.sort();
  return parameters.toString();
}

function assetReader(staticRoot) {
  let cache;
  let signature;
  return async () => {
    const filename = path.join(staticRoot, 'asset-map.json');
    try {
      const info = await stat(filename);
      const current = `${info.mtimeMs}:${info.size}`;
      if (cache && signature === current) return cache;
      const mapping = JSON.parse(await readFile(filename, 'utf8'));
      const byOriginalName = new Map();
      const byGeneratedName = new Map();
      function add(index, name, entry) {
        if (!index.has(name)) index.set(name, []);
        index.get(name).push(entry);
      }
      for (const [source, destination] of Object.entries(mapping)) {
        if (typeof destination !== 'string' || !destination.startsWith('/assets/')) continue;
        let original;
        try { original = new URL(source); } catch { continue; }
        let name;
        try { name = path.posix.basename(decodeURIComponent(original.pathname)); } catch { continue; }
        const entry = { destination, query: queryKey(original.search, name.endsWith('.framercms')) };
        add(byOriginalName, name, entry);
        add(byGeneratedName, path.posix.basename(destination).replace(/^[a-f0-9]{16}-/, ''), entry);
      }
      cache = { byOriginalName, byGeneratedName };
      signature = current;
      return cache;
    } catch (error) {
      if (error.code === 'ENOENT') return { byOriginalName: new Map(), byGeneratedName: new Map() };
      throw error;
    }
  };
}

async function locateAsset(staticRoot, relative, url, readAssets) {
  const assetsRoot = path.join(staticRoot, 'assets');
  if (!inside(path.resolve(assetsRoot), path.resolve(assetsRoot, relative))) return null;
  const exact = await safeFile(assetsRoot, relative);
  if (exact) return exact;
  const name = path.posix.basename(relative);
  const { byOriginalName, byGeneratedName } = await readAssets();
  const candidates = byOriginalName.get(name) || byGeneratedName.get(name) || [];
  const query = queryKey(url.search, name.endsWith('.framercms'));
  const exactQuery = candidates.filter(entry => entry.query === query);
  const baseQuery = candidates.filter(entry => entry.query === '');
  const selected = exactQuery.length ? exactQuery : baseQuery.length ? baseQuery : candidates;
  const destinations = [...new Set(selected.map(entry => entry.destination))];
  // A basename with different responsive variants or unrelated origins is
  // deliberately unresolved unless a query or base URL identifies one file.
  if (destinations.length !== 1) return null;
  return safeFile(assetsRoot, destinations[0].slice('/assets/'.length));
}

function createMiddleware(siteRoot, staticRoot) {
  const readRoutes = routeReader(siteRoot);
  const readAssets = assetReader(staticRoot);
  return (req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method)) { next(); return; }
    (async () => {
      let url;
      let pathname;
      try {
        url = new URL(req.url, 'http://hydra.local');
        pathname = decodeURIComponent(url.pathname);
      } catch { textResponse(req, res, 400, 'invalid request path'); return; }
      if (pathname.includes('\0') || pathname.includes('\\')) { textResponse(req, res, 400, 'invalid request path'); return; }
      if (pathname.startsWith('/assets/')) {
        const file = await locateAsset(staticRoot, pathname.slice('/assets/'.length), url, readAssets);
        if (!file) { textResponse(req, res, 404, 'asset not found'); return; }
        await assetResponse(req, res, file, url);
        return;
      }
      if (pathname.startsWith('/rebrand/')) {
        const file = await safeFile(staticRoot, pathname.slice(1));
        if (!file) { textResponse(req, res, 404, 'site resource not found'); return; }
        await assetResponse(req, res, file, url);
        return;
      }
      if (pathname === '/local-runtime.js' || pathname === '/asset-map.json') {
        const file = await safeFile(staticRoot, pathname.slice(1));
        if (!file) { textResponse(req, res, 404, 'runtime not found'); return; }
        await assetResponse(req, res, file, url);
        return;
      }
      // Preserve Vite's dev endpoints and bootstrap modules outside the mirror.
      if (/^\/(?:@|__vite|node_modules\/|src\/)/.test(pathname)) { next(); return; }
      const { routes, redirects } = await readRoutes();
      const route = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
      const target = redirects[pathname] || redirects[route];
      if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') && target !== pathname) {
        res.writeHead(308, { Location: `${target}${url.search}`, 'Cache-Control': 'no-cache' });
        res.end();
        return;
      }
      const mapped = routes[pathname] || routes[route] || routes[`${route}/`];
      const file = typeof mapped === 'string' ? await safeFile(siteRoot, mapped) : null;
      if (file) {
        res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Content-Length': file.info.size, 'Cache-Control': 'no-store' });
        pipeFile(req, res, file);
        return;
      }
      const missing = await safeFile(siteRoot, '404.html') || (typeof routes['/404'] === 'string' ? await safeFile(siteRoot, routes['/404']) : null);
      if (missing) {
        res.writeHead(404, { 'Content-Type': TYPES['.html'], 'Content-Length': missing.info.size, 'Cache-Control': 'no-store' });
        pipeFile(req, res, missing);
        return;
      }
      textResponse(req, res, 404, 'page not found');
    })().catch(error => {
      if (res.headersSent) res.destroy(error);
      else next(error);
    });
  };
}

async function copyMirrorHtml(sourceRoot, outputRoot, relative = '') {
  const entries = await readdir(path.join(sourceRoot, relative), { withFileTypes: true });
  for (const entry of entries) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) { await copyMirrorHtml(sourceRoot, outputRoot, child); continue; }
    if (!entry.isFile() || (!entry.name.toLowerCase().endsWith('.html') && child !== 'route-map.json')) continue;
    const destination = path.join(outputRoot, child);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(path.join(sourceRoot, child), destination);
  }
}

/** Serve the immutable SSR mirror ahead of Vite's HTML and module transforms. */
export function hydraServerPlugin() {
  let configuration;
  return {
    name: 'hydra-local-mirror',
    configResolved(config) { configuration = config; },
    configureServer(server) {
      const root = configuration.root;
      server.middlewares.use(createMiddleware(path.join(root, 'src/site'), path.join(root, 'public')));
    },
    configurePreviewServer(server) {
      const output = path.resolve(configuration.root, configuration.build.outDir);
      server.middlewares.use(createMiddleware(output, output));
    },
    async closeBundle() {
      if (configuration?.command !== 'build') return;
      const source = path.join(configuration.root, 'src/site');
      const output = path.resolve(configuration.root, configuration.build.outDir);
      await mkdir(output, { recursive: true });
      await copyMirrorHtml(source, output);
    },
  };
}

export default hydraServerPlugin;
