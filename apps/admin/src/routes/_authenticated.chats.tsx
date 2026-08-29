import type { SyntheticEvent } from 'react';

import { Avatar, AvatarFallback } from '@repo/ui/avatar';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { createFileRoute } from '@tanstack/react-router';
import { MessagesSquare, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useChatList } from '@/features/chats/useChatList';

export const Route = createFileRoute('/_authenticated/chats')({
  component: ChatsPage,
});

function ChatsPage(): React.JSX.Element {
  const { t, i18n } = useTranslation('chats');
  const chat = useChatList();
  const dateLocale = i18n.language === 'en' ? 'en-US' : 'vi-VN';

  const handleSend = (e: SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();
    chat.sendDraft();
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-6">
      <div className="flex w-full flex-col gap-3 sm:w-64 lg:w-80">
        <div>
          <h1 className="text-xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>
        <Input
          placeholder={t('searchPlaceholder')}
          value={chat.search}
          onChange={(e) => {
            chat.setSearch(e.target.value);
          }}
        />
        <div className="flex-1 space-y-1 overflow-y-auto">
          {chat.conversations.map((conversation) => {
            const lastMessage = conversation.messages.at(-1);
            const isActive = conversation.user.id === chat.selectedUserId;
            return (
              <button
                key={conversation.user.id}
                type="button"
                onClick={() => {
                  chat.selectUser(conversation.user.id);
                }}
                className={`hover:bg-accent flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm ${isActive ? 'bg-muted' : ''}`}
              >
                <Avatar>
                  <AvatarFallback>{conversation.user.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium">{conversation.user.name}</p>
                  <p className="text-muted-foreground truncate text-xs">{lastMessage?.text ?? ''}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {chat.selected === null ? (
        <div className="bg-card flex flex-1 flex-col items-center justify-center gap-4 rounded-md border">
          <MessagesSquare className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">{t('empty')}</p>
        </div>
      ) : (
        <div className="bg-card flex flex-1 flex-col rounded-md border">
          <div className="flex items-center gap-3 border-b p-4">
            <Avatar>
              <AvatarFallback>{chat.selected.user.initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{chat.selected.user.name}</span>
          </div>

          <div className="flex flex-1 flex-col-reverse gap-2 overflow-y-auto p-4">
            {[...chat.selected.messages].reverse().map((message) => (
              <div key={message.id} className={`flex flex-col ${message.sender === 'me' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-72 rounded-2xl px-3 py-2 text-sm ${message.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  {message.text}
                </div>
                <span className="text-muted-foreground mt-1 text-xs">
                  {new Date(message.timestampIso).toLocaleString(dateLocale, {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t p-3">
            <Input
              placeholder={t('typeMessage')}
              value={chat.draft}
              onChange={(e) => {
                chat.setDraft(e.target.value);
              }}
            />
            <Button type="submit" size="icon" disabled={chat.draft.trim() === ''}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
