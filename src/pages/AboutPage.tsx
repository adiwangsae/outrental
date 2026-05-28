import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-black text-white transition-colors">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-24 space-y-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-center text-white">Tentang Outrent</h1>
        
        <div className="space-y-8 text-stone-300 leading-relaxed text-lg text-center">
          <p>
            Outrent adalah platform rental peralatan outdoor modern yang dirancang untuk memudahkan para pendaki dan penjelajah alam di Indonesia dalam menemukan persediaan alat dengan kualitas terbaik andal standar keamanan tinggi.
          </p>
          <p>
            Berdiri sejak tahun 2026, Outrent hadir untuk menyelesaikan masalah klasik penyewaan alat: double booking, stok yang tidak akurat, alat yang rusak tanpa pengecekan, hingga proses penyewaan manual yang memakan waktu.
          </p>
          <p>
            Sistem kami terintegrasi secara real-time mulai dari katalog hingga manajemen gudang. Kami memastikan bahwa alat yang Anda sewa selalu tersedia, terawat, dan siap menemani petualangan besar Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16 text-center animate-fade-in">
          <div className="bg-[#121212] p-8 rounded-3xl shadow-lg">
            <h3 className="font-extrabold text-xl mb-4 text-[#FF5500]">Visi</h3>
            <p className="text-stone-300">Menjadi jembatan teknologi bagi industri rental alat outdoor yang modern, aman, dan dapat diandalkan oleh seluruh petualang.</p>
          </div>
          <div className="bg-[#121212] p-8 rounded-3xl shadow-lg">
            <h3 className="font-extrabold text-xl mb-4 text-[#FF5500]">Misi</h3>
            <p className="text-stone-300">Memberikan kemudahan akses melalui digitalisasi inventaris, verifikasi identitas, dan manajemen transaksi yang transparan.</p>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold bg-[#121212] hover:bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer">
            <ArrowLeft size={16} /> Kembali
          </button>
        </div>
      </main>
      
      <footer className="bg-[#080808] py-12 text-center text-stone-400 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
          <div className="font-extrabold text-[#FF5500] tracking-tighter">OUTRENT</div>
          <p className="text-xs text-stone-500 font-semibold">&copy; 2026 Outrent Systems. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>
    </div>
  );
}
