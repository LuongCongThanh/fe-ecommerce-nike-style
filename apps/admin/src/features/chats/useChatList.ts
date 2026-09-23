import { useState } from 'react';

import type { Conversation } from '@/features/chats/types';
import { useChatsState } from '@/features/chats/useChatsState';
import { filterBySearch } from '@/shell/filterBySearch';

export interface ChatListModel {
  readonly conversations: Conversation[];
  readonly selected: Conversation | null;
  readonly selectedUserId: string | null;
  readonly selectUser: (userId: string) => void;
  readonly search: string;
  readonly setSearch: (value: string) => void;
  readonly draft: string;
  readonly setDraft: (value: string) => void;
  /** No-ops when no conversation is selected; clears the draft otherwise. */
  readonly sendDraft: () => void;
}

/** The chat screen behind one interface: conversation search, selection and the message draft. */
export function useChatList(): ChatListModel {
  const { conversations, sendMessage } = useChatsState();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(conversations[0]?.user.id ?? null);
  const [draft, setDraft] = useState('');

  return {
    conversations: filterBySearch(conversations, search, [(c) => c.user.name]),
    selected: conversations.find((c) => c.user.id === selectedUserId) ?? null,
    selectedUserId,
    selectUser: setSelectedUserId,
    search,
    setSearch,
    draft,
    setDraft,
    sendDraft: () => {
      if (selectedUserId === null) return;
      sendMessage(selectedUserId, draft);
      setDraft('');
    },
  };
}
