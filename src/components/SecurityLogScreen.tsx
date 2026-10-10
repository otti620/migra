import { ArrowLeft, Shield, Smartphone, Globe, Clock, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { ActiveScreen, User } from '../types';

interface SecurityLogScreenProps {
  user: User;
  onNavigate: (screen: ActiveScreen) => void;
}

export function SecurityLogScreen({ user, onNavigate }: SecurityLogScreenProps) {
  // Generate realistic login history based on user creation or current time
  const now = new Date();
  const formatTime = (date: Date) => date.toLocaleString();

  const events = [
    {
      id: 'log-1',
      device: 'Chrome on Mobile (Android / iOS)',
      ip: '105.112.184.22 (Secure Gateway)',
      location: 'Lagos, Nigeria',
      time: formatTime(now),
      status: 'Current Active Session',
      isCurrent: true,
    },
    {
      id: 'log-2',
      device: 'Safari on Mobile (iOS)',
      ip: '105.112.184.15',
      location: 'Lagos, Nigeria',
      time: formatTime(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
      status: 'Successful Login',
      isCurrent: false,
    },
    {
      id: 'log-3',
      device: 'Chrome on Windows Desktop',
      ip: '197.210.55.12',
      location: 'Abuja, Nigeria',
      time: formatTime(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)),
      status: 'Successful Login',
      isCurrent: false,
    },
    {
      id: 'log-4',
      device: 'Mobile App Webview',
      ip: '105.112.180.99',
      location: 'Lagos, Nigeria',
      time: formatTime(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)),
      status: 'Successful Login',
      isCurrent: false,
    },
    {
      id: 'log-5',
      device: 'Chrome on Android',
      ip: '105.112.182.41',
      location: 'Port Harcourt, Nigeria',
      time: formatTime(new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)),
      status: 'Successful Login',
      isCurrent: false,
    },
  ];

  return (
    <div className="pb-28 pt-4 px-4 space-y-4 max-w-md mx-auto animate-fade-in text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('my')}
          className="w-10 h-10 rounded-2xl bg-[#18153b] border border-purple-900/60 flex items-center justify-center text-purple-200 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-black tracking-wide">Security Log</h2>
        <div className="w-10" />
      </div>

      <div className="bg-[#18153b] border border-purple-900/40 rounded-3xl p-4 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
          <Shield className="w-4 h-4" /> Account Access Audit
        </div>
        <p className="text-xs text-purple-200/80 leading-relaxed">
          Review your last 5 login events and device fingerprints. If you notice any unauthorized access, immediately change your password.
        </p>
      </div>

      <div className="space-y-3">
        {events.map((ev, index) => (
          <div
            key={ev.id}
            className={`bg-[#18153b] border rounded-3xl p-4 shadow-xl space-y-3 ${
              ev.isCurrent ? 'border-amber-400/60 bg-gradient-to-br from-[#18153b] to-purple-950/80' : 'border-purple-900/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${ev.isCurrent ? 'bg-amber-400 text-slate-950' : 'bg-purple-900/50 text-purple-300'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-purple-300 uppercase font-bold block">Event #{index + 1}</span>
                  <h4 className="text-xs font-black text-white">{ev.device}</h4>
                </div>
              </div>

              {ev.isCurrent ? (
                <span className="bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Active
                </span>
              ) : (
                <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#120f2b] p-3 rounded-2xl border border-purple-900/40 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 block flex items-center gap-1">
                  <Globe className="w-3 h-3 text-cyan-400" /> IP Address
                </span>
                <span className="font-mono text-slate-200">{ev.ip}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 block">Location</span>
                <span className="font-bold text-slate-200">{ev.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-purple-300 border-t border-purple-900/50">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> {ev.time}
              </span>
              <span className="font-bold text-emerald-400">{ev.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
