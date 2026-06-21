import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Map, Clock, Check, Plus, Minus, Info, 
  TrendingUp, LayoutDashboard, UserCheck, RefreshCw, AlertCircle, 
  ThumbsUp, Calendar, Trash2, ShieldAlert
} from "lucide-react";
import { toast } from "react-toastify";

interface VerificationRequest {
  id: string;
  name: string;
  ktpNum: string;
  item: string;
  avatar: string;
  issue?: boolean;
}

const INITIAL_REQUESTS: VerificationRequest[] = [
  { id: "vr-1", name: "Rian Hendrawan", ktpNum: "327318**********", item: "Tenda Hilleberg + Carrier Osprey", avatar: "RH" },
  { id: "vr-2", name: "Siti Amelia", ktpNum: "317409**********", item: "MSR Hubba Hubba (Complete Set)", avatar: "SA" },
  { id: "vr-3", name: "Budi Kusuma", ktpNum: "120804**********", item: "Lightweight Alpine Cooking Kit", avatar: "BK", issue: true },
];

export default function InteractiveSystem() {
  const [activeTab, setActiveTab] = useState<"admin" | "customer">("admin");
  
  // Admin-specific state
  const [verifications, setVerifications] = useState<VerificationRequest[]>(INITIAL_REQUESTS);
  const [approvedCount, setApprovedCount] = useState<number>(34);
  const [needCareCount, setNeedCareCount] = useState<number>(4);

  // Customer-specific state
  const [rentDays, setRentDays] = useState<number>(3);
  const [items, setItems] = useState([
    { id: "p1", name: "Hilleberg Allak Dome Tent", price: 210000, quantity: 1, img: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=200&auto=format&fit=crop" },
    { id: "p2", name: "Osprey Atmos AG 65L Pack", price: 95000, quantity: 2, img: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=200&auto=format&fit=crop" },
    { id: "p3", name: "Jetboil Cooking Stove Set", price: 45000, quantity: 1, img: "https://images.unsplash.com/photo-1526253038957-bce54e05968e?q=80&w=200&auto=format&fit=crop" },
  ]);

  // Admin action simulations
  const handleApprove = (id: string, name: string) => {
    setVerifications(prev => prev.filter(r => r.id !== id));
    setApprovedCount(prev => prev + 1);
    toast.success(`Akun ${name} Berhasil Terverifikasi!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const handleFlag = (id: string, name: string) => {
    setVerifications(prev => prev.filter(r => r.id !== id));
    setNeedCareCount(prev => prev + 1);
    toast.error(`KTP ${name} ditandai butuh revisi manual`, {
      position: "bottom-right",
      autoClose: 2500,
    });
  };

  const resetAdminSimulation = () => {
    setVerifications(INITIAL_REQUESTS);
    setApprovedCount(34);
    setNeedCareCount(4);
    toast.info("Simulasi reset ke setingan awal", { position: "bottom-right" });
  };

  // Customer calculations
  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nq = Math.max(0, item.quantity + delta);
        return { ...item, quantity: nq };
      }
      return item;
    }));
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalWithDays = totalPrice * rentDays;

  return (
    <div className="w-full flex flex-col gap-10">
      {/* Platform Selector Tabs */}
      <div className="flex justify-center">
        <div className="bg-[#121212] p-1.5 rounded-2xl border border-white/5 inline-flex gap-1 relative shadow-inner">
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "admin"
                ? "bg-[#FF6600] text-white shadow-md shadow-[#FF6600]/10"
                : "text-white/60 hover:text-white"
            }`}
          >
            <LayoutDashboard size={16} /> Operasional (Admin Console)
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "customer"
                ? "bg-[#FF6600] text-white shadow-md shadow-[#FF6600]/10"
                : "text-white/60 hover:text-white"
            }`}
          >
            <UserCheck size={16} /> Pemesanan (Customer View)
          </button>
        </div>
      </div>

      {/* Main Mock System Container */}
      <div className="w-full bg-[#0F0F0F] rounded-[32px] sm:rounded-[48px] border border-white/10 p-4 sm:p-10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Soft internal gradient lights */}
        <div className="absolute -top-[100px] -left-[100px] w-[300px] h-[300px] bg-[#FF6600]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-[100px] -right-[100px] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Browser Command Bar Mock */}
        <div className="flex justify-between items-center pb-6 mb-8 border-b border-white/5">
          <div className="flex gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500/40 border border-red-500/10" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500/40 border border-amber-500/10" />
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/40 border border-emerald-500/10" />
          </div>
          <div className="w-10 flex justify-end">
            <div className="w-4 h-1.5 bg-white/20 rounded" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "admin" && (
            <motion.div
              key="admin-console"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[#151515] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-white/40 text-xs font-mono uppercase tracking-widest flex items-center justify-between">
                    <span>Approved Hikers</span>
                    <ThumbsUp className="text-emerald-500 w-4 h-4" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-white">{approvedCount}</span>
                    <span className="text-xs text-emerald-500 font-medium font-mono">+12%</span>
                  </div>
                </div>

                <div className="bg-[#151515] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-white/40 text-xs font-mono uppercase tracking-widest flex items-center justify-between">
                    <span>Pending Verification</span>
                    <RefreshCw className="text-amber-500 w-4 h-4 animate-spin-slow" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-[#FF6600]">{verifications.length}</span>
                    <span className="text-xs text-[#FF6600]/60 font-mono">Antrean</span>
                  </div>
                </div>

                <div className="bg-[#151515] border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="text-white/40 text-xs font-mono uppercase tracking-widest flex items-center justify-between">
                    <span>Gear Care / Restock</span>
                    <AlertCircle className="text-[#FF6600] w-4 h-4" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-white">{needCareCount}</span>
                    <span className="text-xs text-white/40 font-mono">Unit</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Queue Panel */}
              <div className="lg:grid lg:grid-cols-12 gap-8 pt-4">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      Antrean Verifikasi KTP (AI Engine)
                    </h4>
                    <span className="text-xs text-white/40 font-mono">{verifications.length} antrean tersisa</span>
                  </div>

                  <div className="space-y-3 min-h-[220px]">
                    <AnimatePresence>
                      {verifications.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-[#151515] border border-dashed border-white/10 rounded-2xl p-10 text-center flex flex-col items-center justify-center h-full min-h-[180px]"
                        >
                          <Check className="text-emerald-400 w-12 h-12 bg-emerald-500/10 p-2.5 rounded-full mb-3" />
                          <div className="text-sm font-semibold text-white">Antrean Bersih Sepenuhnya</div>
                          <p className="text-xs text-white/40 mt-1 max-w-[280px]">Semua KTP penyewa berhasil divalidasi oleh AI Auto-Verification.</p>
                          <button 
                            onClick={resetAdminSimulation}
                            className="mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs px-4 py-2 rounded-xl transition-all font-mono"
                          >
                            RESET SIMULASI
                          </button>
                        </motion.div>
                      ) : (
                        verifications.map((req, index) => (
                          <motion.div
                            key={req.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.35 }}
                            className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#141414] border-white/5 ${
                              req.issue ? "border-amber-500/15" : ""
                            }`}
                          >
                            <div className="flex gap-4 items-center">
                              <div className="w-10 h-10 rounded-full bg-[#FF6600]/10 border border-[#FF6600]/20 flex items-center justify-center font-bold text-[#FF6600] font-mono text-xs">
                                {req.avatar}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-semibold text-white text-sm">{req.name}</div>
                                  {req.issue && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                      <ShieldAlert size={10} /> Review Diperlukan
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-white/40 font-mono mt-0.5">KTP: {req.ktpNum}</div>
                                <div className="text-xs text-[#BDBDBD] font-light mt-1 flex items-center gap-1">
                                  <span className="text-[#FF6600]">•</span> Sewa: {req.item}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleFlag(req.id, req.name)}
                                className="px-3.5 py-2 rounded-xl border border-white/5 bg-white/5 hover:bg-amber-600/10 hover:text-amber-500 text-xs text-white/60 transition-all cursor-pointer font-medium"
                              >
                                Tandai Isu
                              </button>
                              <button
                                onClick={() => handleApprove(req.id, req.name)}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                              >
                                Setujui KTP
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="lg:col-span-4 mt-8 lg:mt-0 flex flex-col justify-between bg-black/50 border border-white/5 p-6 rounded-3xl h-full">
                  <div className="space-y-4">
                    <h5 className="text-xs font-mono uppercase tracking-wider text-[#FF6600] font-bold">Laporan Real-Time</h5>
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      Sistem kami mengotomatisasi persetujuan KTP sebesar 85% menggunakan OCR & pengenalan biometrik. Admin hanya perlu memberi keputusan pada dokumen bermasalah.
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                        <span className="text-white/45">Keakuratan AI</span>
                        <span className="font-mono text-emerald-400">99.2%</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                        <span className="text-white/45">Rerata Verifikasi</span>
                        <span className="font-mono text-white">4.2 detik</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/45">Rerata Pengambilan</span>
                        <span className="font-mono text-white">2.6 menit</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#141414] border border-white/5 p-4 rounded-xl flex items-center justify-between text-[11px] text-[#BDBDBD] font-mono mt-6">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>AWS SERVER STATUS: OPTIMAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "customer" && (
            <motion.div
              key="customer-rent"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Rent Inventory Left */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Eksplorasi Keranjang Penyewaan Anda
                  </h4>
                  <span className="text-xs text-white/40 font-mono">Live Recalculate</span>
                </div>

                <div className="space-y-3.5">
                  {items.map(p => (
                    <div
                      key={p.id}
                      className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/5 select-none shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate max-w-[190px] sm:max-w-none">{p.name}</div>
                          <div className="text-xs text-white/40 mt-1">@ Rp {p.price.toLocaleString("id-ID")}/hari</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-white/5 pt-3 sm:pt-0 sm:border-0 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-black/40 px-2 py-1.5 rounded-xl border border-white/5">
                          <button
                            onClick={() => updateQty(p.id, -1)}
                            className="w-5 h-5 rounded-md hover:bg-white/10 text-white/70 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus size={11} strokeWidth={2.5} />
                          </button>
                          <span className="text-xs font-mono text-white w-4 text-center">{p.quantity}</span>
                          <button
                            onClick={() => updateQty(p.id, 1)}
                            className="w-5 h-5 rounded-md hover:bg-white/10 text-white/70 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus size={11} strokeWidth={2.5} />
                          </button>
                        </div>

                        <div className="text-right min-w-[70px] sm:min-w-[90px]">
                          <span className="text-sm sm:text-xs text-[#FF6600] font-mono font-bold">
                            Rp {(p.price * p.quantity).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Days & Multiplier Calculator Right */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-black/45 rounded-3xl border border-white/5 p-6 md:p-8 relative overflow-hidden">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#FF6600] font-bold">Rincian Durasi & Diskon</span>
                    <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded border border-white/10 text-white/60">Dynamic</span>
                  </div>

                  {/* Range Slider for renting days */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium text-white/70">Durasi Penyewaan</span>
                      <span className="text-base font-mono font-bold text-white">
                        {rentDays} <span className="text-xs text-white/50">Hari</span>
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={rentDays}
                      onChange={e => setRentDays(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF6600]"
                    />

                    <div className="flex justify-between text-[10px] text-white/30 font-mono">
                      <span>1 Hari</span>
                      <span>7 Hari (Diskon 5%)</span>
                      <span>14 Hari (Diskon 15%)</span>
                    </div>
                  </div>

                  {/* Calculations Sheet */}
                  <div className="border-t border-white/5 pt-5 space-y-3 font-light text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-white/45">Total Harga / Hari</span>
                      <span className="text-white font-mono">Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/45">Rasio Diskon Durasi</span>
                      <span className="text-emerald-400 font-mono">
                        {rentDays >= 14 ? "-15%" : rentDays >= 7 ? "-5%" : "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-dashed border-white/5">
                      <span className="text-sm font-medium text-white">Grand Total Estimasi</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#FF6600] font-mono block">
                          Rp {Math.round(totalWithDays * (rentDays >= 14 ? 0.85 : rentDays >= 7 ? 0.95 : 1.0)).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5">
                  <div className="bg-[#FF6600]/10 border border-white/5 p-4 rounded-xl flex items-center gap-3 text-xs text-white">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-ping shrink-0" />
                    <span>Lakukan registrasi untuk menyimpan keranjang & verifikasi profil Anda.</span>
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
