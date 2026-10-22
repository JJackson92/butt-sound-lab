import { useState } from 'react';
import { FlaskConical, Heart, Stamp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

export const KOFI_URL = 'https://ko-fi.com/actionjjackson';

const PERKS = [
  'A box of acoustic chalk and earplugs',
  'A fresh anti-odor nasal filter',
  'Dark roast coffee for the lab technician',
  'A 74 Hz tuning fork for brap calibration',
  'A high-speed turbulence sensor',
  'A double-reinforced blast cushion',
  'A resonance chamber maintenance kit',
  'A high-fidelity pressure transducer',
  'A hazardous gas containment unit',
  'Principal Gastro-Acoustic Investigator status and eternal glory',
];

export function ResearchModal({ onOpen }: { onOpen?: () => void }) {
  const [amount, setAmount] = useState(5);
  const [monthly, setMonthly] = useState(true);
  const [stamped, setStamped] = useState(false);
  return (
    <Dialog onOpenChange={(o) => { if (o) onOpen?.(); else setStamped(false); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="research-btn"><FlaskConical size={15} /> Fund Research</Button>
      </DialogTrigger>
      <DialogContent className="research-modal">
        <DialogHeader>
          <DialogTitle>Gastro-Acoustic Research Fellowship</DialogTitle>
          <DialogDescription>Help keep the lab running, the servers humming and the recordings rolling.</DialogDescription>
        </DialogHeader>
        <div className="research-toggle" role="group" aria-label="Donation type">
          <Button size="sm" variant={monthly ? 'default' : 'outline'} onClick={() => setMonthly(true)}>Monthly</Button>
          <Button size="sm" variant={!monthly ? 'default' : 'outline'} onClick={() => setMonthly(false)}>One-time</Button>
        </div>
        <div className="research-amount">${amount}{monthly && <small>/month</small>}</div>
        <Slider min={1} max={10} step={1} value={[amount]} onValueChange={(v) => setAmount(v[0])} aria-label="Donation amount" />
        <div className="research-scale"><span>$1</span><span>$10</span></div>
        <p className="research-perk"><strong>Your grant funds:</strong> {PERKS[amount - 1]}</p>
        <Button asChild size="lg" className="research-cta">
          <a href={KOFI_URL} target="_blank" rel="noopener noreferrer"><Heart size={17} /> Support ${amount}{monthly ? '/mo' : ''} on Ko-fi</a>
        </Button>
        <p className="research-cause">10% of all donations go to <strong>The Anal Cancer Foundation</strong>&nbsp;(seriously)</p>
        <p className="research-note">On Ko-fi, enter ${amount}{monthly ? ' and tick "Make this monthly"' : ''}.</p>
        <Button variant="ghost" size="sm" onClick={() => setStamped(true)}><Stamp size={15} /> Print tax deduction certificate</Button>
        {stamped && <div className="research-stamp">OFFICIALLY DENIED<br /><small>Not tax deductible. Deeply appreciated.</small></div>}
      </DialogContent>
    </Dialog>
  );
}
