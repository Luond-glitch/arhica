import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SITE } from '../data/site';
import { api } from '../lib/api';
import { useDocTitle } from '../lib/hooks';
import { PageHero, Reveal } from '../components/ui';

export function Contact() {
  useDocTitle('Contact');
  const [params] = useSearchParams();
  const partner = params.get('topic') === 'partner';
  const [kind, setKind] = useState(partner ? 'partner' : 'contact');
  const [f, setF] = useState({ name: '', email: '', organization: '', subject: '', message: '' });
  const [st, setSt] = useState({ busy: false, msg: '', ok: true });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSt({ busy: true, msg: '', ok: true });
    try {
      const r = await api.post(`/api/${kind}`, f, { auth: false });
      setSt({ busy: false, msg: r.message, ok: true });
      setF({ name: '', email: '', organization: '', subject: '', message: '' });
    } catch (err) { setSt({ busy: false, msg: err.message, ok: false }); }
  };

  return (
    <>
      <PageHero label="Get in touch" title="Contact &" accent="Partnerships" text="Questions, ideas or a partnership in mind? We'd love to hear from you." />
      <section className="section">
        <div className="container contact-layout">
          <Reveal className="contact-info">
            <h2>Let's work together</h2>
            <p>ARHICA invites development partners, donors, private sector actors and social investors to build inclusive climate resilience from the heart of Africa.</p>
            <ul>
              <li><span><i className="fas fa-location-dot" /></span><div><b>Visit</b>{SITE.address}</div></li>
              <li><span><i className="fas fa-phone" /></span><div><b>Call</b><a href={`tel:${SITE.phoneRaw}`}>{SITE.phone}</a></div></li>
              <li><span><i className="fas fa-envelope" /></span><div><b>Email</b><a href={`mailto:${SITE.email}`}>{SITE.email}</a></div></li>
            </ul>
            <iframe title="Kisumu map" loading="lazy" className="map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=34.70%2C-0.15%2C34.85%2C-0.05&layer=mapnik&marker=-0.0917%2C34.768" />
          </Reveal>
          <Reveal delay={100} className="form-card light">
            <div className="seg">
              <button className={kind === 'contact' ? 'on' : ''} onClick={() => setKind('contact')}>General enquiry</button>
              <button className={kind === 'partner' ? 'on' : ''} onClick={() => setKind('partner')}>Partnership</button>
            </div>
            <form onSubmit={submit}>
              <div className="two"><label>Name *<input required value={f.name} onChange={set('name')} /></label><label>Email *<input required type="email" value={f.email} onChange={set('email')} /></label></div>
              <label>Organization<input value={f.organization} onChange={set('organization')} /></label>
              <label>{kind === 'partner' ? 'Area of interest' : 'Subject'}<input value={f.subject} onChange={set('subject')} placeholder={kind === 'partner' ? 'e.g. Aquaculture, GESI, Funding' : ''} /></label>
              <label>Message {kind === 'contact' && '*'}<textarea rows="5" required={kind === 'contact'} value={f.message} onChange={set('message')} /></label>
              {st.msg && <div className={`form-msg ${st.ok ? 'ok' : 'err'}`}>{st.msg}</div>}
              <button className="btn btn-primary block" disabled={st.busy}>{st.busy ? <span className="spinner sm" /> : <i className="fas fa-paper-plane" />} Send message</button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function NotFound() {
  useDocTitle('Page not found');
  return (
    <section className="section"><div className="container center">
      <h1 className="big404">404</h1><h2>This page drifted off down the lake</h2>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <a className="btn btn-primary" href="/">Back home</a>
    </div></section>
  );
}
