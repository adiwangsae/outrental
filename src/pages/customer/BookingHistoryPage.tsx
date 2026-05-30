import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useStore } from "../../store";
import { toast } from "react-toastify";
import { RefreshCw, ClipboardList, ShieldAlert, CheckCircle2 } from "lucide-react";

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
    const intervalId = setInterval(() => {
      fetchBookings(true);
    }, 60000);
    return () => clearInterval(intervalId);
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
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-[#F7F7F7] font-sans selection:bg-[#FF7A00] selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-[96px] flex flex-col gap-[64px]">
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-[32px]">
           <div>
             <div className="flex items-center gap-3 mb-2">
               <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight">Status Transaksi</h1>
               <button 
                 onClick={() => fetchBookings(false)}
                 disabled={syncing}
                 className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#BDBDBD] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                 title="Perbarui Status Pesanan"
               >
                 <RefreshCw size={14} className={syncing ? 'animate-spin text-[#FF7A00]' : ''} />
               </button>
             </div>
             <p className="text-[16px] text-[#BDBDBD] font-light">
               Pantau status pemesanan, unggah bukti pembayaran, dan lihat detail operasional alat. 
               {lastSync && <span className="ml-2 px-2 py-0.5 rounded-full bg-[#151515] border border-white/5 text-[10px] uppercase font-mono tracking-wider">Sync: {lastSync}</span>}
             </p>
           </div>
         </header>

        {loading ? (
          <div className="flex flex-col gap-6">
             <div className="h-[200px] bg-[#151515] rounded-[24px] border border-white/5 animate-pulse" />
             <div className="h-[200px] bg-[#151515] rounded-[24px] border border-white/5 animate-pulse" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-[#151515] border border-white/5 py-[96px] rounded-[24px] text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
               <ClipboardList size={24} className="text-[#BDBDBD]" />
            </div>
            <h2 className="text-[24px] font-medium mb-2 text-white">Tidak Ada Transaksi Aktif</h2>
            <p className="text-[16px] text-[#BDBDBD] font-light max-w-[400px]">
               Seluruh riwayat penagihan, tagihan denda, serta status armada Anda akan muncul pada panel ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {bookings.map((b) => (
              <div key={b.id} className="bg-[#151515] border border-white/5 rounded-[24px] overflow-hidden">
                {/* Header card */}
                <div className="px-[32px] py-[24px] border-b border-white/5 bg-[#1D1D1D]/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                     <p className="text-[10px] text-[#BDBDBD] font-medium uppercase tracking-widest mb-1">Kode Operasional</p>
                     <span className="text-[16px] font-mono font-medium text-[#FF7A00]">{b.bookingNumber}</span>
                   </div>
                   <div>
                     <p className="text-[10px] text-[#BDBDBD] font-medium uppercase tracking-widest mb-1">Status Penugasan</p>
                     <span className="inline-flex px-3 py-1 bg-[#1A1A1A] border border-white/10 rounded-full text-[12px] font-medium uppercase tracking-wider text-white">
                        {b.status.replace(/_/g, ' ')}
                     </span>
                   </div>
                   <div className="md:text-right">
                     <p className="text-[10px] text-[#BDBDBD] font-medium uppercase tracking-widest mb-1">Biaya Kompetitif</p>
                     <span className="text-[20px] font-medium text-white">Rp {b.total_price.toLocaleString('id-ID')}</span>
                   </div>
                </div>

                <div className="p-[32px] grid grid-cols-1 md:grid-cols-2 gap-[48px]">
                   {/* Left Col: Details */}
                  <div>
                    <h4 className="text-[16px] font-medium text-white mb-6">Logistik & Jadwal</h4>
                    <div className="flex flex-col gap-4 text-[14px]">
                      <div className="flex gap-4 border-b border-white/5 pb-4">
                        <span className="text-[#BDBDBD] min-w-[140px]">Mobilisasi (Ambil):</span>
                        <span className="font-medium text-white">{new Date(b.start_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex gap-4 border-b border-white/5 pb-4">
                        <span className="text-[#BDBDBD] min-w-[140px]">Demobilisasi (Kembali):</span>
                        <span className="font-medium text-white">{new Date(b.end_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {b.items && b.items.length > 0 && (
                      <div className="mt-8">
                        <p className="text-[12px] font-medium text-[#BDBDBD] uppercase tracking-widest mb-4">Unit Yang Didapat:</p>
                        <div className="flex flex-wrap gap-2">
                          {b.items.map((it: any) => (
                            <div key={it.id} className="flex flex-col bg-[#1D1D1D] border border-white/5 px-4 py-2 rounded-[12px]">
                               <span className="text-[14px] font-medium text-white">{it.itemName}</span>
                               <code className="text-[#BDBDBD] text-[10px] mt-1 tracking-wider uppercase">{it.unitCode}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {b.penalties && b.penalties.length > 0 && (
                      <div className="mt-8 p-6 bg-red-500/5 sm:bg-transparent sm:border border-red-500/20 rounded-[16px]">
                        <p className="flex items-center gap-2 text-[12px] font-medium text-red-400 uppercase tracking-widest mb-4">
                          <ShieldAlert size={14} /> Tunggakan Denda Aktif
                        </p>
                        <div className="flex flex-col gap-3">
                          {b.penalties.map((pen: any) => (
                            <div key={pen.id} className="flex justify-between items-center text-[14px]">
                              <span className="text-white font-light">
                                {pen.reason} &bull; <strong className="font-medium ml-1">Rp {pen.amount.toLocaleString()}</strong>
                              </span>
                              <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full ${
                                pen.status === "paid" ? "bg-white/10 text-white" : "bg-[#FF7A00]/20 text-[#FF7A00]"
                              }`}>
                                {pen.status === "paid" ? "Lunas" : "Belum Lunas"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[12px] text-[#BDBDBD] font-light mt-4 pt-4 border-t border-white/5">
                          Segera selesaikan kewajiban di gerai kami (tunai/transfer) saat pengembalian peralatan.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Col: Actions & Status */}
                  <div className="flex flex-col">
                    {b.status === "waiting_payment" && (
                      <div className="bg-[#1D1D1D] border border-[#FF7A00]/20 p-[32px] rounded-[24px]">
                        <h4 className="flex items-center gap-2 text-[16px] font-medium text-[#FF7A00] mb-4">
                           Instruksi Pembayaran Mandiri
                        </h4>
                        <p className="text-[14px] text-[#BDBDBD] font-light leading-[1.6] mb-6">
                          Selesaikan transfer sebesar <strong className="text-white font-medium">Rp {b.total_price.toLocaleString('id-ID')}</strong> ke rekening resmi operasional kami:<br/><br/>
                          <span className="block p-4 bg-[#151515] border border-white/5 rounded-[12px] font-mono text-[14px] text-white">
                             BCA 1234 567 890<br/>
                             A.N. OUTRENT SYSTEM
                          </span>
                        </p>
                        
                        <form onSubmit={(e) => handleUploadPayment(e, b.id)} className="flex flex-col gap-4">
                          <div className="relative">
                            <input 
                              name="payment_proof" 
                              type="file" 
                              accept="image/*" 
                              required 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex items-center justify-center px-4 py-3 bg-[#151515] border border-white/10 rounded-[12px] text-[14px] text-[#BDBDBD] hover:text-white transition-colors cursor-pointer w-full text-center border-dashed">
                              Pilih Berkas Bukti Transfer
                            </div>
                          </div>
                          <button 
                            type="submit" 
                            disabled={uploadingFor === b.id}
                            className="bg-white text-black hover:bg-[#F7F7F7] px-6 py-3 rounded-[12px] text-[14px] font-medium transition-all cursor-pointer shadow flex justify-center disabled:opacity-50"
                          >
                            {uploadingFor === b.id ? "Mengotentikasi Salinan..." : "Konfirmasi Pembayaran"}
                          </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(b.id)}
                            className="w-full text-center text-[12px] font-medium tracking-wider uppercase hover:text-red-400 text-[#BDBDBD] transition-all cursor-pointer"
                          >
                            Batalkan Penugasan Ekspedisi Ini
                          </button>
                        </div>
                      </div>
                    )}

                    {(b.status === "payment_verified" || b.status === "ready_pickup" || b.status === "ongoing" || b.status === "completed" || b.status === "returned") && (
                      <div className="h-full border border-white/5 bg-[#151515] p-[32px] rounded-[24px] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-[#1D1D1D] border border-white/5 flex items-center justify-center mb-6">
                           <CheckCircle2 size={24} className="text-[#FF7A00]" />
                        </div>
                        <h4 className="text-[18px] font-medium text-white mb-2">Validasi Sistem Lulus</h4>
                        <p className="text-[14px] text-[#BDBDBD] font-light leading-[1.6]">
                          {b.status === "payment_verified" ? "Pembayaran sah dilindungi sistem. Menunggu persiapan unit." :
                           b.status === "ready_pickup" ? "Inventaris Anda telah ter-packing silakan mobilisasi dari gudang." :
                           b.status === "ongoing" ? "Penyewaan aktif. Peralatan telah diambil (mobilisasi sukses)." :
                           b.status === "returned" ? "Demobilisasi (kembali) berhasil dilakukan. Memverifikasi kelayakan fisik unit..." :
                           "Penyewaan selesai dan sukses dinilai sistem."}
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
