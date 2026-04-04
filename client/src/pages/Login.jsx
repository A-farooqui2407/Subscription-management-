import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/auth';
import Spinner from '../components/Spinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authApi.login(email, password);
      // data should contain { user, token }
      login(data.user, data.token);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a] px-4">
      <div className="max-w-md w-full backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mb-6 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0 transition-all" />
              <span className="text-slate-400">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-70 disabled:hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? <Spinner size="sm" color="white" /> : 'Sign In'}
          </button>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account? <Link to="/signup" className="text-white hover:text-blue-400 font-bold transition-colors">Sign up</Link>
          </p>
        </form>

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 font-mono space-y-1">
          <p className="font-bold mb-1">Demo login (after <span className="text-white">npm run seed</span>):</p>
          <p>admin@demo.subscription / Demo123!Secure</p>
          <p className="text-blue-200/80 pt-1">Use your own DB users if you did not run the demo seed.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
