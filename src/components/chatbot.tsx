'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Bot, User, Sparkles, Mic } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickReplies = [
  'What schemes am I eligible for?',
  'How to apply for PM Kisan?',
  'Explain Ayushman Bharat',
  'Scholarships for students',
];

const aiResponses: Record<string, string> = {
  'What schemes am I eligible for?': 'Based on your profile as a farmer from Uttar Pradesh with OBC category and annual income of ₹2.5 lakh, you are highly eligible for:\n\n🌾 **PM Kisan Samman Nidhi** (95% match) - ₹6,000/year direct benefit\n🏥 **Ayushman Bharat PMJAY** (88% match) - ₹5 lakh health coverage\n⚡ **PM Surya Ghar** (85% match) - Free solar panel installation\n🏘️ **MGNREGA** (90% match) - 100 days guaranteed employment\n\nWould you like detailed information about any of these schemes?',
  'How to apply for PM Kisan?': 'Here\'s how to apply for **PM Kisan Samman Nidhi**:\n\n📋 **Step 1:** Visit pmkisan.gov.in\n📋 **Step 2:** Click on "New Farmer Registration"\n📋 **Step 3:** Enter your Aadhaar number and captcha\n📋 **Step 4:** Fill in personal, land, and bank details\n📋 **Step 5:** Upload required documents\n📋 **Step 6:** Submit and note your registration number\n\n📄 **Documents needed:** Aadhaar Card, Bank Passbook, Land Records\n\n💡 You can also apply through your nearest CSC center or contact your Patwari/Lekhpal.',
  'Explain Ayushman Bharat': '**Ayushman Bharat - PMJAY** is the world\'s largest health insurance scheme:\n\n🏥 **Coverage:** ₹5 lakh per family per year\n👨‍👩‍👧‍👦 **Beneficiaries:** Over 12 crore families\n🏨 **Network:** 28,000+ empanelled hospitals\n💊 **Procedures:** 1,900+ medical packages covered\n\n✅ **You qualify** because your income is below ₹3 lakh/year and you belong to OBC category.\n\n📱 Check eligibility at mera.pmjay.gov.in or call 14555.',
  'Scholarships for students': 'Here are the top scholarships available through the **National Scholarship Portal**:\n\n📚 **Pre-Matric Scholarship** (Class 1-10): ₹3,500-₹7,000/year\n📚 **Post-Matric Scholarship** (Class 11+): ₹7,000-₹75,000/year\n📚 **Merit-cum-Means**: For professional courses\n📚 **Central Sector Scheme**: ₹12,000-₹20,000/year for college students\n\n⚠️ Since your profile shows you are not currently a student, you may want to update your profile if you have student family members.\n\nApply at scholarships.gov.in',
};

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Namaste! 🙏 I\'m your JanSeva AI assistant. I can help you find eligible government schemes, explain benefits, and guide you through applications. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(2);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: (idCounter.current++).toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    let aiContent = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userProfile: user }),
      });
      const data = await response.json();
      if (data.success) {
        aiContent = data.response;
      } else {
        throw new Error(data.error || 'Failed to get chat response');
      }
    } catch (e) {
      console.error('Chatbot API fetch error, using local fallback:', e);
      aiContent = aiResponses[text] ||
        `I understand you're asking about "${text}". Based on your profile, I'd recommend checking the **Scheme Explorer** for relevant matches. You can also try asking me about:\n\n• Your eligibility for specific schemes\n• How to apply for any scheme\n• Required documents for applications\n• Deadline information\n\nIs there anything specific you'd like to know?`;
    }

    const aiMsg: Message = {
      id: (idCounter.current++).toString(),
      role: 'assistant',
      content: aiContent,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron-500 to-saffron-600 text-white flex items-center justify-center shadow-2xl shadow-saffron-500/30 hover:shadow-saffron-500/50 hover:scale-105 active:scale-95 transition-all group animate-bounce-in"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-surface-950 animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] flex flex-col glass-card rounded-2xl shadow-2xl shadow-black/40 animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-navy-500/20 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">JanSeva AI Assistant</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Online — Powered by Gemini
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-saffron-500 to-saffron-600'
                      : 'bg-navy-500'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <Bot className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-white/5 text-surface-200 rounded-tl-md'
                      : 'bg-saffron-500/15 text-white rounded-tr-md'
                  }`}
                >
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
                      )}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5 animate-fade-in">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-surface-400 rounded-full typing-dot" />
                    <span className="w-2 h-2 bg-surface-400 rounded-full typing-dot" />
                    <span className="w-2 h-2 bg-surface-400 rounded-full typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-surface-300 hover:bg-saffron-500/10 hover:text-saffron-400 transition-all border border-white/5 hover:border-saffron-500/20"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/5">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1">
              <button
                type="button"
                className="p-2 text-surface-500 hover:text-saffron-400 transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about government schemes..."
                className="flex-1 bg-transparent text-sm text-white placeholder-surface-500 focus:outline-none py-2"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 text-saffron-400 hover:text-saffron-300 disabled:text-surface-600 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
