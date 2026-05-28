import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { LucideIcon } from "../components/LucideIcon";

const images = [
  { id: 1, url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop", title: "Sunrise Sembalun" },
  { id: 2, url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop", title: "Puncak Rinjani" },
  { id: 3, url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop", title: "OUTRENT Night Camp" },
  { id: 4, url: "https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=1974&auto=format&fit=crop", title: "Camping Ground" },
  { id: 5, url: "https://images.unsplash.com/photo-1533873984035-25970ab07461?q=80&w=2074&auto=format&fit=crop", title: "Gear Testing" },
  { id: 6, url: "https://images.unsplash.com/photo-1526491109672-7474bd1bdcd9?q=80&w=2070&auto=format&fit=crop", title: "Hiking Trail" }
];

export const GalleryPetualang = () => {
  const [selectedImg, setSelectedImg] = React.useState<typeof images[0] | null>(null);

  return (
    <div className="space-y-12 py-10">
      <div className="text-center space-y-4">
        <h1 className="heading-caps text-3xl sm:text-4xl text-white">Gallery Petualang</h1>
        <p className="text-stone-400 max-w-2xl mx-auto">
          Inspirasi perjalanan dan momen tak terlupakan dari para pendaki yang menggunakan perlengkapan kami.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, idx) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedImg(img)}
            className="liquid-glass-card group overflow-hidden relative aspect-video cursor-pointer"
          >
            <img 
              src={img.url} 
              alt={img.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <div className="space-y-1 tranlsate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h4 className="text-white font-bold">{img.title}</h4>
                <p className="text-[10px] text-forest font-black uppercase tracking-widest">Lihat Detail</p>
              </div>
            </div>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
              <LucideIcon name="Maximize2" size={14} />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-12"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl w-full aspect-video rounded-3xl overflow-hidden liquid-glass shadow-2xl"
            >
              <img 
                src={selectedImg.url} 
                alt={selectedImg.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-2xl font-bold text-white">{selectedImg.title}</h3>
                <p className="text-stone-400">Petualang OUTRENT</p>
              </div>
              <button 
                onClick={() => setSelectedImg(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <LucideIcon name="X" size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
