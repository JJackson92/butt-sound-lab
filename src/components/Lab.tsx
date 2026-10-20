import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Shuffle, RotateCcw, Play, Heart, Share2, Download, ArrowRight, FlaskConical, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Buttocks } from './Buttocks';
import { NewsTicker } from './NewsTicker';
import { DEFAULT_CREATION, damageRating, mysteryCreation, setSimpleSize, validateCreation, type Creation } from '@/lib/creations';
import { FOODS, pressureToPsi, type FartParams } from '@/lib/fart-synth';
import { ENVIRONMENTS, applyEnvironment, getAudioContext, type EnvKey } from '@/lib/fart-reverb';
import { renderCreation, playRendered, stopRendered, wavBlob, deliverAudio } from '@/lib/audio-render';
import { playPresetAudio, stopPresetAudio, loadManifest, type FartAudioEntry } from '@/lib/fart-audio';
import { findNearestPreset } from '@/lib/fart-matching';
import { saveSound, shareSound } from '@/lib/guest-sounds';

export function Lab({ initial, shared = false, home = false }: { initial?: Creation; shared?: boolean; home?: boolean }) {
 const [c,setC] = useState<Creation>(initial ?? DEFAULT_CREATION);
 const [advanced,setAdvanced] = useState(false); const [jiggle,setJiggle] = useState(0); const [level,setLevel] = useState(0);
 const [busy,setBusy] = useState(false); const [status,setStatus] = useState(''); const [credit,setCredit] = useState<FartAudioEntry|null>(null);
 const [blob,setBlob] = useState<Blob|null>(null); const previous = useRef<{c:Creation;buffer:AudioBuffer|null}|null>(null); const bufferRef = useRef<AudioBuffer|null>(null);
 const request = useRef(0); const [ready,setReady] = useState(false);
 useEffect(() => { if (!initial) { try { const v = validateCreation(JSON.parse(sessionStorage.getItem('buttsounds.lab') ?? 'null')); if(v)setC(v); } catch {} } setReady(true); return () => { request.current++; stopRendered(); stopPresetAudio(); }; },[initial]);
 useEffect(() => { if(ready && !shared) { try {sessionStorage.setItem('buttsounds.lab',JSON.stringify(c));} catch {setStatus('Session storage is unavailable on this device.');} } },[c,ready,shared]);
 const change = (next:Creation) => { setC(next); setBlob(null); bufferRef.current=null; };
 const update = <K extends keyof FartParams>(key:K,value:FartParams[K]) => change({...c,source:'synth',presetId:undefined,params:{...c.params,[key]:value}});
 async function run(sound = c, replay = false) {
  getAudioContext(); const id = ++request.current; stopRendered(); stopPresetAudio(); setBusy(true); setCredit(null); setStatus('Building pressure…');
  try {
   const matched = sound.source === 'match' ? findNearestPreset(sound.params) : null;
   const preset = sound.source === 'recording' ? sound.presetId : matched?.id;
   if(preset) {
    applyEnvironment(sound.env as EnvKey,sound.echo); const entry = await playPresetAudio(preset,sound.params.pressure/1.5);
    if(id !== request.current)return;
    if(entry){setCredit(entry);setJiggle(n=>n+1);setBlob(null);previous.current={c:sound,buffer:null};setStatus('Original recording');return;}
    setStatus('Recording unavailable. Playing a synthesized remix.');
   }
   const buffer = replay && previous.current?.buffer ? previous.current.buffer : await renderCreation(sound);
   if(id !== request.current)return;
   bufferRef.current=buffer; previous.current={c:sound,buffer};setBlob(wavBlob(buffer));setJiggle(n=>n+1);
   playRendered(buffer,setLevel,()=>setStatus('Experiment complete.'));setStatus(preset ? 'Synthesized remix · original unavailable' : sound.source === 'match' ? 'No close recording · custom synthesis' : 'Custom synthesis');
  } catch(e) {if(id===request.current)setStatus(e instanceof Error ? e.message : 'Pressure failure. Try again.');} finally {if(id===request.current)setBusy(false);}
 }
 async function prepareDownload() { getAudioContext();setBusy(true);try {
  if(c.source === 'recording' && c.presetId){const entry=(await loadManifest())[c.presetId];if(!entry || !/creativecommons.org\/licenses\/(by|by-nc)\/|creativecommons.org\/publicdomain\//.test(entry.license))throw new Error('Original download unavailable. Remix in the lab to create a WAV.');const r=await fetch(entry.preview);if(!r.ok)throw new Error('Original download unavailable. Remix in the lab to create a WAV.');const b=await r.blob();if(!b.type.startsWith('audio/'))throw new Error('Audio download unavailable.');setBlob(b);setStatus(`Original ready · credit ${entry.user} / ${entry.license}`);}
  else {const b=bufferRef.current ?? await renderCreation(c);bufferRef.current=b;setBlob(wavBlob(b));setStatus('WAV ready. Take this disaster with you.');}
 }catch {setStatus('Original download unavailable. Choose “Remix in Lab” for a synthesized WAV.');}finally{setBusy(false);}}
 const save=()=>{try{saveSound(c);setStatus('Your masterpiece has been bottled.');}catch(e){setStatus(e instanceof Error?e.message:'Could not save on this device.');}};
 const mystery=()=>{const next=mysteryCreation(crypto.getRandomValues(new Uint32Array(1))[0]);change(next);void run(next);};
 const rating=damageRating(c.params);
 return <>
 <section className="lab-intro"><div><span className="eyebrow"><FlaskConical size={14}/> HUMANITY WAS NOT READY</span><h1>{shared ? c.name : home ? <>BUTT SOUNDS<span className="title-puff">💨</span></> : 'FART LAB'}</h1><p>{home ? "The Internet’s Most Unnecessary Sound Laboratory." : shared ? 'A bottled masterpiece. Proceed at your own risk.' : 'Questionable science. Extraordinary results.'}</p><div className="intro-bottom">Create it. Name it. Share it.<span className="specimen">EXPERIMENT NO. {String(c.seed%10000).padStart(4,'0')}</span></div></div></section>
 <div className="lab-grid">
 <section className={`sound-stage ${level>0.65?'powerful':''}`}><div className="stage-top"><span><i className={level?'live-dot active':'live-dot'}/> GAS CHAMBER / 01</span><span>{busy?'PROCESSING':level?'RELEASING':'SYSTEM READY'}</span></div>
 <div className="butt-frame"><Buttocks params={c.params} jiggle={jiggle} stink={jiggle}/></div>
 <div className="meter-row"><div className="pressure-meter"><div className="meter-bars">{Array.from({length:20},(_,i)=><span key={i} className={i<level*20?'lit':''}/>)}</div><strong>{Math.round(pressureToPsi(c.params.pressure)*level)} <small>PSI</small></strong><span>FART-O-METER</span></div><div className="damage"><span>DAMAGE POTENTIAL</span><strong>{rating.label}</strong><div className="damage-track"><div style={{width:`${rating.score}%`}}/></div></div></div>
 <Button className="rip-button" disabled={busy} onClick={()=>void run()}><span>💨</span>{busy?'BUILDING PRESSURE…':'LET IT RIP!'}<ArrowRight size={25}/></Button>
 <div className="stage-bottom"><span>{c.source==='recording'?'ORIGINAL RECORDING':'CUSTOM SOUND ENGINE'}</span><span>{(c.params.duration??1.5).toFixed(1)} SEC / {Math.round((c.params.wetness??0)*100)}% WET</span></div></section>
 <section className="lab-controls"><div className="control-heading"><h2>Design your disaster</h2><div className="mode-switch"><Button variant={!advanced?'default':'ghost'} size="sm" onClick={()=>setAdvanced(false)}>Simple</Button><Button variant={advanced?'default':'ghost'} size="sm" onClick={()=>setAdvanced(true)}><SlidersHorizontal size={14}/> Advanced</Button></div></div>
 {!advanced ? <><Control label="Size" hint="Tiny squeak ↔ Earth-shattering blast" value={(c.params.cheekSize-.5)/1.5} min={0} max={1} onChange={v=>change({...c,source:'synth',presetId:undefined,params:setSimpleSize(c.params,v)})}/><Control label="Wetness" hint="Dry & airy ↔ Bubbling & sloppy" value={c.params.wetness??0} min={0} max={1} onChange={v=>update('wetness',v)}/><Control label="Duration" hint="Quick toot ↔ Extended performance" value={c.params.duration??1.5} min={.2} max={8} onChange={v=>update('duration',v)} unit="s"/><Control label="Power" hint="Gentle whisper ↔ Maximum explosion" value={c.params.pressure} min={.3} max={1.5} onChange={v=>update('pressure',v)}/></> : <>
 <Control label="Cheek Size" hint="More body, more rumble" value={c.params.cheekSize} min={.5} max={2} onChange={v=>update('cheekSize',v)}/><Control label="Cheek Shape" hint="Flat ↔ Round" value={c.params.cheekShape} min={0} max={1} onChange={v=>update('cheekShape',v)}/><Control label="Butthole Size" hint="Tight squeak ↔ Loose blast" value={c.params.holeSize} min={.2} max={1.5} onChange={v=>update('holeSize',v)}/><Control label="Pressure" hint={`${pressureToPsi(c.params.pressure)} PSI · fictional laboratory units`} value={c.params.pressure} min={.3} max={1.5} onChange={v=>update('pressure',v)}/>{(['resonance','turbulence','wetness'] as const).map(k=><Control key={k} label={k[0].toUpperCase()+k.slice(1)} hint={k==='resonance'?'Hollow ↔ Howling formant':k==='turbulence'?'Smooth ↔ Chaotic sputter':'Dry ↔ Bubbling'} value={c.params[k]??.5} min={0} max={1} onChange={v=>update(k,v)}/>)}<Control label="Duration" hint="A brief encounter or a full performance" value={c.params.duration??1.5} min={.2} max={8} onChange={v=>update('duration',v)} unit="s"/>
 <label className="select-label">Sound source<select value={c.source} onChange={e=>change({...c,source:e.target.value as Creation['source']})}><option value="synth">Custom synthesis · exact settings</option><option value="match">Closest measured recording</option>{c.source==='recording'&&<option value="recording">Original recording</option>}</select></label>
 <label className="select-label">Echo environment<select value={c.env} onChange={e=>change({...c,env:e.target.value})}>{ENVIRONMENTS.map(e=><option key={e.key} value={e.key}>{e.emoji} {e.label}</option>)}</select></label><Control label="Echo Amount" hint="Subtle ↔ Drenched" value={c.echo} min={0} max={1.5} onChange={v=>change({...c,echo:v})}/></>}
 <div className="meal-heading"><h3>Last meal</h3><span>FUEL THE EXPERIMENT</span></div><div className="food-grid">{FOODS.map(f=><Button key={f.key} variant="outline" aria-pressed={c.params.food===f.key} onClick={()=>update('food',f.key)} className={c.params.food===f.key?'food selected':'food'}><span>{f.emoji}</span><small>{f.label}</small></Button>)}</div>
 <div className="utility-row"><Button variant="outline" onClick={mystery} disabled={busy}><Shuffle size={16}/> Mystery Fart</Button><Button variant="ghost" title="Reset settings" aria-label="Reset settings" onClick={()=>change({...DEFAULT_CREATION})}><RotateCcw size={17}/></Button><Button variant="ghost" title="Replay previous fart" aria-label="Replay previous fart" disabled={!previous.current||busy} onClick={()=>{if(previous.current)void run(previous.current.c,true);}}><Play size={17}/></Button></div></section>
 </div>
 <NewsTicker trigger={jiggle}/>
 <section className="creation-actions"><div><label htmlFor="creation-name">NAME YOUR MASTERPIECE</label><Input id="creation-name" value={c.name} maxLength={60} onChange={e=>setC({...c,name:e.target.value})}/></div><div className="action-buttons"><Button variant="outline" onClick={save}><Heart size={17}/> Save</Button><Button variant="outline" onClick={()=>void shareSound(c).then(setStatus).catch(e=>setStatus(e.message))}><Share2 size={17}/> Share</Button><Button variant="default" disabled={busy} onClick={()=>blob?void deliverAudio(blob,c.name):void prepareDownload()}><Download size={17}/>{blob?'Download audio':'Prepare WAV'}</Button>{shared&&<Button asChild variant="outline"><Link to="/lab" search={{remix:encodeURIComponent(JSON.stringify({...c,source:'synth',presetId:undefined}))}}>Remix in Lab</Link></Button>}</div></section>
 <p className="status-message" role="status">{status || 'Headphones recommended. Your dignity is not insured.'}</p>
 {credit&&<p className="audio-credit">Original recording: <a href={credit.url} target="_blank" rel="noreferrer">{credit.name}</a> by {credit.user} · <a href={credit.license} target="_blank" rel="noreferrer">License & attribution</a></p>}
 {home&&<section className="explore-band"><div><span className="eyebrow">MORE QUESTIONABLE RESEARCH</span><h2>There’s a whole world of wrong.</h2></div><Button asChild variant="outline"><Link to="/library">Explore 200 recordings <ArrowRight size={17}/></Link></Button><Button asChild variant="outline"><Link to="/my-sounds">Your bottled masterpieces <Heart size={17}/></Link></Button></section>}
 </>;
}
function Control({label,hint,value,min,max,onChange,unit=''}:{label:string;hint:string;value:number;min:number;max:number;onChange:(n:number)=>void;unit?:string}){return <div className="lab-slider"><div><label>{label}</label><span>{unit?`${value.toFixed(1)}${unit}`:`${Math.round((value-min)/(max-min)*100)}%`}</span></div><Slider aria-label={label} value={[value]} min={min} max={max} step={unit?.1:.01} onValueChange={v=>onChange(v[0])}/><small>{hint}</small></div>;}
