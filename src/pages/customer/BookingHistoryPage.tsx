import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useStore } from "../../store";
import { toast } from "react-toastify";

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");
  const { token } = useStore();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const fetchBookings = async (isSilent = false) => {
    if (!isSilent) setSyncing(true);
    try {
      const res = await fetch('/api/bookings/my-bookings', {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.bookings || []);
      setLastSync(new Date().toLocaleTimeString("id-ID"));
    } catch {
      // silent
    } finally {
      if (!isSilent) setLoading(false);
      if (!isSilent) setSyncing(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Polling interval of 60 seconds
    const intervalId = setInterval(() => {
      fetchBookings(true);
    }, 60000);

    // Listen to real-time events to reload booking status
    return () => {
      clearInterval(intervalId);
    };
  }, [token]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Pesanan berhasil dibatalkan");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || "Gagal membatalkan pesanan");
    }
  };

  const handleUploadPayment = async (e: React.FormEvent, bookingId: string) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fileInput = form.elements.namedItem('payment_proof') as HTMLInputElement;
    if (!fileInput.files?.[0]) return;

    setUploadingFor(bookingId);
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const res = await fetch("/api/upload/payment/" + bookingId, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Bukti pembayaran berhasil diupload");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || "Gagal upload bukti bayar");
    } finally {
      setUploadingFor(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white transition-colors">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-16 space-y-12 animate-fade-in text-center md:text-left">
         <header className="pb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-sans">Riwayat Pesanan</h1>
                <button 
                  id="btn-bookings-refresh"
                  onClick={() => fetchBookings(false)}
                  disabled={syncing}
                  className="p-1.5 text-stone-400 hover:text-[#FF5500] transition-colors cursor-pointer rounded-lg hover:bg-[#121212]"
                  title="Perbarui Status Pesanan"
                >
                  <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#FF5500]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                  </svg>
                </button>
              </div>
              <p className="text-stone-400 mt-2 text-sm md:text-base leading-relaxed">
                Pantau status pemesanan, unggah bukti pembayaran transfer, dan lihat detail sewa alat outdoor Anda. {lastSync && <span className="font-mono text-[10px] ml-2 text-stone-300 bg-[#121212] px-1.5 py-0.5 rounded uppercase tracking-widest">(Terupdate: {lastSync})</span>}
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="space-y-6 text-left">
            <div className="bg-[#121212] rounded-3xl p-8 h-40 animate-pulse">
              <div className="flex justify-between">
                <div className="h-6 w-1/4 bg-stone-800 rounded"></div>
                <div className="h-6 w-1/4 bg-stone-800 rounded"></div>
              </div>
              <div className="mt-8 space-y-3">
                <div className="h-4 w-1/2 bg-stone-800 rounded"></div>
                <div className="h-4 w-1/2 bg-stone-800 rounded"></div>
              </div>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-[#121212] p-12 md:p-16 rounded-3xl text-center max-w-xl mx-auto space-y-6 shadow-lg">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto text-stone-400 text-2xl">
              📋
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2 text-white">Belum Ada Transaksi</h2>
              <p className="text-sm text-stone-400">Semua reservasi masa lalu dan aktif Anda akan ditampilkan di modul ini.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 text-left">
            {bookings.map((b) => (
              <div key={b.id} className="bg-[#121212] p-8 rounded-3xl shadow-lg space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 bg-transparent">
                   <div>
                     <p className="text-xs uppercase tracking-wider font-bold text-stone-450 mb-1">Nomor Pesanan</p>
                     <span className="font-extrabold text-[#FF5500] text-sm md:text-base font-mono">{b.bookingNumber}</span>
                   </div>
                   <div>
                     <p className="text-xs uppercase tracking-wider font-bold text-stone-450 mb-1 md:text-right">Total Pembayaran</p>
                     <span className="text-xl md:text-2xl font-black text-white">Rp {b.total_price.toLocaleString()}</span>
                   </div>
                   <div className="text-left md:text-right">
                     <p className="text-xs uppercase tracking-wider font-bold text-stone-450 mb-1.5">Status Reservasi</p>
                     <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#1a1a1a] text-[#FF5500] uppercase tracking-wider">
                       {b.status.replace(/_/g, ' ')}
                     </span>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4">
                  <div>
                    <h4 className="font-bold text-white mb-4 tracking-tight">Detail Waktu & Item Rental</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-4">
                        <span className="text-stone-400 w-32 font-medium">Tanggal Mulai:</span>
                        <span className="font-semibold text-white">{new Date(b.start_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-stone-400 w-32 font-medium">Tanggal Kembali:</span>
                        <span className="font-semibold text-white">{new Date(b.end_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {b.items && b.items.length > 0 && (
                      <div className="mt-5 pt-4 bg-transparent">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Item Di-Booking:</p>
                        <div className="flex flex-wrap gap-2">
                          {b.items.map((it: any) => (
                            <span key={it.id} className="inline-flex items-center gap-1 bg-[#1a1a1a] text-white px-3 py-1 rounded-xl text-xs font-semibold">
                              {it.itemName} <code className="text-stone-500 text-[10px]">({it.unitCode})</code>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {b.penalties && b.penalties.length > 0 && (
                      <div className="mt-5 p-4 bg-rose-950/20 rounded-2xl">
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">
                          INFORMASI DENDA AKTIF:
                        </p>
                        <div className="space-y-1.5">
                          {b.penalties.map((pen: any) => (
                            <div key={pen.id} className="flex justify-between items-center text-xs">
                              <span className="text-stone-450">
                                {pen.reason} &bull; <strong className="text-stone-300">Rp {pen.amount.toLocaleString()}</strong>
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                pen.status === "paid" ? "text-orange-400" : "text-[#FF5500] animate-pulse"
                              }`}>
                                {pen.status === "paid" ? "Lunas" : "Belum Lunas"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[9px] text-stone-500 mt-2 leading-relaxed">
                          * Harap selesaikan denda ini secara tunai atau transfer saat pengembalian di gerai cabang untuk memulihkan status penyewaan Anda.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    {b.status === "waiting_payment" && (
                      <div className="bg-[#1a1a1a] p-6 rounded-2xl">
                        <h4 className="font-bold text-[#FF5500] mb-2 tracking-tight">Instruksi Pembayaran</h4>
                        <p className="text-xs text-stone-400 mb-4 leading-relaxed text-left">
                          Silakan transfer tagihan di atas ke rekening <strong className="text-white">BCA 123456789</strong> a.n. <strong className="text-white">Outrent System</strong>. Lalu unggah foto bukti transfer Anda di form di bawah ini:
                        </p>
                        <form onSubmit={(e) => handleUploadPayment(e, b.id)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <input 
                            name="payment_proof" 
                            type="file" 
                            accept="image/*" 
                            required 
                            className="text-xs w-full text-white cursor-pointer"
                          />
                          <button 
                            type="submit" 
                            disabled={uploadingFor === b.id}
                            className="bg-[#FF5500] hover:bg-[#FF3300] text-white px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
                          >
                            {uploadingFor === b.id ? "Loading..." : "Kirim Bukti"}
                          </button>
                        </form>
                        <div className="mt-4 pt-4">
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(b.id)}
                            className="w-full text-center text-[11px] font-bold tracking-wider uppercase bg-[#121212] hover:bg-[#222] text-rose-500 py-2.5 rounded-xl transition-all cursor-pointer"
                          >
                            Batalkan Penyewaan Ini
                          </button>
                        </div>
                      </div>
                    )}
                    {(b.status === "payment_verified" || b.status === "ready_pickup" || b.status === "ongoing" || b.status === "completed" || b.status === "returned") && (
                      <div className="bg-[#FF5500]/10 p-5 rounded-2xl flex items-center gap-3">
                        <span className="text-[#FF5500] text-base">✓</span>
                        <p className="text-xs md:text-sm font-semibold text-[#FF5500]">
                          {b.status === "payment_verified" ? "Pembayaran aman & telah terverifikasi oleh Admin." :
                           b.status === "ready_pickup" ? "Silakan ambil alat di gerai kami." :
                           b.status === "ongoing" ? "Penyewaan sedang berlangsung." :
                           b.status === "returned" ? "Peralatan telah dikembalikan, mengecek kondisi fisik..." :
                           "Penyewaan selesai."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
