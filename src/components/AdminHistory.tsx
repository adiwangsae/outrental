/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Booking, ActivityLog } from "../types";
import { LucideIcon } from "./LucideIcon";
import { motion } from "motion/react";

interface AdminHistoryProps {
  bookings: Booking[];
  activities: ActivityLog[];
}

export const AdminHistory: React.FC<AdminHistoryProps> = ({
  bookings,
  activities,
}) => {
  const [historySearch, setHistorySearch] = useState("");

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

  // Aggregated Values
  const totalCompletedCount = bookings.filter((b) => b.status === "completed").length;
  
  const totalRevenue = bookings
    .filter((b) => ["completed", "rented", "late"].includes(b.status))
    .reduce((sum, b) => sum + b.total, 0);

  const totalFines = bookings
    .filter((b) => b.denda)
    .reduce((sum, b) => sum + (b.denda || 0), 0);

  const filteredHistory = bookings.filter((b) =>
    b.custName.toLowerCase().includes(historySearch.toLowerCase()) ||
    b.id.toLowerCase().includes(historySearch.toLowerCase()) ||
    b.items.toLowerCase().includes(historySearch.toLowerCase())
  );

  const matrices = [
    { label: "Jumlah Transaksi", value: bookings.length, icon: "Calendar", color: "text-blue-400" },
    { label: "Durasi Sukses Selesai", value: totalCompletedCount, icon: "CheckCircle", color: "text-forest" },
    { label: "Omset Pemasukan", value: rupiah(totalRevenue), icon: "DollarSign", color: "text-amber-500", raw: true },
    { label: "Total Denda Masuk", value: rupiah(totalFines), icon: "AlertTriangle", color: "text-[#ff5555]", raw: true },
  ];

  return (
    <motion.div 
      className="space-y-8 animate-fade-in pb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl liquid-glass-card flex items-center justify-center text-forest shadow-[0_0_20px_rgba(45,90,39,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-transparent group-hover:scale-110 transition-transform duration-500"></div>
          <LucideIcon name="History" size={24} className="relative z-10" />
        </div>
        <div className="space-y-0.5">
          <h1 className="heading-crisp text-3xl sm:text-[32px] uppercase tracking-widest leading-none">
            Histori Transaksi
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shadow-[0_0_8px_theme(colors.forest)]"></span>
            <p className="text-[11px] text-[#a3b8a1] font-black uppercase tracking-widest leading-none">Arsip & Rekapitulasi Data</p>
          </div>
        </div>
      </div>

      {/* Aggregate Overview widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {matrices.map((m, idx) => (
          <div key={idx} className="liquid-glass-card border border-white/10 rounded-[24px] p-6 text-left flex justify-between items-start backdrop-blur-md relative overflow-hidden group hover:bg-[#000000]/40 transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="space-y-2 relative z-10 w-full">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8ca38a] block drop-shadow-md">
                {m.label}
              </span>
              <h3 className={`font-black block tracking-tight ${
                m.raw ? "text-xl sm:text-[22px]" : "text-3xl"
              } ${m.color} drop-shadow-sm`}>
                {m.value}
              </h3>
            </div>
            <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-stone-400 relative z-10 shadow-md group-hover:bg-white/10 transition-colors">
              <LucideIcon name={m.icon} size={15} />
            </div>
          </div>
        ))}
      </div>

      {/* Control bar */}
      <div className="liquid-glass-card border border-white/10 p-5 rounded-[20px] flex items-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex-1 max-w-sm z-10">
          <LucideIcon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ca38a]" size={16} strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Cari ID, nama penyedia, atau alat..."
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            className="w-full bg-[#000000]/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-[13px] text-white placeholder-stone-500 outline-none focus:border-forest/50 focus:bg-[#000000]/60 transition-all shadow-inner font-medium tracking-wide"
          />
        </div>
      </div>

      {/* History table */}
      <div className="liquid-glass-card border border-white/10 rounded-[28px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto w-full no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/20 text-[10px] text-[#a3b8a1] font-black uppercase tracking-[0.2em] bg-white/[0.03] backdrop-blur-md">
                <th className="py-6 px-5 w-16 text-center">ID</th>
                <th className="py-6 px-5">Nama Pelanggan</th>
                <th className="py-6 px-5">Barang Sewa</th>
                <th className="py-6 px-5">Sewa & Durasi</th>
                <th className="py-6 px-5 text-amber-400 text-right">Denda (Rp)</th>
                <th className="py-6 px-5 text-forest text-right">Total Transaksi</th>
                <th className="py-6 px-6 text-center">Status Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[12px] text-stone-200">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#8ca38a] font-medium tracking-wide">
                    Belum ada riwayat transaksi yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#000000]/60 transition-colors duration-300">
                    <td className="py-4 px-5 font-black text-stone-500 text-center tracking-widest text-[10px]">
                      {item.id}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-white tracking-wide">
                      {item.custName}
                    </td>
                    <td className="py-4 px-5 text-stone-300 font-bold">
                      {item.items} <span className="text-forest font-black text-[10px] ml-1 bg-forest/10 px-1 py-0.5 rounded">x{item.qty}</span>
                    </td>
                    <td className="py-4 px-5 text-[#8ca38a] font-mono text-[10px] tracking-wide">
                      {fmtDate(item.start)} <span className="text-stone-600 block sm:inline">s/d</span> {fmtDate(item.end)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-red-400">
                      {item.denda ? rupiah(item.denda) : "-"}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-amber-400 text-sm">
                      {rupiah(item.total)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        item.status === "completed" ? "bg-forest/10 text-forest border-forest/20" :
                        item.status === "cancelled" ? "bg-stone-500/10 text-stone-400 border-stone-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden block p-4 space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-[#8ca38a] text-xs">
              Belum ada riwayat transaksi yang cocok dengan filter pencarian.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500/15 text-amber-400 font-mono text-[9px] font-bold flex items-center justify-center py-1 px-2 border border-amber-500/10 shadow shadow-amber-950">
                      ID
                    </span>
                    <span className="font-extrabold text-stone-400">{item.id}</span>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${
                    item.status === "completed" ? "bg-forest/10 text-forest border-forest/20" :
                    item.status === "cancelled" ? "bg-stone-500/10 text-stone-400 border-stone-500/20" :
                    "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase tracking-wider">Penyewa</span>
                    <strong className="text-white font-black text-xs">{item.custName}</strong>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase tracking-wider">Durasi</span>
                    <span className="text-stone-300 text-[10.5px] font-medium">
                      {fmtDate(item.start)} - {fmtDate(item.end)}
                    </span>
                  </div>
                </div>

                <div className="bg-white/1 border border-white/5 p-2 rounded-lg space-y-1">
                  <span className="block text-[8.5px] text-[#8ca38a] font-extrabold uppercase tracking-widest">Detail Sewa</span>
                  <div className="flex justify-between text-stone-300">
                    <span className="truncate pr-4">{item.items}</span>
                    <span className="font-black text-forest whitespace-nowrap">x{item.qty} unit</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <div>
                    {item.denda > 0 ? (
                      <span className="text-[10px] text-red-400 font-bold block">
                        Denda: {rupiah(item.denda)}
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#8ca38a] font-mono">Bebas Denda</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase">Bayar Total</span>
                    <strong className="text-amber-400 font-black text-sm">{rupiah(item.total)}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </motion.div>
  );
};
export default AdminHistory;
