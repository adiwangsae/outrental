import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStore } from "../store";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);
  return null;
}

export default function AppLayout() {
  const { user } = useStore();
  const isDemo = user?.email?.startsWith("demo.");
  const location = useLocation();

  useEffect(() => {
    const isDashboardOrAuth = 
      location.pathname.startsWith("/admin") || 
      location.pathname.startsWith("/customer") || 
      location.pathname === "/login" || 
      location.pathname === "/register";

    if (isDashboardOrAuth) {
      if ((window as any).lenis) {
        (window as any).lenis.destroy();
        delete (window as any).lenis;
      }
      return;
    }

    if ((window as any).lenis) {
      return;
    }

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    (window as any).lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans selection:bg-[#FF6600]/30">
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen flex flex-col"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      
      {isDemo && (
        <>
          <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-neutral-950/90 text-white text-xs px-3.5 py-1.5 rounded-full border border-neutral-800 shadow-md backdrop-blur-md select-none">
            <Sparkles size={12} className="text-[#FF6600] animate-pulse" />
            <span className="font-semibold">Demo Mode</span>
            <span className="opacity-40">|</span>
            <span className="text-neutral-300 font-medium text-[10px] md:text-xs">Uji Simulasi Sistem</span>
          </div>
        </>
      )}

      <ToastContainer position="bottom-right" theme="dark" hideProgressBar />
    </div>
  );
}
