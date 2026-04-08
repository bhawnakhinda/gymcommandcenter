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
  IndianRupee,
  Pencil
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
        : "text-white hover:text-white hover:bg-white/5"
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
  const [memberPage, setMemberPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [gymSettings, setGymSettings] = useState({
    gymName: 'Tycoon Gym & Spa',
    ownerName: 'Commander',
    email: 'admin@tycoongym.com',
    phone: '+91 98765 43210',
    address: 'Main Street, City Center',
    openTime: '05:00',
    closeTime: '23:00',
    currency: 'INR',
    notifications: true,
    darkMode: true,
    autoBackup: true,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
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
  const [scheduleViewMode, setScheduleView] = useState<'Classes' | 'PT Sessions' | 'Reminders'>('Classes');
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

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember)
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingMember(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error("Failed to update member", error);
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      const res = await fetch(`/api/members/${deletingMember.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setDeletingMember(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error("Failed to delete member", error);
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
              <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSelectedMemberId(null); setMemberProfile(null); setIsSidebarOpen(false); }} />
              <SidebarItem icon={LogOut} label="Logout" onClick={() => { if (confirm('Are you sure you want to logout?')) { window.location.reload(); } }} />
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
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
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
                  <button
                    onClick={() => { setActiveTab('programs'); setSelectedMemberId(null); setMemberProfile(null); setExpandedProgram(null); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gym-secondary/30 bg-gym-secondary/10 text-gym-secondary hover:bg-gym-secondary/20 transition-all whitespace-nowrap ml-2"
                  >
                    <Dumbbell size={15} />
                    Programs
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => { setActiveTab('nutrition'); setSelectedMemberId(null); setMemberProfile(null); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gym-accent/30 bg-gym-accent/10 text-gym-accent hover:bg-gym-accent/20 transition-all whitespace-nowrap"
                  >
                    <Apple size={15} />
                    Nutrition
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {(() => {
                const filtered = members.filter(m => {
                  const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      m.email.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesFilter = filterStatus === 'All' || m.status.toLowerCase() === filterStatus.toLowerCase();
                  return matchesSearch && matchesFilter;
                });
                const MEMBERS_PER_PAGE = 8;
                const totalPages = Math.ceil(filtered.length / MEMBERS_PER_PAGE);
                const currentPage = Math.min(memberPage || 1, totalPages || 1);
                const paged = filtered.slice((currentPage - 1) * MEMBERS_PER_PAGE, currentPage * MEMBERS_PER_PAGE);
                return (
                  <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {paged.map((member) => (
                <GlassCard key={member.id} className="flex flex-col gap-2 !p-3 cursor-pointer" onClick={() => { setSelectedMemberId(member.id); fetchMemberProfile(member.id); }}>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={`https://picsum.photos/seed/${member.id}/200/200`} alt={member.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-white truncate">{member.name}</h3>
                      <p className="text-[9px] text-slate-400 truncate">{member.email}</p>
                    </div>
                    <span className={cn(
                      "text-[7px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0",
                      member.status === 'active' ? "text-gym-accent bg-gym-accent/10 border-gym-accent/20" :
                      member.status === 'expiring' ? "text-gym-amber bg-gym-amber/10 border-gym-amber/20" :
                      "text-gym-rose bg-gym-rose/10 border-gym-rose/20"
                    )}>
                      {member.status}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedMemberId(member.id); fetchMemberProfile(member.id); }}
                      className="flex-1 py-1.5 bg-gym-accent/10 hover:bg-gym-accent/20 text-gym-accent text-[10px] font-bold rounded-lg transition-all"
                    >
                      Manage Profile
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingMember({...member}); setIsEditModalOpen(true); }}
                      className="py-1.5 px-2.5 bg-gym-secondary/10 hover:bg-gym-secondary/20 text-gym-secondary text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                    >
                      <Pencil size={10} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingMember(member); setIsDeleteModalOpen(true); }}
                      className="py-1.5 px-2.5 bg-gym-rose/10 hover:bg-gym-rose/20 text-gym-rose text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </GlassCard>
              ))}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 text-slate-500 hover:text-gym-accent hover:border-gym-accent/50 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gym-accent/10 transition-all">
                  <Plus size={18} />
                </div>
                <span className="font-bold text-[10px]">Add New Member</span>
              </button>
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button onClick={() => setMemberPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white disabled:opacity-30 transition-all">← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setMemberPage(p)}
                      className={cn("w-7 h-7 rounded-lg text-xs font-bold transition-all",
                        p === currentPage ? 'bg-gym-accent text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10')}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setMemberPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white disabled:opacity-30 transition-all">Next →</button>
                </div>
              )}
                  </>
                );
              })()}
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
              className="flex flex-col gap-2"
            >
              {/* Back Button */}
              <button onClick={handleBackToMembers} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors w-fit text-xs">
                <ArrowLeft size={14} />
                <span className="font-medium">Back to Members</span>
              </button>

              {/* Profile Header */}
              <GlassCard className="relative overflow-hidden !py-3 !px-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gym-accent via-cyan-500 to-gym-secondary" />
                <div className="flex items-center gap-4 pt-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gym-accent/30 shadow-lg shadow-gym-accent/10 shrink-0">
                    <img src={`https://picsum.photos/seed/${memberProfile.member.id}/200/200`} alt={memberProfile.member.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{memberProfile.member.name}</h2>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border",
                        memberProfile.member.status === 'active' ? "text-gym-accent bg-gym-accent/10 border-gym-accent/20" :
                        memberProfile.member.status === 'expiring' ? "text-gym-amber bg-gym-amber/10 border-gym-amber/20" :
                        "text-gym-rose bg-gym-rose/10 border-gym-rose/20"
                      )}>
                        {memberProfile.member.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{memberProfile.member.email}</p>
                    <div className="flex items-center gap-4 mt-0.5 text-xs text-slate-500">
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
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
              <div className="lg:col-span-3">
              <GlassCard className="!p-0">
                <details>
                <summary className="flex items-center justify-between px-4 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gym-secondary/10 text-gym-secondary"><Dumbbell size={13} /></div>
                    <h3 className="text-xs font-bold text-white">Program Schedule</h3>
                    <span className="text-[9px] text-slate-500">({(() => { const progs: AssignedProgram[] = memberPrograms.get(selectedMemberId!) ?? []; return progs.length; })() } assigned)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAssignOpen(!assignOpen); }}
                      className="flex items-center gap-1 px-2 py-1 bg-gym-accent/10 hover:bg-gym-accent/20 border border-gym-accent/30 text-gym-accent text-[9px] font-bold rounded-md transition-all"
                    >
                      <Plus size={10} />
                      Assign
                    </button>
                    <ChevronDown size={14} className="text-slate-400 transition-transform [details[open]>&]:rotate-180" />
                  </div>
                </summary>
                <div className="px-4 pb-3">

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
                </div>
                </details>
              </GlassCard>
              </div>

              {/* Body Stats + Goals + Activity + Risk — compact inline row */}
              <div className="lg:col-span-2 grid grid-cols-4 gap-2">
                <GlassCard className="!p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 rounded bg-gym-accent/10 text-gym-accent"><User size={11} /></div>
                    <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">Body Stats</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div><p className="text-[7px] text-slate-500 uppercase font-bold">Age</p><p className="text-sm font-bold text-white">{memberProfile.member.age || '--'}</p></div>
                    <div><p className="text-[7px] text-slate-500 uppercase font-bold">Height</p><p className="text-sm font-bold text-white">{memberProfile.member.height || '--'}</p></div>
                    <div><p className="text-[7px] text-slate-500 uppercase font-bold">Weight</p><p className="text-sm font-bold text-white">{memberProfile.member.weight || '--'}</p></div>
                  </div>
                </GlassCard>

                <GlassCard className="!p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 rounded bg-gym-secondary/10 text-gym-secondary"><Target size={11} /></div>
                    <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">Goals</span>
                  </div>
                  <p className="text-[10px] font-bold text-white">{memberProfile.member.body_target || '--'}</p>
                  <p className="text-[8px] text-slate-500 mt-0.5">{memberProfile.member.timing || '--'}</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">{memberProfile.member.goal || 'Not set'}</p>
                </GlassCard>

                <GlassCard className="!p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 rounded bg-gym-accent/10 text-gym-accent"><Activity size={11} /></div>
                    <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">Activity</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div><p className="text-[7px] text-slate-500 uppercase font-bold">Visits (30d)</p><p className="text-lg font-bold text-white">{memberProfile.riskFactors.attendanceRate}</p></div>
                    <div><p className="text-[7px] text-slate-500 uppercase font-bold">Last Visit</p><p className="text-[10px] font-bold text-white">{memberProfile.member.last_visit || 'Never'}</p></div>
                  </div>
                </GlassCard>

                <GlassCard className="!p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={cn("p-1 rounded", memberProfile.riskScore > 60 ? "bg-gym-rose/10 text-gym-rose" : memberProfile.riskScore > 30 ? "bg-gym-amber/10 text-gym-amber" : "bg-gym-accent/10 text-gym-accent")}>
                      <AlertTriangle size={11} />
                    </div>
                    <span className="text-[8px] text-slate-400 uppercase tracking-wider font-bold">Quit Risk</span>
                  </div>
                  <p className={cn("text-2xl font-bold", memberProfile.riskScore > 60 ? "text-gym-rose" : memberProfile.riskScore > 30 ? "text-gym-amber" : "text-gym-accent")}>
                    {memberProfile.riskScore}%
                  </p>
                  <p className="text-[8px] text-slate-500">
                    {memberProfile.riskScore > 60 ? 'High Risk' : memberProfile.riskScore > 30 ? 'Moderate' : 'Low Risk'}
                  </p>
                </GlassCard>
              </div>
              </div>

              {/* Diet Plan */}
              <GlassCard className="!p-0">
                <details>
                  <summary className="flex items-center gap-3 px-4 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
                    <div className="p-1.5 rounded-lg bg-gym-accent/10 text-gym-accent"><Utensils size={14} /></div>
                    <h3 className="text-sm font-bold text-white flex-1">Diet Plan</h3>
                    <span className="text-[10px] text-slate-500 mr-2">
                      {memberProfile.dietPlan.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)} cal/day
                    </span>
                    <ChevronDown size={14} className="text-slate-400 transition-transform [details[open]>&]:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {memberProfile.dietPlan.map((meal: any) => (
                        <div key={meal.id} className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-bold text-white">{meal.meal_type}</h4>
                            <span className="text-gym-accent text-[10px] font-bold">{meal.calories} cal</span>
                          </div>
                          <p className="text-[10px] text-slate-300 mb-1.5 line-clamp-2">{meal.food_items}</p>
                          <div className="flex gap-1 text-[8px]">
                            <span className="px-1.5 py-0.5 rounded bg-gym-accent/10 text-gym-accent">P:{meal.protein}g</span>
                            <span className="px-1.5 py-0.5 rounded bg-gym-amber/10 text-gym-amber">C:{meal.carbs}g</span>
                            <span className="px-1.5 py-0.5 rounded bg-gym-rose/10 text-gym-rose">F:{meal.fats}g</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </GlassCard>

              {/* Attendance + Supplements */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <GlassCard className="lg:col-span-2 !p-0">
                  <details>
                    <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
                      <div className="p-1.5 rounded-lg bg-gym-secondary/10 text-gym-secondary"><Activity size={14} /></div>
                      <h3 className="text-sm font-bold text-white flex-1">Attendance Pattern</h3>
                      <span className="text-[10px] text-slate-500 mr-2">Last 30 days</span>
                      <ChevronDown size={14} className="text-slate-400 transition-transform [details[open]>&]:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4">
                      <div className="min-h-[200px]">
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
                    </div>
                  </details>
                </GlassCard>

                <GlassCard className="!p-0">
                  <details>
                    <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
                      <div className="p-1.5 rounded-lg bg-gym-amber/10 text-gym-amber"><Pill size={14} /></div>
                      <h3 className="text-sm font-bold text-white flex-1">Supplements</h3>
                      <ChevronDown size={14} className="text-slate-400 transition-transform [details[open]>&]:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4">
                      <div className="flex flex-col gap-3 overflow-y-auto max-h-[220px]">
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
                    </div>
                  </details>
                </GlassCard>
              </div>

              {/* Payments + Trainer Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <GlassCard className="lg:col-span-2 !p-0">
                  <details>
                    <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
                      <div className="p-1.5 rounded-lg bg-gym-accent/10 text-gym-accent"><CreditCard size={14} /></div>
                      <h3 className="text-sm font-bold text-white flex-1">Payment Behavior</h3>
                      <ChevronDown size={14} className="text-slate-400 transition-transform [details[open]>&]:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4">
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
                    </div>
                  </details>
                </GlassCard>

                <GlassCard className="!p-0">
                  <details>
                    <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
                      <div className="p-1.5 rounded-lg bg-gym-secondary/10 text-gym-secondary"><MessageSquare size={14} /></div>
                      <h3 className="text-sm font-bold text-white flex-1">Trainer Notes</h3>
                      <ChevronDown size={14} className="text-slate-400 transition-transform [details[open]>&]:rotate-180" />
                    </summary>
                    <div className="px-4 pb-4">
                      <div className="flex flex-col gap-4 overflow-y-auto max-h-[280px]">
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
                    </div>
                  </details>
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

          {activeTab === 'schedule' && (() => {
            const MOCK_PT_SESSIONS = [
              { id: 1, client: 'Alex Johnson', trainer: 'Raj Patel', date: '2026-03-27', time: '7:00 AM', duration: '60 min', type: 'Strength', status: 'Confirmed' },
              { id: 2, client: 'Sarah Kim', trainer: 'Lisa Chen', date: '2026-03-27', time: '9:00 AM', duration: '45 min', type: 'Cardio', status: 'Confirmed' },
              { id: 3, client: 'Mike Torres', trainer: 'Raj Patel', date: '2026-03-27', time: '11:00 AM', duration: '60 min', type: 'CrossFit', status: 'Pending' },
              { id: 4, client: 'Emma Davis', trainer: 'Alex Carter', date: '2026-03-28', time: '8:00 AM', duration: '45 min', type: 'Yoga', status: 'Confirmed' },
              { id: 5, client: 'John Lee', trainer: 'Lisa Chen', date: '2026-03-28', time: '10:00 AM', duration: '60 min', type: 'Strength', status: 'Cancelled' },
              { id: 6, client: 'Priya Sharma', trainer: 'Raj Patel', date: '2026-03-29', time: '6:30 AM', duration: '60 min', type: 'HIIT', status: 'Confirmed' },
            ];
            const MOCK_GROUP_CLASSES = [
              { id: 1, name: 'Zumba', trainer: 'Lisa Chen', day: 'Monday', time: '6:00 AM - 7:00 AM', capacity: 30, enrolled: 28, location: 'Studio A', category: 'Cardio' },
              { id: 2, name: 'Power Yoga', trainer: 'Alex Carter', day: 'Monday', time: '8:00 AM - 9:00 AM', capacity: 20, enrolled: 15, location: 'Studio B', category: 'Flexibility' },
              { id: 3, name: 'CrossFit WOD', trainer: 'Raj Patel', day: 'Monday', time: '10:00 AM - 11:00 AM', capacity: 15, enrolled: 14, location: 'Main Floor', category: 'Strength' },
              { id: 4, name: 'Spin Class', trainer: 'Lisa Chen', day: 'Tuesday', time: '6:00 AM - 6:45 AM', capacity: 25, enrolled: 22, location: 'Spin Room', category: 'Cardio' },
              { id: 5, name: 'Boxing Basics', trainer: 'Mike Torres', day: 'Tuesday', time: '7:00 AM - 8:00 AM', capacity: 12, enrolled: 10, location: 'Combat Zone', category: 'Combat' },
              { id: 6, name: 'Pilates Core', trainer: 'Alex Carter', day: 'Wednesday', time: '9:00 AM - 10:00 AM', capacity: 18, enrolled: 16, location: 'Studio B', category: 'Flexibility' },
              { id: 7, name: 'HIIT Blast', trainer: 'Raj Patel', day: 'Wednesday', time: '5:30 PM - 6:15 PM', capacity: 20, enrolled: 20, location: 'Main Floor', category: 'Cardio' },
              { id: 8, name: 'Zumba', trainer: 'Lisa Chen', day: 'Thursday', time: '6:00 AM - 7:00 AM', capacity: 30, enrolled: 25, location: 'Studio A', category: 'Cardio' },
              { id: 9, name: 'Strength Circuit', trainer: 'Raj Patel', day: 'Thursday', time: '7:00 PM - 8:00 PM', capacity: 15, enrolled: 8, location: 'Main Floor', category: 'Strength' },
              { id: 10, name: 'Yoga Flow', trainer: 'Alex Carter', day: 'Friday', time: '7:00 AM - 8:00 AM', capacity: 20, enrolled: 18, location: 'Studio B', category: 'Flexibility' },
              { id: 11, name: 'Kickboxing', trainer: 'Mike Torres', day: 'Friday', time: '6:00 PM - 7:00 PM', capacity: 12, enrolled: 11, location: 'Combat Zone', category: 'Combat' },
              { id: 12, name: 'Weekend Warrior', trainer: 'Raj Patel', day: 'Saturday', time: '8:00 AM - 9:30 AM', capacity: 25, enrolled: 20, location: 'Main Floor', category: 'Strength' },
            ];
            const REMINDERS = [
              { id: 1, client: 'Alex Johnson', class: 'CrossFit WOD', time: '10:00 AM', type: 'SMS', status: 'Sent' },
              { id: 2, client: 'Sarah Kim', class: 'Spin Class', time: '6:00 AM', type: 'Email', status: 'Sent' },
              { id: 3, client: 'Emma Davis', class: 'Power Yoga', time: '8:00 AM', type: 'Push', status: 'Pending' },
              { id: 4, client: 'Priya Sharma', class: 'HIIT Blast', time: '5:30 PM', type: 'SMS', status: 'Scheduled' },
            ];
            const allClasses = scheduleData ? scheduleData.classes : [];
            const mergedClasses = allClasses.length > 0 ? allClasses : MOCK_GROUP_CLASSES.map((c, i) => ({ id: c.id, class_name: c.name, trainer_name: c.trainer, day_of_week: c.day, start_time: c.time.split(' - ')[0], end_time: c.time.split(' - ')[1] || '', capacity: c.capacity, enrolled: c.enrolled, location: c.location, category: c.category }));
            const dayClasses = mergedClasses.filter(c => c.day_of_week === scheduleDay);
            const totalPT = MOCK_PT_SESSIONS.length;
            const confirmedPT = MOCK_PT_SESSIONS.filter(s => s.status === 'Confirmed').length;
            const totalGroupCap = mergedClasses.reduce((a, c) => a + c.capacity, 0);
            const totalGroupEnrolled = mergedClasses.reduce((a, c) => a + c.enrolled, 0);
            const scheduleViewTabs = ['Classes', 'PT Sessions', 'Reminders'] as const;
            return (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-3"
            >
              {/* Stats Row */}
              <GlassCard className="!p-0">
                <div className="grid grid-cols-5 divide-x divide-white/5">
                  {[
                    { icon: <Calendar size={16} className="text-gym-accent" />, val: mergedClasses.length, lbl: 'TOTAL CLASSES' },
                    { icon: <Dumbbell size={16} className="text-gym-secondary" />, val: totalPT, lbl: 'PT SESSIONS' },
                    { icon: <Users size={16} className="text-gym-amber" />, val: totalGroupCap, lbl: 'TOTAL CAPACITY' },
                    { icon: <TrendingUp size={16} className="text-gym-accent" />, val: totalGroupCap > 0 ? Math.round((totalGroupEnrolled / totalGroupCap) * 100) + '%' : '0%', lbl: 'AVG ENROLLMENT' },
                    { icon: <Clock size={16} className="text-gym-rose" />, val: REMINDERS.length, lbl: 'REMINDERS' },
                  ].map(s => (
                    <div key={s.lbl} className="flex items-center gap-2 px-4 py-2">
                      {s.icon}
                      <div>
                        <div className="text-lg font-black text-white">{s.val}</div>
                        <div className="text-[8px] text-white uppercase tracking-widest font-bold">{s.lbl}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* View Tabs + Day Filter */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1.5">
                  {scheduleViewTabs.map(tab => (
                    <button key={tab} onClick={() => setScheduleView(tab)}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        scheduleViewMode === tab ? 'bg-gym-accent text-white' : 'bg-white/5 text-slate-400 hover:text-white')}>
                      {tab === 'Classes' && <Calendar size={11} className="inline mr-1" />}
                      {tab === 'PT Sessions' && <Dumbbell size={11} className="inline mr-1" />}
                      {tab === 'Reminders' && <Clock size={11} className="inline mr-1" />}
                      {tab}
                    </button>
                  ))}
                </div>
                {scheduleViewMode === 'Classes' && (
                  <div className="flex gap-1">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <button key={day} onClick={() => setScheduleDay(day)}
                        className={cn("px-2 py-1 rounded-md text-[10px] font-bold transition-all",
                          day === scheduleDay ? "bg-gym-accent/20 text-gym-accent" : "text-slate-500 hover:text-white")}>
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Classes View */}
              {scheduleViewMode === 'Classes' && (
                <>
                  <div className="text-[10px] text-slate-500"><span className="text-gym-accent font-bold">{dayClasses.length}</span> classes on {scheduleDay}</div>
                  <GlassCard className="!p-0">
                    {/* Table header */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                      <span className="w-[160px]">Class</span>
                      <span className="w-[80px]">Category</span>
                      <span className="w-[100px]">Time</span>
                      <span className="w-[120px]">Trainer</span>
                      <span className="w-[100px]">Location</span>
                      <span className="flex-1">Capacity</span>
                      <span className="w-[70px] text-center">Status</span>
                    </div>
                    {dayClasses.length > 0 ? dayClasses.map((cls, idx) => {
                      const pct = cls.capacity > 0 ? (cls.enrolled / cls.capacity) * 100 : 0;
                      const isFull = pct >= 100;
                      return (
                        <div key={cls.id} className={cn("flex items-center gap-2 px-3 py-2 hover:bg-white/[0.03] transition-all border-b border-white/5 last:border-0",
                          idx % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                          <div className="w-[160px]">
                            <span className="text-xs font-bold text-white">{cls.class_name}</span>
                          </div>
                          <div className="w-[80px]">
                            <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border",
                              cls.category === 'Cardio' ? "text-gym-rose bg-gym-rose/10 border-gym-rose/20" :
                              cls.category === 'Strength' ? "text-gym-accent bg-gym-accent/10 border-gym-accent/20" :
                              cls.category === 'Flexibility' ? "text-gym-secondary bg-gym-secondary/10 border-gym-secondary/20" :
                              cls.category === 'Combat' ? "text-gym-amber bg-gym-amber/10 border-gym-amber/20" :
                              "text-slate-400 bg-white/5 border-white/10"
                            )}>{cls.category}</span>
                          </div>
                          <div className="w-[100px] text-[10px] text-slate-300">{cls.start_time}{cls.end_time ? ` - ${cls.end_time}` : ''}</div>
                          <div className="w-[120px] text-[10px] text-slate-300 flex items-center gap-1"><UserCheck size={10} className="text-slate-500" />{cls.trainer_name || 'Open'}</div>
                          <div className="w-[100px] text-[10px] text-slate-400 flex items-center gap-1"><MapPin size={10} className="text-slate-600" />{cls.location}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full", pct > 80 ? 'bg-gym-rose' : pct > 50 ? 'bg-gym-amber' : 'bg-gym-accent')}
                                  style={{ width: `${Math.min(100, pct)}%` }} />
                              </div>
                              <span className="text-[9px] font-bold text-white shrink-0">{cls.enrolled}/{cls.capacity}</span>
                            </div>
                          </div>
                          <div className="w-[70px] text-center">
                            <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded",
                              isFull ? 'text-gym-rose bg-gym-rose/10' : 'text-gym-accent bg-gym-accent/10')}>
                              {isFull ? 'FULL' : 'OPEN'}
                            </span>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-8 text-slate-500">
                        <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No classes on {scheduleDay}</p>
                      </div>
                    )}
                  </GlassCard>
                </>
              )}

              {/* PT Sessions View */}
              {scheduleViewMode === 'PT Sessions' && (
                <GlassCard className="!p-0">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    <span className="w-[140px]">Client</span>
                    <span className="w-[120px]">Trainer</span>
                    <span className="w-[100px]">Date</span>
                    <span className="w-[80px]">Time</span>
                    <span className="w-[70px]">Duration</span>
                    <span className="w-[80px]">Type</span>
                    <span className="flex-1 text-center">Status</span>
                  </div>
                  {MOCK_PT_SESSIONS.map((s, idx) => (
                    <div key={s.id} className={cn("flex items-center gap-2 px-3 py-2 hover:bg-white/[0.03] transition-all border-b border-white/5 last:border-0",
                      idx % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                      <div className="w-[140px] text-xs font-bold text-white">{s.client}</div>
                      <div className="w-[120px] text-[10px] text-slate-300 flex items-center gap-1"><UserCheck size={10} className="text-slate-500" />{s.trainer}</div>
                      <div className="w-[100px] text-[10px] text-slate-400">{s.date}</div>
                      <div className="w-[80px] text-[10px] text-white font-semibold">{s.time}</div>
                      <div className="w-[70px] text-[10px] text-slate-400">{s.duration}</div>
                      <div className="w-[80px]">
                        <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border",
                          s.type === 'Strength' ? "text-gym-accent bg-gym-accent/10 border-gym-accent/20" :
                          s.type === 'Cardio' ? "text-gym-rose bg-gym-rose/10 border-gym-rose/20" :
                          s.type === 'CrossFit' || s.type === 'HIIT' ? "text-gym-amber bg-gym-amber/10 border-gym-amber/20" :
                          "text-gym-secondary bg-gym-secondary/10 border-gym-secondary/20"
                        )}>{s.type}</span>
                      </div>
                      <div className="flex-1 text-center">
                        <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded",
                          s.status === 'Confirmed' ? 'text-gym-accent bg-gym-accent/10' :
                          s.status === 'Pending' ? 'text-gym-amber bg-gym-amber/10' :
                          'text-gym-rose bg-gym-rose/10')}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </GlassCard>
              )}

              {/* Reminders View */}
              {scheduleViewMode === 'Reminders' && (
                <GlassCard className="!p-0">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    <span className="w-[140px]">Client</span>
                    <span className="w-[140px]">Class</span>
                    <span className="w-[80px]">Time</span>
                    <span className="w-[80px]">Channel</span>
                    <span className="flex-1 text-center">Status</span>
                  </div>
                  {REMINDERS.map((r, idx) => (
                    <div key={r.id} className={cn("flex items-center gap-2 px-3 py-2 hover:bg-white/[0.03] transition-all border-b border-white/5 last:border-0",
                      idx % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                      <div className="w-[140px] text-xs font-bold text-white">{r.client}</div>
                      <div className="w-[140px] text-[10px] text-slate-300">{r.class}</div>
                      <div className="w-[80px] text-[10px] text-white font-semibold">{r.time}</div>
                      <div className="w-[80px]">
                        <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                          r.type === 'SMS' ? 'text-sky-400 bg-sky-400/10 border-sky-400/20' :
                          r.type === 'Email' ? 'text-gym-secondary bg-gym-secondary/10 border-gym-secondary/20' :
                          'text-gym-amber bg-gym-amber/10 border-gym-amber/20'
                        )}>{r.type}</span>
                      </div>
                      <div className="flex-1 text-center">
                        <span className={cn("text-[8px] font-bold px-2 py-0.5 rounded",
                          r.status === 'Sent' ? 'text-gym-accent bg-gym-accent/10' :
                          r.status === 'Scheduled' ? 'text-gym-amber bg-gym-amber/10' :
                          'text-slate-400 bg-white/5')}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </GlassCard>
              )}
            </motion.div>
            );
          })()}
          {activeTab === 'programs' && (
            <WorkoutProgramsManagement onNavigateToMembers={() => { setActiveTab('members'); setSelectedMemberId(null); setMemberProfile(null); }} onNavigateToNutrition={() => { setActiveTab('nutrition'); }} />
          )}

          {activeTab === 'nutrition' && <NutritionPlansManagement onNavigateToMembers={() => { setActiveTab('members'); setSelectedMemberId(null); setMemberProfile(null); }} onNavigateToPrograms={() => { setActiveTab('programs'); }} />}

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

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Gym Profile */}
              <GlassCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gym-accent/10 border border-gym-accent/20 flex items-center justify-center">
                    <Dumbbell size={20} className="text-gym-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Gym Profile</h3>
                    <p className="text-[10px] text-slate-400">Basic information about your gym</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gym Name</label>
                    <input type="text" value={gymSettings.gymName} onChange={(e) => setGymSettings({...gymSettings, gymName: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-gym-accent/50 text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner Name</label>
                    <input type="text" value={gymSettings.ownerName} onChange={(e) => setGymSettings({...gymSettings, ownerName: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-gym-accent/50 text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                    <input type="email" value={gymSettings.email} onChange={(e) => setGymSettings({...gymSettings, email: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-gym-accent/50 text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                    <input type="tel" value={gymSettings.phone} onChange={(e) => setGymSettings({...gymSettings, phone: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-gym-accent/50 text-white" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</label>
                    <input type="text" value={gymSettings.address} onChange={(e) => setGymSettings({...gymSettings, address: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-gym-accent/50 text-white" />
                  </div>
                </div>
              </GlassCard>

              {/* Business Hours & Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gym-secondary/10 border border-gym-secondary/20 flex items-center justify-center">
                      <Clock size={20} className="text-gym-secondary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Business Hours</h3>
                      <p className="text-[10px] text-slate-400">Set your gym's operating hours</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opening Time</label>
                      <input type="time" value={gymSettings.openTime} onChange={(e) => setGymSettings({...gymSettings, openTime: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-gym-accent/50 text-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Closing Time</label>
                      <input type="time" value={gymSettings.closeTime} onChange={(e) => setGymSettings({...gymSettings, closeTime: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-gym-accent/50 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currency</label>
                    <select value={gymSettings.currency} onChange={(e) => setGymSettings({...gymSettings, currency: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-gym-accent/50 text-white appearance-none">
                      <option value="INR">INR (Indian Rupee)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (British Pound)</option>
                    </select>
                  </div>
                </GlassCard>

                {/* Preferences */}
                <GlassCard>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gym-amber/10 border border-gym-amber/20 flex items-center justify-center">
                      <Settings size={20} className="text-gym-amber" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Preferences</h3>
                      <p className="text-[10px] text-slate-400">App behavior and notifications</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Bell size={16} className="text-gym-accent" />
                        <div>
                          <p className="text-xs font-bold text-white">Notifications</p>
                          <p className="text-[9px] text-slate-400">Renewal & expiry alerts</p>
                        </div>
                      </div>
                      <button onClick={() => setGymSettings({...gymSettings, notifications: !gymSettings.notifications})}
                        className={cn("w-10 h-5 rounded-full transition-all relative", gymSettings.notifications ? "bg-gym-accent" : "bg-white/10")}>
                        <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all", gymSettings.notifications ? "left-5.5" : "left-0.5")} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Moon size={16} className="text-gym-secondary" />
                        <div>
                          <p className="text-xs font-bold text-white">Dark Mode</p>
                          <p className="text-[9px] text-slate-400">Dark theme appearance</p>
                        </div>
                      </div>
                      <button onClick={() => setGymSettings({...gymSettings, darkMode: !gymSettings.darkMode})}
                        className={cn("w-10 h-5 rounded-full transition-all relative", gymSettings.darkMode ? "bg-gym-accent" : "bg-white/10")}>
                        <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all", gymSettings.darkMode ? "left-5.5" : "left-0.5")} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={16} className="text-gym-amber" />
                        <div>
                          <p className="text-xs font-bold text-white">Auto Backup</p>
                          <p className="text-[9px] text-slate-400">Daily automatic data backup</p>
                        </div>
                      </div>
                      <button onClick={() => setGymSettings({...gymSettings, autoBackup: !gymSettings.autoBackup})}
                        className={cn("w-10 h-5 rounded-full transition-all relative", gymSettings.autoBackup ? "bg-gym-accent" : "bg-white/10")}>
                        <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all", gymSettings.autoBackup ? "left-5.5" : "left-0.5")} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => alert('Settings saved successfully!')}
                  className="px-8 py-3 bg-gym-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-gym-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Save Settings
                </button>
              </div>
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

        {/* Edit Member Modal */}
        <AnimatePresence>
          {isEditModalOpen && editingMember && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setIsEditModalOpen(false); setEditingMember(null); }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg glass-card p-8 z-10"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-white">Edit Member</h3>
                  <button onClick={() => { setIsEditModalOpen(false); setEditingMember(null); }} className="text-slate-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleEditMember} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input
                      required
                      type="text"
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gym-accent/50 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      required
                      type="email"
                      value={editingMember.email}
                      onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gym-accent/50 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Membership Plan</label>
                      <select
                        value={editingMember.membership_type}
                        onChange={(e) => setEditingMember({...editingMember, membership_type: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gym-accent/50 text-white appearance-none"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                      <select
                        value={editingMember.status}
                        onChange={(e) => setEditingMember({...editingMember, status: e.target.value as Member['status']})}
                        className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gym-accent/50 text-white appearance-none"
                      >
                        <option value="active">Active</option>
                        <option value="expiring">Expiring</option>
                        <option value="due">Due</option>
                        <option value="new">New</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry Date</label>
                    <input
                      required
                      type="date"
                      value={editingMember.expiry_date}
                      onChange={(e) => setEditingMember({...editingMember, expiry_date: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gym-accent/50 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fitness Goal</label>
                    <textarea
                      value={editingMember.goal || ''}
                      onChange={(e) => setEditingMember({...editingMember, goal: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gym-accent/50 text-white h-24 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-gym-accent text-white rounded-xl font-bold shadow-lg shadow-gym-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                  >
                    Save Changes
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && deletingMember && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setIsDeleteModalOpen(false); setDeletingMember(null); }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md glass-card p-8 z-10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gym-rose/10 border border-gym-rose/20 flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={28} className="text-gym-rose" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Delete Member</h3>
                <p className="text-slate-400 mb-8">
                  Are you sure you want to delete <span className="text-white font-semibold">{deletingMember.name}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => { setIsDeleteModalOpen(false); setDeletingMember(null); }}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteMember}
                    className="flex-1 py-3 bg-gym-rose text-white rounded-xl font-bold shadow-lg shadow-gym-rose/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
