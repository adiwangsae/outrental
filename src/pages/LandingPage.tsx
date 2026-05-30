import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store";
import { ArrowRight, Mountain, ShieldCheck, Clock, Map, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InteractiveJourney from "../components/InteractiveJourney";
import InteractiveSystem from "../components/InteractiveSystem";
import highAngleForestFog from "../assets/images/high_angle_forest_fog_1780117459264.png";
import verticalForestSoignes from "../assets/images/vertical_forest_soignes_1780117482844.png";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const { user, setAuth } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLHeadingElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const pRef = useRef<HTMLParagraphElement>(null);
  
  useEffect(() => {
    // Initial GSAP Reveal
    const tl = gsap.timeline();
    tl.fromTo(title1Ref.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 })
      .fromTo(title2Ref.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.5")
      .fromTo(pRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.4");

    // ScrollTrigger Parallax on Hero
    gsap.to(heroRef.current, {
      y: 150,
      opacity: 0,
      scale: 0.95,
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    // Clean up
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const handleDemoLogin = async (role: 'admin' | 'customer') => {
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setAuth(data.user, data.token);
      toast.success(`Berhasil masuk sebagai Demo ${role === 'admin' ? 'Admin' : 'Pelanggan'}`);
      
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk Demo Mode");
    }
  };

  const scrollToSection = (id: string) => {
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(`#${id}`);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const RevealText = ({ children, delay = 0, yOffset = 40 }: { children: React.ReactNode, delay?: number, yOffset?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0B] text-[#F7F7F7] font-sans selection:bg-[#FF6600] selection:text-white pb-0 mb-0">
      {/* Header */}
      <motion.header 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 md:px-8 pointer-events-none"
      >
        <div className="w-full max-w-6xl pointer-events-auto relative rounded-full bg-black/35 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.16)] flex items-center justify-between px-6 md:px-10 h-16 transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_20px_45px_-5px_rgba(0,0,0,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.22)] hover:bg-[#0B0B0B]/45 overflow-visible">
          
          {/* Liquid Glass Premium Reflection Layer */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/[0.01] via-white/[0.04] to-transparent pointer-events-none" />
          <div className="absolute inset-[0.5px] rounded-full border border-white/[0.03] pointer-events-none" />

          <button 
            onClick={() => scrollToSection('hero')} 
            className="font-bold text-lg md:text-xl tracking-tight text-white select-none cursor-pointer flex items-center gap-1 hover:opacity-85 transition-opacity relative z-10"
          >
            OUTRENT<span className="text-[#FF6600]">.</span>
          </button>
          
          <nav className="hidden md:flex gap-1.5 items-center relative z-10">
            <button onClick={() => scrollToSection('story')} className="text-[13px] font-medium text-[#BDBDBD] hover:text-white hover:bg-white/[0.06] py-1.5 px-4 rounded-full transition-all duration-200 cursor-pointer">Filosofi</button>
            <button onClick={() => scrollToSection('equipment')} className="text-[13px] font-medium text-[#BDBDBD] hover:text-white hover:bg-white/[0.06] py-1.5 px-4 rounded-full transition-all duration-200 cursor-pointer">Eksplorasi</button>
            <button onClick={() => scrollToSection('journey')} className="text-[13px] font-medium text-[#BDBDBD] hover:text-white hover:bg-white/[0.06] py-1.5 px-4 rounded-full transition-all duration-200 cursor-pointer">Perjalanan</button>
            <button onClick={() => scrollToSection('system')} className="text-[13px] font-medium text-[#BDBDBD] hover:text-white hover:bg-white/[0.06] py-1.5 px-4 rounded-full transition-all duration-200 cursor-pointer">Sistem</button>
          </nav>
          
          <div className="hidden md:flex gap-3 items-center relative z-10">
            {user ? (
              <button 
                onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard')}
                className="text-sm font-semibold bg-[#FF6600] text-white px-6 h-10 rounded-full transition-all flex items-center shadow-lg hover:bg-[#E55B00] hover:shadow-[#FF6600]/25 hover:-translate-y-0.5 active:translate-y-0 duration-200"
              >
                Ke Ruang Kerja
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-[#BDBDBD] hover:text-white px-4 py-2 transition-colors duration-200">Masuk</Link>
                <Link to="/register" className="text-sm font-semibold bg-[#F7F7F7] text-[#0B0B0B] hover:bg-white hover:-translate-y-0.5 px-6 h-10 rounded-full flex items-center justify-center transition-all shadow-md duration-200">Memulai</Link>
              </>
            )}
          </div>
          
          <button 
            className="md:hidden text-[#BDBDBD] hover:text-white px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5 hover:border-white/12 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer relative z-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? 'Tutup' : 'Menu'}
          </button>
          
          {/* Mobile Menu Dropdown Panel (also inside AnimatePresence so it animates beautifully matching the header) */}
          <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden absolute top-[calc(100%+10px)] left-0 right-0 bg-[#0B0B0C]/92 backdrop-blur-3xl border border-white/[0.08] p-6 rounded-3xl flex flex-col gap-5 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] z-40 pointer-events-auto"
            >
              <button onClick={() => scrollToSection('story')} className="text-[15px] font-medium text-left px-2 text-[#BDBDBD] hover:text-white transition-all">Filosofi</button>
              <button onClick={() => scrollToSection('equipment')} className="text-[15px] font-medium text-left px-2 text-[#BDBDBD] hover:text-white transition-all">Eksplorasi</button>
              <button onClick={() => scrollToSection('journey')} className="text-[15px] font-medium text-left px-2 text-[#BDBDBD] hover:text-white transition-all">Perjalanan</button>
              <button onClick={() => scrollToSection('system')} className="text-[15px] font-medium text-left px-2 text-[#BDBDBD] hover:text-white transition-all">Sistem</button>
              <div className="h-px w-full bg-white/[0.06]" />
              {user ? (
                <button 
                  onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard')}
                  className="w-full text-center text-sm font-semibold bg-[#FF6600] text-white py-3 rounded-full shadow-lg hover:bg-[#E55B00] transition-colors"
                >
                  Ke Ruang Kerja
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" className="w-full text-center text-sm font-semibold bg-white/5 border border-white/[0.08] hover:bg-white/10 text-white py-3 rounded-full transition-all">Masuk</Link>
                  <Link to="/register" className="w-full text-center text-sm font-semibold bg-[#F7F7F7] text-[#0B0B0B] py-3 rounded-full shadow-lg transition-all">Memulai</Link>
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.header>

      <main className="flex-1 w-full flex flex-col items-center">
        
        {/* SCENE 1 - HERO */}
        <section 
          id="hero"
          className="relative min-h-[100svh] w-full flex flex-col items-center justify-center px-6 pt-28 md:pt-32 pb-16 overflow-hidden"
        >
          {/* Majestic High-Quality Cover Background SVG Artwork */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden bg-[#070708]">
            
            {/* Ambient Base Darkness and Slate Layered Linear Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#070708] via-[#0D0F14] to-[#070708]" />

            {/* Immersive High-Quality Misty Forest High Angle Background Asset */}
            <img 
              src={highAngleForestFog} 
              alt="Majestic Wilderness High Angle Forest Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-[0.62] pointer-events-none select-none filter brightness-[0.75] contrast-[1.1]"
              referrerPolicy="no-referrer"
            />

            {/* Glowing Sunset/Sunrise Horizon Sun-glow (Radial Gradients for Depth) */}
            <div className="absolute bottom-[20%] md:bottom-[25%] left-1/2 -translate-x-1/2 w-[160%] sm:w-[120%] lg:w-[100%] aspect-square rounded-full bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.12)_0%,rgba(180,83,9,0.03)_50%,transparent_100%)] blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[120%] sm:w-[80%] aspect-video rounded-full bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.06)_0%,transparent_70%)] blur-[90px] pointer-events-none" />
            <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-[#FF6600]/10 to-transparent blur-[140px] pointer-events-none" />

            {/* Dynamic Interactive Ambient Floating Sparks/Embers */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => {
                const size = [3, 5, 6, 4, 7][i % 5];
                const left = [10, 24, 38, 52, 68, 82, 94, 18, 33, 61, 77, 89][i % 12];
                const duration = [16, 20, 24, 18, 26, 28][i % 6];
                const delay = i * 1.2;
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.45)_0%,rgba(255,85,0,0.05)_70%,transparent_100%)] filter blur-[1px]"
                    style={{
                      width: size * 3,
                      height: size * 3,
                      left: `${left}%`,
                      bottom: `${15 + (i * 5)}%`,
                      opacity: 0.12 + (i % 3) * 0.08,
                    }}
                    animate={{
                      y: [-40, -420],
                      x: [0, Math.sin(i) * 35, Math.cos(i) * -25, 0],
                      opacity: [0, 0.45, 0.6, 0.2, 0],
                      scale: [0.8, 1.25, 1, 0.85, 0.6],
                    }}
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      delay: delay,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </div>

            {/* Dense Bottom Fade Out overlay ensuring seamless continuation with the following component */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#070708] via-[#070708]/92 to-transparent pointer-events-none" />
            
            {/* Subtle high-contrast soft spotlight overhead */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[40svh] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.015)_0%,transparent_75%)] pointer-events-none" />

            {/* Subtle micro grain noise texture overlay */}
            <div 
              className="absolute inset-0 opacity-[0.012] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }}
            />
          </div>
          
          <div ref={heroRef} className="max-w-[1000px] mx-auto text-center z-10 flex flex-col items-center mt-4 md:mt-0">
            <h1 className="text-[48px] sm:text-[64px] md:text-[88px] leading-[1.05] font-bold tracking-[-0.03em] text-[#F7F7F7] mb-8" style={{ opacity: 0 }} ref={title1Ref as any}>
              Persiapan yang Tepat Membentuk <br className="hidden md:block"/>
              <span className="text-white/70" ref={title2Ref as any}>Perjalanan yang Berkesan.</span>
            </h1>
            
            <p 
              ref={pRef}
              style={{ opacity: 0 }}
              className="text-[16px] md:text-[22px] text-[#BDBDBD] max-w-[720px] mb-8 font-light leading-[1.6]"
            >
              Kelola perlengkapan, pantau penyewaan, dan layani pelanggan dengan lebih mudah melalui satu platform rental outdoor yang praktis dan profesional.
            </p>
          </div>

          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 2, delay: 1.5 }}
             className="absolute bottom-12 flex flex-col items-center gap-4 text-white/30"
          >
             <motion.div 
               animate={{ y: [0, 8, 0] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               className="w-[1px] h-[40px] bg-gradient-to-b from-white/30 to-transparent" 
              />
          </motion.div>
        </section>

        {/* SCENE 2 - STORY */}
        <section id="story" className="py-[120px] md:py-[180px] px-6 bg-gradient-to-b from-[#070708] to-[#0D1016] w-full max-w-[1440px]">
          <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-[120px]">
             <div className="flex-1 flex flex-col gap-6">
               <RevealText yOffset={60}>
                 <span className="text-xs font-mono text-[#FF6600] tracking-widest uppercase">FILOSOFI KESIAPAN</span>
                 <h2 className="text-[36px] md:text-[56px] font-extrabold tracking-tight leading-[1.1] mb-2 mt-1">
                   Alam tidak menoleransi <br className="hidden md:block" /> <span className="text-white font-black">ketidaksiapan.</span>
                 </h2>
               </RevealText>
               <RevealText delay={0.2} yOffset={40}>
                 <p className="text-[18px] md:text-[22px] text-[#BDBDBD] leading-[1.7] font-light max-w-[500px]">
                   Perjalanan yang hebat dimulai jauh sebelum langkah pertama di jalur pendakian. Diawali dari peralatan yang tepat, terawat, dan terjamin keberadaannya.
                 </p>
               </RevealText>
               <RevealText delay={0.3} yOffset={40}>
                 <p className="text-[18px] md:text-[22px] text-[#BDBDBD] leading-[1.7] font-light max-w-[500px]">
                   Outrent memastikan setiap perlengkapan selalu dalam kondisi prima sebelum diserahkan kepada Anda.
                 </p>
               </RevealText>
             </div>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
               whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
               className="flex-1 w-full aspect-square md:aspect-[4/5] bg-[#151515] rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl liquid-glass-card"
             >
                <motion.img 
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop"
                  alt="Nature mountains trekking preparation safety standard"
                  className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none scale-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/80 via-transparent to-transparent opacity-80" />
                
                {/* Floating Glassmorphic Status Indicator Card overlay */}
                <div className="absolute bottom-8 right-8 left-8 p-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-4 z-10 shadow-2xl liquid-glass-card">
                  <div className="w-10 h-10 rounded-full bg-[#FF6600]/20 flex items-center justify-center text-[#FF6600]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="text-white text-xs font-mono uppercase tracking-wider font-bold">Standard Laboratorium</div>
                    <div className="text-[#BDBDBD] text-xs">Uji sterilisasi, kalibrasi presisi, & verifikasi orisinalitas gear.</div>
                  </div>
                </div>
             </motion.div>
          </div>
        </section>

        {/* SCENE 3 - EQUIPMENT */}
        <section id="equipment" className="py-[120px] md:py-[180px] px-6 w-full bg-gradient-to-b from-[#0D1016] to-[#08090C] overflow-hidden">
          <div className="max-w-[1440px] mx-auto w-full">
            <RevealText yOffset={50}>
              <div className="flex flex-col items-center">
                <span className="text-xs font-mono text-[#FF6600] tracking-widest uppercase mb-2">SELEKSI EKSTRA</span>
                <h2 className="text-[36px] md:text-[56px] font-black tracking-tight mb-6 text-center text-white">Instrumen Penjelajahan.</h2>
              </div>
            </RevealText>
            <RevealText delay={0.1}>
              <p className="text-[18px] md:text-[22px] text-[#BDBDBD] text-center max-w-[680px] mx-auto mb-[80px] font-light leading-[1.6]">
                Standar pengerjaan tinggi. Setiap unit diseleksi, dirawat, dan dikalibrasi ulang usai penggunaan.
              </p>
            </RevealText>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-12 w-full max-w-[1240px] mx-auto">
               {[
                 { 
                   title: "Shelter & Tenda", 
                   desc: "MSR Hubba Hubba, Hilleberg, & Geodesic wind-sealed dome shelters.", 
                   img: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop"
                 },
                 { 
                   title: "Carrier & Beban", 
                   desc: "Osprey Atmos AG & Gregory Baltoro ergonomic frames load balancers.", 
                   img: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=600&auto=format&fit=crop"
                 },
                 { 
                   title: "Sistem Memasak", 
                   desc: "Jetboil Flash cooking systems, portable pots & titanium cup accessories.", 
                   img: "https://images.unsplash.com/photo-1526253038957-bce54e05968e?q=80&w=600&auto=format&fit=crop"
                 },
                 { 
                   title: "Sleeping Bags & Thermal", 
                   desc: "Mountain Hardwear & Sea to Summit ultra-light thermoregulation gear.", 
                   img: "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=600&auto=format&fit=crop"
                 },
                 { 
                   title: "Navigasi & Satelit", 
                   desc: "Garmin Handheld GPS and solar-charging multisport navigation links.", 
                   img: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=600&auto=format&fit=crop"
                 },
                 { 
                   title: "Penerangan & Energi", 
                   desc: "Black Diamond Storm headlamps, BioLite lanterns, and high-density powercells.", 
                   img: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?q=80&w=600&auto=format&fit=crop"
                 }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 60, scale: 0.95 }}
                   whileInView={{ opacity: 1, y: 0, scale: 1 }}
                   viewport={{ once: true, margin: "-50px" }}
                   transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                   whileHover={{ y: -8, scale: 1.02 }}
                   className="rounded-[40px] h-[520px] flex flex-col justify-end group transition-all border border-white/5 relative overflow-hidden shadow-2xl"
                 >
                    {/* High Quality Gear Aspect Image */}
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-65 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col p-10 pb-8">
                      <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-black/40 backdrop-blur-md group-hover:bg-white group-hover:text-black transition-all duration-500 ease-out">
                        <ArrowRight size={20} className="transform group-hover:rotate-[-45deg] transition-transform duration-500" />
                      </div>
                      <h3 className="text-[26px] font-semibold text-white mb-3 tracking-tight">{item.title}</h3>
                      <p className="text-[14px] text-[#BDBDBD] font-light leading-[1.6]">{item.desc}</p>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>

        {/* SCENE 4 - BOOKING JOURNEY */}
        <section id="journey" className="py-[120px] md:py-[180px] px-6 bg-gradient-to-b from-[#08090C] to-[#0C0C0E] w-full">
          <div className="max-w-[1240px] mx-auto">
            <RevealText yOffset={50}>
               <div className="flex flex-col items-start mb-16">
                 <span className="text-xs font-mono text-[#FF6600] tracking-widest uppercase">FLOW OPERASI</span>
                 <h2 className="text-[36px] md:text-[56px] font-black tracking-tight mt-1 leading-[1.1] text-white">Proses yang Sunyi.</h2>
               </div>
            </RevealText>
            
            {/* Interactive Journey Step Playground */}
            <InteractiveJourney />
          </div>
        </section>

        {/* SCENE 5 & 6 - SYSTEM REVEAL / OPERATIONAL EXCELLENCE */}
        <section id="system" className="py-[120px] md:py-[180px] px-6 bg-[#0C0C0E] w-full overflow-hidden relative">
          {/* Immersive Dark Misty Landscape Background image for Majestik Dashboard system section from Bruxelles Forêt de Soignes */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <img 
              src={verticalForestSoignes} 
              alt="Misty Forêt de Soignes Backdrop for Majestik Dashboard" 
              className="absolute inset-0 w-full h-full object-cover opacity-[0.42] filter brightness-[0.7] contrast-[1.25] select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Blends smoothly with sections before and after */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0C0C0E] via-[#0C0C0E]/80 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0C0C0E] via-[#0C0C0E]/80 to-transparent pointer-events-none" />
            {/* Soft Ambient Radial Lights */}
            <div className="absolute top-[20%] left-[10%] w-[450px] h-[450px] rounded-full bg-[#FF6600]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[30%] right-[10%] w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none" />
          </div>

          <div className="max-w-[1240px] mx-auto w-full relative z-10">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16 lg:gap-[120px] items-center mb-16">
              
              <div className="lg:col-span-4 flex flex-col gap-6">
                 <RevealText yOffset={50}>
                   <span className="text-xs font-mono text-[#FF6600] tracking-widest uppercase">MAJESTIK DASHBOARD</span>
                   <h2 className="text-[36px] md:text-[48px] font-black tracking-tight mt-1 leading-[1.15] text-white">
                     Di balik visual yang tenang, terdapat orkestrasi yang kokoh.
                   </h2>
                 </RevealText>
                 <RevealText delay={0.2} yOffset={40}>
                   <p className="text-[16px] md:text-[18px] text-[#BDBDBD] font-light leading-[1.7]">
                     Outrent bukan sekadar katalog digital. Ini adalah infrastruktur utuh yang melacak perawatan armada peralatan, memvalidasi integritas penyewa, hingga mengolah data laporan finansial secara holistik.
                   </p>
                 </RevealText>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-6">
                 <RevealText delay={0.3} yOffset={40}>
                   <p className="text-[16px] md:text-[18px] text-[#BDBDBD] font-light leading-[1.7] max-w-[650px]">
                     Setiap modul dirancang untuk satu tujuan: Membiarkan Anda fokus pada eksplorasi, sementara sistem pintar kami mengurus kompleksitas validasi biometrik dan kelayakan logistik di lapangan.
                   </p>
                 </RevealText>
              </div>
            </div>

            {/* Immersive MacBook Laptop mockup frame wrapper around the InteractiveSystem panel */}
            <div className="w-full max-w-[1240px] mx-auto mt-12 relative">
              {/* Laptop screen bevel / border */}
              <div className="bg-[#0D0D11] rounded-t-3xl border-t border-x border-white/10 p-2 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10">
                {/* Embedded Web Camera at top center of display bezel */}
                <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-neutral-900 border border-white/15" />
                
                {/* The display screen content wrapper */}
                <div className="bg-[#0F0F10] rounded-2xl overflow-hidden border border-white/5">
                  <InteractiveSystem />
                </div>
              </div>

              {/* Solid aluminum laptop base frame chassis */}
              <div className="h-3.5 sm:h-5 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 rounded-b-2xl border-t border-white/20 relative shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9)] z-20">
                {/* Finger-grip groove for display opening */}
                <div className="w-16 sm:w-28 h-1 bg-neutral-900 mx-auto rounded-b absolute top-0 left-1/2 -translate-x-1/2" />
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 7 - DEMO CTA */}
        <section id="demo-cta" className="py-[120px] md:py-[180px] px-6 bg-gradient-to-b from-[#0C0C0E] to-[#070708] w-full text-center relative overflow-hidden border-t border-white/5">
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] pointer-events-none blur-[120px]">
              <div className="w-[600px] h-[400px] bg-[#FF7A00] rounded-full" />
           </div>

           <div className="max-w-[1240px] mx-auto relative z-10">
              <RevealText yOffset={60}>
                <span className="text-xs font-mono text-[#FF6600] tracking-widest uppercase">COBA SIMULASI</span>
                <h2 className="text-[48px] md:text-[80px] font-black tracking-tight mb-6 mt-1 leading-none text-white">Alami Sendiri.</h2>
              </RevealText>
              <RevealText delay={0.1} yOffset={40}>
                <p className="text-[20px] md:text-[24px] text-[#BDBDBD] max-w-[640px] mx-auto font-light leading-[1.6] mb-12">
                  Jelajahi ekosistem melalui simulasi yang aman. Pilih perspektif untuk memulai perjalanan.
                </p>
              </RevealText>
              
              {/* Premium Role Selective Link Cards with rich Unsplash background imagery */}
              <RevealText delay={0.2} yOffset={40}>
                <div className="flex flex-col sm:flex-row justify-center gap-8 max-w-[960px] mx-auto">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('customer')}
                    className="flex-1 min-h-[300px] rounded-[40px] transition-all cursor-pointer group border border-white/5 hover:border-white/10 relative overflow-hidden shadow-2xl text-left flex flex-col justify-end p-8 sm:p-10"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop"
                      alt="Enchanting hikers path through green forest canopy"
                      className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 space-y-2">
                      <span className="text-[10px] font-mono tracking-widest text-[#FF7A00] font-bold uppercase">AKSES INSTAN PELANGGAN</span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-[#FF7A00] transition-colors leading-tight">Mulai Eksplorasi</h3>
                      <p className="text-sm text-[#BDBDBD] font-light">Mencoba memilih peralatan, hitung berat, & lakukan simulasi booking virtual.</p>
                    </div>
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('admin')}
                    className="flex-1 min-h-[300px] rounded-[40px] transition-all cursor-pointer group border border-white/5 hover:border-white/10 relative overflow-hidden shadow-2xl text-left flex flex-col justify-end p-8 sm:p-10"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=800&auto=format&fit=crop"
                      alt="Cosmic sky aurora mountain campsite hub"
                      className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 space-y-2">
                      <span className="text-[10px] font-mono tracking-widest text-[#FF7A00] font-bold uppercase">PERSPEKTIF OPERATOR</span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-[#FF7A00] transition-colors leading-tight">Kelola Armada</h3>
                      <p className="text-sm text-[#BDBDBD] font-light">Simulasikan validasi KTP, pantau armada logistik, & kelola dashboard admin.</p>
                    </div>
                  </motion.button>
                </div>
              </RevealText>
           </div>
         </section>
       </main>

       <footer className="w-full bg-[#070708] pt-[80px] pb-[40px] px-6 relative z-10 mt-auto border-t border-white/5">
          <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
             <h2 className="text-[24px] font-bold tracking-tight mb-[40px] text-white">OUTRENT.</h2>
             <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-[60px] text-center">
                <Link to="/about" className="text-[14px] font-medium text-[#BDBDBD] hover:text-[#FF6600] transition-colors">Tentang Kami</Link>
                <Link to="/terms" className="text-[14px] font-medium text-[#BDBDBD] hover:text-[#FF6600] transition-colors">Syarat & Ketentuan</Link>
             </div>
             <div className="text-[12px] text-[#BDBDBD]/60 font-light tracking-wide uppercase text-center px-4">
                &copy; 2026 Outrent Digital Platform. Hak Cipta Dilindungi.
             </div>
          </div>
       </footer>
    </div>
  );
}



