import CamLoveLiveV2Page from "../camlove-live-v2/page";

const optimizedBusinessImage = "/_next/image?url=https%3A%2F%2Fraw.githubusercontent.com%2Fpako999%2Fwedding-album%2Fmain%2F2.1.organizacija-dogodkov-dogodkey%2520%25281%2529.jpg&w=1600&q=82";

export default function CamLovePolishedPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Give the two-line hero headline more breathing room. */
        main > section:first-of-type h1 { line-height: 1.02 !important; }

        /* Use the supplied event photo everywhere "Poslovni dogodki" appears.
           It is delivered through Next Image Optimizer as WebP/AVIF at 1600px / q82. */
        #events article:last-child > div,
        #business > div > div:first-child {
          background-image: url('${optimizedBusinessImage}');
          background-size: cover;
          background-position: center;
        }
        #events article:last-child > div img,
        #business > div > div:first-child img { opacity: 0 !important; }
      ` }} />
      <CamLoveLiveV2Page />
    </>
  );
}
