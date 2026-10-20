import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CREATION, encodeCreation, decodeCreation, validateCreation, seededRandom, mysteryCreation, damageRating, setSimpleSize } from './creations';
import { soundDuration } from './fart-synth';
import { wavBytes } from './audio-render';

describe('shared sound rules',()=>{
 it('reproduces every setting, seed, source and Unicode name through a link',()=>{
  const c={...DEFAULT_CREATION,name:'Grandma’s Revenge 🌯',env:'church',echo:1.3};
  assert.deepEqual(decodeCreation(encodeCreation(c)),c);
 });
 it('rejects invalid links, oversized settings and unnamed creations',()=>{
  assert.equal(decodeCreation('invalid'),null);
  assert.equal(validateCreation({...DEFAULT_CREATION,name:''}),null);
  assert.equal(validateCreation({...DEFAULT_CREATION,params:{...DEFAULT_CREATION.params,holeSize:9}}),null);
  assert.equal(validateCreation({...DEFAULT_CREATION,source:'recording'}),null);
 });
 it('uses the same random stream for the same seed',()=>{
  const a=seededRandom(42),b=seededRandom(42),c=seededRandom(43);
  const av=Array.from({length:20},a);assert.deepEqual(av,Array.from({length:20},b));assert.notDeepEqual(av,Array.from({length:20},c));
 });
 it('mystery settings and names replay from their seed and remain valid',()=>{
  assert.deepEqual(mysteryCreation(123),mysteryCreation(123));
  for(let seed=0;seed<100;seed++)assert.ok(validateCreation(mysteryCreation(seed)));
 });
 it('simple size maps tiny to tight and large to loose',()=>{
  const small=setSimpleSize(DEFAULT_CREATION.params,0),large=setSimpleSize(DEFAULT_CREATION.params,1);
  assert.equal(small.holeSize,.2);assert.equal(small.cheekSize,.5);assert.equal(large.holeSize,1.5);assert.equal(large.cheekSize,2);
 });
 it('damage reflects parameters rather than randomness',()=>{
  assert.equal(damageRating({...DEFAULT_CREATION.params,pressure:.3,cheekSize:.5,duration:.2,wetness:0}).label,'Barely Noticeable');
  assert.deepEqual(damageRating({...DEFAULT_CREATION.params,pressure:1.5,cheekSize:2,duration:8,wetness:1}),{score:100,label:'Planetary Emergency'});
 });
 it('explicit duration takes priority and legacy meal duration is preserved',()=>{
  assert.equal(soundDuration({...DEFAULT_CREATION.params,duration:8}),8);
  assert.equal(soundDuration({...DEFAULT_CREATION.params,food:'burrito',cheekSize:2,duration:undefined}),3.2);
 });
 it('encodes actual samples into a stereo PCM WAV',()=>{
  const data=wavBytes([new Float32Array([0,.5,-1]),new Float32Array([1,-.5,0])],44100);const view=new DataView(data);
  assert.equal(new TextDecoder().decode(new Uint8Array(data,0,4)),'RIFF');assert.equal(view.getUint16(22,true),2);assert.equal(view.getUint32(24,true),44100);assert.equal(view.getUint32(40,true),12);assert.equal(view.getInt16(46,true),32767);assert.equal(view.getInt16(52,true),-32768);
 });
});