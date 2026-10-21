import { createFileRoute } from '@tanstack/react-router';
import { AppLauncher } from '@/components/AppLauncher';
import { pageHead } from '@/lib/seo';
export const Route = createFileRoute('/')({head:()=>pageHead('ButtSounds.com – Free Fart Soundboard, Fart Lab & Games','Make custom fart sounds, play Flappy Cheeks, compose with the Wind Ensemble and explore hundreds of real recordings. All free.','/'),component:AppLauncher});
