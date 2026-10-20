# Assigns each funny preset name to the recording whose measurements fit its words best.
import json,re
import numpy as np
from scipy.optimize import linear_sum_assignment
A=json.load(open('src/lib/fart-acoustics.json'))
names=[n for _,n in re.findall(r'"id":\s*"(p\d+)",\s*"name":\s*"([^"]+)"',open('src/lib/fart-presets.ts').read())]
ids=sorted(A)
def cl(x):return max(0,min(1,x))
def feat(p):
    pitch=p['pitchHz'] or 0
    airy=p['tonality']<0.4  # same rule as classifyRecording
    squeak=(not airy) and pitch>=250
    wet=cl(cl((p['variation']-.25)/.5)*.7+cl(p['flatness']/.15)*.3)
    return dict(high=1.0 if squeak else 0.0, low=1.0 if (not airy and not squeak and pitch<180) else 0.0,
      airy=1.0 if airy else 0.0, wet=wet, loud=cl((p['rms']-.04)/.22), long=cl((p['activeDuration']-.2)/1.3),
      choppy=cl((p['variation']-.2)/.6))
F={i:feat(A[i]) for i in ids}
K={'high':'squeak screech whistl chirp mouse kazoo trumpet duck quack balloon peep tickl toot whoopee'.split(),
 'low':'thunder tuba boom bellow rumbl earthquake foghorn roar submarine bagpipe muffled croak bark diesel motorcycle lawnmower helicopter brap'.split(),
 'airy':'silent whisper hiss velvet whoosh wheeze breez puff air blast steam'.split(),
 'wet':'wet splatter bubbl gurgl soggy frothy sputter slip flap slap'.split(),
 'loud':'thunder boom roar blast air horn earthquake booming bellow ripper machine echo cathedral'.split(),
 'quiet':'silent whisper velvet muffled tickl'.split(),
 'long':'bagpipe train lawnmower helicopter drumroll submarine bellow roar earthquake engine'.split(),
 'short':'pop snap tap crisp burst bark toot snort'.split(),
 'choppy':'machine drumroll stutter crackl sputter rip triple popping buzz'.split(),
 'dry':'dry crisp gravelly'.split()}
def target(n):
    s=n.lower();t={}
    for k,ws in K.items():t[k]=sum(s.count(w) for w in ws)
    return t
C=np.zeros((len(names),len(ids)))
for a,n in enumerate(names):
    t=target(n)
    for b,i in enumerate(ids):
        f=F[i];c=0
        for k in ('high','low','airy'):c-= 3*t[k]*f[k]
        c-=2*t['wet']*f['wet']; c-=2*t['dry']*(1-f['wet'])
        c-=1.5*t['loud']*f['loud']; c-=1.5*t['quiet']*(1-f['loud'])
        c-=1.5*t['long']*f['long']; c-=1.5*t['short']*(1-f['long'])
        c-=1.5*t['choppy']*f['choppy']
        C[a,b]=c
r,cidx=linear_sum_assignment(C)
out={ids[b]:names[a] for a,b in zip(r,cidx)}
json.dump(dict(sorted(out.items())),open('src/lib/fart-names.json','w'),indent=1)
for i in ids[:12]:print(i,out[i],{k:round(v,2) for k,v in F[i].items()})
