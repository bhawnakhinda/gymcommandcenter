import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, LayoutGrid, List, Eye, Edit3, Trash2, Copy, UserPlus,
  Users, Activity, ChevronDown, ChevronRight, X, Check, AlertTriangle,
  Clock, Flame, Award, Star, Filter, Sun, Moon, Apple, Leaf,
  Droplets, Wheat, BarChart3, Sparkles, Dumbbell, MoreVertical, Zap,
  Database, Scale, ArrowUpDown, Pencil, Save, Calculator, MinusCircle, Maximize2, Minimize2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GlassCard } from '@/src/components/DashboardElements';

// ─── Types ─────────────────────────────────────────────────────────────────
type NutritionGoal = 'Weight Loss' | 'Muscle Gain' | 'Cardio' | 'Strength' | 'Detox' | 'Wellness';
type NutritionLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
type PlanStatus = 'Active' | 'Inactive';

interface MealIngredient {
  name: string;
  qty: number;
  unit: string;
}

interface Meal {
  name: string;
  time: string;
  cal: number;
  protein: number;
  carbs: number;
  fats: number;
  tag: string;
  items?: MealIngredient[];
}

interface NutritionPlan {
  id: number;
  name: string;
  goal: NutritionGoal;
  level: NutritionLevel;
  duration: string;
  totalCal: number;
  status: PlanStatus;
  assignedClients: number;
  createdDate: string;
  description: string;
  meals: {
    morning: Meal[];
    afternoon: Meal[];
    evening: Meal[];
  };
  ingredients: string[];
}

interface ToastMsg { id: number; message: string; type: 'success' | 'error'; }

// ─── Constants ─────────────────────────────────────────────────────────────
const MOCK_CLIENTS = [
  'James Wilson', 'Emma Johnson', 'Carlos Rodriguez', 'Priya Patel',
  'Tyler Brooks', 'Nina Chen', 'Omar Hassan', 'Aisha Diallo'
];

const goalGradient: Record<NutritionGoal, string> = {
  'Weight Loss': 'linear-gradient(135deg, #F43F5E 0%, #9F1239 100%)',
  'Muscle Gain': 'linear-gradient(135deg, #6366F1 0%, #312E81 100%)',
  'Cardio':      'linear-gradient(135deg, #10B981 0%, #064E3B 100%)',
  'Strength':    'linear-gradient(135deg, #F59E0B 0%, #78350F 100%)',
  'Detox':       'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)',
  'Wellness':    'linear-gradient(135deg, #10B981 0%, #047857 100%)',
};

const goalGlow: Record<NutritionGoal, string> = {
  'Weight Loss': 'shadow-[0_8px_32px_rgba(244,63,94,0.35)]',
  'Muscle Gain': 'shadow-[0_8px_32px_rgba(99,102,241,0.35)]',
  'Cardio':      'shadow-[0_8px_32px_rgba(16,185,129,0.35)]',
  'Strength':    'shadow-[0_8px_32px_rgba(245,158,11,0.35)]',
  'Detox':       'shadow-[0_8px_32px_rgba(6,182,212,0.35)]',
  'Wellness':    'shadow-[0_8px_32px_rgba(16,185,129,0.35)]',
};

const goalWatermarkIcon: Record<NutritionGoal, React.ReactNode> = {
  'Weight Loss': <Flame size={96} />,
  'Muscle Gain': <Dumbbell size={96} />,
  'Cardio':      <Activity size={96} />,
  'Strength':    <Award size={96} />,
  'Detox':       <Droplets size={96} />,
  'Wellness':    <Leaf size={96} />,
};

const goalIcon: Record<NutritionGoal, React.ReactNode> = {
  'Weight Loss': <Flame size={13} />,
  'Muscle Gain': <Dumbbell size={13} />,
  'Cardio':      <Activity size={13} />,
  'Strength':    <Award size={13} />,
  'Detox':       <Droplets size={13} />,
  'Wellness':    <Leaf size={13} />,
};

const goalColor: Record<NutritionGoal, string> = {
  'Weight Loss': 'text-gym-rose',
  'Muscle Gain': 'text-gym-secondary',
  'Cardio':      'text-gym-accent',
  'Strength':    'text-gym-amber',
  'Detox':       'text-cyan-400',
  'Wellness':    'text-gym-accent',
};

const levelBadge: Record<NutritionLevel, string> = {
  Beginner:      'text-gym-accent bg-gym-accent/10 border-gym-accent/20',
  Intermediate:  'text-gym-amber bg-gym-amber/10 border-gym-amber/20',
  Advanced:      'text-gym-rose bg-gym-rose/10 border-gym-rose/20',
  'All Levels':  'text-gym-secondary bg-gym-secondary/10 border-gym-secondary/20',
};

const levelStripe: Record<NutritionLevel, string> = {
  Beginner:      'bg-gym-accent',
  Intermediate:  'bg-gym-amber',
  Advanced:      'bg-gym-rose',
  'All Levels':  'bg-gym-secondary',
};

// ─── Dynamic Nutrient Types ───────────────────────────────────────────────
interface NutrientDef {
  id: string;
  name: string;
  unit: string;
  color: string;
}

const NUTRIENT_COLORS = [
  'text-lime-400', 'text-pink-400', 'text-teal-400', 'text-amber-300',
  'text-fuchsia-400', 'text-blue-400', 'text-rose-300', 'text-indigo-300',
  'text-yellow-400', 'text-green-300', 'text-purple-300', 'text-orange-300',
];

// ─── Nutrition Database (per unit) ─────────────────────────────────────────
interface NutritionInfo {
  unit: string; cal: number; protein: number; carbs: number; fats: number;
  sodium: number; potassium: number; fiber: number; sugar: number; calcium: number; iron: number;
  category: string;
  extras?: Record<string, number>;
}
// cal=kcal, protein/carbs/fats/fiber/sugar=g, sodium/potassium/calcium=mg, iron=mg
const NUTRITION_DB: Record<string, NutritionInfo> = {
  // ── Proteins ──
  'Chicken Breast':  { unit: '100g',   cal: 165, protein: 31,  carbs: 0,   fats: 3.6, sodium: 74,  potassium: 256, fiber: 0,   sugar: 0,   calcium: 15,  iron: 1,   category: 'Proteins' },
  'Eggs':            { unit: '1 pc',   cal: 78,  protein: 6,   carbs: 0.6, fats: 5,   sodium: 62,  potassium: 63,  fiber: 0,   sugar: 0.6, calcium: 25,  iron: 0.9, category: 'Proteins' },
  'Egg Whites':      { unit: '1 pc',   cal: 17,  protein: 3.6, carbs: 0.2, fats: 0,   sodium: 55,  potassium: 54,  fiber: 0,   sugar: 0.2, calcium: 2,   iron: 0,   category: 'Proteins' },
  'Salmon':          { unit: '100g',   cal: 208, protein: 20,  carbs: 0,   fats: 13,  sodium: 59,  potassium: 363, fiber: 0,   sugar: 0,   calcium: 12,  iron: 0.8, category: 'Proteins' },
  'Cod Fish':        { unit: '100g',   cal: 82,  protein: 18,  carbs: 0,   fats: 0.7, sodium: 54,  potassium: 413, fiber: 0,   sugar: 0,   calcium: 16,  iron: 0.4, category: 'Proteins' },
  'Beef Steak':      { unit: '100g',   cal: 271, protein: 26,  carbs: 0,   fats: 18,  sodium: 66,  potassium: 315, fiber: 0,   sugar: 0,   calcium: 18,  iron: 2.6, category: 'Proteins' },
  'Whey Protein':    { unit: '1 scoop',cal: 120, protein: 24,  carbs: 3,   fats: 1.5, sodium: 130, potassium: 160, fiber: 0,   sugar: 2,   calcium: 120, iron: 0.5, category: 'Proteins' },
  'Casein Protein':  { unit: '1 scoop',cal: 120, protein: 24,  carbs: 3,   fats: 1,   sodium: 160, potassium: 130, fiber: 0,   sugar: 1,   calcium: 460, iron: 0.4, category: 'Proteins' },
  'Greek Yogurt':    { unit: '100g',   cal: 97,  protein: 9,   carbs: 3.6, fats: 5,   sodium: 35,  potassium: 141, fiber: 0,   sugar: 3.2, calcium: 100, iron: 0.1, category: 'Proteins' },
  'Cottage Cheese':  { unit: '100g',   cal: 98,  protein: 11,  carbs: 3.4, fats: 4.3, sodium: 364, potassium: 104, fiber: 0,   sugar: 2.7, calcium: 83,  iron: 0.1, category: 'Proteins' },
  'Paneer':          { unit: '100g',   cal: 265, protein: 18,  carbs: 1.2, fats: 21,  sodium: 18,  potassium: 100, fiber: 0,   sugar: 1.2, calcium: 480, iron: 0.2, category: 'Proteins' },
  'Tofu':            { unit: '100g',   cal: 76,  protein: 8,   carbs: 1.9, fats: 4.8, sodium: 7,   potassium: 121, fiber: 0.3, sugar: 0.6, calcium: 350, iron: 5.4, category: 'Proteins' },
  'Tuna':            { unit: '100g',   cal: 132, protein: 29,  carbs: 0,   fats: 1,   sodium: 47,  potassium: 323, fiber: 0,   sugar: 0,   calcium: 10,  iron: 1.3, category: 'Proteins' },
  // ── Grains & Carbs ──
  'Oats':            { unit: '100g',   cal: 389, protein: 17,  carbs: 66,  fats: 7,   sodium: 2,   potassium: 429, fiber: 11,  sugar: 1,   calcium: 54,  iron: 4.7, category: 'Grains & Carbs' },
  'Brown Rice':      { unit: '100g',   cal: 123, protein: 2.7, carbs: 26,  fats: 1,   sodium: 1,   potassium: 79,  fiber: 1.8, sugar: 0.4, calcium: 10,  iron: 0.5, category: 'Grains & Carbs' },
  'Rice':            { unit: '100g',   cal: 130, protein: 2.7, carbs: 28,  fats: 0.3, sodium: 1,   potassium: 35,  fiber: 0.4, sugar: 0,   calcium: 10,  iron: 1.2, category: 'Grains & Carbs' },
  'Quinoa':          { unit: '100g',   cal: 120, protein: 4.4, carbs: 21,  fats: 1.9, sodium: 7,   potassium: 172, fiber: 2.8, sugar: 0.9, calcium: 17,  iron: 1.5, category: 'Grains & Carbs' },
  'Whole Wheat Bread':{ unit: '1 slice',cal: 81, protein: 4,   carbs: 14,  fats: 1,   sodium: 146, potassium: 81,  fiber: 2,   sugar: 1.4, calcium: 40,  iron: 1,   category: 'Grains & Carbs' },
  'Whole Wheat Pasta':{ unit: '100g',  cal: 124, protein: 5,   carbs: 25,  fats: 0.5, sodium: 3,   potassium: 44,  fiber: 3.9, sugar: 0.6, calcium: 15,  iron: 1.4, category: 'Grains & Carbs' },
  'Sweet Potato':    { unit: '100g',   cal: 86,  protein: 1.6, carbs: 20,  fats: 0.1, sodium: 36,  potassium: 337, fiber: 3,   sugar: 4.2, calcium: 30,  iron: 0.6, category: 'Grains & Carbs' },
  'Bread':           { unit: '1 slice',cal: 75,  protein: 2.6, carbs: 13,  fats: 1,   sodium: 132, potassium: 37,  fiber: 0.6, sugar: 1.5, calcium: 36,  iron: 0.8, category: 'Grains & Carbs' },
  'Cornflakes':      { unit: '30g',    cal: 114, protein: 2,   carbs: 26,  fats: 0.3, sodium: 200, potassium: 26,  fiber: 0.3, sugar: 3,   calcium: 1,   iron: 4.3, category: 'Grains & Carbs' },
  'Muesli':          { unit: '50g',    cal: 183, protein: 4.5, carbs: 33,  fats: 3.5, sodium: 10,  potassium: 175, fiber: 4,   sugar: 11,  calcium: 30,  iron: 2,   category: 'Grains & Carbs' },
  // ── Fruits ──
  'Banana':          { unit: '1 pc',   cal: 105, protein: 1.3, carbs: 27,  fats: 0.4, sodium: 1,   potassium: 422, fiber: 3.1, sugar: 14,  calcium: 6,   iron: 0.3, category: 'Fruits' },
  'Apple':           { unit: '1 pc',   cal: 95,  protein: 0.5, carbs: 25,  fats: 0.3, sodium: 2,   potassium: 195, fiber: 4.4, sugar: 19,  calcium: 11,  iron: 0.2, category: 'Fruits' },
  'Blueberries':     { unit: '100g',   cal: 57,  protein: 0.7, carbs: 14,  fats: 0.3, sodium: 1,   potassium: 77,  fiber: 2.4, sugar: 10,  calcium: 6,   iron: 0.3, category: 'Fruits' },
  'Pomegranate':     { unit: '1 pc',   cal: 83,  protein: 1.7, carbs: 19,  fats: 1.2, sodium: 3,   potassium: 236, fiber: 4,   sugar: 14,  calcium: 10,  iron: 0.3, category: 'Fruits' },
  'Dates':           { unit: '1 pc',   cal: 20,  protein: 0.2, carbs: 5.3, fats: 0,   sodium: 0,   potassium: 47,  fiber: 0.6, sugar: 4.5, calcium: 3,   iron: 0.1, category: 'Fruits' },
  'Amla':            { unit: '1 pc',   cal: 8,   protein: 0.1, carbs: 1.8, fats: 0,   sodium: 0,   potassium: 30,  fiber: 0.7, sugar: 0.6, calcium: 4,   iron: 0.1, category: 'Fruits' },
  'Lemon':           { unit: '1 pc',   cal: 17,  protein: 0.6, carbs: 5.4, fats: 0.2, sodium: 1,   potassium: 80,  fiber: 1.6, sugar: 1.5, calcium: 15,  iron: 0.4, category: 'Fruits' },
  'Orange':          { unit: '1 pc',   cal: 62,  protein: 1.2, carbs: 15,  fats: 0.2, sodium: 0,   potassium: 237, fiber: 3.1, sugar: 12,  calcium: 52,  iron: 0.1, category: 'Fruits' },
  'Watermelon':      { unit: '100g',   cal: 30,  protein: 0.6, carbs: 7.6, fats: 0.2, sodium: 1,   potassium: 112, fiber: 0.4, sugar: 6.2, calcium: 7,   iron: 0.2, category: 'Fruits' },
  'Papaya':          { unit: '100g',   cal: 43,  protein: 0.5, carbs: 11,  fats: 0.3, sodium: 8,   potassium: 182, fiber: 1.7, sugar: 7.8, calcium: 20,  iron: 0.3, category: 'Fruits' },
  'Mango':           { unit: '1 pc',   cal: 202, protein: 2.8, carbs: 50,  fats: 1.3, sodium: 3,   potassium: 564, fiber: 5.4, sugar: 46,  calcium: 22,  iron: 0.3, category: 'Fruits' },
  // ── Vegetables ──
  'Spinach':         { unit: '100g',   cal: 23,  protein: 2.9, carbs: 3.6, fats: 0.4, sodium: 79,  potassium: 558, fiber: 2.2, sugar: 0.4, calcium: 99,  iron: 2.7, category: 'Vegetables' },
  'Kale':            { unit: '100g',   cal: 49,  protein: 4.3, carbs: 9,   fats: 0.9, sodium: 38,  potassium: 491, fiber: 3.6, sugar: 2.3, calcium: 150, iron: 1.5, category: 'Vegetables' },
  'Broccoli':        { unit: '100g',   cal: 34,  protein: 2.8, carbs: 7,   fats: 0.4, sodium: 33,  potassium: 316, fiber: 2.6, sugar: 1.7, calcium: 47,  iron: 0.7, category: 'Vegetables' },
  'Asparagus':       { unit: '100g',   cal: 20,  protein: 2.2, carbs: 3.9, fats: 0.1, sodium: 2,   potassium: 202, fiber: 2.1, sugar: 1.9, calcium: 24,  iron: 2.1, category: 'Vegetables' },
  'Cucumber':        { unit: '100g',   cal: 15,  protein: 0.7, carbs: 3.6, fats: 0.1, sodium: 2,   potassium: 147, fiber: 0.5, sugar: 1.7, calcium: 16,  iron: 0.3, category: 'Vegetables' },
  'Bell Peppers':    { unit: '1 pc',   cal: 31,  protein: 1,   carbs: 6,   fats: 0.3, sodium: 4,   potassium: 251, fiber: 2.1, sugar: 4.2, calcium: 7,   iron: 0.5, category: 'Vegetables' },
  'Zucchini':        { unit: '100g',   cal: 17,  protein: 1.2, carbs: 3.1, fats: 0.3, sodium: 8,   potassium: 261, fiber: 1,   sugar: 2.5, calcium: 16,  iron: 0.4, category: 'Vegetables' },
  'Tomato':          { unit: '1 pc',   cal: 22,  protein: 1.1, carbs: 4.8, fats: 0.2, sodium: 6,   potassium: 292, fiber: 1.5, sugar: 3.2, calcium: 12,  iron: 0.3, category: 'Vegetables' },
  'Lettuce':         { unit: '100g',   cal: 15,  protein: 1.4, carbs: 2.9, fats: 0.2, sodium: 28,  potassium: 194, fiber: 1.3, sugar: 0.8, calcium: 36,  iron: 0.9, category: 'Vegetables' },
  'Carrot':          { unit: '1 pc',   cal: 25,  protein: 0.6, carbs: 6,   fats: 0.1, sodium: 42,  potassium: 195, fiber: 1.7, sugar: 2.9, calcium: 20,  iron: 0.2, category: 'Vegetables' },
  'Beetroot':        { unit: '100g',   cal: 43,  protein: 1.6, carbs: 10,  fats: 0.2, sodium: 78,  potassium: 325, fiber: 2.8, sugar: 6.8, calcium: 16,  iron: 0.8, category: 'Vegetables' },
  'Mixed Veggies':   { unit: '100g',   cal: 65,  protein: 3,   carbs: 13,  fats: 0.3, sodium: 45,  potassium: 250, fiber: 3,   sugar: 4,   calcium: 30,  iron: 0.8, category: 'Vegetables' },
  'Avocado':         { unit: '1 pc',   cal: 240, protein: 3,   carbs: 12,  fats: 22,  sodium: 11,  potassium: 728, fiber: 10,  sugar: 1,   calcium: 18,  iron: 0.8, category: 'Vegetables' },
  // ── Nuts & Seeds ──
  'Almonds':         { unit: '10 pcs', cal: 70,  protein: 2.6, carbs: 2.4, fats: 6,   sodium: 0,   potassium: 80,  fiber: 1.2, sugar: 0.5, calcium: 30,  iron: 0.4, category: 'Nuts & Seeds' },
  'Cashews':         { unit: '10 pcs', cal: 55,  protein: 1.8, carbs: 3,   fats: 4.4, sodium: 3,   potassium: 63,  fiber: 0.3, sugar: 0.6, calcium: 4,   iron: 0.6, category: 'Nuts & Seeds' },
  'Walnuts':         { unit: '10 pcs', cal: 131, protein: 3,   carbs: 2.7, fats: 13,  sodium: 0,   potassium: 88,  fiber: 1.3, sugar: 0.5, calcium: 20,  iron: 0.6, category: 'Nuts & Seeds' },
  'Peanut Butter':   { unit: '1 tbsp', cal: 94,  protein: 4,   carbs: 3,   fats: 8,   sodium: 73,  potassium: 107, fiber: 0.8, sugar: 1.7, calcium: 7,   iron: 0.3, category: 'Nuts & Seeds' },
  'Chia Seeds':      { unit: '1 tbsp', cal: 58,  protein: 2,   carbs: 5,   fats: 3.7, sodium: 2,   potassium: 50,  fiber: 4.1, sugar: 0,   calcium: 76,  iron: 0.9, category: 'Nuts & Seeds' },
  'Flax Seeds':      { unit: '1 tbsp', cal: 37,  protein: 1.3, carbs: 2,   fats: 3,   sodium: 2,   potassium: 57,  fiber: 1.9, sugar: 0.1, calcium: 18,  iron: 0.4, category: 'Nuts & Seeds' },
  'Pumpkin Seeds':   { unit: '1 tbsp', cal: 47,  protein: 2,   carbs: 1.5, fats: 4,   sodium: 2,   potassium: 57,  fiber: 0.4, sugar: 0.1, calcium: 4,   iron: 1,   category: 'Nuts & Seeds' },
  'Trail Mix':       { unit: '30g',    cal: 137, protein: 4,   carbs: 13,  fats: 9,   sodium: 65,  potassium: 150, fiber: 1.5, sugar: 9,   calcium: 20,  iron: 0.8, category: 'Nuts & Seeds' },
  // ── Dairy & Drinks ──
  'Milk':            { unit: '200ml',  cal: 100, protein: 6.4, carbs: 9.6, fats: 4,   sodium: 86,  potassium: 300, fiber: 0,   sugar: 9.6, calcium: 240, iron: 0,   category: 'Dairy & Drinks' },
  'Whole Milk':      { unit: '200ml',  cal: 122, protein: 6.4, carbs: 9.4, fats: 6.4, sodium: 86,  potassium: 300, fiber: 0,   sugar: 9.4, calcium: 240, iron: 0,   category: 'Dairy & Drinks' },
  'Almond Milk':     { unit: '200ml',  cal: 30,  protein: 1,   carbs: 1.4, fats: 2.5, sodium: 130, potassium: 60,  fiber: 0.4, sugar: 0,   calcium: 300, iron: 0.4, category: 'Dairy & Drinks' },
  'Coconut Water':   { unit: '200ml',  cal: 38,  protein: 0.4, carbs: 8.8, fats: 0.2, sodium: 50,  potassium: 470, fiber: 0,   sugar: 8,   calcium: 34,  iron: 0.1, category: 'Dairy & Drinks' },
  'Green Tea':       { unit: '1 cup',  cal: 2,   protein: 0,   carbs: 0,   fats: 0,   sodium: 2,   potassium: 20,  fiber: 0,   sugar: 0,   calcium: 0,   iron: 0,   category: 'Dairy & Drinks' },
  'Chamomile Tea':   { unit: '1 cup',  cal: 2,   protein: 0,   carbs: 0,   fats: 0,   sodium: 2,   potassium: 21,  fiber: 0,   sugar: 0,   calcium: 5,   iron: 0.2, category: 'Dairy & Drinks' },
  'Yogurt':          { unit: '100g',   cal: 59,  protein: 3.5, carbs: 5,   fats: 3.3, sodium: 46,  potassium: 155, fiber: 0,   sugar: 5,   calcium: 121, iron: 0.1, category: 'Dairy & Drinks' },
  'Honey':           { unit: '1 tbsp', cal: 64,  protein: 0,   carbs: 17,  fats: 0,   sodium: 1,   potassium: 11,  fiber: 0,   sugar: 17,  calcium: 1,   iron: 0.1, category: 'Dairy & Drinks' },
  'Turmeric':        { unit: '1 tsp',  cal: 9,   protein: 0.3, carbs: 2,   fats: 0.1, sodium: 1,   potassium: 56,  fiber: 0.5, sugar: 0.1, calcium: 5,   iron: 1.6, category: 'Dairy & Drinks' },
  // ── Spices & Extras ──
  'Cinnamon':        { unit: '1 tsp',  cal: 6,   protein: 0.1, carbs: 2,   fats: 0,   sodium: 0,   potassium: 11,  fiber: 1.4, sugar: 0.1, calcium: 26,  iron: 0.2, category: 'Spices & Extras' },
  'Ginger':          { unit: '1 tsp',  cal: 2,   protein: 0,   carbs: 0.4, fats: 0,   sodium: 1,   potassium: 8,   fiber: 0,   sugar: 0,   calcium: 0,   iron: 0,   category: 'Spices & Extras' },
  'Mint':            { unit: '5 leaves',cal: 1,   protein: 0,   carbs: 0.1, fats: 0,   sodium: 1,   potassium: 18,  fiber: 0.3, sugar: 0,   calcium: 7,   iron: 0.2, category: 'Spices & Extras' },
  'Olive Oil':       { unit: '1 tbsp', cal: 119, protein: 0,   carbs: 0,   fats: 14,  sodium: 0,   potassium: 0,   fiber: 0,   sugar: 0,   calcium: 0,   iron: 0.1, category: 'Spices & Extras' },
  'Cacao Powder':    { unit: '1 tbsp', cal: 12,  protein: 1,   carbs: 3,   fats: 0.7, sodium: 1,   potassium: 82,  fiber: 2,   sugar: 0,   calcium: 7,   iron: 0.8, category: 'Spices & Extras' },
  'Vanilla Extract': { unit: '1 tsp',  cal: 12,  protein: 0,   carbs: 0.5, fats: 0,   sodium: 1,   potassium: 6,   fiber: 0,   sugar: 0.5, calcium: 0,   iron: 0,   category: 'Spices & Extras' },
  'Black Pepper':    { unit: '1 tsp',  cal: 6,   protein: 0.2, carbs: 1.5, fats: 0.1, sodium: 0,   potassium: 31,  fiber: 0.6, sugar: 0,   calcium: 10,  iron: 0.2, category: 'Spices & Extras' },
  'Cumin':           { unit: '1 tsp',  cal: 8,   protein: 0.4, carbs: 0.9, fats: 0.5, sodium: 4,   potassium: 38,  fiber: 0.2, sugar: 0.1, calcium: 20,  iron: 1.4, category: 'Spices & Extras' },
};

// Group ingredients by category for UI
const INGREDIENT_CATEGORIES = Object.entries(NUTRITION_DB).reduce<Record<string, string[]>>((acc, [name, info]) => {
  if (!acc[info.category]) acc[info.category] = [];
  acc[info.category].push(name);
  return acc;
}, {});

// Helper: calculate meal totals from ingredient items
const calcMealFromItems = (items: MealIngredient[]): { cal: number; protein: number; carbs: number; fats: number } => {
  let cal = 0, protein = 0, carbs = 0, fats = 0;
  for (const item of items) {
    const info = NUTRITION_DB[item.name];
    if (info) {
      cal += Math.round(info.cal * item.qty);
      protein += +(info.protein * item.qty).toFixed(1);
      carbs += +(info.carbs * item.qty).toFixed(1);
      fats += +(info.fats * item.qty).toFixed(1);
    }
  }
  return { cal: Math.round(cal), protein: Math.round(protein), carbs: Math.round(carbs), fats: Math.round(fats) };
};

// ─── Goal-Based Diet Ranges ─────────────────────────────────────────────
const GOAL_DIET_RANGES: Record<string, { name: string; min: number; max: number; unit: string; session: 'morning' | 'afternoon' | 'evening' }[]> = {
  'Muscle Gain': [
    { name: 'Eggs', min: 3, max: 6, unit: 'pcs', session: 'morning' },
    { name: 'Oats', min: 50, max: 100, unit: 'g', session: 'morning' },
    { name: 'Banana', min: 2, max: 4, unit: 'pcs', session: 'morning' },
    { name: 'Whey Protein', min: 1, max: 2, unit: 'scoop', session: 'morning' },
    { name: 'Chicken Breast', min: 200, max: 400, unit: 'g', session: 'afternoon' },
    { name: 'Rice', min: 150, max: 300, unit: 'g', session: 'afternoon' },
    { name: 'Paneer', min: 100, max: 200, unit: 'g', session: 'afternoon' },
    { name: 'Sweet Potato', min: 100, max: 200, unit: 'g', session: 'afternoon' },
    { name: 'Salmon', min: 150, max: 250, unit: 'g', session: 'evening' },
    { name: 'Brown Rice', min: 100, max: 200, unit: 'g', session: 'evening' },
    { name: 'Greek Yogurt', min: 100, max: 200, unit: 'g', session: 'evening' },
    { name: 'Almonds', min: 15, max: 30, unit: 'g', session: 'evening' },
    { name: 'Peanut Butter', min: 20, max: 40, unit: 'g', session: 'evening' },
    { name: 'Milk', min: 200, max: 500, unit: 'ml', session: 'evening' },
  ],
  'Weight Loss': [
    { name: 'Egg Whites', min: 3, max: 5, unit: 'pcs', session: 'morning' },
    { name: 'Oats', min: 30, max: 50, unit: 'g', session: 'morning' },
    { name: 'Green Tea', min: 1, max: 2, unit: 'cup', session: 'morning' },
    { name: 'Apple', min: 1, max: 2, unit: 'pcs', session: 'morning' },
    { name: 'Chicken Breast', min: 150, max: 250, unit: 'g', session: 'afternoon' },
    { name: 'Spinach', min: 100, max: 200, unit: 'g', session: 'afternoon' },
    { name: 'Broccoli', min: 100, max: 200, unit: 'g', session: 'afternoon' },
    { name: 'Cucumber', min: 100, max: 200, unit: 'g', session: 'afternoon' },
    { name: 'Cod Fish', min: 150, max: 250, unit: 'g', session: 'evening' },
    { name: 'Lettuce', min: 100, max: 200, unit: 'g', session: 'evening' },
    { name: 'Cottage Cheese', min: 100, max: 150, unit: 'g', session: 'evening' },
    { name: 'Almonds', min: 10, max: 15, unit: 'g', session: 'evening' },
  ],
  'Cardio': [
    { name: 'Oats', min: 80, max: 150, unit: 'g', session: 'morning' },
    { name: 'Banana', min: 2, max: 3, unit: 'pcs', session: 'morning' },
    { name: 'Honey', min: 10, max: 20, unit: 'g', session: 'morning' },
    { name: 'Eggs', min: 2, max: 4, unit: 'pcs', session: 'morning' },
    { name: 'Brown Rice', min: 150, max: 250, unit: 'g', session: 'afternoon' },
    { name: 'Chicken Breast', min: 150, max: 250, unit: 'g', session: 'afternoon' },
    { name: 'Sweet Potato', min: 100, max: 200, unit: 'g', session: 'afternoon' },
    { name: 'Watermelon', min: 150, max: 300, unit: 'g', session: 'afternoon' },
    { name: 'Salmon', min: 100, max: 200, unit: 'g', session: 'evening' },
    { name: 'Quinoa', min: 100, max: 150, unit: 'g', session: 'evening' },
    { name: 'Yogurt', min: 100, max: 200, unit: 'g', session: 'evening' },
    { name: 'Blueberries', min: 50, max: 100, unit: 'g', session: 'evening' },
  ],
  'Strength': [
    { name: 'Eggs', min: 4, max: 6, unit: 'pcs', session: 'morning' },
    { name: 'Oats', min: 80, max: 120, unit: 'g', session: 'morning' },
    { name: 'Peanut Butter', min: 30, max: 50, unit: 'g', session: 'morning' },
    { name: 'Whey Protein', min: 1, max: 2, unit: 'scoop', session: 'morning' },
    { name: 'Beef Steak', min: 150, max: 300, unit: 'g', session: 'afternoon' },
    { name: 'Rice', min: 200, max: 350, unit: 'g', session: 'afternoon' },
    { name: 'Paneer', min: 150, max: 250, unit: 'g', session: 'afternoon' },
    { name: 'Sweet Potato', min: 150, max: 250, unit: 'g', session: 'afternoon' },
    { name: 'Chicken Breast', min: 200, max: 350, unit: 'g', session: 'evening' },
    { name: 'Brown Rice', min: 150, max: 250, unit: 'g', session: 'evening' },
    { name: 'Casein Protein', min: 1, max: 2, unit: 'scoop', session: 'evening' },
    { name: 'Cottage Cheese', min: 100, max: 150, unit: 'g', session: 'evening' },
    { name: 'Cashews', min: 20, max: 40, unit: 'g', session: 'evening' },
  ],
  'Detox': [
    { name: 'Amla', min: 1, max: 2, unit: 'pcs', session: 'morning' },
    { name: 'Green Tea', min: 1, max: 3, unit: 'cup', session: 'morning' },
    { name: 'Lemon', min: 1, max: 2, unit: 'pcs', session: 'morning' },
    { name: 'Apple', min: 1, max: 2, unit: 'pcs', session: 'morning' },
    { name: 'Spinach', min: 100, max: 200, unit: 'g', session: 'afternoon' },
    { name: 'Cucumber', min: 100, max: 200, unit: 'g', session: 'afternoon' },
    { name: 'Beetroot', min: 100, max: 150, unit: 'g', session: 'afternoon' },
    { name: 'Watermelon', min: 200, max: 400, unit: 'g', session: 'afternoon' },
    { name: 'Kale', min: 100, max: 150, unit: 'g', session: 'evening' },
    { name: 'Avocado', min: 0.5, max: 1, unit: 'pcs', session: 'evening' },
    { name: 'Yogurt', min: 100, max: 150, unit: 'g', session: 'evening' },
    { name: 'Mint', min: 5, max: 10, unit: 'g', session: 'evening' },
  ],
  'Wellness': [
    { name: 'Oats', min: 50, max: 80, unit: 'g', session: 'morning' },
    { name: 'Banana', min: 1, max: 2, unit: 'pcs', session: 'morning' },
    { name: 'Eggs', min: 2, max: 3, unit: 'pcs', session: 'morning' },
    { name: 'Greek Yogurt', min: 100, max: 150, unit: 'g', session: 'morning' },
    { name: 'Chicken Breast', min: 100, max: 200, unit: 'g', session: 'afternoon' },
    { name: 'Quinoa', min: 100, max: 150, unit: 'g', session: 'afternoon' },
    { name: 'Broccoli', min: 100, max: 150, unit: 'g', session: 'afternoon' },
    { name: 'Avocado', min: 0.5, max: 1, unit: 'pcs', session: 'afternoon' },
    { name: 'Salmon', min: 100, max: 200, unit: 'g', session: 'evening' },
    { name: 'Asparagus', min: 100, max: 150, unit: 'g', session: 'evening' },
    { name: 'Almonds', min: 15, max: 25, unit: 'g', session: 'evening' },
    { name: 'Cottage Cheese', min: 100, max: 150, unit: 'g', session: 'evening' },
  ],
};

const MEAL_PRESETS: { name: string; cal: number; protein: number; carbs: number; fats: number; tag: string }[] = [
  { name: 'Oats + Banana', cal: 350, protein: 10, carbs: 62, fats: 8, tag: 'Breakfast' },
  { name: 'Egg Whites + Toast', cal: 220, protein: 24, carbs: 22, fats: 3, tag: 'Breakfast' },
  { name: 'Greek Yogurt + Almonds', cal: 320, protein: 22, carbs: 18, fats: 18, tag: 'Snack' },
  { name: 'Chicken Breast + Rice', cal: 480, protein: 40, carbs: 52, fats: 8, tag: 'Lunch' },
  { name: 'Grilled Chicken Salad', cal: 280, protein: 35, carbs: 12, fats: 10, tag: 'Lunch' },
  { name: 'Salmon + Sweet Potato', cal: 480, protein: 35, carbs: 40, fats: 18, tag: 'Dinner' },
  { name: 'Whey Protein Shake', cal: 180, protein: 30, carbs: 8, fats: 3, tag: 'Shake' },
  { name: 'Peanut Butter Smoothie', cal: 420, protein: 28, carbs: 38, fats: 20, tag: 'Shake' },
  { name: 'Brown Rice + Veggies', cal: 320, protein: 8, carbs: 58, fats: 6, tag: 'Lunch' },
  { name: 'Paneer + Roti', cal: 380, protein: 22, carbs: 35, fats: 16, tag: 'Lunch' },
  { name: 'Cottage Cheese + Cucumber', cal: 120, protein: 14, carbs: 5, fats: 3, tag: 'Snack' },
  { name: 'Green Tea', cal: 2, protein: 0, carbs: 0, fats: 0, tag: 'Drink' },
  { name: 'Casein Shake', cal: 250, protein: 40, carbs: 8, fats: 5, tag: 'Night' },
  { name: 'Fruit Bowl', cal: 200, protein: 3, carbs: 48, fats: 1, tag: 'Snack' },
  { name: 'Boiled Eggs x3', cal: 210, protein: 18, carbs: 1, fats: 15, tag: 'Snack' },
];

const MEAL_TAGS = ['Breakfast', 'Snack', 'Lunch', 'Dinner', 'Shake', 'Drink', 'Pre-Workout', 'Post-Workout', 'Night', 'Recovery', 'Detox', 'Immunity'];

// ─── Initial Data ──────────────────────────────────────────────────────────
const INITIAL_PLANS: NutritionPlan[] = [
  {
    id: 1, name: 'Weight Loss Plan', goal: 'Weight Loss', level: 'Beginner', duration: '8 Weeks', totalCal: 1600,
    status: 'Active', assignedClients: 18, createdDate: '2024-11-15',
    description: 'Low-calorie balanced diet for healthy and sustainable fat loss.',
    meals: {
      morning: [
        { name: 'Oats + Egg Whites', time: '7:00 AM', cal: 320, protein: 22, carbs: 45, fats: 5, tag: 'Breakfast' },
        { name: 'Green Tea', time: '7:30 AM', cal: 1, protein: 0, carbs: 0, fats: 0, tag: 'Drink' },
        { name: 'Apple + Cinnamon', time: '10:00 AM', cal: 75, protein: 0.5, carbs: 20, fats: 0.3, tag: 'Snack' },
      ],
      afternoon: [
        { name: 'Grilled Chicken Salad', time: '12:30 PM', cal: 280, protein: 35, carbs: 12, fats: 10, tag: 'Lunch' },
        { name: 'Cucumber + Mint Juice', time: '3:00 PM', cal: 45, protein: 1, carbs: 10, fats: 0.2, tag: 'Detox' },
      ],
      evening: [
        { name: 'Cod Fish + Asparagus', time: '7:00 PM', cal: 200, protein: 28, carbs: 6, fats: 5, tag: 'Dinner' },
        { name: 'Cottage Cheese + Cucumber', time: '8:30 PM', cal: 120, protein: 14, carbs: 5, fats: 3, tag: 'Snack' },
      ],
    },
    ingredients: ['Oats', 'Egg Whites', 'Green Tea', 'Apple', 'Cinnamon', 'Chicken Breast', 'Lettuce', 'Tomato', 'Olive Oil', 'Cucumber', 'Mint', 'Cod Fish', 'Asparagus', 'Lemon', 'Cottage Cheese'],
  },
  {
    id: 2, name: 'Muscle Gain Plan', goal: 'Muscle Gain', level: 'Intermediate', duration: '12 Weeks', totalCal: 2800,
    status: 'Active', assignedClients: 24, createdDate: '2024-10-01',
    description: 'High-protein surplus diet optimized for lean muscle growth.',
    meals: {
      morning: [
        { name: 'Oats + Banana + Whey', time: '7:00 AM', cal: 520, protein: 38, carbs: 72, fats: 9, tag: 'Breakfast' },
        { name: 'Whole Eggs x3 + Toast', time: '7:30 AM', cal: 450, protein: 28, carbs: 35, fats: 22, tag: 'Protein' },
        { name: 'Greek Yogurt + Almonds', time: '10:00 AM', cal: 320, protein: 22, carbs: 18, fats: 18, tag: 'Snack' },
      ],
      afternoon: [
        { name: 'Chicken + Brown Rice', time: '1:00 PM', cal: 550, protein: 42, carbs: 55, fats: 12, tag: 'Lunch' },
        { name: 'Peanut Butter Smoothie', time: '3:30 PM', cal: 480, protein: 30, carbs: 45, fats: 22, tag: 'Shake' },
      ],
      evening: [
        { name: 'Salmon + Sweet Potato', time: '7:00 PM', cal: 480, protein: 35, carbs: 40, fats: 18, tag: 'Dinner' },
        { name: 'Casein Shake + Cashews', time: '9:00 PM', cal: 300, protein: 30, carbs: 12, fats: 14, tag: 'Night' },
      ],
    },
    ingredients: ['Oats', 'Banana', 'Whey Protein', 'Eggs', 'Whole Wheat Bread', 'Greek Yogurt', 'Almonds', 'Chicken Breast', 'Brown Rice', 'Peanut Butter', 'Milk', 'Salmon', 'Sweet Potato', 'Casein Protein', 'Cashews'],
  },
  {
    id: 3, name: 'Cardio Fuel Plan', goal: 'Cardio', level: 'Beginner', duration: '6 Weeks', totalCal: 2200,
    status: 'Active', assignedClients: 15, createdDate: '2025-01-10',
    description: 'Energy-rich plan to fuel endurance training and recovery.',
    meals: {
      morning: [
        { name: 'Banana + Oats Shake', time: '7:00 AM', cal: 380, protein: 12, carbs: 68, fats: 8, tag: 'Breakfast' },
        { name: 'Beetroot Juice', time: '7:30 AM', cal: 80, protein: 2, carbs: 18, fats: 0.2, tag: 'Pre-Workout' },
        { name: 'Dates + Almond Milk', time: '10:00 AM', cal: 250, protein: 4, carbs: 58, fats: 3, tag: 'Snack' },
      ],
      afternoon: [
        { name: 'Quinoa + Grilled Chicken', time: '1:00 PM', cal: 420, protein: 32, carbs: 45, fats: 10, tag: 'Lunch' },
        { name: 'Coconut Water + Trail Mix', time: '3:30 PM', cal: 300, protein: 8, carbs: 40, fats: 14, tag: 'Recovery' },
      ],
      evening: [
        { name: 'Whole Wheat Pasta + Veggies', time: '7:00 PM', cal: 380, protein: 14, carbs: 60, fats: 8, tag: 'Dinner' },
        { name: 'Pomegranate + Chia Bowl', time: '8:30 PM', cal: 200, protein: 6, carbs: 30, fats: 8, tag: 'Recovery' },
      ],
    },
    ingredients: ['Banana', 'Oats', 'Beetroot', 'Dates', 'Almond Milk', 'Quinoa', 'Chicken Breast', 'Coconut Water', 'Trail Mix', 'Whole Wheat Pasta', 'Bell Peppers', 'Zucchini', 'Pomegranate', 'Chia Seeds', 'Honey'],
  },
  {
    id: 4, name: 'Strength Power Diet', goal: 'Strength', level: 'Advanced', duration: '10 Weeks', totalCal: 3200,
    status: 'Active', assignedClients: 12, createdDate: '2024-12-01',
    description: 'Heavy calorie surplus with emphasis on protein and complex carbs for powerlifters.',
    meals: {
      morning: [
        { name: 'Eggs x4 + Oats + Banana', time: '6:30 AM', cal: 620, protein: 36, carbs: 70, fats: 22, tag: 'Breakfast' },
        { name: 'Whey + Milk + Almonds', time: '7:00 AM', cal: 420, protein: 38, carbs: 28, fats: 18, tag: 'Shake' },
        { name: 'Peanut Butter + Toast', time: '10:00 AM', cal: 480, protein: 18, carbs: 42, fats: 28, tag: 'Snack' },
      ],
      afternoon: [
        { name: 'Beef Steak + Sweet Potato', time: '1:00 PM', cal: 600, protein: 42, carbs: 45, fats: 24, tag: 'Lunch' },
        { name: 'Salmon + Brown Rice', time: '4:00 PM', cal: 520, protein: 36, carbs: 48, fats: 16, tag: 'Meal 2' },
      ],
      evening: [
        { name: 'Cottage Cheese + Cashews', time: '7:30 PM', cal: 350, protein: 24, carbs: 10, fats: 24, tag: 'Dinner' },
        { name: 'Casein Shake', time: '9:30 PM', cal: 250, protein: 40, carbs: 8, fats: 5, tag: 'Night' },
      ],
    },
    ingredients: ['Eggs', 'Oats', 'Banana', 'Whey Protein', 'Whole Milk', 'Almonds', 'Peanut Butter', 'Bread', 'Beef Steak', 'Sweet Potato', 'Salmon', 'Brown Rice', 'Cottage Cheese', 'Cashews', 'Casein Protein'],
  },
  {
    id: 5, name: 'Detox & Cleanse Plan', goal: 'Detox', level: 'Beginner', duration: '4 Weeks', totalCal: 1400,
    status: 'Active', assignedClients: 9, createdDate: '2025-02-01',
    description: 'Gentle cleansing diet with whole foods, juices and herbal teas.',
    meals: {
      morning: [
        { name: 'Warm Lemon Water', time: '6:30 AM', cal: 6, protein: 0, carbs: 2, fats: 0, tag: 'Detox' },
        { name: 'Green Tea + Honey', time: '7:00 AM', cal: 35, protein: 0, carbs: 9, fats: 0, tag: 'Drink' },
        { name: 'Chia Seed Smoothie', time: '8:00 AM', cal: 220, protein: 8, carbs: 28, fats: 10, tag: 'Breakfast' },
      ],
      afternoon: [
        { name: 'Spinach + Kale Salad', time: '12:30 PM', cal: 250, protein: 12, carbs: 20, fats: 12, tag: 'Lunch' },
        { name: 'Beetroot + Carrot Juice', time: '3:00 PM', cal: 90, protein: 2, carbs: 20, fats: 0.3, tag: 'Detox' },
      ],
      evening: [
        { name: 'Grilled Veggies + Quinoa', time: '7:00 PM', cal: 300, protein: 10, carbs: 42, fats: 8, tag: 'Dinner' },
        { name: 'Turmeric Milk', time: '9:00 PM', cal: 60, protein: 3, carbs: 6, fats: 2, tag: 'Recovery' },
      ],
    },
    ingredients: ['Lemon', 'Green Tea', 'Honey', 'Chia Seeds', 'Banana', 'Spinach', 'Kale', 'Avocado', 'Olive Oil', 'Beetroot', 'Carrot', 'Quinoa', 'Bell Peppers', 'Zucchini', 'Turmeric', 'Milk'],
  },
  {
    id: 6, name: 'General Wellness Plan', goal: 'Wellness', level: 'All Levels', duration: 'Ongoing', totalCal: 2000,
    status: 'Active', assignedClients: 32, createdDate: '2024-09-05',
    description: 'Balanced everyday nutrition for overall health, immunity and well-being.',
    meals: {
      morning: [
        { name: 'Oats + Blueberries + Flax', time: '7:00 AM', cal: 350, protein: 12, carbs: 52, fats: 12, tag: 'Breakfast' },
        { name: 'Amla + Ginger Shot', time: '7:30 AM', cal: 20, protein: 0, carbs: 5, fats: 0, tag: 'Immunity' },
        { name: 'Yogurt + Pumpkin Seeds', time: '10:00 AM', cal: 220, protein: 14, carbs: 15, fats: 12, tag: 'Snack' },
      ],
      afternoon: [
        { name: 'Salmon + Broccoli + Rice', time: '1:00 PM', cal: 450, protein: 32, carbs: 38, fats: 18, tag: 'Lunch' },
        { name: 'Walnuts + Apple', time: '3:30 PM', cal: 250, protein: 6, carbs: 20, fats: 18, tag: 'Snack' },
      ],
      evening: [
        { name: 'Grilled Chicken + Veggies', time: '7:00 PM', cal: 350, protein: 32, carbs: 15, fats: 16, tag: 'Dinner' },
        { name: 'Chamomile Tea', time: '9:00 PM', cal: 2, protein: 0, carbs: 0, fats: 0, tag: 'Sleep' },
      ],
    },
    ingredients: ['Oats', 'Blueberries', 'Flax Seeds', 'Amla', 'Ginger', 'Yogurt', 'Pumpkin Seeds', 'Salmon', 'Broccoli', 'Rice', 'Walnuts', 'Apple', 'Chicken Breast', 'Mixed Veggies', 'Chamomile Tea'],
  },
];

// ─── Toast Container ───────────────────────────────────────────────────────
const ToastContainer = ({ toasts, onRemove }: { toasts: ToastMsg[]; onRemove: (id: number) => void }) => (
  <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto min-w-[260px]",
            t.type === 'success'
              ? 'bg-gym-accent/10 border-gym-accent/30 text-gym-accent'
              : 'bg-gym-rose/10 border-gym-rose/30 text-gym-rose'
          )}
        >
          {t.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span className="text-sm font-medium text-white flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="text-slate-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Plan Card (Poster Style) ──────────────────────────────────────────────
const NutritionCard = ({
  plan, onView, onEdit, onDelete, onDuplicate, onAssign
}: {
  plan: NutritionPlan;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAssign: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalMeals = plan.meals.morning.length + plan.meals.afternoon.length + plan.meals.evening.length;
  const allMeals = [...plan.meals.morning, ...plan.meals.afternoon, ...plan.meals.evening];
  const tp = allMeals.reduce((s, m) => s + m.protein, 0);
  const tc = allMeals.reduce((s, m) => s + m.carbs, 0);
  const tf = allMeals.reduce((s, m) => s + m.fats, 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-2xl overflow-hidden flex flex-col border transition-all duration-300 group",
        "hover:-translate-y-1",
        goalGlow[plan.goal],
        "border-white/10 hover:border-white/25"
      )}
    >
      {/* ── Gradient Hero Header ── */}
      <div
        className="relative px-5 pt-5 pb-6 overflow-hidden"
        style={{ background: goalGradient[plan.goal] }}
      >
        {/* Watermark icon */}
        <div className="absolute -right-4 -bottom-4 opacity-[0.12] pointer-events-none select-none text-white">
          {goalWatermarkIcon[plan.goal]}
        </div>

        {/* Top row: level + status */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white",
              levelStripe[plan.level]
            )}>
              {plan.level}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full",
              plan.status === 'Active'
                ? 'bg-white/20 text-white backdrop-blur-sm'
                : 'bg-black/30 text-white/60'
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", plan.status === 'Active' ? 'bg-green-300' : 'bg-slate-400')} />
              {plan.status}
            </span>
          </div>
        </div>

        {/* Plan name */}
        <div className="relative">
          <h3 className="text-xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
            {plan.name}
          </h3>
          <p className="text-white/70 text-xs mt-1 line-clamp-1">{plan.description}</p>
        </div>
      </div>

      {/* ── Dark Info Panel ── */}
      <div className="bg-[#111827] flex flex-col gap-0 flex-1">
        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
          {[
            { val: `${plan.totalCal}`, lbl: 'Cal/Day', icon: <Flame size={11} /> },
            { val: totalMeals, lbl: 'Meals', icon: <Apple size={11} /> },
            { val: plan.ingredients.length, lbl: 'Ingredients', icon: <Leaf size={11} /> },
          ].map(({ val, lbl, icon }) => (
            <div key={lbl} className="py-3 px-3 flex flex-col items-center gap-0.5">
              <span className="text-slate-500 flex items-center gap-1 text-[9px] uppercase tracking-widest">
                {icon} {lbl}
              </span>
              <span className="text-base font-black text-white">{val}</span>
            </div>
          ))}
        </div>

        {/* Duration + enrolled */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-gym-accent" />
            <span className="text-xs text-slate-300 font-medium">{plan.duration}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Users size={11} className="text-gym-amber" />
            <span className="font-semibold text-white">{plan.assignedClients}</span>
            <span className="text-slate-500">clients</span>
          </div>
        </div>

        {/* Macro bar */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-gym-accent font-bold">{tp}g</span>
              <span className="text-[8px] text-slate-500">Protein</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-gym-amber font-bold">{tc}g</span>
              <span className="text-[8px] text-slate-500">Carbs</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-gym-rose font-bold">{tf}g</span>
              <span className="text-[8px] text-slate-500">Fats</span>
            </div>
          </div>
          <div className="flex gap-0.5 mt-1.5 h-1.5 rounded-full overflow-hidden bg-white/5">
            <div className="h-full bg-gym-accent rounded-l-full" style={{ width: `${(tp / (tp + tc + tf)) * 100}%` }} />
            <div className="h-full bg-gym-amber" style={{ width: `${(tc / (tp + tc + tf)) * 100}%` }} />
            <div className="h-full bg-gym-rose rounded-r-full" style={{ width: `${(tf / (tp + tc + tf)) * 100}%` }} />
          </div>
        </div>

        {/* Meal preview */}
        <div className="px-4 py-3 flex flex-col gap-1">
          {[
            { label: 'Morning', icon: Sun, color: 'text-gym-amber', items: plan.meals.morning },
            { label: 'Afternoon', icon: Flame, color: 'text-orange-400', items: plan.meals.afternoon },
            { label: 'Evening', icon: Moon, color: 'text-gym-secondary', items: plan.meals.evening },
          ].map(section => (
            <div key={section.label}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <section.icon size={9} className={section.color} />
                <span className={cn("text-[7px] font-bold uppercase tracking-widest", section.color)}>{section.label}</span>
                <span className="text-[7px] text-slate-600 ml-auto">{section.items.length}</span>
              </div>
              {section.items.slice(0, 2).map(meal => (
                <div key={meal.name} className="flex items-center justify-between py-0.5 px-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[8px] text-gym-amber/50 font-semibold shrink-0">{meal.time}</span>
                    <span className="text-[10px] text-slate-300 truncate">{meal.name}</span>
                  </div>
                  <span className="text-[8px] text-slate-600 shrink-0 ml-1">{meal.cal}cal</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Ingredients list */}
        <div className="px-4 py-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Leaf size={10} className="text-gym-accent" />
            <span className="text-[8px] font-bold text-gym-accent uppercase tracking-widest">Ingredients</span>
            <span className="text-[8px] text-slate-600 ml-auto">{plan.ingredients.length} items</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {plan.ingredients.map(ing => (
              <span key={ing} className="text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 border border-white/8 text-slate-400">{ing}</span>
            ))}
          </div>
        </div>

        {/* Action buttons row */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-1 mt-auto">
          <div className="flex gap-1">
            {[
              { Icon: Eye, fn: onView, tip: 'View' },
              { Icon: Edit3, fn: onEdit, tip: 'Edit' },
              { Icon: Copy, fn: onDuplicate, tip: 'Duplicate' },
              { Icon: UserPlus, fn: onAssign, tip: 'Assign' },
            ].map(({ Icon, fn, tip }) => (
              <button
                key={tip}
                onClick={fn}
                title={tip}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all"
              >
                <Icon size={13} />
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-gym-rose hover:bg-gym-rose/10 hover:border-gym-rose/20 transition-all"
              title="More options"
            >
              <MoreVertical size={13} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                    className="absolute right-0 bottom-9 z-20 bg-[#1a2437] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[150px] overflow-hidden"
                  >
                    <button
                      onClick={() => { onDelete(); setMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gym-rose hover:bg-gym-rose/10 transition-colors"
                    >
                      <Trash2 size={13} /> Delete Plan
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Delete Confirm Modal ──────────────────────────────────────────────────
const DeleteModal = ({ plan, onConfirm, onCancel }: {
  plan: NutritionPlan;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative z-10 glass-card p-6 w-full max-w-md"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gym-rose/10 rounded-xl flex items-center justify-center">
          <AlertTriangle size={20} className="text-gym-rose" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Delete Nutrition Plan</h3>
          <p className="text-sm text-slate-400">This action cannot be undone</p>
        </div>
      </div>
      <p className="text-slate-300 mb-6">
        Are you sure you want to delete <span className="font-bold text-white">"{plan.name}"</span>?
        {plan.assignedClients > 0 && (
          <span className="text-gym-amber"> {plan.assignedClients} clients are using this plan.</span>
        )}
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-gym-rose text-white rounded-xl text-sm font-bold hover:bg-gym-rose/80 transition-all shadow-lg shadow-gym-rose/20">
          Delete Plan
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Assign Client Modal ───────────────────────────────────────────────────
const AssignModal = ({ plan, onClose, onAssign }: {
  plan: NutritionPlan;
  onClose: () => void;
  onAssign: (clients: string[]) => void;
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (c: string) => setSelected(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative z-10 glass-card p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Assign to Client(s)</h3>
            <p className="text-sm text-slate-400">{plan.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-2 mb-5 max-h-64 overflow-y-auto pr-1">
          {MOCK_CLIENTS.map(client => (
            <button
              key={client}
              onClick={() => toggle(client)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                selected.includes(client)
                  ? "border-gym-accent/40 bg-gym-accent/5 text-white"
                  : "border-white/5 bg-white/3 text-slate-300 hover:border-white/15"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                selected.includes(client) ? "bg-gym-accent border-gym-accent" : "border-white/20"
              )}>
                {selected.includes(client) && <Check size={10} className="text-white" />}
              </div>
              <span className="text-sm font-medium">{client}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">Cancel</button>
          <button
            onClick={() => { onAssign(selected); onClose(); }}
            disabled={selected.length === 0}
            className="flex-1 py-2.5 bg-gym-accent text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20"
          >
            Assign {selected.length > 0 ? `(${selected.length})` : ''}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── View Details Panel ────────────────────────────────────────────────────
const ViewDetailsPanel = ({ plan, onClose, onEdit }: {
  plan: NutritionPlan;
  onClose: () => void;
  onEdit: () => void;
}) => {
  const allMeals = [...plan.meals.morning, ...plan.meals.afternoon, ...plan.meals.evening];
  const tp = allMeals.reduce((s, m) => s + m.protein, 0);
  const tc = allMeals.reduce((s, m) => s + m.carbs, 0);
  const tf = allMeals.reduce((s, m) => s + m.fats, 0);
  const totalMeals = allMeals.length;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-end p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="relative z-10 glass-card w-full max-w-md h-full overflow-y-auto flex flex-col gap-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border", levelBadge[plan.level])}>
                {plan.level}
              </span>
              <span className={cn("text-xs font-semibold flex items-center gap-1", goalColor[plan.goal])}>
                {goalIcon[plan.goal]} {plan.goal}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">{plan.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">{plan.description}</p>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Clock, label: 'Duration', value: plan.duration },
            { icon: Flame, label: 'Calories', value: `${plan.totalCal}/day` },
            { icon: Users, label: 'Assigned', value: `${plan.assignedClients} clients` },
            { icon: Apple, label: 'Meals', value: `${totalMeals} meals/day` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
              <Icon size={14} className="text-gym-accent shrink-0" />
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Macro Totals */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Daily Macros</h4>
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-xl bg-gym-accent/5 border border-gym-accent/10 text-center">
              <p className="text-xl font-bold text-gym-accent">{tp}g</p>
              <p className="text-[9px] text-slate-500 uppercase font-bold">Protein</p>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-gym-amber/5 border border-gym-amber/10 text-center">
              <p className="text-xl font-bold text-gym-amber">{tc}g</p>
              <p className="text-[9px] text-slate-500 uppercase font-bold">Carbs</p>
            </div>
            <div className="flex-1 p-3 rounded-xl bg-gym-rose/5 border border-gym-rose/10 text-center">
              <p className="text-xl font-bold text-gym-rose">{tf}g</p>
              <p className="text-[9px] text-slate-500 uppercase font-bold">Fats</p>
            </div>
          </div>
        </div>

        {/* Meal Schedule */}
        {[
          { label: 'Morning', icon: Sun, color: 'text-gym-amber', bgColor: 'bg-gym-amber/5', items: plan.meals.morning },
          { label: 'Afternoon', icon: Flame, color: 'text-orange-400', bgColor: 'bg-orange-400/5', items: plan.meals.afternoon },
          { label: 'Evening', icon: Moon, color: 'text-gym-secondary', bgColor: 'bg-gym-secondary/5', items: plan.meals.evening },
        ].map(section => (
          <div key={section.label}>
            <div className="flex items-center gap-2 mb-2">
              <section.icon size={14} className={section.color} />
              <h4 className={cn("text-sm font-bold uppercase tracking-wider", section.color)}>{section.label}</h4>
              <span className="text-xs text-slate-500 ml-auto">{section.items.length} meals</span>
            </div>
            <div className="flex flex-col gap-2">
              {section.items.map((meal, i) => (
                <div key={i} className={cn("flex items-center gap-3 p-3 rounded-xl border border-white/5", section.bgColor)}>
                  <span className="text-xs text-gym-amber/60 font-bold shrink-0 w-16">{meal.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{meal.name}</p>
                    <p className="text-[10px] text-slate-500">P:{meal.protein}g · C:{meal.carbs}g · F:{meal.fats}g</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-white">{meal.cal}</span>
                    <span className="text-[9px] text-slate-500 block">cal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Ingredients */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Leaf size={14} className="text-gym-accent" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Ingredients ({plan.ingredients.length})</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {plan.ingredients.map(ing => (
              <span key={ing} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">{ing}</span>
            ))}
          </div>
        </div>

        <button
          onClick={onEdit}
          className="w-full py-3 bg-gym-accent text-white rounded-xl font-bold text-sm hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20 flex items-center justify-center gap-2"
        >
          <Edit3 size={16} /> Edit Plan
        </button>
      </motion.div>
    </div>
  );
};

// ─── Create / Edit Plan Modal ──────────────────────────────────────────────
const CreatePlanModal = ({ initial, onClose, onSave }: {
  initial?: NutritionPlan;
  onClose: () => void;
  onSave: (data: Omit<NutritionPlan, 'id'>) => void;
}) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    goal: (initial?.goal ?? 'Weight Loss') as NutritionGoal,
    level: (initial?.level ?? 'Beginner') as NutritionLevel,
    duration: initial?.duration ?? '8 Weeks',
    totalCal: initial?.totalCal ?? 2000,
    status: (initial?.status ?? 'Active') as PlanStatus,
    description: initial?.description ?? '',
  });

  const [meals, setMeals] = useState(initial?.meals ?? {
    morning: [{ name: '', time: '7:00 AM', cal: 0, protein: 0, carbs: 0, fats: 0, tag: 'Breakfast' }],
    afternoon: [{ name: '', time: '1:00 PM', cal: 0, protein: 0, carbs: 0, fats: 0, tag: 'Lunch' }],
    evening: [{ name: '', time: '7:00 PM', cal: 0, protein: 0, carbs: 0, fats: 0, tag: 'Dinner' }],
  });

  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>(initial?.ingredients ?? []);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ 'Proteins': true });
  const [mealPresetSearch, setMealPresetSearch] = useState('');
  const [showPresets, setShowPresets] = useState<{ session: 'morning' | 'afternoon' | 'evening'; idx: number } | null>(null);
  const [addingIngredient, setAddingIngredient] = useState<{ session: 'morning' | 'afternoon' | 'evening'; idx: number } | null>(null);
  const [ingPickerSearch, setIngPickerSearch] = useState('');

  const toggleCategory = (cat: string) => setOpenCategories(p => ({ ...p, [cat]: !p[cat] }));

  // Add ingredient to a meal and auto-recalculate macros
  const addIngredientToMeal = (session: 'morning' | 'afternoon' | 'evening', mealIdx: number, ingName: string, qty: number) => {
    setMeals(p => {
      const updated = { ...p };
      const meal = { ...updated[session][mealIdx] };
      const items = [...(meal.items || []), { name: ingName, qty, unit: NUTRITION_DB[ingName]?.unit || '1 pc' }];
      const totals = calcMealFromItems(items);
      const newName = items.map(i => `${i.name}${i.qty > 1 ? ' x' + i.qty : ''}`).join(' + ');
      updated[session] = updated[session].map((m, i) => i === mealIdx ? { ...m, items, name: newName, ...totals } : m);
      return updated;
    });
    // Also add to plan ingredients list
    if (!ingredients.includes(ingName)) {
      setIngredients(prev => [...prev, ingName]);
    }
  };

  // Remove ingredient from a meal and recalc
  const removeIngredientFromMeal = (session: 'morning' | 'afternoon' | 'evening', mealIdx: number, ingIdx: number) => {
    setMeals(p => {
      const updated = { ...p };
      const meal = { ...updated[session][mealIdx] };
      const items = (meal.items || []).filter((_, i) => i !== ingIdx);
      const totals = items.length > 0 ? calcMealFromItems(items) : { cal: 0, protein: 0, carbs: 0, fats: 0 };
      const newName = items.length > 0 ? items.map(i => `${i.name}${i.qty > 1 ? ' x' + i.qty : ''}`).join(' + ') : '';
      updated[session] = updated[session].map((m, i) => i === mealIdx ? { ...m, items, name: newName, ...totals } : m);
      return updated;
    });
  };

  // Update qty of an ingredient in a meal
  const updateIngredientQty = (session: 'morning' | 'afternoon' | 'evening', mealIdx: number, ingIdx: number, qty: number) => {
    if (qty < 0.5) return;
    setMeals(p => {
      const updated = { ...p };
      const meal = { ...updated[session][mealIdx] };
      const items = (meal.items || []).map((item, i) => i === ingIdx ? { ...item, qty } : item);
      const totals = calcMealFromItems(items);
      const newName = items.map(i => `${i.name}${i.qty > 1 ? ' x' + i.qty : ''}`).join(' + ');
      updated[session] = updated[session].map((m, i) => i === mealIdx ? { ...m, items, name: newName, ...totals } : m);
      return updated;
    });
  };

  const addMeal = (session: 'morning' | 'afternoon' | 'evening') => {
    const defaults: Record<string, { time: string; tag: string }> = {
      morning: { time: '10:00 AM', tag: 'Snack' },
      afternoon: { time: '3:30 PM', tag: 'Snack' },
      evening: { time: '9:00 PM', tag: 'Snack' },
    };
    setMeals(p => ({
      ...p,
      [session]: [...p[session], { name: '', ...defaults[session], cal: 0, protein: 0, carbs: 0, fats: 0, items: [] }],
    }));
  };

  const updateMeal = (session: 'morning' | 'afternoon' | 'evening', index: number, field: string, value: string | number) => {
    setMeals(p => ({
      ...p,
      [session]: p[session].map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  };

  const removeMeal = (session: 'morning' | 'afternoon' | 'evening', index: number) => {
    setMeals(p => ({ ...p, [session]: p[session].filter((_, i) => i !== index) }));
  };

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients(p => [...p, trimmed]);
      setIngredientInput('');
    }
  };

  const handleSave = () => {
    onSave({
      ...form,
      meals,
      ingredients,
      assignedClients: initial?.assignedClients ?? 0,
      createdDate: initial?.createdDate ?? new Date().toISOString().slice(0, 10),
    });
  };

  const isStep1Valid = form.name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl flex flex-col max-h-[92vh]"
      >
        {/* Gradient header */}
        <div className="relative bg-gradient-to-r from-gym-accent via-gym-secondary to-gym-amber px-6 pt-5 pb-10 shrink-0">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-white/80" />
                <span className="text-white/80 text-xs font-medium tracking-wide uppercase">
                  {initial ? 'Edit Plan' : 'New Plan'} · Step {step} of 3
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                {step === 1 ? 'Plan Details' : step === 2 ? 'Ingredients & Meals' : 'Review & Confirm'}
              </h3>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-all">
              <X size={16} />
            </button>
          </div>
          <div className="relative flex gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={cn("h-1 rounded-full flex-1 transition-all duration-300", s <= step ? 'bg-white' : 'bg-white/20')} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="bg-[#0f1729] px-6 pt-0 pb-5 -mt-5 rounded-t-3xl relative overflow-y-auto flex-1">
          <div className="pt-6">
            {/* Step 1 — Plan Details */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Plan Name *</label>
                  <input
                    type="text" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Weight Loss Plan"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Goal Type</label>
                    <select value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value as NutritionGoal }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gym-accent/50">
                      {(['Weight Loss', 'Muscle Gain', 'Cardio', 'Strength', 'Detox', 'Wellness'] as NutritionGoal[]).map(g => (
                        <option key={g} value={g} className="bg-[#1e293b]">{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Level</label>
                    <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value as NutritionLevel }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gym-accent/50">
                      {(['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as NutritionLevel[]).map(l => (
                        <option key={l} value={l} className="bg-[#1e293b]">{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Duration</label>
                    <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gym-accent/50">
                      {['4 Weeks', '6 Weeks', '8 Weeks', '10 Weeks', '12 Weeks', '16 Weeks', 'Ongoing'].map(d => (
                        <option key={d} value={d} className="bg-[#1e293b]">{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Calories / Day</label>
                    <input type="number" value={form.totalCal}
                      onChange={e => setForm(p => ({ ...p, totalCal: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gym-accent/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Status</label>
                  <div className="flex gap-2">
                    {(['Active', 'Inactive'] as PlanStatus[]).map(s => (
                      <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
                        className={cn("flex-1 py-2 rounded-xl text-sm font-semibold border transition-all",
                          form.status === s
                            ? s === 'Active' ? 'bg-gym-accent/10 border-gym-accent/40 text-gym-accent' : 'bg-slate-700 border-slate-600 text-slate-300'
                            : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                        )}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} placeholder="Brief description..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2 — Build Meals with Ingredients */}
            {step === 2 && (() => {
              const allMealsFlat = [...meals.morning, ...meals.afternoon, ...meals.evening];
              const dailyCal = allMealsFlat.reduce((s, m) => s + m.cal, 0);
              const dailyProtein = allMealsFlat.reduce((s, m) => s + m.protein, 0);
              const dailyCarbs = allMealsFlat.reduce((s, m) => s + m.carbs, 0);
              const dailyFats = allMealsFlat.reduce((s, m) => s + m.fats, 0);
              const calPercent = form.totalCal > 0 ? Math.min((dailyCal / form.totalCal) * 100, 100) : 0;

              return (
              <div className="flex flex-col gap-5">
                {/* ── Running Daily Totals ── */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Nutrition Target</span>
                    <span className={cn("text-[10px] font-bold", calPercent > 100 ? 'text-gym-rose' : calPercent > 80 ? 'text-gym-amber' : 'text-gym-accent')}>
                      {dailyCal} / {form.totalCal} cal ({Math.round(calPercent)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 mb-3 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", calPercent > 100 ? 'bg-gym-rose' : calPercent > 80 ? 'bg-gym-amber' : 'bg-gym-accent')}
                      style={{ width: `${Math.min(calPercent, 100)}%` }} />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Protein', val: dailyProtein, color: 'text-gym-accent', bg: 'bg-gym-accent' },
                      { label: 'Carbs', val: dailyCarbs, color: 'text-gym-amber', bg: 'bg-gym-amber' },
                      { label: 'Fats', val: dailyFats, color: 'text-gym-rose', bg: 'bg-gym-rose' },
                      { label: 'Meals', val: allMealsFlat.length, color: 'text-white', bg: 'bg-white' },
                    ].map(item => (
                      <div key={item.label} className="text-center p-2 rounded-lg bg-white/3">
                        <span className={cn("text-sm font-bold block", item.color)}>{item.val}{item.label !== 'Meals' ? 'g' : ''}</span>
                        <span className="text-[8px] text-slate-500 uppercase font-semibold">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Recommended Diet Guide ── */}
                {GOAL_DIET_RANGES[form.goal] && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                    <div className="px-3 py-2.5 bg-gradient-to-r from-gym-accent/10 to-gym-secondary/10 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Apple size={13} className="text-gym-accent" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Recommended Diet — {form.goal}</span>
                        <span className="text-[8px] text-slate-400">({GOAL_DIET_RANGES[form.goal].length} ingredients)</span>
                      </div>
                      <span className="text-[7px] text-slate-500 italic">Min–Max range per day • Click + to add</span>
                    </div>
                    {(['morning', 'afternoon', 'evening'] as const).map(session => {
                      const sessionItems = GOAL_DIET_RANGES[form.goal].filter(r => r.session === session);
                      if (sessionItems.length === 0) return null;
                      const sLabel = session === 'morning' ? 'Morning' : session === 'afternoon' ? 'Afternoon' : 'Evening';
                      const sColor = session === 'morning' ? 'text-gym-amber' : session === 'afternoon' ? 'text-orange-400' : 'text-gym-secondary';
                      return (
                        <div key={session} className="px-3 py-2 border-b border-white/5 last:border-0">
                          <span className={cn("text-[8px] font-bold uppercase tracking-widest mb-1.5 block", sColor)}>{sLabel}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {sessionItems.map(item => {
                              const info = NUTRITION_DB[item.name];
                              const avgQty = (item.min + item.max) / 2;
                              const inMeals = meals[session].some(m => m.items?.some(i => i.name === item.name));
                              return (
                                <div key={item.name} className={cn(
                                  "group flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all text-[9px]",
                                  inMeals ? 'bg-gym-accent/10 border-gym-accent/30' : 'bg-white/[0.03] border-white/5 hover:border-white/20'
                                )}>
                                  <span className="font-semibold text-white">{item.name}</span>
                                  <span className="text-slate-500">{item.min}–{item.max}{item.unit}</span>
                                  {info && <span className="text-[7px] text-gym-amber">{Math.round(info.cal * avgQty)}cal</span>}
                                  {inMeals ? (
                                    <Check size={9} className="text-gym-accent" />
                                  ) : (
                                    <button onClick={() => {
                                      const q = (item.min + item.max) / 2;
                                      const dbUnit = NUTRITION_DB[item.name]?.unit;
                                      const qtyMultiplier = dbUnit && dbUnit.includes('100g') ? q / 100 : q;
                                      addIngredientToMeal(session, 0, item.name, qtyMultiplier);
                                    }}
                                      className="p-0.5 rounded text-slate-500 hover:text-gym-accent hover:bg-gym-accent/10 opacity-0 group-hover:opacity-100 transition-all"
                                      title={`Add avg ${avgQty}${item.unit} to ${sLabel}`}>
                                      <Plus size={10} />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Meal Builder (per time slot) ── */}
                {([
                  { key: 'morning' as const, label: 'Morning', icon: Sun, color: 'text-gym-amber', borderColor: 'border-gym-amber/20' },
                  { key: 'afternoon' as const, label: 'Afternoon', icon: Flame, color: 'text-orange-400', borderColor: 'border-orange-400/20' },
                  { key: 'evening' as const, label: 'Evening', icon: Moon, color: 'text-gym-secondary', borderColor: 'border-gym-secondary/20' },
                ]).map(section => (
                  <div key={section.key}>
                    <div className="flex items-center gap-2 mb-3">
                      <section.icon size={14} className={section.color} />
                      <h4 className={cn("text-sm font-bold uppercase tracking-wider", section.color)}>{section.label}</h4>
                      <span className="text-[9px] text-slate-500 font-semibold">{meals[section.key].reduce((s, m) => s + m.cal, 0)} cal</span>
                      <button onClick={() => addMeal(section.key)} className="ml-auto text-[10px] text-gym-accent hover:text-white transition-colors flex items-center gap-1">
                        <Plus size={12} /> Add Meal
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {meals[section.key].map((meal, idx) => (
                        <div key={idx} className={cn("p-3 rounded-xl bg-white/5 border flex flex-col gap-2", section.borderColor)}>
                          {/* Meal header: time + tag + delete */}
                          <div className="flex gap-2 items-center">
                            <input type="text" value={meal.time} onChange={e => updateMeal(section.key, idx, 'time', e.target.value)}
                              className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50" />
                            <select value={meal.tag} onChange={e => updateMeal(section.key, idx, 'tag', e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gym-accent/50">
                              <option value="" className="bg-[#1e293b]">Select tag...</option>
                              {MEAL_TAGS.map(t => <option key={t} value={t} className="bg-[#1e293b]">{t}</option>)}
                            </select>
                            <button onClick={() => removeMeal(section.key, idx)} className="text-slate-500 hover:text-gym-rose transition-colors p-1" title="Remove meal">
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Ingredients in this meal */}
                          {(meal.items && meal.items.length > 0) && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Ingredients</span>
                              {meal.items.map((item, ingIdx) => {
                                const info = NUTRITION_DB[item.name];
                                const itemCal = info ? Math.round(info.cal * item.qty) : 0;
                                const itemP = info ? Math.round(info.protein * item.qty) : 0;
                                const itemC = info ? Math.round(info.carbs * item.qty) : 0;
                                const itemF = info ? Math.round(info.fats * item.qty) : 0;
                                return (
                                  <div key={ingIdx} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/3 group">
                                    <span className="text-xs text-white font-medium flex-1 truncate">{item.name}</span>
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => updateIngredientQty(section.key, idx, ingIdx, item.qty - 0.5)}
                                        className="w-5 h-5 rounded bg-white/5 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors">-</button>
                                      <span className="text-[10px] text-gym-accent font-bold w-8 text-center">{item.qty}</span>
                                      <button onClick={() => updateIngredientQty(section.key, idx, ingIdx, item.qty + 0.5)}
                                        className="w-5 h-5 rounded bg-white/5 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors">+</button>
                                    </div>
                                    <span className="text-[8px] text-slate-500 w-10">{info?.unit}</span>
                                    <span className="text-[9px] text-slate-400 w-20 text-right">{itemCal}cal P:{itemP} C:{itemC} F:{itemF}</span>
                                    <button onClick={() => removeIngredientFromMeal(section.key, idx, ingIdx)}
                                      className="text-slate-600 hover:text-gym-rose transition-colors opacity-0 group-hover:opacity-100">
                                      <X size={12} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Add ingredient button + picker */}
                          <div className="relative">
                            <button
                              onClick={() => { setAddingIngredient(p => p?.session === section.key && p.idx === idx ? null : { session: section.key, idx }); setIngPickerSearch(''); }}
                              className="flex items-center gap-1.5 text-[10px] font-semibold text-gym-accent hover:text-white transition-colors py-1">
                              <Plus size={12} /> Add Ingredient
                            </button>
                            {addingIngredient?.session === section.key && addingIngredient.idx === idx && (
                              <div className="absolute left-0 top-7 z-30 w-80 max-h-64 overflow-y-auto bg-[#1a2437] border border-gym-accent/20 rounded-xl shadow-2xl p-3">
                                <div className="relative mb-2">
                                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                  <input type="text" value={ingPickerSearch} onChange={e => setIngPickerSearch(e.target.value)} autoFocus
                                    placeholder="Search ingredient..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-[10px] text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50" />
                                </div>
                                {Object.entries(INGREDIENT_CATEGORIES).map(([cat, items]) => {
                                  const filtered = ingPickerSearch
                                    ? items.filter(i => i.toLowerCase().includes(ingPickerSearch.toLowerCase()))
                                    : items;
                                  if (filtered.length === 0) return null;
                                  return (
                                    <div key={cat} className="mb-2 last:mb-0">
                                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{cat}</span>
                                      {filtered.map(ing => {
                                        const info = NUTRITION_DB[ing];
                                        return (
                                          <button key={ing}
                                            onClick={() => {
                                              addIngredientToMeal(section.key, idx, ing, 1);
                                              setAddingIngredient(null);
                                            }}
                                            className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-left hover:bg-gym-accent/10 transition-colors group">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-semibold text-white group-hover:text-gym-accent">{ing}</span>
                                              <span className="text-[8px] text-slate-600">per {info.unit}</span>
                                            </div>
                                            <span className="text-[8px] text-slate-500">{info.cal}cal · P:{info.protein} C:{info.carbs} F:{info.fats}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Quick preset */}
                          <div className="relative">
                            <button onClick={() => setShowPresets(p => p?.session === section.key && p.idx === idx ? null : { session: section.key, idx })}
                              className="text-[9px] font-medium text-gym-secondary/70 hover:text-gym-secondary flex items-center gap-1 transition-colors">
                              <Zap size={9} /> Or use a preset meal
                            </button>
                            {showPresets?.session === section.key && showPresets.idx === idx && (
                              <div className="absolute left-0 top-6 z-30 w-72 max-h-48 overflow-y-auto bg-[#1a2437] border border-white/10 rounded-xl shadow-2xl p-2">
                                <input type="text" value={mealPresetSearch} onChange={e => setMealPresetSearch(e.target.value)}
                                  placeholder="Search presets..."
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50 mb-1.5" />
                                {MEAL_PRESETS.filter(p => !mealPresetSearch || p.name.toLowerCase().includes(mealPresetSearch.toLowerCase())).map(preset => (
                                  <button key={preset.name}
                                    onClick={() => {
                                      updateMeal(section.key, idx, 'name', preset.name);
                                      updateMeal(section.key, idx, 'cal', preset.cal);
                                      updateMeal(section.key, idx, 'protein', preset.protein);
                                      updateMeal(section.key, idx, 'carbs', preset.carbs);
                                      updateMeal(section.key, idx, 'fats', preset.fats);
                                      updateMeal(section.key, idx, 'tag', preset.tag);
                                      setShowPresets(null);
                                      setMealPresetSearch('');
                                    }}
                                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-white/5 transition-colors group">
                                    <div>
                                      <span className="text-[10px] font-semibold text-white group-hover:text-gym-accent transition-colors">{preset.name}</span>
                                      <span className="text-[8px] text-slate-500 block">P:{preset.protein}g · C:{preset.carbs}g · F:{preset.fats}g</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400">{preset.cal} cal</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Auto-calculated nutrition summary for this meal */}
                          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                            <span className="text-xs font-bold text-white">{meal.name || '(no ingredients yet)'}</span>
                            <span className="ml-auto text-[9px] font-bold text-gym-accent">{meal.cal} cal</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center py-1 rounded-md bg-gym-accent/5">
                              <span className="text-[10px] font-bold text-gym-accent">{meal.protein}g</span>
                              <span className="text-[7px] text-slate-500 block">Protein</span>
                            </div>
                            <div className="text-center py-1 rounded-md bg-gym-amber/5">
                              <span className="text-[10px] font-bold text-gym-amber">{meal.carbs}g</span>
                              <span className="text-[7px] text-slate-500 block">Carbs</span>
                            </div>
                            <div className="text-center py-1 rounded-md bg-gym-rose/5">
                              <span className="text-[10px] font-bold text-gym-rose">{meal.fats}g</span>
                              <span className="text-[7px] text-slate-500 block">Fats</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}

            {/* Step 3 — Review */}
            {step === 3 && (() => {
              const allM = [...meals.morning, ...meals.afternoon, ...meals.evening];
              const rCal = allM.reduce((s, m) => s + m.cal, 0);
              const rP = allM.reduce((s, m) => s + m.protein, 0);
              const rC = allM.reduce((s, m) => s + m.carbs, 0);
              const rF = allM.reduce((s, m) => s + m.fats, 0);
              return (
              <div className="flex flex-col gap-4">
                {/* Plan info summary */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-bold text-white mb-3">Plan Summary</h4>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="text-white font-medium">{form.name || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Goal</span><span className={goalColor[form.goal]}>{form.goal}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Level</span><span className="text-white">{form.level}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="text-white">{form.duration}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Target Cal/Day</span><span className="text-white">{form.totalCal}</span></div>
                  </div>
                </div>

                {/* Macro totals */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-gym-accent/5 border border-gym-accent/10 text-center">
                    <p className="text-lg font-bold text-gym-accent">{rP}g</p>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">Protein</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gym-amber/5 border border-gym-amber/10 text-center">
                    <p className="text-lg font-bold text-gym-amber">{rC}g</p>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">Carbs</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gym-rose/5 border border-gym-rose/10 text-center">
                    <p className="text-lg font-bold text-gym-rose">{rF}g</p>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">Fats</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-lg font-bold text-white">{rCal}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">Total Cal</p>
                  </div>
                </div>

                {/* Meal breakdown with ingredient details */}
                {([
                  { label: 'Morning', icon: Sun, color: 'text-gym-amber', items: meals.morning },
                  { label: 'Afternoon', icon: Flame, color: 'text-orange-400', items: meals.afternoon },
                  { label: 'Evening', icon: Moon, color: 'text-gym-secondary', items: meals.evening },
                ] as const).map(sec => sec.items.length > 0 && (
                  <div key={sec.label}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <sec.icon size={12} className={sec.color} />
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", sec.color)}>{sec.label}</span>
                      <span className="text-[9px] text-slate-500 ml-auto">{sec.items.reduce((s, m) => s + m.cal, 0)} cal</span>
                    </div>
                    {sec.items.map((m, i) => (
                      <div key={i} className="rounded-lg bg-white/3 mb-1.5 overflow-hidden">
                        <div className="flex items-center gap-2 py-1.5 px-2.5">
                          <span className="text-[9px] text-slate-500 w-14 shrink-0">{m.time}</span>
                          <span className="text-xs text-white font-semibold flex-1 truncate">{m.name || '(unnamed)'}</span>
                          <span className="text-[9px] text-slate-500">P:{m.protein}g C:{m.carbs}g F:{m.fats}g</span>
                          <span className="text-[10px] text-white font-bold w-12 text-right">{m.cal} cal</span>
                        </div>
                        {m.items && m.items.length > 0 && (
                          <div className="px-2.5 pb-1.5 flex flex-wrap gap-1">
                            {m.items.map((item, j) => {
                              const info = NUTRITION_DB[item.name];
                              return (
                                <span key={j} className="text-[8px] text-slate-400 px-1.5 py-0.5 rounded bg-white/3 border border-white/5">
                                  {item.name} x{item.qty} {info?.unit} ({info ? Math.round(info.cal * item.qty) : '?'} cal)
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Ingredients list */}
                {ingredients.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Leaf size={12} className="text-gym-accent" />
                      <span className="text-[10px] font-bold text-gym-accent uppercase tracking-widest">Ingredients ({ingredients.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ingredients.map(ing => (
                        <span key={ing} className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                          {ing}
                          <button onClick={() => setIngredients(p => p.filter(x => x !== ing))} className="text-slate-500 hover:text-gym-rose ml-0.5"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              );
            })()}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !isStep1Valid}
                className="flex-1 py-2.5 bg-gym-accent text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!isStep1Valid}
                className="flex-1 py-2.5 bg-gym-accent text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20 flex items-center justify-center gap-2"
              >
                <Check size={16} /> {initial ? 'Update Plan' : 'Create Plan'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Ingredient Nutrition Master Panel ─────────────────────────────────────
const IngredientMasterPanel = ({ onClose, customIngredients, onAddCustom, onUpdateCustom, onDeleteCustom, customNutrientTypes, onAddNutrientType, onUpdateNutrientType, onDeleteNutrientType }: {
  onClose: () => void;
  customIngredients: Record<string, NutritionInfo>;
  onAddCustom: (name: string, info: NutritionInfo) => void;
  onUpdateCustom: (name: string, info: NutritionInfo) => void;
  onDeleteCustom: (name: string) => void;
  customNutrientTypes: NutrientDef[];
  onAddNutrientType: (def: NutrientDef) => void;
  onUpdateNutrientType: (id: string, def: NutrientDef) => void;
  onDeleteNutrientType: (id: string) => void;
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<string>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newIng, setNewIng] = useState<Record<string, any>>({ name: '', unit: '1', cal: 0, protein: 0, carbs: 0, fats: 0, sodium: 0, potassium: 0, fiber: 0, sugar: 0, calcium: 0, iron: 0, category: 'Proteins' });
  const [editingNutrient, setEditingNutrient] = useState<string | null>(null);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [calcItems, setCalcItems] = useState<{ name: string; qty: number }[]>([]);
  const [calcSearch, setCalcSearch] = useState('');
  const [showCalcSuggestions, setShowCalcSuggestions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showDietBuilder, setShowDietBuilder] = useState(false);
  const [dietItems, setDietItems] = useState<{ name: string; qty: number; session: 'morning' | 'afternoon' | 'evening' }[]>([]);
  const [dietName, setDietName] = useState('');
  const [dietSearch, setDietSearch] = useState('');
  const [showDietSuggestions, setShowDietSuggestions] = useState(false);
  const [dietSession, setDietSession] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [savedDiets, setSavedDiets] = useState<{ name: string; items: { name: string; qty: number; session: 'morning' | 'afternoon' | 'evening' }[] }[]>([]);
  const [editingDietIdx, setEditingDietIdx] = useState<number | null>(null);
  const [showDishBuilder, setShowDishBuilder] = useState(false);
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Breakfast');
  const [dishGoal, setDishGoal] = useState('Maintenance');
  const [dishItems, setDishItems] = useState<{ name: string; qty: number }[]>([]);
  const [dishSearch, setDishSearch] = useState('');
  const [showDishSuggestions, setShowDishSuggestions] = useState(false);
  const [dishFilterCat, setDishFilterCat] = useState<string>('All');
  const [dishFilterGoal, setDishFilterGoal] = useState<string>('All');

  type SavedDish = { name: string; category: string; goal: string; items: { name: string; qty: number }[] };
  const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Pre-Workout', 'Post-Workout', 'Snack'];
  const GOAL_TYPES = ['Weight Loss', 'Muscle Gain', 'Maintenance'];

  // Pre-built professional fitness recipes
  const DEFAULT_DISHES: SavedDish[] = [
    { name: 'Protein Oatmeal Bowl', category: 'Breakfast', goal: 'Muscle Gain', items: [{ name: 'Oats', qty: 1 }, { name: 'Whey Protein', qty: 1 }, { name: 'Banana', qty: 1 }, { name: 'Almonds', qty: 1 }, { name: 'Honey', qty: 1 }] },
    { name: 'Egg White Omelette', category: 'Breakfast', goal: 'Weight Loss', items: [{ name: 'Egg Whites', qty: 4 }, { name: 'Spinach', qty: 0.5 }, { name: 'Bell Peppers', qty: 0.5 }, { name: 'Tomato', qty: 0.5 }] },
    { name: 'Greek Yogurt Parfait', category: 'Breakfast', goal: 'Maintenance', items: [{ name: 'Greek Yogurt', qty: 2 }, { name: 'Blueberries', qty: 1 }, { name: 'Honey', qty: 0.5 }, { name: 'Chia Seeds', qty: 1 }, { name: 'Almonds', qty: 0.5 }] },
    { name: 'Power Smoothie', category: 'Breakfast', goal: 'Muscle Gain', items: [{ name: 'Banana', qty: 1 }, { name: 'Whey Protein', qty: 1 }, { name: 'Milk', qty: 1 }, { name: 'Peanut Butter', qty: 1 }, { name: 'Oats', qty: 0.5 }] },
    { name: 'Grilled Chicken Salad', category: 'Lunch', goal: 'Weight Loss', items: [{ name: 'Chicken Breast', qty: 1.5 }, { name: 'Lettuce', qty: 1 }, { name: 'Cucumber', qty: 1 }, { name: 'Tomato', qty: 1 }, { name: 'Olive Oil', qty: 1 }, { name: 'Lemon', qty: 0.5 }] },
    { name: 'Chicken Rice Bowl', category: 'Lunch', goal: 'Muscle Gain', items: [{ name: 'Chicken Breast', qty: 2 }, { name: 'Brown Rice', qty: 1.5 }, { name: 'Broccoli', qty: 1 }, { name: 'Olive Oil', qty: 1 }] },
    { name: 'Quinoa Veggie Bowl', category: 'Lunch', goal: 'Maintenance', items: [{ name: 'Quinoa', qty: 1.5 }, { name: 'Spinach', qty: 1 }, { name: 'Avocado', qty: 0.5 }, { name: 'Bell Peppers', qty: 1 }, { name: 'Olive Oil', qty: 1 }, { name: 'Lemon', qty: 0.5 }] },
    { name: 'Tuna Wrap', category: 'Lunch', goal: 'Weight Loss', items: [{ name: 'Tuna', qty: 1 }, { name: 'Whole Wheat Bread', qty: 2 }, { name: 'Lettuce', qty: 0.5 }, { name: 'Tomato', qty: 0.5 }, { name: 'Cucumber', qty: 0.5 }] },
    { name: 'Salmon & Sweet Potato', category: 'Dinner', goal: 'Muscle Gain', items: [{ name: 'Salmon', qty: 1.5 }, { name: 'Sweet Potato', qty: 2 }, { name: 'Asparagus', qty: 1 }, { name: 'Olive Oil', qty: 1 }, { name: 'Lemon', qty: 0.5 }] },
    { name: 'Grilled Fish & Veggies', category: 'Dinner', goal: 'Weight Loss', items: [{ name: 'Cod Fish', qty: 1.5 }, { name: 'Broccoli', qty: 1 }, { name: 'Zucchini', qty: 1 }, { name: 'Olive Oil', qty: 0.5 }, { name: 'Lemon', qty: 0.5 }] },
    { name: 'Steak & Brown Rice', category: 'Dinner', goal: 'Muscle Gain', items: [{ name: 'Beef Steak', qty: 2 }, { name: 'Brown Rice', qty: 1.5 }, { name: 'Mixed Veggies', qty: 1 }, { name: 'Olive Oil', qty: 1 }] },
    { name: 'Paneer Tikka Bowl', category: 'Dinner', goal: 'Maintenance', items: [{ name: 'Paneer', qty: 1.5 }, { name: 'Rice', qty: 1 }, { name: 'Bell Peppers', qty: 1 }, { name: 'Tomato', qty: 1 }, { name: 'Olive Oil', qty: 1 }] },
    { name: 'Pre-Workout Energy Shake', category: 'Pre-Workout', goal: 'Muscle Gain', items: [{ name: 'Banana', qty: 1 }, { name: 'Oats', qty: 0.5 }, { name: 'Honey', qty: 1 }, { name: 'Milk', qty: 1 }, { name: 'Dates', qty: 2 }] },
    { name: 'Pre-Workout Snack Plate', category: 'Pre-Workout', goal: 'Maintenance', items: [{ name: 'Apple', qty: 1 }, { name: 'Peanut Butter', qty: 1 }, { name: 'Dates', qty: 3 }] },
    { name: 'Post-Workout Recovery Shake', category: 'Post-Workout', goal: 'Muscle Gain', items: [{ name: 'Whey Protein', qty: 1 }, { name: 'Banana', qty: 1 }, { name: 'Milk', qty: 1 }, { name: 'Peanut Butter', qty: 1 }] },
    { name: 'Post-Workout Casein Bowl', category: 'Post-Workout', goal: 'Muscle Gain', items: [{ name: 'Casein Protein', qty: 1 }, { name: 'Greek Yogurt', qty: 1 }, { name: 'Blueberries', qty: 0.5 }, { name: 'Almonds', qty: 1 }] },
    { name: 'Detox Green Smoothie', category: 'Snack', goal: 'Weight Loss', items: [{ name: 'Spinach', qty: 1 }, { name: 'Cucumber', qty: 1 }, { name: 'Apple', qty: 1 }, { name: 'Lemon', qty: 1 }, { name: 'Ginger', qty: 1 }, { name: 'Green Tea', qty: 1 }] },
    { name: 'Trail Mix Energy Bites', category: 'Snack', goal: 'Maintenance', items: [{ name: 'Trail Mix', qty: 1 }, { name: 'Dates', qty: 2 }, { name: 'Peanut Butter', qty: 1 }, { name: 'Honey', qty: 0.5 }] },
    { name: 'Cottage Cheese & Fruit', category: 'Snack', goal: 'Weight Loss', items: [{ name: 'Cottage Cheese', qty: 1.5 }, { name: 'Blueberries', qty: 0.5 }, { name: 'Flax Seeds', qty: 1 }] },
    { name: 'Overnight Oats', category: 'Breakfast', goal: 'Maintenance', items: [{ name: 'Oats', qty: 0.5 }, { name: 'Milk', qty: 0.5 }, { name: 'Chia Seeds', qty: 1 }, { name: 'Honey', qty: 0.5 }, { name: 'Banana', qty: 0.5 }, { name: 'Almonds', qty: 0.5 }] },
    { name: 'Tofu Stir Fry', category: 'Lunch', goal: 'Weight Loss', items: [{ name: 'Tofu', qty: 2 }, { name: 'Broccoli', qty: 1 }, { name: 'Bell Peppers', qty: 1 }, { name: 'Zucchini', qty: 0.5 }, { name: 'Olive Oil', qty: 1 }, { name: 'Ginger', qty: 1 }] },
  ];

  const [savedDishes, setSavedDishes] = useState<SavedDish[]>(DEFAULT_DISHES);
  const [editingDishIdx, setEditingDishIdx] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showNutrientPopup, setShowNutrientPopup] = useState(false);
  const [popupNutrient, setPopupNutrient] = useState({ name: '', unit: 'mg', color: NUTRIENT_COLORS[0], maxValue: 1000, step: 5 });

  const allDB = { ...NUTRITION_DB, ...customIngredients };
  const categories = ['All', ...Array.from(new Set(Object.values(allDB).map(v => v.category)))];

  const entries = useMemo(() => {
    let items = Object.entries(allDB).map(([name, info]) => ({ name, ...info, isCustom: name in customIngredients }));
    if (categoryFilter !== 'All') items = items.filter(i => i.category === categoryFilter);
    if (search) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    items.sort((a, b) => {
      const coreFields = ['name', 'cal', 'protein', 'carbs', 'fats', 'sodium', 'potassium', 'fiber', 'sugar', 'calcium', 'iron'];
      let av: any, bv: any;
      if (sortField === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (coreFields.includes(sortField)) { av = (a as any)[sortField]; bv = (b as any)[sortField]; }
      else { av = a.extras?.[sortField] ?? 0; bv = b.extras?.[sortField] ?? 0; }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return items;
  }, [allDB, categoryFilter, search, sortField, sortAsc, customIngredients]);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortAsc(p => !p);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortHeader = ({ field, label, w }: { field: string; label: string; w: string }) => (
    <button onClick={() => toggleSort(field)}
      className={cn("flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors", w,
        sortField === field ? 'text-gym-accent' : 'text-slate-500 hover:text-slate-300')}>
      {label}
      {sortField === field && <ArrowUpDown size={9} className={sortAsc ? '' : 'rotate-180'} />}
    </button>
  );

  const totalItems = Object.keys(allDB).length;
  const totalCustom = Object.keys(customIngredients).length;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className={cn("relative z-10 bg-[#0f1729] w-full h-full flex flex-col border-l border-white/10 shadow-2xl", isFullscreen ? 'max-w-full' : 'max-w-3xl')}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gym-accent via-emerald-600 to-teal-500 px-6 pt-5 pb-6 shrink-0">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database size={16} className="text-white/80" />
                <span className="text-white/80 text-xs font-medium tracking-wide uppercase">Nutrition Database</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">Ingredient Master</h3>
              <p className="text-white/60 text-xs mt-1">{totalItems} ingredients · {totalCustom} custom</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsFullscreen(f => !f)} className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-all" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button onClick={onClose} className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-all">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 pt-4 pb-3 flex flex-col gap-3 border-b border-white/5 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search ingredients..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50" />
            </div>
            <button onClick={() => { setShowCalc(p => !p); }}
              className={cn("flex items-center gap-2 px-4 py-2 border rounded-xl font-bold text-xs transition-all",
                showCalc ? 'bg-gym-amber/10 border-gym-amber/30 text-gym-amber' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
              <Calculator size={14} /> Nutrition Calc {calcItems.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-gym-amber/20 text-gym-amber text-[8px] font-bold">{calcItems.length}</span>}
            </button>
            <button onClick={() => { setShowNutrientPopup(true); setPopupNutrient({ name: '', unit: 'mg', color: NUTRIENT_COLORS[(customNutrientTypes.length) % NUTRIENT_COLORS.length], maxValue: 1000, step: 5 }); setEditingNutrient(null); }}
              className={cn("flex items-center gap-2 px-4 py-2 border rounded-xl font-bold text-xs transition-all",
                'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
              <Zap size={14} /> Nutrient Types {customNutrientTypes.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-gym-secondary/20 text-gym-secondary text-[8px] font-bold">{customNutrientTypes.length}</span>}
            </button>
            <button onClick={() => { setShowDishBuilder(true); setDishName(''); setDishCategory('Breakfast'); setDishGoal('Maintenance'); setDishItems([]); setDishSearch(''); setEditingDishIdx(null); }}
              className={cn("flex items-center gap-2 px-4 py-2 border rounded-xl font-bold text-xs transition-all",
                'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
              <Sparkles size={14} /> Meal Prep {savedDishes.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[8px] font-bold">{savedDishes.length}</span>}
            </button>
            <button onClick={() => { setShowDietBuilder(d => !d); }}
              className={cn("flex items-center gap-2 px-4 py-2 border rounded-xl font-bold text-xs transition-all",
                showDietBuilder ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')}>
              <Leaf size={14} /> Diet Builder {savedDiets.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-bold">{savedDiets.length}</span>}
            </button>
            <button onClick={() => { setShowAddForm(true); setEditingItem(null); const extras: Record<string, number> = {}; customNutrientTypes.forEach(n => { extras[n.id] = 0; }); setNewIng({ name: '', unit: '1', cal: 0, protein: 0, carbs: 0, fats: 0, sodium: 0, potassium: 0, fiber: 0, sugar: 0, calcium: 0, iron: 0, category: 'Proteins', ...extras }); }}
              className="flex items-center gap-2 px-4 py-2 bg-gym-accent text-white rounded-xl font-bold text-xs hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20">
              <Plus size={14} /> Add Ingredient
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)}
                className={cn("px-3 py-1 rounded-lg text-[10px] font-semibold border whitespace-nowrap transition-all",
                  categoryFilter === c
                    ? 'bg-gym-accent/10 border-gym-accent/30 text-gym-accent'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10')}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Nutrition Calculator */}
        <AnimatePresence>
          {showCalc && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/5 shrink-0">
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calculator size={14} className="text-gym-amber" />
                    <h4 className="text-sm font-bold text-white">Nutrition Calculator</h4>
                    <span className="text-[8px] text-slate-500">Add any ingredient — auto-shows only relevant nutrients</span>
                  </div>
                  {calcItems.length > 0 && (
                    <button onClick={() => setCalcItems([])} className="text-[9px] text-slate-500 hover:text-gym-rose transition-colors">Clear all</button>
                  )}
                </div>
                {/* Add ingredient to calculator */}
                <div className="relative mb-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" value={calcSearch}
                        onChange={e => { setCalcSearch(e.target.value); setShowCalcSuggestions(true); }}
                        onFocus={() => setShowCalcSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowCalcSuggestions(false), 150)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && calcSearch.trim()) {
                            const qm = calcSearch.match(/^(\d+\.?\d*)\s+(.+)/);
                            const qty = qm ? parseFloat(qm[1]) : 1;
                            const term = (qm ? qm[2] : calcSearch).trim();
                            // Try to find in DB first
                            const match = Object.keys(allDB).find(n => n.toLowerCase() === term.toLowerCase())
                              || Object.keys(allDB).find(n => n.toLowerCase().includes(term.toLowerCase()));
                            const name = match || term;
                            setCalcItems(prev => {
                              const existing = prev.find(x => x.name === name);
                              if (existing) return prev.map(x => x.name === name ? { ...x, qty: x.qty + qty } : x);
                              return [...prev, { name, qty }];
                            });
                            setCalcSearch('');
                            setShowCalcSuggestions(false);
                          }
                        }}
                        placeholder="Type ingredient & press Enter (e.g. 3 Eggs, Paneer, Amla...)"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-amber/50" />
                      {showCalcSuggestions && calcSearch.length >= 1 && (() => {
                        const qm = calcSearch.match(/^(\d+\.?\d*)\s+(.+)/);
                        const qty = qm ? parseFloat(qm[1]) : 1;
                        const term = (qm ? qm[2] : calcSearch).trim().toLowerCase();
                        const matches = Object.entries(allDB).filter(([n]) => n.toLowerCase().includes(term)).slice(0, 8);
                        const hasExact = matches.some(([n]) => n.toLowerCase() === term);
                        return (
                          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {matches.map(([n, info]) => (
                              <button key={n} type="button"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                  setCalcItems(prev => {
                                    const existing = prev.find(x => x.name === n);
                                    if (existing) return prev.map(x => x.name === n ? { ...x, qty: x.qty + qty } : x);
                                    return [...prev, { name: n, qty }];
                                  });
                                  setCalcSearch('');
                                  setShowCalcSuggestions(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors flex items-center justify-between gap-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-white font-semibold truncate">{qty > 1 ? `${qty} × ` : ''}{n}</span>
                                  <span className="text-[7px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">{info.category}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 text-[8px]">
                                  <span className="text-white">{Math.round(info.cal * qty)}cal</span>
                                  <span className="text-gym-accent">{+(info.protein * qty).toFixed(1)}p</span>
                                  <span className="text-gym-amber">{+(info.carbs * qty).toFixed(1)}c</span>
                                  <span className="text-gym-rose">{+(info.fats * qty).toFixed(1)}f</span>
                                </div>
                              </button>
                            ))}
                            {!hasExact && term.length >= 2 && (
                              <button type="button"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                  const name = (qm ? qm[2] : calcSearch).trim();
                                  setCalcItems(prev => {
                                    const existing = prev.find(x => x.name === name);
                                    if (existing) return prev.map(x => x.name === name ? { ...x, qty: x.qty + qty } : x);
                                    return [...prev, { name, qty }];
                                  });
                                  setCalcSearch('');
                                  setShowCalcSuggestions(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-gym-amber/10 transition-colors flex items-center gap-2 border-t border-white/10">
                                <Plus size={11} className="text-gym-amber shrink-0" />
                                <span className="text-gym-amber font-semibold">Add "{(qm ? qm[2] : calcSearch).trim()}"</span>
                                <span className="text-[8px] text-slate-500">as custom ingredient{qty > 1 ? ` (×${qty})` : ''}</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Calculator items list with per-item nutrient breakdown */}
                {calcItems.length > 0 ? (() => {
                  // Compute totals and track which nutrients are non-zero
                  const totals = { cal: 0, protein: 0, carbs: 0, fats: 0, sodium: 0, potassium: 0, fiber: 0, sugar: 0, calcium: 0, iron: 0 } as Record<string, number>;
                  const extraTotals: Record<string, number> = {};
                  customNutrientTypes.forEach(nt => { extraTotals[nt.id] = 0; });
                  const itemNutrients: Record<string, number>[] = [];
                  calcItems.forEach(item => {
                    const info = allDB[item.name];
                    const row: Record<string, number> = { cal: 0, protein: 0, carbs: 0, fats: 0, sodium: 0, potassium: 0, fiber: 0, sugar: 0, calcium: 0, iron: 0 };
                    if (info) {
                      row.cal = Math.round(info.cal * item.qty);
                      row.protein = +(info.protein * item.qty).toFixed(1);
                      row.carbs = +(info.carbs * item.qty).toFixed(1);
                      row.fats = +(info.fats * item.qty).toFixed(1);
                      row.sodium = Math.round(info.sodium * item.qty);
                      row.potassium = Math.round(info.potassium * item.qty);
                      row.fiber = +(info.fiber * item.qty).toFixed(1);
                      row.sugar = +(info.sugar * item.qty).toFixed(1);
                      row.calcium = Math.round(info.calcium * item.qty);
                      row.iron = +(info.iron * item.qty).toFixed(1);
                      customNutrientTypes.forEach(nt => {
                        const v = Math.round((info.extras?.[nt.id] ?? 0) * item.qty);
                        row[nt.id] = v;
                        extraTotals[nt.id] += v;
                      });
                    }
                    Object.keys(row).forEach(k => { totals[k] = (totals[k] || 0) + row[k]; });
                    itemNutrients.push(row);
                  });

                  const allNutrients = [
                    { key: 'cal', label: 'Cal', unit: 'kcal', color: 'text-white', bg: 'bg-white/10' },
                    { key: 'protein', label: 'Protein', unit: 'g', color: 'text-gym-accent', bg: 'bg-gym-accent/10' },
                    { key: 'carbs', label: 'Carbs', unit: 'g', color: 'text-gym-amber', bg: 'bg-gym-amber/10' },
                    { key: 'fats', label: 'Fat', unit: 'g', color: 'text-gym-rose', bg: 'bg-gym-rose/10' },
                    { key: 'sodium', label: 'Sodium', unit: 'mg', color: 'text-sky-400', bg: 'bg-sky-400/10' },
                    { key: 'potassium', label: 'K', unit: 'mg', color: 'text-violet-400', bg: 'bg-violet-400/10' },
                    { key: 'fiber', label: 'Fiber', unit: 'g', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { key: 'sugar', label: 'Sugar', unit: 'g', color: 'text-orange-400', bg: 'bg-orange-400/10' },
                    { key: 'calcium', label: 'Ca', unit: 'mg', color: 'text-cyan-300', bg: 'bg-cyan-300/10' },
                    { key: 'iron', label: 'Fe', unit: 'mg', color: 'text-red-400', bg: 'bg-red-400/10' },
                    ...customNutrientTypes.map(nt => ({ key: nt.id, label: nt.name, unit: nt.unit, color: nt.color, bg: 'bg-white/[0.03]' })),
                  ];
                  // Only show nutrients that have a non-zero total
                  const activeNutrients = allNutrients.filter(n => (totals[n.key] || 0) > 0);

                  return (
                    <>
                      {/* Items table */}
                      <div className="mb-3 rounded-lg border border-white/5 overflow-hidden">
                        {/* Table header */}
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.04] border-b border-white/5 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                          <span className="w-[130px] shrink-0">Ingredient</span>
                          <span className="w-[80px] shrink-0 text-center">Qty</span>
                          {activeNutrients.map(n => (
                            <span key={n.key} className={cn("flex-1 text-center min-w-[45px]", n.color)}>{n.label}</span>
                          ))}
                          <span className="w-5 shrink-0" />
                        </div>
                        {/* Table rows */}
                        <div className="max-h-44 overflow-y-auto">
                          {calcItems.map((item, idx) => {
                            const info = allDB[item.name];
                            const row = itemNutrients[idx];
                            return (
                              <div key={item.name} className={cn("flex items-center gap-1 px-3 py-1.5 group hover:bg-white/5 transition-all",
                                idx % 2 === 0 ? 'bg-white/[0.02]' : '')}>
                                <div className="w-[130px] shrink-0 flex items-center gap-1 min-w-0">
                                  <span className="text-[10px] font-semibold text-white truncate">{item.name}</span>
                                  {!info && <span className="text-[6px] px-1 py-0.5 rounded bg-gym-amber/10 border border-gym-amber/20 text-gym-amber font-bold shrink-0">NEW</span>}
                                </div>
                                <div className="w-[80px] shrink-0 flex items-center justify-center gap-0.5">
                                  <button onClick={() => setCalcItems(p => p.map((x, i) => i === idx ? { ...x, qty: Math.max(0.5, x.qty - 0.5) } : x))}
                                    className="w-4 h-4 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-[10px] font-bold transition-all">-</button>
                                  <input type="number" value={item.qty} min={0.5} step={0.5}
                                    onChange={e => { const v = parseFloat(e.target.value) || 0.5; setCalcItems(p => p.map((x, i) => i === idx ? { ...x, qty: v } : x)); }}
                                    className="w-10 text-center bg-white/5 border border-white/10 rounded px-0.5 py-0.5 text-[9px] text-gym-amber font-bold focus:outline-none focus:border-gym-amber/50" />
                                  <button onClick={() => setCalcItems(p => p.map((x, i) => i === idx ? { ...x, qty: x.qty + 0.5 } : x))}
                                    className="w-4 h-4 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-[10px] font-bold transition-all">+</button>
                                </div>
                                {activeNutrients.map(n => (
                                  <span key={n.key} className={cn("flex-1 text-center text-[9px] font-bold min-w-[45px]", row[n.key] > 0 ? n.color : 'text-slate-700')}>
                                    {row[n.key] > 0 ? (n.key === 'cal' || n.key === 'sodium' || n.key === 'potassium' || n.key === 'calcium' ? Math.round(row[n.key]) : row[n.key]) : '—'}
                                  </span>
                                ))}
                                <button onClick={() => setCalcItems(p => p.filter((_, i) => i !== idx))}
                                  className="w-5 shrink-0 p-0.5 text-slate-600 hover:text-gym-rose opacity-0 group-hover:opacity-100 transition-all">
                                  <X size={10} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        {/* Totals row */}
                        <div className="flex items-center gap-1 px-3 py-2 bg-white/[0.06] border-t border-white/10">
                          <span className="w-[130px] shrink-0 text-[10px] font-extrabold text-gym-amber uppercase tracking-wider">Total</span>
                          <span className="w-[80px] shrink-0 text-center text-[9px] text-slate-400">{calcItems.length} items</span>
                          {activeNutrients.map(n => (
                            <span key={n.key} className={cn("flex-1 text-center text-[10px] font-extrabold min-w-[45px]", n.color)}>
                              {n.key === 'cal' || n.key === 'sodium' || n.key === 'potassium' || n.key === 'calcium' ? Math.round(totals[n.key] || 0) : +(totals[n.key] || 0).toFixed(1)}
                            </span>
                          ))}
                          <span className="w-5 shrink-0" />
                        </div>
                      </div>

                      {/* Visual summary cards - only for active nutrients */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <Flame size={11} className="text-gym-amber" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nutrition Summary</span>
                      </div>
                      <div className={cn("grid gap-1.5", activeNutrients.length <= 5 ? 'grid-cols-' + activeNutrients.length : 'grid-cols-5')}>
                        {activeNutrients.map(n => (
                          <div key={n.key} className={cn("rounded-lg px-2 py-1.5 border border-white/5", n.bg)}>
                            <div className={cn("text-[7px] font-bold uppercase tracking-wider mb-0.5", n.color)}>{n.label}</div>
                            <div className={cn("text-sm font-extrabold", n.color)}>
                              {n.key === 'cal' || n.key === 'sodium' || n.key === 'potassium' || n.key === 'calcium' ? Math.round(totals[n.key] || 0) : +(totals[n.key] || 0).toFixed(1)}
                              <span className="text-[7px] font-normal ml-0.5 opacity-60">{n.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })() : (
                  <div className="text-center py-4 mb-3">
                    <Scale size={24} className="mx-auto text-slate-700 mb-2" />
                    <p className="text-[10px] text-slate-600">Type any ingredient name above & press Enter to add it</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diet Builder */}
        <AnimatePresence>
          {showDietBuilder && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/5 shrink-0">
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Leaf size={14} className="text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Diet Builder</h4>
                    <span className="text-[8px] text-slate-500">Create diets with ingredients by meal session</span>
                  </div>
                  {dietItems.length > 0 && (
                    <button onClick={() => { setDietItems([]); setDietName(''); setEditingDietIdx(null); }} className="text-[9px] text-slate-500 hover:text-gym-rose transition-colors">Clear all</button>
                  )}
                </div>

                {/* Diet Name */}
                <input type="text" value={dietName} onChange={e => setDietName(e.target.value)}
                  placeholder="Diet name (e.g. Muscle Gain Day 1, Client Morning Plan...)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 mb-3" />

                {/* Session selector + Search */}
                <div className="flex gap-2 mb-3">
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden shrink-0">
                    {(['morning', 'afternoon', 'evening'] as const).map(s => (
                      <button key={s} onClick={() => setDietSession(s)}
                        className={cn("px-3 py-2 text-[9px] font-bold capitalize transition-all",
                          dietSession === s
                            ? s === 'morning' ? 'bg-amber-500/20 text-amber-400' : s === 'afternoon' ? 'bg-sky-500/20 text-sky-400' : 'bg-indigo-500/20 text-indigo-400'
                            : 'text-slate-500 hover:text-white')}>
                        {s === 'morning' ? <Sun size={11} className="inline mr-1" /> : s === 'afternoon' ? <Activity size={11} className="inline mr-1" /> : <Moon size={11} className="inline mr-1" />}
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="relative flex-1">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" value={dietSearch}
                      onChange={e => { setDietSearch(e.target.value); setShowDietSuggestions(true); }}
                      onFocus={() => setShowDietSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowDietSuggestions(false), 150)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && dietSearch.trim()) {
                          const qm = dietSearch.match(/^(\d+\.?\d*)\s+(.+)/);
                          const qty = qm ? parseFloat(qm[1]) : 1;
                          const term = (qm ? qm[2] : dietSearch).trim();
                          const match = Object.keys(allDB).find(n => n.toLowerCase() === term.toLowerCase())
                            || Object.keys(allDB).find(n => n.toLowerCase().includes(term.toLowerCase()));
                          if (match) {
                            setDietItems(prev => [...prev, { name: match, qty, session: dietSession }]);
                            setDietSearch('');
                            setShowDietSuggestions(false);
                          }
                        }
                      }}
                      placeholder="Type ingredient & press Enter..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50" />
                    {showDietSuggestions && dietSearch.length >= 1 && (() => {
                      const qm = dietSearch.match(/^(\d+\.?\d*)\s+(.+)/);
                      const qty = qm ? parseFloat(qm[1]) : 1;
                      const term = (qm ? qm[2] : dietSearch).trim().toLowerCase();
                      const matches = Object.entries(allDB).filter(([n]) => n.toLowerCase().includes(term)).slice(0, 6);
                      const dishMatches = savedDishes.filter(d => d.name.toLowerCase().includes(term)).slice(0, 4);
                      if (matches.length === 0 && dishMatches.length === 0) return null;
                      return (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                          {/* Dish matches first */}
                          {dishMatches.length > 0 && (
                            <>
                              <div className="px-3 py-1 bg-purple-500/10 text-[8px] font-bold text-purple-400 uppercase tracking-wider">Dishes</div>
                              {dishMatches.map(dish => {
                                let dCal = 0, dProt = 0, dCarb = 0, dFat = 0;
                                dish.items.forEach(item => {
                                  const info = allDB[item.name];
                                  if (info) { dCal += Math.round(info.cal * item.qty); dProt += +(info.protein * item.qty).toFixed(1); dCarb += +(info.carbs * item.qty).toFixed(1); dFat += +(info.fats * item.qty).toFixed(1); }
                                });
                                return (
                                  <button key={`dish-${dish.name}`} type="button"
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => {
                                      dish.items.forEach(item => {
                                        setDietItems(prev => [...prev, { name: item.name, qty: item.qty * qty, session: dietSession }]);
                                      });
                                      setDietSearch('');
                                      setShowDietSuggestions(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-purple-500/10 transition-colors flex items-center justify-between gap-2 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Sparkles size={10} className="text-purple-400 shrink-0" />
                                      <span className="text-purple-300 font-semibold truncate">{qty > 1 ? `${qty} × ` : ''}{dish.name}</span>
                                      <span className="text-[7px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 shrink-0">{dish.items.length} items</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 text-[8px]">
                                      <span className="text-white">{Math.round(dCal * qty)}cal</span>
                                      <span className="text-gym-accent">{+(dProt * qty).toFixed(1)}p</span>
                                      <span className="text-gym-amber">{+(dCarb * qty).toFixed(1)}c</span>
                                      <span className="text-gym-rose">{+(dFat * qty).toFixed(1)}f</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </>
                          )}
                          {/* Ingredient matches */}
                          {matches.length > 0 && dishMatches.length > 0 && (
                            <div className="px-3 py-1 bg-white/[0.03] text-[8px] font-bold text-slate-500 uppercase tracking-wider">Ingredients</div>
                          )}
                          {matches.map(([n, info]) => (
                            <button key={n} type="button"
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => {
                                setDietItems(prev => [...prev, { name: n, qty, session: dietSession }]);
                                setDietSearch('');
                                setShowDietSuggestions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors flex items-center justify-between gap-2 border-b border-white/5 last:border-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-white font-semibold truncate">{qty > 1 ? `${qty} × ` : ''}{n}</span>
                                <span className="text-[7px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">{info.category}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 text-[8px]">
                                <span className="text-white">{Math.round(info.cal * qty)}cal</span>
                                <span className="text-gym-accent">{+(info.protein * qty).toFixed(1)}p</span>
                                <span className="text-gym-amber">{+(info.carbs * qty).toFixed(1)}c</span>
                                <span className="text-gym-rose">{+(info.fats * qty).toFixed(1)}f</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Diet Items by Session */}
                {dietItems.length > 0 ? (() => {
                  const sessions = ['morning', 'afternoon', 'evening'] as const;
                  const sessionLabels = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };
                  const sessionColors = { morning: 'text-amber-400', afternoon: 'text-sky-400', evening: 'text-indigo-400' };
                  const sessionBg = { morning: 'bg-amber-500/10', afternoon: 'bg-sky-500/10', evening: 'bg-indigo-500/10' };
                  const sessionIcons = { morning: <Sun size={11} />, afternoon: <Activity size={11} />, evening: <Moon size={11} /> };

                  // Compute grand totals
                  let grandCal = 0, grandProtein = 0, grandCarbs = 0, grandFats = 0;
                  dietItems.forEach(item => {
                    const info = allDB[item.name];
                    if (info) {
                      grandCal += Math.round(info.cal * item.qty);
                      grandProtein += +(info.protein * item.qty).toFixed(1);
                      grandCarbs += +(info.carbs * item.qty).toFixed(1);
                      grandFats += +(info.fats * item.qty).toFixed(1);
                    }
                  });

                  return (
                    <>
                      {sessions.map(s => {
                        const sessionItems = dietItems.filter(d => d.session === s);
                        if (sessionItems.length === 0) return null;
                        let sCal = 0, sProt = 0, sCarb = 0, sFat = 0;
                        sessionItems.forEach(item => {
                          const info = allDB[item.name];
                          if (info) { sCal += Math.round(info.cal * item.qty); sProt += +(info.protein * item.qty).toFixed(1); sCarb += +(info.carbs * item.qty).toFixed(1); sFat += +(info.fats * item.qty).toFixed(1); }
                        });
                        return (
                          <div key={s} className="mb-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={cn("flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider", sessionColors[s])}>
                                {sessionIcons[s]} {sessionLabels[s]}
                              </span>
                              <span className="text-[8px] text-slate-600">{sessionItems.length} item{sessionItems.length > 1 ? 's' : ''}</span>
                              <span className="text-[8px] text-slate-500 ml-auto">{sCal}cal · {sProt}p · {sCarb}c · {sFat}f</span>
                            </div>
                            <div className="rounded-lg border border-white/5 overflow-hidden">
                              {sessionItems.map((item, localIdx) => {
                                const globalIdx = dietItems.indexOf(item);
                                const info = allDB[item.name];
                                return (
                                  <div key={`${item.name}-${globalIdx}`} className={cn("flex items-center gap-2 px-3 py-1.5 group hover:bg-white/5 transition-all",
                                    localIdx % 2 === 0 ? 'bg-white/[0.02]' : '')}>
                                    <span className="text-[10px] font-semibold text-white truncate flex-1 min-w-0">{item.name}</span>
                                    {info && (
                                      <div className="flex items-center gap-1.5 text-[8px] shrink-0">
                                        <span className="text-white">{Math.round(info.cal * item.qty)}</span>
                                        <span className="text-gym-accent">{+(info.protein * item.qty).toFixed(1)}p</span>
                                        <span className="text-gym-amber">{+(info.carbs * item.qty).toFixed(1)}c</span>
                                        <span className="text-gym-rose">{+(info.fats * item.qty).toFixed(1)}f</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      <button onClick={() => setDietItems(p => p.map((x, i) => i === globalIdx ? { ...x, qty: Math.max(0.5, x.qty - 0.5) } : x))}
                                        className="w-4 h-4 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-[10px] font-bold transition-all">-</button>
                                      <input type="number" value={item.qty} min={0.5} step={0.5}
                                        onChange={e => { const v = parseFloat(e.target.value) || 0.5; setDietItems(p => p.map((x, i) => i === globalIdx ? { ...x, qty: v } : x)); }}
                                        className="w-10 text-center bg-white/5 border border-white/10 rounded px-0.5 py-0.5 text-[9px] text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/50" />
                                      <button onClick={() => setDietItems(p => p.map((x, i) => i === globalIdx ? { ...x, qty: x.qty + 0.5 } : x))}
                                        className="w-4 h-4 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-[10px] font-bold transition-all">+</button>
                                    </div>
                                    <button onClick={() => setDietItems(p => p.filter((_, i) => i !== globalIdx))}
                                      className="p-0.5 text-slate-600 hover:text-gym-rose opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                      <X size={10} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Grand Totals */}
                      <div className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 flex items-center gap-4 mb-3">
                        <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider">Total</span>
                        <span className="text-[9px] text-slate-400">{dietItems.length} items</span>
                        <span className="ml-auto flex items-center gap-3 text-[10px] font-bold">
                          <span className="text-white">{grandCal} cal</span>
                          <span className="text-gym-accent">{+grandProtein.toFixed(1)}g P</span>
                          <span className="text-gym-amber">{+grandCarbs.toFixed(1)}g C</span>
                          <span className="text-gym-rose">{+grandFats.toFixed(1)}g F</span>
                        </span>
                      </div>

                      {/* Macro bar */}
                      {grandProtein + grandCarbs + grandFats > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-white/5">
                            <div className="h-full bg-gym-accent rounded-full transition-all" style={{ width: `${(grandProtein / (grandProtein + grandCarbs + grandFats)) * 100}%` }} />
                            <div className="h-full bg-gym-amber rounded-full transition-all" style={{ width: `${(grandCarbs / (grandProtein + grandCarbs + grandFats)) * 100}%` }} />
                            <div className="h-full bg-gym-rose rounded-full transition-all" style={{ width: `${(grandFats / (grandProtein + grandCarbs + grandFats)) * 100}%` }} />
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-[8px] text-slate-400">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gym-accent" />Protein {Math.round((grandProtein / (grandProtein + grandCarbs + grandFats)) * 100)}%</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gym-amber" />Carbs {Math.round((grandCarbs / (grandProtein + grandCarbs + grandFats)) * 100)}%</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gym-rose" />Fat {Math.round((grandFats / (grandProtein + grandCarbs + grandFats)) * 100)}%</span>
                          </div>
                        </div>
                      )}

                      {/* Save Diet */}
                      <button
                        onClick={() => {
                          if (!dietName.trim() || dietItems.length === 0) return;
                          if (editingDietIdx !== null) {
                            setSavedDiets(p => p.map((d, i) => i === editingDietIdx ? { name: dietName.trim(), items: [...dietItems] } : d));
                            setEditingDietIdx(null);
                          } else {
                            setSavedDiets(p => [...p, { name: dietName.trim(), items: [...dietItems] }]);
                          }
                          setDietName('');
                          setDietItems([]);
                        }}
                        disabled={!dietName.trim() || dietItems.length === 0}
                        className="w-full py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-emerald-500/80 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20">
                        <Save size={12} /> {editingDietIdx !== null ? 'Update Diet' : 'Save Diet'}
                      </button>
                    </>
                  );
                })() : (
                  <div className="text-center py-4">
                    <Apple size={24} className="mx-auto text-slate-700 mb-2" />
                    <p className="text-[10px] text-slate-600">Select a meal session, then add ingredients to build your diet</p>
                  </div>
                )}

                {/* Saved Diets List */}
                {savedDiets.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Saved Diets ({savedDiets.length})</span>
                    <div className="space-y-1.5">
                      {savedDiets.map((diet, idx) => {
                        let dCal = 0, dProt = 0, dCarb = 0, dFat = 0;
                        diet.items.forEach(item => {
                          const info = allDB[item.name];
                          if (info) { dCal += Math.round(info.cal * item.qty); dProt += +(info.protein * item.qty).toFixed(1); dCarb += +(info.carbs * item.qty).toFixed(1); dFat += +(info.fats * item.qty).toFixed(1); }
                        });
                        return (
                          <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all group">
                            <Leaf size={12} className="text-emerald-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-white block truncate">{diet.name}</span>
                              <div className="flex items-center gap-2 text-[8px] mt-0.5">
                                <span className="text-slate-400">{diet.items.length} items</span>
                                <span className="text-white">{dCal}cal</span>
                                <span className="text-gym-accent">{+dProt.toFixed(1)}p</span>
                                <span className="text-gym-amber">{+dCarb.toFixed(1)}c</span>
                                <span className="text-gym-rose">{+dFat.toFixed(1)}f</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                              <button onClick={() => { setDietName(diet.name); setDietItems([...diet.items]); setEditingDietIdx(idx); }}
                                className="p-1 rounded text-slate-500 hover:text-emerald-400 hover:bg-white/10 transition-all" title="Edit">
                                <Edit3 size={11} />
                              </button>
                              <button onClick={() => { setDietName(diet.name + ' (Copy)'); setDietItems([...diet.items]); setEditingDietIdx(null); }}
                                className="p-1 rounded text-slate-500 hover:text-gym-secondary hover:bg-white/10 transition-all" title="Duplicate">
                                <Copy size={11} />
                              </button>
                              <button onClick={() => setSavedDiets(p => p.filter((_, i) => i !== idx))}
                                className="p-1 rounded text-slate-500 hover:text-gym-rose hover:bg-white/10 transition-all" title="Delete">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area - Side by Side */}
        <div className={cn("flex-1 flex overflow-hidden", showAddForm ? 'flex-row' : 'flex-col')}>

        {/* Add / Edit Form - Left Panel */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: '50%', opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="overflow-y-auto overflow-x-hidden border-r border-white/10 shrink-0 h-full w-1/2">
              <div className="px-5 py-4">
                <h4 className="text-sm font-bold text-white mb-3">{editingItem ? `Edit: ${editingItem}` : 'Add New Ingredient'}</h4>
                <div className="flex flex-col gap-2 mb-3">
                  {/* Ingredient dropdown */}
                  <div className="relative">
                    <label className="text-[8px] text-slate-500 uppercase font-bold block mb-1">Ingredient Name</label>
                    <input type="text" value={newIng.name}
                      onChange={e => {
                        const val = e.target.value;
                        setShowNameSuggestions(true);
                        // Smart parse: "5 eggs" → qty=5, search="eggs"; "chicken" → qty from unit field
                        const qm = val.match(/^(\d+\.?\d*)\s+(.+)/);
                        const typedQty = qm ? parseFloat(qm[1]) : null;
                        const searchTerm = (qm ? qm[2] : val).trim().toLowerCase();
                        if (searchTerm.length >= 2) {
                          const exact = Object.entries(allDB).find(([n]) => n.toLowerCase() === searchTerm);
                          const partial = !exact ? Object.entries(allDB).find(([n]) => n.toLowerCase().includes(searchTerm) || searchTerm.includes(n.toLowerCase())) : null;
                          const match = exact || partial;
                          if (match) {
                            const [, info] = match;
                            const q = typedQty ?? (parseFloat(newIng.unit) || 1);
                            const extras: Record<string, number> = {};
                            customNutrientTypes.forEach(nt => { extras[nt.id] = Math.round((info.extras?.[nt.id] ?? 0) * q); });
                            setNewIng({
                              name: val, unit: typedQty ? String(typedQty) : newIng.unit,
                              cal: Math.round(info.cal * q), protein: +(info.protein * q).toFixed(1),
                              carbs: +(info.carbs * q).toFixed(1), fats: +(info.fats * q).toFixed(1),
                              sodium: Math.round(info.sodium * q), potassium: Math.round(info.potassium * q),
                              fiber: +(info.fiber * q).toFixed(1), sugar: +(info.sugar * q).toFixed(1),
                              calcium: Math.round(info.calcium * q), iron: +(info.iron * q).toFixed(1),
                              category: info.category, ...extras
                            });
                            return;
                          }
                        }
                        setNewIng(p => ({ ...p, name: val }));
                      }}
                      onFocus={() => setShowNameSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowNameSuggestions(false), 150)}
                      disabled={!!editingItem}
                      placeholder="e.g. 5 Eggs, 250 Chicken Breast, Rice..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50 disabled:opacity-50" />
                    {showNameSuggestions && !editingItem && newIng.name.length >= 1 && (() => {
                      const term = newIng.name.trim().toLowerCase();
                      const matches = Object.entries(allDB).filter(([n]) => n.toLowerCase().includes(term)).slice(0, 8);
                      if (matches.length === 0) return null;
                      return (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                          {matches.map(([n, info]) => (
                            <button key={n} type="button"
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => {
                                const q = parseFloat(newIng.unit) || 1;
                                const extras: Record<string, number> = {};
                                customNutrientTypes.forEach(nt => { extras[nt.id] = Math.round((info.extras?.[nt.id] ?? 0) * q); });
                                setNewIng({
                                  name: n, unit: String(q), category: info.category,
                                  cal: Math.round(info.cal * q), protein: +(info.protein * q).toFixed(1),
                                  carbs: +(info.carbs * q).toFixed(1), fats: +(info.fats * q).toFixed(1),
                                  sodium: Math.round(info.sodium * q), potassium: Math.round(info.potassium * q),
                                  fiber: +(info.fiber * q).toFixed(1), sugar: +(info.sugar * q).toFixed(1),
                                  calcium: Math.round(info.calcium * q), iron: +(info.iron * q).toFixed(1),
                                  ...extras
                                });
                                setShowNameSuggestions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors flex items-center justify-between gap-2 border-b border-white/5 last:border-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-white font-semibold truncate">{n}</span>
                                <span className="text-[7px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">{info.category}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 text-[8px]">
                                <span className="text-white">{info.cal}cal</span>
                                <span className="text-gym-accent">{info.protein}p</span>
                                <span className="text-gym-amber">{info.carbs}c</span>
                                <span className="text-gym-rose">{info.fats}f</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  {/* Quantity */}
                  <div>
                    <label className="text-[8px] text-slate-500 uppercase font-bold block mb-1">Quantity</label>
                    <div className="flex items-center gap-1">
                      <button onClick={() => {
                        const cur = parseFloat(newIng.unit) || 1;
                        const nq = Math.max(0.5, cur - 0.5);
                        setNewIng(p => {
                          const info = allDB[p.name];
                          if (!info) return { ...p, unit: String(nq) };
                          const extras: Record<string, number> = {};
                          customNutrientTypes.forEach(nt => { extras[nt.id] = Math.round((info.extras?.[nt.id] ?? 0) * nq); });
                          return { ...p, unit: String(nq), cal: Math.round(info.cal * nq), protein: +(info.protein * nq).toFixed(1), carbs: +(info.carbs * nq).toFixed(1), fats: +(info.fats * nq).toFixed(1), sodium: Math.round(info.sodium * nq), potassium: Math.round(info.potassium * nq), fiber: +(info.fiber * nq).toFixed(1), sugar: +(info.sugar * nq).toFixed(1), calcium: Math.round(info.calcium * nq), iron: +(info.iron * nq).toFixed(1), ...extras };
                        });
                      }} className="w-6 h-7 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-all shrink-0">-</button>
                      <input type="number" value={newIng.unit} min={0.5} step={0.5}
                        onChange={e => {
                          const nq = parseFloat(e.target.value) || 1;
                          setNewIng(p => {
                            const info = allDB[p.name];
                            if (!info) return { ...p, unit: e.target.value };
                            const extras: Record<string, number> = {};
                            customNutrientTypes.forEach(nt => { extras[nt.id] = Math.round((info.extras?.[nt.id] ?? 0) * nq); });
                            return { ...p, unit: e.target.value, cal: Math.round(info.cal * nq), protein: +(info.protein * nq).toFixed(1), carbs: +(info.carbs * nq).toFixed(1), fats: +(info.fats * nq).toFixed(1), sodium: Math.round(info.sodium * nq), potassium: Math.round(info.potassium * nq), fiber: +(info.fiber * nq).toFixed(1), sugar: +(info.sugar * nq).toFixed(1), calcium: Math.round(info.calcium * nq), iron: +(info.iron * nq).toFixed(1), ...extras };
                          });
                        }}
                        className="flex-1 min-w-0 text-center bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gym-amber font-bold focus:outline-none focus:border-gym-amber/50" />
                      <button onClick={() => {
                        const cur = parseFloat(newIng.unit) || 1;
                        const nq = cur + 0.5;
                        setNewIng(p => {
                          const info = allDB[p.name];
                          if (!info) return { ...p, unit: String(nq) };
                          const extras: Record<string, number> = {};
                          customNutrientTypes.forEach(nt => { extras[nt.id] = Math.round((info.extras?.[nt.id] ?? 0) * nq); });
                          return { ...p, unit: String(nq), cal: Math.round(info.cal * nq), protein: +(info.protein * nq).toFixed(1), carbs: +(info.carbs * nq).toFixed(1), fats: +(info.fats * nq).toFixed(1), sodium: Math.round(info.sodium * nq), potassium: Math.round(info.potassium * nq), fiber: +(info.fiber * nq).toFixed(1), sugar: +(info.sugar * nq).toFixed(1), calcium: Math.round(info.calcium * nq), iron: +(info.iron * nq).toFixed(1), ...extras };
                        });
                      }} className="w-6 h-7 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-all shrink-0">+</button>
                    </div>
                    {allDB[newIng.name] && <span className="text-[7px] text-slate-500 mt-0.5 block text-center">per {allDB[newIng.name].unit}</span>}
                  </div>
                  {/* Per-unit info */}
                  <div>
                    <label className="text-[8px] text-slate-500 uppercase font-bold block mb-1">Per Unit</label>
                    <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-400">
                      {allDB[newIng.name] ? allDB[newIng.name].unit : 'Custom'}
                    </div>
                  </div>
                  {/* Category dropdown */}
                  <div>
                    <label className="text-[8px] text-slate-500 uppercase font-bold block mb-1">Category</label>
                    <select value={newIng.category} onChange={e => setNewIng(p => ({ ...p, category: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gym-accent/50">
                      {['Proteins', 'Grains & Carbs', 'Fruits', 'Vegetables', 'Nuts & Seeds', 'Dairy & Drinks', 'Spices & Extras'].map(c => (
                        <option key={c} value={c} className="bg-[#1e293b]">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-2">
                  {[
                    { key: 'cal', label: 'Calories (kcal)', color: 'text-white', max: 1000 },
                    { key: 'protein', label: 'Protein (g)', color: 'text-gym-accent', max: 100 },
                    { key: 'carbs', label: 'Carbs (g)', color: 'text-gym-amber', max: 200 },
                    { key: 'fats', label: 'Fat (g)', color: 'text-gym-rose', max: 100 },
                    { key: 'fiber', label: 'Fiber (g)', color: 'text-emerald-400', max: 50 },
                  ].map(f => (
                    <div key={f.key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className={cn("text-[8px] uppercase font-bold", f.color)}>{f.label}</label>
                        <span className={cn("text-[10px] font-bold", f.color)}>{(newIng as any)[f.key]}</span>
                      </div>
                      <input type="range" min={0} max={f.max} step={f.key === 'cal' ? 5 : 0.5}
                        value={(newIng as any)[f.key]}
                        onChange={e => setNewIng(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-gym-accent" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
                  {[
                    { key: 'sugar', label: 'Sugar (g)', color: 'text-orange-400', max: 100 },
                    { key: 'sodium', label: 'Sodium (mg)', color: 'text-sky-400', max: 1000 },
                    { key: 'potassium', label: 'Potassium (mg)', color: 'text-violet-400', max: 1000 },
                    { key: 'calcium', label: 'Calcium (mg)', color: 'text-cyan-300', max: 1000 },
                    { key: 'iron', label: 'Iron (mg)', color: 'text-red-400', max: 50 },
                  ].map(f => (
                    <div key={f.key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className={cn("text-[8px] uppercase font-bold", f.color)}>{f.label}</label>
                        <span className={cn("text-[10px] font-bold", f.color)}>{(newIng as any)[f.key]}</span>
                      </div>
                      <input type="range" min={0} max={f.max} step={f.key === 'sodium' || f.key === 'potassium' || f.key === 'calcium' ? 5 : 0.5}
                        value={(newIng as any)[f.key]}
                        onChange={e => setNewIng(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-gym-accent" />
                    </div>
                  ))}
                </div>
                {/* Dynamic nutrient fields */}
                {/* Custom Nutrient Types with manage controls */}
                <div className="mb-3">
                  {customNutrientTypes.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-2">
                      {customNutrientTypes.map(nt => (
                        <div key={nt.id} className="group/nt relative">
                          <div className="flex items-center justify-between mb-1">
                            <label className={cn("text-[8px] uppercase font-bold", nt.color)}>{nt.name} ({nt.unit})</label>
                            <div className="flex items-center gap-1">
                              <span className={cn("text-[10px] font-bold", nt.color)}>{newIng[nt.id] ?? 0}</span>
                              <button onClick={() => onDeleteNutrientType(nt.id)}
                                className="opacity-0 group-hover/nt:opacity-100 p-0.5 rounded text-slate-600 hover:text-gym-rose transition-all" title={`Remove ${nt.name}`}>
                                <X size={9} />
                              </button>
                            </div>
                          </div>
                          <input type="range" min={0} max={1000} step={5}
                            value={newIng[nt.id] ?? 0}
                            onChange={e => setNewIng(p => ({ ...p, [nt.id]: parseFloat(e.target.value) }))}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-gym-secondary" />
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => { setShowNutrientPopup(true); setPopupNutrient({ name: '', unit: 'mg', color: NUTRIENT_COLORS[(customNutrientTypes.length) % NUTRIENT_COLORS.length], maxValue: 1000, step: 5 }); setEditingNutrient(null); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-dashed border-white/10 text-[9px] font-semibold text-slate-400 hover:text-gym-secondary hover:border-gym-secondary/30 hover:bg-gym-secondary/5 transition-all">
                    <Plus size={10} /> Add New Nutrient Type
                  </button>
                </div>
                {/* Live Nutrient Preview - only shows non-zero nutrients */}
                {(() => {
                  const preview = [
                    { key: 'cal', label: 'Calories', val: newIng.cal, unit: 'kcal', color: 'text-white', bg: 'bg-white/10', border: 'border-white/10' },
                    { key: 'protein', label: 'Protein', val: newIng.protein, unit: 'g', color: 'text-gym-accent', bg: 'bg-gym-accent/10', border: 'border-gym-accent/20' },
                    { key: 'carbs', label: 'Carbs', val: newIng.carbs, unit: 'g', color: 'text-gym-amber', bg: 'bg-gym-amber/10', border: 'border-gym-amber/20' },
                    { key: 'fats', label: 'Fat', val: newIng.fats, unit: 'g', color: 'text-gym-rose', bg: 'bg-gym-rose/10', border: 'border-gym-rose/20' },
                    { key: 'fiber', label: 'Fiber', val: newIng.fiber, unit: 'g', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
                    { key: 'sugar', label: 'Sugar', val: newIng.sugar, unit: 'g', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
                    { key: 'sodium', label: 'Sodium', val: newIng.sodium, unit: 'mg', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
                    { key: 'potassium', label: 'Potassium', val: newIng.potassium, unit: 'mg', color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
                    { key: 'calcium', label: 'Calcium', val: newIng.calcium, unit: 'mg', color: 'text-cyan-300', bg: 'bg-cyan-300/10', border: 'border-cyan-300/20' },
                    { key: 'iron', label: 'Iron', val: newIng.iron, unit: 'mg', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
                    ...customNutrientTypes.map(nt => ({ key: nt.id, label: nt.name, val: newIng[nt.id] ?? 0, unit: nt.unit, color: nt.color, bg: 'bg-white/[0.04]', border: 'border-white/10' })),
                  ].filter(n => n.val > 0);
                  if (preview.length === 0) return null;
                  return (
                    <div className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame size={11} className="text-gym-amber" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {newIng.name ? `Nutrients in ${newIng.name}` : 'Nutrient Preview'}
                        </span>
                        <span className="text-[8px] text-slate-600">({preview.length} nutrient{preview.length > 1 ? 's' : ''} found)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {preview.map(n => (
                          <div key={n.key} className={cn("px-2.5 py-1.5 rounded-lg border", n.bg, n.border)}>
                            <span className={cn("text-[7px] font-bold uppercase block tracking-wider opacity-70", n.color)}>{n.label}</span>
                            <span className={cn("text-xs font-extrabold", n.color)}>
                              {typeof n.val === 'number' && n.val % 1 !== 0 ? n.val.toFixed(1) : n.val}
                              <span className="text-[7px] font-normal ml-0.5 opacity-50">{n.unit}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <div className="flex gap-2">
                  <button onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/10 transition-all">Cancel</button>
                  <button
                    onClick={() => {
                      const extras: Record<string, number> = {};
                      customNutrientTypes.forEach(nt => { extras[nt.id] = parseFloat(newIng[nt.id]) || 0; });
                      const dbInfo = allDB[newIng.name];
                      const q = parseFloat(newIng.unit) || 1;
                      const savedUnit = dbInfo ? (q > 1 ? `${q} × ${dbInfo.unit}` : dbInfo.unit) : `${q} serving`;
                      const info: NutritionInfo = { unit: savedUnit, cal: newIng.cal, protein: newIng.protein, carbs: newIng.carbs, fats: newIng.fats, sodium: newIng.sodium, potassium: newIng.potassium, fiber: newIng.fiber, sugar: newIng.sugar, calcium: newIng.calcium, iron: newIng.iron, category: newIng.category, extras: Object.keys(extras).length > 0 ? extras : undefined };
                      if (editingItem) {
                        onUpdateCustom(editingItem, info);
                      } else if (newIng.name.trim()) {
                        onAddCustom(newIng.name.trim(), info);
                      }
                      setShowAddForm(false);
                      setEditingItem(null);
                    }}
                    disabled={!editingItem && !newIng.name.trim()}
                    className="flex-1 py-2 bg-gym-accent text-white rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-gym-accent/80 transition-all flex items-center justify-center gap-1.5">
                    <Save size={12} /> {editingItem ? 'Update' : 'Save Ingredient'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="flex-1 overflow-auto px-5 pt-3 pb-5">
          {/* Table header */}
          <div className="flex items-center gap-1 py-2 px-3 mb-1 sticky top-0 bg-[#0f1729] z-10 border-b border-white/10 min-w-[900px]" style={{ minWidth: 900 + customNutrientTypes.length * 48 }}>
            <SortHeader field="name" label="Ingredient" w="w-[140px] shrink-0" />
            <span className="text-[8px] font-bold text-slate-500 uppercase w-12 text-center shrink-0">Unit</span>
            <SortHeader field="cal" label="Cal" w="w-11 justify-center shrink-0" />
            <SortHeader field="protein" label="Prot" w="w-11 justify-center shrink-0" />
            <SortHeader field="carbs" label="Carb" w="w-11 justify-center shrink-0" />
            <SortHeader field="fats" label="Fat" w="w-11 justify-center shrink-0" />
            <SortHeader field="sodium" label="Na" w="w-11 justify-center shrink-0" />
            <SortHeader field="potassium" label="K" w="w-11 justify-center shrink-0" />
            <SortHeader field="fiber" label="Fiber" w="w-11 justify-center shrink-0" />
            <SortHeader field="sugar" label="Sugar" w="w-11 justify-center shrink-0" />
            <SortHeader field="calcium" label="Ca" w="w-11 justify-center shrink-0" />
            <SortHeader field="iron" label="Fe" w="w-11 justify-center shrink-0" />
            {customNutrientTypes.map(nt => (
              <React.Fragment key={nt.id}><SortHeader field={nt.id} label={nt.name.length > 6 ? nt.name.slice(0, 5) + '.' : nt.name} w="w-12 justify-center shrink-0" /></React.Fragment>
            ))}
            <span className="w-14 shrink-0" />
          </div>
          {/* Table rows */}
          <div className="min-w-[900px]" style={{ minWidth: 900 + customNutrientTypes.length * 48 }}>
          {entries.map((item, i) => (
            <motion.div key={item.name}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={cn("flex items-center gap-1 py-2 px-3 rounded-lg transition-all group",
                i % 2 === 0 ? 'bg-white/[0.02]' : '', 'hover:bg-white/5')}>
              <div className="w-[140px] shrink-0 flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-semibold text-white truncate">{item.name}</span>
                {item.isCustom && (
                  <span className="text-[6px] font-bold px-1 py-0.5 rounded bg-gym-secondary/10 border border-gym-secondary/20 text-gym-secondary uppercase shrink-0">C</span>
                )}
              </div>
              <span className="text-[9px] text-slate-500 w-12 text-center shrink-0">{item.unit}</span>
              <span className="text-[9px] font-bold text-white w-11 text-center shrink-0">{item.cal}</span>
              <span className="text-[9px] font-bold text-gym-accent w-11 text-center shrink-0">{item.protein}g</span>
              <span className="text-[9px] font-bold text-gym-amber w-11 text-center shrink-0">{item.carbs}g</span>
              <span className="text-[9px] font-bold text-gym-rose w-11 text-center shrink-0">{item.fats}g</span>
              <span className="text-[9px] text-sky-400 w-11 text-center shrink-0">{item.sodium}</span>
              <span className="text-[9px] text-violet-400 w-11 text-center shrink-0">{item.potassium}</span>
              <span className="text-[9px] text-emerald-400 w-11 text-center shrink-0">{item.fiber}g</span>
              <span className="text-[9px] text-orange-400 w-11 text-center shrink-0">{item.sugar}g</span>
              <span className="text-[9px] text-cyan-300 w-11 text-center shrink-0">{item.calcium}</span>
              <span className="text-[9px] text-red-400 w-11 text-center shrink-0">{item.iron}</span>
              {customNutrientTypes.map(nt => (
                <span key={nt.id} className={cn("text-[9px] font-medium w-12 text-center shrink-0", nt.color)}>{item.extras?.[nt.id] ?? 0}</span>
              ))}
              <div className="w-14 shrink-0 flex justify-end relative">
                <button onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === item.name ? null : item.name); }}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                  <MoreVertical size={13} />
                </button>
                {openDropdown === item.name && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute right-0 top-7 z-40 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[140px] overflow-hidden">
                      <button onClick={() => {
                        const extrasObj: Record<string, number> = {};
                        customNutrientTypes.forEach(nt => { extrasObj[nt.id] = item.extras?.[nt.id] ?? 0; });
                        const qMatch = item.unit.match(/^(\d+\.?\d*)\s*×/);
                        if (item.isCustom) {
                          setEditingItem(item.name);
                          setNewIng({ name: item.name, unit: qMatch ? qMatch[1] : '1', cal: item.cal, protein: item.protein, carbs: item.carbs, fats: item.fats, sodium: item.sodium, potassium: item.potassium, fiber: item.fiber, sugar: item.sugar, calcium: item.calcium, iron: item.iron, category: item.category, ...extrasObj });
                        } else {
                          setEditingItem(null);
                          setNewIng({ name: item.name, unit: '1', cal: item.cal, protein: item.protein, carbs: item.carbs, fats: item.fats, sodium: item.sodium, potassium: item.potassium, fiber: item.fiber, sugar: item.sugar, calcium: item.calcium, iron: item.iron, category: item.category, ...extrasObj });
                        }
                        setShowAddForm(true);
                        setOpenDropdown(null);
                      }} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                        <Edit3 size={12} className="text-gym-accent" /> {item.isCustom ? 'Edit Ingredient' : 'Edit as Custom'}
                      </button>
                      <button onClick={() => {
                        setEditingItem(null);
                        const extrasObj: Record<string, number> = {};
                        customNutrientTypes.forEach(nt => { extrasObj[nt.id] = item.extras?.[nt.id] ?? 0; });
                        setNewIng({ name: '', unit: '1', cal: item.cal, protein: item.protein, carbs: item.carbs, fats: item.fats, sodium: item.sodium, potassium: item.potassium, fiber: item.fiber, sugar: item.sugar, calcium: item.calcium, iron: item.iron, category: item.category, ...extrasObj });
                        setShowAddForm(true);
                        setOpenDropdown(null);
                      }} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                        <Copy size={12} className="text-gym-secondary" /> Duplicate
                      </button>
                      {item.isCustom && (
                        <button onClick={() => { onDeleteCustom(item.name); setOpenDropdown(null); }}
                          className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-slate-300 hover:bg-gym-rose/10 hover:text-gym-rose transition-all border-t border-white/5">
                          <Trash2 size={12} className="text-gym-rose" /> Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
          </div>
          {entries.length === 0 && (
            <div className="text-center py-12">
              <Scale size={36} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">No ingredients found</p>
            </div>
          )}

          {/* Category summary */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Category Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(INGREDIENT_CATEGORIES).map(([cat, items]) => (
                <div key={cat} className="p-2.5 rounded-xl bg-white/3 border border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">{cat}</span>
                  <span className="text-lg font-bold text-white">{items.length + Object.values(customIngredients).filter(c => c.category === cat).length}</span>
                  <span className="text-[8px] text-slate-500 block">ingredients</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        </div>
        {/* End Main Content Area */}

        {/* Dish Builder Popup Modal */}
        <AnimatePresence>
          {showDishBuilder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDishBuilder(false)} />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-10 bg-[#0f1729] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Popup Header */}
                <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 px-6 py-4 flex items-center justify-between shrink-0">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Sparkles size={16} className="text-white/80" />
                      <span className="text-white/80 text-xs font-medium tracking-wide uppercase">Recipe Builder</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{editingDishIdx !== null ? 'Edit Recipe' : 'Create New Recipe'}</h3>
                  </div>
                  <button onClick={() => setShowDishBuilder(false)}
                    className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-all">
                    <X size={16} />
                  </button>
                </div>

                {/* Popup Body */}
                <div className="px-6 py-5 overflow-y-auto flex-1">
                  {/* Dish Name, Meal Type & Goal */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="col-span-2">
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">Recipe Name</label>
                      <input type="text" value={dishName} onChange={e => setDishName(e.target.value)}
                        placeholder="e.g. Protein Oatmeal, Grilled Chicken Salad..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">Meal Type</label>
                      <select value={dishCategory} onChange={e => setDishCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50">
                        {MEAL_CATEGORIES.map(c => (
                          <option key={c} value={c} className="bg-[#1e293b]">{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">Goal Type</label>
                      <select value={dishGoal} onChange={e => setDishGoal(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50">
                        {GOAL_TYPES.map(g => (
                          <option key={g} value={g} className="bg-[#1e293b]">{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Add Ingredients Search */}
                  <div className="mb-4">
                    <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">Add Ingredients</label>
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" value={dishSearch}
                        onChange={e => { setDishSearch(e.target.value); setShowDishSuggestions(true); }}
                        onFocus={() => setShowDishSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowDishSuggestions(false), 150)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && dishSearch.trim()) {
                            const qm = dishSearch.match(/^(\d+\.?\d*)\s+(.+)/);
                            const qty = qm ? parseFloat(qm[1]) : 1;
                            const term = (qm ? qm[2] : dishSearch).trim();
                            const match = Object.keys(allDB).find(n => n.toLowerCase() === term.toLowerCase())
                              || Object.keys(allDB).find(n => n.toLowerCase().includes(term.toLowerCase()));
                            if (match) {
                              setDishItems(prev => {
                                const existing = prev.find(x => x.name === match);
                                if (existing) return prev.map(x => x.name === match ? { ...x, qty: x.qty + qty } : x);
                                return [...prev, { name: match, qty }];
                              });
                              setDishSearch('');
                              setShowDishSuggestions(false);
                            }
                          }
                        }}
                        placeholder="Type ingredient (e.g. 3 Eggs, Spinach, Olive Oil...)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50" />
                      {showDishSuggestions && dishSearch.length >= 1 && (() => {
                        const qm = dishSearch.match(/^(\d+\.?\d*)\s+(.+)/);
                        const qty = qm ? parseFloat(qm[1]) : 1;
                        const term = (qm ? qm[2] : dishSearch).trim().toLowerCase();
                        const matches = Object.entries(allDB).filter(([n]) => n.toLowerCase().includes(term)).slice(0, 8);
                        if (matches.length === 0) return null;
                        return (
                          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {matches.map(([n, info]) => (
                              <button key={n} type="button"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                  setDishItems(prev => {
                                    const existing = prev.find(x => x.name === n);
                                    if (existing) return prev.map(x => x.name === n ? { ...x, qty: x.qty + qty } : x);
                                    return [...prev, { name: n, qty }];
                                  });
                                  setDishSearch('');
                                  setShowDishSuggestions(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors flex items-center justify-between gap-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-white font-semibold truncate">{qty > 1 ? `${qty} × ` : ''}{n}</span>
                                  <span className="text-[7px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">{info.category}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 text-[8px]">
                                  <span className="text-white">{Math.round(info.cal * qty)}cal</span>
                                  <span className="text-gym-accent">{+(info.protein * qty).toFixed(1)}p</span>
                                  <span className="text-gym-amber">{+(info.carbs * qty).toFixed(1)}c</span>
                                  <span className="text-gym-rose">{+(info.fats * qty).toFixed(1)}f</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Dish Ingredients List */}
                  {dishItems.length > 0 ? (() => {
                    let tCal = 0, tProt = 0, tCarb = 0, tFat = 0, tFiber = 0, tSugar = 0, tSodium = 0, tPotassium = 0, tCalcium = 0, tIron = 0;
                    dishItems.forEach(item => {
                      const info = allDB[item.name];
                      if (info) {
                        tCal += Math.round(info.cal * item.qty); tProt += +(info.protein * item.qty).toFixed(1);
                        tCarb += +(info.carbs * item.qty).toFixed(1); tFat += +(info.fats * item.qty).toFixed(1);
                        tFiber += +(info.fiber * item.qty).toFixed(1); tSugar += +(info.sugar * item.qty).toFixed(1);
                        tSodium += Math.round(info.sodium * item.qty); tPotassium += Math.round(info.potassium * item.qty);
                        tCalcium += Math.round(info.calcium * item.qty); tIron += +(info.iron * item.qty).toFixed(1);
                      }
                    });
                    return (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{dishItems.length} Ingredient{dishItems.length > 1 ? 's' : ''}</span>
                          <button onClick={() => setDishItems([])} className="text-[9px] text-slate-500 hover:text-gym-rose transition-colors">Clear all</button>
                        </div>
                        <div className="rounded-xl border border-white/5 overflow-hidden mb-4">
                          {/* Table header */}
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-white/[0.04] border-b border-white/5 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                            <span className="flex-1">Ingredient</span>
                            <span className="w-[80px] text-center">Qty</span>
                            <span className="w-12 text-center text-white">Cal</span>
                            <span className="w-10 text-center text-gym-accent">Prot</span>
                            <span className="w-10 text-center text-gym-amber">Carb</span>
                            <span className="w-10 text-center text-gym-rose">Fat</span>
                            <span className="w-5" />
                          </div>
                          {dishItems.map((item, idx) => {
                            const info = allDB[item.name];
                            return (
                              <div key={item.name} className={cn("flex items-center gap-1 px-3 py-1.5 group hover:bg-white/5 transition-all",
                                idx % 2 === 0 ? 'bg-white/[0.02]' : '')}>
                                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                                  <span className="text-[10px] font-semibold text-white truncate">{item.name}</span>
                                  {info && <span className="text-[7px] px-1 py-0.5 rounded bg-white/5 text-slate-500 shrink-0">{info.unit}</span>}
                                </div>
                                <div className="w-[80px] flex items-center justify-center gap-0.5">
                                  <button onClick={() => setDishItems(p => p.map((x, i) => i === idx ? { ...x, qty: Math.max(0.5, x.qty - 0.5) } : x))}
                                    className="w-4 h-4 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-[10px] font-bold transition-all">-</button>
                                  <input type="number" value={item.qty} min={0.5} step={0.5}
                                    onChange={e => { const v = parseFloat(e.target.value) || 0.5; setDishItems(p => p.map((x, i) => i === idx ? { ...x, qty: v } : x)); }}
                                    className="w-10 text-center bg-white/5 border border-white/10 rounded px-0.5 py-0.5 text-[9px] text-purple-400 font-bold focus:outline-none focus:border-purple-500/50" />
                                  <button onClick={() => setDishItems(p => p.map((x, i) => i === idx ? { ...x, qty: x.qty + 0.5 } : x))}
                                    className="w-4 h-4 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-[10px] font-bold transition-all">+</button>
                                </div>
                                <span className="w-12 text-center text-[9px] font-bold text-white">{info ? Math.round(info.cal * item.qty) : '—'}</span>
                                <span className="w-10 text-center text-[9px] font-bold text-gym-accent">{info ? +(info.protein * item.qty).toFixed(1) : '—'}</span>
                                <span className="w-10 text-center text-[9px] font-bold text-gym-amber">{info ? +(info.carbs * item.qty).toFixed(1) : '—'}</span>
                                <span className="w-10 text-center text-[9px] font-bold text-gym-rose">{info ? +(info.fats * item.qty).toFixed(1) : '—'}</span>
                                <button onClick={() => setDishItems(p => p.filter((_, i) => i !== idx))}
                                  className="w-5 p-0.5 text-slate-600 hover:text-gym-rose opacity-0 group-hover:opacity-100 transition-all">
                                  <X size={10} />
                                </button>
                              </div>
                            );
                          })}
                          {/* Totals row */}
                          <div className="flex items-center gap-1 px-3 py-2 bg-white/[0.06] border-t border-white/10">
                            <span className="flex-1 text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Total per Dish</span>
                            <span className="w-[80px] text-center text-[9px] text-slate-400">{dishItems.length} items</span>
                            <span className="w-12 text-center text-[10px] font-extrabold text-white">{tCal}</span>
                            <span className="w-10 text-center text-[10px] font-extrabold text-gym-accent">{+tProt.toFixed(1)}</span>
                            <span className="w-10 text-center text-[10px] font-extrabold text-gym-amber">{+tCarb.toFixed(1)}</span>
                            <span className="w-10 text-center text-[10px] font-extrabold text-gym-rose">{+tFat.toFixed(1)}</span>
                            <span className="w-5" />
                          </div>
                        </div>

                        {/* Nutrition Summary Cards */}
                        <div className="mb-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Flame size={11} className="text-purple-400" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dish Nutrition Summary</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[
                              { label: 'Calories', val: tCal, unit: 'kcal', color: 'text-white', bg: 'bg-white/10' },
                              { label: 'Protein', val: +tProt.toFixed(1), unit: 'g', color: 'text-gym-accent', bg: 'bg-gym-accent/10' },
                              { label: 'Carbs', val: +tCarb.toFixed(1), unit: 'g', color: 'text-gym-amber', bg: 'bg-gym-amber/10' },
                              { label: 'Fat', val: +tFat.toFixed(1), unit: 'g', color: 'text-gym-rose', bg: 'bg-gym-rose/10' },
                              { label: 'Fiber', val: +tFiber.toFixed(1), unit: 'g', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                              { label: 'Sugar', val: +tSugar.toFixed(1), unit: 'g', color: 'text-orange-400', bg: 'bg-orange-400/10' },
                              { label: 'Sodium', val: tSodium, unit: 'mg', color: 'text-sky-400', bg: 'bg-sky-400/10' },
                              { label: 'K', val: tPotassium, unit: 'mg', color: 'text-violet-400', bg: 'bg-violet-400/10' },
                              { label: 'Calcium', val: tCalcium, unit: 'mg', color: 'text-cyan-300', bg: 'bg-cyan-300/10' },
                              { label: 'Iron', val: +tIron.toFixed(1), unit: 'mg', color: 'text-red-400', bg: 'bg-red-400/10' },
                            ].filter(n => n.val > 0).map(n => (
                              <div key={n.label} className={cn("rounded-lg px-2 py-1.5 border border-white/5", n.bg)}>
                                <div className={cn("text-[7px] font-bold uppercase tracking-wider mb-0.5", n.color)}>{n.label}</div>
                                <div className={cn("text-sm font-extrabold", n.color)}>{n.val}<span className="text-[7px] font-normal ml-0.5 opacity-60">{n.unit}</span></div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Macro bar */}
                        {tProt + tCarb + tFat > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-white/5">
                              <div className="h-full bg-gym-accent rounded-full transition-all" style={{ width: `${(tProt / (tProt + tCarb + tFat)) * 100}%` }} />
                              <div className="h-full bg-gym-amber rounded-full transition-all" style={{ width: `${(tCarb / (tProt + tCarb + tFat)) * 100}%` }} />
                              <div className="h-full bg-gym-rose rounded-full transition-all" style={{ width: `${(tFat / (tProt + tCarb + tFat)) * 100}%` }} />
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-[8px] text-slate-400">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gym-accent" />Protein {Math.round((tProt / (tProt + tCarb + tFat)) * 100)}%</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gym-amber" />Carbs {Math.round((tCarb / (tProt + tCarb + tFat)) * 100)}%</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gym-rose" />Fat {Math.round((tFat / (tProt + tCarb + tFat)) * 100)}%</span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })() : (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                        <Sparkles size={24} className="text-purple-400/40" />
                      </div>
                      <p className="text-slate-400 text-sm font-medium mb-1">No ingredients added yet</p>
                      <p className="text-slate-600 text-xs">Search and add ingredients above to build your dish recipe</p>
                    </div>
                  )}

                  {/* Saved Recipes List */}
                  {savedDishes.length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Saved Recipes ({savedDishes.length})</span>
                      </div>
                      {/* Filter Tabs */}
                      <div className="flex gap-1 mb-2 flex-wrap">
                        <button onClick={() => { setDishFilterCat('All'); setDishFilterGoal('All'); }}
                          className={cn("px-2 py-0.5 rounded text-[8px] font-bold border transition-all", dishFilterCat === 'All' && dishFilterGoal === 'All' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white')}>All</button>
                        {MEAL_CATEGORIES.map(c => (
                          <button key={c} onClick={() => { setDishFilterCat(c); setDishFilterGoal('All'); }}
                            className={cn("px-2 py-0.5 rounded text-[8px] font-bold border transition-all", dishFilterCat === c ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white')}>{c}</button>
                        ))}
                      </div>
                      <div className="flex gap-1 mb-3 flex-wrap">
                        {GOAL_TYPES.map(g => {
                          const goalColors: Record<string, string> = { 'Weight Loss': 'text-gym-rose', 'Muscle Gain': 'text-gym-accent', 'Maintenance': 'text-gym-amber' };
                          return (
                            <button key={g} onClick={() => { setDishFilterGoal(dishFilterGoal === g ? 'All' : g); }}
                              className={cn("px-2 py-0.5 rounded text-[8px] font-bold border transition-all", dishFilterGoal === g ? 'bg-white/10 border-white/20 ' + (goalColors[g] || 'text-white') : 'bg-white/5 border-white/5 text-slate-500 hover:text-white')}>{g}</button>
                          );
                        })}
                      </div>
                      <div className="space-y-1.5 max-h-52 overflow-y-auto">
                        {savedDishes.filter(d => (dishFilterCat === 'All' || d.category === dishFilterCat) && (dishFilterGoal === 'All' || d.goal === dishFilterGoal)).map((dish, _filteredIdx) => {
                          const idx = savedDishes.indexOf(dish);
                          let dCal = 0, dProt = 0, dCarb = 0, dFat = 0;
                          dish.items.forEach(item => {
                            const info = allDB[item.name];
                            if (info) { dCal += Math.round(info.cal * item.qty); dProt += +(info.protein * item.qty).toFixed(1); dCarb += +(info.carbs * item.qty).toFixed(1); dFat += +(info.fats * item.qty).toFixed(1); }
                          });
                          const goalColors: Record<string, string> = { 'Weight Loss': 'text-gym-rose bg-gym-rose/10', 'Muscle Gain': 'text-gym-accent bg-gym-accent/10', 'Maintenance': 'text-gym-amber bg-gym-amber/10' };
                          return (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all group">
                              <Sparkles size={12} className="text-purple-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white truncate">{dish.name}</span>
                                  <span className="text-[7px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 shrink-0">{dish.category}</span>
                                  <span className={cn("text-[7px] px-1.5 py-0.5 rounded shrink-0 font-bold", goalColors[dish.goal] || 'text-slate-400 bg-white/5')}>{dish.goal}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[8px] mt-0.5">
                                  <span className="text-slate-400">{dish.items.length} ingredients</span>
                                  <span className="text-white">{dCal}cal</span>
                                  <span className="text-gym-accent">{+dProt.toFixed(1)}p</span>
                                  <span className="text-gym-amber">{+dCarb.toFixed(1)}c</span>
                                  <span className="text-gym-rose">{+dFat.toFixed(1)}f</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                <button onClick={() => { setDishName(dish.name); setDishCategory(dish.category); setDishGoal(dish.goal); setDishItems([...dish.items]); setEditingDishIdx(idx); }}
                                  className="p-1 rounded text-slate-500 hover:text-purple-400 hover:bg-white/10 transition-all" title="Edit">
                                  <Edit3 size={11} />
                                </button>
                                <button onClick={() => { setDishName(dish.name + ' (Copy)'); setDishCategory(dish.category); setDishGoal(dish.goal); setDishItems([...dish.items]); setEditingDishIdx(null); }}
                                  className="p-1 rounded text-slate-500 hover:text-gym-secondary hover:bg-white/10 transition-all" title="Duplicate">
                                  <Copy size={11} />
                                </button>
                                <button onClick={() => setSavedDishes(p => p.filter((_, i) => i !== idx))}
                                  className="p-1 rounded text-slate-500 hover:text-gym-rose hover:bg-white/10 transition-all" title="Delete">
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Popup Footer */}
                <div className="px-6 py-4 border-t border-white/5 flex gap-3 shrink-0">
                  <button onClick={() => setShowDishBuilder(false)}
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/10 transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!dishName.trim() || dishItems.length === 0) return;
                      if (editingDishIdx !== null) {
                        setSavedDishes(p => p.map((d, i) => i === editingDishIdx ? { name: dishName.trim(), category: dishCategory, goal: dishGoal, items: [...dishItems] } : d));
                        setEditingDishIdx(null);
                      } else {
                        setSavedDishes(p => [...p, { name: dishName.trim(), category: dishCategory, goal: dishGoal, items: [...dishItems] }]);
                      }
                      setDishName('');
                      setDishItems([]);
                      setDishCategory('Breakfast');
                      setDishGoal('Maintenance');
                    }}
                    disabled={!dishName.trim() || dishItems.length === 0}
                    className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-purple-600/80 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20">
                    <Save size={13} /> {editingDishIdx !== null ? 'Update Recipe' : 'Save Recipe'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nutrient Types Popup Modal */}
        <AnimatePresence>
          {showNutrientPopup && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowNutrientPopup(false); setEditingNutrient(null); }} />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-10 bg-[#0f1729] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Popup Header */}
                <div className="bg-gradient-to-r from-gym-secondary via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <Zap size={16} className="text-white/80" />
                      <span className="text-white/80 text-xs font-medium tracking-wide uppercase">Nutrition Manager</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white">{editingNutrient ? 'Edit Nutrient Type' : 'Add New Nutrient Type'}</h3>
                  </div>
                  <button onClick={() => { setShowNutrientPopup(false); setEditingNutrient(null); }}
                    className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-all">
                    <X size={16} />
                  </button>
                </div>

                {/* Popup Body */}
                <div className="px-6 py-5">
                  <div className="space-y-4">
                    {/* Nutrient Name */}
                    <div>
                      <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">Nutrient Name</label>
                      <input type="text" value={popupNutrient.name}
                        onChange={e => setPopupNutrient(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Vitamin A, Vitamin B12, Magnesium..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-secondary/50 transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Unit */}
                      <div>
                        <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">Unit</label>
                        <input type="text" value={popupNutrient.unit}
                          onChange={e => setPopupNutrient(p => ({ ...p, unit: e.target.value }))}
                          placeholder="mg, μg, IU"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-secondary/50 transition-all" />
                      </div>
                      {/* Color */}
                      <div>
                        <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">Color</label>
                        <div className="flex flex-wrap gap-1.5">
                          {NUTRIENT_COLORS.map(c => (
                            <button key={c} onClick={() => setPopupNutrient(p => ({ ...p, color: c }))}
                              className={cn("w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                                popupNutrient.color === c ? 'border-white scale-110' : 'border-transparent hover:border-white/30')}>
                              <span className={cn("w-4 h-4 rounded-full", c.replace('text-', 'bg-'))} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Max Slider Value */}
                      <div>
                        <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">Max Slider Value</label>
                        <input type="number" value={popupNutrient.maxValue} min={1}
                          onChange={e => setPopupNutrient(p => ({ ...p, maxValue: parseInt(e.target.value) || 1000 }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gym-secondary/50 transition-all" />
                      </div>
                      {/* Step */}
                      <div>
                        <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">Slider Step</label>
                        <input type="number" value={popupNutrient.step} min={0.1} step={0.1}
                          onChange={e => setPopupNutrient(p => ({ ...p, step: parseFloat(e.target.value) || 1 }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gym-secondary/50 transition-all" />
                      </div>
                    </div>

                    {/* Preview */}
                    {popupNutrient.name.trim() && (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[8px] text-slate-500 uppercase font-bold block mb-2">Preview — how it will appear in the ingredient form</span>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className={cn("text-[8px] uppercase font-bold", popupNutrient.color)}>{popupNutrient.name} ({popupNutrient.unit})</label>
                            <span className={cn("text-[10px] font-bold", popupNutrient.color)}>{Math.round(popupNutrient.maxValue / 3)}</span>
                          </div>
                          <input type="range" min={0} max={popupNutrient.maxValue} step={popupNutrient.step}
                            value={Math.round(popupNutrient.maxValue / 3)} readOnly
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-gym-secondary" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* All Nutrient Types List */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-2">Built-in Nutrients</span>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {[
                        { id: 'cal', name: 'Calories', unit: 'kcal', color: 'text-white' },
                        { id: 'protein', name: 'Protein', unit: 'g', color: 'text-gym-accent' },
                        { id: 'carbs', name: 'Carbs', unit: 'g', color: 'text-gym-amber' },
                        { id: 'fats', name: 'Fat', unit: 'g', color: 'text-gym-rose' },
                        { id: 'fiber', name: 'Fiber', unit: 'g', color: 'text-emerald-400' },
                        { id: 'sugar', name: 'Sugar', unit: 'g', color: 'text-orange-400' },
                        { id: 'sodium', name: 'Sodium', unit: 'mg', color: 'text-sky-400' },
                        { id: 'potassium', name: 'Potassium', unit: 'mg', color: 'text-violet-400' },
                        { id: 'calcium', name: 'Calcium', unit: 'mg', color: 'text-cyan-300' },
                        { id: 'iron', name: 'Iron', unit: 'mg', color: 'text-red-400' },
                      ].map(nt => (
                        <div key={nt.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">
                          <span className={cn("w-1.5 h-1.5 rounded-full", nt.color.replace('text-', 'bg-'))} />
                          <span className={cn("text-[10px] font-semibold", nt.color)}>{nt.name}</span>
                          <span className="text-[7px] text-slate-600">({nt.unit})</span>
                          <span className="text-[6px] px-1 py-0.5 rounded bg-white/5 text-slate-500 font-bold">CORE</span>
                        </div>
                      ))}
                    </div>

                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-2">
                      Custom Nutrients {customNutrientTypes.length > 0 && <span className="text-gym-secondary">({customNutrientTypes.length})</span>}
                    </span>
                    {customNutrientTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {customNutrientTypes.map(nt => (
                          <div key={nt.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 group">
                            <span className={cn("w-2 h-2 rounded-full", nt.color.replace('text-', 'bg-'))} />
                            <span className="text-xs font-semibold text-white">{nt.name}</span>
                            <span className="text-[8px] text-slate-500">({nt.unit})</span>
                            <button onClick={() => { setEditingNutrient(nt.id); setPopupNutrient({ name: nt.name, unit: nt.unit, color: nt.color, maxValue: 1000, step: 5 }); }}
                              className="ml-1 p-0.5 rounded text-slate-600 hover:text-gym-secondary opacity-0 group-hover:opacity-100 transition-all" title="Edit">
                              <Pencil size={9} />
                            </button>
                            <button onClick={() => onDeleteNutrientType(nt.id)}
                              className="p-0.5 rounded text-slate-600 hover:text-gym-rose opacity-0 group-hover:opacity-100 transition-all" title="Delete">
                              <Trash2 size={9} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-600 italic">No custom nutrients yet. Use the form above to add Vitamin A, B12, Magnesium, etc.</p>
                    )}
                  </div>
                </div>

                {/* Popup Footer */}
                <div className="px-6 py-4 border-t border-white/5 flex gap-3">
                  <button onClick={() => { setShowNutrientPopup(false); setEditingNutrient(null); }}
                    className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/10 transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!popupNutrient.name.trim()) return;
                      const id = popupNutrient.name.trim().toLowerCase().replace(/\s+/g, '_');
                      if (editingNutrient) {
                        onUpdateNutrientType(editingNutrient, { id, name: popupNutrient.name.trim(), unit: popupNutrient.unit, color: popupNutrient.color });
                        setEditingNutrient(null);
                      } else {
                        onAddNutrientType({ id, name: popupNutrient.name.trim(), unit: popupNutrient.unit, color: popupNutrient.color });
                      }
                      setPopupNutrient({ name: '', unit: 'mg', color: NUTRIENT_COLORS[(customNutrientTypes.length + 1) % NUTRIENT_COLORS.length], maxValue: 1000, step: 5 });
                      setShowNutrientPopup(false);
                    }}
                    disabled={!popupNutrient.name.trim()}
                    className="flex-1 py-2.5 bg-gym-secondary text-white rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-gym-secondary/80 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-gym-secondary/20">
                    <Save size={13} /> {editingNutrient ? 'Update Nutrient' : 'Add Nutrient'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// ─── Diet List Panel ──────────────────────────────────────────────────────
const DietListPanel = ({ onClose, customIngredients, customNutrientTypes }: {
  onClose: () => void;
  customIngredients: Record<string, NutritionInfo>;
  customNutrientTypes: NutrientDef[];
}) => {
  const [items, setItems] = useState<{ name: string; qty: number }[]>([]);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dietName, setDietName] = useState('');

  const allDB = { ...NUTRITION_DB, ...customIngredients };

  // Smart parse: "5 eggs" → qty=5, search="eggs"
  const parseInput = (val: string) => {
    const m = val.match(/^(\d+\.?\d*)\s+(.+)/);
    return { qty: m ? parseFloat(m[1]) : 1, term: (m ? m[2] : val).trim().toLowerCase() };
  };

  const addItem = (name: string, qty: number) => {
    setItems(prev => {
      const existing = prev.find(x => x.name === name);
      if (existing) return prev.map(x => x.name === name ? { ...x, qty: x.qty + qty } : x);
      return [...prev, { name, qty }];
    });
    setSearch('');
    setShowSuggestions(false);
  };

  // Calculate totals
  const totals = useMemo(() => {
    const t = { cal: 0, protein: 0, carbs: 0, fats: 0, sodium: 0, potassium: 0, fiber: 0, sugar: 0, calcium: 0, iron: 0 };
    const extras: Record<string, number> = {};
    customNutrientTypes.forEach(nt => { extras[nt.id] = 0; });
    items.forEach(item => {
      const info = allDB[item.name];
      if (!info) return;
      t.cal += Math.round(info.cal * item.qty);
      t.protein += +(info.protein * item.qty).toFixed(1);
      t.carbs += +(info.carbs * item.qty).toFixed(1);
      t.fats += +(info.fats * item.qty).toFixed(1);
      t.sodium += Math.round(info.sodium * item.qty);
      t.potassium += Math.round(info.potassium * item.qty);
      t.fiber += +(info.fiber * item.qty).toFixed(1);
      t.sugar += +(info.sugar * item.qty).toFixed(1);
      t.calcium += Math.round(info.calcium * item.qty);
      t.iron += +(info.iron * item.qty).toFixed(1);
      customNutrientTypes.forEach(nt => { extras[nt.id] += Math.round((info.extras?.[nt.id] ?? 0) * item.qty); });
    });
    return { ...t, extras };
  }, [items, allDB, customNutrientTypes]);

  const coreNutrients = [
    { key: 'cal' as const, label: 'Calories', unit: 'kcal', color: 'text-white', bg: 'bg-white/10' },
    { key: 'protein' as const, label: 'Protein', unit: 'g', color: 'text-gym-accent', bg: 'bg-gym-accent/10' },
    { key: 'carbs' as const, label: 'Carbs', unit: 'g', color: 'text-gym-amber', bg: 'bg-gym-amber/10' },
    { key: 'fats' as const, label: 'Fat', unit: 'g', color: 'text-gym-rose', bg: 'bg-gym-rose/10' },
    { key: 'sodium' as const, label: 'Sodium', unit: 'mg', color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { key: 'potassium' as const, label: 'Potassium', unit: 'mg', color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { key: 'fiber' as const, label: 'Fiber', unit: 'g', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { key: 'sugar' as const, label: 'Sugar', unit: 'g', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { key: 'calcium' as const, label: 'Calcium', unit: 'mg', color: 'text-cyan-300', bg: 'bg-cyan-300/10' },
    { key: 'iron' as const, label: 'Iron', unit: 'mg', color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-end">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="relative z-10 bg-[#0f1729] w-full max-w-2xl h-full flex flex-col border-l border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-gym-amber via-orange-500 to-yellow-500 px-6 pt-5 pb-6 shrink-0">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calculator size={16} className="text-white/80" />
                <span className="text-white/80 text-xs font-medium tracking-wide uppercase">Nutrition Calculator</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">Diet List</h3>
              <p className="text-white/60 text-xs mt-1">Add ingredients to calculate total nutrition instantly</p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Diet Name + Search */}
        <div className="px-5 pt-4 pb-3 border-b border-white/5 shrink-0 space-y-3">
          <input type="text" value={dietName} onChange={e => setDietName(e.target.value)}
            placeholder="Diet name (e.g. Client Morning Diet, Muscle Gain Day 1...)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:border-gym-amber/50" />
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" value={search}
              onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Type ingredient (e.g. 3 Eggs, 2 Chicken Breast, Rice...)"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-amber/50" />
            {showSuggestions && search.length >= 1 && (() => {
              const { qty, term } = parseInput(search);
              const matches = Object.entries(allDB).filter(([n]) => n.toLowerCase().includes(term)).slice(0, 8);
              if (matches.length === 0) return null;
              return (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {matches.map(([n, info]) => (
                    <button key={n} type="button"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => addItem(n, qty)}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-white/10 transition-colors flex items-center justify-between gap-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white font-semibold truncate">{qty > 1 ? `${qty} × ` : ''}{n}</span>
                        <span className="text-[7px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0">{info.category}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-[8px]">
                        <span className="text-white font-bold">{Math.round(info.cal * qty)}cal</span>
                        <span className="text-gym-accent">{+(info.protein * qty).toFixed(1)}p</span>
                        <span className="text-gym-amber">{+(info.carbs * qty).toFixed(1)}c</span>
                        <span className="text-gym-rose">{+(info.fats * qty).toFixed(1)}f</span>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-auto px-5 py-3">
          {items.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{items.length} Ingredient{items.length > 1 ? 's' : ''} added</span>
                <button onClick={() => setItems([])} className="text-[9px] text-slate-500 hover:text-gym-rose transition-colors">Clear all</button>
              </div>
              {items.map((item, idx) => {
                const info = allDB[item.name];
                if (!info) return null;
                return (
                  <motion.div key={item.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{item.name}</span>
                        <span className="text-[7px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 shrink-0">{info.unit}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[8px]">
                        <span className="text-white">{Math.round(info.cal * item.qty)} cal</span>
                        <span className="text-gym-accent">{+(info.protein * item.qty).toFixed(1)}g P</span>
                        <span className="text-gym-amber">{+(info.carbs * item.qty).toFixed(1)}g C</span>
                        <span className="text-gym-rose">{+(info.fats * item.qty).toFixed(1)}g F</span>
                        <span className="text-sky-400">{Math.round(info.sodium * item.qty)}mg Na</span>
                        <span className="text-violet-400">{Math.round(info.potassium * item.qty)}mg K</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setItems(p => p.map((x, i) => i === idx ? { ...x, qty: Math.max(0.5, x.qty - 0.5) } : x))}
                        className="w-6 h-6 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-all">-</button>
                      <input type="number" value={item.qty} min={0.5} step={0.5}
                        onChange={e => { const v = parseFloat(e.target.value) || 0.5; setItems(p => p.map((x, i) => i === idx ? { ...x, qty: v } : x)); }}
                        className="w-14 text-center bg-white/5 border border-white/10 rounded-lg px-1 py-1 text-xs text-gym-amber font-bold focus:outline-none focus:border-gym-amber/50" />
                      <button onClick={() => setItems(p => p.map((x, i) => i === idx ? { ...x, qty: x.qty + 0.5 } : x))}
                        className="w-6 h-6 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm font-bold transition-all">+</button>
                    </div>
                    <button onClick={() => setItems(p => p.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-600 hover:text-gym-rose opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gym-amber/10 flex items-center justify-center mb-4">
                <Apple size={28} className="text-gym-amber/40" />
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">No ingredients added yet</p>
              <p className="text-slate-600 text-xs">Search and add ingredients above to build your diet list</p>
            </div>
          )}
        </div>

        {/* Totals Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10 bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-1.5 mb-3">
              <Flame size={12} className="text-gym-amber" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Total Nutrition Summary</span>
              {dietName && <span className="text-[9px] text-gym-amber font-semibold ml-1">— {dietName}</span>}
            </div>
            <div className="grid grid-cols-5 gap-1.5 mb-1.5">
              {coreNutrients.map(n => (
                <div key={n.key} className={cn("rounded-lg px-2.5 py-2 border border-white/5", n.bg)}>
                  <div className={cn("text-[7px] font-bold uppercase tracking-wider mb-0.5", n.color)}>{n.label}</div>
                  <div className={cn("text-base font-extrabold leading-tight", n.color)}>
                    {n.key === 'cal' ? Math.round(totals[n.key]) : +totals[n.key].toFixed(1)}
                    <span className="text-[7px] font-normal ml-0.5 opacity-60">{n.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            {customNutrientTypes.length > 0 && (
              <div className="grid grid-cols-5 gap-1.5">
                {customNutrientTypes.map(nt => (
                  <div key={nt.id} className="rounded-lg px-2.5 py-2 border border-white/5 bg-white/[0.03]">
                    <div className={cn("text-[7px] font-bold uppercase tracking-wider mb-0.5", nt.color)}>{nt.name}</div>
                    <div className={cn("text-base font-extrabold leading-tight", nt.color)}>
                      {Math.round(totals.extras[nt.id] || 0)}
                      <span className="text-[7px] font-normal ml-0.5 opacity-60">{nt.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Macro bar visual */}
            <div className="mt-3 flex items-center gap-1 h-2 rounded-full overflow-hidden bg-white/5">
              {totals.protein + totals.carbs + totals.fats > 0 && (
                <>
                  <div className="h-full bg-gym-accent rounded-full transition-all" style={{ width: `${(totals.protein / (totals.protein + totals.carbs + totals.fats)) * 100}%` }} />
                  <div className="h-full bg-gym-amber rounded-full transition-all" style={{ width: `${(totals.carbs / (totals.protein + totals.carbs + totals.fats)) * 100}%` }} />
                  <div className="h-full bg-gym-rose rounded-full transition-all" style={{ width: `${(totals.fats / (totals.protein + totals.carbs + totals.fats)) * 100}%` }} />
                </>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-[8px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gym-accent" />Protein {totals.protein + totals.carbs + totals.fats > 0 ? Math.round((totals.protein / (totals.protein + totals.carbs + totals.fats)) * 100) : 0}%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gym-amber" />Carbs {totals.protein + totals.carbs + totals.fats > 0 ? Math.round((totals.carbs / (totals.protein + totals.carbs + totals.fats)) * 100) : 0}%</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gym-rose" />Fat {totals.protein + totals.carbs + totals.fats > 0 ? Math.round((totals.fats / (totals.protein + totals.carbs + totals.fats)) * 100) : 0}%</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function NutritionPlansManagement() {
  const [plans, setPlans] = useState<NutritionPlan[]>(INITIAL_PLANS);
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState<NutritionGoal | 'All'>('All');
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const [viewPlan, setViewPlan] = useState<NutritionPlan | null>(null);
  const [editPlan, setEditPlan] = useState<NutritionPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<NutritionPlan | null>(null);
  const [assignPlan, setAssignPlan] = useState<NutritionPlan | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showIngredientMaster, setShowIngredientMaster] = useState(false);
  const [showDietList, setShowDietList] = useState(false);
  const [customIngredients, setCustomIngredients] = useState<Record<string, NutritionInfo>>({});
  const [customNutrientTypes, setCustomNutrientTypes] = useState<NutrientDef[]>([]);

  const toast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  const filtered = useMemo(() => {
    return plans.filter(p => {
      if (goalFilter !== 'All' && p.goal !== goalFilter) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [plans, searchQuery, goalFilter]);

  const handleCreate = (data: Omit<NutritionPlan, 'id'>) => {
    const newPlan: NutritionPlan = { ...data, id: Date.now() };
    setPlans(p => [newPlan, ...p]);
    setShowCreate(false);
    toast('Nutrition plan created successfully');
  };

  const handleEdit = (data: Omit<NutritionPlan, 'id'>) => {
    if (!editPlan) return;
    setPlans(p => p.map(pl => pl.id === editPlan.id ? { ...data, id: editPlan.id } : pl));
    setEditPlan(null);
    toast('Nutrition plan updated successfully');
  };

  const handleDelete = () => {
    if (!deletePlan) return;
    setPlans(p => p.filter(pl => pl.id !== deletePlan.id));
    setDeletePlan(null);
    toast('Nutrition plan deleted');
  };

  const handleDuplicate = (plan: NutritionPlan) => {
    const dup: NutritionPlan = {
      ...plan,
      id: Date.now(),
      name: plan.name + ' (Copy)',
      assignedClients: 0,
      createdDate: new Date().toISOString().slice(0, 10),
    };
    setPlans(p => [dup, ...p]);
    toast('Plan duplicated');
  };

  const handleAssign = (clients: string[]) => {
    if (!assignPlan) return;
    setPlans(p => p.map(pl => pl.id === assignPlan.id ? { ...pl, assignedClients: pl.assignedClients + clients.length } : pl));
    toast(`Assigned to ${clients.length} client(s)`);
  };

  const totalClients = plans.reduce((s, p) => s + p.assignedClients, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gym-accent/10 text-gym-accent"><Apple size={22} /></div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-white">Nutrition Plans</h2>
              <button
                onClick={() => setShowIngredientMaster(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg font-bold text-xs hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Database size={13} className="text-gym-accent" /> Ingredient Master
              </button>
              <button
                onClick={() => setShowDietList(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg font-bold text-xs hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <Calculator size={13} className="text-gym-amber" /> Diet List
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Create & manage diet plans with meals, macros & ingredients</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gym-accent text-white rounded-xl font-bold text-sm hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20"
          >
            <Plus size={16} /> New Plan
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 flex-wrap">
        <div className="flex items-center gap-2">
          <Apple size={14} className="text-gym-accent" />
          <span className="text-xs text-slate-400">Total Plans</span>
          <span className="text-sm font-bold text-white">{plans.length}</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gym-amber" />
          <span className="text-xs text-slate-400">Total Clients</span>
          <span className="text-sm font-bold text-white">{totalClients}</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <button onClick={() => setShowIngredientMaster(true)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Database size={14} className="text-cyan-400" />
          <span className="text-xs text-slate-400">Ingredients</span>
          <span className="text-sm font-bold text-white">{Object.keys(NUTRITION_DB).length + Object.keys(customIngredients).length}</span>
        </button>
        <div className="w-px h-4 bg-white/10" />
        {(['Weight Loss', 'Muscle Gain', 'Cardio', 'Strength'] as NutritionGoal[]).map(g => (
          <React.Fragment key={g}>
            <div className="flex items-center gap-2">
              <span className={goalColor[g]}>{goalIcon[g]}</span>
              <span className="text-xs text-slate-400">{g}</span>
              <span className="text-sm font-bold text-white">{plans.filter(p => p.goal === g).length}</span>
            </div>
            <div className="w-px h-4 bg-white/10 last:hidden" />
          </React.Fragment>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search plans..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-slate-500" />
          {(['All', 'Weight Loss', 'Muscle Gain', 'Cardio', 'Strength', 'Detox', 'Wellness'] as const).map(g => (
            <button key={g} onClick={() => setGoalFilter(g)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                goalFilter === g
                  ? 'bg-gym-accent/10 border-gym-accent/30 text-gym-accent'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              )}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map(plan => (
            <React.Fragment key={plan.id}>
              <NutritionCard
                plan={plan}
                onView={() => setViewPlan(plan)}
                onEdit={() => setEditPlan(plan)}
                onDelete={() => setDeletePlan(plan)}
                onDuplicate={() => handleDuplicate(plan)}
                onAssign={() => setAssignPlan(plan)}
              />
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Apple size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg font-medium">No plans found</p>
          <p className="text-slate-600 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreate && <CreatePlanModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
        {editPlan && <CreatePlanModal initial={editPlan} onClose={() => setEditPlan(null)} onSave={handleEdit} />}
        {deletePlan && <DeleteModal plan={deletePlan} onConfirm={handleDelete} onCancel={() => setDeletePlan(null)} />}
        {assignPlan && <AssignModal plan={assignPlan} onClose={() => setAssignPlan(null)} onAssign={handleAssign} />}
        {viewPlan && <ViewDetailsPanel plan={viewPlan} onClose={() => setViewPlan(null)} onEdit={() => { setEditPlan(viewPlan); setViewPlan(null); }} />}
        {showIngredientMaster && (
          <IngredientMasterPanel
            onClose={() => setShowIngredientMaster(false)}
            customIngredients={customIngredients}
            onAddCustom={(name, info) => {
              setCustomIngredients(p => ({ ...p, [name]: info }));
              toast(`Added "${name}" to ingredient database`);
            }}
            onUpdateCustom={(name, info) => {
              setCustomIngredients(p => ({ ...p, [name]: info }));
              toast(`Updated "${name}"`);
            }}
            onDeleteCustom={(name) => {
              setCustomIngredients(p => { const n = { ...p }; delete n[name]; return n; });
              toast(`Removed "${name}" from database`);
            }}
            customNutrientTypes={customNutrientTypes}
            onAddNutrientType={(def) => {
              setCustomNutrientTypes(p => [...p, def]);
              toast(`Added nutrient type "${def.name}"`);
            }}
            onUpdateNutrientType={(id, def) => {
              setCustomNutrientTypes(p => p.map(n => n.id === id ? def : n));
              toast(`Updated nutrient type "${def.name}"`);
            }}
            onDeleteNutrientType={(id) => {
              const nt = customNutrientTypes.find(n => n.id === id);
              setCustomNutrientTypes(p => p.filter(n => n.id !== id));
              toast(`Removed nutrient type "${nt?.name || id}"`);
            }}
          />
        )}
        {showDietList && (
          <DietListPanel
            onClose={() => setShowDietList(false)}
            customIngredients={customIngredients}
            customNutrientTypes={customNutrientTypes}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </motion.div>
  );
}
