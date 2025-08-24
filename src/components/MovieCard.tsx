import Image  from "next/image"

interface MovieProps {
  movie: {
    _id: string;
    title: string;
    posterUrl: string;
    releaseDate: string;
  };
}

export default function MovieCard({ movie }: MovieProps) {
  return (
    <a
      href={`/movies/${movie._id}`}
      className="block border rounded-lg shadow hover:shadow-lg transition"
    >
      <Image
        src={movie.posterUrl}
        alt={movie.title}
        className="w-full h-64 object-cover rounded-t-lg"
        width={400}
        height={600}
      />
      <div className="p-2">
        <h3 className="font-semibold">{movie.title}</h3>
        <p className="text-sm text-gray-500">
          {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
        </p>
      </div>
    </a>
  );
}
