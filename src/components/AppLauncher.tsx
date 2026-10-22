import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FlaskConical, Gamepad2, Music, Library, Heart, ArrowRight, Crown } from 'lucide-react';
import { InflatedCushionIcon } from '@/components/WhoopeeCushionArt';
import { fetchTopScores } from '@/lib/leaderboard';
import { FART_PRESETS } from '@/lib/fart-matching';
import { ResearchModal } from '@/components/ResearchModal';

const QUOTES: [string, string][] = [
  ['I toot, therefore I am.', 'René Descartes'],
  ['To hold it in is human; to let it rip is divine.', 'Alexander Pope'],
  ['Two roads diverged in a wood, and I took the one that rattled the leaves.', 'Robert Frost'],
  ['Be the rumble you wish to see in the world.', 'Mahatma Gandhi'],
  ['An unexamined toot is not worth letting.', 'Socrates'],
  ['In the middle of difficulty lies flatulence.', 'Albert Einstein'],
  ['Give me liberty, or give me a bathroom.', 'Patrick Henry'],
  ['To rip, or not to rip: that is the question.', 'William Shakespeare'],
  ['Speak softly and carry a powerful cheek.', 'Theodore Roosevelt'],
  ['Stay hungry. Stay foolish. Avoid the broccoli.', 'Steve Jobs'],
  ['We choose to toot not because it is easy, but because it is loud.', 'John F. Kennedy'],
  ['Not all those who rumble are lost.', 'J.R.R. Tolkien'],
  ['It always seems impossible until it is passed.', 'Nelson Mandela'],
  ['The journey of a thousand miles begins with a single squeak.', 'Lao Tzu'],
];

export function AppLauncher() {
  const [best, setBest] = useState<number | null>(null);
  const [qi, setQi] = useState(0);
  useEffect(() => {
    setQi(Math.floor(Math.random() * QUOTES.length));
    fetchTopScores('score', 1).then((r) => setBest(r[0]?.score ?? null)).catch(() => {});
  }, []);
  const apps = [
    { to: '/flappy-cheeks', name: 'Flappy Cheeks', tag: best !== null ? `Record: ${best}` : 'Arcade game', tile: <Gamepad2 size={26} strokeWidth={2.2} />, tone: 'tile-flappy' },
    { to: '/ensemble', name: 'Wind Ensemble', tag: 'Compose songs', tile: <Music size={26} strokeWidth={2.2} />, tone: 'tile-ensemble' },
    { to: '/library', name: 'Sound Library', tag: `${FART_PRESETS.length} recordings`, tile: <Library size={26} strokeWidth={2.2} />, tone: 'tile-library' },
    { to: '/my-sounds', name: 'My Sounds', tag: 'Your favorites', tile: <Heart size={26} strokeWidth={2.2} />, tone: 'tile-mine' },
    { to: '/whoopee-cushion', name: 'Whoopee Cushion', tag: 'Prank a friend', tile: <InflatedCushionIcon className="tile-cushion" />, tone: 'tile-bomb' },
    { to: '/royale', name: 'Fart Royale', tag: 'Battle for the crown', tile: <Crown size={26} strokeWidth={2.2} />, tone: 'tile-royale' },
  ] as const;
  return (
    <main className="launcher">
      <section className="launcher-hero">
        <span className="eyebrow">WELCOME</span>
        <h1>The Internet’s Most Unnecessary Sound Lab</h1>
        <p className="launcher-sub">Pick an app.</p>
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
        {apps.map(({ to, name, tag, tile, tone }) => (
          <Link key={to} to={to} className="app-card">
            <span className={`app-tile ${tone}`}>{tile}</span>
            <span className="app-name">{name}</span>
            <span className="app-tag">{tag}</span>
          </Link>
        ))}
      </nav>
      <figure className="quote-card">
        <span className="eyebrow">QUOTE OF THE DAY</span>
        <button type="button" className="quote-body" onClick={() => setQi((i) => (i + 1) % QUOTES.length)} aria-label="Show another quote">
          <blockquote>“{QUOTES[qi][0]}”</blockquote>
          <figcaption>— {QUOTES[qi][1]}</figcaption>
        </button>
      </figure>
      <div className="launcher-fund"><ResearchModal /></div>
    </main>
  );
}
