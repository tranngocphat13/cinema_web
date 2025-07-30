import MovieSelection from "@/app/movieselect/MovieSection";
import BannerSlider from "@/components/ui/bannersliders";



export default function HomePage() {
  return (
    <div>
      {/* Banner */}
      <BannerSlider />

      <MovieSelection />
    </div>
  );
}
