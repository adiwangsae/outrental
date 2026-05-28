import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import { Server, User, Briefcase, Lock, ShieldCheck, Mail, Sparkles } from "lucide-react";

type LoginTab = "customer" | "owner" | "demo";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginTab>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

  // Pre-fill credentials helper for testing
  const handlePreFill = (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Server mengirimkan respon tidak valid. Sila coba beberapa saat lagi.");
      }
      
      if (!res.ok) throw new Error(data.error || "Gagal masuk");
      
      setAuth(data.user, data.token);
      toast.success("Login berhasil");
      
      const userRoleLower = data.user.role.toLowerCase();
      if (userRoleLower === 'admin' || userRoleLower === 'super_admin' || userRoleLower === 'demo_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal login");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'customer') => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      
      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Server mengirimkan respon tidak valid saat memproses akun Demo.");
      }
      
      if (!res.ok) throw new Error(data.error || "Gagal masuk ke simulasi");
      
      setAuth(data.user, data.token);
      toast.success(`Berhasil masuk sebagai Demo ${role === 'admin' ? 'Admin' : 'Pelanggan'}`);
      
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal masuk Demo Mode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white transition-colors">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#121212] rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-black tracking-tight text-white uppercase">
            OUT<span className="text-[#FF5500]">RENT</span>.
          </Link>
          <p className="text-stone-400 mt-2 text-xs font-bold">Sistem Outdoor Premium Terpadu</p>
        </div>

        {/* Liquid Glass Styled Tab Selector */}
        <div className="grid grid-cols-3 p-1 bg-black rounded-2xl mb-6">
          <button
            onClick={() => { setActiveTab("customer"); setEmail(""); setPassword(""); }}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer ${
              activeTab === "customer" 
                ? "bg-[#FF5500] text-white shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <User size={15} />
            Pelanggan
          </button>
          
          <button
            onClick={() => { setActiveTab("owner"); setEmail(""); setPassword(""); }}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer ${
              activeTab === "owner" 
                ? "bg-[#FF5500] text-white shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Briefcase size={15} />
            Pemilik
          </button>

          <button
            onClick={() => { setActiveTab("demo"); }}
            className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer ${
              activeTab === "demo" 
                ? "bg-[#FF5500] text-white shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Sparkles size={15} />
            Demo Sandbox
          </button>
        </div>

        {/* Dynamic Forms */}
        <AnimatePresence mode="wait">
          {activeTab !== "demo" ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "customer" ? -6 : 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold mb-1.5 text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail size={12} className="text-[#FF5500]" />
                    Alamat Email Resmi
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={activeTab === "customer" ? "pelanggan@outrent.com" : "owner@outrent.com"}
                    className="w-full px-4 py-3 rounded-xl bg-black text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-extrabold mb-1.5 text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Lock size={12} className="text-[#FF5500]" />
                    Kata Sandi Akun
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-black text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
                    required
                  />
                </div>

                {/* Pre-fill Helper Box */}
                {activeTab === "customer" ? (
                  <div className="p-3 bg-black rounded-xl flex flex-col gap-1 text-[11px] text-stone-400">
                    <p className="font-extrabold text-[#FF5500]">Akun Uji Coba Pelanggan Asli:</p>
                    <div className="flex items-center justify-between mt-1">
                      <span>email: pelanggan@outrent.com</span>
                      <button 
                        type="button"
                        onClick={() => handlePreFill("pelanggan@outrent.com", "pelanggan123")}
                        className="text-[#FF5500] font-black hover:underline cursor-pointer"
                      >
                        Gunakan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-black rounded-xl flex flex-col gap-1 text-[11px] text-stone-400">
                    <p className="font-extrabold text-[#FF5500]">Akun Pemilik Usaha Asli:</p>
                    <div className="flex items-center justify-between mt-1">
                      <span>email: owner@outrent.com</span>
                      <button 
                        type="button"
                        onClick={() => handlePreFill("owner@outrent.com", "owner123")}
                        className="text-[#FF5500] font-black hover:underline cursor-pointer"
                      >
                        Gunakan
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#FF5500] hover:bg-[#FF3300] text-white transition-all font-bold text-xs uppercase tracking-wider disabled:opacity-50 mt-4 cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-md"
                >
                  <Lock size={14} />
                  {loading ? "Menghubungkan..." : "Masuk Operasional"}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="demo"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 animate-fade-in"
            >
              <div className="p-3 bg-black text-stone-400 rounded-xl text-[11px] leading-relaxed text-center">
                Mode Demo membolehkan Anda mengeksplorasi seluruh fitur canggih OUTRENT secara langsung menggunakan dataset simulasi terisolasi.
              </div>

              <div className="grid grid-cols-1 gap-3 text-left">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-black hover:bg-[#1a1a1a] transition-all cursor-pointer group"
                >
                  <Server size={28} className="text-[#FF5500] mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-[12px] font-bold text-white">SIMULASI DEMO ADMIN</span>
                  <span className="text-[10px] text-stone-400 mt-1">Uji coba instan panel pelacakan &amp; kontrol admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('customer')}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-black hover:bg-[#1a1a1a] transition-all cursor-pointer group"
                >
                  <User size={28} className="text-[#FF5500] mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-[12px] font-bold text-white">SIMULASI DEMO PELANGGAN</span>
                  <span className="text-[10px] text-stone-400 mt-1">Uji coba checkout, unggah dokumen, &amp; pembayaran</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-stone-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-black text-stone-400 px-3">Atau</span>
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 font-medium">
          Belum punya akun? <Link to="/register" className="text-[#FF5500] font-bold hover:underline">Daftar pelanggan baru</Link>
        </p>
      </motion.div>
    </div>
  );
}
