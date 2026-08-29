/**
 * Indian Traditional Spice Blends, Bioactive Compounds & Preparation Techniques Database
 * Includes scientific biochemical pathways, digestive modulation, and macro adjustments.
 */

export interface IndianSpiceBlend {
  id: string;
  name: string;
  hindiName: string;
  regionalAssociation: string;
  keyIngredients: string[];
  bioactiveCompounds: string[];
  digestiveAndMetabolicImpact: string;
  culinaryUsage: string;
  glycemicAndSatietyModulation: string;
}

export interface PreparationMethodAdjustment {
  methodId: string;
  name: string;
  hindiName: string;
  traditionalDescription: string;
  standardCookingFatG: number;
  fitnessOptimizedFatG: number;
  caloricDifferencePerPortion: number;
  nutritionalBioavailabilityEffect: string;
  macroAdjustmentNotes: string;
}

export const INDIAN_SPICE_BLENDS: IndianSpiceBlend[] = [
  {
    id: 'spice-goda-masala',
    name: 'Goda Masala (Maharashtrian Black Spice Blend)',
    hindiName: 'गोडा मसाला / काळा मसाला',
    regionalAssociation: 'Maharashtrian / Western India',
    keyIngredients: [
      'Stone Flower (Dagad Phool)',
      'White Sesame Seeds (Til)',
      'Dry Grated Coconut (Khobare)',
      'Coriander Seeds (Dhana)',
      'Cinnamon (Dalchini)',
      'Cloves (Lavang)',
      'Black Cardamom (Badi Elaichi)',
      'Nagkeshar (Cobra Saffron)'
    ],
    bioactiveCompounds: [
      'Sesamin & Sesamolin (Potent lipid-lowering lignans)',
      'Cinnamaldehyde (Insulin-mimetic GLUT4 stimulator)',
      'Eugenol & Lichen Polyphenols'
    ],
    digestiveAndMetabolicImpact: 'Dagad Phool (Stone Flower) releases aromatic phenolic compounds that stimulate gastrin and pepsin secretion, dramatically improving pulse and legume protein breakdown without causing acidity.',
    culinaryUsage: 'Essential for authentic Maharashtrian Amti, Katachi Amti, Bharli Vangi, Usal, and Matki curry.',
    glycemicAndSatietyModulation: 'High sesamin and dietary soluble mucilage from toasted til slow starch digestion, moderating glucose spikes from accompanying bhakri or rice.'
  },
  {
    id: 'spice-garam-masala',
    name: 'Royal Punjabi / North Indian Garam Masala',
    hindiName: 'शाही गरम मसाला',
    regionalAssociation: 'North Indian (Punjab, Delhi, UP, Kashmir)',
    keyIngredients: [
      'Black Cardamom (Badi Elaichi)',
      'Cumin Seeds (Jeera)',
      'Cloves (Lavang)',
      'Black Pepper (Kali Mirch)',
      'Cinnamon / Cassia Bark (Dalchini)',
      'Mace (Javitri)',
      'Nutmeg (Jaiphal)',
      'Star Anise (Chakra Phool)'
    ],
    bioactiveCompounds: [
      'Piperine (Increases nutrient absorption up to 2000%)',
      'Eugenol (Anti-microbial and analgesic)',
      'Thymol & Cineole (Bronchodilation & metabolic thermogenesis)'
    ],
    digestiveAndMetabolicImpact: 'Potent thermogenic action. Piperine inhibits hepatic and intestinal glucuronidation, massively elevating the systemic bioavailability of co-ingested vitamins and curcumin.',
    culinaryUsage: 'Finishing spice added during the last 2 minutes of cooking for Rajma, Chole, Dal Makhani, Paneer Tikka Masala, and Biryanis.',
    glycemicAndSatietyModulation: 'Stimulates salivary amylase and pancreatic lipase, accelerating digestive transit while reducing postprandial gas formation.'
  },
  {
    id: 'spice-sambar-podi',
    name: 'South Indian Sambar Podi (Artisanal Roasted Blend)',
    hindiName: 'सांभर पोड़ी / मसाला',
    regionalAssociation: 'South Indian (Tamil Nadu, Karnataka, Kerala, Andhra Pradesh)',
    keyIngredients: [
      'Roasted Chana Dal (Split Bengal Gram)',
      'Roasted Urad Dal (Split Black Gram)',
      'Coriander Seeds (Dhania)',
      'Fenugreek Seeds (Methi Dana)',
      'Byadgi / Guntur Red Chillies',
      'Fresh Curry Leaves (Kadi Patta)',
      'Whole Turmeric (Haldi)',
      'Asafoetida (Hing)'
    ],
    bioactiveCompounds: [
      '4-Hydroxyisoleucine (Stimulates glucose-dependent insulin secretion)',
      'Curcuminoids',
      'Girimbine & Mahanimbine (Curry leaf carb-digesting enzyme inhibitors)'
    ],
    digestiveAndMetabolicImpact: 'Fenugreek (Methi) seeds provide high galactomannan soluble fiber and trigonelline, while roasted lentils act as a natural protein-dense thickening agent without requiring cornstarch or heavy creams.',
    culinaryUsage: 'Simmered with toor dal, tamarind water, shallots (sambhar onions), moringa (drumstick), and vegetables for authentic Sambar.',
    glycemicAndSatietyModulation: 'Significantly lowers the glycemic index of parboiled rice or idlis when consumed together.'
  },
  {
    id: 'spice-panch-phoron',
    name: 'Bengali & Eastern Indian Panch Phoron',
    hindiName: 'पांच फोड़न',
    regionalAssociation: 'Eastern Indian (Bengal, Odisha, Assam, Bihar)',
    keyIngredients: [
      'Cumin Seeds (Jeera)',
      'Brown Mustard Seeds (Rai / Sarson)',
      'Fenugreek Seeds (Methi)',
      'Nigella Seeds (Kalonji / Black Cumin)',
      'Fennel Seeds (Saunf)'
    ],
    bioactiveCompounds: [
      'Thymoquinone (Potent antioxidant, hepatoprotective and immune-modulating)',
      'Anethole (Carminative and smooth-muscle antispasmodic)',
      'Allyl Isothiocyanate'
    ],
    digestiveAndMetabolicImpact: 'Used whole in hot mustard oil tempering. The combination of thymoquinone (Kalonji) and anethole (Saunf) reduces gut inflammation and enhances bile flow.',
    culinaryUsage: 'Tempering base for Bengali Shukto, Cholar Dal, Labra, Odisha Dalma, and pumpkin/papaya tarkaris.',
    glycemicAndSatietyModulation: 'Saunf and Kalonji improve hepatic insulin clearance and buffer post-meal bloating.'
  },
  {
    id: 'spice-rasam-powder',
    name: 'Chettinad & Iyengar Rasam Powder',
    hindiName: 'रसम पाउडर',
    regionalAssociation: 'South Indian (Tamil Nadu, Karnataka)',
    keyIngredients: [
      'Tellicherry Black Peppercorns',
      'Cumin Seeds (Jeera)',
      'Coriander Seeds',
      'Toor Dal',
      'Red Chillies',
      'Compounded Asafoetida (Hing)'
    ],
    bioactiveCompounds: [
      'Piperine',
      'Cuminaldehyde',
      'Ferulic Acid (Potent free-radical scavenger from Hing)'
    ],
    digestiveAndMetabolicImpact: 'Known as the classic Indian "Digestive Elixir". Induces perspiration, clears respiratory passages, and triggers rapid stomach acid release for heavy meals.',
    culinaryUsage: 'Boiled with tomato pulp, tamarind, crushed garlic, and fresh coriander for piping hot Rasam soup.',
    glycemicAndSatietyModulation: 'Zero-fat, ultra-low calorie broth with powerful electrolyte replenishment (potassium, sodium, magnesium).'
  }
];

export const PREPARATION_METHOD_ADJUSTMENTS: PreparationMethodAdjustment[] = [
  {
    methodId: 'prep-tadka-traditional',
    name: 'Traditional Indian Tadka (Chaunk / Baghar)',
    hindiName: 'तड़का / छौंक / फोडणी',
    traditionalDescription: 'Whole spices bloomed in smoking desi ghee or refined oil and poured sizzling over cooked lentils or vegetables.',
    standardCookingFatG: 18,
    fitnessOptimizedFatG: 5,
    caloricDifferencePerPortion: 117,
    nutritionalBioavailabilityEffect: 'Lipid-soluble micronutrients (Vitamins A, D, E, K, Curcumin, Lycopene) require 3-5g of fat for optimal enterocyte absorption.',
    macroAdjustmentNotes: 'Traditional home/restaurant servings often submerge tadka in 15-20g oil (+135-180 kcal). Measuring with a 1-tsp spoon preserves full aromatic lipid extraction while saving ~120 kcal per meal.'
  },
  {
    methodId: 'prep-fermentation-idli-dosa',
    name: 'Natural Lactic Acid Fermentation (Idli / Dosa / Dhokla)',
    hindiName: 'प्राकृतिक किण्वन (इडली/डोसा)',
    traditionalDescription: 'Rice and dehusked black gram soaked and ground into batter, naturally fermented by Leuconostoc mesenteroides and yeast for 12-16 hours.',
    standardCookingFatG: 2,
    fitnessOptimizedFatG: 1,
    caloricDifferencePerPortion: 9,
    nutritionalBioavailabilityEffect: 'Fermentation lowers phytic acid by up to 60%, unlocking bioavailable zinc, iron, and calcium. Increases thiamine (B1) and riboflavin (B2) by 200-300%.',
    macroAdjustmentNotes: 'Steamed idlis and dhokla have zero added cooking fat. Dosa tawa cooking can be optimized using a silicone oil brush or non-stick tawa to limit oil to <2g per crepe.'
  },
  {
    methodId: 'prep-dum-cooking',
    name: 'Dum Pukht (Sealed Clay / Heavy Pot Steam Cooking)',
    hindiName: 'दम पुख्त (मंद आंच पर पकाना)',
    traditionalDescription: 'Ingredients sealed with dough in a heavy-bottomed vessel and slow-cooked over gentle embers (charcoal/low flame).',
    standardCookingFatG: 15,
    fitnessOptimizedFatG: 4,
    caloricDifferencePerPortion: 99,
    nutritionalBioavailabilityEffect: 'Slow hermetic steaming preserves delicate volatile terpenes, polyphenols, and water-soluble B-complex vitamins from oxidation.',
    macroAdjustmentNotes: 'Dum cooking traps the natural moisture and juices of vegetables and paneer, allowing exquisite tenderness with a fraction of the oil used in open-pan sauteing.'
  },
  {
    methodId: 'prep-bhuna-roasting',
    name: 'Bhuna (Slow-Roasting Spices & Onions)',
    hindiName: 'भुनाई (मसाला भूनना)',
    traditionalDescription: 'Slowly sautéing onion-tomato-ginger paste on medium heat until moisture evaporates and spices caramelize.',
    standardCookingFatG: 20,
    fitnessOptimizedFatG: 6,
    caloricDifferencePerPortion: 126,
    nutritionalBioavailabilityEffect: 'Maillard reaction and caramelization generate rich umami compounds without synthetic flavor enhancers.',
    macroAdjustmentNotes: 'Adding splash-by-splash water deglazing prevents sticking and allows complete aromatic caramelization with only 1 tsp of oil.'
  },
  {
    methodId: 'prep-tawa-dry-roasting',
    name: 'Tawa Roasting / Phulka Puffing',
    hindiName: 'तवा सिकाई एवं फुलका',
    traditionalDescription: 'Dry rolled dough placed on hot cast-iron tawa and puffed directly over open blue flame.',
    standardCookingFatG: 0,
    fitnessOptimizedFatG: 0,
    caloricDifferencePerPortion: 45,
    nutritionalBioavailabilityEffect: 'Rapid gelatinization of wheat starch creates soft, digestible inner crumb with zero surface oils.',
    macroAdjustmentNotes: 'Puffed phulkas without ghee stay at ~75 kcal per roti. Brushing 1 tsp ghee on top adds 45 kcal of fat.'
  }
];
