import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, ShieldCheck, Clock, Check, Plus, Minus, Info, Sparkles, MapPin } from "lucide-react";

interface GearItem {
  id: string;
  name: string;
  category: string;
  weight: number;
  price: number;
}

const DEMO_GEAR: GearItem[] = [
  { id: "g1", name: "MSR Hubba Hubba NX 2P", category: "Shelter & Tenda", weight: 1.7, price: 125000 },
  { id: "g2", name: "Osprey Atmos AG 65L", category: "Carrier", weight: 2.1, price: 95000 },
  { id: "g3", name: "Jetboil Flash System", category: "Memasak", weight: 0.4, price: 45000 },
  { id: "g4", name: "Hilleberg Allak 2 Dome", category: "Shelter & Tenda", weight: 2.8, price: 210000 },
  { id: "g5", name: "Deuter Aircontact Pro", category: "Carrier", weight: 2.4, price: 85000 },
];

export default function InteractiveJourney() {
  const [activeStep, setActiveStep] = useState<number>(0);
  
  // Step 1 states
  const [cart, setCart] = useState<Record<string, number>>({ g1: 1, g2: 1, g3: 1 });
  
  // Step 2 states
  const [verificationState, setVerificationState] = useState<"idle" | "scanning" | "matched">("idle");
  const [scannedPct, setScannedPct] = useState<number>(0);

  // Step 3 states
  const [selectedBaseCamp, setSelectedBaseCamp] = useState<string>("merbabu");

  const toggleItem = (id: string) => {
    setCart(prev => {
      const exists = prev[id] || 0;
      if (exists > 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [id]: 1 };
      }
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  // Calculate totals
  const totalWeight = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = DEMO_GEAR.find(g => g.id === id);
    return sum + (item ? item.weight * qty : 0);
  }, 0);

  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = DEMO_GEAR.find(g => g.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // Trigger biometric verification simulation
  const startVerification = () => {
    setVerificationState("scanning");
    setScannedPct(0);
    const interval = setInterval(() => {
      setScannedPct(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setVerificationState("matched");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const resetVerification = () => {
    setVerificationState("idle");
    setScannedPct(0);
  };

  const steps = [
    { label: "01. Pemilihan", icon: <Map strokeWidth={1.5} size={20} />, description: "Eksplorasi gear adaptif & kalkulasi beban" },
    { label: "02. Verifikasi", icon: <ShieldCheck strokeWidth={1.5} size={20} />, description: "Validasi biometrik & keaslian identitas" },
    { label: "03. Pengambilan", icon: <Clock strokeWidth={1.5} size={20} />, description: "Serah terima steril di Outpost Base Camp" },
  ];

  return (
    <div className="w-full max-w-[1240px] mx-auto flex flex-col gap-12 sm:gap-16">
      {/* Step Navigation Bar */}
      <div className="grid grid-cols-3 gap-1.5 xs:gap-3 sm:gap-6 relative px-1 sm:px-0">
        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-white/10 -z-10" />
        {steps.map((s, idx) => {
          const isActive = activeStep === idx;
          return (
            <button
              key={idx}
              id={`journey-step-btn-${idx}`}
              onClick={() => setActiveStep(idx)}
              className={`flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-4 p-2 xs:p-3 sm:p-5 rounded-xl xs:rounded-2xl sm:rounded-3xl border transition-all text-center sm:text-left group relative cursor-pointer ${
                isActive
                  ? "bg-white/5 border-[#FF6600]/30 shadow-[0_4px_24px_rgba(255,102,0,0.1)]"
                  : "bg-transparent border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
              }`}
            >
              <div
                className={`w-7 h-7 xs:w-9 xs:h-9 sm:w-14 sm:h-14 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                  isActive
                    ? "bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/20"
                    : "bg-[#1A1A1A] text-white/50 group-hover:text-white"
                }`}
              >
                {/* Responsive icon scaling */}
                {React.cloneElement(s.icon, { size: window.innerWidth < 640 ? 14 : 20 })}
              </div>
              <div className="flex-1 min-w-0 w-full">
                <span className={`text-[8px] xs:text-[10px] sm:text-[12px] font-mono uppercase tracking-wider block mb-0.5 sm:mb-1 ${isActive ? "text-[#FF6600]" : "text-white/40"}`}>
                  {s.label}
                </span>
                <span className="text-[9px] xs:text-[11px] font-medium text-white/70 block sm:hidden uppercase tracking-tight truncate w-full">
                  {idx === 0 ? "Katalog" : idx === 1 ? "Scan KTP" : "Outpost"}
                </span>
                <h4 className="text-[16px] font-medium text-white mb-0.5 hidden sm:block">{s.description}</h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulator Sandbox */}
      <div className="bg-[#121212] border border-white/5 rounded-[32px] sm:rounded-[40px] p-4 sm:p-10 relative overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF6600]/5 rounded-full blur-[100px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="step-pemilihan"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              id="playground-pemilihan"
            >
              {/* Gear Selection Left */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                    <Sparkles className="text-[#FF6600] w-5 h-5 animate-pulse" />
                    Katalog Gear Adaptif
                  </h3>
                  <span className="text-[10px] sm:text-xs font-mono text-white/40">KLIK UNTUK MEMILIH / TAMBAH</span>
                </div>
                
                <div 
                  className="space-y-3.5 max-h-[385px] overflow-y-auto p-2 pb-10 sm:p-3 sm:pb-3 pr-3.5 custom-scrollbar touch-pan-y"
                  data-lenis-prevent="true"
                  style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
                >
                  {DEMO_GEAR.map(item => {
                    const quantity = cart[item.id] || 0;
                    const isSelected = quantity > 0;
                    return (
                      <div
                        key={item.id}
                        onClick={() => !isSelected && toggleItem(item.id)}
                        className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer ${
                          isSelected
                            ? "bg-white/5 border-[#FF6600]/25 shadow-[0_0_15px_rgba(255,102,0,0.05)]"
                            : "bg-[#181818]/60 border-white/5 hover:border-white/10 hover:bg-[#1C1C1C]"
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 text-left">
                          <div
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                              isSelected
                                ? "bg-[#FF6600] border-[#FF6600] text-white"
                                : "border-white/20 text-transparent"
                            }`}
                          >
                            <Check size={10} className="sm:w-3 sm:h-3" strokeWidth={3} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-white text-sm sm:text-base truncate">{item.name}</div>
                            <div className="text-xs text-white/40 flex items-center gap-1.5 mt-0.5">
                              <span>{item.category}</span>
                              <span>•</span>
                              <span>{item.weight} kg</span>
                            </div>
                          </div>
                        </div>

                        <div 
                          className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t border-white/5 sm:border-t-0 pt-2 sm:pt-0" 
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="text-left sm:text-right">
                            <div className="text-[10px] text-white/40 hidden sm:block">Harga Sewa</div>
                            <div className="text-sm font-semibold text-white">
                              Rp {item.price.toLocaleString("id-ID")}
                              <span className="text-[10px] text-white/40 font-normal ml-1 sm:hidden">/hari</span>
                            </div>
                            <div className="text-[10px] text-white/40 hidden sm:block">/hari</div>
                          </div>

                          {isSelected && (
                            <div className="flex items-center gap-2 bg-black/40 px-1.5 py-1 rounded-xl border border-white/5">
                              <button
                                onClick={() => updateQty(item.id, -1)}
                                className="w-5 h-5 rounded-md hover:bg-white/10 text-white/70 flex items-center justify-center transition-colors"
                              >
                                <Minus size={11} strokeWidth={2.5} />
                              </button>
                              <span className="text-xs font-mono text-white w-4 text-center">{quantity}</span>
                              <button
                                onClick={() => updateQty(item.id, 1)}
                                className="w-5 h-5 rounded-md hover:bg-white/10 text-white/70 flex items-center justify-center transition-colors"
                              >
                                <Plus size={11} strokeWidth={2.5} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weight & Cost Analyzer Right */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-black/45 rounded-3xl border border-white/5 p-6 md:p-8 relative overflow-hidden">
                <div className="space-y-6 z-10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[#FF6600] font-bold">Simulator beban & Biaya</h4>
                    <span className="text-[10px] font-mono bg-white/5 px-2 py-1 rounded border border-white/10 text-white/60">Live</span>
                  </div>

                  {/* Weight Gauge */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium text-white/70">Total Estimasi Beban</span>
                      <span className="text-lg font-mono font-bold text-white">
                        {totalWeight.toFixed(1)} <span className="text-xs text-white/50">Kg</span>
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden relative">
                      <motion.div
                        className={`h-full rounded-full ${
                          totalWeight > 6 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        animate={{ width: `${Math.min(100, (totalWeight / 10) * 100)}%` }}
                        transition={{ type: "spring", stiffness: 60 }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Info size={10} /> Optimal untuk pendakian mandiri 2-3 hari
                      </span>
                      <span className="text-[10px] font-mono text-white/40">Max 10kg</span>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="border-t border-white/5 pt-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/45">Item Terpilih</span>
                      <span className="text-xs text-white font-mono">{Object.keys(cart).length} Unit</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#BDBDBD]">Rent Multiplier (3 Hari)</span>
                      <span className="text-xs text-white font-mono">1.0x (Normal)</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-dashed border-white/5">
                      <span className="text-sm font-medium text-white">Estimasi Biaya / Hari</span>
                      <span className="text-xl font-bold text-[#FF6600] font-mono">
                        Rp {totalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 z-10">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="w-full bg-white text-black hover:bg-[#FF6600] hover:text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 duration-300 text-sm"
                  >
                    Lanjutkan Ke Verifikasi <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="step-verifikasi"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              id="playground-verifikasi"
            >
              {/* Verification Scan Screen Left */}
              <div className="md:col-span-6 flex flex-col items-center">
                <div className="relative w-full max-w-[340px] aspect-square rounded-[36px] bg-black/60 border border-white/10 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
                  {/* Glowing camera lens mock */}
                  <div className="absolute top-6 w-3 h-3 rounded-full bg-red-600 animate-pulse border border-white/10" />

                  {/* Scanning Matrix Line */}
                  {verificationState === "scanning" && (
                    <motion.div
                      initial={{ y: "-100%" }}
                      animate={{ y: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FF6600] to-transparent shadow-[0_0_20px_#FF6600] z-20"
                    />
                  )}

                  {/* Graphic Display based on Verification State */}
                  <div className="z-10 text-center px-6">
                    {verificationState === "idle" && (
                      <div className="space-y-4">
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/50">
                          <ShieldCheck size={40} className="stroke-1 text-[#FF6600]" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Verifikasi Keaslian KTP & Foto</div>
                          <div className="text-xs text-white/40 mt-1 max-w-[200px] mx-auto">Klik tombol dibawah untuk mensimulasikan pencocokan data KTP berbasis AI</div>
                        </div>
                      </div>
                    )}

                    {verificationState === "scanning" && (
                      <div className="space-y-4">
                        <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#FF6600] border-t-transparent animate-spin flex items-center justify-center mx-auto" />
                        <div>
                          <div className="text-sm font-semibold text-[#FF6600] animate-pulse">Pencocokan Identitas...</div>
                          <div className="text-xs text-white/40 font-mono mt-1">{scannedPct}% COMPLETE</div>
                        </div>
                      </div>
                    )}

                    {verificationState === "matched" && (
                      <div className="space-y-4">
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500"
                        >
                          <Check size={36} strokeWidth={3} className="animate-bounce" />
                        </motion.div>
                        <div>
                          <div className="text-sm font-semibold text-emerald-400">Pencocokan Berhasil!</div>
                          <div className="text-xs text-white/40 font-mono mt-1">INTEGRITY RATING: 100% VALID</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tech Grid Background Lines */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                </div>
              </div>

              {/* Information Detail Panel Right */}
              <div className="md:col-span-6 flex flex-col justify-center space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#FF6600] font-bold">Teknologi Verifikasi Aman</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Mengapa Kami Memverifikasi?</h3>
                </div>

                <p className="text-sm text-[#BDBDBD] font-light leading-[1.6]">
                  Untuk memastikan keselamatan penyewa dan menjaga standar armada peralatan, OUTRENT mengintegrasikan sistem pembaca KTP dan pencocokan muka berstandar kepolisian. Ini melindungi Anda dari penipuan dan menjamin orisinalitas gear.
                </p>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] mt-0.5"><Check size={12} strokeWidth={3} /></div>
                    <span className="text-sm text-white/80">Enskripsi SHA-256 menyimpan data Anda dengan aman tanpa kebocoran.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] mt-0.5"><Check size={12} strokeWidth={3} /></div>
                    <span className="text-sm text-white/80">Proses pencocokan instan tanpa perlu datang terlebih dahulu.</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {verificationState === "idle" && (
                    <button
                      onClick={startVerification}
                      className="bg-white hover:bg-neutral-200 text-black font-semibold py-3.5 px-6 rounded-2xl transition-all cursor-pointer flex-1 text-center text-sm shadow-md"
                    >
                      Simulasikan Verifikasi
                    </button>
                  )}
                  {verificationState === "scanning" && (
                    <button
                      disabled
                      className="bg-neutral-800 text-neutral-500 font-semibold py-3.5 px-6 rounded-2xl flex-1 text-center text-sm cursor-not-allowed"
                    >
                      Sedang Memindai...
                    </button>
                  )}
                  {verificationState === "matched" && (
                    <>
                      <button
                        onClick={resetVerification}
                        className="border border-white/10 hover:bg-white/5 text-white font-semibold py-3.5 px-5 rounded-2xl transition-all cursor-pointer text-sm"
                      >
                        Ulangi Demo
                      </button>
                      <button
                        onClick={() => setActiveStep(2)}
                        className="bg-[#FF6600] hover:bg-[#E65C00] text-white font-semibold py-3.5 px-6 rounded-2xl transition-all cursor-pointer flex-1 text-center text-sm shadow-lg shadow-[#FF6600]/15"
                      >
                        Lanjut Ke Pengambilan
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step-pengambilan"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              id="playground-pengambilan"
            >
              {/* Location List Left */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="mb-2">
                  <h3 className="text-xl font-semibold text-white">Outpost Base Camp Outrent</h3>
                  <p className="text-xs text-white/45 mt-1">Pilih base camp pengambilan yang sesuai dengan jalur hiking Anda</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "merbabu", name: "Base Camp Alpha - Merbabu Selo", alt: "Selo, Boyolali, Jawa Tengah", temp: "16°C", weather: "Misty Rainforest" },
                    { id: "merapi", name: "Base Camp Beta - Merapi New Selo", alt: "Selo, Boyolali, Jawa Tengah", temp: "18°C", weather: "Sunny Mountain View" },
                    { id: "lawu", name: "Base Camp Gamma - Lawu Cemoro Sewu", alt: "Sarangan, Magetan, Jawa Timur", temp: "12°C", weather: "Chilly High Altitude" },
                  ].map(bc => {
                    const isSelected = selectedBaseCamp === bc.id;
                    return (
                      <div
                        key={bc.id}
                        onClick={() => setSelectedBaseCamp(bc.id)}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
                          isSelected
                            ? "bg-[#FF6600]/10 border-[#FF6600]/30 shadow-md"
                            : "bg-[#181818]/60 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex gap-3 sm:gap-4 items-center text-left">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-[#FF6600] text-white" : "bg-[#252525] text-white/55"}`}>
                            <MapPin size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white text-sm sm:text-base truncate">{bc.name}</div>
                            <div className="text-xs text-[#BDBDBD] font-light mt-0.5 truncate">{bc.alt}</div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
                          <div className="text-[10px] text-white/40 sm:hidden">Kondisi</div>
                          <div className="text-right">
                            <div className="text-xs sm:text-sm font-mono font-bold text-[#FF6600]">{bc.temp}</div>
                            <div className="text-[10px] text-white/40 mt-0.5">{bc.weather}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Physical Vault Outpost Right */}
              <div className="lg:col-span-6 bg-black/45 rounded-3xl border border-white/5 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#FF6600] font-bold">Rincian Serah Terima</span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">Buka 24 Jam</span>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#181818] border border-white/5 p-4 rounded-xl flex justify-between">
                      <span className="text-xs text-[#BDBDBD] font-light">Lokasi Outpost</span>
                      <span className="text-xs font-semibold text-white text-right">
                        {selectedBaseCamp === "merbabu" && "Base Camp Alpha - Merbabu Selo"}
                        {selectedBaseCamp === "merapi" && "Base Camp Beta - Merapi New Selo"}
                        {selectedBaseCamp === "lawu" && "Base Camp Gamma - Lawu Cemoro Sewu"}
                      </span>
                    </div>

                    <div className="bg-[#181818] border border-white/5 p-4 rounded-xl flex justify-between">
                      <span className="text-xs text-[#BDBDBD] font-light">Sistem Pengambilan</span>
                      <span className="text-xs font-semibold text-white text-right">Self-Pick Smart Locker QR</span>
                    </div>

                    <div className="bg-[#181818] border border-white/5 p-4 rounded-xl flex justify-between">
                      <span className="text-xs text-[#BDBDBD] font-light">Estimasi Sterilisasi Lab</span>
                      <span className="text-xs font-semibold text-emerald-400 text-right">READY - STERILE SHIELD</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/40 leading-relaxed font-light mt-4">
                    *Telah disterilkan menggunakan sinar UV-C dan uap hidrogen peroksida 100% higienis, disegel demi menjaga standarditas dari tim inspektur OUTRENT.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5">
                  <div className="bg-[#FF6600]/10 border border-white/5 p-4 rounded-xl flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-ping" />
                      <span>Simulasi alur pemesanan selesai.</span>
                    </div>
                    <span className="text-[#FF6600] font-bold cursor-pointer" onClick={() => setActiveStep(0)}>Ulangi Alur</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
