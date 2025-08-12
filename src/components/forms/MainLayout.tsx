import NowPlayingSlider from "@/components/forms/movie-nowplaying";
import BannerSlider from "@/components/ui/bannersliders";

export default function HomePage() {
  return (
    <div>
      {/* Banner */}
      <BannerSlider />
      {/* Now Playing Movies */}
      <NowPlayingSlider />
    </div>
  );
}
