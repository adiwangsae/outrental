/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { LucideIcon } from "./LucideIcon";
import { Footer } from "./Footer";

interface LandingPageProps {
  setPage: (page: string) => void;
  setAuthTab: (tab: "login" | "register") => void;
  fillDemoAccount: (role: "admin" | "customer") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setPage,
  setAuthTab,
  fillDemoAccount,
}) => {
  const [activeSection, setActiveSection] = useState(0);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState<"booking" | "pricing" | "maintenance" | "conflict">("booking");
  
  // Interactive Availability State
  const [selectedGear, setSelectedGear] = useState("Tenda Dome 4P");
  const [checkStartDate, setCheckStartDate] = useState("2026-05-24");
  const [checkEndDate, setCheckEndDate] = useState("2026-05-26");
  const [availQueryRes, setAvailQueryRes] = useState({
    status: "available",
    msg: "Tersedia! 100% Siap dipinjam.",
    detail: "Stok aktif: 5 unit. Bebas bentrok jadwal pada tanggal terpilih.",
    price: 75000,
    disc: 0,
    total: 150000
  });

  // Bundle Selector State
  const [bundleMain, setBundleMain] = useState("Tenda");
  const [bundleAddons, setBundleAddons] = useState<string[]>([]);

  // Damage Slider Comparison State
  const [sliderPos, setSliderPos] = useState(50);

  // Digital Agreement state
  const [digitalSignedName, setDigitalSignedName] = useState("");
  const [isAgreementAccepted, setIsAgreementAccepted] = useState(false);
  const [isAgreementSigned, setIsAgreementSigned] = useState(false);

  // Reference for the outer scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
  });

  // Layered depth transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  // Scroll offset & cursor glowing coordinates
  const [scrollTop, setScrollTop] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Use IntersectionObserver to highlight current active slide side-dot
  useEffect(() => {
    const sections = scrollContainerRef.current?.querySelectorAll(".snap-scroll-section");
    if (!sections) return;

    const observerOption = {
      root: scrollContainerRef.current,
      threshold: 0.6, // Trigger dot update when 60% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-index") || "0");
          setActiveSection(index);
        }
      });
    }, observerOption);

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, []);

  // Quick anchor scroll helper
  const scrollToSection = (idx: number) => {
    const targetSection = scrollContainerRef.current?.querySelector(`[data-index='${idx}']`);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
      setActiveSection(idx);
    }
  };

  // Perform demo access login
  const triggerDemoLogin = (role: "admin" | "customer") => {
    fillDemoAccount(role);
    setAuthTab("login");
    setPage("login_screen");
  };

  // Calculate dynamic pricing & stock overlap simulator
  const handleCheckAvail = (gear: string, sDate: string, eDate: string) => {
    const days = Math.max(1, Math.ceil((new Date(eDate).getTime() - new Date(sDate).getTime()) / (1000 * 3600 * 24)));
    let basePrice = 75000;
    if (gear === "Carrier 60L") basePrice = 50000;
    if (gear === "Kompor Portable") basePrice = 30000;
    if (gear === "Sleeping Bag") basePrice = 35000;

    // Surcharge and discount calculations
    const isWeekend = new Date(sDate).getDay() === 0 || new Date(sDate).getDay() === 6;
    const rateMul = isWeekend ? 1.15 : 1.0; // Weekend surcharge +15%
    const disRate = days >= 3 ? 0.10 : 0.0; // Long rent discount >3 days 10%
    
    const finalDayRate = Math.round(basePrice * rateMul);
    const subTotal = finalDayRate * days;
    const discountAmount = Math.round(subTotal * disRate);
    const finalTotal = subTotal - discountAmount;

    // Simulate warning logic for dates
    const isConflict = sDate === "2026-05-12" || sDate === "2026-05-13" || sDate === "2026-05-14";

    if (isConflict) {
      setAvailQueryRes({
        status: "conflict",
        msg: `${gear} penuh pada tanggal terpilih!`,
        detail: `Estimasi unit tersedia kembali mulai 15 Mei 2026. Pilih tanggal lain.`,
        price: basePrice,
        disc: 0,
        total: 0
      });
    } else {
      setAvailQueryRes({
        status: "available",
        msg: "Sangat Tersedia! Unit steril siap diambil.",
        detail: `Rincian: Harian ${isWeekend ? "(Weekend Surcharge +15%)" : "(Weekday Normal)"}. ${days >= 3 ? "Paket Bundle Hemat >3 hari aktif (Diskon -10%)" : "Tarif Standar."}`,
        price: finalDayRate,
        disc: discountAmount,
        total: finalTotal
      });
    }
  };

  useEffect(() => {
    handleCheckAvail(selectedGear, checkStartDate, checkEndDate);
  }, [selectedGear, checkStartDate, checkEndDate]);

  // Handle bundle option toggling
  const toggleBundleAddon = (item: string) => {
    if (bundleAddons.includes(item)) {
      setBundleAddons(bundleAddons.filter(a => a !== item));
    } else {
      setBundleAddons([...bundleAddons, item]);
    }
  };

  return (
    <div className="flex flex-col h-svh text-[#eef5ec] overflow-hidden sf-pro-font relative">
      
      {/* FLOATING TRANSPARENT GLASS BRAND NAVBAR */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 px-6 transition-all duration-500 ${
          scrollTop > 50 ? "liquid-glass-navbar py-2 backdrop-blur-3xl" : "bg-transparent backdrop-blur-none"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection(0)}>
            <div className="w-10 h-10 rounded-xl bg-forest border border-white/15 flex items-center justify-center shadow-lg group">
              <LucideIcon name="Tent" className="text-white group-hover:scale-110 transition-transform" size={20} />
            </div>
            <div>
              <span className="heading-caps text-lg font-black tracking-widest text-white block leading-none">
                OUTRENT
              </span>
            </div>
          </div>

          {/* Clean Navigation (Max 5-6 Items) */}
          <div className="hidden md:flex items-center gap-8 text-[#a3b8a1] text-[11px] font-black font-sans uppercase tracking-[0.1em]">
            <button 
              onClick={() => scrollToSection(1)} 
              className={`hover:text-white transition-colors py-1 relative group ${activeSection === 1 ? "text-white" : ""}`}
            >
              Fitur
              <span className={`absolute bottom-0 left-0 h-[2px] bg-forest transition-all duration-500 ${activeSection === 1 ? "w-full" : "w-0 group-hover:w-1/2"}`} />
            </button>
            <button 
              onClick={() => scrollToSection(2)} 
              className={`hover:text-white transition-colors py-1 relative group ${activeSection === 2 ? "text-white" : ""}`}
            >
              Alur
              <span className={`absolute bottom-0 left-0 h-[2px] bg-forest transition-all duration-500 ${activeSection === 2 ? "w-full" : "w-0 group-hover:w-1/2"}`} />
            </button>
            <button 
              onClick={() => scrollToSection(3)} 
              className={`hover:text-white transition-colors py-1 relative group ${activeSection === 3 ? "text-white" : ""}`}
            >
              Simulasi
              <span className={`absolute bottom-0 left-0 h-[2px] bg-forest transition-all duration-500 ${activeSection === 3 ? "w-full" : "w-0 group-hover:w-1/2"}`} />
            </button>
            <button 
              onClick={() => scrollToSection(4)} 
              className={`hover:text-white transition-colors py-1 relative group ${activeSection === 4 ? "text-white" : ""}`}
            >
              Keunggulan
              <span className={`absolute bottom-0 left-0 h-[2px] bg-forest transition-all duration-500 ${activeSection === 4 ? "w-full" : "w-0 group-hover:w-1/2"}`} />
            </button>
            <button 
              onClick={() => scrollToSection(5)} 
              className={`hover:text-white transition-colors py-1 relative group ${activeSection === 5 ? "text-white" : ""}`}
            >
              Ulasan
              <span className={`absolute bottom-0 left-0 h-[2px] bg-forest transition-all duration-500 ${activeSection === 5 ? "w-full" : "w-0 group-hover:w-1/2"}`} />
            </button>
          </div>

          {/* Actions Block */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowDemoModal(true)}
              className="hidden lg:flex items-center gap-1.5 text-forest hover:text-white text-[10px] font-black px-3 py-1.5 transition-all uppercase tracking-[0.15em] border border-forest/20 rounded-lg bg-forest/5"
            >
              <LucideIcon name="Shield" size={12} />
              DEMO
            </button>
            <button
              onClick={() => {
                setAuthTab("login");
                setPage("login_screen");
              }}
              className="text-[#a3b8a1] hover:text-white text-[11px] font-black px-3 py-1.5 transition-all uppercase tracking-widest"
            >
              LOGIN
            </button>
            <button
              onClick={() => {
                setAuthTab("register");
                setPage("login_screen");
              }}
              className="liquid-glass-button bg-stone-200 text-black hover:bg-white font-black px-6 py-2.5 rounded-xl text-[11px] uppercase tracking-widest shadow-lg shadow-white/10 border-none transition-all hover:scale-105 active:scale-95"
            >
              DAFTAR
            </button>
          </div>

        </div>
      </motion.nav>

      {/* FLOAT SIDE DOT INDICATOR NAVIGATOR */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
        {[
          "Beranda",
          "Fitur Utama",
          "Alur Rental",
          "Pusat Simulasi",
          "Keunggulan",
          "Showcase Operasional",
          "OUTRENT Info"
        ].map((title, index) => {
          const isAct = activeSection === index;
          return (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className="group flex items-center justify-end gap-3.5 outline-none relative"
              title={title}
            >
              <span className={`text-[10px] uppercase tracking-wider font-extrabold text-forest transition-all duration-300 absolute right-6 opacity-0 group-hover:opacity-100 pr-1 ${isAct ? "opacity-100 font-black text-white" : ""}`}>
                {title}
              </span>
              <div 
                className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                  isAct 
                    ? "bg-forest border-forest scale-125 shadow-[0_0_15px_rgba(45,90,39,0.6)]" 
                    : "bg-white/10 border-white/20 group-hover:bg-white/30"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* MANDATORY SCROLL SNAP VERTICAL CONTAINER */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="snap-scroll-container flex-1 z-10 w-full"
      >
        
        {/* =========================================
            SECTION 1 — HERO SECTION
            ========================================= */}
        <section 
          data-index={0}
          className="snap-scroll-section hero-container px-6 sm:px-8 md:px-12 py-12 md:py-16 relative flex flex-col justify-center items-center text-center h-auto min-h-svh md:h-screen md:max-h-screen md:overflow-hidden shrink-0"
        >
          <motion.div 
            className="max-w-5xl mx-auto w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="hero-title text-glow-subtle text-white uppercase text-center relative pointer-events-none select-none tracking-tight leading-[0.95]" style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}>
              <motion.span 
                className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-100 to-stone-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                initial={{ opacity: 0, y: 35, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Rental Perlengkapan
              </motion.span>
              <motion.span 
                className="block text-gradient-rinjani text-glow-subtle font-normal tracking-wide"
                initial={{ opacity: 0, y: 45, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
                transition={{ delay: 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Outdoor
              </motion.span>
            </h1>

            <motion.p 
              className="text-[clamp(1rem,1.5vw,1.2rem)] text-stone-300 max-w-2xl mx-auto px-4 sm:px-0 font-normal tracking-wide leading-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Semua kebutuhan pendakian dan camping dalam satu sistem rental yang terorganisir, aman, dan nyaman.
            </motion.p>

            <motion.div 
              className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => {
                  setPage("katalog_utama");
                }}
                className="liquid-glass-button bg-forest hover:bg-white hover:text-black hover:border-white text-white font-black px-10 py-4 rounded-2xl text-xs uppercase tracking-[0.25em] transition-all duration-500 hover:scale-[1.03] shadow-[0_15px_40px_rgba(45,90,39,0.4)] flex items-center gap-3.5"
              >
                Mulai Booking
                <LucideIcon name="ChevronRight" size={16} />
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* =========================================
            SECTION 2 — FITUR UTAMA
            ========================================= */}
        <section 
          data-index={1}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 py-16 md:py-24 relative flex flex-col justify-center items-center h-auto min-h-svh md:h-screen md:max-h-screen overflow-hidden shrink-0"
        >
          <div className="max-w-7xl mx-auto w-full flex flex-col justify-center space-y-8 sm:space-y-12">
            
            {/* Minimal Header */}
            <motion.div 
              className="text-left space-y-0.5"
              initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0)" }}
              viewport={{ once: true, margin: "-10px" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[9px] font-black uppercase text-forest tracking-widest leading-none drop-shadow-sm">
                ARSITEKTUR OPERASIONAL
              </span>
              <h2 className="heading-crisp text-fluid-section uppercase">
                EMPAT PILAR INFRASTRUKTUR SISTEM
              </h2>
              <motion.div 
                className="w-12 h-1 bg-forest rounded-full shadow-[0_0_10px_rgba(45,90,39,0.5)]" 
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>

            {/* 2x2 Clean Modern Grid Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {[
                {
                  title: "Smart Booking System",
                  desc: "Reservasi online mandiri.",
                  icon: "Calendar",
                  color: "from-forest/40 to-[#1e3a1a]/20"
                },
                {
                  title: "Tracking Rental Logistik",
                  desc: "Lacak posisi barang real-time.",
                  icon: "Package",
                  color: "from-sky-950/40 to-blue-950/20"
                },
                {
                  title: "Dashboard Realtime",
                  desc: "Panel kendali terpadu admin.",
                  icon: "BarChart3",
                  color: "from-purple-950/40 to-indigo-950/20"
                },
                {
                  title: "Digital Verification",
                  desc: "Validasi file dokumen digital.",
                  icon: "ShieldCheck",
                  color: "from-amber-950/40 to-orange-950/20"
                }
              ].map((fitur, idx) => (
                <motion.div 
                  key={idx}
                  className="liquid-glass-card p-4 sm:p-5 flex flex-col justify-start h-auto min-h-[140px] group relative overflow-hidden w-full border-white/10"
                  initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
                  viewport={{ once: true, margin: "-10px" }}
                  transition={{ duration: 1.2, delay: 0.15 * idx, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${fitur.color} opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-700`} />
                  <div className="w-11 h-11 rounded-xl bg-white/5 text-white backdrop-blur-md flex items-center justify-center border border-white/15 shadow-md mb-3 group-hover:bg-forest/20 group-hover:border-forest group-hover:text-forest transition-all duration-700">
                    <LucideIcon name={fitur.icon} size={20} />
                  </div>
                  <div className="space-y-1.5 relative z-10">
                    <h3 className="text-white text-[11px] sm:text-xs font-black uppercase tracking-wider">{fitur.title}</h3>
                    <p className="text-[10px] sm:text-[11px] text-[#a3b8a1] leading-relaxed font-medium">{fitur.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================
            SECTION 3 — WORKFLOW RENTAL TIMELINE
            ========================================= */}
        <section 
          data-index={2}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 py-16 md:py-24 relative flex flex-col justify-center items-center h-auto min-h-svh md:h-screen md:max-h-screen overflow-hidden shrink-0"
        >
          <motion.div 
            className="max-w-7xl mx-auto w-full flex flex-col justify-center items-center space-y-8 sm:space-y-12"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0)" }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            
            {/* Section Heading */}
            <div className="text-center space-y-2">
              <motion.span 
                className="text-[9px] font-black uppercase text-forest tracking-[0.2em] block leading-none drop-shadow-sm"
                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                TRANSPARANSI PROSES SEGMENTASI
              </motion.span>
              <h2 className="heading-crisp text-fluid-section uppercase">
                ALUR PERJALANAN LOGISTIK RENTAL
              </h2>
              <motion.div 
                className="w-12 h-1 bg-forest mx-auto rounded-full shadow-[0_0_10px_rgba(45,90,39,0.5)]" 
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Horizontal Timeline Flow without messy arrows */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-left relative z-10 py-4">
              {[
                { step: "01", name: "Booking Online", details: "Pilih tanggal sewa aktif & tentukan logistik.", icon: "FormInput" },
                { step: "02", name: "Verifikasi Berkas", details: "Admin validasi identitas & jaminan.", icon: "SearchCode" },
                { step: "03", name: "Pembayaran Aman", details: "Pelunasan via transfer atau bayar tunai.", icon: "CreditCard" },
                { step: "04", name: "Serah Terima", details: "Cek barang & kelengkapan saat serah terima.", icon: "Tent" },
                { step: "05", name: "Pengembalian", details: "Sterilisasi sanitasi & retur jaminan.", icon: "RotateCcw" },
              ].map((step, idx) => (
                <motion.div 
                  key={idx}
                  className="liquid-glass-card p-4 rounded-[18px] relative space-y-1.5 flex flex-col justify-between h-auto min-h-[120px]"
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
                  viewport={{ once: true, margin: "-10px" }}
                  transition={{ duration: 1.2, delay: 0.4 + (idx * 0.15), ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-forest bg-forest/10 border border-forest/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                      STEP {step.step}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-stone-300 flex items-center justify-center transition-colors duration-500 group-hover:bg-forest/20 group-hover:text-forest group-hover:border-forest/30">
                      <LucideIcon name={step.icon} size={13} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-black text-[10px] uppercase tracking-wider leading-tight">{step.name}</h4>
                    <p className="text-[9.5px] text-[#8ca38a] mt-1 leading-relaxed font-light">{step.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </section>

        {/* =========================================
            SECTION 4 — INTERACTIVE SIMULATION (SMART ENGINE DEMO WIDGETS)
            ========================================= */}
        <section 
          data-index={3}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 py-16 md:py-24 relative flex flex-col items-center justify-center h-auto min-h-svh md:h-screen md:max-h-screen overflow-hidden shrink-0"
        >
          <motion.div 
            className="max-w-7xl mx-auto w-full flex flex-col justify-center h-auto md:h-[78vh] shrink-0"
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0)" }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            
            {/* Layout Box with Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center flex-1 min-h-0 overflow-hidden py-4">
              
              {/* Left Column: Heading + Tabs */}
              <motion.div 
                className="lg:col-span-5 flex flex-col space-y-5 lg:space-y-10"
                initial={{ opacity: 0, x: -30, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0)" }}
                viewport={{ once: true, margin: "-10px" }}
                transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-left space-y-2">
                  <h2 className="heading-crisp text-fluid-section uppercase">
                    PUSAT SIMULASI
                  </h2>
                  <p className="text-fluid-subtitle text-[#a3b8a1] max-w-sm font-medium">
                    Explore our smart rental engine through interactive logic widgets.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:flex lg:flex-col gap-1.5 sm:gap-2 flex-shrink-0 p-1 -m-1">
                  {[
                    { id: "booking", label: "Smart Availability", icon: "CalendarRange" },
                    { id: "pricing", label: "Bundle Recommendation", icon: "Layers" },
                    { id: "maintenance", label: "Damage Assessment", icon: "Sliders" },
                    { id: "conflict", label: "Digital Agreement", icon: "FileSignature" }
                  ].map((tab, idx) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-xl border transition-all duration-500 text-neutral-200 outline-none flex flex-col items-center justify-center lg:flex-row lg:justify-start lg:items-center gap-1.5 sm:gap-2.5 h-full min-h-[50px] lg:min-h-[58px] ${
                        activeTab === tab.id
                          ? "bg-forest/10 border-forest/35 text-white shadow-[0_0_20px_rgba(45,90,39,0.15)] scale-[1.02]"
                          : "bg-white/3 border-white/5 hover:bg-white/5 text-[#8ca38a] hover:border-white/10"
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + (idx * 0.1), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className={activeTab === tab.id ? "text-forest" : "text-[#8ca38a]"}>
                        <LucideIcon name={tab.icon} size={13} className="mt-0.5 sm:mt-0" />
                      </div>
                      <span className="block text-[7px] sm:text-[8px] lg:text-[9.5px] font-extrabold uppercase tracking-widest text-center lg:text-left leading-tight py-0.5 sm:py-0 w-full">{tab.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Tab Display Panel Right */}
              <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                className="lg:col-span-7 liquid-glass-card border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col relative shadow-2xl overflow-y-auto h-full w-full no-scrollbar max-h-[500px] lg:max-h-full"
                initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                
                {activeTab === "booking" && (
                  <div className="space-y-1.5">
                    <div className="space-y-0.5">
                      <h4 className="text-white font-bold text-[11px] uppercase tracking-wide">Smart Stock & Overlap</h4>
                      <p className="text-[8.5px] text-[#8ca38a] font-light">Simulasi deteksi jadwal dan harga otomatis.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-white/2 p-1.5 sm:p-2 rounded-lg border border-white/5">
                      <div>
                        <label className="text-[7.5px] font-bold text-[#8ca38a] uppercase block mb-0.5">Produk</label>
                        <select 
                          value={selectedGear}
                          onChange={(e) => setSelectedGear(e.target.value)}
                          className="w-full bg-stone-900 border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] text-stone-200 outline-none"
                        >
                          <option value="Tenda Dome 4P">Tenda Dome 4P</option>
                          <option value="Carrier 60L">Carrier 60L Deuter</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[7.5px] font-bold text-[#8ca38a] uppercase block mb-0.5">Mulai</label>
                        <input 
                          type="date"
                          value={checkStartDate}
                          onChange={(e) => setCheckStartDate(e.target.value)}
                          className="w-full bg-stone-900 border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] text-stone-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[7.5px] font-bold text-[#8ca38a] uppercase block mb-0.5">Selesai</label>
                        <input 
                          type="date"
                          value={checkEndDate}
                          onChange={(e) => setCheckEndDate(e.target.value)}
                          className="w-full bg-stone-900 border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] text-stone-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Simplified other tabs for brevity if needed or maintain similar structure */}
                <div className="text-[9px] text-[#8ca38a] mt-4 italic">Simulasi lainnya tersedia saat demo.</div>

                {activeTab === "pricing" && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <span className="text-[8.5px] uppercase font-black tracking-widest text-[#8ca38a]">SMART recommendations</span>
                      <h4 className="text-white font-bold text-[11px] uppercase">Bundle Recommendation Engine</h4>
                      <p className="text-[9px] text-[#8ca38a] font-light">Algoritma relasional cerdas. Ketika pengguna memilih produk utama (Tenda), sistem secara instan menawarkan perlengkapan pendukung esensial.</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {["Tenda", "Tas Carrier", "Kompor"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setBundleMain(cat);
                            setBundleAddons([]);
                          }}
                          className={`px-2.5 py-1 text-[9px] rounded-lg border font-black uppercase tracking-wider flex-1 sm:flex-none text-center ${
                            bundleMain === cat ? "bg-forest text-white border-forest font-black" : "bg-white/5 border-white/5 text-[#8ca38a]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Recommendation Cards Box */}
                    <div className="bg-white/2 border border-white/5 p-1.5 sm:p-2 rounded-xl space-y-1.5">
                      <span className="text-[7.5px] text-[#8ca38a] font-black uppercase tracking-widest block">Rekomendasi Paket Hemat Tambahan Terkait:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {bundleMain === "Tenda" && [
                          { name: "Sleeping Bag Polar", price: 35000, desc: "Menghalang beku", icon: "Flame" },
                          { name: "Matras Alumfoil", price: 15000, desc: "Menghalau dingin", icon: "Layers" },
                          { name: "Cooking Nesting", price: 20000, desc: "Satu set kompak", icon: "Coffee" }
                        ].map((add, i) => {
                          const hasAdd = bundleAddons.includes(add.name);
                          return (
                            <div 
                              key={i} 
                              onClick={() => toggleBundleAddon(add.name)}
                              className={`p-1.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-auto min-h-[75px] md:min-h-0 md:aspect-video lg:h-16 select-none ${
                                hasAdd ? "border-forest/40 bg-forest/[0.04]" : "border-white/5 bg-stone-950/40 hover:border-white/10"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[8.5px] font-bold text-white leading-tight">{add.name}</span>
                                <LucideIcon name={hasAdd ? "CheckCircle" : add.icon} size={12} className={hasAdd ? "text-forest" : "text-[#8ca38a]/50"} />
                              </div>
                              <div>
                                <p className="text-[8px] text-[#8ca38a] leading-none mb-0.5 truncate">{add.desc}</p>
                                <span className="text-[8.5px] font-bold text-orange">Rp {add.price.toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          );
                        })}
                        {bundleMain === "Tas Carrier" && [
                          { name: "Raincover 60L Waterproof", price: 10000, desc: "Perlindungan hujan badai", icon: "Shield" },
                          { name: "Trekking Pole Carbon", price: 25000, desc: "Mengurangi beban lutut daki", icon: "Compass" },
                          { name: "Headlamp LED 350lm", price: 20000, desc: "Penerangan daki malam", icon: "Zap" }
                        ].map((add, i) => {
                          const hasAdd = bundleAddons.includes(add.name);
                          return (
                            <div 
                              key={i} 
                              onClick={() => toggleBundleAddon(add.name)}
                              className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-auto min-h-[90px] md:min-h-0 md:aspect-auto lg:h-20 select-none ${
                                hasAdd ? "border-forest/40 bg-forest/[0.04]" : "border-white/5 bg-stone-950/40 hover:border-white/10"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-bold text-white leading-tight">{add.name}</span>
                                <LucideIcon name={hasAdd ? "CheckCircle" : add.icon} size={14} className={hasAdd ? "text-forest" : "text-[#8ca38a]/50"} />
                              </div>
                              <div>
                                <p className="text-[8.5px] text-[#8ca38a] leading-none mb-0.5 shadow-none">{add.desc}</p>
                                <span className="text-[9px] font-bold text-orange">Rp {add.price.toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          );
                        })}
                        {bundleMain === "Kompor" && [
                          { name: "Cooking Nesting 3P Set", price: 20000, desc: "Satu set panci teko kemping", icon: "Coffee" },
                          { name: "Gas Kaleng Portable", price: 15000, desc: "Bahan bakar butana murni", icon: "Flame" },
                          { name: "Windshield Lipat Aluminium", price: 10000, desc: "Penghalang angin kompor", icon: "Sparkles" }
                        ].map((add, i) => {
                          const hasAdd = bundleAddons.includes(add.name);
                          return (
                            <div 
                              key={i} 
                              onClick={() => toggleBundleAddon(add.name)}
                              className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-auto min-h-[90px] md:min-h-0 md:aspect-auto lg:h-20 select-none ${
                                hasAdd ? "border-forest/40 bg-forest/[0.04]" : "border-white/5 bg-stone-950/40 hover:border-white/10"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-bold text-white leading-tight">{add.name}</span>
                                <LucideIcon name={hasAdd ? "CheckCircle" : add.icon} size={14} className={hasAdd ? "text-forest" : "text-[#8ca38a]/50"} />
                              </div>
                              <div>
                                <p className="text-[8.5px] text-[#8ca38a] leading-none mb-0.5 shadow-none">{add.desc}</p>
                                <span className="text-[9px] font-bold text-orange">Rp {add.price.toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "maintenance" && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <span className="text-[8.5px] uppercase font-black tracking-widest text-[#8ca38a]">DAMAGE EVALUATION</span>
                      <h4 className="text-white font-bold text-[11px] uppercase">Documentation System</h4>
                      <p className="text-[9px] text-[#8ca38a] font-light">Rekam foto terlampir sebelum vs sesudah sewa.</p>
                    </div>

                    {/* Image comparison slider simulator */}
                    <div className="relative w-full h-28 sm:h-32 lg:h-36 rounded-xl overflow-hidden border border-white/10 select-none bg-stone-900">
                      
                      {/* Left Block - Before */}
                      <div className="absolute inset-0 bg-forest/20 flex flex-col items-center justify-center text-center p-2">
                        <LucideIcon name="Tent" size={24} className="text-white opacity-60" />
                        <span className="text-[8.5px] font-black uppercase text-white mt-1">KONDISI AWAL</span>
                        <p className="text-[8px] text-[#8ca38a] max-w-xs mt-0.5 truncate">Alat utuh & steril.</p>
                      </div>

                      {/* Right Block - After */}
                      <div 
                        className="absolute inset-y-0 right-0 bg-red-950/80 border-l-2 border-amber-500 flex flex-col items-center justify-center text-center p-2 overflow-hidden"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="w-80 flex flex-col items-center">
                          <LucideIcon name="AlertTriangle" size={24} className="text-red-400" />
                          <span className="text-[8.5px] font-black uppercase text-red-400 mt-1">KONDISI RUSAK</span>
                          <p className="text-[8.5px] text-[#8ca38a] max-w-sm mt-0.5">Sobek & denda aktif.</p>
                        </div>
                      </div>

                      {/* Floating Indicator labels */}
                      <span className="hidden sm:block absolute left-4 top-2 bg-forest/25 border border-forest/20 px-2 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-widest">Awal</span>
                      <span className="hidden sm:block absolute right-4 top-2 bg-red-500/25 border border-red-500/20 px-2 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-widest">Rusak</span>
                    </div>

                    {/* Controls Range Input slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] text-[#8ca38a] font-bold">
                        <span>AWAL (SEBELUM)</span>
                        <span>SERAH TERIMA (SESUDAH)</span>
                      </div>
                      <input 
                        type="range"
                        min={0}
                        max={100}
                        value={sliderPos}
                        onChange={(e) => setSliderPos(Number(e.target.value))}
                        className="w-full accent-forest cursor-pointer h-1 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "conflict" && (
                  <div className="space-y-3">
                    <div className="space-y-0.5">
                      <span className="text-[8.5px] uppercase font-black tracking-widest text-[#8ca38a]">SANKSI & SYARAT</span>
                      <h4 className="text-white font-bold text-[11px] uppercase">Digital Agreement Generator</h4>
                      <p className="text-[9px] text-[#8ca38a] font-light">Sistem otomasi surat perjanjian sewa resmi.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      
                      {/* Compact Agreement Document */}
                      <div className="bg-[#040805] border border-white/5 p-2 rounded-xl text-[8.5px] font-mono leading-tight space-y-1 h-30 sm:h-36 md:h-40 overflow-y-auto scrollbar-none text-stone-300">
                        <p className="text-center font-bold text-white uppercase text-[9px]">SURAT PERJANJIAN SEWA</p>
                        <p>Yang menyetujui kontrak sewa logistik kelengkapan gunung.</p>
                        <p>Penyewa wajib menjaga kesehatan barang harian dan memulangkannya tepat waktu.</p>
                        <p>Denda kerusakan mutlak diaplikasikan seketika andaikata terbukti ada kerusakan.</p>
                      </div>

                      {/* Signature Box Input */}
                      <div className="bg-stone-900 border border-white/5 p-2 rounded-xl flex flex-col justify-between h-30 sm:h-36 md:h-40">
                        <div className="space-y-0.5">
                          <label className="text-[7.5px] font-black text-[#8ca38a] uppercase block">SIGNATURE (NAMA)</label>
                          <input 
                            type="text"
                            placeholder="Ketik Nama..."
                            value={digitalSignedName}
                            onChange={(e) => {
                              setDigitalSignedName(e.target.value);
                              if (e.target.value.trim().length > 2) {
                                setIsAgreementSigned(true);
                              } else {
                                setIsAgreementSigned(false);
                              }
                            }}
                            className="w-full bg-stone-950 border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] text-white outline-none focus:border-forest"
                          />
                        </div>

                        <div className="border-t border-dashed border-white/10 pt-0.5 flex items-center justify-between">
                          <span className="text-[8px] text-zinc-500 select-none">Auth:</span>
                          {isAgreementSigned ? (
                            <span className="font-extrabold text-forest italic text-[9px] font-sans shadow-none flex items-center gap-1">
                              <LucideIcon name="CheckCircle" size={9} className="text-forest" /> {digitalSignedName}
                            </span>
                          ) : (
                            <span className="text-[8px] text-zinc-600 font-medium">Empty</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

        {/* =========================================
            SECTION 5 — KEUNGGULAN SISTEM (BENEFITS)
            ========================================= */}
        <section 
          data-index={4}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 py-16 md:py-24 relative flex flex-col justify-center items-center h-auto min-h-svh md:h-screen md:max-h-screen overflow-hidden shrink-0"
        >
          <motion.div 
            className="max-w-7xl mx-auto w-full flex flex-col justify-center items-center space-y-8 sm:space-y-12"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0)" }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            
            <div className="text-center space-y-1">
              <motion.span 
                className="text-[9px] font-black uppercase text-forest tracking-widest block"
                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                GARANSI DISIPLIN SISTEM
              </motion.span>
              <h2 className="heading-jumbo text-fluid-section text-white font-extrabold tracking-wide uppercase">
                EMPAT GARANSI STANDAR OUTRENT
              </h2>
              <motion.div 
                className="w-10 h-0.5 bg-forest mx-auto mt-1 rounded-full" 
                initial={{ width: 0 }}
                whileInView={{ width: 40 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-left">
              {[
                { title: "Minim Human Error", desc: "Komparasi stok & verifikasi.", icon: "EyeOff" },
                { title: "Tracking Barang Presisi", desc: "Setiap alat ID unik.", icon: "Compass" },
                { title: "Histori Rental Lengkap", desc: "Arsip detail transparan.", icon: "FileClock" },
                { title: "Monitoring Stok Kritis", desc: "Indikator dinamis.", icon: "ShieldAlert" },
              ].map((b, idx) => (
                <motion.div 
                  key={idx}
                  className="liquid-glass-card p-3 flex flex-col gap-1.5 h-auto min-h-[90px] group"
                  initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
                  viewport={{ once: true, margin: "-10px" }}
                  transition={{ delay: 0.3 + (idx * 0.1), duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                >
                  <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center border border-forest/20 group-hover:bg-forest group-hover:text-white transition-colors duration-500">
                    <LucideIcon name={b.icon} size={14} />
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-[10px] uppercase tracking-wider">{b.title}</h4>
                    <p className="text-[9px] text-[#8ca38a] mt-0.5 leading-tight font-light">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </section>

        {/* =========================================
            SECTION 6 — TESTIMONIAL / OPERATIONAL PREVIEW
            ========================================= */}
        <section 
          data-index={5}
          className="snap-scroll-section px-4 sm:px-8 md:px-12 py-16 md:py-24 relative flex flex-col justify-center items-center h-auto min-h-svh md:h-screen md:max-h-screen overflow-hidden shrink-0"
        >
          <motion.div 
            className="max-w-7xl mx-auto w-full flex flex-col justify-center items-center space-y-8 sm:space-y-12"
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
            viewport={{ once: true, margin: "-10px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            
            <motion.div 
              className="text-left space-y-0.5"
              initial={{ opacity: 0, x: -30, filter: "blur(5px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0)" }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[9px] font-black uppercase text-forest tracking-widest block">
                BUKTI NYATA OPERASIONAL
              </span>
              <h2 className="heading-jumbo text-fluid-section text-white font-extrabold tracking-wide uppercase">
                ULASAN MITRA LOKAL
              </h2>
              <motion.div 
                className="w-10 h-0.5 bg-forest rounded-full" 
                initial={{ width: 0 }}
                whileInView={{ width: 40 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>

            {/* Testimonial Quote Panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center liquid-glass-card p-4 sm:p-6 lg:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-forest/10 blur-[50px] pointer-events-none group-hover:bg-forest/20 transition-colors duration-1000" />
              
              <motion.div 
                className="md:col-span-8 space-y-2 relative z-10"
                initial={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0)" }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <blockquote className="text-[11px] sm:text-[13px] md:text-sm italic font-light text-stone-200 leading-relaxed shadow-none pr-4 md:pr-8">
                  "Semenjak stasiun kami mendigitalisasi stok dengan OUTRENT, tidak ada lagi kekacauan pesanan. Data jaminan terdata aman, pelanggan senang, operasional jauh lebih rapi."
                </blockquote>
                <div className="pt-2">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-white">Gede Mandra</h4>
                  <p className="text-[9px] text-forest uppercase mt-0.5 font-bold tracking-widest">Pemilik Rinjani Adventure Hub</p>
                </div>
              </motion.div>

              {/* Statistics Showcase Block */}
              <div className="md:col-span-4 grid grid-cols-2 gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 text-center relative z-10">
                {[
                  { val: "4K+", label: "Transaksi" },
                  { val: "99%", label: "Alat Bersih" },
                  { val: "30m", label: "Verifikasi" },
                  { val: "Zero", label: "Bentrok" },
                ].map((st, idx) => (
                  <motion.div 
                    key={idx} 
                    className="p-3 bg-white/5 border border-white/5 rounded-xl transition-transform duration-500 hover:scale-105"
                    initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
                    viewport={{ once: true, margin: "-5px" }}
                    transition={{ delay: 0.6 + (idx * 0.1), duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="block text-3xl sm:text-4xl text-white tracking-normal leading-none" style={{ fontFamily: '"Anton", sans-serif' }}>{st.val}</span>
                    <span className="block text-[8.5px] uppercase font-bold text-[#8ca38a] tracking-wider mt-1">{st.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        </section>

        {/* =========================================
            SECTION 7 — CAMPFIRE & IMMERSIVE FOOTER
            ========================================= */}
        <section 
          data-index={6}
          className="snap-scroll-section relative flex flex-col justify-end min-h-svh md:h-auto md:min-h-screen pt-16"
        >
          {/* Animated Campfire centered elements */}
          <div className="flex-1 flex flex-col justify-center items-center py-16 sm:py-24 select-none relative z-10 w-full animate-fade-in">
            <div className="relative flex flex-col items-center">
              {/* Soft Fire Bloom Light */}
              <motion.div 
                className="w-[140px] h-[140px] rounded-full blur-[35px] opacity-40 absolute bottom-[-15px]"
                style={{
                  background: "radial-gradient(circle, #f59e0b 0%, #ea580c 45%, transparent 80%)"
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
              {/* Flame Component with sparks */}
              <div className="w-8 h-10 bg-gradient-to-t from-red-600 via-amber-500 to-yellow-300 rounded-b-xl rounded-t-3xl blur-[0.5px] flame-anim relative bottom-[8px] z-10">
                {/* 5 clean micro spark elements */}
                <span className="absolute w-1 h-1 bg-amber-300 rounded-full left-1.5 bottom-1" />
                <span className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full left-4 bottom-0" />
                <span className="absolute w-1 h-1 bg-red-400 rounded-full left-2.5 bottom-3" />
                <span className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full left-1 bottom-4" />
              </div>
              {/* Logs */}
              <div className="absolute bottom-[6px] w-12 h-2 bg-[#4c1d05] rounded-full transform rotate-[20deg]" />
              <div className="absolute bottom-[6px] w-12 h-2 bg-[#451a03] rounded-full transform -rotate-[20deg]" />
              <span className="text-[8.5px] uppercase tracking-[0.3em] font-sans font-black text-amber-500/80 animate-pulse mt-1.5 block">
                OUTRENT FIRE LIGHT
              </span>
            </div>
          </div>

          <Footer setPage={setPage} />
        </section>

      </div>

      {/* QUICK FLOATING MULTI-ACTION SELECTION MODAL POPUP FOR DEMO */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
          <div className="bg-[#0a130c]/98 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up p-6 text-left relative sf-pro-font pb-12 sm:pb-6">
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-5 block sm:hidden" />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="heading-caps font-black text-white text-sm tracking-widest uppercase flex items-center gap-2">
                <LucideIcon name="Terminal" className="text-forest" size={15} />
                Akses Uji Coba Demo
              </h4>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="p-1 px-2 text-stone-400 hover:text-white pointer-events-auto rounded bg-white/5 transition-colors"
                aria-label="Close"
              >
                <LucideIcon name="X" size={14} />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-xs text-[#8ca38a] leading-relaxed font-light shadow-none">
                Pilih peran simulasi untuk melihat kecerdasan sistem OUTRENT secara instan:
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDemoModal(false);
                    triggerDemoLogin("customer");
                  }}
                  className="w-full bg-forest/10 hover:bg-forest/15 text-forest font-black text-[11px] tracking-wider py-3.5 px-4 rounded-xl border border-forest/15 flex items-center justify-between text-left group transition-all"
                >
                  <div className="space-y-0.5">
                    <span className="block font-black uppercase">Masuk Sebagai Pelanggan</span>
                    <span className="block text-[9.5px] text-[#8ca38a] font-normal leading-none lowercase shadow-none">Uji coba simulasi sewa, checkout, & trust score</span>
                  </div>
                  <LucideIcon name="User" size={16} className="text-forest group-hover:scale-110 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDemoModal(false);
                    triggerDemoLogin("admin");
                  }}
                  className="w-full bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 font-black text-[11px] tracking-wider py-3.5 px-4 rounded-xl border border-amber-500/15 flex items-center justify-between text-left group transition-all"
                >
                  <div className="space-y-0.5">
                    <span className="block font-black uppercase">Masuk Sebagai Admin</span>
                    <span className="block text-[9.5px] text-[#8ca38a] font-normal leading-none lowercase shadow-none">Verifikasi data, ubah kelayakan stok, & maintain</span>
                  </div>
                  <LucideIcon name="ShieldCheck" size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="bg-forest/[0.03] border border-forest/10 rounded-xl p-3 text-[10.5px] text-[#8ca38a] leading-relaxed font-light">
                Info: Anda dapat membuat pesanan sewa di akun Pelanggan, lalu log out dan masuk sebagai Admin untuk menyetujui transaksi tersebut secara utuh.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-[#020503]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-[#0a130c]/98 border border-forest/10 rounded-2xl w-full max-w-2xl h-[85vh] sm:h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h2 className="heading-caps font-black text-white text-base tracking-wider flex items-center gap-2">
                <LucideIcon name="Shield" className="text-forest" size={16} />
                Syarat & Ketentuan
              </h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="p-1.5 px-2 rounded bg-white/5 border border-white/5 text-stone-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 overflow-y-auto w-full no-scrollbar font-sans text-stone-300 text-sm leading-relaxed space-y-8">
              
              <div className="text-center space-y-2 pb-2">
                <span className="text-[10px] text-forest font-bold uppercase tracking-widest block">Update Terakhir: 22 Mei 2026</span>
                <p className="text-xs text-[#8ca38a]">
                  OUTRENT berkomitmen untuk menjaga keamanan dan privasi data Anda selama menggunakan sistem kami.
                </p>
              </div>

              <div className="space-y-6 max-w-xl mx-auto">
                <section className="space-y-2.5">
                  <h3 className="text-white font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-forest rounded-full" />
                    1. Informasi yang Dikumpulkan
                  </h3>
                  <p className="text-xs text-[#8ca38a]">Sistem kami dapat menyimpan informasi berikut untuk keperluan operasional:</p>
                  <ul className="list-disc list-inside text-xs space-y-1.5 ml-1 text-stone-300">
                    <li>Nama lengkap & email pengguna</li>
                    <li>Nomor WhatsApp aktif</li>
                    <li>Data booking & histori rental</li>
                    <li>Pindaian identitas (KTP/KTM) untuk jaminan</li>
                  </ul>
                </section>

                <section className="space-y-2.5">
                  <h3 className="text-white font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-forest rounded-full" />
                    2. Tujuan Penggunaan Data
                  </h3>
                  <p className="text-xs text-[#8ca38a]">Kami menggunakan data Anda hanya untuk tujuan spesifik operasional rental yang meliputi:</p>
                  <ul className="list-disc list-inside text-xs space-y-1.5 ml-1 text-stone-300">
                    <li>Verifikasi keabsahan penyewaan barang</li>
                    <li>Menjaga keamanan transaksi antar kedua belah pihak</li>
                    <li>Komunikasi terkait status booking dan pengingat pengembalian</li>
                  </ul>
                </section>

                <section className="space-y-2.5">
                  <h3 className="text-white font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-forest rounded-full" />
                    3. Keamanan Data
                  </h3>
                  <p className="text-xs text-[#8ca38a]">
                    Data Anda disimpan secara aman di dalam sistem kami. Akses terhadap informasi ini dibatasi secara ketat hanya untuk admin yang berwenang. Kami menjamin bahwa identitas Anda tidak akan disebarkan, dijual, atau dibagikan kepada pihak ketiga.
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h3 className="text-white font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-forest rounded-full" />
                    4. Perlindungan Upload Identitas
                  </h3>
                  <p className="text-xs text-[#8ca38a]">
                    Pindaian KTP/KTM dan swafoto yang diunggah wajib dilengkapi dengan watermark keamanan. Sistem hanya memproses dokumen ini secara eksklusif untuk jaminan penyewaan barang selama masa aktif pesanan dan tidak akan digunakan di luar kepentingan operasional rental.
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h3 className="text-white font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-forest rounded-full" />
                    5. Cookies & Session
                  </h3>
                  <p className="text-xs text-[#8ca38a]">
                    Sistem website OUTRENT menggunakan session login lokal ringan (cookies & local storage) agar sistem dapat mengingat profil pengguna dan mempertahankan koneksi saat aplikasi ditutup sementara, demi menjaga kenyamanan transisi pengalaman pengguna.
                  </p>
                </section>

                <section className="space-y-2.5 border-t border-white/5 pt-5 mt-6 pb-4 text-center">
                  <h3 className="text-white font-black text-sm mb-2">Persetujuan Pengguna</h3>
                  <p className="text-xs text-[#8ca38a]/80 italic">
                    Dengan mendaftar, login, dan menggunakan website ini, Anda secara langsung dianggap telah memahami, menyetujui, dan mematuhi seluruh syarat layanan dan kebijakan privasi yang berlaku.
                  </p>
                </section>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default LandingPage;
