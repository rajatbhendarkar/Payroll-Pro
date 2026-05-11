import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { authAPI } from '../services/api';
import {
  FiMail, FiLock, FiShield, FiUser, FiEye, FiEyeOff,
  FiZap, FiBarChart2, FiCheckCircle, FiClock, FiSun, FiMoon, FiArrowRight
} from 'react-icons/fi';

/* ─── Typing effect hook ─── */
const useTyping = (words, speed = 80, pause = 1800) => {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx % words.length];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) setTimeout(() => setDeleting(true), pause);
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length - 1 === 0) { setDeleting(false); setWordIdx((i) => i + 1); }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIdx, words, speed, pause]);

  return text;
};

/* ─── Feature list ─── */
const features = [
  { icon: FiZap,       label: 'Fast Payroll Automation',    desc: 'Process payroll in seconds' },
  { icon: FiBarChart2, label: 'Real-time Analytics',        desc: 'Live insights & reports' },
  { icon: FiCheckCircle, label: 'Secure Login System',      desc: 'JWT + role-based access' },
  { icon: FiClock,     label: 'Smart Attendance Tracking',  desc: 'Face recognition & geo-fencing' },
];

/* ─── Floating blob ─── */
const Blob = ({ className, delay = 0 }) => (
  <motion.div
    animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
    className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
  />
);

const slide = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 } };

/* ══════════════════════════════════════════════════════════ */
const Login = () => {
  const [role, setRole]               = useState('employee');
  const [view, setView]               = useState('login');
  const [showPwd, setShowPwd]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [remember, setRemember]       = useState(false);

  const [loginData,    setLoginData]    = useState({ email: '', password: '' });
  const [forgotEmail,  setForgotEmail]  = useState('');
  const [resetData,    setResetData]    = useState({ email: '', otp: '', newPassword: '' });

  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const typedText = useTyping(['Made Simple.', 'Made Fast.', 'Made Smart.', 'Made Secure.']);

  const isAdmin  = role === 'admin';
  const btnGrad  = isAdmin
    ? 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
    : 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700';
  const ringColor = isAdmin ? 'focus:ring-blue-500' : 'focus:ring-emerald-500';

  /* ── Handlers (unchanged logic) ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(loginData);
      if (data.user.role !== role) { toast.error('Access denied. Use the correct portal.'); return; }
      toast.success('Welcome back! 🎉');
      navigate(isAdmin ? '/admin' : '/employee');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email: forgotEmail });
      toast.success(data.message);
      if (data.dev_otp) toast.info(`Dev OTP: ${data.dev_otp}`, { autoClose: false });
      setResetData((p) => ({ ...p, email: forgotEmail }));
      setView('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword(resetData);
      toast.success(data.message);
      setView('login');
      setLoginData((p) => ({ ...p, email: resetData.email }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  /* ── Shared input class ── */
  const inp = `w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm
    text-white placeholder-white/50 focus:outline-none focus:ring-2 ${ringColor}
    focus:border-transparent transition-all duration-200`;

  /* ── View title map ── */
  const titles = {
    login:    { h: 'Welcome Back 👋',        sub: 'Sign in to continue to PayrollPro' },
    forgot:   { h: 'Forgot Password?',       sub: "No worries, we'll send a reset code" },
    reset:    { h: 'Reset Password',         sub: 'Enter the code sent to your email' },
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">

      {/* ══ LEFT — Branding ══ */}
      <div className="relative lg:w-[55%] bg-gradient-to-br from-blue-700 via-blue-600 to-purple-700 flex flex-col justify-center px-10 py-16 overflow-hidden">
        {/* Blobs */}
        <Blob className="w-96 h-96 bg-purple-400 -top-20 -left-20" delay={0} />
        <Blob className="w-72 h-72 bg-blue-300 bottom-10 right-10"  delay={2} />
        <Blob className="w-56 h-56 bg-pink-400 top-1/2 left-1/3"   delay={4} />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
        >
          <motion.div animate={{ rotate: darkMode ? 180 : 0 }} transition={{ duration: 0.4 }}>
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </motion.div>
        </button>

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <FiZap className="text-white text-2xl" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">PayrollPro</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2">
            Smart Payroll Management
          </motion.h1>
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-extrabold mb-6">
            <span className="text-yellow-300">{typedText}</span>
            <span className="animate-pulse text-yellow-300">|</span>
          </motion.h2>

          {/* Subheading */}
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-blue-100 text-lg leading-relaxed mb-10">
            Manage employees, payroll, attendance, and leaves — all in one powerful platform designed for modern organizations.
          </motion.p>

          {/* Feature list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all">
                <div className="p-2 rounded-xl bg-white/20 flex-shrink-0">
                  <f.icon className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.label}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="flex gap-8 mt-10 pt-8 border-t border-white/20">
            {[['500+', 'Companies'], ['50K+', 'Employees'], ['99.9%', 'Uptime']].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-2xl font-extrabold text-white">{val}</p>
                <p className="text-blue-200 text-xs">{lbl}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══ RIGHT — Login Form ══ */}
      <div className="lg:w-[45%] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-6 py-12 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="w-full max-w-md relative z-10">

          {/* Glass card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white">{titles[view].h}</h2>
                <p className="text-gray-400 text-sm mt-1">{titles[view].sub}</p>
              </motion.div>
            </AnimatePresence>

            {/* Role toggle */}
            {(view === 'login' || view === 'register') && (
              <div className="flex gap-2 mb-6 bg-white/5 rounded-2xl p-1">
                {[['employee', FiUser, 'Employee'], ['admin', FiShield, 'Admin']].map(([r, Icon, lbl]) => (
                  <button key={r} type="button" onClick={() => { setRole(r); setView('login'); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      role === r
                        ? `bg-gradient-to-r ${r === 'admin' ? 'from-blue-600 to-purple-600' : 'from-emerald-500 to-teal-600'} text-white shadow-lg`
                        : 'text-gray-400 hover:text-white'
                    }`}>
                    <Icon size={14} /> {lbl}
                  </button>
                ))}
              </div>
            )}

            {/* Admin sub-tabs removed — login only */}

            {/* ── Forms ── */}
            <AnimatePresence mode="wait">

              {/* LOGIN */}
              {view === 'login' && (
                <motion.form key="login" {...slide} onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3.5 text-white/40" />
                    <input type="email" required className={inp}
                      placeholder={isAdmin ? 'admin@example.com' : 'employee@example.com'}
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3.5 text-white/40" />
                    <input type={showPwd ? 'text' : 'password'} required className={`${inp} pr-10`}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-3.5 text-white/40 hover:text-white/80 transition-colors">
                      {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 rounded accent-blue-500" />
                      <span className="text-gray-400 text-sm">Remember me</span>
                    </label>
                    <button type="button" onClick={() => setView('forgot')}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit */}
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r ${btnGrad}
                      shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60`}>
                    {loading
                      ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                      : <>{`Sign In as ${isAdmin ? 'Admin' : 'Employee'}`} <FiArrowRight /></>}
                  </motion.button>

                  <p className="text-center text-xs text-gray-600 pt-1">
                    {isAdmin ? 'Demo: admin@example.com / password123' : 'Contact your admin for credentials'}
                  </p>
                </motion.form>
              )}

              {/* REGISTER form removed — admin accounts created via backend only */}

              {/* FORGOT */}
              {view === 'forgot' && (
                <motion.form key="forgot" {...slide} onSubmit={handleForgot} className="space-y-4">
                  <p className="text-gray-400 text-sm">Enter your registered email and we'll send a reset code.</p>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3.5 text-white/40" />
                    <input type="email" required className={inp} placeholder="your@email.com"
                      value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                  </div>
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading
                      ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                      : <>Send Reset Code <FiArrowRight /></>}
                  </motion.button>
                  <button type="button" onClick={() => setView('login')}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    ← Back to Login
                  </button>
                </motion.form>
              )}

              {/* RESET */}
              {view === 'reset' && (
                <motion.form key="reset" {...slide} onSubmit={handleReset} className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    Enter the 6-digit code sent to{' '}
                    <span className="text-blue-400 font-medium">{resetData.email}</span>
                  </p>
                  <input type="text" required maxLength={6}
                    className={`${inp} text-center tracking-[0.5em] text-xl font-bold pl-4`}
                    placeholder="000000"
                    value={resetData.otp}
                    onChange={(e) => setResetData({ ...resetData, otp: e.target.value })} />
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3.5 text-white/40" />
                    <input type={showPwd ? 'text' : 'password'} required minLength={6}
                      className={`${inp} pr-10`} placeholder="New Password"
                      value={resetData.newPassword}
                      onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-3.5 text-white/40 hover:text-white/80 transition-colors">
                      {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading
                      ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
                      : <>Reset Password <FiArrowRight /></>}
                  </motion.button>
                  <button type="button" onClick={() => setView('forgot')}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    ← Resend Code
                  </button>
                </motion.form>
              )}

            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-600 text-xs mt-6">
            © {new Date().getFullYear()} PayrollPro · Built for modern organizations
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
