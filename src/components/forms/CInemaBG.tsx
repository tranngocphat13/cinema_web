"use client";

export default function CinemaBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
      {/* base */}
      <div className="absolute inset-0 bg-[#04140c]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_25%_25%,rgba(16,185,129,0.33),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_70%_15%,rgba(16,185,129,0.22),transparent_62%)]" />

      {/* moving light */}
      <div className="absolute inset-0 opacity-90 cinematic-move" />

      {/* scanlines + grain */}
      <div className="absolute inset-0 opacity-20 cinematic-scanlines" />
      <div className="absolute inset-0 opacity-[0.12] cinematic-grain" />

      <style jsx>{`
        .cinematic-move {
          background: radial-gradient(
              900px 500px at 10% 15%,
              rgba(16, 185, 129, 0.45),
              transparent 60%
            ),
            radial-gradient(800px 520px at 90% 10%, rgba(16, 185, 129, 0.25), transparent 65%),
            radial-gradient(900px 700px at 60% 90%, rgba(0, 0, 0, 0.7), transparent 60%);
          filter: saturate(110%) contrast(105%);
          animation: drift 10s ease-in-out infinite alternate;
        }
        .cinematic-scanlines {
          background: repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.12) 0px,
            rgba(255, 255, 255, 0.12) 1px,
            rgba(0, 0, 0, 0) 3px,
            rgba(0, 0, 0, 0) 6px
          );
          mix-blend-mode: overlay;
        }
        .cinematic-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light;
          animation: grain 2.2s steps(2) infinite;
        }
        @keyframes drift {
          0% {
            transform: translate3d(-2%, -1%, 0) scale(1.02);
          }
          100% {
            transform: translate3d(2%, 1%, 0) scale(1.06);
          }
        }
        @keyframes grain {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-2%, 1%);
          }
          50% {
            transform: translate(2%, -1%);
          }
          75% {
            transform: translate(-1%, -2%);
          }
          100% {
            transform: translate(1%, 2%);
          }
        }
      `}</style>
    </div>
  );
}
