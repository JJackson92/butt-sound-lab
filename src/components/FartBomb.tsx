import { useEffect, useRef, useState } from 'react';
import { loadManifest, type FartAudioEntry } from '@/lib/fart-audio';
import { FART_PRESETS } from '@/lib/fart-matching';
import { readSounds } from '@/lib/guest-sounds';
import { renderCreation, playRendered } from '@/lib/audio-render';
import { getAudioContext } from '@/lib/fart-reverb';
import type { Creation } from '@/lib/creations';

const TIMES = [10, 30, 60, 120];
type Disguise = 'black' | 'battery' | 'update';
type Phase = 'setup' | 'armed' | 'boom';
const AFTERMATH = [
  'Target has been compromised.',
  'Nearby witnesses relocating.',
  'Friendship status: under review.',
  'Air quality alert issued for this room.',
  'Suspect has fled the scene.',
];

export function FartBomb() {
  const [manifest, setManifest] = useState<Record<string, FartAudioEntry> | null>(null);
  const [sound, setSound] = useState('random');
  const [secs, setSecs] = useState(10);
  const [disguise, setDisguise] = useState<Disguise>('black');
  const [phase, setPhase] = useState<Phase>('setup');
  const [left, setLeft] = useState(0);
  const [played, setPlayed] = useState('');
  const [headline, setHeadline] = useState(AFTERMATH[0]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number | null>(null);
  const taps = useRef<number[]>([]);
  const buffer = useRef<AudioBuffer | null>(null);
  const [favs, setFavs] = useState<Creation[]>([]);

  useEffect(() => { loadManifest().then(setManifest).catch(() => {}); setFavs(readSounds()); return () => { if (timer.current) clearInterval(timer.current); }; }, []);

  const pickId = () => {
    if (sound !== 'random') return sound;
    const ids = FART_PRESETS.map((p) => p.id).filter((id) => manifest?.[id]);
    return ids[Math.floor(Math.random() * ids.length)];
  };

  const finish = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    setHeadline(AFTERMATH[Math.floor(Math.random() * AFTERMATH.length)]);
    setPhase((p) => (p === 'armed' ? 'boom' : p));
  };

  const arm = () => {
    const fav = sound.startsWith('fav:') ? favs[Number(sound.slice(4))] : null;
    const id = fav ? fav.presetId : pickId();
    const url = id && (!fav || fav.source === 'recording') ? manifest?.[id]?.preview : undefined;
    audio.current = null; buffer.current = null;
    if (url) {
      // Unlock audio during the tap so phones allow it to play later.
      const a = new Audio(url);
      a.volume = 0; a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
      audio.current = a;
      setPlayed(fav?.name ?? FART_PRESETS.find((p) => p.id === id)?.name ?? 'Mystery');
    } else if (fav) {
      getAudioContext();
      renderCreation(fav).then((b) => { buffer.current = b; }).catch(() => {});
      setPlayed(fav.name);
    } else return;
    setLeft(secs); setPhase('armed');
    const end = Date.now() + secs * 1000;
    timer.current = window.setInterval(() => {
      const r = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(r);
      if (r <= 0) {
        clearInterval(timer.current!);
        // Keep the disguise up until the fart has finished playing.
        timer.current = window.setTimeout(finish, 20000);
        const s = audio.current;
        if (s) { s.volume = 1; s.currentTime = 0; s.onended = finish; s.play().catch(finish); }
        else if (buffer.current) playRendered(buffer.current, () => {}, finish);
        else finish();
      }
    }, 200);
  };

  const disarm = () => { if (timer.current) { clearInterval(timer.current); clearTimeout(timer.current); } if (audio.current) audio.current.onended = null; timer.current = null; audio.current?.pause(); setPhase('setup'); };

  // Triple-tap the disguise screen to quietly cancel.
  const stealthTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 800), now];
    if (taps.current.length >= 3) { taps.current = []; disarm(); }
  };

  if (phase === 'armed') {
    return (
      <div className={`bomb-stealth bomb-${disguise}`} onClick={stealthTap} role="button" aria-label="Triple tap to cancel">
        {disguise === 'battery' && <div className="bomb-fake"><div className="bomb-batt"><i /></div><p>Battery 1%</p><small>Connect to power</small></div>}
        {disguise === 'update' && <div className="bomb-fake"><div className="bomb-spin" /><p>Installing update…</p><small>Do not turn off your phone</small></div>}
        <span className="bomb-secret">{left}</span>
      </div>
    );
  }

  if (phase === 'boom') {
    return (
      <section className="bomb-card bomb-boom">
        <div className="bomb-emoji">💥</div>
        <h2>DETONATION SUCCESSFUL</h2>
        <p>{headline}</p>
        <small>Sound used: {played}</small>
        <div className="bomb-actions">
          <button className="rip-button bomb-go" onClick={arm}>RE-ARM <span>💣</span></button>
          <button className="bomb-link" onClick={() => setPhase('setup')}>Change settings</button>
        </div>
      </section>
    );
  }

  return (
    <section className="bomb-card">
      <p className="bomb-steps">1. Pick a sound · 2. Set the timer · 3. Hide your phone near a friend · 4. Walk away</p>
      <label className="select-label">Sound
        <select value={sound.startsWith('fav:') ? 'random' : sound} onChange={(e) => setSound(e.target.value)}>
          <option value="random">🎲 Russian Roulette (random)</option>
          <optgroup label="Recordings">
            {FART_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </optgroup>
        </select>
      </label>
      <label className="select-label">Favorites
        <select value={sound.startsWith('fav:') ? sound : ''} onChange={(e) => setSound(e.target.value || 'random')} disabled={!favs.length}>
          <option value="">{favs.length ? '— Pick one of your saved sounds —' : 'No saved sounds yet'}</option>
          {favs.map((f, i) => <option key={i} value={`fav:${i}`}>💾 {f.name}</option>)}
        </select>
      </label>
      <h3 className="bomb-h">Timer</h3>
      <div className="bomb-chips">
        {TIMES.map((t) => <button key={t} className={secs === t ? 'on' : ''} onClick={() => setSecs(t)}>{t < 60 ? `${t}s` : `${t / 60} min`}</button>)}
      </div>
      <h3 className="bomb-h">Disguise screen</h3>
      <div className="bomb-chips">
        {([['black', '⬛ Screen off'], ['battery', '🪫 Low battery'], ['update', '⚙️ Updating']] as const).map(([k, l]) => (
          <button key={k} className={disguise === k ? 'on' : ''} onClick={() => setDisguise(k)}>{l}</button>
        ))}
      </div>
      <p className="bomb-tip">Turn your volume all the way up. Tap the disguise screen 3 times fast to cancel.</p>
      <button className="rip-button bomb-go" onClick={arm} disabled={!manifest}>{manifest ? 'ARM THE BOMB' : 'LOADING…'} <span>💣</span></button>
    </section>
  );
}
