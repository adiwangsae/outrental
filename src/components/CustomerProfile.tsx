/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Booking } from "../types";
import { LucideIcon } from "./LucideIcon";
import { motion } from "motion/react";

interface CustomerProfileProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  bookings: Booking[];
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  user,
  setUser,
  bookings,
  showToast,
}) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email);
  const [pass, setPass] = useState(user.pass);

  const myBookings = bookings.filter((b) => b.custId === user.id);
  const activeCount = myBookings.filter((b) => b.status === "rented").length;
  const completedCount = myBookings.filter((b) => b.status === "completed").length;
  const lateCount = myBookings.filter((b) => b.status === "late").length;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !pass) {
      showToast("Gagal: Nama, email, dan password wajib diisi!", "error");
      return;
    }

    const updatedUser: User = {
      ...user,
      name,
      phone,
      email,
      pass,
    };

    setUser(updatedUser);
    
    // Save locally
    localStorage.setItem("bc_active_user", JSON.stringify(updatedUser));
    showToast("Profil Anda berhasil diperbarui!", "success");
  };

  const statCards = [
    { label: "Total Booking", value: myBookings.length, icon: "Calendar", color: "text-blue-400" },
    { label: "Aktif Disewa", value: activeCount, icon: "Flame", color: "text-orange" },
    { label: "Selesai", value: completedCount, icon: "CheckCircle", color: "text-forest" },
    { label: "Overdue", value: lateCount, icon: "AlertTriangle", color: "text-red-400" },
  ];

  return (
    <motion.div 
      className="space-y-8 animate-fade-in max-w-2xl mx-auto pb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      
      {/* Intro block */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl liquid-glass-card flex items-center justify-center text-forest shadow-[0_0_20px_rgba(45,90,39,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-transparent group-hover:scale-110 transition-transform duration-500"></div>
          <LucideIcon name="UserCircle" size={24} className="relative z-10" />
        </div>
        <div className="space-y-0.5">
          <h1 className="heading-crisp text-3xl sm:text-[32px] uppercase tracking-widest leading-none">
            Profil Akun
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-forest shadow-[0_0_8px_theme(colors.forest)]"></span>
            <p className="text-[11px] text-[#a3b8a1] font-black uppercase tracking-widest leading-none">Identitas & Statistik Aktivitas</p>
          </div>
        </div>
      </div>

      {/* Main card with stats and avatar */}
      <div className="liquid-glass-card border border-white/5 rounded-[24px] p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-transparent pointer-events-none" />
        
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[#060c08] to-[#0a130c] text-forest font-extrabold flex items-center justify-center text-4xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/10">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left space-y-1.5 pt-1">
            <h3 className="text-[20px] font-black text-white tracking-wide">
              {user.name}
            </h3>
            <p className="text-[13px] text-[#8ca38a] font-medium">{user.email}</p>
            <span className="inline-block mt-3 px-3.5 py-1.5 rounded-lg bg-forest/10 text-forest border border-forest/20 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(45,90,39,0.1)]">
              Pelanggan Terverifikasi
            </span>
          </div>
        </div>

        {/* Dashboard microstats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 relative z-10">
          {statCards.map((st) => (
            <div key={st.label} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-500 shadow-inner group">
              <span className={`text-[26px] font-black block ${st.color} drop-shadow-lg group-hover:scale-110 transition-transform`}>
                {st.value}
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a3b8a1] block mt-2 opacity-80">
                {st.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Profile Form Edit info fields */}
      <div className="liquid-glass-card border border-white/5 rounded-[24px] p-6 sm:p-8 text-left relative overflow-hidden">
        <h4 className="font-extrabold text-[15px] text-white tracking-wide flex items-center gap-3 mb-6 relative z-10">
          <div className="w-8 h-8 rounded-full bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
             <LucideIcon name="User" size={14} />
          </div>
          Detail Akun & Kontak Lengkap
        </h4>

        <form onSubmit={handleUpdateProfile} className="space-y-5 relative z-10">
          
          <div>
            <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 focus:ring-1 focus:ring-forest/30 transition-all shadow-inner font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                Nomor Telepon / WA
              </label>
              <input
                type="text"
                placeholder="Contoh: 08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 focus:ring-1 focus:ring-forest/30 transition-all shadow-inner font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                Alamat Email Aktif
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 focus:ring-1 focus:ring-forest/30 transition-all shadow-inner font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
              Kata Sandi Autentikasi
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 focus:ring-1 focus:ring-forest/30 transition-all shadow-inner font-mono tracking-widest"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="liquid-glass-button w-full sm:w-auto px-8 bg-stone-200 hover:bg-white text-stone-900 border border-transparent font-extrabold py-3.5 rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(255,255,255,0.1)] block ml-auto"
            >
              SIMPAN PEMBARUAN DATA
            </button>
          </div>

        </form>
      </div>

    </motion.div>
  );
};
export default CustomerProfile;
