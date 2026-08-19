import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { ThemeMode } from '../lib/theme';

interface ThemeToggleProps {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  onThemeChange: (theme: ThemeMode) => void;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  effectiveTheme,
  onThemeChange,
  compact = false,
}) => {
  const toggleTheme = () => {
    // Cycle light -> dark -> light
    if (effectiveTheme === 'dark') {
      onThemeChange('light');
    } else {
      onThemeChange('dark');
    }
  };

  const isDark = effectiveTheme === 'dark';

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-white dark:bg-[#1A1D1C] text-[#4B5563] dark:text-[#E8ECE9] hover:bg-[#F9FAFB] dark:hover:bg-[#232726] transition-all shadow-xs flex items-center justify-center relative group"
        aria-label={`Switch to ${isDark ? 'light mode' : 'gym dark mode'}`}
        title={`Current: ${isDark ? 'Dark Gym Mode' : 'Light Mode'}. Click to switch.`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20 transition-transform group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-[#0F6E5F] fill-[#0F6E5F]/20 transition-transform group-hover:-rotate-12" />
        )}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-[#F3F4F6] dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] shadow-2xs">
      <button
        type="button"
        onClick={() => onThemeChange('light')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          theme === 'light'
            ? 'bg-white text-[#1A1D1B] shadow-2xs'
            : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white'
        }`}
        aria-label="Light mode"
        title="Daylight Clean Light Theme"
      >
        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500 fill-amber-500/20' : ''}`} />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => onThemeChange('dark')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          theme === 'dark'
            ? 'bg-[#2A2E2C] text-white shadow-2xs'
            : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white'
        }`}
        aria-label="Dark gym mode"
        title="Low-Light Gym Dark Theme"
      >
        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-amber-400 fill-amber-400/20' : ''}`} />
        <span className="hidden sm:inline">Gym Dark</span>
      </button>

      <button
        type="button"
        onClick={() => onThemeChange('system')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-[#2A2E2C] text-[#1A1D1B] dark:text-white shadow-2xs'
            : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white'
        }`}
        aria-label="Auto system theme"
        title="Sync with OS Preference"
      >
        <Monitor className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Auto</span>
      </button>
    </div>
  );
};
