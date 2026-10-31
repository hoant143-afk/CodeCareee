import React, { useState } from 'react';
import { LogIn, User } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'teacher@codecare.demo' && password === 'password123') {
      onLogin();
    } else {
      setError('Sai email hoặc mật khẩu (Thử: teacher@codecare.demo / password123)');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-900 text-white mb-3">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Đăng nhập CodeCare</h1>
          <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded mt-2">
            ⚠️ Chế độ trình diễn – dữ liệu mô phỏng. Không phải hệ thống bảo mật thực tế.
          </p>
        </div>

        {error && <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:ring-2 focus:ring-sky-600 outline-none"
              placeholder="teacher@codecare.demo"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:ring-2 focus:ring-sky-600 outline-none"
              placeholder="password123"
            />
          </div>
        </div>

        <button type="submit" className="w-full rounded-xl bg-sky-900 py-2.5 text-xs font-bold text-white hover:bg-sky-950 transition">
          Đăng nhập
        </button>
      </form>
    </div>
  );
};
