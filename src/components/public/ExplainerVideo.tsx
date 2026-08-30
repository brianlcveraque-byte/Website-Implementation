/**
 * The explainer for the full system.
 *
 * Shared between the ad landing page and the post-purchase page so there is one
 * copy of the markup and one place to change the file.
 *
 * preload="metadata" is safe here only because the file was remuxed so its moov
 * atom sits at the front — see scripts/faststart.mjs. Before that, the index
 * lived after 18.6MB of video and a browser had to download the whole thing to
 * show a single frame, which is not something to put on a page paid traffic
 * lands on. Now it reads about 120KB and stops.
 */
export function ExplainerVideo({ caption }: { caption?: string }) {
  return (
    <figure className="m-0">
      {/* The file is 1080x1920 — shot vertical, for Reels and TikTok. Left to
          fill the column it would render about 1365px tall on desktop, taller
          than the screen it is being watched on, and push everything else off
          the page. So it is framed at phone width and centred, which is also
          the shape the footage was composed for.

          aspect-[9/16] holds the space before the metadata arrives, so the
          section does not jump as the video loads. */}
      <div className="mx-auto aspect-[9/16] w-full max-w-[19rem] overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-900 shadow-xl">
        <video
          controls
          playsInline
          preload="metadata"
          className="block h-full w-full object-contain"
          aria-label="Short explainer: what the full HR system does"
        >
          <source src="/video/hris-explainer.mp4" type="video/mp4" />
          Your browser cannot play this video.{" "}
          <a href="/video/hris-explainer.mp4" className="underline">
            Download it instead
          </a>
          .
        </video>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-slate-500">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
