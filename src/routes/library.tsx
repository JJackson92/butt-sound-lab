import { createFileRoute } from '@tanstack/react-router';
import { SoundLibrary } from '@/components/SoundLibrary';
import { pageHead } from '@/lib/seo';
export const Route=createFileRoute('/library')({head:()=>pageHead('Sound Library — 200 Real Fart Recordings | ButtSounds.com','Browse squeaky, airy and rumbly real recordings. Search, favorite, share or remix a sound in the Fart Lab.','/library'),component:()=> <SoundLibrary/>});
