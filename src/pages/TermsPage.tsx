import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-[#F7F7F7] font-sans selection:bg-[#FF6600] selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-[120px] md:py-[160px] space-y-[64px]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 flex flex-col items-center text-center"
        >
          <span className="text-[#FF6600] text-sm font-semibold tracking-widest uppercase">Perjanjian Layanan</span>
          <h1 className="text-[48px] md:text-[64px] font-bold tracking-tight text-white leading-tight">Syarat & Ketentuan</h1>
          <p className="text-[#BDBDBD] text-[18px] font-light max-w-[600px] mt-4">
            Ketentuan operasional platform logistik Outrent. Transparansi dan kesepakatan bersama demi kelancaran ekspedisi Anda.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-[32px]"
        >
          <section className="liquid-glass-card p-[40px] rounded-[32px] space-y-6 hover:border-[#FF6600]/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6600]/10 text-[#FF6600] font-bold text-lg">1</span>
              <h2 className="text-[22px] font-semibold tracking-tight text-white m-0">Ketentuan Umum</h2>
            </div>
            <ul className="space-y-4 text-[#BDBDBD] font-light text-[15px] leading-[1.7]">
              <li className="flex gap-3">
                <span className="text-[#FF6600] mt-1">•</span> 
                <span>Penyewa harus melakukan registrasi dan memverifikasi identitas asli (KTP/SIM/Paspor) melalui platform Outrent.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#FF6600] mt-1">•</span> 
                <span>Identitas asli wajib diserahkan sebagai jaminan fisik saat pengambilan barang di gerai.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#FF6600] mt-1">•</span> 
                <span>Minimal waktu sewa adalah 1 hari (24 jam) terhitung sejak pengambilan barang.</span>
              </li>
            </ul>
          </section>

          <section className="liquid-glass-card p-[40px] rounded-[32px] space-y-6 hover:border-[#FF6600]/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6600]/10 text-[#FF6600] font-bold text-lg">2</span>
              <h2 className="text-[22px] font-semibold tracking-tight text-white m-0">Pembayaran & Batal</h2>
            </div>
            <ul className="space-y-4 text-[#BDBDBD] font-light text-[15px] leading-[1.7]">
              <li className="flex gap-3">
                <span className="text-[#FF6600] mt-1">•</span> 
                <span>Pembayaran dilakukan penuh via transfer bank, bukti wajib diunggah sebelum divalidasi.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#FF6600] mt-1">•</span> 
                <span>Pembatalan maks. H-1 akan dikembalikan dengan potongan admin 10%.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#FF6600] mt-1">•</span> 
                <span>Pembatalan pada Hari H non-refundable.</span>
              </li>
            </ul>
          </section>

          <section className="liquid-glass-card p-[40px] rounded-[32px] space-y-6 hover:border-[#FF6600]/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6600]/10 text-[#FF6600] font-bold text-lg">3</span>
              <h2 className="text-[22px] font-semibold tracking-tight text-white m-0">Denda Keterlambatan</h2>
            </div>
            <ul className="space-y-4 text-[#BDBDBD] font-light text-[15px] leading-[1.7]">
              <li className="flex gap-3">
                <span className="text-[#FF6600] mt-1">•</span> 
                <span>Setiap hari keterlambatan dikenai denda sebesar 1x tarif sewa harian per item.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#FF6600] mt-1">•</span> 
                <span>Sistem secara otomatis mendeteksi status "Overdue" dan mengakumulasi denda.</span>
              </li>
            </ul>
          </section>
          
          <section className="liquid-glass-card p-[40px] rounded-[32px] space-y-6 hover:border-[#FF6600]/30 transition-all duration-300">
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6600]/10 text-[#FF6600] font-bold text-lg">4</span>
              <h2 className="text-[22px] font-semibold tracking-tight text-white m-0">Rusak & Kehilangan</h2>
            </div>
            <ul className="space-y-4 text-[#BDBDBD] font-light text-[15px] leading-[1.7]">
              <li className="flex gap-3">
                <span className="text-[#FF6600] mt-1">•</span> 
                <span>Kerusakan kecil maupun total wajib diganti rugi sesuai taksiran teknisi kami.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#FF6600] mt-1">•</span> 
                <span>Kehilangan unit wajib diganti dengan barang baru sejenis atau uang senilai SRP.</span>
              </li>
            </ul>
          </section>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex justify-center pt-12"
        >
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-3 text-sm font-semibold bg-white/5 hover:bg-white/10 hover:text-[#FF6600] text-white px-8 py-4 rounded-full transition-all duration-300 border border-white/10 cursor-pointer shadow-lg hover:shadow-[#FF6600]/20 hover:scale-[1.02]"
          >
            <ArrowLeft size={18} /> Kembali ke Halaman Sebelumnya
          </button>
        </motion.div>
      </main>
      
      <footer className="bg-[#121212] pt-[80px] pb-[40px] px-6 mt-auto">
         <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
            <h2 className="text-[24px] font-bold tracking-tight mb-[40px]">OUTRENT.</h2>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-[60px] text-center">
               <Link to="/about" className="text-[14px] font-medium text-[#BDBDBD] hover:text-[#FF6600] transition-colors">Tentang Kami</Link>
               <Link to="/terms" className="text-[14px] font-medium text-[#BDBDBD] hover:text-[#FF6600] transition-colors">Syarat & Ketentuan</Link>
            </div>
            <div className="text-[12px] text-[#BDBDBD]/60 font-light tracking-wide uppercase text-center px-4">
               &copy; 2026 Outrent Digital Platform. Hak Cipta Dilindungi.
            </div>
         </div>
      </footer>
    </div>
  );
}
