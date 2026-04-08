import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Search, LayoutGrid, List, MoreVertical,
  Eye, Edit3, Trash2, Copy, UserPlus, TrendingUp,
  Users, Activity, ChevronDown, X, Check, AlertTriangle,
  Dumbbell, Clock, Calendar, Flame,
  Award, Star, Filter, ArrowUpDown,
  CheckSquare, Square, BarChart2, Sparkles, ChevronLeft, ChevronRight, Apple
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GlassCard } from '@/src/components/DashboardElements';

// ─── Types ─────────────────────────────────────────────────────────────────
type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type Goal = 'Weight Loss' | 'Muscle Gain' | 'Cardio' | 'Strength';
type ProgramStatus = 'Active' | 'Inactive';
type SortOption = 'newest' | 'duration' | 'most-assigned';
type ViewMode = 'card' | 'table';

interface Routine {
  id: number;
  name: string;
  day: string;
  exerciseCount: number;
  estimatedDuration: string;
  sortOrder: number;
}

interface MgmtProgram {
  id: number;
  name: string;
  level: Level;
  goal: Goal;
  duration: string;
  durationWeeks: number;
  routines: Routine[];
  trainer: string;
  status: ProgramStatus;
  enrolledClients: number;
  createdDate: string;
  isTrending: boolean;
  isPopular: boolean;
  completionRate: number;
  description: string;
}

interface ToastMsg { id: number; message: string; type: 'success' | 'error'; }

type ExerciseType = 'reps' | 'time';
type HintLevel = 'Normal' | 'Hard' | 'Consult Trainer';

interface RoutineItem {
  id: number;
  name: string;
  category: string;
  type: ExerciseType;
  minReps: number;
  maxReps: number;
  minTime: number;
  maxTime: number;
  minWeight: number;
  maxWeight: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────
const TRAINERS = ['Alex Carter', 'Sarah Kim', 'Mike Torres', 'Lisa Chen'];
const MOCK_CLIENTS = [
  'James Wilson', 'Emma Johnson', 'Carlos Rodriguez', 'Priya Patel',
  'Tyler Brooks', 'Nina Chen', 'Omar Hassan', 'Aisha Diallo'
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DURATION_OPTIONS = [
  { label: '4 weeks', weeks: 4 }, { label: '6 weeks', weeks: 6 },
  { label: '8 weeks', weeks: 8 }, { label: '12 weeks', weeks: 12 },
  { label: '16 weeks', weeks: 16 }
];

const EXERCISE_CATEGORIES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'];

const INITIAL_ROUTINES: RoutineItem[] = [
  // ── Chest (10) ──
  { id: 1,  name: 'Bench Press',           category: 'Chest',     type: 'reps', minReps: 8,  maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 20,  maxWeight: 100 },
  { id: 2,  name: 'Incline Bench Press',   category: 'Chest',     type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 15,  maxWeight: 80  },
  { id: 3,  name: 'Decline Bench Press',   category: 'Chest',     type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 20,  maxWeight: 90  },
  { id: 4,  name: 'Dumbbell Fly',          category: 'Chest',     type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 5,   maxWeight: 30  },
  { id: 5,  name: 'Incline Dumbbell Press',category: 'Chest',     type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 10,  maxWeight: 45  },
  { id: 6,  name: 'Cable Crossover',       category: 'Chest',     type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 5,   maxWeight: 30  },
  { id: 7,  name: 'Push-Ups',              category: 'Chest',     type: 'reps', minReps: 10, maxReps: 50, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 0   },
  { id: 8,  name: 'Chest Dips',            category: 'Chest',     type: 'reps', minReps: 8,  maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 30  },
  { id: 9,  name: 'Pec Deck Machine',      category: 'Chest',     type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 10,  maxWeight: 60  },
  { id: 10, name: 'Landmine Press',        category: 'Chest',     type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 10,  maxWeight: 40  },

  // ── Back (10) ──
  { id: 11, name: 'Pull-Ups',              category: 'Back',      type: 'reps', minReps: 5,  maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 40  },
  { id: 12, name: 'Deadlift',              category: 'Back',      type: 'reps', minReps: 3,  maxReps: 12, minTime: 0,  maxTime: 0,  minWeight: 60,  maxWeight: 200 },
  { id: 13, name: 'Barbell Row',           category: 'Back',      type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 20,  maxWeight: 80  },
  { id: 14, name: 'Lat Pulldown',          category: 'Back',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 20,  maxWeight: 80  },
  { id: 15, name: 'Seated Cable Row',      category: 'Back',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 15,  maxWeight: 70  },
  { id: 16, name: 'T-Bar Row',             category: 'Back',      type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 20,  maxWeight: 70  },
  { id: 17, name: 'Dumbbell Row',          category: 'Back',      type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 10,  maxWeight: 50  },
  { id: 18, name: 'Chin-Ups',              category: 'Back',      type: 'reps', minReps: 5,  maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 30  },
  { id: 19, name: 'Face Pulls',            category: 'Back',      type: 'reps', minReps: 12, maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 5,   maxWeight: 25  },
  { id: 20, name: 'Hyperextensions',       category: 'Back',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 20  },

  // ── Legs (12) ──
  { id: 21, name: 'Squats',                category: 'Legs',      type: 'reps', minReps: 8,  maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 40,  maxWeight: 150 },
  { id: 22, name: 'Leg Press',             category: 'Legs',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 50,  maxWeight: 200 },
  { id: 23, name: 'Lunges',                category: 'Legs',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 40  },
  { id: 24, name: 'Leg Extension',         category: 'Legs',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 15,  maxWeight: 60  },
  { id: 25, name: 'Leg Curl',              category: 'Legs',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 15,  maxWeight: 50  },
  { id: 26, name: 'Romanian Deadlift',     category: 'Legs',      type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 30,  maxWeight: 100 },
  { id: 27, name: 'Calf Raises',           category: 'Legs',      type: 'reps', minReps: 15, maxReps: 30, minTime: 0,  maxTime: 0,  minWeight: 20,  maxWeight: 80  },
  { id: 28, name: 'Bulgarian Split Squat', category: 'Legs',      type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 40  },
  { id: 29, name: 'Hip Thrust',            category: 'Legs',      type: 'reps', minReps: 8,  maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 20,  maxWeight: 100 },
  { id: 30, name: 'Goblet Squat',          category: 'Legs',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 8,   maxWeight: 32  },
  { id: 31, name: 'Hack Squat',            category: 'Legs',      type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 40,  maxWeight: 120 },
  { id: 32, name: 'Wall Sit',              category: 'Legs',      type: 'time', minReps: 0,  maxReps: 0,  minTime: 1,  maxTime: 5,  minWeight: 0,   maxWeight: 0   },

  // ── Shoulders (8) ──
  { id: 33, name: 'Overhead Press',        category: 'Shoulders', type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 15,  maxWeight: 60  },
  { id: 34, name: 'Lateral Raises',        category: 'Shoulders', type: 'reps', minReps: 10, maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 3,   maxWeight: 15  },
  { id: 35, name: 'Front Raises',          category: 'Shoulders', type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 3,   maxWeight: 15  },
  { id: 36, name: 'Arnold Press',          category: 'Shoulders', type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 8,   maxWeight: 30  },
  { id: 37, name: 'Reverse Fly',           category: 'Shoulders', type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 3,   maxWeight: 15  },
  { id: 38, name: 'Upright Row',           category: 'Shoulders', type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 10,  maxWeight: 40  },
  { id: 39, name: 'Shrugs',                category: 'Shoulders', type: 'reps', minReps: 10, maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 15,  maxWeight: 50  },
  { id: 40, name: 'Military Press',        category: 'Shoulders', type: 'reps', minReps: 6,  maxReps: 12, minTime: 0,  maxTime: 0,  minWeight: 20,  maxWeight: 60  },

  // ── Arms (10) ──
  { id: 41, name: 'Bicep Curls',           category: 'Arms',      type: 'reps', minReps: 10, maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 5,   maxWeight: 25  },
  { id: 42, name: 'Hammer Curls',          category: 'Arms',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 5,   maxWeight: 25  },
  { id: 43, name: 'Tricep Pushdown',       category: 'Arms',      type: 'reps', minReps: 10, maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 10,  maxWeight: 40  },
  { id: 44, name: 'Skull Crushers',        category: 'Arms',      type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 10,  maxWeight: 35  },
  { id: 45, name: 'Preacher Curl',         category: 'Arms',      type: 'reps', minReps: 8,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 5,   maxWeight: 25  },
  { id: 46, name: 'Concentration Curl',    category: 'Arms',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 3,   maxWeight: 20  },
  { id: 47, name: 'Overhead Tricep Extension', category: 'Arms',  type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 8,   maxWeight: 30  },
  { id: 48, name: 'Cable Curl',            category: 'Arms',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 5,   maxWeight: 25  },
  { id: 49, name: 'Wrist Curls',           category: 'Arms',      type: 'reps', minReps: 15, maxReps: 30, minTime: 0,  maxTime: 0,  minWeight: 3,   maxWeight: 15  },
  { id: 50, name: 'Diamond Push-Ups',      category: 'Arms',      type: 'reps', minReps: 8,  maxReps: 30, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 0   },

  // ── Core (10) ──
  { id: 51, name: 'Plank Hold',            category: 'Core',      type: 'time', minReps: 0,  maxReps: 0,  minTime: 1,  maxTime: 5,  minWeight: 0,   maxWeight: 0   },
  { id: 52, name: 'Crunches',              category: 'Core',      type: 'reps', minReps: 15, maxReps: 50, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 10  },
  { id: 53, name: 'Russian Twists',        category: 'Core',      type: 'reps', minReps: 15, maxReps: 40, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 15  },
  { id: 54, name: 'Leg Raises',            category: 'Core',      type: 'reps', minReps: 10, maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 0   },
  { id: 55, name: 'Mountain Climbers',     category: 'Core',      type: 'time', minReps: 0,  maxReps: 0,  minTime: 1,  maxTime: 5,  minWeight: 0,   maxWeight: 0   },
  { id: 56, name: 'Bicycle Crunches',      category: 'Core',      type: 'reps', minReps: 15, maxReps: 40, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 0   },
  { id: 57, name: 'Ab Wheel Rollout',      category: 'Core',      type: 'reps', minReps: 8,  maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 0   },
  { id: 58, name: 'Hanging Knee Raises',   category: 'Core',      type: 'reps', minReps: 8,  maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 0   },
  { id: 59, name: 'Side Plank',            category: 'Core',      type: 'time', minReps: 0,  maxReps: 0,  minTime: 1,  maxTime: 3,  minWeight: 0,   maxWeight: 0   },
  { id: 60, name: 'Dead Bug',              category: 'Core',      type: 'reps', minReps: 10, maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 0   },

  // ── Cardio (10) ──
  { id: 61, name: 'Treadmill Run',         category: 'Cardio',    type: 'time', minReps: 0,  maxReps: 0,  minTime: 10, maxTime: 60, minWeight: 0,   maxWeight: 0   },
  { id: 62, name: 'Cycling',               category: 'Cardio',    type: 'time', minReps: 0,  maxReps: 0,  minTime: 10, maxTime: 60, minWeight: 0,   maxWeight: 0   },
  { id: 63, name: 'Jump Rope',             category: 'Cardio',    type: 'time', minReps: 0,  maxReps: 0,  minTime: 5,  maxTime: 30, minWeight: 0,   maxWeight: 0   },
  { id: 64, name: 'Rowing Machine',        category: 'Cardio',    type: 'time', minReps: 0,  maxReps: 0,  minTime: 10, maxTime: 45, minWeight: 0,   maxWeight: 0   },
  { id: 65, name: 'Elliptical',            category: 'Cardio',    type: 'time', minReps: 0,  maxReps: 0,  minTime: 15, maxTime: 45, minWeight: 0,   maxWeight: 0   },
  { id: 66, name: 'Stair Climber',         category: 'Cardio',    type: 'time', minReps: 0,  maxReps: 0,  minTime: 10, maxTime: 30, minWeight: 0,   maxWeight: 0   },
  { id: 67, name: 'Swimming',              category: 'Cardio',    type: 'time', minReps: 0,  maxReps: 0,  minTime: 15, maxTime: 60, minWeight: 0,   maxWeight: 0   },
  { id: 68, name: 'Burpees',               category: 'Cardio',    type: 'reps', minReps: 8,  maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 0   },
  { id: 69, name: 'High Knees',            category: 'Cardio',    type: 'time', minReps: 0,  maxReps: 0,  minTime: 1,  maxTime: 5,  minWeight: 0,   maxWeight: 0   },
  { id: 70, name: 'Battle Ropes',          category: 'Cardio',    type: 'time', minReps: 0,  maxReps: 0,  minTime: 1,  maxTime: 10, minWeight: 0,   maxWeight: 0   },

  // ── Full Body (10) ──
  { id: 71, name: 'Clean & Press',         category: 'Full Body', type: 'reps', minReps: 5,  maxReps: 12, minTime: 0,  maxTime: 0,  minWeight: 20,  maxWeight: 70  },
  { id: 72, name: 'Kettlebell Swing',      category: 'Full Body', type: 'reps', minReps: 10, maxReps: 30, minTime: 0,  maxTime: 0,  minWeight: 8,   maxWeight: 32  },
  { id: 73, name: 'Thrusters',             category: 'Full Body', type: 'reps', minReps: 8,  maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 10,  maxWeight: 50  },
  { id: 74, name: 'Turkish Get-Up',        category: 'Full Body', type: 'reps', minReps: 3,  maxReps: 8,  minTime: 0,  maxTime: 0,  minWeight: 8,   maxWeight: 24  },
  { id: 75, name: 'Bear Crawl',            category: 'Full Body', type: 'time', minReps: 0,  maxReps: 0,  minTime: 1,  maxTime: 5,  minWeight: 0,   maxWeight: 0   },
  { id: 76, name: 'Man Makers',            category: 'Full Body', type: 'reps', minReps: 5,  maxReps: 15, minTime: 0,  maxTime: 0,  minWeight: 5,   maxWeight: 20  },
  { id: 77, name: 'Box Jumps',             category: 'Full Body', type: 'reps', minReps: 8,  maxReps: 20, minTime: 0,  maxTime: 0,  minWeight: 0,   maxWeight: 0   },
  { id: 78, name: 'Sled Push',             category: 'Full Body', type: 'time', minReps: 0,  maxReps: 0,  minTime: 1,  maxTime: 5,  minWeight: 20,  maxWeight: 100 },
  { id: 79, name: 'Farmer\'s Walk',        category: 'Full Body', type: 'time', minReps: 0,  maxReps: 0,  minTime: 1,  maxTime: 5,  minWeight: 15,  maxWeight: 50  },
  { id: 80, name: 'Medicine Ball Slam',    category: 'Full Body', type: 'reps', minReps: 10, maxReps: 25, minTime: 0,  maxTime: 0,  minWeight: 3,   maxWeight: 15  },
];

const INITIAL_PROGRAMS: MgmtProgram[] = [
  {
    id: 1, name: 'Alpha Shred Protocol', level: 'Advanced', goal: 'Weight Loss',
    duration: '8 weeks', durationWeeks: 8,
    routines: [
      { id: 1, name: 'HIIT Blast', day: 'Monday', exerciseCount: 8, estimatedDuration: '45 min', sortOrder: 1 },
      { id: 2, name: 'Core Destroyer', day: 'Wednesday', exerciseCount: 6, estimatedDuration: '35 min', sortOrder: 2 },
      { id: 3, name: 'Cardio Burn', day: 'Friday', exerciseCount: 5, estimatedDuration: '40 min', sortOrder: 3 },
    ],
    trainer: 'Alex Carter', status: 'Active', enrolledClients: 24,
    createdDate: '2024-11-15', isTrending: true, isPopular: false, completionRate: 78,
    description: 'High-intensity fat burning program for experienced athletes.'
  },
  {
    id: 2, name: 'Beginner Power Start', level: 'Beginner', goal: 'Strength',
    duration: '6 weeks', durationWeeks: 6,
    routines: [
      { id: 4, name: 'Full Body Foundation', day: 'Monday', exerciseCount: 7, estimatedDuration: '50 min', sortOrder: 1 },
      { id: 5, name: 'Upper Body Basics', day: 'Wednesday', exerciseCount: 6, estimatedDuration: '40 min', sortOrder: 2 },
      { id: 6, name: 'Lower Body Basics', day: 'Friday', exerciseCount: 6, estimatedDuration: '40 min', sortOrder: 3 },
    ],
    trainer: 'Sarah Kim', status: 'Active', enrolledClients: 38,
    createdDate: '2024-10-01', isTrending: false, isPopular: true, completionRate: 85,
    description: 'Perfect starting point for gym newcomers focusing on foundational strength.'
  },
  {
    id: 3, name: 'Muscle Surge 12', level: 'Intermediate', goal: 'Muscle Gain',
    duration: '12 weeks', durationWeeks: 12,
    routines: [
      { id: 7, name: 'Chest & Triceps', day: 'Monday', exerciseCount: 9, estimatedDuration: '60 min', sortOrder: 1 },
      { id: 8, name: 'Back & Biceps', day: 'Tuesday', exerciseCount: 9, estimatedDuration: '60 min', sortOrder: 2 },
      { id: 9, name: 'Legs & Core', day: 'Thursday', exerciseCount: 8, estimatedDuration: '55 min', sortOrder: 3 },
      { id: 10, name: 'Shoulders & Arms', day: 'Saturday', exerciseCount: 7, estimatedDuration: '50 min', sortOrder: 4 },
    ],
    trainer: 'Mike Torres', status: 'Active', enrolledClients: 19,
    createdDate: '2024-12-01', isTrending: false, isPopular: false, completionRate: 62,
    description: '3-phase progressive overload program for intermediate bodybuilders.'
  },
  {
    id: 4, name: 'Cardio Rush', level: 'Beginner', goal: 'Cardio',
    duration: '4 weeks', durationWeeks: 4,
    routines: [
      { id: 11, name: 'Steady State Run', day: 'Monday', exerciseCount: 4, estimatedDuration: '30 min', sortOrder: 1 },
      { id: 12, name: 'Interval Sprints', day: 'Wednesday', exerciseCount: 5, estimatedDuration: '25 min', sortOrder: 2 },
      { id: 13, name: 'Cycling Circuit', day: 'Friday', exerciseCount: 4, estimatedDuration: '35 min', sortOrder: 3 },
    ],
    trainer: 'Lisa Chen', status: 'Active', enrolledClients: 31,
    createdDate: '2025-01-10', isTrending: true, isPopular: false, completionRate: 90,
    description: 'Quick-start cardiovascular program with proven endurance results.'
  },
  {
    id: 5, name: 'Elite Powerlifting', level: 'Advanced', goal: 'Strength',
    duration: '16 weeks', durationWeeks: 16,
    routines: [
      { id: 14, name: 'Max Squat Day', day: 'Monday', exerciseCount: 6, estimatedDuration: '75 min', sortOrder: 1 },
      { id: 15, name: 'Max Bench Day', day: 'Wednesday', exerciseCount: 6, estimatedDuration: '70 min', sortOrder: 2 },
      { id: 16, name: 'Max Deadlift Day', day: 'Friday', exerciseCount: 5, estimatedDuration: '70 min', sortOrder: 3 },
    ],
    trainer: 'Alex Carter', status: 'Inactive', enrolledClients: 7,
    createdDate: '2024-09-05', isTrending: false, isPopular: false, completionRate: 45,
    description: 'Competition-focused powerlifting peaking program.'
  },
  {
    id: 6, name: 'Lean & Tone', level: 'Intermediate', goal: 'Weight Loss',
    duration: '8 weeks', durationWeeks: 8,
    routines: [
      { id: 17, name: 'Full Body Circuit', day: 'Monday', exerciseCount: 10, estimatedDuration: '50 min', sortOrder: 1 },
      { id: 18, name: 'Upper Tone', day: 'Wednesday', exerciseCount: 8, estimatedDuration: '45 min', sortOrder: 2 },
      { id: 19, name: 'Lower Tone', day: 'Friday', exerciseCount: 8, estimatedDuration: '45 min', sortOrder: 3 },
    ],
    trainer: 'Sarah Kim', status: 'Active', enrolledClients: 22,
    createdDate: '2025-02-01', isTrending: false, isPopular: false, completionRate: 70,
    description: 'Balanced program combining strength training with fat-burning circuits.'
  }
];

// ─── Color Maps ─────────────────────────────────────────────────────────────
const levelBadge: Record<Level, string> = {
  Beginner: 'text-gym-accent bg-gym-accent/10 border-gym-accent/20',
  Intermediate: 'text-gym-amber bg-gym-amber/10 border-gym-amber/20',
  Advanced: 'text-gym-rose bg-gym-rose/10 border-gym-rose/20',
};
const levelDot: Record<Level, string> = {
  Beginner: 'bg-gym-accent',
  Intermediate: 'bg-gym-amber',
  Advanced: 'bg-gym-rose',
};
const goalColor: Record<Goal, string> = {
  'Weight Loss': 'text-gym-rose',
  'Muscle Gain': 'text-gym-secondary',
  'Cardio': 'text-gym-accent',
  'Strength': 'text-gym-amber',
};
const goalIcon: Record<Goal, React.ReactNode> = {
  'Weight Loss': <Flame size={13} />,
  'Muscle Gain': <Dumbbell size={13} />,
  'Cardio': <Activity size={13} />,
  'Strength': <Award size={13} />,
};

// ─── New Design Maps ─────────────────────────────────────────────────────────
const goalGradient: Record<Goal, string> = {
  'Weight Loss': 'linear-gradient(135deg, #F43F5E 0%, #9F1239 100%)',
  'Muscle Gain': 'linear-gradient(135deg, #6366F1 0%, #312E81 100%)',
  'Cardio':      'linear-gradient(135deg, #10B981 0%, #064E3B 100%)',
  'Strength':    'linear-gradient(135deg, #F59E0B 0%, #78350F 100%)',
};
const goalGlow: Record<Goal, string> = {
  'Weight Loss': 'shadow-[0_8px_32px_rgba(244,63,94,0.35)]',
  'Muscle Gain': 'shadow-[0_8px_32px_rgba(99,102,241,0.35)]',
  'Cardio':      'shadow-[0_8px_32px_rgba(16,185,129,0.35)]',
  'Strength':    'shadow-[0_8px_32px_rgba(245,158,11,0.35)]',
};
const goalWatermarkIcon: Record<Goal, React.ReactNode> = {
  'Weight Loss': <Flame size={96} />,
  'Muscle Gain': <Dumbbell size={96} />,
  'Cardio':      <Activity size={96} />,
  'Strength':    <Award size={96} />,
};
const levelStripe: Record<Level, string> = {
  Beginner:     'bg-gym-accent',
  Intermediate: 'bg-gym-amber',
  Advanced:     'bg-gym-rose',
};

// ─── Hint Helpers ────────────────────────────────────────────────────────────
const getRepsHint   = (maxReps: number): HintLevel => maxReps <= 15 ? 'Normal' : maxReps <= 30 ? 'Hard' : 'Consult Trainer';
const getTimeHint   = (maxMin: number):  HintLevel => maxMin  <= 20 ? 'Normal' : maxMin  <= 40 ? 'Hard' : 'Consult Trainer';
const getWeightHint = (maxKg: number):   HintLevel => maxKg   <= 50 ? 'Normal' : maxKg   <= 100 ? 'Hard' : 'Consult Trainer';

const hintColor: Record<HintLevel, string> = {
  'Normal':          'text-gym-accent bg-gym-accent/10 border-gym-accent/20',
  'Hard':            'text-gym-amber bg-gym-amber/10 border-gym-amber/20',
  'Consult Trainer': 'text-gym-rose bg-gym-rose/10 border-gym-rose/20',
};

// ─── Medical Condition Support ───────────────────────────────────────────────
type MedicalCondition = 'None' | 'Heart Condition' | 'Joint Issues' | 'Hypertension' | 'Diabetes';
const MEDICAL_CONDITIONS: MedicalCondition[] = ['None', 'Heart Condition', 'Joint Issues', 'Hypertension', 'Diabetes'];

const getMedRepsHint = (maxReps: number, cond: MedicalCondition): HintLevel =>
  (cond === 'Heart Condition' || cond === 'Hypertension')
    ? (maxReps <= 10 ? 'Normal' : maxReps <= 20 ? 'Hard' : 'Consult Trainer')
    : getRepsHint(maxReps);

const getMedTimeHint = (maxMin: number, cond: MedicalCondition): HintLevel =>
  cond === 'Heart Condition' ? (maxMin <= 12 ? 'Normal' : maxMin <= 22 ? 'Hard' : 'Consult Trainer')
  : cond === 'Hypertension'  ? (maxMin <= 15 ? 'Normal' : maxMin <= 28 ? 'Hard' : 'Consult Trainer')
  : getTimeHint(maxMin);

const getMedWeightHint = (maxKg: number, cond: MedicalCondition): HintLevel =>
  cond === 'Heart Condition' ? (maxKg <= 20 ? 'Normal' : maxKg <= 40 ? 'Hard' : 'Consult Trainer')
  : (cond === 'Joint Issues' || cond === 'Hypertension') ? (maxKg <= 30 ? 'Normal' : maxKg <= 60 ? 'Hard' : 'Consult Trainer')
  : getWeightHint(maxKg);

const medicalAdvice: Record<MedicalCondition, string> = {
  'None':            '',
  'Heart Condition': 'Keep heart rate moderate. Avoid maximal effort. Use shorter rest periods.',
  'Joint Issues':    'Reduce weight load. Use controlled movements. Avoid joint compression.',
  'Hypertension':    'Avoid heavy lifting and breath-holding. Monitor blood pressure throughout.',
  'Diabetes':        'Monitor blood sugar before and after. Stay hydrated. Carry fast-acting glucose.',
};

// ─── Toast Component ────────────────────────────────────────────────────────
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

// ─── Program Card (Members Style) ─────────────────────────────────────────────
const ProgramCard = ({
  program, selected, onSelect, onView, onEdit, onDelete, onDuplicate, onAssign
}: {
  program: MgmtProgram;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAssign: () => void;
}) => {
  return (
    <GlassCard className="flex flex-col gap-2 !p-3 cursor-pointer" onClick={onView}>
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
          <img src={`https://picsum.photos/seed/prog${program.id}/200/200`} alt={program.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-white truncate">{program.name}</h3>
          <p className="text-[9px] text-slate-400 truncate">{program.goal} · {program.duration} · {program.trainer}</p>
        </div>
        <span className={cn(
          "text-[7px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0",
          program.status === 'Active' ? "text-gym-accent bg-gym-accent/10 border-gym-accent/20" :
          "text-gym-rose bg-gym-rose/10 border-gym-rose/20"
        )}>
          {program.status}
        </span>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="flex-1 py-1.5 bg-gym-accent/10 hover:bg-gym-accent/20 text-gym-accent text-[10px] font-bold rounded-lg transition-all"
        >
          Manage Program
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="py-1.5 px-2.5 bg-gym-secondary/10 hover:bg-gym-secondary/20 text-gym-secondary text-[10px] font-bold rounded-lg transition-all flex items-center"
        >
          <Edit3 size={10} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="py-1.5 px-2.5 bg-gym-rose/10 hover:bg-gym-rose/20 text-gym-rose text-[10px] font-bold rounded-lg transition-all flex items-center"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </GlassCard>
  );
};

// ─── Table Row ────────────────────────────────────────────────────────────────
const ProgramTableRow = ({
  program, selected, onSelect, onView, onEdit, onDelete, onDuplicate, onAssign
}: {
  program: MgmtProgram;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAssign: () => void;
}) => (
  <tr className={cn(
    "border-b border-white/5 transition-all duration-150 group",
    "hover:bg-white/[0.04]",
    selected && "bg-gym-accent/5"
  )}>
    {/* Select */}
    <td className="py-3 px-4">
      <button onClick={onSelect} className="text-slate-500 hover:text-gym-accent transition-colors">
        {selected ? <CheckSquare size={16} className="text-gym-accent" /> : <Square size={16} />}
      </button>
    </td>

    {/* Program name */}
    <td className="py-3 px-4">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full shrink-0", levelDot[program.level])} />
        <span className="font-semibold text-white text-sm">{program.name}</span>
        {program.isTrending && <Flame size={12} className="text-gym-rose" />}
        {program.isPopular && <Star size={12} className="text-gym-amber" />}
      </div>
    </td>

    {/* Level */}
    <td className="py-3 px-4">
      <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border", levelBadge[program.level])}>
        {program.level}
      </span>
    </td>

    {/* Goal */}
    <td className="py-3 px-4">
      <span className={cn("flex items-center gap-1 text-sm font-medium w-fit", goalColor[program.goal])}>
        {goalIcon[program.goal]} {program.goal}
      </span>
    </td>

    {/* Duration */}
    <td className="py-3 px-4 text-sm text-slate-300">{program.duration}</td>

    {/* Routines */}
    <td className="py-3 px-4 text-sm text-slate-300">{program.routines.length}</td>

    {/* Trainer */}
    <td className="py-3 px-4 text-sm text-slate-300">{program.trainer}</td>

    {/* Status */}
    <td className="py-3 px-4">
      <span className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
        program.status === 'Active' ? 'bg-gym-accent/10 text-gym-accent' : 'bg-slate-700 text-slate-400'
      )}>
        <span className={cn("w-1.5 h-1.5 rounded-full", program.status === 'Active' ? 'bg-gym-accent' : 'bg-slate-500')} />
        {program.status}
      </span>
    </td>

    {/* Clients */}
    <td className="py-3 px-4 text-sm text-slate-300">{program.enrolledClients}</td>

    {/* Created */}
    <td className="py-3 px-4 text-xs text-slate-500">{new Date(program.createdDate).toLocaleDateString()}</td>

    {/* ── Actions — always visible ── */}
    <td className="py-3 px-3">
      <div className="flex items-center gap-1.5">
        {/* Edit — prominent, always visible */}
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gym-accent/10 border border-gym-accent/20 text-gym-accent text-xs font-bold hover:bg-gym-accent/20 hover:border-gym-accent/40 hover:shadow-sm hover:shadow-gym-accent/20 active:scale-95 transition-all whitespace-nowrap"
        >
          <Edit3 size={12} strokeWidth={2.5} />
          Edit
        </button>

        {/* View */}
        <button
          onClick={onView}
          title="View Details"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <Eye size={13} />
        </button>

        {/* Duplicate */}
        <button
          onClick={onDuplicate}
          title="Duplicate"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-gym-secondary hover:bg-gym-secondary/10 transition-all"
        >
          <Copy size={13} />
        </button>

        {/* Assign */}
        <button
          onClick={onAssign}
          title="Assign to Client"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-gym-amber hover:bg-gym-amber/10 transition-all"
        >
          <UserPlus size={13} />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          title="Delete"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-gym-rose hover:bg-gym-rose/10 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </td>
  </tr>
);

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
const DeleteModal = ({ program, onConfirm, onCancel }: {
  program: MgmtProgram;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
          <h3 className="text-lg font-bold text-white">Delete Program</h3>
          <p className="text-sm text-slate-400">This action cannot be undone</p>
        </div>
      </div>
      <p className="text-slate-300 mb-6">
        Are you sure you want to delete <span className="font-bold text-white">"{program.name}"</span>?
        {program.enrolledClients > 0 && (
          <span className="text-gym-amber"> {program.enrolledClients} clients are enrolled in this program.</span>
        )}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 bg-gym-rose text-white rounded-xl text-sm font-bold hover:bg-gym-rose/80 transition-all shadow-lg shadow-gym-rose/20"
        >
          Delete Program
        </button>
      </div>
    </motion.div>
  </div>
);

// ─── Assign Client Modal ─────────────────────────────────────────────────────
const AssignModal = ({ program, onClose, onAssign }: {
  program: MgmtProgram;
  onClose: () => void;
  onAssign: (clients: string[]) => void;
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (c: string) => setSelected(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative z-10 glass-card p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Assign to Client(s)</h3>
            <p className="text-sm text-slate-400">{program.name}</p>
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
          <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
            Cancel
          </button>
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

// ─── View Details Panel ───────────────────────────────────────────────────────
const ViewDetailsPanel = ({ program, onClose, onEdit }: {
  program: MgmtProgram;
  onClose: () => void;
  onEdit: () => void;
}) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-end p-4">
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
    />
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 240 }}
      className="relative z-10 glass-card w-full max-w-[50vw] h-full overflow-y-auto flex flex-col gap-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {program.isTrending && (
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-gym-rose/15 text-gym-rose border border-gym-rose/20">
                <Flame size={9} /> Trending
              </span>
            )}
            {program.isPopular && (
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-gym-amber/15 text-gym-amber border border-gym-amber/20">
                <Star size={9} /> Popular
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mt-1">{program.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border", levelBadge[program.level])}>
              {program.level}
            </span>
            <span className={cn("text-xs font-semibold flex items-center gap-1", goalColor[program.goal])}>
              {goalIcon[program.goal]} {program.goal}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <X size={16} />
        </button>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">{program.description}</p>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Clock, label: 'Duration', value: program.duration },
          { icon: Calendar, label: 'Days/Week', value: `${program.routines.length} days` },
          { icon: Users, label: 'Enrolled', value: `${program.enrolledClients} clients` },
          { icon: BarChart2, label: 'Completion', value: `${program.completionRate}%` },
          { icon: UserPlus, label: 'Trainer', value: program.trainer },
          { icon: Calendar, label: 'Created', value: new Date(program.createdDate).toLocaleDateString() },
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

      {/* Routines */}
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Routines ({program.routines.length})
        </h4>
        <div className="flex flex-col gap-2">
          {program.routines.map((routine, i) => (
            <div key={routine.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="w-6 h-6 rounded-full bg-gym-accent/10 text-gym-accent text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{routine.name}</p>
                <p className="text-xs text-slate-500">{routine.day} · {routine.exerciseCount} exercises · {routine.estimatedDuration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400 font-medium">Completion Rate</span>
          <span className="text-sm font-bold text-gym-accent">{program.completionRate}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gym-accent to-gym-secondary"
            style={{ width: `${program.completionRate}%` }}
          />
        </div>
      </div>

      <button
        onClick={onEdit}
        className="w-full py-3 bg-gym-accent text-white rounded-xl font-bold text-sm hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20 flex items-center justify-center gap-2"
      >
        <Edit3 size={16} /> Edit Program
      </button>
    </motion.div>
  </div>
);

// ─── Create / Edit Program Modal ─────────────────────────────────────────────
const CreateProgramModal = ({ initial, onClose, onSave }: {
  initial?: MgmtProgram;
  onClose: () => void;
  onSave: (data: Omit<MgmtProgram, 'id' | 'isTrending' | 'isPopular' | 'completionRate'>) => void;
}) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    level: (initial?.level ?? 'Beginner') as Level,
    goal: (initial?.goal ?? 'Weight Loss') as Goal,
    duration: initial?.duration ?? '8 weeks',
    durationWeeks: initial?.durationWeeks ?? 8,
    trainer: initial?.trainer ?? TRAINERS[0],
    status: (initial?.status ?? 'Active') as ProgramStatus,
    enrolledClients: initial?.enrolledClients ?? 0,
    createdDate: initial?.createdDate ?? new Date().toISOString().slice(0, 10),
    description: initial?.description ?? '',
  });
  const [routines, setRoutines] = useState<Routine[]>(
    initial?.routines ?? []
  );

  // Per-exercise range state for Step 2 sliders
  const [exerciseRanges, setExerciseRanges] = useState<Map<number, number>>(() => {
    const m = new Map<number, number>();
    INITIAL_ROUTINES.forEach(r => {
      m.set(r.id, r.type === 'reps'
        ? Math.round((r.minReps + r.maxReps) / 2)
        : Math.round((r.minTime + r.maxTime) / 2));
    });
    return m;
  });
  const [exerciseWeights, setExerciseWeights] = useState<Map<number, number>>(() => {
    const m = new Map<number, number>();
    INITIAL_ROUTINES.forEach(r => { if (r.type === 'reps') m.set(r.id, Math.round((r.minWeight + r.maxWeight) / 2)); });
    return m;
  });
  const [medCondition, setMedCondition] = useState<MedicalCondition>('None');
  const [exerciseSets, setExerciseSets] = useState<Map<number, number>>(() => {
    const m = new Map<number, number>();
    INITIAL_ROUTINES.forEach(r => m.set(r.id, 3));
    return m;
  });

  const toggleExercise = (item: RoutineItem) => {
    setRoutines(prev => {
      const exists = prev.some(r => r.name === item.name);
      if (exists) return prev.filter(r => r.name !== item.name);
      const val = exerciseRanges.get(item.id) ??
        (item.type === 'reps' ? Math.round((item.minReps + item.maxReps) / 2) : Math.round((item.minTime + item.maxTime) / 2));
      const duration = item.type === 'time' ? `${val} min` : `${Math.round(val * 1.5)} min`;
      return [...prev, { id: item.id, name: item.name, day: DAYS[prev.length % 7], exerciseCount: 1, estimatedDuration: duration, sortOrder: prev.length + 1 }];
    });
  };

  const handleSave = () => {
    onSave({ ...form, routines });
  };

  const isStep1Valid = form.name.trim().length > 0;
  const isStep2Valid = routines.length > 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />
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
                  {initial ? 'Edit Program' : 'New Program'} · Step {step} of 3
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                {step === 1 ? 'Basic Details' : step === 2 ? 'Add Routines' : 'Review & Publish'}
              </h3>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-all">
              <X size={16} />
            </button>
          </div>
          {/* Step indicators */}
          <div className="relative flex gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={cn(
                  "h-1 rounded-full flex-1 transition-all duration-300",
                  s <= step ? 'bg-white' : 'bg-white/20'
                )}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="bg-[#0f1729] px-6 pt-0 pb-5 -mt-5 rounded-t-3xl relative overflow-y-auto flex-1">
          <div className="pt-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Program Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Alpha Shred Protocol"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Fitness Level</label>
                    <select
                      value={form.level}
                      onChange={e => setForm(p => ({ ...p, level: e.target.value as Level }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gym-accent/50"
                    >
                      {(['Beginner', 'Intermediate', 'Advanced'] as Level[]).map(l => (
                        <option key={l} value={l} className="bg-[#1e293b]">{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Goal Type</label>
                    <select
                      value={form.goal}
                      onChange={e => setForm(p => ({ ...p, goal: e.target.value as Goal }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gym-accent/50"
                    >
                      {(['Weight Loss', 'Muscle Gain', 'Cardio', 'Strength'] as Goal[]).map(g => (
                        <option key={g} value={g} className="bg-[#1e293b]">{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Duration</label>
                    <select
                      value={form.duration}
                      onChange={e => {
                        const opt = DURATION_OPTIONS.find(o => o.label === e.target.value)!;
                        setForm(p => ({ ...p, duration: opt.label, durationWeeks: opt.weeks }));
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gym-accent/50"
                    >
                      {DURATION_OPTIONS.map(o => (
                        <option key={o.label} value={o.label} className="bg-[#1e293b]">{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Assigned Trainer</label>
                    <select
                      value={form.trainer}
                      onChange={e => setForm(p => ({ ...p, trainer: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gym-accent/50"
                    >
                      {TRAINERS.map(t => (
                        <option key={t} value={t} className="bg-[#1e293b]">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Status</label>
                  <div className="flex gap-2">
                    {(['Active', 'Inactive'] as ProgramStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setForm(p => ({ ...p, status: s }))}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-sm font-semibold border transition-all",
                          form.status === s
                            ? s === 'Active'
                              ? 'bg-gym-accent/10 border-gym-accent/40 text-gym-accent'
                              : 'bg-slate-700 border-slate-600 text-slate-300'
                            : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    placeholder="Brief description of this program..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2 — Exercise Browser with Range Sliders */}
            {step === 2 && (
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    <span className="text-white font-bold">{routines.length}</span> exercise{routines.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold">Intensity:</span>
                    {(['Normal', 'Hard', 'Consult Trainer'] as HintLevel[]).map(h => (
                      <span key={h} className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border', hintColor[h])}>{h}</span>
                    ))}
                  </div>
                </div>

                {/* Medical Condition Selector */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest shrink-0">Client Condition:</span>
                    {MEDICAL_CONDITIONS.map(c => (
                      <button
                        key={c}
                        onClick={() => setMedCondition(c)}
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all',
                          medCondition === c
                            ? c === 'None'
                              ? 'bg-gym-accent/15 border-gym-accent/40 text-gym-accent'
                              : 'bg-gym-rose/15 border-gym-rose/40 text-gym-rose'
                            : 'bg-white/3 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {medCondition !== 'None' && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-gym-rose/5 border border-gym-rose/15">
                      <AlertTriangle size={12} className="text-gym-rose mt-0.5 shrink-0" />
                      <p className="text-[11px] text-slate-300 leading-relaxed">{medicalAdvice[medCondition]}</p>
                    </div>
                  )}
                </div>

                {/* Exercise cards */}
                <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                  {INITIAL_ROUTINES.map(item => {
                    const isSelected = routines.some(r => r.name === item.name);
                    const range = exerciseRanges.get(item.id) ??
                      (item.type === 'reps' ? Math.round((item.minReps + item.maxReps) / 2) : Math.round((item.minTime + item.maxTime) / 2));
                    const weight = exerciseWeights.get(item.id) ?? Math.round((item.minWeight + item.maxWeight) / 2);
                    const hint = item.type === 'reps' ? getMedRepsHint(range, medCondition) : getMedTimeHint(range, medCondition);
                    return (
                      <div key={item.id} className={cn(
                        'p-3 rounded-xl border transition-all',
                        isSelected ? 'border-gym-accent/40 bg-gym-accent/5' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                      )}>
                        {/* Row: checkbox + icon + name + hint badge */}
                        <div className="flex items-center gap-2.5 mb-3">
                          <button
                            onClick={() => toggleExercise(item)}
                            className={cn(
                              'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                              isSelected ? 'bg-gym-accent border-gym-accent' : 'border-white/30 hover:border-gym-accent/60'
                            )}
                          >
                            {isSelected && <Check size={10} className="text-white" />}
                          </button>
                          <div className={cn(
                            'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                            item.type === 'reps' ? 'bg-gym-secondary/10 text-gym-secondary' : 'bg-gym-amber/10 text-gym-amber'
                          )}>
                            {item.type === 'reps' ? <Dumbbell size={11} /> : <Clock size={11} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white leading-none">{item.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.category}</p>
                          </div>
                          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0', hintColor[hint])}>
                            {hint}
                          </span>
                        </div>

                        {/* Sliders */}
                        <div className="pl-8 flex flex-col gap-2.5">
                          <SingleSlider
                            label={item.type === 'reps' ? 'Reps' : 'Time'}
                            min={item.type === 'reps' ? item.minReps : item.minTime}
                            max={item.type === 'reps' ? item.maxReps : item.maxTime}
                            value={range}
                            onChange={v => {
                              setExerciseRanges(m => new Map(m).set(item.id, v));
                              if (isSelected) {
                                setRoutines(prev => prev.map(r =>
                                  r.name === item.name
                                    ? { ...r, estimatedDuration: item.type === 'time' ? `${v} min` : `${Math.round(v * 1.5)} min` }
                                    : r
                                ));
                              }
                            }}
                            unit={item.type === 'reps' ? 'reps' : 'min'}
                            hint={hint}
                          />
                          {item.type === 'reps' && (
                            <SingleSlider
                              label="Weight"
                              min={item.minWeight} max={item.maxWeight} step={5}
                              value={weight}
                              onChange={v => setExerciseWeights(m => new Map(m).set(item.id, v))}
                              unit="kg"
                              hint={getMedWeightHint(weight, medCondition)}
                            />
                          )}
                          {/* Sets Control */}
                          <div className="flex items-center gap-2 pt-0.5 border-t border-white/5 mt-0.5">
                            <span className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest flex-1">Sets</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setExerciseSets(m => new Map(m).set(item.id, Math.max(1, (m.get(item.id) ?? 3) - 1)))}
                                className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm leading-none"
                              >−</button>
                              <span className="w-6 text-center text-xs font-bold text-white">{exerciseSets.get(item.id) ?? 3}</span>
                              <button
                                onClick={() => setExerciseSets(m => new Map(m).set(item.id, Math.min(10, (m.get(item.id) ?? 3) + 1)))}
                                className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm leading-none"
                              >+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-slate-400">Review your program before publishing.</p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">{form.name}</h4>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border", levelBadge[form.level])}>
                      {form.level}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      ['Goal', form.goal], ['Duration', form.duration],
                      ['Trainer', form.trainer], ['Status', form.status],
                      ['Routines', `${routines.length}`],
                      ['Exercises', `${routines.reduce((s, r) => s + r.exerciseCount, 0)}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-white font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                  {form.description && (
                    <p className="text-xs text-slate-400 pt-2 border-t border-white/5">{form.description}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  {routines.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-4 h-4 rounded-full bg-gym-accent/10 text-gym-accent font-bold flex items-center justify-center text-[9px]">
                        {i + 1}
                      </span>
                      <span className="font-medium text-white">{r.name}</span>
                      <span className="text-slate-500">·</span>
                      <span>{r.day} · {r.exerciseCount} exercises</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  onClick={() => setStep(p => p - 1)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(p => p + 1)}
                  disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                  className="flex-1 py-2.5 bg-gym-accent text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 bg-gradient-to-r from-gym-accent to-gym-secondary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-gym-accent/20"
                >
                  {initial ? 'Save Changes' : 'Publish Program'}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Dual Range Slider ────────────────────────────────────────────────────────
const DualRangeSlider = ({ label, min, max, step = 1, values, onChange, unit, hint }: {
  label: string; min: number; max: number; step?: number;
  values: [number, number]; onChange: (v: [number, number]) => void;
  unit: string; hint?: HintLevel;
}) => {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number" min={min} max={values[1] - step} step={step} value={values[0]}
            onChange={e => { const n = Number(e.target.value); if (!isNaN(n)) onChange([clamp(n, min, values[1] - step), values[1]]); }}
            className="w-12 text-center bg-white/5 border border-white/15 rounded-md px-1 py-0.5 text-xs font-bold text-white focus:outline-none focus:border-gym-accent/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-slate-500 text-[10px]">–</span>
          <input
            type="number" min={values[0] + step} max={max} step={step} value={values[1]}
            onChange={e => { const n = Number(e.target.value); if (!isNaN(n)) onChange([values[0], clamp(n, values[0] + step, max)]); }}
            className="w-12 text-center bg-white/5 border border-white/15 rounded-md px-1 py-0.5 text-xs font-bold text-white focus:outline-none focus:border-gym-accent/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-[10px] text-slate-400">{unit}</span>
          {hint && (
            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border', hintColor[hint])}>{hint}</span>
          )}
        </div>
      </div>
      <div className="range-slider relative h-5 flex items-center">
        <div className="absolute w-full h-1.5 bg-white/10 rounded-full pointer-events-none">
          <div
            className="absolute h-full rounded-full bg-gym-accent"
            style={{ left: `${pct(values[0])}%`, right: `${100 - pct(values[1])}%` }}
          />
        </div>
        <input type="range" min={min} max={max} step={step} value={values[0]}
          onChange={e => onChange([Math.min(Number(e.target.value), values[1] - step), values[1]])} />
        <input type="range" min={min} max={max} step={step} value={values[1]}
          onChange={e => onChange([values[0], Math.max(Number(e.target.value), values[0] + step)])} />
      </div>
    </div>
  );
};

// ─── Single Value Slider ──────────────────────────────────────────────────────
const SingleSlider = ({ label, min, max, step = 1, value, onChange, unit, hint }: {
  label: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void;
  unit: string; hint?: HintLevel;
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  const clamp = (n: number) => Math.min(Math.max(n, min), max);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-1.5">
          <input
            type="number" step={step} value={value}
            onChange={e => { const n = parseInt(e.target.value, 10); if (!isNaN(n) && n >= 0) onChange(n); }}
            className="text-center bg-white/5 border border-white/15 rounded-md px-2 py-0.5 text-xs font-bold text-white focus:outline-none focus:border-gym-accent/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ width: `${Math.max(2, String(value).length) + 2}ch` }}
          />
          <span className="text-[10px] text-slate-400">{unit}</span>
          {hint && (
            <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border', hintColor[hint])}>{hint}</span>
          )}
        </div>
      </div>
      <div className="single-slider relative h-5 flex items-center">
        <div className="absolute w-full h-1.5 bg-white/10 rounded-full pointer-events-none">
          <div className="absolute h-full rounded-full bg-gym-accent left-0" style={{ width: `${pct}%` }} />
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))} />
      </div>
      <div className="flex justify-between mt-1.5">
        <button
          onClick={() => onChange(min)}
          className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-500 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all"
        >{min}</button>
        <button
          onClick={() => onChange(max)}
          className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-500 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all"
        >{max}</button>
      </div>
    </div>
  );
};

// ─── Routine Form Modal ───────────────────────────────────────────────────────
const blankExercise = (): Omit<RoutineItem, 'id'> => ({
  name: '', category: 'Chest', type: 'reps',
  minReps: 8, maxReps: 20, minTime: 10, maxTime: 30, minWeight: 20, maxWeight: 80,
});

const RoutineFormModal = ({ initial, onClose, onSave }: {
  initial?: RoutineItem;
  onClose: () => void;
  onSave: (data: Omit<RoutineItem, 'id'>) => void;
}) => {
  const [form, setForm] = useState<Omit<RoutineItem, 'id'>>(
    initial
      ? { name: initial.name, category: initial.category, type: initial.type,
          minReps: initial.minReps, maxReps: initial.maxReps,
          minTime: initial.minTime, maxTime: initial.maxTime,
          minWeight: initial.minWeight, maxWeight: initial.maxWeight }
      : blankExercise()
  );

  const repsHint   = getRepsHint(form.maxReps);
  const timeHint   = getTimeHint(form.maxTime);
  const weightHint = getWeightHint(form.maxWeight);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="relative z-10 w-full max-w-md glass-card p-6 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{initial ? 'Edit Exercise' : 'New Exercise'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Set type, ranges and intensity hints</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Exercise Name *</label>
          <input type="text" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Bench Press, Cycling"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gym-accent/50" />
        </div>

        {/* Category + Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gym-accent/50">
              {EXERCISE_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1e293b]">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Type</label>
            <div className="flex gap-2 h-[42px]">
              {(['reps', 'time'] as ExerciseType[]).map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                  className={cn(
                    'flex-1 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5',
                    form.type === t
                      ? t === 'reps'
                        ? 'bg-gym-secondary/15 border-gym-secondary/40 text-gym-secondary'
                        : 'bg-gym-amber/15 border-gym-amber/40 text-gym-amber'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                  )}>
                  {t === 'reps' ? <Dumbbell size={12} /> : <Clock size={12} />}
                  {t === 'reps' ? 'Reps' : 'Time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Range sliders */}
        <div className="flex flex-col gap-5 p-4 rounded-xl bg-white/[0.03] border border-white/5">
          {form.type === 'reps' ? (
            <>
              <DualRangeSlider
                label="Reps Range" min={1} max={50}
                values={[form.minReps, form.maxReps]}
                onChange={([lo, hi]) => setForm(p => ({ ...p, minReps: lo, maxReps: hi }))}
                unit="reps" hint={repsHint}
              />
              <DualRangeSlider
                label="Weight Range" min={0} max={200} step={5}
                values={[form.minWeight, form.maxWeight]}
                onChange={([lo, hi]) => setForm(p => ({ ...p, minWeight: lo, maxWeight: hi }))}
                unit="kg" hint={weightHint}
              />
            </>
          ) : (
            <DualRangeSlider
              label="Time Range" min={1} max={60}
              values={[form.minTime, form.maxTime]}
              onChange={([lo, hi]) => setForm(p => ({ ...p, minTime: lo, maxTime: hi }))}
              unit="min" hint={timeHint}
            />
          )}
        </div>

        {/* Hint legend */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold mr-1">Intensity:</span>
          {(['Normal', 'Hard', 'Consult Trainer'] as HintLevel[]).map(h => (
            <span key={h} className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border', hintColor[h])}>{h}</span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
            Cancel
          </button>
          <button
            onClick={() => { if (form.name.trim()) onSave(form); }}
            disabled={!form.name.trim()}
            className="flex-1 py-2.5 bg-gym-accent text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20">
            {initial ? 'Save Changes' : 'Add Exercise'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Routines List Screen ─────────────────────────────────────────────────────
const RoutinesListScreen: React.FC = () => {
  const [routines, setRoutines] = useState<RoutineItem[]>(INITIAL_ROUTINES);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ExerciseType | 'All'>('All');
  const [filterCat, setFilterCat] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<RoutineItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<RoutineItem | null>(null);
  const [exPage, setExPage] = useState(1);
  const EX_PER_PAGE = 7;
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const nextId = useRef(INITIAL_ROUTINES.length + 1);

  const showToast = (msg: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message: msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const filtered = useMemo(() => {
    setExPage(1);
    return routines.filter(r => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType !== 'All' && r.type !== filterType) return false;
      if (filterCat !== 'All' && r.category !== filterCat) return false;
      return true;
    });
  }, [routines, search, filterType, filterCat]);
  const totalExPages = Math.ceil(filtered.length / EX_PER_PAGE);
  const paginatedExercises = filtered.slice((exPage - 1) * EX_PER_PAGE, exPage * EX_PER_PAGE);

  const stats = useMemo(() => ({
    total: routines.length,
    reps: routines.filter(r => r.type === 'reps').length,
    time: routines.filter(r => r.type === 'time').length,
    cats: new Set(routines.map(r => r.category)).size,
  }), [routines]);

  const toggle = (id: number) => setSelectedIds(p => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleAll = () => setSelectedIds(
    selectedIds.size === filtered.length ? new Set() : new Set(filtered.map(r => r.id))
  );

  const handleSave = (data: Omit<RoutineItem, 'id'>) => {
    if (editItem) {
      setRoutines(p => p.map(r => r.id === editItem.id ? { ...r, ...data } : r));
      showToast('Exercise updated!', 'success');
      setEditItem(null);
    } else {
      setRoutines(p => [...p, { ...data, id: nextId.current++ }]);
      showToast('Exercise added!', 'success');
      setCreateOpen(false);
    }
  };

  const handleDelete = (item: RoutineItem) => {
    setRoutines(p => p.filter(r => r.id !== item.id));
    setSelectedIds(p => { const n = new Set(p); n.delete(item.id); return n; });
    showToast(`"${item.name}" deleted.`, 'success');
    setDeleteItem(null);
  };

  const handleBulkDelete = () => {
    setRoutines(p => p.filter(r => !selectedIds.has(r.id)));
    showToast(`${selectedIds.size} exercise(s) deleted.`, 'success');
    setSelectedIds(new Set());
  };

  const getHint = (item: RoutineItem): HintLevel =>
    item.type === 'reps' ? getRepsHint(item.maxReps) : getTimeHint(item.maxTime);

  return (
    <div className="flex flex-col gap-2">
      {/* Stats Strip */}
      <div className="relative overflow-hidden rounded-xl border border-white/8">
        <div className="absolute inset-0 bg-gradient-to-r from-gym-secondary/8 via-gym-accent/5 to-gym-amber/8 pointer-events-none" />
        <div className="relative grid grid-cols-4 divide-x divide-white/5">
          {[
            { num: stats.total, label: 'Total Exercises', Icon: Dumbbell,  color: 'text-gym-accent'    },
            { num: stats.reps,  label: 'Reps Exercises',  Icon: BarChart2, color: 'text-gym-secondary' },
            { num: stats.time,  label: 'Time Exercises',  Icon: Clock,     color: 'text-gym-amber'     },
            { num: stats.cats,  label: 'Categories',      Icon: Activity,  color: 'text-gym-rose'      },
          ].map(({ num, label, Icon, color }) => (
            <div key={label} className="px-3 py-1.5 flex items-center gap-3 bg-white/[0.02]">
              <Icon size={14} className={color} />
              <div>
                <p className={cn('text-lg font-black tracking-tight leading-none', color)}>{num}</p>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-white/[0.03] border border-white/8 rounded-2xl">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input type="text" placeholder="Search exercises..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none" />
        </div>
        <div className="w-px h-6 bg-white/8 shrink-0" />
        {/* Type filter pills */}
        <div className="flex gap-0.5 shrink-0 bg-white/5 rounded-xl p-1">
          {(['All', 'reps', 'time'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                filterType === t ? 'bg-gym-accent text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              )}>
              {t === 'All' ? 'All' : t === 'reps' ? 'Reps' : 'Time'}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-white/8 shrink-0" />
        {/* Category filter */}
        <div className="relative shrink-0">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="bg-transparent py-2 pl-3 pr-7 text-sm text-slate-300 focus:outline-none appearance-none cursor-pointer">
            <option value="All" className="bg-[#111827]">All Categories</option>
            {EXERCISE_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#111827]">{c}</option>)}
          </select>
          <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        <div className="w-px h-6 bg-white/8 shrink-0" />
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white whitespace-nowrap transition-all hover:opacity-90 active:scale-[0.97] shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #10B981 100%)' }}>
          <Plus size={15} strokeWidth={3} /> Add Exercise
        </button>
      </div>

      {/* Bulk delete bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
            style={{ background: 'rgba(244,63,94,0.06)', borderColor: 'rgba(244,63,94,0.2)' }}>
            <span className="text-xs font-black text-gym-rose uppercase tracking-widest">{selectedIds.size} selected</span>
            <div className="w-px h-4 bg-white/10" />
            <button onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs font-semibold text-gym-rose hover:text-gym-rose/70 transition-colors">
              <Trash2 size={12} /> Delete Selected
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-slate-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count + select-all */}
      <div className="flex items-center justify-between -mb-1">
        <p className="text-[10px] text-slate-600 font-medium">
          <span className="text-slate-300 font-bold">{filtered.length}</span> exercises found
        </p>
        {filtered.length > 0 && (
          <button onClick={toggleAll} className="text-[10px] text-slate-600 hover:text-gym-accent transition-colors font-medium">
            {selectedIds.size === filtered.length ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>

      {/* Table */}
      <GlassCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="py-2 px-3 text-left">
                <button onClick={toggleAll} className="text-slate-500 hover:text-gym-accent transition-colors">
                  {selectedIds.size === filtered.length && filtered.length > 0
                    ? <CheckSquare size={14} className="text-gym-accent" /> : <Square size={14} />}
                </button>
              </th>
              {['Exercise', 'Category', 'Type', 'Range', 'Intensity', 'Weight Range', ''].map(h => (
                <th key={h} className="py-2 px-3 text-left text-[9px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                  <Dumbbell size={32} className="mx-auto mb-2 opacity-20" />
                  No exercises found.
                </td>
              </tr>
            ) : paginatedExercises.map(item => {
              const hint = getHint(item);
              return (
                <tr key={item.id}
                  className={cn(
                    'border-b border-white/5 transition-all duration-150 hover:bg-white/[0.04]',
                    selectedIds.has(item.id) && 'bg-gym-secondary/5'
                  )}>
                  {/* Select */}
                  <td className="py-1.5 px-3">
                    <button onClick={() => toggle(item.id)} className="text-slate-500 hover:text-gym-accent transition-colors">
                      {selectedIds.has(item.id) ? <CheckSquare size={16} className="text-gym-accent" /> : <Square size={16} />}
                    </button>
                  </td>
                  {/* Name */}
                  <td className="py-1.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                        item.type === 'reps' ? 'bg-gym-secondary/10 text-gym-secondary' : 'bg-gym-amber/10 text-gym-amber'
                      )}>
                        {item.type === 'reps' ? <Dumbbell size={11} /> : <Clock size={11} />}
                      </div>
                      <span className="font-semibold text-white text-xs">{item.name}</span>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="py-1.5 px-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-slate-300 font-medium">
                      {item.category}
                    </span>
                  </td>
                  {/* Type */}
                  <td className="py-1.5 px-3">
                    <span className={cn(
                      'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border flex items-center gap-1 w-fit',
                      item.type === 'reps'
                        ? 'text-gym-secondary bg-gym-secondary/10 border-gym-secondary/20'
                        : 'text-gym-amber bg-gym-amber/10 border-gym-amber/20'
                    )}>
                      {item.type === 'reps' ? <><Dumbbell size={8} /> Reps</> : <><Clock size={8} /> Time</>}
                    </span>
                  </td>
                  {/* Range */}
                  <td className="py-1.5 px-3">
                    <span className="text-xs font-bold text-white">
                      {item.type === 'reps' ? `${item.minReps}–${item.maxReps}` : `${item.minTime}–${item.maxTime}`}
                    </span>
                    <span className="text-[9px] text-slate-500 ml-1">{item.type === 'reps' ? 'reps' : 'min'}</span>
                  </td>
                  {/* Intensity hint */}
                  <td className="py-1.5 px-3">
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap', hintColor[hint])}>
                      {hint}
                    </span>
                  </td>
                  {/* Weight Range */}
                  <td className="py-1.5 px-3">
                    {item.type === 'reps' ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">{item.minWeight}–{item.maxWeight}</span>
                        <span className="text-[9px] text-slate-500">kg</span>
                        <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded border', hintColor[getWeightHint(item.maxWeight)])}>
                          {getWeightHint(item.maxWeight)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="py-1.5 px-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditItem(item)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-gym-accent/10 border border-gym-accent/20 text-gym-accent text-[10px] font-bold hover:bg-gym-accent/20 hover:border-gym-accent/40 active:scale-95 transition-all whitespace-nowrap">
                        <Edit3 size={10} strokeWidth={2.5} /> Edit
                      </button>
                      <button onClick={() => setDeleteItem(item)} title="Delete"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-gym-rose hover:bg-gym-rose/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>

      {/* Pagination */}
      {totalExPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Showing {(exPage - 1) * EX_PER_PAGE + 1}–{Math.min(exPage * EX_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setExPage(1)} disabled={exPage === 1}
              className="px-2 py-1 rounded-md text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all">First</button>
            <button onClick={() => setExPage(p => Math.max(1, p - 1))} disabled={exPage === 1}
              className="px-2 py-1 rounded-md text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all">
              <ChevronLeft size={12} />
            </button>
            {Array.from({ length: totalExPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setExPage(p)}
                className={cn("w-7 h-7 rounded-md text-xs font-bold transition-all",
                  p === exPage ? 'bg-gym-accent/20 text-gym-accent border border-gym-accent/30' : 'text-slate-400 hover:text-white hover:bg-white/10')}>
                {p}
              </button>
            ))}
            <button onClick={() => setExPage(p => Math.min(totalExPages, p + 1))} disabled={exPage === totalExPages}
              className="px-2 py-1 rounded-md text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all">
              <ChevronRight size={12} />
            </button>
            <button onClick={() => setExPage(totalExPages)} disabled={exPage === totalExPages}
              className="px-2 py-1 rounded-md text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all">Last</button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(createOpen || editItem) && (
          <RoutineFormModal
            initial={editItem ?? undefined}
            onClose={() => { setCreateOpen(false); setEditItem(null); }}
            onSave={handleSave}
          />
        )}
        {deleteItem && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteItem(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 glass-card p-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gym-rose/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={20} className="text-gym-rose" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Exercise</h3>
                  <p className="text-sm text-slate-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-slate-300 mb-6">
                Delete <span className="font-bold text-white">"{deleteItem.name}"</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteItem(null)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteItem)}
                  className="flex-1 py-2.5 bg-gym-rose text-white rounded-xl text-sm font-bold hover:bg-gym-rose/80 transition-all shadow-lg shadow-gym-rose/20">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const WorkoutProgramsManagement: React.FC<{ onNavigateToMembers?: () => void; onNavigateToNutrition?: () => void }> = ({ onNavigateToMembers, onNavigateToNutrition }) => {
  const [programs, setPrograms] = useState<MgmtProgram[]>(INITIAL_PROGRAMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<Level | 'All'>('All');
  const [filterGoal, setFilterGoal] = useState<Goal | 'All'>('All');
  const [filterTrainer, setFilterTrainer] = useState('All');
  const [filterStatus, setFilterStatus] = useState<ProgramStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<MgmtProgram | null>(null);
  const [deleteProgram, setDeleteProgram] = useState<MgmtProgram | null>(null);
  const [assignProgram, setAssignProgram] = useState<MgmtProgram | null>(null);
  const [viewProgram, setViewProgram] = useState<MgmtProgram | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [mainTab, setMainTab] = useState<'programs' | 'routines'>('programs');
  const nextId = useRef(INITIAL_PROGRAMS.length + 1);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };

  // Filtered & sorted programs
  const filtered = useMemo(() => {
    let list = programs.filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterLevel !== 'All' && p.level !== filterLevel) return false;
      if (filterGoal !== 'All' && p.goal !== filterGoal) return false;
      if (filterTrainer !== 'All' && p.trainer !== filterTrainer) return false;
      if (filterStatus !== 'All' && p.status !== filterStatus) return false;
      return true;
    });
    if (sortBy === 'newest') list = [...list].sort((a, b) => b.createdDate.localeCompare(a.createdDate));
    if (sortBy === 'most-assigned') list = [...list].sort((a, b) => b.enrolledClients - a.enrolledClients);
    if (sortBy === 'duration') list = [...list].sort((a, b) => a.durationWeeks - b.durationWeeks);
    return list;
  }, [programs, searchQuery, filterLevel, filterGoal, filterTrainer, filterStatus, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: programs.length,
    active: programs.filter(p => p.status === 'Active').length,
    enrolled: programs.reduce((s, p) => s + p.enrolledClients, 0),
    avgCompletion: Math.round(programs.reduce((s, p) => s + p.completionRate, 0) / (programs.length || 1)),
  }), [programs]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(p => p.id)));
  };

  const handleSaveProgram = (data: Omit<MgmtProgram, 'id' | 'isTrending' | 'isPopular' | 'completionRate'>) => {
    if (editProgram) {
      setPrograms(p => p.map(x => x.id === editProgram.id ? { ...x, ...data } : x));
      showToast('Program updated successfully!', 'success');
      setEditProgram(null);
    } else {
      const newProg: MgmtProgram = {
        ...data, id: nextId.current++,
        isTrending: false, isPopular: false, completionRate: 0,
      };
      setPrograms(p => [newProg, ...p]);
      showToast('Program created and published!', 'success');
      setCreateOpen(false);
    }
  };

  const handleDelete = () => {
    if (!deleteProgram) return;
    setPrograms(p => p.filter(x => x.id !== deleteProgram.id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteProgram.id); return n; });
    showToast(`"${deleteProgram.name}" deleted.`, 'success');
    setDeleteProgram(null);
  };

  const handleDuplicate = (program: MgmtProgram) => {
    const copy: MgmtProgram = {
      ...program,
      id: nextId.current++,
      name: `${program.name} (Copy)`,
      enrolledClients: 0,
      createdDate: new Date().toISOString().slice(0, 10),
      isTrending: false,
      isPopular: false,
      status: 'Inactive',
      completionRate: 0,
      routines: program.routines.map(r => ({ ...r, id: Date.now() + r.id })),
    };
    setPrograms(p => [copy, ...p]);
    showToast(`"${program.name}" duplicated!`, 'success');
  };

  const handleBulkDelete = () => {
    setPrograms(p => p.filter(x => !selectedIds.has(x.id)));
    showToast(`${selectedIds.size} program(s) deleted.`, 'success');
    setSelectedIds(new Set());
  };

  const handleAssign = (_clients: string[]) => {
    showToast(`Program assigned to ${_clients.length} client(s)!`, 'success');
  };


  return (
    <motion.div
      key="programs-mgmt"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-2"
    >
      {/* ── Tab Switcher ─────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-2xl w-fit">
        {(['programs', 'routines'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all',
              mainTab === tab
                ? 'bg-gym-accent text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/8'
            )}
          >
            {tab === 'programs' ? <LayoutGrid size={14} /> : <Dumbbell size={14} />}
            {tab === 'programs' ? 'Programs' : 'Exercises'}
          </button>
        ))}
      </div>

      {mainTab === 'programs' && (<>
      {/* ── Stats Strip ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8">
        {/* Ambient glow background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gym-accent/8 via-gym-secondary/5 to-gym-amber/8 pointer-events-none" />
        <div className="relative grid grid-cols-2 lg:grid-cols-4 divide-y divide-x divide-white/5 lg:divide-y-0">
          {[
            { num: stats.total,              label: 'Total Programs',   sub: 'All active & inactive', Icon: Dumbbell,   color: 'text-gym-accent'    },
            { num: stats.active,             label: 'Active',           sub: '+8% this month',        Icon: TrendingUp, color: 'text-gym-secondary' },
            { num: stats.enrolled,           label: 'Enrolled Clients', sub: '+12% growth',           Icon: Users,      color: 'text-gym-amber'     },
            { num: `${stats.avgCompletion}%`,label: 'Avg Completion',   sub: 'Across all programs',   Icon: BarChart2,  color: 'text-gym-accent'    },
          ].map(({ num, label, sub, Icon, color }) => (
            <div key={label} className="px-3 py-1.5 flex flex-col bg-white/[0.02]">
              <div className="flex items-center gap-1.5">
                <Icon size={11} className={color} />
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
              </div>
              <p className={cn("text-xl font-black tracking-tight", color)}>{num}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Command Toolbar ──────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {/* Main bar */}
        <div className="flex items-center gap-2 p-2 bg-white/[0.03] border border-white/8 rounded-2xl">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
            <input
              type="text"
              placeholder="Search programs by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/8 shrink-0" />

          {/* Sort */}
          <div className="relative shrink-0">
            <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="bg-transparent pl-7 pr-2 py-2 text-sm text-slate-300 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="newest" className="bg-[#111827]">Newest</option>
              <option value="most-assigned" className="bg-[#111827]">Most Assigned</option>
              <option value="duration" className="bg-[#111827]">Duration</option>
            </select>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/8 shrink-0" />

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(p => !p)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all shrink-0",
              showFilters
                ? "bg-gym-accent/15 text-gym-accent"
                : "text-slate-400 hover:text-white hover:bg-white/8"
            )}
          >
            <Filter size={13} />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* View toggle */}
          <div className="flex gap-0.5 shrink-0 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('card')}
              className={cn("p-1.5 rounded-lg transition-all", viewMode === 'card' ? "bg-gym-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-300")}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn("p-1.5 rounded-lg transition-all", viewMode === 'table' ? "bg-gym-accent text-white shadow-sm" : "text-slate-500 hover:text-slate-300")}
            >
              <List size={14} />
            </button>
          </div>

          {/* Members button */}
          {onNavigateToMembers && (
            <>
              <div className="w-px h-6 bg-white/8 shrink-0" />
              <button
                onClick={onNavigateToMembers}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gym-amber/30 bg-gym-amber/10 text-gym-amber hover:bg-gym-amber/20 transition-all whitespace-nowrap shrink-0"
              >
                <Users size={14} />
                Members
                <ChevronRight size={13} />
              </button>
            </>
          )}

          {/* Nutrition button */}
          {onNavigateToNutrition && (
            <>
              <div className="w-px h-6 bg-white/8 shrink-0" />
              <button
                onClick={onNavigateToNutrition}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-gym-accent/30 bg-gym-accent/10 text-gym-accent hover:bg-gym-accent/20 transition-all whitespace-nowrap shrink-0"
              >
                <Apple size={14} />
                Nutrition
                <ChevronRight size={13} />
              </button>
            </>
          )}

          {/* Create button */}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white whitespace-nowrap transition-all hover:opacity-90 active:scale-[0.97] shrink-0"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #6366F1 100%)' }}
          >
            <Plus size={15} strokeWidth={3} /> Create Program
          </button>
        </div>

        {/* Filters drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 flex-wrap p-3 bg-white/[0.02] border border-white/8 rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 self-center mr-1">Filter by</span>
                {[
                  { label: 'Level',   value: filterLevel,   onChange: (v: string) => setFilterLevel(v as Level | 'All'),         options: ['All', 'Beginner', 'Intermediate', 'Advanced'] },
                  { label: 'Goal',    value: filterGoal,    onChange: (v: string) => setFilterGoal(v as Goal | 'All'),           options: ['All', 'Weight Loss', 'Muscle Gain', 'Cardio', 'Strength'] },
                  { label: 'Trainer', value: filterTrainer, onChange: (v: string) => setFilterTrainer(v),                       options: ['All', ...TRAINERS] },
                  { label: 'Status',  value: filterStatus,  onChange: (v: string) => setFilterStatus(v as ProgramStatus | 'All'), options: ['All', 'Active', 'Inactive'] },
                ].map(({ label, value, onChange, options }) => (
                  <div key={label} className="relative">
                    <select
                      value={value}
                      onChange={e => onChange(e.target.value)}
                      className={cn(
                        "bg-white/5 border rounded-lg py-1.5 pl-3 pr-7 text-xs font-semibold focus:outline-none appearance-none cursor-pointer transition-all",
                        value !== 'All'
                          ? "border-gym-accent/40 text-gym-accent bg-gym-accent/5"
                          : "border-white/10 text-slate-400 hover:border-white/20"
                      )}
                    >
                      {options.map(o => (
                        <option key={o} value={o} className="bg-[#111827] text-white">{o === 'All' ? `All ${label}s` : o}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                ))}
                <button
                  onClick={() => { setFilterLevel('All'); setFilterGoal('All'); setFilterTrainer('All'); setFilterStatus('All'); }}
                  className="text-xs text-slate-500 hover:text-gym-rose transition-colors ml-auto"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bulk Action Bar ──────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
            style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}
          >
            <span className="text-xs font-black text-gym-accent uppercase tracking-widest">{selectedIds.size} selected</span>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs font-semibold text-gym-rose hover:text-gym-rose/70 transition-colors"
            >
              <Trash2 size={12} /> Delete Selected
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-slate-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-600 font-medium">
          <span className="text-slate-300 font-bold">{filtered.length}</span> program{filtered.length !== 1 ? 's' : ''} found
        </p>
        {filtered.length > 0 && (
          <button onClick={toggleSelectAll} className="text-xs text-slate-600 hover:text-gym-accent transition-colors font-medium">
            {selectedIds.size === filtered.length ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>

      {/* Content: Card or Table View */}
      {viewMode === 'card' ? (
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-slate-500"
            >
              <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No programs match your filters.</p>
              <button onClick={() => { setSearchQuery(''); setFilterLevel('All'); setFilterGoal('All'); setFilterTrainer('All'); setFilterStatus('All'); }} className="mt-2 text-sm text-gym-accent hover:underline">
                Clear filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(p => (
                <React.Fragment key={p.id}>
                  <ProgramCard
                    program={p}
                    selected={!!selectedIds.has(p.id)}
                    onSelect={() => toggleSelect(p.id)}
                    onView={() => setViewProgram(p)}
                    onEdit={() => setEditProgram(p)}
                    onDelete={() => setDeleteProgram(p)}
                    onDuplicate={() => handleDuplicate(p)}
                    onAssign={() => setAssignProgram(p)}
                  />
                </React.Fragment>
              ))}
            </div>
          )}
        </AnimatePresence>
      ) : (
        <GlassCard className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-3 px-4 text-left">
                  <button onClick={toggleSelectAll} className="text-slate-500 hover:text-gym-accent transition-colors">
                    {selectedIds.size === filtered.length && filtered.length > 0
                      ? <CheckSquare size={16} className="text-gym-accent" />
                      : <Square size={16} />}
                  </button>
                </th>
                {['Program', 'Level', 'Goal', 'Duration', 'Routines', 'Trainer', 'Status', 'Clients', 'Created', ''].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500 text-sm">
                      No programs match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <React.Fragment key={p.id}>
                      <ProgramTableRow
                        program={p}
                        selected={!!selectedIds.has(p.id)}
                        onSelect={() => toggleSelect(p.id)}
                        onView={() => setViewProgram(p)}
                        onEdit={() => setEditProgram(p)}
                        onDelete={() => setDeleteProgram(p)}
                        onDuplicate={() => handleDuplicate(p)}
                        onAssign={() => setAssignProgram(p)}
                      />
                    </React.Fragment>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </GlassCard>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(createOpen || editProgram) && (
          <CreateProgramModal
            initial={editProgram ?? undefined}
            onClose={() => { setCreateOpen(false); setEditProgram(null); }}
            onSave={handleSaveProgram}
          />
        )}
        {deleteProgram && (
          <DeleteModal
            program={deleteProgram}
            onConfirm={handleDelete}
            onCancel={() => setDeleteProgram(null)}
          />
        )}
        {assignProgram && (
          <AssignModal
            program={assignProgram}
            onClose={() => setAssignProgram(null)}
            onAssign={handleAssign}
          />
        )}
        {viewProgram && (
          <ViewDetailsPanel
            program={viewProgram}
            onClose={() => setViewProgram(null)}
            onEdit={() => { setEditProgram(viewProgram); setViewProgram(null); }}
          />
        )}
      </AnimatePresence>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
      </>)}

      {mainTab === 'routines' && <RoutinesListScreen />}
    </motion.div>
  );
};

export default WorkoutProgramsManagement;
