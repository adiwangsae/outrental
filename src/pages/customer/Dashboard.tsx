import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import { useStore } from "../../store";
import { toast } from "react-toastify";
import { ShieldAlert, CheckCircle2, Clock, ShoppingBag, ClipboardList, RefreshCw } from "lucide-react";

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

  // Refresh user data
  useEffect(() => {
    refreshUser();

    // Polling interval of 60 seconds (optimized from 20s)
    const intervalId = setInterval(() => {
      refreshUser(true);
    }, 60000);

    return () => {
      clearInterval(intervalId);
    };
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
      toast.success("Identitas berhasil diupload. Menunggu verifikasi admin.");
      // Refresh user
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || "Gagal upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white transition-colors">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-16 space-y-12 animate-fade-in text-center md:text-left">
        
        <header className="pb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                  Halo, {user?.name}!
                </h1>
                <button 
                  onClick={() => refreshUser(false)}
                  disabled={syncing}
                  className="p-1.5 text-stone-400 hover:text-[#FF5500] transition-colors cursor-pointer rounded-lg hover:bg-[#121212]"
                  title="Perbarui Status Akun"
                >
                  <RefreshCw size={14} className={syncing ? "animate-spin text-[#FF5500]" : ""} />
                </button>
              </div>
              <p className="text-stone-400 mt-2 font-normal text-sm md:text-base leading-relaxed">
                Selamat datang di dashboard Outrent. Atur seluruh kebutuhan petualangan outdoor Anda di sini. {lastSync && <span className="font-mono text-[10px] ml-2 text-stone-300 bg-[#121212] px-1.5 py-0.5 rounded uppercase tracking-widest">Update: {lastSync}</span>}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {user?.isDemo && (
                <span id="demo-account-badge" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FF5500]/10 text-[#FF5500]">
                  <span className="w-1.5 h-1.5 bg-[#FF5500] rounded-full animate-pulse" /> Demo Account
                </span>
              )}
              {user?.isVerified ? (
                <span id="verified-badge" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FF5500]/15 text-[#FF5500]">
                  <CheckCircle2 size={14} /> Terverifikasi
                </span>
              ) : user?.identityUrl ? (
                <span id="pending-badge" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400">
                  <Clock size={14} /> Proses Verifikasi
                </span>
              ) : (
                <span id="unverified-badge" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#121212] text-amber-500">
                  <ShieldAlert size={14} /> Belum Verifikasi
                </span>
              )}
            </div>
          </div>
        </header>

        {!user?.isDemo && !user?.isVerified && (
          <section className="bg-amber-950/20 p-8 rounded-3xl transition-all shadow-lg text-center md:text-left">
            <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Verifikasi Identitas Diperlukan</h2>
            <p className="text-stone-300 mb-6 text-sm max-w-2xl leading-relaxed">
              Anda belum dapat melakukan penyewaan sebelum identitas resmi seperti KTP atau KTM diverifikasi oleh admin. Unggah foto identitas Anda di bawah ini:
            </p>
            {user?.identityUrl ? (
              <div className="flex justify-center md:justify-start">
                <div className="flex items-center gap-3 bg-[#121212] text-[#FF5500] p-4 rounded-2xl max-w-md shadow-md text-center">
                  <Clock size={18} className="text-[#FF5500]" />
                  <p className="text-sm font-semibold">Dokumen sedang diverifikasi admin...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadId} className="flex flex-col sm:flex-row gap-4 items-center max-w-xl mx-auto md:ml-0">
                <div className="w-full">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-stone-300 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:text-sm file:font-bold file:bg-[#121212] file:text-white hover:file:bg-[#1a1a1a] cursor-pointer file:transition-colors"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={uploading || !file}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#FF5500] hover:bg-[#FF3300] text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer"
                >
                  {uploading ? "Mengunggah..." : "Upload KTP"}
                </button>
              </form>
            )}
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#121212] p-8 md:p-10 rounded-3xl shadow-lg hover:translate-y-[-4px] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                <div className="p-3 bg-[#FF5500]/10 text-[#FF5500] rounded-xl">
                  <ShoppingBag size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-[#FF5500] transition-colors">Mulai Menyewa</h3>
              </div>
              <p className="text-stone-400 mb-8 text-sm leading-relaxed">Jelajahi peralatan outdoor berkualitas premium kami, mulai dari tenda, carrier, sleeping bag, hingga perlengkapan mendaki gunung.</p>
            </div>
            <Link 
              to="/customer/catalog" 
              className="inline-flex items-center justify-center bg-[#FF5500] hover:bg-[#FF3300] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md"
            >
              Buka Katalog
            </Link>
          </div>
          
          <div className="bg-[#121212] p-8 md:p-10 rounded-3xl shadow-lg hover:translate-y-[-4px] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                <div className="p-3 bg-[#1d1d1d] text-[#FF5500] rounded-xl">
                  <ClipboardList size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-[#FF5500] transition-colors">Penyewaan Berjalan</h3>
              </div>
              <p className="text-stone-400 mb-8 text-sm leading-relaxed">Lacak status pesanan Anda, unggah bukti pembayaran, dan dapatkan informasi pengambilan serta pengembalian instan.</p>
            </div>
            <Link 
              to="/customer/bookings" 
              className="inline-flex items-center justify-center bg-[#1d1d1d] hover:bg-[#2a2a2a] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md"
            >
              Riwayat & Pembayaran
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
