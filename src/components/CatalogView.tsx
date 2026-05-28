import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Item } from "../types";
import { LucideIcon } from "../components/LucideIcon";
import { rupiah } from "../utils";

interface CatalogViewProps {
  items: Item[];
  title: string;
  subtitle: string;
  initialCategory?: string;
  setPage?: (p: string) => void;
  showToast?: (m: string, t?: "success" | "error" | "info") => void;
  user?: any;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ 
  items, 
  title, 
  subtitle, 
  initialCategory,
  setPage,
  showToast,
  user
}) => {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<Item | null>(null);

  // Group division to resolve empty lists on Peralatan Mendaki & Perlengkapan Camping pages
  const isHikingGroup = initialCategory === "Hiking";
  const isCampingGroup = initialCategory === "Camping";

  const groupItems = items.filter((i) => {
    if (isHikingGroup) {
      return ["Carrier", "Sepatu Hiking", "Jaket", "Trekking Pole"].includes(i.cat);
    }
    if (isCampingGroup) {
      return ["Tenda", "Sleeping Bag", "Cooking Set", "Nesting", "Lampu Camping", "Matras", "Hammock"].includes(i.cat);
    }
    return true; // Katalog Utama
  });

  const categories = ["Semua", ...new Set(groupItems.map((i) => i.cat))];

  const filteredItems = groupItems.filter((i) => {
    const matchesCategory = activeCategory === "Semua" || i.cat === activeCategory;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookingClick = (item: Item) => {
    if (item.avail <= 0) {
      if (showToast) {
        showToast("Maaf, stok alat ini sedang habis disewa seluruhnya!", "error");
      }
      return;
    }

    if (user && user.role === "customer") {
      if (showToast) {
        showToast("Membuka katalog utama sewa Anda...", "success");
      }
      if (setPage) {
        setPage("customer_catalog");
      }
    } else {
      if (showToast) {
        showToast("Silakan Masuk/Daftar akun pelanggan untuk melanjutkan sewa perlengkapan!", "info");
      }
      if (setPage) {
        setPage("login_screen");
      }
    }
  };

  return (
    <div className="space-y-10 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="heading-caps text-3xl text-white tracking-widest uppercase">{title}</h1>
          <p className="text-stone-400 font-medium">{subtitle}</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <LucideIcon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-forest transition-colors" />
          <input 
            type="text" 
            placeholder="Cari perlengkapan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-forest/50 focus:ring-1 focus:ring-forest/30 transition-all text-xs text-white"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
              activeCategory === cat 
                ? "bg-forest border-forest text-white shadow-[0_0_15px_rgba(45,90,39,0.3)]" 
                : "bg-white/5 border-white/5 text-stone-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={`${item.id}-${index}`}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-glass-card group overflow-hidden flex flex-col h-full rounded-2xl border border-white/5 hover:border-white/15 transition-all duration-300 relative"
          >
            <div className="relative h-48 bg-[#060c08] flex items-center justify-center overflow-hidden border-b border-white/5">
               <div className="absolute inset-0 bg-gradient-to-br from-forest/10 to-transparent pointer-events-none" />
               <motion.div 
                 whileHover={{ scale: 1.1, rotate: 3 }}
                 className="text-forest transition-transform duration-500"
               >
                 <LucideIcon name={item.iconName} size={70} strokeWidth={1} />
               </motion.div>
               
               <div className="absolute top-4 left-4">
                 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm ${
                   item.status === "tersedia" ? "bg-forest/10 text-forest border border-forest/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                 }`}>
                   {item.status}
                 </span>
               </div>

               <div className="absolute top-4 right-4 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded text-[9px] font-black text-stone-300 uppercase tracking-widest backdrop-blur-md">
                 {item.cat}
               </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col space-y-4 bg-[#0a130c]/40 backdrop-blur-md">
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-white text-md leading-tight group-hover:text-forest transition-colors">{item.name}</h3>
                <p className="text-stone-400 text-[11px] leading-relaxed line-clamp-2">{item.desc}</p>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-auto">
                <div>
                  <p className="text-[8px] text-stone-500 uppercase font-black tracking-widest mb-0.5">Sewa / Hari</p>
                  <p className="text-amber-400 font-extrabold text-sm">{rupiah(item.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-stone-500 uppercase font-black tracking-widest mb-0.5">TERSEDIA</p>
                  <p className="font-bold text-xs text-white bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                    {item.avail} <span className="opacity-40">/</span> {item.stock} Unit
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 w-full">
                <button
                  onClick={() => setSelectedDetail(item)}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-stone-300 text-[10px] font-black py-2.5 rounded-xl uppercase tracking-widest transition-all text-center"
                >
                  Detail
                </button>
                <button
                  onClick={() => handleBookingClick(item)}
                  disabled={item.avail <= 0}
                  className={`text-[10px] font-black py-2.5 rounded-xl uppercase tracking-widest transition-all text-center ${
                    item.avail > 0 
                      ? "bg-stone-200 hover:bg-white text-[#0a130c] shadow-[0_2px_10px_rgba(255,255,255,0.1)]" 
                      : "bg-white/5 border border-white/5 text-stone-500 cursor-not-allowed"
                  }`}
                >
                  {item.avail > 0 ? "Sewa" : "Habis"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto text-stone-600 shadow-inner">
            <LucideIcon name="PackageSearch" size={36} />
          </div>
          <p className="text-stone-500 font-bold uppercase tracking-widest text-[10px]">Peralatan tidak ditemukan</p>
        </div>
      )}

      {/* DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {selectedDetail && (
          <motion.div 
            className="fixed inset-0 bg-[#020503]/50 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[#0a130c] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[9px] bg-forest/15 border border-forest/30 text-forest font-bold px-2.5 py-0.5 rounded uppercase tracking-widest">
                  Detail Perlengkapan
                </span>
                <button 
                  onClick={() => setSelectedDetail(null)}
                  className="p-1 px-2 text-xs bg-white/5 rounded border border-white/5 text-stone-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col items-center justify-center bg-[#060c08] border border-white/5 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-forest/5 to-transparent" />
                <LucideIcon name={selectedDetail.iconName} size={100} className="text-forest relative z-10" />
              </div>

              <div className="space-y-2 text-left">
                <span className="text-[9px] font-bold text-[#8ca38a] uppercase tracking-wider block">{selectedDetail.cat}</span>
                <h2 className="heading-caps text-xl font-extrabold text-white leading-tight">{selectedDetail.name}</h2>
                <p className="text-xs text-stone-400 leading-relaxed font-medium">{selectedDetail.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#000000]/30 border border-white/5 p-4 rounded-xl text-left font-sans text-xs">
                <div>
                  <span className="text-[8px] text-stone-500 font-black uppercase tracking-wider block mb-0.5">TARIF HARIAN</span>
                  <span className="font-bold text-amber-400 text-sm">{rupiah(selectedDetail.price)}</span>
                </div>
                <div>
                  <span className="text-[8px] text-stone-500 font-black uppercase tracking-wider block mb-0.5">SISA STOK CEPAT</span>
                  <span className="font-bold text-white block">{selectedDetail.avail} / {selectedDetail.stock} Unit</span>
                </div>
                <div>
                  <span className="text-[8px] text-stone-500 font-black uppercase tracking-wider block mb-0.5">KONDISI BARANG</span>
                  <span className="font-semibold text-emerald-400 block">Sangat Prima (Grade A)</span>
                </div>
                <div>
                  <span className="text-[8px] text-stone-500 font-black uppercase tracking-wider block mb-0.5">STATUS LOGISTIK</span>
                  <span className="font-medium text-stone-300 block">Normal & Terkalibrasi</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const itm = selectedDetail;
                  setSelectedDetail(null);
                  handleBookingClick(itm);
                }}
                disabled={selectedDetail.avail <= 0}
                className={`w-full text-xs font-black py-3.5 rounded-xl uppercase tracking-widest transition-all ${
                  selectedDetail.avail > 0 
                    ? "bg-forest hover:bg-[#1a3817] text-white shadow-[0_4px_15px_rgba(45,90,39,0.3)]" 
                    : "bg-[#000000]/40 border border-white/5 text-stone-500 cursor-not-allowed"
                }`}
              >
                {selectedDetail.avail > 0 ? "RESERVASI SEKAT KANAN" : "LOGISTIK CEPAT HABIS"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
