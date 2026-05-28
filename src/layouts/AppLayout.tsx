import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStore } from "../store";
import { Sparkles } from "lucide-react";

export default function AppLayout() {
  const { user } = useStore();
  const isDemo = user?.email?.startsWith("demo.");

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans selection:bg-[#FF5500]/30">
      <Outlet />
      
      {isDemo && (
        <>
          <div className="fixed bottom-4 left-4 z-55 flex items-center gap-2 bg-neutral-950/90 text-white text-xs px-3.5 py-1.5 rounded-full border border-neutral-800 shadow-md backdrop-blur-xs select-none">
            <Sparkles size={12} className="text-[#FF5500] animate-pulse" />
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
