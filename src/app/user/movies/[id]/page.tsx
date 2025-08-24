// app/movies/[id]/page.tsx
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";
import Image from "next/image";

export default async function MovieDetail({ params }: { params: { id: string } }) {
  await connectDB();
  const movie = await Movie.findById(params.id);

  if (!movie) return <div className="text-center p-8">Không tìm thấy phim</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <Image src={movie.posterUrl} alt={movie.title} className="w-full md:w-1/3 rounded-lg shadow-lg" width={300} height={450}/>
        <div>
          <h1 className="text-3xl font-bold mb-3">{movie.title}</h1>
          <p className="mb-4 text-gray-700">{movie.overview}</p>
          <p className="mb-2">Ngày khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">Đặt Vé Ngay</button>
        </div>
      </div>
    </div>
  );
}
