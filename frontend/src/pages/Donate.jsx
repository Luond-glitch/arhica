import { useState } from 'react';
import { SITE } from '../data/site';
import { api } from '../lib/api';
import { useDocTitle } from '../lib/hooks';
import { PageHero, Reveal, SectionHeader } from '../components/ui';

const PRESETS = [500, 1000, 2500, 5000, 10000];
const IMPACT = [
  ['KES 500+', 'funds community climate awareness sessions'],
  ['KES 2,500+', 'supports youth-led climate resilience projects'],
  ['KES 10,000+', 'empowers women groups with sustainable livelihood tools'],
];

export default function Donate() {
  useDocTitle('Donate');
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState(false);
  const [f, setF] = useState({ fullName: '', email: '', phone: '', donationType: 'one-time', message: '' });
  const [state, setState] = useState({ busy: false, done: null, err: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, done: null, err: '' });
    try {
      await api.post('/api/donations', { ...f, amount: Number(amount) }, { auth: false });
      setState({ busy: false, done: { name: f.fullName.split(' ')[0], amount }, err: '' });
      setF({ fullName: '', email: '', phone: '', donationType: 'one-time', message: '' });
    } catch (err) { setState({ busy: false, done: null, err: err.message }); }
  };

  return (
    <>
      <PageHero label="Lake Victoria Basin, Kenya" title="Fuel" accent="Climate Resilience"
        text="Your support directly empowers youth, women and vulnerable communities to lead inclusive climate action across East Africa.">
        <div className="hero-actions center-actions"><a href="#donate" className="btn btn-gold"><i className="fas fa-hand-holding-heart" /> Donate now</a><a href="#how-to-pay" className="btn btn-ghost">How to pay</a></div>
      </PageHero>

      <section className="section" id="how-to-pay">
        <div className="container">
          <SectionHeader tag="Payment methods" title="Simple, secure mobile giving" text="Use any Kenyan mobile money service to donate in minutes. No registration required." />
          <Reveal className="paybill">
            <div><h3>{SITE.full}s</h3><p>Official registered Paybill — accepted on all major networks</p></div>
            <div className="paybill-codes">
              <div><small>Paybill number</small><b>{SITE.paybill}</b></div>
              <div><small>Account number</small><b>{SITE.account}</b></div>
            </div>
          </Reveal>
          <div className="card-grid three">
            {[['fa-wifi', 'M-Pesa Paybill', 'The most popular mobile money platform in Kenya. Use Lipa na M-Pesa.'],
              ['fa-signal', 'Airtel Money', 'Airtel subscribers can send via Paybill using the same details.'],
              ['fa-tower-cell', 'T-Kash by Telkom', 'Dial *334# on Telkom and navigate to Paybill to complete your gift.']].map(([ic, t, d], i) => (
              <Reveal key={t} delay={i * 90} className="card method"><span className="dept-icon forest"><i className={`fas ${ic}`} /></span><h4>{t}</h4><p>{d}</p><code>Paybill {SITE.paybill} · Acc {SITE.account}</code></Reveal>
            ))}
          </div>
          <ol className="steps">
            <li><b>Open M-Pesa</b><span>Lipa na M-Pesa → Paybill</span></li>
            <li><b>Enter Paybill</b><span>Business number: <strong>{SITE.paybill}</strong></span></li>
            <li><b>Account number</b><span>Enter: <strong>{SITE.account}</strong></span></li>
            <li><b>Confirm amount</b><span>Enter your amount and confirm with PIN</span></li>
          </ol>
        </div>
      </section>

      <section className="section dark" id="donate">
        <div className="container donate-layout">
          <Reveal className="donate-copy">
            <span className="tag light">Make a difference</span>
            <h2>Every shilling counts</h2>
            <p>Tell us about your gift and we'll be notified right away. Then complete payment via M-Pesa to finalise your donation.</p>
            <ul className="impact-points">
              {IMPACT.map(([a, t]) => <li key={a}><b>{a}</b> {t}</li>)}
            </ul>
          </Reveal>
          <Reveal delay={100} className="form-card">
            <h3>Donation intent form</h3>
            <p className="muted">Submit your intent, then complete payment via mobile money.</p>
            {state.done ? (
              <div className="success-box">
                <i className="fas fa-circle-check" />
                <h4>Thank you, {state.done.name}!</h4>
                <p>Your intent of <b>KES {Number(state.done.amount).toLocaleString()}</b> is recorded. Complete payment via M-Pesa to finalise.</p>
                <code>Paybill {SITE.paybill} · Acc {SITE.account}</code>
                <button className="btn btn-outline" onClick={() => setState({ busy: false, done: null, err: '' })}>Make another gift</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label>Full name *<input required value={f.fullName} onChange={set('fullName')} placeholder="Your full name" /></label>
                <label>Email *<input required type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" /></label>
                <label>Phone *<input required type="tel" value={f.phone} onChange={set('phone')} placeholder="+2547XXXXXXXX" /></label>
                <fieldset>
                  <legend>Amount (KES) *</legend>
                  <div className="amounts">
                    {PRESETS.map((p) => <button type="button" key={p} className={!custom && amount === p ? 'on' : ''} onClick={() => { setCustom(false); setAmount(p); }}>KES {p.toLocaleString()}</button>)}
                    <button type="button" className={custom ? 'on' : ''} onClick={() => { setCustom(true); setAmount(''); }}>Other</button>
                  </div>
                  {custom && <input type="number" min="10" required autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount (min. 10)" />}
                </fieldset>
                <label>Donation type
                  <select value={f.donationType} onChange={set('donationType')}>
                    <option value="one-time">One-time donation</option><option value="monthly">Monthly giving</option><option value="corporate">Corporate / in-kind</option>
                  </select>
                </label>
                <label>Message (optional)<textarea rows="3" value={f.message} onChange={set('message')} placeholder="A message of support…" /></label>
                {state.err && <div className="form-msg err">{state.err}</div>}
                <button className="btn btn-primary block" disabled={state.busy}>{state.busy ? <span className="spinner sm" /> : <i className="fas fa-heart" />} Complete donation intent</button>
                <small className="secure"><i className="fas fa-lock" /> Payment completes via M-Pesa {SITE.paybill}.</small>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
