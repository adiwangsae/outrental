import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useStore } from "../../store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShoppingCart, Tent, Backpack, Trash2 } from "lucide-react";

export default function CartCheckoutPage() {
  const { cart, setCart, token, user } = useStore();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const totalItemPerDay = cart.reduce((acc, c) => acc + (c.item.price_per_day * c.qty), 0);
  
  const days = startDate && endDate 
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)))
    : 1;

  const totalCost = totalItemPerDay * days;

  const handleCheckout = async () => {
    if (!startDate || !endDate) {
      toast.error("Pilih tanggal mulai dan selesai");
      return;
    }
    const isDemo = user?.isDemo === true;
    const isVerified = user?.isVerified === true;
    if (!isDemo && !isVerified) {
      toast.error("Upload identitas terlebih dahulu sebelum melakukan penyewaan.");
      return;
    }
    
    setLoading(true);
    try {
      const items = cart.map(c => ({ productId: c.item.id, qty: c.qty }));
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ startDate, endDate, items })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Checkout berhasil! Silakan lakukan pembayaran");
      setCart([]);
      navigate("/customer/bookings");
    } catch (err: any) {
      toast.error(err.message || "Gagal checkout");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev: any) => prev.filter((c: any) => c.item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white transition-colors">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-16 space-y-12 animate-fade-in text-center md:text-left">
        <header className="pb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Keranjang & Checkout</h1>
          <p className="text-stone-400 mt-2 text-sm md:text-base leading-relaxed">
            Tinjau pesanan Anda, tentukan periode sewa, dan lakukan reservasi resmi.
          </p>
        </header>

        {cart.length === 0 ? (
          <div className="bg-[#121212] p-12 md:p-16 rounded-3xl text-center max-w-xl mx-auto space-y-6 shadow-lg">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto text-[#FF5500]">
              <ShoppingCart size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2 text-white">Keranjang Belum Terisi</h2>
              <p className="text-sm text-stone-400">Silakan jelajahi katalog kami untuk memilih peralatan petualangan terbaik Anda.</p>
            </div>
            <button 
              onClick={() => navigate('/customer/catalog')} 
              className="inline-flex items-center justify-center bg-[#FF5500] hover:bg-[#FF3300] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer"
            >
              Buka Katalog
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8 text-left">
              <div className="bg-[#121212] p-8 rounded-3xl shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Daftar Peralatan</h3>
                <div className="space-y-4">
                  {cart.map((c, idx) => (
                    <div key={idx} className="flex gap-4 items-center p-5 bg-[#171717] rounded-2xl transition-all">
                      <div className="w-12 h-12 bg-[#222] rounded-xl flex items-center justify-center text-[#FF5500] shadow-sm">
                        {c.item.category?.includes('Tenda') ? <Tent size={20} /> : <Backpack size={20} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm md:text-base text-white">{c.item.name}</h4>
                        <p className="text-xs text-[#FF5500] font-black mt-0.5">
                          Rp {c.item.price_per_day.toLocaleString()} / Hari
                        </p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-xs font-bold bg-[#222] text-white px-3 py-1.5 rounded-lg">
                          Qty: {c.qty}
                        </div>
                        <button 
                          onClick={() => removeFromCart(c.item.id)} 
                          className="text-[#FF5500] hover:text-[#FF3300] font-bold text-xs transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#121212] p-8 rounded-3xl shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Periode Penyewaan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Tanggal Mulai</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl bg-black text-white text-sm focus:outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Tanggal Kembali</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl bg-black text-white text-sm focus:outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#121212] p-8 rounded-3xl shadow-lg h-fit sticky top-24 text-left">
              <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Ringkasan Reservasi</h3>
              <div className="space-y-4 pb-6 mb-6">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-stone-400">Durasi Sewa</span>
                  <span className="font-bold text-white">{days} Hari</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-stone-400">Total Item</span>
                  <span className="font-bold text-white">{cart.reduce((a, c) => a + c.qty, 0)} Unit</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-stone-400">Cabang Pengambilan</span>
                  <span className="font-bold text-white">Sembalun Utama</span>
                </div>
              </div>
              <div className="space-y-1 mb-8">
                <span className="text-xs text-stone-400 font-bold uppercase tracking-wider block">Total Tagihan</span>
                <span className="text-2xl md:text-3xl font-black text-[#FF5500] block">Rp {totalCost.toLocaleString()}</span>
              </div>
              {(!user?.isDemo && !user?.isVerified) ? (
                <div className="space-y-4">
                  <button 
                    onClick={() => navigate('/customer/dashboard')}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    Lengkapi Verifikasi Sekarang
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-[#FF5500] hover:bg-[#FF3300] text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md"
                >
                  {loading ? "Memproses..." : "Konfirmasi Pembokingan"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
