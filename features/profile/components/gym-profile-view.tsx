"use client";

import { GymProfile } from "../mock-data";
import { MapPin, Star, Users, Clock } from "lucide-react";
import Image from "next/image";

export const GymProfileView = ({ data }: { data: GymProfile }) => {
  return (
    <div className="space-y-8 animate-premium-in">
      {/* Gym Header */}
      <div className="bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-32 h-32 rounded-2xl bg-primary/10 border border-primary/20 overflow-hidden relative">
           <Image 
                src={data.image} 
                alt={data.name} 
                fill 
                className="object-cover p-4"
            />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">{data.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-foreground/60 text-sm">
            <span className="flex items-center gap-1"><MapPin size={16} /> {data.location}</span>
            <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500" /> {data.rating} Rating</span>
            <span className="flex items-center gap-1"><Users size={16} /> {data.memberCount} Members</span>
            <span className="flex items-center gap-1"><Clock size={16} /> {data.workingHours}</span>
          </div>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20">
          Book a Tour
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="bg-surface p-8 rounded-3xl border border-white/5">
            <h2 className="text-xl font-bold mb-4 text-primary uppercase tracking-wider">About our facility</h2>
            <p className="text-foreground/70 leading-relaxed italic">{data.description}</p>
          </div>
          
          {/* Programs */}
          <div className="bg-surface p-8 rounded-3xl border border-white/5">
            <h2 className="text-xl font-bold mb-6 text-primary uppercase tracking-wider">Active Programs</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.programs.map(program => (
                <div key={program} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center font-bold text-sm">
                  {program}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-surface p-8 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold mb-6 text-primary uppercase tracking-wider">Facilities</h2>
          <ul className="space-y-4">
            {data.facilities.map(facility => (
              <li key={facility} className="flex items-center gap-3 text-foreground/80 font-medium">
                <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgb(34,197,94)]" />
                {facility}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
