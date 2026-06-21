/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export const StarryBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Immersive night sky backdrop gradient */}
      <div 
        className="absolute inset-0 bg-radial-[ellipse_at_top_right]" 
        style={{
          background: "radial-gradient(ellipse at 50% 0%, #0c1a12 0%, #050a06 70%, #030604 100%)"
        }}
      />

      {/* Futuristic Aurora Glow (Cinematic Deep Blue / Teal Overlay) */}
      <div 
        className="absolute top-[-10%] left-[10%] w-[80vw] h-[50vh] rounded-full blur-[140px] opacity-15 pointer-events-none transition-transform will-change-transform"
        style={{
          background: "radial-gradient(circle, #0e7490 0%, #0369a1 40%, transparent 75%)",
          animation: "float 14s ease-in-out infinite"
        }}
      />
      <div 
        className="absolute top-[-20%] right-[5%] w-[60vw] h-[40vh] rounded-full blur-[140px] opacity-10 pointer-events-none transition-transform will-change-transform"
        style={{
          background: "radial-gradient(circle, #3f8037 0%, #1e3c1a 50%, transparent 80%)",
          animation: "float 18s ease-in-out infinite reverse"
        }}
      />

      {/* Stars Layer with custom twinkles */}
      <div className="absolute inset-0 opacity-30">
        {/* Twinkly star coordinates (simulated vector dots) */}
        <div className="absolute top-[12%] left-[8%] w-[1.5px] h-[1.5px] bg-white rounded-full star-twinkle-cinematic" />
        <div className="absolute top-[18%] left-[24%] w-[2px] h-[2px] bg-amber-100 rounded-full star-twinkle-cinematic [animation-delay:0.8s]" />
        <div className="absolute top-[8%] left-[45%] w-[1.5px] h-[1.5px] bg-white rounded-full star-twinkle-cinematic [animation-delay:1.2s]" />
        <div className="absolute top-[22%] left-[62%] w-[2px] h-[2px] bg-sky-100 rounded-full star-twinkle-cinematic [animation-delay:2.4s]" />
        <div className="absolute top-[15%] left-[84%] w-[1.5px] h-[1.5px] bg-white rounded-full star-twinkle-cinematic [animation-delay:3.2s]" />
        <div className="absolute top-[35%] left-[15%] w-[1.5px] h-[1.5px] bg-amber-100 rounded-full star-twinkle-cinematic [animation-delay:0.4s]" />
        <div className="absolute top-[28%] left-[39%] w-[2px] h-[2px] bg-white rounded-full star-twinkle-cinematic [animation-delay:1.9s]" />
        <div className="absolute top-[38%] left-[72%] w-[1.5px] h-[1.5px] bg-white rounded-full star-twinkle-cinematic [animation-delay:2.8s]" />
        <div className="absolute top-[30%] left-[90%] w-[1.5px] h-[1.5px] bg-[#f0fdf4] rounded-full star-twinkle-cinematic [animation-delay:3.5s]" />
        <div className="absolute top-[48%] left-[53%] w-[1.5px] h-[1.5px] bg-white rounded-full star-twinkle-cinematic [animation-delay:1.5s]" />
      </div>

      {/* Moving Cosmic Fog Layer */}
      <div 
        className="absolute inset-0 opacity-15 mix-blend-color-dodge fog-layer pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 30% 90%, rgba(45, 90, 39, 0.4), transparent 60%), radial-gradient(circle at 80% 85%, rgba(59, 130, 246, 0.3), transparent 60%)",
          filter: "blur(40px)"
        }}
      />

      {/* Vector Mountain Silhouette silhouette layer at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[220px] opacity-75 pointer-events-none">
        <svg 
          viewBox="0 0 1440 320" 
          className="absolute bottom-[-10px] w-full h-[180px] text-[#050b07] fill-current" 
          preserveAspectRatio="none"
        >
          {/* Back distant mountains */}
          <path d="M0,180 L220,90 L460,160 L780,50 L1080,140 L1280,80 L1440,160 L1440,320 L0,320 Z" opacity="0.35" />
          {/* Midground mountains */}
          <path d="M0,230 L310,130 L640,210 L940,110 L1200,180 L1440,140 L1440,320 L0,320 Z" opacity="0.65" />
        </svg>

        <svg 
          viewBox="0 0 1440 320" 
          className="absolute bottom-0 w-full h-[120px] text-[#020503] fill-current" 
          preserveAspectRatio="none"
        >
          {/* Foreground mountain ridges & forest profile */}
          <path d="M0,260 L180,210 L410,250 L680,180 L960,240 L1180,190 L1440,230 L1440,320 L0,320 Z" />
        </svg>
      </div>

      {/* Campsite & Campfire ambient orange glow projection */}
      <div className="absolute bottom-[2%] left-[48%] -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center">
        {/* Fire glow bloom */}
        <div 
          className="w-[140px] h-[140px] rounded-full blur-[35px] opacity-60 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #f59e0b 0%, #eab308 30%, transparent 70%)"
          }}
        />
        {/* Vector Campfire Flame */}
        <div className="absolute bottom-[40px] w-8 h-10 flame-anim flex items-end justify-center">
          <div className="w-6 h-8 bg-gradient-to-t from-red-600 via-amber-500 to-yellow-300 rounded-b-xl rounded-t-3xl blur-[1px]" />
          <div className="absolute w-3 h-5 bg-yellow-200 rounded-b-xl rounded-t-2xl blur-[1px] bottom-1" />
        </div>
        {/* Simple logs */}
        <div className="absolute bottom-[35px] w-12 h-2 bg-amber-950 rounded-full transform rotate-[15deg]" />
        <div className="absolute bottom-[35px] w-12 h-2 bg-amber-900 rounded-full transform -rotate-[15deg]" />
        
        {/* Soft Ember Particles */}
        <div className="absolute bottom-[60px] w-1.5 h-1.5 bg-yellow-400 rounded-full blur-[0.5px] spark-particle-1" />
        <div className="absolute bottom-[55px] left-[-5px] w-1 h-1 bg-amber-400 rounded-full blur-[0.5px] spark-particle-2" />
        <div className="absolute bottom-[58px] right-[-8px] w-1 h-1 bg-orange-400 rounded-full blur-[0.5px] spark-particle-3" />
        <div className="absolute bottom-[65px] left-[5px] w-1 h-1 bg-yellow-200 rounded-full blur-[0.5px] spark-particle-4" />
        <div className="absolute bottom-[50px] right-[5px] w-1 h-1 bg-amber-300 rounded-full blur-[0.5px] spark-particle-5" />
      </div>
    </div>
  );
};
export default StarryBackground;
