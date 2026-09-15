import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  RefreshCw, 
  Cookie, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Mail, 
  MapPin, 
  Building, 
  UserCheck, 
  Camera, 
  Database, 
  ArrowLeft,
  LogIn,
  Home,
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { ArohLogo } from './ArohLogo';
import { UserProfile } from '../types';
import { executeCompleteAccountDataErasure, DataDeletionSummary } from '../lib/dataDeletion';

export type LegalTabType = 'privacy' | 'terms' | 'disclaimer' | 'refund' | 'cookies' | 'delete-data';

interface LegalPageProps {
  activeTab: LegalTabType;
  onNavigate: (path: string) => void;
  userProfile?: UserProfile;
  currentUser?: any;
  onSignIn?: () => void;
  onCompleteDataErasure?: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  activeTab,
  onNavigate,
  userProfile,
  currentUser,
  onSignIn,
  onCompleteDataErasure,
}) => {
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionSummary, setDeletionSummary] = useState<DataDeletionSummary | null>(null);

  // Determine if a real user is currently signed in
  const signedInEmail = userProfile?.email?.trim() || currentUser?.email?.trim();
  const isAuthenticated = Boolean(signedInEmail && signedInEmail.includes('@'));

  const handleTabClick = (tab: LegalTabType, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(`/${tab}`);
  };

  const handleExecuteDelete = async () => {
    if (!isAuthenticated || !signedInEmail) {
      alert('You must be signed in to delete your account data.');
      return;
    }

    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      alert('Please type DELETE in capital letters to confirm permanent data wiping.');
      return;
    }

    const confirmed = window.confirm(
      `Are you absolutely certain? This will immediately and irreversibly delete all meal logs, workout history, body metrics, profile details, and cloud backups for ${signedInEmail} from Firestore, Google Drive, and local cache.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const summary = await executeCompleteAccountDataErasure(signedInEmail);
      setDeletionSummary(summary);
      setTimeout(() => {
        if (onCompleteDataErasure) {
          onCompleteDataErasure();
        } else {
          onNavigate('/');
        }
      }, 2500);
    } catch (err) {
      alert('An error occurred during data deletion. Please contact waradasare11@gmail.com for manual assistance.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#070707] text-[#1A1D1B] dark:text-[#E8ECE9] font-sans flex flex-col selection:bg-[#D4AF37]/20 selection:text-[#D4AF37] transition-colors duration-200">
      {/* Top Application Bar */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="flex items-center gap-3 cursor-pointer group"
              title="Return to AROH App"
            >
              <ArohLogo size="sm" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    AROH
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                    DPDP Act, 2023
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium -mt-0.5 hidden sm:inline">
                  Legal &amp; Compliance Center
                </span>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
                <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium max-w-[140px] truncate">{signedInEmail}</span>
              </div>
            ) : (
              onSignIn && (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-semibold text-gray-900 dark:text-white transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )
            )}

            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#A68523] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Go to App</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Page Title & Operator Overview Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                AROH Legal &amp; Compliance Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Operated by <strong>Warad Asare</strong> (AROH AI Technologies) • Pune, Maharashtra, India
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Pune, India</span>
            <span>•</span>
            <Mail className="w-3.5 h-3.5 text-amber-500" />
            <a href="mailto:waradasare11@gmail.com" className="text-amber-600 dark:text-amber-400 underline">
              waradasare11@gmail.com
            </a>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <nav
          className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-200/60 dark:bg-gray-800/60 mb-8 overflow-x-auto scrollbar-none"
          aria-label="Legal document tabs"
        >
          <a
            href="/privacy"
            onClick={(e) => handleTabClick('privacy', e)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-[#111111] text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </a>

          <a
            href="/terms"
            onClick={(e) => handleTabClick('terms', e)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-white dark:bg-[#111111] text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </a>

          <a
            href="/disclaimer"
            onClick={(e) => handleTabClick('disclaimer', e)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'bg-white dark:bg-[#111111] text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Medical Disclaimer</span>
          </a>

          <a
            href="/refund"
            onClick={(e) => handleTabClick('refund', e)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'refund'
                ? 'bg-white dark:bg-[#111111] text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refund Policy</span>
          </a>

          <a
            href="/cookies"
            onClick={(e) => handleTabClick('cookies', e)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'cookies'
                ? 'bg-white dark:bg-[#111111] text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookies &amp; Storage</span>
          </a>

          <a
            href="/delete-data"
            onClick={(e) => handleTabClick('delete-data', e)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'delete-data'
                ? 'bg-red-500/15 text-red-600 dark:text-red-400 shadow-xs border border-red-500/30'
                : 'text-red-600/80 dark:text-red-400/80 hover:text-red-600 dark:hover:text-red-400'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete My Data</span>
          </a>
        </nav>

        {/* Tab Content Display */}
        <div className="bg-white dark:bg-[#111111] p-6 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm leading-relaxed">
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">
                    AROH Privacy Policy
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Compliant with India's <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> &amp; Global Privacy Standards.
                  </p>
                </div>
                <div className="text-xs font-mono px-3 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 shrink-0">
                  Last Updated: September 2026
                </div>
              </div>

              <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-500" />
                    1. Data Fiduciary &amp; Operator Identification
                  </h3>
                  <p>
                    This application (<strong>AROH</strong>) is developed, operated, and maintained by <strong>Warad Asare</strong> (individual developer and sole proprietor trading as AROH AI Technologies), located in <strong>Pune, Maharashtra, India</strong>. Contact Email:{' '}
                    <a href="mailto:waradasare11@gmail.com" className="text-amber-600 dark:text-amber-400 font-semibold underline">
                      waradasare11@gmail.com
                    </a>.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-500" />
                    2. Categories of Personal Data We Collect
                  </h3>
                  <p>To provide personalized exercise programming, calorie estimation, and physiological tracking, we collect only the data you explicitly provide:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
                    <li><strong>Account Credentials:</strong> Full name, email address, optional Google account profile identifier.</li>
                    <li><strong>Physical &amp; Metabolic Baseline:</strong> Age, biological sex, height (cm), current body weight (kg), target weight, and optional estimated body fat percentage.</li>
                    <li><strong>Nutrition &amp; Meal History:</strong> Meal names, food descriptions, portion sizes, macronutrient breakdowns (calories, protein, carbohydrates, fats, fiber), and timestamps.</li>
                    <li><strong>Workout Logs &amp; Athletic Performance:</strong> Exercise names, sets, repetitions, resistance weight, RPE (rate of perceived exertion), notes, and completion timestamps.</li>
                    <li><strong>Photographs &amp; Media:</strong> Photos of food and meals you snap or upload specifically for AI vision calorie estimation, and optional exercise pose recordings for biomechanical form correction.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-500" />
                    3. Purpose &amp; Scoped Use of Camera &amp; Microphone
                  </h3>
                  <p>
                    <strong>Camera Access:</strong> Utilized exclusively when you actively choose to snap a photo of your meal for nutritional analysis, or when you record an exercise set for biomechanical joint-angle feedback. Photos are processed ephemerally through AI models and are never shared publicly.
                  </p>
                  <p>
                    <strong>Microphone Access:</strong> Utilized strictly for voice-guided hands-free meal logging or speech-to-text workout notes when explicitly activated by you. We do <em>not</em> run continuous background listening or ambient audio surveillance.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    4. Data Processors &amp; Hosting Locations
                  </h3>
                  <p>We work with vetted tier-1 cloud infrastructure providers:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
                    <li><strong>Google Cloud Platform &amp; Firebase:</strong> Used for secure user authentication, Firestore database persistence, and optional personal Google Drive automated backups. Data is hosted in secured data centers located in <strong>India (asia-south1)</strong> and the <strong>United States</strong>.</li>
                    <li><strong>Google Gemini AI:</strong> Used to run multimodal computer vision inference on food photos and exercise biomechanics. Data sent to Gemini is encrypted in transit (TLS 1.3) and at rest (AES-256).</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    5. Strict No-Sale Guarantee
                  </h3>
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 font-semibold text-xs sm:text-sm">
                    We NEVER sell, rent, lease, monetize, or trade your personal health stats, meal images, workouts, or contact information to data brokers, advertising agencies, or pharmaceutical companies. Your data exists solely to serve your athletic development.
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-500" />
                    6. Your Rights Under DPDP Act, 2023
                  </h3>
                  <p>Under Indian privacy legislation, you maintain sovereign control over your data:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
                    <li><strong>Right to Access &amp; Export:</strong> You can export all your logs anytime in standard CSV format or JSON backup via the "Export CSV" tool or Google Drive backup sync.</li>
                    <li><strong>Right to Correction:</strong> You can edit any profile attribute, meal log, or workout entry directly within the application.</li>
                    <li><strong>Right to Erasure (Delete My Data):</strong> You can wipe all data across Firestore, localStorage, and Drive at any time via the "Delete My Data" tab in this portal.</li>
                    <li><strong>Right to Grievance Redressal:</strong> Direct all privacy concerns to our Grievance Officer: <strong>Warad Asare</strong> at <a href="mailto:waradasare11@gmail.com" className="text-amber-600 dark:text-amber-400 underline">waradasare11@gmail.com</a>. We respond to all statutory inquiries within 7 business days.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">7. Data Retention</h3>
                  <p>
                    We retain your workout and meal records for as long as your account remains active so you can track longitudinal periodization trends. If you delete your account or request data wiping, all records are permanently deleted from active Firestore instances and local caches immediately.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">
                  Terms of Service &amp; User Agreement
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Please read these terms carefully before utilizing AROH coaching tools.
                </p>
              </div>

              <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">1. Agreement to Terms</h3>
                  <p>
                    By creating an account, completing onboarding, or using AROH, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must refrain from using the platform.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">2. 7-Day Free Trial</h3>
                  <p>
                    New users receive full, unrestricted access to AROH Pro features for an initial period of <strong>7 consecutive days</strong> starting from their first profile setup date. No credit card or automated recurring mandate is required to start your trial.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">3. Paid Subscription Plans &amp; Payments</h3>
                  <p>
                    Following your free trial, continued access to automated AI meal scanning, biomechanical computer vision, and adaptive periodization requires an active subscription:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
                    <li>Available billing tiers include: 1 Month Pro (₹89), 3 Months Transformation (₹239), 6 Months Elite (₹479), 1 Year Master (₹919), 2 Years (₹1,820), 3 Years (₹2,700), and Lifetime access.</li>
                    <li>Payments are securely processed via authorized Indian payment gateways (including Razorpay, UPI, cards, and net banking).</li>
                    <li>Subscriptions are one-time prepayments for the stated duration; there are no hidden recurring auto-debits without your explicit UPI mandate consent.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">4. 48-Hour Cancellation &amp; Refund Limit</h3>
                  <p>
                    All paid subscriptions include a <strong>48-hour satisfaction guarantee</strong>. You may request a full refund within 48 hours of purchase by contacting <a href="mailto:waradasare11@gmail.com" className="text-amber-600 dark:text-amber-400 underline">waradasare11@gmail.com</a>. <strong>No refunds will be granted after 48 hours</strong> from payment confirmation, except where mandated by applicable Indian consumer protection laws.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">5. Acceptable Use Policy</h3>
                  <p>You agree not to:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
                    <li>Use automated scripts, bots, or scrapers to extract AI workouts, exercise databases, or meal predictions.</li>
                    <li>Upload abusive, illegal, sexually explicit, or infringing imagery through the meal/form scanner.</li>
                    <li>Share your account credentials or attempt to bypass cryptographic subscription checks and host security PINs.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">6. Account Termination</h3>
                  <p>
                    We reserve the right to suspend or terminate accounts that breach these Terms, engage in payment fraud, or abuse server computational resources, without prior notice or refund.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">7. Governing Law &amp; Jurisdiction</h3>
                  <p>
                    These Terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Pune, Maharashtra, India</strong>.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* TAB 3: MEDICAL DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-lg mb-1">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  Mandatory Medical &amp; Health Disclaimer
                </div>
                <p className="text-xs text-amber-900/80 dark:text-amber-300/80">
                  Read this before undertaking any exercise program or dietary modification.
                </p>
              </div>

              {/* Exact user requirement quote banner */}
              <div className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border-l-4 border-amber-500 text-gray-900 dark:text-gray-100 font-medium text-xs sm:text-sm leading-relaxed shadow-2xs">
                “AROH is a fitness tracking and education tool, not a doctor, dietitian, or physiotherapist. Meal calorie estimates can be wrong. Workout and form tips are general guidance. If you are under 18, have an injury, or a medical condition, get a parent/guardian and a qualified professional involved before you train or change how you eat.”
              </div>

              <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">1. Not Medical, Dietetic, or Clinical Advice</h3>
                  <p>
                    The information, meal suggestions, caloric calculations, macronutrient splits, and workout routines provided by AROH are generated algorithmically for educational and recreational fitness tracking purposes only. AROH does <strong>not</strong> provide medical diagnoses, treatment plans, clinical nutrition prescriptions, or physiotherapy rehabilitation.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">2. Inherent Margins of Error in Caloric &amp; Vision Estimation</h3>
                  <p>
                    Caloric numbers and macronutrient counts generated by AI computer vision analysis from food photos are statistical approximations based on visual volume, shape, and ingredient likelihood. Cooking methods, deep frying, hidden sugars, sodium, and specific oil volumes cannot be measured with laboratory precision through photography. Do not rely on AROH calculations for clinical management of conditions such as Type 1 diabetes, kidney disease, or severe food allergies.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">3. Exercise &amp; Biomechanical Safety</h3>
                  <p>
                    Weightlifting, resistance training, and cardiovascular exercise carry inherent risks of physical injury, including sprains, tears, cardiovascular stress, and joint damage. Automated form analysis cues are general educational references and cannot replace the in-person supervision of an accredited strength coach or sports physiotherapist. Always warm up thoroughly, use appropriate safety spotters, and stop immediately if you experience pain, dizziness, or shortness of breath.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">4. Minors &amp; Pre-Existing Medical Conditions</h3>
                  <p>
                    If you are under 18 years old, pregnant, breastfeeding, recovering from surgery, or managing a chronic medical condition (including heart disease, hypertension, eating disorders, or orthopedic injuries), you must obtain explicit clearance from your personal physician and parent/guardian before implementing any caloric deficit, surplus, or intense physical training.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* TAB 4: REFUND POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">
                  Simple &amp; Transparent Refund Policy
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  We believe in fair, straightforward, and honorable business conduct.
                </p>
              </div>

              <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">1. The 48-Hour Money-Back Guarantee</h3>
                  <p>
                    When you purchase any paid AROH Pro subscription plan (1 Month, 3 Months, 6 Months, 1 Year, 2 Years, 3 Years, or Lifetime), you are covered by our <strong>48-hour satisfaction guarantee</strong>. If you feel AROH is not the right fit for your training, simply request a refund within 48 hours of your payment.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">2. After the 48-Hour Window</h3>
                  <p>
                    Because AROH offers an unconditional 7-day free trial prior to purchase plus the 48-hour post-purchase refund window, <strong>no refunds or prorated credits are provided after 48 hours</strong> from payment, except where required by applicable statutory Indian consumer protection laws.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">3. How to Request a Refund</h3>
                  <p>To request your refund within the 48-hour window:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Send an email from your registered AROH email address to <a href="mailto:waradasare11@gmail.com" className="text-amber-600 dark:text-amber-400 underline font-semibold">waradasare11@gmail.com</a>.</li>
                    <li>Include the subject line: <code className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[11px] font-mono">Refund Request - [Your Name]</code>.</li>
                    <li>Provide your 12-digit UPI UTR reference number or payment transaction ID and your registered phone number / UPI VPA.</li>
                  </ol>
                  <p className="pt-1">
                    Once verified, refunds are credited back to your originating bank account or UPI ID within <strong>5 to 7 business days</strong>.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">4. 7-Day Free Trial Notice</h3>
                  <p>
                    The 7-day free trial does not charge your payment method. If you decide not to purchase a plan at the end of the trial, no payment is collected, and no refund request is necessary.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* TAB 5: COOKIES & STORAGE */}
          {activeTab === 'cookies' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                <h2 className="font-extrabold text-gray-900 dark:text-white text-lg">
                  Cookie &amp; Local Storage Notice
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  How we store your local preferences and performance metrics securely.
                </p>
              </div>

              <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">1. Essential Local Storage</h3>
                  <p>
                    AROH is built as an offline-first progressive web application. We use browser <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">localStorage</code> and <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">IndexedDB</code> to store:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
                    <li>Your athlete profile settings, height, weight, and target body metrics.</li>
                    <li>Local copies of your meal logs and workout logs for instant access even without an active internet connection.</li>
                    <li>Security tokens and session timestamps to maintain login state.</li>
                    <li>Dark/light visual theme preferences.</li>
                  </ul>
                  <p>These local items are essential for the operation of the app and cannot be turned off.</p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">2. Analytics &amp; Performance Telemetry</h3>
                  <p>
                    We collect aggregate, anonymized latency metrics (such as Gemini API response times, frame processing speed, and error rates) to maintain platform stability. We do not use intrusive cross-site third-party tracking cookies or sell your browsing history to advertising networks.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">3. Managing Local Data</h3>
                  <p>
                    You can clear your cached browser storage anytime directly in your browser settings or by utilizing the automated <strong>"Delete My Data"</strong> tool in the next tab.
                  </p>
                </section>
              </div>
            </div>
          )}

          {/* TAB 6: DELETE MY DATA */}
          {activeTab === 'delete-data' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-300">
                <div className="flex items-center gap-2 font-bold text-base sm:text-lg mb-1">
                  <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
                  Account Erasure &amp; Complete Data Deletion
                </div>
                <p className="text-xs text-red-800/80 dark:text-red-300/80">
                  Exercising your Right to Erasure under Section 12 of India's Digital Personal Data Protection Act, 2023.
                </p>
              </div>

              {/* Requirement 3: If logged out, show "Sign in to delete your data" */}
              {!isAuthenticated ? (
                <div className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-center space-y-4 max-w-lg mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Sign In to Delete Your Data
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      To exercise your Right to Erasure under Section 12 of the DPDP Act, 2023, you must sign in first. We require your account authentication so we know exactly which Gmail ID, Firestore records, and Google Drive backups to wipe.
                    </p>
                  </div>

                  {onSignIn ? (
                    <button
                      type="button"
                      onClick={onSignIn}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#A68523] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In with Google to Delete Data</span>
                    </button>
                  ) : (
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate('/');
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#A68523] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Open App to Sign In</span>
                    </a>
                  )}

                  <p className="text-[11px] text-gray-500 dark:text-gray-500 italic pt-1">
                    If you have never signed in or created an account, no personal data or cloud records exist on our servers.
                  </p>
                </div>
              ) : deletionSummary ? (
                <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-amber-500 mx-auto" />
                  <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">
                    All User Data Has Been Permanently Erased
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto space-y-1">
                    <p>✓ Firestore cloud records deleted: {deletionSummary.firestoreWiped ? 'Yes' : 'None found'}</p>
                    <p>✓ Google Drive backup files purged: {deletionSummary.driveBackupsPurged ? 'Yes' : 'None found'}</p>
                    <p>✓ Local browser storage &amp; cache wiped: Yes</p>
                  </div>
                  <p className="text-xs text-gray-500 italic pt-2">
                    Reloading application in clean guest state...
                  </p>
                </div>
              ) : (
                <div className="space-y-6 text-xs sm:text-sm">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-white">Active Account to be Wiped:</h3>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-200">
                        {signedInEmail}
                      </span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                      <li>All your meal logs, food photos, and nutritional histories.</li>
                      <li>All workout programs, exercise logs, sets, reps, and PR records.</li>
                      <li>Body weight and metabolic timeline check-in histories.</li>
                      <li>Biomechanical form analysis scores and videos.</li>
                      <li>Firestore cloud database records under your user ID.</li>
                      <li>Automated backup spreadsheets and JSON dumps in your connected Google Drive folder.</li>
                      <li>Local browser storage keys, credentials, and cached sessions.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-3">
                    <label className="block text-xs font-bold text-red-700 dark:text-red-400">
                      Type <span className="font-mono bg-red-500/20 px-1.5 py-0.5 rounded text-red-800 dark:text-red-200">DELETE</span> in capital letters to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full text-sm p-3.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-[#070707] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                    />

                    <button
                      type="button"
                      disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
                      onClick={handleExecuteDelete}
                      className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isDeleting ? 'Erasing All Records...' : 'Permanently Delete My Data & Account'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] py-8 mt-auto text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>Pune, Maharashtra, India</span>
            <span>•</span>
            <Mail className="w-3.5 h-3.5 text-amber-500" />
            <a href="mailto:waradasare11@gmail.com" className="hover:underline text-amber-600 dark:text-amber-400">
              waradasare11@gmail.com
            </a>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href="/privacy"
              onClick={(e) => handleTabClick('privacy', e)}
              className="hover:text-amber-500 transition-colors"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="/terms"
              onClick={(e) => handleTabClick('terms', e)}
              className="hover:text-amber-500 transition-colors"
            >
              Terms of Service
            </a>
            <span>•</span>
            <a
              href="/disclaimer"
              onClick={(e) => handleTabClick('disclaimer', e)}
              className="hover:text-amber-500 transition-colors"
            >
              Medical Disclaimer
            </a>
            <span>•</span>
            <a
              href="/refund"
              onClick={(e) => handleTabClick('refund', e)}
              className="hover:text-amber-500 transition-colors"
            >
              Refund Policy
            </a>
            <span>•</span>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="font-bold text-amber-500 hover:underline"
            >
              Open AROH App →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
