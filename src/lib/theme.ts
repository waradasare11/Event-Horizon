export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'aroh_theme_preference';
const LEGACY_THEME_STORAGE_KEY = 'peakform_theme_preference';

export function getStoredTheme(): ThemeMode {
  try {
    let saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (!saved) {
      const legacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY) as ThemeMode | null;
      if (legacy === 'light' || legacy === 'dark' || legacy === 'system') {
        saved = legacy;
        try {
          localStorage.setItem(THEME_STORAGE_KEY, legacy);
        } catch {
          // ignore
        }
      }
    }
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (e) {
    console.error('Failed reading theme preference from storage', e);
  }
  return 'dark';
}

export function isSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return isSystemDark() ? 'dark' : 'light';
  }
  return mode;
}

export function applyTheme(mode: ThemeMode): 'light' | 'dark' {
  const effective = resolveEffectiveTheme(mode);
  const root = document.documentElement;

  if (effective === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (e) {
    console.error('Failed saving theme preference to storage', e);
  }

  return effective;
}
