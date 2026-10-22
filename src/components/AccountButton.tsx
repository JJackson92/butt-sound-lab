import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { syncSounds } from '@/lib/guest-sounds';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UserRound, LogOut, Mail } from 'lucide-react';

export function AccountButton({ onOpen }: { onOpen?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { const u = data.session?.user ?? null; setUser(u); if (u) void syncSounds(u.id); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session) { setOpen(false); void syncSounds(session.user.id); }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const google = async () => {
    setBusy(true); setMsg('');
    const r = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
    if (r.error) setMsg('Google sign-in failed. Try again.');
    setBusy(false);
  };
  const magic = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg('');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setMsg(error ? error.message : 'Check your inbox for a sign-in link 💨');
    setBusy(false);
  };

  if (user) return (
    <button type="button" className="account-btn" onClick={() => supabase.auth.signOut()} title={`Signed in as ${user.email}`}>
      <LogOut size={14} /> Sign out
    </button>
  );

  return <>
    <button type="button" className="account-btn" onClick={() => { onOpen?.(); setOpen(true); }}><UserRound size={14} /> Sign in</button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sync your sounds</DialogTitle>
          <DialogDescription>Totally optional. Sign in to keep your saved farts on every device.</DialogDescription>
        </DialogHeader>
        <Button onClick={google} disabled={busy} variant="outline" className="w-full">Continue with Google</Button>
        <div className="text-center text-xs text-muted-foreground">or get a link by email</div>
        <form onSubmit={magic} className="flex gap-2">
          <Input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <Button type="submit" disabled={busy}><Mail size={15} /></Button>
        </form>
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      </DialogContent>
    </Dialog>
  </>;
}
