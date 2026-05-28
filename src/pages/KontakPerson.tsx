import React, { useState } from "react";
import { motion } from "motion/react";
import { LucideIcon } from "../components/LucideIcon";

const contacts = [
  {
    name: "WhatsApp Support",
    value: "+62 812-3456-7890",
    icon: "CircleHelp",
    color: "bg-forest/10 text-forest",
    action: "Chat Sekarang",
    href: "https://wa.me/6281234567890"
  },
  {
    name: "Instagram",
    value: "@outrent.official",
    icon: "Instagram",
    color: "bg-pink-500/10 text-pink-400",
    action: "Follow Us",
    href: "#"
  },
  {
    name: "Email Business",
    value: "halo@outrent.id",
    icon: "Mail",
    color: "bg-blue-500/10 text-blue-400",
    action: "Kirim Email",
    href: "mailto:halo@outrent.id"
  }
];

export const KontakPerson = ({ showToast }: { showToast?: (m: string, t?: "success" | "error" | "info") => void }) => {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !msg) {
      if (showToast) showToast("Lengkapi form terlebih dahulu", "error");
      return;
    }
    if (showToast) showToast("Pesan Anda telah dikirim! Kami akan segera merespon.", "success");
    setName("");
    setMsg("");
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="heading-caps text-3xl sm:text-4xl text-white">Hubungi Kami</h1>
        <p className="text-stone-400 max-w-xl mx-auto">
          Punya pertanyaan atau kebutuhan khusus? Tim kami siap melayani Anda di OUTRENT.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contacts.map((c, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="liquid-glass-card p-8 text-center space-y-4 group flex flex-col"
          >
            <div className={`w-14 h-14 rounded-full ${c.color} flex items-center justify-center mx-auto transition-transform group-hover:scale-110`}>
              <LucideIcon name={c.icon} size={28} />
            </div>
            <h3 className="font-bold text-white text-lg">{c.name}</h3>
            <p className="text-stone-400 text-sm flex-1">{c.value}</p>
            <a 
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="mt-auto block w-full liquid-glass-button py-3 text-[10px] font-black uppercase tracking-widest text-[#eef5ec] hover:text-white"
            >
              {c.action}
            </a>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="liquid-glass-card p-10 space-y-6">
          <h3 className="heading-caps text-xl text-white">Lokasi OUTRENT</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <LucideIcon name="MapPin" className="text-forest shrink-0" size={20} />
              <p className="text-stone-300 text-sm leading-relaxed">
                Jl. Raya Sembalun Lawang, Kec. Sembalun, Kabupaten Lombok Timur, Nusa Tenggara Bar. 83656
              </p>
            </div>
            <div className="flex items-start gap-4">
              <LucideIcon name="Clock" className="text-forest shrink-0" size={20} />
              <div className="text-sm text-stone-300 space-y-1">
                <p>Senin - Minggu: 06:00 - 22:00 WITA</p>
                <p className="text-stone-500 italic">Order online 24 jam</p>
              </div>
            </div>
          </div>
          <div className="w-full h-48 bg-stone-900/50 rounded-2xl border border-white/5 flex items-center justify-center text-stone-500 font-mono text-[10px] uppercase tracking-widest relative overflow-hidden">
             <div className="absolute inset-0 campfire-glow opacity-10" />
             Map Placeholder
          </div>
        </div>

        <div className="liquid-glass-card p-10 space-y-6">
          <h3 className="heading-caps text-xl text-white">Kirim Pesan Cepat</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input 
              type="text" 
              placeholder="Nama Lengkap" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-forest outline-none transition-all text-white"
            />
            <input 
              type="email" 
              placeholder="Alamat Email" 
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-forest outline-none transition-all text-white"
            />
            <textarea 
              placeholder="Pesan Anda..." 
              rows={4}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-forest outline-none transition-all resize-none text-white"
            />
            <button type="submit" className="w-full bg-forest hover:bg-forest/80 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(45,90,39,0.3)]">
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
