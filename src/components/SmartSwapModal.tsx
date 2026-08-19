import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  Dumbbell, 
  Zap, 
  AlertCircle, 
  RefreshCw, 
  X, 
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Exercise, UserProfile, ExerciseSmartSwapOption, SmartSwapResponse } from '../types';

interface SmartSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExercise: Exercise | null;
  userProfile: UserProfile;
  onApplySwap: (originalExerciseId: string, swap: ExerciseSmartSwapOption) => void;
}

export const SmartSwapModal: React.FC<SmartSwapModalProps> = ({
  isOpen,
  onClose,
  currentExercise,
  userProfile,
  onApplySwap,
}) => {
  const [swapReason, setSwapReason] = useState<string>('Equipment Busy / Unavailable');
  const [availableEquipment, setAvailableEquipment] = useState<string>('Dumbbells & Adjustable Bench');
  const [specificDiscomfort, setSpecificDiscomfort] = useState<string>(
    userProfile.injuries && userProfile.injuries.length > 0 ? userProfile.injuries.join(', ') : ''
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [swapResponse, setSwapResponse] = useState<SmartSwapResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentExercise) return null;

  const handleFetchSmartSwaps = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/smart-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentExercise,
          userProfile,
          swapReason,
          availableEquipment,
          specificDiscomfortLocation: specificDiscomfort,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setSwapResponse(data.data);
      } else {
        throw new Error(data.error || 'Failed to generate swap suggestions');
      }
    } catch (err: any) {
      console.error('Smart Swap Error:', err);
      setErrorMsg(err.message || 'Error generating Smart Swap recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSwap = (swap: ExerciseSmartSwapOption) => {
    onApplySwap(currentExercise.id, swap);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#161817] rounded-3xl max-w-2xl w-full border border-[#E5E7EB] dark:border-[#242826] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#242826] flex items-start justify-between gap-4 bg-gray-50/50 dark:bg-[#1C1F1D]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F6E5F] text-white flex items-center justify-center shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F6E5F] dark:text-[#5FD1B8]">
                  AI Smart Swap
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#5FD1B8] font-bold">
                  Gemini 3.7 Biomechanics
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                Swap Alternative for {currentExercise.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#1A1D1B] dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* User Injury Shield Banner */}
          {userProfile.injuries && userProfile.injuries.length > 0 ? (
            <div className="p-3.5 rounded-2xl bg-[#E8912D]/10 dark:bg-[#E8912D]/15 border border-[#E8912D]/20 dark:border-[#E8912D]/30 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-[#E8912D] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                  Active Injury Safeguards Detected:{' '}
                </span>
                <span className="text-[#9A5B0F] dark:text-amber-300">
                  {userProfile.injuries.join(', ')}
                </span>
                {userProfile.injuryNotes && (
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
                    Note: {userProfile.injuryNotes}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Zero joint injuries documented. All kinematic load profiles accessible.</span>
            </div>
          )}

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Swap Reason Selector */}
            <div>
              <label className="block text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1.5">
                Why do you want to swap?
              </label>
              <select
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-white dark:bg-[#1E201F] text-[#1A1D1B] dark:text-[#E8ECE9] focus:ring-1 focus:ring-[#0F6E5F]"
              >
                <option value="Equipment Busy / Unavailable">Equipment Busy / Occupied (Rack/Machine)</option>
                <option value="Joint Pain / Discomfort Flare-Up">Joint Discomfort / Flare-Up</option>
                <option value="Home / Minimalist Setup">Home / Hotel / Minimalist Setup</option>
                <option value="Lengthened Muscle Position Focus">Targeting Lengthened Position / Stretch</option>
                <option value="Variety / Progression Plateau">Progression Plateau / Variety</option>
              </select>
            </div>

            {/* Available Equipment Selector */}
            <div>
              <label className="block text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1.5">
                Available Equipment Right Now:
              </label>
              <select
                value={availableEquipment}
                onChange={(e) => setAvailableEquipment(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-white dark:bg-[#1E201F] text-[#1A1D1B] dark:text-[#E8ECE9] focus:ring-1 focus:ring-[#0F6E5F]"
              >
                <option value="Dumbbells & Adjustable Bench">Dumbbells & Adjustable Bench</option>
                <option value="Cable Machine & Attachments">Cable Machine & Attachments</option>
                <option value="Full Commercial Gym Machines">Full Commercial Gym Machines</option>
                <option value="Barbells & Plates Only">Barbells & Plates Only</option>
                <option value="Bodyweight & Resistance Bands">Bodyweight & Resistance Bands</option>
              </select>
            </div>
          </div>

          {/* Specific Joint Discomfort Input */}
          <div>
            <label className="block text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1.5">
              Specific Joint Discomfort or Safety Note (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Mild lower back fatigue, avoid deep shoulder extension"
              value={specificDiscomfort}
              onChange={(e) => setSpecificDiscomfort(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-white dark:bg-[#1E201F] text-[#1A1D1B] dark:text-[#E8ECE9] focus:ring-1 focus:ring-[#0F6E5F]"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleFetchSmartSwaps}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#0F6E5F] hover:bg-[#0C584C] disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditing Biomechanical Replacements...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#E8912D]" />
                <span>Find Evidence-Based Smart Swaps</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* Swap Results Section */}
          {swapResponse && (
            <div className="space-y-4 pt-2">
              {/* AI Safeguard Summary */}
              <div className="p-4 rounded-2xl bg-[#0F6E5F]/5 dark:bg-[#0F6E5F]/15 border border-[#0F6E5F]/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F6E5F] dark:text-[#5FD1B8]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Biomechanical & Injury Rationale</span>
                </div>
                <p className="text-xs text-[#525B56] dark:text-[#CBD5E1] leading-relaxed">
                  {swapResponse.injurySafeguardSummary || swapResponse.reasonSummary}
                </p>
              </div>

              {/* Swaps Cards List */}
              <div className="space-y-3">
                {swapResponse.swaps.map((swap, idx) => (
                  <div
                    key={swap.id || idx}
                    className="p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] bg-white dark:bg-[#1E201F] hover:border-[#0F6E5F] dark:hover:border-[#5FD1B8] shadow-xs space-y-3 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            {swap.matchPercentage}% Muscle Stimulus Match
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#5FD1B8]">
                            {swap.equipment}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1">
                          {swap.name}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleSelectSwap(swap)}
                        className="px-4 py-2 rounded-xl bg-[#0F6E5F] hover:bg-[#0C584C] text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Swap Into Workout</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#161817] border border-gray-100 dark:border-[#242826]">
                        <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] block mb-0.5">
                          Prescription:
                        </span>
                        <span className="text-[#0F6E5F] dark:text-[#5FD1B8] font-bold">
                          {swap.prescribedSetsReps}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#161817] border border-gray-100 dark:border-[#242826]">
                        <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] block mb-0.5">
                          Joint Safety Profile:
                        </span>
                        <span className="text-[#E8912D] font-bold">
                          {swap.jointSafetyRating}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-[#525B56] dark:text-[#9EA8A2]">
                      <p>
                        <strong className="text-[#1A1D1B] dark:text-[#E8ECE9]">Hypertrophy Match:</strong>{' '}
                        {swap.biomechanicalRationale}
                      </p>
                      <p>
                        <strong className="text-[#1A1D1B] dark:text-[#E8ECE9]">Injury Protection:</strong>{' '}
                        {swap.howItAddressesInjury}
                      </p>
                      <p className="text-[#0F6E5F] dark:text-[#5FD1B8] font-medium">
                        <strong>Execution Cue:</strong> {swap.setupCue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
