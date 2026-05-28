import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { LucideIcon } from "../components/LucideIcon";

const faqs = [
  {
    q: "Bagaimana cara menyewa perlengkapan di OUTRENT?",
    a: "Anda cukup mendaftarkan akun, memilih perlengkapan di katalog, menentukan durasi sewa, dan melakukan pembayaran. Setelah itu, ambil barang di lokasi kami sesuai jadwal."
  },
  {
    q: "Syarat apa yang diperlukan saat pengambilan barang?",
    a: "Anda wajib membawa identitas asli (KTP/SIM/Paspor) yang masih berlaku dan sesuai dengan data akun Anda."
  },
  {
    q: "Apakah bisa kirim barang ke lokasi pendakian?",
    a: "Saat ini kami hanya melayani pengambilan langsung di stasiun OUTRENT untuk memastikan pengecekan kondisi alat dilakukan bersama."
  },
  {
    q: "Bagaimana jika barang yang saya sewa rusak atau hilang?",
    a: "Penyewa akan dikenakan denda atau biaya ganti rugi sesuai dengan tingkat kerusakan atau harga pasar barang yang hilang."
  },
  {
    q: "Adakah diskon untuk penyewaan kelompok besar?",
    a: "Tentu! Silakan hubungi tim kami via WhatsApp untuk mendapatkan penawaran spesial untuk grup di atas 10 orang."
  }
];

export const PusatBantuan = () => {
  const [openIdx, setOpenIdx] = React.useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="heading-caps text-3xl sm:text-4xl text-white">Pusat Bantuan</h1>
        <p className="text-stone-400 font-medium">Temukan jawaban cepat untuk pertanyaan umum Anda.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <div 
            key={idx}
            className="liquid-glass-card overflow-hidden transition-all duration-500"
          >
            <button 
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
            >
              <span className="font-bold text-white text-sm sm:text-base pr-4">{f.q}</span>
              <motion.div
                animate={{ rotate: openIdx === idx ? 180 : 0 }}
                className="text-forest"
              >
                <LucideIcon name="ChevronDown" size={20} />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIdx === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="px-6 pb-6 text-stone-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {f.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
        <Link to="/kontak_person" className="liquid-glass-card p-8 flex items-center gap-6 group hover:border-forest/50">
          <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest group-hover:scale-110 transition-transform">
            <LucideIcon name="MessageCircle" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">Live Chat</h4>
            <p className="text-stone-500 text-[10px]">Tersedia 08:00 - 20:00</p>
          </div>
        </Link>
        <Link to="/kontak_person" className="liquid-glass-card p-8 flex items-center gap-6 group hover:border-forest/50">
          <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest group-hover:scale-110 transition-transform">
            <LucideIcon name="Mail" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-1">Email Support</h4>
            <p className="text-stone-500 text-[10px]">Respon dalam 24 jam</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
