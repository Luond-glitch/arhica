import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BOARD, DEPARTMENTS, FLOW, MANAGEMENT, TIER3 } from '../data/people';
import { useDocTitle } from '../lib/hooks';
import { Img, PageHero, Reveal, avatar } from '../components/ui';

const TABS = [['board', 'Board of Directors'], ['management', 'Management'], ['teams', 'Teams & Departments']];
const Tabs = () => (
  <div className="org-tabs container">
    {TABS.map(([k, l]) => <NavLink key={k} to={`/organization/${k}`}>{l}</NavLink>)}
  </div>
);

function Bio({ paras }) {
  const [open, setOpen] = useState(false);
  const long = paras.join(' ').length > 360;
  return (
    <div className={`bio ${open ? 'open' : ''}`}>
      {paras.map((p, i) => <p key={i}>{p}</p>)}
      {long && <button className="bio-toggle" onClick={() => setOpen(!open)}>{open ? 'Show less' : 'Read more'}</button>}
    </div>
  );
}

export function Board() {
  useDocTitle('Board of Directors');
  const [chair, ...rest] = BOARD;
  const Card = ({ m, i }) => (
    <Reveal as="article" delay={(i % 3) * 80} className={`person ${m.chair ? 'chair' : ''}`}>
      <div className="person-photo">
        <Img src={m.photo} alt={m.name} fallback={avatar(m.name)} />
        <span className="person-badge"><i className={`fas ${m.icon}`} /></span>
      </div>
      <div className="person-body">
        <span className="role">{m.role}</span>
        <h3>{m.name}</h3>
        <Bio paras={m.bio} />
        <div className="chips small">{m.tags.map((t) => <span key={t}>{t}</span>)}</div>
      </div>
    </Reveal>
  );
  return (
    <>
      <PageHero label="Governance & leadership" title="Board of" accent="Directors"
        text="Meet the leaders guiding ARHICA towards inclusive climate resilience and sustainable development." />
      <Tabs />
      <section className="section">
        <div className="container">
          <Card m={chair} i={0} />
          <div className="people-grid">{rest.map((m, i) => <Card key={m.name} m={m} i={i} />)}</div>
        </div>
      </section>
    </>
  );
}

export function Management() {
  useDocTitle('Management');
  return (
    <>
      <PageHero label="Executive leadership" title="Management" accent="Council" text="Policy execution · resource stewardship · institutional leadership." />
      <Tabs />
      <section className="section">
        <div className="container card-grid">
          {MANAGEMENT.map((m, i) => (
            <Reveal key={m.role} delay={i * 90} className="card exec-card">
              <div className="exec-photo"><Img src={m.photo} alt={m.role} fallback={avatar(m.role)} /></div>
              <div className="card-body center">
                <h3>{m.name}</h3>
                <span className="role">{m.role}</span>
                <ul className="check-list left">{m.points.map((p) => <li key={p}><i className="fas fa-caret-right" /> {p}</li>)}</ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function Teams() {
  useDocTitle('Teams & Departments');
  return (
    <>
      <PageHero label="Organizational structure" title="Teams &" accent="Department Leads"
        text="Core managerial structure, operational teams and the dedicated leaders driving inclusive climate action across the Lake Victoria Basin.">
        <div className="hero-pills"><span><i className="fas fa-arrow-up" /> Strategic flow</span><span><i className="fas fa-rotate" /> Learning & adaptation</span><span><i className="fas fa-arrow-down" /> Operational insights</span></div>
      </PageHero>
      <Tabs />
      <section className="section">
        <div className="container">
          <Reveal className="flow-box">
            <h2>How decisions move</h2>
            <div className="flow-row">
              <div className="flow-card up"><i className="fas fa-arrow-up" /><h3>{FLOW.up.title}</h3><ul>{FLOW.up.items.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <i className="fas fa-rotate flow-spin" />
              <div className="flow-card down"><i className="fas fa-arrow-down" /><h3>{FLOW.down.title}</h3><ul>{FLOW.down.items.map((x) => <li key={x}>{x}</li>)}</ul></div>
            </div>
          </Reveal>

          <h2 className="mini-title"><i className="fas fa-briefcase" /> Core managerial & leads</h2>
          <div className="dept-grid">
            {DEPARTMENTS.map((d, i) => (
              <Reveal key={d.name} delay={i * 80} className="card dept-card">
                <div className="dept-top"><span className={`dept-icon ${d.tone}`}><i className={`fas ${d.icon}`} /></span><span className="pill">Tier II</span></div>
                <h3>{d.name}</h3>
                <div className="lead-pill">
                  <Img src={d.lead.photo} alt={d.lead.name} fallback={avatar(d.lead.name)} />
                  <div><small><i className="fas fa-star" /> Team lead</small><b>{d.lead.name}</b></div>
                </div>
                <ul className="role-list">{d.roles.map(([ic, r]) => <li key={r}><i className={`fas ${ic}`} /> {r}</li>)}</ul>
              </Reveal>
            ))}
          </div>

          <h2 className="mini-title"><i className="fas fa-people-arrows" /> Tier III: operations & field</h2>
          <div className="tier-grid">
            {TIER3.map((t, i) => (
              <Reveal key={t.name} delay={i * 100} className="card tier-card">
                <div className="tier-head"><span className={`dept-icon ${t.tone}`}><i className={`fas ${t.icon}`} /></span><h3>{t.name}</h3></div>
                <div className="lead-pill dashed">
                  <Img src={t.lead.photo} alt={t.lead.name} fallback={avatar(t.lead.name, t.tone === 'amber' ? 'd97706' : '0b5e3e')} />
                  <div><b>{t.lead.name}</b><small>{t.lead.role}</small></div>
                </div>
                <ul className="sub-list">{t.items.map((x) => <li key={x}>{x}</li>)}</ul>
                <h4 className="sub-title"><i className={`fas ${t.sub.icon}`} /> {t.sub.title}</h4>
                <ul className="sub-list">{t.sub.items.map((x) => <li key={x}>{x}</li>)}</ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
