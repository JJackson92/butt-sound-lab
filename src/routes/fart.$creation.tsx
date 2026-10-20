import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Lab } from '@/components/Lab';
import { decodeCreation } from '@/lib/creations';
import { pageHead } from '@/lib/seo';
export const Route=createFileRoute('/fart/$creation')({loader:({params})=>({creation:decodeCreation(params.creation)}),head:({loaderData})=>({...pageHead(`${loaderData?.creation?.name??'Invalid creation'} — ButtSounds.com`,'Someone bottled a masterpiece. Play, save, download or remix this custom fart sound.','/fart'),meta:[...pageHead(`${loaderData?.creation?.name??'Invalid creation'} — ButtSounds.com`,'Someone bottled a masterpiece. Play, save, download or remix this custom fart sound.','/fart').meta,{name:'robots',content:'noindex,follow'}],links:[]}),component:Shared});
function Shared(){const {creation}=Route.useLoaderData();return creation?<Lab key={creation.seed+creation.name} initial={creation} shared/>:<section className="empty-state"><h1>This bottle has leaked.</h1><p>The shared creation is invalid or incomplete.</p><Button asChild><Link to="/lab">Start a new experiment</Link></Button></section>;}
