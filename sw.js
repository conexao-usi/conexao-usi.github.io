// Aumente a VERSAO sempre que publicar uma mudança, para os celulares atualizarem.
const VERSAO = 'conexao-v8';
const ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest',
  'resultado.html', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Só arquivos do próprio site passam pelo cache. O envio das respostas (POST
// para o Apps Script) vai direto para a rede.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(r => {
      const copia = r.clone();
      caches.open(VERSAO).then(c => c.put(req, copia));
      return r;
    }).catch(() => caches.match(req).then(r => r || caches.match('index.html')))
  );
});
