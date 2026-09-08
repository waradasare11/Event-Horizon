# AROH — Evidence-Based Workout & Nutrition Coaching Platform

AROH is a science-guided fitness and nutrition coaching SaaS inspired by exercise physiology principles (like BuiltWithScience). It combines real-time AI computer vision for instant meal photo scanning, a deterministic Mifflin-St Jeor metabolic calculation engine, EMG-backed resistance training programs, and interactive body composition analytics.

---

## Key Features

1. **AI Vision Meal Scanner & Nutritional Analysis**:
   - Live camera capture or photo upload powered by **Gemini 3.7 Flash**.
   - Sub-10 second breakdown of identified ingredients, portion weights in grams, calories, and macronutrients.
   - Goal alignment scoring (1-100), scientific verdicts, and 1-click **AI Smart Swaps**.
   - Interactive portion slider to adjust weights and instantly re-estimate macros.

2. **Adaptive AI Nutrition & Meal Planning**:
   - Caloric & protein targets derived from Mifflin-St Jeor BMR and activity TDEE formulas with hard-coded safety floors.
   - Dynamic **AI-Driven Meal Plan Adjustments** that recalibrate meals and recipes based on your specific body composition and adherence.
   - Multi-cuisine frameworks (Global & Mediterranean, High-Protein Indian, High-Protein Vegetarian/Vegan).

3. **Evidence-Based Workout Programs**:
   - 4-Day Upper/Lower, 5-Day PPL, and 3-Day Full Body science splits.
   - Target muscle EMG activation data, exercise biomechanics cues, and tempo targets.
   - **Joint Health & Injury Shield**: Automatic exercise substitutions for shoulder, lower back, or knee discomfort.

4. **Interactive Progress & Body Composition Tracking**:
   - Interactive Recharts graphs comparing actual weigh-ins against safe projected goal timelines.
   - Daily calorie & protein consistency meters.
   - Weekly adaptive check-in system.

5. **AI Science Coach**:
   - Interactive Q&A chat referencing sports nutrition research, muscle protein synthesis (MPS) thresholds, and plateau management.

---

## How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)

### Quick Start Instructions (Windows / Mac / Linux)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Keys**:
   Make sure `GEMINI_API_KEY` is set in your `.env` file:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build & Start**:
   ```bash
   npm run build
   npm start
   ```

---

## Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Motion, Canvas-Confetti.
- **Backend**: Express (Node.js) with `@google/genai` TypeScript SDK.
- **AI Model**: `gemini-3.7-flash` with structured JSON schema outputs and computer vision multimodal processing.
- **Formulas**: Mifflin-St Jeor BMR, Physical Activity Multiplier, ISSN Protein Guidelines (2.0–2.2g/kg).
