import { useLocalStorage } from '@repo/shared/hooks/useLocalStorage';

import { MOCK_CONVERSATIONS } from '@/features/chats/mock-data';
import type { Conversation } from '@/features/chats/types';

export interface ChatsState {
  readonly conversations: Conversation[];
  readonly sendMessage: (userId: string, text: string) => void;
}

const MESSAGE_ID_PREFIX = 'm';

/**
 * Next free message id across every conversation, derived from the ids already persisted. It used to
 * come from a module-level counter, which reset to its seed on each reload and then reissued ids
 * that collided with messages already in `localStorage`.
 */
function nextMessageId(conversations: readonly Conversation[]): string {
  let highest = 0;
  for (const conversation of conversations) {
    for (const { id } of conversation.messages) {
      const suffix = Number(id.slice(MESSAGE_ID_PREFIX.length));
      if (id.startsWith(MESSAGE_ID_PREFIX) && Number.isInteger(suffix) && suffix > highest) highest = suffix;
    }
  }
  return `${MESSAGE_ID_PREFIX}${String(highest + 1)}`;
}

/** Local-only (`localStorage`, seeded from `MOCK_CONVERSATIONS`) — see `types.ts` for why.
 * Not a `useLocalCollection`: messages are nested inside conversations, so the mutation is a
 * find-then-append rather than the flat add/remove that hook owns. */
export function useChatsState(): ChatsState {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('admin.chats', MOCK_CONVERSATIONS);

  return {
    conversations,
    sendMessage: (userId, text) => {
      const trimmed = text.trim();
      if (trimmed === '') return;

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.user.id === userId
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  { id: nextMessageId(prev), sender: 'me', text: trimmed, timestampIso: new Date().toISOString() },
                ],
              }
            : conversation,
        ),
      );
    },
  };
}
