import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  FlipHorizontal, 
  CheckCircle, 
  AlertCircle, 
  Utensils, 
  Flame, 
  History,
  Trash2
} from 'lucide-react';
import { AIAnalysisResult, MealLog, UserProfile } from '../types';
import { MealAnalysisResultCard } from './MealAnalysisResultCard';

interface MealCameraScannerProps {
  userProfile: UserProfile;
  mealLogs: MealLog[];
  onSaveMealLog: (log: MealLog) => void;
  onDeleteMealLog: (id: string) => void;
}

// Preset meal sample images for instant 1-click test drive
const PRESET_SAMPLE_MEALS = [
  {
    title: 'Grilled Salmon with Quinoa & Asparagus',
    type: 'High Protein / Lean Fat',
    url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'High-Protein Paneer Tikka & Sprout Salad',
    type: 'Vegetarian High Protein',
    url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Grilled Chicken Breast, Brown Rice & Broccoli',
    type: 'Classic Bodybuilder Cut',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Protein Oatmeal Bowl with Almonds & Berries',
    type: 'Pre-Workout Breakfast',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
  },
];

export const MealCameraScanner: React.FC<MealCameraScannerProps> = ({
  userProfile,
  mealLogs,
  onSaveMealLog,
  onDeleteMealLog,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customPromptNote, setCustomPromptNote] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize or terminate camera stream
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraActive, facingMode]);

  const startCamera = async () => {
    try {
      stopCamera();
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMessage('Camera access was denied or not available. Please upload a photo or pick a sample meal below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      setIsCameraActive(false);
      triggerAIAnalysis(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      setIsCameraActive(false);
      triggerAIAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetMeal = async (preset: typeof PRESET_SAMPLE_MEALS[0]) => {
    try {
      setIsAnalyzing(true);
      setAnalysisProgress('Loading preset meal image...');
      setErrorMessage(null);

      // Fetch the image and convert to base64
      const response = await fetch(preset.url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setCapturedImage(base64data);
        triggerAIAnalysis(base64data);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load preset meal', err);
      setErrorMessage('Failed to load preset image. Please try uploading an image directly.');
      setIsAnalyzing(false);
    }
  };

  const triggerAIAnalysis = async (imageBase64: string) => {
    try {
      setIsAnalyzing(true);
      setErrorMessage(null);
      setAnalysisResult(null);

      // Progressive status updates to keep user engaged
      setAnalysisProgress('Detecting ingredients & food items...');
      const timer1 = setTimeout(() => {
        setAnalysisProgress('Estimating portion weights & volumetric density...');
      }, 1200);

      const timer2 = setTimeout(() => {
        setAnalysisProgress('Evaluating goal alignment & macro targets...');
      }, 2500);

      const res = await fetch('/api/ai/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: 'image/jpeg',
          userProfile: {
            goal: userProfile.goal,
            weightKg: userProfile.weightKg,
            targetWeightKg: userProfile.targetWeightKg,
            bodyFatPct: userProfile.bodyFatPct,
            dailyCalories: userProfile.dailyCalories,
            dailyProtein: userProfile.dailyProtein,
            dietType: userProfile.dietType,
            allergies: userProfile.allergies,
          },
          customNotes: customPromptNote,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'AI Analysis failed');
      }

      setAnalysisResult(data.data);
    } catch (err: any) {
      console.error('Error during AI meal analysis:', err);
      setErrorMessage(`Gemini Vision analysis error: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setIsCameraActive(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-[#0F6E5F] to-[#0A4D42] text-white p-6 sm:p-8 rounded-2xl shadow-sm text-left relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#E8912D] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Vision AI • Sub-10s Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Snap Your Meal, Get Science-Backed Nutrition
          </h1>
          <p className="text-sm sm:text-base text-[#D1D5DB] mt-2">
            Photograph your plate. Our AI vision instantly estimates portion grams, calories, and macros, then provides evidence-based tweaks to optimize your meal for {userProfile.goal === 'lose_fat' ? 'maximum fat loss & satiety' : userProfile.goal === 'build_muscle' ? 'muscle protein synthesis & growth' : 'body recomposition'}.
          </p>
        </div>
      </div>

      {/* Main Scanner Section */}
      {!analysisResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera / Upload Container (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#161817] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#0F6E5F] dark:text-[#2DD4BF]" />
                <h2 className="font-bold text-base text-[#1A1D1B] dark:text-[#E8ECE9]">Meal Camera & Capture</h2>
              </div>
              {isCameraActive && (
                <button
                  onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                  className="flex items-center gap-1 text-xs text-[#0F6E5F] dark:text-[#2DD4BF] font-semibold hover:underline"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  Flip Camera
                </button>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#DC2626]/10 dark:bg-[#DC2626]/20 border border-[#DC2626]/20 dark:border-[#DC2626]/30 text-[#DC2626] dark:text-red-400 text-xs flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Viewport: Live Camera Feed OR Preview OR Placeholder */}
            <div className="relative aspect-4/3 w-full bg-[#1A1D1B] dark:bg-[#111312] rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-[#242826] flex items-center justify-center">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-[#0F6E5F]/30 dark:border-[#2DD4BF]/30 border-t-[#E8912D] animate-spin" />
                    <Sparkles className="w-6 h-6 text-[#E8912D] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">Analyzing Meal with Gemini</h3>
                    <p className="text-xs text-[#9CA3AF] mt-1">{analysisProgress || 'Extracting nutritional data...'}</p>
                  </div>
                </div>
              ) : isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Camera Reticle Overlay */}
                  <div className="absolute inset-8 border-2 border-white/40 border-dashed rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="bg-black/60 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-xs">
                      Center your meal inside the frame
                    </span>
                  </div>
                </>
              ) : capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured meal"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 dark:bg-white/5 text-white flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8 text-[#0F6E5F] dark:text-[#2DD4BF]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm sm:text-base">Camera is Ready</h3>
                    <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto mt-1">
                      Start live camera feed or upload a photo of your meal from your device.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {isCameraActive ? (
                <>
                  <button
                    onClick={capturePhoto}
                    disabled={isAnalyzing}
                    className="px-8 py-3 rounded-full bg-[#E8912D] text-white font-bold text-sm shadow-md hover:bg-[#D97D1A] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture & Analyze</span>
                  </button>
                  <button
                    onClick={() => setIsCameraActive(false)}
                    className="px-5 py-3 rounded-full bg-[#F3F4F6] dark:bg-[#2A2E2C] text-[#4B5563] dark:text-[#E8ECE9] text-xs font-semibold hover:bg-[#E5E7EB] dark:hover:bg-[#343A37] cursor-pointer"
                  >
                    Cancel Camera
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsCameraActive(true)}
                    disabled={isAnalyzing}
                    className="px-6 py-3 rounded-xl bg-[#0F6E5F] text-white font-semibold text-xs sm:text-sm hover:bg-[#0D5B4F] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#E8912D]" />
                    <span>Open Camera</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="px-6 py-3 rounded-xl bg-white dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#1A1D1B] dark:text-[#E8ECE9] font-semibold text-xs sm:text-sm hover:bg-[#F9FAFB] dark:hover:bg-[#242826] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#0F6E5F] dark:text-[#2DD4BF]" />
                    <span>Upload Meal Photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Optional Custom Context / Notes before scanning */}
            <div className="mt-4 pt-4 border-t border-[#E5E7EB] dark:border-[#242826] text-left">
              <label className="block text-xs font-semibold text-[#1A1D1B] dark:text-[#E8ECE9] mb-1">
                Optional Ingredients Hint (e.g., "Used olive oil spray, 1 tbsp peanut butter"):
              </label>
              <input
                type="text"
                placeholder="Give Gemini extra context for even sharper accuracy..."
                value={customPromptNote}
                onChange={(e) => setCustomPromptNote(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#2A2E2C] bg-[#FAFAF8] dark:bg-[#111312] text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-none focus:ring-1 focus:ring-[#0F6E5F] dark:focus:ring-[#2DD4BF]"
              />
            </div>
          </div>

          {/* Quick Preset Meals for Instant Testing (1 col) */}
          <div className="bg-white dark:bg-[#161817] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs text-left flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#E8912D]" />
                <h3 className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9]">Quick Test Samples</h3>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mb-4">
                No camera handy? Tap any evidence-based meal below to test Gemini Vision analysis immediately:
              </p>

              <div className="space-y-3">
                {PRESET_SAMPLE_MEALS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPresetMeal(preset)}
                    disabled={isAnalyzing}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#242826] hover:border-[#0F6E5F] dark:hover:border-[#2DD4BF] hover:bg-[#0F6E5F]/5 dark:hover:bg-[#0F6E5F]/15 transition-all text-left group cursor-pointer"
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-12 h-12 rounded-lg object-cover border border-[#E5E7EB] dark:border-[#242826] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-[#1A1D1B] dark:text-[#E8ECE9] truncate group-hover:text-[#0F6E5F] dark:group-hover:text-[#2DD4BF]">
                        {preset.title}
                      </div>
                      <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">{preset.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#111312] border border-[#E5E7EB] dark:border-[#242826] text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
              💡 <strong>Evidence-Based Tip:</strong> Research shows tracking meals with visual portion feedback improves long-term dietary adherence by over 40% compared to tedious manual search logging.
            </div>
          </div>
        </div>
      ) : (
        /* Results Section */
        <MealAnalysisResultCard
          analysis={analysisResult}
          imagePreviewUrl={capturedImage || ''}
          userProfile={userProfile}
          onSaveMeal={(log) => {
            onSaveMealLog(log);
            handleReset();
          }}
          onDiscard={handleReset}
        />
      )}

      {/* Recent Meal Logs History */}
      <div className="bg-white dark:bg-[#161817] p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs text-left transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#0F6E5F] dark:text-[#2DD4BF]" />
            <h3 className="font-bold text-base text-[#1A1D1B] dark:text-[#E8ECE9]">Today's Logged Meals</h3>
          </div>
          <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">{mealLogs.length} logged items</span>
        </div>

        {mealLogs.length === 0 ? (
          <div className="text-center py-8 text-[#9CA3AF] dark:text-[#6B7280] text-xs">
            No meals logged today yet. Snap a meal above to start tracking!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#111312] border border-[#E5E7EB] dark:border-[#242826] flex items-start gap-4 justify-between"
              >
                {log.photoUrl && (
                  <img
                    src={log.photoUrl}
                    alt={log.mealTitle}
                    className="w-16 h-16 rounded-lg object-cover border border-[#E5E7EB] dark:border-[#242826] shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#2DD4BF]">
                      {log.mealType}
                    </span>
                    <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">{log.time}</span>
                  </div>
                  <div className="font-bold text-sm text-[#1A1D1B] dark:text-[#E8ECE9] truncate mt-1">
                    {log.mealTitle}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold mt-1 flex-wrap">
                    <span className="text-[#E8912D]">{log.calories} kcal</span>
                    <span className="text-[#6B7280] dark:text-[#4B5563]">•</span>
                    <span className="text-[#0F6E5F] dark:text-[#2DD4BF]">{log.proteinG}g P</span>
                    <span className="text-[#6B7280] dark:text-[#4B5563]">•</span>
                    <span className="text-[#3B82F6] dark:text-[#60A5FA]">{log.carbsG}g C</span>
                    <span className="text-[#6B7280] dark:text-[#4B5563]">•</span>
                    <span className="text-[#F59E0B] dark:text-[#FBBF24]">{log.fatG}g F</span>
                    {log.fiberG ? (
                      <>
                        <span className="text-[#6B7280] dark:text-[#4B5563]">•</span>
                        <span className="text-[#16A34A] dark:text-[#4ADE80]">{log.fiberG}g Fiber</span>
                      </>
                    ) : null}
                  </div>
                  {log.userNotes && (
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-1 truncate">{log.userNotes}</p>
                  )}
                </div>

                <button
                  onClick={() => onDeleteMealLog(log.id)}
                  className="text-[#9CA3AF] hover:text-[#DC2626] dark:hover:text-red-400 p-1 transition-colors cursor-pointer"
                  title="Delete log entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
