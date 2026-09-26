import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { ThemeMode } from '../lib/theme';

interface ThemeToggleProps {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  onThemeChange: (theme: ThemeMode) => void;
  className?: string;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  effectiveTheme,
  onThemeChange,
  className = '',
}) => {
  // Cycle light -> dark -> system (auto) -> light
  const cycleTheme = () => {
    if (theme === 'light') {
      onThemeChange('dark');
    } else if (theme === 'dark') {
      onThemeChange('system');
    } else {
      onThemeChange('light');
    }
  };

  const getThemeDetails = () => {
    if (theme === 'light') {
      return {
        label: 'Theme: Light (click for Dark)',
        icon: <Sun className="w-4 h-4 text-[#3B82F6]" />,
      };
    }
    if (theme === 'dark') {
      return {
        label: 'Theme: Dark (click for Auto)',
        icon: <Moon className="w-4 h-4 text-[#60A5FA]" />,
      };
    }
    return {
      label: `Theme: Auto (${effectiveTheme === 'dark' ? 'Dark' : 'Light'}) (click for Light)`,
      icon: <Monitor className="w-4 h-4 text-[#8BA3C7]" />,
    };
  };

  const { label, icon } = getThemeDetails();

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={`min-w-[36px] min-h-[36px] p-2 rounded-xl border border-slate-200 dark:border-[#1E3A5F] bg-white dark:bg-[#0B1220] hover:bg-slate-100 dark:hover:bg-[#1E3A5F]/40 text-[#8BA3C7] hover:text-slate-900 dark:hover:text-[#E8F1FF] transition-all flex items-center justify-center cursor-pointer shadow-xs ${className}`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
};
