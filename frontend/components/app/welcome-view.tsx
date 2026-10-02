'use client';

import React, { useState } from 'react';
import {
  MicrophoneIcon,
  SpinnerIcon,
  BuildingsIcon,
  SparkleIcon,
  ShieldCheckIcon,
  WaveformIcon,
  PhoneCallIcon,
} from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';
import { LeadInfoPanel } from './lead-info-panel';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [connecting, setConnecting] = useState(false);

  const handleStart = () => {
    setConnecting(true);
    onStartCall();
  };

  return (
    <div
      ref={ref}
      className="relative flex min-h-screen w-full flex-col justify-between bg-zinc-950 text-zinc-100 px-4 py-6 md:px-12 md:py-8 overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-[-10%] left-1/2 -translate-x-1/2 h-[450px] w-[600px] rounded-full bg-gradient-to-b from-cyan-600/15 via-blue-600/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[350px] w-[350px] rounded-full bg-emerald-600/10 blur-3xl" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-zinc-800/60 pb-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-zinc-950">
            <BuildingsIcon size={22} weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white md:text-lg">
                AI Lead Voice Agent
              </h1>
              <span className="rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-semibold text-cyan-400">
                REAL ESTATE MVP
              </span>
            </div>
            <p className="text-xs text-zinc-400">Autonomous Inbound & Outbound Qualification</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 rounded-full bg-zinc-900/90 border border-zinc-800 px-3.5 py-1.5 shadow-inner">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-zinc-300">Status:</span>
          <span className="text-xs font-semibold text-emerald-400">Ready</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto w-full my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left / Center: Interactive Voice Hub */}
        <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 text-xs text-zinc-300 shadow-sm">
            <SparkleIcon size={14} weight="fill" className="text-cyan-400" />
            <span>Voice-Powered Lead Qualification Assistant</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Qualify Real Estate Leads <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                With Natural Voice AI
              </span>
            </h2>
            <p className="max-w-xl text-sm sm:text-base text-zinc-400 leading-relaxed">
              Experience seamless conversational AI that captures property preferences, budget, timeline, and buyer readiness in real time.
            </p>
          </div>

          {/* Large Center Voice Button */}
          <div className="flex flex-col items-center lg:items-start gap-4 pt-4">
            <div className="relative group">
              {/* Pulsing rings */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-600/30 blur-md opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
              <button
                type="button"
                onClick={handleStart}
                disabled={connecting}
                aria-label="Start Voice Call"
                className={cn(
                  'relative flex h-24 w-24 md:h-28 md:w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-zinc-950 shadow-2xl shadow-cyan-500/40 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed border-2 border-cyan-300/40'
                )}
              >
                {connecting ? (
                  <SpinnerIcon className="animate-spin text-zinc-950" size={40} weight="bold" />
                ) : (
                  <MicrophoneIcon size={44} weight="fill" className="text-zinc-950" />
                )}
              </button>
            </div>

            <div className="flex flex-col items-center lg:items-start gap-1">
              <button
                type="button"
                onClick={handleStart}
                disabled={connecting}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 px-6 py-2.5 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-800 hover:border-cyan-500/50 hover:text-white cursor-pointer shadow-lg"
              >
                <PhoneCallIcon size={18} weight="bold" className="text-cyan-400" />
                {connecting ? 'Connecting Audio Stream…' : startButtonText}
              </button>
              <span className="text-[11px] text-zinc-500">
                Click microphone or button to start conversation
              </span>
            </div>
          </div>

          {/* Quick Feature Pills */}
          <div className="grid grid-cols-3 gap-3 pt-4 w-full max-w-lg">
            <div className="flex items-center gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-2.5 text-left">
              <WaveformIcon size={18} className="text-cyan-400 shrink-0" weight="bold" />
              <div className="text-[11px] leading-tight">
                <p className="font-semibold text-zinc-200">Ultra-Fast</p>
                <p className="text-zinc-500">Zero Latency</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-2.5 text-left">
              <ShieldCheckIcon size={18} className="text-emerald-400 shrink-0" weight="bold" />
              <div className="text-[11px] leading-tight">
                <p className="font-semibold text-zinc-200">100% Local</p>
                <p className="text-zinc-500">Private AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-2.5 text-left">
              <SparkleIcon size={18} className="text-amber-400 shrink-0" weight="bold" />
              <div className="text-[11px] leading-tight">
                <p className="font-semibold text-zinc-200">Scoring</p>
                <p className="text-zinc-500">HOT / WARM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Lead Information Preview */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
          <LeadInfoPanel />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/60 pt-4 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span>AI Lead Voice Agent • Real Estate Assistant</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ollama Qwen2.5</span>
          <span>•</span>
          <span>Whisper Base</span>
          <span>•</span>
          <span>LiveKit WebRTC</span>
        </div>
      </footer>
    </div>
  );
};
