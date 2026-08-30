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
      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-900 shadow-xl">
        <video
          controls
          playsInline
          preload="metadata"
          className="block h-auto w-full"
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
