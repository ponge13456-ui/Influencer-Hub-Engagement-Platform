
import React, { useState, useEffect } from 'react';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { db } from '../firebase';
import { Video, UserRole, UserProfile, Application, ContactMessage, Comment } from '../types';
import { 
  Users, 
  Video as VideoIcon, 
  FileText, 
  MessageSquare, 
  Mail as MailIcon, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  BarChart3
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'videos' | 'apps' | 'messages'>('users');
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  // Video Form State
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([UserRole.CUSTOMER]);

  useEffect(() => {
    // Fetch all data
    const usersRef = ref(db, 'users');
    const videosRef = ref(db, 'videos');
    const appsRef = ref(db, 'applications');
    const msgRef = ref(db, 'contactMessages');
    const commentsRef = ref(db, 'comments');

    onValue(usersRef, (s) => setUsers(Object.values(s.val() || {})));
    onValue(videosRef, (s) => setVideos(Object.entries(s.val() || {}).map(([id, val]: [string, any]) => ({ id, ...val }))));
    onValue(appsRef, (s) => setApps(Object.values(s.val() || {})));
    onValue(msgRef, (s) => setMessages(Object.entries(s.val() || {}).map(([id, val]: [string, any]) => ({ id, ...val }))));
    onValue(commentsRef, (s) => setComments(Object.entries(s.val() || {}).map(([vId, val]: [string, any]) => ({ videoId: vId, list: val }))));
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const newVideoRef = push(ref(db, 'videos'));
    await set(newVideoRef, {
      title: videoTitle,
      url: videoUrl,
      description: videoDesc,
      thumbnail: `https://picsum.photos/seed/${Date.now()}/800/450`,
      allowedRoles: selectedRoles,
      uploadedAt: Date.now()
    });
    setVideoTitle(""); setVideoUrl(""); setVideoDesc("");
  };

  const handleAppStatus = async (appId: string, status: 'approved' | 'rejected', feedback: string) => {
    await update(ref(db, `applications/${appId}`), { status, adminFeedback: feedback });
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm("Delete this video?")) {
      await remove(ref(db, `videos/${id}`));
    }
  };

  const toggleRoleSelection = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
             <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-100 mb-2">
               <div className="bg-indigo-600 p-2 rounded-lg text-white">
                 <BarChart3 className="w-5 h-5" />
               </div>
               <h2 className="font-bold text-slate-900">Admin Panel</h2>
             </div>
             <div className="text-[10px] text-slate-400 font-bold uppercase px-2 py-2">Management</div>
             <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition font-medium ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Users className="w-5 h-5" /> Users
             </button>
             <button onClick={() => setActiveTab('videos')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition font-medium ${activeTab === 'videos' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <VideoIcon className="w-5 h-5" /> Videos
             </button>
             <button onClick={() => setActiveTab('apps')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition font-medium ${activeTab === 'apps' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <FileText className="w-5 h-5" /> Applications
             </button>
             <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition font-medium ${activeTab === 'messages' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                <MailIcon className="w-5 h-5" /> Messages
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">User Directory</h3>
                <span className="text-xs font-bold text-slate-400">{users.length} Users Found</span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold">{u.username}</td>
                      <td className="px-6 py-4 text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md uppercase text-[10px] font-bold">{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                   <Plus className="w-5 h-5 text-indigo-600" /> Upload New Video
                </h3>
                <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input required className="w-full border p-3 rounded-xl text-sm" placeholder="Video Title" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} />
                    <input required className="w-full border p-3 rounded-xl text-sm" placeholder="Video URL (Vimeo/YouTube/S3)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                    <textarea required className="w-full border p-3 rounded-xl text-sm resize-none" rows={3} placeholder="Description" value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} />
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-700">Allow access for:</p>
                    <div className="flex flex-wrap gap-2">
                      {[UserRole.CUSTOMER, UserRole.INFLUENCER, UserRole.SELLER].map(r => (
                        <button 
                          key={r} type="button" 
                          onClick={() => toggleRoleSelection(r)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${selectedRoles.includes(r) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition mt-4">Publish Content</button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {videos.map(v => (
                   <div key={v.id} className="bg-white border rounded-2xl p-4 flex gap-4">
                     <img src={v.thumbnail} className="w-32 h-24 rounded-lg object-cover" />
                     <div className="flex-grow">
                        <h4 className="font-bold text-slate-900 truncate max-w-[150px]">{v.title}</h4>
                        <p className="text-[10px] text-slate-400 mb-2 truncate max-w-[150px]">{v.description}</p>
                        <div className="flex gap-1 mb-3">
                           {v.allowedRoles.map(r => <span key={r} className="text-[8px] bg-slate-100 px-1 rounded uppercase font-bold text-slate-500">{r}</span>)}
                        </div>
                        <button onClick={() => handleDeleteVideo(v.id)} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 font-bold">
                           <Trash2 className="w-3 h-3" /> Delete
                        </button>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'apps' && (
            <div className="space-y-4">
               {apps.length === 0 ? (
                 <div className="bg-white p-12 text-center rounded-2xl border border-dashed text-slate-400">No applications yet.</div>
               ) : (
                 apps.map(app => (
                   <div key={app.userId} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{app.username} <span className="text-slate-400 font-normal">({app.type})</span></h4>
                          <p className="text-sm text-slate-500">{app.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          app.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          app.status === 'approved' ? 'bg-green-100 text-green-600' :
                          'bg-red-100 text-red-600'
                        }`}>{app.status}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl mb-4 text-xs font-medium text-slate-600">
                        {app.type === 'influencer' ? (
                          <>Handle: {app.content.socialHandle} | Followers: {app.content.followers}</>
                        ) : (
                          <>Business: {app.content.businessName} | Category: {app.content.productCategory}</>
                        )}
                      </div>
                      {app.status === 'pending' && (
                        <div className="flex gap-4">
                          <button onClick={() => handleAppStatus(app.userId, 'approved', 'Welcome to the team!')} className="flex-grow bg-green-600 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-700">
                             <CheckCircle2 className="w-4 h-4" /> Approve
                          </button>
                          <button onClick={() => handleAppStatus(app.userId, 'rejected', 'Profile does not meet criteria.')} className="flex-grow bg-red-100 text-red-600 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-200">
                             <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                   </div>
                 ))
               )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border overflow-hidden">
               {messages.map(m => (
                 <div key={m.id} className="p-6 border-b border-slate-100 hover:bg-slate-50 transition">
                    <div className="flex justify-between mb-2">
                       <span className="font-bold">{m.name} <span className="font-normal text-slate-400 ml-2">({m.email})</span></span>
                       <span className="text-xs text-slate-400">{new Date(m.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 text-sm mb-4">"{m.message}"</p>
                    {m.replied ? (
                      <div className="bg-indigo-50 p-3 rounded-xl text-xs italic text-indigo-700">Replied: {m.replyText}</div>
                    ) : (
                      <button 
                        onClick={() => {
                          const reply = prompt("Enter reply:");
                          if (reply) update(ref(db, `contactMessages/${m.id}`), { replied: true, replyText: reply });
                        }}
                        className="text-indigo-600 text-xs font-bold hover:underline"
                      >
                        Reply to this message
                      </button>
                    )}
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
