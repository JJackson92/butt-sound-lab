import { validateCreation, encodeCreation, type Creation } from './creations';
import { supabase } from '@/integrations/supabase/client';
const KEY = 'buttsounds.favorites.v1';

// Local storage is always the source the UI reads; when signed in, changes mirror to the cloud.
export function readSounds(): Creation[] { try { const data = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(data) ? data.map(validateCreation).filter((c): c is Creation => c !== null).slice(0,100) : []; } catch { return []; } }
function writeSounds(sounds: Creation[]) { localStorage.setItem(KEY, JSON.stringify(sounds.slice(0,100))); window.dispatchEvent(new Event('sounds-updated')); }

async function currentUserId() { const { data } = await supabase.auth.getSession(); return data.session?.user.id ?? null; }

export function saveSound(c: Creation) {
  const valid = validateCreation(c); if (!valid) throw new Error('Give your masterpiece a valid name first.');
  const key = encodeCreation(valid);
  writeSounds([valid, ...readSounds().filter(s => encodeCreation(s) !== key)]);
  void currentUserId().then(uid => uid && supabase.from('saved_sounds').upsert({ user_id: uid, sound_key: key, data: valid as never }));
}
export function removeSound(c: Creation) {
  const key = encodeCreation(c);
  writeSounds(readSounds().filter(s => encodeCreation(s) !== key));
  void currentUserId().then(uid => uid && supabase.from('saved_sounds').delete().eq('user_id', uid).eq('sound_key', key));
}

/** Merge local and cloud libraries after sign-in: upload local-only sounds, pull cloud-only ones. */
export async function syncSounds(uid: string) {
  const local = readSounds();
  if (local.length) await supabase.from('saved_sounds').upsert(local.map(s => ({ user_id: uid, sound_key: encodeCreation(s), data: s as never })), { ignoreDuplicates: true });
  const { data } = await supabase.from('saved_sounds').select('sound_key,data').eq('user_id', uid).order('created_at', { ascending: false }).limit(100);
  const seen = new Set(local.map(encodeCreation));
  const cloud = (data ?? []).map(r => validateCreation(r.data)).filter((c): c is Creation => c !== null && !seen.has(encodeCreation(c)));
  writeSounds([...local, ...cloud]);
}

export async function shareSound(c: Creation) { const url = `${location.origin}/fart/${encodeCreation(c)}`; if(navigator.share) { try { await navigator.share({title:c.name,text:'Spread the stink.',url}); return 'Shared!'; } catch(e) { if((e as DOMException).name === 'AbortError') return ''; } } try { await navigator.clipboard.writeText(url); return 'Link copied. Spread the stink.'; } catch { return url; } }
