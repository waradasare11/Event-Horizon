import { WorkoutCompletionLog } from '../types';

/**
 * Automatically infers and populates the 'targetMuscle' field when users
 * manually log exercises in the Library, based on common exercise naming conventions.
 */
export function inferTargetMuscle(exerciseName: string, fallback?: string): string {
  if (!exerciseName) return fallback || 'Full Body';
  const name = exerciseName.toLowerCase().trim();

  // 1. Chest conventions
  if (
    name.includes('bench') ||
    name.includes('chest') ||
    name.includes('pec') ||
    name.includes('pushup') ||
    name.includes('push-up') ||
    name.includes('fly') ||
    name.includes('flye') ||
    name.includes('dips') ||
    name.includes('incline press') ||
    name.includes('decline press') ||
    name.includes('floor press')
  ) {
    return 'Chest (Pectoralis Major)';
  }

  // 2. Back conventions
  if (
    name.includes('pullup') ||
    name.includes('pull-up') ||
    name.includes('chin') ||
    name.includes('row') ||
    name.includes('lat') ||
    name.includes('deadlift') ||
    name.includes('pulldown') ||
    name.includes('face pull') ||
    name.includes('shrug') ||
    name.includes('hyperextension') ||
    name.includes('back extension')
  ) {
    return 'Back (Latissimus & Trapezius)';
  }

  // 3. Legs / Glutes / Quads / Hamstrings conventions
  if (
    name.includes('squat') ||
    name.includes('leg press') ||
    name.includes('hack') ||
    name.includes('quad') ||
    name.includes('lunge') ||
    name.includes('leg extension') ||
    name.includes('sissy')
  ) {
    return 'Legs (Quadriceps)';
  }

  if (
    name.includes('hamstring') ||
    name.includes('leg curl') ||
    name.includes('rdl') ||
    name.includes('romanian') ||
    name.includes('good morning')
  ) {
    return 'Legs (Hamstrings)';
  }

  if (
    name.includes('hip thrust') ||
    name.includes('glute') ||
    name.includes('kickback') && !name.includes('tricep') ||
    name.includes('abductor')
  ) {
    return 'Legs (Glutes)';
  }

  if (name.includes('calf') || name.includes('calves')) {
    return 'Legs (Calves)';
  }

  // 4. Shoulders / Deltoids
  if (
    name.includes('shoulder') ||
    name.includes('overhead press') ||
    name.includes('ohp') ||
    name.includes('military') ||
    name.includes('lateral raise') ||
    name.includes('delt') ||
    name.includes('arnold press') ||
    name.includes('front raise') ||
    name.includes('upright row')
  ) {
    return 'Shoulders (Deltoids)';
  }

  // 5. Biceps
  if (
    name.includes('bicep') ||
    name.includes('curl') && !name.includes('leg') && !name.includes('wrist') ||
    name.includes('preacher') ||
    name.includes('hammer') ||
    name.includes('spider curl')
  ) {
    return 'Arms (Biceps)';
  }

  // 6. Triceps
  if (
    name.includes('tricep') ||
    name.includes('skull crusher') ||
    name.includes('skullcrusher') ||
    name.includes('pushdown') ||
    name.includes('overhead extension') ||
    name.includes('jm press') ||
    name.includes('close grip bench')
  ) {
    return 'Arms (Triceps)';
  }

  // 7. Core / Abs
  if (
    name.includes('crunch') ||
    name.includes('plank') ||
    name.includes('ab') ||
    name.includes('abs') ||
    name.includes('core') ||
    name.includes('hanging leg') ||
    name.includes('situp') ||
    name.includes('sit-up') ||
    name.includes('russian twist') ||
    name.includes('rollout')
  ) {
    return 'Abs & Core';
  }

  // 8. General fallbacks
  if (name.includes('clean') || name.includes('snatch') || name.includes('swing') || name.includes('burpee')) {
    return 'Full Body Conditioning';
  }

  return fallback || 'Full Body';
}

export interface ExerciseLastPerformedData {
  date: string;
  formattedDate: string;
  daysAgo: number;
  sets: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  volumeKg: number;
}

export interface ExerciseProgressionRecommendation {
  lastPerformed: ExerciseLastPerformedData | null;
  recommendedWeightKg: number;
  recommendedReps: number;
  recommendedSets: number;
  progressionNote: string;
  isOverload: boolean;
}

/**
 * Evaluates historical workout logs for a given exercise and computes
 * progressive overload recommendations (recommended weight and reps progression).
 */
export function getExerciseProgressionRecommendation(
  exerciseName: string,
  aliases: string[] = [],
  workoutLogs: WorkoutCompletionLog[] = [],
  userBodyweightKg = 65
): ExerciseProgressionRecommendation {
  if (!workoutLogs || workoutLogs.length === 0 || !exerciseName) {
    const defaultWeight = Math.max(10, Math.round(userBodyweightKg * 0.5 / 2.5) * 2.5);
    return {
      lastPerformed: null,
      recommendedWeightKg: defaultWeight,
      recommendedReps: 10,
      recommendedSets: 3,
      progressionNote: 'Baseline Starting Target: 3 × 10 reps',
      isOverload: false,
    };
  }

  const cleanName = exerciseName.toLowerCase().trim();
  const searchKeywords = [cleanName, ...aliases.map((a) => a.toLowerCase().trim())];

  // Find all historical entries matching this exercise
  const matches: { date: string; log: NonNullable<WorkoutCompletionLog['loggedExercises']>[0] }[] = [];

  for (const wLog of workoutLogs) {
    if (!wLog.loggedExercises || wLog.loggedExercises.length === 0) continue;
    for (const ex of wLog.loggedExercises) {
      const exName = (ex.exerciseName || '').toLowerCase().trim();
      const isMatch = searchKeywords.some(
        (kw) => kw.length > 2 && (exName === kw || exName.includes(kw) || kw.includes(exName))
      );
      if (isMatch) {
        matches.push({
          date: wLog.date,
          log: ex,
        });
      }
    }
  }

  if (matches.length === 0) {
    const defaultWeight = Math.max(10, Math.round(userBodyweightKg * 0.5 / 2.5) * 2.5);
    return {
      lastPerformed: null,
      recommendedWeightKg: defaultWeight,
      recommendedReps: 10,
      recommendedSets: 3,
      progressionNote: 'New Movement: Start conservative with 3 × 10 reps @ RPE 7-8',
      isOverload: false,
    };
  }

  // Sort matches by date descending (most recent first)
  matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const mostRecent = matches[0];

  const logDate = new Date(mostRecent.date);
  const now = new Date();
  const diffDays = Math.max(0, Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)));

  const formattedDate = diffDays === 0
    ? 'Today'
    : diffDays === 1
    ? 'Yesterday'
    : diffDays < 7
    ? `${diffDays}d ago`
    : logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const prevWeight = mostRecent.log.weightKg || 0;
  const prevReps = mostRecent.log.reps || 10;
  const prevSets = mostRecent.log.sets || 3;
  const prevRpe = mostRecent.log.rpeLogged || 8;
  const prevVolume = mostRecent.log.volumeKg || prevSets * prevReps * prevWeight;

  const lastPerformed: ExerciseLastPerformedData = {
    date: mostRecent.date,
    formattedDate,
    daysAgo: diffDays,
    sets: prevSets,
    reps: prevReps,
    weightKg: prevWeight,
    rpe: mostRecent.log.rpeLogged,
    volumeKg: prevVolume,
  };

  // Progression calculation:
  // Is this a big compound movement (Squat, Deadlift, Leg Press)?
  const isHeavyCompound =
    cleanName.includes('squat') ||
    cleanName.includes('deadlift') ||
    cleanName.includes('leg press') ||
    cleanName.includes('hack');

  const weightStep = isHeavyCompound ? 5.0 : 2.5;

  let recommendedWeightKg = prevWeight;
  let recommendedReps = prevReps;
  let progressionNote = '';
  let isOverload = true;

  if (prevReps >= 10 && prevRpe <= 8.5) {
    // Athlete mastered rep target: increase load
    recommendedWeightKg = prevWeight + weightStep;
    recommendedReps = Math.max(8, prevReps - 2); // drop reps slightly on new higher weight
    progressionNote = `Progressive Overload: +${weightStep} kg (Up to ${recommendedWeightKg} kg × ${recommendedReps} reps)`;
  } else if (prevReps < 10 && prevRpe <= 8.5) {
    // Keep weight, aim for +1-2 reps
    recommendedWeightKg = prevWeight;
    recommendedReps = prevReps + 1;
    progressionNote = `Rep Overload: Add +1 rep at ${recommendedWeightKg} kg (${recommendedReps} reps target)`;
  } else {
    // High fatigue (RPE > 8.5): consolidate technique at same weight and reps
    recommendedWeightKg = prevWeight;
    recommendedReps = prevReps;
    progressionNote = `Consolidation: Match previous session ${recommendedWeightKg} kg × ${recommendedReps} reps with cleaner tempo`;
    isOverload = false;
  }

  return {
    lastPerformed,
    recommendedWeightKg,
    recommendedReps,
    recommendedSets: prevSets || 3,
    progressionNote,
    isOverload,
  };
}
