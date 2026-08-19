import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with a generous limit for base64 image data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy-initialized Gemini client with telemetry header
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. AI Meal Analysis from Photo
app.post("/api/ai/analyze-meal", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", userProfile, customNotes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 in request body" });
    }

    const ai = getAI();
    
    // Clean base64 string if data URL prefix exists
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const prompt = `You are an expert sports nutritionist and food scientist (inspired by evidence-based nutrition principles like BuiltWithScience).
Analyze this meal photograph meticulously.

User Context:
- Goal: ${userProfile?.goal || "general fitness"}
- Current Weight: ${userProfile?.weightKg || 75} kg
- Target Weight: ${userProfile?.targetWeightKg || 70} kg
- Body Fat %: ${userProfile?.bodyFatPct ? userProfile.bodyFatPct + "%" : "Not specified"}
- Daily Calorie Target: ${userProfile?.dailyCalories || 2000} kcal
- Daily Protein Target: ${userProfile?.dailyProtein || 150} g
- Diet Preference: ${userProfile?.dietType || "Flexible"}
- Known Allergies/Exclusions: ${userProfile?.allergies || "None"}
- Additional User Notes: ${customNotes || "None"}

Please perform an in-depth nutritional breakdown:
1. Identify all recognizable food items and ingredients with estimated portion weight in grams.
2. Calculate total calories, protein (g), carbohydrates (g), total fat (g), and dietary fiber (g).
3. Estimate key micronutrients (Sodium, Potassium, Vitamin C, Iron, Calcium if significant).
4. Provide a Health & Goal Alignment Score (1 to 100).
5. Provide scientific, practical suggestions on how to improve this meal specifically for the user's goal (e.g. higher thermic effect of food, optimal leucine threshold, fiber fullness, glycemic stability).
6. Suggest 2-3 specific, easy food swaps or additions that make this meal 20-30% more aligned with their body composition targets.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealTitle: {
              type: Type.STRING,
              description: "Descriptive name of the identified dish/meal (e.g. 'Grilled Salmon with Quinoa and Roasted Asparagus')",
            },
            confidence: {
              type: Type.STRING,
              description: "Confidence rating: 'High', 'Medium', or 'Moderate'",
            },
            summaryDescription: {
              type: Type.STRING,
              description: "A concise 2-sentence description of the plate composition and visual observations",
            },
            totalCalories: {
              type: Type.INTEGER,
              description: "Total estimated kilocalories",
            },
            totalProteinG: {
              type: Type.NUMBER,
              description: "Total protein in grams",
            },
            totalCarbsG: {
              type: Type.NUMBER,
              description: "Total carbohydrates in grams",
            },
            totalFatG: {
              type: Type.NUMBER,
              description: "Total fat in grams",
            },
            totalFiberG: {
              type: Type.NUMBER,
              description: "Total dietary fiber in grams",
            },
            totalSodiumMg: {
              type: Type.INTEGER,
              description: "Estimated sodium content in milligrams (mg)",
            },
            totalCalciumMg: {
              type: Type.INTEGER,
              description: "Estimated calcium content in milligrams (mg)",
            },
            totalPotassiumMg: {
              type: Type.INTEGER,
              description: "Estimated potassium content in milligrams (mg)",
            },
            goalAlignmentScore: {
              type: Type.INTEGER,
              description: "Score from 1 to 100 on how well this meal aligns with the user's specific fitness & body comp goal",
            },
            goalFitVerdict: {
              type: Type.STRING,
              description: "One short punchy verdict (e.g. 'Optimal Protein Density for Fat Loss', 'Slightly High in Saturated Fats for Cutting')",
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  portionDescription: { type: Type.STRING },
                  weightG: { type: Type.NUMBER },
                  calories: { type: Type.INTEGER },
                  proteinG: { type: Type.NUMBER },
                  carbsG: { type: Type.NUMBER },
                  fatG: { type: Type.NUMBER },
                },
                required: ["name", "portionDescription", "weightG", "calories", "proteinG", "carbsG", "fatG"],
              },
            },
            micronutrients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                },
                required: ["name", "amount", "benefit"],
              },
            },
            goalImprovementTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 actionable, evidence-based recommendations to optimize this meal for their goal",
            },
            smartSwaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalItem: { type: Type.STRING },
                  suggestedSwap: { type: Type.STRING },
                  benefitReason: { type: Type.STRING },
                  calorieDifference: { type: Type.STRING },
                },
                required: ["originalItem", "suggestedSwap", "benefitReason", "calorieDifference"],
              },
            },
            scientificTakeaway: {
              type: Type.STRING,
              description: "Brief scientific rationale citing energy density, muscle protein synthesis, or satiety index",
            },
          },
          required: [
            "mealTitle",
            "confidence",
            "summaryDescription",
            "totalCalories",
            "totalProteinG",
            "totalCarbsG",
            "totalFatG",
            "totalFiberG",
            "goalAlignmentScore",
            "goalFitVerdict",
            "items",
            "goalImprovementTips",
            "smartSwaps",
            "scientificTakeaway",
          ],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error("Error analyzing meal:", error);
    return res.status(500).json({
      error: "Failed to analyze meal with Gemini Vision AI",
      details: error?.message || String(error),
    });
  }
});

// 2. AI Meal Plan Generator & Body Composition Dynamic Adjustments
app.post("/api/ai/adjust-meal-plan", async (req, res) => {
  try {
    const { userProfile, recentLogs, reason } = req.body;
    const ai = getAI();

    const prompt = `You are a world-class evidence-based nutrition scientist.
Generate a structured, hyper-personalized 1-day meal plan with AI adjustments based on the user's specific body composition data, metabolic rate, and recent adherence.

User Profile:
- Goal: ${userProfile?.goal || "Fat Loss"}
- Current Weight: ${userProfile?.weightKg} kg
- Target Weight: ${userProfile?.targetWeightKg} kg
- Height: ${userProfile?.heightCm} cm
- Body Fat %: ${userProfile?.bodyFatPct ? userProfile.bodyFatPct + "%" : "Not measured"}
- Daily Calorie Target: ${userProfile?.dailyCalories} kcal
- Protein Target: ${userProfile?.dailyProtein} g
- Carbs Target: ${userProfile?.dailyCarbs} g
- Fat Target: ${userProfile?.dailyFat} g
- Diet Type: ${userProfile?.dietType || "Non-Vegetarian"}
- Cuisine Preference: ${userProfile?.cuisinePreference || "Mixed Global & High-Protein Indian / Mediterranean"}
- Reason for Adjustment: ${reason || "Regular weekly body composition recalculation"}
- Recent Logging Trends: ${JSON.stringify(recentLogs || {})}

Return a comprehensive, delicious meal plan designed with optimal nutrient timing, high satiety, and evidence-based protein distribution (e.g. 0.4g/kg protein per meal for MPS stimulation).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planName: { type: Type.STRING },
            adjustmentSummary: { type: Type.STRING },
            bodyCompRationale: { type: Type.STRING },
            totalCalories: { type: Type.INTEGER },
            totalProtein: { type: Type.INTEGER },
            totalCarbs: { type: Type.INTEGER },
            totalFat: { type: Type.INTEGER },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mealType: { type: Type.STRING, description: "Breakfast, Lunch, Pre/Post-Workout Snack, Dinner" },
                  timeRecommendation: { type: Type.STRING },
                  dishName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        item: { type: Type.STRING },
                        amount: { type: Type.STRING },
                      },
                      required: ["item", "amount"],
                    },
                  },
                  calories: { type: Type.INTEGER },
                  proteinG: { type: Type.NUMBER },
                  carbsG: { type: Type.NUMBER },
                  fatG: { type: Type.NUMBER },
                  cookingTip: { type: Type.STRING },
                },
                required: ["mealType", "dishName", "ingredients", "calories", "proteinG", "carbsG", "fatG"],
              },
            },
            hydrationTargetLiters: { type: Type.NUMBER },
            supplementGuidance: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "planName",
            "adjustmentSummary",
            "bodyCompRationale",
            "totalCalories",
            "totalProtein",
            "totalCarbs",
            "totalFat",
            "meals",
            "hydrationTargetLiters",
          ],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error("Error adjusting meal plan:", error);
    return res.status(500).json({
      error: "Failed to generate AI meal plan",
      details: error?.message || String(error),
    });
  }
});

// 3. AI Evidence-Based Coach Chat with Google Search Grounding & Deep Thinking
app.post("/api/ai/coach-chat", async (req, res) => {
  try {
    const { messages, userProfile, useSearchGrounding = true, enableThinking = false } = req.body;
    const ai = getAI();

    const systemInstruction = `You are the PeakForm Science Coach, an elite sports science AI assistant inspired by exercise physiologists, sports nutritionists, and evidence-based researchers (Jeremy Ethier / BuiltWithScience, Dr. Brad Schoenfeld, Dr. Eric Helms, ISSN, and ACSM).

You provide concise, crystal-clear, scientifically backed guidance across all domains of:
- Health, Nutrition, and Energy Balance (Mifflin-St Jeor, TDEE, NEAT)
- Fat Loss and Metabolic Adaptations (Deficits, Refeeds, Leptin, Satiety Index)
- Muscle Building / Hypertrophy (Mechanical Tension, Volume thresholds 10-20 sets/week, RPE/RIR, MPS Leucine threshold)
- Body Recomposition Mechanics
- Evidence-Based Ergogenic Supplements (Creatine Monohydrate, Whey/Casein, Caffeine, Beta-Alanine, Vitamin D3, Omega-3)
- Exercise Biomechanics & EMG Muscle Activation

User Context:
- Goal: ${userProfile?.goal || "Fat Loss"}
- Weight: ${userProfile?.weightKg || 75} kg, Height: ${userProfile?.heightCm || 175} cm
- Daily Target: ${userProfile?.dailyCalories || 2000} kcal, ${userProfile?.dailyProtein || 150}g protein
- Diet: ${userProfile?.dietType || "Flexible"}
- Injuries/Notes: ${userProfile?.injuries || "None"}

Keep your tone motivating, objective, analytical yet warm. Always cite peer-reviewed consensus and practical takeaways. Format responses with clear bullet points and bold highlights.`;

    const chatHistory = (messages || []).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const config: any = {
      systemInstruction,
      temperature: enableThinking ? 0.4 : 0.7,
    };

    if (enableThinking) {
      config.thinkingConfig = { thinkingBudget: 4096 };
    }

    if (useSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: chatHistory,
      config,
    });

    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const citations = rawChunks
      .map((c: any) => {
        if (c.web) {
          let domain = "";
          try {
            domain = new URL(c.web.uri).hostname.replace(/^www\./, "");
          } catch {}
          return {
            title: c.web.title || domain || "Scientific Source",
            url: c.web.uri,
            domain,
          };
        }
        return null;
      })
      .filter(Boolean);

    return res.json({
      success: true,
      message: response.text || "I am here to guide your evidence-based fitness journey.",
      citations,
    });
  } catch (error: any) {
    console.error("Error in coach chat:", error);
    return res.status(500).json({
      error: "Failed to connect to AI Coach",
      details: error?.message || String(error),
    });
  }
});

// 4. Live Scientific Research Engine (Health, Nutrition, Fitness, Fat Loss, Muscle Building) with Search Grounding
app.post("/api/ai/research-search", async (req, res) => {
  try {
    const { query, userGoal, topicCategory } = req.body;
    const ai = getAI();

    const prompt = `Conduct an exhaustive, evidence-based scientific research synthesis on the following health, fitness, nutrition, or muscle-building topic:
Topic Query: "${query}"
Category: ${topicCategory || "Exercise Physiology & Sports Nutrition"}
User Fitness Context / Goal: ${userGoal || "Optimizing Fat Loss, Muscle Hypertrophy & Longevity"}

Search the latest peer-reviewed literature, sports science reviews, ISSN (International Society of Sports Nutrition) position stands, meta-analyses, and ACSM guidelines to provide an authoritative, deep scientific breakdown.

Include:
1. Executive Scientific Consensus (What does the current clinical and sports science research state?)
2. Key Evidence-Based Findings (3-5 specific, quantified insights e.g. exact gram/kg thresholds, percentages, physiological mechanisms)
3. Strength of Evidence Category (e.g. 'Consensus / Meta-Analysis', 'Randomized Controlled Trial (RCT)', or 'Mechanistic / Observational')
4. Practical Application Protocols (Step-by-step actionable rules an athlete or trainee should implement immediately)

Structure your response clearly with bold headings, clean bullet points, and actionable numbers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.5,
      },
    });

    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const citations = rawChunks
      .map((c: any) => {
        if (c.web) {
          let domain = "";
          try {
            domain = new URL(c.web.uri).hostname.replace(/^www\./, "");
          } catch {}
          return {
            title: c.web.title || domain || "Scientific Source",
            url: c.web.uri,
            domain,
          };
        }
        return null;
      })
      .filter(Boolean);

    return res.json({
      success: true,
      data: {
        query,
        synthesisText: response.text || "No research findings generated.",
        citations,
        generatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
    });
  } catch (error: any) {
    console.error("Error in scientific research search:", error);
    return res.status(500).json({
      error: "Failed to perform scientific research search",
      details: error?.message || String(error),
    });
  }
});


// 4. AI Custom Macro-Friendly Recipe Generator
app.post("/api/ai/generate-custom-recipe", async (req, res) => {
  try {
    const { userProfile, recipeRequirements } = req.body;
    const ai = getAI();

    const targetCals = recipeRequirements?.targetCalories || Math.round((userProfile?.dailyCalories || 2000) / 3.5);
    const targetProt = recipeRequirements?.targetProteinG || Math.round((userProfile?.dailyProtein || 150) / 3.5);

    const prompt = `You are an elite sports nutrition chef and food scientist.
Create a custom, delicious, highly satiating, macro-friendly recipe precision-engineered to hit specific caloric and protein targets for this user's fitness goal.

User Body Composition & Targets:
- Goal: ${userProfile?.goal || "Fat Loss"}
- Current Weight: ${userProfile?.weightKg || 75} kg (Target: ${userProfile?.targetWeightKg || 70} kg)
- Daily Caloric Budget: ${userProfile?.dailyCalories || 2000} kcal
- Daily Protein Budget: ${userProfile?.dailyProtein || 150} g
- Dietary Framework: ${userProfile?.dietType || "Flexible / Non-Vegetarian"}
- Preferred Cuisine: ${recipeRequirements?.cuisineStyle || userProfile?.cuisinePreference || "High-Protein Global & Mediterranean"}

Recipe Requirements:
- Meal Category / Occasion: ${recipeRequirements?.mealType || "High-Protein Lunch"}
- Target Calories For This Recipe: ~${targetCals} kcal (within ±35 kcal tolerance)
- Target Protein For This Recipe: ~${targetProt} g protein (hitting the ~0.4g/kg MPS threshold)
- Max Prep + Cooking Time: ${recipeRequirements?.maxCookTimeMin || 20} minutes
- Kitchen / Pantry Ingredients Available: ${recipeRequirements?.availableIngredients || "Standard kitchen staples"}
- Extra Preferences / Craving Notes: ${recipeRequirements?.notes || "High volume, nutrient dense"}

Formulate a mouthwatering, practical recipe with precise grams/tbsp measurements, step-by-step culinary instructions, and scientific notes on why this satisfies the protein threshold and goal alignment.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: {
              type: Type.STRING,
              description: "Appetizing, clear title of the recipe (e.g. 'Crispy Skillet Lemon-Herb Chicken Breast with Garlic Whipped Cauliflower Mash')",
            },
            headlineTag: {
              type: Type.STRING,
              description: "Punchy 3-word badge (e.g. 'High Satiety • 15-Min Prep • MPS Optimized')",
            },
            description: {
              type: Type.STRING,
              description: "Enticing 2-sentence description highlighting taste, texture, and satiety",
            },
            mealCategory: {
              type: Type.STRING,
              description: "Breakfast, Lunch, Dinner, Post-Workout, or Snack/Dessert",
            },
            prepTimeMin: { type: Type.INTEGER },
            cookTimeMin: { type: Type.INTEGER },
            servings: { type: Type.INTEGER },
            totalCalories: { type: Type.INTEGER },
            proteinG: { type: Type.NUMBER },
            carbsG: { type: Type.NUMBER },
            fatG: { type: Type.NUMBER },
            fiberG: { type: Type.NUMBER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  macrosContribution: { type: Type.STRING, description: "e.g. 'Primary Protein' or 'Healthy Fat / Satiety'" },
                },
                required: ["item", "amount"],
              },
            },
            stepByStepInstructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            chefScienceTip: {
              type: Type.STRING,
              description: "Culinary tip to optimize flavor without adding hidden liquid calories (e.g. using deglazing, citrus acid, or umami seasoning)",
            },
            bodyCompBenefit: {
              type: Type.STRING,
              description: "Scientific explanation of why this recipe aids fat loss/muscle retention (e.g. leucine content, fiber density, glycemic index)",
            },
            macrosMatchExplanation: {
              type: Type.STRING,
              description: "Confirmation of how this recipe fits into their daily caloric and protein targets",
            },
          },
          required: [
            "recipeName",
            "headlineTag",
            "description",
            "mealCategory",
            "prepTimeMin",
            "cookTimeMin",
            "servings",
            "totalCalories",
            "proteinG",
            "carbsG",
            "fatG",
            "fiberG",
            "ingredients",
            "stepByStepInstructions",
            "chefScienceTip",
            "bodyCompBenefit",
            "macrosMatchExplanation",
          ],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error("Error generating custom recipe:", error);
    return res.status(500).json({
      error: "Failed to generate custom macro-friendly recipe",
      details: error?.message || String(error),
    });
  }
});

// 5. AI Biomechanics & Exercise Lift Form Video/Image Analysis
app.post("/api/ai/analyze-lift-form", async (req, res) => {
  try {
    const { mediaBase64, mimeType = "video/mp4", exerciseName, userExperience, currentWeightKg, specificQuestions } = req.body;

    if (!mediaBase64) {
      return res.status(400).json({ error: "Missing mediaBase64 in request body" });
    }

    const ai = getAI();
    const cleanBase64 = mediaBase64.replace(/^data:(video|image)\/[a-zA-Z0-9+.-]+;base64,/, "");

    const prompt = `You are a world-renowned exercise physiologist, biomechanics specialist, and powerlifting/hypertrophy coach (inspired by evidence-based biomechanics research like Jeremy Ethier / BuiltWithScience, Dr. Stuart McGill, and Dr. Brad Schoenfeld).

Meticulously audit this exercise movement execution:
- Exercise Name: ${exerciseName || "Compound Barbell / Dumbbell Exercise"}
- User Experience Level: ${userExperience || "Intermediate"}
- Trainee Bodyweight: ${currentWeightKg || 75} kg
- Trainee's Specific Concern: ${specificQuestions || "Check overall joint alignment, bar path, lumbar stability, and tempo"}

Analyze the visual evidence across all phases of the lift:
1. Setup & Unrack / Start Position (Stance width, foot angle, grip, spinal alignment, ribcage position)
2. Eccentric / Descent Phase (Bar path verticality, knee-over-toe trajectory, hip hinge depth, tempo control)
3. Amortization / Bottom Transition (Depth relative to parallel, pelvic stability / butt-wink check, core bracing)
4. Concentric / Ascent Phase (Force distribution, hip-shoulder rise timing, elbow tuck/flare, lockout)
5. Safety & Injury Risk Breakdown (Lumbar shear, patellar strain, shoulder impingement risk)

Provide a thorough, quantified, highly actionable biomechanical report.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exerciseIdentified: { type: Type.STRING },
            formScore: { type: Type.INTEGER, description: "Quantitative form rating from 1 to 100" },
            verdict: { type: Type.STRING, description: "Punchy summary e.g. 'Solid Bar Path with Minor Lumbar Flexion at Bottom'" },
            injuryRiskRating: { type: Type.STRING, enum: ["Low", "Moderate", "High"] },
            overallAssessment: { type: Type.STRING, description: "2-3 paragraphs of deep biomechanical commentary" },
            barPathQuality: { type: Type.STRING, description: "Assessment of trajectory (e.g. 'Straight vertical alignment over mid-foot with ±1.5cm forward drift')" },
            jointMechanics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  joint: { type: Type.STRING, description: "e.g. Spine / Lumbar, Knees, Hips, Shoulders, Wrists" },
                  observation: { type: Type.STRING },
                  rating: { type: Type.STRING, description: "Optimal, Needs Improvement, Critical Fault" },
                },
                required: ["joint", "observation", "rating"],
              },
            },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 positive execution mechanics performed well",
            },
            mechanicalFaults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: "Setup, Eccentric, Bottom, Concentric, Lockout" },
                  faultDescription: { type: Type.STRING },
                  correctionCue: { type: Type.STRING },
                },
                required: ["phase", "faultDescription", "correctionCue"],
              },
            },
            actionableCuesNextSet: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 memorable verbal/internal cues to remember before the next rep",
            },
            scientificTakeaway: {
              type: Type.STRING,
              description: "Relevant EMG or physics explanation (e.g. moment arms, torque, intra-abdominal pressure)",
            },
          },
          required: [
            "exerciseIdentified",
            "formScore",
            "verdict",
            "injuryRiskRating",
            "overallAssessment",
            "barPathQuality",
            "jointMechanics",
            "keyStrengths",
            "mechanicalFaults",
            "actionableCuesNextSet",
            "scientificTakeaway",
          ],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error("Error analyzing lift form:", error);
    return res.status(500).json({
      error: "Failed to analyze exercise form with Gemini Vision",
      details: error?.message || String(error),
    });
  }
});

// 6. AI Exercise Smart Swap based on Equipment Availability and Injury History
app.post("/api/ai/smart-swap", async (req, res) => {
  try {
    const { 
      currentExercise, 
      userProfile, 
      swapReason,
      availableEquipment,
      specificDiscomfortLocation 
    } = req.body;

    if (!currentExercise || !currentExercise.name) {
      return res.status(400).json({ error: "Missing currentExercise in request body" });
    }

    const ai = getAI();

    const injuriesText = userProfile?.injuries && userProfile.injuries.length > 0 
      ? userProfile.injuries.join(", ") 
      : "None reported";

    const injuryNotes = userProfile?.injuryNotes || "None";

    const prompt = `You are an elite sports scientist, biomechanist, and strength coach specializing in hypertrophy, joint kinematics, and injury prevention (inspired by evidence-based biomechanics research from BuiltWithScience, Dr. Stuart McGill, and Brad Schoenfeld).

The trainee needs an evidence-based "Smart Swap" alternative for their current workout exercise.

Current Exercise To Swap:
- Name: ${currentExercise.name}
- Target Muscle: ${currentExercise.targetMuscle}
- Prescribed Sets & Reps: ${currentExercise.sets} sets × ${currentExercise.reps} reps (RPE ${currentExercise.rpeTarget || 8})
- Current Equipment: ${currentExercise.equipment}

Trainee Profile & Constraints:
- Documented Injuries: ${injuriesText}
- Specific Injury Notes: ${injuryNotes}
- Swap Reason / Trigger: ${swapReason || "Equipment unavailable or joint discomfort"}
- Custom Equipment Available: ${availableEquipment || "Standard gym equipment (dumbbells, cables, barbells, machines)"}
- Specific Discomfort / Concern: ${specificDiscomfortLocation || "None specified"}
- Trainee Experience Level: ${userProfile?.experienceLevel || "Intermediate"}
- Trainee Goal: ${userProfile?.goal || "Hypertrophy & Fat Loss"}

Provide 3 distinct, scientifically validated exercise alternatives:
1. High-Equivalence Swap (Closest biomechanical match with similar strength curve & motor unit recruitment).
2. Joint-Friendly / Injury-Protective Swap (Significantly reduces shear stress, axial loading, or impingement angles while maintaining tension on target muscle).
3. Minimalist / Free-Weight or Cable Swap (Optimized for home/busy gym where specialized machines or barbell racks are occupied).

Ensure all swaps strictly respect the trainee's injury history and equipment availability.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalExerciseName: { type: Type.STRING },
            reasonSummary: { type: Type.STRING, description: "1-2 sentences summarizing why these alternatives were curated for this specific trainee" },
            injurySafeguardSummary: { type: Type.STRING, description: "Explanation of how these options protect the user's documented injuries" },
            swaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  equipment: { type: Type.STRING },
                  targetMuscle: { type: Type.STRING },
                  prescribedSetsReps: { type: Type.STRING, description: "e.g. '3 sets × 10-12 reps @ RPE 8'" },
                  biomechanicalRationale: { type: Type.STRING, description: "EMG/tension profile explanation for why this stimulates the same muscle fibers" },
                  jointSafetyRating: { type: Type.STRING, description: "e.g. 'Deloads Lumbar Spine', 'Low Shoulder Impingement', 'Zero Knee Shear'" },
                  howItAddressesInjury: { type: Type.STRING, description: "Direct mechanism of how this prevents aggravating the user's injuries" },
                  setupCue: { type: Type.STRING, description: "Actionable execution cue for immediate performance" },
                  matchPercentage: { type: Type.INTEGER, description: "90-98%" },
                },
                required: [
                  "id",
                  "name",
                  "equipment",
                  "targetMuscle",
                  "prescribedSetsReps",
                  "biomechanicalRationale",
                  "jointSafetyRating",
                  "howItAddressesInjury",
                  "setupCue",
                  "matchPercentage",
                ],
              },
            },
          },
          required: ["originalExerciseName", "reasonSummary", "injurySafeguardSummary", "swaps"],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error("Error generating Smart Swap:", error);
    return res.status(500).json({
      error: "Failed to generate smart exercise swap",
      details: error?.message || String(error),
    });
  }
});

// 7. AI Smart Shopping List Compiler & Grocery Categorizer
app.post("/api/ai/compile-shopping-list", async (req, res) => {
  try {
    const { mealPlan, daysMultiplier = 7, userProfile, extraCustomItems } = req.body;

    if (!mealPlan || !mealPlan.meals || !Array.isArray(mealPlan.meals)) {
      return res.status(400).json({ error: "Missing mealPlan or meals array in request body" });
    }

    const ai = getAI();

    const rawIngredientsList = mealPlan.meals.flatMap((m: any) => 
      (m.ingredients || []).map((ing: any) => ({
        meal: m.dishName || m.mealType || "Meal",
        item: ing.item,
        amount: ing.amount,
      }))
    );

    const prompt = `You are an expert sports nutritionist and meal-prep systems specialist.
The user has an active AI-generated meal plan for their fitness goal (${userProfile?.goal || "general fitness"}, Diet: ${userProfile?.dietType || "Flexible"}).

Raw Meal Plan Ingredients (Single Day):
${JSON.stringify(rawIngredientsList, null, 2)}

Extra User Requested Items:
${extraCustomItems ? JSON.stringify(extraCustomItems) : "None"}

Prep Timeframe: ${daysMultiplier} Days

Your Tasks:
1. Aggregate and consolidate all duplicate or overlapping ingredients, scaling the quantities appropriately for ${daysMultiplier} days of meal prep.
2. Group every item into one of the following strict supermarket categories:
   - "Lean Protein"
   - "Complex Carbs"
   - "Fibrous Veggies & Greens"
   - "Fruits & Antioxidants"
   - "Healthy Fats & Nuts"
   - "Dairy & High-Protein Alternatives"
   - "Pantry Essentials & Seasonings"
   - "General"
3. Provide realistic grocery purchase amounts in standard supermarket units (e.g. "1.5 kg Boneless Chicken Breast", "2 Dozen Pasture-Raised Eggs", "1 Bag (1kg) Brown Jasmine Rice", "3 Large Avocados").
4. Provide estimated overall grocery cost range (USD / standard) for this ${daysMultiplier}-day haul.
5. Provide 3-4 scientific bulk prep & cost-saving grocery tips (e.g., buying bulk lean protein on sale, optimal produce storage to prevent nutrient loss, high-satiety volume swaps).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            listName: { type: Type.STRING },
            daysMultiplier: { type: Type.INTEGER },
            estimatedCostRange: { type: Type.STRING, description: "e.g. '$65 - $85 USD'" },
            bulkPrepTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { 
                    type: Type.STRING, 
                    enum: [
                      "Lean Protein",
                      "Complex Carbs",
                      "Fibrous Veggies & Greens",
                      "Fruits & Antioxidants",
                      "Healthy Fats & Nuts",
                      "Dairy & High-Protein Alternatives",
                      "Pantry Essentials & Seasonings",
                      "General"
                    ] 
                  },
                  amount: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  mealSources: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["id", "name", "category", "amount"],
              },
            },
          },
          required: ["listName", "daysMultiplier", "estimatedCostRange", "bulkPrepTips", "items"],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error("Error compiling smart shopping list:", error);
    return res.status(500).json({
      error: "Failed to compile smart shopping list",
      details: error?.message || String(error),
    });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PeakForm AI Server running on port ${PORT}`);
  });
}

startServer();
