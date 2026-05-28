import {StrictMode, Component, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from "./routes";
import './index.css';

// ============================================================================
// CRITICAL SYSTEMS REVISI: SWALLOW ALL WEBSOCKET & HMR CONFLICT ERRORS
// ============================================================================
if (typeof window !== 'undefined') {
  // Catch and swallow all WebSocket connection failures gracefully
  const OriginalWebSocket = window.WebSocket;
  if (OriginalWebSocket) {
    const SafeWebSocket = function (url: string | URL, protocols?: string | string[]) {
      try {
        const ws = new OriginalWebSocket(url, protocols);
        ws.addEventListener('error', (e) => {
          // Silent swallow to prevent unhandled background exception in console
          if (e.preventDefault) e.preventDefault();
        });
        return ws;
      } catch (err) {
        // Return a dummy object if creation fails
        console.warn("[SafeWS] WebSocket instantiation failed, returning stub.", err);
        return {
          addEventListener: () => {},
          removeEventListener: () => {},
          close: () => {},
          send: () => {},
          readyState: 3, // CLOSED
        };
      }
    };
    // Proper prototype chain mirroring
    SafeWebSocket.prototype = OriginalWebSocket.prototype;
    Object.setPrototypeOf(SafeWebSocket, OriginalWebSocket);
    
    try {
      Object.defineProperty(window, 'WebSocket', {
        value: SafeWebSocket,
        configurable: true,
        writable: true,
        enumerable: true
      });
    } catch (defErr) {
      try {
        (window as any).WebSocket = SafeWebSocket;
      } catch (assignErr) {
        console.warn("[SafeWS] WebSocket on window has only a getter and cannot be modified. Bypassing interceptor.", assignErr);
      }
    }
  }

  // Globally intercept and reject unhandled websocket errors to prevent crash
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || {};
    const message = typeof reason === 'string' ? reason : String(reason.message || '');
    if (
      message.includes('WebSocket') || 
      message.includes('websocket') || 
      message.includes('ws://') || 
      message.includes('wss://') ||
      message.includes('HMR')
    ) {
      console.warn("[SafeWS] Swallowed unhandled Promise rejection representing background WS disconnect", message);
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (
      message.includes('WebSocket') || 
      message.includes('websocket') || 
      message.includes('ws://') || 
      message.includes('wss://')
    ) {
      console.warn("[SafeWS] Swallowed raw WebSocket global error events", message);
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

// ============================================================================
// REMOVED DEV ENDPOINT MAPPINGS TO PREVENT PORT 3002 CONFLICTS
// ============================================================================


// ============================================================================
// REACT ERROR BOUNDARY FOR BULLETPROOF RENDERING
// ============================================================================
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught react component error:", error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="fallback-error-boundary-screen" className="min-h-screen flex items-center justify-center bg-neutral-900 text-neutral-100 p-6 font-sans">
          <div className="max-w-md w-full bg-neutral-850 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="h-12 w-12 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Oops, Sesuatu Berjalan Kurang Sempurna</h1>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Sistem mendeteksi error tak terduga pada interface komponen Anda. Tenang, data sewa outdoor Anda tetap aman.
              </p>
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800/60 max-h-32 overflow-y-auto text-left">
              <code className="text-[10px] text-red-400 font-mono break-all leading-relaxed whitespace-pre-wrap">
                {this.state.error?.toString() || "Unknown layout processing error"}
              </code>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-orange-600/10 active:scale-95"
            >
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  </StrictMode>,
);
