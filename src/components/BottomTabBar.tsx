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
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-lg border-t border-[#C9D7F2] dark:border-[#1E3A5F] md:hidden transition-colors shadow-lg"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 px-1 text-center transition-all cursor-pointer ${
                isActive
                  ? 'text-[#2563EB] dark:text-[#60A5FA] font-bold'
                  : 'text-slate-400 dark:text-[#8BA3C7] hover:text-slate-700 dark:hover:text-[#E8F1FF] font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#2563EB] dark:text-[#60A5FA]' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] shadow-[0_0_8px_#38BDF8]" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
