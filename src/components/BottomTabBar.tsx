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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111312]/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 md:hidden transition-colors shadow-lg"
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
                  ? 'text-amber-500 dark:text-amber-400 font-black'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
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
