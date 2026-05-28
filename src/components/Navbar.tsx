import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store";
import { ShoppingCart, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

export default function Navbar() {
  const { user, logout, cart } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar akun');
    navigate('/');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/customer';

  const links = isAdmin ? [
    { name: 'Dashboard', path: '/admin/dashboard' },
  ] : [
    { name: 'Dashboard', path: '/customer/dashboard' },
    { name: 'Katalog', path: '/customer/catalog' },
    { name: 'Riwayat Pesanan', path: '/customer/bookings' }
  ];

  return (
    <header className="sticky top-0 w-full z-45 bg-[#0a0a0a]/95 backdrop-blur-md transition-all shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to={prefix} className="font-extrabold text-xl tracking-tighter text-white select-none hover:opacity-80 transition-opacity">
            OUTRENT<span className="text-[#FF6600]">.</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {links.map(l => {
              const active = location.pathname === l.path || location.pathname.startsWith(l.path + "/");
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`text-xs font-semibold uppercase tracking-wider transition-all select-none py-1.5 ${
                    active 
                      ? 'text-[#FF6600] font-extrabold' 
                      : 'text-stone-450 hover:text-[#FF6600]'
                  }`}
                >
                  {l.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {!isAdmin && (
            <Link to="/customer/checkout" id="cart-nav-btn" className="relative p-2.5 text-stone-300 hover:text-[#FF6600] transition-colors cursor-pointer flex items-center justify-center bg-stone-900 rounded-xl">
              <ShoppingCart size={16} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6600] text-white text-[9px] font-bold flex items-center justify-center rounded-full animate-bounce">
                  {cart.reduce((a, c) => a + c.qty, 0)}
                </span>
              )}
            </Link>
          )}
          <div className="flex items-center gap-3 pl-3 bg-transparent">
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-xs text-neutral-50 leading-tight">{user.name}</p>
              <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1 justify-end select-none">
                {isAdmin ? (
                  <span className="bg-[#FF6600]/10 text-[#FF6600] px-1.5 py-0.5 rounded font-extrabold uppercase text-[8px] tracking-wider">Admin</span>
                ) : user.isDemo ? (
                  <span className="text-[#FF6600] font-semibold flex items-center gap-0.5">
                    <CheckCircle2 size={10} /> Demo Account
                  </span>
                ) : user.isVerified ? (
                  <span className="text-orange-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 size={10} /> Terverifikasi
                  </span>
                ) : (
                  <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                    <AlertTriangle size={10} /> Unverified
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              id="logout-nav-btn"
              className="text-xs font-semibold uppercase tracking-wider bg-stone-900 text-stone-300 px-3.5 py-2 rounded-xl hover:bg-rose-950/20 hover:text-rose-550 transition-all cursor-pointer active:scale-95"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
      {/* Mobile navigation row to support high usability - only show for customers when there are multiple links */}
      {!isAdmin && links.length > 0 && (
        <div className="md:hidden flex items-center justify-around bg-[#121212]/95 px-4 py-2.5">
          {links.map(l => {
            const active = location.pathname === l.path || location.pathname.startsWith(l.path + "/");
            return (
              <Link
                key={l.path}
                to={l.path}
                className={`text-[10px] font-bold uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg select-none ${
                  active 
                    ? 'bg-[#FF6600]/10 text-[#FF6600] font-extrabold' 
                    : 'text-stone-400 hover:text-[#FF6600]'
                }`}
              >
                {l.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
