import { useState } from 'react';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/auth';
import Spinner from '../components/Spinner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
      toast.success('Reset phrase sent to inbox!');
    } catch (error) {
      toast.error(error.message || 'Error processing request');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a] px-4 py-8">
        <div className="max-w-md w-full backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-6 border border-green-500/30">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Check your inbox</h2>
          <p className="text-slate-400 text-sm mb-8">
            We've sent a password reset link to <br /><span className="text-white font-medium">{email}</span>
          </p>
          <Link 
            to="/login"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all inline-block"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a0a0a] to-[#0a0a0a] px-4 py-8">
      <div className="max-w-md w-full backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
        <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft size={16} className="mr-2" /> Back to log in
        </Link>
        
        <div className="mb-8 text-left">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mb-6 border border-blue-500/30">
            <KeyRound size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Forgot password?</h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">No worries, we'll send you reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-300 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? <Spinner size="sm" color="white" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
