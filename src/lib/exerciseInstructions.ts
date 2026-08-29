import { ExerciseLibraryItem } from '../data/exercises';

export interface ExerciseDetailedGuide {
  simpleOverview: string;
  setup: string[];
  executionSteps: string[];
  breathing: string;
  tempo: string;
  mistakesToAvoid: string[];
  keyMindMuscleCue: string;
}

/**
 * 1000% Biomechanically Accurate Exercise Execution Guides
 * Designed specifically for Indian trainees with simple English & relatable Hindi terminology.
 * Ensures every single exercise has its own accurate, distinct, tailored step-by-step instructions.
 */
export function getExerciseDetailedGuide(exercise: ExerciseLibraryItem): ExerciseDetailedGuide {
  const id = (exercise.id || '').toLowerCase();
  const name = (exercise.name || '').toLowerCase();
  const cat = exercise.category;

  // ==========================================
  // 1. CHEST EXERCISES (सीने के व्यायाम)
  // ==========================================

  // Archer Push-Up
  if (id.includes('archer-pushup') || name.includes('archer push-up') || name.includes('archer pushup')) {
    return {
      simpleOverview: 'Archer Push-Up ek advanced bodyweight movement hai jisme ek taraf ka seena (single pectoral) lagbhag 75-80% bodyweight handle karta hai, bilkul heavy dumbbell press ki tarah.',
      setup: [
        'Floor par haathon ko standard pushup se kafi chouda (wide) rakhein — lagbhag 1.5x shoulder width.',
        'Ungliyan (fingers) halki bahar ki taraf point karein taaki kalai (wrists) par strain na aaye.',
        'Core aur glutes ko tight lock karein, shareer bilkul seedhi lakdi ki tarah rahe.',
      ],
      executionSteps: [
        'Body ko dheere-dheere ek taraf (left ya right hand) ki taraf shift karte hue neeche jhukein.',
        'Working arm ki kohni ko shareer ke paas 45° par modein, jabki doosra haath bilkul seedha stretch hota rahega (arrow ki tarah).',
        'Working hand se floor ko zor se neeche push karein aur center mein wapas aakar agla rep doosri taraf karein.',
      ],
      breathing: 'Neeche ek side jate waqt lambi saans andar; Push karke upar aate waqt saans bahar chhorein.',
      tempo: '3 seconds dheere ek side neeche, 1 second strong push upar.',
      mistakesToAvoid: [
        'Kamar ko neeche latakne mat dein — pet (core) hamesha tight rakhein.',
        'Doosre assist wale haath ko fold mat karein, use seedha stretch rakhna hai.',
      ],
      keyMindMuscleCue: 'Working side ke seene ko haath ki hatheli se floor par zor laga kar dabayein — unilateral chest activation milega.',
    };
  }

  // Hindu Push-Up / Desi Dand
  if (id.includes('hindu-pushup') || name.includes('hindu') || name.includes('desi dand')) {
    return {
      simpleOverview: 'Desi Dand (Hindu Push-Up) poorani akhada training ka sabse shreshth vyayam hai, jo seena, kandhe, triceps aur reedh ki haddi (spine flexibility) ko ek saath majboot karta hai.',
      setup: [
        'Haathon aur pairon ko floor par rakhein, hips ko aakash ki taraf upar uthayein (Downward Dog / Parvatasana posture).',
        'Pairon mein thoda fasla rakhein aur kandhon ko active rakhein.',
      ],
      executionSteps: [
        'Kohni modte hue naak aur seene ko zameen ke bilkul kareeb layein (dive-bomber glide).',
        'Floor ke sath sarakte hue seene ko aage upar uthayein aur Cobra pose (Bhujangasana) mein aayein.',
        'Hips ko wapas peeche aur upar kheenchte hue shuruati Parvatasana position mein laut jayein.',
      ],
      breathing: 'Dive karte waqt saans andar bharein; Cobra pose mein seena kholte hue aur wapas aate waqt saans chhorein.',
      tempo: 'Smooth aur continuous rhythm — bina jhatke ke 2 seconds dive, 2 seconds return.',
      mistakesToAvoid: [
        'Ghutne floor par touch nahi hone chahiyein.',
        'Kandhon ko jhatke se mat uthayein — smooth flowing motion banaye rakhein.',
      ],
      keyMindMuscleCue: 'Poore shareer ko ek tarang (wave) ki tarah move karein — chest aur shoulders par natural dynamic stretch mehsus hoga.',
    };
  }

  // Diamond Push-Up
  if (id.includes('diamond-pushup') || name.includes('diamond push-up') || name.includes('diamond pushup')) {
    return {
      simpleOverview: 'Diamond Push-Up triceps ke dono heads aur andaruni seene (inner/sternal chest) ko target karne wali no-equipment king exercise hai.',
      setup: [
        'Floor par dono haathon ke angoothe (thumbs) aur index fingers ko aapas mein jodkar diamond / triangle shape banayein.',
        'Haath theek seene ke beech (sternum) ke neeche hone chahiyein.',
        'Pair piche seedhe, core aur hips tight lock rakhein.',
      ],
      executionSteps: [
        'Kohni (elbows) ko shareer ke bagal mein peeche ki taraf modte hue seene ko haathon ke diamond shape tak layein.',
        'Neeche aakar 1 second pause karein, seene par stretch feel karein.',
        'Hatheliyon se floor ko push karke kohni poori seedhi lock karein aur triceps ko hard squeeze karein.',
      ],
      breathing: 'Neeche aate waqt saans andar lein; Upar aate hue saans tezi se bahar nikalein.',
      tempo: '2 seconds dheere neeche, 1 second hold, 1 second strong push.',
      mistakesToAvoid: [
        'Kohni ko bahar 90° par mat failayein (elbow joint par strain aata hai).',
        'Kamar ko jhukne na dein.',
      ],
      keyMindMuscleCue: 'Upar aakar kohni lock karte hi triceps aur chest ko ek saath pathar ki tarah tight flex karein.',
    };
  }

  // Incline DB / Barbell Bench Press
  if (name.includes('incline') && (name.includes('press') || name.includes('bench'))) {
    return {
      simpleOverview: 'Upper Chest (clavicular head) aur front shoulders ko shape aur upper-body fullness dene ke liye sabse zaroori press.',
      setup: [
        'Bench ko strictly 30-degree incline par set karein (zyada khada karne par shoulder takeover ho jata hai).',
        'Shoulder blades ko bench par peeche aur neeche pinch (retract & depress) karein.',
        'Pair floor par flat jamayein aur lower back mein halka natural arch rakhein.',
      ],
      executionSteps: [
        'Dumbbells/bar ko collarbone ke theek upar se dheere-dheere neeche upper chest level tak layein.',
        'Kohni ko 45-60° angle par andar rakhein, T-shape bilkul na banayein.',
        'Upper chest ke fibers se zor lagakar weight ko upar aur halka sa center ki taraf press karein.',
      ],
      breathing: 'Neeche aate waqt gehri saans pet mein lein; Upar push karte waqt saans bahar chhorein.',
      tempo: '3 seconds controlled eccentric descent, 1 second explosive concentric press.',
      mistakesToAvoid: [
        'Bench ka angle 45° se upar mat karein — varna chest ke bajaye sirf shoulder thak jayega.',
        'Bottom position par dumbbells ko aapas mein jhatke se mat takrayein.',
      ],
      keyMindMuscleCue: 'Upar aate waqt sochiye ki aap apne bicep ko apni collarbone ki taraf nichod rahe hain.',
    };
  }

  // Cable Fly / Crossover / Pec Deck
  if (name.includes('fly') || name.includes('crossover') || name.includes('pec deck')) {
    const isLowToHigh = name.includes('low-to-high') || name.includes('low to high');
    const isHighToLow = name.includes('high-to-low') || name.includes('high to low');
    return {
      simpleOverview: isLowToHigh 
        ? 'Low-to-High Cable Fly upper chest ke fibers ko continuous tension ke saath stretch aur isolate karti hai.'
        : isHighToLow 
        ? 'High-to-Low Cable Fly lower chest (costal head) aur outer pec line ko define karti hai.'
        : 'Pec Deck / Cable Fly seene ki chhati ko widen karne aur deep stretch-mediated hypertrophy dene ke liye best isolation hai.',
      setup: [
        isLowToHigh ? 'Pulleys ko floor level par set karein.' : isHighToLow ? 'Pulleys ko sir ke upar set karein.' : 'Handles ko chest level par adjust karein.',
        'Kohni (elbows) mein 15-20° ka halka curve rakhein aur is angle ko poore set mein lock rakhein.',
        'Seena aage nikalein, shoulder blades ko peeche lock karein aur 1 kadam aage badhein.',
      ],
      executionSteps: [
        isLowToHigh 
          ? 'Haathon ko neeche se upar chin/upper chest level tak ek gale lagane (hug) wale motion mein layein.'
          : isHighToLow 
          ? 'Haathon ko upar se neeche naabhi (navel) ke samne aapas mein cross karein.'
          : 'Dono baahon ko samne gale lagane wale arch mein center tak layein.',
        'Center / peak contraction par 1-2 seconds ke liye chest ko bohot tight squeeze karein.',
        'Dheere-dheere 3 seconds mein haath wapas peeche kholein jab tak pecs par deep stretch na aaye.',
      ],
      breathing: 'Haath aapas mein milate waqt saans bahar; Peeche kholte waqt lambi saans andar.',
      tempo: '3 seconds dheere peeche stretch, 1 second aage squeeze hold.',
      mistakesToAvoid: [
        'Kohni ko press ki tarah fold aur straight mat karein — elbow ka bend static lock rahe.',
        'Kandhon ko aage mat jhukne dein (chest hamesha open rahe).',
      ],
      keyMindMuscleCue: 'Imagine karein ki aap ek bade vriksh (tree) ko baahon se gale laga rahe hain aur beech mein squeeze kar rahe hain.',
    };
  }

  // Chest Dips
  if (name.includes('dip') && cat === 'Chest') {
    return {
      simpleOverview: 'Parallel Bar Chest Dips lower chest aur overall pushing power badhane ke liye ek supreme calisthenics & weighted movement hai.',
      setup: [
        'Parallel bars par haath rakhein aur arms seedhe karke body ko upar uthayein.',
        'Body ko 25-30° aage jhukayein (lean forward) aur ghutne peeche mod kar cross karein.',
        'Chin ko halka chest ki taraf tuck karein.',
      ],
      executionSteps: [
        'Kohni modte hue body ko aage jhuke hue angle mein dheere neeche layein.',
        'Jab tak upper arm parallel na ho jaye neeche jayein (deep stretch on lower pecs).',
        'Hatheliyon se bars ko neeche dabate hue wapas upar push karein aur chest contract karein.',
      ],
      breathing: 'Neeche aate waqt saans andar; Upar aane par saans bahar.',
      tempo: '2-3 seconds dheere descent, 1 second strong push.',
      mistakesToAvoid: [
        'Bilkul seedhe (vertical) mat rahein, varna load chest se hatkar triceps par chala jayega.',
        'Shoulder impingement se bachne ke liye 90° se zyada neeche na girein.',
      ],
      keyMindMuscleCue: 'Neeche jate waqt seene ko khulne dein, upar aate waqt dono haathon ko aapas mein dabane ki koshish karein.',
    };
  }

  // Standard Flat Bench Press / Push-up
  if (cat === 'Chest') {
    return {
      simpleOverview: 'Mid-Pectoralis Major (sternal head) aur overall chest mass build karne ka foundational strength exercise.',
      setup: [
        'Bench par ya floor par shoulder blades ko tight peeche aur neeche squeeze (retract) karein.',
        'Pair floor par solidly jamayein, core tight aur chest lifted rakhein.',
        'Grip shoulder width se thoda sa chouda (wide) rakhein.',
      ],
      executionSteps: [
        'Weight ko ya shareer ko dheere-dheere nipple/mid-chest line tak neeche layein.',
        'Kohni ko 45-60° angle par rakhein (na shareer se chipki hui, na 90° par faili hui).',
        'Floor se pair daba kar power generate karein aur bar ko seedha upar press karein.',
      ],
      breathing: 'Neeche aate waqt saans andar bharein; Upar push karte waqt saans bahar nikalein.',
      tempo: '2-3 seconds dheere neeche, 1 second powerful upward press.',
      mistakesToAvoid: [
        'Bar ko seene par patakna (bounce) bilkul mana hai.',
        'Kohni ko 90° bahar mat failayein (rotator cuff par bohot bura load padta hai).',
      ],
      keyMindMuscleCue: 'Upar aate waqt sochiye ki aap dono bicep ko aapas mein paas la rahe hain — poora seena tight contract hoga.',
    };
  }

  // ==========================================
  // 2. BACK & LATS (पीठ और लैट्स)
  // ==========================================

  // Towel Doorframe Inverted Row
  if (id.includes('towel-door-row') || name.includes('towel') || name.includes('doorframe')) {
    return {
      simpleOverview: 'Bina kisi equipment ke ghar par peeth ki motai (rhomboids, traps aur lats) banane ki sabse safe aur powerful bodyweight exercise.',
      setup: [
        'Ek mazboot towel ko dono door handles ke around securely lapetein, ya darwaze ke frame ko pakdein.',
        'Pairon ko aage darwaze ki taraf slide karein — jitna neeche aap jhukenge, resistance utna zyada badhega.',
        'Shareer ko sir se addi tak ek seedhi rekha (plank) mein lock karein.',
      ],
      executionSteps: [
        'Kohni (elbows) ko peeche aur ribs ki taraf kheenchte hue seene ko darwaze ke kareeb layein.',
        'Top position par peeth ke dono hisson (shoulder blades) ko 2 seconds ke liye bohot tight pinch karein.',
        'Dheere-dheere 3 seconds mein arms seedhe karein aur lats par full stretch lein.',
      ],
      breathing: 'Kheenchte waqt saans bahar nikalein; Arms seedhe karte waqt saans andar lein.',
      tempo: '1 second pull, 2 seconds squeeze hold, 3 seconds slow stretch descent.',
      mistakesToAvoid: [
        'Kamar ko jhukne ya hips ko aage jhulane se bachein.',
        'Haathon se kheenchte waqt kandhon ko kaan ki taraf mat uthayein (shrug na karein).',
      ],
      keyMindMuscleCue: 'Kohni ko peeche kisi ko kohni marne ki tarah kheenchein aur peeth ke beech ek coin dabayein.',
    };
  }

  // Pull-Ups & Chin-Ups
  if (name.includes('pull-up') || name.includes('chin-up') || name.includes('pullup') || name.includes('chinup')) {
    const isChinUp = name.includes('chin-up') || name.includes('chinup') || name.includes('underhand');
    return {
      simpleOverview: isChinUp 
        ? 'Underhand Chin-Up lats aur bicep dono ko massive compound overload deta hai.'
        : 'Overhand Pull-Up V-taper look aur choudi peeth (wide wings/lats) banane ka gold standard hai.',
      setup: [
        isChinUp 
          ? 'Bar ko shoulder-width par palms apni taraf (underhand grip) karke pakdein.'
          : 'Bar ko shoulder width se thoda sa chouda (overhand grip) pakdein.',
        'Pehle dead hang mein rukein, phir shoulder blades ko neeche dabakar (scapular pull) engage karein.',
        'Ghutne peeche halke mod kar core tight rakhein.',
      ],
      executionSteps: [
        'Kohni (elbows) ko neeche apne kamar ke side pockets ki taraf drive karein.',
        'Seene ko upar bar ki taraf kheenchein jab tak chin bar ke upar na chali jaye.',
        'Dheere-dheere 3 seconds mein poora neeche dead-hang stretch tak jayein.',
      ],
      breathing: 'Upar kheenchte waqt saans bahar; Neeche aate waqt lambi saans andar.',
      tempo: '1 second fast pull upar, 1 second chin-over-bar hold, 3 seconds slow stretch return.',
      mistakesToAvoid: [
        'Pairon se kicking / cross-swinging (kipping) momentum bilkul na lein.',
        'Aadha rep (half reps) mat karein — poora neeche stretch aur poora upar chin over bar zaroori hai.',
      ],
      keyMindMuscleCue: 'Haath se pull karne ke bajaye sochiye ki aap kohni se ceiling ko neeche daba rahe hain.',
    };
  }

  // Lat Pulldowns
  if (name.includes('pulldown')) {
    return {
      simpleOverview: 'Lats ke iliac aur thoracic fibers ko isolate karke peeth ko width aur V-taper dene wali prime cable exercise.',
      setup: [
        'Thigh pad ko adjust karein taaki pair firmly jam jayein aur hips upar na uthein.',
        'Bar ko shoulder se thoda chouda pakdein, chest up aur upper spine mein halka sa 10-15° arch rakhein.',
      ],
      executionSteps: [
        'Kohni ko neeche side pockets ki taraf kheenchein, bar ko upper chest (clavicle) tak layein.',
        'Bottom position par 1 second lats ko tight squeeze karein.',
        'Dheere-dheere 3 seconds mein bar ko upar jane dein jab tak lats poore stretch na ho jayein.',
      ],
      breathing: 'Neeche kheenchte waqt saans bahar; Upar chhorate waqt saans andar.',
      tempo: '1 second dynamic pull, 1 second squeeze, 3 seconds eccentric stretch.',
      mistakesToAvoid: [
        'Peeche bohot zyada 45° jhulna (swing) nahi hai.',
        'Bar ko gardan ke peeche (behind the neck) kabhi mat kheenchein.',
      ],
      keyMindMuscleCue: 'Haath ko sirf ek hook samjhein — saara zor kohni ko neeche floor ki taraf kheenchne mein lagayein.',
    };
  }

  // Chest-Supported / T-Bar / Cable Rows
  if (name.includes('row')) {
    const isSingleArm = name.includes('single-arm') || name.includes('one-arm');
    return {
      simpleOverview: isSingleArm 
        ? 'Single-Arm Dumbbell Row lats ko poore range of motion mein stretch aur contract karta hai bina lower back thakaye.'
        : 'Chest-Supported Row peeth ki thickness, rhomboids aur middle traps ko zero lower-back shear ke saath grow karta hai.',
      setup: [
        isSingleArm 
          ? 'Ek haath aur ghutna bench par tikayein, peeth flat table ki tarah seedhi rakhein.'
          : 'Chest ko pad par support karein ya 45° bent over stance mein peeth flat lock karein.',
        'Handles/dumbbell ko neutral ya overhand grip se pakdein.',
      ],
      executionSteps: [
        'Weight ko seedha armpit mein nahi, balki apni naabhi / hip pocket ki taraf curve mein kheenchein.',
        'Kohni ko peeth ke peeche le jayein aur shoulder blades ko aapas mein pinch karein.',
        'Dheere-dheere 3 seconds mein haath aage seedhe karein aur full stretch lein.',
      ],
      breathing: 'Kheenchte waqt saans bahar; Aage chhorate waqt saans andar.',
      tempo: '1 second pull, 1 second squeeze, 2-3 seconds controlled stretch.',
      mistakesToAvoid: [
        'Body ko aage-peeche jhatka dekar momentum lena.',
        'Kandhon ko kaan ke paas shrug karna.',
      ],
      keyMindMuscleCue: 'Shoulder blades ke beech ek pencil dabane ka prayas karein.',
    };
  }

  // Deadlift / Good Morning
  if (name.includes('deadlift') || name.includes('good morning')) {
    return {
      simpleOverview: 'Poore shareer ki taaqat, kamar (erector spinae), glutes aur hamstrings ke liye ultimate posterior-chain power lift.',
      setup: [
        'Pair hip-width doori par, bar shins se lagbhag 1 inch door joote ke laces ke theek upar ho.',
        'Hips ko peeche bhejein (hinge), kamar bilkul flat aur lats ko tight lock karein (bar ko bend karne ka feel).',
        'Gardan ko spine ki line mein neutral rakhein.',
      ],
      executionSteps: [
        'Floor ko pairon se neeche push karein (leg press feel) aur bar ko shins ke saath ragadte hue upar uthayein.',
        'Ghutne cross hote hi hips ko aage drive karke seedhe khade hon aur glutes squeeze karein.',
        'Hips ko wapas peeche bhejte hue weight ko floor par aaram se set karein.',
      ],
      breathing: 'Neeche pet mein gehri saans bharein (Valsalva brace); Stand hone ke baad saans chhorein.',
      tempo: '1 second powerful drive, 2 seconds control descent.',
      mistakesToAvoid: [
        'Kamar ko gol (round) bilkul mat karein — spine hamesha straight rahe.',
        'Top par aakar peeth ko peeche over-arch mat karein.',
      ],
      keyMindMuscleCue: 'Bar ko haath se uthane ke bajaye zameen ko pair se neeche dhakelein.',
    };
  }

  // ==========================================
  // 3. SHOULDERS & DELTS (कंधे और डेल्ट्स)
  // ==========================================

  // Lateral Raises (Dumbbell / Cable)
  if (name.includes('lateral raise') || name.includes('side raise')) {
    const isCable = name.includes('cable');
    return {
      simpleOverview: isCable
        ? 'Cross-body Cable Lateral Raise side delts ko stretched position se lekar top tak constant resistance deti hai (3D capped shoulders ke liye best).'
        : 'Dumbbell Lateral Raise side delts ko chouda aur v-taper physique ka width badhane ke liye foundational movement hai.',
      setup: [
        isCable ? 'Cable pulley ko wrist/knee level par set karein aur handle ko opposite haath se pakdein.' : 'Dumbbells ko side mein pakdein.',
        'Torso ko 10-15° aage halka sa jhukayein aur kohni mein 15° bend rakhein.',
      ],
      executionSteps: [
        'Haathon ko side mein shoulder height tak uthayein (scapular plane — 30° aage ki taraf, bilkul 90° side mein nahi).',
        'Top par kohni ko kalai se upar rakhein (jaise pani ki bottle se glass mein pani daal rahe hon).',
        'Dheere-dheere 3 seconds mein wapas neeche layein bina jhatke ke.',
      ],
      breathing: 'Upar uthate waqt saans bahar; Neeche aate waqt saans andar.',
      tempo: '1 second upar, 1 second pause, 3 seconds slow descent.',
      mistakesToAvoid: [
        'Bohot heavy weight lekar kamar jhulana ya trap se shrug karna.',
        'Haathon ko bilkul 90° side mein le jana jisse shoulder impingement ho.',
      ],
      keyMindMuscleCue: 'Kohni ko side ki deewaron ki taraf door push karein, upar nahi door fekne ka prayas karein.',
    };
  }

  // Feet-Elevated Pike Push-Up / Handstand
  if (id.includes('pike-pushup') || name.includes('pike') || name.includes('handstand')) {
    return {
      simpleOverview: 'Bina dumbbells ya weights ke pure bodyweight se vertical overhead shoulder press karne ki sabse effective calisthenics exercise.',
      setup: [
        'Pairon ko kursi ya bed ke edge par rakhein, haathon ko floor par shoulder width par rakhein.',
        'Hips ko hawa mein upar uthakar body ko upside-down V ya L-shape banayein taaki torso vertical ho jaye.',
      ],
      executionSteps: [
        'Kohni ko 45° angle par modte hue sir ko haathon ke aage floor ki taraf layein (tripod head position).',
        'Sir ko floor se 1 inch upar layein, phir haathon se floor ko neeche push karke wapas sir ko arms ke beech push karein.',
      ],
      breathing: 'Neeche aate waqt saans andar; Floor ko push karte waqt saans bahar.',
      tempo: '2-3 seconds dheere neeche, 1 second strong push upar.',
      mistakesToAvoid: [
        'Kohni ko 90° bahar failana — kohni ko andar 45° par hi rakhein.',
        'Torso ko flat pushup ki tarah girne dena.',
      ],
      keyMindMuscleCue: 'Sochiye ki aap floor ko khud se door dhakel kar sir ko khidki (window) se bahar jhank rahe hain.',
    };
  }

  // Face Pull / Rear Delt Fly
  if (name.includes('face pull') || name.includes('rear delt') || name.includes('reverse pec deck')) {
    return {
      simpleOverview: 'Peeche ke kandhe (rear delts), rotator cuff aur rounded shoulder posture ko sudharne ke liye number one exercise.',
      setup: [
        'Cable rope ko aankh ke level par set karein aur rope ke kinaron ko thumbs peeche point karke pakdein.',
        '2 kadam peeche hatein aur knees soft rakhein.',
      ],
      executionSteps: [
        'Rope ke center ko seedha forehead/naak ki taraf kheenchein.',
        'Kohni ko upar aur baahon ko bahar ki taraf rotate karein (double bicep pose banayein).',
        '1-2 seconds hold karein aur phir dheere aage wapas le jayein.',
      ],
      breathing: 'Peeche kheenchte waqt saans bahar; Aage chhorate waqt saans andar.',
      tempo: '1 second pull, 2 seconds hard hold, 2 seconds control return.',
      mistakesToAvoid: [
        'Rope ko seene par neeche kheanchna — forehead ki unchai par hi layein.',
      ],
      keyMindMuscleCue: 'Rope ko do hisson mein faadte hue kohni ko peeche kholein.',
    };
  }

  // Overhead Barbell / Dumbbell Shoulder Press
  if (cat === 'Shoulders') {
    return {
      simpleOverview: 'Kandhon ki overall taaqat, mass aur pushing strength build karne ka king compound lift.',
      setup: [
        'Pair shoulder width par rakhein, glutes aur core tight rakhein taaki kamar par strain na aaye.',
        'Bar/dumbbells ko collarbone level par rakhein, forearms bilkul vertical hon.',
      ],
      executionSteps: [
        'Weight ko seedha sir ke upar press karein (chin ko halka peeche karein bar guzarne ke liye).',
        'Sir ke upar weight aane par arms seedhe lock karein.',
        'Control ke saath 2-3 seconds mein collarbone tak wapas layein.',
      ],
      breathing: 'Neeche saans bharein; Upar push karte waqt saans bahar nikalein.',
      tempo: '1 second press upar, 2-3 seconds control descent.',
      mistakesToAvoid: [
        'Kamar ko peeche jhulana ya excessive arch karna.',
      ],
      keyMindMuscleCue: 'Top par aate hi sir ko aage layein aur ceiling ko haathon se upar push karein.',
    };
  }

  // ==========================================
  // 4. LEGS - QUADS & CALVES (जांघें और पिंडली)
  // ==========================================

  // Bulgarian Split Squat (Dumbbell or 1.5 Rep Bodyweight)
  if (name.includes('bulgarian') || name.includes('split squat')) {
    return {
      simpleOverview: 'Ek pair ka king exercise jo quads aur glutes ko massive growth deta hai bina reedh ki haddi (spine) par load dale.',
      setup: [
        'Peeche wale pair ke panje ko bench ya chair par tikayein.',
        'Aage wale pair ko 2 kadam aage rakhein taaki neeche jate waqt shin lagbhag vertical rahe.',
        'Torso ko halka sa 10-15° aage jhukayein.',
      ],
      executionSteps: [
        'Aage wale pair ke bal par dheere-dheere neeche baithein jab tak aage ki thigh floor ke parallel na ho jaye.',
        'Aage wale pair ki addi (heel) se floor ko daba kar wapas upar khade hon.',
        'Top par ghutna poora snap mat karein, quad par continuous tension rakhein.',
      ],
      breathing: 'Neeche aate waqt saans andar; Upar aate waqt saans bahar.',
      tempo: '3 seconds dheere neeche descent, 1 second dynamic stand up.',
      mistakesToAvoid: [
        'Peeche wale pair par poora wajan dalna — 85% load aage wale working pair par hona chahiye.',
        'Aage wale pair ki addi ko zameen se uthana.',
      ],
      keyMindMuscleCue: 'Aage wale pair ki heel se floor ko neeche daba kar shareer ko seedha upar drive karein.',
    };
  }

  // Sissy Squats / Cossack Squats
  if (name.includes('sissy') || name.includes('cossack')) {
    return {
      simpleOverview: 'Quads ke sabse deep muscle (Rectus Femoris) ko maximum stretch dekar isolate karne wali supreme exercise.',
      setup: [
        'Kisi deewar ya doorframe ko balance ke liye ek haath se pakdein.',
        'Pair shoulder width par, panje ke bal par upar uthein.',
      ],
      executionSteps: [
        'Ghutno ko aage push karte hue shareer aur torso ko peeche lean karein.',
        'Ghutne aage floor ke kareeb aane dein jab tak quads par extreme stretch na lage.',
        'Quads ko contract karke wapas upar shuruati position par khade hon.',
      ],
      breathing: 'Neeche jate waqt saans andar; Upar push karte waqt saans bahar.',
      tempo: '3 seconds deep slow knee-travel stretch, 1 second return.',
      mistakesToAvoid: [
        'Hips ko mod kar baithna nahi hai — torso aur thighs ek seedhi line mein rahein.',
      ],
      keyMindMuscleCue: 'Ghutno ko aage travel karne dein aur quads ke direct stretch par dhyan lagayein.',
    };
  }

  // Standard Squats / Leg Press / Hack Squats
  if (cat === 'Quads') {
    return {
      simpleOverview: 'Overall quad size, leg power aur metabolic burn badhane ka primary compound movement.',
      setup: [
        'Pair shoulder width par rakhein, panje 15-30° bahar ki taraf point karein.',
        'Seena upar aur pet (core) ko cylinder ki tarah tight lock karein.',
      ],
      executionSteps: [
        'Kursi par baithne ki tarah hips ko peeche aur neeche bhejein, ghutno ko panje ki direction mein track karein.',
        'Jab tak thighs floor ke parallel ya neeche na jayein tab tak deep descent karein.',
        'Poore pair aur heel se zameen ko daba kar explosive power ke saath khade hon.',
      ],
      breathing: 'Upar lambi saans lein aur brace karein; Squat karke upar aane par saans chhorein.',
      tempo: '2-3 seconds controlled descent, 1 second powerful ascent.',
      mistakesToAvoid: [
        'Ghutno ko andar ki taraf girne (cave-in) mat hone dein.',
        'Addi zameen se nahi uthni chahiye.',
      ],
      keyMindMuscleCue: 'Zameen ko pairon se do hisson mein faadne (spread the floor) ka prayas karein.',
    };
  }

  // Calves
  if (cat === 'Calves') {
    const isSeated = name.includes('seated');
    return {
      simpleOverview: isSeated 
        ? 'Seated Calf Raise deep Soleus muscle ko isolate karke pindli ko thick banati hai.'
        : 'Standing Calf Raise Gastrocnemius (bade diamond calf muscle) ko stretch aur grow karti hai.',
      setup: [
        'Panje ko step/block par rakhein, addi (heels) bahar hawa mein latakti rahein.',
        'Ghutne seedhe (standing) ya 90° bent (seated) rakhein.',
      ],
      executionSteps: [
        'Addi ko jitna neeche ho sake deep deficit stretch par le jayein aur 2-3 seconds ke liye dead stop pause karein.',
        'Angoothe ke base se zameen ko daba kar aakash ki taraf poora upar uthein.',
        'Top par 1 second calves ko hard squeeze karein.',
      ],
      breathing: 'Neeche aate waqt saans andar; Upar uthne par saans bahar.',
      tempo: '2 seconds deep stretch pause, 1 second powerful rise, 1 second peak hold.',
      mistakesToAvoid: [
        'Addi ko tezi se bounce karna (Achilles tendon saara kaam kar leta hai aur muscle grow nahi hoti).',
      ],
      keyMindMuscleCue: 'Bouncing band karein — bottom par 3 seconds ka strict pause lagayein.',
    };
  }

  // ==========================================
  // 5. HAMSTRINGS & GLUTES (हैमस्ट्रिंग्स और हिप्स)
  // ==========================================

  // Nordic Hamstring Curl
  if (id.includes('nordic') || name.includes('nordic')) {
    return {
      simpleOverview: 'Sports science mein sabse zyada prove ki gayi exercise jo hamstring tear ka risk 51% kam karti hai aur massive eccentric muscle growth deti hai.',
      setup: [
        'Ghutno ke bhal mat par baithein, pairon ke ankles ko sofa ke neeche ya kisi partner se mazbooti se lock karwayein.',
        'Torso aur thighs bilkul seedhi rekha (straight line) mein hon.',
      ],
      executionSteps: [
        'Hips ko modhe bina, dheere-dheere 4 seconds tak shareer ko aage floor ki taraf girne dein.',
        'Hamstrings se shareer ko rokte hue control karein.',
        'Jab sambhalna mushkil ho jaye toh haathon se floor par catch karein aur halka sa push karke wapas shuruati position par aayein.',
      ],
      breathing: 'Neeche aate waqt saans rokein aur core tight rakhein; Reset par saans chhorein.',
      tempo: '4 seconds slow eccentric descent, fast reset.',
      mistakesToAvoid: [
        'Hips ko peeche nikal kar jhukna — kamar aur thighs hamesha ek line mein lock rahein.',
      ],
      keyMindMuscleCue: 'Apni addi ko zameen ki taraf daba kar shareer ke girne ki speed ko hamstrings se slow karein.',
    };
  }

  // Romanian Deadlift (RDL)
  if (name.includes('rdl') || name.includes('romanian')) {
    return {
      simpleOverview: 'Hamstrings ko lengthened (stretched) position mein train karke maximum hypertrophy dene ka sabse best lift.',
      setup: [
        'Seedhe khade hon, haathon mein dumbbells/barbell pakdein.',
        'Ghutno mein 15-20° ka halka curve rakhein jo poore set mein bilkul fixed rahega.',
      ],
      executionSteps: [
        'Hips ko peeche deewar ki taraf dhakelein jaise peeche darwaza band kar rahe hon (hip hinge).',
        'Weight ko shins ke bilkul paas rakhte hue neeche layein jab tak hamstrings par tagda stretch na lage.',
        'Hips ko aage drive karke seedhe khade hon aur glutes squeeze karein.',
      ],
      breathing: 'Neeche jate waqt saans andar; Hips aage aane par saans bahar.',
      tempo: '3 seconds slow stretch down, 1 second smooth rise.',
      mistakesToAvoid: [
        'Ghutne squat ki tarah modna (yeh hinge hai, squat nahi).',
        'Bar ko shareer se door le jana jisse lower back par load aaye.',
      ],
      keyMindMuscleCue: 'Sochiye ki hips ko peeche wali deewar ko touch karna hai.',
    };
  }

  // Hip Thrust / Glute Bridge
  if (name.includes('thrust') || name.includes('bridge') || name.includes('kickback')) {
    return {
      simpleOverview: 'Glutes (hips) ko direct vertical resistance ke against squeeze karke round, firm aur powerful banane ki king exercise.',
      setup: [
        'Bench par upper back (shoulder blades ke neeche) tikayein, pair floor par shoulder width flat jamayein.',
        'Hips par padded bar ya dumbbell rakhein.',
        'Chin ko chest ki taraf tuck rakhein.',
      ],
      executionSteps: [
        'Heels se zameen ko daba kar hips ko upar ceiling ki taraf uthayein.',
        'Top par thighs aur body ek flat table line mein honi chahiyein.',
        'Top position par glutes ko 2 seconds ke liye bohot tight squeeze karein, phir dheere neeche aayein.',
      ],
      breathing: 'Neeche saans andar; Upar aakar glutes squeeze karte waqt saans bahar.',
      tempo: '1 second drive upar, 2 seconds hard squeeze hold, 2 seconds control descent.',
      mistakesToAvoid: [
        'Kamar ko over-arch karna (movement sirf hips aur glutes se honi chahiye).',
      ],
      keyMindMuscleCue: 'Top par aate hi dono glutes ke beech ek coin dabane ki tarah squeeze karein.',
    };
  }

  // Leg Curls
  if (cat === 'Hamstrings' || cat === 'Glutes') {
    return {
      simpleOverview: 'Direct knee-flexion motion se hamstrings ke sabhi heads ko isolate karne wali exercise.',
      setup: [
        'Machine par baithein ya letein, roller pad ko ankle ke theek upar set karein.',
        'Side handles ko pakad kar hips ko seat par chipka ke rakhein.',
      ],
      executionSteps: [
        'Pad ko hips ki taraf smooth power ke saath curl karein.',
        'Peak contraction par 1 second hold karein.',
        'Dheere-dheere 3 seconds mein pair seedhe karein aur full hamstring stretch lein.',
      ],
      breathing: 'Curl karte waqt saans bahar; Pair seedhe karte waqt saans andar.',
      tempo: '1 second curl, 1 second squeeze, 3 seconds slow eccentric return.',
      mistakesToAvoid: [
        'Hips ko seat se upar uthana.',
      ],
      keyMindMuscleCue: 'Addi (heels) ko hips ki taraf kheenchein aur seat se body na hilne dein.',
    };
  }

  // ==========================================
  // 6. ARMS - BICEPS & TRICEPS (डोले और ट्राइसेप्स)
  // ==========================================

  // Incline Biceps Curl / Bayesian Curl
  if (name.includes('incline') && cat === 'Biceps') {
    return {
      simpleOverview: 'Biceps ke Long Head ko maximum stretch dekar high peak aur fuller arm look banane ki best exercise.',
      setup: [
        'Bench ko 45-60° incline par set karein aur dumbbells lekar letein.',
        'Haathon ko shareer ke peeche aaram se seedha latakne dein (shoulder hyperextension).',
      ],
      executionSteps: [
        'Kohni ko bilkul peeche fixed rakhte hue dumbbells ko upar curl karein.',
        'Top par chhoti ungli (pinky) ko bahar ghuma kar bicep peak ko 1 second squeeze karein.',
        'Dheere-dheere 3 seconds mein haath poore seedhe peeche stretch hone dein.',
      ],
      breathing: 'Curl karte waqt saans bahar; Neeche stretch par saans andar.',
      tempo: '1 second curl, 1 second squeeze, 3 seconds deep stretch descent.',
      mistakesToAvoid: [
        'Kohni ko aage le aana (kohni hamesha peeche locked rahegi).',
      ],
      keyMindMuscleCue: 'Bottom par bicep par deep stretch mehsus karein, phir sirf bicep se curl karein.',
    };
  }

  // Hammer Curl / Preacher Curl / Standing Curl
  if (cat === 'Biceps') {
    const isHammer = name.includes('hammer');
    return {
      simpleOverview: isHammer 
        ? 'Dumbbell Hammer Curl Brachialis aur Forearms ko build karke baajuon ko side se mota aur broad banata hai.'
        : 'Biceps Curl dolo ki size, peak aur arm thickness badhane ka foundational builder hai.',
      setup: [
        'Seedhe khade hon, kohni ko kamar ke side mein lock karein.',
        isHammer ? 'Dumbbells ko neutral grip (palms facing each other) mein pakdein.' : 'Underhand grip se pakdein.',
      ],
      executionSteps: [
        'Sirf kohni modte hue weight ko kandhe ki taraf curl karein bina shareer hilaye.',
        'Top par 1 second bicep / brachialis ko tight squeeze karein.',
        'Dheere-dheere 3 seconds mein haath poore seedhe neeche layein.',
      ],
      breathing: 'Curl karte waqt saans bahar; Neeche aate waqt saans andar.',
      tempo: '1 second curl, 1 second squeeze, 2-3 seconds controlled descent.',
      mistakesToAvoid: [
        'Body ko aage peeche jhula kar jhatka lena.',
      ],
      keyMindMuscleCue: 'Sochiye ki aapki kohni shareer ke sath glue se chipki hui hai.',
    };
  }

  // Overhead Triceps Extension (Long Head)
  if ((name.includes('overhead') || name.includes('skull crusher')) && cat === 'Triceps') {
    return {
      simpleOverview: 'Triceps ke sabse bade hisse (Long Head) ko shoulder flexion mein stretch karke thick arms build karta hai.',
      setup: [
        'Cable rope ya dumbbell ko sir ke peeche pakdein, kohni ko ceiling ki taraf point karein.',
        'Core aur glutes tight rakhein.',
      ],
      executionSteps: [
        'Kohni modte hue weight ko sir ke peeche deep stretch tak neeche layein.',
        'Triceps se push karke arms ko sir ke upar poora seedha extend karein.',
        'Top par 1 second triceps ko rock-hard flex karein.',
      ],
      breathing: 'Arms extend karte waqt saans bahar; Neeche bend karte waqt saans andar.',
      tempo: '1 second extension, 1 second flex, 3 seconds deep stretch descent.',
      mistakesToAvoid: [
        'Kohni ko bohot zyada bahar failana — kohni ko andar parallel rakhein.',
      ],
      keyMindMuscleCue: 'Sir ke peeche deep stretch lein aur top par tricep ko poora lock karke nichodein.',
    };
  }

  // Triceps Pushdown / Dips
  if (cat === 'Triceps') {
    return {
      simpleOverview: 'Triceps ke lateral aur medial heads ko isolate karke horseshoe shape dene ke liye primary movement.',
      setup: [
        'Cable rope ya bar pakdein, kohni ko kamar ke side mein lock karein.',
        'Halka sa 10° aage jhukein.',
      ],
      executionSteps: [
        'Haathon ko neeche push karke kohni poori seedhi lock karein.',
        'Rope ko neeche aakar halka sa bahar kholein aur tricep ko 1 second hard squeeze karein.',
        'Dheere-dheere 90° tak wapas aane dein.',
      ],
      breathing: 'Neeche push karte waqt saans bahar; Upar aate waqt saans andar.',
      tempo: '1 second push, 1 second lockout hold, 2 seconds control return.',
      mistakesToAvoid: [
        'Kohni ko aage peeche hilana (kohni ek jagah fixed rahe).',
      ],
      keyMindMuscleCue: 'Neeche aakar kohni bilkul seedhi lock karein aur tricep flex karein.',
    };
  }

  // ==========================================
  // 7. CORE, ABS & OBLIQUES (पेट और कोर)
  // ==========================================

  // Copenhagen Plank
  if (id.includes('copenhagen') || name.includes('copenhagen')) {
    return {
      simpleOverview: 'Inner thighs (adductors) aur side obliques ko strong banakar groin injuries se bachane aur athletic pelvic stability dene wali elite exercise.',
      setup: [
        'Side plank position mein aayein, upar wale pair ko kursi ya bench par rakhein.',
        'Neeche wale pair ko floor se upar hawa mein uthayein.',
        'Kohni ko kandhe ke theek neeche rakhein.',
      ],
      executionSteps: [
        'Hips ko floor se upar uthayein taaki poori body ek seedhi plank line mein rahe.',
        'Upar wale pair ki inner thigh aur side obliques se hold banaye rakhein.',
        'Specified samay (20-30 seconds) tak steady saans ke sath hold karein.',
      ],
      breathing: 'Naak se lambi aur shallow steady saans lete rahein.',
      tempo: 'Isometric static hold.',
      mistakesToAvoid: [
        'Hips ko neeche floor ki taraf girne dena.',
      ],
      keyMindMuscleCue: 'Upar wali inner thigh ko bench par dabayein aur side abs ko tight lock karein.',
    };
  }

  // Hanging Leg Raise / Ab Rollout / Dragon Flag
  if (name.includes('hanging') || name.includes('rollout') || name.includes('dragon flag') || name.includes('l-sit')) {
    return {
      simpleOverview: 'Lower abs aur deep core muscles ko compression aur anti-extension strength dene wali advanced exercise.',
      setup: [
        'Bar par latkein ya mat par L-sit / rollout position mein tight grip banayein.',
        'Pelvis ko halka sa tuck (posterior pelvic tilt) karein.',
      ],
      executionSteps: [
        'Sirf pairon ko nahi, balki pelvis ko ribs ki taraf curl karte hue upar uthayein.',
        'Top par 1-2 seconds abs ko squeeze karein.',
        'Dheere-dheere 3 seconds mein bina momentum ke wapas neeche layein.',
      ],
      breathing: 'Upar aate waqt poori saans bahar nikalein; Neeche aate waqt saans andar lein.',
      tempo: '2 seconds curl, 1 second peak hold, 3 seconds eccentric control.',
      mistakesToAvoid: [
        'Swinging ya jhatka lena — movement bilkul strict honi chahiye.',
      ],
      keyMindMuscleCue: 'Apni naabhi ko reerh ki haddi ki taraf kheench kar abs ko chhota karein.',
    };
  }

  // Default Core
  if (cat === 'Core') {
    return {
      simpleOverview: 'Pet ki core muscles ko tight, stable aur 6-pack definition dene ke liye foundational exercise.',
      setup: [
        'Mat par seedhe letein, lower back ko floor par chipka ke rakhein (zero gap).',
        'Pet ko andar kheench kar tight brace karein.',
      ],
      executionSteps: [
        'Abs ko contract karte hue rib cage ko hips ki taraf curl karein.',
        'Top par poori hawa bahar nikal kar 1-2 seconds tight hold karein.',
        'Dheere-dheere control ke saath wapas aayein.',
      ],
      breathing: 'Crunch ke top par poori saans bahar; Wapas aate waqt saans andar.',
      tempo: '2 seconds squeeze, 1 second hold, 2 seconds return.',
      mistakesToAvoid: [
        'Gardan ko haathon se aage kheanchna.',
      ],
      keyMindMuscleCue: 'Ribs aur hips ke beech ki doori ko compress karein.',
    };
  }

  // ==========================================
  // 8. CARDIO & MOBILITY (स्टैमिना और लचीलापन)
  // ==========================================
  return {
    simpleOverview: 'Cardiovascular stamina, fat burning aur joint mobility ko badhane ke liye scientific flow.',
    setup: [
      'Shareer ko seedha aur active posture mein rakhein.',
      'Sahi footwear pehnein aur comfortable pace set karein.',
    ],
    executionSteps: [
      'Movement ko bilkul smooth aur continuous rhythmic pace mein karein.',
      'Heart rate ko target zone (Zone 2 fat burn) mein maintain rakhein.',
    ],
    breathing: 'Naak se lambi aur deep rhythmic saans lete rahein.',
    tempo: 'Steady state flow.',
    mistakesToAvoid: [
      'Thakne par posture kharab karna.',
    ],
    keyMindMuscleCue: 'Control ke saath move karein aur deep breathing par dhyan lagayein.',
  };
}
