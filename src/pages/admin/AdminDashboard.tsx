import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import { useStore } from "../../store";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import { 
  ClipboardList, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Calendar, 
  User as UserIcon, 
  DollarSign, 
  BadgeAlert, 
  Wrench, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Clock, 
  CheckSquare, 
  Sliders, 
  TrendingUp,
  XCircle,
  PlusCircle,
  LogOut,
  Settings as SettingsIcon,
  Users,
  Building,
  Check,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  Trash2
} from "lucide-react";

export default function AdminDashboard() {
  const { token, user, logout } = useStore();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 10 Admin Menu Items state
  type AdminTab = 'dashboard' | 'inventory' | 'booking' | 'customer' | 'payment_verification' | 'reports' | 'maintenance' | 'damage_management' | 'demo_simulation' | 'settings';
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Data States
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [eventLogs, setEventLogs] = useState<any[]>([
    { type: "SISTEM", message: "Console Operasional Terhubung Secara Aman", timestamp: new Date().toISOString() },
    { type: "AUTH", message: `Admin ${user?.name || "Utama"} berhasil berotoritas`, timestamp: new Date().toISOString() }
  ]);

  // Interactive Dialog/Modal States
  const [penaltyBooking, setPenaltyBooking] = useState<any | null>(null);
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [penaltyReason, setPenaltyReason] = useState("Keterlambatan Pengembalian (1 Hari)");
  
  const [maintenanceUnit, setMaintenanceUnit] = useState<any | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [maintenanceStatus, setMaintenanceStatus] = useState("routine");

  const [selectedKtpImg, setSelectedKtpImg] = useState<string | null>(null);
  const [selectedProofImg, setSelectedProofImg] = useState<string | null>(null);

  // Damage Management UI States
  const [damageTingkat, setDamageTingkat] = useState<Record<string, string>>({});
  const [damageCatatan, setDamageCatatan] = useState<Record<string, string>>({});

  // Inventory Add Form Modal
  const [showAddInv, setShowAddInv] = useState(false);
  const [newInv, setNewInv] = useState({ categoryId: "", name: "", desc: "", price: "", codes: "" });

  // Customizable Settings State
  const [penaltyRate, setPenaltyRate] = useState("50000"); // Biaya Keterlambatan per Hari
  const [mainBranch, setMainBranch] = useState("Sembalun Utama"); // Cabang Utama
  const [requireVerify, setRequireVerify] = useState(true); // Wajib Verifikasi
  const [rentalDeposit, setRentalDeposit] = useState("100000"); // Jaminan Deposit default

  // Filtering reports state
  const [reportPeriod, setReportPeriod] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');

  // Fetch all administration databases
  const fetchData = async (isSilent = false) => {
    if (!isSilent) setSyncing(true);
    try {
      const authHeader = { headers: { Authorization: "Bearer " + token } };
      
      const [bookRes, userRes, invRes] = await Promise.all([
        fetch('/api/admin/bookings', authHeader),
        fetch('/api/admin/users', authHeader),
        fetch('/api/admin/inventory', authHeader)
      ]);

      let bookData: any = {};
      let userData: any = {};
      let invData: any = {};

      try { bookData = await bookRes.json(); } catch (e) {}
      try { userData = await userRes.json(); } catch (e) {}
      try { invData = await invRes.json(); } catch (e) {}

      setBookings(bookData.bookings || []);
      setUsers(userData.users || []);
      setInventoryItems(invData.items || []);
      setLastUpdated(new Date().toLocaleTimeString("id-ID"));
    } catch (err: any) {
      toast.error("Gagal memperbarui data operasional admin");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // Handle active tab change scroll to top
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();

    // Auto-refetch every 60 seconds
    const intervalId = setInterval(() => {
      fetchData(true);
    }, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [token]);

  // Push activity log locally so admin can see instant feed updates
  const addLocalLog = (type: string, message: string) => {
    setEventLogs(prev => [
      { type, message, timestamp: new Date().toISOString() },
      ...prev
    ].slice(0, 50));
  };

  // Operational state mutators
  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Gagal update status");
      
      const friendlyStatus = newStatus.replace(/_/g, ' ').toUpperCase();
      toast.success(`Booking dialihkan ke status: ${friendlyStatus}`);
      addLocalLog("BOOKING", `Transaksi #${id} dialihkan ke status ${friendlyStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status sewa");
    }
  };

  const handleVerifyUser = async (id: string, verify: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ is_verified: verify })
      });
      if (!res.ok) throw new Error("Gagal memproses verifikasi");
      
      if (verify) {
        toast.success("Dokumen identitas pelanggan disahkan!");
        addLocalLog("CUSTOMER", `User ID ${id} disahkan dokumen KTP-nya`);
      } else {
        toast.info("Verifikasi identitas ditolak");
        addLocalLog("CUSTOMER", `User ID ${id} ditolak dokumen KTP-nya`);
      }
      fetchData();
    } catch {
      toast.error("Gagal memproses aksi verifikasi");
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pelanggan "${name}"? Seluruh riwayat transaksi, pembayaran, denda, dan notifikasi terkait pelanggan ini akan dihapus secara permanen.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: "Bearer " + token
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus pelanggan");
      
      toast.success(`Pelanggan "${name}" berhasil dihapus.`);
      addLocalLog("CUSTOMER", `Pelanggan "${name}" (ID: ${id}) ditiadakan dari sistem`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses penghapusan pelanggan");
    }
  };

  const handleUpdateUnitStatus = async (unitId: string, status: string, condition?: string) => {
    try {
      const res = await fetch(`/api/admin/inventory/units/${unitId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ status, condition })
      });
      if (!res.ok) throw new Error("Gagal");
      toast.success(`Unit ${unitId} berhasil diubah ke status: ${status}`);
      addLocalLog("INVENTORI", `Unit #${unitId} diupdate kondisi ke ${condition || status}`);
      fetchData();
    } catch {
      toast.error("Gagal memperbarui status unit");
    }
  };

  const handleDamageDecision = async (unitId: string, decisionStatus: string, tingkat: string, catatan: string) => {
    try {
      const formatLevel = tingkat || "Ringan";
      const formatNote = catatan || "Tidak ada catatan detail";
      const formattedCondition = `${formatLevel} - ${formatNote}`;
      
      const res = await fetch(`/api/admin/inventory/units/${unitId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ status: decisionStatus, condition: formattedCondition })
      });
      if (!res.ok) throw new Error("Gagal");
      
      // Automatically post a maintenance log entry on repair transition for realistic data tracing
      if (decisionStatus === "maintenance") {
        await fetch("/api/admin/inventory/maintenance", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({
            unitId,
            status: "repair",
            notes: `Perbaikan kerusakan ${formatLevel}: ${formatNote}`,
            cost: formatLevel === "Ringan" ? 50000 : formatLevel === "Sedang" ? 150000 : 350000
          })
        });
      }

      toast.success(`Unit dialihkan ke status: ${decisionStatus}`);
      addLocalLog("DAMAGE_CONTROL", `Unit #${unitId} dikonfigurasi ke ${decisionStatus.toUpperCase()} [Kerusakan: ${formatLevel}]`);
      fetchData();
    } catch {
      toast.error("Gagal memproses keputusan penanganan barang rusak");
    }
  };

  // Submit manual penalty/denda
  const handleAssignPenalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!penaltyBooking || !penaltyAmount) return;

    try {
      const res = await fetch(`/api/admin/bookings/${penaltyBooking.id}/penalty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          amount: penaltyAmount,
          reason: penaltyReason
        })
      });
      if (!res.ok) throw new Error("Gagal");
      
      const formattedAmount = parseInt(penaltyAmount).toLocaleString("id-ID");
      toast.success(`Denda sebesar Rp ${formattedAmount} dibebankan pada #${penaltyBooking.bookingNumber}`);
      addLocalLog("PENALTY", `Denda Rp ${formattedAmount} dibebankan ke #${penaltyBooking.bookingNumber} (${penaltyReason})`);
      
      setPenaltyBooking(null);
      setPenaltyAmount("");
      fetchData();
    } catch {
      toast.error("Gagal membebankan denda");
    }
  };

  // Settle penalty/denda
  const handlePayPenalty = async (bookingId: string, penaltyId: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/penalty/${penaltyId}/pay`, {
        method: 'POST',
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) throw new Error("Gagal verifikasi pembayaran denda");
      
      toast.success("Denda berhasil ditandai telah lunas.");
      addLocalLog("PENALTY", `Settle denda #${penaltyId} pada booking #${bookingId} LUNAS`);
      fetchData();
    } catch {
      toast.error("Gagal memverifikasi denda");
    }
  };

  // Submit Maintenance Task
  const handleLogMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceUnit) return;

    try {
      const res = await fetch(`/api/admin/inventory/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          unitId: maintenanceUnit.id,
          status: maintenanceStatus,
          notes: maintenanceNotes,
          cost: maintenanceCost || "0"
        })
      });
      if (!res.ok) throw new Error("Gagal");
      
      toast.success(`Unit ${maintenanceUnit.unitCode} sukses masuk program perawatan.`);
      addLocalLog("MAINTENANCE", `Unit ${maintenanceUnit.unitCode} masuk status ${maintenanceStatus}. Biaya: Rp ${parseInt(maintenanceCost || "0").toLocaleString()}`);
      
      setMaintenanceUnit(null);
      setMaintenanceNotes("");
      setMaintenanceCost("");
      fetchData();
    } catch {
      toast.error("Gagal memproses pemeliharaan");
    }
  };

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const codeArr = newInv.codes.split(",").map(s => s.trim()).filter(Boolean);
      if (codeArr.length === 0) return toast.error("Minimal satu unit code dibutuhkan");

      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          categoryId: newInv.categoryId,
          name: newInv.name,
          description: newInv.desc,
          pricePerDay: newInv.price,
          unitCodes: codeArr
        })
      });
      if (!res.ok) throw new Error("Gagal");
      
      toast.success(`Katalog "${newInv.name}" sukses ditambahkan dengan ${codeArr.length} unit`);
      addLocalLog("INVENTORI", `Tambah katalog baru: ${newInv.name} (${codeArr.join(", ")})`);
      
      setShowAddInv(false);
      setNewInv({ categoryId: "", name: "", desc: "", price: "", codes: "" });
      fetchData();
    } catch {
      toast.error("Gagal menambahkan barang inventaris");
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menyetel ulang database demo? Tindakan ini akan mengembalikan sample data awal tanpa merusak akun pemilik usaha asli.")) return;
    try {
      const res = await fetch("/api/sync/reset", { method: "POST" });
      if (!res.ok) throw new Error("Gagal mereset database");
      
      toast.info("Database demo berhasil diatur ulang!");
      addLocalLog("SISTEM", "Database disinkronisasi ke bentuk awal (Reseed)");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengatur ulang database");
    }
  };

  // Simulates a random live booking event
  const simulateRandomBooking = () => {
    const randomId = "BK" + Math.floor(100 + Math.random() * 900);
    const names = ["Andi Wijaya", "Budi Santoso", "Citra Kirana", "Dian Sastro", "Eko Prasetyo"];
    const itemsList = ["2x Tenda Dome Premium", "1x Carrier Deuter 60L", "3x Matras Spon + SB Polar"];
    
    const randomBooking = {
      id: Math.floor(Math.random() * 10000).toString(),
      bookingNumber: randomId,
      customer_name: names[Math.floor(Math.random() * names.length)],
      customer_email: "dummy." + Math.floor(Math.random() * 99) + "@domain.com",
      created_at: new Date().toISOString(),
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      total_price: 250000 + Math.floor(Math.random() * 5) * 50000,
      status: "payment_verified",
      items: [
        { id: "sim-" + Math.random(), itemName: itemsList[Math.floor(Math.random() * itemsList.length)], unitCode: "UNT-SIM-9" }
      ],
      payments: [
        { id: "pay-sim", proofUrl: "dummy-proof.jpg" }
      ],
      penalties: []
    };

    setBookings(prev => [randomBooking, ...prev]);
    toast.success(`[Simulasi] Transaksi baru ${randomId} terbuat!`);
    addLocalLog("SIMULASI", `Simulasi transaksi baru ${randomId} oleh ${randomBooking.customer_name}`);
  };

  // Simulates a random new customer registration
  const simulateRandomCustomer = () => {
    const names = ["Fajar Nugros", "Gita Savitri", "Heri Setiawan", "Indah Permata"];
    const randomUser = {
      id: Math.floor(Math.random() * 1000).toString(),
      name: names[Math.floor(Math.random() * names.length)],
      email: names[Math.floor(Math.random() * names.length)].toLowerCase().replace(/\s+/g, '') + "@gmail.com",
      isVerified: false,
      identityUrl: "sample_ktp.jpg",
      isDemo: true
    };

    setUsers(prev => [randomUser, ...prev]);
    toast.info(`[Simulasi] Registrasi Pelanggan baru: ${randomUser.name}`);
    addLocalLog("SIMULASI", `Simulasi pendaftaran pelanggan baru: ${randomUser.name} dengan jaminan KTP`);
  };

  const handleLogoutAction = () => {
    toast.success("Berhasil keluar dari konsol operasional");
    logout();
  };

  // Derive counts for real-time stats
  const pendingPaymentsNum = bookings.filter(b => b.status === 'payment_verified' || b.status === "waiting_payment").length;
  const activeVerificationsNum = users.filter(u => !u.isVerified && u.identityUrl).length;
  const criticalStockNum = inventoryItems.filter(item => {
    const avail = item.units?.filter((u: any) => u.status === "available").length || 0;
    return avail <= 1;
  }).length;
  const totalInMaintenance = inventoryItems.reduce((acc, item) => {
    return acc + (item.units?.filter((u: any) => u.status === "maintenance").length || 0);
  }, 0);
  const totalDamaged = inventoryItems.reduce((acc, item) => {
    return acc + (item.units?.filter((u: any) => u.status === "damaged").length || 0);
  }, 0);

  // Derive Reports summary calculations
  const validBookings = bookings.filter(b => b.status !== "cancelled");
  const totalBookingCount = validBookings.length;
  const totalRevenue = validBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const avgTicketSize = totalBookingCount > 0 ? Math.round(totalRevenue / totalBookingCount) : 0;
  const delayCount = bookings.filter(b => b.status === "penalty" || (b.penalties && b.penalties.some((p: any) => p.status === "unpaid"))).length;

  // Derive Report Table according to Period filter
  const getFilteredReportBookings = () => {
    const sorted = [...validBookings].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (reportPeriod === 'harian') {
      // simulate filter to today roughly
      return sorted.slice(0, 4);
    } else if (reportPeriod === 'mingguan') {
      return sorted.slice(0, 10);
    }
    return sorted;
  };

  const reportsList = getFilteredReportBookings();

  const downloadPDFReport = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Colors
      const primaryColor = [18, 18, 18]; // #121212 (Charcoal Black)
      const accentColor = [255, 85, 0]; // #FF7A00 (Orange)
      const textDark = [31, 41, 55]; // #1f2937
      const textLight = [156, 163, 175]; // #9ca3af

      // Header Brand
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 42, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("OUTRENT OUTDOOR SYSTEMS", 15, 17);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Laporan Ringkasan Pendapatan & Log Buku Transaksi Utama", 15, 24);
      doc.text(`Periode Saringan: ${reportPeriod === "harian" ? "Hari Ini (Filtered)" : reportPeriod === "mingguan" ? "Minggu Ini" : "Bulan Ini"}`, 15, 29);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID")}`, 15, 34);

      // Metrik Ringkasan
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("RINGKASAN OPERASIONAL & KEUANGAN OUTLET", 15, 54);

      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.setLineWidth(0.5);
      doc.line(15, 57, 195, 57);

      // Draw Grid Statistics cells
      doc.setFillColor(242, 245, 242);
      doc.rect(15, 62, 85, 22, "F");
      doc.rect(110, 62, 85, 22, "F");
      doc.rect(15, 89, 85, 22, "F");
      doc.rect(110, 89, 85, 22, "F");

      // Metrics Texts
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(110, 110, 110);
      doc.text("VOLUME TRANSAKSI AKTIF", 20, 68);
      doc.text("TOTAL OMZET PENDAPATAN", 115, 68);
      doc.text("RATA-RATA TRANSAKSI", 20, 95);
      doc.text("INDIKASI PENALTY/DENDA", 115, 95);

      doc.setFontSize(12.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`${totalBookingCount} Kali Sewa`, 20, 76);
      doc.text(`Rp ${totalRevenue.toLocaleString("id-ID")}`, 115, 76);
      doc.text(`Rp ${avgTicketSize.toLocaleString("id-ID")}`, 20, 103);
      doc.text(`${delayCount} Kasus Terlambat`, 115, 103);

      // Line logs
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`TABEL RINCIAN LOG TRANSAKSI (${reportPeriod.toUpperCase()})`, 15, 124);
      doc.line(15, 127, 195, 127);

      // Table Header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, 133, 180, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("Kode Booking", 18, 138.5);
      doc.text("Nama Pelanggan", 52, 138.5);
      doc.text("Mulai / Selesai Sewa", 102, 138.5);
      doc.text("Status", 152, 138.5);
      doc.text("Total Rute", 178, 138.5);

      // Table Body
      let startY = 147;
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont("helvetica", "normal");
      
      if (reportsList.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.text("Belum ada transaksi di rentang waktu terpilih", 20, startY + 2);
      } else {
        reportsList.forEach((rep, idx) => {
          // Zebra striping
          if (idx % 2 === 1) {
            doc.setFillColor(248, 248, 246);
            doc.rect(15, startY - 4.5, 180, 7.5, "F");
          }
          
          doc.setFont("helvetica", "bold");
          doc.text(String(rep.bookingNumber || `ORD-00${idx+1}`), 18, startY);
          doc.setFont("helvetica", "normal");
          
          const custName = String(rep.user?.name || rep.customer_name || rep.custName || "Pelanggan");
          doc.text(custName.length > 22 ? custName.substring(0, 20) + ".." : custName, 52, startY);
          
          const dateStr = `${new Date(rep.startDate || rep.start_date || rep.start).toLocaleDateString("id-ID")} - ${new Date(rep.endDate || rep.end_date || rep.end).toLocaleDateString("id-ID")}`;
          doc.text(dateStr, 102, startY);
          
          doc.text(String(rep.status).toUpperCase(), 152, startY);
          
          const priceNum = rep.totalPrice || rep.total_price || rep.total || 0;
          doc.text(`Rp ${priceNum.toLocaleString("id-ID")}`, 178, startY);
          
          startY += 7.5;
        });
      }

      // Signature/Footer area
      doc.setFontSize(8);
      doc.setTextColor(textLight[0], textLight[1], textLight[2]);
      doc.text("Outrent Systems Cloud Platform Auto Report & Laporan Terkomputasi &bull; Dokumen valid tanpa tanda tangan fisik.", 15, 280);

      doc.save(`OUTRENT_Laporan_${reportPeriod}_${new Date().toISOString().substring(0,10)}.pdf`);
      toast.success("Laporan PDF berhasil diunduh ke komputer Anda!");
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal mengekspor PDF: " + err.message);
    }
  };

  // Navigation Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'inventory', label: 'Inventory', icon: Layers },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'customer', label: 'Customer', icon: Users },
    { id: 'payment_verification', label: 'Payment Verif', icon: CreditCard, badge: pendingPaymentsNum > 0 ? pendingPaymentsNum : undefined },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, badge: totalInMaintenance > 0 ? totalInMaintenance : undefined },
    { id: 'damage_management', label: 'Damage Inventory', icon: AlertCircle, badge: totalDamaged > 0 ? totalDamaged : undefined },
    { id: 'demo_simulation', label: 'Demo Simulation', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0B0B0B] text-[#F7F7F7] font-sans antialiased overflow-hidden">
      <div className="shrink-0 z-50">
        <Navbar />
      </div>

      {/* Screen Container with Sidebar and Content Panel */}
      <div className="flex-1 flex flex-col lg:flex-row w-full relative overflow-hidden">
        
        {/* Left Fixed Sidebar - Desktop (or Toggleable side-drawer in Mobile) */}
        <aside className={`
          absolute lg:relative inset-y-0 left-0 z-40 w-64 h-full bg-[#151515] border-r border-[#1D1D1D] p-5 flex flex-col justify-between overflow-y-auto
          transition-transform lg:translate-x-0 duration-300 ease-in-out shrink-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="space-y-8">
            
            {/* Owner/Business metadata badge inside sidebar */}
            <div className="bg-[#0B0B0B] border border-[#1D1D1D] p-5 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#BDBDBD]">
                  {user?.isDemo ? "DEMO MODE" : "SYSTEM ONLINE"}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#F7F7F7] truncate">{user?.name || "Administrator"}</p>
                <p className="text-[11px] text-[#BDBDBD] truncate">{user?.email}</p>
              </div>
            </div>

            {/* Menu Items List */}
            <nav className="space-y-2" aria-label="Sidebar Navigation">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as AdminTab);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer select-none
                      ${isActive 
                        ? 'bg-[#1D1D1D] text-[#F7F7F7] shadow-sm' 
                        : 'text-[#BDBDBD] hover:bg-[#0B0B0B] hover:text-[#F7F7F7]'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? "text-[#F7F7F7]" : "text-[#BDBDBD]"} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#F7F7F7] text-[#0B0B0B]' : 'bg-[#1D1D1D] text-[#F7F7F7]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-[#1D1D1D]">
                <button
                  onClick={handleLogoutAction}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer select-none"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Footer inside sidebar */}
          <div className="pt-6 border-t border-[#1D1D1D] text-[10px] text-[#BDBDBD] font-mono flex flex-col gap-1 select-none opacity-60">
            <p>V1.5.0 &bull; ONLINE</p>
            <p>OUTRENT ADMIN</p>
          </div>
        </aside>

        {/* Mobile Subheader Navigation Header bar */}
        <div className="lg:hidden shrink-0 w-full bg-[#151515] border-b border-[#1D1D1D] px-4 py-3 flex justify-between items-center z-30 select-none shadow-sm absolute top-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#F7F7F7] bg-[#1D1D1D] rounded-lg focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#BDBDBD] flex items-center gap-2">
            Control Center: <b className="text-[#F7F7F7]">{menuItems.find(m => m.id === activeTab)?.label}</b>
          </span>

          <button 
            onClick={() => fetchData()}
            disabled={syncing}
            className="p-2 text-[#F7F7F7] bg-[#1D1D1D] rounded-lg flex items-center cursor-pointer"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin text-[#F7F7F7]" : ""} />
          </button>
        </div>

        {/* Dark overlay for sliding menu in mobile */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#0B0B0B]/80 z-30 lg:hidden transition-opacity"
          />
        )}

        {/* Primary Operational Content Window */}
        <main ref={mainRef} className="flex-1 p-5 md:p-10 space-y-8 overflow-y-auto w-full bg-[#0B0B0B] text-[#F7F7F7] lg:pt-10 pt-20">
          
          {/* Top Info Ribbon */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1D1D1D] pb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#F7F7F7] tracking-tight">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-[#BDBDBD] mt-1 font-mono uppercase tracking-widest">
                Last Sync: {lastUpdated || "Connecting..."}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => fetchData()}
                disabled={syncing}
                className="px-4 py-2.5 text-xs font-semibold bg-[#151515] hover:bg-[#1D1D1D] text-[#F7F7F7] rounded-xl border border-[#1D1D1D] transition-colors flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                {syncing ? "Syncing..." : "Refresh"}
              </button>
              
              {activeTab === 'reports' && (
                <button 
                  onClick={downloadPDFReport}
                  className="px-4 py-2.5 text-xs font-semibold bg-[#F7F7F7] text-[#0B0B0B] hover:bg-[#E0E0E0] rounded-xl transition-colors flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                >
                  <FileText size={14} />
                  Export PDF
                </button>
              )}
            </div>
          </div>

          {/* LOADING STATE PLACEHOLDER */}
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#151515]/40 border border-white/10/80 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-6 animate-pulse">
                  <div className="flex-1 space-y-4">
                    <div className="h-4 w-1/4 bg-neutral-800 rounded"></div>
                    <div className="h-6 w-1/3 bg-neutral-800 rounded"></div>
                    <div className="h-4 w-1/2 bg-neutral-800 rounded"></div>
                  </div>
                  <div className="w-32 h-10 bg-neutral-800 rounded-xl shrink-0"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* ------------------ MENU 1: DASHBOARD CONTENT ------------------ */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Performance Bento Grid */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 font-sans">
                    <div 
                      onClick={() => setActiveTab('customer')}
                      className="group bg-[#151515] border border-[#1D1D1D] hover:border-[#F7F7F7]/20 p-6 rounded-2xl transition-all cursor-pointer shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldCheck size={64} />
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold text-[#BDBDBD] uppercase tracking-widest leading-relaxed block w-24">Verifikasi KTP</span>
                        <div className="bg-[#1D1D1D] p-2 rounded-lg text-[#F7F7F7]">
                          <ShieldCheck size={18} />
                        </div>
                      </div>
                      <p className="text-4xl font-bold text-[#F7F7F7] mt-6">{activeVerificationsNum}</p>
                      <p className="text-xs text-[#BDBDBD] mt-2">Menunggu persetujuan</p>
                    </div>

                    <div 
                      onClick={() => setActiveTab('payment_verification')}
                      className="group bg-[#151515] border border-[#1D1D1D] hover:border-[#F7F7F7]/20 p-6 rounded-2xl transition-all cursor-pointer shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CreditCard size={64} />
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold text-[#BDBDBD] uppercase tracking-widest leading-relaxed block w-24">Cek Pembayaran</span>
                        <div className="bg-[#1D1D1D] p-2 rounded-lg text-[#F7F7F7]">
                          <CreditCard size={18} />
                        </div>
                      </div>
                      <p className="text-4xl font-bold text-[#F7F7F7] mt-6">{pendingPaymentsNum}</p>
                      <p className="text-xs text-[#BDBDBD] mt-2">Bukti transfer masuk</p>
                    </div>

                    <div 
                      onClick={() => setActiveTab('inventory')}
                      className="group bg-[#151515] border border-[#1D1D1D] hover:border-[#F7F7F7]/20 p-6 rounded-2xl transition-all cursor-pointer shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Layers size={64} />
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold text-[#BDBDBD] uppercase tracking-widest leading-relaxed block w-24">Stok Kritis</span>
                        <div className={`p-2 rounded-lg ${criticalStockNum > 0 ? 'bg-red-500/10 text-red-400' : 'bg-[#1D1D1D] text-[#F7F7F7]'}`}>
                          <Layers size={18} />
                        </div>
                      </div>
                      <p className="text-4xl font-bold text-[#F7F7F7] mt-6">{criticalStockNum}</p>
                      <p className="text-xs text-[#BDBDBD] mt-2">Unit tersedia ≤ 1</p>
                    </div>

                    <div 
                      onClick={() => setActiveTab('maintenance')}
                      className="group bg-[#151515] border border-[#1D1D1D] hover:border-[#F7F7F7]/20 p-6 rounded-2xl transition-all cursor-pointer shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wrench size={64} />
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold text-[#BDBDBD] uppercase tracking-widest leading-relaxed block w-24">Dalam Perawatan</span>
                        <div className="bg-[#1D1D1D] p-2 rounded-lg text-[#F7F7F7]">
                          <Wrench size={18} />
                        </div>
                      </div>
                      <p className="text-4xl font-bold text-[#F7F7F7] mt-6">{totalInMaintenance}</p>
                      <p className="text-xs text-[#BDBDBD] mt-2">Sedang diperbaiki</p>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Visual Line Chart representing income */}
                    <div className="xl:col-span-2 bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h3 className="text-sm font-bold text-[#F7F7F7] uppercase tracking-widest font-mono">Revenue Trend</h3>
                          <p className="text-xs text-[#BDBDBD] mt-1">Simulasi grafik pendapatan 30 hari terakhir</p>
                        </div>
                        <span className="text-[11px] bg-[#1D1D1D] text-[#BDBDBD] px-3 py-1 rounded-full font-semibold">IDR (Ribuan)</span>
                      </div>
                      
                      <div className="relative h-56 flex flex-col justify-end">
                        <div className="absolute inset-x-0 top-0 border-t border-[#1D1D1D]" />
                        <div className="absolute inset-x-0 top-1/3 border-t border-[#1D1D1D]" />
                        <div className="absolute inset-x-0 top-2/3 border-t border-[#1D1D1D]" />
                        <div className="absolute inset-x-0 bottom-6 border-t border-[#1D1D1D]" />
                        
                        {/* Line Graph SVG */}
                        <svg className="w-full h-44 z-10" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <path
                            d="M0,35 Q15,20 30,28 T60,15 T90,8 T100,2"
                            fill="none"
                            stroke="#F7F7F7"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                          />
                          <path
                            d="M0,35 Q15,20 30,28 T60,15 T90,8 T100,2 L100,40 L0,40 Z"
                            fill="url(#trend-gradient)"
                            opacity="0.15"
                          />
                          <defs>
                            <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F7F7F7" />
                              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                        </svg>
                        
                        {/* X-axis indicators */}
                        <div className="flex justify-between text-[10px] text-[#BDBDBD] font-mono mt-4 select-none uppercase">
                          <span>Minggu 1</span>
                          <span>Minggu 2</span>
                          <span>Minggu 3</span>
                          <span>Minggu 4</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Overview summary metrics */}
                    <div className="bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-sm font-bold text-[#F7F7F7] uppercase tracking-widest flex items-center gap-2 mb-8 font-mono">
                          <Activity size={16} className="text-[#BDBDBD]" /> Business Summary
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <span className="text-[11px] text-[#BDBDBD] uppercase tracking-widest block font-bold mb-1">Total Users</span>
                            <span className="text-2xl font-bold text-[#F7F7F7]">{users.length}</span>
                          </div>
                          <div className="border-t border-[#1D1D1D] pt-6">
                            <span className="text-[11px] text-[#BDBDBD] uppercase tracking-widest block font-bold mb-1">Total Bookings</span>
                            <span className="text-2xl font-bold text-[#F7F7F7]">{bookings.length}</span>
                          </div>
                          <div className="border-t border-[#1D1D1D] pt-6">
                            <span className="text-[11px] text-[#BDBDBD] uppercase tracking-widest block font-bold mb-1">Total Revenue</span>
                            <span className="text-2xl font-bold text-[#F7F7F7]">Rp {totalRevenue.toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveTab('reports')}
                        className="w-full mt-8 py-3 bg-[#1D1D1D] hover:bg-[#2A2A2A] text-[#F7F7F7] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        View Full Reports
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------ MENU 2: INVENTORY CATALOG CONTENT ------------------ */}
              {activeTab === 'inventory' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-[#151515] border border-[#1D1D1D] rounded-3xl p-8">
                    <div>
                      <h3 className="text-lg font-bold text-[#F7F7F7] tracking-tight">Inventory Catalog</h3>
                      <p className="text-sm text-[#BDBDBD] mt-1">Manage physical gear and track asset condition.</p>
                    </div>
                    <button 
                      onClick={() => setShowAddInv(true)} 
                      className="px-6 py-3 bg-[#F7F7F7] hover:bg-[#E0E0E0] text-[#0B0B0B] font-bold text-sm rounded-xl transition-colors cursor-pointer select-none shadow-sm flex items-center gap-2"
                    >
                      <PlusCircle size={16} />
                      Add Product
                    </button>
                  </div>

                  {inventoryItems.length === 0 ? (
                    <div className="bg-[#151515] border border-[#1D1D1D] p-16 text-center rounded-3xl text-[#BDBDBD] text-sm">
                      Empty inventory catalog.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {inventoryItems.map((item) => (
                        <div key={item.id} className="bg-[#151515] border border-[#1D1D1D] rounded-3xl p-6 flex flex-col">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h4 className="font-bold text-[#F7F7F7] text-lg leading-tight">{item.name}</h4>
                              <p className="text-xs text-[#BDBDBD] mt-1">
                                Category: {item.category?.name || "Gear"} &bull; Rp {item.pricePerDay?.toLocaleString("id-ID")} / day
                              </p>
                            </div>
                            <span className="text-[10px] bg-[#1D1D1D] text-[#BDBDBD] px-2 py-1 rounded font-mono uppercase">ID: {item.id.substring(0,6)}</span>
                          </div>

                          <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-72">
                            {item.units?.map((unit: any) => (
                              <div 
                                key={unit.id} 
                                className="bg-[#0B0B0B] p-4 rounded-2xl border border-[#1D1D1D] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                              >
                                <div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-bold text-[#F7F7F7]">
                                      {unit.unitCode}
                                    </span>
                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] uppercase tracking-widest font-bold ${
                                      unit.status === "available"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : unit.status === "maintenance"
                                        ? "bg-blue-500/10 text-blue-400"
                                        : unit.status === "rented"
                                        ? "bg-purple-500/10 text-purple-400"
                                        : "bg-red-500/10 text-red-500"
                                    }`}>
                                      {unit.status}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#BDBDBD] mt-1 truncate max-w-[200px]">
                                    Condition: {unit.condition || "Optimal"}
                                  </p>
                                </div>

                                <div className="flex gap-2">
                                  {unit.status !== "available" && (
                                    <button
                                      title="Mark Ready"
                                      onClick={() => handleUpdateUnitStatus(unit.id, "available", "Optimal")}
                                      className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <CheckCircle2 size={14} />
                                    </button>
                                  )}
                                  {unit.status !== "maintenance" && (
                                    <button
                                      title="Send to Maintenance"
                                      onClick={() => setMaintenanceUnit(unit)}
                                      className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <Wrench size={14} />
                                    </button>
                                  )}
                                  {unit.status !== "damaged" && (
                                    <button
                                      title="Mark Damaged"
                                      onClick={() => handleUpdateUnitStatus(unit.id, "damaged", "Reported Damage")}
                                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <AlertCircle size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ------------------ MENU 3: BOOKINGS LIST CONTENT ------------------ */}
              {activeTab === 'booking' && (
                <div className="space-y-8">
                  <div className="bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-[#F7F7F7] tracking-tight">Active Bookings & Logistics</h3>
                    <p className="text-sm text-[#BDBDBD] mt-2">Manage ongoing rentals, inspect returned gear, and apply penalties if necessary.</p>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="bg-[#151515] border border-[#1D1D1D] p-16 text-center rounded-3xl text-[#BDBDBD] text-sm">
                      No active bookings in the system right now.
                    </div>
                  ) : (
                    <div className="space-y-6">
                    {bookings.map((b) => (
                      <div 
                        key={b.id} 
                        className="bg-[#151515] rounded-3xl border border-[#1D1D1D] p-8 flex flex-col lg:flex-row gap-8 justify-between items-start shadow-sm"
                      >
                        <div className="space-y-6 flex-1 w-full">
                          
                          {/* Heading Number status */}
                          <div className="flex flex-wrap items-center gap-4 border-b border-[#1D1D1D] pb-6">
                            <span className="font-mono font-bold text-[#F7F7F7] bg-[#0B0B0B] border border-[#1D1D1D] px-4 py-1.5 rounded-lg text-sm">
                              {b.bookingNumber}
                            </span>
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold border ${
                              b.status === "completed" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : b.status === "cancelled" 
                                ? "bg-stone-500/10 text-[#BDBDBD] border-neutral-500/20" 
                                : b.status === "penalty" || (b.penalties && b.penalties.some((p: any) => p.status === "unpaid"))
                                ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
                                : "bg-[#F7F7F7] text-[#0B0B0B] border-[#F7F7F7]"
                            }`}>
                              {b.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-[#BDBDBD] font-mono ml-auto">
                              {new Date(b.created_at || b.created).toLocaleDateString("id-ID")}
                            </span>
                          </div>

                          {/* Customer Bio */}
                          <div className="space-y-2">
                            <p className="font-bold text-[#F7F7F7] text-lg">
                              {b.customer_name || b.custName} <span className="text-[#BDBDBD] font-normal text-sm font-mono ml-2">({b.customer_email || b.custId})</span>
                            </p>
                            <div className="text-xs text-[#BDBDBD] flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                              <span>Start: <b className="text-[#F7F7F7] font-semibold">{new Date(b.start_date || b.start).toLocaleDateString("id-ID")}</b></span>
                              <span>End: <b className="text-[#F7F7F7] font-semibold">{new Date(b.end_date || b.end).toLocaleDateString("id-ID")}</b></span>
                              <span className="bg-[#0B0B0B] border border-[#1D1D1D] px-3 py-1 rounded-md">Total: <b className="text-[#F7F7F7] font-bold">Rp {b.total_price?.toLocaleString("id-ID") || b.total?.toLocaleString("id-ID")}</b></span>
                            </div>
                            {b.note && (
                              <div className="mt-4 bg-[#0B0B0B] border border-[#1D1D1D] p-4 rounded-xl">
                                <p className="text-xs text-[#BDBDBD] italic">
                                  Notes: {b.note}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Items rented list representation */}
                          <div className="pt-6 border-t border-[#1D1D1D]">
                            <p className="text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-4">Rented Equipment:</p>
                            <div className="flex flex-wrap gap-3">
                              {typeof b.items === 'string' ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B0B0B] border border-[#1D1D1D] rounded-xl text-xs text-[#F7F7F7] font-medium shadow-sm">
                                  {b.items}
                                </span>
                              ) : (
                                b.items?.map((bi: any) => (
                                  <span 
                                    key={bi.id} 
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B0B0B] border border-[#1D1D1D] rounded-xl text-xs text-[#F7F7F7] font-medium shadow-sm"
                                  >
                                    {bi.itemName} {bi.unitCode && <code className="text-[#BDBDBD] font-bold text-[10px] font-mono ml-1 bg-[#151515] px-1.5 py-0.5 rounded">[{bi.unitCode}]</code>}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Denda lists block */}
                          {b.penalties && b.penalties.length > 0 && (
                            <div className="mt-6 bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <BadgeAlert size={14} /> ACTIVE PENALTIES
                              </p>
                              <div className="space-y-3">
                                {b.penalties.map((p: any) => (
                                  <div key={p.id} className="flex justify-between items-center text-xs bg-[#0B0B0B] px-4 py-2 rounded-xl border border-[#1D1D1D]">
                                    <span className="text-[#BDBDBD]">
                                      {p.reason} <b className="text-[#F7F7F7] ml-2 font-mono">Rp {p.amount.toLocaleString("id-ID")}</b>
                                    </span>
                                    {p.status === "paid" ? (
                                      <span className="text-emerald-400 font-bold font-mono text-[10px] bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">PAID</span>
                                    ) : (
                                      <button
                                        onClick={() => handlePayPenalty(b.id, p.id)}
                                        className="px-3 py-1.5 bg-[#F7F7F7] text-[#0B0B0B] hover:bg-[#E0E0E0] rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                                      >
                                        Verify Payment
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Custom Control actions flow */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-56 border-t lg:border-t-0 border-[#1D1D1D] pt-6 lg:pt-0 lg:pl-6 shrink-0 lg:border-l">
                          {b.status === 'payment_verified' && (
                            <button 
                              onClick={() => updateBookingStatus(b.id, 'ready_pickup')} 
                              className="w-full px-5 py-3.5 bg-[#F7F7F7] hover:bg-[#E0E0E0] text-[#0B0B0B] rounded-xl text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-2 shrink-0"
                            >
                              <CheckCircle2 size={16} /> Prepare Gear
                            </button>
                          )}
                          {b.status === 'ready_pickup' && (
                            <button 
                              onClick={() => updateBookingStatus(b.id, 'ongoing')} 
                              className="w-full px-5 py-3.5 bg-[#F7F7F7] hover:bg-[#E0E0E0] text-[#0B0B0B] rounded-xl text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-2 shrink-0"
                            >
                              Handover to User
                            </button>
                          )}
                          {b.status === 'ongoing' && (
                            <div className="flex flex-col gap-3 w-full">
                              <button 
                                onClick={() => updateBookingStatus(b.id, 'returned')} 
                                className="w-full px-5 py-3.5 bg-[#0B0B0B] hover:bg-[#1D1D1D] text-[#F7F7F7] border border-[#1D1D1D] rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                              >
                                Mark as Returned
                              </button>
                              <button 
                                onClick={() => setPenaltyBooking(b)} 
                                className="w-full px-5 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                              >
                                <AlertCircle size={14} /> Log Penalty
                              </button>
                            </div>
                          )}
                          {b.status === 'returned' && (
                            <div className="flex flex-col gap-3 w-full">
                              <button 
                                onClick={() => updateBookingStatus(b.id, 'completed')} 
                                className="w-full px-5 py-3.5 bg-[#F7F7F7] text-[#0B0B0B] hover:bg-[#E0E0E0] rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                              >
                                Close Transaction
                              </button>
                              <button 
                                onClick={() => setPenaltyBooking(b)} 
                                className="w-full px-5 py-3.5 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                              >
                                Log Penalty
                              </button>
                            </div>
                          )}
                          
                          {/* Helpful Info label text */}
                          {b.status === 'completed' && (
                            <div className="bg-[#0B0B0B] border border-[#1D1D1D] p-3 rounded-xl flex items-center justify-center gap-2">
                              <CheckCircle2 size={16} className="text-emerald-500" />
                              <span className="text-xs text-[#BDBDBD] font-bold">Transaction Closed</span>
                            </div>
                          )}
                          {b.status === 'cancelled' && (
                            <div className="bg-[#0B0B0B] border border-[#1D1D1D] p-3 rounded-xl flex items-center justify-center gap-2">
                              <XCircle size={16} className="text-[#BDBDBD]" />
                              <span className="text-xs text-[#BDBDBD] font-bold">Order Cancelled</span>
                            </div>
                          )}
                          {b.status === 'waiting_payment' && (
                            <div className="flex flex-col gap-3 w-full">
                              <div className="bg-[#0B0B0B] border border-[#1D1D1D] p-3 rounded-xl flex justify-center">
                                <span className="text-[10px] text-[#BDBDBD] font-bold uppercase tracking-widest text-center">
                                  Awaiting Transfer
                                </span>
                              </div>
                              <button 
                                onClick={() => updateBookingStatus(b.id, 'payment_verified')}
                                className="w-full px-3 py-2 bg-[#0B0B0B] hover:bg-[#1D1D1D] text-[#F7F7F7] border border-[#1D1D1D] rounded-lg text-xs font-bold cursor-pointer text-center transition-colors"
                              >
                                Force Bypass Verify
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              )}

              {/* ------------------ MENU 4: CUSTOMERS PROFILE CONTENT ------------------ */}
              {activeTab === 'customer' && (
                <div className="space-y-8">
                  <div className="bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-[#F7F7F7] tracking-tight">Identity Verification Center</h3>
                    <p className="text-sm text-[#BDBDBD] mt-2">
                      Review government-issued IDs (KTP) submitted by users to approve accounts for rentals.
                    </p>
                  </div>

                  {users.length === 0 ? (
                    <div className="bg-[#151515] border border-[#1D1D1D] p-16 text-center rounded-3xl text-[#BDBDBD] text-sm">
                      No user accounts found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {users.map((u) => (
                      <div 
                        key={u.id} 
                        className="bg-[#151515] rounded-3xl border border-[#1D1D1D] p-6 flex flex-col justify-between shadow-sm"
                      >
                        <div className="space-y-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-[#F7F7F7] text-lg">{u.name}</h4>
                              <p className="text-[#BDBDBD] text-xs font-mono mt-0.5">{u.email}</p>
                            </div>
                            {u.isVerified ? (
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-widest">
                                <CheckCircle2 size={12} /> VERIFIED
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#0B0B0B] border border-[#1D1D1D] text-[#BDBDBD] rounded-md text-[10px] font-bold uppercase tracking-widest">
                                PENDING
                              </span>
                            )}
                          </div>
                          
                          <div className="bg-[#0B0B0B] border border-[#1D1D1D] p-4 rounded-xl flex items-center justify-between">
                            <span className="text-xs text-[#BDBDBD] font-medium">ID Document</span>
                            {u.identityUrl ? (
                              <button 
                                type="button"
                                onClick={() => setSelectedKtpImg(u.identityUrl)}
                                className="text-xs text-[#F7F7F7] font-bold hover:text-white flex items-center gap-2 bg-[#1D1D1D] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye size={14} /> View File
                              </button>
                            ) : (
                              <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">NOT UPLOADED</span>
                            )}
                          </div>
                        </div>

                        {!u.isVerified && u.identityUrl && (
                          <div className="pt-6 mt-6 border-t border-[#1D1D1D] grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => handleVerifyUser(u.id, true)} 
                              className="py-3 bg-[#F7F7F7] hover:bg-[#E0E0E0] text-[#0B0B0B] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleVerifyUser(u.id, false)} 
                              className="py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                          <span className="text-[10px] text-[#BDBDBD]/45 uppercase font-mono tracking-wider">
                            UID: {u.id.substring(0, 8)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={12} /> Hapus Pelanggan
                          </button>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              )}

              {/* ------------------ MENU 5: DEDICATED PAYMENT VERIFICATION ------------------ */}
              {activeTab === 'payment_verification' && (
                <div className="space-y-8">
                  <div className="bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-[#F7F7F7] tracking-tight">Payment Validations Box</h3>
                    <p className="text-sm text-[#BDBDBD] mt-2">
                      Review incoming bank transfer slips and approve rentals prior to handover.
                    </p>
                  </div>

                  {bookings.filter(b => b.status === "payment_verified" || b.status === "waiting_payment").length === 0 ? (
                    <div className="bg-[#151515] border border-[#1D1D1D] p-16 text-center rounded-3xl text-[#BDBDBD] text-sm">
                      Clear. All unverified payments have been processed.
                    </div>
                  ) : (
                    <div className="space-y-6">
                    {bookings.filter(b => b.status === "payment_verified" || b.status === "waiting_payment").map((b) => (
                      <div 
                        key={b.id} 
                        className="bg-[#151515] rounded-3xl border border-[#1D1D1D] p-8 flex flex-col md:flex-row gap-6 justify-between items-start shadow-sm"
                      >
                        <div className="space-y-6 flex-1 w-full">
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="font-mono text-sm font-bold text-[#F7F7F7] bg-[#0B0B0B] border border-[#1D1D1D] px-4 py-2 rounded-lg">
                              {b.bookingNumber}
                            </span>
                            <span className="px-4 py-2 bg-[#0B0B0B] border border-[#1D1D1D] rounded-lg text-xs text-[#BDBDBD]">Total: <b className="text-[#F7F7F7] font-extrabold ml-1 font-mono text-sm">Rp {b.total_price?.toLocaleString("id-ID") || b.total?.toLocaleString("id-ID")}</b></span>
                            {b.status === "waiting_payment" && (
                              <span className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-md text-[10px] font-bold uppercase tracking-widest ml-auto self-start">Pending Proof</span>
                            )}
                          </div>

                          <div className="bg-[#0B0B0B] border border-[#1D1D1D] p-6 rounded-2xl">
                            <p className="text-base font-bold text-[#F7F7F7]">{b.customer_name || b.custName}</p>
                            <p className="text-xs text-[#BDBDBD] mt-2 leading-relaxed">Requested Gear: {typeof b.items === 'string' ? b.items : b.items?.map((bi: any) => bi.itemName).join(", ")}</p>
                          </div>

                          {/* Render proof of payment check */}
                          {b.payments && b.payments.map((p: any) => p.proofUrl && (
                            <div key={p.id} className="pt-2">
                              <button 
                                onClick={() => setSelectedProofImg(p.proofUrl)}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-[#1D1D1D] hover:bg-[#2A2A2A] text-[#F7F7F7] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              >
                                <Eye size={16} /> View Transfer Slip
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col gap-3 shrink-0 w-full md:w-56 mt-4 md:mt-0 lg:border-l border-[#1D1D1D] lg:pl-6">
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'ready_pickup')}
                            className="w-full px-5 py-3.5 bg-[#F7F7F7] text-[#0B0B0B] hover:bg-[#E0E0E0] rounded-xl text-xs font-bold text-center cursor-pointer transition-colors"
                          >
                            Approve Transaction
                          </button>
                          
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'cancelled')}
                            className="w-full px-5 py-3.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          >
                            Reject & Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              )}

              {/* ------------------ MENU 6: REPORTING CENTER ------------------ */}
              {activeTab === 'reports' && (
                <div id="reporting-print-section" className="space-y-8 select-none">
                  
                  {/* Reporting Header Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl">
                    <div>
                      <h3 className="text-lg font-bold text-[#F7F7F7] tracking-tight">Financial & Operations Reports</h3>
                      <p className="text-sm text-[#BDBDBD] mt-1">Review revenue trends, booking volume, and penalty summaries.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#BDBDBD]">Timeframe:</span>
                      <div className="flex bg-[#0B0B0B] border border-[#1D1D1D] p-1.5 rounded-xl">
                        {(['harian', 'mingguan', 'bulanan'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setReportPeriod(p)}
                            className={`px-4 py-2 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${reportPeriod === p ? 'bg-[#F7F7F7] text-[#0B0B0B]' : 'text-[#BDBDBD] hover:text-[#F7F7F7]'}`}
                          >
                            {p === 'harian' ? "Today" : p === 'mingguan' ? "This Week" : "This Month"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#151515] border border-[#1D1D1D] p-6 rounded-3xl overflow-hidden flex flex-col justify-between h-36">
                      <p className="text-[10px] text-[#BDBDBD] font-bold uppercase tracking-widest truncate">Booking Volume</p>
                      <div>
                        <p className="text-3xl font-black text-[#F7F7F7] truncate block">{totalBookingCount}</p>
                        <p className="text-xs text-[#BDBDBD] mt-1 truncate">Completed rentals</p>
                      </div>
                    </div>

                    <div className="bg-[#151515] border border-[#1D1D1D] p-6 rounded-3xl overflow-hidden flex flex-col justify-between h-36">
                      <p className="text-[10px] text-[#BDBDBD] font-bold uppercase tracking-widest truncate">Total Revenue</p>
                      <div>
                        <p className="text-3xl font-black text-[#F7F7F7] truncate block">Rp {totalRevenue.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-[#BDBDBD] mt-1 truncate">Gross profit this period</p>
                      </div>
                    </div>

                    <div className="bg-[#151515] border border-[#1D1D1D] p-6 rounded-3xl overflow-hidden flex flex-col justify-between h-36">
                      <p className="text-[10px] text-[#BDBDBD] font-bold uppercase tracking-widest truncate">Avg Order Value</p>
                      <div>
                        <p className="text-3xl font-black text-[#F7F7F7] truncate block">Rp {avgTicketSize.toLocaleString("id-ID")}</p>
                        <p className="text-xs text-[#BDBDBD] mt-1 truncate">Average spending per user</p>
                      </div>
                    </div>

                    <div className="bg-[#151515] border border-[#1D1D1D] p-6 rounded-3xl overflow-hidden flex flex-col justify-between h-36">
                      <p className="text-[10px] text-[#BDBDBD] font-bold uppercase tracking-widest truncate">Active Penalties</p>
                      <div>
                        <p className="text-3xl font-black text-red-500 truncate block">{delayCount}</p>
                        <p className="text-xs text-[#BDBDBD] mt-1 truncate">Late returns & damages</p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Log Table */}
                  <div className="bg-[#151515] border border-[#1D1D1D] rounded-3xl p-8 overflow-hidden">
                    <h4 className="text-sm font-bold text-[#F7F7F7] mb-6 uppercase tracking-widest font-mono">Transaction Logs</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-[#1D1D1D] text-[#BDBDBD] uppercase tracking-widest text-[10px] font-bold">
                            <th className="pb-4 text-left font-semibold">Booking ID</th>
                            <th className="pb-4 text-left font-semibold px-4">Customer Name</th>
                            <th className="pb-4 text-left font-semibold px-4">Rental Duration</th>
                            <th className="pb-4 text-left font-semibold px-4">Status</th>
                            <th className="pb-4 text-right font-semibold">Final Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1D1D1D]">
                          {reportsList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-[#BDBDBD] italic">No transaction data available for this timeframe.</td>
                            </tr>
                          ) : (
                            reportsList.map((rep) => (
                              <tr key={rep.id} className="text-[#F7F7F7] hover:bg-[#1D1D1D]/50 transition-colors">
                                <td className="py-4 font-mono font-bold">{rep.bookingNumber}</td>
                                <td className="py-4 font-medium px-4">{rep.customer_name || rep.custName}</td>
                                <td className="py-4 text-[#BDBDBD] px-4">{new Date(rep.start_date || rep.start).toLocaleDateString("id-ID")} - {new Date(rep.end_date || rep.end).toLocaleDateString("id-ID")}</td>
                                <td className="py-4 px-4">
                                  <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-[#1D1D1D] bg-[#0B0B0B]">
                                    {rep.status}
                                  </span>
                                </td>
                                <td className="py-4 text-right font-bold text-[#F7F7F7]">Rp {rep.total_price?.toLocaleString("id-ID") || rep.total?.toLocaleString("id-ID")}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                       </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------ MENU 7: MAINTENANCE CENTER ------------------ */}
              {activeTab === 'maintenance' && (
                <div className="space-y-8">
                  <div className="bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-[#F7F7F7] tracking-tight">Maintenance Lab</h3>
                    <p className="text-sm text-[#BDBDBD] mt-2">Active service repairs, washing, and part replacement queue.</p>
                  </div>

                  {totalInMaintenance === 0 ? (
                    <div className="bg-[#151515] border border-[#1D1D1D] p-16 text-center rounded-3xl text-[#BDBDBD] text-sm">
                      All inventory units are in optimal condition. No units in maintenance.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {inventoryItems.map((item) => {
                        const maintUnits = item.units?.filter((u: any) => u.status === "maintenance") || [];
                        if (maintUnits.length === 0) return null;
                        
                        return maintUnits.map((unit: any) => (
                          <div 
                            key={unit.id} 
                            className="bg-[#151515] border border-[#1D1D1D] rounded-3xl p-6 flex flex-col justify-between shadow-sm"
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-[#0B0B0B] p-4 rounded-xl border border-[#1D1D1D]">
                                <span className="font-mono text-sm font-bold text-[#F7F7F7]">{unit.unitCode}</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 rounded-md">
                                  IN MAINTENANCE
                                </span>
                              </div>
                              <div className="px-2">
                                <p className="text-sm font-bold text-[#F7F7F7]">{item.name}</p>
                                <p className="text-xs text-[#BDBDBD] mt-1 leading-relaxed">
                                  Diagnosis: {unit.condition || "Routine wash and waterproof spray application."}
                                </p>
                              </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-[#1D1D1D] flex justify-between items-center px-2">
                              <span className="text-[10px] text-[#BDBDBD] uppercase tracking-widest font-bold">Cost: 0 IDR</span>
                              <button
                                onClick={() => handleUpdateUnitStatus(unit.id, "available", "Optimal")}
                                className="px-4 py-2.5 bg-[#F7F7F7] text-[#0B0B0B] hover:bg-[#E0E0E0] font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
                              >
                                <CheckCircle2 size={14} /> Finish Repair
                              </button>
                            </div>
                          </div>
                        ));
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ------------------ MENU: DAMAGE MANAGEMENT CENTER ------------------ */}
              {activeTab === 'damage_management' && (
                <div className="space-y-8">
                  <div className="bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-[#F7F7F7] tracking-tight">Damage Control Center</h3>
                    <p className="text-sm text-[#BDBDBD] mt-2">
                      Evaluate damaged gear inventory. Assign to maintenance repair, dispose of completely, or purchase replacements.
                    </p>
                  </div>

                  {totalDamaged === 0 ? (
                    <div className="bg-[#151515] border border-[#1D1D1D] p-16 text-center rounded-3xl text-[#BDBDBD] text-sm">
                      Exceptional! No inventory units are reported damaged or broken.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {inventoryItems.flatMap((item) => {
                        const damagedUnits = item.units?.filter((u: any) => u.status === "damaged") || [];
                        return damagedUnits.map((unit: any) => {
                          const tingkat = damageTingkat[unit.id] || "Moderate";
                          const catatan = damageCatatan[unit.id] || "";
                          
                          return (
                            <div 
                              key={unit.id} 
                              className="bg-[#151515] border border-[#1D1D1D] rounded-3xl p-6 flex flex-col justify-between shadow-sm"
                            >
                              <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                  <span className="font-mono text-sm font-bold text-[#F7F7F7] bg-[#0B0B0B] border border-[#1D1D1D] px-3 py-1 rounded-md">
                                    {unit.unitCode}
                                  </span>
                                  <span className="text-[9px] uppercase tracking-widest font-bold px-3 py-1 bg-red-500/10 text-red-500 rounded-md">
                                    DAMAGED
                                  </span>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-bold text-[#F7F7F7]">{item.name}</p>
                                  <p className="text-xs text-[#BDBDBD] mt-1">{item.category?.name || "Equipment"}</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-[#1D1D1D]">
                                  <div>
                                    <label className="block text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-2">Severity Level:</label>
                                    <select
                                      value={tingkat}
                                      onChange={(e) => setDamageTingkat(prev => ({ ...prev, [unit.id]: e.target.value }))}
                                      className="w-full px-4 py-3 text-xs bg-[#0B0B0B] text-[#F7F7F7] border border-[#1D1D1D] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none cursor-pointer"
                                    >
                                      <option value="Minor">Minor (Small tears, dirt)</option>
                                      <option value="Moderate">Moderate (Broken frame, leaks)</option>
                                      <option value="Severe">Severe (Destroyed, missing parts)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-2">Diagnostic Notes:</label>
                                    <textarea
                                      value={catatan}
                                      onChange={(e) => setDamageCatatan(prev => ({ ...prev, [unit.id]: e.target.value }))}
                                      placeholder="Example: Broken tent frame segment..."
                                      rows={2}
                                      className="w-full px-4 py-3 text-xs bg-[#0B0B0B] text-[#F7F7F7] border border-[#1D1D1D] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none resize-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="pt-6 mt-6 border-t border-[#1D1D1D] grid grid-cols-2 gap-3">
                                <button
                                  title="Send to Repair"
                                  onClick={() => handleDamageDecision(unit.id, "maintenance", tingkat, catatan)}
                                  className="py-3 bg-[#0B0B0B] hover:bg-[#1D1D1D] text-[#F7F7F7] rounded-xl text-xs font-bold uppercase transition-colors border border-[#1D1D1D] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <Wrench size={14} /> Repair
                                </button>
                                <button
                                  title="Dispose Unit"
                                  onClick={() => handleDamageDecision(unit.id, "disposed", tingkat, catatan)}
                                  className="py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                  <XCircle size={14} /> Dispose
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ------------------ MENU 8: DEMO SIMULATION COCKPIT ------------------ */}
              {activeTab === 'demo_simulation' && (
                <div className="space-y-8">
                  <div className="bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold bg-[#F7F7F7] text-[#0B0B0B] px-3 py-1.5 rounded-md">
                        DEMO SANDBOX COCKPIT
                      </span>
                      <h3 className="text-lg font-bold text-[#F7F7F7] tracking-tight pt-2">Simulated Data Matrix</h3>
                      <p className="text-sm text-[#BDBDBD] max-w-xl">
                        Inject mock events into the database to test verifications, notifications, and penalties without real user accounts. 
                      </p>
                    </div>

                    <button 
                      onClick={handleResetData}
                      className="px-6 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/10 transition-colors font-bold text-xs uppercase cursor-pointer whitespace-nowrap"
                    >
                      Factory Reset Data
                    </button>
                  </div>

                  {/* Actions cockpit */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl space-y-6">
                      <div className="pb-4 border-b border-[#1D1D1D]">
                        <h4 className="text-sm font-bold text-[#F7F7F7] uppercase tracking-widest flex items-center gap-2">
                          <PlusCircle size={16} /> Event Generators
                        </h4>
                        <p className="text-xs text-[#BDBDBD] mt-2">
                          Trigger automated transactions or new user registrations.
                        </p>
                      </div>

                      <div className="flex flex-col gap-4">
                        <button
                          onClick={simulateRandomBooking}
                          className="w-full py-4 bg-[#F7F7F7] hover:bg-[#E0E0E0] text-[#0B0B0B] font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer text-center"
                        >
                          Push Mock Rental Booking
                        </button>
                        <button
                          onClick={simulateRandomCustomer}
                          className="w-full py-4 bg-[#0B0B0B] hover:bg-[#1D1D1D] border border-[#1D1D1D] text-[#F7F7F7] font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer text-center"
                        >
                          Register Mock Customer
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl flex flex-col h-full max-h-[400px]">
                      <div className="pb-4 border-b border-[#1D1D1D] shrink-0">
                        <h4 className="text-sm font-bold text-[#F7F7F7] uppercase tracking-widest flex items-center gap-2">
                          <Activity size={16} /> Audit Stream
                        </h4>
                      </div>
                      
                      {/* Stream of system notifications / logs */}
                      <div className="space-y-4 mt-6 overflow-y-auto pr-2 flex-1">
                        {eventLogs.length === 0 ? (
                          <div className="text-center text-[#BDBDBD] text-xs italic py-4">No events logged in current session.</div>
                        ) : (
                          eventLogs.map((log, idx) => (
                            <div key={idx} className="flex justify-between items-start text-xs font-mono border-b border-[#1D1D1D]/50 pb-3 gap-4">
                              <span className="text-[#F7F7F7] break-words">
                                <b className="text-[#BDBDBD] mr-2">[{log.type}]</b> {log.message}
                              </span>
                              <span className="text-[10px] text-[#BDBDBD] shrink-0">{new Date(log.timestamp).toLocaleTimeString("id-ID")}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------ MENU 9: SYSTEM CONFIGURATION SETTINGS ------------------ */}
              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <div className="bg-[#151515] border border-[#1D1D1D] p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-[#F7F7F7] tracking-tight">System & Business Rules</h3>
                    <p className="text-sm text-[#BDBDBD] mt-2">
                      Configure base operational parameters, penalty rates, and core validation flows.
                    </p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); toast.success("Settings applied"); addLocalLog("SISTEM", "Konfigurasi toko diperbarui"); }} className="bg-[#151515] border border-[#1D1D1D] rounded-3xl p-8 space-y-8 max-w-3xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-3">Daily Late Penalty (IDR):</label>
                        <input
                          type="number"
                          value={penaltyRate}
                          onChange={(e) => setPenaltyRate(e.target.value)}
                          className="w-full px-5 py-4 text-sm bg-[#0B0B0B] text-[#F7F7F7] border border-[#1D1D1D] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none font-mono font-bold transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-3">Standard Deposit (IDR):</label>
                        <input
                          type="number"
                          value={rentalDeposit}
                          onChange={(e) => setRentalDeposit(e.target.value)}
                          className="w-full px-5 py-4 text-sm bg-[#0B0B0B] text-[#F7F7F7] border border-[#1D1D1D] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none font-mono font-bold transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-3">Primary Base Branch:</label>
                      <input
                        type="text"
                        value={mainBranch}
                        onChange={(e) => setMainBranch(e.target.value)}
                        className="w-full px-5 py-4 text-sm bg-[#0B0B0B] text-[#F7F7F7] border border-[#1D1D1D] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-4 bg-[#0B0B0B] border border-[#1D1D1D] p-5 rounded-xl cursor-pointer" onClick={() => setRequireVerify(!requireVerify)}>
                      <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${requireVerify ? 'bg-[#F7F7F7] border-[#F7F7F7]' : 'bg-[#151515] border-[#1D1D1D]'}`}>
                        {requireVerify && <CheckCircle2 size={16} className="text-[#0B0B0B]" />}
                      </div>
                      <label htmlFor="verify-check" className="text-sm text-[#F7F7F7] font-semibold cursor-pointer select-none">
                        Require strict Identity Document (KTP) verification prior to rental approvals
                      </label>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[#1D1D1D]">
                      <button
                        type="submit"
                        className="px-8 py-3.5 bg-[#F7F7F7] hover:bg-[#E0E0E0] text-[#0B0B0B] text-sm font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Commit Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* ------------------ MODAL 1: KENAKAN DENDA FORM MODAL ------------------ */}
      {penaltyBooking && (
        <div id="penalty-dialog-modal" className="fixed inset-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-[#151515] border border-[#1D1D1D] text-[#F7F7F7] rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-scale-up">
            <h3 className="text-xl font-bold text-[#F7F7F7] mb-2 tracking-tight">
              Log Penalty Entry
            </h3>
            <p className="text-xs text-[#BDBDBD] mb-6 leading-normal">
              Booking <b className="text-[#F7F7F7] font-mono">{penaltyBooking.bookingNumber}</b> for {penaltyBooking.customer_name || penaltyBooking.custName}. Please enter violation details.
            </p>

            <form onSubmit={handleAssignPenalty} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-3">Infraction Type:</label>
                <select
                  value={penaltyReason}
                  onChange={e => setPenaltyReason(e.target.value)}
                  className="w-full px-5 py-4 text-sm bg-[#0B0B0B] border border-[#1D1D1D] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none text-[#F7F7F7] select-none transition-colors"
                >
                  <option value="Keterlambatan Pengembalian (1 Hari)">1 Day Late Return</option>
                  <option value="Keterlambatan Pengembalian (2 Hari)">2 Days Late Return</option>
                  <option value="Kerusakan Ringan pada Peralatan">Minor Damage (Scratches/Tears)</option>
                  <option value="Tenda Rusak/Sobek Parah (Pecah Frame)">Severe Damage (Broken Frame/Rip)</option>
                  <option value="Ganti Unit Total (Kehilangan Unit Sewa)">Missing/Lost Item (Full Replacement)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-3">Penalty Amount (IDR):</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={penaltyAmount}
                  onChange={e => setPenaltyAmount(e.target.value)}
                  className="w-full px-5 py-4 text-sm bg-[#0B0B0B] border border-[#1D1D1D] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none text-[#F7F7F7] font-bold font-mono transition-colors"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#1D1D1D]">
                <button
                  type="button"
                  onClick={() => setPenaltyBooking(null)}
                  className="flex-1 px-5 py-3.5 bg-[#0B0B0B] hover:bg-[#1D1D1D] border border-[#1D1D1D] text-[#F7F7F7] text-sm font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Log Penalty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ MODAL 2: DETAIL LOG MAINTENANCE FORM MODAL ------------------ */}
      {maintenanceUnit && (
        <div id="maintenance-dialog-modal" className="fixed inset-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#1D1D1D] text-[#F7F7F7] rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-scale-up">
            <h3 className="text-xl font-bold text-[#F7F7F7] mb-2 tracking-tight">
              Maintenance Logging
            </h3>
            <p className="text-xs text-[#BDBDBD] mb-6 leading-normal">
              Flag unit <code className="font-extrabold font-mono text-[#F7F7F7] bg-[#0B0B0B] border border-[#1D1D1D] px-1.5 py-0.5 rounded">{maintenanceUnit.unitCode}</code> for repair, deep-cleaning, or part replacement.
            </p>

            <form onSubmit={handleLogMaintenance} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-3">Criteria:</label>
                <select
                  value={maintenanceStatus}
                  onChange={e => setMaintenanceStatus(e.target.value)}
                  className="w-full px-5 py-4 text-sm bg-[#0B0B0B] border border-[#1D1D1D] text-[#F7F7F7] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none transition-colors"
                >
                  <option value="routine">Routine - Wash & Sterilization</option>
                  <option value="repair">Repair - Stitching / Hole Patching</option>
                  <option value="replaced">Replacement - Frame / Core Parts</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-3">Diagnostic Notes:</label>
                <textarea
                  placeholder="e.g. Heavy mud on inner tent, needs deep scrub."
                  value={maintenanceNotes}
                  onChange={e => setMaintenanceNotes(e.target.value)}
                  rows={3}
                  className="w-full px-5 py-4 text-sm bg-[#0B0B0B] border border-[#1D1D1D] text-[#F7F7F7] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none transition-colors resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-3">Incurred Cost (IDR):</label>
                <input
                  type="number"
                  placeholder="Set 0 if no additional cost"
                  value={maintenanceCost}
                  onChange={e => setMaintenanceCost(e.target.value)}
                  className="w-full px-5 py-4 text-sm bg-[#0B0B0B] border border-[#1D1D1D] text-[#F7F7F7] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none font-mono font-bold transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#1D1D1D]">
                <button
                  type="button"
                  onClick={() => setMaintenanceUnit(null)}
                  className="flex-1 px-5 py-3.5 bg-[#0B0B0B] border border-[#1D1D1D] text-[#F7F7F7] hover:bg-[#1D1D1D] text-sm font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3.5 bg-[#F7F7F7] hover:bg-[#E0E0E0] text-[#0B0B0B] text-sm font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Log Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ MODAL 3: KTP PHOTO REVIEWS ------------------ */}
      {selectedKtpImg && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-[#151515] border border-[#1D1D1D] rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#1D1D1D]">
              <span className="text-sm font-bold uppercase tracking-widest text-[#F7F7F7]">Identity Document Preview</span>
              <button 
                onClick={() => setSelectedKtpImg(null)}
                className="text-[#BDBDBD] hover:text-[#F7F7F7] font-bold text-xs uppercase cursor-pointer transition-colors px-3 py-1 bg-[#0B0B0B] border border-[#1D1D1D] rounded-lg"
              >
                Close
              </button>
            </div>
            
            <div className="px-4 py-8 bg-[#0B0B0B] rounded-2xl flex items-center justify-center border border-[#1D1D1D]">
              <img 
                src={`/uploads/${selectedKtpImg}`} 
                alt="Jaminan KTP asli" 
                className="max-h-96 rounded-xl object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback sample image
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------ MODAL 4: PROOF OF PAYMENT SLIP ------------------ */}
      {selectedProofImg && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-[#151515] border border-[#1D1D1D] rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#1D1D1D]">
              <span className="text-sm font-bold uppercase tracking-widest text-[#F7F7F7]">Transfer Slip Preview</span>
              <button 
                onClick={() => setSelectedProofImg(null)}
                className="text-[#BDBDBD] hover:text-[#F7F7F7] font-bold text-xs uppercase cursor-pointer transition-colors px-3 py-1 bg-[#0B0B0B] border border-[#1D1D1D] rounded-lg"
              >
                Close
              </button>
            </div>
            
            <div className="px-4 py-8 bg-[#0B0B0B] rounded-2xl flex items-center justify-center border border-[#1D1D1D]">
              <img 
                src={`/uploads/${selectedProofImg}`} 
                alt="Bukti Transfer Outrent Bank" 
                className="max-h-96 rounded-xl object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback sample receipt image
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------ MODAL 5: TAMBAH PRODUCT BARU ------------------ */}
      {showAddInv && (
        <div id="add-inv-modal" className="fixed inset-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-[#151515]/95 border border-white/[0.08] text-[#F7F7F7] rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] relative animate-scale-up backdrop-blur-xl max-h-[90dvh] md:max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header: Fixed */}
            <div className="pb-4 border-b border-[#1D1D1D]">
              <h3 className="text-lg md:text-xl font-bold text-[#F7F7F7] mb-1 tracking-tight">
                Provision New Equipment
              </h3>
              <p className="text-[11px] md:text-xs text-[#BDBDBD] leading-normal">
                Register a new product in the catalog and initialize its associated physical unit serials into the warehouse tracker.
              </p>
            </div>

            {/* Form: Flex and Scrollable inside modal content */}
            <form onSubmit={handleAddInventory} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto py-5 pr-1 md:pr-2 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
                
                {/* Dual Fields: Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-[9px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-1.5 md:mb-2">Category:</label>
                    <select
                      value={newInv.categoryId}
                      onChange={e => setNewInv({ ...newInv, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 md:px-5 md:py-3.5 text-xs md:text-sm bg-[#0B0B0B] border border-[#1D1D1D] text-[#F7F7F7] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none transition-colors"
                      required
                    >
                      <option value="" disabled>-- Select Catalog --</option>
                      {[...new Set(inventoryItems.map(item => item.category ? JSON.stringify({ id: item.category.id, name: item.category.name }) : null).filter(Boolean))].map((str: any) => {
                        const cat = JSON.parse(str);
                        return <option key={cat.id} value={cat.id}>{cat.name}</option>;
                      })}
                      {/* Fallback standard categories if inventory values are empty */}
                      {inventoryItems.length === 0 && (
                        <>
                          <option value="1">Tenda Dome</option>
                          <option value="2">Carrier & Tas Gunung</option>
                          <option value="3">Sleeping Bed & Matras</option>
                          <option value="4">Peralatan Masak Camping</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-1.5 md:mb-2">Item Label:</label>
                    <input
                      type="text"
                      value={newInv.name}
                      onChange={e => setNewInv({ ...newInv, name: e.target.value })}
                      placeholder="e.g. Carrier Deuter 50L"
                      className="w-full px-4 py-2.5 md:px-5 md:py-3.5 text-xs md:text-sm bg-[#0B0B0B] border border-[#1D1D1D] text-[#F7F7F7] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Rental Tariff */}
                <div>
                  <label className="block text-[9px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-1.5 md:mb-2">Rental Tariff (Rp/Day):</label>
                  <input
                    type="number"
                    value={newInv.price}
                    onChange={e => setNewInv({ ...newInv, price: e.target.value })}
                    placeholder="e.g. 35000"
                    className="w-full px-4 py-2.5 md:px-5 md:py-3.5 text-xs md:text-sm bg-[#0B0B0B] border border-[#1D1D1D] text-[#F7F7F7] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none font-mono transition-colors"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[9px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-1.5 md:mb-2">Description:</label>
                  <textarea
                    value={newInv.desc}
                    onChange={e => setNewInv({ ...newInv, desc: e.target.value })}
                    placeholder="Technical specs, capabilities, condition..."
                    rows={2}
                    className="w-full px-4 py-2.5 md:px-5 md:py-3.5 text-xs md:text-sm bg-[#0B0B0B] border border-[#1D1D1D] text-[#F7F7F7] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none transition-colors resize-none"
                    required
                  />
                </div>

                {/* Hardware Serials */}
                <div>
                  <label className="block text-[9px] font-bold text-[#BDBDBD] uppercase tracking-widest mb-1.5 md:mb-2">Hardware Serial Codes (Comma separated):</label>
                  <textarea
                    value={newInv.codes}
                    onChange={e => setNewInv({ ...newInv, codes: e.target.value })}
                    placeholder="e.g. UNT-CRT-001, UNT-CRT-002, UNT-CRT-003"
                    rows={2}
                    className="w-full px-4 py-2.5 md:px-5 md:py-3.5 text-xs md:text-sm bg-[#0B0B0B] border border-[#1D1D1D] text-[#F7F7F7] rounded-xl focus:border-[#F7F7F7] focus:ring-0 outline-none font-mono transition-colors resize-none"
                    required
                  />
                </div>
              </div>

              {/* Footer: Fixed Action Buttons */}
              <div className="flex gap-3 md:gap-4 pt-4 border-t border-[#1D1D1D] mt-auto">
                <button
                  type="button"
                  onClick={() => setShowAddInv(false)}
                  className="flex-1 px-4 py-3 md:px-5 md:py-3.5 bg-[#0B0B0B] border border-[#1D1D1D] text-[#F7F7F7] hover:bg-[#1D1D1D] text-xs md:text-sm font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 md:px-5 md:py-3.5 bg-[#F7F7F7] hover:bg-[#E0E0E0] text-[#0B0B0B] text-xs md:text-sm font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Commit Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled css overrides specifically for Printer Media query printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
            background: transparent !important;
            color: black !important;
          }
          #reporting-print-section, #reporting-print-section * {
            visibility: visible !important;
          }
          #reporting-print-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
          }
          .flex, .grid, button, select {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
