/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Item, Booking, ActivityLog, BookingStatus } from "../types";
import { LucideIcon } from "./LucideIcon";
import { MONTHS_DATA } from "../data";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AdminDashboardProps {
  items: Item[];
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  activities: ActivityLog[];
  addActivity: (action: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  setPage: (p: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  items,
  bookings,
  setBookings,
  activities,
  addActivity,
  showToast,
  setPage,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanTerm, setScanTerm] = useState("");
  const [scanResult, setScanResult] = useState<Booking | null>(null);

  const handleQueryScan = (code: string) => {
    const term = code.trim().toUpperCase();
    const found = bookings.find((b) => b.id.toUpperCase() === term);
    if (found) {
      setScanResult(found);
      showToast(`QR Code Terbaca! Reservasi ${found.id} An. ${found.custName}`, "success");
    } else {
      setScanResult(null);
      showToast(`ID booking "${term}" tidak ditemukan di sistem.`, "error");
    }
  };

  const updateScanStatus = (newStatus: BookingStatus) => {
    if (!scanResult) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === scanResult.id ? { ...b, status: newStatus } : b))
    );
    addActivity(`Admin memproses transaksi ${scanResult.id} menjadi status [${newStatus}] via scan QR code digital`);
    showToast(`Status [${scanResult.id}] berhasil diupdate ke: ${newStatus}`, "success");
    setScanResult(null);
    setIsScannerOpen(false);
  };

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

  // Calculations
  const totalItemsCount = items.length;
  const activeRentalsCount = bookings.filter((b) => b.status === "rented").length;
  const pendingCount = bookings.filter((b) => b.status === "pending_verification").length;
  const lateCount = bookings.filter((b) => b.status === "late").length;

  const totalRevenue = bookings
    .filter((b) => ["completed", "rented", "late"].includes(b.status))
    .reduce((sum, b) => sum + b.total, 0);

  const stats = [
    {
      label: "TOTAL BARANG",
      value: totalItemsCount,
      iconName: "Package",
      description: "Item unit terdaftar",
      color: "text-blue-400",
      borderColor: "border-neon-blue",
      onClick: () => setPage("admin_items"),
    },
    {
      label: "SEDANG DISEWA",
      value: activeRentalsCount,
      iconName: "Flame",
      description: "Dalam pemakaian customer",
      color: "text-amber-500",
      borderColor: "border-neon-gold",
      onClick: () => setPage("admin_verifications"),
    },
    {
      label: "VERIFIKASI PENDING",
      value: pendingCount,
      iconName: "Clock",
      description: "Menunggu approval (1x24 jam)",
      color: "text-red-400",
      borderColor: "border-red-500/20",
      onClick: () => setPage("admin_verifications"),
    },
    {
      label: "TELAT BALIK",
      value: lateCount,
      iconName: "AlertTriangle",
      description: "Terlambat & denda aktif",
      color: "text-[#ff5555]",
      borderColor: "border-red-900/30",
      onClick: () => setPage("admin_verifications"),
    },
  ];

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
      
      {/* Intro Header */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl liquid-glass-card flex items-center justify-center text-forest shadow-[0_0_20px_rgba(45,90,39,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-transparent opacity-50"></div>
            <LucideIcon name="LayoutDashboard" size={24} className="relative z-10" />
          </div>
          <div>
            <h1 className="heading-crisp text-3xl sm:text-4xl uppercase tracking-widest">
              Dashboard Utama
            </h1>
            <p className="text-[11px] text-[#a3b8a1] font-bold uppercase tracking-widest opacity-80">Ringkasan performa dan aliran barang sewa secara real-time.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 md:mt-0">
          <button
            onClick={() => {
              setIsScannerOpen(true);
              setScanResult(null);
              setScanTerm("");
            }}
            className="liquid-glass-button bg-forest/10 hover:bg-forest/20 text-forest border border-forest/30 font-black px-5 py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(45,90,39,0.15)] hover:shadow-[0_0_30px_rgba(45,90,39,0.3)] transition-all flex-1 sm:flex-none"
          >
            <LucideIcon name="QrCode" size={16} />
            SCAN QR OUTRENT
          </button>

          <div className="flex items-center gap-3 liquid-glass-card px-4 py-3 border-none flex-1 sm:flex-none justify-center sm:justify-start">
            <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center">
              <LucideIcon name="CalendarDays" className="text-forest" size={14} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-300">
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Operational Stats Row */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-5"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
        }}
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            onClick={stat.onClick}
            className="liquid-glass-card group cursor-pointer relative overflow-hidden rounded-[24px] w-full flex flex-col justify-between border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.3)] min-h-[160px]"
            whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <LucideIcon name={stat.iconName} size={100} />
            </div>
            <div className="p-6 flex flex-col justify-between h-full relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                 <div className={`w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:${stat.color} transition-colors ${stat.color} shadow-xl shadow-black/20 backdrop-blur-md`}>
                   <LucideIcon name={stat.iconName} size={24} strokeWidth={2.5} />
                 </div>
              </div>
              <div className="space-y-1.5">
                <h3 className={`font-black text-4xl sm:text-5xl leading-tight tracking-tight ${stat.color} drop-shadow-md`}>
                  {stat.value}
                </h3>
                <p className="text-[11px] font-black tracking-[0.2em] text-[#a3b8a1] uppercase leading-none">
                  {stat.label}
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-[10px] text-[#8ca38a] font-bold uppercase tracking-widest leading-none">
                    {stat.description}
                  </p>
                  <LucideIcon name="ChevronRight" size={12} className="text-stone-500 group-hover:text-forest transition-colors" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Laba Highlight Banner & Flow Shortcut */}
      <motion.div 
        className="relative liquid-glass-card rounded-[28px] p-6 sm:p-10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
        }}
      >
        <div className="absolute top-0 right-0 bottom-0 left-0 bg-radial-[ellipse_at_top_right] from-forest/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <span className="text-[11px] font-black text-forest tracking-[0.2em] uppercase flex items-center gap-2 drop-shadow-sm">
               <div className="w-7 h-7 rounded-lg bg-forest/20 border border-forest/30 flex items-center justify-center">
                 <LucideIcon name="TrendingUp" size={16} className="text-forest" />
               </div>
               Volume Pendapatan
            </span>
            <h2 className="text-4xl sm:text-[64px] text-white font-black leading-none tracking-tight drop-shadow-2xl">
              {rupiah(totalRevenue)}
            </h2>
            <p className="text-[14px] text-[#a3b8a1] font-medium pt-2 max-w-sm leading-relaxed">
              Akumulasi dari transaksi aktif dan selesai <span className="text-white font-black border-b border-forest/50">OUTRENT</span> tahun 2026.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <button
              onClick={() => setPage("admin_history")}
              className="liquid-glass-button bg-white/5 hover:bg-white/10 text-stone-300 font-extrabold px-8 py-5 rounded-[20px] text-[11px] uppercase tracking-widest transition-all flex-1 md:flex-none border border-white/10"
            >
              ASIP TRANSAKSI
            </button>
            <button
              onClick={() => setPage("admin_verifications")}
              className="liquid-glass-button bg-forest hover:bg-[#1e3a1a] text-white font-black px-8 py-5 rounded-[20px] text-[11px] uppercase tracking-widest transition-all flex-1 md:flex-none shadow-[0_10px_25px_rgba(45,90,39,0.3)]"
            >
              PROSES ANTREAN
            </button>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
        }}
      >
        
        {/* Recharts BarChart */}
        <div className="liquid-glass-card rounded-[24px] p-6 sm:p-8 shadow-xl border border-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-black text-[11px] text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center">
                <LucideIcon name="BarChart3" className="text-forest" size={14} />
              </div>
              Volume Transaksi Bulanan
            </h4>
            <span className="text-[9px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-[#8ca38a] font-black tracking-widest uppercase">Target 2026</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHS_DATA} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#8ca38a", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: "#8ca38a", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "rgba(10, 19, 12, 0.9)", 
                    backdropFilter: "blur(12px)",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "16px", 
                    color: "#eef5ec", 
                    fontSize: "12px",
                    fontWeight: 700,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                  }} 
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="tx" fill="#10b981" radius={[6, 6, 0, 0]} name="Order Sewa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts AreaChart with Area Gradient */}
        <div className="liquid-glass-card rounded-[24px] p-6 sm:p-8 shadow-xl border border-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-black text-[11px] text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <LucideIcon name="LineChart" className="text-amber-400" size={14} />
              </div>
              Omset Penghasilan (IDR)
            </h4>
            <span className="text-[9px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-[#8ca38a] font-black tracking-widest uppercase">Stat Laba</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHS_DATA}>
                <defs>
                  <linearGradient id="revenueGlowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#8ca38a", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: "#8ca38a", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}jt`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "rgba(10, 19, 12, 0.9)", 
                    backdropFilter: "blur(12px)",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "16px", 
                    color: "#eef5ec", 
                    fontSize: "12px",
                    fontWeight: 700,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                  }}
                  formatter={(value) => [rupiah(Number(value)), "Omset Sewa"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="rev" 
                  stroke="#f59e0b" 
                  fillOpacity={1}
                  fill="url(#revenueGlowGradient)" 
                  strokeWidth={3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </motion.div>

      {/* Grid: Recent Bookings & System Logs */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
        }}
      >

        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 liquid-glass-card rounded-[28px] p-6 sm:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-[12px] text-white uppercase tracking-[0.2em] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                <LucideIcon name="Calendar" className="text-forest" size={15} />
              </div>
              Daftar Booking Terbaru
            </h4>
            <button 
              onClick={() => setPage("admin_verifications")}
              className="text-[10px] text-forest font-extrabold uppercase tracking-widest hover:text-forest/80 transition-all flex items-center gap-1.5"
            >
              LIHAT ANTREAN <LucideIcon name="ArrowRight" size={10} />
            </button>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto no-scrollbar rounded-2xl border border-white/5">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-[#8ca38a] font-black uppercase tracking-widest bg-[#000000]/40 backdrop-blur-md">
                  <th className="py-5 px-5">ID ORDER</th>
                  <th className="py-5 px-3">PELANGGAN</th>
                  <th className="py-5 px-3">ITEM ALAT</th>
                  <th className="py-5 px-3">RENTANG SEWA</th>
                  <th className="py-5 px-3 text-right">BIAYA</th>
                  <th className="py-5 px-5 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[12px] text-stone-300">
                {bookings.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#000000]/40 transition-colors duration-300 group">
                    <td className="py-5 px-5 font-black text-forest select-all tracking-widest text-[11px]">
                      {order.id}
                    </td>
                    <td className="py-5 px-3 font-extrabold text-white tracking-wide">
                      {order.custName}
                    </td>
                    <td className="py-5 px-3 text-[#8ca38a] max-w-[150px] truncate leading-tight group-hover:text-stone-300 transition-colors font-medium">
                      {order.items}
                    </td>
                    <td className="py-5 px-3 text-[#8ca38a] font-mono text-[10px] tracking-wide">
                      {fmtDate(order.start)} <br/><span className="text-stone-600 block sm:inline">s/d</span> {fmtDate(order.end)}
                    </td>
                    <td className="py-5 px-3 text-right font-black text-amber-400 text-[14px]">
                      {rupiah(order.total)}
                    </td>
                    <td className="py-5 px-5 text-center">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border tracking-widest shadow-md transition-all ${
                        order.status === "pending_verification" ? "badge-pending" :
                        order.status === "verified" ? "badge-info border-blue-500/30" :
                        order.status === "ready_pickup" ? "badge-info border-purple-500/30 text-purple-400" :
                        order.status === "rented" ? "badge-info border-orange-500/30 text-orange-400" :
                        order.status === "completed" ? "badge-completed" :
                        order.status === "late" ? "badge-danger animate-pulse shadow-red-500/20" :
                        "badge-status border-stone-500/20 text-stone-400"
                      }`}>
                        {order.status === "pending_verification" ? "Verif" :
                         order.status === "ready_pickup" ? "Ready" :
                         order.status === "rented" ? "Sewa" :
                         order.status === "completed" ? "Selesai" :
                         order.status === "late" ? "Telat" :
                         order.status === "verified" ? "Verif" : "Canceled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* Mobile Card-Stack List */}
        <div className="sm:hidden space-y-4">
          {bookings.slice(0, 5).map((order) => (
            <div key={order.id} className="liquid-glass-card border border-white/5 p-6 rounded-[24px] space-y-4 shadow-xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center pb-4 border-b border-white/10 relative z-10">
                <span className="font-black text-forest select-all tracking-widest text-[14px]">{order.id}</span>
                <span className={`inline-block px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border tracking-widest transition-all ${
                  order.status === "pending_verification" ? "badge-pending" :
                  order.status === "verified" ? "badge-info border-blue-500/30" :
                  order.status === "ready_pickup" ? "badge-info border-purple-500/30 text-purple-400" :
                  order.status === "rented" ? "badge-info border-orange-500/30 text-orange-400" :
                  order.status === "completed" ? "badge-completed" :
                  order.status === "late" ? "badge-danger animate-pulse shadow-red-500/20" :
                  "badge-status border-stone-500/20 text-stone-400"
                }`}>
                  {order.status === "pending_verification" ? "Verif" :
                   order.status === "ready_pickup" ? "Ready" :
                   order.status === "rented" ? "Sewa" :
                   order.status === "completed" ? "Selesai" :
                   order.status === "late" ? "Telat" :
                   order.status === "verified" ? "Verif" : "Canceled"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[11px] text-stone-300 relative z-10">
                <div className="space-y-1">
                  <span className="block text-[9px] text-[#8ca38a] font-black uppercase tracking-[0.2em] mb-0.5">PELANGGAN</span>
                  <strong className="text-white text-[15px] font-black truncate block drop-shadow-sm">{order.custName}</strong>
                </div>
                <div className="text-right space-y-1">
                  <span className="block text-[9px] text-[#8ca38a] font-black uppercase tracking-[0.2em] mb-0.5">BIAYA TOTAL</span>
                  <strong className="text-amber-400 text-[15px] font-black drop-shadow-sm">{rupiah(order.total)}</strong>
                </div>
              </div>
              <div className="pt-2 relative z-10">
                <span className="block text-[9px] text-[#8ca38a] font-black uppercase tracking-[0.2em] mb-2">ITEM PESANAN</span>
                <p className="text-[#eef5ec] leading-relaxed font-bold bg-[#000000]/40 p-4 rounded-2xl border border-white/5 shadow-inner text-[12px] italic">
                  {order.items}
                </p>
              </div>
              <div className="pt-2 flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10 relative z-10 shadow-inner">
                <span className="block text-[9px] text-[#8ca38a] font-black uppercase tracking-[0.2em]">INTERVAL SEWA</span>
                <p className="text-forest font-mono text-[10px] font-bold tracking-wider">
                  {fmtDate(order.start)} <span className="text-stone-600 mx-1">-</span> {fmtDate(order.end)}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Activity Log Audit Trails */}
        <div className="liquid-glass-card rounded-[24px] p-6 sm:p-8 space-y-6 shadow-xl border border-white/5 backdrop-blur-xl">
          <h4 className="font-extrabold text-[12px] text-white uppercase tracking-[0.2em] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
              <LucideIcon name="Activity" className="text-forest" size={14} />
            </div>
            Log Aktivitas Sistem
          </h4>
          
          <div className="space-y-5 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-4 text-xs text-[#bdcfbb] border-l-[3px] border-forest/40 pl-5 py-2 hover:border-forest transition-all group"
              >
                <div className="flex-1 space-y-1.5">
                  <p className="font-extrabold text-white leading-relaxed tracking-wide group-hover:text-forest transition-colors">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#8ca38a] font-medium">
                    <span className="font-black uppercase tracking-widest text-forest bg-forest/10 px-2 py-0.5 rounded text-[9px] border border-forest/20">
                      {activity.role}
                    </span>
                    <span className="text-stone-700 font-black">•</span>
                    <span className="tracking-wide text-stone-400">{activity.user}</span>
                  </div>
                </div>
                <span className="text-[9px] text-stone-500 shrink-0 font-black whitespace-nowrap bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 shadow-inner">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Health & Predictive Maintenance Reminder */}
        <div className="liquid-glass-card rounded-[24px] p-6 sm:p-8 space-y-6 shadow-xl border border-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-[12px] text-white uppercase tracking-[0.2em] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                <LucideIcon name="ShieldAlert" className="text-forest" size={15} />
              </div>
              Stok & Maintenance
            </h4>
            <span className="text-[9px] bg-red-500/15 border border-red-500/25 text-red-400 font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.1)] mb-1">STOK KRITIS</span>
          </div>
          
          <div className="space-y-4">
            {items.filter(it => it.avail <= 2).length === 0 ? (
              <div className="text-center py-10 bg-forest/5 border border-forest/10 rounded-[22px] space-y-3">
                <div className="w-14 h-14 rounded-full bg-forest/10 border border-forest/20 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(45,90,39,0.2)]">
                  <LucideIcon name="CheckCircle" className="text-forest" size={28} />
                </div>
                <p className="text-[12px] font-extrabold text-white tracking-wide">Semua Unit Aman</p>
              </div>
            ) : (
              items.filter(it => it.avail <= 2).map((it, idx) => {
                const pct = Math.round((it.avail / it.stock) * 100);
                const isCritEmpty = it.avail === 0;
                return (
                  <div key={idx} className="bg-[#000000]/40 backdrop-blur-md border border-white/10 p-4.5 rounded-[20px] flex justify-between items-center text-xs shadow-inner group py-5">
                    <div className="space-y-1">
                      <h5 className="font-extrabold text-white tracking-wide text-[14px] drop-shadow-sm">{it.name}</h5>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${isCritEmpty ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-500"}`}>
                           {isCritEmpty ? "HABIS" : "KRITIS"}
                        </span>
                        <span className="text-[10px] text-stone-500 font-bold font-mono">
                          Ready: {it.avail}/{it.stock} Unit
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] font-black text-[#8ca38a] tracking-widest mb-1 leading-none">HEALTH</span>
                      <span className={`font-black text-[18px] leading-none drop-shadow-sm ${isCritEmpty ? "text-red-500" : "text-amber-500"}`}>{pct}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* QR Code Scanner Dialog Modal */}
      <AnimatePresence>
      {isScannerOpen && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-xl z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
          <motion.div 
            className="bg-[#0a130c]/90 border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] w-full max-w-sm overflow-hidden flex flex-col p-8 space-y-6 pb-12 sm:pb-8 relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-1 block sm:hidden relative z-10" />
            
            <div className="flex justify-between items-center border-b border-white/10 pb-5 relative z-10">
              <h4 className="heading-caps font-black text-white text-[15px] tracking-widest flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 border border-forest/20 flex items-center justify-center text-forest shadow-lg">
                  <LucideIcon name="Scan" size={16} strokeWidth={3} />
                </div>
                OUTRENT Scanner
              </h4>
              <button 
                onClick={() => {
                  setIsScannerOpen(false);
                  setScanResult(null);
                }} 
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-all hover:bg-white/10"
                aria-label="Close"
              >
                <LucideIcon name="X" size={20} />
              </button>
            </div>

            {/* SCAN CHOOSE / DROPDOWN */}
            <div className="relative z-10 space-y-4">
              <label className="text-[10px] font-black text-[#8ca38a] uppercase block tracking-widest px-1 ml-1">
                Scan atau Pilih ID Booking
              </label>
              
              <div className="relative">
                <select
                  onChange={(e) => handleQueryScan(e.target.value)}
                  className="w-full bg-[#000000]/40 border border-white/15 rounded-xl px-4 py-4 text-[14px] font-extrabold text-[#eef5ec] outline-none focus:border-forest/50 focus:bg-[#000000]/60 transition-all backdrop-blur-md appearance-none shadow-inner"
                >
                  <option value="" className="bg-[#0a130c]">SELECT ACTIVE RESERVATION</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#0a130c]">
                      [{b.id}] {b.custName}
                    </option>
                  ))}
                </select>
                <LucideIcon name="ChevronDown" className="absolute right-4 top-1/2 -translate-y-1/2 text-forest pointer-events-none" size={16} />
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="ID: BK101"
                  value={scanTerm}
                  onChange={(e) => setScanTerm(e.target.value)}
                  className="flex-1 bg-[#000000]/40 border border-white/15 rounded-xl px-5 py-3.5 text-[14px] font-black text-forest outline-none focus:border-forest/50 focus:bg-[#000000]/60 transition-all backdrop-blur-md shadow-inner placeholder:text-stone-700 uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleQueryScan(scanTerm)}
                  className="liquid-glass-button bg-forest hover:bg-[#1e3a1a] text-white font-black px-6 py-3.5 rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(45,90,39,0.3)]"
                >
                  FIND
                </button>
              </div>
            </div>

            {/* SCREEN VIEWPORT OF SIMULATED CAMERA */}
            <div className="relative h-32 bg-[#000000]/60 rounded-2xl border border-forest/30 flex flex-col items-center justify-center overflow-hidden shadow-inner backdrop-blur-md z-10 group">
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[1.5px] bg-red-500/80 animate-[pulse_1s_infinite] shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest/5 to-transparent animate-[scan_3s_linear_infinite]" />
              <LucideIcon name="Focus" className="text-forest/20 group-hover:text-forest/40 transition-colors" size={56} />
              <span className="text-[9px] font-black tracking-[0.3em] text-forest absolute bottom-4 block animate-pulse uppercase">
                [ SCANNER ACTIVE ]
              </span>
            </div>

            {/* MATCH RESULT DATA DETAIL */}
            <AnimatePresence>
              {scanResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#000000]/30 border border-white/10 p-4 rounded-2xl space-y-3 text-left text-xs text-stone-200 backdrop-blur-md shadow-xl overflow-hidden relative z-10"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-extrabold text-white text-[13px]">{scanResult.items}</span>
                    <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black tracking-wider px-2 py-1 rounded block uppercase">
                      STATUS: {scanResult.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 font-medium text-stone-400 text-[11px]">
                    <p className="flex justify-between">
                      <span className="text-stone-500">Pelanggan</span>
                      <strong className="text-white font-bold">{scanResult.custName}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-stone-500">ID Order</span>
                      <strong className="text-forest font-mono tracking-widest">{scanResult.id}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-stone-500">Rentang Sewa</span>
                      <span className="text-white">{scanResult.days} Hari ({fmtDate(scanResult.start)} - {fmtDate(scanResult.end)})</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-stone-500">KTP / Identitas</span>
                      <strong className={scanResult.idUploaded ? "text-forest" : "text-amber-500"}>
                        {scanResult.idUploaded ? "Terverifikasi" : "Belum Unggah"}
                      </strong>
                    </p>
                  </div>

                  {/* SCANNED OPERATIONS IN ACTIONS BUTTON */}
                  <div className="pt-4 flex flex-col gap-3">
                    {["pending_verification", "verified", "ready_pickup"].includes(scanResult.status) && (
                      <button
                        onClick={() => updateScanStatus("rented")}
                        className="liquid-glass-button bg-forest hover:bg-[#1e3a1a] text-white font-black py-4.5 rounded-xl text-[12px] uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(45,90,39,0.3)] flex items-center justify-center gap-2.5"
                      >
                        <LucideIcon name="Handshake" size={16} strokeWidth={2.5} /> KONFIRMASI SERAH TERIMA
                      </button>
                    )}
                    {["rented", "late"].includes(scanResult.status) && (
                      <button
                        onClick={() => updateScanStatus("completed")}
                        className="liquid-glass-button bg-blue-500 hover:bg-blue-600 text-white font-black py-4.5 rounded-xl text-[12px] uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2.5"
                      >
                        <LucideIcon name="CheckCircle" size={16} strokeWidth={2.5} /> PENGEMBALIAN SELESAI
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!scanResult && (
              <p className="text-[11px] text-center text-[#8ca38a] font-black uppercase tracking-widest relative z-10 px-4 pt-2 leading-relaxed opacity-60 italic">
                Scanning for digital qr code...
              </p>
            )}

            <div className="relative z-10 pt-4">
              <button
                onClick={() => {
                  setIsScannerOpen(false);
                  setScanResult(null);
                }}
                className="liquid-glass-button w-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white border border-white/10 py-4.5 rounded-xl text-[11px] uppercase font-black tracking-widest transition-all"
                aria-label="Tutup Panel"
              >
                DISMISS SCANNER
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

    </motion.div>
  );
};
export default AdminDashboard;
