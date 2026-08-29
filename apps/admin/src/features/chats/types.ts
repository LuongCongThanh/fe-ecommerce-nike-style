/** Demo-only, local-only — no real messaging backend exists. Unlike shadcn-admin's original (fake
 * conversation data, a "Send" button with no `onClick` at all), sending here actually appends to
 * the thread (see `useChatsState`) — this app's own convention is no decorative controls. */
export interface ChatUser {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
}

export interface ChatMessage {
  readonly id: string;
  readonly sender: 'me' | 'them';
  readonly text: string;
  readonly timestampIso: string;
}

export interface Conversation {
  readonly user: ChatUser;
  readonly messages: ChatMessage[];
}
