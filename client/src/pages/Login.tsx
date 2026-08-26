import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (resp: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await api.loginGoogle(response.credential);
            navigate('/dashboard');
          } catch {
          }
        },
      });
      const container = document.getElementById('googleLoginContainer');
      if (container) window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 320, locale: 'vi' });
    };
    document.body.appendChild(script);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-surface to-surface2 border border-line rounded-2xl p-6 text-center">
        <img src="/logo-mark.png" alt="LinkNet" className="w-14 h-14 mx-auto mb-3" />
        <h1 className="font-display font-semibold text-lg">Đăng nhập LinkNet</h1>
        <p className="text-xs text-muted mt-1 mb-5">Kiếm Nova bằng cách hoàn thành nhiệm vụ rút gọn link</p>

        <a
          href="/api/auth/discord"
          className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:brightness-110 text-white text-sm font-medium py-2.5 rounded-lg mb-3 transition"
        >
          <i className="bi bi-discord" /> Đăng nhập bằng Discord
        </a>

        <div id="googleLoginContainer" className="flex justify-center" />

        {!GOOGLE_CLIENT_ID && (
          <p className="text-[11px] text-amber-500 mt-3">
            Chưa cấu hình VITE_GOOGLE_CLIENT_ID trong client/.env — nút Google sẽ không hiển thị.
          </p>
        )}
      </div>
    </div>
  );
}
