const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'arhica_admin_token';

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } };

/** Turn a stored path (/media/x.jpg or /images/x.jpg) or bare file name into a usable URL. */
export function assetUrl(p) {
  if (!p) return '';
  if (/^https?:|^data:/.test(p)) return p;
  if (p.startsWith('/media')) return BASE + p;
  if (p.startsWith('/')) return encodeURI(p);
  return '/images/' + encodeURI(p);
}

async function request(path, { method = 'GET', body, form, auth } = {}) {
  const headers = {};
  const token = getToken();
  if (token && (auth ?? true)) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : form });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** XHR upload so we can show progress for big videos. */
export function uploadFiles(files, { album, caption, in_gallery = 1 } = {}, onProgress) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    [...files].forEach((f) => fd.append('files', f));
    if (album) fd.append('album', album);
    if (caption) fd.append('caption', caption);
    fd.append('in_gallery', String(in_gallery));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE + '/api/media');
    xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let d = {}; try { d = JSON.parse(xhr.responseText); } catch { /* */ }
      xhr.status < 300 ? resolve(d) : reject(new Error(d.error || d.errors?.[0]?.error || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(fd);
  });
}

export const api = {
  get: (p, opts) => request(p, opts),
  post: (p, body, opts) => request(p, { method: 'POST', body, ...opts }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
};

export function youtubeId(url = '') {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function fmtDate(d, opts = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString('en-GB', opts);
}

export function readTime(text = '') {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}
