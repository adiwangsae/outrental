import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-[#F7F7F7] font-sans selection:bg-[#FF6600] selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-[120px] md:py-[160px] flex flex-col items-center text-center gap-[64px]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 flex flex-col items-center"
        >
          <span className="text-[#FF6600] text-sm font-semibold tracking-widest uppercase">Tentang Outrent</span>
          <h1 className="text-[48px] md:text-[72px] font-bold tracking-tight text-white m-0 leading-[1.1]">
            Solusi Logistik <br/> Eksplorasi Anda
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="space-y-8 text-[#BDBDBD] font-light text-[18px] md:text-[22px] leading-[1.8] max-w-[800px]"
        >
          <p>
            Outrent diciptakan sebagai platform orkestrasi perbekalan dan manajemen logistik gunung kelas profesional, menghubungkan pendaki dengan instrumen penjelajahan standar tinggi.
          </p>
          <p>
            Menghilangkan anomali pemesanan, kekosongan stok mendadak, hingga memastikan kelayakan instrumen sebelum diberangkatkan ke alam bebas berkat sinkronisasi data real-time kami.
          </p>
          <p>
            Berdiri sejak tahun 2026, kami mengatur setiap modul logistik melalui antarmuka premium untuk satu tujuan: keselamatan dan kenikmatan ekspedisi Anda.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="grid md:grid-cols-2 gap-[32px] mt-[48px] w-full text-left"
        >
          <div className="liquid-glass-card p-[40px] rounded-[32px] hover:shadow-2xl hover:border-[#FF6600]/30 transition-all duration-300">
            <h3 className="font-semibold text-[24px] mb-4 text-white tracking-tight">Visi Platform</h3>
            <p className="text-[#BDBDBD] font-light text-[16px] md:text-[18px] leading-[1.7]">
              Menjadi arsitektur teknologi paling andal dalam merestrukturisasi manajemen alat <i>outdoor</i> di Indonesia, memberikan kepastian logistik bagi setiap ekspedisi.
            </p>
          </div>
          <div className="liquid-glass-card p-[40px] rounded-[32px] hover:shadow-2xl hover:border-[#FF6600]/30 transition-all duration-300">
            <h3 className="font-semibold text-[24px] mb-4 text-white tracking-tight">Misi Operasional</h3>
            <p className="text-[#BDBDBD] font-light text-[16px] md:text-[18px] leading-[1.7]">
              Menjaga keterlacakan aset secara transparan, menghadirkan kemudahan transaksi instan, dan mempertahankan standar kebersihan serta keselamatan unit tanpa kompromi.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
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
