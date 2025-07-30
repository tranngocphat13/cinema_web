"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";

const slides = [
  {
    id: 1,
    img: "/images/mangmedibo.jpg",
    title: "MANG MẸ ĐI BỎ",
    releaseDate: "1 AUGUST 2025",
  },
  {
    id: 2,
    img: "/images/toantridocgia_banner.jpg",
    title: "TOÀN TRÍ ĐỘC GIẢ",
    releaseDate: "1 AUGUST 2025",
  },
  {
    id: 3,
    img: "/images/conanmovie28_banner.jpg",
    title: "CONAN - DƯỚI LÒNG BIỂN SÂU",
    releaseDate: "10 SEP 2024",
  },
];

export default function BannerSlider() {
  return (
    <div className="relative w-full bg-black">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={true}
        className="w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-[500px] md:h-[600px] flex justify-center items-center overflow-hidden">
              {/* Ảnh làm mờ full background */}
              <Image
                src={slide.img}
                alt={slide.title}
                fill
                className="object-cover blur-lg scale-110"
                quality={70}
              />
              {/* Ảnh chính ở giữa */}
              <div className="relative w-[85%] md:w-[70%] h-[80%] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={slide.img}
                  alt={slide.title}
                  fill
                  className="object-contain bg-black"
                  quality={100}
                  priority
                />
              </div>

              {/* Text overlay */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-red-500">
                <h2 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg mb-3">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-2xl font-medium drop-shadow mb-6">
                  Release Date: {slide.releaseDate}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
