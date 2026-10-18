import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmtDate, readTime } from '../lib/api';
import { useApi, useDocTitle } from '../lib/hooks';
import { Empty, Img, Loading, PageHero, Reveal, RichText } from '../components/ui';

export function StoryCard({ post, featured }) {
  return (
    <Reveal as="article" className={`card story-card ${featured ? 'featured' : ''}`}>
      <Link to={`/stories/${post.slug}`} className="card-media">
        <Img src={post.cover} alt={post.title} />
        <span className="badge forest">{post.category}</span>
      </Link>
      <div className="card-body">
        <div className="meta">
          <span><i className="far fa-calendar" /> {fmtDate(post.published_at)}</span>
          <span><i className="far fa-clock" /> {readTime(post.body)} min read</span>
        </div>
        <h3><Link to={`/stories/${post.slug}`}>{post.title}</Link></h3>
        <p>{post.excerpt}</p>
        <Link to={`/stories/${post.slug}`} className="link-arrow">Read story <i className="fas fa-arrow-right" /></Link>
      </div>
    </Reveal>
  );
}

export default function Stories() {
  useDocTitle('Stories & News');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const { data, loading } = useApi(`/api/posts?limit=100${cat ? `&category=${encodeURIComponent(cat)}` : ''}`, []);
  const all = useApi('/api/posts?limit=100', []).data || [];
  const cats = [...new Set(all.map((p) => p.category))];
  const list = (data || []).filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHero label="Stay informed" title="Stories &" accent="News" text="Insights, field stories and updates from ARHICA's work across the Lake Victoria Basin." />
      <section className="section">
        <div className="container">
          <div className="toolbar">
            <div className="filters">
              <button className={!cat ? 'on' : ''} onClick={() => setCat('')}>All</button>
              {cats.map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}
            </div>
            <div className="search"><i className="fas fa-magnifying-glass" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stories…" aria-label="Search stories" /></div>
          </div>
          {loading ? <Loading /> : list.length ? (
            <div className="stories-grid">{list.map((p, i) => <StoryCard key={p.id} post={p} featured={i === 0 && !q && !cat} />)}</div>
          ) : <Empty icon="fa-newspaper" title="No stories found" text="Try a different search or category." />}
        </div>
      </section>
    </>
  );
}

export function StoryDetail() {
  const { slug } = useParams();
  const { data: post, loading, error } = useApi(`/api/posts/${slug}`, null);
  const { data: more } = useApi('/api/posts?limit=4', []);
  useDocTitle(post?.title);

  if (loading) return <div className="container section"><Loading /></div>;
  if (error || !post) return <div className="container section"><Empty icon="fa-circle-question" title="Story not found"><Link to="/stories" className="btn btn-primary">Back to stories</Link></Empty></div>;

  const share = encodeURIComponent(window.location.href);
  return (
    <>
      <PageHero label={post.category} title={post.title} image={post.cover}>
        <div className="meta light"><span><i className="far fa-user" /> {post.author}</span><span><i className="far fa-calendar" /> {fmtDate(post.published_at)}</span><span><i className="far fa-clock" /> {readTime(post.body)} min read</span></div>
      </PageHero>
      <section className="section">
        <div className="container narrow">
          <Link to="/stories" className="back-link"><i className="fas fa-arrow-left" /> All stories</Link>
          {post.excerpt && <p className="lead-quote">{post.excerpt}</p>}
          <RichText text={post.body} />
          <div className="share">
            <b>Share</b>
            <a href={`https://twitter.com/intent/tweet?url=${share}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" aria-label="Share on X"><i className="fa-brands fa-square-x-twitter" /></a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${share}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook"><i className="fab fa-facebook-f" /></a>
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title)}%20${share}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp"><i className="fab fa-whatsapp" /></a>
          </div>
        </div>
      </section>
      {more?.filter((p) => p.id !== post.id).length > 0 && (
        <section className="section alt">
          <div className="container">
            <h2 className="mini-title">Keep reading</h2>
            <div className="stories-grid three">{more.filter((p) => p.id !== post.id).slice(0, 3).map((p) => <StoryCard key={p.id} post={p} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
