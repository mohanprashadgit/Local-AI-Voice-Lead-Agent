'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  useSessionContext,
  useSessionMessages,
  useVoiceAssistant,
  useLocalParticipant,
  BarVisualizer,
} from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  PhoneDisconnectIcon,
  BuildingsIcon,
  ClockIcon,
  SparkleIcon,
  UserIcon,
  RobotIcon,
  WavesIcon,
} from '@phosphor-icons/react/dist/ssr';
import type { AppConfig } from '@/app-config';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';
import { LeadInfoPanel } from './lead-info-panel';

interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { state: agentState, audioTrack: agentAudioTrack } = useVoiceAssistant();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [dataMessages, setDataMessages] = useState<
    { id: string; timestamp: number; message: string; role?: string }[]
  >([]);

  // Simple Live Call Timer
  const [callDuration, setCallDuration] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle Microphone
  const toggleMicrophone = async () => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  // Listen to raw data packets (lk.chat / lk-chat-topic) as a fallback for chat log
  useEffect(() => {
    const room = session.room;
    if (!room) return;
    const handler = (payload: Uint8Array, _participant: any, _?: any, topic?: string) => {
      if (topic !== 'lk.chat' && topic !== 'lk-chat-topic') return;
      try {
        const txt = new TextDecoder().decode(payload);
        const obj = JSON.parse(txt);
        if (obj && obj.message) {
          setDataMessages((prev) => [
            ...prev,
            {
              id: obj.id || `${Date.now()}-${prev.length}`,
              timestamp: obj.timestamp || Date.now(),
              message: obj.message,
              role: obj.role,
            },
          ]);
        }
      } catch {
        /* ignore */
      }
    };
    room.on(RoomEvent.DataReceived, handler);
    return () => {
      room.off(RoomEvent.DataReceived, handler);
    };
  }, [session.room]);

  const displayMessages = useMemo(() => {
    type Normalized = { id: string; timestamp: number; message: string; role: 'user' | 'assistant' };
    const normalizeLivekit = messages.map<Normalized>((m, idx) => ({
      id: m.id ?? `${m.timestamp}-${idx}`,
      timestamp: m.timestamp ?? Date.now(),
      message: m.message ?? '',
      role: m.from?.isLocal ? 'user' : 'assistant',
    }));
    const normalizeData = dataMessages.map<Normalized>((m, idx) => ({
      id: m.id ?? `data-${m.timestamp}-${idx}`,
      timestamp: m.timestamp ?? Date.now(),
      message: m.message ?? '',
      role: (m.role as 'user' | 'assistant') ?? 'assistant',
    }));

    const combined = [...normalizeLivekit, ...normalizeData];

    // collapse updates that reuse the same id (keep newest payload)
    const indexById = new Map<string, number>();
    const ordered: Normalized[] = [];
    combined.forEach((m) => {
      if (indexById.has(m.id)) {
        const pos = indexById.get(m.id)!;
        ordered[pos] = m;
        return;
      }
      indexById.set(m.id, ordered.length);
      ordered.push(m);
    });

    // drop consecutive duplicates (same role + identical text)
    const deduped = ordered.filter((m, i) => {
      const prev = ordered[i - 1];
      if (!prev) return true;
      return !(prev.role === m.role && prev.message.trim() === m.message.trim());
    });

    // Collapse to one user + one assistant per turn.
    const turns: Normalized[] = [];
    let currentUser: Normalized | null = null;
    let currentAssistant: Normalized | null = null;

    const flushTurn = () => {
      if (currentUser) turns.push(currentUser);
      if (currentAssistant) turns.push(currentAssistant);
      currentUser = null;
      currentAssistant = null;
    };

    for (const m of deduped) {
      if (m.role === 'user') {
        flushTurn();
        currentUser = m;
      } else {
        currentAssistant = m;
      }
    }
    flushTurn();

    return turns;
  }, [messages, dataMessages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [displayMessages]);

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });

  // Map state to readable label & style
  const getStatusInfo = () => {
    switch (agentState) {
      case 'speaking':
        return {
          label: 'AI Speaking',
          color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/50',
          dot: 'bg-cyan-400',
          pulse: 'animate-ping bg-cyan-400',
          orbRing: 'from-cyan-500 to-blue-500 shadow-cyan-500/40',
        };
      case 'listening':
        return {
          label: 'Listening',
          color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50',
          dot: 'bg-emerald-400',
          pulse: 'animate-ping bg-emerald-400',
          orbRing: 'from-emerald-500 to-teal-500 shadow-emerald-500/40',
        };
      case 'thinking':
        return {
          label: 'Processing',
          color: 'text-amber-400 bg-amber-950/80 border-amber-500/50',
          dot: 'bg-amber-400',
          pulse: 'animate-ping bg-amber-400',
          orbRing: 'from-amber-500 to-orange-500 shadow-amber-500/40',
        };
      default:
        return {
          label: 'Ready',
          color: 'text-zinc-300 bg-zinc-900 border-zinc-700',
          dot: 'bg-emerald-400',
          pulse: 'bg-emerald-400',
          orbRing: 'from-zinc-600 to-zinc-700 shadow-black/40',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <section
      className="relative flex h-screen w-full flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none"
      {...props}
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-[-10%] left-1/3 -translate-x-1/2 h-[450px] w-[600px] rounded-full bg-gradient-to-b from-cyan-600/10 via-blue-600/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[350px] w-[350px] rounded-full bg-emerald-600/10 blur-3xl" />

      {/* Top Header */}
      <header className="relative z-20 flex shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-zinc-950">
            <BuildingsIcon size={20} weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white md:text-base">
                AI Lead Voice Agent
              </h1>
              <span className="hidden sm:inline-block rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                REAL ESTATE QUALIFIER
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Live Voice Pipeline Active</p>
          </div>
        </div>

        {/* Center/Right Status & Call Timer */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-inner transition-colors duration-300',
              statusInfo.color
            )}
          >
            <span className="relative flex h-2 w-2">
              <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75', statusInfo.pulse)}></span>
              <span className={cn('relative inline-flex rounded-full h-2 w-2', statusInfo.dot)}></span>
            </span>
            <span>{statusInfo.label}</span>
          </div>

          {/* Call Duration Timer */}
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-mono text-zinc-300">
            <ClockIcon size={14} weight="bold" className="text-cyan-400" />
            <span>{formatTimer(callDuration)}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace (Split Grid: Voice & Transcript Left, Lead Card Right) */}
      <main className="relative z-10 flex flex-1 overflow-hidden p-3 md:p-6 gap-4 lg:gap-6">
        {/* Left Column: Voice Hub + Transcript */}
        <div className="flex flex-1 flex-col h-full overflow-hidden rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-2xl backdrop-blur-xl">
          {/* Interactive Voice Orb & Bar Visualizer Header */}
          <div className="flex flex-col items-center justify-center p-4 border-b border-zinc-800/80 bg-zinc-950/40">
            <div className="flex items-center justify-center gap-6">
              {/* Central Voice Button */}
              <div className="relative group">
                {/* Dynamic animated glow rings based on state */}
                <div
                  className={cn(
                    'absolute -inset-2 rounded-full bg-gradient-to-r blur-md opacity-70 transition duration-300',
                    statusInfo.orbRing,
                    agentState === 'speaking' || agentState === 'listening' ? 'animate-pulse' : ''
                  )}
                />
                <button
                  type="button"
                  onClick={toggleMicrophone}
                  title={isMicrophoneEnabled ? 'Click to Mute Microphone' : 'Click to Unmute Microphone'}
                  className={cn(
                    'relative flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-200 cursor-pointer border-2',
                    isMicrophoneEnabled
                      ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-cyan-400/50 hover:border-cyan-400 hover:scale-105'
                      : 'bg-red-950/80 border-red-500/60 text-red-300 hover:scale-105'
                  )}
                >
                  {isMicrophoneEnabled ? (
                    <MicrophoneIcon size={32} weight="fill" className={agentState === 'speaking' ? 'text-cyan-400' : 'text-zinc-100'} />
                  ) : (
                    <MicrophoneSlashIcon size={32} weight="fill" className="text-red-400" />
                  )}
                </button>
              </div>

              {/* Status and Visualizer Details */}
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Voice Channel
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold',
                      isMicrophoneEnabled ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {isMicrophoneEnabled ? 'MIC ON' : 'MUTED'}
                  </span>
                </div>
                <div className="text-sm font-semibold text-zinc-100">
                  {agentState === 'speaking' && 'AI is speaking with candidate…'}
                  {agentState === 'listening' && 'Listening to lead…'}
                  {agentState === 'thinking' && 'Processing real estate response…'}
                  {agentState === 'idle' && 'Ready for conversation'}
                </div>

                {/* Audio Bar Visualizer */}
                <div className="mt-1 flex items-center gap-1.5 h-5">
                  <BarVisualizer
                    barCount={7}
                    state={agentState}
                    options={{ minHeight: 4 }}
                    trackRef={agentAudioTrack}
                    className="flex h-5 w-28 items-end justify-start gap-1"
                  >
                    <span className="bg-cyan-400 data-[lk-highlighted=true]:bg-cyan-300 h-full w-1 rounded-full transition-[height,background-color] duration-150 ease-linear" />
                  </BarVisualizer>
                </div>
              </div>
            </div>
          </div>

          {/* Live Transcript / Conversation Area */}
          <div className="flex flex-1 flex-col overflow-hidden p-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 text-xs text-zinc-400">
              <span className="font-semibold tracking-wide text-zinc-300 flex items-center gap-1.5">
                <WavesIcon size={15} className="text-cyan-400" /> Live Conversation Transcript
              </span>
              <span className="text-[11px] text-zinc-500">
                {displayMessages.length} {displayMessages.length === 1 ? 'turn' : 'turns'} recorded
              </span>
            </div>

            <ScrollArea ref={scrollAreaRef} className="flex-1 pr-2 pt-3">
              {displayMessages.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center text-zinc-500 space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-400">
                    <MicrophoneIcon size={24} weight="duotone" />
                  </div>
                  <p className="text-sm font-medium text-zinc-300">Speak into your microphone</p>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    The AI Lead Voice Agent is listening. You can speak naturally in English to test lead qualification.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {displayMessages.map((m) =>
                    m.role === 'user' ? (
                      <div key={m.id} className="flex items-start justify-end gap-2.5">
                        <div className="max-w-[75%] space-y-1 text-right">
                          <div className="inline-block rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-md">
                            {m.message || 'Listening…'}
                          </div>
                          <div className="flex items-center justify-end gap-1.5 text-[10px] text-zinc-500">
                            <span>User</span>
                            <span>•</span>
                            <span>{formatTime(m.timestamp)}</span>
                          </div>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400">
                          <UserIcon size={16} weight="bold" />
                        </div>
                      </div>
                    ) : (
                      <div key={m.id} className="flex items-start justify-start gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                          <RobotIcon size={16} weight="bold" />
                        </div>
                        <div className="max-w-[78%] space-y-1">
                          <div className="rounded-2xl rounded-tl-sm bg-zinc-800/90 border border-zinc-700/60 px-4 py-2.5 text-sm leading-relaxed text-zinc-100 shadow-inner">
                            <p className="whitespace-normal break-words">{m.message}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                            <span className="font-medium text-indigo-300">AI Voice Assistant</span>
                            <span>•</span>
                            <span>{formatTime(m.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Control Bar Footer */}
          <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/80 px-4 py-3">
            {/* Mute/Stop Toggle Button */}
            <button
              type="button"
              onClick={toggleMicrophone}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer border',
                isMicrophoneEnabled
                  ? 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border-zinc-700 hover:border-zinc-600'
                  : 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border-red-700/60'
              )}
            >
              {isMicrophoneEnabled ? (
                <>
                  <MicrophoneIcon size={16} weight="bold" className="text-emerald-400" />
                  <span>Mute Mic</span>
                </>
              ) : (
                <>
                  <MicrophoneSlashIcon size={16} weight="bold" className="text-red-400" />
                  <span>Unmute Mic</span>
                </>
              )}
            </button>

            {/* Quick Status Note */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              <span>Barge-in / Interruptible Voice Active</span>
            </div>

            {/* End Call Button */}
            <button
              type="button"
              onClick={session.end}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-red-400/30"
            >
              <PhoneDisconnectIcon size={16} weight="bold" />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* Right Column: Lead Information Panel (Desktop side panel / Collapsible on mobile) */}
        <div className="hidden lg:flex w-80 xl:w-96 shrink-0 flex-col h-full">
          <LeadInfoPanel />
        </div>
      </main>
    </section>
  );
};
