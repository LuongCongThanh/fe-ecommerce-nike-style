/** Z-index scale — fixed, avoid ad hoc z-[9999] in app layer (FE-ARCHITECTURE.md §16.8). */
export const zIndex = {
  base: 0,
  sticky: 10,
  dropdown: 20,
  popover: 20,
  overlay: 30,
  drawer: 40,
  modal: 40,
  toast: 50,
  debug: 60,
} as const;
