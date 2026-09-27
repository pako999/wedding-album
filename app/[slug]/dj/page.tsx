import type { Metadata } from 'next';
import { WeddingDj } from '@/components/wedding/WeddingDj';
import { weddingLang } from '@/lib/wedding/contracts';
export const metadata: Metadata = {title:'GuestCam · DJ',robots:{index:false,follow:false,noarchive:true},referrer:'no-referrer'};
export default async function Page({params,searchParams}: {params:Promise<{slug:string}>;searchParams:Promise<{lang?:string}>}) {const {slug}=await params;return <WeddingDj slug={slug} initialLang={weddingLang((await searchParams).lang)}/>;}
