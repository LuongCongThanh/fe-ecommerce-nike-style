/** Minimal single-colour brand marks — good enough for a disabled/decorative button, not claiming
 * pixel-exact Simple Icons fidelity. Shared by storefront/admin/cms login pages, which each used to
 * carry a byte-for-byte-identical copy (code review on PR #73). */
export function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M9.1 23.7v-8H6.6v-3.7h2.5V10.4c0-4.1 1.8-6 5.9-6 .8 0 2 .1 2.6.3v3.3a17 17 0 0 0-1.4 0c-1.7 0-2.4.7-2.4 2.3v1.7h3.9l-.7 3.7H13.7v8A11.96 11.96 0 0 0 24 12 12 12 0 1 0 9.1 23.7Z" />
    </svg>
  );
}

export function TwitterMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M24 4.6a9.9 9.9 0 0 1-2.8.8 4.9 4.9 0 0 0 2.2-2.7 9.9 9.9 0 0 1-3.1 1.2A4.9 4.9 0 0 0 11.9 9c0 .4 0 .8.1 1.1A13.9 13.9 0 0 1 1.7 5.1a4.9 4.9 0 0 0 1.5 6.5A4.8 4.8 0 0 1 1 11v.1a4.9 4.9 0 0 0 3.9 4.8 4.9 4.9 0 0 1-2.2.1 4.9 4.9 0 0 0 4.6 3.4A9.9 9.9 0 0 1 0 21.5a13.9 13.9 0 0 0 7.6 2.2c9 0 14-7.5 14-14v-.6A9.9 9.9 0 0 0 24 4.6Z" />
    </svg>
  );
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M12.5 10.2v3.8h5.5c-.7 2.3-2.6 4-5.5 4a6 6 0 1 1 3.9-10.6l2.8-2.8A10 10 0 1 0 22 12l-9.5-1.8Z" />
    </svg>
  );
}
