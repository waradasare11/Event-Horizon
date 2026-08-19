import React, { useState } from 'react';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Target, 
  Calendar, 
  ShieldAlert, 
  Utensils, 
  Activity, 
  Dumbbell, 
  Flame
} from 'lucide-react';
import { UserProfile, GoalType, DietType, ExperienceLevel, PreferredTime, MusclePriority } from '../types';
import { calculateBMR, calculateTDEE } from '../lib/calc/energy';
import { calculateMacros, calculateGoalTimeline } from '../lib/calc/macros';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State
  const [name, setName] = useState(userProfile.name || 'Athlete');
  const [age, setAge] = useState<number>(userProfile.age || 26);
  const [sex, setSex] = useState<'male' | 'female'>(userProfile.sex || 'male');
  const [heightCm, setHeightCm] = useState<number>(userProfile.heightCm || 175);
  const [weightKg, setWeightKg] = useState<number>(userProfile.weightKg || 75);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(userProfile.targetWeightKg || 70);
  const [bodyFatPct, setBodyFatPct] = useState<number>(userProfile.bodyFatPct || 18);
  const [goal, setGoal] = useState<GoalType>(userProfile.goal || 'lose_fat');
  const [dietType, setDietType] = useState<DietType>(userProfile.dietType || 'flexible');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(userProfile.experienceLevel || 'intermediate');
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<number>(userProfile.trainingDaysPerWeek || 4);
  const [selectedDays, setSelectedDays] = useState<string[]>(userProfile.selectedDays || ['Mon', 'Tue', 'Thu', 'Fri']);
  const [sessionDurationMin, setSessionDurationMin] = useState<number>(userProfile.sessionDurationMin || 55);
  const [preferredTime, setPreferredTime] = useState<PreferredTime>(userProfile.preferredTime || 'morning');
  const [musclePriority, setMusclePriority] = useState<MusclePriority>(userProfile.musclePriority || 'balanced');
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>(userProfile.injuries || []);
  const [injuryNotes, setInjuryNotes] = useState<string>(userProfile.injuryNotes || '');
  const [cuisinePreference, setCuisinePreference] = useState<string>(userProfile.cuisinePreference || 'High-Protein Global & Mediterranean');

  if (!isOpen) return null;

  // Live Math Calculations
  const calculatedBMR = calculateBMR(sex, weightKg, heightCm, age);
  const calculatedTDEE = calculateTDEE(calculatedBMR, trainingDaysPerWeek);
  const macroResults = calculateMacros(calculatedTDEE, goal, sex, weightKg, dietType);
  const timelineResult = calculateGoalTimeline(weightKg, targetWeightKg, macroResults.weeklyRateKg);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleInjury = (injury: string) => {
    if (selectedInjuries.includes(injury)) {
      setSelectedInjuries(selectedInjuries.filter((i) => i !== injury));
    } else {
      setSelectedInjuries([...selectedInjuries, injury]);
    }
  };

  const handleFinishOnboarding = () => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      name,
      age,
      sex,
      heightCm,
      weightKg,
      targetWeightKg,
      targetDate: timelineResult.projectedDate,
      bodyFatPct,
      goal,
      dietType,
      experienceLevel,
      trainingDaysPerWeek,
      selectedDays,
      sessionDurationMin,
      preferredTime,
      musclePriority,
      injuries: selectedInjuries,
      injuryNotes,
      cuisinePreference,
      bmr: calculatedBMR,
      tdee: calculatedTDEE,
      dailyCalories: macroResults.dailyCalories,
      dailyProtein: macroResults.proteinG,
      dailyCarbs: macroResults.carbsG,
      dailyFat: macroResults.fatG,
      hydrationLiters: Number(((weightKg * 0.04) + 0.5).toFixed(1)),
      weeklyRateKg: macroResults.weeklyRateKg,
      isOnboarded: true,
    };

    onSaveProfile(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#E5E7EB] overflow-hidden animate-in zoom-in-95 duration-200 text-left my-8">
        {/* Top Progress Bar */}
        <div className="p-6 border-b border-[#E5E7EB] bg-[#FAFAF8]">
          <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2 font-semibold">
            <span>Step {step} of {totalSteps}</span>
            <span>
              {step === 1 && 'Foundations & Body Stats'}
              {step === 2 && 'Training Availability'}
              {step === 3 && 'Injury & Joint Screening'}
              {step === 4 && 'Dietary Framework'}
              {step === 5 && 'Scientific Plan Reveal'}
            </span>
          </div>
          <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#0F6E5F] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Foundations & Body Stats */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#1A1D1B]">What is your primary fitness goal?</h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  We use this to establish your exact caloric surplus or deficit and optimal protein distribution.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'lose_fat', label: 'Lose Fat', desc: 'Preserve muscle, target pure adipose loss' },
                  { id: 'build_muscle', label: 'Build Muscle', desc: 'Max MPS with controlled lean surplus' },
                  { id: 'recomp', label: 'Recomposition', desc: 'Simultaneous fat loss & muscle gain' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGoal(item.id as GoalType)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      goal === item.id
                        ? 'border-[#0F6E5F] bg-[#0F6E5F]/5 ring-1 ring-[#0F6E5F]'
                        : 'border-[#E5E7EB] bg-white hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <div className="font-bold text-sm text-[#1A1D1B]">{item.label}</div>
                    <div className="text-[11px] text-[#6B7280] mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as 'male' | 'female')}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB]"
                    min={15}
                    max={85}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB]"
                    min={120}
                    max={230}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB]"
                    min={35}
                    max={200}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">Target Weight (kg)</label>
                  <input
                    type="number"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB]"
                    min={35}
                    max={200}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">Body Fat % (Est.)</label>
                  <input
                    type="number"
                    value={bodyFatPct}
                    onChange={(e) => setBodyFatPct(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB]"
                    min={5}
                    max={50}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Training Availability & Schedule */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#1A1D1B]">Training Availability & Split</h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  How many days per week can you consistently dedicate to resistance training?
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTrainingDaysPerWeek(days)}
                    className={`p-3 rounded-xl border text-center font-bold text-sm transition-all ${
                      trainingDaysPerWeek === days
                        ? 'border-[#0F6E5F] bg-[#0F6E5F] text-white shadow-xs'
                        : 'border-[#E5E7EB] bg-white text-[#1A1D1B] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    {days} Days / Week
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1D1B] mb-2">
                  Select your preferred training days:
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`p-2 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#0F6E5F] text-white'
                            : 'bg-[#FAFAF8] border border-[#E5E7EB] text-[#6B7280]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">
                    Session Duration
                  </label>
                  <select
                    value={sessionDurationMin}
                    onChange={(e) => setSessionDurationMin(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-white"
                  >
                    <option value={45}>45 Minutes (High Efficiency)</option>
                    <option value={55}>55 Minutes (Standard Scientific)</option>
                    <option value={75}>75 Minutes (High Volume)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">
                    Muscle Specialization Priority
                  </label>
                  <select
                    value={musclePriority}
                    onChange={(e) => setMusclePriority(e.target.value as MusclePriority)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-white"
                  >
                    <option value="balanced">Balanced Whole Body</option>
                    <option value="chest">Upper Chest Focus</option>
                    <option value="back">Lats & Upper Back Focus</option>
                    <option value="shoulders">Side Delts & Shoulders</option>
                    <option value="arms">Arms (Biceps & Triceps)</option>
                    <option value="quads">Quads & Leg Density</option>
                    <option value="glutes_hamstrings">Glutes & Hamstrings</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Injury & Limitations Screening */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#1A1D1B]">Joint Health & Injury Shield</h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  Select any areas of pain or discomfort so our scientific engine can swap out high-risk exercises for joint-friendly alternatives.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'Right Shoulder / Rotator Cuff',
                  'Left Shoulder / Rotator Cuff',
                  'Lower Back / Lumbar Disc',
                  'Knees (Patellar / ACL)',
                  'Wrists / Forearms',
                  'Neck / Cervical Spine',
                ].map((item) => {
                  const isChecked = selectedInjuries.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleInjury(item)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-[#E8912D] bg-[#E8912D]/10 text-[#1A1D1B]'
                          : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#FAFAF8]'
                      }`}
                    >
                      <span>{item}</span>
                      {isChecked && <Check className="w-4 h-4 text-[#E8912D]" />}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">
                  Specific Movement Triggers or Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flare up during heavy flat barbell bench press or deep squats"
                  value={injuryNotes}
                  onChange={(e) => setInjuryNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAF8]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] text-[11px] text-[#6B7280] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[#0F6E5F] shrink-0 mt-0.5" />
                <span>
                  <strong>Safety Note:</strong> PeakForm AI automatically applies biomechanical substitutions (e.g. Incline Dumbbell neutral press instead of straight barbell) to prevent shear stress while maintaining muscular tension.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Dietary Framework */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#1A1D1B]">Dietary Framework & Cuisine</h2>
                <p className="text-xs text-[#6B7280] mt-1">
                  Select your nutrition approach so we tailor protein sources and meal ideas to your lifestyle.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'non_veg', label: 'Non-Vegetarian', desc: 'Chicken, fish, eggs, dairy' },
                  { id: 'vegetarian', label: 'Vegetarian (Lacto)', desc: 'Paneer, whey, legumes, dairy' },
                  { id: 'eggetarian', label: 'Eggetarian', desc: 'Eggs, paneer, whey, plant foods' },
                  { id: 'vegan', label: 'Vegan (Plant)', desc: 'Tofu, soy, lentils, pea protein' },
                  { id: 'flexible', label: 'Flexible / Balanced', desc: 'All whole foods permitted' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDietType(item.id as DietType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      dietType === item.id
                        ? 'border-[#0F6E5F] bg-[#0F6E5F]/5 ring-1 ring-[#0F6E5F]'
                        : 'border-[#E5E7EB] bg-white hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <div className="font-bold text-xs text-[#1A1D1B]">{item.label}</div>
                    <div className="text-[10px] text-[#6B7280] mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#1A1D1B] mb-1">
                  Favorite Cuisine Style:
                </label>
                <select
                  value={cuisinePreference}
                  onChange={(e) => setCuisinePreference(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-white"
                >
                  <option value="High-Protein Global & Mediterranean">High-Protein Global & Mediterranean</option>
                  <option value="High-Protein Indian (Dal, Paneer, Chicken Curries)">High-Protein Indian</option>
                  <option value="High-Protein Plant-Based Asian & Mexican">Plant-Based Asian & Mexican</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 5: Plan Reveal & Scientific Timeline */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#0F6E5F] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#E8912D]" />
                  <span>Calculated Metabolic Output</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A1D1B]">
                  Your Science-Backed Roadmap
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Based on Mifflin-St Jeor BMR and your {trainingDaysPerWeek}-day training frequency.
                </p>
              </div>

              {/* Goal Timeline Reveal Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0F6E5F] to-[#0A4D42] text-white space-y-3">
                <div className="text-xs text-[#D1D5DB]">Projected Goal Achievement Date:</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#E8912D]">
                  {timelineResult.projectedDate} (~{timelineResult.weeksNeeded} weeks)
                </div>
                <div className="text-xs text-white/90">
                  Target change: {weightKg} kg → {targetWeightKg} kg at a safe rate of {Math.abs(macroResults.weeklyRateKg)} kg/week.
                </div>
              </div>

              {/* Calculated Targets Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#6B7280] uppercase font-bold">Daily Energy</div>
                  <div className="text-base font-bold text-[#1A1D1B] mt-0.5">
                    {macroResults.dailyCalories} <span className="text-xs font-normal">kcal</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#0F6E5F] uppercase font-bold">Protein (2.2g/kg)</div>
                  <div className="text-base font-bold text-[#0F6E5F] mt-0.5">
                    {macroResults.proteinG} <span className="text-xs font-normal">g</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#3B82F6] uppercase font-bold">Carbohydrates</div>
                  <div className="text-base font-bold text-[#3B82F6] mt-0.5">
                    {macroResults.carbsG} <span className="text-xs font-normal">g</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB]">
                  <div className="text-[10px] text-[#F59E0B] uppercase font-bold">Healthy Fats</div>
                  <div className="text-base font-bold text-[#F59E0B] mt-0.5">
                    {macroResults.fatG} <span className="text-xs font-normal">g</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t border-[#E5E7EB] bg-[#FAFAF8] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-xs font-semibold text-[#6B7280] hover:text-[#1A1D1B] px-3 py-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-semibold text-[#6B7280] hover:text-[#1A1D1B] px-3 py-2"
            >
              Cancel
            </button>
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F6E5F] text-white text-xs font-semibold hover:bg-[#0D5B4F] transition-all shadow-xs"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishOnboarding}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F6E5F] text-white text-xs sm:text-sm font-bold hover:bg-[#0D5B4F] transition-all shadow-md"
            >
              <Check className="w-4 h-4 text-[#E8912D]" />
              <span>Apply & Generate Program</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
