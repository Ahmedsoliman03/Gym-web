"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

interface Transformation {
  clientName: string;
  duration: string;
  image: string;
}

interface TransformationGalleryProps {
  transformations: Transformation[];
}

export const TransformationGallery = ({
  transformations,
}: TransformationGalleryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
        const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
        setActiveIndex(index);
    }
  };

  return (
    <div className="bg-surface p-8 rounded-3xl border border-white/5 overflow-hidden">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-wider text-primary">
          Transformation Gallery
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={() => scroll("left")}
                className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-foreground/40 hover:text-foreground active:scale-95"
            >
                <ChevronRight size={20} className="rotate-180" />
            </button>
            <button 
                onClick={() => scroll("right")}
                className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-foreground/40 hover:text-foreground active:scale-95"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <div className="relative">
        <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-4 px-2 no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {transformations.map((item, index) => (
            <div 
                key={index} 
                className="group relative min-w-[280px] md:min-w-[400px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 snap-start shrink-0"
            >
              <Image
                src={item.image}
                alt={item.clientName}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                <span className="text-foreground font-bold text-xl">{item.clientName}</span>
                <span className="text-primary font-bold text-sm uppercase tracking-widest mt-1">
                    {item.duration} Transformation
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Custom scrollbar indicator */}
        <div className="flex justify-center gap-1.5 mt-2">
            {transformations.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-white/10'}`} />
            ))}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
