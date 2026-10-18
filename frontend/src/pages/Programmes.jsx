import { Link } from 'react-router-dom';
import { PROGRAMMES } from '../data/site';
import { useDocTitle } from '../lib/hooks';
import { LinkBtn, PageHero, Reveal, Slider } from '../components/ui';

export default function Programmes() {
  useDocTitle('Programmes');
  return (
    <>
      <PageHero label="What we do" title="Our" accent="Programmes" text="Integrated solutions showing how climate resilience drives jobs, inclusion and economic growth.">
        <div className="hero-pills">
          {PROGRAMMES.map((p) => <a key={p.id} href={`#${p.id}`}>{p.badge}</a>)}
        </div>
      </PageHero>
      <section className="section">
        <div className="container programme-list">
          {PROGRAMMES.map((p, i) => (
            <Reveal key={p.id} id={p.id} className={`programme ${i % 2 ? 'flip' : ''}`}>
              <div className="programme-media">
                <Slider images={p.images} alt={p.title} className="tall" />
                <span className={`badge ${p.color}`}>{p.badge}</span>
              </div>
              <div className="programme-text">
                <h2>{p.title}</h2>
                <p className="lead">{p.summary}</p>
                {p.detail && <p>{p.detail}</p>}
                {p.indicators && (
                  <>
                    <h4>Key focus areas & indicators</h4>
                    <ul className="check-list">{p.indicators.map((x) => <li key={x}><i className="fas fa-circle-check" /> {x}</li>)}</ul>
                  </>
                )}
                {p.impact && <div className="impact-note"><b>Impact</b><p>{p.impact}</p></div>}
                <div className="chips small">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
                <LinkBtn to={p.cta.href} href={p.cta.href} external={p.cta.external}>{p.cta.label} <i className={`fas ${p.cta.external ? 'fa-arrow-up-right-from-square' : 'fa-arrow-right'}`} /></LinkBtn>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
