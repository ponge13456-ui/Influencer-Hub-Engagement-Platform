
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { UserPlus, Loader2, Shield, User, Mail, Phone, Lock } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Check uniqueness of username and mobile
      const usernameRef = ref(db, `usernames/${username.toLowerCase()}`);
      const mobileRef = ref(db, `mobiles/${mobile}`);
      
      const [uSnap, mSnap] = await Promise.all([get(usernameRef), get(mobileRef)]);
      
      if (uSnap.exists()) throw new Error("Username already taken.");
      if (mSnap.exists()) throw new Error("Mobile number already registered.");

      // 2. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Save Profile & Uniqueness constraints
      await Promise.all([
        set(ref(db, `users/${user.uid}`), {
          uid: user.uid,
          username,
          email,
          mobile,
          role,
          createdAt: Date.now()
        }),
        set(usernameRef, user.uid),
        set(mobileRef, user.uid)
      ]);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-xl">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
          <div className="text-center mb-10">
            <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Create Account</h1>
            <p className="text-slate-500 mt-2">Join our influencer marketing ecosystem</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-8 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                   <User className="w-4 h-4" /> Username
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                   <Phone className="w-4 h-4" /> Mobile
                </label>
                <input
                  required
                  type="tel"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="+1 234..."
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.trim())}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                 <Mail className="w-4 h-4" /> Email
              </label>
              <input
                required
                type="email"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                 <Lock className="w-4 h-4" /> Password
              </label>
              <input
                required
                type="password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> I am a:
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[UserRole.CUSTOMER, UserRole.INFLUENCER, UserRole.SELLER].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition border ${
                      role === r 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Signup"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
