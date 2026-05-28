/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Item, Booking, User, SystemNotification } from "../types";
import { LucideIcon } from "./LucideIcon";
import { CATS } from "../data";

interface CustomerCatalogProps {
  items: Item[];
  setItems?: React.Dispatch<React.SetStateAction<Item[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  user: User;
  addActivity: (action: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  setPage: (p: string) => void;
  cart: { item: Item; qty: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ item: Item; qty: number }[]>>;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNotifs: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
}

export const CustomerCatalog: React.FC<CustomerCatalogProps> = ({
  items,
  setItems,
  bookings,
  setBookings,
  user,
  addActivity,
  showToast,
  setPage,
  cart = [],
  setCart,
  isCartOpen,
  setIsCartOpen,
  setNotifs,
}) => {
  const [selectedBranch, setSelectedBranch] = useState("Sembalun Utama");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Semua");
  const [bookingItem, setBookingItem] = useState<Item | null>(null);
  const [step, setStep] = useState(1);
  
  // Shopping Cart & Detail Overlay States
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  // Booking Form State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [qty, setQty] = useState(1); // kept as placeholder for backward compatibility
  const [note, setNote] = useState("");
  
  // Smart Bundle Recommendation Sub-selection state
  const [includeMatras, setIncludeMatras] = useState(false);
  const [includeSleepingBag, setIncludeSleepingBag] = useState(false);
  
  // Digital Agreement sign state verified
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);

  // Load Cart & Offline Draft values automatically on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("outrent_booking_draft_2026");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.endDate) setEndDate(parsed.endDate);
        if (parsed.note) setNote(parsed.note);
      } catch (e) {
        // ignore safely
      }
    }
  }, []);

  // Save Cart & Offline Draft on changes
  useEffect(() => {
    localStorage.setItem(
      "outrent_booking_draft_2026",
      JSON.stringify({ startDate, endDate, note })
    );
  }, [startDate, endDate, note]);

  const rupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = (item: Item) => {
    if (item.avail <= 0) {
      showToast(`Gagal: Stok unit ${item.name} sedang habis disewa seluruhnya!`, "error");
      return;
    }
    const existing = cart.find((c) => c.item.id === item.id);
    if (existing) {
      if (existing.qty >= item.avail) {
        showToast(`Batas tercapai: Sisa stok tersedia untuk ${item.name} hanya ada ${item.avail} unit.`, "error");
        return;
      }
      setCart((prev) => prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      showToast(`Jumlah unit ${item.name} berhasil ditambahkan!`, "success");
    } else {
      setCart((prev) => [...prev, { item, qty: 1 }]);
      showToast(`Berhasil menambahkan ${item.name} ke panel booking!`, "success");
    }
    setIsCartOpen(true); // Automatically slide open the cart drawer!
  };

  const handleOpenBookingSingle = (item: Item) => {
    if (item.avail <= 0) {
      showToast("Gagal: Unit alat ini sedang disewa seluruhnya!", "error");
      return;
    }
    // Initialize temporary single item checkout by putting it directly into the cart and opening checkout
    setCart([{ item, qty: 1 }]);
    setBookingItem(item);
    setStep(1);
    setNote("");
    setIncludeMatras(false);
    setIncludeSleepingBag(false);
    setAcceptedAgreement(false);
    
    // Set default dates: start is H+2 as per rules "Minimal Booking H-2"
    const h2 = new Date();
    h2.setDate(h2.getDate() + 2);
    const startStr = h2.toISOString().split("T")[0];
    setStartDate(startStr);

    const h3 = new Date();
    h3.setDate(h3.getDate() + 3);
    const endStr = h3.toISOString().split("T")[0];
    setEndDate(endStr);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !startDate || !endDate) return;

    if (!acceptedAgreement) {
      showToast("Gagal: Anda wajib menyetujui Perjanjian Sewa Digital KTP Jaminan!", "error");
      return;
    }

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const nowMs = new Date().getTime();

    // Check date range
    const days = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      showToast("Rentang tanggal kembali harus minimal 1 hari sesudah tanggal mulai!", "error");
      return;
    }

    // Check H-2 Rule
    const h2LimitMs = nowMs + 2 * 24 * 60 * 60 * 1000;
    const isUrgent = startMs < h2LimitMs;

    // Check availability limit for each item in the cart
    let isStockValid = true;
    cart.forEach(({ item, qty }) => {
      if (qty > item.avail) {
        showToast(`Gagal: Jumlah pesanan ${item.name} (${qty}) melebihi stok yang tersedia (${item.avail})!`, "error");
        isStockValid = false;
      }
    });
    if (!isStockValid) return;

    // Dynamic Multi-Item Pricing Engine: Weekend rate +15%, discount duration card 10% for rent >= 3 days
    let baseComboTotal = 0;
    let itemsMergedName = "";

    cart.forEach(({ item, qty }) => {
      const baseDayRate = item.price;
      const isWeekend = new Date(startDate).getDay() === 0 || new Date(startDate).getDay() === 6;
      const dayRateMultiplied = isWeekend ? Math.round(baseDayRate * 1.15) : baseDayRate;
      
      baseComboTotal += dayRateMultiplied * qty * days;
      if (itemsMergedName) itemsMergedName += ", ";
      itemsMergedName += `${qty}x ${item.name}`;
    });

    const totalQty = cart.reduce((acc, c) => acc + c.qty, 0);

    // Smart bundle upgrades added inside checkout session
    if (includeMatras) {
      baseComboTotal += 15000 * totalQty * days;
      itemsMergedName += " + Matras Spon";
    }
    if (includeSleepingBag) {
      baseComboTotal += 35000 * totalQty * days;
      itemsMergedName += " + SB Polar";
    }

    // Long rental discount
    const rentDiscount = days >= 3 ? Math.round(baseComboTotal * 0.10) : 0;
    const calculatedTotal = baseComboTotal - rentDiscount;

    const bookingId = "BK" + String(100 + bookings.length + 1).padStart(3, "0");

    const newBooking: Booking = {
      id: bookingId,
      custId: user.id,
      custName: user.name,
      items: itemsMergedName,
      qty: totalQty,
      start: startDate,
      end: endDate,
      days,
      status: "pending_verification",
      total: calculatedTotal,
      idUploaded: false, // will let customer upload KTP/KTM inside orders screen
      created: new Date().toISOString().split("T")[0],
      note: (note ? note + " " : "") + 
            `[Cabang: ${selectedBranch}]` + 
            (isUrgent ? " (Mendesak H-1 Approval Request)" : ""),
      denda: null,
    };

    // Deduct available inventory items securely
    if (setItems) {
      setItems((prevItems) => {
        return prevItems.map((catalogItem) => {
          const cartMatch = cart.find((c) => c.item.id === catalogItem.id);
          if (cartMatch) {
            const nextAvail = Math.max(0, catalogItem.avail - cartMatch.qty);
            const nextStatus = nextAvail <= 0 ? "dipinjam" : catalogItem.status;
            return {
              ...catalogItem,
              avail: nextAvail,
              status: nextStatus,
            };
          }
          return catalogItem;
        });
      });
    }

    setBookings((prev) => [newBooking, ...prev]);
    addActivity(`${user.name} membuat reservasi booking ${bookingId} di ${selectedBranch}`);
    
    // Add system notification
    setNotifs((prev) => [
      {
        id: Date.now(),
        title: "Pesanan Baru",
        msg: `${user.name} telah membuat pesanan checkout baru (${bookingId})!`,
        time: "Baru saja",
        read: false,
        type: "info"
      },
      ...prev
    ]);

    // Clear cart and draft
    setCart([]);
    localStorage.removeItem("bc_cart_2026");
    localStorage.removeItem("outrent_booking_draft_2026");

    if (isUrgent) {
      showToast("Booking H-1 Terkirim sebagai PENGAJUAN MENDESAK! Menunggu disettujui admin.", "info");
    } else {
      showToast("Booking berhasil diajukan! Menunggu verifikasi admin.", "success");
    }

    setBookingItem(null);
    setPage("customer_bookings");
  };

  const filtered = items.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || 
                        i.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "Semua" || i.cat === selectedCat;
    return matchSearch && matchCat;
  });

  // Calendar constraints helper
  const getMinStartDate = () => {
    // Allows H-1 for urgent booking requests
    const h1 = new Date();
    h1.setDate(h1.getDate() + 1);
    return h1.toISOString().split("T")[0];
  };

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8 px-4 sm:px-0 sf-pro-font text-stone-200"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
    >
      
      {/* Search and Hero Intro Section */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl liquid-glass-card flex items-center justify-center text-forest shadow-[0_0_20px_rgba(45,90,39,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-transparent group-hover:scale-110 transition-transform duration-500"></div>
            <LucideIcon name="Tent" size={24} className="relative z-10" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[9px] bg-forest/15 border border-forest/30 text-forest font-bold px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1.5 shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-forest animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(45,90,39,0.4)]" /> {selectedBranch}
              </span>
              <div className="group relative">
                <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 cursor-help tracking-widest transition-colors hover:bg-indigo-500/25 backdrop-blur-md">
                  <LucideIcon name="ShieldCheck" size={10} />
                  Trust: 98/100
                </span>
                <div className="absolute left-0 top-6 w-56 p-3.5 bg-[#0a130c]/95 backdrop-blur-xl border border-indigo-500/30 rounded-xl text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-20 translate-y-2 group-hover:translate-y-0">
                  Skor kepercayaan pengguna {user.name} berdasarkan riwayat kedisiplinan dan keamanan alat.
                </div>
              </div>
            </div>
            <h1 className="heading-caps text-3xl sm:text-4xl uppercase tracking-widest leading-none text-white">
              Katalog Perlengkapan
            </h1>
          </div>
        </div>

        {/* Multi-Branch Selector */}
        <div className="flex items-center gap-2.5 liquid-glass-card border border-white/5 px-4 py-2.5 rounded-xl shadow-lg shrink-0 w-full md:w-auto bg-[#0a130c]/70 backdrop-blur-md">
          <LucideIcon name="MapPin" size={14} className="text-[#8ca38a] hidden sm:block" />
          <span className="text-[10px] text-[#8ca38a] font-extrabold uppercase tracking-widest">Cabang:</span>
          <select 
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              showToast(`Cabang logistik berpindah ke ${e.target.value}`, "info");
            }}
            className="bg-transparent text-stone-200 text-xs font-bold outline-none cursor-pointer focus:text-white border-l border-white/10 pl-2 text-right sm:text-left flex-1"
          >
            <option value="Sembalun Utama" className="bg-[#0a130b] text-stone-200 font-medium">Sembalun (Main Center)</option>
            <option value="OUTRENT Senaru" className="bg-[#0a130b] text-stone-200 font-medium">Senaru Hub</option>
            <option value="Sajang Pos" className="bg-[#0a130b] text-stone-200 font-medium">Sajang Pos</option>
          </select>
        </div>
      </motion.div>

      {/* Filter and Category Controls */}
      <motion.div 
        className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-[#000000]/20 backdrop-blur-sm border border-white/5 p-3 sm:p-4 rounded-2xl shadow-inner relative"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
        }}
      >
        {/* Search Input field */}
        <div className="relative w-full lg:max-w-[280px] shrink-0 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <LucideIcon name="Search" className="text-[#8ca38a] group-focus-within:text-forest transition-colors" size={15} />
          </div>
          <input
            type="text"
            placeholder="Cari tenda, carrier, sleeping bag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#000000]/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-[#8ca38a] outline-none focus:border-forest/50 focus:bg-white/5 focus:ring-1 focus:ring-forest/30 transition-all font-medium tracking-wide shadow-inner"
          />
        </div>

        {/* Categories Pills Row */}
        <div className="flex gap-2 overflow-x-auto w-full pb-2 lg:pb-0 no-scrollbar items-center">
          {CATS.map((cat) => {
            const isSel = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCat(cat);
                  addActivity(`Pelanggan menyaring kategori: ${cat}`);
                }}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border shrink-0 ${isSel ? "bg-forest border-forest/30 text-white shadow-[0_0_12px_rgba(45,90,39,0.35)]" : "bg-white/5 border-white/5 text-stone-400 hover:text-white"}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Listings Catalog Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-20 text-[#8ca38a]">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-center mb-5 shadow-inner">
              <LucideIcon name="PackageSearch" className="text-stone-500 opacity-50" size={36} />
            </div>
            <h3 className="font-bold text-stone-200 text-lg mb-1.5 tracking-wider">Katalog Kosong</h3>
            <p className="text-xs text-stone-500 font-medium max-w-sm leading-relaxed">
              Silahkan ulangi pencarian dengan kata kunci lain atau pilih kategori Semua untuk menampilkan logistik yang tersedia.
            </p>
          </div>
        ) : (
          filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              className="liquid-glass-card flex flex-col overflow-hidden relative group rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
              initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
              transition={{ delay: idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Product Header visual representation */}
              <div 
                className="h-36 flex items-center justify-center relative border-b border-white/5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[#060c08] z-0" />
                <div className="absolute inset-0 bg-gradient-to-br from-forest/10 via-transparent to-indigo-500/5 opacity-50 z-0 mix-blend-screen" />
                
                <div className="w-16 h-16 rounded-[18px] bg-[#000000]/60 backdrop-blur-md border border-white/10 text-forest flex items-center justify-center shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-500 ease-out">
                  <LucideIcon name={item.iconName} size={30} strokeWidth={1.5} />
                </div>

                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm ${
                    item.status === "tersedia" ? "bg-forest/10 text-forest border border-forest/20 backdrop-blur-md" :
                    item.status === "dipinjam" ? "bg-amber-500/10 text-amber-500 border-amber-500/20 backdrop-blur-md" :
                    "bg-red-500/10 text-red-500 border-red-500/20 backdrop-blur-md"
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded text-[9px] font-black text-stone-200 uppercase tracking-widest backdrop-blur-md">
                     {item.cat}
                  </span>
                </div>
              </div>

              {/* Informative block */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6 bg-[#0a130c]/40 backdrop-blur-md z-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#a3b8a1] uppercase block self-start">
                     OUTRENT LOGISTICS
                  </span>
                  <h4 className="font-semibold text-white text-[17px] leading-snug group-hover:text-forest transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-[14px] text-[#a3b8a1] leading-relaxed line-clamp-2 font-normal opacity-80 pt-1">
                    {item.desc}
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-end border-t border-white/10 pt-5">
                    <div>
                      <span className="text-[11px] text-[#8ca38a] font-normal tracking-wide block mb-1">Tarif Sewa</span>
                      <span className="text-xl font-semibold text-white tracking-wide">
                        {rupiah(item.price)}
                        <span className="text-[13px] text-[#a3b8a1] font-normal ml-1">/ hr</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#8ca38a] font-normal tracking-wide block mb-1">Stok Tersedia</span>
                      <span className="text-[13px] text-white font-medium bg-white/5 px-3 py-1 rounded border border-white/5 backdrop-blur-md">
                        {item.avail} <span className="opacity-40">/</span> {item.stock}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                      onClick={() => setDetailItem(item)}
                      className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-stone-200 text-[13px] font-medium py-3.5 rounded-xl transition-all text-center"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.avail <= 0}
                      className={`text-[11px] font-semibold py-3.5 rounded-xl uppercase tracking-widest transition-all text-center ${
                        item.avail > 0
                          ? "bg-stone-200 hover:bg-white text-[#0a130c] shadow-[0_2px_10px_rgba(255,255,255,0.1)]"
                          : "bg-white/5 border border-white/5 text-stone-500 cursor-not-allowed"
                      }`}
                    >
                      {item.avail > 0 ? "Booking" : "Habis"}
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          ))
        )}
      </motion.div>

      {/* Floating Glass Booking Panel Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />
            {/* Drawer container */}
            <motion.div
              className="fixed sm:top-4 sm:right-4 top-0 right-0 h-auto max-h-[85dvh] sm:max-h-[calc(100%-2rem)] w-full sm:max-w-[320px] bg-[#0a130c]/98 sm:border border-b border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col overflow-hidden rounded-b-3xl sm:rounded-3xl z-50 backdrop-blur-2xl"
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <LucideIcon name="ShoppingCart" className="text-forest" size={16} />
                  <h3 className="font-semibold text-white text-xs uppercase tracking-[0.1em]">Panel Reservasi</h3>
                  <span className="text-[10px] text-white/50 font-bold bg-white/5 px-1.5 py-0.5 rounded-full">{cart.reduce((acc, c) => acc + c.qty, 0)}</span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 px-2 text-[10px] bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-full transition-all"
                >
                  Tutup
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-stone-500">
                    <LucideIcon name="Backpack" size={48} className="opacity-30 text-stone-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[#8ca38a]">Keranjang Kosong</p>
                    <p className="text-[11px] text-stone-500 max-w-[200px]">Silakan klik tambah pada peralatan sewa di katalog.</p>
                  </div>
                ) : (
                  cart.map(({ item, qty }) => (
                    <motion.div
                      key={item.id}
                      className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-3 relative"
                      layout
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#060c08] border border-white/5 text-forest flex items-center justify-center shrink-0">
                          <LucideIcon name={item.iconName} size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-xs leading-tight">{item.name}</h4>
                          <span className="text-[8px] bg-white/5 text-stone-400 border border-white/10 px-1.5 py-0.5 rounded font-black tracking-widest uppercase inline-block mt-1">
                            {item.cat}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center bg-white/5 border border-white/5 rounded-lg overflow-hidden h-7">
                          <button
                            onClick={() => {
                              setCart((prev) => 
                                prev.map((c) => c.item.id === item.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c)
                              );
                            }}
                            className="px-2 text-stone-400 hover:text-white font-bold h-full border-r border-white/5 w-6 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="px-2.5 font-mono text-[11px] font-bold text-white leading-none">{qty}</span>
                          <button
                            onClick={() => {
                              if (qty >= item.avail) {
                                showToast(`Sisa stok tersedia hanya ${item.avail} unit!`, "error");
                                return;
                              }
                              setCart((prev) => 
                                prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c)
                              );
                            }}
                            className="px-2 text-stone-400 hover:text-white font-bold h-full border-l border-white/5 w-6 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold text-xs">{rupiah(item.price * qty)}</span>
                          <button
                            onClick={() => {
                              setCart((prev) => prev.filter((c) => c.item.id !== item.id));
                              showToast(`${item.name} dikeluarkan dari keranjang.`, "info");
                            }}
                            className="p-1 hover:text-red-400 text-stone-500 transition-colors"
                          >
                            <LucideIcon name="Trash" size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer Summary */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-white/2 space-y-4 pointer-events-auto">
                  <div className="flex justify-between text-xs tracking-widest font-black uppercase text-stone-400">
                    <span>Subtotal / Hari</span>
                    <span className="text-white text-md font-extrabold">{rupiah(cart.reduce((acc, c) => acc + c.item.price * c.qty, 0))}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setBookingItem(cart[0].item); 
                      setStep(1);
                      // Set default dates
                      const h2 = new Date();
                      h2.setDate(h2.getDate() + 2);
                      setStartDate(h2.toISOString().split("T")[0]);
                      const h3 = new Date();
                      h3.setDate(h3.getDate() + 3);
                      setEndDate(h3.toISOString().split("T")[0]);
                      setAcceptedAgreement(false);
                      setIncludeMatras(false);
                      setIncludeSleepingBag(false);
                    }}
                    className="w-full bg-forest hover:bg-[#1a3817] border border-transparent hover:border-white/20 text-white text-[11px] font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(45,90,39,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Lanjut Reservasi (Checkout)
                    <LucideIcon name="ArrowRight" size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {detailItem && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[#0a130c] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-5"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[9px] bg-forest/15 border border-forest/30 text-forest font-bold px-2.5 py-0.5 rounded uppercase tracking-widest">
                  Detail Perlengkapan
                </span>
                <button 
                  onClick={() => setDetailItem(null)}
                  className="p-1 px-2 text-xs bg-white/5 rounded border border-white/5 text-stone-400 hover:text-white"
                >
                  Tutup
                </button>
              </div>

              <div className="flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-transparent" />
                <LucideIcon name={detailItem.iconName} size={100} className="text-forest relative z-10 animate-[pulse_6s_ease-in-out_infinite]" />
              </div>

              <div className="space-y-2 text-left font-sans">
                <span className="text-[9px] font-bold text-[#8ca38a] uppercase tracking-wider block">{detailItem.cat}</span>
                <h2 className="heading-caps text-xl font-extrabold text-white leading-tight">{detailItem.name}</h2>
                <p className="text-xs text-stone-400 leading-relaxed font-semibold">{detailItem.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#000000]/30 border border-white/5 p-4 rounded-xl text-left font-sans text-xs">
                <div>
                  <span className="text-[8px] text-stone-500 font-extrabold block mb-0.5">TARIF SEWA</span>
                  <span className="font-extrabold text-amber-500 text-sm">{rupiah(detailItem.price)}<span className="text-[9.5px] font-normal text-stone-500">/hr</span></span>
                </div>
                <div>
                  <span className="text-[8px] text-stone-500 font-extrabold block mb-0.5">SISA STOK CEPAT</span>
                  <span className="font-extrabold text-white block">{detailItem.avail} / {detailItem.stock} Unit</span>
                </div>
                <div>
                  <span className="text-[8px] text-stone-500 font-extrabold block mb-0.5">KONDISI ALAT</span>
                  <span className="font-semibold text-emerald-400 block">Sangat Prima (Grade A)</span>
                </div>
                <div>
                  <span className="text-[8px] text-stone-500 font-extrabold block mb-0.5">STATUS LOGISTIK</span>
                  <span className="font-medium text-stone-300 block">Sterilisasi Siap Pakai</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const itm = detailItem;
                  setDetailItem(null);
                  handleAddToCart(itm);
                }}
                disabled={detailItem.avail <= 0}
                className={`w-full text-xs font-black py-3.5 rounded-xl uppercase tracking-widest transition-all ${
                  detailItem.avail > 0 
                    ? "bg-forest hover:bg-[#1a3817] text-white shadow-[0_4px_15px_rgba(45,90,39,0.3)]" 
                    : "bg-[#000000]/40 border border-white/5 text-stone-500 cursor-not-allowed"
                }`}
              >
                {detailItem.avail > 0 ? "Masukkan Ke Booking Cart" : "Stok Kosong"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Booking checkout modal popup */}
      <AnimatePresence>
      {bookingItem && (
        <motion.div 
          className="fixed inset-0 bg-[#020503]/80 backdrop-blur-xl z-50 flex items-center justify-center p-0 md:p-6 transition-all duration-300 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="liquid-glass-card fixed bottom-0 md:relative md:bottom-auto w-full max-w-lg h-[100dvh] md:h-[90dvh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col pb-8 sm:pb-0 rounded-none md:rounded-3xl border-t md:border border-white/10"
            initial={{ y: "100%", scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: "100%", scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            
             {/* iOS Bottom Sheet style drag indicator */}
             <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-2 mt-3 block sm:hidden" />
             
             {/* Header popup */}
             <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <h2 className="font-semibold text-white text-xs tracking-[0.08em] flex items-center gap-2">
                 <LucideIcon name="Calendar" className="text-forest" size={14} />
                 Reservasi
               </h2>
               <button
                 onClick={() => setBookingItem(null)}
                 className="p-1 px-2.5 rounded-full bg-white/5 border border-white/5 text-stone-400 hover:text-white hover:bg-white/10 transition-all text-[10px]"
                 aria-label="Close"
               >
                 Tutup
               </button>
             </div>

             {/* Progress indicator */}
             <div className="px-5 pt-4">
               <div className="flex items-center justify-between text-[9px] font-bold text-stone-400 bg-white/[0.03] border border-white/5 py-2 px-3 rounded-full shadow-inner backdrop-blur-md">
                 <div className="flex items-center gap-1.5 ">
                   <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${step >= 1 ? "bg-forest/20 text-forest" : "bg-white/5 text-stone-500"}`}>1</span>
                   <span className={`uppercase ${step >= 1 ? "text-forest" : ""}`}>Jadwal</span>
                 </div>
                 <div className="h-[1px] flex-1 bg-white/5 mx-2" />
                 <div className="flex items-center gap-1.5 ">
                   <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${step >= 2 ? "bg-forest/20 text-forest" : "bg-white/5 text-stone-500"}`}>2</span>
                   <span className={`uppercase ${step >= 2 ? "text-forest" : ""}`}>Add-On</span>
                 </div>
                 <div className="h-[1px] flex-1 bg-white/5 mx-2" />
                 <div className="flex items-center gap-1.5 ">
                   <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${step >= 3 ? "bg-forest/20 text-forest" : "bg-white/5 text-stone-500"}`}>3</span>
                   <span className={`uppercase ${step >= 3 ? "text-forest" : ""}`}>Selesai</span>
                 </div>
               </div>
             </div>

            {/* Product summary card */}
            <div className="px-6 pt-4">
              <div className="bg-[#000000]/40 border border-white/10 p-3.5 rounded-2xl flex items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3.5 text-left relative z-10 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#0a130c]/80 border border-white/10 text-forest flex items-center justify-center shadow-lg shrink-0">
                    <LucideIcon name="Package" size={20} strokeWidth={1.5} />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-[#8ca38a] uppercase font-bold block leading-none mb-1.5 tracking-widest">MULTIPLE SEWA • {selectedBranch}</span>
                    <h4 className="font-black text-white text-[12px] leading-snug tracking-wide truncate">
                      {cart.map((c) => `${c.qty}x ${c.item.name}`).join(", ") || "Rentals"}
                    </h4>
                  </div>
                </div>
                <div className="text-right relative z-10 shrink-0">
                  <span className="text-md sm:text-lg font-black text-amber-400 uppercase tracking-widest block leading-none">
                    {rupiah(cart.reduce((acc, c) => acc + c.item.price * c.qty, 0))}<span className="text-[10px] text-[#8ca38a] font-bold lowercase tracking-normal">/hr</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto no-scrollbar relative z-10 w-full">
              
              {/* STEP 1: JADWAL & JUMLAH */}
              {step === 1 && (
                <motion.div 
                  className="space-y-5 text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-1.5 ml-1">
                        Mulai Sewa
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        min={getMinStartDate()}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-[#000000]/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-forest/50 focus:bg-[#000000]/50 focus:ring-1 focus:ring-forest/30 transition-all font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-1.5 ml-1">
                        Pengembalian
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || getMinStartDate()}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-[#000000]/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-forest/50 focus:bg-[#000000]/50 focus:ring-1 focus:ring-forest/30 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-1.5 ml-1">
                        Hub Pengambilan
                      </label>
                      <div className="bg-[#000000]/20 border border-forest/20 rounded-xl px-4 py-2.5 text-xs text-forest font-bold h-10 flex items-center gap-2 backdrop-blur-md">
                        <LucideIcon name="MapPin" size={13} className="text-forest" /> {selectedBranch} (Silakan ubah di navbar katalog bila perlu)
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingItem(null)}
                      className="liquid-glass-button flex-1 bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-4 py-3 rounded-xl text-[11px] uppercase tracking-widest border border-white/10 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!startDate || !endDate) {
                          showToast("Harap tentukan tanggal sewa!", "error");
                          return;
                        }
                        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24));
                        if (days <= 0) {
                          showToast("Kembali sewa minimal 1 hari sesudah mulai sewa!", "error");
                          return;
                        }
                        setStep(2);
                      }}
                      className="liquid-glass-button flex-1 bg-forest hover:bg-[#1e3a1a] text-white font-black px-4 py-3 rounded-xl text-[11px] uppercase tracking-widest shadow-[0_0_15px_rgba(45,90,39,0.3)] flex items-center justify-center cursor-pointer"
                    >
                      Trx Berlanjut <LucideIcon name="ArrowRight" size={14} className="ml-1.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SMART RECOMMENDATIONS */}
              {step === 2 && (
                <motion.div 
                  className="space-y-4 text-left"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <span className="text-[10px] text-forest uppercase font-black tracking-widest block flex items-center gap-1.5 mb-3 px-1">
                    <LucideIcon name="Gift" size={13} strokeWidth={2.5} /> Rekomendasi Tambah Alat Hemat (Untuk Setiap Unit):
                  </span>
                  
                  <div className="space-y-3">
                    {/* Item 1 */}
                    <div
                      onClick={() => setIncludeMatras(!includeMatras)}
                      className={`border p-4 rounded-xl cursor-pointer flex items-center justify-between transition-all backdrop-blur-md relative overflow-hidden group ${includeMatras ? "bg-[#060c08] border-forest/30 text-forest shadow-[0_0_15px_rgba(45,90,39,0.15)]" : "bg-[#000000]/20 border-white/5 text-stone-300 hover:bg-[#000000]/40 hover:border-white/10"}`}
                    >
                      {includeMatras && <div className="absolute inset-0 bg-gradient-to-r from-forest/10 to-transparent opacity-50" />}
                      <div className="flex items-center gap-3.5 relative z-10">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-[9px] transition-colors ${includeMatras ? "bg-forest border-forest/30 text-white shadow-[0_0_10px_rgba(45,90,39,0.4)]" : "border-white/20 bg-[#000000]/40 group-hover:border-white/40"}`}>
                          {includeMatras && (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className={`text-[13px] font-black ${includeMatras ? "text-forest" : "text-white"}`}>Matras Cacing Ringan</p>
                          <p className="text-[10px] text-[#8ca38a] font-medium leading-relaxed">Alas thermal punggung nyaman</p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-black tracking-wide relative z-10 ${includeMatras ? "text-forest" : "text-amber-400"}`}>+{rupiah(15000)}<span className="text-[9px] font-bold lowercase text-[#8ca38a]">/h</span></span>
                    </div>

                    {/* Item 2 */}
                    <div
                      onClick={() => setIncludeSleepingBag(!includeSleepingBag)}
                      className={`border p-4 rounded-xl cursor-pointer flex items-center justify-between transition-all backdrop-blur-md relative overflow-hidden group ${includeSleepingBag ? "bg-[#060c08] border-forest/30 text-forest shadow-[0_0_15px_rgba(45,90,39,0.15)]" : "bg-[#000000]/20 border-white/5 text-stone-300 hover:bg-[#000000]/40 hover:border-white/10"}`}
                    >
                      {includeSleepingBag && <div className="absolute inset-0 bg-gradient-to-r from-forest/10 to-transparent opacity-50" />}
                      <div className="flex items-center gap-3.5 relative z-10">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-[9px] transition-colors ${includeSleepingBag ? "bg-forest border-forest/30 text-white shadow-[0_0_10px_rgba(45,90,39,0.4)]" : "border-white/20 bg-[#000000]/40 group-hover:border-white/40"}`}>
                          {includeSleepingBag && (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className={`text-[13px] font-black ${includeSleepingBag ? "text-forest" : "text-white"}`}>Sleeping Bag Polar Hangat</p>
                          <p className="text-[10px] text-[#8ca38a] font-medium leading-relaxed">Sangat penting di puncak dingin</p>
                        </div>
                      </div>
                      <span className={`text-[11px] font-black tracking-wide relative z-10 ${includeSleepingBag ? "text-forest" : "text-amber-400"}`}>+{rupiah(35000)}<span className="text-[9px] font-bold lowercase text-[#8ca38a]">/h</span></span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-1.5 ml-1">
                      Catatan atau Ukuran (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Contoh: Titip jemput subuh, request tenda warna kuning dsb..."
                      className="w-full bg-[#000000]/30 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/50 focus:ring-1 focus:ring-forest/30 transition-all font-medium resize-none shadow-inner"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="liquid-glass-button flex-1 bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-4 py-3 rounded-xl text-[11px] uppercase tracking-widest border border-white/10 transition-all"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="liquid-glass-button flex-1 bg-forest hover:bg-[#1e3a1a] text-white font-black px-4 py-3 rounded-xl text-[11px] uppercase tracking-widest shadow-[0_0_15px_rgba(45,90,39,0.3)] flex items-center justify-center cursor-pointer"
                    >
                      Lanjut Review <LucideIcon name="ArrowRight" size={14} className="ml-1.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SUMMARY & AGREEMENT */}
              {step === 3 && (
                <motion.div 
                  className="space-y-4 text-left"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                >
                  {startDate && endDate && (() => {
                    const startMs = new Date(startDate).getTime();
                    const endMs = new Date(endDate).getTime();
                    const days = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));

                    const startLimitMs = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
                    const isUrgent = startMs < startLimitMs;

                    let baseDayRateCombined = 0;
                    cart.forEach(({ item, qty }) => {
                      const baseDayRate = item.price;
                      const isWeekend = new Date(startDate).getDay() === 0 || new Date(startDate).getDay() === 6;
                      const dayRateMultiplied = isWeekend ? Math.round(baseDayRate * 1.15) : baseDayRate;
                      baseDayRateCombined += dayRateMultiplied * qty;
                    });

                    let baseComboTotal = baseDayRateCombined * days;
                    const totalQty = cart.reduce((acc, c) => acc + c.qty, 0);

                    if (includeMatras) baseComboTotal += 15000 * totalQty * days;
                    if (includeSleepingBag) baseComboTotal += 35000 * totalQty * days;

                    const rentDiscount = days >= 3 ? Math.round(baseComboTotal * 0.10) : 0;
                    const calculatedTotal = baseComboTotal - rentDiscount;

                    const isWeekendActive = new Date(startDate).getDay() === 0 || new Date(startDate).getDay() === 6;

                    return (
                      <div className="space-y-5">
                        {isUrgent && (
                          <div className="bg-[#000000]/40 backdrop-blur-md border border-amber-500/30 font-bold p-3.5 rounded-xl text-[11px] flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            <span className="flex items-center gap-2 text-amber-400 tracking-wide"><LucideIcon name="AlertTriangle" size={14} strokeWidth={2.5} /> Sewa Mendesak H-1 (Butuh Verifikasi Manual)</span>
                          </div>
                        )}

                        {/* Invoice summary cards */}
                        <div className="bg-[#000000]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                          <div className="flex justify-between items-center text-[10px] text-stone-400 font-black uppercase pb-2.5 border-b border-white/10 tracking-widest relative z-10 w-full">
                            <span>REKAP PREVIEW ({days} HARI)</span>
                            <span className="text-forest bg-forest/10 px-2 py-0.5 rounded border border-forest/20 font-mono">#BK-PREV</span>
                          </div>

                          <div className="space-y-2.5 relative z-10 w-full pt-1">
                            {cart.map(({ item, qty }) => {
                              const itemWeekendPrice = isWeekendActive ? Math.round(item.price * 1.15) : item.price;
                              return (
                                <div key={item.id} className="flex justify-between items-center text-[11px] text-stone-300">
                                  <span>{item.name} (<span className="text-forest">×{qty}</span>)</span>
                                  <span className="font-mono">{rupiah(itemWeekendPrice * qty * days)}</span>
                                </div>
                              );
                            })}

                            {(includeMatras || includeSleepingBag) && (
                              <div className="flex justify-between items-center text-[11px] font-semibold text-stone-300 border-t border-white/5 pt-1.5">
                                <span>Addons Upgrade Bundle (×{totalQty})</span>
                                <span className="font-mono">+{rupiah(((includeMatras ? 15000 : 0) + (includeSleepingBag ? 35000 : 0)) * totalQty * days)}</span>
                              </div>
                            )}

                            {isWeekendActive && (
                              <div className="flex justify-between items-center text-[9px] font-black text-amber-400 tracking-wider pt-1 uppercase w-full">
                                <span>Surcharge Sabbatical Weekend (+15%)</span>
                                <span>Aktif</span>
                              </div>
                            )}

                            {days >= 3 && (
                              <div className="flex justify-between items-center text-[9px] font-black text-forest tracking-wider uppercase w-full">
                                <span>Diskon Durasi Multi-hari (-10%)</span>
                                <span className="font-mono">-{rupiah(rentDiscount)}</span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-white/10 pt-3.5 flex justify-between items-end relative z-10 w-full mt-2">
                            <div>
                              <span className="block text-[10px] text-[#8ca38a] font-black uppercase tracking-widest mb-0.5">ESTIMASI BIAYA</span>
                              <span className="text-[9px] text-stone-500 font-bold leading-none">Wajib serah KTP saat ambil</span>
                            </div>
                            <span className="heading-caps font-black text-forest text-[22px] drop-shadow-[0_0_8px_rgba(45,90,39,0.5)]">
                              {rupiah(calculatedTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Agreement Checkboxes */}
                        <label className={`flex items-start gap-3 cursor-pointer select-none p-4 rounded-xl border transition-all backdrop-blur-md ${acceptedAgreement ? "bg-forest/5 border-forest/30 shadow-[0_0_15px_rgba(45,90,39,0.1)]" : "bg-[#0a130c]/40 border-white/5 hover:bg-[#000000]/40"}`}>
                          <input
                            type="checkbox"
                            checked={acceptedAgreement}
                            onChange={(e) => setAcceptedAgreement(e.target.checked)}
                            className="mt-0.5 rounded border-white/20 bg-[#000000] text-forest focus:ring-forest/50 shadow-inner w-4 h-4 cursor-pointer"
                            required
                          />
                          <div className="flex flex-col gap-1 -mt-0.5">
                            <span className={`text-[12px] font-extrabold leading-snug transition-colors ${acceptedAgreement ? "text-forest" : "text-white"}`}>
                              Saya menyetujui syarat & ketentuan sewa
                            </span>
                             <p className="text-[10px] leading-relaxed text-[#8ca38a] font-medium leading-relaxed">
                              Dengan ini saya bersedia menyerahkan kartu identitas (KTP/KTM asli) saat pick-up barang dan denda keterlambatan berlaku.
                            </p>
                          </div>
                        </label>

                        {/* Submit */}
                        <div className="pt-3 flex gap-3">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="liquid-glass-button bg-white/5 hover:bg-white/10 text-stone-300 font-bold px-4 py-3.5 rounded-xl text-[11px] uppercase tracking-widest shrink-0 border border-white/10 transition-all font-black"
                          >
                            Kembali
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmBooking}
                            disabled={!acceptedAgreement}
                            className={`liquid-glass-button flex-1 font-black px-4 py-3.5 rounded-xl text-[11px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              acceptedAgreement
                                ? "bg-forest hover:bg-[#1e3a1a] text-white shadow-[0_0_15px_rgba(45,90,39,0.3)]"
                                : "bg-[#000000]/40 text-stone-500 cursor-not-allowed border border-white/5"
                            }`}
                          >
                            SELESAIKAN BOOKING <LucideIcon name="Tent" size={14} />
                          </button>
                        </div>
                      </div>
                    );
                   })()}
                </motion.div>
              )}

            </div>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </motion.div>
  );
};

export default CustomerCatalog;
