import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useStore } from "../store";
import { Package, ShieldCheck, Zap, ArrowRight, Server, User, Compass, Tent, Clock, Wallet, MapPin, ChevronDown, Backpack, Flame, Flashlight } from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";

export default function LandingPage() {
  const { user, setAuth } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDemoLogin = async (role: 'admin' | 'customer') => {
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setAuth(data.user, data.token);
      toast.success(`Berhasil masuk sebagai Demo ${role === 'admin' ? 'Admin' : 'Pelanggan'}`);
      
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk Demo Mode");
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white transition-colors">
      <header className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="font-extrabold text-xl tracking-tighter text-white select-none cursor-pointer hover:opacity-95 active:scale-95 transition-all flex items-center"
          >
            OUTRENT<span className="text-[#FF5500]">.</span>
          </button>
          <nav className="hidden md:flex gap-8 items-center">
            <button onClick={() => scrollToSection('tentang')} className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-[#FF5500] transition-colors cursor-pointer">Tentang</button>
            <button onClick={() => scrollToSection('katalog')} className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-[#FF5500] transition-colors cursor-pointer">Katalog</button>
            <button onClick={() => scrollToSection('cara-rental')} className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-[#FF5500] transition-colors cursor-pointer">Cara Rental</button>
            <button onClick={() => scrollToSection('faq')} className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-[#FF5500] transition-colors cursor-pointer">FAQ</button>
          </nav>
          <div className="hidden md:flex gap-4 items-center">
            {user ? (
              <button 
                onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard')}
                className="text-xs font-bold uppercase tracking-wider bg-[#FF5500] hover:bg-[#FF3300] text-white px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                Ke Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-[#FF5500] transition-colors px-2">Masuk</Link>
                <Link to="/register" className="text-xs font-bold uppercase tracking-wider bg-[#FF5500] text-white px-5 py-2.5 rounded-xl hover:bg-[#FF3300] transition-all shadow-sm active:scale-95">Daftar</Link>
              </>
            )}
          </div>
          <button 
            className="md:hidden p-2 text-stone-600 dark:text-stone-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? 'Tutup' : 'Menu'}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-[#faf9f6] dark:bg-[#0d110e] p-4 flex flex-col gap-4 shadow-lg">
            <button onClick={() => scrollToSection('tentang')} className="text-sm font-bold text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">Tentang</button>
            <button onClick={() => scrollToSection('katalog')} className="text-sm font-bold text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">Katalog</button>
            <button onClick={() => scrollToSection('cara-rental')} className="text-sm font-bold text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">Cara Rental</button>
            <button onClick={() => scrollToSection('faq')} className="text-sm font-bold text-left px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg">FAQ</button>
            <div className="h-px bg-stone-200 dark:bg-stone-800 my-2"></div>
            {user ? (
              <button 
                onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard')}
                className="w-full text-sm font-bold bg-[#FF5500] hover:bg-[#FF3300] text-white px-4 py-3 rounded-xl"
              >
                Ke Dashboard
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" className="text-center text-sm font-bold bg-stone-900 text-white px-4 py-3 rounded-xl">Masuk</Link>
                <Link to="/register" className="text-center text-sm font-bold bg-[#FF5500] text-white px-4 py-3 rounded-xl">Daftar</Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto pt-20 animate-fade-in font-sans">
        
        {/* Hero Section */}
        <section className="px-6 pt-24 pb-20 text-center mx-auto max-w-4xl flex flex-col items-center justify-center min-h-[60vh]">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-8 text-white leading-[1.25]"
          >
            Petualangan Hebat <br className="hidden md:block"/>
            Mulai dari <span className="bg-gradient-to-r from-white via-[#FF5500] to-[#FF3300] bg-clip-text text-transparent inline-block">Sini.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-md text-stone-400 mb-12 max-w-3xl mx-auto leading-relaxed font-normal"
          >
            Sistem rental perlengkapan outdoor modern yang membantu pengelolaan penyewaan, inventaris, booking, dan operasional usaha menjadi lebih praktis, rapi, dan profesional dalam satu platform terpadu.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md mx-auto"
          >
            {user ? (
               <Link to={user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'} className="flex-1 text-center bg-[#FF5500] hover:bg-[#FF3300] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all active:scale-95">
                 Buka Dashboard
               </Link>
            ) : (
               <>
                 <Link to="/register" className="flex-1 text-center bg-[#FF5500] hover:bg-[#FF3300] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all active:scale-95">
                   Mulai Sekarang
                 </Link>
                 <button onClick={() => scrollToSection('demo')} className="flex-1 text-center bg-[#121212] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-stone-900 transition-all active:scale-95 cursor-pointer">
                   Coba Demo
                 </button>
               </>
            )}
          </motion.div>
        </section>

        {/* Coba Akun Demo Section */}
        <section id="demo" className="px-6 py-16">
          <div className="max-w-4xl mx-auto bg-[#121212] rounded-[2rem] p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4 tracking-tight">Eksplorasi Akses Outlet</h2>
            <p className="text-sm text-stone-400 mb-10 max-w-xl mx-auto">
              Cobalah simulator workflow kami tanpa perlu registrasi. Lihat aplikasi dari kacamata penyewa maupun panel operasional pemilik usaha.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleDemoLogin('admin')}
                className="flex items-center gap-5 p-6 rounded-2xl bg-black hover:bg-[#1a1a1a] transition-all text-left group active:scale-95 cursor-pointer"
              >
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center">
                  <Server size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1 group-hover:text-[#FF5500] transition-colors">Demo Admin</h3>
                  <p className="text-xs text-stone-400">Akses penuh panel kontrol toko</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-stone-400 group-hover:text-[#FF5500] transition-colors" />
              </button>

              <button
                onClick={() => handleDemoLogin('customer')}
                className="flex items-center gap-5 p-6 rounded-2xl bg-black hover:bg-[#1a1a1a] transition-all text-left group active:scale-95 cursor-pointer"
              >
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#FF5500]/10 text-[#FF5500] flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1 group-hover:text-[#FF5500] transition-colors">Demo Pelanggan</h3>
                  <p className="text-xs text-stone-400">Simulasikan booking perlengkapan</p>
                </div>
                <ArrowRight size={20} className="ml-auto text-stone-400 group-hover:text-[#FF5500] transition-colors" />
              </button>
            </div>
          </div>
        </section>

        {/* Tentang & Fitur Section */}
        <section id="tentang" className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Mengapa Outrent?</h2>
              <p className="text-stone-400 max-w-2xl mx-auto text-sm leading-relaxed">Sistem end-to-end yang menjamin reliabilitas dan kemudahan administrasi baik untuk pemilik rental maupun para pendaki gunung.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#121212] p-8 rounded-3xl text-center">
                <div className="w-16 h-16 mx-auto bg-[#FF5500]/10 text-[#FF5500] rounded-2xl flex items-center justify-center mb-6">
                  <Package size={28} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">Live Inventory</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Stok sinkron secara real-time. Tidak ada lagi over-booking karna stok selalu akurat hingga ke nomor unit fisik.
                </p>
              </div>
              <div className="bg-[#121212] p-8 rounded-3xl text-center">
                <div className="w-16 h-16 mx-auto bg-[#FF5500]/10 text-[#FF5500] rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">Aman Terverifikasi</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Fitur upload identitas opsional, dikombinasikan dengan verifikasi manual Admin sebelum barang dirilis ke tangan penyewa.
                </p>
              </div>
              <div className="bg-[#121212] p-8 rounded-3xl text-center">
                <div className="w-16 h-16 mx-auto bg-[#FF5500]/10 text-[#FF5500] rounded-2xl flex items-center justify-center mb-6">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">Alur Jelas</h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Status penyewaan (pending, dibayar, siap ambil, aktif, selesai) dikelola secara ketat via dashboard admin dan customer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Katalog Section */}
        <section id="katalog" className="px-6 py-24 bg-black rounded-[3rem] mx-4 my-12">
          <div className="max-w-6xl mx-auto text-center">
             <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6 text-white">Alat Siap Tempur</h2>
             <p className="text-stone-400 max-w-2xl mx-auto mb-16 text-sm leading-relaxed">Kami menyewakan barang berkualitas premium brand outdoor ternama. Kategori andalan kami meliputi:</p>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-[#121212] p-6 rounded-3xl flex flex-col items-center gap-4 group transition-colors">
                  <div className="text-stone-400 group-hover:text-[#FF5500] transition-colors"><Tent size={48} strokeWidth={1.5} /></div>
                  <span className="font-bold text-white">Tenda</span>
                </div>
                <div className="bg-[#121212] p-6 rounded-3xl flex flex-col items-center gap-4 group transition-colors">
                  <div className="text-stone-400 group-hover:text-[#FF5500] transition-colors"><Backpack size={48} strokeWidth={1.5} /></div>
                  <span className="font-bold text-white">Tas &amp; Carrier</span>
                </div>
                <div className="bg-[#121212] p-6 rounded-3xl flex flex-col items-center gap-4 group transition-colors">
                  <div className="text-stone-400 group-hover:text-[#FF5500] transition-colors"><Flame size={48} strokeWidth={1.5} /></div>
                  <span className="font-bold text-white">Alat Masak</span>
                </div>
                <div className="bg-[#121212] p-6 rounded-3xl flex flex-col items-center gap-4 group transition-colors">
                  <div className="text-stone-400 group-hover:text-[#FF5500] transition-colors"><Flashlight size={48} strokeWidth={1.5} /></div>
                  <span className="font-bold text-white">Penerangan</span>
                </div>
             </div>
             <div className="mt-12">
               <button onClick={() => handleDemoLogin('customer')} className="inline-flex items-center gap-2 text-sm font-bold bg-[#FF5500] hover:bg-[#FF3300] text-white px-6 py-3 rounded-xl transition-all active:scale-95 cursor-pointer">Lihat Katalog Lengkap <ArrowRight size={16}/></button>
             </div>
          </div>
        </section>

        {/* Cara Rental */}
        <section id="cara-rental" className="px-6 py-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-16 text-center text-white">Bagaimana Alur Penyewaan?</h2>
            
            <div className="relative">
              {/* Line connector */}
              <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-1 bg-neutral-800 transform -translate-x-1/2"></div>
              
              <div className="space-y-12">
                {[
                  { step: 1, title: 'Registrasi & Verifikasi Identitas', desc: 'Daftar akun lalu unggah file identitas resmi (KTP/SIM/Paspor). Verifikasi disetujui secara aman oleh admin jaminan.', icon: <User size={24}/> },
                  { step: 2, title: 'Eksplorasi Katalog & Booking', desc: 'Pilih perlengkapan gunung mumpuni, tentukan rentang tanggal perjalanan Anda secara real-time, lalu selesaikan pemesanan.', icon: <Tent size={24}/> },
                  { step: 3, title: 'Pembayaran & Upload Dokumen', desc: 'Lakukan pembayaran tagihan via transfer bank/QRIS tertera dan unggah salinan tanda bukti transaksi.', icon: <Wallet size={24}/> },
                  { step: 4, title: 'Pengambilan di Basecamp', desc: 'Saat tanggal mulai sewa, datangi outlet basecamp kami untuk serah terima perlengkapan dalam kondisi komplit siap daki.', icon: <MapPin size={24}/> },
                  { step: 5, title: 'Pengembalian & Pengecekan', desc: 'Bawa kembali alat setelah pendakian. Admin akan melakukan inspeksi fisik unit untuk validasi kelayakan.', icon: <Clock size={24}/> },
                ].map((item, idx) => (
                  <div key={item.step} className={`relative flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="flex-1 w-full flex justify-center md:justify-start animate-fade-in">
                       <div className={`bg-[#121212] p-8 rounded-3xl w-full max-w-sm ${idx % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}>
                         <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                         <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                    
                    <div className="absolute left-[50%] transform -translate-x-1/2 hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-[#FF5500] text-white font-extrabold text-xl shadow-lg z-10 border-4 border-black">
                      {item.step}
                    </div>
                    
                    <div className="flex-1 hidden md:flex justify-center text-stone-600">
                      {item.icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="px-6 py-24 mb-12">
          <div className="max-w-3xl mx-auto">
             <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-12 text-center text-neutral-900 dark:text-white">Pertanyaan Umum</h2>
             <div className="space-y-4">
                {[
                  { q: 'Apakah wajib meninggalkan KTP fisik?', a: 'Ya, Anda diwajibkan untuk menitipkan kartu identitas resmi Anda pada saat penjemputan alat secara fisik di basecamp, demi keamanan penjaminan bersama.' },
                  { q: 'Bagaimana jika saya terlambat mengembalikan?', a: 'Sistem operasional kami mencatat keterlambatan secara digital dan akan merujuk denda harian yang terkomputasi otomatis di tagihan pengembalian Anda.' },
                  { q: 'Apakah bisa perpanjang sewa saat sedang mendaki?', a: 'Untuk menghindari konflik bentrok reservasi pelanggan lain, semua perpanjangan wajib dikoordinasikan lewat admin resmi. Keterlambatan sepihak terhitung denda kelipatan harian.' },
                  { q: 'Bagaimana jika ada perlengkapan yang rusak atau sobek?', a: 'Setiap perlengkapan diuji fungsi sebelum serah terima. Kerusakan, robek di kain tenda, atau komponen patah akan dibebankan biaya penggantian denda sesuai kriteria kelayakan alat.' }
                ].map((f, i) => (
                  <div key={i} className="bg-[#121212] p-6 rounded-2xl">
                    <h4 className="font-bold text-md mb-2 flex items-center justify-between text-white">
                       {f.q} <ChevronDown size={18} className="text-stone-400" />
                    </h4>
                    <p className="text-stone-400 text-xs leading-relaxed">{f.a}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

      </main>

      <footer className="bg-black py-16 text-center select-none decoration-transparent">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="font-extrabold text-2xl tracking-tighter text-white select-none mb-4 cursor-pointer hover:opacity-95 transition-all"
          >
            OUTRENT<span className="text-[#FF5500]">.</span>
          </button>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Link to="/about" className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-[#FF5500] transition-colors">
              Tentang Kami
            </Link>
            <Link to="/terms" className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-[#FF5500] transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>

          <p className="text-stone-400 dark:text-stone-600 text-xs font-semibold">
            &copy; 2026 Outrent Systems. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </footer>
    </div>
  );
}

