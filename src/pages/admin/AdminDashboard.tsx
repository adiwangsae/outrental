import { useEffect, useState } from "react";
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
  CreditCard
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
      const accentColor = [255, 85, 0]; // #FF5500 (Orange)
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
    <div className="min-h-screen flex flex-col bg-neutral-900 text-neutral-100 transition-colors font-sans antialiased">
      <Navbar />

      {/* Screen Container with Sidebar and Content Panel */}
      <div className="flex-1 flex flex-col lg:flex-row w-full relative">
        
        {/* Left Fixed Sidebar - Desktop (or Toggleable side-drawer in Mobile) */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] bg-[#0d110e]/95 backdrop-blur-md border-r border-[#1a231c]/60 p-5 flex flex-col justify-between overflow-y-auto
          transition-transform lg:translate-x-0 duration-300 ease-in-out mt-16 lg:mt-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="space-y-6">
            
            {/* Owner/Business metadata badge inside sidebar */}
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1.5 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5500]"></span>
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5500]">
                  {user?.isDemo ? "SILICON SANDBOX" : "OPERASIONAL ASLI"}
                </span>
              </div>
              <p className="text-xs font-bold text-neutral-100 truncate">{user?.name || "Pemilik Usaha"}</p>
              <p className="text-[11px] text-stone-500 truncate leading-none">{user?.email}</p>
            </div>

            {/* Menu Items List */}
            <nav className="space-y-1.5" aria-label="Sidebar Navigation">
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
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer select-none
                      ${isActive 
                        ? 'bg-[#FF5500] text-white' 
                        : 'text-stone-400 hover:bg-[#121212] hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={15} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white text-[#FF5500]' : 'bg-[#FF5500]/15 text-[#FF5500]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Logout Action in the navigation loop */}
              <button
                onClick={handleLogoutAction}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer select-none border border-transparent hover:border-red-500/10"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Footer inside sidebar */}
          <div className="pt-4 border-t border-[#1a231c] text-[10px] text-stone-600 font-mono flex flex-col gap-1 select-none">
            <p>V1.4.2 &bull; COMPLIANT</p>
            <p>OUTRENT CONTROL CENTER</p>
          </div>
        </aside>

        {/* Mobile Subheader Navigation Header bar - Sticky so it is never left behind on scroll */}
        <div className="lg:hidden sticky top-16 w-full bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex justify-between items-center z-30 select-none shadow-sm">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-200 hover:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5500] cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5500] flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 px-2.5 py-1 rounded-md">
            Tab: <b className="text-white">{menuItems.find(m => m.id === activeTab)?.label}</b>
          </span>

          <button 
            onClick={() => fetchData()}
            disabled={syncing}
            className="p-2 text-neutral-200 hover:text-white rounded-lg cursor-pointer flex items-center"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin text-[#FF5500]" : ""} />
          </button>
        </div>

        {/* Dark overlay for sliding menu in mobile */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity mt-16"
          />
        )}

        {/* Primary Operational Content Window */}
        <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto max-w-full bg-[#0a0d0a]/95 text-stone-105">
          
          {/* Top Info Ribbon */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0d110e]/90 border border-[#1a231c] px-5 py-4 rounded-2xl shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{menuItems.find(m => m.id === activeTab)?.label} Control Panel</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Konfigurasi operasional sewa alat gunung. Terakhir disinkronisasi: <b className="text-stone-300 font-mono">{lastUpdated || "Menghubungkan..."}</b>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fetchData()}
                disabled={syncing}
                className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-neutral-900 text-stone-300 rounded-xl border border-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RefreshCw size={11} className={syncing ? "animate-spin text-[#FF5500]" : ""} />
                {syncing ? "Sinkronisasi..." : "Refresh"}
              </button>
              
              {activeTab === 'reports' && (
                <button 
                  onClick={downloadPDFReport}
                  className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-[#FF5500] hover:bg-[#FF3300] text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-[#FF5500]/10 border border-[#FF5500]/20"
                >
                  <FileText size={11} />
                  Print / Save PDF
                </button>
              )}
            </div>
          </div>

          {/* LOADING STATE PLACEHOLDER */}
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-neutral-950/40 border border-neutral-800/80 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-6 animate-pulse">
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
                  <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 font-sans">
                    <div 
                      onClick={() => setActiveTab('customer')}
                      className="bg-[#121212] hover:bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xs transition-colors hover:border-[#FF5500]/40 cursor-pointer"
                    >
                      <div className="flex justify-between items-start text-[#FF5500]">
                        <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Antrean Verif KTP</span>
                        <ShieldCheck size={16} />
                      </div>
                      <p className="text-3xl font-extrabold text-[#faf9f6]/95 mt-3">{activeVerificationsNum}</p>
                      <p className="text-[11px] text-stone-500 mt-1">Dokumen KTP pending disetujui</p>
                    </div>

                    <div 
                      onClick={() => setActiveTab('payment_verification')}
                      className="bg-[#121212] hover:bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xs transition-colors hover:border-[#FF5500]/40 cursor-pointer"
                    >
                      <div className="flex justify-between items-start text-[#FF5500]">
                        <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Verif Bayar</span>
                        <CreditCard size={16} />
                      </div>
                      <p className="text-3xl font-extrabold text-[#faf9f6]/95 mt-3">{pendingPaymentsNum}</p>
                      <p className="text-[11px] text-stone-500 mt-1">Bukti transfer baru masuk</p>
                    </div>

                    <div 
                      onClick={() => setActiveTab('inventory')}
                      className="bg-[#121212] hover:bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xs transition-colors hover:border-[#FF5500]/40 cursor-pointer"
                    >
                      <div className="flex justify-between items-start text-[#FF5500]">
                        <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Stok Kritis (≤1)</span>
                        <Layers size={16} />
                      </div>
                      <p className="text-3xl font-extrabold text-[#faf9f6]/95 mt-3">{criticalStockNum}</p>
                      <p className="text-[11px] text-stone-500 mt-1">Unit katalog hampir habis</p>
                    </div>

                    <div 
                      onClick={() => setActiveTab('maintenance')}
                      className="bg-[#121212] hover:bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xs transition-colors hover:border-[#FF5500]/40 cursor-pointer"
                    >
                      <div className="flex justify-between items-start text-[#FF5500]">
                        <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Perawatan Aktif</span>
                        <Wrench size={16} />
                      </div>
                      <p className="text-3xl font-extrabold text-[#faf9f6]/95 mt-3">{totalInMaintenance}</p>
                      <p className="text-[11px] text-stone-500 mt-1">Goresan/pencucian unit aktif</p>
                    </div>
                  </section>

                  {/* Graphical Trend Representation and Quick Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Visual Line Chart representing income */}
                    <div className="lg:col-span-2 bg-[#121212] border border-neutral-800 p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-[#faf9f6]/90 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <TrendingUp size={15} className="text-[#FF5500]" /> Tren Pendapatan Sewa (Simulasi Grafik)
                        </h3>
                        <span className="text-[10px] bg-neutral-950 text-[#FF5500] px-2.5 py-0.5 rounded-full font-bold">Rupiah Bersih</span>
                      </div>
                      
                      {/* SVGs stylized line graph representation */}
                      <div className="pt-6 relative h-48 flex flex-col justify-between">
                        <div className="absolute inset-x-0 top-1/2 border-t border-neutral-800/35" />
                        <div className="absolute inset-x-0 top-1/4 border-t border-neutral-800/15" />
                        
                        {/* Line Graph */}
                        <svg className="w-full h-36" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <path
                            d="M0,28 Q15,22 30,14 T60,18 T90,8 T100,2"
                            fill="none"
                            stroke="url(#neon-orange)"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M0,28 Q15,22 30,14 T60,18 T90,8 T100,2 L100,30 L0,30 Z"
                            fill="url(#orange-gradient)"
                            opacity="0.10"
                          />
                          <defs>
                            <linearGradient id="neon-orange" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#FF5500" />
                              <stop offset="100%" stopColor="#FFCC00" />
                            </linearGradient>
                            <linearGradient id="orange-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#FF5500" />
                              <stop offset="100%" stopColor="transparent" strokeWidth="0" />
                            </linearGradient>
                          </defs>
                        </svg>
                        
                        {/* X-axis indicators */}
                        <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-2 select-none">
                          <span>01 Juni</span>
                          <span>07 Juni</span>
                          <span>14 Juni</span>
                          <span>21 Juni</span>
                          <span>28 Juni</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Overview summary metrics */}
                    <div className="bg-[#0d110e]/70 border border-[#1a231c]/60 p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-4 font-mono">
                          <Building size={14} className="text-stone-400" /> Ringkasan Bisnis
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
                            <span className="text-xs text-stone-400">Total Pelanggan Terdaftar</span>
                            <span className="text-sm font-bold text-neutral-100">{users.length} Orang</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
                            <span className="text-xs text-stone-400">Total Booking Terarsip</span>
                            <span className="text-sm font-bold text-neutral-100">{bookings.length} Reservasi</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
                            <span className="text-xs text-stone-400">Total Omset Pendapatan</span>
                            <span className="text-sm font-extrabold text-[#FF5500]">Rp {totalRevenue.toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveTab('reports')}
                        className="w-full py-2 bg-neutral-900 border border-neutral-800 hover:border-[#FF5500]/40 text-stone-200 rounded-xl text-xs font-bold transition-colors shadow-inner cursor-pointer"
                      >
                        Buka Laporan Lengkap
                      </button>
                    </div>
                  </div>

                  {/* Operational workflow tutorial/guide strip */}
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4 shadow-inner">
                    <h4 className="font-bold text-[#FF5500] text-xs font-mono tracking-widest uppercase flex items-center gap-2 select-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FF5500] animate-pulse"></span>
                      Operasional Alur Validasi Sewa Pelanggan
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                      {/* Step 1 */}
                      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1 hover:border-[#FF5500]/30 transition-all">
                        <span className="font-mono text-[9px] font-extrabold text-[#FF5500] block tracking-wider uppercase opacity-85">01 &bull; KTP REG</span>
                        <p className="text-xs text-stone-100 font-bold">Verifikasi Identitas</p>
                        <p className="text-[11px] text-stone-400 leading-relaxed font-normal">
                          Verifikasi dokumen jaminan KTP pengguna baru di menu <b className="text-[#FF5500] hover:underline cursor-pointer" onClick={() => setActiveTab('customer')}>Customer</b> untuk sah melakukan order.
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1 hover:border-[#FF5500]/30 transition-all">
                        <span className="font-mono text-[9px] font-extrabold text-[#FF5500] block tracking-wider uppercase opacity-85">02 &bull; ORDERING</span>
                        <p className="text-xs text-stone-100 font-bold">Waiting Payment</p>
                        <p className="text-[11px] text-stone-400 leading-relaxed font-normal">
                          Pelanggan memesan alat gunung. Pembukuan mencatat status <b className="text-neutral-300">Waiting Payment</b> menanti setoran dana deposit & biaya.
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1 hover:border-[#FF5500]/30 transition-all">
                        <span className="font-mono text-[9px] font-extrabold text-[#FF5500] block tracking-wider uppercase opacity-85">03 &bull; VERIF PAY</span>
                        <p className="text-xs text-stone-100 font-bold">Pemeriksaan Slip</p>
                        <p className="text-[11px] text-stone-400 leading-relaxed font-normal">
                          Periksa bukti transfer m-banking di menu <b className="text-[#FF5500] hover:underline cursor-pointer" onClick={() => setActiveTab('payment_verification')}>Payment Verif</b> untuk melepaskan status bayar reservasi.
                        </p>
                      </div>

                      {/* Step 4 */}
                      <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-1 hover:border-[#FF5500]/30 transition-all">
                        <span className="font-mono text-[9px] font-extrabold text-[#FF5500] block tracking-wider uppercase opacity-85">04 &bull; PENYERAHAN</span>
                        <p className="text-xs text-stone-100 font-bold">Keluar Gerai</p>
                        <p className="text-[11px] text-stone-400 leading-relaxed font-normal">
                          Serah terima unit alat gunung di toko fisik Sembalun. Pindahkan status transaksi sewa ke <b className="text-[#FF5500]">Ongoing (Sedang Disewa)</b>.
                        </p>
                      </div>

                      {/* Step 5 */}
                      <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-1 hover:border-[#FF5500]/30 transition-all">
                        <span className="font-mono text-[9px] font-extrabold text-[#FF5500] block tracking-wider uppercase opacity-85">05 &bull; ASSET CHECKS</span>
                        <p className="text-xs text-stone-100 font-bold">Cek Fisik & Denda</p>
                        <p className="text-[11px] text-stone-400 leading-relaxed font-normal">
                          Uji kelayakan pasca kembali. Terapkan denda (terlambat/robek) atau submit <b className="text-[#FF5500]">Maintenance</b> jika perlengkapan butuh perbaikan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------ MENU 2: INVENTORY CATALOG CONTENT ------------------ */}
              {activeTab === 'inventory' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-sm">
                    <div>
                      <h3 className="text-md font-bold text-white uppercase tracking-wider font-mono">Katalog Inventaris & Status Kelayakan Unit</h3>
                      <p className="text-xs text-stone-550 mt-1 font-sans">Tambahkan katalog, periksa fisik tenda, tas, peralatan masak, dsb.</p>
                    </div>
                    <button 
                      onClick={() => setShowAddInv(true)} 
                      className="px-4 py-2 bg-[#FF5500] hover:bg-[#FF3300] text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer select-none border border-[#FF5500]/20 shadow-[#FF5500]/5"
                    >
                      + Tambah Produk Baru
                    </button>
                  </div>

                  {inventoryItems.length === 0 ? (
                    <div className="bg-[#0d110e]/40 border border-[#1a231c]/60 p-12 text-center rounded-2xl text-stone-500 text-sm">
                      Katalog inventaris kosong.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {inventoryItems.map((item) => (
                        <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-5 shadow-inner">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-neutral-800 pb-4">
                            <div>
                              <h4 className="font-bold text-white text-lg leading-tight">{item.name}</h4>
                              <p className="text-xs text-stone-400 mt-1 font-medium font-sans">
                                Kategori: <span className="text-[#FF5500] font-semibold">{item.category?.name || "Peralatan"}</span> &bull; 
                                Harga Sewa: <span className="text-neutral-200 font-bold ml-1">Rp {item.pricePerDay?.toLocaleString("id-ID")} / hari</span>
                              </p>
                            </div>
                            <span className="text-[11px] text-neutral-500 font-mono">ID: {item.id}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {item.units?.map((unit: any) => (
                              <div 
                                key={unit.id} 
                                className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-800 flex flex-col justify-between gap-4 shadow-sm"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="font-mono text-xs font-bold text-neutral-200 uppercase bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                                      {unit.unitCode}
                                    </span>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold border ${
                                      unit.status === "available"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : unit.status === "maintenance"
                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    }`}>
                                      {unit.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-neutral-400 mt-2.5">
                                    Fisik: <b className="text-neutral-200 font-bold">{unit.condition || "Prima (Siap Sewa)"}</b>
                                  </p>
                                </div>

                                <div className="space-y-2 border-t border-neutral-850 pt-3">
                                  <span className="text-[10px] font-extrabold text-neutral-500 uppercase block tracking-wider leading-none">Ubah Cepat Kelayakan:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {unit.status !== "available" && (
                                      <button
                                        onClick={() => handleUpdateUnitStatus(unit.id, "available", "Prima - Siap Pakai")}
                                        className="px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-[10px] font-bold rounded cursor-pointer border border-emerald-500/20 transition-all font-mono"
                                      >
                                        READY (Prima)
                                      </button>
                                    )}
                                    {unit.status !== "maintenance" && (
                                      <button
                                        onClick={() => setMaintenanceUnit(unit)}
                                        className="px-2 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-bold rounded cursor-pointer border border-blue-500/20 transition-all font-mono"
                                      >
                                        + MAINT
                                      </button>
                                    )}
                                    {unit.status !== "damaged" && (
                                      <button
                                        onClick={() => handleUpdateUnitStatus(unit.id, "damaged", "Aus / Rusak Ringan")}
                                        className="px-2 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-[10px] font-bold rounded cursor-pointer border border-red-500/20 transition-all font-mono"
                                      >
                                        DAMAGED
                                      </button>
                                    )}
                                  </div>
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
                <div className="space-y-6">
                  {bookings.length === 0 ? (
                    <div className="bg-neutral-950/40 border border-neutral-800 p-12 text-center rounded-2xl text-neutral-500 text-sm">
                      Belum ada transaksi rental yang terdaftar.
                    </div>
                  ) : (
                    bookings.map((b) => (
                      <div 
                        key={b.id} 
                        className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-start shadow-inner"
                      >
                        <div className="space-y-4 flex-1">
                          
                          {/* Heading Number status */}
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono font-extrabold text-[#FF5500] tracking-tight text-xs bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800">
                              {b.bookingNumber}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold border ${
                              b.status === "completed" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : b.status === "cancelled" 
                                ? "bg-stone-500/10 text-stone-400 border-neutral-500/20" 
                                : b.status === "penalty" || (b.penalties && b.penalties.some((p: any) => p.status === "unpaid"))
                                ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                                : "bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/20"
                            }`}>
                              {b.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-stone-550 font-mono">
                              Masuk: {new Date(b.created_at || b.created).toLocaleDateString("id-ID")}
                            </span>
                          </div>

                          {/* Customer Bio */}
                          <div className="space-y-1">
                            <p className="font-bold text-white text-base">
                              {b.customer_name || b.custName} <span className="text-stone-500 font-normal text-xs font-mono">({b.customer_email || b.custId})</span>
                            </p>
                            <div className="text-xs text-stone-400 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                              <span>Mulai: <b className="text-[#faf9f6]/95">{new Date(b.start_date || b.start).toLocaleDateString("id-ID")}</b></span>
                              <span>Kembali: <b className="text-[#faf9f6]/95">{new Date(b.end_date || b.end).toLocaleDateString("id-ID")}</b></span>
                              <span>Tarif Sewa: <b className="text-[#FF5500] font-extrabold">Rp {b.total_price?.toLocaleString("id-ID") || b.total?.toLocaleString("id-ID")}</b></span>
                            </div>
                            {b.note && (
                              <p className="text-[11px] text-stone-500 italic bg-neutral-950 border border-neutral-800 p-2 rounded-lg max-w-xl">
                                Catatan: {b.note}
                              </p>
                            )}
                          </div>

                          {/* Items rented list representation */}
                          <div className="pt-3 border-t border-[#1a231c]/40">
                            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Peralatan Disewa:</p>
                            <div className="flex flex-wrap gap-2">
                              {typeof b.items === 'string' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-stone-200 font-sans">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                                  {b.items}
                                </span>
                              ) : (
                                b.items?.map((bi: any) => (
                                  <span 
                                    key={bi.id} 
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-stone-200 font-sans"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                                    {bi.itemName} {bi.unitCode && <code className="text-stone-550 font-semibold text-[10px] font-mono">({bi.unitCode})</code>}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Denda lists block */}
                          {b.penalties && b.penalties.length > 0 && (
                            <div className="pt-3 border-t border-[#1a231c]/40 bg-red-950/10 p-3 rounded-xl border border-red-900/20">
                              <p className="text-xs font-extrabold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1 text-[10px]">
                                <BadgeAlert size={12} /> TABEL PENALTI DENDA:
                              </p>
                              <div className="space-y-2">
                                {b.penalties.map((p: any) => (
                                  <div key={p.id} className="flex justify-between items-center text-xs">
                                    <span className="text-stone-400">
                                      &bull; {p.reason} <b className="text-[#faf9f6]/90">(Rp {p.amount.toLocaleString("id-ID")})</b>
                                    </span>
                                    {p.status === "paid" ? (
                                      <span className="text-emerald-400 font-bold font-mono text-[11px] bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">&#10003; DISAHKAN LUNAS</span>
                                    ) : (
                                      <button
                                        onClick={() => handlePayPenalty(b.id, p.id)}
                                        className="px-2 py-0.5 bg-red-650 text-red-200 border border-red-500 hover:bg-red-600 rounded text-[10px] font-bold cursor-pointer transition-all"
                                      >
                                        Verifikasi Atas Lunas Denda
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Custom Control actions flow */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-48 border-t lg:border-t-0 border-[#1a231c] pt-4 lg:pt-0 shrink-0">
                          {b.status === 'payment_verified' && (
                            <button 
                              onClick={() => updateBookingStatus(b.id, 'ready_pickup')} 
                              className="px-4 py-2.5 bg-[#FF5500] hover:bg-[#FF3300] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center border border-[#FF5500]/20 shadow-[#FF5500]/10"
                            >
                              Sahkan Bayar & Siapkan Unit
                            </button>
                          )}
                          {b.status === 'ready_pickup' && (
                            <button 
                              onClick={() => updateBookingStatus(b.id, 'ongoing')} 
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center"
                            >
                              Serahkan Barang (Ongoing)
                            </button>
                          )}
                          {b.status === 'ongoing' && (
                            <div className="flex flex-col gap-1.5 w-full">
                              <button 
                                onClick={() => updateBookingStatus(b.id, 'returned')} 
                                className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer text-center"
                              >
                                Selesai Kembalian (Cek Fisik)
                              </button>
                              <button 
                                onClick={() => setPenaltyBooking(b)} 
                                className="px-4 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-xl text-xs font-semibold py-2 transition-all text-center cursor-pointer"
                              >
                                + Kenakan Denda Fisik
                              </button>
                            </div>
                          )}
                          {b.status === 'returned' && (
                            <div className="flex flex-col gap-1.5 w-full">
                              <button 
                                onClick={() => updateBookingStatus(b.id, 'completed')} 
                                className="px-4 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
                              >
                                Selesaikan Transaksi (Closed)
                              </button>
                              <button 
                                onClick={() => setPenaltyBooking(b)} 
                                className="px-3 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-xl text-xs font-semibold py-2 transition-all text-center cursor-pointer"
                              >
                                + Kenakan Denda Lambat / Rusak
                              </button>
                            </div>
                          )}
                          
                          {/* Helpful Info label text */}
                          {b.status === 'completed' && (
                            <span className="text-xs text-neutral-500 font-semibold italic flex items-center justify-center gap-1 select-none py-1 border border-neutral-800 rounded-lg bg-neutral-900/30">
                              <CheckCircle2 size={12} className="text-emerald-500" /> Transaksi Selesai
                            </span>
                          )}
                          {b.status === 'cancelled' && (
                            <span className="text-xs text-neutral-500 font-semibold italic flex items-center justify-center gap-1 select-none py-1 border border-neutral-800 rounded-lg bg-neutral-900/30">
                              <XCircle size={12} /> Pesanan Dibatalkan
                            </span>
                          )}
                          {b.status === 'waiting_payment' && (
                            <div className="flex flex-col gap-1.5 w-full">
                              <span className="text-xs text-amber-500 font-semibold italic text-center pb-1 select-none">
                                &bull; Menunggu Bukti Transfer...
                              </span>
                              <button 
                                onClick={() => updateBookingStatus(b.id, 'payment_verified')}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold cursor-pointer text-center transition-all"
                              >
                                Sahkan Manual (Bypass)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ------------------ MENU 4: CUSTOMERS PROFILE CONTENT ------------------ */}
              {activeTab === 'customer' && (
                <div className="space-y-6">
                  <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Verifikasi Identitas Resmi KTP / Syarat KTM</h3>
                    <p className="text-xs text-neutral-500 leading-normal">
                      Setiap penyewaan wajib dijamin dengan validasi KTP asli. Periksa secara rinci kesesuaian nama pendaftar dengan fisik foto identitas demi mengamankan logistik Outrent.
                    </p>
                  </div>

                  {users.length === 0 ? (
                    <div className="bg-neutral-950/40 border border-neutral-800 p-12 text-center rounded-2xl text-neutral-500 text-sm">
                      Kustomer belum tersedia.
                    </div>
                  ) : (
                    users.map((u) => (
                      <div 
                        key={u.id} 
                        className="bg-[#0d110e]/40 rounded-2xl border border-[#1a231c]/60 p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-inner"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-lg leading-tight">{u.name}</h4>
                          <p className="text-stone-400 font-medium text-xs font-mono">{u.email}</p>
                          
                          {u.identityUrl ? (
                            <button 
                              type="button"
                              onClick={() => setSelectedKtpImg(u.identityUrl)}
                              className="mt-2 text-xs text-[#FF5500] font-bold hover:underline hover:text-stone-100 cursor-pointer inline-flex items-center gap-1.5 focus:outline-none bg-[#FF5500]/5 px-3 py-1.5 rounded-lg border border-[#FF5500]/10"
                            >
                              <Eye size={12} /> Tinjau Foto KTP Pelanggan
                            </button>
                          ) : (
                            <p className="mt-2 text-xs text-stone-600 font-semibold uppercase tracking-wider">Identitas jaminan KTP belum diunggah</p>
                          )}
                        </div>

                        <div className="flex items-center">
                          {u.isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none">
                              <CheckCircle2 size={12} /> Terverifikasi ✓
                            </span>
                          ) : u.identityUrl ? (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleVerifyUser(u.id, true)} 
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                              >
                                Sah & Akses (Approve)
                              </button>
                              <button 
                                onClick={() => handleVerifyUser(u.id, false)} 
                                className="px-4 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-xl text-xs font-semibold py-2 transition-all cursor-pointer"
                              >
                                Tolak Berkas
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs border border-neutral-800 px-4 py-2 rounded-xl text-stone-500 font-bold bg-neutral-950 select-none">
                              Menunggu Unggahan Akun
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ------------------ MENU 5: DEDICATED PAYMENT VERIFICATION ------------------ */}
              {activeTab === 'payment_verification' && (
                <div className="space-y-6">
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-mono">Panel Khusus Validasi Bayar & Bukti Transfer</h3>
                    <p className="text-xs text-stone-400 leading-normal font-sans">
                      Mengisolasi pencarian khusus untuk transaksi berjalan dengan status Menunggu Pembayaran atau Ungguhan bukti transaksi. Periksa slip transfer bank penyewa sebelum menyetujui logistik pickup.
                    </p>
                  </div>

                  {bookings.filter(b => b.status === "payment_verified" || b.status === "waiting_payment").length === 0 ? (
                    <div className="bg-neutral-900/40 border border-neutral-800 p-12 text-center rounded-2xl text-stone-550 text-sm">
                      Semua transaksi telah divalidasi. Tidak ada bukti transfer pending masuk.
                    </div>
                  ) : (
                    bookings.filter(b => b.status === "payment_verified" || b.status === "waiting_payment").map((b) => (
                      <div 
                        key={b.id} 
                        className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-inner"
                      >
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-[#FF5500] bg-neutral-950 px-2.5 py-0.5 rounded border border-neutral-800">
                              {b.bookingNumber}
                            </span>
                            <span className="text-xs text-stone-450 font-medium">Total Tarif: <b className="text-[#FF5500] font-extrabold text-sm">Rp {b.total_price?.toLocaleString("id-ID") || b.total?.toLocaleString("id-ID")}</b></span>
                          </div>

                          <div>
                            <p className="text-sm font-bold text-[#faf9f6]/95">Penyewa: {b.customer_name || b.custName}</p>
                            <p className="text-xs text-stone-500 font-mono mt-0.5">Item: {typeof b.items === 'string' ? b.items : b.items?.map((bi: any) => bi.itemName).join(", ")}</p>
                          </div>

                          {/* Render proof of payment check */}
                          {b.payments && b.payments.map((p: any) => p.proofUrl && (
                            <div key={p.id} className="pt-2">
                              <button 
                                onClick={() => setSelectedProofImg(p.proofUrl)}
                                className="text-xs text-[#FF5500] hover:underline hover:text-stone-100 font-bold flex items-center gap-1.5 bg-[#FF5500]/5 border border-[#FF5500]/10 px-3 py-1.5 rounded-lg"
                              >
                                <Eye size={12} /> Buka Bukti Slip Transfer Bank
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'ready_pickup')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold block text-center cursor-pointer active:scale-95 transition-all text-nowrap"
                          >
                            Sah & Siapkan Barang
                          </button>
                          
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'cancelled')}
                            className="px-4 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                          >
                            Tolak & Batalkan Sewa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ------------------ MENU 6: REPORTING CENTER ------------------ */}
              {activeTab === 'reports' && (
                <div id="reporting-print-section" className="space-y-8 select-none">
                  
                  {/* Reporting Header Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-950 border border-neutral-800 p-6 rounded-2xl">
                    <div>
                      <h3 className="text-md font-bold text-white uppercase tracking-wider">Pusat Laporan & Rekapitulasi Keuangan</h3>
                      <p className="text-xs text-neutral-500 mt-1">Saring frekuensi buku pesanan, omset kotor, rata-rata transaksi harian.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400 whitespace-nowrap">Filter Periode:</span>
                      <div className="flex bg-black border border-neutral-850 p-1 rounded-xl">
                        {(['harian', 'mingguan', 'bulanan'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setReportPeriod(p)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${reportPeriod === p ? 'bg-[#FF5500] text-white border border-[#FF5500]/20' : 'text-stone-500 hover:text-stone-200'}`}
                          >
                            {p === 'harian' ? "Hari Ini" : p === 'mingguan' ? "Minggu Ini" : "Bulan Ini"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Operational indicators cards representing summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-wider truncate">Volume Transaksi</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-black text-white mt-1.5 truncate block" title={`${totalBookingCount} Sewa`}>
                          {totalBookingCount} Sewa
                        </p>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-stone-500 mt-1.5 truncate">Berhasil tanpa dibatalkan</p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-wider truncate">Total Pendapatan</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-black text-[#FF5500] mt-1.5 truncate block" title={`Rp ${totalRevenue.toLocaleString("id-ID")}`}>
                          Rp {totalRevenue.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-stone-500 mt-1.5 truncate">Akumulasi sewa yang sah</p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-wider truncate">Rata-rata Tiket</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-black text-white mt-1.5 truncate block" title={`Rp ${avgTicketSize.toLocaleString("id-ID")}`}>
                          Rp {avgTicketSize.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-stone-500 mt-1.5 truncate">Nilai spending per transaksi</p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl overflow-hidden flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-wider truncate">Keterlambatan/Denda</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-black text-white mt-1.5 truncate block" title={`${delayCount} Unit`}>
                          {delayCount} Unit
                        </p>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-stone-500 mt-1.5 truncate">Pelanggar syarat tenggat sewa</p>
                    </div>
                  </div>

                  {/* Summary detailed tabular listing */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 overflow-hidden">
                    <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-mono">Tabel Log Book Transaksi Sah</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-neutral-800 text-stone-400 uppercase tracking-widest text-[9px] font-extrabold pb-3">
                            <th className="pb-3 text-left">Kode Booking</th>
                            <th className="pb-3 text-left">Pelanggan</th>
                            <th className="pb-3 text-left">Tanggal Sewa</th>
                            <th className="pb-3 text-left">Status</th>
                            <th className="pb-3 text-right">Nilai Transaksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/40">
                          {reportsList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-stone-500 italic">Belum ada transaksi di rentang waktu terpilih</td>
                            </tr>
                          ) : (
                            reportsList.map((rep) => (
                              <tr key={rep.id} className="text-stone-300 hover:bg-neutral-950/40">
                                <td className="py-3.5 font-mono font-bold text-[#FF5500]">{rep.bookingNumber}</td>
                                <td className="py-3.5 truncate font-bold text-white">{rep.customer_name || rep.custName}</td>
                                <td className="py-3.5 font-medium">{new Date(rep.start_date || rep.start).toLocaleDateString("id-ID")} - {new Date(rep.end_date || rep.end).toLocaleDateString("id-ID")}</td>
                                <td className="py-3.5">
                                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border border-neutral-800 bg-neutral-950 text-stone-300">
                                    {rep.status}
                                  </span>
                                </td>
                                <td className="py-3.5 text-right font-extrabold text-stone-100">Rp {rep.total_price?.toLocaleString("id-ID") || rep.total?.toLocaleString("id-ID")}</td>
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
                <div className="space-y-6">
                  <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Pusat Laboratorium Pemeliharaan & Higienitas Alat</h3>
                    <p className="text-xs text-neutral-500 leading-normal">
                      Menampilkan unit fisik inventori yang sedang berada dalam bengkel untuk pencucian sanitasi berkala, jahit tambal kebocoran tenda, atau penambalan goresan pasca digunakan di gunung.
                    </p>
                  </div>

                  {totalInMaintenance === 0 ? (
                    <div className="bg-neutral-950/40 border border-neutral-800 p-12 text-center rounded-2xl text-neutral-500 text-sm">
                      Semua unit dalam keadaan sehat, prima, dan siap disewa! Tidak ada unit di ruang perawatan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inventoryItems.map((item) => {
                        const maintUnits = item.units?.filter((u: any) => u.status === "maintenance") || [];
                        if (maintUnits.length === 0) return null;
                        
                        return maintUnits.map((unit: any) => (
                          <div 
                            key={unit.id} 
                            className="bg-neutral-950/40 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-inner"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-center bg-neutral-900 p-2.5 rounded-lg border border-neutral-850">
                                <span className="font-mono text-xs font-bold text-white">{unit.unitCode}</span>
                                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                                  MAINTENANCE
                                </span>
                              </div>
                              <p className="text-xs text-neutral-300 font-bold pt-1">Produk Pokok: {item.name}</p>
                              <p className="text-[11px] text-neutral-500 italic leading-relaxed">
                                Catatan: {unit.condition || "Pembersihan lumpur rumbah, pencucian berkala."}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-neutral-850 flex justify-between items-center">
                              <span className="text-[10px] text-neutral-550 block text-neutral-500 uppercase tracking-widest font-bold">Biaya: Rp 0 (Routine)</span>
                              <button
                                onClick={() => handleUpdateUnitStatus(unit.id, "available", "Prima - Steril Siap Pakai")}
                                className="px-3 py-1.5 bg-white text-black font-bold rounded-lg text-[10px] uppercase cursor-pointer hover:bg-neutral-205 transition-all text-nowrap"
                              >
                                Selesaikan Perawatan &rArr; Ready
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
                <div className="space-y-6">
                  <div className="bg-[#0b0f0c] p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Pusat Pengelolaan Unit Rusak & Penyelamatan Inventori</h3>
                    <p className="text-xs text-neutral-500 leading-normal">
                      Mengawasi, mencatat level kerusakan fisik, dan mengevaluasi status rongsokan unit penyewaan. Tentukan keputusan untuk menginvestasikan biaya jahit/cuci perawatan ulang, menghibahkan/menjual rongsok (dispose), atau mengganti baru secara utuh.
                    </p>
                  </div>

                  {totalDamaged === 0 ? (
                    <div className="bg-[#0b0f0c]/40 p-12 text-center rounded-2xl text-neutral-500 text-sm">
                      Luar biasa! Tidak ada unit alat gunung dalam keadaan rusak/cacat. Semua siap operasional.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {inventoryItems.flatMap((item) => {
                        const damagedUnits = item.units?.filter((u: any) => u.status === "damaged") || [];
                        return damagedUnits.map((unit: any) => {
                          const tingkat = damageTingkat[unit.id] || "Sedang";
                          const catatan = damageCatatan[unit.id] || "";
                          
                          return (
                            <div 
                              key={unit.id} 
                              className="bg-[#0b0f0c]/60 p-6 rounded-2xl flex flex-col justify-between gap-5 shadow-inner"
                            >
                              <div className="space-y-4">
                                <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-extrabold text-[#FF5500] uppercase bg-neutral-900 px-2.5 py-1 rounded">
                                      {unit.unitCode}
                                    </span>
                                  </div>
                                  <span className="text-[10px] uppercase font-extrabold px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 animate-pulse">
                                    DAMAGED
                                  </span>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-xs text-stone-400 font-medium font-mono">Model / Tipe Produk:</p>
                                  <p className="text-sm font-bold text-white">{item.name}</p>
                                  <p className="text-[11px] text-[#FF5500] font-semibold">{item.category?.name || "Peralatan Mendaki"}</p>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-xs text-stone-400 font-medium font-mono">Terdeteksi Rusak Sejak:</p>
                                  <p className="text-xs font-semibold text-neutral-300 font-mono">
                                    {unit.updatedAt ? new Date(unit.updatedAt).toLocaleDateString("id-ID") : new Date().toLocaleDateString("id-ID")}
                                  </p>
                                </div>

                                {/* Form inputs values */}
                                <div className="grid grid-cols-1 gap-3.5 pt-2 border-t border-neutral-800">
                                  <div>
                                    <label className="block text-[10px] font-extrabold text-[#FF5500] uppercase tracking-widest mb-1.5 leading-none">Tingkat Kerusakan:</label>
                                    <select
                                      value={tingkat}
                                      onChange={(e) => setDamageTingkat(prev => ({ ...prev, [unit.id]: e.target.value }))}
                                      className="w-full px-3 py-2 text-xs bg-neutral-950 text-stone-250 border border-neutral-800 rounded-xl focus:border-[#FF5500] focus:outline-none focus:ring-0 cursor-pointer font-bold"
                                    >
                                      <option value="Ringan">Minder / Ringan (Sobek Kecil, Kotor Kerak)</option>
                                      <option value="Sedang">Sedang (Patah Frame, Kebocoran Air)</option>
                                      <option value="Berat">Parah / Rusak Berat (Robek Total, Hilang Part UTAMA)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-extrabold text-[#FF5500] uppercase tracking-widest mb-1.5 leading-none font-mono">Rincian Deskripsi Kerusakan Fisik:</label>
                                    <textarea
                                      value={catatan}
                                      onChange={(e) => setDamageCatatan(prev => ({ ...prev, [unit.id]: e.target.value }))}
                                      placeholder="Contoh: FRAME PENYANGGA TENDA PATAH 1 RUAS KARENA ANGIN KENCANG..."
                                      rows={2}
                                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-950 text-white border border-neutral-800 rounded-xl focus:border-[#FF5500] focus:outline-none placeholder-stone-600 leading-normal"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-[#1a231c]/60 space-y-2.5">
                                <p className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">PILIH TINDAKAN PENYELAMATAN UNIT:</p>
                                <div className="grid grid-cols-3 gap-2">
                                  <button
                                    onClick={() => handleDamageDecision(unit.id, "maintenance", tingkat, catatan)}
                                    className="px-2.5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col justify-center items-center text-center gap-1 cursor-pointer border border-blue-500/15"
                                  >
                                    <span>REPAIR</span>
                                    <span className="text-[8px] text-blue-500 font-medium capitalize">Kirim Ke Perawatan</span>
                                  </button>

                                  <button
                                    onClick={() => handleDamageDecision(unit.id, "disposed", tingkat, catatan)}
                                    className="px-2.5 py-2.5 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col justify-center items-center text-center gap-1 cursor-pointer border border-amber-500/15"
                                  >
                                    <span>DISPOSE</span>
                                    <span className="text-[8px] text-amber-600 font-medium capitalize">Buang Dari Stok</span>
                                  </button>

                                  <button
                                    onClick={() => handleDamageDecision(unit.id, "available", tingkat, `Diganti unit baru pasca rusak ${tingkat}`)}
                                    className="px-2.5 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col justify-center items-center text-center gap-1 cursor-pointer border border-emerald-500/15"
                                  >
                                    <span>REPLACE</span>
                                    <span className="text-[8px] text-emerald-500 font-medium capitalize">Beli Baru & Ganti</span>
                                  </button>
                                </div>
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
                  <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden shadow-inner flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase tracking-widest font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded">
                        DEMO SANDBOX COCKPIT
                      </span>
                      <h3 className="text-md font-bold text-white uppercase tracking-wider pt-2">Simulasi Keadaan & Sinkronisasi Cepat</h3>
                      <p className="text-xs text-neutral-500 leading-normal max-w-xl">
                        Uji coba alur transaksi secara praktis! Simulator ini memungkinkan Anda menguji coba verifikasi, log audit, penalti denda dsb secara instan tanpa perlu mendaftar banyak akun asli.
                      </p>
                    </div>

                    <button 
                      onClick={handleResetData}
                      className="px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl border border-red-500/20 transition-all font-bold text-xs uppercase cursor-pointer"
                    >
                      Reset Simulat Data
                    </button>
                  </div>

                  {/* Actions cockpit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-950/60 border border-neutral-800 p-6 rounded-2xl space-y-4 shadow-sm">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-800">
                        <PlusCircle size={14} className="text-blue-400" /> Pembuatan Event Acak (Mock Generator)
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Simulasikan pelanggan melakukan check-out peralatan sewa atau pendaftaran berkas KTP palsu untuk menguji fungsionalitas visual denda dsb.
                      </p>

                      <div className="flex flex-wrap gap-2.5 pt-2">
                        <button
                          onClick={simulateRandomBooking}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
                        >
                          + Simulasikan Sewa Baru
                        </button>
                        <button
                          onClick={simulateRandomCustomer}
                          className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-neutral-700"
                        >
                          + Simulasikan Pelanggan Baru
                        </button>
                      </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-neutral-800">
                          <Activity size={14} className="text-[#FF5500]" /> Log Tindakan Riwayat Sistem
                        </h4>
                        
                        {/* Stream of system notifications / logs */}
                        <div className="space-y-2 mt-4 max-h-36 overflow-y-auto pr-1">
                          {eventLogs.map((log, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px] font-mono border-b border-neutral-800/40 pb-1.5">
                              <span className="truncate max-w-[70%] text-stone-300">
                                <b className="text-[#FF5500] mr-1">[{log.type}]</b> {log.message}
                              </span>
                              <span className="text-[9px] text-stone-550 shrink-0">{new Date(log.timestamp).toLocaleTimeString("id-ID")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------ MENU 9: SYSTEM CONFIGURATION SETTINGS ------------------ */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-mono">Konfigurasi Hukum & Ketentuan Toko</h3>
                    <p className="text-xs text-neutral-500 leading-normal">
                      Sesuaikan denda pelanggaran telat pengembalian, nominal jaminan deposit fisik, dan cabang utama kustomisasi Outrent.
                    </p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); toast.success("Sistem dikonfigurasi & disimpan!"); addLocalLog("SISTEM", "Konfigurasi toko diperbarui"); }} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-6 max-w-2xl shadow-inner">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2 leading-none">Biaya Denda Keterlambatan (Rp/Hari):</label>
                        <input
                          type="number"
                          value={penaltyRate}
                          onChange={(e) => setPenaltyRate(e.target.value)}
                          className="w-full px-4 py-3 text-xs bg-neutral-950 text-white border border-neutral-800 rounded-xl focus:ring-1 focus:ring-[#FF5500] focus:outline-none focus:border-[#FF5500] font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2 leading-none">Jaminan Deposit Unit default (Rp):</label>
                        <input
                          type="number"
                          value={rentalDeposit}
                          onChange={(e) => setRentalDeposit(e.target.value)}
                          className="w-full px-4 py-3 text-xs bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:ring-1 focus:ring-[#FF5500] focus:outline-none focus:border-[#FF5500] font-mono font-bold"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#FF5500] uppercase tracking-wider mb-2 leading-none font-mono">Cabang Utama Toko:</label>
                      <input
                        type="text"
                        value={mainBranch}
                        onChange={(e) => setMainBranch(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-neutral-950 border border-neutral-800 text-white rounded-xl focus:ring-1 focus:ring-[#FF5500] focus:outline-none focus:border-[#FF5500]"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3 bg-neutral-955/65 border border-neutral-800 p-4 rounded-xl">
                      <input
                        type="checkbox"
                        id="verify-check"
                        checked={requireVerify}
                        onChange={(e) => setRequireVerify(e.target.checked)}
                        className="w-4 h-4 text-[#FF5500] border-neutral-800 bg-neutral-950 rounded focus:ring-[#FF5500] cursor-pointer accent-[#FF5500]"
                      />
                      <label htmlFor="verify-check" className="text-xs text-neutral-300 font-semibold cursor-pointer select-none">
                        Wajibkan Pengesahan Identitas Berkas KTP Sebelum Berhak Menyewa Alat
                      </label>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#FF5500] hover:bg-[#FF3300] border border-[#FF5500]/25 text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-sm shadow-[#FF5500]/10"
                      >
                        Simpan Perubahan
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
        <div id="penalty-dialog-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1">
              Bebankan Denda Keterlambatan / Kerusakan
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-normal">
              Reservasi {penaltyBooking.bookingNumber} (&bull; {penaltyBooking.customer_name || penaltyBooking.custName}) dibebankan denda pertanggungjawaban fisik.
            </p>

            <form onSubmit={handleAssignPenalty} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Alasan Pelanggaran:</label>
                <select
                  value={penaltyReason}
                  onChange={e => setPenaltyReason(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-neutral-950 border border-neutral-800 rounded-xl focus:ring-1 focus:ring-[#FF5500] focus:outline-none text-white select-none"
                >
                  <option value="Keterlambatan Pengembalian (1 Hari)">Keterlambatan Pengembalian (1 Hari)</option>
                  <option value="Keterlambatan Pengembalian (2 Hari)">Keterlambatan Pengembalian (2 Hari)</option>
                  <option value="Kerusakan Ringan pada Peralatan">Kerusakan Ringan pada Peralatan (Gores / Robek)</option>
                  <option value="Tenda Rusak/Sobek Parah (Pecah Frame)">Tenda Rusak/Sobek Parah (Pecah Frame)</option>
                  <option value="Ganti Unit Total (Kehilangan Unit Sewa)">Ganti Unit Total (Kehilangan Unit Sewa)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Nilai Charge Denda (Rupiah):</label>
                <input
                  type="number"
                  placeholder="Contoh: 50000"
                  value={penaltyAmount}
                  onChange={e => setPenaltyAmount(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-neutral-950 border border-neutral-800 rounded-xl focus:ring-1 focus:ring-[#FF5500] focus:outline-none focus:border-[#FF5500] font-bold font-mono text-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPenaltyBooking(null)}
                  className="flex-1 px-4 py-2.5 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl hover:bg-neutral-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#FF5500] hover:bg-[#FF3300] border border-[#FF5500]/25 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm shadow-[#FF5500]/10"
                >
                  Sahkan Denda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ MODAL 2: DETAIL LOG MAINTENANCE FORM MODAL ------------------ */}
      {maintenanceUnit && (
        <div id="maintenance-dialog-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1">
              Catat Pemeliharaan Fisik Alat
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-normal">
              Pindahkan unit berkode fisik <code className="font-extrabold text-[#a3b18a]">{maintenanceUnit.unitCode}</code> ke ruang perbaikan, sanitasi, pembersihan atau ganti frame robek.
            </p>

            <form onSubmit={handleLogMaintenance} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Kriteria Tindakan:</label>
                <select
                  value={maintenanceStatus}
                  onChange={e => setMaintenanceStatus(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#0d110e] border border-[#1a231c]/60 text-white rounded-xl focus:ring-1 focus:ring-[#588157] focus:outline-none"
                >
                  <option value="routine">Routine - Pencucian / Sterilisasi sanitasi</option>
                  <option value="repair">Repair - Jahit Tambal tenda bocor / Aus</option>
                  <option value="replaced">Replaced - Pergantian Frame / Suku Cadang</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Catatan Detail Perawatan:</label>
                <textarea
                  placeholder="Contoh: Pembersihan lumpur berat sisa mendaki gunung, pencucian wangi steril."
                  value={maintenanceNotes}
                  onChange={e => setMaintenanceNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 text-xs bg-[#0d110e] border border-[#1a231c]/60 text-white rounded-xl focus:ring-1 focus:ring-[#588157] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Biaya Logging Tambahan (Rupiah):</label>
                <input
                  type="number"
                  placeholder="Boleh diisi 0 jika tidak menderita biaya"
                  value={maintenanceCost}
                  onChange={e => setMaintenanceCost(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-[#0d110e] border border-[#1a231c]/60 text-white rounded-xl focus:ring-1 focus:ring-[#588157] focus:outline-none focus:border-[#588157] font-mono font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMaintenanceUnit(null)}
                  className="flex-1 px-4 py-2.5 bg-neutral-850 text-neutral-305 text-xs font-bold rounded-xl hover:bg-neutral-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#2d4a36] hover:bg-[#1f3325] border border-[#3a5a40]/30 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm shadow-[#2d4a36]/10"
                >
                  Kirim ke Perawatan
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
          className="fixed inset-0 z-55 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-350">Preview Berkas Foto Jaminan KTP Pelanggan</span>
              <button 
                onClick={() => setSelectedKtpImg(null)}
                className="text-neutral-500 hover:text-white font-extrabold text-xs uppercase cursor-pointer"
              >
                Tutup
              </button>
            </div>
            
            <div className="p-4 bg-neutral-900 rounded-2xl flex items-center justify-center border border-neutral-850">
              <img 
                src={`/uploads/${selectedKtpImg}`} 
                alt="Jaminan KTP asli" 
                className="max-h-80 rounded-xl object-contain shadow-md"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback sample image
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedKtpImg(null)}
                className="px-5 py-2 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ MODAL 4: PROOF OF PAYMENT SLIP ------------------ */}
      {selectedProofImg && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-55 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-350">Preview Slip / Bukti Pembayaran Digital</span>
              <button 
                onClick={() => setSelectedProofImg(null)}
                className="text-neutral-500 hover:text-white font-extrabold text-xs uppercase cursor-pointer"
              >
                Tutup
              </button>
            </div>
            
            <div className="p-4 bg-neutral-900 rounded-2xl flex items-center justify-center border border-neutral-850">
              <img 
                src={`/uploads/${selectedProofImg}`} 
                alt="Bukti Transfer Outrent Bank" 
                className="max-h-80 rounded-xl object-contain shadow-md"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback sample receipt image
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedProofImg(null)}
                className="px-5 py-2 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ MODAL 5: TAMBAH PRODUCT BARU ------------------ */}
      {showAddInv && (
        <div id="add-inv-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl relative animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1">
              Tambahkan Katalog & Kode Unit Fisik
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-normal">
              Isikan detail produk sewa dan daftar nomor unit fisik berkode unik supaya dapat disimpan di database inventori.
            </p>

            <form onSubmit={handleAddInventory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Pilih Kategori Katalog:</label>
                  <select
                    value={newInv.categoryId}
                    onChange={e => setNewInv({ ...newInv, categoryId: e.target.value })}
                    className="w-full px-4 py-3 text-xs bg-[#0d110e] border border-[#1a231c]/60 text-white rounded-xl focus:ring-1 focus:ring-[#588157] focus:outline-none focus:border-[#588157]"
                    required
                  >
                    <option value="" disabled>-- Pilih Kategori --</option>
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
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Nama Barang:</label>
                  <input
                    type="text"
                    value={newInv.name}
                    onChange={e => setNewInv({ ...newInv, name: e.target.value })}
                    placeholder="Contoh: Carrier Deuter 50L"
                    className="w-full px-4 py-3 text-xs bg-[#0d110e] border border-[#1a231c]/60 text-white rounded-xl focus:ring-1 focus:ring-[#588157] focus:outline-none focus:border-[#588157]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Harga Sewa / Hari (Rupiah):</label>
                <input
                  type="number"
                  value={newInv.price}
                  onChange={e => setNewInv({ ...newInv, price: e.target.value })}
                  placeholder="Contoh: 35000"
                  className="w-full px-4 py-3 text-xs bg-[#0d110e] border border-[#1a231c]/60 text-white rounded-xl focus:ring-1 focus:ring-[#588157] focus:outline-none focus:border-[#588157] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Penjelasan Detail (Deskripsi):</label>
                <textarea
                  value={newInv.desc}
                  onChange={e => setNewInv({ ...newInv, desc: e.target.value })}
                  placeholder="Ukuran kantung, bahan polyester anti bocor, dsb."
                  rows={2}
                  className="w-full px-4 py-3 text-xs bg-[#0d110e] border border-[#1a231c]/60 text-white rounded-xl focus:ring-1 focus:ring-[#588157] focus:outline-none focus:border-[#588157]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Kode Seri Unit (Pisahkan dengan koma):</label>
                <textarea
                  value={newInv.codes}
                  onChange={e => setNewInv({ ...newInv, codes: e.target.value })}
                  placeholder="Contoh: UNT-CRT-001, UNT-CRT-002, UNT-CRT-003"
                  rows={2}
                  className="w-full px-4 py-3 text-xs bg-[#0d110e] border border-[#1a231c]/60 text-white rounded-xl focus:ring-1 focus:ring-[#588157] focus:outline-none focus:border-[#588157] font-mono font-bold"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddInv(false)}
                  className="flex-1 px-4 py-2.5 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl hover:bg-neutral-750 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#2d4a36] hover:bg-[#1f3325] border border-[#3a5a40]/30 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm shadow-[#2d4a36]/10"
                >
                  Sahkan Katalog Baru
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
