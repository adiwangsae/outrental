/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Item, ItemStatus } from "../types";
import { LucideIcon } from "./LucideIcon";

interface AdminBarangProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  addActivity: (action: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const AVAILABLE_ICONS = [
  { name: "Tent", label: "Tenda" },
  { name: "Backpack", label: "Tas Carrier" },
  { name: "Flame", label: "Api Unggun / SB" },
  { name: "Zap", label: "Kompor Listrik" },
  { name: "Sparkles", label: "Headlamp" },
  { name: "Layers", label: "Matras" },
  { name: "Compass", label: "Navigasi / Stick" },
  { name: "Coffee", label: "Nesting Masak" },
];

export const AdminBarang: React.FC<AdminBarangProps> = ({
  items,
  setItems,
  addActivity,
  showToast,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    cat: "Tenda",
    price: "",
    stock: "",
    iconName: "Tent",
    desc: "",
  });

  const rupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.stock || !newItem.desc) {
      showToast("Harap isi semua input data barang!", "error");
      return;
    }

    const priceNum = Number(newItem.price);
    const stockNum = Number(newItem.stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      showToast("Harga sewa harus lebih dari nol!", "error");
      return;
    }

    if (isNaN(stockNum) || stockNum <= 0) {
      showToast("Jumlah stok harus lebih dari nol!", "error");
      return;
    }

    const newlyCreatedItem: Item = {
      id: Date.now(),
      name: newItem.name,
      cat: newItem.cat,
      price: priceNum,
      stock: stockNum,
      avail: stockNum,
      iconName: newItem.iconName,
      status: "tersedia",
      desc: newItem.desc,
    };

    setItems((prev) => [...prev, newlyCreatedItem]);
    addActivity(`Menambahkan produk baru: ${newItem.name}`);
    showToast("Produk berhasil ditambahkan ke katalog!", "success");

    // reset
    setNewItem({
      name: "",
      cat: "Tenda",
      price: "",
      stock: "",
      iconName: "Tent",
      desc: "",
    });
    setModalOpen(false);
  };

  const handleDeleteItem = (id: number, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus barang "${name}"?`)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      addActivity(`Menghapus produk: ${name}`);
      showToast("Barang ditarik dari katalog!", "success");
    }
  };

  const handleToggleMaintenance = (id: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const nextStatus: ItemStatus = i.status === "maintenance" ? "tersedia" : "maintenance";
          const nextAvail = nextStatus === "maintenance" ? 0 : i.stock;
          showToast(`Status ${i.name} diubah ke ${nextStatus === "maintenance" ? "Maintenance" : "Tersedia"}`, "info");
          addActivity(`Mengubah status ${i.name} menjadi ${nextStatus}`);
          return { ...i, status: nextStatus, avail: nextAvail };
        }
        return i;
      })
    );
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8 px-2 sm:px-6 relative z-10"
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
      exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      
      {/* Top action block */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl liquid-glass-card flex items-center justify-center text-forest shadow-[0_0_20px_rgba(45,90,39,0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-transparent group-hover:scale-110 transition-transform duration-500"></div>
            <LucideIcon name="Package" size={24} className="relative z-10" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-[32px] font-black tracking-tight text-white drop-shadow-md">
              Inventaris Alat
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-forest shadow-[0_0_8px_theme(colors.forest)]"></span>
              <p className="text-[11px] text-[#8ca38a] font-black uppercase tracking-widest leading-none">Manajemen Gudang</p>
            </div>
          </div>
          <div className="group relative hidden sm:block ml-2">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8ca38a] hover:text-white hover:bg-white/10 transition-all cursor-pointer shadow-lg">
              <LucideIcon name="Info" size={14} />
            </div>
            <div className="absolute left-10 top-0 w-56 p-3.5 bg-[#0a130c]/95 backdrop-blur-xl border border-white/10 rounded-2xl text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 font-medium">
              Kelola stok peralatan, status izin sewa, perbaikan berkala, dan penyesuaian harga harian.
            </div>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="liquid-glass-button bg-forest hover:bg-[#1e3a1a] text-white font-black px-6 py-4 rounded-[18px] text-[11px] uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5 shadow-[0_8px_25px_rgba(45,90,39,0.3)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <LucideIcon name="Plus" size={16} strokeWidth={3} />
          REGISTRASI BARANG
        </button>
      </motion.div>

      {/* Control bar */}
      <motion.div 
        className="liquid-glass-card p-4 sm:p-5 rounded-[24px] flex items-center shadow-[0_8px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-transparent pointer-events-none" />
        <div className="relative flex-1 max-w-sm z-10">
          <LucideIcon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ca38a]" size={18} strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search items, category, or specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#000000]/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-[14px] text-white placeholder-stone-600 outline-none focus:border-forest/50 focus:bg-[#000000]/60 transition-all font-medium tracking-wide shadow-inner"
          />
        </div>
      </motion.div>

      {/* Listing Grid / Table */}
      <motion.div 
        className="liquid-glass-card rounded-[28px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl border border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        
        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/20 text-[10px] text-[#a3b8a1] font-black uppercase tracking-[0.2em] bg-white/[0.03] backdrop-blur-md">
                <th className="py-6 px-6 w-20 text-center">ICO</th>
                <th className="py-6 px-4">Nama Inventaris Alat</th>
                <th className="py-6 px-4">Kategori</th>
                <th className="py-6 px-4 text-forest">Harga / Hari</th>
                <th className="py-6 px-4 text-center">Stok</th>
                <th className="py-6 px-4 text-center">Ready</th>
                <th className="py-6 px-4 text-center">Status</th>
                <th className="py-6 px-8 text-center">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[12px] text-stone-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-[#8ca38a] text-sm font-medium tracking-wide">
                    Barang tidak ditemukan. Periksa kata kunci pencarian Anda.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#000000]/40 transition-colors duration-300 group">
                    <td className="py-5 px-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#000000]/40 border border-white/5 flex items-center justify-center text-forest shadow-inner group-hover:scale-110 transition-transform">
                        <LucideIcon name={item.iconName} size={22} />
                      </div>
                    </td>
                    <td className="py-5 px-4 font-extrabold text-white">
                      <div className="space-y-1">
                        <span className="text-[14px] tracking-wide block drop-shadow-sm">{item.name}</span>
                        <span className="block text-[10px] font-medium text-[#8ca38a] leading-relaxed max-w-[280px] line-clamp-1 italic group-hover:text-stone-300 transition-colors">
                          {item.desc}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-[#8ca38a] font-black uppercase tracking-widest text-[9px]">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">{item.cat}</span>
                    </td>
                    <td className="py-5 px-4 font-black text-orange text-[14px] drop-shadow-sm">
                      {rupiah(item.price)}
                    </td>
                    <td className="py-5 px-4 text-center font-bold text-white">
                      {item.stock}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className={`font-black text-[15px] ${item.avail > 0 ? "text-forest drop-shadow-[0_0_8px_rgba(45,90,39,0.3)]" : "text-red-500"}`}>
                        {item.avail}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border transition-all shadow-lg ${
                        item.status === "tersedia" ? "badge-completed" :
                        item.status === "dipinjam" ? "badge-info" :
                        "badge-danger"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-center">
                      <div className="inline-flex gap-3 justify-center">
                        <button
                          onClick={() => handleToggleMaintenance(item.id)}
                          className={`liquid-glass-button px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                            item.status === "maintenance"
                              ? "bg-forest/10 hover:bg-forest text-forest hover:text-white border-forest/30"
                              : "bg-orange/10 hover:bg-orange text-orange hover:text-white border-orange/30"
                          }`}
                          title="Tandai perbaikan berkala"
                        >
                          <LucideIcon name="Shield" size={13} strokeWidth={2.5} />
                          {item.status === "maintenance" ? "AKTIFKAN" : "SERVICE"}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="liquid-glass-button bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white p-2.5 rounded-xl transition-all border border-red-500/20"
                          title="Hapus permanen barang"
                        >
                          <LucideIcon name="Trash2" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Layout Support */}
        <div className="lg:hidden block p-3 sm:p-5 space-y-4">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-[#8ca38a] font-medium tracking-wide">
              Kosong. Barang tidak ditemukan.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <motion.div 
                key={item.id} 
                className="bg-[#000000]/40 border border-white/5 hover:border-white/10 transition-all p-5 rounded-[24px] space-y-4 shadow-xl backdrop-blur-md relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-transparent pointer-events-none" />
                
                {/* Header card info */}
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#000000]/40 border border-white/10 flex items-center justify-center text-forest shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <LucideIcon name={item.iconName} size={28} />
                  </div>
                  <div className="text-left flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start gap-2">
                       <span className="text-[10px] text-forest uppercase font-black tracking-widest bg-forest/10 px-2 py-0.5 rounded-md border border-forest/20">{item.cat}</span>
                       <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                        item.status === "tersedia" ? "bg-forest/10 text-forest border-forest/20 shadow-[0_0_10px_rgba(45,90,39,0.1)]" :
                        item.status === "dipinjam" ? "bg-orange/10 text-orange border-orange/20 shadow-[0_0_10px_rgba(204,85,0,0.1)]" :
                        "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                       }`}>
                        {item.status}
                       </span>
                    </div>
                    <h5 className="font-extrabold text-white text-[15px] truncate leading-tight mt-2 drop-shadow-sm tracking-wide">{item.name}</h5>
                    <p className="text-[11px] text-[#8ca38a] truncate mt-1 leading-relaxed font-medium italic">{item.desc}</p>
                  </div>
                </div>

                {/* Sub features stats */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-center bg-[#000000]/20 rounded-lg text-xs backdrop-blur-md">
                  <div>
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase tracking-wider mb-1">Harga/hr</span>
                    <strong className="text-orange text-[11px] font-black">{rupiah(item.price)}</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase tracking-wider mb-1">Stok Gudang</span>
                    <strong className="text-stone-300 text-[11px] font-black">{item.stock} Unit</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] text-[#8ca38a] font-bold uppercase tracking-wider mb-1">Sisa Ready</span>
                    <strong className={`${item.avail > 0 ? "text-forest" : "text-red-500"} text-[11px] font-black`}>
                      {item.avail} Unit
                    </strong>
                  </div>
                </div>

                {/* Actions row footer */}
                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={() => handleToggleMaintenance(item.id)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border w-full ${
                      item.status === "maintenance"
                        ? "bg-forest/10 hover:bg-forest/20 text-forest border-forest/20 shadow-[0_0_10px_rgba(45,90,39,0.1)]"
                        : "bg-orange/10 hover:bg-orange/20 text-orange border-orange/20 shadow-[0_0_10px_rgba(204,85,0,0.1)]"
                    }`}
                  >
                    <LucideIcon name="Shield" size={14} />
                    {item.status === "maintenance" ? "AKTIFKAN" : "SERVICE"}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg transition-colors flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                    title="Hapus permanen barang"
                  >
                    <LucideIcon name="Trash2" size={16} />
                  </button>
                </div>

              </motion.div>
            ))
          )}
        </div>

      </motion.div>

      {/* Modern High-End Add Item Drawer Modal */}
      <AnimatePresence>
      {modalOpen && (
        <motion.div 
          className="fixed inset-0 bg-[#000000]/60 backdrop-blur-xl z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-[#0a130c]/90 border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg overflow-hidden flex flex-col pb-8 sm:pb-0 relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            initial={{ y: "100%", scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: "100%", scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            
            {/* iOS Bottom Sheet style drag indicator */}
            <div className="w-12 h-1.5 bg-white/15 rounded-full mx-auto mb-2 mt-4 block sm:hidden relative z-10" />
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-[#000000]/20 backdrop-blur-md relative z-10">
              <h2 className="heading-caps font-black text-white text-[16px] tracking-widest flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
                  <LucideIcon name="Plus" size={16} strokeWidth={3} />
                </div>
                Registrasi Inventaris
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-all hover:bg-white/10"
                aria-label="Close"
              >
                <LucideIcon name="X" size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddItem} className="p-6 sm:p-8 space-y-6 relative z-10">
              
              <div>
                <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                  Nama Perlengkapan Outdoor
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dome Tent Eiger 4P, Tas Osprey Atmos 50L..."
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 focus:ring-1 focus:ring-forest/30 transition-all shadow-inner font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                    Kategori Alat
                  </label>
                  <select
                    value={newItem.cat}
                    onChange={(e) => setNewItem({ ...newItem, cat: e.target.value })}
                    className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 focus:ring-1 focus:ring-forest/30 transition-all shadow-inner font-medium appearance-none"
                  >
                    <option value="Tenda" className="bg-[#0a130c]">Tenda</option>
                    <option value="Tas" className="bg-[#0a130c]">Tas</option>
                    <option value="Tidur" className="bg-[#0a130c]">Tidur</option>
                    <option value="Masak" className="bg-[#0a130c]">Masak</option>
                    <option value="Aksesoris" className="bg-[#0a130c]">Aksesoris</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                    Representasi Icon
                  </label>
                  <select
                    value={newItem.iconName}
                    onChange={(e) => setNewItem({ ...newItem, iconName: e.target.value })}
                    className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 focus:ring-1 focus:ring-forest/30 transition-all shadow-inner font-medium appearance-none"
                  >
                    {AVAILABLE_ICONS.map((ico) => (
                      <option key={ico.name} value={ico.name} className="bg-[#0a130c]">
                        {ico.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                    Harga Sewa (Rp / Hari)
                  </label>
                  <input
                    type="number"
                    placeholder="75000, 35000..."
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 focus:ring-1 focus:ring-forest/30 transition-all shadow-inner font-mono text-orange"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                    Jumlah Stok Unit
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 10, 5..."
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                    className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 focus:ring-1 focus:ring-forest/30 transition-all shadow-inner font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-[#8ca38a] uppercase tracking-widest block mb-2 ml-1">
                  Deskripsi & Spesifikasi Produk
                </label>
                <textarea
                  rows={3}
                  placeholder="Lapisi info spesifikasi, material, atau kelengkapan set aksesoris..."
                  value={newItem.desc}
                  onChange={(e) => setNewItem({ ...newItem, desc: e.target.value })}
                  className="w-full bg-[#000000]/40 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[13px] text-white outline-none focus:border-forest/50 focus:bg-[#000000]/60 focus:ring-1 focus:ring-forest/30 transition-all shadow-inner font-medium resize-none"
                  required
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="liquid-glass-button flex-1 bg-white/5 hover:bg-white/10 text-stone-300 font-extrabold py-4 border border-white/10 rounded-xl text-[11px] uppercase tracking-widest transition-all"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="liquid-glass-button flex-[2] bg-forest hover:bg-[#1e3a1a] text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(45,90,39,0.3)] flex items-center justify-center gap-2"
                >
                  <LucideIcon name="CheckCircle" size={16} strokeWidth={3} />
                  SIMPAN INVENTARIS
                </button>
              </div>

            </form>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};
export default AdminBarang;
