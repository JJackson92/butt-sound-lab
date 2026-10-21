import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FlaskConical, Gamepad2, Music, Library, Heart, ArrowRight } from 'lucide-react';
import { fetchTopScores } from '@/lib/leaderboard';
import { FART_PRESETS } from '@/lib/fart-matching';

export function AppLauncher() {
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => {
    fetchTopScores('score', 1).then((r) => setBest(r[0]?.score ?? null)).catch(() => {});
  }, []);
  const apps = [
    { to: '/flappy-cheeks', name: 'Flappy Cheeks', tag: best !== null ? `Record: ${best}` : 'Arcade game', Icon: Gamepad2, tone: 'tile-flappy' },
    { to: '/ensemble', name: 'Wind Ensemble', tag: 'Compose songs', Icon: Music, tone: 'tile-ensemble' },
    { to: '/library', name: 'Sound Library', tag: `${FART_PRESETS.length} recordings`, Icon: Library, tone: 'tile-library' },
    { to: '/my-sounds', name: 'My Sounds', tag: 'Your favorites', Icon: Heart, tone: 'tile-mine' },
  ] as const;
  return (
    <main className="launcher">
      <section className="launcher-hero">
        <span className="eyebrow">THE INTERNET’S MOST UNNECESSARY SOUND LAB</span>
        <h1>Pick an app.</h1>
      </section>
      <Link to="/lab" className="launch-feature">
        <span className="app-tile tile-lab"><FlaskConical size={34} strokeWidth={2.2} /></span>
        <span className="launch-feature-text">
          <strong>Fart Lab</strong>
          <small>Build, play and share your own sound</small>
        </span>
        <ArrowRight className="launch-arrow" size={22} />
      </Link>
      <nav className="app-grid" aria-label="Apps">
        {apps.map(({ to, name, tag, Icon, tone }) => (
          <Link key={to} to={to} className="app-card">
            <span className={`app-tile ${tone}`}><Icon size={26} strokeWidth={2.2} /></span>
            <span className="app-name">{name}</span>
            <span className="app-tag">{tag}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
