import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { toast } from "react-toastify";
import { motion } from "motion/react";

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
      toast.success("Pendaftaran berhasil");
      navigate('/customer/dashboard');
    } catch (err: any) {
      toast.error(err.message || "Gagal daftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#121212] rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black tracking-tight text-white">
            OUT<span className="text-[#FF5500]">RENT</span>.
          </Link>
          <p className="text-stone-400 mt-2 text-xs font-bold">Buat akun untuk mulai menyewa</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold mb-1.5 text-stone-450 uppercase tracking-wider">Nama Lengkap</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold mb-1.5 text-stone-450 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold mb-1.5 text-stone-450 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#FF5500] hover:bg-[#FF3300] text-white transition-all font-bold text-xs uppercase tracking-wider disabled:opacity-50 mt-4 cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-stone-400 font-semibold">
          Sudah punya akun? <Link to="/login" className="text-[#FF5500] hover:underline font-bold">Masuk di sini</Link>
        </p>
      </motion.div>
    </div>
  );
}
