import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Send, User, Sparkles, RefreshCw } from 'lucide-react';
import { getAnalyticsBurnout, getAnalyticsAnomalies } from '../services/api';

const INITIAL_MESSAGES = [
  {
    id: 1,
    text: "Hi! I'm **Burnout Buddy**, your AI workforce health coach. I analyze productivity patterns, sentiment data, and workload metrics dynamically from your MongoDB Atlas endpoints.\n\nHow can I help your organization today?",
    sender: 'ai',
  },
];

const QUICK_PROMPTS = [
  'Who is at highest burnout risk right now?',
  'Show me any active workforce anomalies.',
  'What should I prioritize?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const fetchAIResponse = async (query) => {
    try {
      const q = query.toLowerCase();
      
      if (q.includes('risk')) {
         const res = await getAnalyticsBurnout();
         const highRisk = res.data?.highRiskEmployees || [];
         if (highRisk.length > 0) {
            return `I found **${highRisk.length} employees** at critical risk: ${highRisk.map(e => `**${e.name}** (${e.department})`).join(', ')}. I recommend scheduling 1-on-1 check-ins immediately.`;
         }
         return "Great news! I don't see any employees currently flagged at High Risk based on the active tracking parameters.";
      }
      
      if (q.includes('anomalies') || q.includes('prioritize')) {
         const res = await getAnalyticsAnomalies();
         const anom = res.data || [];
         if (anom.length > 0) {
            return `Here are the top anomalies requiring your attention: \n\n${anom.slice(0,3).map((a,i) => `${i+1}. **${a.name}** (${a.severity} Severity): ${a.description}`).join('\n')}`;
         }
         return "System looks stable. No anomalies detected across the workforce.";
      }

      return "I use Gemma 4 to analyze organizational sentiment. Currently, my conversational hook is processing explicit system queries. Try asking me about 'burnout risk' or 'anomalies'.";
    } catch (e) {
       console.error(e);
       return "I'm having trouble connecting to the analytics backend. Please check your network connection.";
    }
  };

  const send = async (text) => {
    if (!text?.trim() || typing) return;
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const reply = await fetchAIResponse(text);
    
    setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'ai' }]);
    setTyping(false);
  };

  const reset = () => {
    setMessages(INITIAL_MESSAGES);
    setInput('');
    setTyping(false);
  };

  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong> : p
    );
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-textPrimary dark:text-white flex items-center gap-2.5">
            <BrainCircuit className="text-apple-blue" size={28} />
            Burnout Buddy
          </h1>
          <p className="text-sm text-textSecondary mt-1">AI Context grounded on real backend data endpoints</p>
        </div>
        <button onClick={reset} className="flex items-center gap-2 text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors">
          <RefreshCw size={14} /> New Chat
        </button>
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-white dark:bg-surfaceDarkAlt rounded-2xl shadow-soft flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-5 relative">
          {messages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'ai' ? 'bg-apple-blue text-white' : 'bg-surfaceAlt text-textSecondary'
              }`}>
                {msg.sender === 'ai' ? <Sparkles size={15} /> : <User size={15} />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'ai' ? 'bg-surfaceAlt text-textPrimary rounded-tl-md' : 'bg-apple-blue text-white rounded-tr-md'
              }`}>
                {renderText(msg.text)}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-apple-blue text-white flex items-center justify-center shrink-0"><Sparkles size={15} /></div>
              <div className="px-4 py-3.5 bg-surfaceAlt rounded-2xl rounded-tl-md flex gap-1.5 items-center">
                {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-textSecondary animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 px-5 py-2.5 overflow-x-auto border-t border-gray-50 dark:border-white/5">
          {QUICK_PROMPTS.map(q => (
            <button key={q} onClick={() => send(q)} disabled={typing} className="shrink-0 text-[12px] font-medium text-apple-blue bg-apple-blue/8 rounded-full px-3.5 py-1.5 whitespace-nowrap hover:bg-apple-blue/15 transition-colors disabled:opacity-40">
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2.5 p-4 border-t border-gray-50 dark:border-white/5">
          <input type="text" placeholder="Try asking about anomalies or risks..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} className="flex-1 px-4 py-2.5 text-sm bg-surfaceAlt dark:bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-apple-blue/30 dark:text-white transition-shadow" />
          <button onClick={() => send(input)} disabled={!input.trim() || typing} className="bg-apple-blue hover:bg-blue-600 disabled:opacity-30 text-white px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium">
            <Send size={15} /> <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
