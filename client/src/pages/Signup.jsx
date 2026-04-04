import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/auth';
import Spinner from '../components/Spinner';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation States
  const [rules, setRules] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false
  });

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setRules({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      special: /[!@#$%^&*,.<>?]/.test(password),
    });
  }, [password]);

  const allRulesPass = Object.values(rules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesPass) {
      toast.warning("Please ensure all password requirements are met");
      return;
    }
    setIsLoading(true);
    try {
      const data = await authApi.signup(name, email, password);
      // Automatically login post-signup
      login(data.user, data.token);
      toast.success(data.message || 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  const RuleItem = ({ passed, text }) => (
    <div className={`flex items-center gap-2 text-xs font-semibold ${passed ? 'text-green-400' : 'text-slate-500'}`}>
      {passed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a] px-4 py-8">
      <div className="max-w-md w-full backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">Join us and manage everything easily</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

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

            {/* Password Rules UI */}
            <div className="bg-black/30 rounded-xl p-4 border border-white/5 grid grid-cols-2 gap-y-2">
              <RuleItem passed={rules.length} text="At least 8 chars" />
              <RuleItem passed={rules.upper} text="1 Uppercase" />
              <RuleItem passed={rules.lower} text="1 Lowercase" />
              <RuleItem passed={rules.special} text="1 Special char" />
            </div>

          </div>

          <button
            type="submit"
            disabled={isLoading || !allRulesPass}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-300 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? <Spinner size="sm" color="white" /> : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account? <Link to="/login" className="text-white hover:text-blue-400 font-bold transition-colors">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
