import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-black text-white transition-colors">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-24 space-y-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-center text-white">Syarat & Ketentuan</h1>
        
        <div className="bg-[#121212] rounded-3xl p-8 md:p-12 shadow-lg space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#FF5500]">1. Ketentuan Umum</h2>
            <ul className="list-inside list-disc space-y-2 text-stone-300">
              <li>Penyewa harus melakukan registrasi dan memverifikasi identitas asli (KTP/SIM/Paspor) melalui platform Outrent.</li>
              <li>Identitas asli wajib diserahkan sebagai jaminan fisik saat pengambilan barang di gerai.</li>
              <li>Minimal waktu sewa adalah 1 hari (24 jam) terhitung sejak pengambilan barang.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#FF5500]">2. Pembayaran dan Pembatalan</h2>
            <ul className="list-inside list-disc space-y-2 text-stone-300">
              <li>Pembayaran dilakukan penuh via transfer bank, dan bukti pembayaran wajib diunggah ke sistem sebelum pengambilan barang divalidasi.</li>
              <li>Pembatalan maksimal H-1 sebelum tanggal ambil. Dana akan dikembalikan dengan potongan administrasi 10%.</li>
              <li>Pembatalan pada Hari H tidak akan mendapatkan pengembalian dana (non-refundable).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#FF5500]">3. Denda Keterlambatan</h2>
            <ul className="list-inside list-disc space-y-2 text-stone-300">
              <li>Keterlambatan pengembalian barang akan dikenai denda sebesar 1x tarif sewa harian untuk setiap harinya.</li>
              <li>Sistem akan secara otomatis mendeteksi status "Overdue" dan menghitung jumlah denda yang wajib dibayar di gerai.</li>
            </ul>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#FF5500]">4. Kerusakan dan Kehilangan</h2>
            <ul className="list-inside list-disc space-y-2 text-stone-300">
              <li>Setiap barang telah dicek oleh admin dan dipastikan berfungsi normal sebelum diserahkan.</li>
              <li>Kerusakan sebagian atau total (robek, frame patah, resleting rusak, bocor) wajib diganti rugi sesuai taksiran perbaikan, atau maksimal seharga unit baru.</li>
              <li>Kehilangan barang wajib diganti rugi secara penuh seharga eceran (retail) barang baru sesuai merk terkait. KTP tidak akan dikembalikan hingga penyelesaian selesai.</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-center pt-4">
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
