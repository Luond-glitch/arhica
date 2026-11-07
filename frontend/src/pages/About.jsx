import { Link } from 'react-router-dom';
import { ABOUT_IMAGES, DIRECTION, IMPACT, PROBLEMS, PROBLEM_IMAGES } from '../data/site';
import { useDocTitle } from '../lib/hooks';
import { PageHero, Reveal, SectionHeader, Slider } from '../components/ui';

export default function About() {
  useDocTitle('About');
  return (
    <>
      <PageHero label="Who we are" title="About" accent="ARHICA" text="AfriResilience Hub for Inclusive Climate Action — building resilience and leaving no one behind." />
      <section className="section">
        <div className="container split">
          <Reveal><Slider images={['/images/arhica_board.jpeg', '/images/fishcage4.jpeg', '/images/lake 1.jpg', '/images/orange.jpg', '/images/conservation.jpg']} className="tall" alt="ARHICA" /></Reveal>
          <Reveal delay={100} className="split-text">
            <span className="tag">Our story</span>
            <h2>Rooted in Kisumu, <em>growing across Africa</em></h2>
            <p>ARHICA is a non-profit organization founded in 2023 in Kisumu City, within the Lake Victoria Basin. We empower youth, women, persons with disabilities and vulnerable groups to drive inclusive climate resilience and economic transformation.</p>
            <p>The Lake Victoria Basin reflects Africa's development crossroads: declining fisheries, climate shocks, youth unemployment, food insecurity and exclusion from decision-making. We respond by turning these challenges into opportunities through community-led, evidence-based solutions that link climate action, food systems, governance and enterprise development.</p>
            <p>We recognize a hard truth: ambition alone is not enough where resources are scarce and opportunities uneven. We exist to change this trajectory — redefining possibility for inclusive, sustainable economic growth.</p>
          </Reveal>
        </div>
      </section>
      <section className="section dark pattern">
        <div className="container">
          <SectionHeader light tag="Our direction" title="Vision, mission & values" />
          <div className="vm-grid">
            {DIRECTION.map((d, i) => (
              <Reveal key={d.title} delay={i * 100} className={`vm-card ${d.featured ? 'featured' : ''}`}>
                <div className="vm-icon"><i className={`fas ${d.icon}`} /></div><h3>{d.title}</h3><p>{d.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeader tag="The challenge" title="The problem we are solving" />
          <div className="split">
          <Reveal><Slider images={['/images/degrade.jpg', '/images/change4.jpg', '/images/change2.jpg', '/images/change1.jpg', '/images/change1.jpg']} className="tall" alt="ARHICA" /></Reveal>
            <ul className="problem-list">
              {PROBLEMS.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 70}><span className="p-icon"><i className={`fas ${p.icon}`} /></span><div><strong>{p.title}</strong><span>{p.text}</span></div></Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="container">
          <SectionHeader tag="Our results" title="Impact pathways" />
          <div className="impact-grid">
            {IMPACT.map((it, i) => (
              <Reveal key={it.title} delay={(i % 3) * 80} className="impact-item"><div className="impact-icon"><i className={`fas ${it.icon}`} /></div><h4>{it.title}</h4><p>{it.text}</p></Reveal>
            ))}
          </div>
          <div className="center"><Link to="/organization/board" className="btn btn-primary">Meet our leadership</Link></div>
        </div>
      </section>
    </>
  );
}
