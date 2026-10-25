'use client';
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { translations, type Lang } from '@/lib/i18n/translations';

export function isEmbeddedMobileBrowser(ua: string) {
 const ios = /iPhone|iPad|iPod/i.test(ua);
 return /FBAN|FBAV|Instagram|Line\/|ChatGPT|GSA\//i.test(ua)
  || (/Android/i.test(ua) && /; wv\)|\bwv\b|Version\/4\.0/i.test(ua))
  || (ios && !/Safari\//i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua));
}
const HELP: Record<Lang, { title: string; body: string; gallery: string; retry: string; close: string }> = {
 sl: {title:'Fotografiranje v brskalniku',body:'Brskalnik znotraj aplikacije lahko prikaže črn zaslon kamere. V meniju aplikacije odprite ta album v Safariju ali Chromu in preverite dovoljenje za kamero. Lahko tudi fotografirate z aplikacijo Kamera na telefonu in nato naložite fotografijo iz galerije.',gallery:'Naloži iz galerije',retry:'Vseeno poskusi kamero',close:'Zapri'},
 hr: {title:'Fotografiranje u pregledniku',body:'Preglednik unutar aplikacije može prikazati crni zaslon kamere. U izborniku aplikacije otvorite album u Safariju ili Chromeu i provjerite dopuštenje za kameru. Možete snimiti fotografiju aplikacijom Kamera na telefonu i zatim je učitati iz galerije.',gallery:'Učitaj iz galerije',retry:'Ipak pokušaj kameru',close:'Zatvori'},
 sr: {title:'Fotografisanje u pregledaču',body:'Pregledač unutar aplikacije može prikazati crni ekran kamere. U meniju aplikacije otvorite album u Safariju ili Chrome-u i proverite dozvolu za kameru. Možete snimiti fotografiju aplikacijom Kamera na telefonu i zatim je otpremiti iz galerije.',gallery:'Otpremi iz galerije',retry:'Ipak pokušaj kameru',close:'Zatvori'},
 en: {title:'Taking photos in your browser',body:'An in-app browser may show a black camera preview. Use the app menu to open this album in Safari or Chrome and check camera permission. You can also take a photo with your phone’s Camera app, then upload it from your photo library.',gallery:'Upload from photo library',retry:'Try the camera anyway',close:'Close'},
 de: {title:'Fotos im Browser aufnehmen',body:'Ein Browser innerhalb einer App kann eine schwarze Kameravorschau anzeigen. Öffne das Album über das App-Menü in Safari oder Chrome und prüfe die Kameraberechtigung. Du kannst auch mit der Kamera-App deines Handys fotografieren und das Foto anschließend aus der Mediathek hochladen.',gallery:'Aus Mediathek hochladen',retry:'Kamera trotzdem versuchen',close:'Schließen'},
 es: {title:'Hacer fotos en el navegador',body:'El navegador de una app puede mostrar la cámara en negro. Abre este álbum en Safari o Chrome desde el menú de la app y comprueba el permiso de cámara. También puedes hacer la foto con la app Cámara del teléfono y después subirla desde la galería.',gallery:'Subir desde la galería',retry:'Probar la cámara igualmente',close:'Cerrar'},
};

function subscribeToBrowser() { return () => {}; }
function embeddedBrowserSnapshot() { return isEmbeddedMobileBrowser(navigator.userAgent); }
export function CameraBrowserNotice({ lang }: { lang: Lang }) {
 const embedded = useSyncExternalStore(subscribeToBrowser, embeddedBrowserSnapshot, () => false);
 return embedded ? <p data-camera-browser-notice className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-stone-800">{HELP[lang].body}</p> : null;
}

/** Native single-photo capture; upload/storage permissions remain in the existing pipeline. */
export function PhotoCaptureButton({lang,onFiles,onChooseExisting,children,className,style}: {
 lang:Lang;onFiles:(files:FileList)=>void;onChooseExisting:()=>void;children:ReactNode;className?:string;style?:CSSProperties;
}) {
 const input=useRef<HTMLInputElement>(null);const dialogInput=useRef<HTMLInputElement>(null);const dialog=useRef<HTMLDialogElement>(null);const [helpOpen,setHelpOpen]=useState(false);const help=HELP[lang];
 useEffect(()=>{const node=dialog.current;if(!node)return;if(helpOpen&&!node.open)node.showModal();else if(!helpOpen&&node.open)node.close();},[helpOpen]);
 function capture(){(helpOpen?dialogInput.current:input.current)?.click();}
 const picker=(ref:RefObject<HTMLInputElement|null>)=><input ref={ref} aria-label={translations[lang].takePhoto} data-photo-capture type="file" accept="image/*" capture="environment" className="hidden" onClick={event=>{event.currentTarget.value='';}} onChange={event=>{
   const files=event.currentTarget.files;if(!files?.length)return;
   // Copy before the input can be reused; camera files continue through UploadModal.
   const copy=typeof DataTransfer!=='undefined'?new DataTransfer():null;
   if(copy)copy.items.add(files[0]);
   setHelpOpen(false);onFiles(copy?copy.files:files);
  }}/>;
 return <>
  <button type="button" aria-label={translations[lang].takePhoto} className={className} style={style} onClick={()=>{
   if(isEmbeddedMobileBrowser(navigator.userAgent))setHelpOpen(true);else capture();
  }}>{children}</button>
  {picker(input)}
  <dialog ref={dialog} aria-label={help.title} onCancel={()=>setHelpOpen(false)} className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-3xl border border-stone-200 bg-white p-6 text-stone-900 shadow-2xl backdrop:bg-black/60">
   {picker(dialogInput)}
   <h2 className="text-xl font-bold">{help.title}</h2><p className="mt-3 text-sm leading-6">{help.body}</p>
   <div className="mt-5 grid gap-3"><button type="button" className="min-h-12 rounded-xl bg-stone-900 px-4 py-3 font-semibold text-white" onClick={()=>{setHelpOpen(false);onChooseExisting();}}>{help.gallery}</button>
   <button type="button" className="min-h-12 rounded-xl border px-4 py-3 font-semibold" onClick={capture}>{help.retry}</button>
   <button type="button" className="min-h-11 px-4 py-2 text-sm" onClick={()=>setHelpOpen(false)}>{help.close}</button></div>
  </dialog>
 </>;
}
