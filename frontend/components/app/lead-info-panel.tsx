'use client';

import React, { useState } from 'react';
import {
  BuildingsIcon,
  CurrencyDollarIcon,
  HouseLineIcon,
  MapPinIcon,
  CalendarCheckIcon,
  FlameIcon,
  UserCheckIcon,
  CheckCircleIcon,
  SparkleIcon,
  InfoIcon,
} from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils';

export interface LeadInfo {
  interest: string;
  buyerType: string;
  propertyType: string;
  budget: string;
  location: string;
  timeline: string;
  status: 'HOT' | 'WARM' | 'COLD';
  confidenceScore?: number;
  notes?: string;
}

const DEFAULT_LEAD: LeadInfo = {
  interest: 'Residential Purchase',
  buyerType: 'Pre-Approved Buyer',
  propertyType: '3-4 BHK Luxury Villa',
  budget: '$850,000 - $1.2M',
  location: 'Downtown & Waterfront Suburbs',
  timeline: 'Immediate (1-3 Months)',
  status: 'HOT',
  confidenceScore: 94,
  notes: 'High intent buyer seeking modern open-layout property with garage & private garden.',
};

interface LeadInfoPanelProps {
  className?: string;
  lead?: Partial<LeadInfo>;
}

export const LeadInfoPanel: React.FC<LeadInfoPanelProps> = ({ className, lead: propLead }) => {
  const [lead, setLead] = useState<LeadInfo>({ ...DEFAULT_LEAD, ...propLead });

  const leadFields = [
    {
      label: 'Interest',
      value: lead.interest,
      icon: HouseLineIcon,
      accent: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Buyer Type',
      value: lead.buyerType,
      icon: UserCheckIcon,
      accent: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Property Type',
      value: lead.propertyType,
      icon: BuildingsIcon,
      accent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Budget',
      value: lead.budget,
      icon: CurrencyDollarIcon,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Location',
      value: lead.location,
      icon: MapPinIcon,
      accent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      label: 'Timeline',
      value: lead.timeline,
      icon: CalendarCheckIcon,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col h-full w-full rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-5 shadow-2xl backdrop-blur-xl',
        className
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
            <SparkleIcon size={20} weight="fill" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 tracking-wide">Lead Information</h3>
            <p className="text-xs text-zinc-400">Live AI Real Estate Qualification</p>
          </div>
        </div>

        {/* Lead Status Badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Sync
        </div>
      </div>

      {/* Status Selector Bar */}
      <div className="mt-4 rounded-xl bg-zinc-950/60 p-2 border border-zinc-800/60">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
            Lead Qualification Status
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            Score: {lead.confidenceScore}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {(['HOT', 'WARM', 'COLD'] as const).map((status) => {
            const isSelected = lead.status === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setLead((prev) => ({ ...prev, status }))}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer',
                  status === 'HOT' &&
                    (isSelected
                      ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-lg shadow-orange-500/20 border border-rose-400/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-rose-300 hover:bg-zinc-850 border border-transparent'),
                  status === 'WARM' &&
                    (isSelected
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-500/20 border border-amber-400/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-amber-300 hover:bg-zinc-850 border border-transparent'),
                  status === 'COLD' &&
                    (isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-cyan-300 hover:bg-zinc-850 border border-transparent')
                )}
              >
                {status === 'HOT' && <FlameIcon weight="fill" className="h-3.5 w-3.5" />}
                {status === 'WARM' && <SparkleIcon weight="fill" className="h-3.5 w-3.5" />}
                {status === 'COLD' && <CheckCircleIcon weight="fill" className="h-3.5 w-3.5" />}
                <span>{status}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Structured Fields Grid */}
      <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto pr-0.5 custom-scrollbar">
        {leadFields.map((field) => {
          const IconComponent = field.icon;
          return (
            <div
              key={field.label}
              className="group flex items-start gap-3 rounded-xl bg-zinc-950/40 border border-zinc-800/40 p-2.5 transition-all duration-150 hover:bg-zinc-950/70 hover:border-zinc-700/60"
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                  field.accent
                )}
              >
                <IconComponent size={17} weight="duotone" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium tracking-wide text-zinc-400">
                  {field.label}
                </span>
                <span className="block text-xs font-semibold text-zinc-200 truncate group-hover:text-white">
                  {field.value}
                </span>
              </div>
            </div>
          );
        })}

        {/* AI Key Insight / Notes */}
        <div className="mt-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 p-3">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-medium mb-1">
            <InfoIcon size={14} weight="bold" />
            <span>AI Real Estate Summary</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            {lead.notes}
          </p>
        </div>
      </div>
    </div>
  );
};
