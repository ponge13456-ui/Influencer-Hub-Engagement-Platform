
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, SPIN_OUTCOMES } from '../types';
import { ref, update, push, set, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Trophy, Star, Briefcase, Award, Loader2 } from 'lucide-react';
import SpinWheel from '../components/SpinWheel';

interface Props {
  profile: UserProfile | null;
}

const DashboardPage: React.FC<Props> = ({ profile }) => {
  const [appStatus, setAppStatus] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Influencer Form State
  const [socialHandle, setSocialHandle] = useState("");
  const [followers, setFollowers] = useState("");
  
  // Seller Form State
  const [businessName, setBusinessName] = useState("");
  const [productCategory, setProductCategory] = useState("");

  useEffect(() => {
    if (profile) {
      const appRef = ref(db, `applications/${profile.uid}`);
      onValue(appRef, (snapshot) => {
        setAppStatus(snapshot.val());
      });
    }
  }, [profile]);

  const handleApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setFormLoading(true);

    const appType = profile.role === UserRole.INFLUENCER ? 'influencer' : 'seller';
    const content = profile.role === UserRole.INFLUENCER 
      ? { socialHandle, followers } 
      : { businessName, productCategory };

    const appRef = ref(db, `applications/${profile.uid}`);
    await set(appRef, {
      userId: profile.uid,
      username: profile.username,
      email: profile.email,
      type: appType,
      content,
      status: 'pending',
      timestamp: Date.now()
    });

    setFormLoading(false);
    setSubmitted(true);
  };

  const handleSpinResult = async (resultIndex: number) => {
    if (!profile) return;
    const outcome = SPIN_OUTCOMES[resultIndex];
    
    // Save spin result to DB
    const spinRef = ref(db, `spinResults/${profile.uid}`);
    await push(spinRef, {
      outcome,
      timestamp: Date.now()
    });

    // If it's a card, add to user profile
    if (outcome.includes("Card")) {
      const userCardsRef = ref(db, `users/${profile.uid}/cards`);
      const existingCards = profile.cards || [];
      await set(userCardsRef, [...existingCards, outcome]);
    }
    
    // Update last spin time
    await update(ref(db, `users/${profile.uid}`), {
      lastSpin: Date.now()
    });
  };

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Profile & Rewards */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.username}</h2>
                <p className="text-slate-500 capitalize">{profile.role}</p>
              </div>
            </div>

            <div className="space-y-4">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Member Since</span>
                    <span className="font-semibold">{new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" /> My Reward Cards
                  </h4>
                  <div className="space-y-2">
                    {profile.cards && profile.cards.length > 0 ? (
                      profile.cards.map((card, i) => (
                        <div key={i} className="text-xs bg-white border border-slate-200 p-2 rounded-lg text-slate-600 font-medium">
                          {card}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No rewards won yet. Spin the wheel!</p>
                    )}
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-indigo-900 p-8 rounded-3xl text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
               <Star className="w-6 h-6 text-yellow-400 fill-current" /> Lucky Spin
            </h3>
            <p className="text-indigo-200 text-sm mb-6">
              Spin the wheel daily for a chance to win exclusive Premium and Platinum discount cards!
            </p>
            <SpinWheel 
              onResult={handleSpinResult} 
              lastSpinTime={profile.lastSpin}
            />
          </div>
        </div>

        {/* Right Column: Applications & Progress */}
        <div className="lg:col-span-8 space-y-8">
          {profile.role !== UserRole.CUSTOMER && profile.role !== UserRole.ADMIN && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-indigo-600" /> 
                {profile.role === UserRole.INFLUENCER ? "Influencer Application" : "Seller Partnership Form"}
              </h3>

              {appStatus ? (
                <div className={`p-6 rounded-2xl border ${
                  appStatus.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  appStatus.status === 'approved' ? 'bg-green-50 border-green-200 text-green-700' :
                  'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <h4 className="font-bold text-lg mb-2">Application Status: {appStatus.status.toUpperCase()}</h4>
                  <p className="text-sm">Submitted on: {new Date(appStatus.timestamp).toLocaleString()}</p>
                  {appStatus.adminFeedback && (
                    <div className="mt-4 pt-4 border-t border-current/20">
                      <p className="font-bold text-sm">Feedback:</p>
                      <p className="text-sm italic">"{appStatus.adminFeedback}"</p>
                    </div>
                  )}
                </div>
              ) : submitted ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-green-700">
                   <h4 className="font-bold mb-2">Form Submitted Successfully!</h4>
                   <p className="text-sm">Our admins will review your profile and get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleApplication} className="space-y-6">
                  {profile.role === UserRole.INFLUENCER ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Social Handle (@username)</label>
                          <input 
                            required 
                            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="@yourhandle"
                            value={socialHandle}
                            onChange={(e) => setSocialHandle(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Follower Count</label>
                          <input 
                            required 
                            type="number"
                            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="e.g. 50000"
                            value={followers}
                            onChange={(e) => setFollowers(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Business/Store Name</label>
                          <input 
                            required 
                            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="Store XYZ"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Product Category</label>
                          <select 
                            required 
                            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={productCategory}
                            onChange={(e) => setProductCategory(e.target.value)}
                          >
                            <option value="">Select Category</option>
                            <option value="fashion">Fashion & Apparel</option>
                            <option value="electronics">Electronics</option>
                            <option value="beauty">Beauty & Health</option>
                            <option value="home">Home & Lifestyle</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                  <button 
                    disabled={formLoading}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    {formLoading && <Loader2 className="w-5 h-5 animate-spin" />} Submit Application
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold mb-6">User Perks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-indigo-600 mb-1">Video Engagement</p>
                <p className="text-slate-500">Every comment you make increases your chances of winning a Premium card.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-indigo-600 mb-1">Partnership Perks</p>
                <p className="text-slate-500">Approved influencers and sellers get direct access to brand collaborations.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
