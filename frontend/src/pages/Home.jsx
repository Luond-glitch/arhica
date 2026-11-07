import { Link } from 'react-router-dom';
import { ABOUT_IMAGES, DIRECTION, IMPACT, PROBLEMS, PROBLEM_IMAGES, PROGRAMMES, STATS } from '../data/site';
import { useApi, useDocTitle } from '../lib/hooks';
import { fmtDate } from '../lib/api';
import { Counter, Img, Reveal, SectionHeader, Slider, VideoPlayer } from '../components/ui';
import { StoryCard } from './Stories';
import { EventCard } from './Events';

export default function Home() {
  useDocTitle('');
  const { data: posts } = useApi('/api/posts?limit=4', []);
  const { data: events } = useApi('/api/events?when=upcoming&limit=3', []);
  const { data: videos } = useApi('/api/videos?limit=4', []);
  const featuredVideo = videos?.find((v) => v.featured) || videos?.[0];

  return (
    <>
      {/* HERO */}
      <section className="hero" id="home">
        <Img src="lakefishing.jpg" className="hero-bg" alt=""
          fallback="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=70" loading="eager" />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <span className="hero-badge"><i className="fas fa-location-dot" /> Lake Victoria Basin, Kenya</span>
          <h1>Inclusive Climate Action <em>for Resilient Communities</em></h1>
          <p className="hero-lead">
            Empowering youth, women and vulnerable communities to lead climate resilience and economic transformation
            across the Lake Victoria Basin.
          </p>
          <p className="hero-sub">
            Ambition alone is not enough where resources are scarce and opportunities uneven. By delivering tailored,
            informed and market-responsive support, ARHICA turns uncertainty into opportunity — so people can invest with
            confidence, persist with purpose and thrive beyond systemic barriers.
          </p>
          <div className="hero-actions">
            <Link to="/programmes" className="btn btn-primary">Explore our work</Link>
            <Link to="/contact?topic=partner" className="btn btn-ghost">Partner with us</Link>
            <Link to="/donate" className="btn btn-gold"><i className="fas fa-heart" /> Donate</Link>
          </div>
        </div>
        <div className="scroll-cue"><span /></div>
      </section>

      {/* STATS STRIP */}
      <section className="stats-strip">
        <div className="container stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat">
              <i className={`fas ${s.icon}`} />
              <b><Counter value={s.value} suffix={s.suffix} /></b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="section">
        <div className="container split">
          <Reveal className="split-visual">
            <Slider images={ABOUT_IMAGES} alt="ARHICA community work" className="tall" />
            <div className="float-card"><i className="fas fa-award" /><div><b>Est. 2023</b><span>Kisumu, Kenya</span></div></div>
          </Reveal>
          <Reveal delay={120} className="split-text">
            <span className="tag">Who we are</span>
            <h2>Empowering communities for <em>climate resilience</em></h2>
            <p className="lead">ARHICA is a non-profit organization rooted in Kisumu City within the Lake Victoria Basin.</p>
            <p>We empower youth, women, persons with disabilities and vulnerable groups to drive inclusive climate resilience and
              economic transformation. The basin reflects Africa's development crossroads — declining fisheries, climate shocks,
              youth unemployment, food insecurity and exclusion from decision-making.</p>
            <p>We turn these challenges into opportunities through community-led, evidence-based and inclusive solutions linking
              climate action, food systems, governance and enterprise development.</p>
            <div className="chips">
              {['Climate Justice', 'Blue Economy', 'Youth Leadership', 'Food Systems'].map((c) => <span key={c}><i className="fas fa-circle-check" /> {c}</span>)}
            </div>
            <Link to="/about" className="btn btn-primary">More about us <i className="fas fa-arrow-right" /></Link>
          </Reveal>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section alt">
        <div className="container">
          <SectionHeader tag="The challenge" title="The problem we are solving"
            text="Climate change and socio-economic pressures threaten livelihoods across Western Kenya's Lake Victoria Basin." />
          <div className="split">
            <Reveal><Slider images={PROBLEM_IMAGES} className="tall" alt="Climate impact" /></Reveal>
            <ul className="problem-list">
              {PROBLEMS.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 70}>
                  <span className="p-icon"><i className={`fas ${p.icon}`} /></span>
                  <div><strong>{p.title}</strong><span>{p.text}</span></div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VISION / MISSION */}
      <section className="section dark pattern">
        <div className="container">
          <SectionHeader light tag="Our direction" title="Vision, mission & values" text="Guiding our work towards a resilient and inclusive Africa." />
          <div className="vm-grid">
            {DIRECTION.map((d, i) => (
              <Reveal key={d.title} delay={i * 100} className={`vm-card ${d.featured ? 'featured' : ''}`}>
                <div className="vm-icon"><i className={`fas ${d.icon}`} /></div>
                <h3>{d.title}</h3><p>{d.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMMES */}
      <section className="section">
        <div className="container">
          <SectionHeader tag="What we do" title="Flagship initiatives"
            text="Integrated solutions showing how climate resilience drives jobs, inclusion and economic growth." />
          <div className="card-grid">
            {PROGRAMMES.slice(0, 6).map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 90} className="card programme-card">
                <div className="card-media">
                  <Slider images={p.images.slice(0, 4)} alt={p.title} />
                  <span className={`badge ${p.color}`}>{p.badge}</span>
                </div>
                <div className="card-body">
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <div className="chips small">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
                  <Link to={`/programmes#${p.id}`} className="link-arrow">Learn more <i className="fas fa-arrow-right" /></Link>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="center"><Link to="/programmes" className="btn btn-outline">See all programmes</Link></div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="section alt">
        <div className="container">
          <SectionHeader tag="Our results" title="Impact pathways" text="Through our initiatives ARHICA creates measurable change across multiple dimensions." />
          <div className="impact-grid">
            {IMPACT.map((it, i) => (
              <Reveal key={it.title} delay={(i % 3) * 80} className="impact-item">
                <div className="impact-icon"><i className={`fas ${it.icon}`} /></div>
                <h4>{it.title}</h4><p>{it.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section className="section">
        <div className="container">
          <SectionHeader tag="Stay informed" title="Stories & news" text="Latest insights, stories and updates from our work across the Lake Victoria Basin." />
          <div className="stories-grid">
            {posts?.slice(0, 3).map((p, i) => <StoryCard key={p.id} post={p} featured={i === 0} />)}
          </div>
          <div className="center"><Link to="/stories" className="btn btn-outline">View all stories</Link></div>
        </div>
      </section>

      {/* EVENTS (only if any upcoming) */}
      {events?.length > 0 && (
        <section className="section alt">
          <div className="container">
            <SectionHeader tag="Join us" title="Upcoming events" />
            <div className="events-grid">{events.map((e) => <EventCard key={e.id} event={e} />)}</div>
            <div className="center"><Link to="/events" className="btn btn-outline">All events</Link></div>
          </div>
        </section>
      )}

      {/* VIDEOS */}
      {featuredVideo && (
        <section className="section dark">
          <div className="container">
            <SectionHeader light tag="Watch & learn" title="Videos & stories" text="See ARHICA's work in action — community stories, field footage and programme highlights." />
            <div className="split video-split">
              <Reveal><VideoPlayer video={featuredVideo} /></Reveal>
              <Reveal delay={100} className="video-copy">
                <span className="tag light">{featuredVideo.category}</span>
                <h3>{featuredVideo.title}</h3>
                <p>{featuredVideo.description}</p>
                <Link to="/videos" className="btn btn-gold">Watch more videos</Link>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta">
        <div className="container center">
          <span className="tag light">Join our mission</span>
          <h2>Partner with us</h2>
          <p>ARHICA invites development partners, donors, the private sector and social investors to build inclusive climate resilience from the heart of Africa.</p>
          <p className="cta-note">Your support empowers youth and vulnerable communities, strengthens the blue economy, advances climate justice and scales locally grounded solutions with global relevance.</p>
          <div className="hero-actions center-actions">
            <Link to="/contact?topic=partner" className="btn btn-white"><i className="fas fa-envelope" /> Get in touch</Link>
            <Link to="/donate" className="btn btn-gold"><i className="fas fa-heart" /> Donate now</Link>
          </div>
        </div>
      </section>
    </>
  );
}
