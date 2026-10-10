import { Home, Package, ClipboardList, Users, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { ActiveScreen } from '../types';
import { soundService } from '../utils/audioService';

interface BottomNavProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home' as ActiveScreen, label: 'Home', icon: Home, isHot: false },
    { id: 'products' as ActiveScreen, label: 'Product', icon: Package, isHot: false },
    { id: 'order' as ActiveScreen, label: 'Orders', icon: ClipboardList, isHot: false },
    { id: 'team' as ActiveScreen, label: 'Team', icon: Users, isHot: false },
    { id: 'my' as ActiveScreen, label: 'Mine', icon: UserIcon, isHot: false },
  ];

  // Do not render bottom nav on authentication screens or desktop admin panel
  if (['login', 'signup', 'admin'].includes(currentScreen)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-3 pb-3 pt-1 z-50 pointer-events-none">
      <nav className="pointer-events-auto bg-[#07132e]/95 backdrop-blur-2xl border border-blue-600/40 rounded-2xl p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex justify-around items-center relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            currentScreen === item.id || 
            (item.id === 'home' && ['roadmap'].includes(currentScreen)) ||
            (item.id === 'products' && ['vip', 'task'].includes(currentScreen)) ||
            (item.id === 'order' && ['income_record'].includes(currentScreen)) ||
            (item.id === 'my' && ['bank_account', 'bills', 'commission_record', 'about_us', 'support', 'setup', 'admin', 'withdrawal_records', 'security_log'].includes(currentScreen));

          return (
            <button
              key={item.id}
              onClick={() => {
                soundService.playClick();
                onNavigate(item.id);
              }}
              className="relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 transition-all group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-rose-600/90 to-red-700/90 rounded-xl shadow-md shadow-red-600/40 border border-red-400/40"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* HOT Badge if applicable */}
              {item.isHot && (
                <span className="absolute -top-1.5 px-1 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-[8px] font-black text-white leading-none shadow-sm uppercase tracking-wider z-20 border border-amber-300/40">
                  HOT
                </span>
              )}
              
              <motion.div 
                whileTap={{ scale: 0.88 }}
                className="relative z-10 flex flex-col items-center justify-center"
              >
                <Icon 
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive 
                      ? 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]' 
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`} 
                />
                <span className={`text-[10px] font-bold mt-0.5 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {item.label}
                </span>
              </motion.div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
