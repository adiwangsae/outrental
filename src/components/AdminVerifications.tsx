/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Booking, BookingStatus, Item, SystemNotification } from "../types";
import { LucideIcon } from "./LucideIcon";
import { motion, AnimatePresence } from "motion/react";

interface AdminVerificationsProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  addActivity: (action: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  setNotifs: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
}

export const AdminVerifications: React.FC<AdminVerificationsProps> = ({
  bookings,
  setBookings,
  items,
  setItems,
  addActivity,
  showToast,
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [fineAmount, setFineAmount] = useState("");
  const [beforeCondLog, setBeforeCondLog] = useState("");
  const [afterCondLog, setAfterCondLog] = useState("");

  const rupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fmtDate = (d: string) => {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const pendingList = bookings.filter((b) => b.status === "pending_verification");
  const activeProcessList = bookings.filter((b) =>
    ["verified", "ready_pickup", "rented", "late"].includes(b.status)
  );

  const handleApprove = (id: string, custName: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "verified" } : b))
    );
    addActivity(`Menyetujui pesanan booking ${id} (${custName})`);
    showToast(`Booking ${id} berhasil disetujui!`, "success");

    // Add notification
    setNotifs((prev) => [
      {
        id: Date.now(),
        title: "Pesanan Disetujui",
        msg: `Booking ${id} milik ${custName} telah disetujui oleh admin.`,
        time: "Baru saja",
        read: false,
        type: "success",
      },
      ...prev,
    ]);
  };

  const handleReject = (id: string, custName: string) => {
    if (confirm(`Apakah Anda yakin ingin MENOLAK pesanan ${id}?`)) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
      addActivity(`Menolak order sewa ${id} (${custName})`);
      showToast(`Pesanan ${id} ditolak.`, "info");

      // Add notification
      setNotifs((prev) => [
        {
          id: Date.now(),
          title: "Pesanan Ditolak",
          msg: `Mohon maaf, booking ${id} Anda telah ditolak oleh admin.`,
          time: "Baru saja",
          read: false,
          type: "error",
        },
        ...prev,
      ]);
    }
  };

  // Status progression updater
  const handleNextStep = (booking: Booking) => {
    let nextStatus: BookingStatus = booking.status;
    let desc = "";

    if (booking.status === "verified") {
      nextStatus = "ready_pickup";
      desc = "Barang disiapkan & siap diambil";
    } else if (booking.status === "ready_pickup") {
      nextStatus = "rented";
      desc = "Barang diserahkan (Status: Sedang Disewa)";
    } else if (booking.status === "rented" || booking.status === "late") {
      nextStatus = "completed";
      desc = "Transaksi pengembalian selesai.";
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === booking.id) {
          return {
            ...b,
            status: nextStatus,
            conditionBefore: beforeCondLog || b.conditionBefore || "Sangat baik",
            conditionAfter: afterCondLog || b.conditionAfter || "Sama seperti semula",
            denda: fineAmount ? Number(fineAmount) : b.denda,
          };
        }
        return b;
      })
    );

    // If renting or completing, adjust stock parameters
    if (nextStatus === "rented") {
      setItems((prev) =>
        prev.map((it) => {
          if (booking.items.toLowerCase().includes(it.name.toLowerCase())) {
            const nextAvail = Math.max(0, it.avail - booking.qty);
            return { ...it, avail: nextAvail, status: nextAvail === 0 ? "dipinjam" : it.status };
          }
          return it;
        })
      );
    } else if (nextStatus === "completed") {
      setItems((prev) =>
        prev.map((it) => {
          if (booking.items.toLowerCase().includes(it.name.toLowerCase())) {
            const nextAvail = Math.min(it.stock, it.avail + booking.qty);
            return { ...it, avail: nextAvail, status: "tersedia" };
          }
          return it;
        })
      );
    }

    addActivity(`Memperbarui status order ${booking.id} (${booking.custName}) ke: ${nextStatus}`);
    showToast(`Order ${booking.id} diperbarui ke: ${nextStatus}!`, "success");

    // Add notification for status change
    setNotifs((prev) => [
      {
        id: Date.now(),
        title: "Pembaruan Status",
        msg: `Status booking ${booking.id} kini: ${nextStatus.replace(/_/g, ' ')}.`,
        time: "Baru saja",
        read: false,
        type: "info",
      },
      ...prev,
    ]);

    setSelectedBooking(null);
    setBeforeCondLog("");
    setAfterCondLog("");
    setFineAmount("");
  };

  return (
    <motion.div 
      className="space-y-8 animate-fade-in pb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      
      {/* Title section */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl liquid-glass-card flex items-center justify-center text-forest shadow-[0_0_20px_rgba(45,90,39,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-transparent group-hover:scale-110 transition-transform duration-500"></div>
          <LucideIcon name="ShieldCheck" size={24} className="relative z-10" />
        </div>
        <div className="space-y-0.5">
          <h1 className="heading-crisp text-3xl sm:text-4xl uppercase tracking-widest leading-none">
            Verifikasi & Aliran Status
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shadow-[0_0_8px_theme(colors.forest)]"></span>
            <p className="text-[11px] text-[#a3b8a1] font-black uppercase tracking-widest leading-none">Manajemen Order & Logistik</p>
          </div>
        </div>
      </div>

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Verification queue list (COL-12 or COL-6 depending on active lists) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange shadow-[0_0_10px_theme(colors.orange)]" />
            <h3 className="text-sm text-white font-extrabold tracking-wider uppercase">
              Butuh Verifikasi Akun/Order ({pendingList.length})
            </h3>
          </div>

          {pendingList.length === 0 ? (
            <div className="liquid-glass-card border border-white/5 p-8 rounded-[24px] text-center text-[#8ca38a] text-[13px] font-medium shadow-inner">
              <LucideIcon name="CheckCircle" className="text-forest mx-auto mb-3" size={32} />
              Antrean kosong! Semua booking telah divalidasi.
            </div>
          ) : (
            pendingList.map((order) => (
              <div
                key={order.id}
                className="liquid-glass-card border border-orange/20 rounded-[24px] p-5 space-y-4 relative overflow-hidden backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange/5 to-transparent pointer-events-none" />
                
                {/* Header card info */}
                <div className="flex justify-between items-start gap-4 relative z-10">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-black text-white tracking-wide drop-shadow-sm">{order.custName}</span>
                      <span className="text-[10px] font-black tracking-widest text-[#a3b8a1] border border-white/10 bg-white/5 px-2 py-0.5 rounded-md backdrop-blur-md">#{order.id}</span>
                      {order.idUploaded && (
                        <span className="text-[9px] badge-completed shadow-forest/10">
                          ID TERLAMPIR
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-forest font-extrabold tracking-wide">
                      {order.items} <span className="text-[#8ca38a] opacity-50">•</span> {order.qty} Unit
                    </p>
                    <p className="text-[10px] text-[#a3b8a1] font-medium tracking-wide">
                      Tanggal: {fmtDate(order.start)} s/d {fmtDate(order.end)} ({order.days} hari)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-[#a3b8a1] block uppercase tracking-[0.2em] font-black opacity-80 mb-1">Total Biaya</span>
                    <span className="heading-caps text-[16px] font-black text-orange drop-shadow-md">{rupiah(order.total)}</span>
                  </div>
                </div>

              {order.note && (
                <div className="bg-[#000000]/40 border border-white/5 p-3 rounded-xl text-[11px] text-[#bdcfbb] relative z-10 font-medium shadow-inner">
                  <span className="font-black text-[#8ca38a] tracking-widest uppercase mr-1">Catatan:</span> "{order.note}"
                </div>
              )}

                {/* Simulated Identity Card Doc Review */}
                {order.idUploaded && (
                  <div className="bg-[#000000]/40 border border-white/10 rounded-xl p-3 flex items-center justify-between relative z-10 hover:bg-[#000000]/60 transition-colors shadow-inner group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-forest/10 border border-forest/20 flex items-center justify-center text-forest shadow-md">
                        <LucideIcon name="FileText" size={14} />
                      </div>
                      <div className="text-left">
                        <span className="block text-[11px] font-bold text-white group-hover:text-forest transition-colors">DOKUMEN_KTP_VERIF.jpg</span>
                        <span className="block text-[9px] text-[#8ca38a] font-medium tracking-wide">Sertifikasi Valid • Jaminan Aman</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => showToast(`Pratinjau KTP ${order.custName} valid!`, "info")}
                      className="liquid-glass-button text-[10px] bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white font-extrabold px-3 py-1.5 rounded-lg transition-all"
                    >
                      LIHAT DOKUMEN
                    </button>
                  </div>
                )}

                {/* Control Action Buttons */}
                <div className="flex gap-3 pt-2 relative z-10">
                  <button
                    onClick={() => handleReject(order.id, order.custName)}
                    className="liquid-glass-button flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-extrabold py-3 rounded-[14px] text-[11px] uppercase tracking-widest transition-all"
                  >
                    TOLAK BOOKING
                  </button>
                  <button
                    onClick={() => handleApprove(order.id, order.custName)}
                    className="liquid-glass-button flex-1 bg-forest hover:bg-[#1e3a1a] text-white font-black py-3 rounded-[14px] text-[11px] uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(45,90,39,0.3)]"
                  >
                    SETUJUI / APPROVE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status pipeline update list (COL-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest shadow-[0_0_10px_theme(colors.forest)]" />
            <h3 className="text-sm text-white font-extrabold tracking-wider uppercase">
              Pelacakan Status Aktif ({activeProcessList.length})
            </h3>
          </div>

          {activeProcessList.length === 0 ? (
            <div className="liquid-glass-card border border-white/5 p-8 rounded-[24px] text-center text-[#8ca38a] text-[13px] font-medium shadow-inner">
              Tidak ada penyewaan aktif yang berjalan hari ini.
            </div>
          ) : (
            activeProcessList.map((order) => (
              <div
                key={order.id}
                className="liquid-glass-card border border-white/10 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg text-left backdrop-blur-md relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-forest/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-extrabold text-white text-[14px] tracking-wide drop-shadow-sm">{order.custName}</span>
                    <span className="text-[10px] text-[#8ca38a] border border-white/5 bg-white/2 px-1.5 py-0.5 rounded-md font-black tracking-widest">#{order.id}</span>
                  </div>
                  <p className="text-[13px] text-forest font-extrabold tracking-wide">
                    {order.items} <span className="text-[#8ca38a]">({order.qty} unit)</span>
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1 font-medium tracking-wide">
                    Periode: {fmtDate(order.start)} – {fmtDate(order.end)}
                  </p>
                  {order.denda && (
                    <span className="inline-block text-[9px] text-red-400 font-black tracking-widest uppercase bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md mt-1.5 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                      Denda: {rupiah(order.denda)} (Overdue)
                    </span>
                  )}
                </div>

                <div className="flex sm:flex-col items-end gap-3 relative z-10">
                  {/* Active Step status badge */}
                  <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest text-center border mr-auto sm:mr-0 flex items-center shadow-md ${
                    order.status === "verified" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                    order.status === "ready_pickup" ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                    order.status === "rented" ? "bg-orange-500/10 text-orange-400 border-orange-500/30" :
                    "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                  }`}>
                    {order.status === "verified" ? "Terverifikasi" :
                     order.status === "ready_pickup" ? "Siap Diambil" :
                     order.status === "rented" ? "Sedang Disewa" : "Terlambat"}
                  </span>

                  {/* Flow Action triggers */}
                  <button
                    onClick={() => {
                      setSelectedBooking(order);
                      if (order.status === "ready_pickup") {
                        setBeforeCondLog("Kondisi baik, bersih, siap pakai...");
                      } else if (order.status === "rented" || order.status === "late") {
                        setAfterCondLog("Bersih, tidak ada sobek...");
                      }
                    }}
                    className="liquid-glass-button bg-forest hover:bg-[#1e3a1a] text-white font-black px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(45,90,39,0.3)]"
                  >
                    PROSES
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Advanced Gear Condition Documentation and Status Updater Overlay modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div 
            className="fixed inset-0 bg-[#000000]/60 backdrop-blur-xl z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[#0a130c]/90 border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] pb-8 sm:pb-0 backdrop-blur-2xl"
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-2 mt-4 block sm:hidden" />
            
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/2">
              <h2 className="heading-caps font-black text-white text-[15px] tracking-wider flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
                  <LucideIcon name="Shield" size={14} />
                </div>
                Dokumentasi & Progres Order #{selectedBooking.id}
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="bg-[#000000]/40 backdrop-blur-md p-4 rounded-2xl text-left text-[12px] text-stone-200 border border-white/5 shadow-inner">
                <p><span className="font-extrabold text-[#8ca38a] uppercase tracking-wider text-[10px] inline-block w-24">Pelanggan:</span> <span className="font-bold">{selectedBooking.custName}</span></p>
                <p className="mt-1.5"><span className="font-extrabold text-[#8ca38a] uppercase tracking-wider text-[10px] inline-block w-24">Barang Sewa:</span> <span className="text-forest font-bold">{selectedBooking.items} ({selectedBooking.qty} unit)</span></p>
                <p className="mt-1.5"><span className="font-extrabold text-[#8ca38a] uppercase tracking-wider text-[10px] inline-block w-24">Hari Sewa:</span> {fmtDate(selectedBooking.start)} to {fmtDate(selectedBooking.end)}</p>
                <p className="mt-1.5 font-bold"><span className="font-extrabold text-[#8ca38a] uppercase tracking-wider text-[10px] inline-block w-24">Total Biaya:</span> <span className="text-orange bg-orange/10 px-1.5 py-0.5 rounded">{rupiah(selectedBooking.total)}</span></p>
              </div>

              {/* Verified to Ready-to-pickup step requires no details, just double confirm */}
              {selectedBooking.status === "verified" ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                    <LucideIcon name="Package" size={32} />
                  </div>
                  <p className="text-[16px] font-black text-white tracking-wide">Siapkan Perlengkapan Outdoor</p>
                  <p className="text-[12px] text-stone-400 max-w-xs mx-auto leading-relaxed">
                    Konfirmasi jika barang sewa sudah dibersihkan, dipacking komplit, dan ditaruh di rak pengambilan agar status berubah menjadi <span className="text-forest font-bold">"Siap Diambil"</span>.
                  </p>
                </div>
              ) : selectedBooking.status === "ready_pickup" ? (
                /* Ready to rent transition: Record condition before */
                <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block ml-1">
                    Catatan Kondisi Fisik Jaminan Keluar
                  </label>
                  <input
                    type="text"
                    value={beforeCondLog}
                    onChange={(e) => setBeforeCondLog(e.target.value)}
                    className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 transition-all shadow-inner"
                    placeholder="Contoh: Lengkap utuh, pasak 10 pcs, frame mulus."
                    required
                  />
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-orange/5 border border-orange/20 text-[11px] text-orange/80 leading-relaxed">
                    <span className="font-extrabold text-orange block uppercase tracking-widest flex items-center gap-1.5 mb-2"><LucideIcon name="ShieldAlert" size={13}/> FUNGSI PENGAMANAN</span>
                    Catatan ini digunakan sistem untuk membandingkan kondisi alat saat dikembalikan guna meminimalkan sengketa fisik denda kerusakan.
                  </div>
                </div>
              ) : (
                /* Rented/Late to Complete */
                <div className="space-y-5 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                        Denda Nominal (Opsional)
                      </label>
                      <input
                        type="number"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(e.target.value)}
                        className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white outline-none focus:border-red-500/50 focus:bg-[#000000]/60 transition-all font-mono"
                        placeholder="Rp 0"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                        Status Keterlambatan
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#000000]/20 border border-white/5 rounded-xl px-4 py-3 text-[12px] text-stone-400 outline-none cursor-not-allowed font-medium"
                        disabled
                        value={selectedBooking.status === "late" ? "Terlambat aktif" : "Tepat waktu"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                      Catatan Pengembalian Masuk
                    </label>
                    <input
                      type="text"
                      value={afterCondLog}
                      onChange={(e) => setAfterCondLog(e.target.value)}
                      className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-[12px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 transition-all shadow-inner"
                      placeholder="Contoh: Lengkap mulus bersih, tidak ada robekan."
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="liquid-glass-button flex-1 bg-white/5 hover:bg-white/10 text-stone-300 font-extrabold px-4 py-3.5 rounded-xl text-[11px] uppercase tracking-widest transition-all border border-white/10"
                >
                  BATAL
                </button>
                <button
                  onClick={() => handleNextStep(selectedBooking)}
                  className="liquid-glass-button flex-1 bg-forest hover:bg-[#1e3a1a] text-white font-black px-4 py-3.5 rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(45,90,39,0.3)]"
                >
                  KONFIRMASI SELESAI
                </button>
              </div>

            </div>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </motion.div>
  );
};
export default AdminVerifications;
