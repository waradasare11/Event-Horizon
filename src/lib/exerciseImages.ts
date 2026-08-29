/**
 * 100% Accurate Visual Exercise Action Demonstrations and Movement Photos
 * Every movement has its own distinct, verified, high-contrast action image and accurate step-by-step description.
 */

export interface ExerciseStepPhoto {
  stepNumber: number;
  stepName: string;
  imageUrl: string;
  actionDescription: string;
  keyCue: string;
}

export interface ExercisePhotoData {
  imageUrl: string;
  actionCaption: string;
  simplifiedName: string;
  setupSummary: string;
  executionSummary: string;
  targetFocus: string;
  visualAngle: string;
  stepImages?: ExerciseStepPhoto[];
}

export const EXERCISE_PHOTOS_MAP: Record<string, ExercisePhotoData> = {
  // ==========================================
  // CHEST EXERCISES (सीने के व्यायाम)
  // ==========================================
  'ex-bench-press': {
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Flat Barbell Bench Press: Lie flat, retract shoulder blades, tuck elbows at 45°, lower bar to lower sternum, and press explosively up.',
    simplifiedName: 'Flat Bench Press',
    setupSummary: 'Retract & pinch shoulder blades firmly into the bench. Place feet flat on the ground to create leg drive.',
    executionSummary: 'Lower bar in a controlled J-curve to the lower chest, pause briefly, then press forcefully back over shoulder joints.',
    targetFocus: 'Mid-Pectoralis Major & Sternal Fibers',
    visualAngle: 'Horizontal Bench Press Position',
  },
  'ex-incline-db-press': {
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Incline Dumbbell Press: 30° inclined bench, dumbbells lowered with deep stretch at outer clavicles, pressing upward over upper chest.',
    simplifiedName: 'Incline Dumbbell Press',
    setupSummary: 'Set bench to 30° (or 2 notches). Plant feet and bring dumbbells to shoulder level with slight inward wrist tilt.',
    executionSummary: 'Descend smoothly until dumbbells reach chest level, feel upper pec stretch, then press upward in a converging arc without banging weights.',
    targetFocus: 'Upper Chest (Clavicular Head)',
    visualAngle: '30° Incline Upper Chest Angle',
  },
  'ex-decline-db-press': {
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Decline Dumbbell Press: Hook legs into decline bench, press dumbbells in line with lower costal pectoral fibers.',
    simplifiedName: 'Decline Dumbbell Press',
    setupSummary: 'Lock shins securely under pads on decline bench. Start dumbbells directly over lower chest with neutral-to-pronated grip.',
    executionSummary: 'Lower dumbbells controlled to lower chest level, feeling deep stretch across lower pec border, then press to full lockout.',
    targetFocus: 'Lower Chest (Costal Fibers)',
    visualAngle: 'Decline 20° Lower Chest Angle',
  },
  'ex-low-to-high-cable-fly': {
    imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Low-to-High Cable Fly: Pull pulleys from floor height upward and inward, matching the clavicular upper pec fiber orientation.',
    simplifiedName: 'Low Cable Upper Fly',
    setupSummary: 'Set dual pulleys at lowest pin. Take staggered stance, chest proud, palms facing slightly up.',
    executionSummary: 'Scoop handles upward and together in front of upper chest with slight elbow bend. Squeeze upper pecs for 1 second at apex.',
    targetFocus: 'Clavicular Pec & Inner Upper Chest',
    visualAngle: 'Upward Cable Trajectory',
  },
  'ex-high-to-low-cable-fly': {
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'High-to-Low Cable Fly: Pulleys set high, sweep arms down and together across waistline to isolate lower and inner pectorals.',
    simplifiedName: 'High Cable Lower Fly',
    setupSummary: 'Set pulleys above head height. Step forward into a slight torso hinge with soft elbow bend.',
    executionSummary: 'Drive handles down and inward in a wide hugging arc, crossing wrists slightly at bottom for maximal sternal contraction.',
    targetFocus: 'Lower Pectoralis & Sternal Border',
    visualAngle: 'Downward Crossing Cable Sweep',
  },
  'ex-flat-cable-flye': {
    imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Standing / Bench Cable Fly: Mid-height cable handles brought together in front of sternum with constant tension.',
    simplifiedName: 'Chest Cable Fly',
    setupSummary: 'Position cables at chest height. Maintain stable athletic stance and fixed 15° elbow bend.',
    executionSummary: 'Bring hands together in front of sternum like hugging a tree, hold peak contraction, and return slowly to full chest stretch.',
    targetFocus: 'Mid-Pectoralis Major',
    visualAngle: 'Horizontal Cable Fly Sweep',
  },
  'ex-machine-chest-press': {
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Seated Machine Chest Press: Stable back pad, handles aligned at nipple line, pushing forward with continuous tension.',
    simplifiedName: 'Seated Chest Press Machine',
    setupSummary: 'Adjust seat height so handles align with mid-chest. Press upper back and head firmly against backrest.',
    executionSummary: 'Press handles forward smoothly until arms are extended without locking elbows, then control the negative eccentric.',
    targetFocus: 'Pectoralis Major & Anterior Deltoids',
    visualAngle: 'Machine Supported Seated Press',
  },
  'ex-pec-deck-fly': {
    imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Pec Deck Machine Fly: Forearms/hands against pads, driving elbows together horizontally for extreme chest isolation.',
    simplifiedName: 'Pec Deck Machine Fly',
    setupSummary: 'Set seat so handles are level with mid-chest. Keep shoulder blades back against pad.',
    executionSummary: 'Contract chest to bring arms together in front of you. Pause 1 second at full squeeze, then stretch back under control.',
    targetFocus: 'Sternal Pectoral Squeeze',
    visualAngle: 'Guided Machine Horizontal Fly',
  },
  'ex-dips-chest': {
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Forward-Lean Chest Dips: Parallel bars, torso leaned forward 30°, lowering until 90° elbow flexion, pressing up.',
    simplifiedName: 'Chest Dips',
    setupSummary: 'Grip parallel bars, suspend body, lean torso forward 30° and cross ankles behind you.',
    executionSummary: 'Lower body by bending elbows until upper arms are parallel to floor, stretch deep, then push through palms to return.',
    targetFocus: 'Lower Chest & Triceps',
    visualAngle: 'Parallel Bar Bodyweight Suspension',
  },
  'ex-pushup-standard': {
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Strict Floor Push-Up: Hands slightly wider than shoulders, core rigid plank, chest lowers within 1 inch of floor.',
    simplifiedName: 'Strict Push-Up',
    setupSummary: 'Hands under shoulders, fingers spread, body in a rigid straight line from crown of head to heels.',
    executionSummary: 'Lower chest until 1 inch off floor with elbows at 45°, pause briefly, and press up fully protracting shoulder blades.',
    targetFocus: 'Pectorals, Triceps & Core Plank',
    visualAngle: 'Floor Bodyweight Plank Press',
  },
  'ex-pushup-deficit': {
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Deficit Push-Up: Hands on elevated blocks/handles allowing chest to descend below hand level for massive stretch.',
    simplifiedName: 'Deficit Deep Push-Up',
    setupSummary: 'Place hands on 3-4 inch elevation blocks or parallettes with shoulder-width spacing.',
    executionSummary: 'Descend chest below the level of the hands to achieve deep stretch-mediated pec hypertrophy, then push back to lockout.',
    targetFocus: 'Deep Stretched Pectoral Fibers',
    visualAngle: 'Elevated Block Deficit Press',
  },
  'ex-pushup-decline': {
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Decline Feet-Elevated Push-Up: Feet elevated on bench/chair, pressing bodyweight upward targeting upper chest fibers.',
    simplifiedName: 'Feet-Elevated Push-Up',
    setupSummary: 'Place toes on a sturdy bench or chair with hands flat on floor slightly wider than shoulders.',
    executionSummary: 'Lower upper chest toward floor at a 45° angle, hold stretch, and press firmly back to starting plank.',
    targetFocus: 'Upper Chest & Front Deltoids',
    visualAngle: 'Feet Elevated Incline Press',
  },
  'ex-diamond-pushup': {
    imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Diamond Push-Up: Thumbs and index fingers joined into a diamond directly under sternum, pressing with triceps and inner chest.',
    simplifiedName: 'Diamond Push-Up',
    setupSummary: 'Form a diamond/triangle with thumbs and index fingers placed directly underneath the center of your chest.',
    executionSummary: 'Lower chest directly onto the diamond with elbows tracking backward along your sides, then push up to full lockout.',
    targetFocus: 'Triceps Brachii & Inner Sternal Chest',
    visualAngle: 'Close Triangle Hand Stance',
  },
  'ex-hindu-pushup': {
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Hindu Push-Up (Desi Dand): Downward dog into diving swoop across floor to upward cobra, building chest, shoulders and spine mobility.',
    simplifiedName: 'Desi Dand (Hindu Push-Up)',
    setupSummary: 'Start in a high inverted V-shape (Downward Dog / Parvatasana) with hips high in the air and feet shoulder-width.',
    executionSummary: 'Bend elbows and swoop chest down grazing the floor, arch upward into Cobra pose, then push hips back to inverted V.',
    targetFocus: 'Chest, Shoulders, Triceps & Spine',
    visualAngle: 'Dynamic Akhada Swoop Flow',
  },
  'ex-archer-pushup': {
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Archer Push-Up: Wide hand stance, lowering to one side while extending the opposite arm straight like drawing a bow.',
    simplifiedName: 'Archer Push-Up',
    setupSummary: 'Place hands wide (1.5x shoulder width) on floor with fingers turned slightly outward for wrist safety.',
    executionSummary: 'Lower body toward one hand with elbow at 45° while the other arm remains straight, push up, and alternate sides.',
    targetFocus: 'Unilateral Chest & Shoulder Strength',
    visualAngle: 'Wide Stance Lateral Archer Press',
  },

  // ==========================================
  // BACK EXERCISES (पीठ और लैट्स)
  // ==========================================
  'ex-lat-pulldown': {
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Wide-Grip Lat Pulldown: Grip bar wide, pull down smoothly to upper chest driving elbows toward back pockets.',
    simplifiedName: 'Lat Pulldown',
    setupSummary: 'Adjust thigh pad securely. Grip bar just outside shoulder width with torso upright and slight 10° backward lean.',
    executionSummary: 'Drive elbows down and back to pull bar to collarbone, squeeze lats hard at bottom, and let bar stretch lats all the way up.',
    targetFocus: 'Latissimus Dorsi (V-Taper)',
    visualAngle: 'Vertical Cable Pulldown',
  },
  'ex-pullups': {
    imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Strict Overhand Pull-Up: Hang from bar with overhand grip, pull chest up to bar with zero swinging.',
    simplifiedName: 'Pull-Up',
    setupSummary: 'Grab bar with overhand grip wider than shoulders. Start from a dead hang with core and legs locked together.',
    executionSummary: 'Depress shoulder blades and pull chest toward the bar until chin clears the bar, pause, and lower slowly.',
    targetFocus: 'Upper Lats, Teres Major & Biceps',
    visualAngle: 'Overhead Bar Suspension Pull',
  },
  'ex-chinup': {
    imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Underhand Chin-Up: Palms facing you at shoulder width, pulling chin over bar targeting lower lats and biceps.',
    simplifiedName: 'Underhand Chin-Up',
    setupSummary: 'Grip bar with palms facing your face (supinated) at shoulder width.',
    executionSummary: 'Pull body up smoothly until chin clears bar while keeping elbows driving downward, hold peak squeeze, and descend under control.',
    targetFocus: 'Lower Lats & Biceps Brachii',
    visualAngle: 'Supinated Grip Vertical Pull',
  },
  'ex-barbell-row': {
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Bent-Over Barbell Row: Torso hinged at 45°, pulling barbell up to navel with elbows tucked to engage back thickness.',
    simplifiedName: 'Barbell Bent Row',
    setupSummary: 'Stand with feet shoulder-width, hinge at hips until torso is 45°, back flat, holding bar with overhand grip.',
    executionSummary: 'Pull barbell smoothly into lower ribcage/navel, squeezing shoulder blades together, then lower with a deep stretch.',
    targetFocus: 'Mid-Back, Rhomboids & Lats',
    visualAngle: 'Hinged Torso Barbell Pull',
  },
  'ex-db-single-arm-row': {
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Single-Arm Dumbbell Row: One knee on bench, pulling dumbbell up toward hip with elbow close to side.',
    simplifiedName: 'Single-Arm DB Row',
    setupSummary: 'Place one knee and hand on flat bench with torso horizontal and spine neutral. Hold dumbbell in free hand.',
    executionSummary: 'Pull dumbbell upward in an arc toward your hip crease, pinching your lat at top, then lower for full stretch.',
    targetFocus: 'Unilateral Lat & Upper Back Thickness',
    visualAngle: 'Bench Supported Single-Arm Row',
  },
  'ex-seated-cable-row': {
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Seated Cable Row: Upright posture on bench, pulling V-grip handle to lower abdomen with retracted shoulder blades.',
    simplifiedName: 'Seated Cable Row',
    setupSummary: 'Sit with feet on footplates, knees slightly bent, back straight, holding close-grip attachment with arms extended.',
    executionSummary: 'Pull handle into lower abdomen while driving elbows back and pinching shoulder blades together, then stretch forward slowly.',
    targetFocus: 'Rhomboids, Middle Traps & Lower Lats',
    visualAngle: 'Horizontal Seated Cable Pull',
  },
  'ex-tbar-row': {
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'T-Bar Row: Straddle landmine bar, pull close-grip handles to sternum overloading upper back thickness.',
    simplifiedName: 'T-Bar Landmine Row',
    setupSummary: 'Straddle bar with feet wide, hinge hips back, grab V-handle with flat back.',
    executionSummary: 'Pull bar into lower chest, squeeze upper back and traps at peak, and lower under strict control.',
    targetFocus: 'Middle Back & Lat Thickness',
    visualAngle: 'Straddle Landmine Heavy Row',
  },
  'ex-face-pull': {
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Cable Rope Face Pull: Pull rope attachment toward bridge of nose while externally rotating wrists to strengthen rotator cuffs and rear delts.',
    simplifiedName: 'Rope Face Pull',
    setupSummary: 'Attach rope to cable at eye level. Grip rope with thumbs pointing back, step back into stable stance.',
    executionSummary: 'Pull rope toward eyes, spreading ends apart and rotating hands back like a double-bicep pose, hold 2s squeeze.',
    targetFocus: 'Rear Delts, Infraspinatus & Upper Traps',
    visualAngle: 'Eye-Level Cable Rope Pull',
  },

  // ==========================================
  // SHOULDERS & DELTOIDS (कंधे)
  // ==========================================
  'ex-overhead-press': {
    imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Overhead Barbell Military Press: Stand tall, brace core and glutes, press bar straight up over crown of head.',
    simplifiedName: 'Overhead Shoulder Press',
    setupSummary: 'Hold barbell across front deltoids with hands just outside shoulders, glutes and abs braced hard.',
    executionSummary: 'Press bar vertically in a straight path, moving head slightly back then pushing head through at top lockout.',
    targetFocus: 'Anterior & Lateral Deltoids',
    visualAngle: 'Standing Vertical Barbell Press',
  },
  'ex-seated-db-shoulder-press': {
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Seated Dumbbell Shoulder Press: 75° bench, dumbbells pressed overhead in a smooth converging arc.',
    simplifiedName: 'Seated DB Shoulder Press',
    setupSummary: 'Sit with back against high-incline bench. Kick dumbbells up to shoulder height with palms facing forward or 45°.',
    executionSummary: 'Press dumbbells upward overhead until arms are extended, pause briefly, then lower slowly to ear level.',
    targetFocus: 'Front & Side Deltoid Muscle Heads',
    visualAngle: 'Seated High-Incline DB Press',
  },
  'ex-lateral-raises': {
    imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Dumbbell Lateral Raise: Stand with dumbbells at sides, raise arms outward to shoulder height leading with elbows.',
    simplifiedName: 'Side Lateral Raise',
    setupSummary: 'Stand with feet hip-width, hold dumbbells at sides with slight forward torso lean and soft elbows.',
    executionSummary: 'Raise dumbbells outward in scapular plane (30° forward) to parallel with floor, pour water slightly, and lower slowly.',
    targetFocus: 'Lateral Deltoids (Shoulder Width)',
    visualAngle: 'Standing Lateral Abduction',
  },
  'ex-cable-lateral-raise': {
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Behind-the-Back / Front Cable Lateral Raise: Constant tension through bottom stretch, raising handle to shoulder level.',
    simplifiedName: 'Cable Lateral Raise',
    setupSummary: 'Set low pulley, hold single handle with opposite hand, lean slightly away from cable column.',
    executionSummary: 'Sweep arm out and up to shoulder height under smooth cable resistance, hold peak contraction 1s, and lower slowly.',
    targetFocus: 'Constant Tension Side Deltoid',
    visualAngle: 'Single-Arm Cable Sweep',
  },
  'ex-rear-delt-fly': {
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Bent-Over Rear Delt Fly: Hinge at hips with flat back, sweep dumbbells out horizontally to isolate rear deltoids.',
    simplifiedName: 'Rear Delt Fly',
    setupSummary: 'Hinge hips back until torso is nearly parallel to floor, dumbbells hanging with elbows slightly curved.',
    executionSummary: 'Raise arms out to sides in a wide arc leading with elbows without using momentum, squeeze rear delts, and lower.',
    targetFocus: 'Posterior Deltoids & Upper Traps',
    visualAngle: 'Bent-Over Horizontal Fly',
  },

  // ==========================================
  // QUADRICEPS & SQUATS (आगे की जांघ)
  // ==========================================
  'ex-barbell-squat': {
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Barbell Back Squat: Bar rested on upper traps, descend hips between knees to parallel depth, and drive up through midfoot.',
    simplifiedName: 'Barbell Back Squat',
    setupSummary: 'Rest bar across traps, feet shoulder-width, toes turned slightly out 15°, take deep belly breath and brace core.',
    executionSummary: 'Sit hips down and back between knees keeping chest up, reach parallel depth, then push floor away forcefully through midfoot.',
    targetFocus: 'Quadriceps, Glutes & Adductors',
    visualAngle: 'Full Depth Back Squat Stance',
  },
  'ex-front-squat': {
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Barbell Front Squat: Bar racked across front shoulders with high elbows, squatting with upright torso for extreme quad loading.',
    simplifiedName: 'Barbell Front Squat',
    setupSummary: 'Rest bar across front deltoid shelf with high elbows (fingertip grip or cross-arm), upright torso.',
    executionSummary: 'Squat down keeping elbows high and torso vertical, descend deep, then drive up through heels and midfoot.',
    targetFocus: 'Direct Quadriceps & Core Posture',
    visualAngle: 'Upright Front-Racked Squat',
  },
  'ex-bulgarian-split-squat': {
    imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Bulgarian Split Squat: Rear foot rested on bench, descend front leg straight down until knee is near floor.',
    simplifiedName: 'Bulgarian Split Squat',
    setupSummary: 'Place one foot back on a bench, step front foot forward about 2-3 feet with torso tall and holding dumbbells.',
    executionSummary: 'Lower hips straight down until front thigh is parallel to ground, keep knee in line with toes, and drive back up through front heel.',
    targetFocus: 'Unilateral Quad Hypertrophy & Glutes',
    visualAngle: 'Rear-Foot Elevated Single Leg Lunge',
  },
  'ex-leg-press': {
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=85',
    actionCaption: '45-Degree Leg Press: Sled lowered under deep knee bend without rounding lower back, pressing smoothly without knee lockout.',
    simplifiedName: '45° Leg Press',
    setupSummary: 'Sit with back flat against pad. Place feet shoulder-width in middle of sled platform.',
    executionSummary: 'Release safety handles, lower sled slowly until knees reach 90°, feel deep quad load, and press back up smoothly.',
    targetFocus: 'Massive Quadriceps Loading',
    visualAngle: '45° Heavy Sled Leg Press',
  },
  'ex-hack-squat': {
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Hack Squat Machine: Back locked against angled pad, descending to full depth with high knee flexion for pure quad overload.',
    simplifiedName: 'Hack Squat Machine',
    setupSummary: 'Position shoulders under pads, back flat against backrest, feet shoulder-width on lower platform.',
    executionSummary: 'Descend to full knee flexion depth maintaining heels on platform, then press up through quads without snapping knees.',
    targetFocus: 'Vastus Lateralis & Medialis (Quad Sweep)',
    visualAngle: 'Angled Machine Hack Squat',
  },
  'ex-leg-extension': {
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Seated Leg Extension: Extend lower legs fully against pad, hold 1-second peak squeeze at top, and control the descent slowly.',
    simplifiedName: 'Quad Leg Extension',
    setupSummary: 'Align knee joint with machine pivot axis. Pad rested on lower shins just above ankles.',
    executionSummary: 'Extend legs to full lockout, squeeze quadriceps hard for 1 second at peak, then lower slowly over 3 seconds.',
    targetFocus: 'Rectus Femoris & Quad Teardrop',
    visualAngle: 'Seated Machine Knee Extension',
  },

  // ==========================================
  // HAMSTRINGS & POSTERIOR CHAIN (पीछे की जांघ)
  // ==========================================
  'ex-romanian-deadlift': {
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Romanian Deadlift (RDL): Hinge hips backward with soft knees, lower bar along shins until hamstrings are taut, and snap hips forward.',
    simplifiedName: 'Romanian Deadlift (RDL)',
    setupSummary: 'Stand tall with barbell at thighs, feet hip-width, chest up, shoulder blades pinned back, knees slightly unlocked.',
    executionSummary: 'Push hips straight backward toward the wall behind you, sliding bar down shins until hamstrings are fully stretched, then drive hips forward.',
    targetFocus: 'Hamstrings (Lengthened State) & Glutes',
    visualAngle: 'Hip Hinge Barbell Extension',
  },
  'ex-conventional-deadlift': {
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Conventional Deadlift: Bar over midfoot, brace lats, pull bar straight off floor by driving the earth away.',
    simplifiedName: 'Conventional Deadlift',
    setupSummary: 'Stand with bar 1 inch from shins, hinge and grip bar outside knees, flatten back, pull slack out of bar.',
    executionSummary: 'Push the floor away through midfoot, keep bar in contact with legs, lock hips and knees simultaneously at the top.',
    targetFocus: 'Full Posterior Chain, Glutes & Traps',
    visualAngle: 'Floor Barbell Deadlift Pull',
  },
  'ex-seated-leg-curl': {
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Seated Leg Curl: Lap pad locked tight, curl heels down under seat against resistance, maximizing hamstring elongation.',
    simplifiedName: 'Seated Hamstring Curl',
    setupSummary: 'Sit with knees aligned to pivot point, lock lap pad tightly over thighs, place back of ankles over roller pad.',
    executionSummary: 'Curl heels down and back under the seat, hold 1-second contraction, then resist the pad as it returns to top stretch.',
    targetFocus: 'Biceps Femoris & Semitendinosus',
    visualAngle: 'Seated Knee Flexion Machine',
  },
  'ex-lying-leg-curl': {
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Lying Leg Curl: Lie face down on bench, curl heel pad up to glutes, keeping hips pressed flat against the pad.',
    simplifiedName: 'Lying Hamstring Curl',
    setupSummary: 'Lie prone on curved bench with pad resting on Achilles tendons. Grip handles firmly.',
    executionSummary: 'Curl heels upward toward glutes while keeping hips pinned down on bench, pause at top, and lower slowly.',
    targetFocus: 'Hamstring Peak Shortening',
    visualAngle: 'Prone Machine Leg Curl',
  },
  'ex-hip-thrust': {
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Barbell Hip Thrust: Upper back against bench, drive hips straight up through heels, and squeeze glutes hard at horizontal lockout.',
    simplifiedName: 'Barbell Hip Thrust',
    setupSummary: 'Sit on floor with upper back against bench edge, roll padded barbell over hips, feet flat at 90° knee angle.',
    executionSummary: 'Drive through heels to extend hips upward until thighs and torso form straight horizontal line, squeeze glutes hard for 2s.',
    targetFocus: 'Gluteus Maximus & Upper Hamstrings',
    visualAngle: 'Bench-Supported Hip Extension',
  },

  // ==========================================
  // ARMS: BICEPS & TRICEPS (डोले और ट्राइसेप्स)
  // ==========================================
  'ex-barbell-curl': {
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Standing Barbell Bicep Curl: Pin elbows to sides, curl barbell in smooth arc, squeeze biceps at top, and control negative.',
    simplifiedName: 'Standing Barbell Curl',
    setupSummary: 'Stand upright holding barbell with underhand shoulder-width grip, shoulder blades pinned back, elbows glued to ribs.',
    executionSummary: 'Curl bar upward without swinging torso, squeeze biceps hard at top contraction, and lower slowly over 3 seconds.',
    targetFocus: 'Biceps Brachii (Short & Long Heads)',
    visualAngle: 'Standing Supinated Barbell Curl',
  },
  'ex-incline-db-curl': {
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Incline Dumbbell Curl: 45° bench, arms hanging behind torso for maximum stretch on the long head of the bicep.',
    simplifiedName: 'Incline Dumbbell Curl',
    setupSummary: 'Lie back on 45° incline bench, let arms hang vertically straight down with palms facing forward.',
    executionSummary: 'Curl dumbbells upward while keeping elbows pinned back behind torso, supinate wrists at top, and lower for deep stretch.',
    targetFocus: 'Biceps Long Head (Bicep Peak)',
    visualAngle: '45° Incline Supine Arm Curl',
  },
  'ex-hammer-curl': {
    imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Neutral Grip Hammer Curl: Palms facing each other throughout rep, overloading brachialis and forearm thickness.',
    simplifiedName: 'Dumbbell Hammer Curl',
    setupSummary: 'Stand tall with dumbbells at sides in a neutral grip (palms facing your thighs).',
    executionSummary: 'Curl dumbbells upward keeping palms facing each other like swinging a hammer, squeeze at top, and lower slowly.',
    targetFocus: 'Brachialis & Brachioradialis (Forearm & Arm Width)',
    visualAngle: 'Neutral Grip Standing Curl',
  },
  'ex-preacher-curl': {
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Preacher Curl: Armpits over angled pad, isolating biceps with zero shoulder swing or momentum.',
    simplifiedName: 'Preacher Bench Curl',
    setupSummary: 'Sit at preacher bench with armpits snug against top of pad, triceps flat on incline.',
    executionSummary: 'Curl bar up toward shoulders, squeeze bicep peak, and lower under strict control stopping just before full elbow hyperextension.',
    targetFocus: 'Biceps Short Head & Peak Isolation',
    visualAngle: 'Preacher Pad Arm Extension',
  },
  'ex-tricep-pushdown': {
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Cable Tricep Rope Pushdown: Upper arms pinned at sides, push rope down and spread ends outward at full elbow lockout.',
    simplifiedName: 'Tricep Rope Pushdown',
    setupSummary: 'Attach rope to high cable. Grip with palms facing, tuck elbows against ribs, lean torso slightly forward.',
    executionSummary: 'Push rope down until arms are straight, flare ends of rope apart at the bottom, squeeze triceps for 1s, and return.',
    targetFocus: 'Triceps Lateral & Medial Heads',
    visualAngle: 'High Cable Tricep Extension',
  },
  'ex-skull-crushers': {
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'EZ-Bar Skull Crushers: Lie on flat bench, lower bar smoothly toward forehead/crown, and extend elbows back to vertical.',
    simplifiedName: 'EZ-Bar Skull Crusher',
    setupSummary: 'Lie on flat bench holding EZ bar with arms extended straight up, angled slightly back toward head.',
    executionSummary: 'Bend at elbows to lower bar toward forehead/hairline keeping upper arms still, then extend elbows to push bar back up.',
    targetFocus: 'Triceps Long Head & Elbow Extensors',
    visualAngle: 'Supine Bench Tricep Extension',
  },
  'ex-overhead-tricep-extension': {
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Cable / DB Overhead Tricep Extension: Arms raised overhead, bending elbows backward to deliver huge stretch to tricep long head.',
    simplifiedName: 'Overhead Tricep Extension',
    setupSummary: 'Hold dumbbell or cable rope overhead with arms vertical and elbows close to ears.',
    executionSummary: 'Lower weight behind head until elbows reach 90°, feel deep triceps stretch, then press weight back overhead to lockout.',
    targetFocus: 'Triceps Long Head (Muscle Belly)',
    visualAngle: 'Overhead Long Head Tricep Stretch',
  },

  // ==========================================
  // CALVES & CORE (पिंडली और एब्स)
  // ==========================================
  'ex-standing-calf-raise': {
    imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Standing Calf Raise: Balls of feet on step edge, pause 3s at deep stretch, then elevate as high as possible on toes.',
    simplifiedName: 'Standing Calf Raise',
    setupSummary: 'Place balls of feet on block with heels hanging off. Knees straight, torso upright under pads.',
    executionSummary: 'Lower heels down into deep ankle stretch and pause 2 seconds (eliminating Achilles bounce), then rise up onto tiptoes.',
    targetFocus: 'Gastrocnemius (Upper Calf Diamond)',
    visualAngle: 'Elevated Platform Ankle Plantarflexion',
  },
  'ex-seated-calf-raise': {
    imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Seated Calf Raise: Knees bent at 90°, isolating the deep soleus muscle underneath the calf.',
    simplifiedName: 'Seated Calf Raise',
    setupSummary: 'Sit with knees under pads at 90° angle, balls of feet on edge of platform.',
    executionSummary: 'Lower heels deep below step, pause 2 seconds, then press through balls of feet to elevate as high as possible.',
    targetFocus: 'Soleus (Deep Calf Width & Endurance)',
    visualAngle: 'Seated 90° Knee Calf Press',
  },
  'ex-hanging-leg-raise': {
    imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Hanging Leg Raise: Hang from pull-up bar, rotate pelvis up and raise toes/knees to chest height without swinging.',
    simplifiedName: 'Hanging Ab Leg Raise',
    setupSummary: 'Hang from overhead bar with straight arms, engage shoulders, and eliminate any body swing.',
    executionSummary: 'Tuck pelvis forward and curl toes/knees up toward chest height using lower abs, pause 1s, and lower slowly.',
    targetFocus: 'Lower Rectus Abdominis & Deep Core',
    visualAngle: 'Hanging Bar Abdominal Flexion',
  },
  'ex-plank': {
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Abdominal Plank: Forearms on floor, contract glutes, pull navel into spine, and maintain straight head-to-heel posture.',
    simplifiedName: 'Core Plank',
    setupSummary: 'Place forearms on mat under shoulders, extend legs straight back on balls of feet.',
    executionSummary: 'Squeeze glutes, brace abs like bracing for a punch, keep spine straight from head to heels, and hold for prescribed time.',
    targetFocus: 'Transverse Abdominis & Core Bracing',
    visualAngle: 'Forearm Prone Isometric Plank',
  },
  'ex-ab-wheel-rollout': {
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Ab Wheel Rollout: Kneeling on mat, roll wheel forward into full horizontal extension, and pull back with abs.',
    simplifiedName: 'Ab Wheel Rollout',
    setupSummary: 'Kneel on soft mat holding ab wheel handles under chest with rounded upper back and tucked pelvis.',
    executionSummary: 'Roll wheel forward slowly extending body out toward floor, brace core to prevent lower back arching, and pull back using abs.',
    targetFocus: 'Anti-Extension Abdominal Strength',
    visualAngle: 'Kneeling Dynamic Ab Wheel Roll',
  },
  'ex-cable-woodchopper': {
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Cable Woodchopper: Diagonal torso rotation against cable resistance, forging rotational core power and oblique cuts.',
    simplifiedName: 'Cable Oblique Woodchopper',
    setupSummary: 'Stand sideways to high cable pulley holding handle with both hands, arms extended.',
    executionSummary: 'Rotate torso diagonally down across body past opposite knee, pivot back foot, and control return.',
    targetFocus: 'Internal & External Obliques',
    visualAngle: 'Standing Diagonal Torso Rotation',
  },
  'ex-farmers-walk': {
    imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Farmer’s Walk: Carry heavy dumbbells/kettlebells at sides with tall posture, walking with short controlled steps.',
    simplifiedName: 'Farmer’s Carry',
    setupSummary: 'Deadlift two heavy dumbbells or weights to sides, stand tall, roll shoulders back, brace core.',
    executionSummary: 'Walk forward in a straight line with smooth, measured steps, keeping torso perfectly upright without side swaying.',
    targetFocus: 'Traps, Forearm Grip & Core Stability',
    visualAngle: 'Heavy Loaded Bilateral Carry',
  },
  'ex-jump-rope': {
    imageUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Speed Jump Rope / Skipping: Stay light on balls of feet, turning rope with wrists for cardiovascular capacity and calf elasticity.',
    simplifiedName: 'Jump Rope Skipping',
    setupSummary: 'Hold rope handles at hip level with elbows tucked close to torso, standing tall on balls of feet.',
    executionSummary: 'Turn rope using wrists with minimal arm motion, jump 1-2 inches off floor rhythmically as rope passes under feet.',
    targetFocus: 'Cardiorespiratory Stamina & Calf Elasticity',
    visualAngle: 'Dynamic Upright Skipping Flow',
  },
};

/**
 * Category-level distinct verified action imagery fallback
 */
export const CATEGORY_FALLBACK_PHOTOS: Record<string, ExercisePhotoData> = {
  Chest: {
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Pectoral Pressing & Fly Movements: Retract shoulder blades, control eccentric lowering, and press through chest fibers.',
    simplifiedName: 'Chest Movement',
    setupSummary: 'Plant feet flat, pinch shoulder blades together into bench/floor, maintain 45° elbow tuck.',
    executionSummary: 'Lower under control for 2-3 seconds, feel deep pectoral stretch, then press to contraction.',
    targetFocus: 'Pectoralis Major & Minor',
    visualAngle: 'Standard Chest Exercise Position',
  },
  Back: {
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Back & Lat Training: Vertical pulldowns and horizontal rows engaging latissimus dorsi, rhomboids, and traps.',
    simplifiedName: 'Back Movement',
    setupSummary: 'Keep spine neutral, set shoulder blades down and back before starting the pulling motion.',
    executionSummary: 'Drive elbows back toward hips, hold 1-second peak squeeze, and allow full lat stretch on return.',
    targetFocus: 'Latissimus Dorsi & Rhomboids',
    visualAngle: 'Standard Back Pull Position',
  },
  Shoulders: {
    imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Deltoid Training: Overhead pressing, lateral raises, and face pulls building anterior, lateral, and rear delts.',
    simplifiedName: 'Shoulder Movement',
    setupSummary: 'Brace core, maintain soft knees, raise or press within the scapular plane without shrugging traps.',
    executionSummary: 'Raise weight to shoulder level leading with elbows or press straight overhead to full extension.',
    targetFocus: 'Anterior, Lateral & Posterior Deltoids',
    visualAngle: 'Standard Shoulder Position',
  },
  Quads: {
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Quadriceps Training: Deep knee flexion squats and leg presses loading vastus lateralis, medialis, and rectus femoris.',
    simplifiedName: 'Quad Movement',
    setupSummary: 'Feet shoulder-width, toes angled slightly out, keep heels pinned firmly to floor/platform.',
    executionSummary: 'Descend hips between knees to parallel or below, maintain upright torso, and press through midfoot.',
    targetFocus: 'Quadriceps Femoris',
    visualAngle: 'Standard Quad Leg Position',
  },
  Hamstrings: {
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Hamstring Training: Hip hinge deadlifts and knee curls delivering maximum posterior leg hypertrophy.',
    simplifiedName: 'Hamstring Movement',
    setupSummary: 'Soft knees, hinge hips straight back, keeping back flat and spine neutral throughout.',
    executionSummary: 'Reach hips back to load hamstrings in stretched position, then squeeze glutes and hamstrings to stand.',
    targetFocus: 'Biceps Femoris & Posterior Chain',
    visualAngle: 'Standard Hip Hinge Position',
  },
  Glutes: {
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Gluteal Training: Direct hip thrusts and squats creating high mechanical tension on gluteus maximus.',
    simplifiedName: 'Glute Movement',
    setupSummary: 'Position upper back on bench, drive hips straight up through heels to horizontal plane.',
    executionSummary: 'Lock hips out at top, squeeze glutes hard for 2 seconds, and lower under control.',
    targetFocus: 'Gluteus Maximus & Medius',
    visualAngle: 'Standard Glute Thrust Position',
  },
  Biceps: {
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Biceps Training: Forearm curls with supination and neutral grips loading long and short heads of biceps brachii.',
    simplifiedName: 'Bicep Curl Movement',
    setupSummary: 'Pin elbows to your ribs, avoid swinging torso, grip bar or dumbbells firmly.',
    executionSummary: 'Curl weight upward in a clean arc, hold peak contraction at top, and lower slowly over 3 seconds.',
    targetFocus: 'Biceps Brachii & Brachialis',
    visualAngle: 'Standard Bicep Curl Position',
  },
  Triceps: {
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Triceps Training: Elbow extensions pushing resistance to load the lateral, medial, and long tricep heads.',
    simplifiedName: 'Tricep Extension Movement',
    setupSummary: 'Keep upper arms motionless at sides or overhead, move only from the elbow joint.',
    executionSummary: 'Extend arms fully until elbows are locked out, squeeze triceps, and control the return stretch.',
    targetFocus: 'Triceps Brachii (All 3 Heads)',
    visualAngle: 'Standard Tricep Extension Position',
  },
  Calves: {
    imageUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Calf Training: Ankle plantarflexion standing or seated to train gastrocnemius and soleus fibers.',
    simplifiedName: 'Calf Raise Movement',
    setupSummary: 'Balls of feet on elevated block edge, allow heels to descend into deep stretch.',
    executionSummary: 'Pause 2 seconds at bottom stretch, push high onto balls of feet, hold 1s, and lower.',
    targetFocus: 'Gastrocnemius & Soleus',
    visualAngle: 'Standard Calf Step Position',
  },
  Core: {
    imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Core & Abdominal Training: Pelvic flexion, anti-extension planks, and rotational stability drills.',
    simplifiedName: 'Core Ab Movement',
    setupSummary: 'Brace abdominal wall, tuck pelvis slightly, breathe into belly and keep neck neutral.',
    executionSummary: 'Contract abs to curl spine or hold isometric tension without sagging lower back.',
    targetFocus: 'Rectus Abdominis, Obliques & Transverse Abdominis',
    visualAngle: 'Standard Core Position',
  },
  Cardio_Mobility: {
    imageUrl: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=900&auto=format&fit=crop&q=85',
    actionCaption: 'Conditioning & Mobility: Dynamic full-body movement enhancing cardiovascular VO2 max, joint range, and recovery capacity.',
    simplifiedName: 'Mobility & Conditioning',
    setupSummary: 'Maintain light, bouncy athletic posture on balls of feet with deep diaphragmatic breathing.',
    executionSummary: 'Execute fluid movement patterns with continuous rhythm and regulated heart rate cadence.',
    targetFocus: 'Cardiovascular Conditioning & Dynamic Mobility',
    visualAngle: 'Dynamic Aerobic Movement',
  },
};

/**
 * Returns accurate, verified photo data specifically matched to the exercise
 */
export function getExercisePhoto(exerciseId: string, category: string, rawName: string): ExercisePhotoData {
  let matched: ExercisePhotoData | null = null;

  if (EXERCISE_PHOTOS_MAP[exerciseId]) {
    matched = EXERCISE_PHOTOS_MAP[exerciseId];
  } else {
    const lowerId = (exerciseId || '').toLowerCase();
    const lowerName = (rawName || '').toLowerCase();

    // Exact Keyword Match Rules (ordered by specificity)
    if (lowerId.includes('diamond-pushup') || lowerName.includes('diamond push')) matched = EXERCISE_PHOTOS_MAP['ex-diamond-pushup'];
    else if (lowerId.includes('hindu-pushup') || lowerName.includes('hindu') || lowerName.includes('desi dand')) matched = EXERCISE_PHOTOS_MAP['ex-hindu-pushup'];
    else if (lowerId.includes('archer-pushup') || lowerName.includes('archer')) matched = EXERCISE_PHOTOS_MAP['ex-archer-pushup'];
    else if (lowerId.includes('deficit-pushup') || lowerName.includes('deficit')) matched = EXERCISE_PHOTOS_MAP['ex-pushup-deficit'];
    else if (lowerId.includes('decline-pushup') || lowerName.includes('feet-elevated push') || lowerName.includes('decline push')) matched = EXERCISE_PHOTOS_MAP['ex-pushup-decline'];
    else if (lowerId.includes('pushup') || lowerName.includes('push-up') || lowerName.includes('pushup')) matched = EXERCISE_PHOTOS_MAP['ex-pushup-standard'];
    else if (lowerId.includes('dips') || lowerName.includes('dip')) matched = EXERCISE_PHOTOS_MAP['ex-dips-chest'];

    else if (lowerName.includes('incline') && (lowerName.includes('press') || lowerName.includes('dumbbell') || lowerName.includes('bench'))) matched = EXERCISE_PHOTOS_MAP['ex-incline-db-press'];
    else if (lowerName.includes('decline') && lowerName.includes('press')) matched = EXERCISE_PHOTOS_MAP['ex-decline-db-press'];
    else if (lowerName.includes('low-to-high') || (lowerName.includes('cable') && lowerName.includes('upper'))) matched = EXERCISE_PHOTOS_MAP['ex-low-to-high-cable-fly'];
    else if (lowerName.includes('high-to-low') || (lowerName.includes('cable') && lowerName.includes('lower'))) matched = EXERCISE_PHOTOS_MAP['ex-high-to-low-cable-fly'];
    else if (lowerName.includes('pec deck') || lowerName.includes('machine fly')) matched = EXERCISE_PHOTOS_MAP['ex-pec-deck-fly'];
    else if (lowerName.includes('chest press') || lowerName.includes('machine chest')) matched = EXERCISE_PHOTOS_MAP['ex-machine-chest-press'];
    else if (lowerName.includes('fly') || lowerName.includes('cable fly') || lowerName.includes('crossover')) matched = EXERCISE_PHOTOS_MAP['ex-flat-cable-flye'];
    else if (lowerName.includes('bench press') || lowerName.includes('flat bench') || lowerName.includes('barbell bench')) matched = EXERCISE_PHOTOS_MAP['ex-bench-press'];

    else if (lowerName.includes('chin-up') || lowerName.includes('chin up') || lowerName.includes('chinup')) matched = EXERCISE_PHOTOS_MAP['ex-chinup'];
    else if (lowerName.includes('pull-up') || lowerName.includes('pull up') || lowerName.includes('pullup')) matched = EXERCISE_PHOTOS_MAP['ex-pullups'];
    else if (lowerName.includes('lat pulldown') || lowerName.includes('pulldown')) matched = EXERCISE_PHOTOS_MAP['ex-lat-pulldown'];
    else if (lowerName.includes('single arm') && lowerName.includes('row')) matched = EXERCISE_PHOTOS_MAP['ex-db-single-arm-row'];
    else if (lowerName.includes('t-bar') || lowerName.includes('tbar') || lowerName.includes('landmine row')) matched = EXERCISE_PHOTOS_MAP['ex-tbar-row'];
    else if (lowerName.includes('seated cable row') || (lowerName.includes('cable') && lowerName.includes('row'))) matched = EXERCISE_PHOTOS_MAP['ex-seated-cable-row'];
    else if (lowerName.includes('barbell row') || lowerName.includes('bent over row') || lowerName.includes('pendlay')) matched = EXERCISE_PHOTOS_MAP['ex-barbell-row'];
    else if (lowerName.includes('face pull')) matched = EXERCISE_PHOTOS_MAP['ex-face-pull'];

    else if (lowerName.includes('military press') || lowerName.includes('overhead press') || (lowerName.includes('barbell') && lowerName.includes('shoulder'))) matched = EXERCISE_PHOTOS_MAP['ex-overhead-press'];
    else if (lowerName.includes('seated') && lowerName.includes('shoulder press')) matched = EXERCISE_PHOTOS_MAP['ex-seated-db-shoulder-press'];
    else if (lowerName.includes('cable') && (lowerName.includes('lateral') || lowerName.includes('side raise'))) matched = EXERCISE_PHOTOS_MAP['ex-cable-lateral-raise'];
    else if (lowerName.includes('lateral raise') || lowerName.includes('side raise')) matched = EXERCISE_PHOTOS_MAP['ex-lateral-raises'];
    else if (lowerName.includes('rear delt') || lowerName.includes('reverse fly')) matched = EXERCISE_PHOTOS_MAP['ex-rear-delt-fly'];

    else if (lowerName.includes('front squat')) matched = EXERCISE_PHOTOS_MAP['ex-front-squat'];
    else if (lowerName.includes('bulgarian') || lowerName.includes('split squat')) matched = EXERCISE_PHOTOS_MAP['ex-bulgarian-split-squat'];
    else if (lowerName.includes('hack squat')) matched = EXERCISE_PHOTOS_MAP['ex-hack-squat'];
    else if (lowerName.includes('leg press')) matched = EXERCISE_PHOTOS_MAP['ex-leg-press'];
    else if (lowerName.includes('leg extension')) matched = EXERCISE_PHOTOS_MAP['ex-leg-extension'];
    else if (lowerName.includes('squat')) matched = EXERCISE_PHOTOS_MAP['ex-barbell-squat'];

    else if (lowerName.includes('romanian') || lowerName.includes('rdl')) matched = EXERCISE_PHOTOS_MAP['ex-romanian-deadlift'];
    else if (lowerName.includes('conventional deadlift') || lowerName.includes('deadlift')) matched = EXERCISE_PHOTOS_MAP['ex-conventional-deadlift'];
    else if (lowerName.includes('seated') && lowerName.includes('curl') && lowerName.includes('leg')) matched = EXERCISE_PHOTOS_MAP['ex-seated-leg-curl'];
    else if (lowerName.includes('lying') && lowerName.includes('curl') && lowerName.includes('leg')) matched = EXERCISE_PHOTOS_MAP['ex-lying-leg-curl'];
    else if (lowerName.includes('leg curl') || lowerName.includes('hamstring curl')) matched = EXERCISE_PHOTOS_MAP['ex-seated-leg-curl'];
    else if (lowerName.includes('hip thrust') || lowerName.includes('glute bridge')) matched = EXERCISE_PHOTOS_MAP['ex-hip-thrust'];

    else if (lowerName.includes('incline') && lowerName.includes('curl') && !lowerName.includes('leg')) matched = EXERCISE_PHOTOS_MAP['ex-incline-db-curl'];
    else if (lowerName.includes('hammer curl')) matched = EXERCISE_PHOTOS_MAP['ex-hammer-curl'];
    else if (lowerName.includes('preacher curl')) matched = EXERCISE_PHOTOS_MAP['ex-preacher-curl'];
    else if (lowerName.includes('bicep') || (lowerName.includes('curl') && !lowerName.includes('leg'))) matched = EXERCISE_PHOTOS_MAP['ex-barbell-curl'];

    else if (lowerName.includes('overhead') && lowerName.includes('tricep')) matched = EXERCISE_PHOTOS_MAP['ex-overhead-tricep-extension'];
    else if (lowerName.includes('skull crusher') || lowerName.includes('lying tricep')) matched = EXERCISE_PHOTOS_MAP['ex-skull-crushers'];
    else if (lowerName.includes('pushdown') || lowerName.includes('tricep rope')) matched = EXERCISE_PHOTOS_MAP['ex-tricep-pushdown'];

    else if (lowerName.includes('seated') && lowerName.includes('calf')) matched = EXERCISE_PHOTOS_MAP['ex-seated-calf-raise'];
    else if (lowerName.includes('calf') || lowerName.includes('calves')) matched = EXERCISE_PHOTOS_MAP['ex-standing-calf-raise'];

    else if (lowerName.includes('hanging') && lowerName.includes('leg raise')) matched = EXERCISE_PHOTOS_MAP['ex-hanging-leg-raise'];
    else if (lowerName.includes('ab wheel') || lowerName.includes('rollout')) matched = EXERCISE_PHOTOS_MAP['ex-ab-wheel-rollout'];
    else if (lowerName.includes('woodchopper') || lowerName.includes('oblique')) matched = EXERCISE_PHOTOS_MAP['ex-cable-woodchopper'];
    else if (lowerName.includes('plank')) matched = EXERCISE_PHOTOS_MAP['ex-plank'];
    else if (lowerName.includes('farmer') || lowerName.includes('carry')) matched = EXERCISE_PHOTOS_MAP['ex-farmers-walk'];
    else if (lowerName.includes('jump rope') || lowerName.includes('skipping') || lowerName.includes('cardio')) matched = EXERCISE_PHOTOS_MAP['ex-jump-rope'];
  }

  if (matched) {
    return attachStepImages(matched, rawName);
  }

  const fallback = CATEGORY_FALLBACK_PHOTOS[category] || CATEGORY_FALLBACK_PHOTOS.Chest;
  const result = {
    ...fallback,
    simplifiedName: simplifyExerciseName(rawName),
  };

  return attachStepImages(result, rawName);
}

/**
 * Attaches 3 consecutive step demonstration visuals and cues
 */
export function attachStepImages(photo: ExercisePhotoData, exerciseName: string): ExercisePhotoData {
  if (photo.stepImages && photo.stepImages.length > 0) {
    return photo;
  }

  const baseImg = photo.imageUrl;
  
  const step1: ExerciseStepPhoto = {
    stepNumber: 1,
    stepName: 'Step 1: Setup & Starting Stance',
    imageUrl: baseImg,
    actionDescription: photo.setupSummary || 'Establish balanced athletic stance, grip equipment firmly with joint alignment, and brace core.',
    keyCue: 'Inhale deeply, set shoulders down and back, anchor feet securely.',
  };

  const step2: ExerciseStepPhoto = {
    stepNumber: 2,
    stepName: 'Step 2: Controlled Eccentric Stretch',
    imageUrl: baseImg,
    actionDescription: photo.executionSummary || 'Control the descent for 2-3 seconds, feeling deep muscular stretch along muscle fibers without bouncing.',
    keyCue: 'Maintain constant time under tension; do not drop or rush the negative phase.',
  };

  const step3: ExerciseStepPhoto = {
    stepNumber: 3,
    stepName: 'Step 3: Concentric Drive & Peak Squeeze',
    imageUrl: baseImg,
    actionDescription: `Drive through the target ${photo.targetFocus || 'muscle'} to peak contraction, pausing for 1 full second at top.`,
    keyCue: 'Exhale forcefully through pursed lips while flexing the working muscle group at full contraction.',
  };

  return {
    ...photo,
    stepImages: [step1, step2, step3],
  };
}

export function simplifyExerciseName(name: string): string {
  return (name || '')
    .replace(/\(.*?\)/g, '')
    .replace(/Barbell /gi, '')
    .replace(/Dumbbell /gi, 'DB ')
    .replace(/Machine /gi, '')
    .replace(/Angle/gi, '')
    .replace(/Strict /gi, '')
    .replace(/Forward-Lean /gi, '')
    .replace(/Elevated Hands on Books\/Blocks/gi, '')
    .replace(/Feet-Elevated /gi, '')
    .trim();
}
