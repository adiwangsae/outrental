import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { toast } from "react-toastify";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      
      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Server mengirimkan respon pendaftaran tidak valid.");
      }
      
      if (!res.ok) throw new Error(data.error || "Gagal mendaftar");
      
      setAuth(data.user, data.token);
      toast.success("Pembuatan Akun Berhasil");
      navigate('/customer/dashboard');
    } catch (err: any) {
      toast.error(err.message || "Gagal daftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-row-reverse text-[#F7F7F7] bg-gradient-to-br from-[#070708] via-[#0D1016] to-[#08090C] font-sans selection:bg-[#FF7A00] selection:text-white">
      {/* Visual Identity Section */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 xl:p-16 overflow-hidden bg-gradient-to-b from-[#0D1016] to-[#070708] border-l border-white/5">
         <Link to="/" className="text-[20px] xl:text-[24px] font-semibold tracking-tight z-10 flex text-[#BDBDBD] hover:text-white transition-colors">
            Kembali
         </Link>
         
         <div className="relative z-10 max-w-[460px]">
           <h2 className="text-[48px] font-medium leading-[1.05] tracking-[-0.03em] mb-6">
             Inisiasi <br/> Profil Ekspedisi.
           </h2>
           <p className="text-[18px] text-[#BDBDBD] font-light leading-[1.6]">
             Mulailah perjalanan Anda dengan bergabung dalam ekosistem persewaan modern yang terkalibrasi.
           </p>
         </div>

         {/* Abstract background graphics representing structure/mountains */}
         <div className="absolute top-[20%] left-[-20%] w-[800px] h-[800px] rounded-full border-[1px] border-white/5" />
         <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] rounded-full border-[1px] border-white/5" />
         <div className="absolute bottom-[0%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-t from-[#FF7A00]/5 to-transparent blur-[100px]" />
      </div>

      {/* Auth Panel */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-4 sm:p-8 xl:p-12 relative overflow-y-auto animate-fade-in border-l border-white/5">
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

          <h3 className="text-[24px] sm:text-[28px] font-medium tracking-tight mb-4 text-center lg:text-left">Pembuatan Akun</h3>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
             <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#BDBDBD] uppercase tracking-wider">
                  Nama Lengkap Sesuai ID
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ksatria Biru"
                  className="bg-black/40 border border-white/15 py-2.5 px-4 rounded-xl text-[15px] text-white focus:outline-none focus:border-[#FF7A00] transition-colors"
                  required
                />
             </div>
             
             <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#BDBDBD] uppercase tracking-wider">
                  Alamat Email Valid
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  className="bg-black/40 border border-white/15 py-2.5 px-4 rounded-xl text-[15px] text-white focus:outline-none focus:border-[#FF7A00] transition-colors"
                  required
                />
             </div>
             
             <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-[#BDBDBD] uppercase tracking-wider">
                  Kata Sandi Baru
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/40 border border-white/15 py-2.5 px-4 rounded-xl text-[15px] text-white focus:outline-none focus:border-[#FF7A00] transition-colors"
                  required
                  minLength={6}
                />
             </div>

             <button 
                type="submit" 
                disabled={loading}
                className="mt-2 w-full bg-white hover:bg-[#F7F7F7] text-black py-2.5 px-4 rounded-xl font-medium text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer"
             >
                {loading ? "Menyimpan Profil..." : "Registrasi Mandat"}
                {!loading && <ArrowRight size={16} />}
             </button>
          </form>

          <div className="mt-5 text-center text-[13px] text-[#BDBDBD]/80 font-light border-t border-[#ffffff]/10 pt-4">
             Sudah terdaftar dalam sistem? <Link to="/login" className="text-white font-medium hover:text-[#FF7A00] transition-colors text-shadow-sm">Otentikasi di sini.</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
