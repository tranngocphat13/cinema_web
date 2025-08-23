"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Movie {
  _id: string;
  title: string;
  description: string;
  poster: string;
}

export default function MovieDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    fetch(`/api/movies/${id}`)
      .then((res) => res.json())
      .then((data: Movie) => setMovie(data));

    fetch(`/api/movies/${id}/trailer`)
      .then((res) => res.json())
      .then((data: { trailerUrl?: string }) => {
        if (data.trailerUrl) setTrailerUrl(data.trailerUrl);
      });
  }, [id]);

  if (!movie) return <p>Đang tải...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Image src={movie.poster} alt={movie.title} className="w-full rounded-xl" />
      <h1 className="text-3xl font-bold mt-4">{movie.title}</h1>
      <p className="mt-2 text-gray-700">{movie.description}</p>

      {trailerUrl && (
        <iframe
          className="w-full aspect-video mt-4 rounded-xl"
          src={trailerUrl}
          title="Trailer"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}
