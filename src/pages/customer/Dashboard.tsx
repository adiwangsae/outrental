import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import { useStore } from "../../store";
import { toast } from "react-toastify";
import { ShieldAlert, CheckCircle2, Clock, ShoppingBag, ClipboardList, RefreshCw, ArrowRight } from "lucide-react";

export default function CustomerDashboard() {
  const { user, token, setAuth } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");

  const refreshUser = async (isSilent = false) => {
    if (!isSilent) setSyncing(true);
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.user) {
        setAuth(data.user, token);
      }
      setLastSync(new Date().toLocaleTimeString("id-ID"));
    } catch {
      // silent
    } finally {
      if (!isSilent) setSyncing(false);
    }
  };

  useEffect(() => {
    refreshUser();
    const intervalId = setInterval(() => {
      refreshUser(true);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [token, setAuth]);

  const handleUploadId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("identityType", "KTP");

    try {
      const res = await fetch("/api/upload/identity", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Dokumen berhasil diunggah.");
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || "Gagal upload dokumen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-[#F7F7F7] font-sans selection:bg-[#FF7A00] selection:text-white">
      <Navbar />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-[96px] flex flex-col gap-[64px]">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-[32px]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight">
                Ikhtisar Pengguna
              </h1>
              <button 
                onClick={() => refreshUser(false)}
                disabled={syncing}
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#BDBDBD] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                title="Sinkronisasi Data"
              >
                <RefreshCw size={14} className={syncing ? "animate-spin text-[#FF7A00]" : ""} />
              </button>
            </div>
            <p className="text-[16px] text-[#BDBDBD] font-light">
              Menampilkan status akun dan operasional aktif untuk {user?.name}. 
              {lastSync && <span className="ml-2 px-2 py-0.5 rounded-full bg-[#151515] border border-white/5 text-[10px] uppercase font-mono tracking-wider">Sync: {lastSync}</span>}
            </p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {user?.isDemo && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF7A00]/20 bg-[#FF7A00]/5 text-[#FF7A00]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
                <span className="text-[12px] font-medium uppercase tracking-wider">Mode Simulasi</span>
              </div>
            )}
            {user?.isVerified ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#151515] border border-white/10 text-white">
                <CheckCircle2 size={16} className="text-[#FF7A00]"/>
                <span className="text-[12px] font-medium uppercase tracking-wider">Identitas Valid</span>
              </div>
            ) : user?.identityUrl ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#151515] border border-white/10 text-[#BDBDBD]">
                <Clock size={16} />
                <span className="text-[12px] font-medium uppercase tracking-wider">Verifikasi Berjalan</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#151515] border border-red-500/20 text-red-400">
                <ShieldAlert size={16} />
                <span className="text-[12px] font-medium uppercase tracking-wider">Identitas Kosong</span>
              </div>
            )}
          </div>
        </header>

        {/* Verification Alert */}
        {!user?.isDemo && !user?.isVerified && (
          <section className="bg-[#151515] border border-white/5 rounded-[24px] p-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-[600px]">
              <h2 className="text-[20px] font-medium text-white mb-2 tracking-tight">Kredensial Dibutuhkan</h2>
              <p className="text-[14px] text-[#BDBDBD] font-light leading-[1.6]">
                Sistem memerlukan salinan identitas resmi (KTP/KTM/Paspor) sebelum otorisasi penyewaan alat diterbitkan.
              </p>
            </div>
            
            {user?.identityUrl ? (
              <div className="flex items-center gap-3 px-6 py-4 rounded-[16px] bg-[#1D1D1D] border border-white/5 text-[#FF7A00]">
                <Clock size={20} />
                <span className="text-[14px] font-medium">Dalam Peninjauan Admin</span>
              </div>
            ) : (
              <form onSubmit={handleUploadId} className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="flex items-center justify-center px-6 py-4 bg-[#1D1D1D] hover:bg-[#252525] border border-white/10 rounded-[12px] text-[14px] text-white transition-colors cursor-pointer w-full min-w-[200px]">
                    {file ? file.name : 'Pilih Berkas Identitas'}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={uploading || !file}
                  className="px-8 py-4 bg-white text-black hover:bg-[#F7F7F7] font-medium rounded-[12px] text-[14px] transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {uploading ? "Memproses..." : "Unggah"}
                </button>
              </form>
            )}
          </section>
        )}

        {/* Action Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {/* Catalog Action */}
          <Link 
            to="/customer/catalog"
            className="group flex flex-col bg-[#151515] hover:bg-[#1D1D1D] rounded-[24px] p-[48px] border border-white/5 transition-colors cursor-pointer"
          >
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-8 group-hover:bg-[#FF7A00]/10 transition-colors">
                <ShoppingBag size={24} className="text-[#BDBDBD] group-hover:text-[#FF7A00] transition-colors" />
             </div>
             <h3 className="text-[24px] font-medium mb-4">Eksplorasi Inventaris</h3>
             <p className="text-[16px] text-[#BDBDBD] font-light leading-[1.6] mb-[64px]">
                Jelajahi ketersediaan armada peralatan kami untuk periode ekspedisi Anda. Sistem menampilkan stok waktu-nyata.
             </p>
             <div className="mt-auto flex items-center gap-3 text-[14px] font-medium text-white group-hover:text-[#FF7A00] transition-colors">
                Buka Modul Eksplorasi <ArrowRight size={16} />
             </div>
          </Link>
          
          {/* Bookings Action */}
          <Link 
            to="/customer/bookings"
            className="group flex flex-col bg-[#151515] hover:bg-[#1D1D1D] rounded-[24px] p-[48px] border border-white/5 transition-colors cursor-pointer"
          >
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-8 group-hover:bg-[#BDBDBD]/20 transition-colors">
                <ClipboardList size={24} className="text-[#BDBDBD] group-hover:text-white transition-colors" />
             </div>
             <h3 className="text-[24px] font-medium mb-4">Status Transaksi</h3>
             <p className="text-[16px] text-[#BDBDBD] font-light leading-[1.6] mb-[64px]">
                Pantau validasi pembayaran, jadwal armada Anda, dan riwayat mutasi perlengkapan sebelumnya.
             </p>
             <div className="mt-auto flex items-center gap-3 text-[14px] font-medium text-white transition-colors">
                Buka Modul Transaksi <ArrowRight size={16} />
             </div>
          </Link>
        </section>

      </main>
    </div>
  );
}
