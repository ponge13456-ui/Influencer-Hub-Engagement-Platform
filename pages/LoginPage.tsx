
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2, User, Lock, Mail, Phone } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let emailToUse = identifier;

      // Check if identifier is username or mobile
      if (!identifier.includes("@")) {
        // Try finding by username
        const usernameQuery = query(ref(db, 'users'), orderByChild('username'), equalTo(identifier));
        const usernameSnapshot = await get(usernameQuery);
        
        if (usernameSnapshot.exists()) {
          const userData = Object.values(usernameSnapshot.val())[0] as any;
          emailToUse = userData.email;
        } else {
          // Try finding by mobile
          const mobileQuery = query(ref(db, 'users'), orderByChild('mobile'), equalTo(identifier));
          const mobileSnapshot = await get(mobileQuery);
          if (mobileSnapshot.exists()) {
            const userData = Object.values(mobileSnapshot.val())[0] as any;
            emailToUse = userData.email;
          } else {
            throw new Error("User not found with this username/mobile.");
          }
        }
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Username, Email, or Mobile</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="Enter your login info"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  required
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">Don't have an account? </span>
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
