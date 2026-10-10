import React from 'react';
import { 
  ArrowLeft, Building2, Globe2, Trophy, ShieldCheck, TrendingUp, 
  Layers, CheckCircle2, Flame, Droplets, Fuel, Award, Factory, Zap, 
  Anchor, Compass, Landmark, FileText 
} from 'lucide-react';
import { ActiveScreen } from '../types';
import { DangoteLogo } from './DangoteLogo';
import { DangoteTimesSquareHero } from './DangoteTimesSquareHero';

interface AboutUsScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
}

export function AboutUsScreen({ onNavigate }: AboutUsScreenProps) {
  const stats = [
    { label: 'Refining Capacity', val: '650,000 BPD', sub: 'World Largest Single-Train' },
    { label: 'Capital Investment', val: '$20+ Billion USD', sub: 'Single Largest Mega Project' },
    { label: 'Polymer Production', val: '900,000 MT/Yr', sub: 'High-Grade Polypropylene' },
    { label: 'Total Land Area', val: '2,635 Hectares', sub: 'Lekki Free Zone, Lagos' },
  ];

  const executivePillars = [
    {
      title: 'Crude Distillation Unit (CDU-650K)',
      subtitle: 'World Record Single-Train Refining Column',
      specs: 'Euro-V Specification • 650,000 Barrels/Day',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      desc: 'Processes a wide spectrum of light and medium sweet crudes (including Nigerian Bonny Light, Forcados, and Escravos), producing ultra-clean Euro-V Premium Motor Spirit (PMS) and Automotive Gas Oil (AGO).',
      icon: Fuel,
      tag: 'Primary Core Asset'
    },
    {
      title: 'Residue Fluid Catalytic Cracker (RFCC)',
      subtitle: 'Advanced Gasoline & Olefins Conversion',
      specs: 'Max PMS Yield • Catalytic Cracking',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
      desc: 'High-severity fluid catalytic cracking unit converting heavy vacuum gas oil into high-octane gasoline blending stock and petrochemical polymer precursors.',
      icon: Flame,
      tag: 'Catalytic Refining'
    },
    {
      title: 'Polypropylene Petrochemical Complex',
      subtitle: 'Africa’s Industrial Polymers Engine',
      specs: '900,000 Metric Tons Annual Output',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      desc: 'World-class polypropylene pellet plant supplying manufacturing packaging, automotive plastics, and industrial resins across global export corridors.',
      icon: Factory,
      tag: 'Petrochemicals'
    },
    {
      title: 'Subsea Offshore Marine SPM Berths',
      subtitle: 'Atlantic Deepwater Supertanker Terminal',
      specs: 'Single Point Mooring • VLCC Compatible',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      desc: 'Deepwater subsea pipeline system with offshore Single Buoy Moorings (SBM) capable of loading and offloading Very Large Crude Carriers (VLCC) directly in the Atlantic Ocean.',
      icon: Anchor,
      tag: 'Marine Logistics'
    },
    {
      title: 'Captive Thermal Power Grid (435MW)',
      subtitle: '100% Uninterrupted Industrial Energy',
      specs: '435 Megawatts Gas Turbine Power Station',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      desc: 'Self-sufficient dedicated industrial power plant delivering uninterrupted electricity and high-pressure steam to all refining towers and hydrogen processing units.',
      icon: Zap,
      tag: 'Power & Utilities'
    }
  ];

  return (
    <div className="pb-24 pt-3 px-4 space-y-5 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <button 
          onClick={() => onNavigate('my')} 
          className="w-9 h-9 rounded-full bg-[#081738] border border-blue-900 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-black text-white">About Dangote Refinery PLC</h2>
        <div className="w-9"></div>
      </div>

      {/* Hero Corporate Profile Card */}
      <div className="bg-gradient-to-b from-[#061c47] via-[#071738] to-[#040e24] border border-blue-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Logo and Emblem */}
        <div className="text-center space-y-2">
          <div className="inline-block p-3 bg-[#030a1c] rounded-3xl border border-blue-500/30 shadow-xl">
            <DangoteLogo size="xl" showSubtitle={true} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold text-amber-300 tracking-widest bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 inline-block mt-2">
              RC: 1248902 • NMDPRA LICENSED • SEC VERIFIED
            </span>
            <h3 className="text-lg font-black text-white mt-2">
              Dangote Petroleum Refinery & Petrochemicals PLC
            </h3>
            <p className="text-xs text-blue-200 mt-1 leading-relaxed">
              "Providing Your Basic Needs" — Powering Africa's Energy Self-Sufficiency and Global Petroleum Refining Dominance.
            </p>
          </div>
        </div>

        {/* Executive Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-slate-950/70 p-3 rounded-2xl border border-blue-900/50 text-center space-y-0.5">
              <span className="text-[9px] text-blue-300 block uppercase font-bold">{s.label}</span>
              <span className="text-base font-black text-amber-300 block">{s.val}</span>
              <span className="text-[8px] text-slate-400 block">{s.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Global Times Square New York City Showcase */}
      <div className="space-y-2">
        <DangoteTimesSquareHero variant="card" showDetails={true} />
      </div>

      {/* Aliko Dangote Visionary Letter */}
      <div className="bg-[#081738] border border-blue-900/50 rounded-3xl p-5 shadow-xl space-y-3 text-xs text-slate-300 leading-relaxed">
        <div className="flex items-center gap-2 text-white font-black text-sm border-b border-blue-900/60 pb-2">
          <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Aliko Dangote (GCON) Visionary Mandate</span>
        </div>
        <p className="italic text-slate-200 border-l-2 border-amber-400 pl-3 py-0.5">
          "Our goal has always been simple yet transformative: to ensure Nigeria and the African continent attain total energy independence, eliminate fuel imports, and power our industrial manufacturing future."
        </p>
        <p>
          Spanning <strong>2,635 Hectares</strong> in the Lekki Free Trade Zone, Lagos, the Dangote Petroleum Refinery is the largest industrial undertaking in African history. With a designed refining throughput of <strong>650,000 barrels per day</strong>, it generates 53 million litres of Euro-V PMS (petrol), 34 million litres of diesel, and 10 million litres of aviation fuel daily.
        </p>
        <p>
          Through the Initial Share Allotment (ISO) platform, institutional and retail shareholders participate directly in the dividend flow from crude distillation, polymer export revenues, and daily fuel clearance.
        </p>
      </div>

      {/* Strategic Mega-Infrastructure Assets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Core Refinery & Petrochemical Assets
          </h4>
          <span className="text-[10px] text-blue-300 font-bold bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">
            5 Strategic Complexes
          </span>
        </div>

        {executivePillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div key={idx} className="bg-[#081738] border border-blue-900/40 rounded-3xl overflow-hidden shadow-xl space-y-3 p-4">
              <div className="relative h-44 rounded-2xl overflow-hidden border border-blue-900/50">
                <img src={pillar.image} alt={pillar.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div>
                    <span className="text-[9px] text-amber-300 font-extrabold uppercase bg-slate-950/90 border border-amber-500/30 px-2 py-0.5 rounded-md backdrop-blur-md">
                      {pillar.specs}
                    </span>
                    <h4 className="text-base font-black text-white mt-1">{pillar.title}</h4>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5" />
                    {pillar.tag}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {pillar.desc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-blue-900/30 text-[11px] text-blue-300 font-medium">
                <span className="flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-blue-400" /> Lekki Free Zone, Lagos
                </span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> NMDPRA Verified
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sovereign Asset Backing & Certifications */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-[#081738] to-emerald-950/70 border border-emerald-500/30 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Sovereign Asset & Commodity Backing</h4>
            <p className="text-[11px] text-emerald-200/90 mt-0.5">
              All share allocations are backed by physical crude oil inventory, domestic refining output, and certified Euro-V petroleum tranches.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px]">
          <div className="bg-slate-950/80 p-2 rounded-xl border border-emerald-900/40 font-bold text-slate-300">
            <Landmark className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
            SEC Registered
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-emerald-900/40 font-bold text-slate-300">
            <FileText className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
            NMDPRA Certified
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-emerald-900/40 font-bold text-slate-300">
            <Award className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
            Euro-V Standard
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-center text-[10px] text-blue-300/60 leading-relaxed">
        <strong>Dangote Petroleum Refinery & Petrochemicals PLC</strong><br />
        Lekki Free Trade Zone, Ibeju-Lekki, Lagos State, Nigeria<br />
        Portal Build v5.2.0 • Official Investor Portal
      </div>
    </div>
  );
}
