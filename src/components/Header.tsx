/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, SystemNotification, Item } from "../types";
import { LucideIcon } from "./LucideIcon";

interface HeaderProps {
  user: User | null;
  currentPage: string;
  setPage: (p: string) => void;
  notifs: SystemNotification[];
  setNotifs: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
  handleLogout: () => void;
  cart?: { item: Item; qty: number }[];
  setIsCartOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentPage,
  setPage,
  notifs,
  setNotifs,
  handleLogout,
  cart = [],
  setIsCartOpen,
}) => {
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const cartItemCount = cart.reduce((acc, c) => acc + c.qty, 0);

  const adminMenuItems = [
    { key: "admin_dashboard", label: "Dashboard", shortLabel: "Dash", icon: "Activity" },
    { key: "admin_items", label: "Gudang", shortLabel: "Stok", icon: "Package" },
    { key: "admin_verifications", label: "Order", shortLabel: "Verif", icon: "Shield" },
    { key: "admin_history", label: "Rekap", shortLabel: "Data", icon: "History" },
  ];

  const customerMenuItems = [
    { key: "customer_catalog", label: "Katalog", shortLabel: "Sewa", icon: "Tent" },
    { key: "customer_bookings", label: "Reservasi", shortLabel: "Order", icon: "Calendar" },
    { key: "customer_profile", label: "Akun", shortLabel: "Profil", icon: "User" },
  ];

  const guestMenuItems = [
    { key: "katalog_utama", label: "Katalog Utama", shortLabel: "Katalog", icon: "Compass" },
    { key: "cara_booking", label: "Cara Sewa", shortLabel: "Sewa", icon: "Calendar" },
    { key: "pusat_bantuan", label: "Bantuan", shortLabel: "Bantu", icon: "CircleHelp" },
  ];

  const menuItems = user ? (user.role === "admin" ? adminMenuItems : customerMenuItems) : guestMenuItems;


  const handleMarkAsRead = (id: number) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-4 sm:top-6 z-50 w-full max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div 
        className="apple-liquid-glass rounded-full px-5 h-14 flex items-center justify-between shadow-lg relative"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        
        {/* Branding Logo */}
        <div 
          onClick={() => setPage("landing")}
          className="flex items-center gap-3 cursor-pointer group animate-fade-in pl-2"
        >
          <div className="w-8 h-8 rounded-full bg-forest border border-white/10 flex items-center justify-center text-white transition-all duration-500 shadow-[0_0_10px_rgba(45,90,39,0.2)] group-hover:scale-105">
            <LucideIcon name="Compass" size={14} />
          </div>
          <div className="hidden sm:block">
            <span className="font-semibold text-sm text-white tracking-[0.02em] block leading-none">
              OUTRENT
            </span>
          </div>
        </div>

        {/* Desktop Central Navigation Menu */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-white/[0.04] backdrop-blur-[24px] rounded-full border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          {menuItems.map((item) => {
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-medium tracking-[0.06em] transition-all duration-450 uppercase select-none relative overflow-hidden ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-[#8ca38a] hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-forest/20 border border-forest/40 rounded-full shadow-[0_0_10px_rgba(45,90,39,0.1)]"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <LucideIcon name={item.icon} size={12} />
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Action Widgets */}
        <div className="flex items-center gap-2 pr-2">
          
          {user ? (
            <>
              {/* Checkout Button (only for customers) */}
              {user.role === "customer" && (
                <button
                  onClick={() => setIsCartOpen?.(true)}
                  className={`relative p-2 rounded-full border transition-all duration-300 ${
                    cartItemCount > 0 
                      ? "bg-forest/10 border-forest/30 text-forest hover:bg-forest/20" 
                      : "bg-white/5 border-white/5 text-[#8ca38a] hover:text-white"
                  }`}
                  title="Checkout"
                >
                  <LucideIcon name="ShoppingCart" size={16} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-forest text-white text-[8px] font-bold flex items-center justify-center border border-[#050a06]">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              )}

              {/* Notification Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifPanel(!showNotifPanel);
                    if (mobileOpen) setMobileOpen(false);
                  }}
                  className={`p-2 rounded-full border transition-all duration-300 ${
                    showNotifPanel 
                      ? "bg-orange/10 border-orange/30 text-orange" 
                      : "bg-white/5 border-white/5 text-[#8ca38a] hover:text-white hover:bg-white/10"
                  }`}
                >
                  <LucideIcon name="Bell" size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-orange text-white text-[8px] font-bold flex items-center justify-center border border-[#050a06]">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-[-10px] sm:right-0 mt-3 w-[300px] sm:w-80 bg-[#0a0f0b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex flex-col">
                          <h4 className="text-white font-bold text-sm">Notifikasi</h4>
                          <span className="text-[10px] text-forest/80 px-2 py-0.5 rounded-full bg-forest/10 border border-forest/20 w-fit mt-1">
                            {unreadCount} Baru
                          </span>
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-bold text-forest hover:text-white transition-colors bg-forest/5 hover:bg-forest/20 px-3 py-1.5 rounded-lg border border-forest/20"
                          >
                            Baca Semua
                          </button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifs.length === 0 ? (
                          <div className="p-8 text-center text-[#8ca38a] text-xs">
                            Tidak ada pemberitahuan baru
                          </div>
                        ) : (
                          notifs.map((n) => (
                            <div 
                              key={n.id}
                              onClick={() => handleMarkAsRead(n.id)}
                              className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${n.read ? 'opacity-50 hover:bg-white/5' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'warning' ? 'bg-orange/10 text-orange' : (n.type === 'success' ? 'bg-forest/10 text-forest' : 'bg-blue-500/10 text-blue-400')}`}>
                                  {n.type === 'warning' ? <LucideIcon name="AlertTriangle" size={14} /> : (n.type === 'success' ? <LucideIcon name="CheckCircle" size={14} /> : <LucideIcon name="Info" size={14} />)}
                                </div>
                                <div className="space-y-1">
                                  <h5 className="text-white text-xs font-semibold">{n.title}</h5>
                                  <p className="text-[#8ca38a] text-[10px] leading-relaxed">{n.message}</p>
                                  <span className="text-[9px] text-[#8ca38a]/70 block mt-1">Hari ini</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 text-red-500 rounded-full transition-colors"
                title="Logout"
              >
                <LucideIcon name="LogOut" size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setPage("login_screen")}
              className="text-[11px] font-bold text-forest bg-forest/10 hover:bg-forest/20 px-4 py-2 rounded-full transition-colors"
            >
              MASUK / LOG IN
            </button>
          )}

        </div>
      </motion.div>

      {/* Mobile Floating Bottom Bar Menu */}
      <div className="md:hidden fixed bottom-5 left-5 right-5 z-40 apple-liquid-glass rounded-[28px] border border-white/10 h-[66px] flex items-center justify-around px-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        <nav className="flex w-full items-center justify-around relative">
        {menuItems.map((item) => {
          const isActive = currentPage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 py-2.5"
            >
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-pill"
                  className="absolute inset-x-2.5 inset-y-1.5 bg-white/[0.08] rounded-2xl border border-white/5 shadow-inner"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <div
                className={`transition-all duration-450 relative z-10 ${
                  isActive ? "text-forest scale-110" : "text-[#8ca38a]/70 hover:text-white"
                }`}
              >
                <LucideIcon name={item.icon} size={16} />
              </div>
              <span
                className={`text-[9px] font-medium tracking-[0.06em] uppercase transition-all duration-450 relative z-10 mt-1 ${
                  isActive ? "text-white font-semibold" : "text-[#8ca38a]/50"
                }`}
              >
                {item.shortLabel}
              </span>
            </button>
          );
        })}
        </nav>
      </div>
    </header>
  );
};
export default Header;
