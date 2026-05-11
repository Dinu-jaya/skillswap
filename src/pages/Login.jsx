import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Globe, Code, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton, SecondaryButton } from '../components/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login, signInWithGoogle, signInWithGithub, banMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Pre-populate error from banMessage so mid-session bans show immediately
  const [error, setError] = useState(banMessage || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // Only reach here if login succeeded AND user is NOT banned
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-banned') {
        // Show the ban message — do NOT navigate
        setError(err.message);
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setError('');
      setLoading(true);
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'github') {
        await signInWithGithub();
      }
      // Only navigate if not banned
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-banned') {
        setError(err.message);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(`Failed to sign in with ${provider}.`);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#111113] border border-white/[0.08] p-8 md:p-10 rounded-2xl relative overflow-hidden">
          {/* Subtle top glow line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-6"
            >
              <Sparkles className="text-cyan-400 w-5 h-5" />
            </motion.div>
            <h1 className="form-title mb-2">Welcome Back</h1>
            <p className="body-text">Continue your skill exchange journey</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
                error.includes('banned')
                  ? 'bg-red-600/10 border border-red-600/30 text-red-300'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                {error.includes('banned') && (
                  <p className="font-semibold text-red-300 mb-0.5">Account Banned</p>
                )}
                {error}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Mail className="text-zinc-600 w-4 h-4 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-cyan-400/30 transition-all text-zinc-300 placeholder:text-zinc-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium">Forgot password?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Lock className="text-zinc-600 w-4 h-4 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-cyan-400/30 transition-all text-zinc-300 placeholder:text-zinc-700"
                  required
                />
              </div>
            </div>

            <PrimaryButton
              type="submit"
              disabled={loading}
              className="w-full py-3"
            >
              {loading ? 'Processing...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
            </PrimaryButton>
          </form>

          <div className="mt-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.05]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-[#111113] px-4 text-zinc-600">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SecondaryButton 
                onClick={() => handleSocialLogin('google')} 
                disabled={loading}
                className="py-2.5"
              >
                <Globe size={16} />
                <span>Google</span>
              </SecondaryButton>
              <SecondaryButton 
                onClick={() => handleSocialLogin('github')} 
                disabled={loading}
                className="py-2.5"
              >
                <Code size={16} />
                <span>Github</span>
              </SecondaryButton>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent font-semibold hover:underline decoration-accent/30 underline-offset-4 transition-all">
              Create one now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
