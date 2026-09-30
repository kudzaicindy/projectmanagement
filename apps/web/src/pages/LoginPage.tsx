import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
export function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[48%] login-panel relative flex-col justify-between p-12 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-alamait-gold flex items-center justify-center text-alamait-navy font-bold">
              A
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">EstatePM</p>
              <p className="text-[12px] text-white/50">Alamait Property Management</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              Manage properties,<br />projects & schedules<br />
              <span className="text-alamait-gold">in one place.</span>
            </h1>
            <p className="text-[15px] text-white/60 mt-5 max-w-md leading-relaxed">
              Track renovations, development projects, budgets, Gantt timelines, and documents
              across your entire portfolio.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[
              { val: 'PM', label: 'Projects & Gantt' },
              { val: 'USD', label: 'Budget tracking' },
              { val: 'QA', label: 'Portfolio health' },
            ].map((s) => (
              <div key={s.label} className="border border-white/10 rounded-lg p-4 bg-white/5">
                <p className="text-xl font-bold text-alamait-gold">{s.val}</p>
                <p className="text-[11px] text-white/45 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[12px] text-white/30">
          &copy; {new Date().getFullYear()} Alamait. Internal use only.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-alamait-navy flex items-center justify-center text-alamait-gold font-bold text-sm">A</div>
            <div>
              <p className="font-bold text-alamait-navy">EstatePM</p>
              <p className="text-[11px] text-slate-400">Alamait</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-alamait-navy">Sign in</h2>
          <p className="text-[14px] text-slate-500 mt-1">Access your role-specific workspace</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="text-[13px] text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-100">{error}</div>
            )}
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
