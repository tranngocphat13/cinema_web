"use client";

export default function CinemaBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[#050806]" />
      <div className="absolute inset-0 cinema-projector-soft opacity-95" />
      <div className="absolute inset-0 cinema-vignette-soft opacity-45" />
      <div className="absolute inset-0 cinema-scan-soft opacity-[0.10]" />
      <div className="absolute inset-0 cinema-grain-soft opacity-[0.10]" />

      <style jsx>{`
        .cinema-projector-soft {
          background:
            radial-gradient(950px 560px at 20% 25%, rgba(16,185,129,0.42), transparent 60%),
            radial-gradient(1100px 680px at 85% 18%, rgba(16,185,129,0.22), transparent 62%),
            radial-gradient(1200px 900px at 50% 110%, rgba(0,0,0,0.65), transparent 55%),
            linear-gradient(120deg, rgba(0,0,0,0.30), rgba(16,185,129,0.08), rgba(0,0,0,0.30));
          filter: saturate(115%) contrast(108%);
          transform: scale(1.10);
          animation: projDriftSoft 16s ease-in-out infinite alternate;
        }
        .cinema-vignette-soft {
          background: radial-gradient(1200px 900px at 50% 30%, transparent 66%, rgba(0,0,0,0.55) 100%);
          mix-blend-mode: multiply;
        }
        .cinema-scan-soft {
          background: repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,0.10) 0px,
            rgba(255,255,255,0.10) 1px,
            rgba(0,0,0,0) 4px,
            rgba(0,0,0,0) 9px
          );
          mix-blend-mode: overlay;
          animation: scanMoveSoft 7s linear infinite;
          background-size: 100% 18px;
        }
        .cinema-grain-soft {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light;
          animation: grainJitterSoft 2.6s steps(2) infinite;
        }
        @keyframes projDriftSoft {
          0% { transform: translate3d(-1.2%,-0.8%,0) scale(1.10); }
          100% { transform: translate3d(1.2%,0.8%,0) scale(1.14); }
        }
        @keyframes scanMoveSoft {
          0% { transform: translateY(0); }
          100% { transform: translateY(18px); }
        }
        @keyframes grainJitterSoft {
          0% { transform: translate(0,0); }
          25% { transform: translate(-1%,0.7%); }
          50% { transform: translate(1%,-0.7%); }
          75% { transform: translate(-0.7%,-1%); }
          100% { transform: translate(0.7%,1%); }
        }
      `}</style>
    </div>
  );
}
