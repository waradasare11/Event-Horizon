import { Exercise } from '../types';

export type BiomechanicalTier = 'primary_compound' | 'secondary_compound' | 'isolation' | 'auxiliary_core';

export interface BiomechanicalClassification {
  tier: BiomechanicalTier;
  tierLabel: string;
  badgeColor: string;
  orderScore: number; // lower = performed earlier in session
  movementPattern: string; // e.g., 'Squat', 'Hinge', 'Horizontal Push', 'Vertical Pull'
  jointType: 'Multi-Joint (Compound)' | 'Single-Joint (Isolation)' | 'Core/Auxiliary';
}

/**
 * Biomechanically classify any exercise based on multi-joint recruitment,
 * systemic CNS demand, axial loading, and hypertrophy positioning.
 */
export function getBiomechanicalClassification(
  exerciseName: string,
  targetMuscle?: string,
  equipment?: string
): BiomechanicalClassification {
  const name = (exerciseName || '').toLowerCase().trim();
  const muscle = (targetMuscle || '').toLowerCase().trim();
  const eq = (equipment || '').toLowerCase().trim();

  // Tier 1: Primary Heavy Multi-Joint Free-Weight / Axial Compounds
  // Score: 10 - 29
  if (
    name.includes('back squat') ||
    name.includes('front squat') ||
    (name.includes('squat') && (name.includes('barbell') || eq.includes('barbell'))) ||
    name.includes('deadlift') ||
    name.includes('romanian deadlift') ||
    name.includes('rdl') ||
    name.includes('barbell bench press') ||
    name.includes('flat barbell bench') ||
    name.includes('incline barbell bench') ||
    (name.includes('bench press') && name.includes('barbell')) ||
    name.includes('overhead press') ||
    name.includes('military press') ||
    name.includes('barbell row') ||
    name.includes('bent-over row') ||
    name.includes('weighted pull-up') ||
    name.includes('weighted chin-up') ||
    name.includes('weighted dip') ||
    name.includes('clean and press') ||
    name.includes('trap bar deadlift') ||
    name.includes('surya namaskar') ||
    name.includes('akhada dand') ||
    name.includes('hindu push-up')
  ) {
    return {
      tier: 'primary_compound',
      tierLabel: 'Primary Heavy Compound',
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      orderScore: 10,
      movementPattern: name.includes('squat') ? 'Squat (Knee Dominant)' :
                       name.includes('deadlift') || name.includes('rdl') ? 'Hinge (Hip Dominant)' :
                       name.includes('bench') ? 'Horizontal Push' :
                       name.includes('overhead') || name.includes('military') ? 'Vertical Push' :
                       name.includes('pull') ? 'Vertical Pull' : 'Horizontal Pull',
      jointType: 'Multi-Joint (Compound)',
    };
  }

  // Tier 2: Secondary Multi-Joint Compounds (Machines, Dumbbells, Unilateral)
  // Score: 30 - 55
  if (
    name.includes('leg press') ||
    name.includes('hack squat') ||
    name.includes('bulgarian split squat') ||
    name.includes('split squat') ||
    name.includes('lunge') ||
    name.includes('goblet squat') ||
    name.includes('dumbbell bench press') ||
    name.includes('dumbbell incline') ||
    name.includes('incline dumbbell') ||
    name.includes('flat dumbbell') ||
    name.includes('dumbbell shoulder press') ||
    name.includes('dumbbell overhead') ||
    name.includes('arnold press') ||
    name.includes('lat pulldown') ||
    name.includes('seated cable row') ||
    name.includes('t-bar row') ||
    name.includes('dumbbell row') ||
    name.includes('chest supported row') ||
    name.includes('machine chest press') ||
    name.includes('machine shoulder press') ||
    name.includes('smith machine') ||
    name.includes('pull-up') ||
    name.includes('chin-up') ||
    name.includes('dip') ||
    name.includes('push-up') ||
    name.includes('hip thrust') ||
    name.includes('glute bridge') ||
    name.includes('step up') ||
    name.includes('dand') ||
    name.includes('bethak')
  ) {
    return {
      tier: 'secondary_compound',
      tierLabel: 'Secondary Compound',
      badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      orderScore: 35,
      movementPattern: name.includes('press') || name.includes('push') ? 'Upper Push' :
                       name.includes('row') || name.includes('pull') ? 'Upper Pull' :
                       name.includes('squat') || name.includes('lunge') || name.includes('leg press') ? 'Lower Compound' : 'Posterior Chain',
      jointType: 'Multi-Joint (Compound)',
    };
  }

  // Tier 4: Core, Calves, Forearms, Neck, Finisher/Mobility
  // Score: 80 - 100
  if (
    name.includes('calf') ||
    name.includes('calf raise') ||
    name.includes('standing calf') ||
    name.includes('seated calf') ||
    name.includes('plank') ||
    name.includes('crunch') ||
    name.includes('leg raise') ||
    name.includes('hanging leg') ||
    name.includes('hanging knee') ||
    name.includes('ab wheel') ||
    name.includes('woodchopper') ||
    name.includes('cable crunch') ||
    name.includes('wrist curl') ||
    name.includes('forearm') ||
    name.includes('tibetan') ||
    name.includes('farmers walk') ||
    name.includes('shrug') ||
    muscle.includes('calves') ||
    muscle.includes('abs') ||
    muscle.includes('core')
  ) {
    return {
      tier: 'auxiliary_core',
      tierLabel: 'Core / Calves / Finisher',
      badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      orderScore: 85,
      movementPattern: 'Core Stability & Accessories',
      jointType: 'Core/Auxiliary',
    };
  }

  // Tier 3: Primary Isolations (Single-Joint)
  // Score: 60 - 75 (Default for isolation movements)
  return {
    tier: 'isolation',
    tierLabel: 'Isolation (Single-Joint)',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    orderScore: 60,
    movementPattern: name.includes('curl') ? 'Elbow Flexion' :
                     name.includes('extension') || name.includes('pushdown') ? 'Elbow/Knee Extension' :
                     name.includes('lateral') ? 'Shoulder Abduction' :
                     name.includes('fly') || name.includes('pec deck') ? 'Horizontal Adduction' : 'Single-Joint Isolation',
    jointType: 'Single-Joint (Isolation)',
  };
}

/**
 * Automatically reorders a list of exercises based on strict biomechanical complexity:
 * Primary Compound → Secondary Compound → Single-Joint Isolation → Core/Calves/Auxiliary.
 */
export function sortExercisesByBiomechanicalComplexity(exercises: Exercise[]): Exercise[] {
  if (!exercises || exercises.length === 0) return [];
  
  return [...exercises].sort((a, b) => {
    const classA = getBiomechanicalClassification(a.name, a.targetMuscle, a.equipment);
    const classB = getBiomechanicalClassification(b.name, b.targetMuscle, b.equipment);
    
    // Sort primarily by orderScore
    if (classA.orderScore !== classB.orderScore) {
      return classA.orderScore - classB.orderScore;
    }
    
    // Secondary tie-breaker: sets count (higher volume compounds earlier)
    return (b.sets || 3) - (a.sets || 3);
  });
}

import { 
  getVerifiedExerciseRecord, 
  validateExerciseAgainstRegistry 
} from '../data/ExerciseRegistry';

export interface CoachingChannelOption {
  id: string;
  name: string;
  creator: string;
  query: string;
  url: string;
  badge: string;
  avatarText: string;
}

/**
 * Generates an accurate YouTube search URL for the given exercise with optional coach filtering.
 */
export function getYouTubeSearchUrl(exerciseName: string, channelFilter?: string): string {
  const validation = validateExerciseAgainstRegistry(exerciseName);
  
  if (channelFilter) {
    const finalQuery = `${channelFilter} ${validation.canonicalSearchQuery}`;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(finalQuery)}`;
  }

  return validation.verifiedYouTubeUrl;
}

/**
 * Cleans and standardizes an exercise name for perfect YouTube search or external querying.
 */
export function getStandardizedExerciseSearchTerm(exerciseName: string): string {
  if (!exerciseName) return 'Workout Exercise';
  const record = getVerifiedExerciseRecord(exerciseName);
  if (record) {
    return record.formalName;
  }
  return exerciseName
    .replace(/(\(.*?\))/g, '') // remove parenthesized info like (30° Angle), (RDL), (Forward Lean)
    .replace(/[#\d+]/g, '')     // remove numbers/hashes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns a list of certified, science-backed coaching channel search links for any exercise.
 */
export function getCuratedCoachingOptions(exerciseName: string): CoachingChannelOption[] {
  const validation = validateExerciseAgainstRegistry(exerciseName);
  
  return validation.coachingChannels.map((ch) => ({
    id: ch.channelId,
    name: ch.channelName,
    creator: ch.coachName,
    query: ch.query,
    url: ch.url,
    badge: ch.badge,
    avatarText: ch.icon,
  }));
}

