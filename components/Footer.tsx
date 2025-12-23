
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight text-slate-900">InfluencerHub</span>
          </div>
          <div className="flex space-x-8 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <Link to="/contact" className="hover:text-indigo-600">Contact</Link>
            <Link to="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
          </div>
        </div>
        <div className="text-slate-400 text-xs">
          © 2024 Influencer Promotion & Engagement Web App. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
