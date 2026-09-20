import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Activity, Eye, Zap, Flame } from 'lucide-react';

export type MovementType = 
  | 'bench_press'
  | 'incline_press'
  | 'pushup'
  | 'fly'
  | 'squat'
  | 'front_squat'
  | 'leg_press'
  | 'leg_extension'
  | 'deadlift'
  | 'rdl'
  | 'leg_curl'
  | 'hip_thrust'
  | 'lat_pulldown'
  | 'pullup'
  | 'row'
  | 'shoulder_press'
  | 'lateral_raise'
  | 'rear_delt'
  | 'bicep_curl'
  | 'tricep_extension'
  | 'calf_raise'
  | 'core_plank'
  | 'core_raise'
  | 'generic';

export function getMovementType(exerciseName: string, category: string): MovementType {
  const name = (exerciseName || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  if (name.includes('incline') && (name.includes('press') || name.includes('bench'))) return 'incline_press';
  if (name.includes('pushup') || name.includes('push-up') || name.includes('dand')) return 'pushup';
  if (name.includes('fly') || name.includes('pec deck') || name.includes('crossover')) return 'fly';
  if (name.includes('bench') || name.includes('chest press') || name.includes('dips')) return 'bench_press';

  if (name.includes('front squat')) return 'front_squat';
  if (name.includes('squat') || name.includes('bulgarian') || name.includes('lunge')) return 'squat';
  if (name.includes('leg press') || name.includes('hack squat')) return 'leg_press';
  if (name.includes('leg extension')) return 'leg_extension';

  if (name.includes('romanian') || name.includes('rdl')) return 'rdl';
  if (name.includes('deadlift')) return 'deadlift';
  if (name.includes('leg curl') || name.includes('hamstring')) return 'leg_curl';
  if (name.includes('hip thrust') || name.includes('glute bridge')) return 'hip_thrust';

  if (name.includes('pulldown')) return 'lat_pulldown';
  if (name.includes('pull-up') || name.includes('pullup') || name.includes('chin-up') || name.includes('chinup')) return 'pullup';
  if (name.includes('row') || name.includes('t-bar') || name.includes('face pull')) return 'row';

  if (name.includes('overhead') || name.includes('military') || name.includes('shoulder press')) return 'shoulder_press';
  if (name.includes('lateral raise') || name.includes('side raise')) return 'lateral_raise';
  if (name.includes('rear delt') || name.includes('reverse fly')) return 'rear_delt';

  if (name.includes('curl') && !name.includes('leg')) return 'bicep_curl';
  if (name.includes('tricep') || name.includes('pushdown') || name.includes('skull crusher')) return 'tricep_extension';
  if (name.includes('calf') || name.includes('calves')) return 'calf_raise';
  if (name.includes('plank') || name.includes('ab wheel')) return 'core_plank';
  if (name.includes('leg raise') || name.includes('crunch') || name.includes('woodchopper')) return 'core_raise';

  if (cat.includes('chest')) return 'bench_press';
  if (cat.includes('quad')) return 'squat';
  if (cat.includes('hamstring')) return 'rdl';
  if (cat.includes('back')) return 'row';
  if (cat.includes('shoulder')) return 'shoulder_press';
  if (cat.includes('bicep')) return 'bicep_curl';
  if (cat.includes('tricep')) return 'tricep_extension';
  if (cat.includes('calf')) return 'calf_raise';
  if (cat.includes('core')) return 'core_plank';

  return 'generic';
}

interface BiomechanicalMovementCanvasProps {
  exerciseName: string;
  category: string;
  targetMuscle: string;
  stepIndex: number; // 0 = setup, 1 = eccentric, 2 = concentric
  tempo?: string;
  breathing?: string;
}

export const BiomechanicalMovementCanvas: React.FC<BiomechanicalMovementCanvasProps> = ({
  exerciseName,
  category,
  targetMuscle,
  stepIndex,
  tempo = '3-0-1-1 Tempo',
  breathing = 'Inhale on stretch, exhale on drive',
}) => {
  const movement = getMovementType(exerciseName, category);

  // Define step-specific visual dynamics
  const stepTitles = [
    'Phase 1: Starting Stance & Joint Setup',
    'Phase 2: Eccentric Descent & Muscle Stretch',
    'Phase 3: Concentric Drive & Peak Contraction',
  ];

  const phaseColors = [
    { bg: 'from-[#0E1424]/80 to-slate-900', border: 'border-[#00D4FF]/40', accent: '#00D4FF', text: 'text-[#38BDF8]' },
    { bg: 'from-amber-950/80 to-slate-900', border: 'border-cyan-500/40', accent: '#D97706', text: 'text-cyan-400' },
    { bg: 'from-[#0E1424]/80 to-slate-900', border: 'border-[#00D4FF]/40', accent: '#0369A1', text: 'text-[#38BDF8]' },
  ];

  const currentTheme = phaseColors[stepIndex] || phaseColors[0];

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border ${currentTheme.border} bg-gradient-to-b ${currentTheme.bg} p-4 sm:p-5 text-white shadow-xl transition-all duration-300`}>
      {/* Top Diagram Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-200">
            Biomechanical Motion Engine
          </span>
          <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold text-[#38BDF8]">
            {stepTitles[stepIndex]}
          </span>
        </div>
        <div className="text-[11px] font-medium text-gray-300 flex items-center gap-2">
          <span>🎯 Target: <strong className="text-amber-300">{targetMuscle}</strong></span>
        </div>
      </div>

      {/* SVG Canvas Stage */}
      <div className="relative w-full h-56 sm:h-64 flex items-center justify-center bg-black/40 rounded-xl overflow-hidden border border-white/5">
        {/* Background Grid Lines for Biomechanical Measurement */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Dynamic Vector Diagrams for Each Movement Type & Step Index */}
        <svg 
          viewBox="0 0 400 220" 
          className="w-full h-full max-h-56 sm:max-h-64 select-none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="pecGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="activeContraction" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.7" />
            </linearGradient>
            <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#F59E0B" />
            </marker>
            <marker id="arrowHeadTeal" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#00D4FF" />
            </marker>
            <marker id="arrowHeadEmerald" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#00D4FF" />
            </marker>
          </defs>

          {/* RENDER DEDICATED ANATOMICAL SCHEMATICS BASED ON MOVEMENT TYPE */}
          
          {/* 1. CHEST PRESS / BENCH PRESS */}
          {(movement === 'bench_press' || movement === 'incline_press' || movement === 'fly') && (
            <g transform="translate(40, 10)">
              {/* Bench */}
              <rect x="30" y="150" width="260" height="12" rx="4" fill="#374151" stroke="#4B5563" strokeWidth="2" />
              <rect x="50" y="162" width="14" height="40" fill="#1F2937" />
              <rect x="256" y="162" width="14" height="40" fill="#1F2937" />

              {/* Head & Torso lying on bench */}
              <circle cx="65" cy="140" r="14" fill="#6B7280" />
              <rect x="80" y="132" width="110" height="20" rx="6" fill="#4B5563" />
              
              {/* Pelvis & Legs */}
              <circle cx="195" cy="142" r="10" fill="#4B5563" />
              <path d="M 195 142 L 235 150 L 245 195" stroke="#9CA3AF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <rect x="235" y="195" width="22" height="7" rx="3" fill="#D1D5DB" />

              {/* Highlight Pectoral Muscle */}
              <rect 
                x="95" 
                y="126" 
                width="48" 
                height="16" 
                rx="4" 
                fill={stepIndex === 2 ? "url(#activeContraction)" : stepIndex === 1 ? "#F59E0B" : "url(#pecGlow)"} 
                stroke="#38BDF8" 
                strokeWidth="1.5" 
              />
              <text x="119" y="137" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">PEC MAJOR</text>

              {/* PHASE 1: SETUP */}
              {stepIndex === 0 && (
                <g>
                  {/* Arms extended straight up */}
                  <path d="M 115 132 L 115 70" stroke="#E5E7EB" strokeWidth="7" strokeLinecap="round" />
                  {/* Barbell & Plates */}
                  <line x1="80" y1="65" x2="150" y2="65" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round" />
                  <rect x="75" y="50" width="8" height="30" rx="2" fill="#00D4FF" />
                  <rect x="147" y="50" width="8" height="30" rx="2" fill="#00D4FF" />
                  {/* Angles & Guide text */}
                  <text x="115" y="42" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Starting Position: Arms Locked 90°</text>
                  <circle cx="115" cy="132" r="4" fill="#00D4FF" />
                  <circle cx="115" cy="65" r="4" fill="#00D4FF" />
                </g>
              )}

              {/* PHASE 2: ECCENTRIC DESCENT (STRETCH) */}
              {stepIndex === 1 && (
                <g>
                  {/* Arms bent at 45° tuck */}
                  <path d="M 115 132 L 85 145 L 115 110" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Barbell on Lower Chest */}
                  <line x1="80" y1="108" x2="150" y2="108" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
                  <rect x="75" y="93" width="8" height="30" rx="2" fill="#F59E0B" />
                  <rect x="147" y="93" width="8" height="30" rx="2" fill="#F59E0B" />
                  {/* Downward Trajectory Arrows */}
                  <line x1="115" y1="70" x2="115" y2="98" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3,3" markerEnd="url(#arrowHead)" />
                  <text x="115" y="42" fill="#FBBF24" fontSize="11" fontWeight="bold" textAnchor="middle">Eccentric: 3s Descent, 45° Elbow Tuck</text>
                  {/* Stretch lines */}
                  <line x1="90" y1="126" x2="70" y2="126" stroke="#F59E0B" strokeWidth="1.5" />
                  <line x1="145" y1="126" x2="165" y2="126" stroke="#F59E0B" strokeWidth="1.5" />
                </g>
              )}

              {/* PHASE 3: CONCENTRIC CONTRACTION */}
              {stepIndex === 2 && (
                <g>
                  {/* Arms driving up */}
                  <path d="M 115 132 L 115 70" stroke="#00D4FF" strokeWidth="8" strokeLinecap="round" />
                  {/* Barbell at Lockout */}
                  <line x1="80" y1="65" x2="150" y2="65" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
                  <rect x="75" y="50" width="8" height="30" rx="2" fill="#00D4FF" />
                  <rect x="147" y="50" width="8" height="30" rx="2" fill="#00D4FF" />
                  {/* Upward Drive Arrows */}
                  <line x1="100" y1="105" x2="100" y2="78" stroke="#00D4FF" strokeWidth="2.5" markerEnd="url(#arrowHeadEmerald)" />
                  <line x1="130" y1="105" x2="130" y2="78" stroke="#00D4FF" strokeWidth="2.5" markerEnd="url(#arrowHeadEmerald)" />
                  <text x="115" y="42" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Concentric Drive: Forceful Exhale & Squeeze</text>
                </g>
              )}
            </g>
          )}

          {/* 2. SQUATS & QUAD MOVEMENTS */}
          {(movement === 'squat' || movement === 'front_squat' || movement === 'leg_press' || movement === 'leg_extension') && (
            <g transform="translate(100, 10)">
              {/* Floor */}
              <line x1="10" y1="195" x2="190" y2="195" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" />

              {/* PHASE 1: SQUAT SETUP */}
              {stepIndex === 0 && (
                <g>
                  {/* Standing Figure */}
                  <circle cx="100" cy="45" r="12" fill="#9CA3AF" />
                  <line x1="100" y1="57" x2="100" y2="115" stroke="#D1D5DB" strokeWidth="12" strokeLinecap="round" />
                  {/* Quads highlight */}
                  <rect x="92" y="118" width="16" height="42" rx="6" fill="url(#pecGlow)" stroke="#38BDF8" strokeWidth="1.5" />
                  <line x1="100" y1="115" x2="100" y2="158" stroke="#9CA3AF" strokeWidth="9" strokeLinecap="round" />
                  <line x1="100" y1="158" x2="100" y2="192" stroke="#6B7280" strokeWidth="8" strokeLinecap="round" />
                  <rect x="92" y="190" width="22" height="6" rx="2" fill="#E5E7EB" />
                  {/* Barbell on traps */}
                  <line x1="55" y1="60" x2="145" y2="60" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round" />
                  <rect x="50" y="46" width="8" height="28" rx="2" fill="#00D4FF" />
                  <rect x="142" y="46" width="8" height="28" rx="2" fill="#00D4FF" />
                  <text x="100" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Setup: Neutral Spine, Feet Shoulder-Width</text>
                </g>
              )}

              {/* PHASE 2: SQUAT ECCENTRIC / BOTTOM DEPTH */}
              {stepIndex === 1 && (
                <g>
                  {/* Squatting Figure at Parallel Depth */}
                  <circle cx="85" cy="88" r="12" fill="#9CA3AF" />
                  {/* Torso angled forward 20° */}
                  <line x1="85" y1="98" x2="70" y2="142" stroke="#D1D5DB" strokeWidth="12" strokeLinecap="round" />
                  {/* Thigh Parallel */}
                  <line x1="70" y1="142" x2="120" y2="142" stroke="#F59E0B" strokeWidth="12" strokeLinecap="round" />
                  <rect x="74" y="135" width="40" height="14" rx="4" fill="url(#activeContraction)" stroke="#FBBF24" strokeWidth="1" />
                  {/* Shin at 70° angle */}
                  <line x1="120" y1="142" x2="105" y2="192" stroke="#6B7280" strokeWidth="8" strokeLinecap="round" />
                  <rect x="98" y="190" width="22" height="6" rx="2" fill="#E5E7EB" />
                  {/* Barbell on back */}
                  <line x1="40" y1="102" x2="130" y2="102" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
                  <rect x="35" y="88" width="8" height="28" rx="2" fill="#F59E0B" />
                  <rect x="127" y="88" width="8" height="28" rx="2" fill="#F59E0B" />
                  {/* 90° Knee Angle Guide */}
                  <text x="100" y="24" fill="#FBBF24" fontSize="11" fontWeight="bold" textAnchor="middle">Parallel Depth: 90° Hip & Knee Flexion</text>
                  <line x1="100" y1="60" x2="100" y2="85" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,3" markerEnd="url(#arrowHead)" />
                </g>
              )}

              {/* PHASE 3: SQUAT CONCENTRIC DRIVE */}
              {stepIndex === 2 && (
                <g>
                  <circle cx="100" cy="45" r="12" fill="#9CA3AF" />
                  <line x1="100" y1="57" x2="100" y2="115" stroke="#D1D5DB" strokeWidth="12" strokeLinecap="round" />
                  {/* Quads Peak Squeeze */}
                  <rect x="90" y="118" width="20" height="42" rx="6" fill="#00D4FF" stroke="#38BDF8" strokeWidth="2" />
                  <text x="100" y="142" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">QUADS</text>
                  <line x1="100" y1="115" x2="100" y2="158" stroke="#9CA3AF" strokeWidth="9" strokeLinecap="round" />
                  <line x1="100" y1="158" x2="100" y2="192" stroke="#6B7280" strokeWidth="8" strokeLinecap="round" />
                  <rect x="92" y="190" width="22" height="6" rx="2" fill="#E5E7EB" />
                  <line x1="55" y1="60" x2="145" y2="60" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
                  <rect x="50" y="46" width="8" height="28" rx="2" fill="#00D4FF" />
                  <rect x="142" y="46" width="8" height="28" rx="2" fill="#00D4FF" />
                  {/* Upward Drive Arrows */}
                  <line x1="68" y1="140" x2="68" y2="100" stroke="#00D4FF" strokeWidth="3" markerEnd="url(#arrowHeadEmerald)" />
                  <line x1="132" y1="140" x2="132" y2="100" stroke="#00D4FF" strokeWidth="3" markerEnd="url(#arrowHeadEmerald)" />
                  <text x="100" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Drive Through Midfoot & Lockout Glutes</text>
                </g>
              )}
            </g>
          )}

          {/* 3. DEADLIFT & RDL POSTERIOR CHAIN */}
          {(movement === 'deadlift' || movement === 'rdl' || movement === 'leg_curl' || movement === 'hip_thrust') && (
            <g transform="translate(100, 10)">
              <line x1="10" y1="195" x2="190" y2="195" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" />

              {stepIndex === 0 && (
                <g>
                  {/* Tall Setup */}
                  <circle cx="95" cy="45" r="12" fill="#9CA3AF" />
                  <line x1="95" y1="57" x2="95" y2="120" stroke="#D1D5DB" strokeWidth="11" strokeLinecap="round" />
                  <line x1="95" y1="120" x2="95" y2="192" stroke="#9CA3AF" strokeWidth="9" strokeLinecap="round" />
                  <rect x="88" y="190" width="22" height="6" rx="2" fill="#E5E7EB" />
                  {/* Barbell in hands */}
                  <line x1="55" y1="120" x2="135" y2="120" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round" />
                  <rect x="50" y="106" width="8" height="28" rx="2" fill="#00D4FF" />
                  <rect x="132" y="106" width="8" height="28" rx="2" fill="#00D4FF" />
                  <text x="100" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Starting Stance: Lats Locked, Flat Spine</text>
                </g>
              )}

              {stepIndex === 1 && (
                <g>
                  {/* Hip Hinge & Deep Hamstring Stretch */}
                  <circle cx="140" cy="95" r="12" fill="#9CA3AF" />
                  {/* Torso hinged horizontally */}
                  <line x1="140" y1="98" x2="75" y2="120" stroke="#D1D5DB" strokeWidth="11" strokeLinecap="round" />
                  {/* Hamstring Highlight */}
                  <line x1="75" y1="120" x2="88" y2="192" stroke="#F59E0B" strokeWidth="10" strokeLinecap="round" />
                  <rect x="68" y="130" width="20" height="40" rx="4" fill="url(#activeContraction)" stroke="#FBBF24" strokeWidth="1.5" />
                  <text x="78" y="152" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">HAMS</text>
                  <rect x="80" y="190" width="22" height="6" rx="2" fill="#E5E7EB" />
                  {/* Barbell sliding down shins */}
                  <line x1="88" y1="150" x2="160" y2="150" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
                  <rect x="83" y="136" width="8" height="28" rx="2" fill="#F59E0B" />
                  <rect x="157" y="136" width="8" height="28" rx="2" fill="#F59E0B" />
                  {/* Hip Hinge Arrow */}
                  <line x1="90" y1="110" x2="60" y2="110" stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrowHead)" />
                  <text x="100" y="24" fill="#FBBF24" fontSize="11" fontWeight="bold" textAnchor="middle">Push Hips Straight Back for Hamstring Stretch</text>
                </g>
              )}

              {stepIndex === 2 && (
                <g>
                  <circle cx="95" cy="45" r="12" fill="#9CA3AF" />
                  <line x1="95" y1="57" x2="95" y2="120" stroke="#D1D5DB" strokeWidth="11" strokeLinecap="round" />
                  {/* Glute & Hamstring Lockout */}
                  <rect x="86" y="112" width="18" height="24" rx="4" fill="#00D4FF" stroke="#38BDF8" strokeWidth="1.5" />
                  <line x1="95" y1="120" x2="95" y2="192" stroke="#00D4FF" strokeWidth="9" strokeLinecap="round" />
                  <rect x="88" y="190" width="22" height="6" rx="2" fill="#E5E7EB" />
                  <line x1="55" y1="120" x2="135" y2="120" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
                  <rect x="50" y="106" width="8" height="28" rx="2" fill="#00D4FF" />
                  <rect x="132" y="106" width="8" height="28" rx="2" fill="#00D4FF" />
                  {/* Hip snap forward arrow */}
                  <line x1="68" y1="120" x2="88" y2="120" stroke="#00D4FF" strokeWidth="3" markerEnd="url(#arrowHeadEmerald)" />
                  <text x="100" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Snap Hips Forward & Flex Glutes at Top</text>
                </g>
              )}
            </g>
          )}

          {/* 4. BACK: LAT PULLDOWN / PULL-UP / ROWS */}
          {(movement === 'lat_pulldown' || movement === 'pullup' || movement === 'row') && (
            <g transform="translate(100, 10)">
              {stepIndex === 0 && (
                <g>
                  {/* Overhead Bar */}
                  <line x1="30" y1="35" x2="170" y2="35" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round" />
                  {/* Figure in Full Overhead Stretch */}
                  <circle cx="100" cy="70" r="12" fill="#9CA3AF" />
                  <line x1="100" y1="82" x2="100" y2="150" stroke="#D1D5DB" strokeWidth="11" strokeLinecap="round" />
                  {/* Arms extended in V */}
                  <path d="M 60 38 L 100 82 L 140 38" stroke="#9CA3AF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Lat V-Taper Highlight */}
                  <polygon points="100,85 75,130 125,130" fill="url(#pecGlow)" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x="100" y="115" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">LATS STRETCH</text>
                  <text x="100" y="20" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Setup: Full Overhead Reach & Chest Proud</text>
                </g>
              )}

              {stepIndex === 1 && (
                <g>
                  {/* Controlled Ascension / Eccentric */}
                  <line x1="30" y1="35" x2="170" y2="35" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="100" cy="75" r="12" fill="#9CA3AF" />
                  <line x1="100" y1="87" x2="100" y2="150" stroke="#D1D5DB" strokeWidth="11" strokeLinecap="round" />
                  <path d="M 65 48 L 100 87 L 135 48" stroke="#F59E0B" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <polygon points="100,90 70,135 130,135" fill="url(#activeContraction)" stroke="#FBBF24" strokeWidth="1.5" />
                  {/* Upward Stretch Arrows */}
                  <line x1="55" y1="75" x2="55" y2="45" stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrowHead)" />
                  <line x1="145" y1="75" x2="145" y2="45" stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrowHead)" />
                  <text x="100" y="20" fill="#FBBF24" fontSize="11" fontWeight="bold" textAnchor="middle">Eccentric: 3s Slow Release to Full Lat Stretch</text>
                </g>
              )}

              {stepIndex === 2 && (
                <g>
                  {/* Bar pulled down to clavicle */}
                  <line x1="45" y1="80" x2="155" y2="80" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="100" cy="70" r="12" fill="#9CA3AF" />
                  <line x1="100" y1="82" x2="100" y2="150" stroke="#D1D5DB" strokeWidth="11" strokeLinecap="round" />
                  {/* Elbows driving down & in */}
                  <path d="M 65 80 L 75 110 L 100 85 L 125 110 L 135 80" stroke="#00D4FF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <polygon points="100,85 68,135 132,135" fill="#00D4FF" stroke="#38BDF8" strokeWidth="2" />
                  <text x="100" y="115" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">PEAK SQUEEZE</text>
                  {/* Downward Drive Force Arrows */}
                  <line x1="75" y1="75" x2="75" y2="105" stroke="#00D4FF" strokeWidth="3" markerEnd="url(#arrowHeadEmerald)" />
                  <line x1="125" y1="75" x2="125" y2="105" stroke="#00D4FF" strokeWidth="3" markerEnd="url(#arrowHeadEmerald)" />
                  <text x="100" y="20" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Drive Elbows Down to Pockets & Pinch Scapulae</text>
                </g>
              )}
            </g>
          )}

          {/* 5. SHOULDERS & ARMS / OTHER MOVEMENTS (DEFAULT CLEAN ANATOMICAL RIG) */}
          {(movement === 'shoulder_press' || movement === 'lateral_raise' || movement === 'rear_delt' || movement === 'bicep_curl' || movement === 'tricep_extension' || movement === 'calf_raise' || movement === 'core_plank' || movement === 'core_raise' || movement === 'generic') && (
            <g transform="translate(100, 10)">
              <line x1="10" y1="195" x2="190" y2="195" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" />
              
              {stepIndex === 0 && (
                <g>
                  <circle cx="100" cy="45" r="12" fill="#9CA3AF" />
                  <line x1="100" y1="57" x2="100" y2="125" stroke="#D1D5DB" strokeWidth="11" strokeLinecap="round" />
                  <line x1="100" y1="125" x2="100" y2="192" stroke="#9CA3AF" strokeWidth="9" strokeLinecap="round" />
                  <rect x="92" y="190" width="22" height="6" rx="2" fill="#E5E7EB" />
                  {/* Active Target Zone */}
                  <circle cx="100" cy="75" r="18" fill="url(#pecGlow)" stroke="#38BDF8" strokeWidth="1.5" />
                  <text x="100" y="78" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">TARGET</text>
                  <text x="100" y="22" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Phase 1: Starting Stance & Grip Alignment</text>
                </g>
              )}

              {stepIndex === 1 && (
                <g>
                  <circle cx="100" cy="45" r="12" fill="#9CA3AF" />
                  <line x1="100" y1="57" x2="100" y2="125" stroke="#D1D5DB" strokeWidth="11" strokeLinecap="round" />
                  <line x1="100" y1="125" x2="100" y2="192" stroke="#9CA3AF" strokeWidth="9" strokeLinecap="round" />
                  <rect x="92" y="190" width="22" height="6" rx="2" fill="#E5E7EB" />
                  {/* Stretch Mode */}
                  <circle cx="100" cy="75" r="22" fill="url(#activeContraction)" stroke="#FBBF24" strokeWidth="1.5" />
                  <line x1="100" y1="105" x2="100" y2="125" stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrowHead)" />
                  <text x="100" y="78" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">STRETCH</text>
                  <text x="100" y="22" fill="#FBBF24" fontSize="11" fontWeight="bold" textAnchor="middle">Phase 2: Controlled Eccentric Negative (3s)</text>
                </g>
              )}

              {stepIndex === 2 && (
                <g>
                  <circle cx="100" cy="45" r="12" fill="#9CA3AF" />
                  <line x1="100" y1="57" x2="100" y2="125" stroke="#D1D5DB" strokeWidth="11" strokeLinecap="round" />
                  <line x1="100" y1="125" x2="100" y2="192" stroke="#9CA3AF" strokeWidth="9" strokeLinecap="round" />
                  <rect x="92" y="190" width="22" height="6" rx="2" fill="#E5E7EB" />
                  {/* Peak Contraction */}
                  <circle cx="100" cy="75" r="24" fill="#00D4FF" stroke="#38BDF8" strokeWidth="2" />
                  <line x1="100" y1="110" x2="100" y2="85" stroke="#00D4FF" strokeWidth="3" markerEnd="url(#arrowHeadEmerald)" />
                  <text x="100" y="78" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">SQUEEZE</text>
                  <text x="100" y="22" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Phase 3: Peak Contraction & Full Lockout</text>
                </g>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Dynamic Biomechanical Telemetry Footer */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/5">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[10px] text-gray-400 block">Tempo Count</span>
            <span className="font-bold text-amber-300">{tempo}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
          <div>
            <span className="text-[10px] text-gray-400 block">Breathing Flow</span>
            <span className="font-bold text-[#38BDF8]">{breathing}</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
          <div>
            <span className="text-[10px] text-gray-400 block">Joint Safety</span>
            <span className="font-bold text-[#38BDF8]">Strict Kinematic Track</span>
          </div>
        </div>
      </div>
    </div>
  );
};
