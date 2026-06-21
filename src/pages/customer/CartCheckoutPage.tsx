import { useState } from "react";
import Navbar from "../../components/Navbar";
import { useStore } from "../../store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShoppingCart, Tent, Backpack, Trash2, Calendar, MapPin, Receipt, CheckCircle, Package, ShieldAlert } from "lucide-react";

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
      toast.error("Tentukan periode ekspedisi Anda terlebih dahulu.");
      return;
    }
    const isDemo = user?.isDemo === true;
    const isVerified = user?.isVerified === true;
    if (!isDemo && !isVerified) {
      toast.error("Otorisasi Identitas belum terkonfirmasi.");
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

      toast.success("Konfigurasi disimpan. Penugasan menunggu pembayaran.");
      setCart([]);
      navigate("/customer/bookings");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengesahkan reservasi.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev: any) => prev.filter((c: any) => c.item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-[#F7F7F7] font-sans selection:bg-[#FF7A00] selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-[96px] flex flex-col gap-[64px]">
        <header className="border-b border-white/10 pb-[32px]">
          <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight mb-2">Penyusunan Logistik</h1>
          <p className="text-[16px] text-[#BDBDBD] font-light">
            Tinjau kembali daftar peralatan, atur estimasi pengembalian, dan konfirmasikan modul penyewaan.
          </p>
        </header>

        {cart.length === 0 ? (
          <div className="bg-[#151515] border border-white/5 py-[96px] rounded-[24px] text-center max-w-2xl mx-auto w-full flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-[#BDBDBD]">
              <ShoppingCart size={24} />
            </div>
            <h2 className="text-[20px] font-medium mb-2 text-white">Inventaris Kosong</h2>
            <p className="text-[14px] text-[#BDBDBD] font-light max-w-[400px] mb-8">
               Pilih komponen perlengkapan dari modul katalog sebelum menyusun konfigurasi.
            </p>
            <button 
              onClick={() => navigate('/customer/catalog')} 
              className="bg-white text-black hover:bg-[#F7F7F7] px-6 py-3 rounded-[12px] font-medium text-[14px] transition-all cursor-pointer shadow-sm"
            >
              Buka Katalog Modul
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
            
            {/* Left Col */}
            <div className="space-y-8">
              
              <div className="bg-[#151515] p-[32px] rounded-[24px] border border-white/5">
                <div className="flex items-center gap-2 text-[#FF7A00] mb-6">
                  <Calendar size={20} />
                  <h3 className="text-[16px] font-medium text-white tracking-tight">Cakupan Durasi Penyewaan</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-medium text-[#BDBDBD] uppercase tracking-wider mb-2">Waktu Pengambilan</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-[#1D1D1D] hover:bg-[#252525] border border-white/10 rounded-[12px] text-white text-[14px] focus:outline-none focus:border-[#FF7A00] transition-colors cursor-pointer" 
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#BDBDBD] uppercase tracking-wider mb-2">Estimasi Pengembalian</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-[#1D1D1D] hover:bg-[#252525] border border-white/10 rounded-[12px] text-white text-[14px] focus:outline-none focus:border-[#FF7A00] transition-colors cursor-pointer" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#151515] p-[32px] rounded-[24px] border border-white/5">
                <div className="flex items-center gap-2 text-[#FF7A00] mb-6">
                  <Package size={20} className="hidden" /> {/* just keeping spacing same */}
                  <div className="w-5 h-5 flex items-center justify-center"><Tent size={20} /></div>
                  <h3 className="text-[16px] font-medium text-white tracking-tight">Modul Perlengkapan</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  {cart.map((c, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 bg-[#1D1D1D] border border-white/5 rounded-2xl">
                      <div className="flex gap-3 sm:gap-4 items-center">
                        <div className="w-12 h-12 bg-[#151515] border border-white/15 rounded-xl flex items-center justify-center text-[#BDBDBD] shrink-0">
                          {c.item.category?.includes('Tenda') ? <Tent size={20} /> : <Backpack size={20} />}
                        </div>
                        
                        <div className="min-w-0">
                          <h4 className="font-medium text-[15px] sm:text-[16px] text-white leading-tight mb-1 truncate max-w-[180px] sm:max-w-none">{c.item.name}</h4>
                          <p className="text-[12px] text-[#FF7A00] font-medium font-mono">
                            Rp {c.item.price_per_day.toLocaleString('id-ID')} / 24 Jam
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between sm:justify-end gap-3 items-center border-t border-white/5 pt-3 sm:pt-0 sm:border-0">
                        <div className="text-[12px] font-medium uppercase tracking-wider bg-black/40 text-[#BDBDBD] px-3 py-1.5 rounded-lg border border-white/5 font-mono">
                          VOL: {c.qty}
                        </div>
                        <button 
                          onClick={() => removeFromCart(c.item.id)} 
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col: Summary Panel */}
            <div className="sticky top-24">
               <div className="bg-[#151515] p-[32px] rounded-[24px] border border-[#FF7A00]/20">
                  <div className="flex items-center gap-2 text-[#FF7A00] mb-6">
                     <Receipt size={20} />
                     <h3 className="text-[16px] font-medium text-white tracking-tight">Kalkulasi Sistem</h3>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-white/5 text-[14px]">
                     <span className="text-[#BDBDBD]">Komponen Sewa</span>
                     <span className="font-medium text-white">{cart.reduce((a, c) => a + c.qty, 0)} Modul</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 border-b border-white/5 text-[14px]">
                     <span className="text-[#BDBDBD]">Durasi Reservasi</span>
                     <span className="font-medium text-white">{startDate && endDate ? `${days} Siklus` : '0 Siklus'}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-white/5 text-[14px]">
                     <span className="text-[#BDBDBD]">Titik Pengambilan</span>
                     <span className="font-medium text-white inline-flex items-center gap-1.5"><MapPin size={12} className="text-[#FF7A00]"/> Basecamp Pusat</span>
                  </div>

                  <div className="mt-8 mb-8">
                     <span className="text-[10px] text-[#BDBDBD] font-medium uppercase tracking-widest block mb-2">Nilai Tagihan</span>
                     <span className="text-[32px] font-medium text-[#FF7A00] tracking-tight block">
                       Rp {totalCost.toLocaleString('id-ID')}
                     </span>
                  </div>

                  {(!user?.isDemo && !user?.isVerified) ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[12px] mb-4">
                       <p className="text-[12px] text-red-400 font-light flex gap-2">
                          <ShieldAlert size={16} className="shrink-0" />
                          <span>Otorisasi pengguna gagal. Mohon unggah dokumen identitas pada laman Manajemen Akun.</span>
                       </p>
                    </div>
                  ) : (
                    <button 
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full bg-white hover:bg-[#F7F7F7] text-black py-4 rounded-[12px] font-medium text-[14px] transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                    >
                      {loading ? "Menyinkronkan Server..." : <><CheckCircle size={16} /> Otorisasi Penugasan</>}
                    </button>
                  )}
               </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
