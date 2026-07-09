'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Eraser, Send, Sparkles, Wrench } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChatHistory, useClearChat, useSendChat } from '@/features/intelligence/api';
import { Markdown } from '@/features/intelligence/components/markdown';
import { humanizeEnum } from '@/features/intelligence/lib/display';
import type { ChatResponse, ConversationTurn } from '@/lib/services/ai-assistant';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from '@/shared/components/ui/toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/utils/cn';

const STARTERS = [
  'How healthy are my finances right now?',
  'Where can I cut spending this month?',
  'Am I on track for my goals?',
  'What are my biggest financial risks?',
];

interface Message extends ConversationTurn {
  meta?: Pick<ChatResponse, 'toolsUsed' | 'referencedModules' | 'suggestedFollowUps'>;
  error?: boolean;
}

export function AssistantPage() {
  const history = useChatHistory();
  const sendChat = useSendChat();
  const clearChat = useClearChat();

  const [messages, setMessages] = useState<Message[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [input, setInput] = useState('');
  const [clearOpen, setClearOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Seed from server history once, then own the state locally (optimistic sends).
  useEffect(() => {
    if (!seeded && history.data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages(history.data.turns.map((t) => ({ ...t })));
      setSeeded(true);
    }
  }, [seeded, history.data]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendChat.isPending, scrollToBottom]);

  const send = async (raw: string) => {
    const message = raw.trim();
    if (!message || sendChat.isPending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'USER', message, timestamp: new Date(0).toISOString() }]);
    try {
      const res = await sendChat.mutateAsync(message);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ASSISTANT',
          message: res.assistantMessage,
          timestamp: res.timestamp,
          meta: {
            toolsUsed: res.toolsUsed,
            referencedModules: res.referencedModules,
            suggestedFollowUps: res.suggestedFollowUps,
          },
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ASSISTANT',
          message: "I couldn't reach the assistant just now. Please try again in a moment.",
          timestamp: new Date(0).toISOString(),
          error: true,
        },
      ]);
    }
  };

  const copy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((c) => (c === idx ? null : c)), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  const confirmClear = async () => {
    try {
      await clearChat.mutateAsync();
      setMessages([]);
      setClearOpen(false);
      toast.success('Conversation cleared');
    } catch {
      toast.error('Failed to clear conversation');
    }
  };

  const lastFollowUps = useMemo(() => {
    const last = messages[messages.length - 1];
    return last?.role === 'ASSISTANT' && !last.error ? (last.meta?.suggestedFollowUps ?? []) : [];
  }, [messages]);

  const isEmpty = messages.length === 0 && !sendChat.isPending;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-[calc(100vh-13rem)] min-h-[28rem] flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <div>
              <h1 className="font-semibold text-foreground">AI Assistant</h1>
              <p className="text-xs text-muted-foreground">Grounded in your Money Audit data — ask anything.</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setClearOpen(true)}>
              <Eraser className="size-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        {/* Conversation */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border bg-muted/20 p-4">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-7" />
              </span>
              <h2 className="text-lg font-semibold text-foreground">How can I help with your money?</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                I read your spending, insights, health score, and goals to give grounded answers — never generic advice.
              </p>
              <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-card p-3 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-2.5', m.role === 'USER' ? 'justify-end' : 'justify-start')}
                  >
                    {m.role === 'ASSISTANT' && (
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="size-4" />
                      </span>
                    )}
                    <div className={cn('group max-w-[85%] sm:max-w-[75%]', m.role === 'USER' && 'flex flex-col items-end')}>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2.5',
                          m.role === 'USER'
                            ? 'rounded-br-sm bg-primary text-primary-foreground'
                            : m.error
                              ? 'rounded-bl-sm border border-destructive/30 bg-destructive/5 text-foreground'
                              : 'rounded-bl-sm border border-border bg-card text-foreground',
                        )}
                      >
                        {m.role === 'ASSISTANT' ? (
                          <Markdown>{m.message}</Markdown>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
                        )}
                      </div>

                      {m.role === 'ASSISTANT' && !m.error && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {(m.meta?.toolsUsed?.length ?? 0) > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="gap-1 font-normal">
                                  <Wrench className="size-3" />
                                  {m.meta!.toolsUsed.length} source{m.meta!.toolsUsed.length > 1 ? 's' : ''}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="font-medium">Based on</p>
                                <p className="text-xs">{m.meta!.toolsUsed.map(humanizeEnum).join(', ')}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {(m.meta?.referencedModules ?? []).map((mod) => (
                            <Badge key={mod} variant="outline" className="font-normal">
                              {humanizeEnum(mod)}
                            </Badge>
                          ))}
                          <button
                            type="button"
                            onClick={() => copy(m.message, i)}
                            className="ml-0.5 inline-flex items-center gap-1 rounded px-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                          >
                            {copiedIdx === i ? <Check className="size-3" /> : <Copy className="size-3" />}
                            {copiedIdx === i ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {sendChat.isPending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3.5">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="size-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Follow-up chips */}
        {lastFollowUps.length > 0 && !sendChat.isPending && (
          <div className="mt-3 flex flex-wrap gap-2">
            {lastFollowUps.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form
          className="mt-3 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about your spending, goals, health score…"
            rows={1}
            className="max-h-40 min-h-11 flex-1 resize-none"
          />
          <Button type="submit" size="icon" className="size-11 shrink-0" disabled={!input.trim() || sendChat.isPending} aria-label="Send message">
            <Send className="size-4" />
          </Button>
        </form>
        <p className="mt-1.5 text-center text-[0.7rem] text-muted-foreground">
          Answers are generated from your data and may not always be complete.
        </p>

        <ConfirmDialog
          open={clearOpen}
          onOpenChange={setClearOpen}
          title="Clear conversation?"
          description="This removes your chat history with the assistant. It won't affect your financial data."
          confirmLabel="Clear"
          destructive
          loading={clearChat.isPending}
          onConfirm={confirmClear}
        />
      </div>
    </TooltipProvider>
  );
}
