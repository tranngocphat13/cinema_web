import BannerSlider from "@/components/ui/bannersliders";
import Image from "next/image";
import Link from "next/link";

const nowShowing = [
  { id: 1, title: "Avengers: Endgame", poster: "/images/avengers.jpg" },
  { id: 2, title: "The Batman", poster: "/images/batman.jpg" },
  { id: 3, title: "Spiderman: No Way Home", poster: "/images/spiderman.jpg" },
];

const comingSoon = [
  { id: 4, title: "Deadpool 3", poster: "/images/avengers.jpg" },
  { id: 5, title: "Joker 2", poster: "/images/avengers.jpg" },
];

export default function HomePage() {
  return (
    <div>
      {/* Banner */}
      <BannerSlider />

      {/* Phim đang chiếu */}
      <section className="mb-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">🎬 Phim đang chiếu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {nowShowing.map((movie) => (
              <div key={movie.id} className="bg-white shadow rounded-lg overflow-hidden">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  width={350}
                  height={350}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{movie.title}</h3>
                  <Link
                    href={`/movies/${movie.id}`}
                    className="inline-block mt-2 text-green-500 hover:underline"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phim sắp chiếu */}
      <section>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">📅 Phim sắp chiếu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {comingSoon.map((movie) => (
              <div key={movie.id} className="bg-white shadow rounded-lg overflow-hidden">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  width={400}
                  height={600}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{movie.title}</h3>
                  <Link
                    href={`/movies/${movie.id}`}
                    className="inline-block mt-2 text-green-500 hover:underline"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
