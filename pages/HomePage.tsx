
import React, { useState, useEffect } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Video, UserProfile, UserRole, Comment } from '../types';
import { MessageCircle, Heart, Share2, Play } from 'lucide-react';

interface Props {
  profile: UserProfile | null;
}

const HomePage: React.FC<Props> = ({ profile }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const videosRef = ref(db, 'videos');
    onValue(videosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const videoList: Video[] = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }));
        // Filter based on role
        const filtered = videoList.filter(v => {
          if (!profile) return v.allowedRoles.includes(UserRole.CUSTOMER);
          if (profile.role === UserRole.ADMIN) return true;
          return v.allowedRoles.includes(profile.role);
        });
        setVideos(filtered);
      }
    });
  }, [profile]);

  useEffect(() => {
    if (selectedVideo) {
      const commentsRef = ref(db, `comments/${selectedVideo.id}`);
      onValue(commentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const commentList: Comment[] = Object.entries(data).map(([id, val]: [string, any]) => ({
            id,
            ...val
          }));
          setComments(commentList.sort((a, b) => b.timestamp - a.timestamp));
        } else {
          setComments([]);
        }
      });
    }
  }, [selectedVideo]);

  const handlePostComment = async () => {
    if (!profile || !selectedVideo || !newComment.trim()) return;

    const commentsRef = ref(db, `comments/${selectedVideo.id}`);
    const newCommentRef = push(commentsRef);
    await set(newCommentRef, {
      userId: profile.uid,
      username: profile.username,
      text: newComment,
      timestamp: Date.now()
    });
    setNewComment("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          {profile ? `Welcome back, ${profile.username}!` : "Experience Premium Shopping Content"}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {profile 
            ? `Exclusive ${profile.role} content tailored just for you. Engagement drives rewards.`
            : "Sign up to join our community of influencers, sellers, and smart shoppers."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Feed */}
        <div className="lg:col-span-2 space-y-8">
          {videos.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
              <Play className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No videos available for your role right now.</p>
            </div>
          ) : (
            videos.map(video => (
              <div key={video.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="aspect-video bg-black relative group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                  <img src={video.thumbnail || `https://picsum.photos/seed/${video.id}/1280/720`} alt={video.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-6">
                      <Play className="w-10 h-10 text-white fill-current" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{video.title}</h2>
                      <p className="text-slate-500 text-sm mt-1">{video.description}</p>
                    </div>
                    <div className="flex space-x-2">
                       {video.allowedRoles.map(role => (
                         <span key={role} className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-1 rounded uppercase">{role}</span>
                       ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 pt-4 border-t border-slate-100">
                    <button className="flex items-center space-x-2 text-slate-500 hover:text-red-500 transition">
                      <Heart className="w-5 h-5" /> <span>Like</span>
                    </button>
                    <button className="flex items-center space-x-2 text-slate-500 hover:text-indigo-500 transition" onClick={() => setSelectedVideo(video)}>
                      <MessageCircle className="w-5 h-5" /> <span>Comment</span>
                    </button>
                    <button className="flex items-center space-x-2 text-slate-500 hover:text-green-500 transition">
                      <Share2 className="w-5 h-5" /> <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Interaction Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
            {selectedVideo ? (
              <>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Comments: {selectedVideo.title}</h3>
                <div className="max-h-[500px] overflow-y-auto mb-6 space-y-4 pr-2 custom-scrollbar">
                  {comments.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">Be the first to comment!</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-sm text-indigo-600">{c.username}</span>
                          <span className="text-[10px] text-slate-400">{new Date(c.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-700">{c.text}</p>
                        {c.reply && (
                          <div className="mt-2 pl-3 border-l-2 border-indigo-200 italic text-sm text-slate-500">
                             <span className="font-medium text-xs">Admin:</span> {c.reply}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {profile ? (
                  <div className="space-y-3">
                    <textarea 
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      rows={3}
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                      onClick={handlePostComment}
                      disabled={!newComment.trim()}
                      className="w-full bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      Post Comment
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-500 p-4 bg-slate-50 rounded-xl">
                    Please <a href="#/login" className="text-indigo-600 underline">login</a> to comment.
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">Select a video to view and post comments.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
