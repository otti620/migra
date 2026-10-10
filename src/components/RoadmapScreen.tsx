import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  Droplets, 
  Fuel, 
  Flame, 
  Zap, 
  Anchor, 
  Ship, 
  Globe2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Award,
  Factory,
  Tv
} from 'lucide-react';
import { ActiveScreen } from '../types';
import { DangoteLogo } from './DangoteLogo';
import { DangoteTimesSquareHero } from './DangoteTimesSquareHero';

interface RoadmapScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
}

interface PhaseItem {
  id: string;
  phaseNum: number;
  period: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'active' | 'upcoming';
  progress: number;
  icon: React.ElementType;
  summary: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  impact: string;
}

export function RoadmapScreen({ onNavigate }: RoadmapScreenProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'active' | 'upcoming'>('all');
  const [expandedPhase, setExpandedPhase] = useState<string | null>('phase-7'); // default expand Times Square phase

  const phases: PhaseItem[] = [
    {
      id: 'phase-1',
      phaseNum: 1,
      period: '2016 — 2018',
      title: 'Site Reclamation & World-Record Land Dredging',
      subtitle: 'Lekki Free Trade Zone Civil Foundations',
      status: 'completed',
      progress: 100,
      icon: Layers,
      summary: 'Reclaimed 2,635 hectares of coastal marshland in the Lekki peninsula, dredging over 65 million cubic meters of sand with the world’s largest suction dredgers.',
      highlights: [
        'Dredging of 65,000,000 m³ sand from the Atlantic ocean bed',
        'Installation of over 120,000 reinforced concrete deep foundation pilings',
        'Civil ground elevation raised by 1.5 meters to protect against 100-year storm surges',
        'Establishment of the world’s largest private civil earthworks camp'
      ],
      specs: [
        { label: 'Site Footprint', value: '2,635 Hectares (6x Victoria Island)' },
        { label: 'Piles Driven', value: '120,000+ Deep Foundation Piles' },
        { label: 'Sand Dredged', value: '65 Million m³' }
      ],
      impact: 'Transformed untouched swampland into the most heavily reinforced industrial fabrication site in Sub-Saharan Africa.'
    },
    {
      id: 'phase-2',
      phaseNum: 2,
      period: '2018 — 2020',
      title: 'Heavy Heavy-Lift Procurement & Marine SPM Jetty',
      subtitle: 'World-Record Atmospheric Distillation Column Logistics',
      status: 'completed',
      progress: 100,
      icon: Ship,
      summary: 'Constructed custom offshore quayside roll-on/roll-off jetties and deployed Single Point Mooring (SPM) deep-sea marine buoys to receive global supertankers.',
      highlights: [
        'Transport and vertical erection of the world’s largest Atmospheric Distillation Column (2,250 metric tonnes)',
        'Construction of 3 Single Point Mooring (SPM) marine loading buoys 25km offshore in Atlantic deep water',
        'Handling VLCC (Very Large Crude Carrier) and Suezmax supertanker offloading without port congestion',
        'Custom 1,000-wheel SPMTs (Self-Propelled Modular Transporters) deployed for heavy machinery overland hauling'
      ],
      specs: [
        { label: 'Fractionator Weight', value: '2,250 Metric Tonnes (Single Lift)' },
        { label: 'Offshore Buoys', value: '3 Deep-Water SPMs' },
        { label: 'Supertanker Class', value: 'VLCC & ULCC Compatible' }
      ],
      impact: 'Established the marine logistics pipeline that enables the refinery to process both Nigerian Bonny Light crude and international grades.'
    },
    {
      id: 'phase-3',
      phaseNum: 3,
      period: '2020 — 2022',
      title: 'Captive Power, Desalination & 4.7B Liter Tank Farm',
      subtitle: 'Self-Sustaining Utilities & Bulk Storage Grid',
      status: 'completed',
      progress: 100,
      icon: Zap,
      summary: 'Commissioned Nigeria’s largest captive private electrical generation plant (570MW) and 177 monumental petroleum storage tanks with total capacity of 4.7 billion liters.',
      highlights: [
        '570 MW combined cycle gas turbine power station independent of the national grid',
        'Sea-water reverse osmosis desalination plant generating 44,000 m³/day ultra-pure industrial water',
        '177 high-capacity hydrocarbon storage tanks holding 4.7 billion liters of crude and refined products',
        'Central control room and distributed control systems (DCS) with over 250,000 sensor instrumentation channels'
      ],
      specs: [
        { label: 'Power Grid', value: '570 MW Captive Generation' },
        { label: 'Tank Farm Capacity', value: '4.7 Billion Liters (177 Tanks)' },
        { label: 'Desalination Output', value: '44,000 m³ / Day' }
      ],
      impact: 'Made the entire petrochemical complex 100% self-sufficient in electrical power, steam, industrial water, and strategic reserve storage.'
    },
    {
      id: 'phase-4',
      phaseNum: 4,
      period: '2023 — 2024',
      title: 'Official Commissioning & First Distillation Run',
      subtitle: 'Crude Unit Activation, Diesel & Jet Fuel Commercialization',
      status: 'completed',
      progress: 100,
      icon: Droplets,
      summary: 'Official presidential commissioning followed by initial test distillation runs. First deliveries of Euro-V Automotive Gas Oil (AGO) and Jet A-1 aviation turbine fuel.',
      highlights: [
        'Receipt of maiden 6 million barrel crude oil delivery from NNPC Ltd and international traders',
        'Commercial start of low-sulfur Automotive Gas Oil (AGO Diesel <10 ppm sulfur)',
        'Full domestic certification and off-take agreements with major oil marketers (MEMAN & DAPPMAN)',
        'Aviation turbine kerosene (Jet A-1) supply to Nigerian commercial airlines'
      ],
      specs: [
        { label: 'Initial Capacity', value: '350,000 BPD (Phase 1 Run)' },
        { label: 'Sulfur Standard', value: 'Euro-V (<10 PPM Sulfur)' },
        { label: 'Commercial Start', value: 'January 2024' }
      ],
      impact: 'Successfully proved refining chemistry and commenced displacing billions of dollars of imported refined fuels into the West African sub-region.'
    },
    {
      id: 'phase-5',
      phaseNum: 5,
      period: '2024 — 2025',
      title: 'Full PMS (Petrol) Rollout & 650,000 BPD Nameplate',
      subtitle: 'National Energy Independence & RFCC Unit Optimization',
      status: 'completed',
      progress: 100,
      icon: Fuel,
      summary: 'Full-scale continuous refining of Premium Motor Spirit (PMS/Petrol) with Residue Fluid Catalytic Cracking (RFCC) and Mild Hydrocracking to supply domestic and regional gas stations.',
      highlights: [
        'Commercial rollout of high-octane Premium Motor Spirit (PMS/Petrol) across Nigeria',
        'Naira-for-Crude transaction framework executed with the Federal Government of Nigeria',
        'Direct gantry truck-loading operations (2,900 trucks/day automated gantry capacity)',
        'Scaling throughput to full 650,000 Barrels Per Day single-train design capacity'
      ],
      specs: [
        { label: 'Current Output', value: '650,000 BPD (World’s Largest Single Train)' },
        { label: 'PMS Output', value: '53 Million Liters / Day' },
        { label: 'Gantry Capacity', value: '2,900 Tankers / Day' }
      ],
      impact: 'Eliminates 100% of Nigeria’s foreign exchange drain on imported gasoline and anchors domestic fuel price stability.'
    },
    {
      id: 'phase-6',
      phaseNum: 6,
      period: '2025',
      title: 'Petrochemicals & Polypropylene Global Export',
      subtitle: '900,000 Metric Tonnes/Year Polymer & Chemical Plant',
      status: 'active',
      progress: 88,
      icon: Factory,
      summary: 'Commissioning of the world-scale Polypropylene and Linear Alkyl Benzene (LAB) petrochemical complex to supply raw materials for packaging, medical devices, and manufacturing.',
      highlights: [
        '900,000 metric tonnes per annum Polypropylene production line',
        'Supply chain integration with Dangote Packaging and FMCG conglomerates across Africa',
        'Export shipments to European, Latin American, and Pan-African industrial manufacturers',
        'High-purity carbon black and sulfur recovery units producing industrial grade fertilizers'
      ],
      specs: [
        { label: 'Polymer Volume', value: '900,000 MT / Year' },
        { label: 'Export Destinations', value: '24+ Global Nations' },
        { label: 'Import Substitution', value: '$2.5 Billion / Year' }
      ],
      impact: 'Transforms Nigeria from a pure raw crude exporter into a high-value petrochemical manufacturing superpower.'
    },
    {
      id: 'phase-7',
      phaseNum: 7,
      period: 'September 2024 — Present',
      title: 'Times Square NYC Billboard & Global IPO Roadshow',
      subtitle: 'Aliko Dangote & Davido Unveil 650k BPD Refinery to the World',
      status: 'completed',
      progress: 100,
      icon: Tv,
      summary: 'Landmark international presentation at Times Square, New York City (Nasdaq Tower) featuring Aliko Dangote, Davido, and Dangote executives celebrating the 60M liter Crude Day Tank and "Industry For Tomorrow" IPO global broadcast.',
      highlights: [
        'Massive digital billboard takeover at Times Square New York with 711-TT-1102 B Crude Day Tank (60,000,000 Litres)',
        'Global brand endorsement and appearance by Afrobeats superstar Davido alongside billionaire founder Aliko Dangote',
        'Official slogan unveiled: "Made in Nigeria. Built for the World."',
        'International investor awareness for the ₦2.15 Trillion public subscription'
      ],
      specs: [
        { label: 'Location', value: 'Times Square, New York City (Nasdaq Tower)' },
        { label: 'Featured Unit', value: '711-TT-1102 B Crude Day Tank (60M Liters)' },
        { label: 'Global Slogan', value: 'Industry For Tomorrow' }
      ],
      impact: 'Elevated the Dangote Petroleum Refinery to the forefront of global institutional capital markets.'
    },
    {
      id: 'phase-8',
      phaseNum: 8,
      period: '2026 & Beyond',
      title: 'Public IPO Listing on NGX & Global Dual Tranche',
      subtitle: 'Initial Public Offering & Institutional Shareholder Syndicate',
      status: 'upcoming',
      progress: 45,
      icon: TrendingUp,
      summary: 'The landmark Initial Public Offering (IPO) of Dangote Petroleum Refinery & Petrochemicals PLC on the Nigerian Exchange (NGX) and potential dual-listing on international exchanges.',
      highlights: [
        'Democratization of share ownership to retail Nigerian and African retail investors via digital ISO grants',
        'VIP Institutional tranches and Sovereign Wealth Fund syndications',
        'Projected largest market capitalization listing on the Nigerian Exchange (NGX)',
        'Quarterly shareholder dividend distributions backed by dollar-linked refined energy revenues'
      ],
      specs: [
        { label: 'Listing Venue', value: 'Nigerian Exchange (NGX) & Dual Tranche' },
        { label: 'Valuation Target', value: '$20 Billion+ Enterprise Scale' },
        { label: 'Investor Access', value: 'Digital Share Subscription Portal' }
      ],
      impact: 'Unlocks generational wealth creation for public shareholders with continuous industrial refining yields and energy dividends.'
    }
  ];

  const filteredPhases = phases.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const toggleExpand = (id: string) => {
    setExpandedPhase(prev => (prev === id ? null : id));
  };

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto relative text-white">
      {/* Top Banner Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#06173a] via-[#092257] to-[#041029] border border-blue-500/40 p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <DangoteLogo size="md" showSubtitle={true} />
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black">
              92% Operational (650k BPD)
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The historic journey of Africa’s largest industrial project: from sand dredging at Lekki Free Trade Zone to 650,000 BPD energy self-sufficiency and the NGX Public IPO.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-800/40">
            <div className="bg-blue-950/60 rounded-xl p-2 text-center border border-blue-600/30">
              <div className="text-[10px] text-slate-400 font-medium">Capacity</div>
              <div className="text-xs font-black text-amber-300">650K BPD</div>
            </div>
            <div className="bg-blue-950/60 rounded-xl p-2 text-center border border-blue-600/30">
              <div className="text-[10px] text-slate-400 font-medium">Capital Cost</div>
              <div className="text-xs font-black text-emerald-400">$20B+ USD</div>
            </div>
            <div className="bg-blue-950/60 rounded-xl p-2 text-center border border-blue-600/30">
              <div className="text-[10px] text-slate-400 font-medium">Current Phase</div>
              <div className="text-xs font-black text-cyan-300">Phase 5 (PMS)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Global Times Square Showcase Banner */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Global Milestone Feature
          </span>
          <span className="text-[10px] text-blue-300 font-semibold">September 2024 Showcase</span>
        </div>
        <DangoteTimesSquareHero variant="card" showDetails={true} />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-1 p-1 bg-[#06173a] border border-blue-900/50 rounded-2xl">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({phases.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Completed (5)
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
            filter === 'active'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Active (2)
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
            filter === 'upcoming'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          IPO (1)
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-[2px] before:bg-gradient-to-b before:from-emerald-500 before:via-amber-500 before:to-indigo-500">
        {filteredPhases.map((phase, index) => {
          const Icon = phase.icon;
          const isExpanded = expandedPhase === phase.id;

          let statusBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
          let statusText = 'Completed';
          let nodeIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
          let nodeBg = 'bg-emerald-600 border-emerald-300';

          if (phase.status === 'active') {
            statusBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            statusText = 'Operational & Scaling';
            nodeIcon = <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />;
            nodeBg = 'bg-amber-500 border-amber-200 ring-4 ring-amber-500/30';
          } else if (phase.status === 'upcoming') {
            statusBadgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
            statusText = 'Allotment & Listing';
            nodeIcon = <Sparkles className="w-3.5 h-3.5 text-indigo-300" />;
            nodeBg = 'bg-indigo-600 border-indigo-300';
          }

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              {/* Timeline Marker Node */}
              <div 
                className={`absolute -left-[27px] top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 shadow-lg ${nodeBg}`}
              >
                {nodeIcon}
              </div>

              {/* Phase Card */}
              <div 
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  phase.status === 'active'
                    ? 'bg-gradient-to-br from-[#0a1f4d] to-[#061536] border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-[#09193d] border-blue-900/50 hover:border-blue-700/60'
                }`}
              >
                {/* Card Header Section */}
                <div 
                  onClick={() => toggleExpand(phase.id)}
                  className="p-4 cursor-pointer select-none space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-amber-300 tracking-wider text-[11px]">
                        PHASE 0{phase.phaseNum}
                      </span>
                      <span className="text-slate-400 font-medium">·</span>
                      <span className="text-slate-300 font-mono text-[11px]">{phase.period}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusBadgeColor}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-white leading-tight">
                        {phase.title}
                      </h3>
                      <p className="text-[11px] text-blue-200/80 font-medium mt-0.5">
                        {phase.subtitle}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-700/40 flex items-center justify-center shrink-0 text-amber-300">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {phase.summary}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
                      <span>Phase Readiness</span>
                      <span className="text-white font-bold">{phase.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          phase.status === 'completed'
                            ? 'bg-emerald-500'
                            : phase.status === 'active'
                            ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${phase.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-cyan-300 font-bold">
                    <span>{isExpanded ? 'Hide Specifications' : 'View Engineering Milestones'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expandable Engineering Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-blue-900/60 bg-[#05112b] p-4 space-y-3"
                    >
                      {/* Specifications Grid */}
                      <div className="grid grid-cols-1 gap-1.5">
                        <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          Engineering Specifications:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {phase.specs.map((spec, i) => (
                            <div key={i} className="bg-blue-950/70 border border-blue-800/40 rounded-xl p-2">
                              <span className="text-[10px] text-slate-400 block">{spec.label}</span>
                              <span className="text-xs font-black text-white">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Milestones */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          Key Achievements:
                        </div>
                        <ul className="space-y-1">
                          {phase.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Strategic Impact */}
                      <div className="bg-blue-900/30 border border-blue-700/30 rounded-xl p-2.5 text-xs text-slate-200">
                        <span className="font-bold text-amber-300 block text-[10px] uppercase mb-0.5">
                          Macro Impact:
                        </span>
                        {phase.impact}
                      </div>

                      {/* Action for IPO / Active Phase */}
                      {phase.phaseNum >= 5 && (
                        <button
                          onClick={() => onNavigate('products')}
                          className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                        >
                          <span>Subscribe to Phase {phase.phaseNum} Shares & Bonds</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA Box */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-500/40 rounded-2xl p-4 text-center space-y-2 shadow-xl">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 mx-auto flex items-center justify-center text-amber-300">
          <Award className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-black text-white">Join the Dangote Energy Revolution</h4>
        <p className="text-xs text-slate-300 max-w-xs mx-auto">
          Participate in the public share offerings and earn daily refining yields directly from 650,000 BPD operations.
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="py-2.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition inline-flex items-center gap-2"
        >
          <span>View Active Share Allotments</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
