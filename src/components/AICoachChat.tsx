import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RefreshCw, 
  Flame, 
  Dumbbell, 
  ShieldCheck, 
  HelpCircle,
  MessageSquare,
  Globe,
  ExternalLink
} from 'lucide-react';
import { UserProfile, SearchCitation } from '../types';
import { getStoredCoachMessages, saveStoredCoachMessages } from '../lib/storage';
import { saveUserMemory } from '../lib/userMemory';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: SearchCitation[];
}

interface AICoachChatProps {
  userProfile: UserProfile;
}

const QUICK_QUESTIONS = [
  'Guide: Metabolic Adaptation & Refeeds — How to break fat loss plateaus safely',
  'Guide: Lengthened Partials & Volume — Optimal weekly sets and RIR for hypertrophy',
  'Guide: Protein Distribution & Creatine — ISSN evidence on leucine threshold and saturation',
  'Optimal daily protein distribution & per-meal leucine threshold?',
  'Should I do cardio before or after heavy lifting to avoid the interference effect?',
  'What are the best chest exercises if I have shoulder impingement?',
];

function buildDefaultWelcomeMessage(userProfile: UserProfile): Message {
  return {
    id: 'msg-init',
    role: 'assistant',
    content: `Hello ${userProfile.name || 'there'}! I am your AROH Science Coach, powered by sports science literature, exercise physiology, and real-time Google Search grounding (inspired by BuiltWithScience and ISSN guidelines). 

I have your personalized profile loaded:
• **Goal:** ${userProfile.goal === 'lose_fat' ? 'Fat Loss & Muscle Preservation' : userProfile.goal === 'build_muscle' ? 'Hypertrophy & Lean Bulk' : 'Body Recomposition'}
• **Caloric Target:** ${userProfile.dailyCalories} kcal (${userProfile.dailyProtein}g protein)
• **Weight:** ${userProfile.weightKg} kg (Target: ${userProfile.targetWeightKg} kg)
• **Restrictions/Injuries:** ${userProfile.injuries?.join(', ') || 'None'}

Ask me anything about fat loss biology, muscle hypertrophy mechanics, EMG muscle activation, nutrition timing, or evidence-based supplements!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

export const AICoachChat: React.FC<AICoachChatProps> = ({ userProfile }) => {
  const [currentEmail, setCurrentEmail] = useState(userProfile.email);
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = getStoredCoachMessages(userProfile.email);
    if (stored && stored.length > 0) {
      return stored;
    }
    return [buildDefaultWelcomeMessage(userProfile)];
  });

  // Immediate wipe and sync in same frame if athlete email changes
  if (userProfile.email !== currentEmail) {
    setCurrentEmail(userProfile.email);
    const stored = getStoredCoachMessages(userProfile.email);
    setMessages(stored && stored.length > 0 ? stored : [buildDefaultWelcomeMessage(userProfile)]);
  }

  // Re-sync when switching athlete profile
  useEffect(() => {
    const stored = getStoredCoachMessages(userProfile.email);
    if (stored && stored.length > 0) {
      setMessages(stored);
    } else {
      setMessages([buildDefaultWelcomeMessage(userProfile)]);
    }
  }, [userProfile.email]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [enableThinking, setEnableThinking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const persistMessages = (newMsgs: Message[]) => {
    const capped = newMsgs.slice(-100);
    setMessages(capped);
    saveStoredCoachMessages(capped, userProfile.email);
    saveUserMemory('coach_chat', {
      email: userProfile.email,
      coachChat: { messages: capped as any },
    });
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedWithUser = [...messages, userMsg];
    persistMessages(updatedWithUser);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedWithUser.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userProfile,
          useSearchGrounding,
          enableThinking,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to get AI Coach response');
      }

      const botMsg: Message = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
      };

      persistMessages([...updatedWithUser, botMsg]);
    } catch (err: any) {
      console.error('Coach chat error:', err);
      const errorMsg: Message = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: `I ran into a temporary issue connecting to the Gemini engine: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      persistMessages([...updatedWithUser, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0E1424] rounded-3xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-xs overflow-hidden h-[800px] flex flex-col animate-in fade-in duration-300 text-left">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-[#FAFAF8] dark:bg-[#191B1A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D4FF] flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5 text-[#E8912D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
                AI Fitness Coach
              </h2>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">
              Evidence-based exercise physiology and nutrition guidance
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Deep Thinking Toggle */}
          <button
            type="button"
            onClick={() => setEnableThinking(!enableThinking)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              enableThinking
                ? 'bg-cyan-500/10 text-amber-600 dark:text-cyan-400 border-cyan-500/30 font-bold'
                : 'bg-white dark:bg-[#1E201F] text-[#6B7280] dark:text-[#9EA8A2] border-[#E5E7EB] dark:border-[#1E293B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Deep Thinking: {enableThinking ? 'On' : 'Off'}</span>
          </button>

          {/* Grounding Toggle */}
          <button
            type="button"
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              useSearchGrounding
                ? 'bg-[#00D4FF]/10 text-[#00D4FF] dark:text-[#38BDF8] border-[#00D4FF]/30'
                : 'bg-white dark:bg-[#1E201F] text-[#6B7280] dark:text-[#9EA8A2] border-[#E5E7EB] dark:border-[#1E293B]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#00D4FF] dark:text-[#38BDF8]" />
            <span>Search: {useSearchGrounding ? 'On' : 'Off'}</span>
          </button>

          <button
            onClick={() => setMessages([messages[0]])}
            className="text-xs text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white flex items-center gap-1 font-medium px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center text-white shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-[#E8912D]" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[78%] p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#00D4FF] text-white rounded-tr-xs shadow-xs'
                    : 'bg-[#FAFAF8] dark:bg-[#1C1F1D] text-[#1A1D1B] dark:text-[#E8ECE9] border border-[#E5E7EB] dark:border-[#1E293B] rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Citations block */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-[#E5E7EB] dark:border-[#1E293B] space-y-1.5">
                    <div className="text-[10px] font-bold text-[#6B7280] dark:text-[#9EA8A2] uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[#00D4FF] dark:text-[#38BDF8]" />
                      <span>Cited Literature & Sources ({msg.citations.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.slice(0, 4).map((cite, cIdx) => (
                        <a
                          key={cIdx}
                          href={cite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-[#0E1424] border border-[#E5E7EB] dark:border-[#1E293B] text-[10px] text-[#00D4FF] dark:text-[#38BDF8] font-semibold hover:border-[#00D4FF] hover:bg-[#00D4FF]/5 transition-all max-w-[220px] truncate"
                        >
                          <span className="truncate">{cite.title || cite.domain || 'Source'}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 ${
                    isUser ? 'text-white/70 text-right' : 'text-[#9CA3AF] dark:text-[#78827C]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#E8912D] flex items-center justify-center text-white shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF] flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4 text-[#E8912D]" />
            </div>
            <div className="bg-[#FAFAF8] dark:bg-[#1C1F1D] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] text-xs text-[#6B7280] dark:text-[#9EA8A2] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E8912D] animate-spin" />
              <span>{enableThinking ? 'Engaging Deep Thinking reasoning engine...' : 'Querying online sports science literature & synthesizing evidence...'}</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-[#FAFAF8] dark:bg-[#191B1A] border-t border-[#E5E7EB] dark:border-[#1E293B] overflow-x-auto scrollbar-none flex gap-2">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-white dark:bg-[#0E1424] border border-[#E5E7EB] dark:border-[#1E293B] text-[#4B5563] dark:text-[#D1D5DB] hover:border-[#00D4FF] hover:text-[#00D4FF] dark:hover:text-[#38BDF8] whitespace-nowrap transition-all shadow-2xs cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white dark:bg-[#0E1424] border-t border-[#E5E7EB] dark:border-[#1E293B]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about fat loss, hypertrophy, diet breaks, protein distribution, or biomechanics..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-[#1E293B] bg-[#FAFAF8] dark:bg-[#1C1F1D] text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none focus:ring-1 focus:ring-[#00D4FF]"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="px-5 py-3 rounded-xl bg-[#00D4FF] text-white font-semibold hover:bg-[#0369A1] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#E8912D]" />
            <span className="hidden sm:inline text-xs font-bold">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
