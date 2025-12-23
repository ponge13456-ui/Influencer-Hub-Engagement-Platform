
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { 
  Home, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  User, 
  PhoneCall, 
  PlayCircle 
} from 'lucide-react';

interface Props {
  profile: UserProfile | null;
}

const Navbar: React.FC<Props> = ({ profile }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const ADMIN_PATH = "secure-mgmt-portal-88x2";

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <PlayCircle className="w-8 h-8 text-indigo-600" />
              <span className="font-bold text-xl tracking-tight text-slate-900">InfluencerHub</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="text-slate-600 hover:text-indigo-600 flex items-center gap-1">
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link to="/contact" className="text-slate-600 hover:text-indigo-600 flex items-center gap-1">
              <PhoneCall className="w-4 h-4" /> Contact
            </Link>
            
            {profile ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {profile.role === UserRole.ADMIN && (
                  <Link to={`/${ADMIN_PATH}`} className="text-indigo-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1">
                    <User className="w-4 h-4" /> {profile.username}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-md transition flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-slate-600 hover:text-indigo-600">Login</Link>
                <Link to="/signup" className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon Placeholder */}
          <div className="md:hidden flex items-center">
             <button className="text-slate-500">Menu</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
