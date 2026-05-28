import { useEffect, useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import { useStore } from "../../store";
import { toast } from "react-toastify";
import { Search, Filter, ShoppingBag, AlertCircle, Tent, Backpack, Flame, Package, Flashlight } from "lucide-react";

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
    }, 45000); // Polling reduced to 45s for optimization
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

  // Derive categories dynamically from products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  // Filter products by search & category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white transition-colors">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-16 space-y-12 animate-fade-in">
        
        <header className="pb-8 space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 text-center lg:text-left">
            <div>
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1">
                  Katalog Alat Outdoor
                </h1>
                <button 
                  onClick={() => fetchInventory(false)}
                  disabled={syncing}
                  className="p-1.5 text-stone-400 hover:text-[#FF5500] transition-colors cursor-pointer rounded-lg hover:bg-[#121212]"
                  title="Perbarui Stok Barang"
                >
                  <svg className={`w-4 h-4 ${syncing ? 'animate-spin text-[#FF5500]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                  </svg>
                </button>
              </div>
              <p className="text-stone-400 mt-2 text-sm max-w-2xl leading-relaxed">
                Pilih perlengkapan berkualitas untuk petualangan aman dan nyaman. 
                {lastSync && <span className="font-mono text-[10px] ml-2 text-stone-300 bg-[#121212] px-1.5 py-0.5 rounded uppercase tracking-widest">Update: {lastSync}</span>}
              </p>
            </div>
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari perlengkapan..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#121212] text-white rounded-xl text-sm focus:ring-1 focus:ring-[#FF5500] focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div className="relative w-full sm:w-auto flex items-center bg-[#121212] rounded-xl px-3 py-1 shadow-sm">
                <Filter className="text-[#FF5500] mr-2" size={15} />
                <select 
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-sm w-full outline-none py-1.5 cursor-pointer font-bold text-white appearance-none pr-6"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="text-white bg-[#121212]">{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-[#121212] rounded-3xl p-5 h-[300px] flex flex-col justify-between animate-pulse">
                <div>
                  <div className="w-14 h-14 bg-stone-800 rounded-2xl mb-4"></div>
                  <div className="w-3/4 h-5 bg-stone-800 rounded mb-2"></div>
                  <div className="w-full h-12 bg-stone-800/50 rounded mb-4"></div>
                </div>
                <div className="w-full h-10 bg-stone-800 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-[#121212] rounded-full flex items-center justify-center mb-4 text-stone-400">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">Tidak ada item ditemukan</h3>
            <p className="text-sm text-stone-450 max-w-md">Item yang Anda cari "{searchQuery}" tidak tersedia untuk kategori ini. Coba kata kunci yang berbeda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-[#121212] rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-5">
                    <div className="bg-[#1d1d1d] w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-inner">
                      {p.category.includes('Tenda') ? <Tent size={26} /> : p.category.includes('Tas') ? <Backpack size={26} /> : p.category.includes('Masak') ? <Flame size={26} /> : p.category.includes('Penerangan') ? <Flashlight size={26} /> : <Package size={26} />}
                    </div>
                    {p.available_stock <= 2 && p.available_stock > 0 && (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-450 bg-rose-950/20 px-2 py-1 rounded-lg">
                        <AlertCircle size={10} /> Sisa {p.available_stock}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg text-white mb-1.5 line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-stone-400 mb-6 h-[2.5rem] overflow-hidden text-ellipsis leading-relaxed">
                    {p.description}
                  </p>
                  
                  <div className="flex items-end justify-between mb-6 pt-4 bg-transparent">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-stone-500">Tarif Harian</p>
                      <p className="font-black text-[#FF5500] text-base mt-0.5">Rp {p.price_per_day.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider font-extrabold text-stone-500">Stok Aktif</p>
                      <p className={"font-bold text-sm mt-0.5 " + (p.available_stock > 0 ? 'text-[#FF5500]' : 'text-stone-500')}>
                        {p.available_stock > 0 ? `${p.available_stock} Unit` : 'Kosong'}
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => addToCart(p)}
                  disabled={p.available_stock === 0}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 ${
                    p.available_stock === 0 
                      ? 'bg-stone-900 text-stone-550 cursor-not-allowed' 
                      : 'bg-[#FF5500] hover:bg-[#FF3300] text-white cursor-pointer'
                  }`}
                >
                  <ShoppingBag size={14} />
                  {p.available_stock === 0 ? "Stok Habis" : "Sewa Sekarang"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
