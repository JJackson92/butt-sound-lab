import { createFileRoute } from '@tanstack/react-router';
import { Lab } from '@/components/Lab';
import { pageHead } from '@/lib/seo';
export const Route = createFileRoute('/')({head:()=>pageHead('ButtSounds.com – Free Fart Soundboard & Custom Fart Simulator','Create hilarious custom fart sounds, explore hundreds of recordings, and send ridiculous sound effects to your friends. Free online fart soundboard.','/'),component:()=> <Lab home/>});
