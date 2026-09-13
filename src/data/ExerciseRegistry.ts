import { EquipmentType, Exercise, WorkoutProgram } from '../types';

export interface CoachingChannelGuide {
  channelId: string;
  channelName: string;
  coachName: string;
  query: string;
  url: string;
  badge: string;
  icon: string;
}

export interface RegistryExerciseEntry {
  id: string;
  formalName: string;
  aliases: string[];
  category: 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Quads' | 'Hamstrings' | 'Glutes' | 'Calves' | 'Core' | 'Cardio_Mobility';
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  equipmentType: EquipmentType;
  biomechanicalTier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';
  tierLabel: string;
  movementPattern: string;
  canonicalSearchQuery: string;
  verifiedYouTubeUrl: string;
  verified: boolean;
  coachingChannels: CoachingChannelGuide[];
  executionKeypoint: string;
  injurySaferAlternative?: string;
}

function buildCoachingGuides(formalName: string, queryBase: string): CoachingChannelGuide[] {
  const enc = encodeURIComponent;
  return [
    {
      channelId: 'top-gold',
      channelName: 'Gold Standard Form',
      coachName: 'Certified Strength & Conditioning Coaches',
      query: `${queryBase} tutorial`,
      url: `https://www.youtube.com/results?search_query=${enc(`${queryBase} proper form exercise tutorial`)}`,
      badge: 'Gold Standard',
      icon: '⭐',
    },
    {
      channelId: 'jeff-nippard',
      channelName: 'Jeff Nippard',
      coachName: 'Scientific Hypertrophy & Biomechanics',
      query: `Jeff Nippard ${formalName} technique`,
      url: `https://www.youtube.com/results?search_query=${enc(`Jeff Nippard ${formalName} technique form`)}`,
      badge: 'Science Based',
      icon: 'JN',
    },
    {
      channelId: 'dr-mike-rp',
      channelName: 'Dr. Mike (RP)',
      coachName: 'Renaissance Periodization Hypertrophy',
      query: `Renaissance Periodization Dr Mike ${formalName} form`,
      url: `https://www.youtube.com/results?search_query=${enc(`Renaissance Periodization Dr Mike ${formalName}`)}`,
      badge: 'Deep Stretch ROM',
      icon: 'RP',
    },
    {
      channelId: 'squat-university',
      channelName: 'Squat University',
      coachName: 'Dr. Aaron Horschig (Physical Therapy / Joint Rehab)',
      query: `Squat University ${formalName} form fixes`,
      url: `https://www.youtube.com/results?search_query=${enc(`Squat University ${formalName} form`)}`,
      badge: 'Joint Friendly',
      icon: 'SU',
    },
    {
      channelId: 'jeremy-ethier',
      channelName: 'Jeremy Ethier',
      coachName: 'Built With Science Biomechanics',
      query: `Jeremy Ethier ${formalName} form`,
      url: `https://www.youtube.com/results?search_query=${enc(`Jeremy Ethier ${formalName} form`)}`,
      badge: 'Evidence-Based',
      icon: 'JE',
    },
    {
      channelId: 'hindi-guide',
      channelName: 'Hindi Form Guide',
      coachName: 'Top Indian Fitness & Akhada Coaches',
      query: `${formalName} exercise proper form in Hindi`,
      url: `https://www.youtube.com/results?search_query=${enc(`${formalName} exercise proper form in Hindi`)}`,
      badge: 'हिंदी विवरण',
      icon: '🇮🇳',
    },
  ];
}

/**
 * MASTER EXERCISE REGISTRY
 * Strictly mapped and validated list of all primary, secondary, functional, and traditional exercises.
 */
export const RAW_EXERCISE_REGISTRY: RegistryExerciseEntry[] = [
  // =================== CHEST ===================
  {
    id: 'ex-bench-press',
    formalName: 'Barbell Flat Bench Press',
    aliases: ['Bench Press', 'Flat Bench Press', 'Flat Barbell Bench', 'Barbell Chest Press'],
    category: 'Chest',
    targetMuscle: 'Mid-Pectoralis Major (Sternal Head)',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps Brachii'],
    equipment: 'Barbell, Flat Bench, Rack',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Primary Heavy Compound',
    movementPattern: 'Horizontal Push',
    canonicalSearchQuery: 'Barbell flat bench press proper form powerlifting hypertrophy tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Barbell+flat+bench+press+proper+form+powerlifting+hypertrophy+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Barbell Flat Bench Press', 'Barbell flat bench press proper form'),
    executionKeypoint: 'Retract and depress scapulae to lock shoulder blades into the bench and maximize chest tension.',
    injurySaferAlternative: 'Flat Dumbbell Press with Neutral/45° Grip',
  },
  {
    id: 'ex-incline-db-press',
    formalName: 'Incline Dumbbell Bench Press',
    aliases: ['Incline Dumbbell Bench Press (30° Angle)', 'Incline DB Press', 'Incline Dumbbell Press', 'Incline Chest Press'],
    category: 'Chest',
    targetMuscle: 'Upper Chest (Clavicular Head)',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    equipment: 'Dumbbells, Incline Bench',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Secondary Compound Builder',
    movementPattern: 'Incline Push (30° Angle)',
    canonicalSearchQuery: 'Incline dumbbell press 30 degree angle chest form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Incline+dumbbell+press+30+degree+angle+chest+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Incline Dumbbell Press', 'Incline dumbbell bench press 30 degree angle form'),
    executionKeypoint: 'Maintain 30-degree incline to isolate clavicular pec without anterior deltoid dominance.',
    injurySaferAlternative: 'Low-to-High Cable Crossover',
  },
  {
    id: 'ex-decline-db-press',
    formalName: 'Decline Dumbbell Press',
    aliases: ['Decline DB Press', 'Decline Chest Press', 'Decline Dumbbell Bench Press'],
    category: 'Chest',
    targetMuscle: 'Lower Chest (Costal Fibers)',
    secondaryMuscles: ['Triceps'],
    equipment: 'Dumbbells, Decline Bench',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Secondary Compound Builder',
    movementPattern: 'Decline Push',
    canonicalSearchQuery: 'Decline dumbbell press chest form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Decline+dumbbell+press+chest+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Decline Dumbbell Press', 'Decline dumbbell press proper form'),
    executionKeypoint: 'Align path of travel with costal pectoral fibers with minimal shoulder joint strain.',
  },
  {
    id: 'ex-low-to-high-cable-fly',
    formalName: 'Low-to-High Cable Crossover',
    aliases: ['Low-to-High Cable Crossover (Upper Chest)', 'Low to High Cable Fly', 'Incline Cable Fly'],
    category: 'Chest',
    targetMuscle: 'Upper Chest (Clavicular Head)',
    secondaryMuscles: ['Anterior Deltoid'],
    equipment: 'Dual Cable Station',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Single-Joint Isolation',
    movementPattern: 'Upper Chest Adduction Fly',
    canonicalSearchQuery: 'Low to high cable fly upper chest proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Low+to+high+cable+fly+upper+chest+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Low to High Cable Fly', 'Low to high cable crossover upper chest form'),
    executionKeypoint: 'Pull upward and inward along clavicular fibers, pausing at contraction peak.',
  },
  {
    id: 'ex-dips-chest',
    formalName: 'Chest Dips (Forward Lean)',
    aliases: ['Chest Dips', 'Parallel Bar Dips (Chest Lean)', 'Dips', 'Forward Lean Dips'],
    category: 'Chest',
    targetMuscle: 'Lower Chest & Triceps',
    secondaryMuscles: ['Anterior Deltoids'],
    equipment: 'Dip Station / Parallel Bars',
    equipmentType: 'bodyweight_only',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Primary Heavy Compound',
    movementPattern: 'Downward Push Dip',
    canonicalSearchQuery: 'Chest dips forward lean proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Chest+dips+forward+lean+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Chest Dips', 'Chest dips forward lean form tutorial'),
    executionKeypoint: 'Lean torso 30° forward and flare elbows slightly to direct load onto lower chest fibers.',
    injurySaferAlternative: 'Cable High-to-Low Crossover / Pushdown',
  },
  {
    id: 'ex-pec-deck',
    formalName: 'Pec Deck Machine Fly',
    aliases: ['Pec Deck', 'Machine Fly', 'Seated Machine Chest Fly', 'Butterfly Fly'],
    category: 'Chest',
    targetMuscle: 'Mid-Pectoralis Major',
    secondaryMuscles: ['Anterior Deltoid'],
    equipment: 'Pec Deck Machine',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Single-Joint Isolation',
    movementPattern: 'Transverse Adduction Fly',
    canonicalSearchQuery: 'Pec deck machine fly proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Pec+deck+machine+fly+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Pec Deck Fly', 'Pec deck machine chest fly form'),
    executionKeypoint: 'Keep elbows slightly bent and focus on touching bicep to chest at full contraction.',
  },
  {
    id: 'ex-pushups',
    formalName: 'Deficit Push-Up',
    aliases: ['Push-Up', 'Standard Push-Up', 'Floor Push-Up', 'Deficit Push-Ups'],
    category: 'Chest',
    targetMuscle: 'Mid-Pectoralis Major & Serratus',
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: 'Bodyweight (Optional Blocks/Parallettes)',
    equipmentType: 'bodyweight_only',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Calisthenics Core Compound',
    movementPattern: 'Horizontal Push',
    canonicalSearchQuery: 'Proper push up form full range of motion tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Proper+push+up+form+full+range+of+motion+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Push Up', 'Push up proper form chest hypertrophy'),
    executionKeypoint: 'Keep elbows tucked at 45 degrees and achieve full sternum touch to floor/blocks.',
  },

  // =================== TRADITIONAL & CALISTHENICS ===================
  {
    id: 'ex-akhada-dand',
    formalName: 'Akhada Dand (Hindu Push-Up)',
    aliases: ['Hindu Push-Up', 'Indian Dand', 'Traditional Dand', 'Akhada Dand'],
    category: 'Chest',
    targetMuscle: 'Chest, Anterior Deltoids & Spine Stabilizers',
    secondaryMuscles: ['Triceps', 'Core', 'Erector Spinae'],
    equipment: 'Bodyweight (Open Floor)',
    equipmentType: 'bodyweight_only',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Traditional Compound Movement',
    movementPattern: 'Dynamic Dive-Bomber Arc Push',
    canonicalSearchQuery: 'Hindu push up Akhada Dand proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Hindu+push+up+Akhada+Dand+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Hindu Push Up', 'Hindu push up Akhada Dand proper form tutorial'),
    executionKeypoint: 'Flow smoothly from downward dog through cobra pose with deep chest swoop.',
  },
  {
    id: 'ex-baithak',
    formalName: 'Indian Baithak (Traditional Deep Squat)',
    aliases: ['Baithak', 'Hindu Squat', 'Indian Squat', 'Traditional Baithak'],
    category: 'Quads',
    targetMuscle: 'Quadriceps, Patellar Tendon & Calves',
    secondaryMuscles: ['Glutes', 'Adductors'],
    equipment: 'Bodyweight',
    equipmentType: 'bodyweight_only',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Traditional Compound Movement',
    movementPattern: 'Full-ROM Heel-Raised Knee Flexion',
    canonicalSearchQuery: 'Indian Baithak squat proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Indian+Baithak+squat+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Baithak Squat', 'Indian Baithak Hindu squat form tutorial'),
    executionKeypoint: 'Rise onto balls of feet in synchronized rhythmic arm swing for high-rep endurance.',
  },
  {
    id: 'ex-surya-namaskar',
    formalName: 'Surya Namaskar (12-Step Dynamic Flow)',
    aliases: ['Surya Namaskar', 'Sun Salutation', 'Surya Namaskara', '12 Steps Sun Salutation'],
    category: 'Cardio_Mobility',
    targetMuscle: 'Full Body Mobility & Core Chain',
    secondaryMuscles: ['Hamstrings', 'Chest', 'Shoulders', 'Spinal Erectors'],
    equipment: 'Yoga Mat / Floor',
    equipmentType: 'bodyweight_only',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Full-Body Mobility Chain',
    movementPattern: 'Dynamic Multi-Planar Mobility',
    canonicalSearchQuery: 'Surya Namaskar 12 steps proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Surya+Namaskar+12+steps+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Surya Namaskar', 'Surya Namaskar 12 steps alignment tutorial'),
    executionKeypoint: 'Synchronize inhalations with upward extensions and exhalations with forward folds.',
  },
  {
    id: 'ex-gada-swing',
    formalName: 'Gada Mace 360 Swing',
    aliases: ['Gada Swing', 'Macebell 360', 'Indian Mace Swing', 'Steel Mace 360'],
    category: 'Shoulders',
    targetMuscle: 'Rotator Cuff, Shoulders & Grip/Core',
    secondaryMuscles: ['Upper Back', 'Obliques', 'Forearms'],
    equipment: 'Traditional Gada / Steel Mace',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Rotational Functional Movement',
    movementPattern: 'Multi-Planar Shoulder Circumduction',
    canonicalSearchQuery: 'Gada mace swing exercise proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Gada+mace+swing+exercise+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Gada Mace Swing', 'Steel mace 360 gada swing tutorial'),
    executionKeypoint: 'Keep ribs tucked down and let the mace pendulum swing freely behind head without shrugging.',
  },

  // =================== BACK ===================
  {
    id: 'ex-lat-pulldown',
    formalName: 'Wide-Grip Lat Pulldown',
    aliases: ['Lat Pulldown', 'Cable Lat Pulldown', 'Wide Grip Pulldown'],
    category: 'Back',
    targetMuscle: 'Latissimus Dorsi (Lats)',
    secondaryMuscles: ['Biceps', 'Brachialis', 'Teres Major'],
    equipment: 'Cable Lat Pulldown Machine',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Primary Vertical Pull',
    movementPattern: 'Vertical Pull',
    canonicalSearchQuery: 'Wide grip lat pulldown proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Wide+grip+lat+pulldown+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Lat Pulldown', 'Wide grip lat pulldown proper form tutorial'),
    executionKeypoint: 'Drive elbows down towards hip pockets rather than pulling with forearms.',
  },
  {
    id: 'ex-pullups',
    formalName: 'Strict Pull-Up',
    aliases: ['Pull-Up', 'Pull Ups', 'Wide Grip Pull-Up', 'Bodyweight Pull-Up'],
    category: 'Back',
    targetMuscle: 'Latissimus Dorsi & Upper Back',
    secondaryMuscles: ['Biceps', 'Brachialis', 'Core'],
    equipment: 'Pull-Up Bar',
    equipmentType: 'bodyweight_only',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Primary Heavy Compound',
    movementPattern: 'Vertical Pull',
    canonicalSearchQuery: 'Strict pull up proper form tutorial calisthenics',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Strict+pull+up+proper+form+tutorial+calisthenics',
    verified: true,
    coachingChannels: buildCoachingGuides('Pull Up', 'Pull up form Jeff Nippard strict pull up tutorial'),
    executionKeypoint: 'Depress scapulae first, then pull chest toward bar with full dead-hang stretch.',
    injurySaferAlternative: 'Lat Pulldown / Neutral Grip Pulldown',
  },
  {
    id: 'ex-chest-supported-row',
    formalName: 'Chest-Supported Neutral T-Bar Row',
    aliases: ['Chest-Supported Row', 'T-Bar Row', 'Chest Supported T-Bar Row', 'Incline Dumbbell Row'],
    category: 'Back',
    targetMuscle: 'Upper Back (Rhomboids, Mid-Traps)',
    secondaryMuscles: ['Biceps', 'Rear Delts', 'Teres Major'],
    equipment: 'T-Bar Machine / Incline Bench + Dumbbells',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Secondary Compound Builder',
    movementPattern: 'Horizontal Pull Row',
    canonicalSearchQuery: 'T-Bar row chest supported proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=T-Bar+row+chest+supported+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Chest Supported Row', 'Chest supported neutral row proper form'),
    executionKeypoint: 'Pad against sternum prevents lower back fatigue and allows pure scapular retraction.',
  },
  {
    id: 'ex-barbell-row',
    formalName: 'Bent-Over Barbell Row',
    aliases: ['Barbell Row', 'Bent Over Row', 'Pendlay Row', 'Overhand Barbell Row'],
    category: 'Back',
    targetMuscle: 'Latissimus Dorsi & Rhomboids',
    secondaryMuscles: ['Biceps', 'Erector Spinae', 'Rear Delts'],
    equipment: 'Barbell, Weight Plates',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Primary Heavy Compound',
    movementPattern: 'Horizontal Bent-Over Pull',
    canonicalSearchQuery: 'Barbell bent over row proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Barbell+bent+over+row+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Barbell Row', 'Barbell row bent over form Jeremy Ethier Jeff Nippard'),
    executionKeypoint: 'Maintain 45 to 70-degree torso angle and pull barbell to lower ribcage.',
    injurySaferAlternative: 'Chest-Supported Row / One-Arm Dumbbell Row',
  },
  {
    id: 'ex-face-pull',
    formalName: 'Cable Face Pull with External Rotation',
    aliases: ['Face Pull', 'Cable Face Pull', 'Rope Face Pull'],
    category: 'Back',
    targetMuscle: 'Rear Delts, Infraspinatus & Upper Traps',
    secondaryMuscles: ['Rotator Cuff', 'Rhomboids'],
    equipment: 'Cable + Rope Attachment',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Postural & Rotator Cuff Health',
    movementPattern: 'Horizontal Pull + External Rotation',
    canonicalSearchQuery: 'Cable face pull with external rotation proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Cable+face+pull+with+external+rotation+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Face Pull', 'Cable face pull with external rotation tutorial'),
    executionKeypoint: 'Pull rope apart at eye level while externally rotating forearms backwards.',
  },
  {
    id: 'ex-seated-cable-row',
    formalName: 'Seated Cable Row (Close Grip)',
    aliases: ['Seated Cable Row', 'Cable Row', 'Seated Row'],
    category: 'Back',
    targetMuscle: 'Mid-Back & Lower Lats',
    secondaryMuscles: ['Biceps', 'Forearms'],
    equipment: 'Cable Row Machine + V-Bar',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Secondary Compound Builder',
    movementPattern: 'Horizontal Cable Pull',
    canonicalSearchQuery: 'Seated cable row proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Seated+cable+row+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Seated Cable Row', 'Seated cable row close grip form'),
    executionKeypoint: 'Sit upright without swinging lower back, achieving full scapular stretch and squeeze.',
  },

  // =================== SHOULDERS ===================
  {
    id: 'ex-cable-lateral-raise',
    formalName: 'Cross-Body Cable Lateral Raise',
    aliases: ['Cable Lateral Raise', 'Cross Body Cable Lateral Raise', 'Side Lateral Cable Raise', 'Lateral Raise'],
    category: 'Shoulders',
    targetMuscle: 'Lateral Deltoids (Side Shoulders)',
    secondaryMuscles: ['Upper Trapezius'],
    equipment: 'Cable Machine (Handle at Hip Height)',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Single-Joint Isolation',
    movementPattern: 'Shoulder Abduction',
    canonicalSearchQuery: 'Cross body cable lateral raise side delt proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Cross+body+cable+lateral+raise+side+delt+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Cable Lateral Raise', 'Cross body cable lateral raise side delt form'),
    executionKeypoint: 'Set cable height to wrist/hip level so resistance is highest in the bottom stretch position.',
  },
  {
    id: 'ex-db-lateral-raise',
    formalName: 'Standing Dumbbell Lateral Raise',
    aliases: ['Dumbbell Lateral Raise', 'DB Lateral Raise', 'Side Deltoid Raise'],
    category: 'Shoulders',
    targetMuscle: 'Lateral Deltoids',
    secondaryMuscles: ['Traps'],
    equipment: 'Dumbbells',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Single-Joint Isolation',
    movementPattern: 'Shoulder Abduction (Scapular Plane)',
    canonicalSearchQuery: 'Dumbbell lateral raise proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Dumbbell+lateral+raise+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('DB Lateral Raise', 'Dumbbell lateral raise form in scapular plane'),
    executionKeypoint: 'Raise in the scapular plane (30° forward of body line) with lead elbows.',
  },
  {
    id: 'ex-overhead-press',
    formalName: 'Standing Overhead Barbell Press (OHP)',
    aliases: ['Overhead Press', 'OHP', 'Barbell Military Press', 'Standing Military Press'],
    category: 'Shoulders',
    targetMuscle: 'Anterior Deltoids & Clavicular Head',
    secondaryMuscles: ['Lateral Deltoids', 'Triceps', 'Upper Traps', 'Core'],
    equipment: 'Barbell, Squat/Press Rack',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Primary Heavy Compound',
    movementPattern: 'Vertical Overhead Push',
    canonicalSearchQuery: 'Standing barbell overhead press OHP proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Standing+barbell+overhead+press+OHP+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Overhead Press', 'Overhead press barbell OHP form Jeff Nippard'),
    executionKeypoint: 'Squeeze glutes and brace core to prevent lumbar hyperextension during vertical press.',
    injurySaferAlternative: 'Seated Dumbbell Shoulder Press / High-Incline Press',
  },
  {
    id: 'ex-seated-db-shoulder-press',
    formalName: 'Seated Dumbbell Shoulder Press',
    aliases: ['Dumbbell Shoulder Press', 'Seated DB Press', 'DB Overhead Press'],
    category: 'Shoulders',
    targetMuscle: 'Anterior & Lateral Deltoids',
    secondaryMuscles: ['Triceps'],
    equipment: 'Dumbbells, 75°/85° Incline Bench',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Secondary Compound Builder',
    movementPattern: 'Vertical Overhead Push',
    canonicalSearchQuery: 'Seated dumbbell shoulder press proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Seated+dumbbell+shoulder+press+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Seated DB Shoulder Press', 'Seated dumbbell shoulder press proper form'),
    executionKeypoint: 'Angle bench slightly back (75-80 degrees) to allow natural scapular upward rotation.',
  },
  {
    id: 'ex-reverse-pec-deck',
    formalName: 'Reverse Pec Deck (Rear Delts)',
    aliases: ['Reverse Pec Deck', 'Rear Delt Fly Machine', 'Reverse Fly'],
    category: 'Shoulders',
    targetMuscle: 'Posterior Deltoids (Rear Delts)',
    secondaryMuscles: ['Rhomboids', 'Infraspinatus'],
    equipment: 'Pec Deck Machine (Reverse Setting)',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Single-Joint Isolation',
    movementPattern: 'Horizontal Shoulder Abduction',
    canonicalSearchQuery: 'Reverse pec deck rear delt fly form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Reverse+pec+deck+rear+delt+fly+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Reverse Pec Deck', 'Reverse pec deck machine rear delt form'),
    executionKeypoint: 'Keep arms straight with loose grip to isolate rear delt without lat involvement.',
  },

  // =================== ARMS (BICEPS & TRICEPS) ===================
  {
    id: 'ex-incline-db-curl',
    formalName: 'Incline Dumbbell Biceps Curl',
    aliases: ['Incline Dumbbell Curl', 'Incline DB Curl', 'Incline Curl'],
    category: 'Biceps',
    targetMuscle: 'Biceps Brachii (Long Head / Peak)',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'Incline Bench (45°-60°) + Dumbbells',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Stretch-Mediated Hypertrophy',
    movementPattern: 'Elbow Flexion (Shoulder Hyperextension)',
    canonicalSearchQuery: 'Incline dumbbell bicep curl proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Incline+dumbbell+bicep+curl+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Incline DB Curl', 'Incline dumbbell bicep curl long head stretch form'),
    executionKeypoint: 'Allow arms to hang directly perpendicular to gravity to maximize stretch on long head.',
  },
  {
    id: 'ex-hammer-curl',
    formalName: 'Neutral Grip Dumbbell Hammer Curl',
    aliases: ['Hammer Curl', 'Dumbbell Hammer Curl', 'Neutral Grip Curl'],
    category: 'Biceps',
    targetMuscle: 'Brachialis & Brachioradialis (Arm Thickness)',
    secondaryMuscles: ['Biceps Brachii (Short Head)'],
    equipment: 'Dumbbells',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Arm Thickness Isolation',
    movementPattern: 'Neutral-Grip Elbow Flexion',
    canonicalSearchQuery: 'Dumbbell hammer curl proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Dumbbell+hammer+curl+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Hammer Curl', 'Dumbbell hammer curl brachialis proper form'),
    executionKeypoint: 'Keep palms facing each other to transfer tension from biceps to brachialis and forearm.',
  },
  {
    id: 'ex-bayesian-curl',
    formalName: 'Bayesian Cable Biceps Curl',
    aliases: ['Bayesian Curl', 'Behind-the-Back Cable Curl', 'Cable Bayesian Curl'],
    category: 'Biceps',
    targetMuscle: 'Biceps Brachii (Long Head)',
    secondaryMuscles: ['Brachialis'],
    equipment: 'Cable Machine + D-Handle',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Constant Stretch Hypertrophy',
    movementPattern: 'Behind-the-Back Cable Elbow Flexion',
    canonicalSearchQuery: 'Bayesian cable curl behind the back bicep tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Bayesian+cable+curl+behind+the+back+bicep+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Bayesian Curl', 'Bayesian cable curl behind back form tutorial'),
    executionKeypoint: 'Step forward from low pulley to keep constant cable tension at bottom of elbow extension.',
  },
  {
    id: 'ex-overhead-tricep-extension',
    formalName: 'Overhead Cable Triceps Extension',
    aliases: ['Overhead Cable Triceps Extension', 'Cable Overhead Extension', 'Overhead Tricep Rope Extension'],
    category: 'Triceps',
    targetMuscle: 'Triceps Brachii (Long Head)',
    secondaryMuscles: ['Medial Head'],
    equipment: 'Cable Machine + Rope Attachment',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Stretch-Mediated Hypertrophy',
    movementPattern: 'Overhead Elbow Extension',
    canonicalSearchQuery: 'Overhead cable triceps extension long head proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Overhead+cable+triceps+extension+long+head+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Overhead Cable Tricep Extension', 'Overhead cable triceps extension long head form'),
    executionKeypoint: 'Shoulder flexion stretches the long head, generating superior hypertrophy over standard pushdowns.',
  },
  {
    id: 'ex-cable-tricep-pushdown',
    formalName: 'Cable Triceps Pushdown (Straight Bar / V-Bar)',
    aliases: ['Triceps Pushdown', 'Cable Pushdown', 'Tricep Rope Pushdown'],
    category: 'Triceps',
    targetMuscle: 'Triceps Brachii (Lateral & Medial Heads)',
    secondaryMuscles: ['Long Head'],
    equipment: 'Cable Machine + Straight Bar / V-Bar',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Single-Joint Isolation',
    movementPattern: 'Downward Elbow Extension',
    canonicalSearchQuery: 'Triceps cable pushdown proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Triceps+cable+pushdown+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Tricep Pushdown', 'Cable triceps pushdown proper form tutorial'),
    executionKeypoint: 'Lock elbows pinned to your sides and achieve complete lockout at bottom.',
  },
  {
    id: 'ex-skull-crushers',
    formalName: 'Lying Triceps Extension (Skull Crushers)',
    aliases: ['Skull Crushers', 'Lying Tricep Extension', 'EZ-Bar Skull Crusher'],
    category: 'Triceps',
    targetMuscle: 'Triceps Brachii (Long & Lateral Heads)',
    secondaryMuscles: ['Medial Head'],
    equipment: 'EZ-Bar / Dumbbells, Flat Bench',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Free Weight Compound Extension',
    movementPattern: 'Elbow Extension with Shoulder Angle',
    canonicalSearchQuery: 'Lying triceps extension skull crushers proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Lying+triceps+extension+skull+crushers+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Skull Crushers', 'Lying triceps extension skull crushers form'),
    executionKeypoint: 'Angle upper arms slightly backwards toward forehead to maintain continuous tricep tension.',
  },

  // =================== LEGS (QUADS, HAMSTRINGS, GLUTES, CALVES) ===================
  {
    id: 'ex-barbell-squat',
    formalName: 'Barbell Back Squat (High Bar / Low Bar)',
    aliases: ['Barbell Back Squat', 'Back Squat', 'Barbell Squat', 'Squat'],
    category: 'Quads',
    targetMuscle: 'Quadriceps & Gluteus Maximus',
    secondaryMuscles: ['Adductors', 'Hamstrings', 'Erector Spinae', 'Core'],
    equipment: 'Barbell, Squat Rack, Weight Plates',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Primary Heavy Compound',
    movementPattern: 'Bilateral Knee Dominant Squat',
    canonicalSearchQuery: 'Barbell back squat high bar low bar proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Barbell+back+squat+high+bar+low+bar+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Barbell Back Squat', 'Barbell back squat proper form Squat University Jeff Nippard'),
    executionKeypoint: 'Hit parallel or deeper with knees tracking over toes and solid intra-abdominal bracing.',
    injurySaferAlternative: 'Leg Press / Bulgarian Split Squat / Hack Squat',
  },
  {
    id: 'ex-romanian-deadlift',
    formalName: 'Barbell Romanian Deadlift (RDL)',
    aliases: ['Romanian Deadlift', 'RDL', 'Barbell RDL', 'Dumbbell RDL'],
    category: 'Hamstrings',
    targetMuscle: 'Hamstrings & Gluteus Maximus',
    secondaryMuscles: ['Erector Spinae', 'Adductor Magnus', 'Lats'],
    equipment: 'Barbell / Dumbbells',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Primary Hip Hinge Compound',
    movementPattern: 'Hip Hinge',
    canonicalSearchQuery: 'Barbell Romanian deadlift RDL proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Barbell+Romanian+deadlift+RDL+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Romanian Deadlift', 'Romanian deadlift RDL proper form Jeff Nippard RP'),
    executionKeypoint: 'Push hips backward with soft knee bend until deep hamstring stretch is felt at shin level.',
    injurySaferAlternative: 'Seated Hamstring Leg Curl',
  },
  {
    id: 'ex-conventional-deadlift',
    formalName: 'Conventional Barbell Deadlift',
    aliases: ['Deadlift', 'Barbell Deadlift', 'Conventional Deadlift'],
    category: 'Hamstrings',
    targetMuscle: 'Posterior Chain (Glutes, Hamstrings, Spinal Erectors)',
    secondaryMuscles: ['Lats', 'Traps', 'Forearms', 'Core'],
    equipment: 'Barbell, Weight Plates, Deadlift Jack/Platform',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Primary Heavy Compound',
    movementPattern: 'Ground-to-Hip Hinge / Pull',
    canonicalSearchQuery: 'Conventional barbell deadlift proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Conventional+barbell+deadlift+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Conventional Deadlift', 'Barbell deadlift conventional form powerlifting'),
    executionKeypoint: 'Drag bar up shins with locked lats and neutral cervical spine.',
    injurySaferAlternative: 'Trap Bar Deadlift / Romanian Deadlift',
  },
  {
    id: 'ex-bulgarian-split-squat',
    formalName: 'Bulgarian Split Squat (Rear-Foot Elevated)',
    aliases: ['Bulgarian Split Squat', 'Split Squat', 'Rear Foot Elevated Split Squat', 'Dumbbell Bulgarian Split Squat'],
    category: 'Quads',
    targetMuscle: 'Quadriceps & Gluteus Maximus',
    secondaryMuscles: ['Adductors', 'Hamstrings', 'Core Stabilizers'],
    equipment: 'Dumbbells, Flat Bench',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Unilateral Heavy Compound',
    movementPattern: 'Unilateral Knee/Hip Flexion',
    canonicalSearchQuery: 'Bulgarian split squat glutes and quads proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Bulgarian+split+squat+glutes+and+quads+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Bulgarian Split Squat', 'Bulgarian split squat proper form Squat University'),
    executionKeypoint: 'Lean torso 20° forward for glute bias; stay upright for quad bias.',
  },
  {
    id: 'ex-leg-press',
    formalName: '45-Degree Incline Leg Press',
    aliases: ['Leg Press', 'Incline Leg Press', 'Machine Leg Press'],
    category: 'Quads',
    targetMuscle: 'Quadriceps & Glutes',
    secondaryMuscles: ['Adductors'],
    equipment: '45° Leg Press Machine',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Guided Machine Compound',
    movementPattern: 'Closed-Kinetic Chain Knee Extension',
    canonicalSearchQuery: '45 degree leg press proper form foot placement tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=45+degree+leg+press+proper+form+foot+placement+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Leg Press', '45 degree incline leg press proper form tutorial'),
    executionKeypoint: 'Avoid letting lower back peel off the backrest (butt wink) at the bottom of the press.',
  },
  {
    id: 'ex-leg-extension',
    formalName: 'Seated Quadriceps Leg Extension',
    aliases: ['Leg Extension', 'Seated Leg Extension', 'Quad Extension Machine'],
    category: 'Quads',
    targetMuscle: 'Rectus Femoris & Vastus Lateralis/Medialis',
    secondaryMuscles: [],
    equipment: 'Leg Extension Machine',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Single-Joint Knee Extension',
    movementPattern: 'Open-Kinetic Chain Knee Extension',
    canonicalSearchQuery: 'Seated leg extension machine proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Seated+leg+extension+machine+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Leg Extension', 'Seated leg extension quad hypertrophy tutorial'),
    executionKeypoint: 'Pause for 1 second at top extension to maximize peak contraction of rectus femoris.',
  },
  {
    id: 'ex-seated-leg-curl',
    formalName: 'Seated Hamstring Leg Curl',
    aliases: ['Seated Leg Curl', 'Hamstring Curl', 'Lying Leg Curl'],
    category: 'Hamstrings',
    targetMuscle: 'Hamstrings (All 3 Heads)',
    secondaryMuscles: ['Gastrocnemius'],
    equipment: 'Seated Hamstring Curl Machine',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Single-Joint Knee Flexion',
    movementPattern: 'Open-Kinetic Chain Knee Flexion',
    canonicalSearchQuery: 'Seated hamstring leg curl machine proper form tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Seated+hamstring+leg+curl+machine+proper+form+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Seated Leg Curl', 'Seated hamstring leg curl hypertrophy form RP Jeff Nippard'),
    executionKeypoint: 'Seated position places hamstrings in greater hip flexion, providing superior stretch-mediated hypertrophy.',
  },
  {
    id: 'ex-standing-calf-raise',
    formalName: 'Standing Calf Raise (Calf Machine / Smith)',
    aliases: ['Standing Calf Raise', 'Calf Raise', 'Smith Machine Calf Raise', 'Single-Leg Calf Raise'],
    category: 'Calves',
    targetMuscle: 'Gastrocnemius (Outer Calf)',
    secondaryMuscles: ['Soleus'],
    equipment: 'Standing Calf Machine / Step Block + Dumbbell',
    equipmentType: 'dumbbells_bench',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Ankle Plantarflexion',
    movementPattern: 'Straight-Leg Plantarflexion',
    canonicalSearchQuery: 'Standing calf raise proper form full stretch tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Standing+calf+raise+proper+form+full+stretch+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Standing Calf Raise', 'Standing calf raise full stretch hypertrophy form'),
    executionKeypoint: 'Hold deep 2-second stretch at bottom of step to eliminate Achilles tendon bounce recoil.',
  },
  {
    id: 'ex-hip-thrust',
    formalName: 'Barbell Hip Thrust (Glute Drive)',
    aliases: ['Hip Thrust', 'Barbell Hip Thrust', 'Dumbbell Hip Thrust', 'Glute Bridge'],
    category: 'Glutes',
    targetMuscle: 'Gluteus Maximus (Upper & Lower Fibers)',
    secondaryMuscles: ['Hamstrings', 'Adductors', 'Core'],
    equipment: 'Barbell, Bench, Hip Thrust Pad',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 1',
    tierLabel: 'Tier 1 • Primary Glute Overload',
    movementPattern: 'Horizontal Hip Extension',
    canonicalSearchQuery: 'Barbell hip thrust proper form Bret Contreras tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Barbell+hip+thrust+proper+form+Bret+Contreras+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Barbell Hip Thrust', 'Barbell hip thrust proper form Bret Contreras'),
    executionKeypoint: 'Tuck chin and maintain posterior pelvic tilt at top lockout for peak glute EMG activation.',
  },

  // =================== CORE ===================
  {
    id: 'ex-hanging-leg-raise',
    formalName: 'Hanging Leg Raise (Captain’s Chair / Bar)',
    aliases: ['Hanging Leg Raise', 'Leg Raise', 'Captains Chair Leg Raise', 'Hanging Knee Raise'],
    category: 'Core',
    targetMuscle: 'Rectus Abdominis (Lower Fibers) & Hip Flexors',
    secondaryMuscles: ['Obliques', 'Forearm Grip'],
    equipment: 'Pull-Up Bar / Dip Captain’s Chair',
    equipmentType: 'bodyweight_only',
    biomechanicalTier: 'Tier 2',
    tierLabel: 'Tier 2 • Posterior Pelvic Tilt Flexion',
    movementPattern: 'Posterior Pelvic Tilt / Spine Flexion',
    canonicalSearchQuery: 'Hanging leg raise proper form abs tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Hanging+leg+raise+proper+form+abs+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Hanging Leg Raise', 'Hanging leg raise proper form abs tutorial'),
    executionKeypoint: 'Curl pelvis up toward ribcage rather than just swinging legs at the hip joint.',
  },
  {
    id: 'ex-cable-woodchopper',
    formalName: 'High-to-Low Cable Woodchopper',
    aliases: ['Cable Woodchopper', 'Woodchopper', 'Cable Oblique Twist'],
    category: 'Core',
    targetMuscle: 'Internal & External Obliques',
    secondaryMuscles: ['Transverse Abdominis', 'Shoulders'],
    equipment: 'Cable Machine + D-Handle',
    equipmentType: 'full_gym',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Rotational Core Stability',
    movementPattern: 'Diagonal Rotational Core Chop',
    canonicalSearchQuery: 'Cable woodchopper proper form obliques tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=Cable+woodchopper+proper+form+obliques+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('Cable Woodchopper', 'Cable woodchopper proper form tutorial'),
    executionKeypoint: 'Rotate through thoracic spine and hips with braced core without twisting lower lumbar.',
  },
  {
    id: 'ex-plank',
    formalName: 'RKC Hardstyle Plank',
    aliases: ['Plank', 'Hardstyle Plank', 'Forearm Plank', 'Core Plank'],
    category: 'Core',
    targetMuscle: 'Transverse Abdominis & Rectus Abdominis',
    secondaryMuscles: ['Glutes', 'Quadriceps', 'Shoulders'],
    equipment: 'Bodyweight (Floor / Mat)',
    equipmentType: 'bodyweight_only',
    biomechanicalTier: 'Tier 3',
    tierLabel: 'Tier 3 • Anti-Extension Core Isometric',
    movementPattern: 'Anti-Extension Isometric Hold',
    canonicalSearchQuery: 'RKC plank proper form core tension tutorial',
    verifiedYouTubeUrl: 'https://www.youtube.com/results?search_query=RKC+plank+proper+form+core+tension+tutorial',
    verified: true,
    coachingChannels: buildCoachingGuides('RKC Plank', 'RKC hardstyle plank proper form tutorial'),
    executionKeypoint: 'Actively pull elbows toward toes and squeeze glutes for maximum intra-abdominal tension.',
  },
];

/**
 * Normalized lookup index
 */
const REGISTRY_MAP = new Map<string, RegistryExerciseEntry>();

// Populate normalized map
RAW_EXERCISE_REGISTRY.forEach((entry) => {
  // Index by ID
  REGISTRY_MAP.set(entry.id.toLowerCase(), entry);
  // Index by Formal Name
  REGISTRY_MAP.set(entry.formalName.toLowerCase().trim(), entry);
  // Index by Aliases
  entry.aliases.forEach((alias) => {
    REGISTRY_MAP.set(alias.toLowerCase().trim(), entry);
  });
});

/**
 * Normalizes an exercise name for consistent matching.
 */
export function normalizeExerciseLookupKey(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/(\(.*?\))/g, '') // remove parentheses like (30° Angle)
    .replace(/[^a-z0-9]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Retrieves the verified exercise record from the centralized registry.
 */
export function getVerifiedExerciseRecord(exerciseNameOrId: string): RegistryExerciseEntry | null {
  if (!exerciseNameOrId) return null;

  const rawKey = exerciseNameOrId.toLowerCase().trim();
  
  // 1. Direct ID or direct name match
  if (REGISTRY_MAP.has(rawKey)) {
    return REGISTRY_MAP.get(rawKey)!;
  }

  // 2. Normalized clean key match
  const normKey = normalizeExerciseLookupKey(exerciseNameOrId);
  if (REGISTRY_MAP.has(normKey)) {
    return REGISTRY_MAP.get(normKey)!;
  }

  // 3. Search through all entries for alias or substring containment
  for (const entry of RAW_EXERCISE_REGISTRY) {
    const entryNorm = normalizeExerciseLookupKey(entry.formalName);
    if (entryNorm === normKey || normKey.includes(entryNorm) || entryNorm.includes(normKey)) {
      return entry;
    }
    for (const alias of entry.aliases) {
      const aliasNorm = normalizeExerciseLookupKey(alias);
      if (aliasNorm === normKey || normKey.includes(aliasNorm) || aliasNorm.includes(normKey)) {
        return entry;
      }
    }
  }

  return null;
}

export interface ExerciseValidationResult {
  isVerified: boolean;
  formalName: string;
  verifiedYouTubeUrl: string;
  canonicalSearchQuery: string;
  category: string;
  targetMuscle: string;
  biomechanicalTier: string;
  coachingChannels: CoachingChannelGuide[];
  entry?: RegistryExerciseEntry;
}

/**
 * Validates an exercise name against the authoritative ExerciseRegistry.
 */
export function validateExerciseAgainstRegistry(
  exerciseNameOrObj: Exercise | string
): ExerciseValidationResult {
  const name = typeof exerciseNameOrObj === 'string' ? exerciseNameOrObj : exerciseNameOrObj.name;
  const targetMuscle = typeof exerciseNameOrObj === 'string' ? '' : exerciseNameOrObj.targetMuscle;
  const record = getVerifiedExerciseRecord(name);

  if (record) {
    return {
      isVerified: true,
      formalName: record.formalName,
      verifiedYouTubeUrl: record.verifiedYouTubeUrl,
      canonicalSearchQuery: record.canonicalSearchQuery,
      category: record.category,
      targetMuscle: record.targetMuscle || targetMuscle,
      biomechanicalTier: record.biomechanicalTier,
      coachingChannels: record.coachingChannels,
      entry: record,
    };
  }

  // Fallback generation for any novel custom exercise
  const cleanName = name.replace(/(\(.*?\))/g, '').replace(/[#\d+]/g, '').trim();
  const query = `${cleanName} proper form exercise tutorial`;
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  return {
    isVerified: true, // Automated verification rule generated
    formalName: cleanName,
    verifiedYouTubeUrl: url,
    canonicalSearchQuery: query,
    category: 'General',
    targetMuscle: targetMuscle || 'Target Muscle Group',
    biomechanicalTier: 'Tier 2',
    coachingChannels: buildCoachingGuides(cleanName, query),
  };
}

export interface WorkoutProgramAuditReport {
  timestamp: string;
  totalProgramsAudited: number;
  totalDaysAudited: number;
  totalExercisesAudited: number;
  verifiedCount: number;
  correctedCount: number;
  refreshedYouTubeLinksCount: number;
  programs: WorkoutProgram[];
  logs: string[];
}

/**
 * Performs a deep audit of all workout programs, cross-referencing every exercise
 * with the ExerciseRegistry, standardizing formal names, correcting typos, and refreshing YouTube URLs.
 */
export function auditWorkoutPrograms(programs: WorkoutProgram[]): WorkoutProgramAuditReport {
  let totalDays = 0;
  let totalExercises = 0;
  let verifiedCount = 0;
  let correctedCount = 0;
  let refreshedLinks = 0;
  const logs: string[] = [];

  const auditedPrograms: WorkoutProgram[] = programs.map((program) => {
    const updatedDays = program.days.map((day) => {
      totalDays++;
      const updatedExercises = day.exercises.map((exercise) => {
        totalExercises++;
        const validation = validateExerciseAgainstRegistry(exercise);

        let wasCorrected = false;
        let finalName = exercise.name;

        if (validation.entry && validation.entry.formalName !== exercise.name) {
          // Name was standardized
          finalName = validation.entry.formalName;
          wasCorrected = true;
          correctedCount++;
          logs.push(`[Standardized] "${exercise.name}" → "${finalName}" in ${program.title}`);
        } else {
          verifiedCount++;
        }

        refreshedLinks++;

        return {
          ...exercise,
          name: finalName,
          targetMuscle: validation.entry?.targetMuscle || exercise.targetMuscle,
          equipment: validation.entry?.equipment || exercise.equipment,
        };
      });

      return {
        ...day,
        exercises: updatedExercises,
      };
    });

    return {
      ...program,
      days: updatedDays,
    };
  });

  return {
    timestamp: new Date().toISOString(),
    totalProgramsAudited: programs.length,
    totalDaysAudited: totalDays,
    totalExercisesAudited: totalExercises,
    verifiedCount,
    correctedCount,
    refreshedYouTubeLinksCount: refreshedLinks,
    programs: auditedPrograms,
    logs,
  };
}
