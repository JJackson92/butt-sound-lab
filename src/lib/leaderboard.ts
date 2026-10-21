// Flappy Cheeks global leaderboard, stored in Lovable Cloud.
// Anyone can read the board and submit a score; no account needed.
import { supabase } from "@/integrations/supabase/client";

export type LeaderboardEntry = {
  id: string;
  name: string;
  country: string;
  score: number;
  created_at: string;
};

export async function fetchTopScores(limit = 20): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("flappy_scores")
    .select("id, name, country, score, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function submitScore(name: string, country: string, score: number): Promise<void> {
  const clean = name.trim().slice(0, 24);
  if (!clean) throw new Error("Name is required");
  const { error } = await supabase.from("flappy_scores").insert({ name: clean, country, score });
  if (error) throw error;
}

// Compact country list with flags; the picker defaults to the browser's region.
export const COUNTRIES: { code: string; flag: string; label: string }[] = [
  { code: "US", flag: "🇺🇸", label: "United States" },
  { code: "GB", flag: "🇬🇧", label: "United Kingdom" },
  { code: "CA", flag: "🇨🇦", label: "Canada" },
  { code: "AU", flag: "🇦🇺", label: "Australia" },
  { code: "DE", flag: "🇩🇪", label: "Germany" },
  { code: "FR", flag: "🇫🇷", label: "France" },
  { code: "ES", flag: "🇪🇸", label: "Spain" },
  { code: "IT", flag: "🇮🇹", label: "Italy" },
  { code: "NL", flag: "🇳🇱", label: "Netherlands" },
  { code: "BE", flag: "🇧🇪", label: "Belgium" },
  { code: "SE", flag: "🇸🇪", label: "Sweden" },
  { code: "NO", flag: "🇳🇴", label: "Norway" },
  { code: "DK", flag: "🇩🇰", label: "Denmark" },
  { code: "FI", flag: "🇫🇮", label: "Finland" },
  { code: "IE", flag: "🇮🇪", label: "Ireland" },
  { code: "PT", flag: "🇵🇹", label: "Portugal" },
  { code: "PL", flag: "🇵🇱", label: "Poland" },
  { code: "BR", flag: "🇧🇷", label: "Brazil" },
  { code: "MX", flag: "🇲🇽", label: "Mexico" },
  { code: "AR", flag: "🇦🇷", label: "Argentina" },
  { code: "JP", flag: "🇯🇵", label: "Japan" },
  { code: "KR", flag: "🇰🇷", label: "South Korea" },
  { code: "IN", flag: "🇮🇳", label: "India" },
  { code: "NZ", flag: "🇳🇿", label: "New Zealand" },
  { code: "ZA", flag: "🇿🇦", label: "South Africa" },
  { code: "TR", flag: "🇹🇷", label: "Türkiye" },
  { code: "CH", flag: "🇨🇭", label: "Switzerland" },
  { code: "AT", flag: "🇦🇹", label: "Austria" },
  { code: "CZ", flag: "🇨🇿", label: "Czechia" },
  { code: "GR", flag: "🇬🇷", label: "Greece" },
];

export function flagFor(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.flag ?? "🏳️";
}

export function guessCountry(): string {
  try {
    const region = new Intl.Locale(navigator.language).region;
    return region && COUNTRIES.some((c) => c.code === region) ? region : "US";
  } catch {
    return "US";
  }
}
