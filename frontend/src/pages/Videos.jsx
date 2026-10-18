import { useState } from 'react';
import { youtubeId, assetUrl } from '../lib/api';
import { useApi, useDocTitle } from '../lib/hooks';
import { Empty, Img, Loading, PageHero, VideoPlayer } from '../components/ui';

export default function Videos() {
  useDocTitle('Videos');
  const { data, loading } = useApi('/api/videos', []);
  const [active, setActive] = useState(null);
  const current = active || data?.[0];
  const thumb = (v) => v.thumbnail || (v.source === 'youtube' && youtubeId(v.url) ? `https://img.youtube.com/vi/${youtubeId(v.url)}/mqdefault.jpg` : '');

  return (
    <>
      <PageHero label="Watch & learn" title="Videos &" accent="Stories" text="Community stories, field footage and programme highlights." />
      <section className="section dark">
        <div className="container">
          {loading ? <Loading /> : !current ? <Empty icon="fa-film" title="No videos yet" text="New videos are coming soon." /> : (
            <div className="video-layout">
              <div className="video-main">
                <VideoPlayer video={current} key={current.id} />
                <span className="tag light">{current.category}</span>
                <h2>{current.title}</h2>
                <p>{current.description}</p>
              </div>
              <ul className="video-list">
                {data.map((v) => (
                  <li key={v.id}>
                    <button className={v.id === current.id ? 'on' : ''} onClick={() => { setActive(v); window.scrollTo({ top: 200, behavior: 'smooth' }); }}>
                      <span className="vthumb"><Img src={thumb(v)} alt="" /><i className="fas fa-play" /></span>
                      <span><b>{v.title}</b><small>{v.category}</small></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
