'use client';

import { useEffect, useState } from 'react';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

/** Light/dark toggle in the header, matching TailAdmin's header icon-button — `next-themes` is the
 * same mechanism `apps/storefront` already ships (there, wired but inert; here it's actually used). */
export function ThemeToggle(): React.JSX.Element | null {
  const { resolvedTheme, setTheme } = useTheme();
  // `resolvedTheme` is undefined on the server and on first client render — rendering a fixed icon
  // before hydration would flash the wrong one, so render nothing until mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Recognized exception to "no setState in effect" — this is the standard next-themes hydration
    // guard (server and first client render can't know the persisted theme yet); one extra commit
    // right after mount is the accepted cost, not an oversight.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <span className="size-10 lg:size-11" aria-hidden="true" />;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark');
      }}
      className="flex size-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:size-11 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
