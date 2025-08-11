import MovieSelection from "@/app/user/movieselect/MovieSection";
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
