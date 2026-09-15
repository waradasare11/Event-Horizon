import React, { useState } from 'react';
import { 
  Camera, 
  Sliders, 
  Sun, 
  ShieldCheck, 
  Database, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ArrowRight, 
  LogIn, 
  Sparkles,
  Info,
  Lock,
  Flame,
  Utensils,
  Dumbbell
} from 'lucide-react';
import { ArohLogo } from './ArohLogo';

interface LandingPageProps {
  onSignIn: () => void;
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  onNavigate,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const pricingTiers = [
    {
      id: 'trial',
      name: '7-Day Free Trial',
      price: '₹0',
      period: '7 days',
      badge: 'Start Here',
      description: 'Full Pro features with no credit card or payment mandate required upfront.',
      features: [
        'AI camera plate scanner & geometry estimation',
        'Official ICMR-IFCT & USDA per-100g database tables',
        'One-tap cooked gram portion sliders',
        'Workout builder & progressive overload logger',
        'Optional Google Drive cloud backup (connect from Settings)',
      ],
      cta: 'Start 7-Day Free Trial',
      primary: false,
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: '₹89',
      period: 'per month',
      badge: 'Flexible',
      description: 'One-time month pass for athletes seeking flexible monthly coaching.',
      features: [
        'Everything in Free Trial',
        'Unlimited meal scans & macro calculations',
        'Evidence-based hypertrophy & strength splits',
        'AI form biomechanics analysis',
        'One-time payment • No auto-debit surprise',
      ],
      cta: 'Choose Monthly',
      primary: false,
    },
    {
      id: 'quarterly',
      name: 'Quarterly Transformation',
      price: '₹239',
      period: 'for 3 months',
      badge: 'Save 11% • Most Popular',
      description: 'The complete 12-week physique recomposition and strength cycle.',
      features: [
        'Everything in Monthly Plan',
        '12-week progressive hypertrophy periodization',
        'Continuous macro recalibration for fat loss/hypertrophy',
        'Full exercise library & video biomechanics check',
        '₹79.60/month effective rate',
      ],
      cta: 'Choose Quarterly',
      primary: true,
    },
    {
      id: 'yearly',
      name: 'Yearly Championship',
      price: '₹919',
      period: 'for 12 months',
      badge: 'Save 14%',
      description: 'Long-term athletic mastery and periodized seasonal nutrition.',
      features: [
        'Everything in Quarterly Plan',
        'Full 52-week periodized training cycles',
        'Continuous historical data & export capabilities',
        'Priority support & early access to new database updates',
        '₹76.58/month effective rate',
      ],
      cta: 'Choose Yearly',
      primary: false,
    },
  ];

  const faqs = [
    {
      q: 'Is AROH a doctor or medical provider?',
      a: 'No. AROH provides mathematical nutrition tracking and evidence-based resistance training tools based on peer-reviewed sports science and official food composition tables. It does not diagnose, treat, prevent disease, or prescribe therapeutic clinical diets. Always consult a qualified physician or registered dietitian before starting a new diet or exercise regimen.',
    },
    {
      q: 'Does AROH support Vegetarian and Jain diets?',
      a: 'Yes, seamlessly. AROH was built with Indian food realities at the forefront. It includes native filtering for strict vegetarian, lacto-vegetarian, and Jain requirements (zero onion, zero garlic, zero root vegetables). Every nutrient figure is pulled from ICMR-IFCT (Indian Food Composition Tables) published by the National Institute of Nutrition, Hyderabad.',
    },
    {
      q: 'Where does my health and fitness data live?',
      a: 'Your data is secured in your personal profile. You can optionally connect your Google Drive from Settings to maintain a sovereign backup folder named "AROH AI" directly inside your personal Drive. We never request Drive permissions during sign-in, ensuring a fast, verified login experience. You retain full sovereignty over your logs and can export (JSON/CSV) or delete them at any time.',
    },
    {
      q: 'Can a smartphone photo accurately weigh cooked food?',
      a: 'No, and any app claiming it can is misleading you. A smartphone camera cannot measure food mass, water absorption, or hidden cooking oils used in gravies and frying. AROH recognizes visible foods from plate geometry, retrieves authoritative laboratory per-100g data from ICMR-IFCT or USDA, and provides an instant slider so you can set the exact grams. Accurate tracking requires this transparent human-in-the-loop step.',
    },
    {
      q: 'How does billing work? Will I be charged automatically?',
      a: 'All AROH plans are transparent one-time payments processed securely through authorized Indian payment gateways (UPI, debit/credit cards, and net banking). There are no unexpected recurring auto-debits without explicit mandate consent. Your 7-day free trial requires ₹0 upfront.',
    },
    {
      q: 'How does AROH comply with Indian data protection laws?',
      a: 'AROH is fully aligned with the Digital Personal Data Protection (DPDP) Act, 2023. You have the statutory right to access, download (JSON/CSV), rectify, and permanently erase your personal logs at any time directly through the app or by removing the AROH AI folder from your Google Drive.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-[#F4EBD0] font-sans flex flex-col transition-colors selection:bg-[#D4AF37]/30 selection:text-[#F0D060]">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#070707]/90 backdrop-blur-md border-b border-[#2A2416]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArohLogo size="md" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="text-xs font-bold text-[#9A8F78] hover:text-[#F4EBD0] px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onSignIn}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F0D060] hover:from-[#F0D060] hover:to-[#D4AF37] text-black text-xs font-black shadow-md shadow-[#D4AF37]/15 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Start Free Trial</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold mb-6">
          <Database className="w-3.5 h-3.5" />
          <span>ICMR-IFCT & USDA Scientific Food Composition Tables</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
          Scan your thali. <br className="hidden sm:inline" />
          <span className="text-[#D4AF37]">Get numbers from Indian food tables.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-lg text-[#9A8F78] max-w-3xl mx-auto leading-relaxed">
          AROH estimates your plate from a photo, then you fix the grams. Calories and nutrients come from ICMR-IFCT and USDA — not a made-up 97%.
        </p>

        {/* CTA Area */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onSignIn}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F0D060] hover:from-[#F0D060] hover:to-[#D4AF37] text-black font-black text-sm shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <span>Start 7-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#pricing"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#2A2416] bg-[#111111] text-[#F4EBD0] font-bold text-sm hover:border-[#D4AF37]/50 hover:bg-[#1A1A1A] transition-all cursor-pointer"
          >
            View Plans & Pricing (From ₹89)
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[11px] text-[#9A8F78]">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> ₹0 for 7 days
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Veg & Jain verified
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Sovereign Google Drive storage
          </span>
        </div>
      </section>

      {/* The 3 App Screenshots / Interactive Visual Showcases */}
      <section className="py-12 bg-[#111111] border-y border-[#2A2416] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Built for how Indians actually eat & train
            </h2>
            <p className="text-xs sm:text-sm text-[#9A8F78]">
              Three core views designed with scientific discipline, zero AI hallucinations, and absolute clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Screenshot 1: AI Camera Scanner */}
            <div className="rounded-3xl border border-[#2A2416] bg-[#111111] p-5 shadow-sm space-y-4 flex flex-col">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">1. Real Thali Plate Scanner</h3>
                  <p className="text-[11px] text-[#9A8F78]">Detects items by visual geometry</p>
                </div>
              </div>

              {/* Visual Mockup Card */}
              <div className="rounded-2xl bg-[#070707] p-3.5 border border-[#2A2416] space-y-2.5 flex-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#9A8F78] pb-1 border-b border-[#2A2416]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                    <span className="text-[#F4EBD0]">North Indian Lunch Thali</span>
                  </span>
                  <span className="text-[10px] text-[#D4AF37] font-mono">ICMR MATCHED</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2416] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">Roti (Phulka)</div>
                      <div className="text-[10px] text-[#9A8F78]">2 pieces • 60g total</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#F4EBD0]">144 kcal</span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2416] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">Yellow Dal Tadka</div>
                      <div className="text-[10px] text-[#9A8F78]">1 standard katori • 150g</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#F4EBD0]">182 kcal</span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2416] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">Paneer Bhurji</div>
                      <div className="text-[10px] text-[#9A8F78]">100g cooked</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#F4EBD0]">210 kcal</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] text-[#F0D060]">
                  ⚠️ <em>Oil & hidden sugars cannot be weighed by a lens. Review grams below.</em>
                </div>
              </div>
            </div>

            {/* Screenshot 2: Interactive Gram Slider */}
            <div className="rounded-3xl border border-[#2A2416] bg-[#111111] p-5 shadow-sm space-y-4 flex flex-col">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">2. One-Tap Gram Slider</h3>
                  <p className="text-[11px] text-[#9A8F78]">Recomputes from official tables</p>
                </div>
              </div>

              {/* Visual Mockup Card */}
              <div className="rounded-2xl bg-[#070707] p-3.5 border border-[#2A2416] space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Cooked Portion (Grams)</span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-mono font-bold text-xs">
                      150g
                    </span>
                  </div>

                  {/* Slider bar mockup */}
                  <div className="relative w-full h-3 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-3/5 bg-gradient-to-r from-[#D4AF37] to-[#F0D060] rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#9A8F78] font-mono">
                    <span>50g</span>
                    <span className="text-[#D4AF37]">150g (Selected)</span>
                    <span>300g</span>
                  </div>
                </div>

                {/* Instant Macro Calculation Output */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2416]">
                    <div className="text-[10px] text-[#9A8F78]">Protein</div>
                    <div className="font-mono text-xs font-bold text-[#D4AF37]">11.4g</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2416]">
                    <div className="text-[10px] text-[#9A8F78]">Carbs</div>
                    <div className="font-mono text-xs font-bold text-white">24.2g</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2416]">
                    <div className="text-[10px] text-[#9A8F78]">Fat</div>
                    <div className="font-mono text-xs font-bold text-[#D4AF37]">4.8g</div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2416] text-[10px] text-[#9A8F78] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Computed via ICMR-IFCT 2017 Table #D024</span>
                </div>
              </div>
            </div>

            {/* Screenshot 3: Today Athlete Dashboard */}
            <div className="rounded-3xl border border-[#2A2416] bg-[#111111] p-5 shadow-sm space-y-4 flex flex-col">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">3. Today Athlete Dashboard</h3>
                  <p className="text-[11px] text-[#9A8F78]">Training split & energy reconciliation</p>
                </div>
              </div>

              {/* Visual Mockup Card */}
              <div className="rounded-2xl bg-[#070707] p-3.5 border border-[#2A2416] space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9A8F78]">Target Calories</span>
                    <span className="font-mono font-bold text-white">1,640 / 2,150 kcal</span>
                  </div>
                  <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-[#D4AF37] rounded-full" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#9A8F78]">Target Protein</span>
                    <span className="font-mono font-bold text-[#D4AF37]">128 / 140g</span>
                  </div>
                  <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-gradient-to-r from-[#D4AF37] to-[#F0D060] rounded-full" />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#1A1A1A] border border-[#2A2416] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <div className="font-bold text-white">Push A • Upper Hypertrophy</div>
                      <div className="text-[10px] text-[#9A8F78]">4 exercises • 12 working sets</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/15 text-[#D4AF37] text-[10px] font-bold">
                    READY
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#9A8F78] pt-1">
                  <span className="flex items-center gap-1 font-bold text-[#D4AF37]">
                    <Flame className="w-3.5 h-3.5 fill-[#D4AF37]" /> 14-Day Streak
                  </span>
                  <span className="text-[#9A8F78]">Drive Synced ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Limit Statement */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111111] border border-[#2A2416] space-y-3">
          <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-sm">
            <Info className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>The Scientific Truth About Food Photography</span>
          </div>
          <p className="text-xs sm:text-sm text-[#9A8F78] leading-relaxed">
            A photo cannot be a laboratory. Oil, water, frying, hidden sugar, and restaurant recipes cannot be weighed by a smartphone camera. AROH’s job is simple and transparent: 
            <strong> (A)</strong> Identify each visible food correctly, 
            <strong> (B)</strong> Look up official per-100g numbers from ICMR-IFCT for Indian food (and USDA FoodData Central for international dishes), 
            <strong> (C)</strong> Estimate cooked grams from plate geometry, and 
            <strong> (D)</strong> Let you fix the grams in one tap, instantly recomputing all nutrients from the table. If identification fails, AROH fails visibly — it will never invent a meal.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white">
            Honest access. Zero recurring traps.
          </h2>
          <p className="text-xs sm:text-sm text-[#9A8F78]">
            Start with our 7-day free trial at ₹0. Continue with one-time payment passes — no auto-debit surprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-6 flex flex-col justify-between border transition-all ${
                tier.primary
                  ? 'border-[#D4AF37] bg-[#111111] shadow-xl ring-2 ring-[#D4AF37]/20 relative'
                  : 'border-[#2A2416] bg-[#111111] shadow-sm hover:border-[#D4AF37]/40'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    tier.primary
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                      : 'bg-[#1A1A1A] text-[#9A8F78]'
                  }`}>
                    {tier.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{tier.price}</span>
                    <span className="text-xs text-[#9A8F78] font-medium">/{tier.period}</span>
                  </div>
                  <p className="text-xs text-[#9A8F78] mt-2 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#2A2416] space-y-2">
                  {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-[#F4EBD0]">
                      <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={onSignIn}
                  className={`w-full py-3 px-4 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    tier.primary
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F0D060] hover:from-[#F0D060] hover:to-[#D4AF37] text-black shadow-md'
                      : 'bg-[#1A1A1A] hover:bg-[#2A2416] text-[#F4EBD0]'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#9A8F78]">
            Clear answers on scientific limits, data sovereignty, and subscriptions.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#2A2416] bg-[#111111] overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#1A1A1A]"
                >
                  <span className="text-sm font-bold text-white">
                    {faq.q}
                  </span>
                  <div className="text-[#9A8F78] shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#9A8F78] leading-relaxed border-t border-[#2A2416]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Real Market-Ready Footer */}
      <footer className="mt-auto border-t border-[#2A2416] bg-[#070707] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ArohLogo size="sm" />
              <span className="text-xs text-[#9A8F78] font-mono">v2.4</span>
            </div>

            {/* Navigation links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#9A8F78]">
              <button onClick={() => onNavigate('/privacy')} className="hover:text-[#D4AF37] cursor-pointer">
                Privacy Policy
              </button>
              <span>•</span>
              <button onClick={() => onNavigate('/terms')} className="hover:text-[#D4AF37] cursor-pointer">
                Terms of Service
              </button>
              <span>•</span>
              <button onClick={() => onNavigate('/disclaimer')} className="hover:text-[#D4AF37] cursor-pointer">
                Medical Disclaimer
              </button>
              <span>•</span>
              <button onClick={() => onNavigate('/refund')} className="hover:text-[#D4AF37] cursor-pointer">
                Refund Policy
              </button>
              <span>•</span>
              <a href="mailto:support@aroh.in" className="hover:text-[#D4AF37]">
                Contact Support
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#9A8F78] pt-4 border-t border-[#2A2416]">
            <div>
              © {new Date().getFullYear()} AROH Fitness Technologies. All rights reserved.
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Compliant with DPDP Act, 2023</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
