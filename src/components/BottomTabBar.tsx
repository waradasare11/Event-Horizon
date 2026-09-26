import React from 'react';
import { 
  Sun, 
  Utensils, 
  Dumbbell, 
  TrendingUp, 
  Bot 
} from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'today', label: 'Today', icon: Sun },
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'coach', label: 'Coach', icon: Bot },
  ];

  return (
    <nav 
      aria-label="App Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-xl border-t border-slate-200 dark:border-[#1E3A5F] px-2 py-1.5 transition-all md:bottom-5 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto md:rounded-full md:border md:border-slate-200 dark:md:border-[#1E3A5F] md:bg-white/90 dark:md:bg-[#0B1220]/90 md:shadow-2xl md:shadow-black/50 md:px-2 md:py-1.5"
    >
      <div className="flex items-center justify-around md:justify-center md:gap-1.5 max-w-md md:max-w-none mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[44px] px-3 sm:px-4 py-1.5 rounded-full flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/30'
                  : 'text-[#8BA3C7] hover:text-slate-900 dark:hover:text-[#E8F1FF] hover:bg-slate-100 dark:hover:bg-[#1E3A5F]/30 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8BA3C7]'}`} />
              <span className="text-[11px] sm:text-xs tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
