import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from './firebase';
import { UserRole, UserProfile } from './types';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AdminPanel from './pages/AdminPanel';
import ContactPage from './pages/ContactPage';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const ADMIN_SECRET_PATH = "secure-mgmt-portal-88x2"; // Obscure admin path

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        const profileRef = ref(db, `users/${authUser.uid}`);
        const snapshot = await get(profileRef);
        if (snapshot.exists()) {
          setProfile(snapshot.val());
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Fix: Explicitly defining children as optional to avoid TS errors when the component is used as a wrapper in some environments.
  const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: UserRole[] }) => {
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      return <Navigate to="/" />;
    }
    return <>{children}</>;
  };

  // Fix: Explicitly defining children as optional to avoid TS errors when the component is used as a wrapper.
  const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
    if (!user || profile?.role !== UserRole.ADMIN) {
      return <Navigate to="/" />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar profile={profile} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage profile={profile} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage profile={profile} />
              </ProtectedRoute>
            } />

            <Route path={`/${ADMIN_SECRET_PATH}`} element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;