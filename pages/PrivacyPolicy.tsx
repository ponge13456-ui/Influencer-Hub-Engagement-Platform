
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-slate-700 leading-relaxed">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center">Privacy Policy</h1>
      
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">1. Data Collection</h2>
          <p>We collect essential information to provide our services, including username, email, and mobile number. For influencers and sellers, we may collect social handles and business information to process applications.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">2. Usage of Information</h2>
          <p>Your data is used to personalize your content experience, manage your role-based access, and communicate about rewards and application statuses.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">3. Role-Based Access</h2>
          <p>Admin verification is required for high-level roles. We verify roles directly from our secure backend to prevent unauthorized access to restricted content.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">4. Cookies and Security</h2>
          <p>We use persistent session tokens via Firebase to keep you logged in. Your password is never stored in plain text and is handled by secure authentication providers.</p>
        </section>

        <div className="pt-8 border-t border-slate-100 text-sm text-slate-400">
           Last updated: May 2024. For questions, contact privacy@influencerhub.io
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
