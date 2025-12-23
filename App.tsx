
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
  const [isFirebaseReady, setIsFirebaseReady] = useState(true);

  useEffect(() => {
    // Check if Firebase instances were correctly initialized
    if (!auth || !db) {
      setIsFirebaseReady(false);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        try {
          const profileRef = ref(db, `users/${authUser.uid}`);
          const snapshot = await get(profileRef);
          if (snapshot.exists()) {
            setProfile(snapshot.val());
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (!isFirebaseReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Configuration Missing</h1>
          <p className="text-slate-500 mb-6">
            The application is missing required Firebase environment variables (API Key, Project ID, etc.). 
            Please check your environment configuration.
          </p>
          <div className="text-left bg-slate-50 p-4 rounded-xl text-xs font-mono text-slate-600">
            Required variables:<br/>
            - FIREBASE_API_KEY<br/>
            - FIREBASE_PROJECT_ID<br/>
            - FIREBASE_DATABASE_URL
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: UserRole[] }) => {
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      return <Navigate to="/" />;
    }
    return <>{children}</>;
  };

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
