import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import { Server, User, ArrowRight, Shield } from "lucide-react";

type LoginTab = "customer" | "admin" | "demo";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginTab>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

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
        throw new Error("Server respon tidak valid.");
      }
      
      if (!res.ok) throw new Error(data.error || "Gagal masuk");
      
      setAuth(data.user, data.token);
      toast.success("Otentikasi Berhasil");
      
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
        throw new Error("Server respon tidak valid.");
      }
      
      if (!res.ok) throw new Error(data.error || "Gagal masuk");
      
      setAuth(data.user, data.token);
      toast.success(`Otentikasi Demo ${role === 'admin' ? 'Admin' : 'Pelanggan'} Berhasil`);
      
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
    <div className="h-screen w-screen overflow-hidden flex text-[#F7F7F7] bg-gradient-to-br from-[#070708] via-[#0D1016] to-[#08090C] font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Visual Identity Section */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-gradient-to-b from-[#0D1016] to-[#070708] border-r border-white/5">
         <Link to="/" className="text-[20px] xl:text-[24px] font-semibold tracking-tight z-10 flex items-center gap-2">
            OUTRENT<span className="text-[#FF7A00]">.</span>
         </Link>
         
         <div className="relative z-10 max-w-[460px]">
            <h2 className="text-[38px] xl:text-[48px] font-medium leading-[1.1] tracking-[-0.03em] mb-4">
              Infrastruktur <br/> Penyewaan Ekspedisi.
            </h2>
            <p className="text-[15px] xl:text-[17px] text-[#BDBDBD] font-light leading-[1.5]">
              Akses sistem untuk mengelola operasional atau merencanakan penjelajahan Anda berikutnya.
            </p>
         </div>

         {/* Abstract background graphics representing structure/mountains */}
         <div className="absolute top-[20%] right-[-20%] w-[800px] h-[800px] rounded-full border-[1px] border-white/5" />
         <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full border-[1px] border-white/5" />
         <div className="absolute bottom-[0%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-t from-[#FF7A00]/5 to-transparent blur-[100px]" />
      </div>

      {/* Auth Panel */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-4 sm:p-8 xl:p-12 relative overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] sm:max-w-[450px] flex flex-col p-6 sm:p-8 rounded-2xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.85)] liquid-glass-card my-auto"
        >
          <div className="lg:hidden mb-4 text-center">
             <Link to="/" className="text-[22px] font-semibold tracking-tight inline-flex items-center gap-2">
                OUTRENT<span className="text-[#FF7A00]">.</span>
             </Link>
          </div>

          <h3 className="text-[24px] sm:text-[28px] font-medium tracking-tight mb-4 text-center lg:text-left">Selamat Datang</h3>

          {/* Simple Clean Tabs */}
          <div className="flex justify-center lg:justify-start gap-4 border-b border-white/10 mb-5 pb-0.5">
             <button 
               onClick={() => setActiveTab("customer")}
               className={`pb-2 text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer ${activeTab === 'customer' ? 'text-white border-b-2 border-white' : 'text-[#BDBDBD] hover:text-white'}`}
             >
               Pelanggan
             </button>
             <button 
               onClick={() => setActiveTab("admin")}
               className={`pb-2 text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer ${activeTab === 'admin' ? 'text-white border-b-2 border-white' : 'text-[#BDBDBD] hover:text-white'}`}
             >
               Admin Operator
             </button>
             <button 
               onClick={() => setActiveTab("demo")}
               className={`pb-2 text-[13px] sm:text-[14px] font-medium transition-colors cursor-pointer ${activeTab === 'demo' ? 'text-[#FF7A00] border-b-2 border-[#FF7A00]' : 'text-[#BDBDBD] hover:text-[#FF7A00]'}`}
             >
               Simulasi Demo
             </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab !== "demo" ? (
              <motion.form 
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleLogin} 
                className="flex flex-col gap-4"
              >
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-[#BDBDBD] uppercase tracking-wider">
                      Alamat Email
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={activeTab === "customer" ? "nama@domain.com" : "admin@outrent.com"}
                      className="bg-black/40 border border-white/15 py-2.5 px-4 rounded-xl text-[15px] text-white focus:outline-none focus:border-[#FF7A00] transition-colors"
                      required
                    />
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-[#BDBDBD] uppercase tracking-wider">
                      Kata Sandi
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-black/40 border border-white/15 py-2.5 px-4 rounded-xl text-[15px] text-white focus:outline-none focus:border-[#FF7A00] transition-colors"
                      required
                    />
                 </div>

                 {/* Development Helper for Testing */}
                 <div className="flex justify-between items-center bg-white/5 py-2.5 px-4 rounded-xl border border-white/5">
                   <div className="text-[11px] text-[#BDBDBD] font-light">
                     Akun testing tersedia:
                   </div>
                   <button 
                      type="button"
                      onClick={() => handlePreFill(
                        activeTab === 'customer' ? "pelanggan@outrent.com" : "owner@outrent.com",
                        activeTab === 'customer' ? "pelanggan123" : "owner123"
                      )}
                      className="text-[11px] text-[#FF7A00] font-medium hover:text-white transition-colors cursor-pointer"
                   >
                     Isi Otomatis
                   </button>
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-1 w-full bg-white hover:bg-[#F7F7F7] text-black py-2.5 px-4 rounded-xl font-medium text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                 >
                    {loading ? "Menghubungkan..." : "Masuk ke Sistem"}
                    {!loading && <ArrowRight size={16} />}
                 </button>
              </motion.form>
            ) : (
              <motion.div
                key="demo"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-3.5"
              >
                 <div className="text-[13px] text-[#BDBDBD] font-light leading-[1.5] text-center lg:text-left">
                   Eksplorasi sistem secara instan menggunakan dataset simulasi yang terisolasi. Pilih perspektif untuk memulai.
                 </div>

                 <button
                    onClick={() => handleDemoLogin('customer')}
                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group text-left cursor-pointer"
                 >
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#FF7A00]/20 transition-colors shrink-0">
                      <User size={20} className="text-[#BDBDBD] group-hover:text-[#FF7A00]" />
                    </div>
                    <div>
                       <div className="text-[14px] font-medium text-white mb-0.5">Simulasi Pelanggan</div>
                       <div className="text-[12px] text-[#BDBDBD] font-light">Eksplorasi katalog dan booking.</div>
                    </div>
                 </button>

                 <button
                    onClick={() => handleDemoLogin('admin')}
                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group text-left cursor-pointer"
                 >
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#FF7A00]/20 transition-colors shrink-0">
                      <Shield size={20} className="text-[#BDBDBD] group-hover:text-[#FF7A00]" />
                    </div>
                    <div>
                       <div className="text-[14px] font-medium text-white mb-0.5">Simulasi Admin Server</div>
                       <div className="text-[12px] text-[#BDBDBD] font-light">Kelola operasional dan persetujuan.</div>
                    </div>
                 </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5 text-center text-[13px] text-[#BDBDBD]/80 font-light border-t border-white/10 pt-4">
             Belum memiliki mandat akses? <Link to="/register" className="text-white font-medium hover:text-[#FF7A00] transition-colors text-shadow-sm">Permintaan pembuatan akun.</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
