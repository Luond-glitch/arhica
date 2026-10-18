import { useState } from 'react';
import { fmtDate } from '../lib/api';
import { useApi, useDocTitle } from '../lib/hooks';
import { Empty, Img, Loading, PageHero, Reveal } from '../components/ui';

export function EventCard({ event }) {
  const d = event.start_date ? new Date(event.start_date) : null;
  return (
    <Reveal as="article" className="card event-card">
      <div className="card-media">
        <Img src={event.cover} alt={event.title} />
        {d && !isNaN(d) && <div className="date-chip"><b>{d.getDate()}</b><span>{d.toLocaleString('en-GB', { month: 'short' })}</span></div>}
      </div>
      <div className="card-body">
        <h3>{event.title}</h3>
        <div className="meta">
          {event.start_date && <span><i className="far fa-calendar" /> {fmtDate(event.start_date)}{event.end_date && event.end_date !== event.start_date ? ` – ${fmtDate(event.end_date)}` : ''}</span>}
          {event.location && <span><i className="fas fa-location-dot" /> {event.location}</span>}
        </div>
        <p>{event.description}</p>
        {event.link && <a className="link-arrow" href={event.link} target="_blank" rel="noreferrer">Details & RSVP <i className="fas fa-arrow-up-right-from-square" /></a>}
      </div>
    </Reveal>
  );
}

export default function Events() {
  useDocTitle('Events');
  const [when, setWhen] = useState('upcoming');
  const { data, loading } = useApi(`/api/events?when=${when}`, []);
  return (
    <>
      <PageHero label="Get involved" title="Events &" accent="Gatherings" text="Workshops, community drives, launches and learning exchanges across the Lake Victoria Basin." />
      <section className="section">
        <div className="container">
          <div className="toolbar">
            <div className="filters">
              <button className={when === 'upcoming' ? 'on' : ''} onClick={() => setWhen('upcoming')}>Upcoming</button>
              <button className={when === 'past' ? 'on' : ''} onClick={() => setWhen('past')}>Past events</button>
            </div>
          </div>
          {loading ? <Loading /> : data.length ? <div className="events-grid">{data.map((e) => <EventCard key={e.id} event={e} />)}</div>
            : <Empty icon="fa-calendar-days" title={`No ${when} events`} text="Check back soon, or subscribe to our newsletter to hear first." />}
        </div>
      </section>
    </>
  );
}
