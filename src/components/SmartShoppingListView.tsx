import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Plus, 
  Trash2, 
  Copy, 
  Share2, 
  DollarSign, 
  Lightbulb, 
  CheckCircle2, 
  Calendar, 
  Filter, 
  ChefHat, 
  AlertCircle,
  PackageCheck,
  Search,
  ArrowRight
} from 'lucide-react';
import { 
  UserProfile, 
  AIAdjustedMealPlan, 
  SmartShoppingList, 
  ShoppingListItem, 
  GroceryCategory 
} from '../types';
import { 
  getStoredSmartShoppingList, 
  saveStoredSmartShoppingList, 
  toggleStoredShoppingItemPurchased 
} from '../lib/storage';
import { 
  syncShoppingListItem, 
  deleteShoppingListItemFirestore 
} from '../lib/firestoreSync';

interface SmartShoppingListViewProps {
  userProfile: UserProfile;
  aiMealPlan: AIAdjustedMealPlan | null;
  onNavigateToBlueprint?: () => void;
}

const CATEGORY_COLORS: Record<GroceryCategory, { bg: string; text: string; border: string; icon: string }> = {
  'Lean Protein': {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-900/50',
    icon: '🥩',
  },
  'Complex Carbs': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900/50',
    icon: '🌾',
  },
  'Fibrous Veggies & Greens': {
    bg: 'bg-[#FFFBF0] dark:bg-[#2A2416]/30',
    text: 'text-[#A68523] dark:text-[#F0D060]',
    border: 'border-[#E6D7A8] dark:border-[#2A2416]/50',
    icon: '🥦',
  },
  'Fruits & Antioxidants': {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-[#F0D060]',
    border: 'border-purple-200 dark:border-purple-900/50',
    icon: '🫐',
  },
  'Healthy Fats & Nuts': {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-900/50',
    icon: '🥑',
  },
  'Dairy & High-Protein Alternatives': {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-900/50',
    icon: '🥛',
  },
  'Pantry Essentials & Seasonings': {
    bg: 'bg-stone-50 dark:bg-stone-900/40',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-200 dark:border-stone-800',
    icon: '🧂',
  },
  'General': {
    bg: 'bg-gray-50 dark:bg-gray-900/40',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-800',
    icon: '🛒',
  },
};

const DEFAULT_OMNIVORE_ITEMS: ShoppingListItem[] = [
  { id: 'item_1', name: 'Boneless Skinless Chicken Breast', category: 'Lean Protein', amount: '1.4 kg (3.1 lbs)', isPurchased: false, notes: 'Look for air-chilled bulk packs to save 20-30%', mealSources: ['Lunch', 'Dinner'] },
  { id: 'item_2', name: 'Pasture-Raised Whole Eggs', category: 'Lean Protein', amount: '2 Dozen (24 eggs)', isPurchased: true, notes: 'High choline and lutein density', mealSources: ['Breakfast'] },
  { id: 'item_3', name: 'Liquid Egg Whites', category: 'Lean Protein', amount: '2 Cartons (1L total)', isPurchased: false, notes: 'Pure albumin protein booster for scrambles', mealSources: ['Breakfast'] },
  { id: 'item_4', name: '0% Fat Greek Plain Yogurt', category: 'Dairy & High-Protein Alternatives', amount: '2 Large Tubs (900g each)', isPurchased: true, notes: 'Provides 22g slow-digesting casein per cup', mealSources: ['Pre-Bed Snack'] },
  { id: 'item_5', name: 'Jasmine Brown Rice or Basmati', category: 'Complex Carbs', amount: '1 Bag (1 kg)', isPurchased: false, notes: 'Low glycemic load for sustained glycogen reload', mealSources: ['Lunch', 'Dinner'] },
  { id: 'item_6', name: 'Old Fashioned Rolled Oats', category: 'Complex Carbs', amount: '1 Canister (1 kg)', isPurchased: true, notes: 'Rich in beta-glucan soluble fiber for satiety', mealSources: ['Breakfast'] },
  { id: 'item_7', name: 'Sweet Potatoes (Yams)', category: 'Complex Carbs', amount: '5 Medium (approx. 1 kg)', isPurchased: false, notes: 'Microwave/bake for 45 min in batch prep', mealSources: ['Dinner'] },
  { id: 'item_8', name: 'Fresh Broccoli Crowns & Asparagus', category: 'Fibrous Veggies & Greens', amount: '2 Bunches (800g)', isPurchased: false, notes: 'Cruciferous sulforaphane source', mealSources: ['Lunch', 'Dinner'] },
  { id: 'item_9', name: 'Baby Spinach (Pre-washed)', category: 'Fibrous Veggies & Greens', amount: '1 Large Plastic Clamshell (300g)', isPurchased: false, notes: 'Rich in nitrates for nitric oxide vasodilation', mealSources: ['Breakfast', 'Lunch'] },
  { id: 'item_10', name: 'Wild Blueberries (Frozen)', category: 'Fruits & Antioxidants', amount: '1 Bag (1 kg)', isPurchased: false, notes: 'Anthocyanin polyphenols to buffer exercise oxidative stress', mealSources: ['Breakfast / Smoothie'] },
  { id: 'item_11', name: 'Bananas', category: 'Fruits & Antioxidants', amount: '1 Bunch (6-7 bananas)', isPurchased: true, notes: 'Potassium + fast-acting pre-workout carbs', mealSources: ['Pre-Workout Snack'] },
  { id: 'item_12', name: 'Extra Virgin Olive Oil', category: 'Healthy Fats & Nuts', amount: '1 Bottle (500ml)', isPurchased: true, notes: 'Cold-pressed monounsaturated fats & oleocanthal', mealSources: ['Cooking & Dressings'] },
  { id: 'item_13', name: 'Raw Almonds & Walnuts', category: 'Healthy Fats & Nuts', amount: '1 Bag (400g)', isPurchased: false, notes: 'Healthy omega-3 ALA and magnesium support', mealSources: ['Snacks'] },
  { id: 'item_14', name: 'Pink Himalayan Salt & Black Peppercorns', category: 'Pantry Essentials & Seasonings', amount: '1 Grinder set', isPurchased: true, notes: 'Sodium electrolyte optimization for gym pump', mealSources: ['All Meals'] },
];

const DEFAULT_VEGETARIAN_ITEMS: ShoppingListItem[] = [
  { id: 'veg_item_1', name: 'Low-Fat Organic Paneer (or Extra-Firm Tofu)', category: 'Lean Protein', amount: '1.2 kg (3 blocks)', isPurchased: false, notes: 'High-leucine complete vegetarian protein (36g protein per 200g)', mealSources: ['Lunch', 'Dinner'] },
  { id: 'veg_item_2', name: 'Shelled Edamame & Organic Tempeh', category: 'Lean Protein', amount: '800g (Frozen / Vacuum Packed)', isPurchased: true, notes: 'Rich in plant isoflavones and gut-friendly fermented protein', mealSources: ['Lunch', 'Post-Workout'] },
  { id: 'veg_item_3', name: '0% Fat Plain Greek Yogurt / Skyr', category: 'Dairy & High-Protein Alternatives', amount: '2 Large Tubs (900g each)', isPurchased: true, notes: 'Provides 23g slow-digesting casein per cup', mealSources: ['Breakfast', 'Pre-Bed Snack'] },
  { id: 'veg_item_4', name: 'Dry Brown Lentils / Chickpeas (Kabuli Chana)', category: 'Lean Protein', amount: '1 Bag (1 kg)', isPurchased: false, notes: 'High resistant starch & prebiotic dietary fiber', mealSources: ['Dinner'] },
  { id: 'veg_item_5', name: 'Tricolor Quinoa & Brown Basmati Rice', category: 'Complex Carbs', amount: '1 Bag (1 kg)', isPurchased: false, notes: 'Complete amino acid carb source with low glycemic index', mealSources: ['Lunch', 'Dinner'] },
  { id: 'veg_item_6', name: 'Old Fashioned Rolled Oats & Chia Seeds', category: 'Complex Carbs', amount: '1 Canister (1 kg)', isPurchased: true, notes: 'Beta-glucan soluble fiber for cardiac & satiety health', mealSources: ['Breakfast'] },
  { id: 'veg_item_7', name: 'Sweet Potatoes (Yams)', category: 'Complex Carbs', amount: '5 Medium (approx. 1 kg)', isPurchased: false, notes: 'Rich in beta-carotene and potassium electrolytes', mealSources: ['Dinner'] },
  { id: 'veg_item_8', name: 'Fresh Broccoli Crowns & Asparagus', category: 'Fibrous Veggies & Greens', amount: '2 Bunches (800g)', isPurchased: false, notes: 'Cruciferous sulforaphane for hormone and cellular recovery', mealSources: ['Lunch', 'Dinner'] },
  { id: 'veg_item_9', name: 'Baby Spinach & Cherry Tomatoes', category: 'Fibrous Veggies & Greens', amount: '1 Large Clamshell (350g)', isPurchased: false, notes: 'Natural nitrates & lycopene', mealSources: ['Breakfast', 'Lunch'] },
  { id: 'veg_item_10', name: 'Wild Blueberries (Frozen)', category: 'Fruits & Antioxidants', amount: '1 Bag (1 kg)', isPurchased: false, notes: 'Anthocyanin polyphenols to buffer exercise oxidative stress', mealSources: ['Smoothie / Oats'] },
  { id: 'veg_item_11', name: 'Bananas & Avocados', category: 'Fruits & Antioxidants', amount: '1 Bunch + 3 Avocados', isPurchased: true, notes: 'Potassium + heart-healthy monounsaturated fats', mealSources: ['Pre-Workout / Salads'] },
  { id: 'veg_item_12', name: 'Extra Virgin Olive Oil & Ghee', category: 'Healthy Fats & Nuts', amount: '1 Bottle (500ml)', isPurchased: true, notes: 'Cold-pressed polyphenols for hormone optimization', mealSources: ['Cooking & Dressings'] },
  { id: 'veg_item_13', name: 'Raw Almonds, Walnuts & Pumpkin Seeds', category: 'Healthy Fats & Nuts', amount: '1 Bag (400g)', isPurchased: false, notes: 'Plant omega-3 ALA, zinc, and magnesium', mealSources: ['Snacks'] },
  { id: 'veg_item_14', name: 'Turmeric, Cumin, Garam Masala, Himalayan Salt', category: 'Pantry Essentials & Seasonings', amount: '1 Set', isPurchased: true, notes: 'Anti-inflammatory curcumin and bio-enhancing spices', mealSources: ['All Meals'] },
];

export const SmartShoppingListView: React.FC<SmartShoppingListViewProps> = ({
  userProfile,
  aiMealPlan,
  onNavigateToBlueprint,
}) => {
  const isVegetarianUser = userProfile.dietType === 'vegetarian' || userProfile.dietType === 'vegan' || userProfile.dietType === 'eggetarian';

  const buildInitialList = (email?: string): SmartShoppingList => {
    const stored = getStoredSmartShoppingList(email);
    if (stored) {
      // If user is vegetarian, verify no meat items in stored list
      if (isVegetarianUser) {
        const NON_VEG_WORDS = ['chicken', 'salmon', 'beef', 'turkey', 'pork', 'tuna', 'fish', 'meat', 'shrimp', 'bacon'];
        const hasMeat = stored.items.some((i) => NON_VEG_WORDS.some((kw) => i.name.toLowerCase().includes(kw)));
        if (!hasMeat) return stored;
      } else {
        return stored;
      }
    }
    return {
      id: 'list_initial',
      name: `${userProfile.goal} ${isVegetarianUser ? '🌱 Vegetarian' : ''} Weekly Grocery Blueprint`,
      daysMultiplier: 7,
      items: isVegetarianUser ? DEFAULT_VEGETARIAN_ITEMS : DEFAULT_OMNIVORE_ITEMS,
      estimatedCostRange: isVegetarianUser ? '$60 - $80 USD' : '$75 - $95 USD',
      bulkPrepTips: isVegetarianUser ? [
        'Buy low-fat paneer, extra-firm tofu, and Greek yogurt in multi-packs to save 25–30% per gram of complete protein.',
        'Cook whole lentils, chickpeas, and tricolor quinoa in 3-day batches in an Instant Pot or pressure cooker for effortless grab-and-go meal prep.',
        'Keep pre-washed leafy greens lined with a dry paper towel in your refrigerator crisper drawer to double shelf life and prevent moisture spoilage.',
        'Frozen wild blueberries and edamame retain full antioxidant and protein integrity at half the price of fresh out-of-season produce.',
      ] : [
        'Buy chicken breast and lean beef in bulk family packs or frozen wild salmon fillets to save 25–35% per gram of pure protein.',
        'Cook your complex carbohydrates (brown rice, quinoa, sweet potatoes) in 3-day batches with low-sodium broth for enhanced micronutrient uptake.',
        'Keep pre-washed leafy greens lined with a dry paper towel in your refrigerator crisper drawer to double shelf life and prevent moisture spoilage.',
        'Frozen wild blueberries offer equal or superior antioxidant polyphenol potency compared to fresh berries at half the price per serving.',
      ],
      lastCompiledAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  };

  const [currentEmail, setCurrentEmail] = useState(userProfile.email);
  const [shoppingList, setShoppingList] = useState<SmartShoppingList>(() => buildInitialList(userProfile.email));

  // Immediate wipe/sync in same frame if user switches account
  if (userProfile.email !== currentEmail) {
    setCurrentEmail(userProfile.email);
    setShoppingList(buildInitialList(userProfile.email));
  }

  // Re-sync shopping list when user switches email
  useEffect(() => {
    setShoppingList(buildInitialList(userProfile.email));
  }, [userProfile.email, isVegetarianUser, userProfile.goal]);

  const [daysMultiplier, setDaysMultiplier] = useState<number>(shoppingList.daysMultiplier || 7);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Auto-sanitize list if user profile dietType updates to vegetarian
  useEffect(() => {
    if (isVegetarianUser) {
      const NON_VEG_WORDS = ['chicken', 'salmon', 'beef', 'turkey', 'pork', 'tuna', 'fish', 'meat', 'shrimp', 'bacon'];
      const hasNonVeg = shoppingList.items.some((i) => NON_VEG_WORDS.some((kw) => i.name.toLowerCase().includes(kw)));
      if (hasNonVeg) {
        const sanitizedItems = shoppingList.items.map((it) => {
          const isNonVeg = NON_VEG_WORDS.some((kw) => it.name.toLowerCase().includes(kw));
          if (isNonVeg) {
            return {
              ...it,
              name: 'Low-Fat Organic Paneer / Extra-Firm Tofu',
              notes: 'High biological value vegetarian protein staple',
            };
          }
          return it;
        });
        const sanitizedList = {
          ...shoppingList,
          items: sanitizedItems,
          bulkPrepTips: [
            'Buy low-fat paneer, extra-firm tofu, and Greek yogurt in multi-packs to save 25–30% per gram of complete protein.',
            'Cook whole lentils, chickpeas, and tricolor quinoa in 3-day batches in an Instant Pot or pressure cooker for effortless grab-and-go meal prep.',
            'Keep pre-washed leafy greens lined with a dry paper towel in your refrigerator crisper drawer to double shelf life and prevent moisture spoilage.',
            'Frozen wild blueberries and edamame retain full antioxidant and protein integrity at half the price of fresh out-of-season produce.',
          ]
        };
        setShoppingList(sanitizedList);
        saveStoredSmartShoppingList(sanitizedList);
      }
    }
  }, [isVegetarianUser, userProfile.dietType]);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // New Item Form State
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<GroceryCategory>('Lean Protein');
  const [newItemAmount, setNewItemAmount] = useState<string>('');
  const [newItemNotes, setNewItemNotes] = useState<string>('');

  // Synchronize changes to local storage
  useEffect(() => {
    saveStoredSmartShoppingList(shoppingList, userProfile.email);
  }, [shoppingList, userProfile.email]);

  // Handle Toggle Checkbox
  const handleToggleItem = (itemId: string) => {
    const updated = toggleStoredShoppingItemPurchased(itemId, userProfile.email);
    if (updated) {
      setShoppingList(updated);
      const target = updated.items.find((i) => i.id === itemId);
      if (target) {
        syncShoppingListItem(target).catch(console.error);
      }
    }
  };

  // Handle Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemAmount.trim()) return;

    const newItem: ShoppingListItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: newItemName.trim(),
      category: newItemCategory,
      amount: newItemAmount.trim(),
      isPurchased: false,
      notes: newItemNotes.trim() || undefined,
      mealSources: ['Custom Addition'],
    };

    const updatedList: SmartShoppingList = {
      ...shoppingList,
      items: [newItem, ...shoppingList.items],
    };

    setShoppingList(updatedList);
    syncShoppingListItem(newItem).catch(console.error);

    // Reset Form
    setNewItemName('');
    setNewItemAmount('');
    setNewItemNotes('');
    setIsAddingItem(false);
    setStatusMessage('Added new grocery item to your list.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Handle Delete Item
  const handleDeleteItem = (itemId: string) => {
    const updatedItems = shoppingList.items.filter((i) => i.id !== itemId);
    const updatedList = { ...shoppingList, items: updatedItems };
    setShoppingList(updatedList);
    deleteShoppingListItemFirestore(itemId).catch(console.error);
  };

  // Handle Clear Completed Items
  const handleClearCompleted = () => {
    const remaining = shoppingList.items.filter((i) => !i.isPurchased);
    const updatedList = { ...shoppingList, items: remaining };
    setShoppingList(updatedList);
    setStatusMessage('Cleared checked items from active list.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Compile AI Shopping List from Meal Plan
  const handleCompileFromMealPlan = async () => {
    try {
      setIsCompiling(true);
      setStatusMessage(null);

      // Fallback if no meal plan exists yet
      const activePlan = aiMealPlan || (isVegetarianUser ? {
        planName: `${userProfile.goal} Vegetarian Blueprint`,
        meals: [
          {
            mealType: 'Breakfast',
            dishName: 'Anabolic High-Protein Rolled Oats with Greek Yogurt & Chia Seeds',
            ingredients: [
              { item: 'Rolled Oats', amount: '80g' },
              { item: '0% Fat Plain Greek Yogurt', amount: '200g' },
              { item: 'Blueberries', amount: '100g' },
              { item: 'Chia Seeds', amount: '15g' },
            ],
          },
          {
            mealType: 'Lunch',
            dishName: 'Grilled Paneer Steak with Brown Basmati Rice & Broccoli',
            ingredients: [
              { item: 'Low-Fat Organic Paneer', amount: '200g' },
              { item: 'Brown Basmati Rice', amount: '150g cooked' },
              { item: 'Steamed Broccoli Crowns', amount: '150g' },
              { item: 'Extra Virgin Olive Oil', amount: '10ml' },
            ],
          },
          {
            mealType: 'Dinner',
            dishName: 'Tricolor Quinoa & Organic Edamame Sauté with Asparagus',
            ingredients: [
              { item: 'Shelled Edamame', amount: '180g' },
              { item: 'Cooked Quinoa', amount: '180g' },
              { item: 'Tender Asparagus Spears', amount: '150g' },
              { item: 'Avocado', amount: '50g' },
            ],
          },
          {
            mealType: 'Evening Snack',
            dishName: 'High-Protein Casein Cottage Cheese / Greek Yogurt Bowl',
            ingredients: [
              { item: 'Low-Fat Cottage Cheese or Greek Yogurt', amount: '220g' },
              { item: 'Raw Walnuts or Almonds', amount: '20g' },
              { item: 'Raw Honey or Stevia', amount: '10g' },
            ],
          },
        ],
      } : {
        planName: `${userProfile.goal} Standard Blueprint`,
        meals: [
          {
            mealType: 'Breakfast',
            dishName: 'Anabolic Muscle Oats with Whey & Berries',
            ingredients: [
              { item: 'Rolled Oats', amount: '80g' },
              { item: 'Whey Isolate / Plant Protein', amount: '35g' },
              { item: 'Blueberries', amount: '100g' },
              { item: 'Chia Seeds', amount: '15g' },
            ],
          },
          {
            mealType: 'Lunch',
            dishName: 'Grilled Herb Chicken with Brown Rice & Broccoli',
            ingredients: [
              { item: 'Boneless Skinless Chicken Breast', amount: '220g' },
              { item: 'Brown Jasmine Rice', amount: '150g cooked' },
              { item: 'Steamed Broccoli Crowns', amount: '150g' },
              { item: 'Extra Virgin Olive Oil', amount: '10ml' },
            ],
          },
          {
            mealType: 'Dinner',
            dishName: 'Wild Salmon Bowl with Baked Sweet Potato & Asparagus',
            ingredients: [
              { item: 'Wild Alaskan Salmon Fillet', amount: '200g' },
              { item: 'Baked Sweet Potato', amount: '200g' },
              { item: 'Tender Asparagus Spears', amount: '150g' },
              { item: 'Avocado', amount: '50g' },
            ],
          },
          {
            mealType: 'Evening Snack',
            dishName: 'High-Protein Casein Greek Yogurt Bowl',
            ingredients: [
              { item: '0% Plain Greek Yogurt', amount: '250g' },
              { item: 'Raw Walnuts or Almonds', amount: '20g' },
              { item: 'Raw Honey or Stevia', amount: '10g' },
            ],
          },
        ],
      });

      const res = await fetch('/api/ai/compile-shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealPlan: activePlan,
          daysMultiplier,
          userProfile,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Failed to compile list');
      }

      const compiled = data.data;
      const newList: SmartShoppingList = {
        id: `list_${Date.now()}`,
        name: compiled.listName || `${daysMultiplier}-Day AI Grocery Blueprint`,
        daysMultiplier: compiled.daysMultiplier || daysMultiplier,
        items: compiled.items.map((it: any) => ({
          ...it,
          isPurchased: false,
        })),
        estimatedCostRange: compiled.estimatedCostRange || '$70 - $95 USD',
        bulkPrepTips: compiled.bulkPrepTips || [],
        lastCompiledAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      setShoppingList(newList);
      saveStoredSmartShoppingList(newList, userProfile.email);

      // Sync items to Firestore
      newList.items.forEach((item) => syncShoppingListItem(item).catch(console.error));

      setStatusMessage(`Successfully compiled fresh ${daysMultiplier}-day shopping list!`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Error compiling shopping list:', err);
      setStatusMessage(`Compilation error: ${err.message || 'Please retry'}`);
    } finally {
      setIsCompiling(false);
    }
  };

  // Copy List to Clipboard
  const handleCopyListToClipboard = () => {
    const lines = [
      `🛒 PEAKFORM AI SMART SHOPPING LIST (${shoppingList.daysMultiplier} DAYS)`,
      `Target: ${userProfile.goal} | Calories: ${userProfile.dailyCalories} kcal | Protein: ${userProfile.dailyProtein}g`,
      `Estimated Cost: ${shoppingList.estimatedCostRange || 'N/A'}`,
      `----------------------------------------`,
    ];

    const categories: GroceryCategory[] = [
      'Lean Protein',
      'Complex Carbs',
      'Fibrous Veggies & Greens',
      'Fruits & Antioxidants',
      'Healthy Fats & Nuts',
      'Dairy & High-Protein Alternatives',
      'Pantry Essentials & Seasonings',
      'General',
    ];

    categories.forEach((cat) => {
      const itemsInCat = shoppingList.items.filter((i) => i.category === cat);
      if (itemsInCat.length > 0) {
        lines.push(`\n[${cat.toUpperCase()}]`);
        itemsInCat.forEach((item) => {
          const check = item.isPurchased ? '[X]' : '[ ]';
          lines.push(`${check} ${item.name} — ${item.amount}${item.notes ? ` (${item.notes})` : ''}`);
        });
      }
    });

    if (shoppingList.bulkPrepTips && shoppingList.bulkPrepTips.length > 0) {
      lines.push(`\n💡 SCIENCE BULK PREP TIPS:`);
      shoppingList.bulkPrepTips.forEach((tip, idx) => {
        lines.push(`${idx + 1}. ${tip}`);
      });
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Filtered Items
  const filteredItems = shoppingList.items.filter((item) => {
    const matchesCategory = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalItemCount = shoppingList.items.length;
  const purchasedItemCount = shoppingList.items.filter((i) => i.isPurchased).length;
  const completionPercentage = totalItemCount > 0 ? Math.round((purchasedItemCount / totalItemCount) * 100) : 0;

  // Group by category for structured layout
  const categoriesPresent = Array.from(new Set(filteredItems.map((i) => i.category))) as GroceryCategory[];

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 text-[#D4AF37] dark:text-[#F0D060]">
                AI Grocery Engine
              </span>
              <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Last Compiled: {shoppingList.lastCompiledAt}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-2">
              Smart Meal Prep Shopping List
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA8A2] mt-1 max-w-2xl">
              Consolidated and categorized supermarket inventory compiled directly from your AI nutrition plan. Scaled precisely to your daily calorie target ({userProfile.dailyCalories} kcal) and high-protein requirements ({userProfile.dailyProtein}g).
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Days Multiplier Selector */}
            <div className="flex items-center gap-1 bg-[#FAFAF8] dark:bg-[#111111] p-1 rounded-xl border border-[#E5E7EB] dark:border-[#2A2416]">
              {[3, 5, 7].map((days) => (
                <button
                  key={days}
                  onClick={() => setDaysMultiplier(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    daysMultiplier === days
                      ? 'bg-[#D4AF37] text-white shadow-xs'
                      : 'text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            {/* Compile with AI Button */}
            <button
              onClick={handleCompileFromMealPlan}
              disabled={isCompiling}
              className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-white text-xs sm:text-sm font-bold hover:bg-[#A68523] transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-[#E8912D] ${isCompiling ? 'animate-spin' : ''}`} />
              <span>{isCompiling ? 'Compiling AI List...' : `Compile ${daysMultiplier}-Day List`}</span>
            </button>

            {/* Copy / Export Button */}
            <button
              onClick={handleCopyListToClipboard}
              className="px-3.5 py-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[#2A2416] border border-[#E5E7EB] dark:border-[#2A2416] text-[#1A1D1B] dark:text-[#E8ECE9] text-xs sm:text-sm font-semibold hover:bg-[#F3F4F6] dark:hover:bg-[#2E3330] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted grocery list to clipboard"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-4 h-4 text-[#B8922A]" />
                  <span className="text-[#B8922A] dark:text-[#F0D060] font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#6B7280] dark:text-[#9EA8A2]" />
                  <span>Copy List</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 text-[#D4AF37] dark:text-[#F0D060] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Progress & Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E5E7EB] dark:border-[#2A2416]">
          {/* Progress Bar */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7280] dark:text-[#9EA8A2] font-semibold flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060]" />
                <span>Supermarket Basket</span>
              </span>
              <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                {purchasedItemCount} / {totalItemCount} Items ({completionPercentage}%)
              </span>
            </div>
            <div className="w-full bg-[#E5E7EB] dark:bg-[#2A2416] rounded-full h-2.5 mt-2.5 overflow-hidden">
              <div
                className="bg-[#D4AF37] dark:bg-[#F0D060] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Budget Range Estimation */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7280] dark:text-[#9EA8A2] font-semibold flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#E8912D]" />
                <span>Estimated Haul Budget</span>
              </span>
              <span className="font-bold text-[#D4AF37] dark:text-[#F0D060]">
                {shoppingList.estimatedCostRange || '$65 - $85 USD'}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-1.5">
              High-protein whole foods baseline scaled for {shoppingList.daysMultiplier} days of training.
            </p>
          </div>

          {/* Quick Actions / Clear Checked */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                List Management
              </div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
                Add custom ingredients or reset
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 text-[#D4AF37] dark:text-[#F0D060] hover:bg-[#D4AF37]/20 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
              {purchasedItemCount > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all font-semibold cursor-pointer"
                  title="Clear checked items"
                >
                  Clear Checked
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Item Modal / Inline Card */}
      {isAddingItem && (
        <form
          onSubmit={handleAddItem}
          className="p-5 rounded-2xl bg-white dark:bg-[#111111] border border-[#D4AF37]/40 shadow-sm animate-in fade-in transition-colors space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060]" />
              <span>Add Custom Grocery Item</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="text-xs text-[#6B7280] hover:text-[#1A1D1B] dark:hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA8A2] mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grass-Fed Ribeye Steak"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-xs text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA8A2] mb-1">
                Category *
              </label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as GroceryCategory)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-xs text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#D4AF37]"
              >
                <option value="Lean Protein">🥩 Lean Protein</option>
                <option value="Complex Carbs">🌾 Complex Carbs</option>
                <option value="Fibrous Veggies & Greens">🥦 Fibrous Veggies & Greens</option>
                <option value="Fruits & Antioxidants">🫐 Fruits & Antioxidants</option>
                <option value="Healthy Fats & Nuts">🥑 Healthy Fats & Nuts</option>
                <option value="Dairy & High-Protein Alternatives">🥛 Dairy & High-Protein Alternatives</option>
                <option value="Pantry Essentials & Seasonings">🧂 Pantry Essentials & Seasonings</option>
                <option value="General">🛒 General</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA8A2] mb-1">
                Quantity / Amount *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 500g (2 steaks)"
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-xs text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA8A2] mb-1">
              Shopper Cues / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Look for organic pasture-raised or clearance markdown"
              value={newItemNotes}
              onChange={(e) => setNewItemNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-xs text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-gray-100 dark:hover:bg-[#2A2416]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D4AF37] text-white text-xs font-bold hover:bg-[#A68523] shadow-xs cursor-pointer"
            >
              Add to Grocery List
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9EA8A2]" />
          <input
            type="text"
            placeholder="Search items or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-xs text-[#1A1D1B] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#D4AF37]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-[#1A1D1B] dark:bg-white text-white dark:text-[#1A1D1B]'
                : 'bg-white dark:bg-[#111111] text-[#6B7280] dark:text-[#9EA8A2] border border-[#E5E7EB] dark:border-[#2A2416] hover:text-[#1A1D1B] dark:hover:text-white'
            }`}
          >
            All Items ({shoppingList.items.length})
          </button>
          {(
            [
              'Lean Protein',
              'Complex Carbs',
              'Fibrous Veggies & Greens',
              'Fruits & Antioxidants',
              'Healthy Fats & Nuts',
              'Dairy & High-Protein Alternatives',
              'Pantry Essentials & Seasonings',
            ] as GroceryCategory[]
          ).map((cat) => {
            const count = shoppingList.items.filter((i) => i.category === cat).length;
            if (count === 0) return null;
            const style = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#D4AF37] text-white shadow-xs'
                    : 'bg-white dark:bg-[#111111] text-[#6B7280] dark:text-[#9EA8A2] border border-[#E5E7EB] dark:border-[#2A2416] hover:text-[#1A1D1B] dark:hover:text-white'
                }`}
              >
                <span>{style.icon}</span>
                <span>{cat}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorized Grocery List Cards */}
      {categoriesPresent.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416]">
          <ShoppingCart className="w-12 h-12 text-[#6B7280] mx-auto opacity-40 mb-3" />
          <h3 className="text-base font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
            No grocery items match your search
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or compile a fresh list from your AI nutrition plan.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoryFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#D4AF37] text-white text-xs font-bold hover:bg-[#A68523]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoriesPresent.map((category) => {
            const catItems = filteredItems.filter((i) => i.category === category);
            const style = CATEGORY_COLORS[category];
            const catPurchasedCount = catItems.filter((i) => i.isPurchased).length;

            return (
              <div
                key={category}
                className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] overflow-hidden shadow-xs transition-colors flex flex-col justify-between"
              >
                {/* Category Header */}
                <div className={`p-4 border-b border-[#E5E7EB] dark:border-[#2A2416] flex items-center justify-between ${style.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{style.icon}</span>
                    <h3 className={`text-sm font-bold ${style.text}`}>
                      {category}
                    </h3>
                  </div>
                  <div className="text-xs font-bold text-[#6B7280] dark:text-[#9EA8A2]">
                    {catPurchasedCount} / {catItems.length} checked
                  </div>
                </div>

                {/* Items in this category */}
                <div className="p-3 divide-y divide-[#F3F4F6] dark:divide-[#2A2416] flex-1">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl transition-colors flex items-start justify-between gap-3 group ${
                        item.isPurchased
                          ? 'opacity-60 bg-gray-50/50 dark:bg-gray-900/20'
                          : 'hover:bg-[#FAFAF8] dark:hover:bg-[#202422]'
                      }`}
                    >
                      {/* Checkbox & Item Detail */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(item.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            item.isPurchased
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-white shadow-xs'
                              : 'border-[#D1D5DB] dark:border-[#3A3F3C] bg-white dark:bg-[#111111] hover:border-[#D4AF37]'
                          }`}
                        >
                          {item.isPurchased && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div
                            onClick={() => handleToggleItem(item.id)}
                            className={`text-xs font-bold cursor-pointer transition-all ${
                              item.isPurchased
                                ? 'line-through text-[#6B7280] dark:text-[#88928D]'
                                : 'text-[#1A1D1B] dark:text-[#E8ECE9]'
                            }`}
                          >
                            {item.name}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 text-[#D4AF37] dark:text-[#F0D060]">
                              {item.amount}
                            </span>

                            {item.mealSources && item.mealSources.length > 0 && (
                              <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
                                For: {item.mealSources.join(', ')}
                              </span>
                            )}
                          </div>

                          {item.notes && (
                            <p className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] mt-1 italic">
                              💡 {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Science Bulk Prep & Grocery Savings Tips */}
      {shoppingList.bulkPrepTips && shoppingList.bulkPrepTips.length > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-amber-500/5 dark:from-[#D4AF37]/20 dark:to-transparent border border-[#D4AF37]/20">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] dark:text-[#F0D060] uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-[#E8912D]" />
            <span>Evidence-Based Bulk Prep & Cost Optimization</span>
          </div>
          <h3 className="text-base font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1">
            Nutritional Retention & Smart Supermarket Protocol
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {shoppingList.bulkPrepTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/80 dark:bg-[#111111]/80 border border-[#E5E7EB]/80 dark:border-[#2A2416] text-xs text-[#1A1D1B] dark:text-[#D1D5DB] leading-relaxed flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 dark:bg-[#D4AF37]/30 text-[#D4AF37] dark:text-[#F0D060] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
