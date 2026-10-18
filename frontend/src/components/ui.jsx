import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, assetUrl, youtubeId } from '../lib/api';
import { useReveal } from '../lib/hooks';

/** Image with graceful fallback (initials avatar or soft gradient). */
export function Img({ src, alt = '', fallback, className, ...rest }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (!src || bad) {
    return fallback ? <img src={fallback} alt={alt} className={className} loading="lazy" {...rest} />
      : <div className={`img-fallback ${className || ''}`} role="img" aria-label={alt}><i className="fas fa-leaf" /></div>;
  }
  return <img src={assetUrl(src)} alt={alt} className={className} loading="lazy" onError={() => setBad(true)} {...rest} />;
}

export const avatar = (name, bg = '0b5e3e') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=300`;

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useReveal();
  return <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>{children}</Tag>;
}

export function Counter({ value, suffix = '' }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1600;
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        setN(Math.round((1 - Math.pow(1 - p, 3)) * value));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

export function Slider({ images, className = '', alt = '', interval = 4500 }) {
  const list = (images || []).filter(Boolean);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % list.length), interval);
    return () => clearInterval(t);
  }, [list.length, interval]);
  if (!list.length) return <div className={`slider ${className}`}><div className="img-fallback"><i className="fas fa-leaf" /></div></div>;
  return (
    <div className={`slider ${className}`}>
      {list.map((s, k) => (
        <Img key={s + k} src={s} alt={`${alt} ${k + 1}`} className={k === i ? 'active' : ''} loading={k === 0 ? 'eager' : 'lazy'} />
      ))}
      {list.length > 1 && (
        <div className="slider-dots">
          {list.map((_, k) => <button key={k} className={k === i ? 'active' : ''} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} />)}
        </div>
      )}
    </div>
  );
}

export function SectionHeader({ tag, title, text, light, align = 'center' }) {
  return (
    <Reveal className={`section-header ${align} ${light ? 'light' : ''}`}>
      {tag && <span className="tag">{tag}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </Reveal>
  );
}

export function PageHero({ label, title, accent, text, image, children }) {
  return (
    <header className="page-hero" style={image ? { '--hero-img': `url("${assetUrl(image)}")` } : undefined}>
      <div className="page-hero-inner">
        {label && <span className="hero-label">{label}</span>}
        <h1>{title} {accent && <em>{accent}</em>}</h1>
        {text && <p>{text}</p>}
        {children}
      </div>
    </header>
  );
}

export function Loading({ label = 'Loading…' }) {
  return <div className="state"><span className="spinner" /> {label}</div>;
}

export function Empty({ icon = 'fa-folder-open', title, text, children }) {
  return (
    <div className="state empty">
      <i className={`fas ${icon}`} />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

/** Plays YouTube links in an embed and uploaded files in <video>. */
export function VideoPlayer({ video, className = '' }) {
  const id = video.source === 'youtube' ? youtubeId(video.url) : null;
  if (id) {
    return (
      <div className={`video-frame ${className}`}>
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={video.title} loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    );
  }
  return (
    <div className={`video-frame ${className}`}>
      <video controls preload="metadata" poster={assetUrl(video.thumbnail)} src={assetUrl(video.url)} />
    </div>
  );
}

export function NewsletterForm({ compact }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ busy: false, msg: '', ok: true });
  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, msg: '', ok: true });
    try {
      const r = await api.post('/api/subscribe', { email }, { auth: false });
      setState({ busy: false, msg: r.message, ok: true });
      setEmail('');
    } catch (err) {
      setState({ busy: false, msg: err.message, ok: false });
    }
  };
  return (
    <form onSubmit={submit} className={`newsletter ${compact ? 'compact' : ''}`}>
      <div className="newsletter-row">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" aria-label="Email address" />
        <button type="submit" disabled={state.busy} aria-label="Subscribe">
          {state.busy ? <span className="spinner sm" /> : <i className="fas fa-paper-plane" />}
        </button>
      </div>
      {state.msg && <div className={`form-msg ${state.ok ? 'ok' : 'err'}`} role="status">{state.msg}</div>}
    </form>
  );
}

/** Minimal markdown: blank-line paragraphs, ## headings, - lists, **bold**, [text](url). */
export function RichText({ text = '' }) {
  const inline = (s) => {
    const parts = [];
    const re = /\*\*(.+?)\*\*|\[(.+?)\]\((https?:\/\/[^)]+)\)/g;
    let last = 0, m, k = 0;
    while ((m = re.exec(s))) {
      if (m.index > last) parts.push(s.slice(last, m.index));
      parts.push(m[1] ? <strong key={k++}>{m[1]}</strong> : <a key={k++} href={m[3]} target="_blank" rel="noreferrer">{m[2]}</a>);
      last = re.lastIndex;
    }
    parts.push(s.slice(last));
    return parts;
  };
  return (
    <div className="prose">
      {text.split(/\n{2,}/).map((block, i) => {
        const b = block.trim();
        if (!b) return null;
        if (b.startsWith('## ')) return <h2 key={i}>{inline(b.slice(3))}</h2>;
        if (b.startsWith('### ')) return <h3 key={i}>{inline(b.slice(4))}</h3>;
        if (/^[-•] /m.test(b)) return <ul key={i}>{b.split('\n').map((l, j) => <li key={j}>{inline(l.replace(/^[-•]\s*/, ''))}</li>)}</ul>;
        return <p key={i}>{b.split('\n').map((l, j) => <span key={j}>{inline(l)}{j < b.split('\n').length - 1 && <br />}</span>)}</p>;
      })}
    </div>
  );
}

export function Lightbox({ items, index, onClose, onNav }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, onNav]);
  const it = items[index];
  if (!it) return null;
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button className="lb-close" onClick={onClose} aria-label="Close"><i className="fas fa-xmark" /></button>
      <button className="lb-nav prev" onClick={(e) => { e.stopPropagation(); onNav(-1); }} aria-label="Previous"><i className="fas fa-chevron-left" /></button>
      <figure onClick={(e) => e.stopPropagation()}>
        {it.kind === 'video'
          ? <video src={assetUrl(it.url)} controls autoPlay />
          : <img src={assetUrl(it.url)} alt={it.caption || ''} />}
        {(it.caption || it.album) && <figcaption>{it.caption || it.album}</figcaption>}
      </figure>
      <button className="lb-nav next" onClick={(e) => { e.stopPropagation(); onNav(1); }} aria-label="Next"><i className="fas fa-chevron-right" /></button>
    </div>
  );
}

export const LinkBtn = ({ to, href, external, className = 'btn btn-primary', children, ...rest }) =>
  external || href?.startsWith('http')
    ? <a href={href || to} target="_blank" rel="noreferrer" className={className} {...rest}>{children}</a>
    : <Link to={to || href} className={className} {...rest}>{children}</Link>;
