import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Globe, Code, Rocket, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { ensureUserProfile } from '../firebase/userService';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, signInWithGoogle, signInWithGithub } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      return setError('Please agree to the terms of service.');
    }
    try {
      setError('');
      setLoading(true);
      const userCredential = await signup(formData.email, formData.password);
      await ensureUserProfile(userCredential.user, { fullName: formData.fullName });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setError('');
      setLoading(true);
      let userCredential;
      if (provider === 'google') {
        userCredential = await signInWithGoogle();
      } else if (provider === 'github') {
        userCredential = await signInWithGithub();
      }
      if (userCredential?.user) {
        await ensureUserProfile(userCredential.user);
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(`Failed to sign up with ${provider}.`);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#09090b]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] bg-cyan-500/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[50%] h-[50%] bg-violet-500/10 blur-[140px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl z-10 grid md:grid-cols-[1fr_1.2fr] gap-0 overflow-hidden bg-[#111113] border border-white/[0.08] rounded-2xl"
      >
        {/* Left Side: Branding/Info */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-white/[0.02] border-r border-white/[0.08] relative">
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center">
                <Rocket className="text-zinc-950 w-4 h-4 fill-current" />
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-xl font-bold text-white tracking-tight">SkillSwap</span>
            </Link>

            <h2 style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-3xl font-bold text-white leading-tight mb-6">
              Unlock the power of <span className="text-cyan-400">collaborative</span> learning.
            </h2>

            <ul className="space-y-4">
              {[
                'Exchange coding for design',
                'Peer-to-peer mentorship',
                'Build a portfolio with friends',
                'Connect with top campus talent'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                  <CheckCircle2 className="text-cyan-400 w-4 h-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/5 mt-auto">
            <p className="text-zinc-500 text-xs leading-relaxed">
              Join over 2,000+ students from top universities globally.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h1 className="form-title mb-2">Create Account</h1>
            <p className="body-text">Join the community of skill seekers</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <User className="text-zinc-600 w-4 h-4 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-cyan-400/30 transition-all text-zinc-300 placeholder:text-zinc-700 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">University Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Mail className="text-zinc-600 w-4 h-4 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@university.edu"
                  className="w-full pl-11 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-cyan-400/30 transition-all text-zinc-300 placeholder:text-zinc-700 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <Lock className="text-zinc-600 w-4 h-4 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-cyan-400/30 transition-all text-zinc-300 placeholder:text-zinc-700 text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 ml-1 py-1.5">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                id="terms"
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-cyan-400 focus:ring-cyan-400/20 cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-[11px] text-zinc-500 cursor-pointer select-none">
                I agree to the <span className="text-cyan-400 hover:underline">Terms of Service</span>
              </label>
            </div>

            <PrimaryButton
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
              {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
            </PrimaryButton>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-px bg-white/[0.05] flex-1"></span>
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Or sign up with</span>
            <span className="h-px bg-white/[0.05] flex-1"></span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <SecondaryButton 
              onClick={() => handleSocialLogin('google')} 
              disabled={loading}
              className="py-2"
            >
              <Globe size={14} />
              <span>Google</span>
            </SecondaryButton>
            <SecondaryButton 
              onClick={() => handleSocialLogin('github')} 
              disabled={loading}
              className="py-2"
            >
              <Code size={14} />
              <span>Github</span>
            </SecondaryButton>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
