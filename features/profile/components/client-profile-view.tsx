"use client";

import { ClientProfile } from "../mock-data";
import { TrendingUp, Calendar, Zap } from "lucide-react";

export const ClientProfileView = ({ data }: { data: ClientProfile }) => {
  return (
    <div className="space-y-8 animate-premium-in">
      {/* Client Header */}
      <div className="bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center overflow-hidden">
           <Zap size={40} className="text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-1">{data.name}</h1>
          <p className="text-primary font-bold text-sm uppercase tracking-widest">{data.goal}</p>
        </div>
        <div className="flex gap-4">
            {data.stats.map(stat => (
                <div key={stat.label} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center min-w-[100px]">
                    <div className="text-xl font-black text-foreground">{stat.value}</div>
                    <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Card */}
        <div className="bg-surface p-8 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary uppercase tracking-wider">
            <TrendingUp size={20} /> Transformation Progress
          </h2>
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <span className="text-4xl font-black text-foreground">{data.progress}%</span>
                    <span className="text-foreground/40 text-sm ml-2">to goal</span>
                </div>
                <div className="text-right">
                    <div className="text-xs text-foreground/40 uppercase font-black">Weight Projection</div>
                    <div className="text-sm font-bold">{data.weight.current} → {data.weight.target}</div>
                </div>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                <div 
                    className="h-full bg-primary rounded-full shadow-[0_0_15px_rgb(34,197,94,0.5)] transition-all duration-1000"
                    style={{ width: `${data.progress}%` }}
                />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface p-8 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary uppercase tracking-wider">
            <Calendar size={20} /> Recent Activity
          </h2>
          <div className="space-y-4">
            {data.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all">
                    <span className="font-bold text-foreground/80">{activity.activity}</span>
                    <span className="text-xs text-foreground/40 font-medium px-3 py-1 bg-white/5 rounded-full">{activity.time}</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
