"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import { Play, Ticket, X } from "lucide-react";
import { useState } from "react";

const movies = [
  {
    id: 1,
    img: "/images/mangmedibov2.jpg",
    title: "Mạng Mẹ Đi Bộ",
    date: "01.08.2025",
    trailer: "https://www.youtube.com/embed/-VhpW1WO5Q4",
  },
  {
    id: 2,
    img: "/images/toantridocgia.jpg",
    title: "Toàn Trí Đọc Giả",
    date: "01.08.2025",
    trailer: "https://www.youtube.com/embed/7yOUBuf0LCg",
  },
  {
    id: 3,
    img: "/images/conanmovie28.jpg",
    title: "Conan: Dưới Lòng Biển Sâu",
    date: "25.07.2025",
    trailer: "https://www.youtube.com/embed/LQYpLcz53pQ",
  },
  {
    id: 4,
    img: "/images/fantasy4.jpg",
    title: "Fantastic 4",
    date: "25.07.2025",
    trailer: "https://www.youtube.com/embed/18QQWa5MEcs",
  },
];

export default function MovieSelection() {
  const [trailer, setTrailer] = useState<string | null>(null);

  return (
    <div className="w-full py-10 bg-[#fdf9f4]">
      <div className="container mx-auto px-5">
        <h2 className="text-3xl font-extrabold text-center mb-8 tracking-wide">
          <span className="border-b-4 border-black pb-2">MOVIE SELECTION</span>
        </h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          slidesPerView={2}
          spaceBetween={15}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-10"
        >
          {movies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <div className="bg-white shadow-lg rounded-md overflow-hidden group relative hover:scale-105 transition">
                <Image
                  src={movie.img}
                  alt={movie.title}
                  width={250}
                  height={350}
                  className="object-cover w-full h-[350px] group-hover:opacity-90 transition duration-300"
                />
                {/* <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded">
                  {movie.label}
                </div> */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col gap-3 items-center justify-center">
                  <button
                    onClick={() => setTrailer(movie.trailer)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white text-sm"
                  >
                    <Play className="w-4 h-4" /> Xem Trailer
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-full text-black font-semibold text-sm">
                    <Ticket className="w-4 h-4" /> Đặt Vé
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="text-base font-semibold">{movie.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{movie.date}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Modal Trailer */}
      {trailer && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="relative w-full max-w-3xl bg-black rounded-lg overflow-hidden">
            <button
              onClick={() => setTrailer(null)}
              className="absolute top-3 right-3 text-white hover:text-gray-300"
            >
              <X size={28} />
            </button>
            <iframe
              width="100%"
              height="500"
              src={trailer}
              title="Trailer"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
