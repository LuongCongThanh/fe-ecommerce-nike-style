import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia — next-themes' <ThemeProvider> reads it on mount to resolve
// the "system" theme. Minimal stub so tests wrapping components in ThemeProvider (e.g. AppShell,
// which renders ThemeToggle) don't crash; no test here asserts on system-theme behavior.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
