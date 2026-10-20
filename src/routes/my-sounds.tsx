import { createFileRoute } from '@tanstack/react-router';
import { SoundLibrary } from '@/components/SoundLibrary';
import { pageHead } from '@/lib/seo';
export const Route=createFileRoute('/my-sounds')({head:()=>({...pageHead('My Sounds — Your Bottled Creations | ButtSounds.com','Your locally saved custom creations and favorite recordings. Replay, share and remix your private sound collection.','/my-sounds'),meta:[...pageHead('My Sounds — Your Bottled Creations | ButtSounds.com','Your locally saved custom creations and favorite recordings.','/my-sounds').meta,{name:'robots',content:'noindex,follow'}]}),component:()=> <SoundLibrary saved/>});
