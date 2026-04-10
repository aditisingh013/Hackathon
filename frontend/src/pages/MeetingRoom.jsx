import React, { useState } from 'react';
import useMeetingEngagement from '../hooks/useMeetingEngagement';
import { PageHeader, Card, Badge } from '../components/ui';
import FadeIn from '../components/ui/FadeIn';
import { Camera, CameraOff, Send, ExternalLink, MessageSquare, Mic, User } from 'lucide-react';
import { motion } from 'framer-motion';

import { analyzeSentiment } from '../services/api';

export default function MeetingRoom() {
  const {
    videoRef,
    isConsentGiven,
    isCameraActive,
    startTracking,
    stopTracking,
    engagementData,
    trackChat
  } = useMeetingEngagement();

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add locally immediately
    const newMsg = { id: Date.now(), text: chatInput, sentiment: 'Analyzing...' };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    trackChat();
    
    try {
       // Using the first employee ID as mock sender for the meeting room context
       const res = await analyzeSentiment({ employeeId: "60d0fe4f5311236168a109ca", message: chatInput, source: 'Chat' });
       setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, sentiment: res.data.sentiment } : m));
    } catch(err) {
       setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, sentiment: 'Neutral' } : m));
    }
  };

  const engageScore = engagementData?.engagementPercent || 0;
  const metrics = engagementData?.breakdown || {
    emotionScore: 0,
    speakingPercent: 0,
    chatPercent: 0,
    rawSpeakingSeconds: 0,
    rawChatMessages: 0
  };

  return (
    <div className="flex flex-col h-full pb-8">
      <FadeIn>
        <PageHeader
          title="Live Meeting & Engagement Analytics"
          subtitle="Real-time multi-modal participation tracking via anti-fake streaming algorithms."
        />
      </FadeIn>

      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="flex-1 p-6 flex flex-col items-center justify-center bg-black/5 dark:bg-black/20 min-h-[400px] relative overflow-hidden rounded-3xl border border-gray-100 dark:border-white/5">
            {!isConsentGiven ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-apple-blue/10 rounded-full flex items-center justify-center text-apple-blue">
                  <Camera size={28} />
                </div>
                <h3 className="text-xl font-semibold text-textPrimary dark:text-white">Camera & Microphone Access</h3>
                <p className="text-sm text-textSecondary max-w-sm">
                  This meeting uses live engagement tracking (emotion, real speaking activity). 
                  No raw video or audio is stored.
                </p>
                <button
                  onClick={startTracking}
                  className="mt-2 px-6 py-2.5 bg-apple-blue text-white font-medium text-sm rounded-full hover:shadow-soft transition-all"
                >
                  Enable Tracking & Join
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted // Prevent feedback loop locally
                  className="w-full h-full object-cover rounded-2xl"
                />
                
                {/* Overlay controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-black/30 backdrop-blur-md rounded-full shadow-soft border border-white/10">
                  <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
                    <Mic size={18} />
                  </button>
                  <button 
                    onClick={stopTracking}
                    className="w-10 h-10 rounded-full bg-apple-red hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                  >
                    <CameraOff size={18} />
                  </button>
                </div>
                
                {/* Privacy indicator */}
                {isCameraActive && (
                  <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-apple-red animate-pulse" />
                    Tracking Active
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Dummy Chat Box */}
          <Card className="flex flex-col h-64 border border-gray-100 dark:border-white/5">
            <div className="p-3 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
              <MessageSquare size={16} className="text-textSecondary" />
              <span className="text-sm font-medium text-textPrimary dark:text-white">Meeting Chat</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-textSecondary">
                  No messages yet. Send a message to boost your engagement score!
                </div>
              ) : (
                messages.map(msg => (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className="text-sm bg-apple-blue/5 dark:bg-white/5 px-3 py-2 rounded-lg self-start inline-block w-full">
                    <div className="flex justify-between items-start gap-4">
                       <span className="text-textPrimary dark:text-gray-200">{msg.text}</span>
                       {msg.sentiment && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                             msg.sentiment === 'Positive' ? 'bg-apple-green/20 text-apple-green' :
                             msg.sentiment === 'Frustrated' ? 'bg-apple-orange/20 text-apple-orange' :
                             msg.sentiment === 'Exhausted' ? 'bg-apple-red/20 text-apple-red' :
                             'bg-gray-100 text-textSecondary dark:bg-white/10 dark:text-gray-400'
                          }`}>
                            {msg.sentiment}
                          </span>
                       )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <form onSubmit={handleSendChat} className="p-3 border-t border-gray-100 dark:border-white/5 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message..."
                disabled={!isConsentGiven}
                className="flex-1 bg-surfaceAlt dark:bg-white/5 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-apple-blue disabled:opacity-50"
              />
              <button disabled={!isConsentGiven} type="submit" className="w-9 h-9 rounded-full bg-apple-blue text-white flex items-center justify-center disabled:opacity-50">
                <Send size={14} className="ml-[-2px]" />
              </button>
            </form>
          </Card>
        </div>

        {/* Right Panel: Analytics */}
        <div className="lg:w-80 flex flex-col gap-4">
          <Card className="p-6 border border-gray-100 dark:border-white/5 bg-gradient-to-br from-white to-gray-50 dark:from-surfaceDark dark:to-surfaceDarkAlt relative overflow-hidden">
             {/* Background decorative blob */}
             <div className="absolute -right-8 -top-8 w-32 h-32 bg-apple-blue/5 rounded-full blur-2xl" />
             
             <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-widest mb-6">Live Score</h3>
             
             <div className="flex flex-col items-center justify-center my-6">
                <div className="relative flex items-center justify-center w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-100 dark:text-white/5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${engageScore}, 100`}
                      className="text-apple-blue transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold tracking-tighter text-textPrimary dark:text-white">{Math.round(engageScore)}<span className="text-xl">%</span></span>
                  </div>
                </div>
             </div>
             
             <p className="text-[11px] text-center text-textSecondary mt-2">
                Scores refresh every 5s using a rolling moving average.
             </p>
          </Card>

          <Card className="p-5 border border-gray-100 dark:border-white/5 flex-1">
             <h3 className="text-sm font-semibold text-textPrimary dark:text-white mb-5 flex items-center gap-2">
               Score Breakdown <ExternalLink size={14} className="text-textSecondary" />
             </h3>

             <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-textSecondary font-medium">Emotion Bias (40%)</span>
                    <span className="text-textPrimary dark:text-white font-semibold">{metrics.emotionScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-apple-orange transition-all duration-700" style={{ width: `${metrics.emotionScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-textSecondary font-medium">Verified Speaking (35%)</span>
                    <span className="text-textPrimary dark:text-white font-semibold">{metrics.speakingPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-apple-blue transition-all duration-700" style={{ width: `${metrics.speakingPercent}%` }} />
                  </div>
                  <p className="text-[10px] text-textSecondary mt-1.5">+2s sustained chunks only: {metrics.rawSpeakingSeconds}s detected</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-textSecondary font-medium">Chat Interactivity (25%)</span>
                    <span className="text-textPrimary dark:text-white font-semibold">{metrics.chatPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-apple-green transition-all duration-700" style={{ width: `${metrics.chatPercent}%` }} />
                  </div>
                  <p className="text-[10px] text-textSecondary mt-1.5">{metrics.rawChatMessages} messages tracked globally</p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
