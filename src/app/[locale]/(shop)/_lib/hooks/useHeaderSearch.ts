'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { SyntheticEvent } from 'react';

/** The header's inline search box: open/closed, the typed query, and the submit → navigate-to-Search
 * side effect — one hook instead of three pieces of state plus a `router.push` living in `Header`. */
export function useHeaderSearch(locale: string) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  function open(): void {
    setIsOpen(true);
  }

  function close(): void {
    setIsOpen(false);
    setQuery('');
  }

  function submit(e: SyntheticEvent<HTMLFormElement>): void {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(trimmed)}`);
    close();
  }

  return { isOpen, query, setQuery, open, close, submit };
}
