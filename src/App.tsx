import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Package, 
  UserCheck, 
  TrendingUp, 
  Calendar,
  Bell,
  Search,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Plus,
  User,
  Mail,
  Crown,
  CalendarDays,
  Target,
  Sparkles,
  Clock,
  Ruler,
  Weight,
  Crosshair,
  ArrowLeft,
  Utensils,
  Pill,
  Activity,
  AlertTriangle,
  MessageSquare,
  CreditCard,
  Star,
  Briefcase,
  AlertCircle,
  MapPin,
  Dumbbell,
  CalendarCheck,
  CalendarX2,
  Receipt,
  Sun,
  Moon,
  ChevronDown,
  Apple,
  Leaf,
  Flame,
  Droplets,
  Wheat,
  Search as SearchIcon,
  Lightbulb,
  ThumbsUp,
  Wrench,
  ShieldCheck,
  Megaphone,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { StatTile, GlassCard } from '@/src/components/DashboardElements';
import { WorkoutProgramsManagement } from '@/src/components/WorkoutProgramsManagement';
import NutritionPlansManagement from '@/src/components/NutritionPlansManagement';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DashboardStats, Member, RevenuePulse, MemberProfile, StaffData, InventoryData, RevenueData, ScheduleData, ProgramsData } from '@/src/types';

const REVENUE_COLORS = ['#10B981', '#F59E0B', '#6366F1', '#F43F5E'];

// ─── Program Assignment ──────────────────────────────────────────────────────
interface AssignedProgram {
  id: number;
  programName: string;
  level: string;
  durationDays: number;
  startDate: string;
  endDate: string;
}
const AVAILABLE_PROGRAMS = [
  { id: 1, name: 'Beginner Power Start', level: 'Beginner' },
  { id: 2, name: 'Cardio Rush', level: 'Beginner' },
  { id: 3, name: 'Lean & Tone', level: 'Intermediate' },
  { id: 4, name: 'Muscle Surge 12', level: 'Intermediate' },
  { id: 5, name: 'Alpha Shred Protocol', level: 'Advanced' },
  { id: 6, name: 'Elite Powerlifting', level: 'Advanced' },
];
const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const programStatus = (start: string, end: string): 'completed' | 'active' | 'upcoming' => {
  const today = new Date().toISOString().slice(0, 10);
  if (today > end) return 'completed';
  if (today >= start) return 'active';
  return 'upcoming';
};
const programStatusStyle: Record<string, string> = {
  completed: 'text-slate-400 bg-white/5 border-white/10',
  active: 'text-gym-accent bg-gym-accent/10 border-gym-accent/20',
  upcoming: 'text-gym-amber bg-gym-amber/10 border-gym-amber/20',
};

interface DayExercise { id: number; name: string; sets: number; reps: number; unit: string; }
interface DayRoutine { morning: DayExercise[]; evening: DayExercise[]; }

const PROGRAM_DEFAULTS: Record<string, DayExercise[]> = {
  'Beginner Power Start': [
    { id: 1, name: 'Squats', sets: 3, reps: 12, unit: 'reps' },
    { id: 2, name: 'Push-Ups', sets: 3, reps: 10, unit: 'reps' },
    { id: 3, name: 'Plank Hold', sets: 3, reps: 30, unit: 'sec' },
    { id: 4, name: 'Lunges', sets: 3, reps: 10, unit: 'reps' },
  ],
  'Cardio Rush': [
    { id: 1, name: 'Treadmill Run', sets: 1, reps: 20, unit: 'min' },
    { id: 2, name: 'Cycling', sets: 1, reps: 15, unit: 'min' },
    { id: 3, name: 'Jump Rope', sets: 3, reps: 5, unit: 'min' },
  ],
  'Lean & Tone': [
    { id: 1, name: 'Dumbbell Press', sets: 3, reps: 15, unit: 'reps' },
    { id: 2, name: 'Cable Rows', sets: 3, reps: 12, unit: 'reps' },
    { id: 3, name: 'Step-Ups', sets: 3, reps: 12, unit: 'reps' },
    { id: 4, name: 'Bicycle Crunches', sets: 3, reps: 20, unit: 'reps' },
  ],
  'Muscle Surge 12': [
    { id: 1, name: 'Bench Press', sets: 4, reps: 10, unit: 'reps' },
    { id: 2, name: 'Deadlift', sets: 4, reps: 8, unit: 'reps' },
    { id: 3, name: 'Barbell Rows', sets: 4, reps: 10, unit: 'reps' },
    { id: 4, name: 'Overhead Press', sets: 3, reps: 10, unit: 'reps' },
  ],
  'Alpha Shred Protocol': [
    { id: 1, name: 'Burpees', sets: 4, reps: 15, unit: 'reps' },
    { id: 2, name: 'Box Jumps', sets: 4, reps: 12, unit: 'reps' },
    { id: 3, name: 'Battle Ropes', sets: 3, reps: 1, unit: 'min' },
    { id: 4, name: 'Mountain Climbers', sets: 3, reps: 20, unit: 'reps' },
  ],
  'Elite Powerlifting': [
    { id: 1, name: 'Back Squat', sets: 5, reps: 5, unit: 'reps' },
    { id: 2, name: 'Bench Press', sets: 5, reps: 5, unit: 'reps' },
    { id: 3, name: 'Deadlift', sets: 5, reps: 3, unit: 'reps' },
    { id: 4, name: 'Barbell Rows', sets: 4, reps: 6, unit: 'reps' },
  ],
};

const PROG_CAL_COLORS = [
  { bg: 'bg-gym-accent/15', dot: 'bg-gym-accent', text: 'text-gym-accent', border: 'border-gym-accent/30', hover: 'hover:bg-gym-accent/25' },
  { bg: 'bg-gym-secondary/15', dot: 'bg-gym-secondary', text: 'text-gym-secondary', border: 'border-gym-secondary/30', hover: 'hover:bg-gym-secondary/25' },
  { bg: 'bg-gym-amber/15', dot: 'bg-gym-amber', text: 'text-gym-amber', border: 'border-gym-amber/30', hover: 'hover:bg-gym-amber/25' },
  { bg: 'bg-gym-rose/15', dot: 'bg-gym-rose', text: 'text-gym-rose', border: 'border-gym-rose/30', hover: 'hover:bg-gym-rose/25' },
];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

interface BalanceEntry {
  id: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
}

const INCOME_CATEGORIES = ['Membership Fees', 'Personal Training', 'Supplement Sales', 'Locker Rental', 'Event Hosting', 'Other Income'];
const EXPENSE_CATEGORIES = ['Staff Salaries', 'Rent', 'Electricity', 'Water Bill', 'Equipment Maintenance', 'Cleaning Supplies', 'Marketing', 'Insurance', 'Internet & Software', 'Supplements Purchase', 'Miscellaneous'];

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-gym-accent/10 text-gym-accent border border-gym-accent/20" 
        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
    )}
  >
    <Icon size={20} className={cn(active ? "text-gym-accent" : "group-hover:text-slate-200")} />
    <span className="font-medium">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-gym-accent rounded-full" />}
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [revenuePulse, setRevenuePulse] = useState<RevenuePulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
  const [inventoryFilter, setInventoryFilter] = useState('All');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [compareMode, setCompareMode] = useState<'month' | 'year'>('month');
  const [comparePeriodA, setComparePeriodA] = useState('');
  const [comparePeriodB, setComparePeriodB] = useState('');
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [scheduleDay, setScheduleDay] = useState(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  });
  const [programsData, setProgramsData] = useState<ProgramsData | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);
  const [exerciseValues, setExerciseValues] = useState<Record<number, { min: number; max: number }>>({});
  const [memberPrograms, setMemberPrograms] = useState<Map<number, AssignedProgram[]>>(new Map());
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ programId: 1, days: 20 });
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayWorkouts, setDayWorkouts] = useState<Map<string, DayRoutine>>(new Map());
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<'morning' | 'evening'>('morning');
  const [balanceEntries, setBalanceEntries] = useState<BalanceEntry[]>([
    { id: 1, date: '2026-03-01', type: 'income', category: 'Membership Fees', description: 'Monthly memberships (42 members)', amount: 126000 },
    { id: 2, date: '2026-03-01', type: 'income', category: 'Personal Training', description: 'PT sessions (15 clients)', amount: 45000 },
    { id: 3, date: '2026-03-01', type: 'expense', category: 'Staff Salaries', description: 'Trainers + reception (5 staff)', amount: 85000 },
    { id: 4, date: '2026-03-01', type: 'expense', category: 'Rent', description: 'Monthly gym rent', amount: 35000 },
    { id: 5, date: '2026-03-02', type: 'expense', category: 'Electricity', description: 'Electricity bill March', amount: 12000 },
    { id: 6, date: '2026-03-03', type: 'income', category: 'Supplement Sales', description: 'Whey + BCAA sales', amount: 8500 },
    { id: 7, date: '2026-03-03', type: 'expense', category: 'Supplements Purchase', description: 'Restock supplements', amount: 5200 },
    { id: 8, date: '2026-03-04', type: 'expense', category: 'Equipment Maintenance', description: 'Treadmill belt replacement', amount: 3500 },
    { id: 9, date: '2026-03-05', type: 'income', category: 'Locker Rental', description: 'Locker rentals (8 members)', amount: 2400 },
    { id: 10, date: '2026-03-05', type: 'expense', category: 'Water Bill', description: 'Water bill March', amount: 2800 },
    { id: 11, date: '2026-03-06', type: 'expense', category: 'Cleaning Supplies', description: 'Sanitizer + mops + towels', amount: 1800 },
    { id: 12, date: '2026-03-07', type: 'income', category: 'Other Income', description: 'Gym photoshoot rental', amount: 5000 },
    { id: 13, date: '2026-03-07', type: 'expense', category: 'Marketing', description: 'Instagram ads + flyers', amount: 4000 },
    { id: 14, date: '2026-03-08', type: 'expense', category: 'Internet & Software', description: 'Wifi + management software', amount: 2500 },
    { id: 15, date: '2026-03-09', type: 'income', category: 'Membership Fees', description: 'New sign-ups (3 members)', amount: 9000 },
  ]);
  const [bsForm, setBsForm] = useState({ type: 'income' as 'income' | 'expense', category: 'Membership Fees', description: '', amount: '', date: new Date().toISOString().slice(0, 10) });
  const [bsFormOpen, setBsFormOpen] = useState(false);
  const [bsFilter, setBsFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    membership_type: 'Standard',
    expiry_date: '',
    goal: '',
    age: '',
    height: '',
    weight: '',
    body_target: '',
    timing: ''
  });

  const fetchData = async () => {
    try {
      const [statsRes, membersRes, pulseRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/members'),
        fetch('/api/revenue/pulse')
      ]);
      
      setStats(await statsRes.json());
      setMembers(await membersRes.json());
      setRevenuePulse(await pulseRes.json());
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        setIsSidebarOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'staff' && !staffData) {
      fetch('/api/staff').then(r => r.json()).then(setStaffData).catch(console.error);
    }
    if (activeTab === 'inventory' && !inventoryData) {
      fetch('/api/inventory').then(r => r.json()).then(setInventoryData).catch(console.error);
    }
    if (activeTab === 'revenue' && !revenueData) {
      fetch('/api/revenue/details').then(r => r.json()).then(setRevenueData).catch(console.error);
    }
    if (activeTab === 'schedule' && !scheduleData) {
      fetch('/api/schedule').then(r => r.json()).then(setScheduleData).catch(console.error);
    }
    if (activeTab === 'programs' && !programsData) {
      fetch('/api/programs').then(r => r.json()).then(setProgramsData).catch(console.error);
    }
  }, [activeTab]);

  useEffect(() => {
    if (expandedProgram && programsData) {
      const program = programsData.programs.find(p => p.id === expandedProgram);
      if (program) {
        const vals: Record<number, { min: number; max: number }> = {};
        program.exercises.forEach(ex => {
          vals[ex.id] = { min: ex.min_value, max: ex.max_value };
        });
        setExerciseValues(vals);
      }
    }
  }, [expandedProgram, programsData]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewMember({ name: '', email: '', membership_type: 'Standard', expiry_date: '', goal: '', age: '', height: '', weight: '', body_target: '', timing: '' });
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error("Failed to add member", error);
    }
  };

  const fetchMemberProfile = async (memberId: number) => {
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/members/${memberId}/profile`);
      const data = await res.json();
      setMemberProfile(data);
    } catch (error) {
      console.error("Failed to fetch member profile", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleBackToMembers = () => {
    setSelectedMemberId(null);
    setMemberProfile(null);
  };

  const handleRenewMembership = () => {
    if (!memberProfile || !selectedMemberId) return;
    const current = new Date(memberProfile.member.expiry_date);
    current.setMonth(current.getMonth() + 3);
    const newExpiry = current.toISOString().slice(0, 10);
    setMemberProfile(prev => prev ? { ...prev, member: { ...prev.member, expiry_date: newExpiry, status: 'active' as const } } : prev);
    setMembers(prev => prev.map(m => m.id === selectedMemberId ? { ...m, expiry_date: newExpiry, status: 'active' as const } : m));
  };

  const handleAssignProgram = () => {
    if (!selectedMemberId) return;
    const prog = AVAILABLE_PROGRAMS.find(p => p.id === assignForm.programId);
    if (!prog) return;
    setMemberPrograms((prev: Map<number, AssignedProgram[]>) => {
      const next = new Map(prev);
      const existing: AssignedProgram[] = next.get(selectedMemberId) ?? [];
      const lastEnd = existing.length > 0 ? existing[existing.length - 1].endDate : '';
      const startDate = lastEnd ? addDays(lastEnd, 1) : new Date().toISOString().slice(0, 10);
      const endDate = addDays(startDate, assignForm.days - 1);
      next.set(selectedMemberId, [...existing, {
        id: Date.now(), programName: prog.name, level: prog.level,
        durationDays: assignForm.days, startDate, endDate,
      }]);
      return next;
    });
    setAssignForm({ programId: 1, days: 20 });
    setAssignOpen(false);
  };

  const handleRemoveProgram = (memberId: number, progId: number) => {
    setMemberPrograms((prev: Map<number, AssignedProgram[]>) => {
      const next = new Map(prev);
      const list: AssignedProgram[] = (next.get(memberId) ?? []).filter((p: AssignedProgram) => p.id !== progId);
      let cursor = list.length > 0 ? list[0].startDate : new Date().toISOString().slice(0, 10);
      const fixed = list.map((p: AssignedProgram, i: number) => {
        const start = i === 0 ? p.startDate : cursor;
        const end = addDays(start, p.durationDays - 1);
        cursor = addDays(end, 1);
        return { ...p, startDate: start, endDate: end };
      });
      next.set(memberId, fixed);
      return next;
    });
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-gym-bg">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-gym-accent border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="flex h-screen bg-gym-bg overflow-hidden relative">
      {/* Sidebar / Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-64 border-r border-white/5 p-6 flex flex-col gap-8 bg-gym-bg/95 backdrop-blur-xl z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gym-accent rounded-xl flex items-center justify-center shadow-lg shadow-gym-accent/20">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">COMMAND</h1>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSelectedMemberId(null); setMemberProfile(null); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Users} label="Members" active={activeTab === 'members'} onClick={() => { setActiveTab('members'); setSelectedMemberId(null); setMemberProfile(null); setIsSidebarOpen(false); }} />
              <SidebarItem icon={DollarSign} label="Revenue" active={activeTab === 'revenue'} onClick={() => { setActiveTab('revenue'); setSelectedMemberId(null); setMemberProfile(null); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Package} label="Inventory" active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); setSelectedMemberId(null); setMemberProfile(null); setIsSidebarOpen(false); }} />
              <SidebarItem icon={UserCheck} label="Staff" active={activeTab === 'staff'} onClick={() => { setActiveTab('staff'); setSelectedMemberId(null); setMemberProfile(null); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Calendar} label="Schedule" active={activeTab === 'schedule'} onClick={() => { setActiveTab('schedule'); setSelectedMemberId(null); setMemberProfile(null); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Dumbbell} label="Programs" active={activeTab === 'programs'} onClick={() => { setActiveTab('programs'); setSelectedMemberId(null); setMemberProfile(null); setExpandedProgram(null); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Apple} label="Nutrition" active={activeTab === 'nutrition'} onClick={() => { setActiveTab('nutrition'); setSelectedMemberId(null); setMemberProfile(null); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Lightbulb} label="Improvements" active={activeTab === 'improvements'} onClick={() => { setActiveTab('improvements'); setSelectedMemberId(null); setMemberProfile(null); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Wallet} label="Balance Sheet" active={activeTab === 'balancesheet'} onClick={() => { setActiveTab('balancesheet'); setSelectedMemberId(null); setMemberProfile(null); setIsSidebarOpen(false); }} />
            </nav>

            <div className="mt-auto flex flex-col gap-2">
              <SidebarItem icon={Settings} label="Settings" />
              <SidebarItem icon={LogOut} label="Logout" />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gym-accent/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gym-secondary/5 blur-[100px] rounded-full -z-10" />

        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all hover:bg-white/10"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className="text-slate-400 mt-1">Welcome back, Commander. Here's your gym's pulse.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 w-64 focus:outline-none focus:border-gym-accent/50 transition-all"
              />
            </div>
            <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-gym-rose rounded-full border-2 border-gym-bg" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gym-accent to-gym-secondary p-[1px]">
              <div className="w-full h-full rounded-[11px] bg-gym-bg flex items-center justify-center overflow-hidden">
                <img src="https://picsum.photos/seed/owner/100/100" alt="Owner" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* Stats Grid */}
              <StatTile 
                label="Members Present" 
                value={stats?.presentToday || 0} 
                icon={<Users size={24} />} 
                trend={{ value: 8, isPositive: true }}
                color="emerald"
              />
              <StatTile 
                label="Today's Revenue" 
                value={`$${stats?.todayRevenue?.total || 0}`} 
                icon={<DollarSign size={24} />} 
                trend={{ value: 12, isPositive: true }}
                color="indigo"
              />
              <StatTile 
                label="Expiring Soon" 
                value={stats?.expiringSoon?.count || 0} 
                icon={<Bell size={24} />} 
                trend={{ value: 2, isPositive: false }}
                color="amber"
              />
              <StatTile 
                label="Monthly Growth" 
                value={`${stats?.growth || 0}%`} 
                icon={<TrendingUp size={24} />} 
                color="emerald"
              />

              {/* Revenue Pulse Chart */}
              <GlassCard className="lg:col-span-3 h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Revenue Pulse</h3>
                  <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenuePulse}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { weekday: 'short' })}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => `$${val}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#10B981' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Quick Actions / Insights */}
              <GlassCard className="lg:col-span-1">
                <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => {
                      setIsAddModalOpen(true);
                    }}
                    className="w-full py-4 bg-gym-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-gym-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Plus size={20} /> Add New Member
                  </button>
                  <div className="h-px bg-white/5 my-2" />
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">AI Insights</h3>
                  <div className="p-4 rounded-xl bg-gym-accent/5 border border-gym-accent/10">
                    <p className="text-sm text-gym-accent font-medium">Growth Opportunity</p>
                    <p className="text-xs text-slate-400 mt-1">Membership dropped 12% this month. Consider a referral campaign.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gym-amber/5 border border-gym-amber/10">
                    <p className="text-sm text-gym-amber font-medium">Retention Alert</p>
                    <p className="text-xs text-slate-400 mt-1">5 members haven't visited in 10 days. Follow up recommended.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gym-secondary/5 border border-gym-secondary/10">
                    <p className="text-sm text-gym-secondary font-medium">Inventory Low</p>
                    <p className="text-xs text-slate-400 mt-1">Whey Protein stock is below 5 units. Reorder soon.</p>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
                  View All Reports <ChevronRight size={16} />
                </button>
              </GlassCard>

              {/* Recent Members */}
              <GlassCard className="lg:col-span-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Recent Members</h3>
                  <button className="text-gym-accent text-sm font-medium hover:underline" onClick={() => setActiveTab('members')}>View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.slice(0, 3).map((member) => (
                    <div key={member.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gym-accent/20">
                        <img src={`https://picsum.photos/seed/${member.id}/100/100`} alt={member.name} referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{member.name}</h4>
                        <p className="text-xs text-slate-400">{member.membership_type} • Exp: {member.expiry_date}</p>
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        member.status === 'active' ? "bg-gym-accent" : 
                        member.status === 'expiring' ? "bg-gym-amber" : "bg-gym-rose"
                      )} />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'members' && !selectedMemberId && (
            <motion.div
              key="members"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name, email, or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 w-full focus:outline-none focus:border-gym-accent/50 transition-all"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  {['All', 'Active', 'Expiring', 'Due'].map((filter) => (
                    <button 
                      key={filter}
                      onClick={() => setFilterStatus(filter)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap",
                        filter === filterStatus 
                          ? "bg-gym-accent/10 border-gym-accent/20 text-gym-accent" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {members
                  .filter(m => {
                    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        m.email.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesFilter = filterStatus === 'All' || m.status.toLowerCase() === filterStatus.toLowerCase();
                    return matchesSearch && matchesFilter;
                  })
                  .map((member) => (
                <GlassCard key={member.id} className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10">
                      <img src={`https://picsum.photos/seed/${member.id}/200/200`} alt={member.name} referrerPolicy="no-referrer" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border",
                      member.status === 'active' ? "text-gym-accent bg-gym-accent/10 border-gym-accent/20" : 
                      member.status === 'expiring' ? "text-gym-amber bg-gym-amber/10 border-gym-amber/20" : 
                      "text-gym-rose bg-gym-rose/10 border-gym-rose/20"
                    )}>
                      {member.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-sm text-slate-400">{member.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Plan</p>
                      <p className="text-sm font-medium text-slate-200">{member.membership_type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Expiry</p>
                      <p className="text-sm font-medium text-slate-200">{member.expiry_date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedMemberId(member.id); fetchMemberProfile(member.id); }}
                    className="w-full py-2.5 bg-gym-accent/10 hover:bg-gym-accent/20 text-gym-accent text-sm font-bold rounded-xl transition-all mt-2"
                  >
                    Manage Profile
                  </button>
                </GlassCard>
              ))}
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-slate-500 hover:text-gym-accent hover:border-gym-accent/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gym-accent/10 transition-all">
                  <Users size={24} />
                </div>
                <span className="font-bold">Add New Member</span>
              </button>
              </div>
            </motion.div>
          )}

          {/* Member Profile View */}
          {activeTab === 'members' && selectedMemberId && profileLoading && (
            <motion.div key="profile-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-[60vh]">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-gym-accent border-t-transparent rounded-full" />
            </motion.div>
          )}

          {activeTab === 'members' && selectedMemberId && !profileLoading && memberProfile && (
            <motion.div
              key="member-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* Back Button */}
              <button onClick={handleBackToMembers} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit">
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Members</span>
              </button>

              {/* Profile Header */}
              <GlassCard className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gym-accent via-cyan-500 to-gym-secondary" />
                <div className="flex items-center gap-6 pt-2">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gym-accent/30 shadow-lg shadow-gym-accent/10">
                    <img src={`https://picsum.photos/seed/${memberProfile.member.id}/200/200`} alt={memberProfile.member.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">{memberProfile.member.name}</h2>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border",
                        memberProfile.member.status === 'active' ? "text-gym-accent bg-gym-accent/10 border-gym-accent/20" :
                        memberProfile.member.status === 'expiring' ? "text-gym-amber bg-gym-amber/10 border-gym-amber/20" :
                        "text-gym-rose bg-gym-rose/10 border-gym-rose/20"
                      )}>
                        {memberProfile.member.status}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1">{memberProfile.member.email}</p>
                    <div className="flex items-center gap-6 mt-2 text-sm text-slate-500">
                      <span>{memberProfile.member.membership_type} Plan</span>
                      <span>Joined: {memberProfile.member.join_date}</span>
                      <span>Expires: {memberProfile.member.expiry_date}</span>
                      <button
                        onClick={handleRenewMembership}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gym-accent/10 hover:bg-gym-accent/20 border border-gym-accent/30 text-gym-accent text-xs font-bold rounded-lg transition-all"
                      >
                        <CalendarCheck size={13} />
                        Renew +3 Months
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Program Schedule + Stats Row */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
              <GlassCard>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gym-secondary/10 text-gym-secondary"><Dumbbell size={15} /></div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Program Schedule</h3>
                      <p className="text-[10px] text-slate-500">Auto-chain — next starts when current ends</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAssignOpen(!assignOpen)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-gym-accent/10 hover:bg-gym-accent/20 border border-gym-accent/30 text-gym-accent text-[10px] font-bold rounded-lg transition-all"
                  >
                    <Plus size={12} />
                    Assign
                  </button>
                </div>

                {/* Assign Form */}
                <AnimatePresence>
                  {assignOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap items-end gap-3 p-4 mb-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex-1 min-w-[180px]">
                          <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Program</label>
                          <select
                            value={assignForm.programId}
                            onChange={e => setAssignForm(f => ({ ...f, programId: Number(e.target.value) }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gym-accent/50"
                          >
                            {AVAILABLE_PROGRAMS.map(p => (
                              <option key={p.id} value={p.id} className="bg-[#1e293b]">{p.name} ({p.level})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-28">
                          <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Days</label>
                          <input
                            type="number" min={1} value={assignForm.days}
                            onChange={e => setAssignForm(f => ({ ...f, days: Math.max(1, Number(e.target.value)) }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gym-accent/50"
                          />
                        </div>
                        <button
                          onClick={handleAssignProgram}
                          className="px-4 py-2 bg-gym-accent text-white text-sm font-bold rounded-lg hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20"
                        >
                          Add to Queue
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Calendar View */}
                {(() => {
                  const progs: AssignedProgram[] = memberPrograms.get(selectedMemberId!) ?? [];
                  if (progs.length === 0) return (
                    <div className="text-center py-8 text-slate-500">
                      <Dumbbell size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No programs assigned yet</p>
                    </div>
                  );

                  const firstDow = new Date(calYear, calMonth, 1).getDay();
                  const startOff = firstDow === 0 ? 6 : firstDow - 1;
                  const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
                  const todayStr = new Date().toISOString().slice(0, 10);
                  const fmt = (d: number) => `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const findProg = (ds: string) => {
                    const idx = progs.findIndex(p => ds >= p.startDate && ds <= p.endDate);
                    return idx >= 0 ? { prog: progs[idx], color: PROG_CAL_COLORS[idx % PROG_CAL_COLORS.length], idx } : null;
                  };

                  return (
                    <div className="flex flex-col gap-3">
                      {/* Program legend + summary */}
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        {progs.map((p, i) => {
                          const c = PROG_CAL_COLORS[i % PROG_CAL_COLORS.length];
                          const st = programStatus(p.startDate, p.endDate);
                          return (
                            <div key={p.id} className="flex items-center gap-2 text-xs">
                              <div className={cn("w-2.5 h-2.5 rounded-sm", c.dot)} />
                              <span className="text-white font-medium">{p.programName}</span>
                              <span className="text-slate-500">{p.durationDays}d</span>
                              <span className={cn("text-[9px] font-bold uppercase px-1 py-0.5 rounded", programStatusStyle[st])}>{st}</span>
                              <button onClick={() => handleRemoveProgram(selectedMemberId!, p.id)} className="text-slate-600 hover:text-gym-rose transition-colors"><X size={12} /></button>
                            </div>
                          );
                        })}
                        <span className="ml-auto text-[10px] text-slate-500">
                          Total: <strong className="text-white">{progs.reduce((s, p) => s + p.durationDays, 0)} days</strong>
                        </span>
                      </div>

                      {/* Month navigation */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        ><ChevronRight size={16} className="rotate-180" /></button>
                        <h4 className="text-sm font-bold text-white">{MONTH_NAMES[calMonth]} {calYear}</h4>
                        <button
                          onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        ><ChevronRight size={16} /></button>
                      </div>

                      {/* Day headers */}
                      <div className="grid grid-cols-7 gap-1">
                        {DAY_NAMES.map(d => (
                          <div key={d} className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider py-1">{d}</div>
                        ))}
                      </div>

                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: startOff }).map((_, i) => <div key={`e${i}`} />)}
                        {Array.from({ length: totalDays }).map((_, i) => {
                          const d = i + 1;
                          const ds = fmt(d);
                          const match = findProg(ds);
                          const isToday = ds === todayStr;
                          const isSel = ds === selectedDay;
                          return (
                            <button
                              key={d}
                              onClick={() => { if (match) setSelectedDay(isSel ? null : ds); }}
                              className={cn(
                                "relative h-16 rounded-lg text-left p-1.5 flex flex-col transition-all border overflow-hidden",
                                match
                                  ? cn(match.color.bg, match.color.hover, match.color.border, "cursor-pointer")
                                  : "text-slate-600 border-transparent hover:bg-white/[0.03]",
                                isToday && "ring-1 ring-white/40",
                                isSel && "ring-2 ring-white shadow-lg"
                              )}
                            >
                              <span className={cn("text-xs font-bold leading-none", match ? match.color.text : "text-slate-600")}>{d}</span>
                              {match && (
                                <span className={cn("mt-auto text-[8px] font-semibold leading-tight truncate w-full", match.color.text, "opacity-70")}>
                                  {match.prog.programName}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Day Detail Popup */}
                      <AnimatePresence>
                        {selectedDay && (() => {
                          const match = findProg(selectedDay);
                          if (!match) return null;
                          const wKey = `${selectedMemberId}-${selectedDay}`;
                          const defaults = (PROGRAM_DEFAULTS[match.prog.programName] ?? []).map((e, i) => ({ ...e, id: i + 1 }));
                          const routine: DayRoutine = dayWorkouts.get(wKey) ?? { morning: defaults, evening: [] };
                          const exercises: DayExercise[] = activeSession === 'morning' ? routine.morning : routine.evening;
                          const c = match.color;

                          const saveExercises = (list: DayExercise[]) => {
                            setDayWorkouts((prev: Map<string, DayRoutine>) => {
                              const next = new Map(prev);
                              const cur = next.get(wKey) ?? { morning: defaults, evening: [] };
                              next.set(wKey, activeSession === 'morning' ? { ...cur, morning: list } : { ...cur, evening: list });
                              return next;
                            });
                          };

                          const handleProgramChange = (progName: string) => {
                            const newDefaults = (PROGRAM_DEFAULTS[progName] ?? []).map((e, i) => ({ ...e, id: i + 1 }));
                            setDayWorkouts((prev: Map<string, DayRoutine>) => {
                              const next = new Map(prev);
                              const cur = next.get(wKey) ?? { morning: [], evening: [] };
                              next.set(wKey, activeSession === 'morning' ? { ...cur, morning: newDefaults } : { ...cur, evening: newDefaults });
                              return next;
                            });
                          };

                          return (
                            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                              <motion.div
                                key="day-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => { setSelectedDay(null); setEditingDay(null); setActiveSession('morning'); }}
                                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                              />
                              <motion.div
                                key="day-detail"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                                className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f1729] shadow-2xl"
                              >
                                {/* Gradient top accent */}
                                <div className={cn("h-1 rounded-t-2xl", c.dot)} />

                                {/* Program Selector Bar */}
                                <div className="px-5 pt-4 pb-3 border-b border-white/5">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <Dumbbell size={14} className="text-gym-accent shrink-0" />
                                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest shrink-0">Program</span>
                                      <div className="relative flex-1 min-w-0">
                                        <select
                                          value={match.prog.programName}
                                          onChange={e => handleProgramChange(e.target.value)}
                                          className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-7 py-2 text-xs font-bold text-white focus:outline-none focus:border-gym-accent/50 cursor-pointer hover:bg-white/10 transition-all truncate"
                                        >
                                          {AVAILABLE_PROGRAMS.map(p => (
                                            <option key={p.id} value={p.name} className="bg-[#1e293b]">{p.name} — {p.level}</option>
                                          ))}
                                        </select>
                                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                      </div>
                                    </div>
                                    <button onClick={() => { setSelectedDay(null); setEditingDay(null); setActiveSession('morning'); }} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0"><X size={16} /></button>
                                  </div>
                                </div>

                                <div className="p-5">
                                  {/* Header */}
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.bg)}>
                                        <Calendar size={16} className={c.text} />
                                      </div>
                                      <div>
                                        <h4 className="text-base font-bold text-white">{selectedDay}</h4>
                                        <p className={cn("text-xs font-medium", c.text)}>{match.prog.programName} — {match.prog.level}</p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => setEditingDay(editingDay === wKey ? null : wKey)}
                                      className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all",
                                        editingDay === wKey
                                          ? "bg-gym-accent/15 border-gym-accent/40 text-gym-accent"
                                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                                      )}
                                    >
                                      <Sparkles size={12} />
                                      {editingDay === wKey ? 'Done' : 'Edit'}
                                    </button>
                                  </div>

                                  {/* Morning / Evening Tabs */}
                                  <div className="flex items-center gap-1 mb-4 p-1 bg-white/5 rounded-xl border border-white/5">
                                    <button
                                      onClick={() => setActiveSession('morning')}
                                      className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                                        activeSession === 'morning'
                                          ? "bg-gym-amber/15 text-gym-amber border border-gym-amber/30"
                                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                                      )}
                                    >
                                      <Sun size={13} /> Morning
                                    </button>
                                    <button
                                      onClick={() => setActiveSession('evening')}
                                      className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                                        activeSession === 'evening'
                                          ? "bg-gym-secondary/15 text-gym-secondary border border-gym-secondary/30"
                                          : "text-slate-500 hover:text-slate-300 border border-transparent"
                                      )}
                                    >
                                      <Moon size={13} /> Evening
                                    </button>
                                  </div>

                                  {/* Exercise List */}
                                  {exercises.length === 0 ? (
                                    <div className="text-center py-8">
                                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2", activeSession === 'morning' ? 'bg-gym-amber/10' : 'bg-gym-secondary/10')}>
                                        {activeSession === 'morning' ? <Sun size={16} className="text-gym-amber/50" /> : <Moon size={16} className="text-gym-secondary/50" />}
                                      </div>
                                      <p className="text-xs text-slate-500 mb-2">No {activeSession} routine yet</p>
                                      {editingDay === wKey && (
                                        <button
                                          onClick={() => saveExercises([{ id: Date.now(), name: 'New Exercise', sets: 3, reps: 10, unit: 'reps' }])}
                                          className="text-xs font-medium text-gym-accent hover:text-gym-accent/80 transition-colors"
                                        >
                                          <Plus size={12} className="inline mr-1" />Add first exercise
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-2">
                                      {exercises.map((ex, i) => (
                                        <div key={ex.id} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 group">
                                          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">{i + 1}</span>
                                          {editingDay === wKey ? (
                                            <input
                                              type="text"
                                              value={ex.name}
                                              onChange={e => saveExercises(exercises.map(x => x.id === ex.id ? { ...x, name: e.target.value } : x))}
                                              className="flex-1 min-w-0 bg-white/5 border border-white/10 text-sm font-medium text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-gym-accent/50"
                                            />
                                          ) : (
                                            <span className="flex-1 min-w-0 text-sm font-medium text-white px-1">{ex.name}</span>
                                          )}
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            {editingDay === wKey ? (
                                              <>
                                                <input
                                                  type="number" min={1} value={ex.sets}
                                                  onChange={e => saveExercises(exercises.map(x => x.id === ex.id ? { ...x, sets: Math.max(1, Number(e.target.value)) } : x))}
                                                  className="w-11 text-center bg-white/5 border border-white/10 rounded-lg px-1 py-1 text-xs font-bold text-white focus:outline-none focus:border-gym-accent/50"
                                                />
                                                <span className="text-[10px] text-slate-500">x</span>
                                                <input
                                                  type="number" min={1} value={ex.reps}
                                                  onChange={e => saveExercises(exercises.map(x => x.id === ex.id ? { ...x, reps: Math.max(1, Number(e.target.value)) } : x))}
                                                  className="w-11 text-center bg-white/5 border border-white/10 rounded-lg px-1 py-1 text-xs font-bold text-white focus:outline-none focus:border-gym-accent/50"
                                                />
                                                <select
                                                  value={ex.unit}
                                                  onChange={e => saveExercises(exercises.map(x => x.id === ex.id ? { ...x, unit: e.target.value } : x))}
                                                  className="bg-white/5 border border-white/10 rounded-lg px-1.5 py-1 text-[10px] text-slate-400 focus:outline-none"
                                                >
                                                  <option value="reps" className="bg-[#1e293b]">reps</option>
                                                  <option value="sec" className="bg-[#1e293b]">sec</option>
                                                  <option value="min" className="bg-[#1e293b]">min</option>
                                                </select>
                                              </>
                                            ) : (
                                              <span className="text-xs text-slate-400 font-medium px-1">{ex.sets} x {ex.reps} {ex.unit}</span>
                                            )}
                                          </div>
                                          {editingDay === wKey && (
                                            <button
                                              onClick={() => saveExercises(exercises.filter(x => x.id !== ex.id))}
                                              className="text-slate-600 hover:text-gym-rose transition-colors shrink-0"
                                            ><X size={14} /></button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Add Exercise (only in edit mode, when list has items) */}
                                  {editingDay === wKey && exercises.length > 0 && (
                                    <button
                                      onClick={() => saveExercises([...exercises, { id: Date.now(), name: 'New Exercise', sets: 3, reps: 10, unit: 'reps' }])}
                                      className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-gym-accent transition-colors"
                                    >
                                      <Plus size={13} /> Add Exercise
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          );
                        })()}
                      </AnimatePresence>
                    </div>
                  );
                })()}
              </GlassCard>
              </div>

              {/* Body Stats + Goals + Activity + Risk */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gym-accent/10 text-gym-accent"><User size={18} /></div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Body Stats</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Age</p>
                      <p className="text-lg font-bold text-white">{memberProfile.member.age || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Height</p>
                      <p className="text-lg font-bold text-white">{memberProfile.member.height || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Weight</p>
                      <p className="text-lg font-bold text-white">{memberProfile.member.weight || '--'}</p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gym-secondary/10 text-gym-secondary"><Target size={18} /></div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Goals</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Body Target</p>
                      <p className="text-sm font-bold text-white">{memberProfile.member.body_target || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Timing</p>
                      <p className="text-sm font-bold text-white">{memberProfile.member.timing || '--'}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Fitness Goal</p>
                    <p className="text-sm text-slate-300 mt-1">{memberProfile.member.goal || 'Not set'}</p>
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gym-accent/10 text-gym-accent"><Activity size={18} /></div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Activity</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Visits (30d)</p>
                      <p className="text-2xl font-bold text-white">{memberProfile.riskFactors.attendanceRate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Last Visit</p>
                      <p className="text-sm font-bold text-white">{memberProfile.member.last_visit || 'Never'}</p>
                    </div>
                  </div>
                </GlassCard>

                {/* Risk Gauge */}
                <GlassCard>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("p-2 rounded-lg",
                      memberProfile.riskScore > 60 ? "bg-gym-rose/10 text-gym-rose" :
                      memberProfile.riskScore > 30 ? "bg-gym-amber/10 text-gym-amber" :
                      "bg-gym-accent/10 text-gym-accent"
                    )}>
                      <AlertTriangle size={18} />
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Quit Risk</span>
                  </div>
                  <div className="h-[100px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="80%" innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={[{ value: memberProfile.riskScore, fill: memberProfile.riskScore > 60 ? '#F43F5E' : memberProfile.riskScore > 30 ? '#F59E0B' : '#10B981' }]}>
                        <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.05)' }} cornerRadius={10} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className={cn("text-3xl font-bold text-center -mt-2",
                    memberProfile.riskScore > 60 ? "text-gym-rose" : memberProfile.riskScore > 30 ? "text-gym-amber" : "text-gym-accent"
                  )}>
                    {memberProfile.riskScore}%
                  </p>
                  <p className="text-xs text-slate-500 text-center mt-1">
                    {memberProfile.riskScore > 60 ? 'High Risk - Action needed' : memberProfile.riskScore > 30 ? 'Moderate - Monitor closely' : 'Low Risk - Engaged'}
                  </p>
                </GlassCard>
              </div>
              </div>

              {/* Diet Plan */}
              <GlassCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-gym-accent/10 text-gym-accent"><Utensils size={18} /></div>
                  <h3 className="text-xl font-bold text-white">Diet Plan</h3>
                  <span className="text-sm text-slate-500 ml-auto">
                    Total: {memberProfile.dietPlan.reduce((sum, m) => sum + (m.calories || 0), 0)} cal/day
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {memberProfile.dietPlan.map((meal) => (
                    <div key={meal.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white">{meal.meal_type}</h4>
                        <span className="text-gym-accent text-sm font-bold">{meal.calories} cal</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{meal.food_items}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 rounded-md bg-gym-accent/10 text-gym-accent">P: {meal.protein}g</span>
                        <span className="px-2 py-1 rounded-md bg-gym-amber/10 text-gym-amber">C: {meal.carbs}g</span>
                        <span className="px-2 py-1 rounded-md bg-gym-rose/10 text-gym-rose">F: {meal.fats}g</span>
                      </div>
                      {meal.notes && <p className="text-xs text-slate-500 mt-2 italic">{meal.notes}</p>}
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Attendance + Supplements */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gym-secondary/10 text-gym-secondary"><Activity size={18} /></div>
                    <h3 className="text-xl font-bold text-white">Attendance Pattern</h3>
                    <span className="text-sm text-slate-500 ml-auto">Last 30 days</span>
                  </div>
                  <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={memberProfile.attendanceByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                        <Bar dataKey="visits" fill="#10B981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard className="flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gym-amber/10 text-gym-amber"><Pill size={18} /></div>
                    <h3 className="text-xl font-bold text-white">Supplements</h3>
                  </div>
                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[220px]">
                    {memberProfile.supplements.length === 0 ? (
                      <p className="text-slate-500 text-sm">No supplement purchases</p>
                    ) : memberProfile.supplements.map((s) => (
                      <div key={s.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-white">{s.description}</p>
                          <span className="text-gym-accent font-bold text-sm">{s.amount}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{s.date}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Payments + Trainer Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gym-accent/10 text-gym-accent"><CreditCard size={18} /></div>
                    <h3 className="text-xl font-bold text-white">Payment Behavior</h3>
                  </div>
                  <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={memberProfile.paymentsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                        <Bar dataKey="paid" stackId="a" fill="#10B981" name="Paid" />
                        <Bar dataKey="unpaid" stackId="a" fill="#F43F5E" radius={[8, 8, 0, 0]} name="Unpaid" />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5">
                    {memberProfile.payments.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center gap-2 text-xs">
                        <div className={cn("w-2 h-2 rounded-full",
                          p.status === 'paid' ? 'bg-gym-accent' : p.status === 'pending' ? 'bg-gym-amber' : 'bg-gym-rose'
                        )} />
                        <span className="text-slate-400">{p.description}</span>
                        <span className={cn("font-bold",
                          p.status === 'paid' ? 'text-gym-accent' : p.status === 'pending' ? 'text-gym-amber' : 'text-gym-rose'
                        )}>{p.amount}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gym-secondary/10 text-gym-secondary"><MessageSquare size={18} /></div>
                    <h3 className="text-xl font-bold text-white">Trainer Notes</h3>
                  </div>
                  <div className="flex flex-col gap-4 flex-1 overflow-y-auto max-h-[280px]">
                    {memberProfile.trainerNotes.map((note) => (
                      <div key={note.id} className="relative pl-4 border-l-2 border-gym-secondary/30">
                        <p className="text-sm text-slate-300">{note.note}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gym-secondary font-medium">{note.trainer_name}</span>
                          <span className="text-xs text-slate-500">{new Date(note.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab === 'staff' && staffData && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatTile label="Total Staff" value={staffData.stats.totalStaff} icon={<Users size={24} />} color="emerald" />
                <StatTile label="Avg Rating" value={`${staffData.stats.avgRating}/5`} icon={<Star size={24} />} color="amber" />
                <StatTile label="Present (Month)" value={staffData.stats.totalPresent} icon={<CalendarCheck size={24} />} color="emerald" />
                <StatTile label="Leaves (Month)" value={staffData.stats.totalLeaves} icon={<CalendarX2 size={24} />} color="rose" />
              </div>

              {/* Staff Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffData.staff.map((s) => (
                  <GlassCard key={s.id} className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 shrink-0">
                        <img src={`https://picsum.photos/seed/staff${s.id}/200/200`} alt={s.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white truncate">{s.name}</h3>
                        <span className={cn(
                          "inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border mt-1",
                          s.role === 'Head Trainer' ? "text-gym-accent bg-gym-accent/10 border-gym-accent/20" :
                          s.role === 'Trainer' ? "text-gym-secondary bg-gym-secondary/10 border-gym-secondary/20" :
                          "text-gym-amber bg-gym-amber/10 border-gym-amber/20"
                        )}>
                          {s.role}
                        </span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={16} className={cn(
                            star <= Math.round(s.performance_rating) ? "text-gym-amber fill-gym-amber" : "text-slate-600"
                          )} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-white">{s.performance_rating}</span>
                    </div>

                    {/* Attendance Summary */}
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Attendance (This Month)</p>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center px-2 py-1.5 rounded-lg bg-gym-accent/10 border border-gym-accent/20">
                          <p className="text-sm font-bold text-gym-accent">{s.attendance.present}</p>
                          <p className="text-[9px] text-slate-500">Present</p>
                        </div>
                        <div className="text-center px-2 py-1.5 rounded-lg bg-gym-amber/10 border border-gym-amber/20">
                          <p className="text-sm font-bold text-gym-amber">{s.attendance.leave}</p>
                          <p className="text-[9px] text-slate-500">Leave</p>
                        </div>
                        <div className="text-center px-2 py-1.5 rounded-lg bg-gym-rose/10 border border-gym-rose/20">
                          <p className="text-sm font-bold text-gym-rose">{s.attendance.absent}</p>
                          <p className="text-[9px] text-slate-500">Absent</p>
                        </div>
                        <div className="text-center px-2 py-1.5 rounded-lg bg-gym-secondary/10 border border-gym-secondary/20">
                          <p className="text-sm font-bold text-gym-secondary">{s.attendance.halfDay}</p>
                          <p className="text-[9px] text-slate-500">Half Day</p>
                        </div>
                      </div>
                      {/* Attendance bar */}
                      <div className="flex gap-0.5 mt-2 h-1.5 rounded-full overflow-hidden">
                        {s.attendance.totalWorkDays > 0 && (
                          <>
                            <div className="bg-gym-accent rounded-l-full" style={{ width: `${(s.attendance.present / s.attendance.totalWorkDays) * 100}%` }} />
                            <div className="bg-gym-amber" style={{ width: `${(s.attendance.leave / s.attendance.totalWorkDays) * 100}%` }} />
                            <div className="bg-gym-rose" style={{ width: `${(s.attendance.absent / s.attendance.totalWorkDays) * 100}%` }} />
                            <div className="bg-gym-secondary rounded-r-full" style={{ width: `${(s.attendance.halfDay / s.attendance.totalWorkDays) * 100}%` }} />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Auto-Calculated Salary */}
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Salary Breakdown</p>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Base Salary</span>
                          <span className="text-white font-medium">${s.salary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Paid Leaves</span>
                          <span className="text-slate-300">{Math.min(s.attendance.leave, s.attendance.paidLeaves)} / {s.attendance.paidLeaves}</span>
                        </div>
                        {s.deduction > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gym-rose">Deductions</span>
                            <span className="text-gym-rose font-medium">-${s.deduction.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                          <span className="text-white font-bold">Net Salary</span>
                          <span className={cn("font-bold", s.deduction > 0 ? "text-gym-amber" : "text-gym-accent")}>${s.calculatedSalary.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Members</p>
                        <p className="text-sm font-bold text-white">{s.assigned_members}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Notes (30d)</p>
                        <p className="text-sm font-bold text-white">{s.recent_notes_count}</p>
                      </div>
                    </div>

                    {/* Assigned Members */}
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Assigned Members ({s.assigned_members})</p>
                      {s.member_names ? (
                        <div className="flex flex-wrap gap-2">
                          {s.member_names.split('||').map((name, i) => {
                            const memberId = s.member_ids?.split('||')[i];
                            return (
                              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                <div className="w-6 h-6 rounded-full overflow-hidden">
                                  <img src={`https://picsum.photos/seed/${memberId}/100/100`} alt={name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs font-medium text-slate-300">{name}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600">No members assigned</p>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && inventoryData && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatTile label="Total Items" value={inventoryData.stats.totalItems} icon={<Package size={24} />} color="emerald" />
                <StatTile label="Equipment" value={inventoryData.stats.totalEquipment} icon={<Dumbbell size={24} />} color="indigo" />
                <StatTile label="Products" value={inventoryData.stats.totalProducts} icon={<Package size={24} />} color="amber" />
                <StatTile label="Low Stock Alerts" value={inventoryData.stats.lowStockCount} icon={<AlertCircle size={24} />} color="rose" trend={{ value: inventoryData.stats.lowStockCount, isPositive: false }} />
              </div>

              {/* Filter Tabs + Total Value */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  {['All', 'Equipment', 'Products', 'Low Stock'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setInventoryFilter(filter)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap",
                        filter === inventoryFilter
                          ? "bg-gym-accent/10 border-gym-accent/20 text-gym-accent"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-slate-400">
                  Total Inventory Value: <span className="text-white font-bold">${inventoryData.stats.totalValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {inventoryData.categoryBreakdown.map((cat) => (
                  <GlassCard key={cat.category} className="!p-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{cat.category}</p>
                    <p className="text-xl font-bold text-white mt-1">{cat.count}</p>
                    <p className="text-xs text-slate-400">${cat.value.toLocaleString()}</p>
                  </GlassCard>
                ))}
              </div>

              {/* Inventory Table */}
              <GlassCard className="overflow-hidden !p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider font-bold px-6 py-4">Item</th>
                        <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider font-bold px-4 py-4">Category</th>
                        <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider font-bold px-4 py-4">Type</th>
                        <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider font-bold px-4 py-4">Stock</th>
                        <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider font-bold px-4 py-4">Price</th>
                        <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider font-bold px-4 py-4">Status</th>
                        <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider font-bold px-4 py-4">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.items
                        .filter(item => {
                          if (inventoryFilter === 'All') return true;
                          if (inventoryFilter === 'Equipment') return item.type === 'equipment';
                          if (inventoryFilter === 'Products') return item.type === 'product';
                          if (inventoryFilter === 'Low Stock') return item.status === 'low_stock';
                          return true;
                        })
                        .map((item) => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg",
                                item.type === 'equipment' ? "bg-gym-secondary/10 text-gym-secondary" : "bg-gym-accent/10 text-gym-accent"
                              )}>
                                {item.type === 'equipment' ? <Dumbbell size={16} /> : <Package size={16} />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{item.item_name}</p>
                                {item.condition && <p className="text-xs text-slate-500">Condition: {item.condition}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-slate-300">{item.category}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border",
                              item.type === 'equipment' ? "text-gym-secondary bg-gym-secondary/10 border-gym-secondary/20" : "text-gym-accent bg-gym-accent/10 border-gym-accent/20"
                            )}>
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full",
                                    (item.stock_level / item.max_stock) > 0.5 ? "bg-gym-accent" :
                                    (item.stock_level / item.max_stock) > 0.25 ? "bg-gym-amber" : "bg-gym-rose"
                                  )}
                                  style={{ width: `${Math.min(100, (item.stock_level / item.max_stock) * 100)}%` }}
                                />
                              </div>
                              <span className="text-sm text-white font-medium">{item.stock_level}/{item.max_stock}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-medium text-white">${item.price.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border",
                              item.status === 'in_stock' ? "text-gym-accent bg-gym-accent/10 border-gym-accent/20" : "text-gym-rose bg-gym-rose/10 border-gym-rose/20"
                            )}>
                              {item.status === 'in_stock' ? 'In Stock' : 'Low Stock'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-400">
                              <MapPin size={12} />
                              {item.location}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'revenue' && revenueData && (
            <motion.div
              key="revenue"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatTile label="Total Revenue" value={`$${revenueData.stats.totalRevenue.toLocaleString()}`} icon={<DollarSign size={24} />} color="emerald" />
                <StatTile label="This Month" value={`$${revenueData.stats.thisMonthRevenue.toLocaleString()}`} icon={<TrendingUp size={24} />} color="indigo" trend={{ value: Math.abs(revenueData.stats.revenueGrowth), isPositive: revenueData.stats.revenueGrowth >= 0 }} />
                <StatTile label="Memberships" value={`$${revenueData.stats.membershipRevenue.toLocaleString()}`} icon={<Crown size={24} />} color="amber" />
                <StatTile label="Supplements" value={`$${revenueData.stats.supplementRevenue.toLocaleString()}`} icon={<Pill size={24} />} color="rose" />
              </div>

              {/* Revenue Sources (compact) & Revenue Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Sources - Compact */}
                <GlassCard className="flex items-center gap-4">
                  <div className="shrink-0">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie data={revenueData.categoryBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={4} dataKey="total" nameKey="category">
                          {revenueData.categoryBreakdown.map((_entry, index) => (
                            <Cell key={index} fill={REVENUE_COLORS[index % REVENUE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white mb-3">Revenue Sources</h3>
                    {revenueData.categoryBreakdown.map((cat, i) => {
                      const pct = revenueData.stats.totalRevenue > 0 ? Math.round((cat.total / revenueData.stats.totalRevenue) * 100) : 0;
                      return (
                        <div key={cat.category} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: REVENUE_COLORS[i % REVENUE_COLORS.length] }} />
                            <span className="text-xs text-slate-400">{cat.category}</span>
                          </div>
                          <span className="text-xs font-bold text-white">${cat.total.toLocaleString()} <span className="text-slate-500 font-normal">({pct}%)</span></span>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* Customizable Revenue Comparison */}
                <GlassCard>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Revenue Comparison</h3>
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                      <button onClick={() => { setCompareMode('month'); setComparePeriodA(''); setComparePeriodB(''); }} className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all", compareMode === 'month' ? "bg-gym-accent/20 text-gym-accent" : "text-slate-500 hover:text-slate-300")}>Month</button>
                      <button onClick={() => { setCompareMode('year'); setComparePeriodA(''); setComparePeriodB(''); }} className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all", compareMode === 'year' ? "bg-gym-accent/20 text-gym-accent" : "text-slate-500 hover:text-slate-300")}>Year</button>
                    </div>
                  </div>
                  {(() => {
                    const months = revenueData.monthlyRevenue;
                    const availableMonths = months.map(m => m.month);
                    const availableYears = Array.from(new Set(availableMonths.map(m => m.substring(0, 4)))) as string[];
                    const formatMonth = (m: string) => { const [y, mo] = m.split('-'); return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(mo) - 1]} ${y}`; };

                    let periodAData: { total: number; memberships: number; supplements: number; personal_training: number };
                    let periodBData: { total: number; memberships: number; supplements: number; personal_training: number };
                    let periodsA: string[];
                    let periodsB: string[];

                    if (compareMode === 'month') {
                      periodsA = availableMonths;
                      periodsB = availableMonths;
                      const selA = comparePeriodA || availableMonths[availableMonths.length - 1] || '';
                      const selB = comparePeriodB || availableMonths[availableMonths.length - 2] || '';
                      const dataA = months.find(m => m.month === selA);
                      const dataB = months.find(m => m.month === selB);
                      periodAData = { total: dataA?.total || 0, memberships: dataA?.memberships || 0, supplements: dataA?.supplements || 0, personal_training: dataA?.personal_training || 0 };
                      periodBData = { total: dataB?.total || 0, memberships: dataB?.memberships || 0, supplements: dataB?.supplements || 0, personal_training: dataB?.personal_training || 0 };
                    } else {
                      periodsA = availableYears;
                      periodsB = availableYears;
                      const selA = comparePeriodA || availableYears[availableYears.length - 1] || '';
                      const selB = comparePeriodB || availableYears[availableYears.length - 2] || availableYears[availableYears.length - 1] || '';
                      const yearDataA = months.filter(m => m.month.startsWith(selA));
                      const yearDataB = months.filter(m => m.month.startsWith(selB));
                      periodAData = { total: yearDataA.reduce((s, m) => s + m.total, 0), memberships: yearDataA.reduce((s, m) => s + m.memberships, 0), supplements: yearDataA.reduce((s, m) => s + m.supplements, 0), personal_training: yearDataA.reduce((s, m) => s + m.personal_training, 0) };
                      periodBData = { total: yearDataB.reduce((s, m) => s + m.total, 0), memberships: yearDataB.reduce((s, m) => s + m.memberships, 0), supplements: yearDataB.reduce((s, m) => s + m.supplements, 0), personal_training: yearDataB.reduce((s, m) => s + m.personal_training, 0) };
                    }

                    return (
                      <>
                        <div className="flex gap-2 mb-3">
                          <select value={comparePeriodA || (compareMode === 'month' ? availableMonths[availableMonths.length - 1] : availableYears[availableYears.length - 1]) || ''} onChange={e => setComparePeriodA(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gym-accent/50">
                            {periodsA.map(p => <option key={p} value={p}>{compareMode === 'month' ? formatMonth(p) : p}</option>)}
                          </select>
                          <span className="text-xs text-slate-500 self-center">vs</span>
                          <select value={comparePeriodB || (compareMode === 'month' ? availableMonths[availableMonths.length - 2] : (availableYears[availableYears.length - 2] || availableYears[availableYears.length - 1])) || ''} onChange={e => setComparePeriodB(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-gym-accent/50">
                            {periodsB.map(p => <option key={p} value={p}>{compareMode === 'month' ? formatMonth(p) : p}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          {[
                            { label: 'Total', a: periodAData.total, b: periodBData.total },
                            { label: 'Memberships', a: periodAData.memberships, b: periodBData.memberships },
                            { label: 'Supplements', a: periodAData.supplements, b: periodBData.supplements },
                            { label: 'PT', a: periodAData.personal_training, b: periodBData.personal_training },
                          ].map(row => {
                            const change = row.b > 0 ? Math.round(((row.a - row.b) / row.b) * 100) : 0;
                            return (
                              <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                <span className="text-xs text-slate-400">{row.label}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-500">${row.b.toLocaleString()}</span>
                                  <span className="text-slate-600 text-[10px]">&rarr;</span>
                                  <span className="text-xs font-bold text-white">${row.a.toLocaleString()}</span>
                                  {change !== 0 && (
                                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", change > 0 ? "text-gym-accent bg-gym-accent/10" : "text-gym-rose bg-gym-rose/10")}>
                                      {change > 0 ? '+' : ''}{change}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </GlassCard>
              </div>

              {/* Top Paying Members & Revenue by Tier Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Paying Members */}
                <GlassCard>
                  <h3 className="text-lg font-bold text-white mb-4">Top Paying Members</h3>
                  <div className="flex flex-col gap-1">
                    {revenueData.topMembers.map((member, idx) => (
                      <div key={member.id} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          idx === 0 ? "bg-gym-amber/20 text-gym-amber" :
                          idx === 1 ? "bg-slate-300/20 text-slate-300" :
                          idx === 2 ? "bg-amber-700/20 text-amber-600" :
                          "bg-white/5 text-slate-500"
                        )}>
                          {idx + 1}
                        </span>
                        <img src={`https://picsum.photos/seed/member${member.id}/40/40`} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.membership_type} &middot; {member.transaction_count} payments</p>
                        </div>
                        <span className="text-sm font-bold text-gym-accent shrink-0">${member.total_paid.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Revenue by Membership Tier */}
                <GlassCard>
                  <h3 className="text-lg font-bold text-white mb-4">Revenue by Plan</h3>
                  <div className="flex flex-col gap-4">
                    {revenueData.tierRevenue.map((tier) => {
                      const maxRevenue = Math.max(...revenueData.tierRevenue.map(t => t.total_revenue));
                      const pct = maxRevenue > 0 ? Math.round((tier.total_revenue / maxRevenue) * 100) : 0;
                      const tierColor = tier.tier === 'Premium' ? '#10B981' : tier.tier === 'Standard' ? '#6366F1' : '#F59E0B';
                      return (
                        <div key={tier.tier}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Crown size={14} style={{ color: tierColor }} />
                              <span className="text-sm font-medium text-white">{tier.tier}</span>
                              <span className="text-xs text-slate-500">{tier.member_count} member{tier.member_count !== 1 ? 's' : ''}</span>
                            </div>
                            <span className="text-sm font-bold text-white">${tier.total_revenue.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: tierColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>

              {/* Recent Transactions */}
              <GlassCard>
                <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
                <div className="flex flex-col gap-1">
                  {revenueData.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg",
                          tx.category === 'Memberships' ? "bg-gym-accent/10 text-gym-accent" :
                          tx.category === 'Supplements' ? "bg-gym-amber/10 text-gym-amber" :
                          tx.category === 'Personal Training' ? "bg-gym-secondary/10 text-gym-secondary" :
                          "bg-white/10 text-slate-400"
                        )}>
                          <DollarSign size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{tx.category}</p>
                          <p className="text-xs text-slate-500">{tx.member_name || 'Walk-in'} &middot; {new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gym-accent">+${tx.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'schedule' && scheduleData && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatTile label="Total Classes" value={scheduleData.stats.totalClasses} icon={<Calendar size={24} />} color="emerald" />
                <StatTile label="Today's Classes" value={scheduleData.stats.todayClasses} icon={<Clock size={24} />} color="indigo" />
                <StatTile label="Total Capacity" value={scheduleData.stats.totalCapacity} icon={<Users size={24} />} color="amber" />
                <StatTile label="Avg Enrollment" value={`${scheduleData.stats.avgEnrollment}%`} icon={<TrendingUp size={24} />} color="emerald" trend={{ value: scheduleData.stats.avgEnrollment, isPositive: true }} />
              </div>

              {/* Day Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <button
                    key={day}
                    onClick={() => setScheduleDay(day)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap",
                      day === scheduleDay
                        ? "bg-gym-accent/10 border-gym-accent/20 text-gym-accent"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Class Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduleData.classes
                  .filter(c => c.day_of_week === scheduleDay)
                  .map((cls) => (
                    <GlassCard key={cls.id} className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white">{cls.class_name}</h3>
                          <span className={cn(
                            "inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border mt-1",
                            cls.category === 'Cardio' ? "text-gym-rose bg-gym-rose/10 border-gym-rose/20" :
                            cls.category === 'Strength' ? "text-gym-accent bg-gym-accent/10 border-gym-accent/20" :
                            cls.category === 'Flexibility' ? "text-gym-secondary bg-gym-secondary/10 border-gym-secondary/20" :
                            cls.category === 'Combat' ? "text-gym-amber bg-gym-amber/10 border-gym-amber/20" :
                            "text-slate-400 bg-white/5 border-white/10"
                          )}>
                            {cls.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{cls.start_time}</p>
                          <p className="text-xs text-slate-500">to {cls.end_time}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <UserCheck size={14} className="text-slate-500" />
                          <span className="text-sm text-slate-300">{cls.trainer_name || 'Open Session'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-500" />
                          <span className="text-sm text-slate-300">{cls.location}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-slate-500">Enrollment</span>
                          <span className="text-sm font-bold text-white">{cls.enrolled}/{cls.capacity}</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full",
                              (cls.enrolled / cls.capacity) > 0.8 ? "bg-gym-rose" :
                              (cls.enrolled / cls.capacity) > 0.5 ? "bg-gym-amber" : "bg-gym-accent"
                            )}
                            style={{ width: `${Math.min(100, (cls.enrolled / cls.capacity) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                {scheduleData.classes.filter(c => c.day_of_week === scheduleDay).length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No classes scheduled for {scheduleDay}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          {activeTab === 'programs' && (
            <WorkoutProgramsManagement />
          )}

          {activeTab === 'nutrition' && <NutritionPlansManagement />}

          {activeTab === 'improvements' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gym-amber/10 text-gym-amber"><Lightbulb size={22} /></div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Gym Improvements</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Track what to improve, upgrade & enhance in your gym</p>
                </div>
              </div>

              {/* Improvement Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Equipment Upgrades */}
                <GlassCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gym-secondary/10 text-gym-secondary"><Wrench size={18} /></div>
                    <h3 className="text-base font-bold text-white">Equipment Upgrades</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">Machines & equipment that need repair, replacement or new additions.</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { item: 'Replace worn treadmill belts', priority: 'High', status: 'Pending', icon: '🔴' },
                      { item: 'Add 2 new cable machines', priority: 'High', status: 'Planned', icon: '🟡' },
                      { item: 'Upgrade dumbbells (50-80 kg set)', priority: 'Medium', status: 'Pending', icon: '🟡' },
                      { item: 'Fix rowing machine sensor', priority: 'High', status: 'In Progress', icon: '🔵' },
                      { item: 'New resistance bands set', priority: 'Low', status: 'Completed', icon: '🟢' },
                      { item: 'Add foam rollers station', priority: 'Low', status: 'Pending', icon: '🟡' },
                      { item: 'Replace Smith machine bar', priority: 'Medium', status: 'Planned', icon: '🟡' },
                      { item: 'Add battle rope anchors', priority: 'Low', status: 'Pending', icon: '🟡' },
                    ].map(item => (
                      <div key={item.item} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-xs mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-white">{item.item}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.priority === 'High' ? 'bg-gym-rose/10 text-gym-rose border-gym-rose/20' :
                              item.priority === 'Medium' ? 'bg-gym-amber/10 text-gym-amber border-gym-amber/20' :
                              'bg-white/5 text-slate-400 border-white/10'
                            )}>{item.priority}</span>
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.status === 'Completed' ? 'bg-gym-accent/10 text-gym-accent border-gym-accent/20' :
                              item.status === 'In Progress' ? 'bg-gym-secondary/10 text-gym-secondary border-gym-secondary/20' :
                              'bg-white/5 text-slate-500 border-white/10'
                            )}>{item.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Facility & Hygiene */}
                <GlassCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gym-accent/10 text-gym-accent"><ShieldCheck size={18} /></div>
                    <h3 className="text-base font-bold text-white">Facility & Hygiene</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">Cleanliness, safety, ventilation and facility maintenance upgrades.</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { item: 'Deep clean all gym mats weekly', priority: 'High', status: 'In Progress', icon: '🔵' },
                      { item: 'Upgrade AC system in weight area', priority: 'High', status: 'Planned', icon: '🟡' },
                      { item: 'Install hand sanitizer stations', priority: 'Medium', status: 'Completed', icon: '🟢' },
                      { item: 'Fix locker room showers (3 & 7)', priority: 'High', status: 'Pending', icon: '🔴' },
                      { item: 'Replace gym floor tiles (cardio zone)', priority: 'Medium', status: 'Planned', icon: '🟡' },
                      { item: 'Add air purifiers in studio rooms', priority: 'Medium', status: 'Pending', icon: '🟡' },
                      { item: 'Repaint walls & touch up branding', priority: 'Low', status: 'Planned', icon: '🟡' },
                      { item: 'Install water refill stations', priority: 'Medium', status: 'Completed', icon: '🟢' },
                    ].map(item => (
                      <div key={item.item} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-xs mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-white">{item.item}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.priority === 'High' ? 'bg-gym-rose/10 text-gym-rose border-gym-rose/20' :
                              item.priority === 'Medium' ? 'bg-gym-amber/10 text-gym-amber border-gym-amber/20' :
                              'bg-white/5 text-slate-400 border-white/10'
                            )}>{item.priority}</span>
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.status === 'Completed' ? 'bg-gym-accent/10 text-gym-accent border-gym-accent/20' :
                              item.status === 'In Progress' ? 'bg-gym-secondary/10 text-gym-secondary border-gym-secondary/20' :
                              'bg-white/5 text-slate-500 border-white/10'
                            )}>{item.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Member Experience */}
                <GlassCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gym-rose/10 text-gym-rose"><ThumbsUp size={18} /></div>
                    <h3 className="text-base font-bold text-white">Member Experience</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">Services, amenities & experience improvements for members.</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { item: 'Add personal training packages', priority: 'High', status: 'In Progress', icon: '🔵' },
                      { item: 'Launch mobile app for bookings', priority: 'High', status: 'Planned', icon: '🟡' },
                      { item: 'Set up smoothie/juice bar', priority: 'Medium', status: 'Pending', icon: '🟡' },
                      { item: 'Create beginner orientation program', priority: 'High', status: 'Completed', icon: '🟢' },
                      { item: 'Add towel service for premium members', priority: 'Low', status: 'Planned', icon: '🟡' },
                      { item: 'Install music system in all zones', priority: 'Medium', status: 'In Progress', icon: '🔵' },
                      { item: 'Member referral reward program', priority: 'Medium', status: 'Pending', icon: '🟡' },
                      { item: 'Weekly progress photo booth', priority: 'Low', status: 'Pending', icon: '🟡' },
                    ].map(item => (
                      <div key={item.item} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-xs mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-white">{item.item}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.priority === 'High' ? 'bg-gym-rose/10 text-gym-rose border-gym-rose/20' :
                              item.priority === 'Medium' ? 'bg-gym-amber/10 text-gym-amber border-gym-amber/20' :
                              'bg-white/5 text-slate-400 border-white/10'
                            )}>{item.priority}</span>
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.status === 'Completed' ? 'bg-gym-accent/10 text-gym-accent border-gym-accent/20' :
                              item.status === 'In Progress' ? 'bg-gym-secondary/10 text-gym-secondary border-gym-secondary/20' :
                              'bg-white/5 text-slate-500 border-white/10'
                            )}>{item.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Marketing & Growth */}
                <GlassCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gym-amber/10 text-gym-amber"><Megaphone size={18} /></div>
                    <h3 className="text-base font-bold text-white">Marketing & Growth</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">Strategies to attract new members and retain existing ones.</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { item: 'Launch Instagram & YouTube content', priority: 'High', status: 'In Progress', icon: '🔵' },
                      { item: 'Run "First Month Free" campaign', priority: 'High', status: 'Planned', icon: '🟡' },
                      { item: 'Partner with local sports shops', priority: 'Medium', status: 'Pending', icon: '🟡' },
                      { item: 'Set up Google My Business reviews', priority: 'High', status: 'Completed', icon: '🟢' },
                      { item: 'Organize monthly fitness challenges', priority: 'Medium', status: 'In Progress', icon: '🔵' },
                      { item: 'Create transformation stories board', priority: 'Low', status: 'Planned', icon: '🟡' },
                      { item: 'Offer corporate group discounts', priority: 'Medium', status: 'Pending', icon: '🟡' },
                      { item: 'Distribute flyers in nearby areas', priority: 'Low', status: 'Completed', icon: '🟢' },
                    ].map(item => (
                      <div key={item.item} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-xs mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-white">{item.item}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.priority === 'High' ? 'bg-gym-rose/10 text-gym-rose border-gym-rose/20' :
                              item.priority === 'Medium' ? 'bg-gym-amber/10 text-gym-amber border-gym-amber/20' :
                              'bg-white/5 text-slate-400 border-white/10'
                            )}>{item.priority}</span>
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.status === 'Completed' ? 'bg-gym-accent/10 text-gym-accent border-gym-accent/20' :
                              item.status === 'In Progress' ? 'bg-gym-secondary/10 text-gym-secondary border-gym-secondary/20' :
                              'bg-white/5 text-slate-500 border-white/10'
                            )}>{item.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Staff & Training */}
                <GlassCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400"><UserCheck size={18} /></div>
                    <h3 className="text-base font-bold text-white">Staff & Training</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">Staff development, certifications & team improvements.</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { item: 'CPR & first aid training for all staff', priority: 'High', status: 'Planned', icon: '🟡' },
                      { item: 'Hire 2 more certified trainers', priority: 'High', status: 'In Progress', icon: '🔵' },
                      { item: 'Monthly staff performance reviews', priority: 'Medium', status: 'Pending', icon: '🟡' },
                      { item: 'Customer service workshop', priority: 'Medium', status: 'Completed', icon: '🟢' },
                      { item: 'Nutrition certification for trainers', priority: 'Medium', status: 'Planned', icon: '🟡' },
                      { item: 'Add night shift staff (10 PM - 6 AM)', priority: 'High', status: 'Pending', icon: '🔴' },
                      { item: 'Create trainer rotation schedule', priority: 'Low', status: 'Completed', icon: '🟢' },
                      { item: 'Introduce staff incentive program', priority: 'Medium', status: 'Pending', icon: '🟡' },
                    ].map(item => (
                      <div key={item.item} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-xs mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-white">{item.item}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.priority === 'High' ? 'bg-gym-rose/10 text-gym-rose border-gym-rose/20' :
                              item.priority === 'Medium' ? 'bg-gym-amber/10 text-gym-amber border-gym-amber/20' :
                              'bg-white/5 text-slate-400 border-white/10'
                            )}>{item.priority}</span>
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.status === 'Completed' ? 'bg-gym-accent/10 text-gym-accent border-gym-accent/20' :
                              item.status === 'In Progress' ? 'bg-gym-secondary/10 text-gym-secondary border-gym-secondary/20' :
                              'bg-white/5 text-slate-500 border-white/10'
                            )}>{item.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Revenue & Business */}
                <GlassCard>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gym-accent/10 text-gym-accent"><BarChart3 size={18} /></div>
                    <h3 className="text-base font-bold text-white">Revenue & Business</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">Business model, pricing & revenue optimization ideas.</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { item: 'Introduce premium membership tier', priority: 'High', status: 'In Progress', icon: '🔵' },
                      { item: 'Sell branded merchandise (shirts, bottles)', priority: 'Medium', status: 'Planned', icon: '🟡' },
                      { item: 'Add supplement vending machine', priority: 'Medium', status: 'Pending', icon: '🟡' },
                      { item: 'Offer annual membership discounts', priority: 'High', status: 'Completed', icon: '🟢' },
                      { item: 'Rent gym space for events/photoshoots', priority: 'Low', status: 'Planned', icon: '🟡' },
                      { item: 'Launch online coaching subscriptions', priority: 'High', status: 'Planned', icon: '🟡' },
                      { item: 'Set up automated billing system', priority: 'High', status: 'In Progress', icon: '🔵' },
                      { item: 'Add paid locker rentals', priority: 'Low', status: 'Pending', icon: '🟡' },
                    ].map(item => (
                      <div key={item.item} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-xs mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-white">{item.item}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.priority === 'High' ? 'bg-gym-rose/10 text-gym-rose border-gym-rose/20' :
                              item.priority === 'Medium' ? 'bg-gym-amber/10 text-gym-amber border-gym-amber/20' :
                              'bg-white/5 text-slate-400 border-white/10'
                            )}>{item.priority}</span>
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                              item.status === 'Completed' ? 'bg-gym-accent/10 text-gym-accent border-gym-accent/20' :
                              item.status === 'In Progress' ? 'bg-gym-secondary/10 text-gym-secondary border-gym-secondary/20' :
                              'bg-white/5 text-slate-500 border-white/10'
                            )}>{item.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

              </div>
            </motion.div>
          )}
        </AnimatePresence>


          {activeTab === 'balancesheet' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gym-accent/10 text-gym-accent"><Wallet size={22} /></div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Balance Sheet</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Track daily income & expenses — P&L auto-generated</p>
                  </div>
                </div>
                <button
                  onClick={() => setBsFormOpen(!bsFormOpen)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gym-accent/10 hover:bg-gym-accent/20 border border-gym-accent/30 text-gym-accent text-xs font-bold rounded-lg transition-all"
                >
                  <Plus size={14} />
                  Add Entry
                </button>
              </div>

              {/* Auto-generated Summary Cards */}
              {(() => {
                const totalIncome = balanceEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
                const totalExpense = balanceEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
                const netProfit = totalIncome - totalExpense;
                const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

                const incomeByCategory: Record<string, number> = {};
                const expenseByCategory: Record<string, number> = {};
                balanceEntries.forEach(e => {
                  if (e.type === 'income') incomeByCategory[e.category] = (incomeByCategory[e.category] || 0) + e.amount;
                  else expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
                });

                const filtered = bsFilter === 'all' ? balanceEntries : balanceEntries.filter(e => e.type === bsFilter);
                const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

                return (
                  <>
                    {/* P&L Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <GlassCard>
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowUpRight size={16} className="text-gym-accent" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Income</span>
                        </div>
                        <p className="text-2xl font-bold text-gym-accent flex items-center gap-1"><IndianRupee size={18} />{totalIncome.toLocaleString('en-IN')}</p>
                      </GlassCard>
                      <GlassCard>
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowDownRight size={16} className="text-gym-rose" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Expenses</span>
                        </div>
                        <p className="text-2xl font-bold text-gym-rose flex items-center gap-1"><IndianRupee size={18} />{totalExpense.toLocaleString('en-IN')}</p>
                      </GlassCard>
                      <GlassCard>
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet size={16} className={netProfit >= 0 ? "text-gym-accent" : "text-gym-rose"} />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</span>
                        </div>
                        <p className={cn("text-2xl font-bold flex items-center gap-1", netProfit >= 0 ? "text-gym-accent" : "text-gym-rose")}><IndianRupee size={18} />{Math.abs(netProfit).toLocaleString('en-IN')}</p>
                      </GlassCard>
                      <GlassCard>
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 size={16} className={netProfit >= 0 ? "text-gym-accent" : "text-gym-rose"} />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profit Margin</span>
                        </div>
                        <p className={cn("text-2xl font-bold", netProfit >= 0 ? "text-gym-accent" : "text-gym-rose")}>{profitMargin}%</p>
                      </GlassCard>
                    </div>

                    {/* Add Entry Form */}
                    <AnimatePresence>
                      {bsFormOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <GlassCard>
                            <h3 className="text-sm font-bold text-white mb-4">New Entry</h3>
                            <div className="flex flex-wrap items-end gap-3">
                              <div>
                                <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Type</label>
                                <div className="flex gap-1">
                                  <button onClick={() => setBsForm(f => ({ ...f, type: 'income', category: INCOME_CATEGORIES[0] }))}
                                    className={cn("px-3 py-2 text-xs font-bold rounded-lg border transition-all", bsForm.type === 'income' ? "bg-gym-accent/15 border-gym-accent/40 text-gym-accent" : "bg-white/5 border-white/10 text-slate-400")}
                                  >Income</button>
                                  <button onClick={() => setBsForm(f => ({ ...f, type: 'expense', category: EXPENSE_CATEGORIES[0] }))}
                                    className={cn("px-3 py-2 text-xs font-bold rounded-lg border transition-all", bsForm.type === 'expense' ? "bg-gym-rose/15 border-gym-rose/40 text-gym-rose" : "bg-white/5 border-white/10 text-slate-400")}
                                  >Expense</button>
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Date</label>
                                <input type="date" value={bsForm.date} onChange={e => setBsForm(f => ({ ...f, date: e.target.value }))}
                                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gym-accent/50" />
                              </div>
                              <div className="min-w-[160px]">
                                <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Category</label>
                                <select value={bsForm.category} onChange={e => setBsForm(f => ({ ...f, category: e.target.value }))}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gym-accent/50">
                                  {(bsForm.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                                    <option key={c} value={c} className="bg-[#1e293b]">{c}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1 min-w-[180px]">
                                <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Description</label>
                                <input type="text" placeholder="e.g. Monthly rent payment" value={bsForm.description} onChange={e => setBsForm(f => ({ ...f, description: e.target.value }))}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gym-accent/50 placeholder:text-slate-600" />
                              </div>
                              <div className="w-32">
                                <label className="text-[10px] font-semibold text-gym-accent/80 uppercase tracking-widest mb-1.5 block">Amount (₹)</label>
                                <input type="number" min={0} placeholder="0" value={bsForm.amount} onChange={e => setBsForm(f => ({ ...f, amount: e.target.value }))}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gym-accent/50 placeholder:text-slate-600" />
                              </div>
                              <button
                                onClick={() => {
                                  const amt = Number(bsForm.amount);
                                  if (!bsForm.description || !amt || amt <= 0) return;
                                  setBalanceEntries(prev => [...prev, { id: Date.now(), date: bsForm.date, type: bsForm.type, category: bsForm.category, description: bsForm.description, amount: amt }]);
                                  setBsForm(f => ({ ...f, description: '', amount: '' }));
                                }}
                                className="px-5 py-2 bg-gym-accent text-white text-sm font-bold rounded-lg hover:bg-gym-accent/80 transition-all shadow-lg shadow-gym-accent/20"
                              >Add</button>
                            </div>
                          </GlassCard>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Income & Expense Breakdown side by side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <GlassCard>
                        <div className="flex items-center gap-2 mb-4">
                          <ArrowUpRight size={16} className="text-gym-accent" />
                          <h3 className="text-sm font-bold text-white">Income Breakdown</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                          {Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                            <div key={cat} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                              <span className="text-xs font-medium text-white">{cat}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-gym-accent rounded-full" style={{ width: `${(amt / totalIncome) * 100}%` }} />
                                </div>
                                <span className="text-xs font-bold text-gym-accent flex items-center gap-0.5"><IndianRupee size={10} />{amt.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                      <GlassCard>
                        <div className="flex items-center gap-2 mb-4">
                          <ArrowDownRight size={16} className="text-gym-rose" />
                          <h3 className="text-sm font-bold text-white">Expense Breakdown</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                          {Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                            <div key={cat} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
                              <span className="text-xs font-medium text-white">{cat}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-gym-rose rounded-full" style={{ width: `${(amt / totalExpense) * 100}%` }} />
                                </div>
                                <span className="text-xs font-bold text-gym-rose flex items-center gap-0.5"><IndianRupee size={10} />{amt.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </div>

                    {/* Transaction Log */}
                    <GlassCard>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white">Transaction Log</h3>
                        <div className="flex gap-1">
                          {(['all', 'income', 'expense'] as const).map(f => (
                            <button key={f} onClick={() => setBsFilter(f)}
                              className={cn("px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all uppercase",
                                bsFilter === f
                                  ? f === 'income' ? "bg-gym-accent/15 border-gym-accent/30 text-gym-accent"
                                    : f === 'expense' ? "bg-gym-rose/15 border-gym-rose/30 text-gym-rose"
                                    : "bg-white/10 border-white/20 text-white"
                                  : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                              )}
                            >{f}</button>
                          ))}
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-2 pr-4">Date</th>
                              <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-2 pr-4">Type</th>
                              <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-2 pr-4">Category</th>
                              <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-2 pr-4">Description</th>
                              <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-2 text-right">Amount</th>
                              <th className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pb-2 text-right w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {sorted.map(entry => (
                              <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="py-2.5 pr-4 text-xs text-slate-400">{entry.date}</td>
                                <td className="py-2.5 pr-4">
                                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                    entry.type === 'income' ? "bg-gym-accent/10 text-gym-accent border-gym-accent/20" : "bg-gym-rose/10 text-gym-rose border-gym-rose/20"
                                  )}>{entry.type}</span>
                                </td>
                                <td className="py-2.5 pr-4 text-xs font-medium text-white">{entry.category}</td>
                                <td className="py-2.5 pr-4 text-xs text-slate-400">{entry.description}</td>
                                <td className={cn("py-2.5 text-xs font-bold text-right flex items-center justify-end gap-0.5", entry.type === 'income' ? "text-gym-accent" : "text-gym-rose")}>
                                  {entry.type === 'income' ? '+' : '-'}<IndianRupee size={10} />{entry.amount.toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 text-right">
                                  <button onClick={() => setBalanceEntries(prev => prev.filter(e => e.id !== entry.id))}
                                    className="text-slate-600 hover:text-gym-rose transition-colors"><Trash2 size={12} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </GlassCard>
                  </>
                );
              })()}
            </motion.div>
          )}

        {/* Add Member Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-xl z-10 overflow-hidden rounded-3xl max-h-[95vh] flex flex-col"
              >
                {/* Top gradient banner */}
                <div className="relative bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 px-6 pt-5 pb-10 shrink-0">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                  <div className="relative flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={16} className="text-white/80" />
                        <span className="text-white/80 text-xs font-medium tracking-wide uppercase">New Registration</span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-white">Add New Member</h3>
                    </div>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-all">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Scrollable form body */}
                <div className="bg-[#0f1729] px-6 pt-0 pb-5 -mt-5 rounded-t-3xl relative overflow-y-auto flex-1">
                  <form onSubmit={handleAddMember} className="flex flex-col gap-2.5 pt-5">
                    {/* Name & Email row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="group relative">
                        <label className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-1 block">Full Name</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                          <input
                            required
                            type="text"
                            placeholder="e.g. John Doe"
                            value={newMember.name}
                            onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.03] text-white placeholder-slate-600 transition-all"
                          />
                        </div>
                      </div>
                      <div className="group relative">
                        <label className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-1 block">Email Address</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                          <input
                            required
                            type="email"
                            placeholder="john@example.com"
                            value={newMember.email}
                            onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.03] text-white placeholder-slate-600 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Plan & Date row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="group relative">
                        <label className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-1 block">Membership Plan</label>
                        <div className="relative">
                          <Crown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                          <select
                            value={newMember.membership_type}
                            onChange={(e) => setNewMember({...newMember, membership_type: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white appearance-none transition-all cursor-pointer"
                          >
                            <option value="Basic" className="bg-[#0f1729]">Basic</option>
                            <option value="Standard" className="bg-[#0f1729]">Standard</option>
                            <option value="Premium" className="bg-[#0f1729]">Premium</option>
                          </select>
                        </div>
                      </div>
                      <div className="group relative">
                        <label className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-1 block">Expiry Date</label>
                        <div className="relative">
                          <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                          <input
                            required
                            type="date"
                            value={newMember.expiry_date}
                            onChange={(e) => setNewMember({...newMember, expiry_date: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Age, Height, Weight row */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="group relative">
                        <label className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-1 block">Age</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                          <input
                            type="number"
                            placeholder="e.g. 25"
                            value={newMember.age}
                            onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.03] text-white placeholder-slate-600 transition-all"
                          />
                        </div>
                      </div>
                      <div className="group relative">
                        <label className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-1 block">Height</label>
                        <div className="relative">
                          <Ruler size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                          <input
                            type="text"
                            placeholder={'e.g. 5\'10"'}
                            value={newMember.height}
                            onChange={(e) => setNewMember({...newMember, height: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.03] text-white placeholder-slate-600 transition-all"
                          />
                        </div>
                      </div>
                      <div className="group relative">
                        <label className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-1 block">Weight</label>
                        <div className="relative">
                          <Weight size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                          <input
                            type="text"
                            placeholder="e.g. 75kg"
                            value={newMember.weight}
                            onChange={(e) => setNewMember({...newMember, weight: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.03] text-white placeholder-slate-600 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Body Target & Timing row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="group relative">
                        <label className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-1 block">Body Target</label>
                        <div className="relative">
                          <Crosshair size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                          <input
                            type="text"
                            placeholder="e.g. 70kg, Lean"
                            value={newMember.body_target}
                            onChange={(e) => setNewMember({...newMember, body_target: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.03] text-white placeholder-slate-600 transition-all"
                          />
                        </div>
                      </div>
                      <div className="group relative">
                        <label className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-1 block">Timing</label>
                        <div className="relative">
                          <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                          <select
                            value={newMember.timing}
                            onChange={(e) => setNewMember({...newMember, timing: e.target.value})}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/50 text-white appearance-none transition-all cursor-pointer"
                          >
                            <option value="" className="bg-[#0f1729]">Select slot</option>
                            <option value="Morning (6AM-10AM)" className="bg-[#0f1729]">Morning (6AM-10AM)</option>
                            <option value="Afternoon (10AM-2PM)" className="bg-[#0f1729]">Afternoon (10AM-2PM)</option>
                            <option value="Evening (4PM-8PM)" className="bg-[#0f1729]">Evening (4PM-8PM)</option>
                            <option value="Night (8PM-11PM)" className="bg-[#0f1729]">Night (8PM-11PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Fitness Goal */}
                    <div className="group relative">
                      <label className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-widest mb-1 block">Fitness Goal</label>
                      <div className="relative">
                        <Target size={14} className="absolute left-3 top-3 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                        <textarea
                          placeholder="e.g. Weight loss, Muscle gain"
                          value={newMember.goal}
                          onChange={(e) => setNewMember({...newMember, goal: e.target.value})}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/[0.03] text-white placeholder-slate-600 h-16 resize-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all mt-1 flex items-center justify-center gap-2"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                      Create Member Account
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
