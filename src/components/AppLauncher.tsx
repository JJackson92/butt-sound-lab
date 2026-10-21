import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FlaskConical, Gamepad2, Music, Library, Heart, Zap } from 'lucide-react';
import { fetchTopScores } from '@/lib/leaderboard';
import { FART_PRESETS } from '@/lib/fart-matching';

const APPS = [
  { to: '/lab', name: 'Fart Lab', tag: 'Build your own', Icon: FlaskConical, tone: 'tile-lab' },
  { to: '/flappy-cheeks', name: 'Flappy Cheeks', tag: 'Arcade game', Icon: Gamepad2, tone: 'tile-flappy' },
  { to: '/ensemble', name: 'Wind Ensemble', tag: 'Compose songs', Icon: Music, tone: 'tile-ensemble' },
  { to: '/library', name: 'Sound Library', tag: 'Real recordings', Icon: Library, tone: 'tile-library' },
  { to: '/my-sounds', name: 'My Sounds', tag: 'Your favorites', Icon: Heart, tone: 'tile-mine' },
] as const;

export function AppLauncher() {
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => {
    fetchTopScores('score', 1).then((r) => setBest(r[0]?.score ?? null)).catch(() => {});
  }, []);
  return (
    <main className="launcher">
      <section className="launcher-hero">
        <span className="eyebrow">THE INTERNET’S MOST UNNECESSARY SOUND LAB</span>
        <h1>BUTT SOUNDS</h1>
        <p>Pick an app. Proceed at your own risk.</p>
        <div className="launcher-stats">
          <span>🔊 {FART_PRESETS.length} real recordings</span>
          {best !== null && <span>🏆 Flappy record: {best}</span>}
        </div>
      </section>
      <nav className="app-grid" aria-label="Apps">
        {APPS.map(({ to, name, tag, Icon, tone }) => (
          <Link key={to} to={to} className="app-tile-wrap">
            <span className={`app-tile ${tone}`}><Icon size={40} strokeWidth={2.2} /></span>
            <span className="app-name">{name}</span>
            <span className="app-tag">{tag}</span>
          </Link>
        ))}
      </nav>
      <Link to="/lab" className="instant-rip"><Zap size={18} /> Instant Rip — open the Lab</Link>
    </main>
  );
}
