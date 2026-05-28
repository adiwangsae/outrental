/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export const GlobalBackground: React.FC = () => {
  const { scrollY } = useScroll();
  
  // Parallax effects for different layers
  const fogY = useTransform(scrollY, [0, 5000], [0, -200]);
  const starsY = useTransform(scrollY, [0, 5000], [0, -100]);
  const mountainY = useTransform(scrollY, [0, 1000], [0, 50]);

  // Generate stars once to prevent re-renders
  const stars = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 3,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  return (
    <div className="bg-ecosystem">
      {/* Noise Grain Layer */}
      <div className="noise-grain" />

      {/* Primary Ambient Gradient Bloom */}
      <div 
        className="absolute inset-0 opacity-20 ambient-bloom"
        style={{
          background: "radial-gradient(circle at 70% 30%, var(--color-forest) 0%, transparent 60%), radial-gradient(circle at 20% 70%, #082f49 0%, transparent 60%)"
        }}
      />

      {/* Twinkling Stars Layer with Parallax */}
      <motion.div 
        style={{ y: starsY }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full star-shimmer"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity * 0.7,
              "--delay": `${star.delay}s`,
              "--duration": `${star.duration}s`,
            } as any}
          />
        ))}
      </motion.div>

      {/* Layered Cinematic Fog */}
      <motion.div 
        style={{ y: fogY }}
        className="absolute inset-0 z-0 pointer-events-none mix-blend-screen overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-5 fog-cinematic"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 80%, rgba(45, 90, 39, 0.3), transparent 50%), radial-gradient(circle at 80% 90%, rgba(204, 85, 0, 0.1), transparent 50%)",
            filter: "blur(60px)"
          }}
        />
        <div 
          className="absolute inset-0 opacity-[0.03] fog-cinematic"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(45, 90, 39, 0.15), transparent 70%)",
            filter: "blur(100px)",
            animationDelay: "-10s",
            animationDuration: "50s"
          }}
        />
      </motion.div>

      {/* Mountain Silhouettes at bottom */}
      <motion.div 
        style={{ y: mountainY }}
        className="absolute bottom-0 left-0 right-0 h-[400px] pointer-events-none z-1 overflow-hidden"
      >
        <svg 
          viewBox="0 0 1440 320" 
          className="absolute bottom-[-20px] w-full h-[250px] text-[#020503] fill-current opacity-60 shrink-0" 
          preserveAspectRatio="none"
        >
          <path d="M0,180 L220,110 L460,190 L780,80 L1080,160 L1280,100 L1440,180 L1440,320 L0,320 Z transition-all" />
        </svg>
        <svg 
          viewBox="0 0 1440 320" 
          className="absolute bottom-0 w-full h-[180px] text-[#010502] fill-current opacity-90" 
          preserveAspectRatio="none"
        >
          <path d="M0,240 L180,180 L410,230 L680,150 L960,220 L1180,170 L1440,210 L1440,320 L0,320 Z" />
        </svg>
      </motion.div>

      {/* Ambient Floor Glow */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[30vh] pointer-events-none opacity-30"
        style={{
          background: "linear-gradient(to top, #050a06 0%, transparent 100%)"
        }}
      />
      {/* Mountain Silhouettes — Subtle Depth */}
      <motion.div 
        className="absolute inset-x-0 bottom-0 pointer-events-none opacity-[0.04] z-0 h-[40vh]"
        style={{ y: useTransform(scrollY, [0, 1000], [0, 100]) }}
      >
        <svg viewBox="0 0 1440 320" className="w-full h-full fill-current text-white" preserveAspectRatio="none">
          <path d="M0,224L120,192C240,160,480,96,720,106.7C960,117,1200,203,1320,245.3L1440,288L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z" />
        </svg>
      </motion.div>

      {/* Floor Glow Grounding Section */}
      <div className="absolute inset-x-0 bottom-0 h-[15vh] bg-gradient-to-t from-orange/5 to-transparent pointer-events-none opacity-40 z-2" />

    </div>
  );
};

export default GlobalBackground;
