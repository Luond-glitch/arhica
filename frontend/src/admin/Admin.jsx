import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, assetUrl, fmtDate, getToken, setToken, uploadFiles } from '../lib/api';
import { useDocTitle } from '../lib/hooks';
import { Img } from '../components/ui';

/* ───────── helpers ───────── */
function useToast() {
  const [t, setT] = useState(null);
  const show = useCallback((msg, ok = true) => { setT({ msg, ok }); setTimeout(() => setT(null), 3500); }, []);
  const node = t && <div className={`toast ${t.ok ? 'ok' : 'err'}`} role="status">{t.msg}</div>;
  return [show, node];
}

const fmtSize = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);

/** Drop-zone / button that uploads to the media library and reports back. */
function Uploader({ onDone, accept, multiple = true, album, label = 'Drop files here or click to browse', gallery = 1, compact }) {
  const input = useRef(null);
  const [prog, setProg] = useState(null);
  const [err, setErr] = useState('');
  const [drag, setDrag] = useState(false);

  const go = async (files) => {
    if (!files?.length) return;
    setErr(''); setProg(0);
    try {
      const res = await uploadFiles(files, { album, in_gallery: gallery }, setProg);
      if (res.errors?.length) setErr(res.errors.map((e) => `${e.file}: ${e.error}`).join('; '));
      onDone?.(res.uploaded);
    } catch (e) { setErr(e.message); }
    setProg(null);
    if (input.current) input.current.value = '';
  };

  return (
    <div>
      <div className={`dropzone ${drag ? 'drag' : ''} ${compact ? 'compact' : ''}`}
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); go(e.dataTransfer.files); }}>
        <input ref={input} type="file" hidden multiple={multiple} accept={accept} onChange={(e) => go(e.target.files)} />
        {prog === null ? <><i className="fas fa-cloud-arrow-up" /><span>{label}</span></> : (
          <div className="progress"><div style={{ width: `${prog}%` }} /><span>Uploading… {prog}%</span></div>
        )}
      </div>
      {err && <div className="form-msg err">{err}</div>}
    </div>
  );
}

/* ───────── login ───────── */
function Login({ onLogin }) {
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const r = await api.post('/api/auth/login', f, { auth: false }); setToken(r.token); onLogin(); }
    catch (er) { setErr(er.message); }
    setBusy(false);
  };
  return (
    <div className="admin-login">
      <form onSubmit={submit} className="form-card light">
        <div className="login-logo"><i className="fas fa-leaf" /></div>
        <h2>ARHICA admin</h2>
        <p className="muted">Sign in to manage stories, events, videos and media.</p>
        <label>Username<input autoFocus required value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} /></label>
        <label>Password<input required type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        {err && <div className="form-msg err">{err}</div>}
        <button className="btn btn-primary block" disabled={busy}>{busy ? <span className="spinner sm" /> : 'Sign in'}</button>
        <Link to="/" className="back-link center-link"><i className="fas fa-arrow-left" /> Back to site</Link>
      </form>
    </div>
  );
}

/* ───────── dashboard ───────── */
function Dashboard({ go }) {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/api/admin/stats').then(setS).catch(() => {}); }, []);
  const tiles = s && [
    ['Stories', s.posts, 'fa-newspaper', 'posts'], ['Events', s.events, 'fa-calendar-days', 'events'],
    ['Videos', s.videos + s.videoFiles, 'fa-film', 'videos'], ['Photos', s.images, 'fa-images', 'media'],
    ['Unread messages', s.unread, 'fa-envelope', 'inbox'], ['Subscribers', s.subscribers, 'fa-users', 'inbox'],
    ['Donation intents', s.donations, 'fa-heart', 'inbox'], ['Pledged (KES)', Math.round(s.donationTotal).toLocaleString(), 'fa-coins', 'inbox'],
  ];
  return (
    <>
      <h1>Dashboard</h1>
      <div className="tile-grid">
        {tiles?.map(([l, v, ic, to]) => <button key={l} className="tile" onClick={() => go(to)}><i className={`fas ${ic}`} /><b>{v}</b><span>{l}</span></button>)}
      </div>
      <div className="quick">
        <h3>Quick actions</h3>
        <button className="btn btn-primary" onClick={() => go('posts')}><i className="fas fa-plus" /> Write a story</button>
        <button className="btn btn-outline" onClick={() => go('events')}><i className="fas fa-plus" /> Add event</button>
        <button className="btn btn-outline" onClick={() => go('media')}><i className="fas fa-cloud-arrow-up" /> Upload photos & videos</button>
      </div>
    </>
  );
}

/* ───────── content manager (stories / events / videos) ───────── */
const CONFIG = {
  posts: {
    title: 'Stories & news', singular: 'story', icon: 'fa-newspaper',
    blank: { title: '', excerpt: '', body: '', category: 'News', cover: '', author: 'ARHICA Team', featured: 0, status: 'published', published_at: new Date().toISOString().slice(0, 10) },
    fields: [
      ['title', 'Title', 'text', { required: true }], ['category', 'Category', 'text', { list: ['News', 'Climate Action', 'Blue Economy', 'GESI', 'Innovation', 'Restoration', 'Youth', 'Event recap'] }],
      ['cover', 'Cover image', 'image'], ['excerpt', 'Short summary', 'textarea', { rows: 2 }],
      ['body', 'Story (## Heading, - bullets, **bold**, blank line = new paragraph)', 'textarea', { rows: 12 }],
      ['author', 'Author', 'text'], ['published_at', 'Publish date', 'date'], ['featured', 'Featured', 'check'], ['status', 'Status', 'status'],
    ],
    row: (r) => [r.title, r.category, fmtDate(r.published_at)], cols: ['Title', 'Category', 'Date'], thumb: 'cover',
  },
  events: {
    title: 'Events', singular: 'event', icon: 'fa-calendar-days',
    blank: { title: '', description: '', location: '', start_date: '', end_date: '', cover: '', link: '', status: 'published' },
    fields: [
      ['title', 'Event name', 'text', { required: true }], ['location', 'Location', 'text'],
      ['start_date', 'Start date', 'date', { required: true }], ['end_date', 'End date', 'date'],
      ['cover', 'Cover image', 'image'], ['description', 'Description', 'textarea', { rows: 6 }],
      ['link', 'RSVP / info link', 'text'], ['status', 'Status', 'status'],
    ],
    row: (r) => [r.title, r.location, fmtDate(r.start_date)], cols: ['Event', 'Location', 'Date'], thumb: 'cover',
  },
  videos: {
    title: 'Videos', singular: 'video', icon: 'fa-film',
    blank: { title: '', description: '', category: 'Story', source: 'youtube', url: '', thumbnail: '', featured: 0, status: 'published' },
    fields: [
      ['title', 'Title', 'text', { required: true }], ['category', 'Category', 'text', { list: ['Organization Story', 'Blue Economy', 'Technology', 'Environment', 'Youth', 'Event'] }],
      ['url', 'Video', 'video'], ['thumbnail', 'Thumbnail (optional)', 'image'],
      ['description', 'Description', 'textarea', { rows: 3 }], ['featured', 'Feature on homepage', 'check'], ['status', 'Status', 'status'],
    ],
    row: (r) => [r.title, r.category, r.source === 'youtube' ? 'YouTube' : 'Uploaded'], cols: ['Title', 'Category', 'Source'], thumb: 'thumbnail',
  },
};

function Field({ spec, form, set, toast }) {
  const [key, label, type, opt = {}] = spec;
  const v = form[key] ?? '';
  if (type === 'check') return <label className="check"><input type="checkbox" checked={!!form[key]} onChange={(e) => set(key, e.target.checked ? 1 : 0)} /> {label}</label>;
  if (type === 'status') return <label>{label}<select value={v} onChange={(e) => set(key, e.target.value)}><option value="published">Published</option><option value="draft">Draft (hidden)</option></select></label>;
  if (type === 'textarea') return <label className="wide">{label}<textarea rows={opt.rows || 4} value={v} onChange={(e) => set(key, e.target.value)} /></label>;
  if (type === 'image') return (
    <div className="wide field-media"><span>{label}</span>
      <div className="media-row">
        {v && <Img src={v} alt="" className="mini" />}
        <input value={v} onChange={(e) => set(key, e.target.value)} placeholder="Upload below or paste an image URL" />
        {v && <button type="button" className="icon-btn" onClick={() => set(key, '')} aria-label="Remove"><i className="fas fa-xmark" /></button>}
      </div>
      <Uploader compact multiple={false} accept="image/*" gallery={0} label="Upload image" onDone={(u) => u?.[0] && set(key, u[0].url)} />
    </div>
  );
  if (type === 'video') return (
    <div className="wide field-media"><span>{label}</span>
      <div className="seg small">
        <button type="button" className={form.source === 'youtube' ? 'on' : ''} onClick={() => set('source', 'youtube')}>YouTube link</button>
        <button type="button" className={form.source === 'upload' ? 'on' : ''} onClick={() => set('source', 'upload')}>Upload file</button>
      </div>
      <input value={v} onChange={(e) => set(key, e.target.value)} placeholder={form.source === 'youtube' ? 'https://youtu.be/…' : 'Uploaded video URL appears here'} required />
      {form.source === 'upload' && <Uploader compact multiple={false} accept="video/*" gallery={0} label="Upload video (mp4, webm, mov)" onDone={(u) => u?.[0] && set(key, u[0].url)} />}
    </div>
  );
  return (
    <label>{label}
      <input type={type} required={opt.required} value={v} list={opt.list ? `dl-${key}` : undefined} onChange={(e) => set(key, e.target.value)} />
      {opt.list && <datalist id={`dl-${key}`}>{opt.list.map((o) => <option key={o} value={o} />)}</datalist>}
    </label>
  );
}

function ContentManager({ kind }) {
  const cfg = CONFIG[kind];
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, toastNode] = useToast();

  const load = useCallback(() => api.get(`/api/${kind}?all=1&limit=200`).then(setItems).catch((e) => toast(e.message, false)), [kind, toast]);
  useEffect(() => { setForm(null); load(); }, [load]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      form.id ? await api.put(`/api/${kind}/${form.id}`, form) : await api.post(`/api/${kind}`, form);
      toast('Saved'); setForm(null); load();
    } catch (er) { toast(er.message, false); }
    setSaving(false);
  };
  const del = async (r) => {
    if (!window.confirm(`Delete "${r.title}"? This can't be undone.`)) return;
    try { await api.del(`/api/${kind}/${r.id}`); toast('Deleted'); load(); } catch (er) { toast(er.message, false); }
  };

  return (
    <>
      {toastNode}
      <div className="admin-head">
        <h1>{cfg.title}</h1>
        {!form && <button className="btn btn-primary" onClick={() => setForm({ ...cfg.blank })}><i className="fas fa-plus" /> New {cfg.singular}</button>}
      </div>
      {form ? (
        <form className="admin-form" onSubmit={save}>
          <h3>{form.id ? `Edit ${cfg.singular}` : `New ${cfg.singular}`}</h3>
          <div className="form-grid">{cfg.fields.map((s) => <Field key={s[0]} spec={s} form={form} set={set} toast={toast} />)}</div>
          <div className="form-actions">
            <button className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner sm" /> : <i className="fas fa-check" />} Save</button>
            <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      ) : !items ? <div className="state"><span className="spinner" /></div> : !items.length ? (
        <div className="state empty"><i className={`fas ${cfg.icon}`} /><h3>Nothing here yet</h3><p>Create your first {cfg.singular}.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th /> {cfg.cols.map((c) => <th key={c}>{c}</th>)}<th>Status</th><th /></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="thumb-cell">{r[cfg.thumb] ? <Img src={r[cfg.thumb]} alt="" className="mini" /> : <span className="mini ph"><i className={`fas ${cfg.icon}`} /></span>}</td>
                  {cfg.row(r).map((c, i) => <td key={i} className={i === 0 ? 'strong' : ''}>{c}{i === 0 && r.featured ? <i className="fas fa-star feat" title="Featured" /> : null}</td>)}
                  <td><span className={`status ${r.status}`}>{r.status}</span></td>
                  <td className="actions">
                    <button className="icon-btn" onClick={() => setForm({ ...r })} aria-label="Edit"><i className="fas fa-pen" /></button>
                    <button className="icon-btn danger" onClick={() => del(r)} aria-label="Delete"><i className="fas fa-trash" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ───────── media library ───────── */
function MediaLibrary() {
  const [data, setData] = useState({ items: [], albums: [] });
  const [album, setAlbum] = useState('');
  const [newAlbum, setNewAlbum] = useState('General');
  const [toast, toastNode] = useToast();
  const load = useCallback(() => api.get(`/api/media${album ? `?album=${encodeURIComponent(album)}` : ''}`).then(setData).catch((e) => toast(e.message, false)), [album, toast]);
  useEffect(() => { load(); }, [load]);

  const del = async (m) => { if (window.confirm('Delete this file permanently?')) { await api.del(`/api/media/${m.id}`); load(); } };
  const edit = async (m, patch) => { await api.patch(`/api/media/${m.id}`, patch); load(); };
  const copy = (m) => { navigator.clipboard?.writeText(assetUrl(m.url)); toast('URL copied'); };

  return (
    <>
      {toastNode}
      <div className="admin-head"><h1>Media library</h1></div>
      <div className="upload-panel">
        <label>Album <input list="albums" value={newAlbum} onChange={(e) => setNewAlbum(e.target.value)} placeholder="e.g. Fish cages, Launch 2026" />
          <datalist id="albums">{data.albums.map((a) => <option key={a} value={a} />)}</datalist></label>
        <Uploader album={newAlbum} accept="image/*,video/*,application/pdf" label="Drop photos, videos or PDFs here, or click to browse" onDone={() => { toast('Upload complete'); load(); }} />
        <small className="muted">Photos are auto-resized and thumbnailed. Uploaded items appear in the public Gallery unless you hide them.</small>
      </div>
      <div className="filters">
        <button className={!album ? 'on' : ''} onClick={() => setAlbum('')}>All</button>
        {data.albums.map((a) => <button key={a} className={album === a ? 'on' : ''} onClick={() => setAlbum(a)}>{a}</button>)}
      </div>
      <div className="media-grid">
        {data.items.map((m) => (
          <div key={m.id} className={`media-card ${m.in_gallery ? '' : 'hidden-item'}`}>
            <div className="media-thumb">
              {m.kind === 'image' ? <Img src={m.thumb || m.url} alt={m.caption} /> : m.thumb ? <Img src={m.thumb} alt="" /> : <div className="img-fallback"><i className={`fas ${m.kind === 'video' ? 'fa-film' : 'fa-file-pdf'}`} /></div>}
              <span className="kind">{m.kind}</span>
            </div>
            <div className="media-meta">
              <input defaultValue={m.caption} placeholder="Caption" onBlur={(e) => e.target.value !== m.caption && edit(m, { caption: e.target.value })} />
              <small>{m.album} · {fmtSize(m.size)}</small>
              <div className="media-actions">
                <button onClick={() => copy(m)} title="Copy URL"><i className="fas fa-link" /></button>
                <button onClick={() => edit(m, { in_gallery: m.in_gallery ? 0 : 1 })} title={m.in_gallery ? 'Hide from gallery' : 'Show in gallery'}><i className={`fas ${m.in_gallery ? 'fa-eye' : 'fa-eye-slash'}`} /></button>
                <button className="danger" onClick={() => del(m)} title="Delete"><i className="fas fa-trash" /></button>
              </div>
            </div>
          </div>
        ))}
        {!data.items.length && <div className="state empty wide"><i className="fas fa-images" /><h3>No files yet</h3></div>}
      </div>
    </>
  );
}

/* ───────── inbox ───────── */
function Inbox() {
  const [tab, setTab] = useState('messages');
  const [rows, setRows] = useState(null);
  const load = useCallback(() => { setRows(null); api.get(`/api/admin/${tab}`).then(setRows); }, [tab]);
  useEffect(() => { load(); }, [load]);
  const read = async (m) => { await api.post(`/api/admin/messages/${m.id}/read`, {}); load(); };
  return (
    <>
      <div className="admin-head"><h1>Inbox</h1></div>
      <div className="filters">{[['messages', 'Messages'], ['donations', 'Donation intents'], ['subscribers', 'Subscribers']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
      {!rows ? <div className="state"><span className="spinner" /></div> : !rows.length ? <div className="state empty"><i className="fas fa-inbox" /><h3>Nothing here yet</h3></div> : tab === 'messages' ? (
        <div className="msg-list">
          {rows.map((m) => (
            <article key={m.id} className={`msg ${m.is_read ? '' : 'unread'}`}>
              <header><b>{m.name}</b> <a href={`mailto:${m.email}`}>{m.email}</a> <span className="pill">{m.kind}</span><time>{fmtDate(m.created_at)}</time></header>
              <h4>{m.subject}{m.organization && <small> · {m.organization}</small>}</h4>
              <p>{m.message}</p>
              {!m.is_read && <button className="btn btn-outline btn-sm" onClick={() => read(m)}>Mark as read</button>}
            </article>
          ))}
        </div>
      ) : (
        <div className="table-wrap"><table className="table">
          <thead><tr>{(tab === 'donations' ? ['Donor', 'Contact', 'Amount (KES)', 'Type', 'Message', 'Date'] : ['Email', 'Name', 'Subscribed']).map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => tab === 'donations' ? (
              <tr key={r.id}><td className="strong">{r.full_name}</td><td>{r.email}<br /><small>{r.phone}</small></td><td>{Number(r.amount).toLocaleString()}</td><td>{r.donation_type}</td><td>{r.message || '—'}</td><td>{fmtDate(r.created_at)}</td></tr>
            ) : (
              <tr key={r.id}><td className="strong">{r.email}</td><td>{r.name || '—'}</td><td>{fmtDate(r.created_at)}</td></tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}

/* ───────── shell ───────── */
const MENU = [['dashboard', 'Dashboard', 'fa-gauge'], ['posts', 'Stories', 'fa-newspaper'], ['events', 'Events', 'fa-calendar-days'], ['videos', 'Videos', 'fa-film'], ['media', 'Media library', 'fa-images'], ['inbox', 'Inbox', 'fa-inbox']];

export default function Admin() {
  useDocTitle('Admin');
  const nav = useNavigate();
  const [authed, setAuthed] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!getToken()) return setAuthed(false);
    api.get('/api/auth/me').then(() => setAuthed(true)).catch(() => { setToken(null); setAuthed(false); });
  }, []);

  if (authed === null) return <div className="state"><span className="spinner" /></div>;
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const go = (t) => { setTab(t); setMenu(false); window.scrollTo(0, 0); };
  return (
    <div className="admin">
      <aside className={menu ? 'open' : ''}>
        <div className="admin-brand"><i className="fas fa-leaf" /> ARHICA <small>Admin</small></div>
        <nav>{MENU.map(([k, l, ic]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => go(k)}><i className={`fas ${ic}`} /> {l}</button>)}</nav>
        <div className="aside-foot">
          <Link to="/"><i className="fas fa-arrow-up-right-from-square" /> View site</Link>
          <button onClick={() => { setToken(null); setAuthed(false); nav('/admin'); }}><i className="fas fa-right-from-bracket" /> Sign out</button>
        </div>
      </aside>
      <div className="admin-main">
        <button className="admin-burger" onClick={() => setMenu(!menu)} aria-label="Menu"><i className="fas fa-bars" /></button>
        {tab === 'dashboard' && <Dashboard go={go} />}
        {CONFIG[tab] && <ContentManager kind={tab} key={tab} />}
        {tab === 'media' && <MediaLibrary />}
        {tab === 'inbox' && <Inbox />}
      </div>
    </div>
  );
}
