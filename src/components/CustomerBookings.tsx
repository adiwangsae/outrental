/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Booking, User, BookingStatus } from "../types";
import { LucideIcon } from "./LucideIcon";

interface CustomerBookingsProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  user: User;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const STEPS: { key: BookingStatus; label: string }[] = [
  { key: "pending_verification", label: "Pending" },
  { key: "verified", label: "Diterima" },
  { key: "ready_pickup", label: "Siap Ambil" },
  { key: "rented", label: "Disewa" },
  { key: "completed", label: "Selesai" },
];

export const CustomerBookings: React.FC<CustomerBookingsProps> = ({
  bookings,
  setBookings,
  user,
  showToast,
}) => {
  const [ktpModalBookingId, setKtpModalBookingId] = useState<string | null>(null);
  const [transferModalBookingId, setTransferModalBookingId] = useState<string | null>(null);
  const [qrModalBookingId, setQrModalBookingId] = useState<string | null>(null);
  const [printModalBookingId, setPrintModalBookingId] = useState<string | null>(null);

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

  const myBookings = bookings.filter((b) => b.custId === user.id);

  // Handles simulated upload of KTP
  const handleUploadKtp = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, idUploaded: true } : b))
    );
    showToast("Dokumen jaminan KTP / KTM berhasil diunggah!", "success");
    setKtpModalBookingId(null);
  };

  // Handles simulated transfer slip upload -> transitions to payment approved
  const handleUploadTransferSlip = (id: string) => {
    showToast("Bukti pembayaran transfer telah dikirim ke admin!", "success");
    setTransferModalBookingId(null);
  };

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8 px-4 sm:px-0"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
    >
      
      {/* Intro info wrapper */}
      <motion.div 
        className="flex items-center gap-4"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
        }}
      >
        <div className="w-12 h-12 rounded-2xl liquid-glass-card flex items-center justify-center text-forest shadow-[0_0_20px_rgba(45,90,39,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-transparent group-hover:scale-110 transition-transform duration-500"></div>
          <LucideIcon name="CalendarDays" size={24} className="relative z-10" />
        </div>
        <div>
          <h1 className="heading-crisp text-3xl sm:text-4xl uppercase tracking-widest leading-none">
            Booking Saya
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shadow-[0_0_8px_rgba(45,90,39,0.5)]"></span>
            <p className="text-[11px] text-[#a3b8a1] font-black uppercase tracking-widest leading-none">Status Reservasi Real-Time</p>
          </div>
        </div>
      </motion.div>

      {myBookings.length === 0 ? (
        <motion.div 
          className="liquid-glass-card p-12 rounded-2xl text-center text-[#8ca38a] max-w-lg mx-auto shadow-xl"
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
          }}
        >
          <LucideIcon name="CalendarX2" className="mx-auto mb-4 text-[#8ca38a] opacity-50" size={48} />
          <h4 className="font-bold text-stone-200 tracking-wide">Belum Ada Transaksi Booking</h4>
          <p className="text-xs text-stone-400 mt-2 leading-relaxed font-medium">
            Tidak ada pesanan sewa aktif saat ini. Silakan kunjungi halaman katalog untuk mulai menyewa perlengkapan.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {myBookings.map((order) => {
            // Find current progress index
            // If cancelled or late, handles slightly differently
            const activeIdx = order.status === "cancelled" ? -1 : STEPS.findIndex((s) => s.key === order.status || (order.status === "late" && s.key === "rented"));

            return (
              <motion.div
                key={order.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className={`liquid-glass-card relative overflow-hidden rounded-2xl p-5 md:p-6 text-left shadow-xl ${
                  order.status === "late" ? "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)] ring-1 ring-red-500/10" : ""
                }`}
              >
                
                {/* Header Information and pricing element */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5 mb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-[16px] tracking-wide drop-shadow-sm">
                        {order.items}
                      </span>
                      <span className="text-[10px] bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-md text-[#a3b8a1] font-black tracking-widest backdrop-blur-md">
                        #{order.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#a3b8a1] font-bold flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-forest/10 flex items-center justify-center">
                        <LucideIcon name="Calendar" size={12} className="text-forest" />
                      </div>
                      <span className="opacity-80 uppercase tracking-widest text-[10px]">Rentang Sewa:</span> {fmtDate(order.start)} <span className="text-[#8ca38a] opacity-50">–</span> {fmtDate(order.end)} ({order.days} hr • {order.qty} unit)
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
                    <div className="text-right">
                      <span className="text-[9px] text-[#8ca38a] block font-black uppercase tracking-[0.2em] mb-1">TOTAL BIAYA</span>
                      <span className="heading-caps text-lg tracking-wider font-extrabold text-amber-400 text-xl drop-shadow-md">
                        {rupiah(order.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Visual Tracker Step Line (skip if cancelled) */}
                {order.status !== "cancelled" ? (
                  <div className="py-2.5">
                    {/* Stepper bubbles responsive loop */}
                    <div className="flex items-center justify-between overflow-x-auto pb-4 no-scrollbar">
                      {STEPS.map((step, sIdx) => {
                        const isDone = activeIdx > sIdx;
                        const isCurrent = activeIdx === sIdx;
                        
                        return (
                          <div key={step.key} className="flex-1 flex items-center min-w-[70px]">
                            <div className="flex flex-col items-center w-full relative z-10">
                              {/* Step circle bubble */}
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black transition-all shadow-lg ${
                                isDone 
                                  ? "bg-forest border-forest/30 text-white font-extrabold shadow-[0_0_15px_rgba(45,90,39,0.3)]" 
                                  : isCurrent
                                    ? "bg-amber-500/10 border-amber-400 text-amber-400 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-110" 
                                    : "bg-white/5 border-white/10 text-[#8ca38a] shadow-inner"
                              }`}>
                                {isDone ? (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : sIdx + 1}
                              </div>
                              <span className={`text-[8.5px] font-black uppercase mt-2 block tracking-widest ${
                                isCurrent ? "text-amber-400" : isDone ? "text-forest" : "text-[#8ca38a]"
                              }`}>
                                {step.label}
                              </span>
                            </div>

                            {/* connector line, render for all except last */}
                            {sIdx < STEPS.length - 1 && (
                              <div className={`h-[2px] flex-1 -mx-4 mb-5 transition-colors duration-500 ${
                                isDone ? "bg-forest shadow-[0_0_10px_rgba(45,90,39,0.2)]" : "bg-white/10"
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-start gap-2.5 mb-4 shadow-md">
                    <LucideIcon name="AlertTriangle" size={16} className="shrink-0 mt-0.5" />
                    <span className="leading-relaxed tracking-wide">
                      PENGAJUAN REJECTED: Reservasi sewa dibatalkan atau ditolak oleh Administrator OUTRENT.
                    </span>
                  </div>
                )}

                {/* Overdue Penalty Panel notifications */}
                {order.status === "late" && order.denda && (
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2 mb-4 text-left shadow-inner">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-red-400 uppercase tracking-widest heading-caps">
                      <LucideIcon name="AlertTriangle" size={14} />
                      OVERDUE KETERLAMBATAN AKTIF
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                      Batas pengembalian ({fmtDate(order.end)}) terlampaui. Tunggakan / denda berjalan saat ini: <strong className="text-red-400 font-extrabold">{rupiah(order.denda)}</strong>.
                    </p>
                  </div>
                )}

                {/* Sub-actions area */}
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#000000]/20 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
                  <div className="text-xs text-stone-300 leading-relaxed text-left space-y-1">
                    <p className="font-bold text-[#8ca38a] text-[9px] uppercase tracking-widest">Garansi Dokumen Validasi</p>
                    {order.idUploaded ? (
                      <span className="text-forest font-extrabold flex items-center gap-1.5 bg-forest/10 px-2 py-1 rounded inline-flex text-[11px] uppercase tracking-wider border border-forest/20">
                        <LucideIcon name="CheckCircle" size={14} />
                        KTP VALID TERUNGGAH
                      </span>
                    ) : (
                      <span className="text-amber-500 flex items-center gap-1.5 font-bold bg-amber-500/10 px-2 py-1 rounded inline-flex text-[11px] uppercase tracking-wider border border-amber-500/20">
                        <LucideIcon name="ShieldAlert" size={14} />
                        KTP WAJIB DIUNGGAH SBLM SERAH TERIMA
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2.5 w-full sm:w-auto self-end sm:self-center">
                    {/* Invoice & Agreement print/download popup trigger */}
                    {order.status !== "cancelled" && (
                      <button
                        onClick={() => setPrintModalBookingId(order.id)}
                        className="liquid-glass-button bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 font-bold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl transition-all w-full sm:w-auto flex items-center justify-center gap-1.5 shadow-md flex-1 sm:flex-none"
                      >
                        <LucideIcon name="FileText" size={12} />
                        INVOICE
                      </button>
                    )}

                    {/* Identity card upload button popup trigger */}
                    {!order.idUploaded && order.status !== "cancelled" && (
                      <button
                        onClick={() => setKtpModalBookingId(order.id)}
                        className="liquid-glass-button bg-forest/10 hover:bg-forest/20 text-forest border border-forest/30 font-extrabold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(45,90,39,0.15)] w-full sm:w-auto flex items-center justify-center flex-1 sm:flex-none"
                      >
                        <LucideIcon name="UploadCloud" size={12} className="mr-1.5" /> UPLOAD KTP
                      </button>
                    )}

                    {order.status !== "pending_verification" && order.status !== "cancelled" && (
                      <button
                        onClick={() => setQrModalBookingId(order.id)}
                        className="liquid-glass-button bg-forest hover:bg-[#1e3a1a] text-white border border-[#2d5a27]/30 font-extrabold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(45,90,39,0.3)] w-full sm:w-auto flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                      >
                        <LucideIcon name="QrCode" size={14} />
                        QR LOGISTIK
                      </button>
                    )}

                    {/* Pay button for transfer options when verified or pickup */}
                    {["verified", "ready_pickup"].includes(order.status) && (
                      <button
                        onClick={() => setTransferModalBookingId(order.id)}
                        className="liquid-glass-button bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl transition-all w-full sm:w-auto flex items-center justify-center gap-1.5 shadow-md flex-1 sm:flex-none"
                      >
                        <LucideIcon name="CreditCard" size={12} />
                        INFO BAYAR TRANSFER
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* Uploading Identity Modal dialogue */}
      <AnimatePresence>
        {ktpModalBookingId && (
          <div className="fixed inset-0 bg-[#020503]/50 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
            <motion.div 
              className="bg-[#0a130c]/95 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              
              {/* iOS Bottom Sheet style drag indicator */}
              <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-1 mt-3 block sm:hidden" />
              
              <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#000000]/20">
                <h4 className="heading-caps font-black text-white text-sm tracking-wider flex items-center gap-2">
                  <LucideIcon name="Shield" className="text-forest" size={16} />
                  Unggah Jaminan KTP
                </h4>
                <button onClick={() => setKtpModalBookingId(null)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors hover:bg-white/10 shrink-0" aria-label="Close">
                  <LucideIcon name="X" size={14} />
                </button>
              </div>

              <div className="p-6 text-center space-y-5">
                <div 
                  onClick={() => handleUploadKtp(ktpModalBookingId)}
                  className="bg-[#000000]/30 border-2 border-dashed border-white/10 hover:border-forest/50 hover:bg-forest/5 rounded-2xl p-8 cursor-pointer transition-all space-y-3 group"
                >
                  <div className="w-14 h-14 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_20px_rgba(45,90,39,0.2)]">
                    <LucideIcon name="UploadCloud" size={26} />
                  </div>
                  <div>
                    <span className="block text-[13px] font-bold text-stone-200">Klik untuk Pilih dari Galeri HP/Desktop</span>
                    <span className="block text-[10px] text-[#8ca38a] mt-1.5">Format Dokumen: JPG, PNG, atau PDF (Maks. 5MB)</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#8ca38a] leading-relaxed max-w-xs mx-auto font-medium">
                  Dokumen jaminan KTP Anda sangat rahasia & aman, dilindungi enkripsi sistem sesuai kebijakan privasi untuk keperluan asuransi alat.
                </p>
                <button
                  onClick={() => setKtpModalBookingId(null)}
                  className="liquid-glass-button w-full bg-white/5 text-stone-300 py-3.5 rounded-xl text-[11px] uppercase tracking-widest font-bold border border-white/10 hover:bg-white/10 transition-colors"
                >
                  BATAL
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Details info modal dialogue */}
      <AnimatePresence>
        {transferModalBookingId && (
          <div className="fixed inset-0 bg-[#020503]/50 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
            <motion.div 
              className="bg-[#0a130c]/95 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              
              {/* iOS Bottom Sheet style drag indicator */}
              <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-1 mt-3 block sm:hidden" />
              
              <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#000000]/20">
                <h4 className="heading-caps font-black text-white text-sm tracking-wider flex items-center gap-2">
                  <LucideIcon name="CreditCard" className="text-forest" size={16} />
                  Pembayaran Offline / COD
                </h4>
                <button onClick={() => setTransferModalBookingId(null)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors hover:bg-white/10 shrink-0" aria-label="Close">
                  <LucideIcon name="X" size={14} />
                </button>
              </div>

              <div className="p-6 text-left space-y-5">
                
                <div className="space-y-4 divide-y divide-white/5">
                  <div className="pb-4 space-y-2">
                    <span className="text-[10px] text-forest font-bold uppercase tracking-widest block bg-forest/10 inline-block px-2 py-0.5 rounded">Opsi A: Transfer Rekening</span>
                    <p className="text-[11px] font-semibold text-stone-300 leading-relaxed">
                      Lakukan transfer biaya reservasi ke rekening resmi kami:
                    </p>
                    <div className="bg-[#000000]/40 border border-white/5 p-4 rounded-xl select-all font-black text-[13px] text-forest font-mono text-center shadow-inner tracking-widest">
                      MANDIRI 123-45678-90
                    </div>
                  </div>

                  <div className="pt-4 space-y-2 text-xs">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mb-1 bg-amber-500/10 inline-block px-2 py-0.5 rounded">Opsi B: Bayar Di Tempat / COD</span>
                    <p className="text-stone-400 leading-relaxed text-[11px] font-medium">
                      Anda juga dapat melunasi sewa secara tunai (Cash) saat kedatangan pengambilan alat di OUTRENT. Cukup informasikan ID Transaksi kepada admin.
                    </p>
                  </div>
                </div>

                <div className="pt-2 gap-3 flex flex-col sm:flex-row">
                  <button
                    type="button"
                    onClick={() => handleUploadTransferSlip(transferModalBookingId)}
                    className="liquid-glass-button flex-grow bg-forest/10 hover:bg-forest/20 border border-forest/30 text-forest font-extrabold px-4 py-3.5 rounded-xl text-[11px] uppercase tracking-widest shadow-[0_0_15px_rgba(45,90,39,0.15)] order-1 sm:order-2"
                  >
                    SAYA SUDAH TRANSFER PADA BANK
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferModalBookingId(null)}
                    className="liquid-glass-button flex-grow bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-4 py-3.5 rounded-xl text-[11px] uppercase tracking-widest border border-white/10 order-2 sm:order-1"
                  >
                    BATAL
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Presentation Dialog Popup Modal */}
      <AnimatePresence>
        {qrModalBookingId && (() => {
          const order = bookings.find(b => b.id === qrModalBookingId);
          if (!order) return null;
          return (
            <div className="fixed inset-0 bg-[#020503]/50 backdrop-blur-xl z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
              <motion.div 
                className="bg-[#0a130c]/95 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6 text-center space-y-6 flex flex-col"
                initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                
                {/* iOS Bottom Sheet style drag indicator */}
                <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-1 block sm:hidden relative z-10" />
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="heading-caps font-black text-white text-sm tracking-wider flex items-center gap-2">
                    <LucideIcon name="QrCode" className="text-forest" size={16} />
                    Kode Booking Digital Logistik
                  </h4>
                  <button onClick={() => setQrModalBookingId(null)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors hover:bg-white/10 shrink-0" aria-label="Close">
                    <LucideIcon name="X" size={14} />
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl inline-block shadow-[0_0_40px_rgba(255,255,255,0.15)] mx-auto border-[3px] border-forest/20 relative">
                  <svg width="180" height="180" viewBox="0 0 100 100" className="mx-auto text-black">
                    <path d="M 5,5 h 25 v 25 h -25 z M 10,10 h 15 v 15 h -15 z" fill="currentColor" />
                    <path d="M 65,5 h 25 v 25 h -25 z M 70,10 h 15 v 15 h -15 z" fill="currentColor" />
                    <path d="M 5,65 h 25 v 25 h -25 z M 10,70 h 15 v 15 h -15 z" fill="currentColor" />
                    <path d="M 35,5 h 5 v 10 h -5 z M 45,5 h 10 v 5 h -10 z M 40,25 h 15 v 5 h -15 z" fill="currentColor" />
                    <path d="M 5,35 h 10 v 15 h -10 z M 20,35 h 15 v 5 h -15 z M 25,45 h 15 v 10 h -15 z" fill="currentColor" />
                    <path d="M 55,35 h 15 v 10 h -15 z M 75,35 h 15 v 5 h -15 z M 80,45 h 10 v 15 h -10 z" fill="currentColor" />
                    <path d="M 45,65 h 15 v 10 h -15 z M 35,80 h 10 v 15 h -10 z M 70,70 h 20 v 20 h -20 z" fill="currentColor" />
                    <circle cx="50" cy="50" r="4" fill="currentColor" />
                  </svg>
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col justify-end">
                  <span className="text-[10px] text-[#8ca38a] uppercase font-bold tracking-widest block bg-white/5 inline-block mx-auto px-2 py-1 rounded">IDENTITAS SECURE QR-LOGISTIK</span>
                  <span className="text-xl font-black text-white font-mono tracking-widest pt-2">{order.id}</span>
                  <p className="text-[13px] text-amber-400 font-extrabold">{order.items}</p>
                  <p className="text-[10px] text-[#8ca38a] leading-relaxed font-medium mx-auto max-w-[280px]">
                    Beritahukan bukti peminjaman dengan cara tunjukkan QR pada petugas saat berada di OUTRENT untuk mempercepat konfirmasi identifikasi fisik unit logistik dan data.
                  </p>
                </div>

                <div className="pt-0">
                  <button
                    onClick={() => setQrModalBookingId(null)}
                    className="liquid-glass-button w-full bg-white/5 hover:bg-white/10 text-stone-300 py-3.5 rounded-xl text-[11px] tracking-widest uppercase font-extrabold border border-white/10"
                  >
                    TUTUP PANDEL DIGITAL
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* DIGITAL RENTAL AGREEMENT & INVOICE PRINT PREVIEW MODAL */}
      <AnimatePresence>
        {printModalBookingId && (() => {
          const order = bookings.find(b => b.id === printModalBookingId);
          if (!order) return null;
          return (
            <div className="fixed inset-0 bg-[#020503]/50 backdrop-blur-xl z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 overflow-y-auto">
              <motion.div 
                className="bg-[#0a130c]/95 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[90vh] pb-10 sm:pb-0"
                initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                
                {/* iOS Bottom Sheet style drag indicator */}
                <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-2 mt-3 block sm:hidden relative z-10" />
                
                {/* Header inside modal */}
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#000000]/20 shrink-0">
                  <h4 className="heading-caps font-black text-white text-sm tracking-wider flex items-center gap-2">
                    <LucideIcon name="Printer" className="text-forest" size={16} />
                    Agreement & Surat Rental #BC-{order.id}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const printContents = document.getElementById("printable-agreement-area")?.innerHTML;
                        if (printContents) {
                          const win = window.open("", "_blank");
                          if (win) {
                            win.document.write(`
                              <html>
                                <head>
                                  <title>Invoice & Surat Perjanjian #${order.id}</title>
                                  <style>
                                    body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.5; background-color: #fff; }
                                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                                    .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; color: #111; }
                                    .header p { margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; color: #555; }
                                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
                                    .card-sign { border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #fafafa; }
                                    .card-sign p { margin: 3px 0; }
                                    .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 10px; color: #222; }
                                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                                    th, td { padding: 9px; text-align: left; border-bottom: 1px solid #ddd; font-size: 11px; }
                                    th { background-color: #f0f0f0; text-transform: uppercase; color: #333; }
                                    .total-box { background-color: #f7fff7; border: 1px solid #cce8cc; padding: 12px; border-radius: 6px; text-align: right; font-size: 14px; font-weight: bold; margin-top: 15px; }
                                    .terms { font-size: 9.5px; color: #444; margin-top: 25px; text-align: justify; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
                                    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 35px; text-align: center; }
                                    .signature-box { border: 1px dashed #777; height: 60px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; background: #fff; position: relative; border-radius: 6px; }
                                    .sign-font { font-family: var(--font-sans); font-style: italic; font-size: 16px; color: #1e3a1e; font-weight: bold; }
                                    .badge-stamp { border: 2px solid #2d5a27; color: #2d5a27; padding: 2px 6px; font-size: 8px; font-weight: bold; text-transform: uppercase; border-radius: 4px; display: inline-block; transform: rotate(-5deg); margin-top: 5px; }
                                  </style>
                                </head>
                                <body>
                                  ${printContents}
                                  <script>window.onload = function() { window.print(); window.close(); }</script>
                                </body>
                              </html>
                            `);
                            win.document.close();
                          } else {
                            window.print();
                          }
                        }
                      }}
                      className="liquid-glass-button bg-forest hover:bg-[#1e3a1a] text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(45,90,39,0.3)]"
                    >
                      <LucideIcon name="Printer" size={13} />
                      CETAK BERKAS
                    </button>
                    <button onClick={() => setPrintModalBookingId(null)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors hover:bg-white/10 shrink-0" aria-label="Close">
                      <LucideIcon name="X" size={14} />
                    </button>
                  </div>
                </div>

                {/* Scrollable container displaying physical sheets inside dark dashboard */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left no-scrollbar">
                  <div 
                    id="printable-agreement-area"
                    className="bg-[#000000]/30 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6 shadow-inner"
                  >
                    
                    {/* Store Header */}
                    <div className="text-center border-b border-white/10 pb-5 space-y-1.5">
                      <span className="text-forest font-bold tracking-widest text-[10px] uppercase block font-mono bg-forest/10 inline-block px-2 py-0.5 rounded border border-forest/20">OUTRENT RINJANI ADVENTURE LOGISTICS</span>
                      <h2 className="heading-jumbo text-lg tracking-widest text-white uppercase pt-2">SURAT PERJANJIAN SEWA & INVOICE RESMI</h2>
                      <p className="text-[10px] text-[#8ca38a] uppercase leading-none font-mono tracking-widest">OUTRENT Outdoor Platform</p>
                    </div>

                    {/* Customer and Rental Info Blocks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="space-y-1.5 bg-[#000000]/40 border border-white/5 p-4 rounded-xl card-sign text-left">
                        <div className="section-title text-[10px] font-bold uppercase border-b border-white/5 pb-2 mb-3 text-[#8ca38a] tracking-widest">Dokumentasi Penyewa</div>
                        <p className="text-white font-bold">{user.name}</p>
                        <p className="text-stone-300">Mail: {user.email}</p>
                        <p className="text-stone-300">W/A: {user.phone}</p>
                        <span className="text-forest font-extrabold uppercase text-[9px] bg-forest/10 px-2 py-1 rounded inline-block mt-2 border border-forest/20">Trust Score: Verified</span>
                      </div>

                      <div className="space-y-1.5 bg-[#000000]/40 border border-white/5 p-4 rounded-xl card-sign text-left">
                        <div className="section-title text-[10px] font-bold uppercase border-b border-white/5 pb-2 mb-3 text-[#8ca38a] tracking-widest">Rincian Nota Finansial</div>
                        <p className="text-forest font-black tracking-widest">#OUT-{order.id}</p>
                        <p className="text-stone-300">Pay Status: <span className="text-amber-400 uppercase font-bold tracking-widest">{order.status === "completed" ? "LUNAS SELESAI" : "DIKONFIRMASI SYSTEM"}</span></p>
                        <p className="text-stone-300">Created: {order.created || "2026-05-22"}</p>
                        <p className="text-stone-300">Hub: Sembalun Center</p>
                      </div>
                    </div>

                    {/* List of items table in standard layout */}
                    {/* Desktop View */}
                    <div className="hidden sm:block overflow-x-auto text-left border border-white/5 rounded-xl bg-[#000000]/20">
                      <table className="w-full text-xs text-left text-stone-300">
                        <thead>
                          <tr className="border-b border-white/10 bg-[#000000]/40 text-[#8ca38a] font-mono text-[10px] uppercase tracking-widest">
                            <th className="py-3 px-4 rounded-tl-xl font-bold">Item Deskripsi Rental</th>
                            <th className="py-3 px-4 text-center font-bold">Qty</th>
                            <th className="py-3 px-4 text-center font-bold">Durasi</th>
                            <th className="py-3 px-4 text-right rounded-tr-xl font-bold">Biaya Nota</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono">
                          <tr className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4 font-bold text-white text-left tracking-wide">
                              {order.items}
                            </td>
                            <td className="py-3 px-4 text-center font-semibold">{order.qty} Unit</td>
                            <td className="py-3 px-4 text-center font-semibold">{order.days} Hari</td>
                            <td className="py-3 px-4 text-right font-black text-amber-400 tracking-wider text-sm">{rupiah(order.total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="sm:hidden block text-[11px] space-y-3 text-left border border-white/10 p-4 rounded-xl font-mono bg-[#000000]/20">
                      <div className="flex justify-between items-start border-b border-white/5 pb-2">
                        <span className="text-[#8ca38a] uppercase text-[10px] font-bold tracking-widest">Alat Rental</span>
                        <strong className="text-white text-right max-w-[180px] break-words font-black tracking-wide">{order.items}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8ca38a] uppercase text-[10px] font-bold tracking-widest">Qty</span>
                        <span className="text-stone-300 font-semibold">{order.qty} Unit</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8ca38a] uppercase text-[10px] font-bold tracking-widest">Durasi</span>
                        <span className="text-stone-300 font-semibold">{order.days} Hari</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-[#8ca38a] uppercase text-[10px] font-bold tracking-widest">Biaya Nota</span>
                        <span className="text-amber-400 font-black tracking-wider text-sm">{rupiah(order.total)}</span>
                      </div>
                    </div>

                    {/* Calculations ledger detail */}
                    <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-xs text-left">
                      <div className="text-[10px] text-[#8ca38a] leading-relaxed max-w-sm tracking-wide font-medium">
                        * Tarif komputasi telah disinkronkan otomatis berdasarkan sistem Smart Pricing. Belum termasuk denda operasional (Overdue Penalty) apabila melewati batas waktu pengembalian yang disepakati.
                      </div>
                      <div className="bg-forest/10 border border-forest/20 p-4 rounded-xl text-right min-w-[220px] total-box relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-transparent pointer-events-none"></div>
                        <span className="text-[10px] text-forest uppercase block font-black tracking-widest mb-1 shadow-sm relative z-10">TOTAL NETT PAYMENT</span>
                        <span className="text-xl font-black text-white block tracking-wider relative z-10">{rupiah(order.total)}</span>
                        <span className="text-[9px] text-[#8ca38a] block mt-1.5 uppercase font-bold tracking-widest relative z-10">Status: Valid Lunas Tunai</span>
                      </div>
                    </div>

                    {/* Official Terms & Conditions (Digital Rental Agreement) */}
                    <div className="bg-[#000000]/40 border border-white/5 p-5 rounded-xl text-[10px] text-[#8ca38a] space-y-2.5 leading-relaxed font-mono terms text-left shadow-inner">
                      <span className="text-amber-400 font-bold uppercase block text-[10px] tracking-widest border-b border-white/5 pb-2 mb-2">PASAL KETENTUAN HAK & KEWAJIBAN SEWA:</span>
                      <ol className="list-decimal pl-4 space-y-2 font-medium tracking-wide">
                        <li>Penyewa bertanggung jawab penuh atas utilisasi operasional dan kondisi keselamatan logistik sewaan selama ekspedisi di lapangan.</li>
                        <li>Pengembalian perlengkapan sewaan mutlak dilakukan selambat-lambatnya pada tanggal jatuh tempo <strong className="text-white">({fmtDate(order.end)})</strong>. Keterlambatan sepihak akan dikenakan sanksi denda administratif progresif sebesar <strong className="text-white">Rp 50.000,-</strong> per hari per unit.</li>
                        <li>Penyewa secara sadar memberikan persetujuan serta meletakkan kartu identitas asli berupa KTP/KTM penyaluran pendakian sebagai instrumen jaminan transaksi yang sah.</li>
                      </ol>
                    </div>

                    {/* Real Dynamic Interactive Digital Signature Row */}
                    <div className="grid grid-cols-2 gap-6 pt-5 text-xs font-mono signatures text-left">
                      
                      {/* Customer Sign */}
                      <div className="flex flex-col items-center justify-between text-center space-y-2">
                        <span className="text-[#8ca38a] text-[10px] font-bold uppercase tracking-widest block">Ttd. Pihak Penyewa</span>
                        <div className="border hover:border-forest/50 transition-colors border-dashed border-white/10 bg-[#000000]/40 rounded-2xl h-20 w-full flex flex-col items-center justify-center p-2 relative overflow-hidden signature-box cursor-not-allowed">
                          <span className="text-stone-200 font-bold font-serif italic text-lg transform rotate-[-2deg] select-none tracking-wide z-10 block sign-font opacity-90 drop-shadow-md">
                            {user.name}
                          </span>
                          <div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-[-12deg] select-none pointer-events-none">
                            <span className="badge-stamp text-stone-500 border-stone-500 tracking-widest">CONTRACT SECURED</span>
                          </div>
                          <span className="text-[8px] text-[#8ca38a] block leading-none font-sans absolute bottom-1.5 uppercase font-bold tracking-widest">SECURE E-SIGN</span>
                        </div>
                        <span className="text-white text-[10px] block font-mono font-bold tracking-wide">{user.name}</span>
                      </div>

                      {/* Admin Sign */}
                      <div className="flex flex-col items-center justify-between text-center space-y-2">
                        <span className="text-[#8ca38a] text-[10px] font-bold uppercase tracking-widest block">Ttd. Otoritas OUTRENT</span>
                        <div className="border border-dashed border-white/10 bg-[#000000]/40 rounded-2xl h-20 w-full flex flex-col items-center justify-center p-2 relative overflow-hidden signature-box cursor-not-allowed">
                          <span className="text-forest font-bold font-serif italic text-lg transform rotate-[-4deg] select-none tracking-wider z-10 block sign-font opacity-90 drop-shadow-md">
                            Adi Wangsa Eka
                          </span>
                          <div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-[-8deg] select-none pointer-events-none">
                            <span className="badge-stamp text-forest border-forest tracking-widest">VERIFICATION AUTH</span>
                          </div>
                          <span className="text-[8px] text-[#8ca38a] block leading-none font-sans absolute bottom-1.5 uppercase font-bold tracking-widest">ADMINISTRATOR APPROVAL</span>
                        </div>
                        <span className="text-white text-[10px] block font-mono font-bold tracking-wide">Gede Adi Wangsa</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Close footer panel */}
                <div className="px-6 py-4.5 border-t border-white/10 flex justify-end shrink-0 bg-[#000000]/20">
                  <button
                    type="button"
                    onClick={() => setPrintModalBookingId(null)}
                    className="liquid-glass-button bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-6 py-3 rounded-xl text-[10px] tracking-widest border border-white/10 uppercase transition-all"
                  >
                    TUTUP PREVIEW
                  </button>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </motion.div>
  );
};
export default CustomerBookings;
