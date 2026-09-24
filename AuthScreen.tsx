import { useState } from 'react';
import { GraduationCap, Mail, Lock, User, BookOpen, Calendar, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type Mode = 'login' | 'signup' | 'forgot';

export default function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suCourse, setSuCourse] = useState('');
  const [suYear, setSuYear] = useState('');

  // Forgot password
  const [fpEmail, setFpEmail] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setBusy(false);
    if (error) setError(error);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (suPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    const { error } = await signUp({
      fullName: suName,
      email: suEmail,
      password: suPassword,
      course: suCourse,
      year: suYear,
    });
    setBusy(false);
    if (error) {
      setError(error);
    } else {
      setSuccess('Account created! You are now signed in.');
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error } = await resetPassword(fpEmail);
    setBusy(false);
    if (error) {
      setError(error);
    } else {
      setSuccess('Password reset link sent to your email.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Survival Hub</h1>
          <p className="text-sm text-slate-500 mt-1">Don't manage everything. Know what matters.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 animate-scale-in">
          {mode === 'login' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h2>
              <p className="text-sm text-slate-500 mb-6">Sign in to your account</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="Email" icon={<Mail className="w-4 h-4" />}>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </Field>
                <Field label="Password" icon={<Lock className="w-4 h-4" />}>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </Field>

                {error && <ErrorMsg msg={error} />}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between text-sm">
                <button onClick={() => setMode('forgot')} className="text-slate-400 hover:text-slate-600 font-medium">
                  Forgot password?
                </button>
                <button onClick={() => { setMode('signup'); setError(''); }} className="text-slate-900 hover:underline font-semibold">
                  Create account
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Create your account</h2>
              <p className="text-sm text-slate-500 mb-6">Start knowing what matters</p>

              <form onSubmit={handleSignUp} className="space-y-4">
                <Field label="Full Name" icon={<User className="w-4 h-4" />}>
                  <input
                    type="text"
                    required
                    value={suName}
                    onChange={(e) => setSuName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </Field>
                <Field label="Email" icon={<Mail className="w-4 h-4" />}>
                  <input
                    type="email"
                    required
                    value={suEmail}
                    onChange={(e) => setSuEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </Field>
                <Field label="Password" icon={<Lock className="w-4 h-4" />}>
                  <input
                    type="password"
                    required
                    value={suPassword}
                    onChange={(e) => setSuPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Course" icon={<BookOpen className="w-4 h-4" />}>
                    <input
                      type="text"
                      required
                      value={suCourse}
                      onChange={(e) => setSuCourse(e.target.value)}
                      placeholder="MBA"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </Field>
                  <Field label="Year" icon={<Calendar className="w-4 h-4" />}>
                    <input
                      type="text"
                      required
                      value={suYear}
                      onChange={(e) => setSuYear(e.target.value)}
                      placeholder="2nd Year"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </Field>
                </div>

                {error && <ErrorMsg msg={error} />}
                {success && <SuccessMsg msg={success} />}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </button>
              </form>

              <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="mt-5 w-full flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Reset password</h2>
              <p className="text-sm text-slate-500 mb-6">We'll send a reset link to your email</p>

              <form onSubmit={handleForgot} className="space-y-4">
                <Field label="Email" icon={<Mail className="w-4 h-4" />}>
                  <input
                    type="email"
                    required
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </Field>

                {error && <ErrorMsg msg={error} />}
                {success && <SuccessMsg msg={success} />}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>

              <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="mt-5 w-full flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        {children}
      </div>
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p className="text-sm text-red-600 flex items-center gap-1.5 bg-red-50 rounded-lg px-3 py-2">
      <AlertCircle className="w-4 h-4 shrink-0" />
      {msg}
    </p>
  );
}

function SuccessMsg({ msg }: { msg: string }) {
  return (
    <p className="text-sm text-emerald-600 flex items-center gap-1.5 bg-emerald-50 rounded-lg px-3 py-2">
      <AlertCircle className="w-4 h-4 shrink-0" />
      {msg}
    </p>
  );
}
