import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { ProfileAvatar } from '@/components/social/ProfileAvatar';
import { ErrorState, LoadingState } from '@/components/ui/StatusViews';
import { BUTTON_PRIMARY, INPUT } from '@/components/ui/styles';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/hooks/useToast';
import { fetchProfilesByIds } from '@/lib/profiles';
import {
  deleteChatMessage,
  fetchPartyMessages,
  sendPartyMessage,
  subscribeToPartyChanges,
} from '@/lib/watchParties';
import type { WatchPartyMessage } from '@/lib/types';

interface ChatSnapshot {
  messages: WatchPartyMessage[];
  names: Map<string, string>;
}

async function loadChat(partyId: string): Promise<ChatSnapshot> {
  const messages = await fetchPartyMessages(partyId);
  const profiles = await fetchProfilesByIds([...new Set(messages.map((message) => message.user_id))]);
  return {
    messages,
    names: new Map(profiles.map((profile) => [profile.user_id, profile.display_name])),
  };
}

interface PartyChatProps {
  partyId: string;
  userId: string;
  canPost: boolean;
  isHost: boolean;
}

export function PartyChat({ partyId, userId, canPost, isHost }: PartyChatProps) {
  const { notify } = useToast();
  const chat = useAsyncData(() => loadChat(partyId), [partyId]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageCount = chat.data?.messages.length ?? 0;

  useEffect(() => {
    return subscribeToPartyChanges(`party-chat-${partyId}`, 'watch_party_messages', `party_id=eq.${partyId}`, chat.reload);
  }, [partyId, chat.reload]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messageCount]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !canPost) return;
    if (body.length > 500) {
      notify('Messages can be up to 500 characters.', 'error');
      return;
    }
    setSending(true);
    try {
      await sendPartyMessage(partyId, userId, body);
      setDraft('');
      chat.reload();
    } catch {
      notify('Your message could not be sent. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(message: WatchPartyMessage) {
    try {
      await deleteChatMessage(message.id);
      chat.reload();
    } catch {
      notify('That message could not be removed.', 'error');
    }
  }

  return (
    <section className="flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-850/70 lg:h-[calc(100vh-14rem)]">
      <header className="border-b border-white/10 px-5 py-4">
        <h2 className="font-bold text-white">Party chat</h2>
        <p className="text-xs text-slate-400">{canPost ? 'Messages are visible to everyone in this room.' : 'Join the room to take part in the chat.'}</p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4" aria-live="polite">
        {!chat.data && chat.loading && <LoadingState label="Loading chat" />}
        {!chat.data && chat.error && <ErrorState onRetry={chat.reload} />}
        {chat.data && chat.data.messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">No messages yet. Say hello to the room.</p>
        )}
        {chat.data?.messages.map((message) => {
          const mine = message.user_id === userId;
          const name = mine ? 'You' : chat.data?.names.get(message.user_id) ?? 'Cinema member';
          return (
            <div key={message.id} className={`group flex gap-3 ${mine ? 'flex-row-reverse text-right' : ''}`}>
              {!mine && <ProfileAvatar name={name} size="sm" />}
              <div className={`min-w-0 max-w-[80%] ${mine ? 'items-end' : ''} flex flex-col`}>
                <p className="text-xs text-slate-400">
                  {name} · {new Date(message.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p
                  className={`mt-1 whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm text-left ${
                    mine ? 'rounded-tr-sm bg-cinema-600 text-white' : 'rounded-tl-sm bg-ink-800 text-slate-100'
                  }`}
                >
                  {message.body}
                </p>
                {(mine || isHost) && (
                  <button
                    type="button"
                    onClick={() => void handleDelete(message)}
                    className="mt-1 hidden items-center gap-1 self-start text-xs text-slate-500 transition hover:text-rose-300 group-hover:inline-flex"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-white/10 p-4">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={!canPost}
          maxLength={500}
          aria-label="Message"
          placeholder={canPost ? 'Send a message' : 'Join to chat'}
          className={INPUT}
        />
        <button type="submit" disabled={!canPost || sending || draft.trim().length === 0} className={BUTTON_PRIMARY}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </button>
      </form>
    </section>
  );
}
