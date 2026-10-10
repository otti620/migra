import React, { useState } from 'react';
import { ArrowLeft, Send, Headphones, ExternalLink, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { ActiveScreen } from '../types';

interface SupportChatScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
}

export function SupportChatScreen({ onNavigate }: SupportChatScreenProps) {
  const [messages, setMessages] = useState([
    { sender: 'support', text: 'Hello! Welcome to Dangote Petroleum Refinery & Petrochemicals PLC Shareholder Support Desk. You can contact our direct investor relations agent on Telegram or ask about ISO share subscriptions, daily refinery yields, and bank withdrawals.' }
  ]);
  const [input, setInput] = useState('');

  const sendBotReply = (userQuery: string) => {
    const q = userQuery.toLowerCase();
    let reply = 'Thank you for reaching out. For instant 24/7 assistance with Dangote Refinery ISO subscriptions, connect with our investor relations desk on Telegram.';
    
    if (q.includes('deposit') || q.includes('recharge') || q.includes('fund') || q.includes('pay') || q.includes('subscribe')) {
      reply = `📋 **Dangote Refinery ISO Subscription & Deposit Guide:**\n\n1. Tap on the **Subscribe IPO / Recharge** button on your dashboard.\n2. Enter your desired subscription amount (e.g. ₦5,000, ₦10,000, ₦50,000 or custom).\n3. Complete transfer via our dedicated Paystack direct bank transfer checkout:\n   • Bank: **KUDA MFB**\n   • Account Number: **3004023147**\n   • Account Name: **TITAN DIGITAL SYSTEMS LIMITED**\n4. Confirm the transfer and enter your sender bank details. Your shareholder balance is credited instantly upon automatic verification!\n\nNeed manual approval? Contact our support desk on Telegram with your transfer receipt.`;
    } else if (q.includes('withdrawal') || q.includes('withdraw') || q.includes('bank account') || q.includes('guidelines') || q.includes('dividend')) {
      reply = `📜 **Official Dividend Withdrawal Guidelines & Rules:**\n\n1. **Withdrawal Window:** Monday to Friday, 10:00 AM - 5:00 PM (10:00 - 17:00).\n2. **Bank Account Accuracy:** Ensure your bound 10-digit NUBAN account name matches your registered name exactly.\n3. **Transaction Fee:** An 11% network & settlement fee applies to all withdrawal requests.\n4. **Limits & Balance:** Minimum withdrawal is ₦1,000. Maximum per single transaction is ₦1,000,000.\n5. **Mandatory Qualification:** To prevent fraudulent claims, users must make a deposit and purchase an active share tranche before making withdrawals.`;
    } else if (q.includes('task') || q.includes('earn') || q.includes('order') || q.includes('ipo') || q.includes('refinery')) {
      reply = `⚡ **Dangote Refinery ISO & Daily Yield Guide:**\n\n1. Go to the **Products / IPO** tab.\n2. Select your desired share tranche (e.g. Retail Class-A, CDU Distillation, PMS Petrol Tranche, Petrochemical Industrial Pool).\n3. Claim your automated daily dividend return in the **Holdings / Orders** tab every 24 hours!\n4. Earn up to 15%, 3%, and 1% referral commission across 3 tiers of downline shareholder syndicates.`;
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'support', text: reply }]);
    }, 600);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = input;
    setMessages((prev) => [...prev, { sender: 'user', text: newMsg }]);
    setInput('');
    sendBotReply(newMsg);
  };

  const handleQuickPrompt = (promptText: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text: promptText }]);
    sendBotReply(promptText);
  };

  return (
    <div className="pb-24 pt-3 px-4 flex flex-col h-screen max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onNavigate('home')} className="w-9 h-9 rounded-full bg-[#18153b] border border-purple-900 flex items-center justify-center text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Headphones className="w-5 h-5 text-purple-400" /> Customer Support
        </h2>
        <div className="w-9"></div>
      </div>

      {/* Direct Telegram Contacts Banner */}
      <div className="space-y-2 mb-3">
        {/* Top Direct CS handle */}
        <a
          href="https://t.me/dangote_refinery_support"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-500/40 rounded-2xl p-3 flex items-center justify-between text-white shadow-lg hover:border-blue-400 transition group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-md">
              <Headphones className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] text-blue-200 font-bold uppercase block">Official Telegram CS (Top)</span>
              <span className="text-xs font-black text-amber-300 font-mono">@DANGOTE_REFINERY_SUPPORT</span>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-md">
            Open CS <ExternalLink className="w-3 h-3" />
          </div>
        </a>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
        <button
          onClick={() => handleQuickPrompt('How do I deposit funds?')}
          className="bg-purple-950/80 border border-purple-800/60 hover:border-cyan-500 text-purple-200 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> How do I deposit funds?
        </button>
        <button
          onClick={() => handleQuickPrompt('Give me withdrawal guidelines')}
          className="bg-purple-950/80 border border-purple-800/60 hover:border-cyan-500 text-purple-200 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5 text-rose-400" /> Withdrawal Guidelines
        </button>
        <button
          onClick={() => handleQuickPrompt('What are the bank account details?')}
          className="bg-purple-950/80 border border-purple-800/60 hover:border-cyan-500 text-purple-200 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" /> Official Bank Details
        </button>
      </div>

      <div className="flex-1 bg-[#18153b]/90 border border-purple-900/40 rounded-3xl p-4 overflow-y-auto space-y-3 mb-4 shadow-xl">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
              m.sender === 'user' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md' 
                : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about deposits, withdrawals or tasks..."
          className="flex-1 bg-[#18153b] border border-purple-900/60 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
        />
        <button
          type="submit"
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/40 hover:scale-105 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
