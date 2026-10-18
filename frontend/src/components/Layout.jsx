import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { NAV, SITE } from '../data/site';
import { NewsletterForm } from './ui';

function Topbar() {
  return (
    <div className="topbar">
      <div className="container">
        <div className="topbar-left">
          <span><i className="fas fa-location-dot" /> Kisumu City | Lake Victoria Basin | Africa</span>
          <a href={`tel:${SITE.phoneRaw}`}><i className="fas fa-phone" /> {SITE.phone}</a>
        </div>
        <div className="topbar-right">
          <a href={`mailto:${SITE.email}`}><i className="fas fa-envelope" /> {SITE.email}</a>
          <div className="socials">
            {SITE.socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}><i className={s.icon} /></a>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); setOpenSub(null); }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-row">
        <Link to="/" className="brand" aria-label="ARHICA home">
          <img src="/images/logo.jpeg" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span><b>ARHICA</b><small>{SITE.tagline}</small></span>
        </Link>
        <button className={`burger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          <span /><span /><span />
        </button>
        <nav className={open ? 'open' : ''} aria-label="Main">
          <ul>
            {NAV.map((item) => (
              <li key={item.label} className={item.children ? `has-sub ${openSub === item.label ? 'open' : ''}` : ''}>
                {item.children ? (
                  <>
                    <button className="nav-link" onClick={() => setOpenSub(openSub === item.label ? null : item.label)} aria-haspopup="true">
                      {item.label} <i className="fas fa-chevron-down" />
                    </button>
                    <ul className="sub">
                      {item.children.map((c) => <li key={c.label}><Link to={c.to}>{c.label}</Link></li>)}
                    </ul>
                  </>
                ) : <NavLink to={item.to} className="nav-link">{item.label}</NavLink>}
              </li>
            ))}
            <li><Link to="/donate" className="btn btn-donate"><i className="fas fa-heart" /> Donate</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>ARHICA</h3>
          <small>{SITE.full}</small>
          <p>Empowering communities across the Lake Victoria Basin through inclusive climate action, blue economy development and youth empowerment.</p>
          <ul className="contact-list">
            <li><i className="fas fa-location-dot" /> {SITE.address}</li>
            <li><i className="fas fa-phone" /> {SITE.phone}</li>
            <li><i className="fas fa-envelope" /> {SITE.email}</li>
          </ul>
          <div className="socials">
            {SITE.socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}><i className={s.icon} /></a>)}
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/about">About us</Link><Link to="/programmes">Programmes</Link>
          <Link to="/stories">Stories & news</Link><Link to="/events">Events</Link>
          <Link to="/videos">Videos</Link><Link to="/gallery">Gallery</Link>
        </div>
        <div>
          <h4>Organization</h4>
          <Link to="/organization/board">Board of Directors</Link><Link to="/organization/management">Management</Link>
          <Link to="/organization/teams">Teams & departments</Link>
          <Link to="/contact?topic=partner">Partner with us</Link><Link to="/donate">Donate</Link>
        </div>
        <div>
          <h4>Newsletter</h4>
          <p>Get the latest updates on our initiatives, stories and impact.</p>
          <NewsletterForm />
          <div className="badges"><span>🌿 Climate Pledge</span><span>🤝 SDG Partner</span></div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} ARHICA. All rights reserved. · Supported by Lintech Group Solutions</p>
          <Link to="/admin" className="admin-link">Staff login</Link>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname, hash } = useLocation();
  const [top, setTop] = useState(false);

  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    const on = () => setTop(window.scrollY > 500);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <Topbar />
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
      <button className={`to-top ${top ? 'show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        <i className="fas fa-arrow-up" />
      </button>
    </>
  );
}
