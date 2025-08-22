import Image from "next/image";
import Link from "next/link";

interface Genre {
  _id: string;
  name: string;
}

interface MovieCardProps {
  movie: {
    _id: string;
    title: string;
    posterUrl: string;
    releaseDate?: string;
    ratingLabel?: string;
    genres?: Genre[];
  };
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:scale-105 transition-transform duration-200">
      {/* Poster + Link đến chi tiết phim */}
      <Link href={`/movie/${movie._id}`}>
        <div className="relative w-full h-64">
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Thông tin phim */}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{movie.title}</h3>
        {movie.ratingLabel && (
          <span className="text-sm text-gray-500">{movie.ratingLabel}</span>
        )}
        {movie.releaseDate && (
          <p className="text-sm text-gray-400">
            {new Date(movie.releaseDate).getFullYear()}
          </p>
        )}
        {movie.genres && movie.genres.length > 0 && (
          <p className="text-sm text-gray-600">
            {movie.genres.map((g) => g.name).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
