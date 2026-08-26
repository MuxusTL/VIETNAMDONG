import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import type { LoginTokenRow } from '../types.js';

export default function LoginToken() {
  const [tokens, setTokens] = useState<LoginTokenRow[]>([]);
  const [label, setLabel] = useState('');
  const [newToken, setNewToken] = useState<string | null>(null);

  function load() {
    api.loginTokens().then(setTokens);
  }
  useEffect(load, []);

  async function create() {
    const r = await api.createLoginToken(label || 'Login Token');
    setNewToken(r.token);
    setLabel('');
    load();
  }

  async function revoke(id: string) {
    await api.revokeLoginToken(id);
    load();
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
        <i className="bi bi-key text-indigo" /> Login Token
      </h1>
      <p className="text-sm text-muted mb-4">Dùng token này để đăng nhập bot/script vào tài khoản của bạn qua header <code>Authorization: Bearer &lt;token&gt;</code>.</p>

      <div className="bg-gradient-to-b from-surface to-surface2 border border-line rounded-xl p-5 mb-4">
        <div className="flex gap-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Tên gợi nhớ (VD: Bot Discord)" className="flex-1 bg-surface2 border border-line rounded-lg px-3 py-2 text-sm" />
          <button onClick={create} className="bg-indigo text-white text-sm font-medium px-4 py-2 rounded-lg">Tạo token</button>
        </div>
        {newToken && (
          <div className="mt-3 bg-surface2 border border-line rounded-lg p-3 text-xs">
            <div className="text-muted mb-1">Token mới (chỉ hiện 1 lần, lưu lại ngay):</div>
            <div className="font-mono break-all">{newToken}</div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-b from-surface to-surface2 border border-line rounded-xl overflow-hidden">
        {tokens.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3 border-b border-line last:border-0">
            <div>
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-[10px] text-muted font-mono">{t.revoked_at ? 'Đã thu hồi' : t.last_used_at ? `Dùng lần cuối ${t.last_used_at}` : 'Chưa dùng'}</div>
            </div>
            {!t.revoked_at && <button onClick={() => revoke(t.id)} className="text-xs text-rose">Thu hồi</button>}
          </div>
        ))}
        {tokens.length === 0 && <div className="px-4 py-6 text-sm text-muted text-center">Chưa có token nào.</div>}
      </div>
    </div>
  );
}
