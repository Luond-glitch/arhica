import { useCallback, useState } from 'react';
import { assetUrl } from '../lib/api';
import { useApi, useDocTitle } from '../lib/hooks';
import { Empty, Img, Lightbox, Loading, PageHero } from '../components/ui';

export default function Gallery() {
  useDocTitle('Gallery');
  const [album, setAlbum] = useState('');
  const [idx, setIdx] = useState(null);
  const { data, loading } = useApi(`/api/media?gallery=1${album ? `&album=${encodeURIComponent(album)}` : ''}`, { items: [], albums: [] });
  const items = (data.items || []).filter((m) => m.kind !== 'document');
  const nav = useCallback((d) => setIdx((i) => (i + d + items.length) % items.length), [items.length]);

  return (
    <>
      <PageHero label="Moments" title="Photo & video" accent="Gallery" text="A look at life across our programmes, communities and events." />
      <section className="section">
        <div className="container">
          {data.albums?.length > 1 && (
            <div className="filters center-filters">
              <button className={!album ? 'on' : ''} onClick={() => setAlbum('')}>All</button>
              {data.albums.map((a) => <button key={a} className={album === a ? 'on' : ''} onClick={() => setAlbum(a)}>{a}</button>)}
            </div>
          )}
          {loading ? <Loading /> : items.length ? (
            <div className="masonry">
              {items.map((m, i) => (
                <button key={m.id} className="m-item" onClick={() => setIdx(i)} aria-label={m.caption || 'Open'}>
                  <Img src={m.thumb || m.url} alt={m.caption || m.album} />
                  {m.kind === 'video' && <span className="play"><i className="fas fa-play" /></span>}
                  {m.caption && <span className="cap">{m.caption}</span>}
                </button>
              ))}
            </div>
          ) : <Empty icon="fa-images" title="The gallery is empty" text="Photos and videos uploaded by the team will appear here." />}
        </div>
      </section>
      {idx !== null && <Lightbox items={items} index={idx} onClose={() => setIdx(null)} onNav={nav} />}
    </>
  );
}
