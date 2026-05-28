import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "../components/LucideIcon";

const steps = [
  {
    title: "Pilih Perlengkapan",
    desc: "Telusuri katalog kami dan pilih peralatan yang sesuai dengan kebutuhan pendakian Anda.",
    icon: "Search"
  },
  {
    title: "Tentukan Jadwal",
    desc: "Pilih tanggal mulai dan berakhirnya sewa. Sistem akan menghitung total biaya secara otomatis.",
    icon: "Calendar"
  },
  {
    title: "Validasi & Pembayaran",
    desc: "Lakukan verifikasi identitas (KTP) dan selesaikan pembayaran melalui metode yang tersedia.",
    icon: "ShieldCheck"
  },
  {
    title: "Ambil di OUTRENT",
    desc: "Datang ke lokasi OUTRENT pada tanggal mulai untuk serah terima barang.",
    icon: "MapPin"
  },
  {
    title: "Eksplorasi Gunung",
    desc: "Nikmati petualangan Anda dengan perlengkapan berkualitas tinggi dari kami.",
    icon: "Mountain"
  },
  {
    title: "Kembalikan & Selesai",
    desc: "Kembalikan barang tepat waktu untuk pengecekan kondisi dan penyelesaian deposit.",
    icon: "RefreshCcw"
  }
];

export const CaraBooking = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-12 py-10">
      <div className="text-center space-y-4">
        <h1 className="heading-caps text-3xl sm:text-4xl text-white">Cara Booking</h1>
        <p className="text-stone-400 max-w-2xl mx-auto">
          Panduan langkah demi langkah untuk menyewa perlengkapan outdoor di OUTRENT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="liquid-glass-card p-8 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-2xl bg-forest/20 border border-forest/30 flex items-center justify-center text-forest mb-6 group-hover:bg-forest group-hover:text-white transition-all duration-500 shadow-lg">
              <LucideIcon name={step.icon} size={32} />
            </div>
            <h3 className="font-bold text-xl text-white mb-3">{step.title}</h3>
            <p className="text-stone-400 text-sm leading-relaxed">{step.desc}</p>
            <div className="mt-6 text-4xl font-black text-white/5 select-none">{idx + 1}</div>
          </motion.div>
        ))}
      </div>

      <div className="liquid-glass-card p-10 text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 campfire-glow opacity-20 pointer-events-none" />
        <h2 className="text-2xl font-bold text-white relative z-10">Masih Bingung?</h2>
        <p className="text-stone-400 relative z-10 max-w-xl mx-auto">
          Tim support kami siap membantu Anda 24/7 untuk memastikan perjalanan Anda lancar dan aman.
        </p>
        <button onClick={() => navigate('/pusat_bantuan')} className="liquid-glass-button px-8 py-4 text-xs font-black uppercase tracking-widest relative z-10">
          HUBUNGI PUSAT BANTUAN
        </button>
      </div>
    </div>
  );
};
