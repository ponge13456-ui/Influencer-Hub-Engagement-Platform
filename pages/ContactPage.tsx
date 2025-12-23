
import React, { useState } from 'react';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Send, MapPin, Phone, Mail, Loader2 } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const msgRef = ref(db, 'contactMessages');
    await push(msgRef, {
      name,
      email,
      message,
      timestamp: Date.now(),
      replied: false
    });

    setLoading(false);
    setSubmitted(true);
    setName(""); setEmail(""); setMessage("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Get in Touch</h1>
        <p className="text-lg text-slate-600">Have questions about our partnership programs? We're here to help.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-8">
           <div className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 h-fit"><MapPin className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold">Our Headquarters</h4>
                <p className="text-slate-500 text-sm">123 Influencer Way, Creators Park<br />Digital City, 90210</p>
              </div>
           </div>
           <div className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 h-fit"><Phone className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold">Call Support</h4>
                <p className="text-slate-500 text-sm">+1 (555) 000-HELP</p>
              </div>
           </div>
           <div className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 h-fit"><Mail className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold">Email Us</h4>
                <p className="text-slate-500 text-sm">partners@influencerhub.io</p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Send className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                <p className="text-slate-500">Thanks for reaching out. Our team will review your message and reply soon.</p>
                <button onClick={() => setSubmitted(false)} className="mt-8 text-indigo-600 font-bold underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input required className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input required type="email" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
                  <textarea required rows={5} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" value={message} onChange={e => setMessage(e.target.value)} />
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
