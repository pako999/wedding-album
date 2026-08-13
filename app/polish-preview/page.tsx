import type { Metadata } from "next";
import HomePage from "../page";

export const metadata: Metadata = {
  title: "Guestcam — polish preview",
  description: "Polish preview obstoječe Guestcam domače strani.",
  robots: { index: false, follow: false },
};

const polishCss = `
  .guestcam-polish-preview {
    --ink: #0F1729;
    --paper: #FBFAF7;
    --warm: #F4EFE4;
    --accent: #FFC94D;
    --accent-deep: #A9650C;
  }
  .guestcam-polish-preview > div { background: var(--paper) !important; }
  .guestcam-polish-preview header { background: rgba(251,250,247,.96) !important; border-color: rgba(15,23,41,.10) !important; backdrop-filter: blur(10px) !important; }
  .guestcam-polish-preview header nav { height: 70px !important; }
  .guestcam-polish-preview header a[style*="linear-gradient"] { background: var(--ink) !important; color: white !important; box-shadow: none !important; border-radius: 10px !important; }
  .guestcam-polish-preview > div > section:first-of-type { background: var(--paper) !important; }
  .guestcam-polish-preview > div > section:first-of-type h1 { font-weight: 750 !important; letter-spacing: -.045em !important; line-height: .99 !important; max-width: 720px; }
  .guestcam-polish-preview > div > section:first-of-type h1 svg { display: none !important; }
  .guestcam-polish-preview > div > section:first-of-type .animate-ping { display: none !important; }
  .guestcam-polish-preview > div > section:first-of-type [style*="radial-gradient"] { display: none !important; }
  .guestcam-polish-preview > div > section:first-of-type a[style*="linear-gradient"] { background: var(--ink) !important; color: white !important; box-shadow: none !important; border-radius: 10px !important; }
  .guestcam-polish-preview > div > section:first-of-type [style*="linear-gradient(135deg, #FFF3CC"] { background: #fff !important; box-shadow: none !important; }
  .guestcam-polish-preview > div > section:first-of-type img[src*="guestcam-hero-photo"] { filter: saturate(.92) contrast(.98); }
  .guestcam-polish-preview > div > section:nth-of-type(2) { display: none !important; }
  .guestcam-polish-preview > div > section:nth-of-type(3) { max-width: 1180px !important; padding-top: 92px !important; padding-bottom: 92px !important; text-align: left !important; }
  .guestcam-polish-preview > div > section:nth-of-type(3) > h2,
  .guestcam-polish-preview > div > section:nth-of-type(3) > p { margin-left: 0 !important; margin-right: 0 !important; }
  .guestcam-polish-preview > div > section:nth-of-type(3) [class*="rounded-2xl"] { border-radius: 10px !important; box-shadow: none !important; }
  .guestcam-polish-preview > div > section:nth-of-type(3) img { filter: saturate(.9); }
  .guestcam-polish-preview #templates { background: white !important; border-top: 1px solid rgba(15,23,41,.08); }
  .guestcam-polish-preview #templates [class*="rounded-2xl"] { border-radius: 9px !important; box-shadow: none !important; }
  .guestcam-polish-preview #templates [class*="uppercase"][class*="rounded-full"] { background: transparent !important; padding-left: 0 !important; padding-right: 0 !important; }
  .guestcam-polish-preview #templates img { filter: saturate(.84); }
  .guestcam-polish-preview #how > .absolute { display: none !important; }
  .guestcam-polish-preview #how [class*="rounded-3xl"] { border-radius: 10px !important; border: 1px solid rgba(255,255,255,.09); }
  .guestcam-polish-preview #how [class*="rounded-2xl"] { border-radius: 8px !important; }
  .guestcam-polish-preview #how a[style*="box-shadow"] { box-shadow: none !important; border-radius: 9px !important; }
  .guestcam-polish-preview #why { background: var(--warm) !important; }
  .guestcam-polish-preview #why > div > .grid { gap: 0 !important; border-top: 1px solid rgba(15,23,41,.14); border-bottom: 1px solid rgba(15,23,41,.14); }
  .guestcam-polish-preview #why > div > .grid > div { border: 0 !important; border-radius: 0 !important; box-shadow: none !important; background: transparent !important; padding: 34px 30px !important; }
  .guestcam-polish-preview #why > div > .grid > div + div { border-left: 1px solid rgba(15,23,41,.14) !important; }
  .guestcam-polish-preview #why > div > .grid > div > div:first-child { display: none !important; }
  .guestcam-polish-preview #features > div > .grid { gap: 0 !important; border-top: 1px solid rgba(15,23,41,.13); }
  .guestcam-polish-preview #features > div > .grid > div { border: 0 !important; border-bottom: 1px solid rgba(15,23,41,.13) !important; border-radius: 0 !important; box-shadow: none !important; padding: 28px 26px !important; }
  .guestcam-polish-preview #features > div > .grid > div:hover { box-shadow: none !important; background: #FBFAF7 !important; }
  .guestcam-polish-preview #features > div > .grid > div > div:first-child { width: 36px !important; height: 36px !important; border-radius: 50% !important; background: transparent !important; border: 1px solid rgba(169,101,12,.35) !important; box-shadow: none !important; color: var(--accent-deep) !important; margin-bottom: 18px !important; }
  .guestcam-polish-preview #features > div > .grid > div > div:first-child svg { width: 18px !important; height: 18px !important; }
  .guestcam-polish-preview #reviews { display: none !important; }
  .guestcam-polish-preview #pricing { background: white !important; border-top: 1px solid rgba(15,23,41,.08); }
  .guestcam-polish-preview #pricing [class*="rounded-3xl"] { border-radius: 10px !important; box-shadow: none !important; }
  .guestcam-polish-preview #pricing a[class*="rounded-2xl"] { border-radius: 8px !important; }
  .guestcam-polish-preview #faq { background: var(--paper) !important; border-top: 1px solid rgba(15,23,41,.08); }
  .guestcam-polish-preview #faq details { border: 0 !important; border-bottom: 1px solid rgba(15,23,41,.12) !important; border-radius: 0 !important; background: transparent !important; }
  .guestcam-polish-preview #faq + section a[style*="box-shadow"] { box-shadow: none !important; border-radius: 9px !important; background: var(--ink) !important; color: white !important; }
  @media (max-width: 767px) {
    .guestcam-polish-preview header nav { padding-left: 18px !important; padding-right: 18px !important; }
    .guestcam-polish-preview > div > section:nth-of-type(3) { padding-top: 64px !important; padding-bottom: 64px !important; }
    .guestcam-polish-preview #why > div > .grid > div + div { border-left: 0 !important; border-top: 1px solid rgba(15,23,41,.14) !important; }
    .guestcam-polish-preview #features > div > .grid > div { padding-left: 4px !important; padding-right: 4px !important; }
  }
`;

export default function PolishPreviewPage() {
  return (
    <div className="guestcam-polish-preview">
      <style dangerouslySetInnerHTML={{ __html: polishCss }} />
      <HomePage />
    </div>
  );
}
