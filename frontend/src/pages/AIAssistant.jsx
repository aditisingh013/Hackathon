import React, { useState } from 'react';
import { BrainCircuit, Send, User, Sparkles } from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi Admin! I'm Burnout Buddy (Powered by Gemma). I continuously monitor sentiment and metrics. How can I assist your organization today?", sender: "ai" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock Gemma AI Delay Response
    setTimeout(() => {
      const responses = [
        "Based on last week's data, I recommend scheduling a 1-on-1 with the Engineering department. The logs show an average of 54 work hours per engineer.",
        "I've initiated a wellness survey to Team Alpha automatically based on their declining productivity metrics.",
        "Sentiment analysis of recent sprint reflections indicates frustration with 'deploy times'. Reducing operational friction there could drop burnout risk by 10%."
      ];
      const aiResponse = { 
        id: Date.now() + 1, 
        text: responses[Math.floor(Math.random() * responses.length)], 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <BrainCircuit className="text-indigo-500" />
          Burnout Buddy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your generative AI enterprise orchestrator</p>
      </div>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/30 relative">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <BrainCircuit size={300}/>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} relative z-10`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'ai' ? 'bg-gradient-to-br from-indigo-500 to-primary-600 text-white' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'}`}>
                {msg.sender === 'ai' ? <Sparkles size={20} /> : <User size={20} />}
              </div>
              <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                msg.sender === 'ai' 
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm' 
                : 'bg-primary-600 text-white rounded-tr-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-4 relative z-10">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                 <Sparkles size={20} />
               </div>
               <div className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm flex items-center gap-1.5 h-[50px]">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '300ms'}}></span>
               </div>
             </div>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50 flex gap-2 w-full z-20">
          <input 
            type="text" 
            placeholder="Ask Gemma about workforce metrics or generated insights..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 px-5 rounded-xl transition-colors flex items-center gap-2 font-semibold shadow-sm"
          >
            <Send size={18} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
