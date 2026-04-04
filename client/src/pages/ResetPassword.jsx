import { useState } from 'react';
import { useToast } from '../components/Toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle } from 'lucide-react';
import { authApi } from '../api/auth';
import Spinner from '../components/Spinner';

const ResetPassword = () => {
  const { token } = useParams(); // Retrieves dynamically from /reset-password/:token
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorState, setIsErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setIsErrorState(false);
    
    try {
      await authApi.resetPassword(token, password);
      setIsSuccess(true);
      toast.success("Password reset successfully! You can now log in.");
    } catch (error) {
      // Typically 401/403 expired token states
      setIsErrorState(true);
      setErrorMessage(error.message || 'The reset link has expired or is invalid.');
      toast.error('Token expired or invalid');
    } finally {
      setIsLoading(false);
    }
  };

  if (isErrorState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a] px-4 py-8">
        <div className="max-w-md w-full backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-red-500/30 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-500 mb-6 border border-red-500/30">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Link Expired</h2>
          <p className="text-slate-400 text-sm mb-8">{errorMessage}</p>
          <Link 
            to="/forgot-password"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all inline-block"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a] px-4 py-8">
        <div className="max-w-md w-full backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-6 border border-green-500/30">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">All Done!</h2>
          <p className="text-slate-400 text-sm mb-8">Your password has been reset successfully.</p>
          <Link 
            to="/login"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all inline-block shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a] px-4 py-8">
      <div className="max-w-md w-full backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="mb-8 text-left">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Set New Password</h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-300 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? <Spinner size="sm" color="white" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
