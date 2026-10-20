import { createFileRoute } from '@tanstack/react-router';
import { Lab } from '@/components/Lab';
import { validateCreation } from '@/lib/creations';
import { pageHead } from '@/lib/seo';
import { useMemo } from 'react';
export const Route = createFileRoute('/lab')({validateSearch:(search:Record<string,unknown>):{remix?:string}=>({remix:typeof search.remix==='string'?search.remix:undefined}),head:()=>pageHead('Fart Lab — ButtSounds.com','Design your own ridiculous sound with size, wetness, duration, power, meals and echo. Share it or download a WAV.','/lab'),component:LabPage});
function LabPage(){const {remix}=Route.useSearch();const initial=useMemo(()=>{try{return remix?validateCreation(JSON.parse(decodeURIComponent(remix)))??undefined:undefined;}catch{return undefined;}},[remix]);return <Lab key={remix??'session'} initial={initial}/>;}
