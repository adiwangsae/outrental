import { useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import { useStore } from "../../store";
import { toast } from "react-toastify";
import { Search, Filter, ShoppingBag, AlertCircle, Tent, Backpack, Flame, Package, Flashlight, Plus } from "lucide-react";

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>("");
  const { cart, setCart, user } = useStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchInventory = async (isSilent = false) => {
    if (!isSilent) setSyncing(true);
    try {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error("Gagal mengambil data katalog");
      const data = await res.json();
      setProducts(data.products || []);
      setLastSync(new Date().toLocaleTimeString("id-ID"));
    } catch (err) {
      if (!isSilent) toast.error("Gagal terhubung ke katalog. Coba lagi nanti.");
    } finally {
      if (!isSilent) setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    const intervalId = setInterval(() => {
      fetchInventory(true);
    }, 45000); 
    return () => clearInterval(intervalId);
  }, []);

  const addToCart = (product: any) => {
    const isDemo = user?.isDemo === true;
    const isVerified = user?.isVerified === true;
    if (!isDemo && !isVerified) {
      toast.error("Upload identitas terlebih dahulu sebelum melakukan penyewaan.");
      return;
    }

    setCart((prev: any) => {
      const existing = prev.find((p: any) => p.item.id === product.id);
      if (existing) {
        if (existing.qty >= product.available_stock) {
          toast.warning(`Maksimal ${product.available_stock} unit untuk item ini.`);
          return prev;
        }
        toast.success(`${product.name} diperbarui di keranjang`);
        return prev.map((p: any) => p.item.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      toast.success(`${product.name} dimasukkan ke keranjang`);
      return [...prev, { item: product, qty: 1 }];
    });
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0B] text-[#F7F7F7] font-sans selection:bg-[#FF7A00] selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-[96px] flex flex-col gap-[64px]">
        
        <header className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-white/10 pb-[32px]">
           <div>
             <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight mb-2">Modul Inventaris</h1>
             <p className="text-[16px] text-[#BDBDBD] font-light">
               Eksplorasi ketersediaan armada peralatan dan lakukan reservasi instan. 
               {lastSync && <span className="ml-2 px-2 py-0.5 rounded-full bg-[#151515] border border-white/5 text-[10px] uppercase font-mono tracking-wider">Sync: {lastSync}</span>}
             </p>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
             <div className="relative w-full sm:w-[300px]">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BDBDBD]" size={16} />
               <input 
                 type="text" 
                 placeholder="Pencarian kode atau nama..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full pl-[44px] pr-4 py-3 bg-[#151515] hover:bg-[#1D1D1D] text-white border border-white/10 rounded-[12px] text-[14px] focus:border-[#FF7A00] focus:outline-none transition-colors"
               />
             </div>
             <div className="relative w-full sm:w-auto flex items-center bg-[#151515] hover:bg-[#1D1D1D] border border-white/10 rounded-[12px] px-4 py-3 transition-colors">
               <Filter className="text-[#FF7A00] mr-2" size={16} />
               <select 
                 value={selectedCategory}
                 onChange={e => setSelectedCategory(e.target.value)}
                 className="bg-transparent text-[14px] w-full outline-none cursor-pointer font-medium text-white appearance-none pr-4"
               >
                 {categories.map(cat => (
                   <option key={cat} value={cat} className="text-black">{cat}</option>
                 ))}
               </select>
             </div>
           </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[24px]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-[#151515] rounded-[24px] border border-white/5 p-6 h-[320px] flex flex-col justify-between animate-pulse">
                 <div className="w-12 h-12 rounded-full bg-white/5 mb-4" />
                 <div className="flex-1" />
                 <div className="w-full h-12 bg-white/5 rounded-[12px]" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-[64px] bg-[#151515] border border-white/5 rounded-[24px] text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-[#BDBDBD]">
              <Search size={24} />
            </div>
            <h3 className="text-[20px] font-medium text-white mb-2">Kriteria Tidak Tersedia</h3>
            <p className="text-[14px] text-[#BDBDBD] font-light max-w-[400px]">Sistem tidak menemukan peralatan dengan parameter pencarian "{searchQuery}" pada kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[24px]">
            {filteredProducts.map(p => (
              <div key={p.id} className="relative bg-[#151515] border border-white/5 hover:border-white/10 rounded-[24px] p-6 transition-all flex flex-col group overflow-hidden">
                {/* Visual Icon Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-[#1D1D1D] rounded-full flex items-center justify-center text-[#BDBDBD] group-hover:text-white group-hover:bg-[#FF7A00]/10 transition-colors">
                    {p.category.includes('Tenda') ? <Tent size={24} /> : p.category.includes('Tas') ? <Backpack size={24} /> : p.category.includes('Masak') ? <Flame size={24} /> : p.category.includes('Penerangan') ? <Flashlight size={24} /> : <Package size={24} />}
                  </div>
                  {p.available_stock <= 2 && p.available_stock > 0 && (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-medium text-[#FF7A00] bg-[#FF7A00]/10 px-3 py-1 rounded-full">
                      <AlertCircle size={10} /> Sisa {p.available_stock}
                    </span>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="font-medium text-[18px] text-white tracking-tight mb-2 leading-[1.3] min-h-[46px] line-clamp-2">
                     {p.name}
                  </h3>
                  <p className="text-[14px] text-[#BDBDBD] font-light mb-6 line-clamp-2 leading-[1.6]">
                    {p.description}
                  </p>
                  
                  <div className="mt-auto flex items-end justify-between mb-8 pb-6 border-b border-white/5">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-medium text-[#BDBDBD] mb-1">Tarif Sewa Pokok</p>
                      <p className="font-medium text-white text-[18px]">Rp {p.price_per_day.toLocaleString('id-ID')} <span className="text-[12px] text-[#BDBDBD]">/ hr</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest font-medium text-[#BDBDBD] mb-1">Status Kuantitas</p>
                      <p className={`font-medium text-[16px] ${p.available_stock > 0 ? 'text-[#FF7A00]' : 'text-red-500'}`}>
                        {p.available_stock > 0 ? `${p.available_stock} Unit` : 'Kosong'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Action */}
                <button 
                  onClick={() => addToCart(p)}
                  disabled={p.available_stock === 0}
                  className={`w-full py-4 rounded-[12px] font-medium text-[14px] transition-all flex items-center justify-center gap-2 ${
                    p.available_stock === 0 
                      ? 'bg-transparent border border-white/5 text-[#BDBDBD] cursor-not-allowed' 
                      : 'bg-white hover:bg-[#F7F7F7] text-black cursor-pointer shadow-sm'
                  }`}
                >
                  <Plus size={16} />
                  {p.available_stock === 0 ? "Stok Kosong" : "Tambah Konfigurasi"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
