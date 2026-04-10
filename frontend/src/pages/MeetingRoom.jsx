import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader, Card } from '../components/ui';
import FadeIn from '../components/ui/FadeIn';
import {
  Camera, CameraOff, Send, ExternalLink,
  MessageSquare, Mic, MicOff, AlertCircle, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { analyzeSentiment } from '../services/api';

const SCORE_API = 'http://localhost:5000/api/engagement';
const MEETING_ID = 'DEMO_MEETING_001';

// ── Custom Tooltip ──
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 text-xs shadow-soft">
      <p className="text-textSecondary mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
};

// ── Circle Score Ring ──
function CircleScore({ score }) {
  const color = score >= 70 ? '#34c759' : score >= 40 ? '#ff9500' : '#ff3b30';
  return (
    <div className="relative flex items-center justify-center w-28 h-28 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" strokeWidth="2.8" stroke="#f0f0f0" />
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke={color} strokeWidth="2.8"
          strokeLinecap="round"
          strokeDasharray={`${score}, 100`}
          style={{ transition: 'stroke-dasharray 1s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold text-textPrimary dark:text-white">{score}</span>
        <span className="text-sm font-medium text-textSecondary">%</span>
      </div>
    </div>
  );
}

export default function MeetingRoom() {
  // ── Camera ──
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraState, setCameraState] = useState('idle');
  const [cameraError, setCameraError] = useState('');
  const [isMuted, setIsMuted] = useState(true);

  // ── Chat ──
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatCount, setChatCount] = useState(0);

  // ── Engagement ──
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState({ emotionScore: 0, speakingPercent: 0, chatPercent: 0 });

  // ── Chart data — time series collected every 5s ──
  const [timelineData, setTimelineData] = useState([
    { time: '0s', engagement: 0, emotion: 0, speaking: 0, chat: 0 }
  ]);
  const tickRef = useRef(0);

  // ── Radar snapshot ──
  const radarData = [
    { metric: 'Emotion', value: breakdown.emotionScore || 0 },
    { metric: 'Speaking', value: breakdown.speakingPercent || 0 },
    { metric: 'Chat', value: breakdown.chatPercent || 0 },
    { metric: 'Overall', value: score },
  ];

  // ── Audio ──
  const audioCtxRef = useRef(null);
  const speakingSecsRef = useRef(0);
  const pollingRef = useRef(null);

  const startCamera = useCallback(async () => {
    setCameraState('loading');
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraState('active');
      initAudio(stream);
      pollingRef.current = setInterval(pollScore, 5000);
    } catch (err) {
      setCameraState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a camera and try again.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (videoRef.current) videoRef.current.srcObject = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    clearInterval(pollingRef.current);
    speakingSecsRef.current = 0;
    setCameraState('idle');
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  function initAudio(stream) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyser.fftSize = 512;
      const data = new Uint8Array(analyser.frequencyBinCount);
      let speakStart = 0;
      const tick = () => {
        if (!audioCtxRef.current) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        if (avg > 28) { if (!speakStart) speakStart = Date.now(); }
        else {
          if (speakStart) {
            const dur = (Date.now() - speakStart) / 1000;
            if (dur >= 2) speakingSecsRef.current += dur;
            speakStart = 0;
          }
        }
        requestAnimationFrame(tick);
      };
      tick();
    } catch (_) {}
  }

  async function pollScore() {
    try {
      if (speakingSecsRef.current > 0) {
        await fetch(`${SCORE_API}/track-speaking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: MEETING_ID, userId: 'demo', duration: speakingSecsRef.current }),
        });
        speakingSecsRef.current = 0;
      }
      const res = await fetch(`${SCORE_API}/${MEETING_ID}/demo`);
      const data = await res.json();
      if (data.success) {
        const newScore = data.engagementPercent || 0;
        const bd = data.breakdown || {};
        setScore(newScore);
        setBreakdown(bd);

        // Append to chart timeline
        tickRef.current += 5;
        setTimelineData(prev => {
          const next = [...prev, {
            time: `${tickRef.current}s`,
            engagement: newScore,
            emotion: bd.emotionScore || 0,
            speaking: bd.speakingPercent || 0,
            chat: bd.chatPercent || 0,
          }];
          return next.slice(-20); // keep last 20 ticks (100s of data)
        });
      }
    } catch (_) {}
  }

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = { id: Date.now(), text: chatInput, sentiment: '…' };
    setMessages(p => [...p, newMsg]);
    setChatInput('');
    setChatCount(c => c + 1);
    try {
      await fetch(`${SCORE_API}/track-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: MEETING_ID, userId: 'demo' }),
      });
      const res = await analyzeSentiment({ employeeId: '60d0fe4f5311236168a109ca', message: newMsg.text, source: 'Chat' });
      const sentiment = res?.data?.sentiment || 'Neutral';
      setMessages(p => p.map(m => m.id === newMsg.id ? { ...m, sentiment } : m));
    } catch (_) {
      setMessages(p => p.map(m => m.id === newMsg.id ? { ...m, sentiment: 'Neutral' } : m));
    }
  };

  const sentimentColor = {
    Positive: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
    Neutral: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400',
    Frustrated: 'bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400',
    Exhausted: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400',
    '…': 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500',
  };

  const isActive = cameraState === 'active';

  return (
    <div className="flex flex-col gap-6 pb-10">
      <FadeIn>
        <PageHeader
          title="Live Meeting"
          subtitle="Real-time engagement analytics via emotion, speaking activity, and chat."
        />
      </FadeIn>

      {/* ── Row 1: Video + Score ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video */}
        <div className="lg:col-span-2">
          <div className="relative rounded-3xl overflow-hidden bg-zinc-900 shadow-soft" style={{ minHeight: 380 }}>
            <video ref={videoRef} autoPlay playsInline muted={isMuted}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: isActive ? 'block' : 'none', position: isActive ? 'absolute' : 'static', inset: 0, minHeight: 380 }}
            />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                {cameraState === 'loading' && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-white/50 text-sm">Requesting permission…</p>
                  </div>
                )}
                {cameraState === 'error' && (
                  <div className="flex flex-col items-center gap-4 px-10 text-center">
                    <AlertCircle size={36} className="text-red-400" />
                    <p className="text-white/70 text-sm max-w-xs leading-relaxed">{cameraError}</p>
                    <button onClick={startCamera} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-colors">Try Again</button>
                  </div>
                )}
                {cameraState === 'idle' && (
                  <div className="flex flex-col items-center gap-5 text-center px-8">
                    <div className="w-20 h-20 rounded-full bg-white/8 border border-white/10 flex items-center justify-center">
                      <Camera size={32} className="text-white/60" />
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-semibold">Enable Camera to Join</h3>
                      <p className="text-white/40 text-sm mt-1.5 max-w-xs">No video or audio is stored. All processing is local.</p>
                    </div>
                    <button onClick={startCamera} className="px-7 py-2.5 bg-blue-500 hover:bg-blue-400 active:scale-95 text-white text-sm font-medium rounded-full transition-all">
                      Start Camera &amp; Join
                    </button>
                  </div>
                )}
              </div>
            )}
            {isActive && (
              <>
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-full z-10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />LIVE · Tracking
                </div>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 z-10">
                  <button onClick={() => setIsMuted(m => !m)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-white/10 text-white/50' : 'bg-white/20 text-white'}`}>
                    {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <button onClick={stopCamera} className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center">
                    <CameraOff size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Score + Radar */}
        <div className="flex flex-col gap-4">
          <Card className="p-5 border border-gray-100 dark:border-white/5 flex flex-col items-center gap-4">
            <p className="text-[11px] font-semibold text-textSecondary uppercase tracking-widest self-start">Live Score</p>
            <CircleScore score={Math.round(score)} />
            <p className="text-[11px] text-textSecondary">{isActive ? 'Refreshing every 5s' : 'Start camera to begin'}</p>
          </Card>

          {/* Radar Chart */}
          <Card className="p-4 border border-gray-100 dark:border-white/5 flex-1">
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-widest mb-2">Engagement Radar</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <PolarGrid stroke="#e5e5e5" strokeOpacity={0.5} />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#86868b' }} />
                  <Radar name="Score" dataKey="value" stroke="#007aff" fill="#007aff" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#007aff' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 11 }} formatter={(v) => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Row 2: Live Line Chart ── */}
      <FadeIn delay={0.1}>
        <Card className="p-6 border border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-textPrimary dark:text-white flex items-center gap-2">
                <Activity size={15} className="text-apple-blue" /> Live Engagement Timeline
              </h3>
              <p className="text-xs text-textSecondary mt-0.5">Real-time scores sampled every 5 seconds</p>
            </div>
            {!isActive && (
              <span className="text-xs text-textSecondary bg-surfaceAlt dark:bg-white/5 px-3 py-1 rounded-full">Waiting for camera…</span>
            )}
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 10 }} dy={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-xs text-textSecondary capitalize">{v}</span>} />
                <Line type="monotone" dataKey="engagement" name="Overall" stroke="#007aff" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="emotion" name="Emotion" stroke="#ff9500" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="speaking" name="Speaking" stroke="#34c759" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="chat" name="Chat" stroke="#af52de" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </FadeIn>

      {/* ── Row 3: Breakdown Bars + Chat ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Breakdown */}
        <FadeIn delay={0.15}>
          <Card className="p-5 border border-gray-100 dark:border-white/5 h-full">
            <h3 className="text-sm font-semibold text-textPrimary dark:text-white mb-5 flex items-center gap-1.5">
              Score Breakdown <ExternalLink size={13} className="text-textSecondary" />
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Emotion Bias', pct: '40%', value: breakdown.emotionScore || 0, color: 'bg-orange-400', note: 'Facial sentiment analysis' },
                { label: 'Verified Speaking', pct: '35%', value: breakdown.speakingPercent || 0, color: 'bg-blue-500', note: 'Anti-fake: 2s+ sustained voice only' },
                { label: 'Chat Activity', pct: '25%', value: breakdown.chatPercent || 0, color: 'bg-purple-500', note: `${chatCount} messages sent` },
              ].map(({ label, pct, value, color, note }) => (
                <div key={label}>
                  <div className="flex justify-between items-baseline text-sm mb-2">
                    <span className="font-medium text-textPrimary dark:text-white">{label} <span className="text-textSecondary font-normal text-xs">({pct})</span></span>
                    <span className="font-bold text-textPrimary dark:text-white tabular-nums">{value}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${color} rounded-full`}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[10px] text-textSecondary mt-1">{note}</p>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>

        {/* Chat */}
        <FadeIn delay={0.2}>
          <Card className="flex flex-col border border-gray-100 dark:border-white/5 overflow-hidden" style={{ height: 320 }}>
            <div className="px-4 py-3.5 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 shrink-0">
              <MessageSquare size={15} className="text-textSecondary" />
              <span className="text-sm font-semibold text-textPrimary dark:text-white">Meeting Chat</span>
              {chatCount > 0 && (
                <span className="ml-auto text-[11px] text-textSecondary">{chatCount} message{chatCount !== 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-textSecondary text-center px-6">
                  Type a message — sentiment is analyzed in real-time via Gemma AI.
                </div>
              ) : messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between gap-3 bg-surfaceAlt dark:bg-white/5 px-3 py-2.5 rounded-xl">
                  <span className="text-sm text-textPrimary dark:text-gray-200 flex-1 min-w-0 break-words">{msg.text}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${sentimentColor[msg.sentiment] || sentimentColor['…']}`}>
                    {msg.sentiment}
                  </span>
                </motion.div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="px-3 py-3 border-t border-gray-100 dark:border-white/5 flex gap-2 shrink-0">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 bg-surfaceAlt dark:bg-white/5 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:text-white placeholder:text-textSecondary"
              />
              <button type="submit" disabled={!chatInput.trim()}
                className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-400 disabled:opacity-30 text-white flex items-center justify-center transition-all shrink-0">
                <Send size={14} />
              </button>
            </form>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
